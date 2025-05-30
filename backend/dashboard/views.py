from django.shortcuts import render
from django.db import connections
from django.http import JsonResponse
import pandas as pd
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated


from dashboard.services.indicadores.objetivos_service import buscar_objetivo
from dashboard.services.indicadores.vendas_service import buscar_vendido
from dashboard.services.indicadores.vendas_service import buscar_positivacao_por_rota

# Create your views here.

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

class IndicadoresView(APIView):
    #permission_classes = [IsAuthenticated]
    def get(self, request):
        data_inicio = request.GET.get('de')
        data_fim = request.GET.get('ate')

        if not data_inicio or not data_fim:
            return Response({"error": "Parâmetros 'de' e 'ate' são obrigatórios."}, status=400)

        objetivo = buscar_objetivo(data_inicio, data_fim)
        vendido = buscar_vendido(data_inicio, data_fim)
        positivacao_detalhada = buscar_positivacao_por_rota(data_inicio, data_fim)

         # Cálculos de percentual realizado e valor do captado para variação em deficit ou superávit 
        variacao = vendido.get("peso_realizado", 0) - objetivo.get("objetivo_peso", 0)
        percentual = (vendido.get("peso_realizado", 0) / objetivo.get("objetivo_peso", 1)) * 100

        positivacao_realizado_geral = (
            positivacao_detalhada[0].get("ClientesPositivadosEmpresa", 0)
            if positivacao_detalhada else 0
        )
        objetivo_positivacao = objetivo.get('objetivo_positivacao', 0)
        
        percentual_positivacao = (
                positivacao_realizado_geral / objetivo_positivacao * 100
                if objetivo_positivacao else 0
            )
        variacao_positivacao = positivacao_detalhada[0].get("ClientesPositivadosEmpresa", 0) - objetivo_positivacao

        return Response({
            "objetivo": objetivo,
            "vendas": vendido,
            "realizado_peso": {
                "percentual": round(percentual, 2),
                "variacao": round(variacao, 2),
                
            },
            "positivacao_detalhada": positivacao_detalhada,
            "positivacao":{
                "realizado":positivacao_realizado_geral,
                "percentual": percentual_positivacao,
                "variacao": variacao_positivacao


            }
        })