# backend/dashboard/services/indicadores/campanhas_service.py
from __future__ import annotations

from datetime import date, timedelta
from typing import Iterable, Optional, List, Dict, Any

from dashboard.db_conn import query_all


def _clamp_limit(limit: int) -> int:
    return max(1, min(int(limit or 20), 50))


# ─── Realizado da campanha ───────────────────────────────────────────

def buscar_realizado_campanha(
    tipo: str,
    cod_fabricante: int,
    referencias: Iterable[int],
    data_inicio: date,
    data_fim: date,
    cod_vendedores: Optional[Iterable[int]] = None,
) -> List[Dict[str, Any]]:
    """
    Realizado por vendedor dentro do escopo da campanha, nas 3 medidas:
      - Peso        = Quantidade * QtdEmbalagem * PesoBruto (kg)
      - Financeiro  = soma de Round2(Quantidade * ValorEmbalagem) (R$, bruto,
                      mesma conta da coluna ValorProdutos dos relatórios do ERP)
      - Quantidade  = Quantidade * QtdEmbalagem (unidades)

    Escopo:
      - tipo 'MATERIAL': Material.CodMaterial IN (referencias)
      - tipo 'GRUPO':    Material.CodGrupo    IN (referencias)
      sempre restrito a Material.CodFabricante = cod_fabricante.

    Mesmas condições dos relatórios "vendas por produto/fabricante x vendedor":
    PedidoVenda.Status = 0, NaturezaOperacao.Venda = 1, embalagem não retornável
    e unidade gestora do usuário ESIGMA (mesmo filtro usado em vendas_service).

    Retorno: [{"CodVendedor", "Peso", "Financeiro", "Quantidade"}, ...]
    """
    refs = [int(r) for r in referencias if r is not None]
    if not refs or not cod_fabricante:
        return []

    if tipo == "MATERIAL":
        campo_escopo = "MAT.CodMaterial"
    elif tipo == "GRUPO":
        campo_escopo = "MAT.CodGrupo"
    else:
        raise ValueError(f"Tipo de campanha inválido: {tipo}")

    df = data_fim + timedelta(days=1)  # intervalo [inicio, fim+1)
    params: List[Any] = [data_inicio, df, int(cod_fabricante), *refs]
    ph_refs = ",".join(["?"] * len(refs))

    vend_filter = ""
    vend = [int(v) for v in (cod_vendedores or []) if v is not None]
    if vend:
        vend_filter = f"AND PV.CodVendedor IN ({','.join(['?'] * len(vend))})"
        params.extend(vend)

    sql = f"""
        SELECT
            PV.CodVendedor,
            SUM(PVI.Quantidade * PVI.QtdEmbalagem * ISNULL(MAT.PesoBruto, 0)) AS Peso,
            SUM(dbo.Round2(PVI.Quantidade * PVI.ValorEmbalagem))               AS Financeiro,
            SUM(PVI.Quantidade * PVI.QtdEmbalagem)                             AS Quantidade
        FROM PedidoVenda PV
        JOIN PedidoVendaItens PVI  ON PV.CodPedidoVenda = PVI.CodPedidoVenda
        JOIN Material MAT          ON PVI.CodMaterial   = MAT.CodMaterial
        JOIN NaturezaOperacao NOPE ON PV.CodNaturezaOperacao = NOPE.CodNaturezaOperacao
        WHERE PV.Status = 0
          AND NOPE.Venda = 1
          AND MAT.EmbRetornavel = 0
          AND PV.UnidGestora IN (SELECT UnidGestora FROM UserUsuarioUnidade WHERE ID = 'ESIGMA')
          AND PV.DataVenda >= ?
          AND PV.DataVenda <  ?
          AND MAT.CodFabricante = ?
          AND {campo_escopo} IN ({ph_refs})
          {vend_filter}
        GROUP BY PV.CodVendedor
    """

    rows = query_all(sql, params)
    for r in rows:
        r["Peso"]       = round(float(r.get("Peso") or 0), 2)
        r["Financeiro"] = round(float(r.get("Financeiro") or 0), 2)
        r["Quantidade"] = round(float(r.get("Quantidade") or 0), 2)
    return rows


# ─── Buscas para os seletores do cadastro ────────────────────────────

def buscar_fabricantes(termo: str, limit: int = 20) -> List[Dict[str, Any]]:
    """Busca fabricantes por nome."""
    limit = _clamp_limit(limit)
    sql = f"""
        SELECT TOP ({limit}) CodFabricante, Fabricante
        FROM Fabricante
        WHERE Fabricante LIKE ?
        ORDER BY Fabricante
    """
    return query_all(sql, [f"%{termo}%"])


def buscar_materiais(termo: str, cod_fabricante: Optional[int] = None, limit: int = 20) -> List[Dict[str, Any]]:
    """Busca materiais ativos (não retornáveis) por nome, opcionalmente só de um fabricante."""
    limit = _clamp_limit(limit)
    params: List[Any] = [f"%{termo}%"]
    filtro_fab = ""
    if cod_fabricante:
        filtro_fab = "AND CodFabricante = ?"
        params.append(int(cod_fabricante))
    sql = f"""
        SELECT TOP ({limit}) CodMaterial, Material, CodFabricante
        FROM Material
        WHERE Ativo = 1
          AND EmbRetornavel = 0
          AND Material LIKE ?
          {filtro_fab}
        ORDER BY Material
    """
    return query_all(sql, params)


def buscar_grupos(cod_fabricante: int, termo: str = "", limit: int = 50) -> List[Dict[str, Any]]:
    """
    Grupos de material que possuem ao menos um material ativo do fabricante.
    Termo opcional (vazio lista todos os grupos do fabricante).
    """
    limit = _clamp_limit(limit)
    sql = f"""
        SELECT DISTINCT TOP ({limit}) G.CodGrupo, G.Grupo
        FROM Grupo G
        JOIN Material M ON M.CodGrupo = G.CodGrupo
        WHERE M.Ativo = 1
          AND M.EmbRetornavel = 0
          AND M.CodFabricante = ?
          AND G.Grupo LIKE ?
        ORDER BY G.Grupo
    """
    return query_all(sql, [int(cod_fabricante), f"%{termo}%"])