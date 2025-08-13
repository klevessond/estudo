# dashboard/services/indicadores/rotas_simples.py
from typing import Dict, Any, List, Optional
from django.db import connections

def buscar_rotas_usuario(ctx, db_alias: str = "dados_industria") -> Dict[str, Any]:
    """
    Segue o padrão dos seus services:
      - nome da função, parâmetros
      - with connections['dados_industria'].cursor() as cursor:
      - cursor.execute(f"" DECLARE @... "")
      - columns / rows / dados
      - return { ... }

    Regras atuais:
      - Supervisor: retorna lista de códigos de rota que pertencem às suas áreas (S.Ativa=1 e V.Ativa=1).
      - Admin e demais papéis: por enquanto não filtra -> retorna rotas=None.
    """
    # Admin ou não-supervisor -> ainda não filtra
    if getattr(ctx, "is_admin", False) or not getattr(ctx, "is_supervisor", False):
        return {"rotas": None, "detalhado": []}

    # precisa do cod_funcionario para montar o filtro
    cod_sup = getattr(ctx, "cod_funcionario", None)
    if not cod_sup:
        return {"rotas": [], "detalhado": []}

    # simples sanitização/validação (evita injeção ao interpolar)
    cod_sup = int(cod_sup)

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

    # apenas os códigos (o que você quer usar no filtro)
    codigos = [int(d["CodRota"]) for d in dados] if dados else []

    # mantém o padrão de retornar um dict
    return {
        "rotas": codigos,   # <- use isso no WHERE IN (...)
        "detalhado": dados  # opcional, útil para debug/inspeção
    }
