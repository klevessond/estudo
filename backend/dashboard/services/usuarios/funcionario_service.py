# backend/dashboard/services/indicadores/funcionario_service.py
from typing import Dict, Iterable, List, Optional

from dashboard.db_conn import query_all


def listar_funcionarios(search: str = "", limit: int = 20):
    """
    Lista funcionários ativos filtrando por nome.
    Retorna campos relevantes para cadastro.

    Observação: preservado para compatibilidade com usos existentes.
    """
    try:
        limit = max(1, int(limit))  # previne valores inválidos
    except Exception:
        limit = 20

    sql = f"""
        SELECT TOP ({limit})
            f.CodFuncionario,
            f.Funcionario,
            f.Vendedor,
            f.Supervisor,
            f.Transportador,
            f.TransportadorAux,
            f.Entregador,
            f.Cobrador,
            f.Gerente,
            f.UnidGestora,
            f.email
        FROM Funcionario f
        WHERE f.Ativo = 1
          AND f.Funcionario LIKE ?
        ORDER BY f.Funcionario
    """
    return query_all(sql, [f"%{search}%"])


def obter_funcionario_por_codigo(cod_funcionario: int):
    """
    Obtém dados completos de um funcionário específico (ativo).

    Observação: preservado para compatibilidade.
    """
    sql = """
        SELECT 
            CodFuncionario,
            Funcionario,
            Vendedor,
            Supervisor,
            Transportador,
            TransportadorAux,
            Entregador,
            Cobrador,
            Gerente,
            UnidGestora,
            email
        FROM Funcionario
        WHERE CodFuncionario = ?
          AND Ativo = 1
    """
    rows = query_all(sql, [cod_funcionario])
    return rows[0] if rows else None


def get_funcionario_por_codigo(cod_funcionario: int):
    """
    Retorna apenas código e nome (ativo).

    Observação: preservado para compatibilidade.
    """
    sql = """
        SELECT CodFuncionario, Funcionario
        FROM Funcionario
        WHERE CodFuncionario = ?
          AND Ativo = 1
    """
    rows = query_all(sql, [cod_funcionario])
    return rows[0] if rows else None


def obter_unid_gestora(cod_funcionario: int) -> Optional[str]:
    """
    Retorna o código da UnidGestora do funcionário ativo (string).
    - Se não existir, estiver vazia ou ocorrer erro, retorna None.

    Observação: preservado para compatibilidade com chamadas atuais.
    """
    try:
        rows = query_all(
            """
            SELECT UnidGestora
            FROM Funcionario
            WHERE CodFuncionario = ?
              AND Ativo = 1
            """,
            [cod_funcionario],
        )
        if not rows:
            return None

        ug = rows[0].get("UnidGestora")
        if ug is None:
            return None

        ug = str(ug).strip()
        return ug or None
    except Exception:
        return None


# =========================
# Novos utilitários (seguros)
# =========================

def obter_unid_gestora_por_funcionario_id(cod_funcionario: int) -> List[int]:
    """
    Retorna a(s) UGs de um vendedor (como lista de ints).
    - No schema atual há 1 UG por funcionário; retornamos [UG] ou [].
    - Se você tiver relacionamento N:N, adapte aqui (fazendo JOIN na tabela de vínculo).
    """
    try:
        rows = query_all(
            """
            SELECT UnidGestora
            FROM Funcionario
            WHERE CodFuncionario = ?
              AND Ativo = 1
            """,
            [cod_funcionario],
        )
        if not rows:
            return []
        ug = rows[0].get("UnidGestora")
        if ug is None or str(ug).strip() == "":
            return []
        try:
            return [int(ug)]
        except Exception:
            # Se não for numérico, ignore
            return []
    except Exception:
        return []


def obter_unid_gestoras_por_vendedores(vendedor_ids: Iterable[int]) -> Dict[int, List[int]]:
    """
    Mapeia { cod_funcionario: [UGs...] } para uma lista de vendedores.
    - Executa a consulta em lote (IN (...)) quando possível.
    - Se algum vendedor não tiver registro, mapeia para [].
    """
    # Normaliza a lista
    ids: List[int] = []
    for v in vendedor_ids or []:
        try:
            ids.append(int(v))
        except Exception:
            continue

    if not ids:
        return {}

    # Monta placeholders ? para IN
    placeholders = ",".join("?" for _ in ids)
    sql = f"""
        SELECT CodFuncionario, UnidGestora
        FROM Funcionario
        WHERE Ativo = 1
          AND CodFuncionario IN ({placeholders})
    """
    rows = query_all(sql, ids)

    mapa: Dict[int, List[int]] = {vid: [] for vid in ids}
    for r in rows or []:
        vid = r.get("CodFuncionario")
        ug = r.get("UnidGestora")
        if vid is None:
            continue
        try:
            vid = int(vid)
        except Exception:
            continue

        # Trata e normaliza UG
        if ug is None or str(ug).strip() == "":
            continue
        try:
            ug_int = int(ug)
        except Exception:
            continue

        # Evita duplicados
        if vid not in mapa:
            mapa[vid] = []
        if ug_int not in mapa[vid]:
            mapa[vid].append(ug_int)

    # Garante lista ordenada para previsibilidade
    for k in list(mapa.keys()):
        mapa[k] = sorted(mapa[k])

    return mapa
