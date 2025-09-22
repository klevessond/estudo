# backend/dashboard/services/indicadores/objetivos_service.py
from __future__ import annotations
from typing import Iterable, Optional, Dict, Any, List
from dashboard.db_conn import query_all

def _to_int_list(seq: Optional[Iterable]) -> list[int]:
    seen, out = set(), []
    for v in (seq or []):
        try:
            x = int(str(v).strip())
            if x not in seen:
                seen.add(x); out.append(x)
        except (TypeError, ValueError):
            pass
    return out

def buscar_objetivo_peso_positivacao(
    data_inicio: str,
    data_fim: str,
    cod_vendedores: Optional[Iterable[int]] = None,
) -> Dict[str, Any]:
    vend_list = _to_int_list(cod_vendedores)

    vend_filter_oc = ""   # em PositivacaoAgrupada (CodFuncionario)
    vend_filter_f  = ""   # em ObjetivoTotalEmpresa (F.CodFuncionario)
    vend_params: List[Any] = []

    if len(vend_list) >= 2:
        ph = ",".join(["?"] * len(vend_list))
        vend_filter_oc = f" AND CodFuncionario IN ({ph}) "
        vend_filter_f  = f" AND F.CodFuncionario IN ({ph}) "
        vend_params = vend_list[:]  # será usado duas vezes
    elif len(vend_list) == 1:
        vend_filter_oc = " AND CodFuncionario = ? "
        vend_filter_f  = " AND F.CodFuncionario = ? "
        vend_params = [vend_list[0]]

    sql = f"""
        WITH ObjetivosFiltrados AS (
            SELECT *
            FROM ObjetivoFinanceiro
            WHERE DataDe >= ? AND DataAte <= ?
        ),
        Vendedores AS (
            SELECT 
                F.CodFuncionario,
                F.Funcionario,
                AV.CodAreaVenda,
                AV.AreaVenda
            FROM Funcionario F
            INNER JOIN AreaVenda AV ON F.CodFuncionario = AV.CodVendedor
            WHERE F.Vendedor = 1
        ),
        ObjetivosCompletos AS (
            SELECT 
                V.CodFuncionario,
                V.Funcionario,
                V.CodAreaVenda,
                V.AreaVenda,
                R.CodRota,
                R.Rota,
                O.DataDe,
                O.DataAte,
                O.Valor AS ObjetivoRota,
                O.Positivacao AS PositivacaoRota,
                SUM(O.Valor) OVER(PARTITION BY V.CodFuncionario)      AS ObjetivoTotalVendedor,
                SUM(O.Positivacao) OVER(PARTITION BY V.CodFuncionario) AS PositivacaoTotalVendedor
            FROM Vendedores V
            INNER JOIN Rota R ON R.CodAreaVenda = V.CodAreaVenda
            INNER JOIN ObjetivosFiltrados O ON O.CodRota = R.CodRota
        ),
        PositivacaoAgrupada AS (
            SELECT 
                CodFuncionario,
                CodRota,
                SUM(PositivacaoRota) AS PositivacaoRota
            FROM ObjetivosCompletos 
            WHERE 1 = 1
            {vend_filter_oc}
            GROUP BY CodFuncionario, CodRota
        ),
        ObjetivoTotalEmpresa AS (
            SELECT 
                SUM(O.Valor)       AS ObjetivoTotalEmpresaPeriodo,
                SUM(O.Positivacao) AS PositivacaoTotalEmpresaPeriodo
            FROM ObjetivoFinanceiro O
            INNER JOIN Rota R        ON O.CodRota = R.CodRota
            INNER JOIN AreaVenda AV  ON R.CodAreaVenda = AV.CodAreaVenda
            INNER JOIN Funcionario F ON F.CodFuncionario = AV.CodVendedor
            WHERE F.Vendedor = 1
              AND O.DataDe >= ? AND O.DataAte <= ?
            {vend_filter_f}
        )
        SELECT 
            OC.CodFuncionario,
            OC.Funcionario,
            OC.CodAreaVenda,
            OC.AreaVenda,
            OC.CodRota,
            OC.Rota,
            OC.DataDe,
            OC.DataAte,
            OC.ObjetivoRota,
            PA.PositivacaoRota,
            OC.ObjetivoTotalVendedor,
            OC.PositivacaoTotalVendedor,
            OTE.ObjetivoTotalEmpresaPeriodo,
            OTE.PositivacaoTotalEmpresaPeriodo
        FROM ObjetivosCompletos OC
        INNER JOIN PositivacaoAgrupada PA 
            ON OC.CodFuncionario = PA.CodFuncionario 
           AND OC.CodRota = PA.CodRota
        CROSS JOIN ObjetivoTotalEmpresa OTE
        ORDER BY OC.Funcionario, OC.Rota;
    """

    # ORDEM DOS PARÂMETROS precisa bater com os '?':
    sql_params: List[Any] = []
    sql_params += [data_inicio, data_fim]      # 1) datas ObjetivosFiltrados
    sql_params += vend_params                  # 2) vendedores PositivacaoAgrupada
    sql_params += [data_inicio, data_fim]      # 3) datas ObjetivoTotalEmpresa (FALTAVAM)
    sql_params += vend_params                  # 4) vendedores ObjetivoTotalEmpresa

    dados = query_all(sql, sql_params)

    objetivo_peso = float(dados[0]["ObjetivoTotalEmpresaPeriodo"]) if dados else 0.0
    objetivo_positivacao = float(dados[0]["PositivacaoTotalEmpresaPeriodo"]) if dados else 0.0

    return {
        "objetivo_peso": objetivo_peso,
        "objetivo_positivacao": objetivo_positivacao,
        "detalhamento": dados,
    }
