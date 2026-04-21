# backend/dashboard/services/indicadores/pdv_mix_service.py
"""
Serviço de Mix por UnidGestora — baseado em ViewVenda + ViewVendaItens.

Inclui TODAS as vendas da UG (rotas + PDV/NFC-e), pois o mix de uma loja
deve refletir tudo que foi vendido nela, não apenas os cupons fiscais.

Regras de negócio:
  - Vendas válidas: ViewVenda.Status = 0, NaturezaOperacao.Venda = 1,
                    Material.EmbRetornavel = 0
  - UnidGestora 1 é excluída sempre (UG de controle/estoque)
  - Mix NÃO é soma dos mix individuais: deve ser calculado via COUNT DISTINCT
    em uma consulta conjunta das UGs do escopo.
    Ex: UG-A vende produto X e Y (mix=2), UG-B vende Y e Z (mix=2).
        Mix conjunto = 3 (X, Y, Z) — nunca 4 (2+2).
  - Retorno varia por perfil:
      · Vendedor  → dados da(s) sua(s) UG(s)
      · Supervisor → por vendedor + mix real do grupo
      · Gerente/Admin → por supervisor + mix real de todas as lojas
"""
from __future__ import annotations

from datetime import datetime, timedelta, date
from typing import Any, Dict, List, Optional, Tuple

from dashboard.db_conn import query_all


# ─────────────────────────────────────────────
# Helpers internos (reaproveitam lógica do pdv_service)
# ─────────────────────────────────────────────

def _as_date(d) -> date:
    if isinstance(d, date):
        return d
    return datetime.strptime(str(d), "%Y-%m-%d").date()


def _intervalo_exclusivo(di: date, df: date) -> Tuple[datetime, datetime]:
    """Fim exclusivo: df + 1 dia 00:00 (padrão do banco)."""
    df_excl = df + timedelta(days=1)
    return (
        datetime.combine(di, datetime.min.time()),
        datetime.combine(df_excl, datetime.min.time()),
    )


def _placeholders(lst: list) -> str:
    return ",".join("?" for _ in lst)


# ═══════════════════════════════════════════════════════════════════
# 1. CONSULTA BASE — retorna {UnidGestora: set(CodMaterial)} em 1 query
#
#    Todos os cálculos de mix (vendedor, supervisor, gerente, empresa)
#    derivam desta única consulta via union de sets no Python.
#    Isso evita N queries dentro de loops — causa do freeze.
# ═══════════════════════════════════════════════════════════════════

def _buscar_mapa_materiais_por_ug(
    di_dt: datetime,
    df_dt: datetime,
    unid_gestoras: List[str],
) -> Dict[str, set]:
    """
    Retorna { str(UnidGestora): set(CodMaterial) } para as UGs informadas.
    Uma única query — todos os mixes derivam desta estrutura no Python.
    """
    if not unid_gestoras:
        return {}

    ph = _placeholders(unid_gestoras)
    sql = f"""
        SELECT DISTINCT
            V.UnidGestora,
            VI.CodMaterial
        FROM ViewVenda V
        LEFT JOIN ViewVendaItens VI
            ON  V.CodPedidoVenda = VI.CodPedidoVenda
            AND V.ECFSerial      = VI.ECFSerial
            AND V.CodCupom       = VI.CodCupom
        LEFT JOIN Material M
            ON VI.CodMaterial = M.CodMaterial
        LEFT JOIN NaturezaOperacao N
            ON V.CodNaturezaOperacao = N.CodNaturezaOperacao
        WHERE M.EmbRetornavel = 0
          AND N.Venda         = 1
          AND V.Status        = 0
          AND V.UnidGestora  <> 1
          AND V.UnidGestora  IN ({ph})
          AND V.DataVenda    >= ?
          AND V.DataVenda     < ?
    """
    params = [*unid_gestoras, di_dt, df_dt]
    rows = query_all(sql, params)

    mapa: Dict[str, set] = {}
    for r in rows:
        ug = str(r.get("UnidGestora") or "")
        mat = r.get("CodMaterial")
        if ug and mat is not None:
            mapa.setdefault(ug, set()).add(mat)
    return mapa


