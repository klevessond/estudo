from django.shortcuts import render
from django.db import connections
from django.http import JsonResponse
import pandas as pd
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import ObjetivoMensal
from .serializers import ObjetivoMensalSerializer
from datetime import datetime,date
from decimal import Decimal
from collections import defaultdict
from dashboard.services.indicadores.cache_utils import get_cached_data
from rest_framework.decorators import api_view
from django.utils.dateparse import parse_date
from django.contrib.auth import get_user_model
User = get_user_model()
from django.contrib.auth import get_user_model
User = get_user_model()


from dashboard.services.indicadores.objetivos_service import buscar_objetivo_peso_positivacao
from dashboard.services.indicadores.vendas_service import buscar_vendido,buscar_positivacao_por_rota,buscar_venda_mix,buscar_pre_venda,buscar_vendas_por_vendedor
from dashboard.services.indicadores.pdv_service import buscar_vendas_pdv
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

        #  OBJETIVOS
        # Buscar objetivo peso e positivação do SQL Server
        objetivo = buscar_objetivo_peso_positivacao(data_inicio, data_fim)
        objetivo["objetivo_peso"] = round(objetivo.get("objetivo_peso", 0), 2)
        objetivo["objetivo_positivacao"] = round(objetivo.get("objetivo_positivacao", 0), 2)

        # Buscar objetivo financeiro e mix do banco local
        objetivo_mensal_data = get_objetivo_mensal_serializado(request.user, data_inicio)
        objetivo_financeiro = float(objetivo_mensal_data.get("objetivo_financeiro", 0) or 0)
        objetivo_mix = float(objetivo_mensal_data.get("objetivo_mix", 0) or 0)

        objetivo["financeiro"] = round(float(objetivo_financeiro or 0), 2)
        objetivo["objetivo_mix"] = round(float(objetivo_mix or 0), 2)

        #  VENDAS REALIZADAS
        vendido = buscar_vendido(data_inicio, data_fim)
        venda_realizada = vendido.get("venda_realizada", 0)
        venda_realizada = float(vendido.get("venda_realizada", 0))
        peso_realizado = vendido.get("peso_realizado", 0)
        


        print(f"[DEBUG] Venda realizada {venda_realizada}")
        
         #  VENDAS DO MESMO PERÍODO NO ANO ANTERIOR
        ano_anterior_inicio = ajustar_data_para_ano_anterior(data_inicio)
        ano_anterior_fim = ajustar_data_para_ano_anterior(data_fim)
        print(f"[DEBUG] Consultando vendas do ano anterior entre {ano_anterior_inicio} e {ano_anterior_fim}")
        vendido_ano_anterior = buscar_vendido(ano_anterior_inicio, ano_anterior_fim)
        venda_ano_anterior = float(vendido_ano_anterior.get("venda_realizada", 1) or 1)
        venda_ano_anterior = vendido_ano_anterior.get("venda_realizada", 1) or 1  # evita divisão por zero
        
        #  POSITIVAÇÃO
        positivacao = buscar_positivacao_por_rota(data_inicio, data_fim)
        positivacao_realizado_geral = positivacao.get("positivacao_realizado_geral", 0)
        objetivo_positivacao = objetivo.get('objetivo_positivacao', 0)
        percentual_positivacao = safe_divide(positivacao_realizado_geral, objetivo_positivacao) * 100
        variacao_positivacao = positivacao_realizado_geral  - objetivo_positivacao

        #   MIX
        dados_mix = buscar_venda_mix(data_inicio, data_fim)
        mix_realizado = dados_mix["mix_realizado"]
        
        # Pré-venda
        chave = f"prevenda_{data_inicio}_{data_fim}"
        prevenda = get_cached_data(chave, lambda: buscar_pre_venda(data_inicio, data_fim))
        valor_prevenda = prevenda.get("pre_venda_valor", 0)
        valor_alocado = venda_realizada + valor_prevenda
       

        
         # Cálculos de percentual realizado e valor do captado para variação em deficit ou superávit 
        variacao = peso_realizado - objetivo.get("objetivo_peso", 0)
        percentual = safe_divide(peso_realizado, objetivo.get("objetivo_peso", 1)) * 100
        percentual_cobertura = safe_divide(venda_realizada, objetivo_financeiro) * 100
        variacao_financeira = venda_realizada - objetivo_financeiro
        venda_realizada_float = float(venda_realizada)
        venda_ano_anterior_float = float(venda_ano_anterior)
        evolucao_percentual = safe_divide( venda_realizada_float - venda_ano_anterior_float, venda_ano_anterior_float) * 100
        percentual_mix = safe_divide(mix_realizado,objetivo_mix) * 100
        variacao_mix = mix_realizado - objetivo_mix
        percentual_prevenda_alocado = safe_divide(valor_alocado,objetivo_financeiro)*100
        variacao_prevenda = objetivo_financeiro - valor_alocado 

        
       
       
       
        print(f"[DEBUG] venda do ano anterior {venda_ano_anterior}")
        print(f"[DEBUG] percentual {evolucao_percentual}")

        
        
        return Response({
            "objetivo": objetivo,
            "evolucao": {
                "valor_ano_anterior": round(venda_ano_anterior, 2),
                "percentual": round(evolucao_percentual)  # positivo/negativo
            },
            "pre-venda":{
                    "valor_prevenda": round(valor_prevenda,2),
                    "valor_alocado": round(valor_alocado,2),
                    "percentual_prevenda_alocado": round(percentual_prevenda_alocado,2),
                    "variacao_prevenda": round(variacao_prevenda,2)
            },
            "vendas": vendido,
            "realizado_peso": {
                "percentual": round(percentual, 2),
                "variacao": round(variacao, 2),
            },
            "realizado_financeiro": {
                "valor": round(venda_realizada, 2),
                "percentual_cobertura": round(percentual_cobertura, 2),
                "variacao": round(variacao_financeira, 2)
            },
            
             "positivacao":{
                "realizado":positivacao_realizado_geral,
                "percentual": percentual_positivacao,
                "variacao": variacao_positivacao
           },
           "realizado_mix":{
                "realizado":mix_realizado,
                "percentual":percentual_mix,
                "variacao":variacao_mix
           },
            "positivacao_detalhada": positivacao


        })
    

