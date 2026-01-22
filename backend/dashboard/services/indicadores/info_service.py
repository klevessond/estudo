# backend/dashboard/services/indicadores/info_service.py
from __future__ import annotations

from dashboard.db_conn import query_all  # usa a conexão pyodbc (FreeTDS)

def Todos_Vendedores(somente_ativos: bool = False) -> dict:
    """
    Retorna vendedores.
    Se somente_ativos=True, filtra F.Ativo = 1.
    Caso contrário, traz histórico completo (útil para relatórios de ano anterior).
    """
    
    filtro_ativo = " AND F.Ativo = 1 " if somente_ativos else ""

    sql = f"""
        SELECT
            F.CodFuncionario,
            F.Funcionario AS Nome,
            F.unidgestora,
            F.Ativo,
            S.CodSupervisor,
            FS.Nome AS NomeSupervisor
        FROM dbo.Funcionario F
        -- Join para pegar o supervisor (mesmo que o vendedor esteja inativo, 
        -- tentamos pegar a última área ativa ou a atual)
        LEFT JOIN dbo.AreaVenda AV ON F.CodFuncionario = AV.CodVendedor AND AV.Ativa = 1
        LEFT JOIN dbo.AreaSupervisao S ON AV.CodAreaSupervisao = S.CodAreaSupervisao AND S.Ativa = 1
        LEFT JOIN dbo.Funcionario FS ON S.CodSupervisor = FS.CodFuncionario
        WHERE F.Vendedor = 1
          {filtro_ativo}
        ORDER BY F.Funcionario
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