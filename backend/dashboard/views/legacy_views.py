"""Rotas antigas de teste/consulta direta ao banco. Movidas de main_views.py.

Candidatas a remoção:
- clientes_top10 e get_dados_excel não têm rota no urls.py (código morto);
- get_dados_sql (dados-sql/) e get_dados_sql_api (api/clientes/) fazem
  SELECT * em cliente com cidade fixa e estão sem autenticação.
"""
import pandas as pd
from django.db import connections
from django.http import JsonResponse

from dashboard.db_conn import query_all


def clientes_top10(request):
    rows = query_all("SELECT TOP 10 name FROM sys.tables")  # ajuste sua consulta
    return JsonResponse({"data": rows})


def get_dados_sql(request):
    with connections['dados_industria'].cursor() as cursor:
        # Sua query SQL aqui
        cursor.execute("""
            SELECT * 
            FROM cliente 
            WHERE CodCidade=%s
        """, [2408102])
        
        # Converter resultado em lista de dicionários
        columns = [col[0] for col in cursor.description]
        rows = cursor.fetchall()
        dados = [dict(zip(columns, row)) for row in rows]
        
    return JsonResponse({'dados': dados})


def get_dados_sql_api(request):
    try:
        with connections['dados_industria'].cursor() as cursor:
            # Sua query SQL aqui
            cursor.execute("""
                SELECT * 
                FROM cliente 
                WHERE CodCidade=%s
            """, [2408102])
            
            # Converter resultado em lista de dicionários
            columns = [col[0] for col in cursor.description]
            rows = cursor.fetchall()
            dados = [dict(zip(columns, row)) for row in rows]
            
        return JsonResponse({'dados': dados, 'status': 'success'})
    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'mensagem': f'Erro ao buscar dados: {str(e)}'
        }, status=500)


def get_dados_excel(request):
    try:
        # Lendo arquivo Excel
        df = pd.read_excel('caminho/do/arquivo.xlsx')
        
        # Convertendo para dicionário
        dados = df.to_dict('records')
        
        return JsonResponse({'dados': dados})
    except Exception as e:
        return JsonResponse({'erro': str(e)}, status=500)
