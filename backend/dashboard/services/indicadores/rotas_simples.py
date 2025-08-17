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
    # Admin -> sem filtro
    if getattr(ctx, "is_admin", False):
        return {"rotas": None, "detalhado": []}

    # ---------------- SUPERVISOR ----------------
    if getattr(ctx, "is_supervisor", False):
        cod_sup = getattr(ctx, "cod_funcionario", None)
        if not cod_sup:
            return {"rotas": [], "detalhado": []}

        cod_sup = int(cod_sup)  # sanitiza
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

    # ---------------- VENDEDOR ----------------   # parte nova
    if getattr(ctx, "is_vendedor", False):        # parte nova
        cod_vend = getattr(ctx, "cod_funcionario", None)  # parte nova
        if not cod_vend:                                     # parte nova
            return {"rotas": [], "detalhado": []}            # parte nova

        cod_vend = int(cod_vend)  # sanitiza                 # parte nova
        with connections[db_alias].cursor() as cursor:       # parte nova
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
            columns = [col[0] for col in cursor.description]  # parte nova
            rows = cursor.fetchall()                          # parte nova
            dados: List[Dict[str, Any]] = [dict(zip(columns, row)) for row in rows]  # parte nova

        # Aqui a seleção traz só CodRota; mantemos o retorno consistente      # parte nova
        codigos = [int(d["CodRota"]) for d in dados] if dados else []        # parte nova
        return {"rotas": codigos, "detalhado": dados}                         # parte nova

    # Outros papéis -> por enquanto sem filtro
    return {"rotas": None, "detalhado": []}
