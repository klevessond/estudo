# backend/dashboard/services/indicadores/cache_mes.py
"""
Cache de resultados de meses FECHADOS do ano corrente em SQLite local.

Lógica de elegibilidade:
  - O período consultado deve estar 100% no passado:
    data_fim < primeiro dia do mês atual
  - Pertencer ao ano corrente (di.year == hoje.year e df.year == hoje.year)
  - Períodos de meses anteriores ao ano corrente usam o cache_aa.py existente

Por que cachear os resultados processados (não os brutos)?
  - Evita re-executar tanto a query SQL quanto o pós-processamento Python
  - O payload salvo é exatamente o dict retornado pelo serviço, pronto para
    alimentar o Response do frontend sem nenhum cálculo adicional
"""
import json
import hashlib
import sqlite3
import logging
from datetime import date
from pathlib import Path
from typing import Any, Optional, Iterable

logger = logging.getLogger(__name__)

_DB_PATH = Path(__file__).resolve().parents[3] / "cache_mes_atual.sqlite3"


# ─────────────────────────────────────────────
# Conexão e inicialização
# ─────────────────────────────────────────────

def _get_conn() -> sqlite3.Connection:
    conn = sqlite3.connect(str(_DB_PATH), timeout=10)
    conn.row_factory = sqlite3.Row
    return conn


