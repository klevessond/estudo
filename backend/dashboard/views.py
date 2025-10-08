from django.shortcuts import render
from django.db import connections
from django.http import JsonResponse
from django.db import transaction
import pandas as pd
from django.db.models import Sum
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import ObjetivoMensal,ObjetivoMensalVendedor
from .serializers import ObjetivoMensalSerializer, CustomUserSerializer,MeSerializer
from datetime import datetime,date
from decimal import Decimal
from collections import defaultdict
from dashboard.services.indicadores.cache_utils import get_cached_data
from django.utils.dateparse import parse_date
from django.contrib.auth import get_user_model
from django.contrib.auth.models import User
from rest_framework.decorators import api_view, permission_classes
User = get_user_model()
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from rest_framework.validators import UniqueValidator
from rest_framework import status
from rest_framework.permissions import IsAdminUser
from .models import Profile
from dashboard.services.usuarios.funcionario_service import listar_funcionarios,get_funcionario_por_codigo
import logging
from dashboard.roles import get_role_context  
from dashboard.services.indicadores.info_service import Todos_Vendedores
from dashboard.services.indicadores.ruptura_service import buscar_ruptura
from dashboard.db_conn import query_all

logger = logging.getLogger(__name__)






from dashboard.services.indicadores.objetivos_service import buscar_objetivo_peso_positivacao
from dashboard.services.indicadores.vendas_service import buscar_vendido,buscar_positivacao_por_rota,buscar_venda_mix,buscar_pre_venda,buscar_vendas_por_vendedor,buscar_resumo_segmento_area_venda
from dashboard.services.indicadores.pdv_service import buscar_vendas_pdv
from dashboard.services.indicadores.rotas_simples import buscar_rotas_usuario, buscar_vendedores_mesma_supervisao
# Create your views here.



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

class MinhasRotasSupervisorView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        ctx = get_role_context(request.user)
        info = buscar_rotas_usuario(ctx)  # <- CORRETO
        rotas = info.get("rotas") if info else None
        return Response({
            "papel": "supervisor" if ctx.is_supervisor else ("admin" if ctx.is_admin else "outro"),
            "cod_funcionario": ctx.cod_funcionario,
            "rotas": rotas if rotas is not None else "sem_filtro"
        })



def _to_int_list(seq):
    out = []
    for v in (seq or []):
        try:
            out.append(int(str(v).strip()))
        except (TypeError, ValueError):
            pass
    return out


