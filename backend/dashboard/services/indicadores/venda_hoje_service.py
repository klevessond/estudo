# backend/dashboard/services/indicadores/venda_hoje_service.py
from __future__ import annotations

from datetime import date, timedelta
from typing import Iterable, Optional
from zoneinfo import ZoneInfo

from dashboard.db_conn import query_all
from dashboard.services.indicadores.vendas_service import buscar_pre_venda

TZ_BRASIL = ZoneInfo("America/Sao_Paulo")


def _hoje_brasil() -> date:
    """
    Retorna a data de HOJE no fuso de Brasília, independente do fuso
    do servidor (o servidor costuma rodar em UTC).
    """
    from datetime import datetime
    return datetime.now(TZ_BRASIL).date()


def _build_in_filter(col: str, ids: list[int]) -> str:
    if not ids:
        return ""
    if len(ids) == 1:
        return f" AND {col} = {ids[0]} "
    return f" AND {col} IN ({','.join(map(str, ids))}) "


def buscar_venda_hoje(
    cod_vendedores: Optional[Iterable[int]] = None,
) -> dict:
    """
    Retorna o total vendido HOJE (rotas confirmadas + pré-venda efetuada),
    usando a data de Brasília como referência de "hoje".

    Retorno:
    {
        "data": "2026-07-01",
        "total_hoje": float,            # rotas + pré-venda
        "total_rotas_hoje": float,      # só vendas confirmadas (PedidoVenda)
        "total_pre_venda_hoje": float,  # só pré-venda (PocketDocumento)
        "por_vendedor": {
            "178": {"valor": 12500.0, "pre_venda": 300.0, "nome": "FILIAL ALECRIM"},
            ...
        }
    }
    """
    hoje   = _hoje_brasil()
    amanha = hoje + timedelta(days=1)

    p1 = hoje.strftime("%Y-%m-%d")
    p2 = amanha.strftime("%Y-%m-%d")

    vend_list: list[int] = []
    if cod_vendedores:
        vend_list = list(dict.fromkeys(int(v) for v in cod_vendedores if v is not None))

    vend_filter = _build_in_filter("PV.CodVendedor", vend_list)

    # ---------- 1) Vendas de rotas confirmadas (PedidoVenda) ----------
    sql = f"""
        DECLARE @P1 DATE = '{p1}';
        DECLARE @P2 DATE = '{p2}';

        SELECT
            F.CodFuncionario                                   AS CodVendedor,
            F.Funcionario                                      AS NomeVendedor,
            CAST(
                SUM(
                    CASE NOP.Venda
                        WHEN 1 THEN
                            (PVI.Quantidade * PVI.ValorEmbalagem)
                            - dbo.Round2(PVI.DescontoRef + (PVI.Desconto * PVI.Quantidade))
                        ELSE 0
                    END
                )
            AS FLOAT) AS ValorLiquido
        FROM PedidoVenda PV
        INNER JOIN PedidoVendaItens   PVI ON PV.CodPedidoVenda     = PVI.CodPedidoVenda
        INNER JOIN Funcionario        F   ON PV.CodVendedor         = F.CodFuncionario
        INNER JOIN NaturezaOperacao   NOP ON PV.CodNaturezaOperacao = NOP.CodNaturezaOperacao
        INNER JOIN Material           M   ON PVI.CodMaterial        = M.CodMaterial
        WHERE PV.Status       = 0
          AND NOP.Venda       = 1
          AND M.EmbRetornavel = 0
          AND PV.UnidGestora IN (SELECT UnidGestora FROM UnidadeGestora)
          AND PV.DataVenda >= @P1
          AND PV.DataVenda  < @P2
          {vend_filter}
        GROUP BY F.CodFuncionario, F.Funcionario
        ORDER BY ValorLiquido DESC
    """
    rows_rotas = query_all(sql)

    por_vendedor: dict = {}
    total_rotas = 0.0
    for r in rows_rotas:
        cod  = str(r["CodVendedor"])
        val  = float(r["ValorLiquido"] or 0)
        nome = str(r["NomeVendedor"] or "")
        por_vendedor[cod] = {"valor": val, "pre_venda": 0.0, "nome": nome}
        total_rotas += val

    # ---------- 2) Pré-venda efetuada hoje (PocketDocumento) ----------
    # buscar_pre_venda usa intervalo [data_inicio, data_fim) -- exclusivo à direita,
    # então passamos data_fim = amanhã para incluir o dia de hoje inteiro.
    pre_venda_result = buscar_pre_venda(
        data_inicio=p1,
        data_fim=p2,
        cod_vendedores=vend_list or None,
    )
    total_pre_venda = float(pre_venda_result.get("pre_venda_valor") or 0)

    for row in pre_venda_result.get("detalhado") or []:
        cod_vend = row.get("CodVendedor")
        if cod_vend is None:
            continue
        cod = str(int(cod_vend))
        val = float(row.get("Valor") or 0)
        if cod not in por_vendedor:
            por_vendedor[cod] = {
                "valor": 0.0,
                "pre_venda": 0.0,
                "nome": str(row.get("Funcionario") or ""),
            }
        por_vendedor[cod]["pre_venda"] += val

    total = round(total_rotas + total_pre_venda, 2)

    return {
        "data"                : p1,
        "total_hoje"          : total,
        "total_rotas_hoje"    : round(total_rotas, 2),
        "total_pre_venda_hoje": round(total_pre_venda, 2),
        "por_vendedor"        : por_vendedor,
    }