def _mix_de_ugs(mapa: Dict[str, set], ugs: List[str]) -> int:
    """
    Calcula o mix real de um conjunto de UGs a partir do mapa já carregado.
    Mix = len(união dos sets de materiais das UGs) — nunca soma dos individuais.
    """
    materiais: set = set()
    for ug in ugs:
        materiais |= mapa.get(str(ug), set())
    return len(materiais)


# ═══════════════════════════════════════════════════════════════════
# 2. CONSULTA POR UG — volume, valor, mix individual de cada loja
#    Mesma base da consulta conjunta, mas GROUP BY UnidGestora.
#    Inclui rotas E PDV — espelho do que o sistema usa para mix de rota.
# ═══════════════════════════════════════════════════════════════════

def _buscar_resumo_por_ug(
    di_dt: datetime,
    df_dt: datetime,
    unid_gestoras: Optional[List[str]] = None,
) -> List[Dict[str, Any]]:
    """
    Retorna por UnidGestora:
      - QtdVendas   : número de documentos de venda distintos
      - QtdItens    : total de unidades vendidas (Quantidade * QtdEmbalagem)
      - ValorTotal  : valor bruto dos produtos (sem desconto)
      - Desconto    : total de descontos
      - Peso        : peso total vendido
      - MixUG       : COUNT DISTINCT CodMaterial (mix individual desta loja)
      - CodVendedor : vendedor da UG via OUTER APPLY
    """
    filtro_ugs = ""
    params: List[Any] = []

    if unid_gestoras:
        ugs = [str(u).strip() for u in unid_gestoras if str(u).strip()]
        if ugs:
            filtro_ugs = f" AND V.UnidGestora IN ({_placeholders(ugs)}) "
            params.extend(ugs)

    params.extend([di_dt, df_dt])

    sql = f"""
        SELECT
            V.UnidGestora,
            COUNT(DISTINCT V.CodCupom)                                              AS QtdVendas,
            SUM(VI.Quantidade * VI.QtdEmbalagem)                                    AS QtdItens,
            SUM(dbo.Round2(VI.Quantidade * VI.ValorEmbalagem))                      AS ValorTotal,
            SUM(dbo.Round2(VI.DescontoRef + (VI.Desconto * VI.Quantidade)))         AS Desconto,
            SUM(VI.Quantidade * VI.QtdEmbalagem * M.PesoBruto)                      AS Peso,
            COUNT(DISTINCT VI.CodMaterial)                                          AS MixUG,
            F1.CodFuncionario                                                       AS CodVendedor,
            F1.Funcionario                                                          AS NomeVendedor
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
            SELECT TOP 1 F.CodFuncionario, F.Funcionario
            FROM Funcionario F
            WHERE F.UnidGestora = V.UnidGestora
              AND F.Vendedor = 1
            ORDER BY F.CodFuncionario
        ) F1
        WHERE M.EmbRetornavel = 0
          AND N.Venda         = 1
          AND V.Status        = 0
          AND V.UnidGestora  <> 1
          AND V.UnidGestora  IN (SELECT UnidGestora FROM UnidadeGestora)
          {filtro_ugs}
          AND V.DataVenda    >= ?
          AND V.DataVenda     < ?
        GROUP BY
            V.UnidGestora,
            F1.CodFuncionario,
            F1.Funcionario
        ORDER BY
            V.UnidGestora
    """
    rows = query_all(sql, params)

    for r in rows:
        r["QtdVendas"]    = int(r.get("QtdVendas")   or 0)
        r["QtdItens"]     = float(r.get("QtdItens")   or 0)
        r["ValorTotal"]   = float(r.get("ValorTotal") or 0)
        r["Desconto"]     = float(r.get("Desconto")   or 0)
        r["Peso"]         = float(r.get("Peso")       or 0)
        r["MixUG"]        = int(r.get("MixUG")        or 0)
        r["CodVendedor"]  = int(r.get("CodVendedor")  or 0) if r.get("CodVendedor") else None
        r["NomeVendedor"] = (r.get("NomeVendedor") or "").strip()

    return rows


