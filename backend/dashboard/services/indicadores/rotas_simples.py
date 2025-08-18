from typing import Dict, Any, List
from django.db import connections

def buscar_rotas_usuario(ctx, db_alias: str = "dados_industria") -> Dict[str, Any]:
    """
    Padrão:
      - with connections['dados_industria'].cursor() as cursor:
      - cursor.execute(f"" DECLARE @... "")
      - columns / rows / daos
      - return { ... }

    Regras:
      - Admin  -> não filtra (rotas=None).
      - Supervisor -> rotas das áreas que supervisiona (S.Ativa=1 e V.Ativa=1).
      - Vendedor   -> rotas das áreas de venda onde ele é o vendedor (R.Ativa=1).  # parte nova

    Precedência (se tiver mais de um papel):
      Admin > Supervisor > Vendedor.  # parte nova
    """
   # ---------------- HIERARQUIA DE PAPÉIS ----------------  # parte nova
    is_admin = bool(getattr(ctx, "is_admin", False))          # parte nova
    is_supervisor = bool(getattr(ctx, "is_supervisor", False))# parte nova
    is_vendedor = bool(getattr(ctx, "is_vendedor", False))    # parte nova
    cod_func = getattr(ctx, "cod_funcionario", None)          # parte nova
    # -------------------------------------------------------  # parte nova

    # Admin -> sem filtro
    if is_admin:  # parte nova
        return {"rotas": None, "detalhado": []}

    # SUPERVISOR tem prioridade sobre vendedor                 # parte nova
    if is_supervisor:  # parte nova
        if not cod_func:
            return {"rotas": [], "detalhado": []}
        cod_sup = int(cod_func)  # sanitiza

        with connections[db_alias].cursor() as cursor:
            cursor.execute(f"""
                DECLARE @CodSupervisor INT = {cod_sup};

                SELECT
                    R.CodRota,
                    R.Rota
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

        codigos = [int(d["CodRota"]) for d in dados] if dados else []
        return {"rotas": codigos, "detalhado": dados}

    # VENDEDOR (só cai aqui se não for supervisor/admin)       # parte nova
    if is_vendedor:  # parte nova
        if not cod_func:
            return {"rotas": [], "detalhado": []}
        cod_vend = int(cod_func)  # sanitiza

        with connections[db_alias].cursor() as cursor:
            cursor.execute(f"""
                DECLARE @CodVendedor INT = {cod_vend};

                SELECT
                    R.CodRota
                FROM dbo.AreaVenda V
                INNER JOIN dbo.Funcionario F ON V.CodVendedor = F.CodFuncionario
                INNER JOIN dbo.Rota R ON R.CodAreaVenda = V.CodAreaVenda
                WHERE F.CodFuncionario = @CodVendedor
                  AND R.Ativa = 1;
            """)
            columns = [col[0] for col in cursor.description]
            rows = cursor.fetchall()
            dados: List[Dict[str, Any]] = [dict(zip(columns, row)) for row in rows]

        codigos = [int(d["CodRota"]) for d in dados] if dados else []
        return {"rotas": codigos, "detalhado": dados}

    # Outros papéis -> por enquanto sem filtro
    return {"rotas": None, "detalhado": []}