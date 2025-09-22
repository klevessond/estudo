# backend/dashboard/db_conn.py
import os
import time
from pathlib import Path

import pyodbc
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parents[1]  # .../backend
load_dotenv(BASE_DIR / ".env", override=True)


def conn_str() -> str:
    # Mantido TDS_Version com default 7.0 (não alterar para 7.4)
    return (
        f"DRIVER={os.getenv('DRIVER', 'FreeTDS')};"
        f"SERVER={os.getenv('SERVER')};"
        f"PORT={os.getenv('PORT', '1433')};"
        f"UID={os.getenv('UID')};"
        f"PWD={os.getenv('PWD')};"
        f"DATABASE={os.getenv('DATABASE')};"
        f"TDS_Version={os.getenv('TDS_VERSION', '7.0')};"
        f"Encrypt={os.getenv('ENCRYPT', 'no')};"
        f"LoginTimeout={os.getenv('LOGIN_TIMEOUT', '20')};"
    )


# Códigos de erro que indicam falha transitória na abertura da conexão
_TRANSIENT_ODBC_CODES = {"08S01", "08001", "HYT00", "HYT01"}


def _connect(timeout_connect: int = 30, attempts: int = 3, backoff_initial: float = 0.2):
    """
    Abre conexão com retry/backoff para erros transitórios (ex.: 08S01).
    - timeout_connect: timeout de abertura (segundos) passado ao pyodbc.connect
    - attempts: número de tentativas
    - backoff_initial: atraso inicial entre tentativas (exponencial)
    """
    cs = conn_str()
    delay = backoff_initial
    last_err = None

    for i in range(1, attempts + 1):
        try:
            return pyodbc.connect(cs, timeout=timeout_connect)
        except pyodbc.Error as e:
            last_err = e
            code = e.args[0] if e.args else None
            # Tenta novamente apenas para erros transitórios e se ainda houver tentativa
            if code in _TRANSIENT_ODBC_CODES and i < attempts:
                time.sleep(delay)
                delay *= 2
                continue
            # Repassa o erro se não for transitório ou esgotou tentativas
            raise

    # Se por algum motivo sair do loop sem retornar/raise, propaga o último erro
    if last_err:
        raise last_err


def _ensure_nocount(sql: str) -> str:
    s = sql.lstrip()
    if not s.upper().startswith("SET NOCOUNT ON"):
        return "SET NOCOUNT ON;\n" + sql
    return sql


def query_all(sql: str, params=None, timeout: int = 30):
    """
    Executa SQL e retorna lista de dicts.
    - timeout: timeout de execução do SQL (cn.timeout). O de abertura é derivado.
    """
    sql = _ensure_nocount(sql)

    # Timeout de abertura um pouco maior/igual ao de execução para evitar falso positivo
    open_timeout = max(10, timeout)

    with _connect(timeout_connect=open_timeout, attempts=3) as cn:
        # Timeout de execução do comando (segundos)
        cn.timeout = max(15, timeout)
        with cn.cursor() as cur:
            cur.execute(sql, params or [])
            # Avança até o primeiro result set com colunas
            while cur.description is None:
                if not cur.nextset():
                    return []
            cols = [c[0] for c in cur.description]
            rows = cur.fetchall()
            return [dict(zip(cols, r)) for r in rows]


def query_one(sql: str, params=None, timeout: int = 30):
    rows = query_all(sql, params=params, timeout=timeout)
    return rows[0] if rows else None