# ═══════════════════════════════════════════════════════════════════
# 3. VISÃO DO VENDEDOR
#    2 queries fixas: resumo por UG + mapa de materiais. Zero loops de query.
# ═══════════════════════════════════════════════════════════════════

def buscar_mix_pdv_vendedor(
    data_inicio,
    data_fim,
    unid_gestoras: List[str],
) -> Dict[str, Any]:
    """
    Retorno para um vendedor individual:
    {
      "QtdVendas" : int,    ← documentos de venda distintos (rotas + PDV)
      "QtdItens"  : float,
      "ValorTotal": float,
      "Desconto"  : float,
      "Peso"      : float,
      "Mix"       : int,    ← union real dos materiais das UGs do vendedor
      "por_ug"    : [ { UnidGestora, QtdVendas, QtdItens, ValorTotal, Desconto, Peso, MixUG } ]
    }
    """
    di = _as_date(data_inicio)
    df = _as_date(data_fim)
    di_dt, df_dt = _intervalo_exclusivo(di, df)

    ugs = [str(u).strip() for u in (unid_gestoras or []) if str(u).strip()]
    if not ugs:
        return {"QtdVendas": 0, "QtdItens": 0.0, "ValorTotal": 0.0,
                "Desconto": 0.0, "Peso": 0.0, "Mix": 0, "por_ug": []}

    # 2 queries — sem loop
    por_ug   = _buscar_resumo_por_ug(di_dt, df_dt, ugs)
    mat_mapa = _buscar_mapa_materiais_por_ug(di_dt, df_dt, ugs)

    return {
        "QtdVendas" : sum(r["QtdVendas"]  for r in por_ug),
        "QtdItens"  : round(sum(r["QtdItens"]   for r in por_ug), 3),
        "ValorTotal": round(sum(r["ValorTotal"]  for r in por_ug), 2),
        "Desconto"  : round(sum(r["Desconto"]    for r in por_ug), 2),
        "Peso"      : round(sum(r["Peso"]        for r in por_ug), 3),
        "Mix"       : _mix_de_ugs(mat_mapa, ugs),  # union no Python — sem query extra
        "por_ug"    : por_ug,
    }


# ═══════════════════════════════════════════════════════════════════
# 4. VISÃO DO SUPERVISOR
#    2 queries fixas independente da quantidade de vendedores.
# ═══════════════════════════════════════════════════════════════════

