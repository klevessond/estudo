# backend/dashboard/management/commands/notificar_ruptura.py
from __future__ import annotations

import re
from datetime import date, timedelta

from django.core.management.base import BaseCommand
from django.db.models import Q
from django.utils import timezone

from dashboard.models import (
    TelegramLinkCode,
    VendedorTelegram,
    RupturaNotificada,
    RupturaNotificacaoGerente,
    TelegramPollState,
)
from dashboard.services.telegram_service import (
    enviar_mensagem,
    buscar_updates,
    formatar_moeda_brl,
)
from dashboard.services.indicadores.ruptura_service import buscar_ruptura
from dashboard.services.indicadores.info_service import obter_cod_supervisor
from dashboard.services.indicadores.rotas_simples import buscar_todos_gerentes

CODIGO_RE = re.compile(r"/vincular\s+(\d{6})")

JANELA_DIAS = 3        # verifica ruptura dos últimos N dias (protege contra lançamento atrasado)
MAX_TENTATIVAS = 288    # ~1 dia inteiro rodando a cada 15 min; depois disso, para de tentar reenviar


class Command(BaseCommand):
    help = (
        "Verifica novas rupturas e notifica vendedor + supervisor + todos os gerentes "
        "vinculados via Telegram. Rode a cada 15 min via cron."
    )

    def handle(self, *args, **options):
        self._processar_vinculacoes()
        self._processar_rupturas()

    # ------------------------------------------------------------------
    # 1) Lê mensagens novas do bot e processa o comando /vincular <codigo>
    # ------------------------------------------------------------------
    def _processar_vinculacoes(self):
        estado, _ = TelegramPollState.objects.get_or_create(id=1)
        updates = buscar_updates(offset=estado.last_update_id + 1)

        for upd in updates:
            estado.last_update_id = upd["update_id"]

            msg = upd.get("message") or {}
            texto = (msg.get("text") or "").strip()
            chat = msg.get("chat") or {}
            chat_id = chat.get("id")
            username = chat.get("username")

            if not texto or not chat_id:
                continue

            m = CODIGO_RE.search(texto)
            if not m:
                continue

            codigo = m.group(1)
            try:
                link = TelegramLinkCode.objects.get(codigo=codigo, usado=False)
            except TelegramLinkCode.DoesNotExist:
                enviar_mensagem(chat_id, "❌ Código inválido ou já utilizado. Gere um novo código no sistema.")
                continue

            if link.expirado():
                enviar_mensagem(chat_id, "⏰ Código expirado. Gere um novo código no sistema.")
                continue

            VendedorTelegram.objects.update_or_create(
                cod_funcionario=link.cod_funcionario,
                defaults={"chat_id": chat_id, "telegram_username": username, "ativo": True},
            )
            link.usado = True
            link.save(update_fields=["usado"])

            enviar_mensagem(
                chat_id,
                "✅ <b>Telegram vinculado com sucesso!</b>\n"
                "Você vai receber por aqui os alertas de ruptura pertinentes ao seu perfil.",
            )
            self.stdout.write(f"Vinculado cod_funcionario={link.cod_funcionario} -> chat_id={chat_id}")

        estado.save(update_fields=["last_update_id"])

    # ------------------------------------------------------------------
    # 2) Detecta ruptura nova e envia/reenvia tudo que ainda estiver
    #    pendente — para o VENDEDOR, o SUPERVISOR e TODOS os GERENTES
    # ------------------------------------------------------------------
    def _processar_rupturas(self):
        hoje = date.today()
        data_inicio = (hoje - timedelta(days=JANELA_DIAS)).isoformat()
        data_fim = hoje.isoformat()

        resultado = buscar_ruptura(data_inicio, data_fim)  # sem filtro = todos os vendedores
        detalhes = resultado.get("detalhes") or []

        # ---- Descobre os gerentes ativos e quem deles já tem Telegram vinculado ----
        # (feito uma única vez por execução — não muda item a item)
        gerentes_ids = buscar_todos_gerentes()
        gerentes_tel_map = {
            vt.cod_funcionario: vt.chat_id
            for vt in VendedorTelegram.objects.filter(cod_funcionario__in=gerentes_ids, ativo=True)
        } if gerentes_ids else {}

        # cache local: cod_vendedor -> cod_supervisor (evita repetir a mesma query pro banco)
        cache_supervisor: dict[int, int | None] = {}

        def cod_supervisor_de(cod_vend: int | None) -> int | None:
            if not cod_vend:
                return None
            if cod_vend not in cache_supervisor:
                cache_supervisor[cod_vend] = obter_cod_supervisor(cod_vend)
            return cache_supervisor[cod_vend]

        novos = 0
        for item in detalhes:
            cod_pocket = item.get("CodPocket")
            cod_doc = item.get("CodDoc")
            sequencia = item.get("Sequencia")
            if cod_pocket is None or cod_doc is None or sequencia is None:
                continue

            cod_vend = item.get("CodVendedor")
            cod_sup = cod_supervisor_de(cod_vend)

            _, criado = RupturaNotificada.objects.get_or_create(
                cod_pocket=cod_pocket,
                cod_doc=cod_doc,
                sequencia=sequencia,
                defaults={"cod_vendedor": cod_vend, "cod_supervisor": cod_sup},
            )
            if criado:
                novos += 1

        if novos:
            self.stdout.write(f"{novos} nova(s) ruptura(s) detectada(s).")

        # Mapa rápido (CodPocket, CodDoc, Sequencia) -> linha de detalhe, para montar o texto
        mapa_detalhe = {
            (d.get("CodPocket"), d.get("CodDoc"), d.get("Sequencia")): d
            for d in detalhes
        }

        # Traz quem ainda precisa de alguma notificação (vendedor OU supervisor pendente)
        pendentes = RupturaNotificada.objects.filter(
            Q(enviado_vendedor=False, tentativas_vendedor__lt=MAX_TENTATIVAS)
            | Q(cod_supervisor__isnull=False, enviado_supervisor=False, tentativas_supervisor__lt=MAX_TENTATIVAS)
        )

        enviados_vend = 0
        enviados_sup = 0
        enviados_ger = 0

        for pend in pendentes:
            chave = (pend.cod_pocket, pend.cod_doc, pend.sequencia)
            item = mapa_detalhe.get(chave)
            if not item:
                continue

            algo_mudou = False

            # ---------- Notifica o VENDEDOR ----------
            if not pend.enviado_vendedor and pend.tentativas_vendedor < MAX_TENTATIVAS:
                cod_vend = item.get("CodVendedor")
                vend_tel = VendedorTelegram.objects.filter(cod_funcionario=cod_vend, ativo=True).first()

                if vend_tel:
                    texto = self._montar_mensagem(item, papel="vendedor")
                    ok = enviar_mensagem(vend_tel.chat_id, texto)
                    pend.tentativas_vendedor += 1
                    if ok:
                        pend.enviado_vendedor = True
                        enviados_vend += 1
                    algo_mudou = True
                else:
                    pend.tentativas_vendedor += 1
                    algo_mudou = True

            # ---------- Notifica o SUPERVISOR ----------
            if pend.cod_supervisor and not pend.enviado_supervisor and pend.tentativas_supervisor < MAX_TENTATIVAS:
                sup_tel = VendedorTelegram.objects.filter(cod_funcionario=pend.cod_supervisor, ativo=True).first()

                if sup_tel:
                    texto_sup = self._montar_mensagem(item, papel="supervisor")
                    ok_sup = enviar_mensagem(sup_tel.chat_id, texto_sup)
                    pend.tentativas_supervisor += 1
                    if ok_sup:
                        pend.enviado_supervisor = True
                        enviados_sup += 1
                    algo_mudou = True
                else:
                    pend.tentativas_supervisor += 1
                    algo_mudou = True

            if algo_mudou:
                pend.ultima_tentativa = timezone.now()
                pend.save(update_fields=[
                    "enviado_vendedor", "enviado_supervisor",
                    "tentativas_vendedor", "tentativas_supervisor",
                    "ultima_tentativa",
                ])

            # ---------- Notifica TODOS os GERENTES ----------
            for cod_ger in gerentes_ids:
                # Se esse gerente É o supervisor direto do vendedor, ele já recebeu a
                # versão de supervisor acima — evita duplicar a mesma mensagem 2x.
                if cod_ger == pend.cod_supervisor:
                    continue

                notif_ger, _ = RupturaNotificacaoGerente.objects.get_or_create(
                    ruptura=pend, cod_gerente=cod_ger,
                )
                if notif_ger.enviado or notif_ger.tentativas >= MAX_TENTATIVAS:
                    continue

                chat_id_ger = gerentes_tel_map.get(cod_ger)
                if chat_id_ger:
                    texto_ger = self._montar_mensagem(item, papel="gerente")
                    ok_ger = enviar_mensagem(chat_id_ger, texto_ger)
                    notif_ger.tentativas += 1
                    if ok_ger:
                        notif_ger.enviado = True
                        enviados_ger += 1
                else:
                    notif_ger.tentativas += 1

                notif_ger.ultima_tentativa = timezone.now()
                notif_ger.save(update_fields=["enviado", "tentativas", "ultima_tentativa"])

        if enviados_vend or enviados_sup or enviados_ger:
            self.stdout.write(self.style.SUCCESS(
                f"{enviados_vend} notificação(ões) a vendedores, "
                f"{enviados_sup} a supervisores, "
                f"{enviados_ger} a gerentes."
            ))

    @staticmethod
    def _montar_mensagem(item: dict, papel: str) -> str:
        cliente = item.get("Cliente") or item.get("ClienteFantasia") or "Cliente não identificado"
        material = item.get("Material") or f"Cod. {item.get('CodMaterial')}"
        valor = float(item.get("Valor") or 0)
        data_doc = item.get("DataDoc")
        funcionario = (item.get("Funcionario") or "").strip()

        cabecalhos = {
            "vendedor": "🚫 <b>Nova ruptura registrada</b>",
            "supervisor": "👥 <b>Ruptura na equipe</b>",
            "gerente": "🏢 <b>Ruptura (visão gerencial)</b>",
        }
        cabecalho = cabecalhos.get(papel, cabecalhos["vendedor"])

        return (
            f"{cabecalho}\n\n"
            f"👤 Cliente: <b>{cliente}</b>\n"
            f"📦 Item: {material}\n"
            f"💰 Valor: {formatar_moeda_brl(valor)}\n"
            f"📅 Data do pedido: {data_doc}\n\n"
            f"Vendedor: {funcionario}"
        )
