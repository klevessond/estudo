# backend/dashboard/services/indicadores/cache_aa.py
"""
Cache de dados de Ano Anterior em SQLite local.
Dados do ano anterior são imutáveis — só vão ao SQL Server se não existirem
no cache. A chave é composta por: (tipo, data_ini, data_fim, escopo_hash).
"""
import json
import hashlib
import sqlite3
import logging
from pathlib import Path
from typing import Any, Dict, Optional

logger = logging.getLogger(__name__)

# SQLite fica na raiz do backend, fora do controle do git
_DB_PATH = Path(__file__).resolve().parents[3] / "cache_ano_anterior.sqlite3"


def _get_conn():
    conn = sqlite3.connect(str(_DB_PATH), timeout=10)
    conn.row_factory = sqlite3.Row
    return conn


def _init_db():
    with _get_conn() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS cache_aa (
                chave       TEXT PRIMARY KEY,
                tipo        TEXT NOT NULL,
                data_ini    TEXT NOT NULL,
                data_fim    TEXT NOT NULL,
                payload     TEXT NOT NULL,
                criado_em   TEXT DEFAULT (datetime('now'))
            )
        """)
        conn.execute("CREATE INDEX IF NOT EXISTS idx_tipo ON cache_aa(tipo, data_ini, data_fim)")
        conn.commit()

_init_db()


def _chave(tipo: str, data_ini: str, data_fim: str, escopo: Any = None) -> str:
    """Gera chave única para o cache. escopo pode ser lista de rotas, vendedores, etc."""
    escopo_str = json.dumps(sorted(escopo) if escopo else [], sort_keys=True)
    raw = f"{tipo}|{data_ini}|{data_fim}|{escopo_str}"
    return hashlib.sha256(raw.encode()).hexdigest()


def get_cache_aa(tipo: str, data_ini: str, data_fim: str, escopo: Any = None) -> Optional[Any]:
    """Retorna dados do cache ou None se não existir."""
    chave = _chave(tipo, data_ini, data_fim, escopo)
    try:
        with _get_conn() as conn:
            row = conn.execute(
                "SELECT payload FROM cache_aa WHERE chave = ?", (chave,)
            ).fetchone()
            if row:
                logger.debug("[cache_aa] HIT tipo=%s %s→%s", tipo, data_ini, data_fim)
                return json.loads(row["payload"])
    except Exception:
        logger.exception("[cache_aa] erro ao ler cache tipo=%s", tipo)
    return None


def set_cache_aa(tipo: str, data_ini: str, data_fim: str, payload: Any, escopo: Any = None) -> None:
    """Salva dados no cache."""
    chave = _chave(tipo, data_ini, data_fim, escopo)
    try:
        with _get_conn() as conn:
            conn.execute("""
                INSERT OR REPLACE INTO cache_aa (chave, tipo, data_ini, data_fim, payload)
                VALUES (?, ?, ?, ?, ?)
            """, (chave, tipo, data_ini, data_fim, json.dumps(payload, default=str)))
            conn.commit()
            logger.debug("[cache_aa] SAVED tipo=%s %s→%s", tipo, data_ini, data_fim)
    except Exception:
        logger.exception("[cache_aa] erro ao salvar cache tipo=%s", tipo)


def invalidar_cache_aa(tipo: str = None) -> int:
    """Limpa o cache. Se tipo=None, limpa tudo. Retorna qtd removida."""
    try:
        with _get_conn() as conn:
            if tipo:
                cur = conn.execute("DELETE FROM cache_aa WHERE tipo = ?", (tipo,))
            else:
                cur = conn.execute("DELETE FROM cache_aa")
            conn.commit()
            return cur.rowcount
    except Exception:
        logger.exception("[cache_aa] erro ao invalidar cache")
        return 0