def buscar_mix_pdv_supervisor(
    data_inicio,
    data_fim,
    mapa_vendedor_ugs: Dict[int, List[str]],
) -> Dict[str, Any]:
    """
    mapa_vendedor_ugs: { cod_vendedor(int): ["ug1", "ug2", ...] }

    Retorno:
    {
      "mix_grupo"        : int,   ← union de materiais de todas as UGs do supervisor
      "QtdVendas_total"  : int,
      "QtdItens_total"   : float,
      "ValorTotal_total" : float,
      "por_vendedor": [
        {
          "CodVendedor" : int,
          "QtdVendas"   : int,
          "QtdItens"    : float,
          "ValorTotal"  : float,
          "Mix"         : int,    ← union real das UGs deste vendedor (Python, sem query)
          "por_ug"      : [...]
        }
      ]
    }
    """
    di = _as_date(data_inicio)
    df = _as_date(data_fim)
    di_dt, df_dt = _intervalo_exclusivo(di, df)

    # Coleta todas as UGs do supervisor (dedup)
    todas_ugs: List[str] = list(dict.fromkeys(
        str(u).strip()
        for ugs in mapa_vendedor_ugs.values()
        for u in ugs if str(u).strip()
    ))

    if not todas_ugs:
        return {"mix_grupo": 0, "QtdVendas_total": 0,
                "QtdItens_total": 0.0, "ValorTotal_total": 0.0, "por_vendedor": []}

    # ── 2 queries totais, independente do nº de vendedores ──
    todas_rows = _buscar_resumo_por_ug(di_dt, df_dt, todas_ugs)
    mat_mapa   = _buscar_mapa_materiais_por_ug(di_dt, df_dt, todas_ugs)

    ug_index: Dict[str, Dict] = {str(r["UnidGestora"]): r for r in todas_rows}

    por_vendedor = []
    for cod_vend, ugs in mapa_vendedor_ugs.items():
        ugs_str = [str(u).strip() for u in ugs if str(u).strip()]
        linhas  = [ug_index[u] for u in ugs_str if u in ug_index]

        por_vendedor.append({
            "CodVendedor" : cod_vend,
            "NomeVendedor": linhas[0]["NomeVendedor"] if linhas else "",
            "QtdVendas"   : sum(r["QtdVendas"]  for r in linhas),
            "QtdItens"    : round(sum(r["QtdItens"]   for r in linhas), 3),
            "ValorTotal"  : round(sum(r["ValorTotal"]  for r in linhas), 2),
            "Mix"         : _mix_de_ugs(mat_mapa, ugs_str),  # Python puro — sem query
            "por_ug"      : linhas,
        })

    por_vendedor.sort(key=lambda x: x["ValorTotal"], reverse=True)

    return {
        "mix_grupo"        : _mix_de_ugs(mat_mapa, todas_ugs),  # union de tudo — sem query
        "QtdVendas_total"  : sum(v["QtdVendas"]  for v in por_vendedor),
        "QtdItens_total"   : round(sum(v["QtdItens"]   for v in por_vendedor), 3),
        "ValorTotal_total" : round(sum(v["ValorTotal"]  for v in por_vendedor), 2),
        "por_vendedor"     : por_vendedor,
    }


# ═══════════════════════════════════════════════════════════════════
# 5. VISÃO DO GERENTE / ADMIN
#    2 queries fixas independente do nº de supervisores e vendedores.
# ═══════════════════════════════════════════════════════════════════