def _init_db() -> None:
    with _get_conn() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS cache_mes (
                chave       TEXT PRIMARY KEY,
                tipo        TEXT NOT NULL,
                data_ini    TEXT NOT NULL,
                data_fim    TEXT NOT NULL,
                payload     TEXT NOT NULL,
                criado_em   TEXT DEFAULT (datetime('now'))
            )
        """)
        conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_tipo_mes "
            "ON cache_mes(tipo, data_ini, data_fim)"
        )
        conn.commit()


_init_db()


# ─────────────────────────────────────────────
# Elegibilidade
# ─────────────────────────────────────────────

def periodo_cacheavel(data_ini: str, data_fim: str) -> bool:
    """
    Retorna True somente se o período está completamente fechado
    dentro do ano corrente.

    Exemplos (supondo hoje = 2026-05-15):
      2026-01-01 → 2026-01-31  → True   (janeiro fechado)
      2026-02-01 → 2026-03-31  → True   (fev+mar fechados)
      2026-04-01 → 2026-04-30  → True   (abril fechado)
      2026-05-01 → 2026-05-31  → False  (mês atual, ainda aberto)
      2025-12-01 → 2025-12-31  → False  (ano anterior → usa cache_aa)
    """
    hoje = date.today()
    primeiro_dia_mes_atual = date(hoje.year, hoje.month, 1)

    try:
        di = date.fromisoformat(str(data_ini))
        df = date.fromisoformat(str(data_fim))
    except (ValueError, TypeError):
        return False

    return (
        di.year == hoje.year      # início no ano corrente
        and df.year == hoje.year  # fim no ano corrente
        and df < primeiro_dia_mes_atual  # mês completamente no passado
    )


# ─────────────────────────────────────────────
# Chave de cache
# ─────────────────────────────────────────────

def _chave(tipo: str, data_ini: str, data_fim: str, escopo: Any = None) -> str:
    """
    Gera chave SHA-256 única.

    'escopo' pode ser:
      - lista de CodVendedor  → [178, 190, 224]
      - lista de CodRota      → [1, 5, 12]
      - None (sem filtro = todos)
    """
    if isinstance(escopo, (list, set, tuple)):
        escopo_str = json.dumps(sorted(int(x) for x in escopo if x is not None), sort_keys=True)
    else:
        escopo_str = json.dumps(escopo, sort_keys=True) if escopo is not None else "[]"

    raw = f"{tipo}|{data_ini}|{data_fim}|{escopo_str}"
    return hashlib.sha256(raw.encode()).hexdigest()


# ─────────────────────────────────────────────
# API pública
# ─────────────────────────────────────────────

def get_cache_mes(
    tipo: str,
    data_ini: str,
    data_fim: str,
    escopo: Any = None,
) -> Optional[Any]:
    """
    Retorna o payload cacheado ou None (miss ou período não cacheável).

    Uso:
        resultado = get_cache_mes("vendas_por_vendedor", de, ate, vendedores)
        if resultado is None:
            resultado = buscar_vendas_por_vendedor(de, ate, ...)
            set_cache_mes("vendas_por_vendedor", de, ate, resultado, vendedores)
    """
    if not periodo_cacheavel(data_ini, data_fim):
        return None

    chave = _chave(tipo, data_ini, data_fim, escopo)
    try:
        with _get_conn() as conn:
            row = conn.execute(
                "SELECT payload FROM cache_mes WHERE chave = ?", (chave,)
            ).fetchone()
            if row:
                logger.info(
                    "[cache_mes] HIT tipo=%s %s→%s escopo_len=%s",
                    tipo, data_ini, data_fim,
                    len(escopo) if isinstance(escopo, (list, set)) else "—",
                )
                return json.loads(row["payload"])
    except Exception:
        logger.exception("[cache_mes] erro ao ler cache tipo=%s", tipo)
    return None


def set_cache_mes(
    tipo: str,
    data_ini: str,
    data_fim: str,
    payload: Any,
    escopo: Any = None,
) -> None:
    """
    Persiste o resultado no cache (ignorado silenciosamente se período
    não for cacheável).
    """
    if not periodo_cacheavel(data_ini, data_fim):
        return

    chave = _chave(tipo, data_ini, data_fim, escopo)
    try:
        with _get_conn() as conn:
            conn.execute(
                """
                INSERT OR REPLACE INTO cache_mes
                    (chave, tipo, data_ini, data_fim, payload)
                VALUES (?, ?, ?, ?, ?)
                """,
                (
                    chave,
                    tipo,
                    data_ini,
                    data_fim,
                    json.dumps(payload, default=str),
                ),
            )
            conn.commit()
            logger.info(
                "[cache_mes] SAVED tipo=%s %s→%s escopo_len=%s",
                tipo, data_ini, data_fim,
                len(escopo) if isinstance(escopo, (list, set)) else "—",
            )
    except Exception:
        logger.exception("[cache_mes] erro ao salvar cache tipo=%s", tipo)


def invalidar_cache_mes(tipo: str = None) -> int:
    """
    Remove entradas do cache.
    - tipo=None  → limpa tudo
    - tipo="..."  → limpa só aquele tipo
    Retorna quantidade de linhas removidas.
    """
    try:
        with _get_conn() as conn:
            if tipo:
                cur = conn.execute(
                    "DELETE FROM cache_mes WHERE tipo = ?", (tipo,)
                )
            else:
                cur = conn.execute("DELETE FROM cache_mes")
            conn.commit()
            logger.info("[cache_mes] invalidados %d registros (tipo=%s)", cur.rowcount, tipo or "ALL")
            return cur.rowcount
    except Exception:
        logger.exception("[cache_mes] erro ao invalidar cache")
        return 0


def stats_cache_mes() -> dict:
    """Retorna estatísticas do cache para monitoramento/admin."""
    try:
        with _get_conn() as conn:
            total = conn.execute("SELECT COUNT(*) as n FROM cache_mes").fetchone()["n"]
            por_tipo = conn.execute(
                "SELECT tipo, COUNT(*) as n FROM cache_mes GROUP BY tipo ORDER BY n DESC"
            ).fetchall()
            return {
                "total": total,
                "por_tipo": {r["tipo"]: r["n"] for r in por_tipo},
            }
    except Exception:
        logger.exception("[cache_mes] erro ao consultar stats")
        return {"total": 0, "por_tipo": {}}

# ─────────────────────────────────────────────────────────────────────────────
# ADICIONE estas funções ao final de:
# backend/dashboard/services/indicadores/cache_mes.py
# ─────────────────────────────────────────────────────────────────────────────


# =============================================================================
# SUBSTITUA a função listar_periodos_cacheados() em:
# backend/dashboard/services/indicadores/cache_mes.py
# =============================================================================

def listar_periodos_cacheados() -> list:
    """
    Retorna lista de períodos únicos cacheados, agregados por data_ini + data_fim.

    CORREÇÃO: SQLite não suporta ORDER BY dentro de GROUP_CONCAT.
    A ordenação dos tipos é feita em Python após a query.

    Formato de cada item:
    {
        "data_ini":  "2026-01-01",
        "data_fim":  "2026-01-31",
        "qtd_tipos": 6,
        "tipos":     ["cupons_pdv", "positivacao", "pre_venda", ...],
        "criado_em": "2026-05-16 02:49:57"
    }
    """
    try:
        with _get_conn() as conn:
            rows = conn.execute(
                """
                SELECT
                    data_ini,
                    data_fim,
                    COUNT(*)           AS qtd_tipos,
                    GROUP_CONCAT(tipo) AS tipos,
                    MAX(criado_em)     AS criado_em
                FROM cache_mes
                GROUP BY data_ini, data_fim
                ORDER BY data_ini DESC
                """
            ).fetchall()

            resultado = []
            for r in rows:
                # Ordena os tipos em Python (evita incompatibilidade do SQLite)
                tipos_raw = r["tipos"] or ""
                tipos = sorted(t.strip() for t in tipos_raw.split(",") if t.strip())

                resultado.append({
                    "data_ini":  r["data_ini"],
                    "data_fim":  r["data_fim"],
                    "qtd_tipos": r["qtd_tipos"],
                    "tipos":     tipos,
                    "criado_em": r["criado_em"],
                })

            return resultado

    except Exception:
        logger.exception("[cache_mes] erro ao listar períodos")
        return []


def invalidar_por_periodo(data_ini: str, data_fim: str) -> int:
    """
    Remove todas as entradas de um período específico (todos os tipos).
    Retorna quantidade de linhas removidas.
    """
    try:
        with _get_conn() as conn:
            cur = conn.execute(
                "DELETE FROM cache_mes WHERE data_ini = ? AND data_fim = ?",
                (data_ini, data_fim),
            )
            conn.commit()
            removidos = cur.rowcount
            logger.info(
                "[cache_mes] invalidados %d registros período %s→%s",
                removidos, data_ini, data_fim,
            )
            return removidos
    except Exception:
        logger.exception("[cache_mes] erro ao invalidar período %s→%s", data_ini, data_fim)
        return 0


def invalidar_por_tipo_e_periodo(tipo: str, data_ini: str, data_fim: str) -> int:
    """Remove uma entrada específica (tipo + período)."""
    try:
        with _get_conn() as conn:
            cur = conn.execute(
                "DELETE FROM cache_mes WHERE tipo = ? AND data_ini = ? AND data_fim = ?",
                (tipo, data_ini, data_fim),
            )
            conn.commit()
            return cur.rowcount
    except Exception:
        logger.exception("[cache_mes] erro ao invalidar tipo=%s período %s→%s", tipo, data_ini, data_fim)
        return 0