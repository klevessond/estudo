# backend/dashboard/services/indicadores/funcionario_service.py
from dashboard.db_conn import query_all

def listar_funcionarios(search: str = '', limit: int = 20):
    """
    Lista funcionários ativos filtrando por nome.
    Retorna campos relevantes para cadastro.
    """
    limit = max(1, int(limit))  # evita SQL injection e valores inválidos
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
    return query_all(sql, [f'%{search}%'])

def obter_funcionario_por_codigo(cod_funcionario: int):
    """
    Obtém dados completos de um funcionário específico (ativo).
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
    """
    sql = """
        SELECT CodFuncionario, Funcionario
        FROM Funcionario
        WHERE CodFuncionario = ?
          AND Ativo = 1
    """
    rows = query_all(sql, [cod_funcionario])
    return rows[0] if rows else None
