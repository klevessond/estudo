from django.db import connections
from datetime import datetime, timedelta, date


def Todos_Vendedores():
    with connections['dados_industria'].cursor() as cursor:
        cursor.execute("""
            select CodFuncionario, Nome 
            from Funcionario 
            where Vendedor=1 and ativo=1
        """)
        columns = [col[0] for col in cursor.description]
        rows = cursor.fetchall()
        dados = [dict(zip(columns, row)) for row in rows]

    return {
        "detalhamento": dados
    }