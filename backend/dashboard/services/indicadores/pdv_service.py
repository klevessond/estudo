# backend/dashboard/services/indicadores/pdv_service.py
from __future__ import annotations

from datetime import datetime, timedelta, date
from typing import Dict, Any, List, Optional, Tuple

from dashboard.db_conn import query_all  # usa a conexão pyodbc (FreeTDS)


# =========================
# Helpers de datas/formatos
# =========================
def _as_date(d) -> date:
    if isinstance(d, date):
        return d
    return datetime.strptime(str(d), "%Y-%m-%d").date()


def _intervalo_exclusivo(di: date, df: date) -> Tuple[datetime, datetime]:
    """
    Converte datas (YYYY-MM-DD) em timestamps com fim EXCLUSIVO (df + 1 dia 00:00).
    """
    df_excl = df + timedelta(days=1)
    di_dt = datetime.combine(di, datetime.min.time())
    df_dt = datetime.combine(df_excl, datetime.min.time())
    return di_dt, df_dt


def _intervalo_ano_anterior(di: date, df: date) -> Tuple[date, date]:
    """
    Gera (di_aa, df_aa) para o mesmo intervalo no ano anterior.
    Se 29/02 cair em ano não bissexto, ajusta para 28/02.
    """
    def _sub_ano(d: date) -> date:
        try:
            return d.replace(year=d.year - 1)
        except ValueError:
            # 29/02 -> 28/02 em ano não bissexto
            return d.replace(year=d.year - 1, day=28)
    return _sub_ano(di), _sub_ano(df)


# ============================================================
# CONSULTAS PRINCIPAIS (mantidas como já estavam no seu código)
# ============================================================
def buscar_pdv_por_unid_gestora(
    data_inicio,
    data_fim,
    unid_gestoras: Optional[List[str]] = None
) -> List[Dict[str, Any]]:
    """
    Retorna lista agregada por UnidGestora no intervalo [data_inicio, data_fim).
    Cada item: { UnidGestora, Qtd, QtdEmbalagem, ValorProdutos, Peso }
    """
    di = _as_date(data_inicio)
    df = _as_date(data_fim)

    di_dt, df_dt = _intervalo_exclusivo(di, df)

    filtro_ugs = ""
    params: List[Any] = [di_dt, df_dt]

    if unid_gestoras:
        ugs = [str(u).strip() for u in unid_gestoras if str(u).strip()]
        if ugs:
            placeholders = ",".join("?" for _ in ugs)
            filtro_ugs = f" AND V.UnidGestora IN ({placeholders}) "
            params.extend(ugs)

    sql = f"""
            SELECT
                V.UnidGestora,
                SUM(VI.quantidade * VI.qtdembalagem)                                       AS Qtd,
                CAST(SUM(dbo.Round2(VI.quantidade * VI.qtdembalagem / M.QtdVolume)) AS INT) AS QtdEmbalagem,
                SUM(dbo.Round2(VI.quantidade * VI.ValorEmbalagem))                         AS ValorProdutos,
                SUM(VI.Quantidade * VI.QtdEmbalagem * M.PesoBruto)                         AS Peso,
                F1.CodFuncionario,
                F1.Nome
            FROM ViewVenda V
            LEFT JOIN ViewVendaItens VI
            ON  V.CodPedidoVenda = VI.CodPedidoVenda
            AND V.ECFSerial      = VI.ECFSerial
            AND V.CodCupom       = VI.CodCupom
            LEFT JOIN Material M
            ON VI.CodMaterial = M.CodMaterial
            LEFT JOIN NaturezaOperacao N
            ON V.CodNaturezaOperacao = N.CodNaturezaOperacao
            OUTER APPLY (
                SELECT TOP 1 F.CodFuncionario, F.Nome
                FROM Funcionario F
                WHERE F.UnidGestora = V.UnidGestora and F.Vendedor=1
                ORDER BY F.CodFuncionario -- sua regra de desempate
            ) F1
            WHERE
                M.EmbRetornavel = 0
                AND N.Venda = 1
                AND V.Status = 0
                AND V.CodPedidoVenda = 0
                AND V.UnidGestora IN (SELECT UnidGestora FROM UnidadeGestora)
                AND V.DataVenda >= ?
                AND V.DataVenda  < ?
                {filtro_ugs}
            GROUP BY
                V.UnidGestora, F1.CodFuncionario, F1.Nome
            ORDER BY
                V.UnidGestora;

    """
    rows = query_all(sql, params)
    # normalização
    for r in rows:
        r["Qtd"] = int(r.get("Qtd") or 0)
        r["QtdEmbalagem"] = int(r.get("QtdEmbalagem") or 0)
        r["ValorProdutos"] = float(r.get("ValorProdutos") or 0)
        r["Peso"] = float(r.get("Peso") or 0)
    return rows


def buscar_vendas_pdv(data_inicio, data_fim) -> Dict[str, Any]:
    """
    Soma vendas de PDV (NFC-e) e devolve também o detalhado por UnidGestora.
    """
    detalhado = buscar_pdv_por_unid_gestora(data_inicio, data_fim, unid_gestoras=None)
    valor = sum(float(r.get("ValorProdutos") or 0) for r in detalhado)
    peso  = sum(float(r.get("Peso") or 0) for r in detalhado)

    return {
        "valor_pdv": round(valor, 2),
        "peso_pdv":  round(peso, 3),
        "detalhado": detalhado,
    }


# ============================================================
# NOVOS AUXILIARES (opcionais) — não quebram compatibilidade
# ============================================================
def buscar_pdv_por_unid_gestora_ano_anterior(
    data_inicio,
    data_fim,
    unid_gestoras: Optional[List[str]] = None
) -> List[Dict[str, Any]]:
    """
    Mesmo resultado de buscar_pdv_por_unid_gestora, porém para o intervalo
    equivalente no ano anterior.
    """
    di = _as_date(data_inicio)
    df = _as_date(data_fim)
    di_aa, df_aa = _intervalo_ano_anterior(di, df)
    return buscar_pdv_por_unid_gestora(di_aa, df_aa, unid_gestoras=unid_gestoras)


def somar_linhas_pdv(rows: List[Dict[str, Any]]) -> Dict[str, float]:
    """
    Soma ValorProdutos e Peso de uma lista de linhas do PDV.
    """
    valor = sum(float(r.get("ValorProdutos") or 0) for r in (rows or []))
    peso  = sum(float(r.get("Peso") or 0) for r in (rows or []))
    return {"valor": round(valor, 2), "peso": round(peso, 3)}


def buscar_pdv_comparativo(
    data_inicio,
    data_fim,
    unid_gestoras: Optional[List[str]] = None
) -> Dict[str, Any]:
    """
    Pacote pronto para telas que precisam do atual + ano anterior de uma vez.

    Retorna:
    {
      "atual": {
        "detalhado": [...],
        "valor": 123.45,
        "peso":  67.890
      },
      "ano_anterior": {
        "detalhado": [...],
        "valor": 111.11,
        "peso":  55.555
      }
    }
    """
    atual = buscar_pdv_por_unid_gestora(data_inicio, data_fim, unid_gestoras)
    aa    = buscar_pdv_por_unid_gestora_ano_anterior(data_inicio, data_fim, unid_gestoras)

    s_atual = somar_linhas_pdv(atual)
    s_aa    = somar_linhas_pdv(aa)

    return {
        "atual": {
            "detalhado": atual,
            "valor": s_atual["valor"],
            "peso":  s_atual["peso"],
        },
        "ano_anterior": {
            "detalhado": aa,
            "valor": s_aa["valor"],
            "peso":  s_aa["peso"],
        },
    }
