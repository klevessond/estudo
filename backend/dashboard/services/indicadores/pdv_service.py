# backend/dashboard/services/indicadores/pdv_service.py
from __future__ import annotations

from datetime import datetime, timedelta, date
from typing import Dict, Any, List
from dashboard.db_conn import query_all  # usa a conexão pyodbc (FreeTDS)

def _as_date(d) -> date:
    if isinstance(d, date):
        return d
    return datetime.strptime(str(d), "%Y-%m-%d").date()

def buscar_vendas_pdv(data_inicio, data_fim) -> Dict[str, Any]:
    """
    Soma vendas de PDV (NFC-e) no intervalo [data_inicio, data_fim], inclusivo no início
    e exclusivo no fim (data_fim + 1 dia às 00:00).
    data_* pode ser 'YYYY-MM-DD' ou date.
    """
    di = _as_date(data_inicio)
    df = _as_date(data_fim) + timedelta(days=1)

    # compara datetime na base: usamos meia-noite do dia
    di_dt = datetime.combine(di, datetime.min.time())
    df_dt = datetime.combine(df, datetime.min.time())

    sql = """
        SELECT
          SUM(VI.quantidade * VI.qtdembalagem) AS Qtd,
          CAST(SUM(dbo.Round2(VI.quantidade * VI.qtdembalagem / M.QtdVolume)) AS INT) AS QtdEmbalagem,
          SUM(dbo.Round2(VI.quantidade * VI.ValorEmbalagem)) AS ValorProdutos,
          SUM(VI.Quantidade * VI.QtdEmbalagem * M.PesoBruto) AS Peso
        FROM ViewVenda V
          LEFT JOIN ViewVendaItens VI ON (
              V.CodPedidoVenda = VI.CodPedidoVenda
              AND V.ECFSerial = VI.ECFSerial
              AND V.CodCupom = VI.CodCupom
          )
          LEFT JOIN Material M ON VI.CodMaterial = M.CodMaterial
          LEFT JOIN NaturezaOperacao N ON V.CodNaturezaOperacao = N.CodNaturezaOperacao
        WHERE
          M.EmbRetornavel = 0
          AND N.Venda = 1
          AND V.Status = 0
          AND V.CodPedidoVenda = 0             -- PDV: não é pedido (NFC-e)
          AND V.UnidGestora IN (1,2,3,4,5,6,8,9,10)
          AND V.DataVenda >= ?
          AND V.DataVenda <  ?
    """

    rows = query_all(sql, [di_dt, df_dt])
    row = rows[0] if rows else {}

    return {
        "valor_pdv": float(row.get("ValorProdutos") or 0),
        "peso_pdv":  float(row.get("Peso") or 0),
    }
