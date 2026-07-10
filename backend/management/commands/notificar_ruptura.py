# backend/dashboard/management/commands/notificar_ruptura.py
from __future__ import annotations

import re
from datetime import date, timedelta

from django.core.management.base import BaseCommand
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

CODIGO_RE = re.compile(r"/vincular\s+(\d{6})")

JANELA_DIAS = 3        # verifica ruptura dos últimos N dias (protege contra lançamento atrasado)
MAX_TENTATIVAS = 96    # ~1 dia inteiro rodando a cada 15 min; depois disso, para de tentar reenviar


class Command(BaseCommand):
    help = "Verifica novas rupturas e notifica vendedores vinculados via Telegram. Rode a cada 15 min via cron."

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
                # Mensagem não reconhecida — ignora silenciosamente
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
                "Você vai receber por aqui os alertas de ruptura dos seus clientes.",
            )
            self.stdout.write(f"Vinculado cod_funcionario={link.cod_funcionario} -> chat_id={chat_id}")

        estado.save(update_fields=["last_update_id"])

    # ------------------------------------------------------------------
    # 2) Detecta ruptura nova (grava na tabela de controle) e envia/reenvia
    #    tudo que ainda estiver pendente
    # ------------------------------------------------------------------
    def _processar_rupturas(self):
        hoje = date.today()
        data_inicio = (hoje - timedelta(days=JANELA_DIAS)).isoformat()
        data_fim = hoje.isoformat()

        resultado = buscar_ruptura(data_inicio, data_fim)  # sem filtro = todos os vendedores
        detalhes = resultado.get("detalhes") or []

        novos = 0
        for item in detalhes:
            cod_pocket = item.get("CodPocket")
            cod_doc = item.get("CodDoc")
            sequencia = item.get("Sequencia")
            if cod_pocket is None or cod_doc is None or sequencia is None:
                continue

            _, criado = RupturaNotificada.objects.get_or_create(
                cod_pocket=cod_pocket,
                cod_doc=cod_doc,
                sequencia=sequencia,
                defaults={"cod_vendedor": item.get("CodVendedor")},
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

        pendentes = RupturaNotificada.objects.filter(
            enviado=False, tentativas__lt=MAX_TENTATIVAS
        )

        enviados = 0
        for pend in pendentes:
            chave = (pend.cod_pocket, pend.cod_doc, pend.sequencia)
            item = mapa_detalhe.get(chave)
            if not item:
                # Item saiu da janela de consulta (ex: mudou de status) — deixa pra próxima
                continue

            cod_vend = item.get("CodVendedor")
            try:
                vend_tel = VendedorTelegram.objects.get(cod_funcionario=cod_vend, ativo=True)
            except VendedorTelegram.DoesNotExist:
                # Vendedor ainda não vinculou o Telegram — conta a tentativa e tenta de novo depois
                pend.tentativas += 1
                pend.ultima_tentativa = timezone.now()
                pend.save(update_fields=["tentativas", "ultima_tentativa"])
                continue

            texto = self._montar_mensagem(item)
            ok = enviar_mensagem(vend_tel.chat_id, texto)

            pend.tentativas += 1
            pend.ultima_tentativa = timezone.now()
            if ok:
                pend.enviado = True
                enviados += 1
            pend.save(update_fields=["enviado", "tentativas", "ultima_tentativa"])

        if enviados:
            self.stdout.write(self.style.SUCCESS(f"{enviados} notificação(ões) de ruptura enviada(s)."))

    @staticmethod
    def _montar_mensagem(item: dict) -> str:
        cliente = item.get("Cliente") or item.get("ClienteFantasia") or "Cliente não identificado"
        material = item.get("Material") or f"Cod. {item.get('CodMaterial')}"
        valor = float(item.get("Valor") or 0)
        data_doc = item.get("DataDoc")
        funcionario = (item.get("Funcionario") or "").strip()

        return (
            "🚫 <b>Nova ruptura registrada</b>\n\n"
            f"👤 Cliente: <b>{cliente}</b>\n"
            f"📦 Item: {material}\n"
            f"💰 Valor: {formatar_moeda_brl(valor)}\n"
            f"📅 Data do pedido: {data_doc}\n\n"
            f"Vendedor: {funcionario}"
        )
