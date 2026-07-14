# backend/dashboard/services/telegram_service.py
from __future__ import annotations

import logging
from typing import Optional

import requests
from django.conf import settings

logger = logging.getLogger(__name__)

TELEGRAM_API_BASE = "https://api.telegram.org"


def _bot_token() -> str:
    token = getattr(settings, "TELEGRAM_BOT_TOKEN", None)
    if not token:
        raise RuntimeError(
            "TELEGRAM_BOT_TOKEN não configurado. "
            "Defina em settings.py ou na variável de ambiente TELEGRAM_BOT_TOKEN."
        )
    return token


def enviar_mensagem(chat_id: int, texto: str) -> bool:
    """
    Envia uma mensagem de texto (aceita tags HTML simples: <b>, <i>) via Bot API.
    Retorna True se o Telegram confirmou o envio.
    """
    url = f"{TELEGRAM_API_BASE}/bot{_bot_token()}/sendMessage"
    try:
        resp = requests.post(
            url,
            json={"chat_id": chat_id, "text": texto, "parse_mode": "HTML"},
            timeout=10,
        )
        data = resp.json()
        if not data.get("ok"):
            logger.error(f"[telegram_service] sendMessage falhou: {data}")
        return bool(data.get("ok"))
    except Exception:
        logger.exception("[telegram_service] erro ao enviar mensagem")
        return False


def buscar_updates(offset: int = 0, timeout: int = 5) -> list[dict]:
    """
    Faz um long-polling curto no getUpdates do Telegram, retornando as
    mensagens novas desde `offset` (exclusivo). Usado para captar o
    comando '/vincular <codigo>' sem precisar de webhook/HTTPS.
    """
    url = f"{TELEGRAM_API_BASE}/bot{_bot_token()}/getUpdates"
    try:
        resp = requests.get(
            url,
            params={
                "offset": offset,
                "timeout": timeout,
                "allowed_updates": '["message"]',
            },
            timeout=timeout + 5,
        )
        data = resp.json()
        if not data.get("ok"):
            logger.error(f"[telegram_service] getUpdates falhou: {data}")
            return []
        return data.get("result", [])
    except Exception:
        logger.exception("[telegram_service] erro ao buscar updates")
        return []


def formatar_moeda_brl(valor: float) -> str:
    """Formata número no padrão R$ 1.234,56 sem depender de locale do SO."""
    texto = f"{valor:,.2f}"
    texto = texto.replace(",", "X").replace(".", ",").replace("X", ".")
    return f"R$ {texto}"