class ObjetivoMensalView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        mes = request.query_params.get('mes')  # Ex: 2024-06
        if not mes:
            return Response({"error": "Informe o parâmetro 'mes'."}, status=400)

        objetivos = ObjetivoMensal.objects.filter(
            usuario=request.user,
            mes_referencia__year=mes.split("-")[0],
            mes_referencia__month=mes.split("-")[1]
        ).first()

        if objetivos:
            return Response(ObjetivoMensalSerializer(objetivos).data)
        return Response({"message": "Sem objetivos cadastrados para este mês."}, status=204)

    def post(self, request):
        data = request.data.copy()
        data['usuario'] = request.user.id  # mantenha o ID aqui
        serializer = ObjetivoMensalSerializer(data=data, context={'request': request})  # adicione o contexto
        if serializer.is_valid():
            objetivo, created = ObjetivoMensal.objects.update_or_create(
                usuario=request.user,
                mes_referencia=data['mes_referencia'],
                defaults={
                    "objetivo_financeiro": data.get('objetivo_financeiro'),
                    "objetivo_mix": data.get('objetivo_mix')
                }
            )
            return Response(ObjetivoMensalSerializer(objetivo).data)
        return Response(serializer.errors, status=400)
    



def safe_divide(numerator, denominator, default=0):
    try:
        numerator = float(numerator)
        denominator = float(denominator)
        if denominator == 0:
            return default
        return numerator / denominator
    except (TypeError, ValueError):
        return default
    


class ObjetivoMensalResumoView(APIView):
    #permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        data_inicio = request.GET.get("de")

        if not data_inicio:
            return Response({"detail": "Parâmetro 'de' (data de início) é obrigatório."}, status=400)

        try:
            data_inicio_formatada = datetime.strptime(data_inicio, "%Y-%m-%d").date()
            mes_referencia = data_inicio_formatada.replace(day=1)
        except ValueError:
            return Response({"detail": "Formato inválido para data de início. Use 'YYYY-MM-DD'."}, status=400)

        try:
            objetivo = ObjetivoMensal.objects.get(usuario=user, mes_referencia=mes_referencia)
            serializer = ObjetivoMensalSerializer(objetivo)
            return Response(serializer.data)
        except ObjetivoMensal.DoesNotExist:
            return Response({"detail": "Objetivo mensal não encontrado."}, status=404)