class IndicadoresView(APIView):
    
    #permission_classes = [IsAuthenticated]
    def get(self, request):
        data_inicio = request.GET.get('de')
        data_fim = request.GET.get('ate')
        
        if not data_inicio or not data_fim:
            return Response({"error": "Parâmetros 'de' e 'ate' são obrigatórios."}, status=400)

        # ===== LOG DO PERFIL QUE ESTÁ FAZENDO A CHAMADA =====
        ctx = get_role_context(request.user)
        logger.info(
            "[IndicadoresView] user=%s id=%s roles=%s cod_funcionario=%s cod_unid_gestora=%s de=%s ate=%s ip=%s",
            getattr(request.user, "username", None),
            getattr(request.user, "id", None),
            ",".join(ctx.roles) if ctx.roles else "-",
            ctx.cod_funcionario,
            ctx.cod_unid_gestora,
            data_inicio,
            data_fim,
            request.META.get("REMOTE_ADDR"),
        )
        # ====================================================

        # 1) Rotas / vendedores conforme papel
        rotas_info = buscar_rotas_usuario(ctx)  # -> {'rotas': None|[...], 'detalhado': [...], 'vendedores': [...]}
        rotas_codigos = rotas_info.get("rotas") if rotas_info else None

        # 🔧 Se for VENDEDOR, usar a lista da MESMA SUPERVISÃO
        if ctx.is_vendedor:
            try:
                vendedores = buscar_vendedores_mesma_supervisao(ctx.cod_funcionario) or [int(ctx.cod_funcionario)]
            except Exception:
                vendedores = [int(ctx.cod_funcionario)] if ctx.cod_funcionario else None
        else:
            # supervisor/admin mantém a lista vinda de rotas (ou None = sem filtro)
            vendedores = rotas_info.get("vendedores") if rotas_info else None

        logger.debug(f"[IndicadoresView] vendedores considerados para escopo: {vendedores}")

        #  OBJETIVOS — tudo do SQLite agora
        objetivo_mensal_data = get_objetivo_mensal_serializado(
            request.user, data_inicio, cod_vendedores=vendedores
        )

        objetivo = {
            "financeiro":           round(float(objetivo_mensal_data.get("objetivo_financeiro") or 0), 2),
            "objetivo_mix":         round(float(objetivo_mensal_data.get("objetivo_mix") or 0), 2),
            "objetivo_peso":        round(float(objetivo_mensal_data.get("objetivo_peso") or 0), 2),
            "objetivo_positivacao": round(float(objetivo_mensal_data.get("objetivo_positivacao") or 0), 2),
        }
        objetivos_vendedores = get_objetivos_vendedores_por_mes(data_inicio)

        # variáveis locais
        objetivo_financeiro   = objetivo["financeiro"]
        objetivo_mix          = objetivo["objetivo_mix"]
        objetivo_peso         = objetivo["objetivo_peso"]
        objetivo_positivacao  = objetivo["objetivo_positivacao"]

        # helpers p/ tipos
        def _to_int(v):
            try:
                return int(str(v).strip())
            except (TypeError, ValueError):
                return None

        def _to_float(v):
            try:
                return float(v or 0)
            except (TypeError, ValueError):
                return 0.0

        # lista/set de vendedores p/ filtro
        vendedores_list = vendedores or []
        vendedores_set = { _to_int(v) for v in vendedores_list if _to_int(v) is not None }

        # =========================
        # VENDAS REALIZADAS (ÁREA)
        # =========================
        vendido = buscar_vendas_por_vendedor(data_inicio, data_fim)
        lista = vendido.get("vendas_por_vendedor", []) or []

        # filtra por vendedores quando houver lista (admin sem filtro mantém todos)
        if vendedores_set:
            lista = [it for it in lista if _to_int(it.get("codcampo")) in vendedores_set]

        # somatórios
        venda_realizada = sum(_to_float(it.get("ValorLiquido")) for it in lista)
        peso_realizado  = sum(_to_float(it.get("PesoTotal"))    for it in lista)

        # ===========================================
        # VENDAS DO MESMO PERÍODO NO ANO ANTERIOR
        # ===========================================
        ano_anterior_inicio = ajustar_data_para_ano_anterior(data_inicio)
        ano_anterior_fim    = ajustar_data_para_ano_anterior(data_fim)

        res_aa  = buscar_vendas_por_vendedor(ano_anterior_inicio, ano_anterior_fim)
        lista_aa = res_aa.get("vendas_por_vendedor", []) or []
        if vendedores_set:
            lista_aa = [it for it in lista_aa if _to_int(it.get("codcampo")) in vendedores_set]

        venda_ano_anterior = sum(_to_float(it.get("ValorLiquido")) for it in lista_aa) or 1.0  # evita div/0
        
        #  POSITIVAÇÃO (área)
        positivacao = buscar_positivacao_por_rota(data_inicio, data_fim, rotas=rotas_codigos, cod_vendedores=vendedores)
        positivacao_realizado_geral = positivacao.get("positivacao_realizado_geral", 0)
        objetivo_positivacao = objetivo.get('objetivo_positivacao', 0)
        percentual_positivacao = safe_divide(positivacao_realizado_geral, objetivo_positivacao) * 100
        variacao_positivacao = positivacao_realizado_geral  - objetivo_positivacao

        # MIX (área)
        dados_mix = buscar_venda_mix(data_inicio, data_fim, cod_vendedores=vendedores)
        mix_realizado = dados_mix["mix_realizado"]
        
        # Pré-venda (área)
        prevenda = buscar_pre_venda(data_inicio, data_fim, cod_vendedores=vendedores)
        valor_prevenda = prevenda.get("pre_venda_valor", 0)
        valor_alocado = venda_realizada + valor_prevenda

        # KPIs (área)
        variacao = peso_realizado - objetivo.get("objetivo_peso", 0)
        percentual = safe_divide(peso_realizado, objetivo.get("objetivo_peso", 1)) * 100
        percentual_cobertura = safe_divide(venda_realizada, objetivo_financeiro) * 100
        variacao_financeira = venda_realizada - objetivo_financeiro
        venda_realizada_float = float(venda_realizada)
        venda_ano_anterior_float = float(venda_ano_anterior)
        evolucao_percentual = safe_divide(venda_realizada_float - venda_ano_anterior_float, venda_ano_anterior_float) * 100
        percentual_mix = safe_divide(mix_realizado, objetivo_mix) * 100
        variacao_mix = mix_realizado - objetivo_mix
        percentual_prevenda_alocado = safe_divide(valor_alocado, objetivo_financeiro) * 100
        variacao_prevenda = valor_alocado - objetivo_financeiro

        # === RUPTURA (Captado) (área) ===
        vendedores_list_int = _to_int_list(vendedores)
        if not vendedores_list_int:
            ruptura_dados = buscar_ruptura(data_inicio, data_fim, cod_vendedor=None, cod_vendedores=None)
        elif len(vendedores_list_int) == 1:
            ruptura_dados = buscar_ruptura(data_inicio, data_fim, cod_vendedor=vendedores_list_int[0], cod_vendedores=None)
        else:
            ruptura_dados = buscar_ruptura(data_inicio, data_fim, cod_vendedor=None, cod_vendedores=vendedores_list_int)

        ruptura_total = 0.0
        for r in (ruptura_dados.get("resumo") or []):
            ruptura_total += float(r.get("TotalValor") or 0)
        ruptura_total = round(ruptura_total, 2)
        percentual_captado = round(safe_divide(ruptura_total, venda_realizada) * 100, 2)

        # ========= NOVO: BLOCO "minha_visao" (vendedor logado) =========
        minha_visao = None
        try:
            meu_cod = _to_int(ctx.cod_funcionario)
            # linha de venda do meu vendedor
            minha_linha = None
            for it in lista:
                if _to_int(it.get("codcampo")) == meu_cod:
                    minha_linha = it
                    break

            # objetivos do meu vendedor
            obj_meu = None
            for o in objetivos_vendedores or []:
                if str(o.get("vendedor_id")) == str(meu_cod):
                    obj_meu = o
                    break

            if minha_linha or obj_meu:
                my_venda = _to_float((minha_linha or {}).get("ValorLiquido"))
                my_peso  = _to_float((minha_linha or {}).get("PesoTotal"))
                my_mix   = _to_float((minha_linha or {}).get("Mix"))

                my_obj_fin  = _to_float((obj_meu or {}).get("objetivo_financeiro"))
                my_obj_peso = _to_float((obj_meu or {}).get("objetivo_peso"))
                my_obj_mix  = _to_float((obj_meu or {}).get("objetivo_mix"))
                my_obj_pos  = _to_float((obj_meu or {}).get("objetivo_positivacao"))

                minha_visao = {
                    "cod_funcionario": meu_cod,
                    "colaborador": (minha_linha or {}).get("Campo"),
                    "realizado_financeiro": round(my_venda, 2),
                    "realizado_peso": round(my_peso, 2),
                    "mix_realizado": round(my_mix, 2),
                    "objetivo_financeiro": round(my_obj_fin, 2),
                    "objetivo_peso": round(my_obj_peso, 2),
                    "objetivo_mix": round(my_obj_mix, 2),
                    "objetivo_positivacao": round(my_obj_pos, 2),
                    "percentual_cobertura": round(safe_divide(my_venda, my_obj_fin) * 100, 2) if my_obj_fin else 0.0,
                    "variacao_financeira": round(my_venda - my_obj_fin, 2),
                    "percentual_peso": round(safe_divide(my_peso, my_obj_peso) * 100, 2) if my_obj_peso else 0.0,
                    "variacao_peso": round(my_peso - my_obj_peso, 2),
                    "percentual_mix": round(safe_divide(my_mix, my_obj_mix) * 100, 2) if my_obj_mix else 0.0,
                    "variacao_mix": round(my_mix - my_obj_mix, 2),
                }
        except Exception as e:
            logger.exception(f"[IndicadoresView][minha_visao] erro ao montar: {e}")
            minha_visao = None

        # garante que o payload de vendas vá FILTRADO
        vendido["vendas_por_vendedor"] = lista

        return Response({
            "objetivo": objetivo,
            "objetivos_vendedores": objetivos_vendedores,
            "evolucao": {
                "valor_ano_anterior": round(venda_ano_anterior, 2),
                "percentual": round(evolucao_percentual)  # positivo/negativo
            },
            "pre-venda": {
                "valor_prevenda": round(valor_prevenda, 2),
                "valor_alocado": round(valor_alocado, 2),
                "percentual_prevenda_alocado": round(percentual_prevenda_alocado, 2),
                "variacao_prevenda": round(variacao_prevenda, 2)
            },
            "vendas": vendido,  # já com 'vendas_por_vendedor' filtrado
            "realizado_peso": {
                "realizado": round(peso_realizado, 2),  
                "percentual": round(percentual, 2),
                "variacao": round(variacao, 2),
            },
            "realizado_financeiro": {
                "valor": round(venda_realizada, 2),
                "percentual_cobertura": round(percentual_cobertura, 2),
                "variacao": round(variacao_financeira, 2)
            },
            "positivacao": {
                "realizado": positivacao_realizado_geral,
                "percentual": percentual_positivacao,
                "variacao": variacao_positivacao
            },
            "realizado_mix": {
                "realizado": mix_realizado,
                "percentual": percentual_mix,
                "variacao": variacao_mix
            },
            "positivacao_detalhada": positivacao,
            "ruptura": {
                "total_valor": ruptura_total,
                "percentual_captado": percentual_captado
            },
            # ===== NOVO: KPIs do vendedor logado =====
            "minha_visao": minha_visao,
        })


    

