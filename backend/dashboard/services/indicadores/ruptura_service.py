# backend/dashboard/services/indicadores/ruptura_service.py
from __future__ import annotations

from datetime import datetime, timedelta, date
from collections import defaultdict
from typing import Iterable, Optional, Dict, Any, List

from dashboard.db_conn import query_all  # usa a conexão pyodbc (FreeTDS)

def _validar_data(data):
    if isinstance(data, date):
        return data
    return datetime.strptime(data, "%Y-%m-%d").date()

def _to_int_list(seq: Optional[Iterable]) -> list[int]:
    vals: list[int] = []
    for v in (seq or []):
        try:
            vals.append(int(str(v).strip()))
        except (TypeError, ValueError):
            pass
    return vals

def buscar_ruptura(
    data_inicio: str,
    data_fim: str,
    cod_vendedor: int | None = None,
    cod_vendedores: Optional[Iterable[int]] = None,
) -> Dict[str, Any]:
    """
    Executa a consulta de 'ruptura' (itens não atendidos) para o período informado.
    - data_inicio / data_fim: 'YYYY-MM-DD'
    - cod_vendedor: opcional. Quando presente, aplica filtro por vendedor.
    - cod_vendedores: opcional. Se houver 2+ valores, aplica IN (...).
    Retorna:
      {
        "detalhes": [ { ...linha... }, ... ],
        "resumo":   [ {"CodVendedor": <int>, "TotalValor": <float>}, ... ]
      }
    """
    di = _validar_data(data_inicio)
    df = _validar_data(data_fim) + timedelta(days=1)  # intervalo [di, df)

    # Monta filtro de vendedores de forma segura (parametrizada)
    vend_filter_sql = ""
    params: List[Any] = [di, df]  # sempre datas primeiro

    vend_list = _to_int_list(cod_vendedores)
    if vend_list and len(vend_list) >= 2:
        # IN (?, ?, ...) com número de placeholders conforme a lista
        placeholders = ",".join(["?"] * len(vend_list))
        vend_filter_sql = f" AND PD.CodVendedor IN ({placeholders}) "
        params.extend(vend_list)
    elif cod_vendedor is not None and str(cod_vendedor).strip() != "":
        vend_filter_sql = " AND PD.CodVendedor = ? "
        params.append(int(cod_vendedor))

    sql = f"""
        SELECT
          CAST(0 AS bit) AS Checked,
          PD.DataDoc,
          TipoDocumento.CodNaturezaOperacao,
          N.Titulo AS Operacao,
          C.CodCliente, C.Cliente, C.ClienteFantasia,
          M.CodMaterial, M.Material, E.Embalagem,
          PDI.Qtd1 AS Quantidade,
          PDI.Qtd1 * PDI.ValorEmbalagem1 AS Valor,
          PDI.Qtd1 * PDI.Desconto1 AS Desconto,
          PD.CodtabelaPreco, TabelaPreco.Descricao,
          PDI.Reemitido, PD.CodPocket, PD.UnidGestora, PD.CodTipoDoc,
          PD.CodFormaReceb, PD.CodMapaEvento, PDI.CodTipo AS CodTipoItem,
          PD.CodVendedor, PD.CodVisita, PD.NotaFiscal, PD.Observacao, PD.ObservacaoNFe,
          PD.PDV, PD.CodDoc, PDI.Sequencia, Funcionario.Funcionario,
          PDI.Desconto1, PDI.ValorEmbalagem1, PDI.CodEmbalagem1,
          PDI.CodTabelaPreco AS CodTabelaPrecoItem,
          UnidadeGestora.Unidade AS UnidadeGestora,
          FormaReceb.FormaReceb
        FROM
          Pocket P,
          PocketDocumento PD,
          Cliente C,
          PocketDocumentoItens PDI,
          Material M,
          Grupo G,
          Embalagem E,
          TipoDocumento,
          NaturezaOperacao N,
          TabelaPreco,
          UnidadeGestora,
          FormaReceb,
          Funcionario
        WHERE
          P.CodPocket = PD.CodPocket
          AND PD.CodPocket = PDI.CodPocket
          AND PD.CodDoc = PDI.CodDoc
          AND PD.CodCliente = C.CodCliente
          AND PDI.CodMaterial1 = M.CodMaterial
          AND M.CodGrupo = G.CodGrupo
          AND PDI.CodEmbalagem1 = E.CodEmbalagem
          AND PD.CodTipoDoc = TipoDocumento.CodTipoDoc
          AND TipoDocumento.CodNaturezaOperacao = N.CodNaturezaOperacao
          AND PD.CodTabelaPreco = TabelaPreco.CodTabelaPreco
          AND PDI.Status IN (20) -- Item não atendido
          AND UnidadeGestora.UnidGestora = PD.UnidGestora
          AND FormaReceb.CodFormaReceb = PD.CodFormaReceb
          AND PD.CodVendedor = Funcionario.CodFuncionario
          AND PD.DataDoc >= ?
          AND PD.DataDoc <  ?
          {vend_filter_sql}
          AND PD.UnidGestora IN (
            SELECT UnidGestora FROM UserUsuarioUnidade WHERE ID = 'ESIGMA'
          )
        ORDER BY PD.DataDoc, C.CodCliente, C.Cliente
    """

    detalhes = query_all(sql, params)

    # Agrega por vendedor
    resumo_dict: Dict[int, float] = defaultdict(float)
    for row in detalhes:
        cod_vend = row.get("CodVendedor")
        if cod_vend is None:
            continue
        try:
            valor = float(row.get("Valor") or 0)
            resumo_dict[int(cod_vend)] += valor
        except (TypeError, ValueError):
            pass

    resumo = [{"CodVendedor": k, "TotalValor": v} for k, v in resumo_dict.items()]
    return {"detalhes": detalhes, "resumo": resumo}