def buscar_mix_pdv_gerente(
    data_inicio,
    data_fim,
    mapa_supervisor_vendedores: Dict[int, Dict[int, List[str]]],
) -> Dict[str, Any]:
    """
    mapa_supervisor_vendedores:
      { cod_supervisor(int): { cod_vendedor(int): ["ug1", "ug2", ...] } }

    Retorno:
    {
      "mix_geral"        : int,
      "QtdVendas_total"  : int,
      "QtdItens_total"   : float,
      "ValorTotal_total" : float,
      "por_supervisor": [
        {
          "CodSupervisor"    : int,
          "mix_grupo"        : int,
          "QtdVendas_total"  : int,
          "QtdItens_total"   : float,
          "ValorTotal_total" : float,
          "por_vendedor"     : [...]
        }
      ]
    }
    """
    di = _as_date(data_inicio)
    df = _as_date(data_fim)
    di_dt, df_dt = _intervalo_exclusivo(di, df)

    # Todas as UGs da empresa (dedup)
    todas_ugs_empresa: List[str] = list(dict.fromkeys(
        str(u).strip()
        for vend_map in mapa_supervisor_vendedores.values()
        for ugs in vend_map.values()
        for u in ugs if str(u).strip()
    ))

    if not todas_ugs_empresa:
        return {"mix_geral": 0, "QtdVendas_total": 0,
                "QtdItens_total": 0.0, "ValorTotal_total": 0.0, "por_supervisor": []}

    # ── 2 queries totais, independente do nº de supervisores/vendedores ──
    todas_rows = _buscar_resumo_por_ug(di_dt, df_dt, todas_ugs_empresa)
    mat_mapa   = _buscar_mapa_materiais_por_ug(di_dt, df_dt, todas_ugs_empresa)

    ug_index: Dict[str, Dict] = {str(r["UnidGestora"]): r for r in todas_rows}

    por_supervisor = []
    for cod_sup, vend_map in mapa_supervisor_vendedores.items():
        ugs_sup: List[str] = list(dict.fromkeys(
            str(u).strip()
            for ugs in vend_map.values()
            for u in ugs if str(u).strip()
        ))

        por_vendedor = []
        for cod_vend, ugs in vend_map.items():
            ugs_str = [str(u).strip() for u in ugs if str(u).strip()]
            linhas  = [ug_index[u] for u in ugs_str if u in ug_index]

            por_vendedor.append({
                "CodVendedor" : cod_vend,
                "NomeVendedor": linhas[0]["NomeVendedor"] if linhas else "",
                "QtdVendas"   : sum(r["QtdVendas"]  for r in linhas),
                "QtdItens"    : round(sum(r["QtdItens"]   for r in linhas), 3),
                "ValorTotal"  : round(sum(r["ValorTotal"]  for r in linhas), 2),
                "Mix"         : _mix_de_ugs(mat_mapa, ugs_str),  # Python puro
                "por_ug"      : linhas,
            })

        por_vendedor.sort(key=lambda x: x["ValorTotal"], reverse=True)

        por_supervisor.append({
            "CodSupervisor"    : cod_sup,
            "mix_grupo"        : _mix_de_ugs(mat_mapa, ugs_sup),  # Python puro
            "QtdVendas_total"  : sum(v["QtdVendas"]  for v in por_vendedor),
            "QtdItens_total"   : round(sum(v["QtdItens"]   for v in por_vendedor), 3),
            "ValorTotal_total" : round(sum(v["ValorTotal"]  for v in por_vendedor), 2),
            "por_vendedor"     : por_vendedor,
        })

    por_supervisor.sort(key=lambda x: x["ValorTotal_total"], reverse=True)

    return {
        "mix_geral"        : _mix_de_ugs(mat_mapa, todas_ugs_empresa),  # Python puro
        "QtdVendas_total"  : sum(s["QtdVendas_total"]  for s in por_supervisor),
        "QtdItens_total"   : round(sum(s["QtdItens_total"]   for s in por_supervisor), 3),
        "ValorTotal_total" : round(sum(s["ValorTotal_total"]  for s in por_supervisor), 2),
        "por_supervisor"   : por_supervisor,
    }


# ═══════════════════════════════════════════════════════════════════
# 6. ENTRY-POINT UNIFICADO
#    Detecta o perfil e chama a função correta.
#    Pensado para ser chamado diretamente da view.
# ═══════════════════════════════════════════════════════════════════

def buscar_mix_pdv_por_perfil(
    data_inicio,
    data_fim,
    perfil: str,                        # "vendedor" | "supervisor" | "gerente" | "admin"
    mapa_vendedor_ugs: Optional[Dict[int, List[str]]] = None,
    mapa_supervisor_vendedores: Optional[Dict[int, Dict[int, List[str]]]] = None,
    unid_gestoras_vendedor: Optional[List[str]] = None,
) -> Dict[str, Any]:
    """
    Entry-point único para a view chamar.

    Parâmetros conforme perfil:
      · "vendedor"   → unid_gestoras_vendedor=[...]
      · "supervisor" → mapa_vendedor_ugs={cod_vend: [ugs]}
      · "gerente"/"admin" → mapa_supervisor_vendedores={cod_sup: {cod_vend: [ugs]}}
    """
    perfil = (perfil or "").lower()

    if perfil == "vendedor":
        return buscar_mix_pdv_vendedor(
            data_inicio, data_fim,
            unid_gestoras=unid_gestoras_vendedor or [],
        )

    if perfil == "supervisor":
        return buscar_mix_pdv_supervisor(
            data_inicio, data_fim,
            mapa_vendedor_ugs=mapa_vendedor_ugs or {},
        )

    if perfil in ("gerente", "admin"):
        return buscar_mix_pdv_gerente(
            data_inicio, data_fim,
            mapa_supervisor_vendedores=mapa_supervisor_vendedores or {},
        )

    raise ValueError(f"Perfil desconhecido: '{perfil}'. Use 'vendedor', 'supervisor', 'gerente' ou 'admin'.")