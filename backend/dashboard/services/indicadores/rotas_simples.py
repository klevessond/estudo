from typing import Dict, Any, List
from django.db import connections

def buscar_rotas_usuario(ctx, db_alias: str = "dados_industria") -> Dict[str, Any]:
    """
    Regras:
      - Admin  -> não filtra (rotas=None).
      - Supervisor -> rotas das áreas que supervisiona (S.Ativa=1 e V.Ativa=1).
      - Vendedor   -> rotas das áreas de venda onde ele é o vendedor (R.Ativa=1).
    """
    # Identificando os papéis do usuário
    is_admin = bool(getattr(ctx, "is_admin", False))          
    is_supervisor = bool(getattr(ctx, "is_supervisor", False))
    is_vendedor = bool(getattr(ctx, "is_vendedor", False))
    cod_func = getattr(ctx, "cod_funcionario", None)

    # Caso seja admin, retorna todas as rotas
    if is_admin:
        return {"rotas": None, "detalhado": []}

    # Caso seja supervisor, buscamos as rotas supervisionadas
    if is_supervisor:
        if not cod_func:
            return {"rotas": [], "detalhado": []}
        cod_sup = int(cod_func)  # sanitiza

        with connections[db_alias].cursor() as cursor:
            cursor.execute(f"""
                DECLARE @CodSupervisor INT = {cod_sup};

                SELECT
                    R.CodRota,
                    R.Rota,
                    V.CodVendedor
                FROM dbo.AreaSupervisao S
                INNER JOIN dbo.AreaVenda V ON S.CodAreaSupervisao = V.CodAreaSupervisao
                INNER JOIN dbo.Rota R ON R.CodAreaVenda = V.CodAreaVenda
                WHERE S.Ativa = 1
                  AND V.Ativa = 1
                  AND S.CodSupervisor = @CodSupervisor;
            """)
            columns = [col[0] for col in cursor.description]
            rows = cursor.fetchall()
            dados: List[Dict[str, Any]] = [dict(zip(columns, row)) for row in rows]

        rotas = [int(d["CodRota"]) for d in dados] if dados else []
        vendedores = sorted(list({int(d["CodVendedor"]) for d in dados if d.get("CodVendedor") is not None}))
        return {"rotas": rotas, 'vendedores': vendedores, "detalhado": dados}

    # Caso seja vendedor, buscamos as rotas associadas ao vendedor
    if is_vendedor:
        if not cod_func:
            return {"rotas": [], "detalhado": []}
        cod_vend = int(cod_func)  # sanitiza

        with connections[db_alias].cursor() as cursor:
            cursor.execute(f"""
                DECLARE @CodVendedor INT = {cod_vend};

                SELECT
                    R.CodRota,
                    V.CodVendedor
                FROM dbo.AreaVenda V
                INNER JOIN dbo.Funcionario F ON V.CodVendedor = F.CodFuncionario
                INNER JOIN dbo.Rota R ON R.CodAreaVenda = V.CodAreaVenda
                WHERE F.CodFuncionario = @CodVendedor
                  AND R.Ativa = 1;
            """)
            columns = [col[0] for col in cursor.description]
            rows = cursor.fetchall()
            dados: List[Dict[str, Any]] = [dict(zip(columns, row)) for row in rows]

        rotas = [int(d["CodRota"]) for d in dados] if dados else []
        return {"rotas": rotas, 'vendedores': [cod_vend], "detalhado": dados}

    # Para outros papéis (sem filtro)
    return {"rotas": None, "detalhado": []}


def buscar_vendedores_mesma_supervisao(cod_vendedor: int, db_alias: str = "dados_industria") -> List[int]:
    """
    Retorna os CodVendedor que pertencem à mesma Área de Supervisão do 'cod_vendedor' informado (apenas ativos).
    """
    if cod_vendedor is None:
        return []

    cod_vend = int(cod_vendedor)

    with connections[db_alias].cursor() as cursor:
        cursor.execute(
            """
            WITH Base AS (
                SELECT TOP 1 CodAreaSupervisao
                FROM dbo.AreaVenda
                WHERE CodVendedor = %s
            )
            SELECT DISTINCT V.CodVendedor
            FROM dbo.AreaVenda V
            CROSS JOIN Base B
            WHERE V.CodAreaSupervisao = B.CodAreaSupervisao
              AND V.Ativa = 1;
            """,
            [cod_vend],
        )
        rows = cursor.fetchall()

    # Normaliza para int e remove nulos
    vendedores = sorted({int(r[0]) for r in rows if r and r[0] is not None})
    return vendedores