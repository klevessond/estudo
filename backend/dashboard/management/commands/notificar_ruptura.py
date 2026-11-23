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
    TelegramPollState,
)
from dashboard.services.telegram_service import (
    enviar_mensagem,
    buscar_updates,
    formatar_moeda_brl,
)
from dashboard.services.indicadores.ruptura_service import buscar_ruptura
from dashboard.services.indicadores.info_service import obter_cod_supervisor
from dashboard.services.alertas_service import criar_alertas_ruptura

# "/vincular 123456" digitado à mão, ou "/start 123456" quando o app abre
# t.me/<bot>?start=123456 e o usuário só toca em "Iniciar".
CODIGO_RE = re.compile(r"/(?:vincular|start)\s+(\d{6})")

JANELA_DIAS = 3        # verifica ruptura dos últimos N dias (protege contra lançamento atrasado)
MAX_TENTATIVAS = 96    # ~1 dia inteiro rodando a cada 15 min; depois disso, para de tentar reenviar


class Command(BaseCommand):
    help = "Verifica novas rupturas e notifica vendedor + supervisor vinculados via Telegram. Rode a cada 15 min via cron."

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
                "Você vai receber por aqui os alertas de ruptura dos seus clientes "
                "(e, se for supervisor, também da sua equipe).",
            )
            self.stdout.write(f"Vinculado cod_funcionario={link.cod_funcionario} -> chat_id={chat_id}")

        estado.save(update_fields=["last_update_id"])

    # ------------------------------------------------------------------
    # 2) Detecta ruptura nova (grava na tabela de controle) e envia/reenvia
    #    tudo que ainda estiver pendente — para o VENDEDOR e para o SUPERVISOR
    # ------------------------------------------------------------------
    def _processar_rupturas(self):
        hoje = date.today()
        data_inicio = (hoje - timedelta(days=JANELA_DIAS)).isoformat()
        data_fim = hoje.isoformat()

        resultado = buscar_ruptura(data_inicio, data_fim)  # sem filtro = todos os vendedores
        detalhes = resultado.get("detalhes") or []

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

            ruptura_obj, criado = RupturaNotificada.objects.get_or_create(
                cod_pocket=cod_pocket,
                cod_doc=cod_doc,
                sequencia=sequencia,
                defaults={"cod_vendedor": cod_vend, "cod_supervisor": cod_sup},
            )
            if criado:
                novos += 1
                # Caixa de entrada do app: grava para vendedor e supervisor,
                # tenham eles Telegram vinculado ou não.
                criar_alertas_ruptura(ruptura_obj, item)

        if novos:
            self.stdout.write(f"{novos} nova(s) ruptura(s) detectada(s).")

        # Mapa rápido (CodPocket, CodDoc, Sequencia) -> linha de detalhe, para montar o texto
        mapa_detalhe = {
            (d.get("CodPocket"), d.get("CodDoc"), d.get("Sequencia")): d
            for d in detalhes
        }

        # Traz só quem ainda precisa de alguma notificação (vendedor OU supervisor pendente)
        pendentes = RupturaNotificada.objects.filter(
            Q(enviado_vendedor=False, tentativas_vendedor__lt=MAX_TENTATIVAS)
            | Q(cod_supervisor__isnull=False, enviado_supervisor=False, tentativas_supervisor__lt=MAX_TENTATIVAS)
        )

        enviados_vend = 0
        enviados_sup = 0

        for pend in pendentes:
            chave = (pend.cod_pocket, pend.cod_doc, pend.sequencia)
            item = mapa_detalhe.get(chave)
            if not item:
                # Item saiu da janela de consulta (ex: mudou de status) — deixa pra próxima
                continue

            algo_mudou = False

            # ---------- Notifica o VENDEDOR ----------
            if not pend.enviado_vendedor and pend.tentativas_vendedor < MAX_TENTATIVAS:
                cod_vend = item.get("CodVendedor")
                vend_tel = VendedorTelegram.objects.filter(cod_funcionario=cod_vend, ativo=True).first()

                if vend_tel:
                    texto = self._montar_mensagem(item, para_supervisor=False)
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
                    texto_sup = self._montar_mensagem(item, para_supervisor=True)
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

        if enviados_vend or enviados_sup:
            self.stdout.write(self.style.SUCCESS(
                f"{enviados_vend} notificação(ões) enviada(s) a vendedores, "
                f"{enviados_sup} a supervisores."
            ))

    @staticmethod
    def _montar_mensagem(item: dict, para_supervisor: bool) -> str:
        cliente = item.get("Cliente") or item.get("ClienteFantasia") or "Cliente não identificado"
        material = item.get("Material") or f"Cod. {item.get('CodMaterial')}"
        valor = float(item.get("Valor") or 0)
        data_doc = item.get("DataDoc")
        funcionario = (item.get("Funcionario") or "").strip()

        cabecalho = (
            "👥 <b>Ruptura na equipe</b>" if para_supervisor else "🚫 <b>Nova ruptura registrada</b>"
        )

        return (
            f"{cabecalho}\n\n"
            f"👤 Cliente: <b>{cliente}</b>\n"
            f"📦 Item: {material}\n"
            f"💰 Valor: {formatar_moeda_brl(valor)}\n"
            f"📅 Data do pedido: {data_doc}\n\n"
            f"Vendedor: {funcionario}"
        )