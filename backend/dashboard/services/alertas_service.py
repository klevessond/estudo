# backend/dashboard/services/alertas_service.py
from __future__ import annotations

import logging
from typing import Iterable, Optional

from dashboard.models import AlertaApp
from dashboard.services.telegram_service import formatar_moeda_brl

logger = logging.getLogger(__name__)

TITULOS = {
    AlertaApp.PAPEL_VENDEDOR: "Nova ruptura em cliente seu",
    AlertaApp.PAPEL_SUPERVISOR: "Ruptura na sua equipe",
    AlertaApp.PAPEL_GERENTE: "Nova ruptura registrada",
}


def _to_int(v) -> Optional[int]:
    try:
        return int(str(v).strip())
    except (TypeError, ValueError):
        return None


def _dados_do_item(item: dict) -> dict:
    return {
        "cliente": item.get("Cliente") or item.get("ClienteFantasia") or "Cliente não identificado",
        "material": item.get("Material") or f"Cod. {item.get('CodMaterial')}",
        "valor": float(item.get("Valor") or 0),
        "data_doc": str(item.get("DataDoc") or ""),
        "vendedor": (item.get("Funcionario") or "").strip(),
        "cod_vendedor": _to_int(item.get("CodVendedor")),
        "cod_pocket": _to_int(item.get("CodPocket")),
        "cod_doc": _to_int(item.get("CodDoc")),
    }


def _mensagem(dados: dict) -> str:
    # Texto curto: é o que aparece no banner da notificação
    return f"{dados['cliente']} · {dados['material']} · {formatar_moeda_brl(dados['valor'])}"


def criar_alertas_ruptura(ruptura, item: dict, gerentes_ids: Iterable[int] = ()) -> int:
    """
    Cria um AlertaApp para cada destinatário da ruptura.
    Idempotente: a constraint (ruptura, cod_funcionario) + ignore_conflicts
    impede duplicar se o comando rodar de novo para a mesma ruptura.
    Retorna quantos destinatários foram considerados.
    """
    destinatarios: dict[int, str] = {}

    cod_vend = _to_int(ruptura.cod_vendedor)
    cod_sup = _to_int(ruptura.cod_supervisor)

    if cod_vend:
        destinatarios[cod_vend] = AlertaApp.PAPEL_VENDEDOR
    if cod_sup and cod_sup not in destinatarios:
        destinatarios[cod_sup] = AlertaApp.PAPEL_SUPERVISOR
    for g in gerentes_ids or ():
        cod_g = _to_int(g)
        if cod_g:
            destinatarios.setdefault(cod_g, AlertaApp.PAPEL_GERENTE)

    if not destinatarios:
        return 0

    dados = _dados_do_item(item)
    mensagem = _mensagem(dados)

    alertas = [
        AlertaApp(
            cod_funcionario=cod,
            tipo="ruptura",
            papel=papel,
            titulo=TITULOS[papel],
            mensagem=mensagem,
            dados=dados,
            ruptura=ruptura,
        )
        for cod, papel in destinatarios.items()
    ]

    try:
        AlertaApp.objects.bulk_create(alertas, ignore_conflicts=True)
    except Exception:
        # Falha no app não pode derrubar o envio pelo Telegram
        logger.exception("[alertas_service] erro ao criar alertas da ruptura %s", ruptura.pk)
        return 0

    return len(alertas)
