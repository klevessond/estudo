# backend/dashboard/services/indicadores/rotas_simples.py
from typing import Dict, Any, List
from dashboard.db_conn import query_all  # usa a conexão pyodbc via FreeTDS

def buscar_rotas_usuario(ctx, db_alias: str = "dados_industria") -> Dict[str, Any]:
    """
    Regras:
      - Admin       -> não filtra (rotas=None).
      - Supervisor  -> rotas das áreas que supervisiona (S.Ativa=1 e V.Ativa=1).
      - Vendedor    -> rotas das áreas de venda onde ele é o vendedor (R.Ativa=1).
    """
    is_admin = bool(getattr(ctx, "is_admin", False))
    is_supervisor = bool(getattr(ctx, "is_supervisor", False))
    is_vendedor = bool(getattr(ctx, "is_vendedor", False))
    cod_func = getattr(ctx, "cod_funcionario", None)

    if is_admin:
        return {"rotas": None, "detalhado": []}

    if is_supervisor:
        if not cod_func:
            return {"rotas": [], "detalhado": []}
        cod_sup = int(cod_func)  # sanitiza

        sql = """
            SELECT
                R.CodRota,
                R.Rota,
                V.CodVendedor
            FROM dbo.AreaSupervisao S
            INNER JOIN dbo.AreaVenda V ON S.CodAreaSupervisao = V.CodAreaSupervisao
            INNER JOIN dbo.Rota R ON R.CodAreaVenda = V.CodAreaVenda
            WHERE S.Ativa = 1
              AND V.Ativa = 1
              AND S.CodSupervisor = ?
        """
        dados: List[Dict[str, Any]] = query_all(sql, [cod_sup])

        rotas = [int(d["CodRota"]) for d in dados] if dados else []
        vendedores = sorted({int(d["CodVendedor"]) for d in dados if d.get("CodVendedor") is not None})
        return {"rotas": rotas, "vendedores": vendedores, "detalhado": dados}

    if is_vendedor:
        if not cod_func:
            return {"rotas": [], "detalhado": []}
        cod_vend = int(cod_func)

        sql = """
            SELECT
                R.CodRota,
                V.CodVendedor
            FROM dbo.AreaVenda V
            INNER JOIN dbo.Funcionario F ON V.CodVendedor = F.CodFuncionario
            INNER JOIN dbo.Rota R ON R.CodAreaVenda = V.CodAreaVenda
            WHERE F.CodFuncionario = ?
              AND R.Ativa = 1
        """
        dados: List[Dict[str, Any]] = query_all(sql, [cod_vend])

        rotas = [int(d["CodRota"]) for d in dados] if dados else []
        return {"rotas": rotas, "vendedores": [cod_vend], "detalhado": dados}

    # Outros papéis (sem filtro)
    return {"rotas": None, "detalhado": []}


def buscar_vendedores_mesma_supervisao(cod_vendedor: int, db_alias: str = "dados_industria") -> List[int]:
    """
    Retorna os CodVendedor que pertencem à mesma Área de Supervisão do 'cod_vendedor' informado (apenas ativos).
    """
    if cod_vendedor is None:
        return []

    cod_vend = int(cod_vendedor)

    sql = """
        WITH Base AS (
            SELECT TOP 1 CodAreaSupervisao
            FROM dbo.AreaVenda
            WHERE CodVendedor = ?
        )
        SELECT DISTINCT V.CodVendedor
        FROM dbo.AreaVenda V
        CROSS JOIN Base B
        WHERE V.CodAreaSupervisao = B.CodAreaSupervisao
          AND V.Ativa = 1
    """
    rows = query_all(sql, [cod_vend])

    # Normaliza para int e remove nulos
    return sorted({int(r["CodVendedor"]) for r in rows if r.get("CodVendedor") is not None})
