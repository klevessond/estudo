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
          Funcionario AS Nome,
          unidgestora
            FROM dbo.Funcionario
            WHERE Vendedor = 1
              --AND Ativo = 1
            ORDER BY Funcionario
    """
    dados = query_all(sql)
    return {"detalhamento": dados}

# Adicione ao final de dashboard/services/indicadores/info_service.py

def obter_cod_supervisor(cod_vendedor: int) -> int | None:
    """
    Retorna o CodSupervisor da área de venda ativa deste vendedor.
    """
    if not cod_vendedor:
        return None

    sql = """
        SELECT TOP 1 S.CodSupervisor
        FROM dbo.AreaVenda V
        INNER JOIN dbo.AreaSupervisao S ON V.CodAreaSupervisao = S.CodAreaSupervisao
        WHERE V.CodVendedor = ?
          AND V.Ativa = 1
          AND S.Ativa = 1
    """
    rows = query_all(sql, [cod_vendedor])
    if rows:
        try:
            return int(rows[0]['CodSupervisor'])
        except (ValueError, TypeError, KeyError):
            pass
    return None