def buscar_ruptura_itens_detalhado(
    data_inicio: str,
    data_fim: str,
    cod_vendedores: Optional[Iterable[int]] = None,
    criterio: str = "valor",  # "valor" | "qtd"
) -> Dict[str, Any]:
    """
    Detalha a ruptura por ITEM (Material), para o modal "Detalhar" do card Captado —
    mesmo padrão dos modais de Mix e Positivação.

    Filtro de vendedor: idêntico ao de buscar_ruptura (IN (...) parametrizado
    quando 2+ vendedores, '=' quando 1 único, sem filtro quando None/vazio).

    Retorno:
    {
        "itens": [
            {
                "CodMaterial": int,
                "Material": str,
                "Grupo": str,
                "QtdItens": float,      # soma de Quantidade não atendida
                "ValorTotal": float,    # soma do Valor não atendido
                "PercQtd": float,       # % sobre o total de qtd em ruptura
                "PercValor": float,     # % sobre o total de valor em ruptura
            }, ...
        ],  # ordenado conforme `criterio`
        "total_valor": float,
        "total_qtd": float,
        "qtd_itens_distintos": int,
    }
    """
    di = _validar_data(data_inicio)
    df = _validar_data(data_fim) + timedelta(days=1)  # intervalo [di, df)

    vend_filter_sql = ""
    params: List[Any] = [di, df]

    vend_list = _to_int_list(cod_vendedores)
    if vend_list and len(vend_list) >= 2:
        placeholders = ",".join(["?"] * len(vend_list))
        vend_filter_sql = f" AND PD.CodVendedor IN ({placeholders}) "
        params.extend(vend_list)
    elif vend_list and len(vend_list) == 1:
        vend_filter_sql = " AND PD.CodVendedor = ? "
        params.append(vend_list[0])

    sql = f"""
        SELECT
          M.CodMaterial,
          M.Material,
          G.Grupo,
          SUM(PDI.Qtd1)                       AS QtdItens,
          SUM(PDI.Qtd1 * PDI.ValorEmbalagem1) AS ValorTotal
        FROM
          Pocket P,
          PocketDocumento PD,
          PocketDocumentoItens PDI,
          Material M,
          Grupo G,
          TipoDocumento,
          NaturezaOperacao N
        WHERE
          P.CodPocket = PD.CodPocket
          AND PD.CodPocket = PDI.CodPocket
          AND PD.CodDoc = PDI.CodDoc
          AND PDI.CodMaterial1 = M.CodMaterial
          AND M.CodGrupo = G.CodGrupo
          AND PD.CodTipoDoc = TipoDocumento.CodTipoDoc
          AND TipoDocumento.CodNaturezaOperacao = N.CodNaturezaOperacao
          AND PDI.Status IN (20) -- Item não atendido
          AND PD.DataDoc >= ?
          AND PD.DataDoc <  ?
          {vend_filter_sql}
          AND PD.UnidGestora IN (
            SELECT UnidGestora FROM UserUsuarioUnidade WHERE ID = 'ESIGMA'
          )
        GROUP BY M.CodMaterial, M.Material, G.Grupo
        ORDER BY {"ValorTotal" if criterio == "valor" else "QtdItens"} DESC
    """

    rows = query_all(sql, params)

    total_valor = sum(float(r.get("ValorTotal") or 0) for r in rows)
    total_qtd   = sum(float(r.get("QtdItens") or 0) for r in rows)

    itens = []
    for r in rows:
        valor = round(float(r.get("ValorTotal") or 0), 2)
        qtd   = round(float(r.get("QtdItens") or 0), 2)
        itens.append({
            "CodMaterial": int(r.get("CodMaterial") or 0),
            "Material":    (r.get("Material") or "").strip(),
            "Grupo":       (r.get("Grupo") or "").strip(),
            "QtdItens":    qtd,
            "ValorTotal":  valor,
            "PercQtd":     round((qtd   / total_qtd)   * 100, 1) if total_qtd   else 0.0,
            "PercValor":   round((valor / total_valor) * 100, 1) if total_valor else 0.0,
        })

    return {
        "itens": itens,
        "total_valor": round(total_valor, 2),
        "total_qtd": round(total_qtd, 2),
        "qtd_itens_distintos": len(itens),
    }
