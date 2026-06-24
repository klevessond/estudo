# backend/dashboard/services/indicadores/venda_hoje_service.py
from __future__ import annotations

from datetime import date, timedelta
from typing import Iterable, Optional

from dashboard.db_conn import query_all


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
    Retorna o total vendido no dia atual por vendedor.

    Retorno:
    {
        "data": "2026-06-24",
        "total_hoje": float,
        "por_vendedor": {
            "178": {"valor": 12500.0, "nome": "FILIAL ALECRIM"},
            ...
        }
    }
    """
    hoje  = date.today()
    amanha = hoje + timedelta(days=1)

    p1 = hoje.strftime("%Y-%m-%d")
    p2 = amanha.strftime("%Y-%m-%d")

    vend_list: list[int] = []
    if cod_vendedores:
        vend_list = list(dict.fromkeys(int(v) for v in cod_vendedores if v is not None))

    vend_filter = _build_in_filter("PV.CodVendedor", vend_list)

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

    rows = query_all(sql)

    por_vendedor: dict = {}
    total = 0.0
    for r in rows:
        cod  = str(r["CodVendedor"])
        val  = float(r["ValorLiquido"] or 0)
        nome = str(r["NomeVendedor"] or "")
        por_vendedor[cod] = {"valor": val, "nome": nome}
        total += val

    return {
        "data"        : p1,
        "total_hoje"  : round(total, 2),
        "por_vendedor": por_vendedor,
    }