class ObjetivoMensalView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        mes = request.query_params.get('mes')
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
        data['usuario'] = request.user.id
        serializer = ObjetivoMensalSerializer(data=data, context={'request': request})
        if serializer.is_valid():
            print(
                f"[DEBUG][OBJETIVO_MENSAL][IN] usuario={request.user.id}, mes={data.get('mes_referencia')}, "
                f"financeiro={data.get('objetivo_financeiro')}, mix={data.get('objetivo_mix')}, "
                f"peso={data.get('objetivo_peso')}, pos={data.get('objetivo_positivacao')}"
            )

            objetivo, created = ObjetivoMensal.objects.update_or_create(
                usuario=request.user,
                mes_referencia=data['mes_referencia'],
                defaults={
                    "objetivo_financeiro": data.get('objetivo_financeiro'),
                    "objetivo_mix": data.get('objetivo_mix'),
                    "objetivo_peso": data.get('objetivo_peso'),               # 🆕
                    "objetivo_positivacao": data.get('objetivo_positivacao') # 🆕
                }
            )

            print(
                f"[DEBUG][OBJETIVO_MENSAL][OUT] created={created}, "
                f"financeiro={objetivo.objetivo_financeiro}, mix={objetivo.objetivo_mix}, "
                f"peso={objetivo.objetivo_peso}, pos={objetivo.objetivo_positivacao}"
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


def get_objetivo_mensal_serializado(user, data_inicio, cod_vendedores=None):
    try:
        # Em ambiente de teste, você quer forçar como admin
        if user.is_anonymous:
            user = User.objects.filter(is_superuser=True).first()

        data_inicio_formatada = datetime.strptime(data_inicio, "%Y-%m-%d").date()
        mes_referencia = data_inicio_formatada.replace(day=1)

        # Se veio lista de vendedores, somar objetivos dos vendedores no mês (SQLite)
        if cod_vendedores:
            ids = [str(v) for v in cod_vendedores]  # vendedor_id é CharField
            agg = ObjetivoMensalVendedor.objects.filter(
                mes_referencia=mes_referencia,
                vendedor_id__in=ids
            ).aggregate(
                objetivo_financeiro=Sum('objetivo_financeiro'),
                objetivo_mix=Sum('objetivo_mix'),
                objetivo_peso=Sum('objetivo_peso'),                       # 🆕
                objetivo_positivacao=Sum('objetivo_positivacao'),         # 🆕
            )
            return {
                "objetivo_financeiro": float(agg.get('objetivo_financeiro') or 0),
                "objetivo_mix": float(agg.get('objetivo_mix') or 0),
                "objetivo_peso": float(agg.get('objetivo_peso') or 0),                     # 🆕
                "objetivo_positivacao": float(agg.get('objetivo_positivacao') or 0),       # 🆕
            }

        # Fallback: objetivo mensal do usuário no SQLite
        objetivo = ObjetivoMensal.objects.get(usuario=user, mes_referencia=mes_referencia)
        serializer = ObjetivoMensalSerializer(objetivo)
        return serializer.data

    except ObjetivoMensal.DoesNotExist:
        return {
            "objetivo_financeiro": 0,
            "objetivo_mix": 0,
            "objetivo_peso": 0,             # 🆕
            "objetivo_positivacao": 0,      # 🆕
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
            print(f"[DEBUG] Vendas PDV {dados_pdv['valor_pdv']} e peso {dados_pdv['peso_pdv']}")
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

        # === NOVO: capturar papel/rotas e lista de vendedores exatamente como na IndicadoresView ===
        ctx = get_role_context(request.user)
        rotas_info = buscar_rotas_usuario(ctx)
        vendedores = rotas_info.get("vendedores") if rotas_info else None  # mesmo ponto da IndicadoresView
        if ctx.is_vendedor:
             vendedores = buscar_vendedores_mesma_supervisao(ctx.cod_funcionario)
             print(f"[DEBUG] outros vendedores da mesma supervisao {vendedores}")

        # helper robusto para int
        def to_int(v):
            try:
                return int(str(v).strip())
            except (TypeError, ValueError):
                return None

        vendedores_set = set(to_int(v) for v in (vendedores or []) if to_int(v) is not None)

        # Busca original
        resultado = buscar_vendas_por_vendedor(data_inicio, data_fim)

        # Se tivermos lista de vendedores, filtra "vendas_por_vendedor" por codcampo ∈ vendedores_set
        lista = resultado.get("vendas_por_vendedor", [])
        if vendedores_set:
            lista = [item for item in lista if to_int(item.get("codcampo")) in vendedores_set]
            resultado["vendas_por_vendedor"] = lista

        # Pré-venda: padroniza as chaves para int e aplica nos mesmos codigos
        chave = f"prevenda_{data_inicio}_{data_fim}"
        prevenda = get_cached_data(chave, lambda: buscar_pre_venda(data_inicio, data_fim))

        prevenda_por_vendedor = defaultdict(float)
        for item in prevenda.get("detalhado", []):
            cod_vend = to_int(item.get("CodVendedor"))
            if cod_vend is None:
                continue
            valor = float(item.get("Valor", 0) or 0)
            prevenda_por_vendedor[cod_vend] += valor

        # Inserir valor alocado em cada vendedor (agora tudo em int)
        for vendedor in resultado.get("vendas_por_vendedor", []):
            codcampo_int = to_int(vendedor.get("codcampo"))
            valor_prevenda = prevenda_por_vendedor.get(codcampo_int, 0.0)
            vendedor["pre-venda"] = round(valor_prevenda, 2)
            vendedor["alocado"] = round(float(vendedor.get("ValorLiquido", 0) or 0) + valor_prevenda, 2)

        return Response({"resultado": resultado})

class ObjetivoMensalVendedorView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Espera: /objetivos-vendedores/?mes_referencia=YYYY-MM-01
        mes = request.query_params.get('mes_referencia')
        if not mes:
            return Response({"error": "Informe o parâmetro 'mes_referencia' no formato YYYY-MM-01."}, status=400)

        objetivos = ObjetivoMensalVendedor.objects.filter(mes_referencia=mes)

        resultado = []
        for obj in objetivos:
            resultado.append({
                "vendedor_id": obj.vendedor_id,
                "nome_vendedor": obj.nome_vendedor,
                "objetivo_financeiro": float(obj.objetivo_financeiro or 0),
                "objetivo_mix": float(obj.objetivo_mix or 0),
                "objetivo_peso": float(getattr(obj, "objetivo_peso", 0) or 0),             # 🆕
                "objetivo_positivacao": int(getattr(obj, "objetivo_positivacao", 0) or 0), # 🆕
            })
        return Response({"objetivos": resultado})

    def post(self, request):
        """
        Payload:
        {
          "mes_referencia": "YYYY-MM-01",
          "objetivos": [
            {
              "vendedor_id": 23,
              "nome_vendedor": "Fulano",
              "objetivo_financeiro": 12345.67,
              "objetivo_mix": 50,
              "objetivo_peso": 1000.50,        # 🆕 kg
              "objetivo_positivacao": 120      # 🆕 clientes
            }
          ]
        }
        """
        data = request.data
        mes_referencia = data.get("mes_referencia")
        objetivos = data.get("objetivos", [])

        if not mes_referencia or not isinstance(objetivos, list):
            return Response({"error": "Envie 'mes_referencia' e a lista 'objetivos'."}, status=400)

        total_empresa_fin = 0.0
        total_empresa_mix = 0.0
        total_empresa_peso = 0.0   # 🆕
        total_empresa_pos = 0      # 🆕

        with transaction.atomic():
            for obj in objetivos:
                vendedor_id = obj.get("vendedor_id")
                nome = obj.get("nome_vendedor", "")

                # Conversões seguras mantendo a lógica
                valor_fin = float(obj.get("objetivo_financeiro", 0) or 0)
                valor_mix = float(obj.get("objetivo_mix", 0) or 0)
                valor_peso = float(obj.get("objetivo_peso", 0) or 0)          # 🆕
                valor_pos = int(obj.get("objetivo_positivacao", 0) or 0)      # 🆕

                total_empresa_fin += valor_fin
                total_empresa_mix += valor_mix
                total_empresa_peso += valor_peso
                total_empresa_pos += valor_pos

                print(
                    f"[DEBUG][OBJ-VEND ITEM] vendedor_id={vendedor_id}, nome={nome}, "
                    f"financeiro={valor_fin}, mix={valor_mix}, peso={valor_peso}, pos={valor_pos}"
                )

                ObjetivoMensalVendedor.objects.update_or_create(
                    mes_referencia=mes_referencia,
                    vendedor_id=str(vendedor_id),
                    defaults={
                        "nome_vendedor": nome,
                        "objetivo_financeiro": valor_fin,
                        "objetivo_mix": valor_mix,
                        "objetivo_peso": valor_peso,             # 🆕
                        "objetivo_positivacao": valor_pos,       # 🆕
                    }
                )

            # Atualiza o total da empresa no modelo consolidado
            ObjetivoMensal.objects.update_or_create(
                usuario=request.user,
                mes_referencia=mes_referencia,
                defaults={
                    "objetivo_financeiro": total_empresa_fin,
                    "objetivo_mix": total_empresa_mix,
                    "objetivo_peso": total_empresa_peso,         # 🆕
                    "objetivo_positivacao": total_empresa_pos,   # 🆕
                }
            )

        print(
            f"[DEBUG][OBJETIVO_MENSAL][TOTAL] usuario={request.user.id}, mes={mes_referencia}, "
            f"fin={total_empresa_fin}, mix={total_empresa_mix}, peso={total_empresa_peso}, pos={total_empresa_pos}"
        )
        return Response({"message": "Objetivos cadastrados com sucesso."})
    


def get_objetivos_vendedores_por_mes(data_inicio):
    # Extrai o mês no formato YYYY-MM
    mes_referencia = data_inicio

    objetivos = ObjetivoMensalVendedor.objects.filter(mes_referencia=mes_referencia)
    resultado = []
    for obj in objetivos:
        resultado.append({
            "vendedor_id": obj.vendedor_id,
            "nome_vendedor": obj.nome_vendedor,
            "objetivo_financeiro": float(obj.objetivo_financeiro),
            "objetivo_mix": float(obj.objetivo_mix),
            "objetivo_peso": float(getattr(obj, "objetivo_peso", 0) or 0),                
            "objetivo_positivacao": int(getattr(obj, "objetivo_positivacao", 0) or 0),     
        })
    return resultado

class UserRegisterSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
        required=True,
        validators=[UniqueValidator(queryset=User.objects.all())]
    )
    password = serializers.CharField(
        write_only=True, required=True, validators=[validate_password]
    )
    password2 = serializers.CharField(write_only=True, required=True)
    phone = serializers.CharField(required=True, max_length=20)
    # Campos do funcionário
    cod_funcionario = serializers.IntegerField(required=True)
    cod_unid_gestora = serializers.IntegerField(required=True)
    entregador = serializers.BooleanField(required=True)
    supervisor = serializers.BooleanField(required=True)
    transportador = serializers.BooleanField(required=True)
    transportador_aux = serializers.BooleanField(required=True)
    vendedor = serializers.BooleanField(required=True)
    cobrador = serializers.BooleanField(required=True)
    
    class Meta:
        model = User
        fields = (
            'username', 'password', 'password2', 'email',
            'first_name', 'last_name', 'phone',
            'cod_funcionario', 'cod_unid_gestora',
            'entregador', 'supervisor', 'transportador',
            'transportador_aux', 'vendedor', 'cobrador'
        )
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True},
            'phone': {'required': True},
            'cod_funcionario': {'required': True},
            'cod_unid_gestora': {'required': True},
            'entregador': {'required': True},
            'supervisor': {'required': True},
            'transportador': {'required': True},
            'transportador_aux': {'required': True},
            'vendedor': {'required': True},
            'cobrador': {'required': True}
        }

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "As senhas não coincidem."})
        return attrs

    def create(self, validated_data):
        print("dados de cadastro",validated_data)
        phone = validated_data.pop('phone')
        cod_funcionario = validated_data.pop('cod_funcionario')
        cod_unid_gestora = validated_data.pop('cod_unid_gestora')
        entregador = validated_data.pop('entregador')
        supervisor = validated_data.pop('supervisor')
        transportador = validated_data.pop('transportador')
        transportador_aux = validated_data.pop('transportador_aux')
        vendedor = validated_data.pop('vendedor')
        cobrador = validated_data.pop('cobrador')
        user = User.objects.create(
            username=validated_data['username'],
            email=validated_data['email'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name']
        )
        user.set_password(validated_data['password'])
        user.save()
        profile, created = Profile.objects.get_or_create(user=user)
        profile.phone = phone
        profile.cod_funcionario = cod_funcionario
        profile.cod_unid_gestora = cod_unid_gestora
        profile.entregador = entregador
        profile.supervisor = supervisor
        profile.transportador = transportador
        profile.transportador_aux = transportador_aux
        profile.vendedor = vendedor
        profile.cobrador = cobrador
        profile.save()
        return user

class RegisterView(APIView):
    #permission_classes = [IsAdminUser]
    def post(self, request):
        serializer = UserRegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "Usuário registrado com sucesso!"},
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class FuncionariosListView(APIView):
    def get(self, request):
        search = request.query_params.get('search', '')
        funcionarios = listar_funcionarios(search=search)
        users = User.objects.filter(username__icontains=search).values(
            'id', 'username', 'first_name', 'last_name', 'email', 'is_active', 'is_staff'
        )
        return Response({
            "funcionarios_sql": funcionarios,
            "usuarios_django": list(users)
            })

