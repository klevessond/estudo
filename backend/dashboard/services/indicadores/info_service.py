# backend/dashboard/services/indicadores/info_service.py
from __future__ import annotations

from dashboard.db_conn import query_all  # usa a conexão pyodbc (FreeTDS)

def Todos_Vendedores() -> dict:
    """
    Retorna todos os vendedores ativos.
    Saída:
      { "detalhamento": [ { "CodFuncionario": int, "Nome": str }, ... ] }
    """
    sql = """
        SELECT
            CodFuncionario,
            Funcionario AS Nome
        FROM dbo.Funcionario
        WHERE Vendedor = 1
          AND Ativo = 1
        ORDER BY Funcionario
    """
    dados = query_all(sql)
    return {"detalhamento": dados}