def get_objetivo_mensal_serializado(user, data_inicio):
    try:
        # Em ambiente de teste, você quer forçar como admin
        if user.is_anonymous:
            user = User.objects.filter(is_superuser=True).first()

        data_inicio_formatada = datetime.strptime(data_inicio, "%Y-%m-%d").date()
        mes_referencia = data_inicio_formatada.replace(day=1)

        objetivo = ObjetivoMensal.objects.get(usuario=user, mes_referencia=mes_referencia)
        serializer = ObjetivoMensalSerializer(objetivo)
        return serializer.data

    except ObjetivoMensal.DoesNotExist:
        return {
            "objetivo_financeiro": 0,
            "objetivo_mix": 0,
        }

def ajustar_data_para_ano_anterior(data_str):
    data_atual = datetime.strptime(data_str, "%Y-%m-%d")
    try:
        return data_atual.replace(year=data_atual.year - 1).strftime("%Y-%m-%d")
    except ValueError:
        # Se o dia não existir (ex: 29/02 em ano não bissexto), ajusta para 28/02
        return data_atual.replace(year=data_atual.year - 1, day=28).strftime("%Y-%m-%d")
    

class IndicadoresPDV(APIView):

    def get(self, request):
        data_inicio = request.GET.get("de")
        data_fim = request.GET.get("ate")
        if not data_inicio or not data_fim:
            return Response({"error": "Parâmetros 'de' e 'ate' são obrigatórios."}, status=400)

        try:
            dados_pdv = buscar_vendas_pdv(data_inicio, data_fim)
            print(f"[DEBUG] Vendas PDV {dados_pdv["valor_pdv"]} e peso {dados_pdv["peso_pdv"]}")
            venda_realizada_PDV= float(dados_pdv["valor_pdv"])
            peso_realizado_PDV = float(dados_pdv["peso_pdv"])
            ano_anterior_inicio_PDV = ajustar_data_para_ano_anterior(data_inicio)
            ano_anterior_fim_PDV = ajustar_data_para_ano_anterior(data_fim)
            dados_pdv_anoanterior = buscar_vendas_pdv(ano_anterior_inicio_PDV, ano_anterior_fim_PDV)

            return Response({"vendas_pdv":{
                            "venda_realizada":venda_realizada_PDV, 
                            "peso_realizado":peso_realizado_PDV,
                            "venda_realizada_ano_anterior":dados_pdv_anoanterior["valor_pdv"],
            }})
        except Exception as e:
            return Response({"error": str(e)}, status=500)
        

class VendasPorVendedorView(APIView):
    def get(self, request):
        data_inicio = request.GET.get("de")
        data_fim = request.GET.get("ate")

        if not data_inicio or not data_fim:
            return Response({"error": "Parâmetros 'de' e 'ate' são obrigatórios."}, status=400)

    
        resultado = buscar_vendas_por_vendedor(data_inicio, data_fim)
        chave = f"prevenda_{data_inicio}_{data_fim}"
        prevenda = get_cached_data(chave, lambda: buscar_pre_venda(data_inicio, data_fim))

        # Agrupar valor de pré-venda por vendedor
        prevenda_por_vendedor = defaultdict(float)
        for item in prevenda.get("detalhado", []):
            cod_vendedor = str(item.get("CodVendedor"))
            valor = float(item.get("Valor", 0))
            prevenda_por_vendedor[cod_vendedor] += valor

        # Inserir valor alocado em cada vendedor do resultado
        for vendedor in resultado.get("vendas_por_vendedor", []):
            codcampo = str(vendedor.get("codcampo")).strip()
            valor_prevenda = prevenda_por_vendedor.get(codcampo, 0)
            vendedor["pre-venda"]=round(valor_prevenda, 2)
            vendedor["alocado"] = round(vendedor.get("ValorLiquido", 0) + valor_prevenda, 2)

        return Response({
            "resultado": resultado,
            
        })