class UsuarioDetailView(APIView):
    def get(self, request, user_id):
        try:
            usuario = User.objects.get(pk=user_id)
            serializer = CustomUserSerializer(usuario)
            return Response(serializer.data)
        except User.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

    def put(self, request, user_id):
        try:
            usuario = User.objects.get(pk=user_id)
            serializer = CustomUserSerializer(usuario, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except User.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

def funcionario_detail(request, cod_funcionario):
    if request.method == 'GET':
        funcionario = get_funcionario_por_codigo(cod_funcionario)
        if funcionario:
            return JsonResponse(funcionario, safe=False)
        else:
            return JsonResponse({'error': 'Funcionário não encontrado'}, status=404)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me(request):
    return Response(MeSerializer(request.user).data)

class TodosVendedoresView(APIView):
    #permission_classes = [IsAuthenticated]  # opcional, se você quiser autenticação

    def get(self, request):
        # Chama o serviço que busca todos os vendedores
        vendedores = Todos_Vendedores()
        
        # Retorna o JSON já com a chave 'resultado' (ou qualquer chave que seu frontend espera)
        return Response(vendedores)

class RupturaView(APIView):
    # permission_classes = [IsAuthenticated]  # habilite se quiser proteger
    def get(self, request):
        de = request.GET.get("de")
        ate = request.GET.get("ate")
        cod_vendedor = request.GET.get("cod_vendedor")  # opcional

        if not de or not ate:
            return Response({"error": "Parâmetros 'de' e 'ate' são obrigatórios."}, status=400)

        try:
            dados = buscar_ruptura(de, ate, cod_vendedor=cod_vendedor)
            return Response({"ruptura": dados})
        except Exception as e:
            return Response({"error": str(e)}, status=500)
    

class ResumoSegmentoAreaVendaView(APIView):
    # permission_classes = [IsAuthenticated]

    def get(self, request):
        de = request.GET.get("de")
        ate = request.GET.get("ate")
        cods = request.GET.get("cod_funcionarios")  # opcional: "23,45,209"

        if not de or not ate:
            return Response({"error": "Parâmetros 'de' e 'ate' são obrigatórios."}, status=400)

        def _to_int_list_from_csv(s: str | None):
            out = []
            if not s:
                return out
            for part in s.split(","):
                part = part.strip()
                if not part:
                    continue
                try:
                    out.append(int(part))
                except ValueError:
                    pass
            # únicos e ordenados
            return sorted(set(out))

        # 1) Se o cliente passou a lista via querystring, usamos ela
        cod_func_list = _to_int_list_from_csv(cods)

        # 2) Senão, decidimos conforme o papel do usuário
        if not cod_func_list:
            ctx = get_role_context(request.user)

            if getattr(ctx, "is_supervisor", False):
                # igual ao IndicadoresView: pega vendedores das rotas do supervisor
                rotas_info = buscar_rotas_usuario(ctx)  # {'rotas': [...], 'vendedores': [...], ...}
                vendedores = rotas_info.get("vendedores") if rotas_info else None
                cod_func_list = vendedores or []  # se None, sem filtro
            elif getattr(ctx, "is_vendedor", False):
                # vendedores da mesma área de supervisão do vendedor logado
                cod_func_list = buscar_vendedores_mesma_supervisao(ctx.cod_funcionario) or [ctx.cod_funcionario]
            else:
                # admin / outro papel -> sem filtro (lista vazia = todos)
                cod_func_list = []

         # === busca crua ===
        rows = buscar_resumo_segmento_area_venda(
            de, ate, cod_funcionarios=(cod_func_list or None)
        )

        # === agrega por segmento e prepara os vetores para os gráficos ===
        def to_int(v):
            try:
                return int(v or 0)
            except (TypeError, ValueError):
                return 0

        agrup = defaultdict(lambda: {"QtdCliente": 0, "QtdClientePedido": 0})

        for r in rows or []:
            seg = r.get("Segmento") or r.get("segmento") or "—"
            agrup[seg]["QtdCliente"] += to_int(r.get("QtdCliente"))
            agrup[seg]["QtdClientePedido"] += to_int(r.get("QtdClientePedido"))

        total_cli = sum(v["QtdCliente"] for v in agrup.values())
        total_pos = sum(v["QtdClientePedido"] for v in agrup.values())

        def pct(n, d):
            return round((n / d * 100) if d else 0, 2)

        segmentos_clientes = [
            {
                "Segmento": seg,
                "QtdCliente": vals["QtdCliente"],
                "PercCliente": pct(vals["QtdCliente"], total_cli),
            }
            for seg, vals in agrup.items()
            if vals["QtdCliente"] > 0
        ]
        segmentos_positivacoes = [
            {
                "Segmento": seg,
                "QtdClientePedido": vals["QtdClientePedido"],
                "PercPositivacao": pct(vals["QtdClientePedido"], total_pos),
            }
            for seg, vals in agrup.items()
            if vals["QtdClientePedido"] > 0
        ]
        segmentos_taxa_positivacao = []
        for seg, vals in agrup.items():  # agrup tem QtdCliente e QtdClientePedido por segmento
            base = vals["QtdCliente"]
            posi = vals["QtdClientePedido"]
            if base > 0:
                taxa = round((posi / base) * 100, 2)
                segmentos_taxa_positivacao.append({
                    "Segmento": seg,
                    "QtdCliente": base,
                    "QtdClientePedido": posi,
                    "PercTaxaPositivacao": taxa,
                })

        # ordena decrescente para facilitar o plot
        segmentos_clientes.sort(key=lambda x: x["QtdCliente"], reverse=True)
        segmentos_positivacoes.sort(key=lambda x: x["QtdClientePedido"], reverse=True)
        segmentos_taxa_positivacao.sort(key=lambda x: x["PercTaxaPositivacao"], reverse=True)

        return Response({
            "graficos": {
                "segmentos_clientes": segmentos_clientes,
                "segmentos_positivacoes": segmentos_positivacoes,
                "segmentos_taxa_positivacao": segmentos_taxa_positivacao,
                "totais": {"clientes": total_cli, "positivacoes": total_pos},
            },
            # mantém o payload antigo para compatibilidade, se você ainda precisar
            "resultado": rows,
        })
