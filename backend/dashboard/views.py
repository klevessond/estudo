from django.shortcuts import render
from django.db import connections
from django.http import JsonResponse
from django.db import transaction
import pandas as pd
from django.db.models import Sum
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import ObjetivoMensal,ObjetivoMensalVendedor,ObjetivoMixNivel,Feriado
from .serializers import ObjetivoMensalSerializer, CustomUserSerializer,MeSerializer,ObjetivoMixNivelSerializer,FeriadoSerializer
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
from dashboard.services.usuarios.funcionario_service import listar_funcionarios,get_funcionario_por_codigo,obter_unid_gestora,obter_unid_gestoras_por_vendedores
import logging
from decimal import Decimal
from dashboard.roles import get_role_context  
from dashboard.services.indicadores.info_service import Todos_Vendedores, obter_cod_supervisor
from dashboard.services.indicadores.calculos_projecao import get_dias_uteis_info, calcular_matematica_projecao
from dashboard.services.indicadores.ruptura_service import buscar_ruptura
from dashboard.db_conn import query_all

logger = logging.getLogger(__name__)



from dashboard.services.indicadores.objetivos_service import buscar_objetivo_peso_positivacao
from dashboard.services.indicadores.vendas_service import buscar_vendido,buscar_positivacao_por_rota,buscar_mix_agregado,buscar_venda_mix,buscar_pre_venda,buscar_vendas_por_vendedor,buscar_resumo_segmento_area_venda
from dashboard.services.indicadores.pdv_service import buscar_vendas_pdv,buscar_pdv_por_unid_gestora,buscar_cupons_por_vendedor
from dashboard.services.indicadores.rotas_simples import buscar_rotas_usuario, buscar_vendedores_mesma_supervisao
# Create your views here.



# Em dashboard/views.py

class FeriadoView(APIView):
    permission_classes = [IsAuthenticated]

    def tem_permissao(self, request):
        # 1. Admin do Django sempre pode
        if request.user.is_superuser:
            return True
        
        # 2. Obtém contexto básico
        ctx = get_role_context(request.user)
        
        # 3. Verifica se é gerente pelo cadastro estático
        if getattr(ctx, "is_gerente", False):
            return True
            
        # 4. Verifica se é gerente pela Regra de Negócio (Rotas)
        # (Esta é a parte que faltava!)
        try:
            rotas_info = buscar_rotas_usuario(ctx)
            if rotas_info.get("e_gerente"):
                return True
        except Exception:
            pass
            
        return False

    def get(self, request):
        if not self.tem_permissao(request):
            return Response({"error": "Acesso restrito."}, status=status.HTTP_403_FORBIDDEN)
            
        ano = request.query_params.get('ano')
        qs = Feriado.objects.all()
        if ano:
            qs = qs.filter(data__year=ano)
        
        serializer = FeriadoSerializer(qs, many=True)
        return Response(serializer.data)

    def post(self, request):
        if not self.tem_permissao(request):
            return Response({"error": "Acesso restrito."}, status=status.HTTP_403_FORBIDDEN)

        serializer = FeriadoSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        if not self.tem_permissao(request):
            return Response({"error": "Acesso restrito."}, status=status.HTTP_403_FORBIDDEN)

        try:
            feriado = Feriado.objects.get(pk=pk)
            feriado.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Feriado.DoesNotExist:
            return Response({"error": "Feriado não encontrado"}, status=status.HTTP_404_NOT_FOUND)



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


def _to_float_safe(v):
    # Decimal -> float, string número -> float, None -> 0.0
    try:
        if isinstance(v, Decimal):
            return float(v)
        return float(v or 0)
    except Exception:
        return 0.0

def _resumo_detalhamento(det):
    """
    det: lista de dicts do service (ret_vendido['detalhamento'])
    devolve: lista com apenas Campo e ValorProdutos
    """
    out = []
    for row in (det or []):
        cod=row.get("CodCampo")
        codvendedor = row.get("CodVendedor")
        campo = (row.get("Campo") or "").strip()
        valor = _to_float_safe(row.get("ValorProdutos"))
        desconto = _to_float_safe(row.get("Desconto"))
        valor_liquido = valor-desconto
        out.append({
            "Codrota" :cod,
            "Campo": campo,
            "CodVendedor": codvendedor,
            "ValorProdutos": _to_float_safe(valor),
            "Desconto": _to_float_safe(desconto),
            "Valor_liquido": _to_float_safe(valor_liquido),
        })
    return out

    

class MinhasRotasSupervisorView(APIView):
    #permission_classes = [IsAuthenticated]

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

def _calc_liquido_por_vendedor_por_rotas(ret_vendido: dict, rota_to_vendedor: dict):
    """
    ret_vendido: retorno do buscar_vendido (dict com 'detalhamento')
    rota_to_vendedor: dict {CodRota(int): CodVendedor(int)} (escopo do rotas_info['detalhado'])

    Retorna:
      {
        "valor_total": float,
        "por_vendedor": [
            {"CodVendedor": int, "Valor_liquido_total": float, "Rotas": [...]},
            ...
        ]
      }
    """
    det = (ret_vendido or {}).get("detalhamento") or []

    liquido_por_vendedor = {}
    rotas_por_vendedor = {}

    for row in det:
        # buscar_vendido pode vir com Codrota/CodRota ou CodCampo (dependendo do seu service)
        cod_rota_raw = row.get("Codrota", row.get("CodRota", row.get("CodCampo")))
        try:
            cod_rota = int(str(cod_rota_raw).strip())
        except (TypeError, ValueError):
            continue

        cod_vend = rota_to_vendedor.get(cod_rota)
        if cod_vend is None:
            continue  # rota fora do escopo do usuário

        try:
            cod_vend = int(str(cod_vend).strip())
        except (TypeError, ValueError):
            continue

        valor_prod = _to_float_safe(row.get("ValorProdutos"))
        desconto = _to_float_safe(row.get("Desconto"))
        valor_liquido = valor_prod - desconto

        liquido_por_vendedor[cod_vend] = liquido_por_vendedor.get(cod_vend, 0.0) + valor_liquido

        rotas_por_vendedor.setdefault(cod_vend, []).append({
            "CodRota": cod_rota,
            "Campo": (row.get("Campo") or "").strip(),
            "Valor_liquido": round(valor_liquido, 2),
        })

    por_vendedor = [
        {
            "CodVendedor": vend,
            "Valor_liquido_total": round(total, 2),
            "Rotas": rotas_por_vendedor.get(vend, []),
        }
        for vend, total in liquido_por_vendedor.items()
    ]
    por_vendedor.sort(key=lambda x: x["Valor_liquido_total"], reverse=True)

    valor_total = round(sum(x["Valor_liquido_total"] for x in por_vendedor), 2)

    return {"valor_total": valor_total, "por_vendedor": por_vendedor}



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
        logger.info(
            "[IndicadoresView] escopo rotas: eh_supervisor=%s eh_vendedor=%s eh_admin=%s "
            "rotas=%s vendedores=%s e_gerente=%s qtd_detalhado=%s amostra_detalhado=%s",
            getattr(ctx, "is_supervisor", False),
            getattr(ctx, "is_vendedor", False),
            getattr(ctx, "is_admin", False),
            rotas_info.get("rotas"),
            rotas_info.get("vendedores"),
            rotas_info.get("e_gerente"),
            len(rotas_info.get("detalhado") or []),
            (rotas_info.get("detalhado") or [])[:3],  # só uma amostra pra não floodar o log
            
        )

        
        rotas_codigos = rotas_info.get("rotas") if rotas_info else None
        print(">>> ROTAS X VENDEDOR", rotas_info)

        # 🔧 PRIORIDADE: supervisor/gerente > vendedor
        if getattr(ctx, "is_supervisor", False):
            # supervisor/gerente: usa o escopo calculado no serviço (NÃO pode cair no escopo "mesma supervisão")
            vendedores = rotas_info.get("vendedores") if rotas_info else None
        else:
            # vendedor "puro": usa lista da mesma supervisão
            if getattr(ctx, "is_vendedor", False):
                try:
                    vendedores = buscar_vendedores_mesma_supervisao(ctx.cod_funcionario) or [int(ctx.cod_funcionario)]
                except Exception:
                    vendedores = [int(ctx.cod_funcionario)] if ctx.cod_funcionario else None
            else:
                # admin/outros: usa o escopo calculado no serviço
                vendedores = rotas_info.get("vendedores") if rotas_info else None

        # 🔧 Se for SUPERVISOR-GERENTE, montamos também grupos por área de supervisão
        grupos_supervisao = None
        if getattr(ctx, "is_supervisor", False) and rotas_info.get("e_gerente"):
            grupos_supervisao = rotas_info.get("areas_supervisao")
            logger.info(
                "[IndicadoresView] supervisor-gerente detectado: cod_func=%s qtd_areas=%s grupos=%s",
                ctx.cod_funcionario,
                len(grupos_supervisao or []),
                grupos_supervisao,
            )
            

        logger.debug(
            "[IndicadoresView] vendedores considerados para escopo: %s (e_gerente=%s)",
            vendedores,
            rotas_info.get("e_gerente"),
        )
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
        
        # ------------------------------------------------------------------
        # 🆕 LÓGICA DE MIX HIERÁRQUICO (Empresa/Supervisor)
        # ------------------------------------------------------------------
        mix_empresa_val = 0
        mix_supervisores_map = {} # { 'cod_supervisor_str': valor }

        try:
            # Define data de referência (dia 01 do mês)
            dt_ref = datetime.strptime(data_inicio, "%Y-%m-%d").date().replace(day=1)
            
            # Busca todas as metas de nível para o mês
            mix_nivel_qs = ObjetivoMixNivel.objects.filter(mes_referencia=dt_ref)
            
            for m in mix_nivel_qs:
                if m.nivel == 'EMPRESA':
                    mix_empresa_val = m.objetivo_mix
                elif m.nivel == 'SUPERVISOR':
                    mix_supervisores_map[str(m.codigo_alvo)] = m.objetivo_mix

            # --- AJUSTE DO OBJETIVO PRINCIPAL (Card de Mix) ---
            # Se for Gerente/Admin, a meta geral padrão é a da EMPRESA
            eh_gerente_rotas = rotas_info.get("e_gerente", False)

            # Verifica se é Gerente pelo Profile (ctx) OU pelas Rotas (ERP)
            if getattr(ctx, "is_gerente", False) or getattr(ctx, "is_admin", False) or eh_gerente_rotas:
                # Se for Gerente/Admin, a meta geral padrão é a da EMPRESA
                if mix_empresa_val > 0:
                    objetivo["objetivo_mix"] = mix_empresa_val
            
            # Se for Supervisor, a meta geral dele é a SUA meta de nível
            elif getattr(ctx, "is_supervisor", False):
                cod_sup = str(ctx.cod_funcionario)
                if cod_sup in mix_supervisores_map:
                    objetivo["objetivo_mix"] = mix_supervisores_map[cod_sup]

        except Exception as e:
            logger.error(f"Erro ao buscar ObjetivoMixNivel: {e}")

        # ------------------------------------------------------------------
        
        
        objetivos_vendedores = get_objetivos_vendedores_por_mes(data_inicio)



        # == agrega objetivos por área de supervisão (para gerente) ===
        def _agregar_objetivos_por_area(areas_supervisao, objetivos_vendedores, mix_map):
            """
            Soma Financeiro/Peso/Positivação dos vendedores.
            PARA MIX: Usa a meta do Supervisor (mix_map) se existir, senão soma (fallback).
            """
            if not areas_supervisao:
                return areas_supervisao

            # Mapa auxiliar de objetivos individuais
            obj_by_vendedor = {}
            for o in objetivos_vendedores or []:
                try:
                    vend_id = int(str(o.get("vendedor_id")).strip())
                    obj_by_vendedor[vend_id] = {
                        "financeiro": float(o.get("objetivo_financeiro") or 0),
                        "peso":       float(o.get("objetivo_peso") or 0),
                        "mix":        float(o.get("objetivo_mix") or 0),
                        "pos":        float(o.get("objetivo_positivacao") or 0),
                    }
                except (ValueError, TypeError):
                    continue

            for area in areas_supervisao:
                soma_fin  = 0.0
                soma_peso = 0.0
                soma_mix_vendedores = 0.0
                soma_pos  = 0.0

                for vend in area.get("vendedores") or []:
                    try:
                        vend_id = int(str(vend).strip())
                        obj = obj_by_vendedor.get(vend_id)
                        if obj:
                            soma_fin  += obj["financeiro"]
                            soma_peso += obj["peso"]
                            soma_mix_vendedores += obj["mix"]
                            soma_pos  += obj["pos"]
                    except: pass

                area["objetivo_financeiro_area"]  = round(soma_fin, 2)
                area["objetivo_peso_area"]        = round(soma_peso, 2)
                area["objetivo_positivacao_area"] = round(soma_pos, 2)
                
                # 🔥 AQUI: Se existe meta para este supervisor, usa ela. 
                # Caso contrário, usa a soma dos vendedores.
                cod_sup = str(area.get("cod_supervisor"))
                if cod_sup in mix_map:
                    area["objetivo_mix_area"] = mix_map[cod_sup]
                else:
                    area["objetivo_mix_area"] = round(soma_mix_vendedores, 2)

            return areas_supervisao

        # Se for supervisor-gerente, já devolve as áreas com os objetivos agregados
        if grupos_supervisao:
            grupos_supervisao = _agregar_objetivos_por_area(
            grupos_supervisao, 
            objetivos_vendedores, 
            mix_supervisores_map  # <--- Adicione este argumento
        )

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

        def _num(v):
            try:
                return float(v or 0)
            except Exception:
                return 0.0

        vendedores_list = vendedores or []
        vendedores_set = { _to_int(v) for v in vendedores_list if _to_int(v) is not None }
        # 🔧 REGRA 228/4: LISTA ESPECÍFICA PARA O MIX
        # Adiciona o vendedor 4 apenas para a consulta de quantidade de Mix
        # =========================================================
        vendedores_mix_list = list(vendedores_list)
        try:
            cod_logado_str = str(ctx.cod_funcionario)
            if cod_logado_str in ['228', '4']:
                if 4 not in vendedores_mix_list:
                    vendedores_mix_list.append(4)
                    logger.info(f"[IndicadoresView] Regra 228/4 aplicada: Vendedor 4 incluído no cálculo do MIX.")
        except Exception:
            pass

        # =========================
        # VENDAS REALIZADAS (ÁREA)
        # =========================
        eh_gerente = getattr(ctx, "is_supervisor", False) and rotas_info.get("e_gerente")

        # Se for GERENTE, já manda os vendedores para o SQL
        if eh_gerente and vendedores_set:
            vendido = buscar_vendas_por_vendedor(
                data_inicio,
                data_fim,
                cod_vendedores=list(vendedores_set),
            )
        else:
            # supervisor “normal”, vendedor, admin etc → mantém o comportamento atual
            vendido = buscar_vendas_por_vendedor(data_inicio, data_fim)

        lista = vendido.get("vendas_por_vendedor", []) or []

        # Só mantém o filtro em memória para quem NÃO é gerente
        if not eh_gerente and vendedores_set:
            lista = [it for it in lista if _to_int(it.get("codcampo")) in vendedores_set]

            # =========================================================
            existing_ids = set()
            for it in lista:
                cid = _to_int(it.get("codcampo"))
                if cid is not None:
                    existing_ids.add(cid)
            
            missing_ids = vendedores_set - existing_ids
            
            if missing_ids:
                # Mapa de nomes para usar no fallback (tenta pegar dos objetivos)
                name_map = {}
                for o in (objetivos_vendedores or []):
                     try:
                         vid = int(str(o.get("vendedor_id")).strip())
                         name_map[vid] = o.get("nome_vendedor")
                     except: pass
                
                for mid in missing_ids:
                    # Tenta achar o nome, senão usa o ID
                    nome = name_map.get(mid, f"Vendedor {mid}")
                    
                    # Cria o objeto "zerado". 
                    # NOTA: O Ano Anterior e as Projeções serão calculados/preenchidos
                    # nos passos seguintes do código (linhas abaixo), pois inserimos isso NO INÍCIO.
                    lista.append({
                        "codcampo": str(mid),
                        "Campo": nome,
                        "ValorLiquido": 0.0,
                        "PesoTotal": 0.0,
                        "Mix": 0,
                        "QtdClientes": 0,
                        "PreVenda_Valor": 0.0,
                        "Ruptura_TotalValor": 0.0,
                        "Positivacao_Realizado": 0.0,
                        # Inicializa AA com 0, mas o bloco "ANO ANTERIOR" logo abaixo vai atualizar isso
                        "Ano_anterior_QtdClientes": 0,
                        "Ano_anterior_ValorLiquido": 0,
                        "Ano_anterior_PesoTotal": 0,
                        "Ano_anterior_Mix": 0
                    })


        # somatórios
        venda_realizada = sum(_to_float(it.get("ValorLiquido")) for it in lista)
        peso_realizado  = sum(_to_float(it.get("PesoTotal"))    for it in lista)
        venda_ano_anterior_rotas = None


        # ==============================================================================
        # 🔧 REGRA ESPECÍFICA: TIME DO SUPERVISOR 228 (Apenas para o Ano Anterior)
        # ==============================================================================
        vendedores_aa_set = vendedores_set.copy()
        
        cod_logado = getattr(ctx, "cod_funcionario", None)
        eh_time_228 = False

        if cod_logado:
            # 1. É o próprio supervisor 228?
            if str(cod_logado) == '228':
                eh_time_228 = True
            # 2. Se não, verifica se o supervisor dele é o 228
            else:
                cod_chefe = obter_cod_supervisor(int(cod_logado))
                if cod_chefe and str(cod_chefe) == '228':
                    eh_time_228 = True

        if eh_time_228:
            # Busca todos do banco para aplicar o filtro customizado
            todos_dados = Todos_Vendedores().get("detalhamento", [])
            
            custom_aa = set()
            for v in todos_dados:
                try:
                    c_func = int(v.get("CodFuncionario"))
                    c_ug   = int(v.get("unidgestora") or 0)
                    
                    # Filtro: UnidGestora = 1 AND CodFuncionario NOT IN (1, 4)
                    if c_ug == 1 and c_func not in (1, 4):
                        custom_aa.add(c_func)
                except (TypeError, ValueError):
                    continue
            
            vendedores_aa_set = custom_aa
            
            logger.info(
                f"[IndicadoresView] Regra Time 228 (Logado: {cod_logado}) aplicada p/ Ano Anterior. "
                f"Vendedores filtrados: {len(vendedores_aa_set)}"
            )

        venda_realizada = sum(_to_float(it.get("ValorLiquido")) for it in lista)
        peso_realizado  = sum(_to_float(it.get("PesoTotal"))    for it in lista)

      
        # ===========================================
        # VENDAS DO MESMO PERÍODO NO ANO ANTERIOR  
        # ===========================================
        # Regras:
        # - Se o mês consultado == mês atual, comparar de data_inicio até "hoje" (mesmo dia no ano anterior).
        # - Caso contrário (mês passado), comparar mês completo como antes (de/ate - 1 ano).

        def last_day_of_month(y, m):
            # sem imports: calcula último dia do mês (considera bissexto)
            if m in (1,3,5,7,8,10,12):
                return 31
            if m in (4,6,9,11):
                return 30
            # fevereiro
            is_leap = (y % 4 == 0) and (y % 100 != 0 or y % 400 == 0)
            return 29 if is_leap else 28

        def _ajusta_data_aa(d: date) -> date:
            """Troca o ano pra (ano-1), se 29/02 ajusta p/ 28/02 quando necessário."""
            try:
                return d.replace(year=d.year - 1)
            except ValueError:
                # 29/02 em ano não-bissexto
                return d.replace(year=d.year - 1, day=28)

        # parse datas
        de_dt = datetime.strptime(data_inicio, "%Y-%m-%d").date()
        ate_dt = datetime.strptime(data_fim, "%Y-%m-%d").date()
        hoje = date.today()

        if de_dt.year == hoje.year and de_dt.month == hoje.month:
            # mês atual: vai até o "hoje" do ano anterior (limitado ao fim do mês)
            aa_ini = _ajusta_data_aa(de_dt)
            aa_last_day = last_day_of_month(aa_ini.year, aa_ini.month)
            # mesmo dia de "hoje" no ano anterior, mas não pode passar do fim do mês
            end_day = min(hoje.day, aa_last_day)
            aa_fim = date(aa_ini.year, aa_ini.month, end_day)
        else:
            # mês passado ou outro: usa o mês completo (como antes)
            aa_ini = _ajusta_data_aa(de_dt)
            aa_fim = _ajusta_data_aa(ate_dt)
        
        # ===========================================
        # ANO ANTERIOR POR ROTAS (buscar_vendido)
        # ===========================================
        
        try:
            # 1) mapa rota -> vendedor (regra gerência)
            rota_to_vendedor = {}
            for row in (rotas_info.get("detalhado") or []):
                try:
                    cod_rota = int(str(row.get("CodRota")).strip())
                    cod_vend = int(str(row.get("CodVendedor")).strip())
                    rota_to_vendedor[cod_rota] = cod_vend
                except (TypeError, ValueError):
                    pass

            aa_ini_str = aa_ini.strftime("%Y-%m-%d")
            aa_fim_str = aa_fim.strftime("%Y-%m-%d")

            ret_vendido_aa_rotas = buscar_vendido(aa_ini_str, aa_fim_str, rotas=rotas_codigos)

            if isinstance(ret_vendido_aa_rotas, dict):
                calc = _calc_liquido_por_vendedor_por_rotas(ret_vendido_aa_rotas, rota_to_vendedor)

                venda_ano_anterior_rotas = {
                    "de": aa_ini_str,
                    "ate": aa_fim_str,
                    "valor_total": calc["valor_total"],
                    "por_vendedor": calc["por_vendedor"],
                }

                # --- MONTAGEM DO LOG FORMATADO ---
                log_lines = []
                log_lines.append(f"\n{'='*60}")
                log_lines.append(f"[AA_ROTAS][buscar_vendido] RESUMO")
                log_lines.append(f"Periodo: {aa_ini_str} ate {aa_fim_str}")
                log_lines.append(f"Total Geral: R$ {calc['valor_total']:,.2f}")
                log_lines.append(f"{'-'*60}")

                # Itera sobre cada vendedor para mostrar suas rotas
                # (Se a lista for muito grande, você pode usar um slice, ex: calc['por_vendedor'][:5])
                for v in calc["por_vendedor"]: 
                    cod_v = v.get('CodVendedor')
                    total_v = v.get('Valor_liquido_total', 0)
                    log_lines.append(f"👤 Vendedor {cod_v} | Total: R$ {total_v:,.2f}")
                    
                    rotas_v = v.get('Rotas', [])
                    for r in rotas_v:
                        cod_r = r.get('CodRota')
                        campo_r = r.get('Campo')
                        val_r = r.get('Valor_liquido', 0)
                        log_lines.append(f"   └── Rota {cod_r} ({campo_r}): R$ {val_r:,.2f}")
                    
                    log_lines.append(f"{'.'*60}") # Separador entre vendedores

                log_lines.append(f"{'='*60}\n")
                
                # Exibe o log formatado
                logger.info("\n".join(log_lines))

            else:
                logger.warning(
                    "[AA_ROTAS][buscar_vendido] retorno inesperado tipo=%s amostra=%s",
                    type(ret_vendido_aa_rotas).__name__,
                    str(ret_vendido_aa_rotas)[:600],
                )

        except Exception:
            logger.exception("[AA_ROTAS][buscar_vendido] erro ao calcular ano anterior por rotas")
            venda_ano_anterior_rotas = None


        res_aa  = buscar_vendas_por_vendedor(aa_ini.strftime("%Y-%m-%d"), aa_fim.strftime("%Y-%m-%d"))
        print(
            "[DEBUG][VENDA ANO ANTERIOR]\n"
            f"  Total registros retornados: {len(res_aa.get('vendas_por_vendedor', []) or [])}\n"
            f"  Payload bruto: {res_aa}"
        )
        lista_aa = res_aa.get("vendas_por_vendedor", []) or []
        print(
            "[DEBUG][VENDA ANO ANTERIOR]\n"
            f"  Registros totais: {len(lista_aa)}\n"
            f"  Vendedores filtrados: {len(vendedores_set) if vendedores_set else 'TODOS'}\n"
            f"  IDs filtrados: {sorted(vendedores_set) if vendedores_set else 'N/A'}"
            )

        if vendedores_aa_set: 
            lista_aa = [it for it in lista_aa if _to_int(it.get("codcampo")) in vendedores_aa_set]
            codigos_considerados = sorted(
                                                {_to_int(it.get("codcampo")) for it in lista_aa if _to_int(it.get("codcampo")) is not None}
                                            )
            
            print(
                    "[DEBUG][VENDA ANO ANTERIOR][APÓS FILTRO]\n"
                    f"  Registros considerados: {len(lista_aa)}"
                    f"  Códigos vendedores: {codigos_considerados}"
                )
            # === ADICIONE ESTE BLOCO PARA LOGAR ===
        print("\n=== DEBUG: VENDAS ANO ANTERIOR POR VENDEDOR ===")
        for item in lista_aa:
            cod = item.get("codcampo")
            nome = item.get("Campo")
            valor = item.get("ValorLiquido")
            print(f"Vendedor: {cod} - {nome} | Valor AA: R$ {valor}")
        print("===============================================\n")
        # ======================================

        venda_ano_anterior = sum(_to_float(it.get("ValorLiquido")) for it in lista_aa) or 1.0  # evita div/0
        print(f"[DEBUG][VENDA ANO ANTERIOR] {venda_ano_anterior}")

        # índice por vendedor do ANO ANTERIOR (para merge no payload de vendas)
        aa_by_cod = {}
        for it in lista_aa:
            cod = _to_int(it.get("codcampo"))
            if cod is None:
                continue
            aa_by_cod[cod] = {
                "Ano_anterior_QtdClientes": _num(it.get("QtdClientes")),
                "Ano_anterior_ValorLiquido": _num(it.get("ValorLiquido")),
                "Ano_anterior_PesoTotal": _num(it.get("PesoTotal")),
                "Ano_anterior_Mix": _num(it.get("Mix")),
            }

        # injeta campos *Ano_anterior_* em cada item de lista (ano atual)
        for it in lista:
            cod = _to_int(it.get("codcampo"))
            aa = aa_by_cod.get(cod, {})
            it.update(aa)

        # agregado do ano anterior (da mesma amostra de vendedores)
        ano_anterior_agregado = {
            "QtdClientes": sum(_num(x.get("Ano_anterior_QtdClientes")) for x in lista),
            "ValorLiquido": sum(_num(x.get("Ano_anterior_ValorLiquido")) for x in lista),
            "PesoTotal": sum(_num(x.get("Ano_anterior_PesoTotal")) for x in lista),
            "Mix": sum(_num(x.get("Ano_anterior_Mix")) for x in lista),
        }
        
        #print(f"DEBUG VENDA DO ANO ANTERIOR ATE HOJE {ano_anterior_agregado}")

        # === NOVO: VENDAS DO MÊS COMPLETO DO ANO ANTERIOR ===
        aa_mes_ano = de_dt.year - 1
        aa_mes_mes = de_dt.month
        aa_mes_ini = date(aa_mes_ano, aa_mes_mes, 1)
        aa_mes_last_day = last_day_of_month(aa_mes_ano, aa_mes_mes)
        aa_mes_fim = date(aa_mes_ano, aa_mes_mes, aa_mes_last_day)

        res_aa_mes = buscar_vendas_por_vendedor(
            aa_mes_ini.strftime("%Y-%m-%d"),
            aa_mes_fim.strftime("%Y-%m-%d"),
        )
        lista_aa_mes = res_aa_mes.get("vendas_por_vendedor", []) or []

        # aplica o MESMO filtro de escopo de vendedores
        if vendedores_aa_set:
            lista_aa_mes = [
                it for it in lista_aa_mes
                if _to_int(it.get("codcampo")) in vendedores_aa_set
            ]

        # índice por vendedor do MÊS COMPLETO do ANO ANTERIOR
        aa_mes_by_cod = {}
        for it in lista_aa_mes:
            cod = _to_int(it.get("codcampo"))
            if cod is None:
                continue
            aa_mes_by_cod[cod] = {
                "Ano_anterior_mes_QtdClientes": _num(it.get("QtdClientes")),
                "Ano_anterior_mes_ValorLiquido": _num(it.get("ValorLiquido")),
                "Ano_anterior_mes_PesoTotal": _num(it.get("PesoTotal")),
                "Ano_anterior_mes_Mix": _num(it.get("Mix")),
            }

        # injeta também os campos do MÊS CHEIO em cada item de lista (ano atual)
        for it in lista:
            cod = _to_int(it.get("codcampo"))
            if cod is None:
                continue
            aa_mes = aa_mes_by_cod.get(cod, {})
            it.update(aa_mes)

        # agregado do MÊS CHEIO do ano anterior (sobre a MESMA amostra de vendedores da lista)
        ano_anterior_agregado_mes = {
            "QtdClientes":   sum(_num(x.get("Ano_anterior_mes_QtdClientes"))   for x in lista),
            "ValorLiquido":  sum(_num(x.get("Ano_anterior_mes_ValorLiquido"))  for x in lista),
            "PesoTotal":     sum(_num(x.get("Ano_anterior_mes_PesoTotal"))     for x in lista),
            "Mix":           sum(_num(x.get("Ano_anterior_mes_Mix"))           for x in lista),
        }
        #print(f"DEBUG VENDA DO ANO ANTERIOR MES COMPLETO {ano_anterior_agregado_mes}")

        if grupos_supervisao:
            print("\n[DEBUG][AREAS] iniciando soma ATUAL + AA por área...")

            for area in grupos_supervisao:
                area_vendedores = [_to_int(v) for v in (area.get("vendedores") or [])]
                area_vendedores = [v for v in area_vendedores if v is not None]

                print(
                    f"\n[DEBUG][AREA] area={area.get('cod_area_supervisao')} "
                    f"sup={area.get('cod_supervisor')} "
                    f"qtd_vendedores={len(area_vendedores)} "
                    f"vendedores(amostra)={area_vendedores[:10]}"
                )

                if not area_vendedores:
                    area["venda_ano_anterior_area"] = 0.0
                    area["venda_realizada_area"] = 0.0
                    continue
                
                # MIX AGREGADO DA ÁREA (Distinto)
                # =========
                area_vendedores_mix = list(area_vendedores)
                # Aplica a regra do 228/4 também aqui
                try:
                    if str(ctx.cod_funcionario) in ['228', '4']:
                        if 4 not in area_vendedores_mix:
                            area_vendedores_mix.append(4)
                except: pass
                mix_area = buscar_mix_agregado(
                    data_inicio,
                    data_fim,
                    cod_vendedores=area_vendedores_mix 
                )
                area["mix_realizado_area"] = mix_area
                
                # =========
                # ATUAL (período consultado)
                # =========
                res_atual_area = buscar_vendas_por_vendedor(
                    data_inicio,
                    data_fim,
                    cod_vendedores=area_vendedores,
                )
                lista_atual_area = res_atual_area.get("vendas_por_vendedor", []) or []
                soma_atual_area = sum(_to_float(it.get("ValorLiquido")) for it in lista_atual_area)
                area["venda_realizada_area"] = round(soma_atual_area, 2)

                print(
                    f"[DEBUG][ATUAL_POR_AREA_TOTAL] "
                    f"area={area.get('cod_area_supervisao')} sup={area.get('cod_supervisor')} "
                    f"ATUAL_TOTAL={area['venda_realizada_area']}"
                )

                # =========
                # AA (mês completo do ano anterior) — mantém sua regra
                # =========
                res_aa_area = buscar_vendas_por_vendedor(
                    aa_ini.strftime("%Y-%m-%d"),
                    aa_fim.strftime("%Y-%m-%d"),
                    cod_vendedores=area_vendedores,
                )
                lista_aa_area = res_aa_area.get("vendas_por_vendedor", []) or []
                soma_aa_area = sum(_to_float(it.get("ValorLiquido")) for it in lista_aa_area)
                area["venda_ano_anterior_area"] = round(soma_aa_area, 2)

                print(
                    f"[DEBUG][AA_POR_AREA_TOTAL] "
                    f"area={area.get('cod_area_supervisao')} sup={area.get('cod_supervisor')} "
                    f"AA_TOTAL={area['venda_ano_anterior_area']}"
                )




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

        print("[DEBUG][PREVENDA_RAW] keys=", list((prevenda or {}).keys()))
        det = (prevenda.get("detalhado") or [])
        print("[DEBUG][PREVENDA_RAW] detalhado_len=", len(det), "amostra=", det[:3])
        

       # ==========================
        # PRÉ-VENDA: mapa por vendedor (ACUMULADO)
        # ==========================
        pre_by_cod = {}
        try:
            detalhado_pre = prevenda.get("detalhado") or []
            for row in detalhado_pre:
                cod_v = _to_int(row.get("CodVendedor"))
                if cod_v is None:
                    continue
                valor = _num(row.get("Valor"))
                pre_by_cod[cod_v] = pre_by_cod.get(cod_v, 0.0) + valor
        except Exception as e:
            logger.exception(f"[PREVENDA] erro ao montar pre_by_cod: {e}")
            pre_by_cod = {}

        print("[DEBUG] Iniciando cálculo de pré-venda…")
        print(f"[DEBUG] Pré-venda calculada para {len(pre_by_cod)} vendedores")

        # (opcional) log de alguns vendedores
        for k in list(pre_by_cod.keys())[:15]:
            print(f"[DEBUG] PRE vendedor {k}: {pre_by_cod[k]}")

        # ==========================
        # PRÉ-VENDA: soma por área (escopo_rotas -> areas_supervisao)
        # ==========================
        if grupos_supervisao:
            print("\n[DEBUG][PREVENDA_POR_AREA] iniciando...")

            pre_keys = set(pre_by_cod.keys())

            for area in grupos_supervisao:
                area_vendedores = [_to_int(v) for v in (area.get("vendedores") or [])]
                area_vendedores = [v for v in area_vendedores if v is not None]

                intersec = sorted(list(set(area_vendedores) & pre_keys))

                print(
                    f"[DEBUG][PREVENDA_MATCH] area={area.get('cod_area_supervisao')} "
                    f"sup={area.get('cod_supervisor')} "
                    f"qtd_area_vend={len(area_vendedores)} qtd_pre_keys={len(pre_keys)} "
                    f"intersec={len(intersec)} amostra_inter={intersec[:15]}"
                )

                soma_pre_area = sum(pre_by_cod.get(v, 0.0) for v in area_vendedores)
                area["pre_venda_area"] = round(soma_pre_area, 2)

                print(
                    f"[DEBUG][PREVENDA_POR_AREA_TOTAL] area={area.get('cod_area_supervisao')} "
                    f"sup={area.get('cod_supervisor')} PRE_TOTAL={area['pre_venda_area']}"
                )



        # ========= PRÉ-VENDA POR ÁREA (para gerente) =========
        if grupos_supervisao:
            print("\n[DEBUG][PREVENDA_POR_AREA] iniciando...")

            for area in grupos_supervisao:
                area_vendedores = [_to_int(v) for v in (area.get("vendedores") or [])]
                area_vendedores = [v for v in area_vendedores if v is not None]

                inter = set(area_vendedores) & set(pre_by_cod.keys())
                print(
                f"[DEBUG][PREVENDA_MATCH] area={area.get('cod_area_supervisao')} "
                f"qtd_area_vend={len(area_vendedores)} qtd_pre_keys={len(pre_by_cod)} "
                f"intersec={len(inter)} amostra_inter={list(inter)[:10]}"
                )


                soma_pre_area = sum(_num(pre_by_cod.get(v, 0.0)) for v in area_vendedores)

                area["pre_venda_area"] = round(soma_pre_area, 2)

                if "venda_realizada_area" in area:
                    area["valor_alocado_area"] = round(_num(area.get("venda_realizada_area")) + soma_pre_area, 2)

                print(
                    f"[DEBUG][PREVENDA_POR_AREA_TOTAL] "
                    f"area={area.get('cod_area_supervisao')} sup={area.get('cod_supervisor')} "
                    f"PRE_TOTAL={area['pre_venda_area']}"
                )



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
        vendedores_list_int = [_to_int(v) for v in (vendedores or []) if _to_int(v) is not None]
        if not vendedores_list_int:
            ruptura_dados = buscar_ruptura(data_inicio, data_fim, cod_vendedor=None, cod_vendedores=None)
        elif len(vendedores_list_int) == 1:
            ruptura_dados = buscar_ruptura(data_inicio, data_fim, cod_vendedor=vendedores_list_int[0], cod_vendedores=None)
        else:
            ruptura_dados = buscar_ruptura(data_inicio, data_fim, cod_vendedor=None, cod_vendedores=vendedores_list_int)

        #print(f"[DEBUG]RUPTURA ] {ruptura_dados}")
        ruptura_total = 0.0
        for r in (ruptura_dados.get("resumo") or []):
            ruptura_total += float(r.get("TotalValor") or 0)
        ruptura_total = round(ruptura_total, 2)
        percentual_captado = round(safe_divide(ruptura_total, venda_realizada) * 100, 2)

        # ========= NOVO: MERGE por-vendedor (Pré-venda, Ruptura, Positivação) =========
        # 1) Pré-venda detalhada (esperado: prevenda['detalhado'] = [{CodVendedor, Valor}, ...])
        """pre_by_cod = {}
        try:
            for itp in (prevenda.get("detalhado") or []):
                cod_v = _to_int(itp.get("CodVendedor"))
                if cod_v is None:
                    continue
                pre_by_cod[cod_v] = _num(itp.get("Valor"))
        except Exception:
            pre_by_cod = {}"""

        # 2) Ruptura detalhada (esperado: ruptura_dados['detalhado'] = [{CodVendedor, TotalValor}, ...])
        rup_by_cod = {}
        try:
            for itr in (ruptura_dados.get("resumo") or []):
                #print(f"[DEBUG] dado do for {itr}")
                cod_v = _to_int(itr.get("CodVendedor"))
                if cod_v is None:
                    continue
                rup_by_cod[cod_v] = _num(itr.get("TotalValor"))
        except Exception:
            rup_by_cod = {}

        # 3) Positivação detalhada (esperado: positivacao['detalhado'] = [{CodVendedor, Realizado|QtdClientes}, ...])
        pos_by_cod = {}
        try:
            for itpos in (positivacao.get("detalhado") or []):
                cod_v = _to_int(itpos.get("CodVendedor"))
                if cod_v is None:
                    continue
                realizado = itpos.get("Realizado", itpos.get("QtdClientes", 0))
                pos_by_cod[cod_v] = _num(realizado)
        except Exception:
            pos_by_cod = {}

        # 4) Aplica nos itens do array principal
        for it in lista:
            cod = _to_int(it.get("codcampo"))
            it["PreVenda_Valor"]        = pre_by_cod.get(cod, 0.0)
            it["Ruptura_TotalValor"]    = rup_by_cod.get(cod, 0.0)
            it["Positivacao_Realizado"] = pos_by_cod.get(cod, 0.0)

        # 5) Agregados úteis p/ modo "área"
        pre_venda_agregado = sum(_num(it.get("PreVenda_Valor")) for it in lista)
        ruptura_agregado   = sum(_num(it.get("Ruptura_TotalValor")) for it in lista)
        positivacao_agregado = sum(_num(it.get("Positivacao_Realizado")) for it in lista)

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

        # ====== Payload final de vendas / agregados ======
        vendido["vendas_por_vendedor"]   = lista
        vendido["ano_anterior_agregado"] = ano_anterior_agregado
        vendido["ano_anterior_agregado_mes"] = ano_anterior_agregado_mes
        vendido["agregados_area"] = {
            "PreVenda_Valor": pre_venda_agregado,
            "Ruptura_TotalValor": ruptura_agregado,
            "Positivacao_Realizado": positivacao_agregado,
        }
        vendido["venda_ano_anterior_rotas"] = venda_ano_anterior_rotas


        # =========================================================
        # 🟢 INICIO DO BLOCO: PROJEÇÃO INTEGRADA & PDV (FINAL - DETALHADO)
        # =========================================================
        
        # 1. Busca Dados Externos
        dados_pdv = buscar_vendas_pdv(data_inicio, data_fim)
        dados_positivacao = buscar_positivacao_por_rota(data_inicio, data_fim, rotas=rotas_codigos, cod_vendedores=vendedores)
        
        # 2. Valores Totais Gerais
        venda_pdv_total = float(dados_pdv.get("valor_pdv") or 0)
        peso_pdv_total = float(dados_pdv.get("peso_pdv") or 0)
        pos_realizado_geral = float(dados_positivacao.get("positivacao_realizado_geral") or 0)

        # Totais Combinados
        venda_total_empresa = venda_realizada + venda_pdv_total
        peso_total_empresa = peso_realizado + peso_pdv_total

        # Verificação de PDV (Solicitação do usuário: não calcular se for zero)
        tem_pdv = venda_pdv_total > 0

        # 3. Mapas
        pdv_map = defaultdict(lambda: {"fin": 0.0, "peso": 0.0})
        if tem_pdv:
            for item in dados_pdv.get("detalhado", []):
                try:
                    c_func = int(item.get("CodFuncionario") or 0)
                    if c_func > 0:
                        pdv_map[c_func]["fin"] += float(item.get("ValorProdutos") or 0)
                        pdv_map[c_func]["peso"] += float(item.get("Peso") or 0)
                except: continue

        pos_map = defaultdict(float)
        for item in dados_positivacao.get("detalhado", []):
            try:
                c_func = int(item.get("CodFuncionario") or 0)
                qtd = float(item.get("ClientesPositivadosRota") or item.get("Realizado") or 0)
                if c_func > 0:
                    pos_map[c_func] += qtd
            except: continue

        meta_map = {}
        for o in objetivos_vendedores or []:
            try:
                vid = int(str(o.get("vendedor_id")).strip())
                meta_map[vid] = {
                    "fin": float(o.get("objetivo_financeiro") or 0),
                    "peso": float(o.get("objetivo_peso") or 0),
                    "pos": float(o.get("objetivo_positivacao") or 0),
                    "mix": float(o.get("objetivo_mix") or 0)
                    
                }
            except: continue

        # 4. Calendário
        try:
            dt_ref_fim = datetime.strptime(data_fim, "%Y-%m-%d").date()
            dias_info = get_dias_uteis_info(data_base=dt_ref_fim)
        except Exception:
            dias_info = {"totais": 22, "decorridos": 1, "restantes": 21}

        # 5. Cálculo das Projeções GERAIS (Empresa)
        # Financeiro
        proj_rotas_geral = calcular_matematica_projecao(venda_realizada, 0, dias_info)
        projecao_financeira_geral = calcular_matematica_projecao(venda_total_empresa, objetivo_financeiro, dias_info)
        
        if tem_pdv:
            proj_pdv_geral = calcular_matematica_projecao(venda_pdv_total, 0, dias_info)
        else:
            proj_pdv_geral = {
                "projecao_final": 0.0, "velocidade_diaria": 0.0, 
                "falta_para_meta": 0.0, "meta_diaria_necessaria": 0.0, 
                "atingimento_projetado": 0.0
            }

        # Peso (Rotas vs Total)
        # Calcula projeção só de rotas para quando o PDV estiver desligado no front
        proj_peso_rotas_geral = calcular_matematica_projecao(peso_realizado, 0, dias_info)
        # Projeção Total (Rotas + PDV) contra a meta
        projecao_peso_geral = calcular_matematica_projecao(peso_total_empresa, objetivo_peso, dias_info)
        
        # Mix (Geral)
        projecao_mix_geral = calcular_matematica_projecao(mix_realizado, objetivo_mix, dias_info)

        # Positivação (Geral)
        projecao_positivacao_geral = calcular_matematica_projecao(pos_realizado_geral, objetivo_positivacao, dias_info)

        # [LOG EMPRESA DETALHADO]
        logger.info("========================================")
        logger.info(f"--- [PROJEÇÃO EMPRESA] ---")
        logger.info(f"Calendário: {dias_info['decorridos']} decorridos / {dias_info['totais']} totais")
        logger.info("FINANCEIRO (Rotas vs PDV):")
        logger.info(f"   Rotas: Realizado R$ {venda_realizada:,.2f} -> Projeção R$ {proj_rotas_geral['projecao_final']:,.2f}")
        logger.info(f"   TOTAL: Realizado R$ {venda_total_empresa:,.2f} -> Projeção R$ {projecao_financeira_geral['projecao_final']:,.2f}")
        logger.info("========================================")

        # 6. Loop de Projeção INDIVIDUAL
        for vend in lista:
            try:
                vid = int(vend.get("codcampo") or 0)
                
                # Valores Realizados
                val_rotas = float(vend.get("ValorLiquido") or 0)
                peso_rotas = float(vend.get("PesoTotal") or 0)
                val_mix = float(vend.get("Mix") or 0)  # <--- Recupera Mix realizado
                
                val_pdv = pdv_map[vid]["fin"]
                peso_pdv = pdv_map[vid]["peso"]
                val_pos = pos_map[vid]

                total_fin = val_rotas + val_pdv
                total_peso = peso_rotas + peso_pdv

                # Metas (agora com Mix)
                metas = meta_map.get(vid, {"fin": 0, "peso": 0, "pos": 0, "mix": 0})

                # --- CÁLCULOS SEPARADOS ---
                p_rotas_only = calcular_matematica_projecao(val_rotas, 0, dias_info)
                
                p_pdv_only = None
                if tem_pdv:
                    p_pdv_only = calcular_matematica_projecao(val_pdv, 0, dias_info)
                else:
                    p_pdv_only = {"projecao_final": 0, "velocidade_diaria": 0, "atingimento_projetado": 0}

                # Projeções Totais
                p_fin_total = calcular_matematica_projecao(total_fin, metas["fin"], dias_info)
                p_peso = calcular_matematica_projecao(total_peso, metas["peso"], dias_info)
                p_pos = calcular_matematica_projecao(val_pos, metas["pos"], dias_info)
                p_mix = calcular_matematica_projecao(val_mix, metas["mix"], dias_info) # <--- Projeção de Mix

                # --- LOGS DETALHADOS (RESTAURADOS) ---
                logger.info(f"--- [PROJEÇÃO VENDEDOR {vid}] {vend.get('Campo')} ---")
                logger.info(f"   FINANCEIRO: Real R$ {total_fin:,.2f} | Meta R$ {metas['fin']:,.2f} | Proj R$ {p_fin_total['projecao_final']:,.2f} ({p_fin_total['atingimento_projetado']:.2f}%)")
                logger.info(f"               Diário Atual: R$ {p_fin_total['velocidade_diaria']:,.2f} | Necessário: R$ {p_fin_total['meta_diaria_necessaria']:,.2f}")
                logger.info(f"   PESO:       Real {total_peso:,.2f} | Meta {metas['peso']:,.2f} | Proj {p_peso['projecao_final']:,.2f}")
                logger.info(f"   MIX:        Real {val_mix} | Meta {metas['mix']} | Proj {p_mix['projecao_final']:.2f}")
                logger.info(f"   POSITIV.:   Real {val_pos} | Meta {metas['pos']} | Proj {p_pos['projecao_final']:.2f}")

                # --- INJEÇÃO NO JSON ---
                vend["projecao"] = p_fin_total 
                
                vend["venda_rotas"] = val_rotas
                vend["venda_pdv"] = val_pdv
                vend["venda_total_geral"] = total_fin
                
                vend["projecao_financeira_rotas"] = p_rotas_only
                vend["projecao_financeira_pdv"] = p_pdv_only

                vend["falta_para_meta"] = p_fin_total["falta_para_meta"]
                vend["meta_diaria_necessaria"] = p_fin_total["meta_diaria_necessaria"]
                vend["venda_media_diaria_atual"] = p_fin_total["velocidade_diaria"]
                
                vend["projecoes_detalhadas"] = {
                    "financeiro_total": p_fin_total,
                    "financeiro_rotas": p_rotas_only,
                    "financeiro_pdv": p_pdv_only,
                    "peso": p_peso,
                    "positivacao": p_pos,
                    "mix": p_mix # <--- Opcional: incluir mix no JSON também
                }

            except Exception as e:
                logger.error(f"Erro projecao vendedor {vend.get('codcampo')}: {e}")
        # =========================================================
        # 🔴 FIM DO BLOCO DE PROJEÇÃO
        # =========================================================

        return Response({
            "objetivo": objetivo,
            "objetivos_vendedores": objetivos_vendedores,
            "evolucao": {
                "valor_ano_anterior": round(venda_ano_anterior, 2),
                "percentual": round(evolucao_percentual)  # positivo/negativo
            },
            "objetivos_mix_hierarquico": {
                "empresa": mix_empresa_val,
                "supervisores": mix_supervisores_map
            },
            "pre-venda": {
                "valor_prevenda": round(valor_prevenda, 2),
                "valor_alocado": round(valor_alocado, 2),
                "percentual_prevenda_alocado": round(percentual_prevenda_alocado, 2),
                "variacao_prevenda": round(variacao_prevenda, 2)
            },
            "vendas": vendido,  # já com 'vendas_por_vendedor' + merges + agregados
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
            #  KPIs do vendedor logado =====
            "minha_visao": minha_visao,
            #: escopo por área de supervisão (para gerente) =====
            "escopo_rotas": {
                "e_gerente": rotas_info.get("e_gerente", False),
                "areas_supervisao": grupos_supervisao,  # pode ser None se não for gerente
            },
           "projecao_empresa": {
                "dias_uteis": dias_info,
                "tem_pdv": tem_pdv, 
                "financeiro": projecao_financeira_geral, 
                "financeiro_rotas": proj_rotas_geral, 
                "financeiro_pdv": proj_pdv_geral,
                "peso": projecao_peso_geral,
                "peso_rotas": proj_peso_rotas_geral,
                "positivacao": projecao_positivacao_geral,
                "mix": {
                    "realizado": mix_realizado,
                    "objetivo": objetivo_mix,
                    "percentual": percentual_mix,
                    "projecao": projecao_mix_geral
                },
                "detalhes_valores": {
                    "rotas": venda_realizada, # Certifique-se que esta variável existe (ou venda_realizada_rotas)
                    "pdv": venda_pdv_total,
                    "total": venda_total_empresa
                }
            },
        })
        



    

class ObjetivoMensalView(APIView):
    #permission_classes = [IsAuthenticated]

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
            """print(
                f"[DEBUG][OBJETIVO_MENSAL][IN] usuario={request.user.id}, mes={data.get('mes_referencia')}, "
                f"financeiro={data.get('objetivo_financeiro')}, mix={data.get('objetivo_mix')}, "
                f"peso={data.get('objetivo_peso')}, pos={data.get('objetivo_positivacao')}"
            )"""

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

            print(f"[DEBUG][OBJETIVO_MENSAL][OUT] created={created}, "
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
    

class MinhaUnidGestoraView(APIView):
    def get(self, request):
        ctx = get_role_context(request.user)
        ug = None
        try:
            cod_func = getattr(ctx, "cod_funcionario", None)
            if cod_func is not None:
                ug = obter_unid_gestora(int(cod_func))
        except Exception:
            ug = None

        # Gerente vê PDV de todas as UGs dos seus vendedores
        try:
            rotas_info = buscar_rotas_usuario(ctx)
            e_gerente = rotas_info.get("e_gerente", False)
        except Exception:
            e_gerente = False

        ug_valida = ug and str(ug).strip() not in ('', '1')
        tem_pdv = bool(e_gerente or ug_valida)

        return Response({
            "unid_gestora_usuario": ug,
            "tem_pdv": tem_pdv,
        })

class PDVPorVendedorAPIView(APIView):
    """
    GET /api/indicadores/pdv-por-vendedor/?de=YYYY-MM-DD&ate=YYYY-MM-DD&vendedores=1,2,3

    Para cada vendedor informado:
      - busca as UGs associadas (funcionario_service)
      - soma o PDV nessas UGs no período (pdv_service)
    Retorna um dicionário por vendedor com ugs, pdv.valor, pdv.peso e o detalhado por UG.
    """
    #permission_classes = [IsAuthenticated]

    def get(self, request):
        de = request.query_params.get("de")
        ate = request.query_params.get("ate")
        vendedores_param = request.query_params.get("vendedores")  # "1,2,3"

        if not de or not ate or not vendedores_param:
            return Response(
                {"detail": "Parâmetros obrigatórios: de, ate, vendedores"},
                status=400,
            )

        try:
            vendedor_ids = [int(x) for x in str(vendedores_param).split(",") if str(x).strip().isdigit()]
            if not vendedor_ids:
                return Response({"detail": "Lista de vendedores vazia."}, status=400)
        except Exception:
            return Response({"detail": "Parâmetro 'vendedores' inválido."}, status=400)

        # mapa: vendedor_id -> [UGs...]
        mapa_ugs = obter_unid_gestoras_por_vendedores(vendedor_ids)

        resultado = {}
        for vid in vendedor_ids:
            ugs = mapa_ugs.get(vid, [])
            detalhado = []
            valor = 0.0
            peso = 0.0

            if ugs:
                # filtra PDV apenas nessas UGs
                detalhado = buscar_pdv_por_unid_gestora(de, ate, unid_gestoras=[str(u) for u in ugs])
                valor = sum(float(r.get("ValorProdutos") or 0) for r in detalhado)
                peso  = sum(float(r.get("Peso") or 0) for r in detalhado)

            resultado[vid] = {
                "vendedor_id": vid,
                "ugs": ugs,
                "pdv": {"valor": round(valor, 2), "peso": round(peso, 3)},
                "detalhado": detalhado,  # [{UnidGestora, Qtd, QtdEmbalagem, ValorProdutos, Peso}, ...]
            }
            print(
                f"[PDV-por-vendedor] vid={vid} | "
                f"ugs={ugs} | "
                f"valor={round(valor, 2)} | "
                f"peso={round(peso, 3)} | "
                f"detalhado_len={len(detalhado)}"
            )


        return Response({"resultado": resultado})


class IndicadoresPDV(APIView):
    #permission_classes = [IsAuthenticated]

    def get(self, request):
        data_inicio = request.GET.get("de")
        data_fim = request.GET.get("ate")
        if not data_inicio or not data_fim:
            return Response({"error": "Parâmetros 'de' e 'ate' são obrigatórios."}, status=400)

        # contexto básico (sem filtro por UG)
        ctx = get_role_context(request.user)

        # obter UG do funcionário logado (apenas para informar ao front)
        try:
            cod_func = getattr(ctx, "cod_funcionario", None)
            ug_usuario = obter_unid_gestora(int(cod_func)) if cod_func is not None else None
        except Exception:
            ug_usuario = None  # robustez contra erros

        logger.info(
            "[IndicadoresPDV] user=%s id=%s roles=%s de=%s ate=%s ug_usuario=%s ip=%s",
            getattr(request.user, "username", None),
            getattr(request.user, "id", None),
            ",".join(getattr(ctx, "roles", []) or []) or "-",
            data_inicio,
            data_fim,
            ug_usuario,
            request.META.get("REMOTE_ADDR"),
        )

        try:
            # período atual (agregado por UnidGestora – sem filtro)
            dados_pdv = buscar_vendas_pdv(data_inicio, data_fim)
            venda_realizada_PDV = float(dados_pdv.get("valor_pdv") or 0)
            peso_realizado_PDV = float(dados_pdv.get("peso_pdv") or 0)
            detalhado_atual = dados_pdv.get("detalhado", [])

            # mesmo período do ano anterior (sem filtro)
            ano_anterior_inicio = ajustar_data_para_ano_anterior(data_inicio)
            ano_anterior_fim = ajustar_data_para_ano_anterior(data_fim)
            dados_pdv_aa = buscar_vendas_pdv(ano_anterior_inicio, ano_anterior_fim)
            venda_aa_total = float(dados_pdv_aa.get("valor_pdv", 0) or 0)
            detalhado_aa = dados_pdv_aa.get("detalhado", [])

            return Response({
                "vendas_pdv": {
                    "venda_realizada": venda_realizada_PDV,
                    "peso_realizado": peso_realizado_PDV,
                    "venda_realizada_ano_anterior": venda_aa_total,
                },
                "detalhado_por_unid_gestora": detalhado_atual,     # [{UnidGestora, ValorTotal, Peso, ...}]
                "detalhado_aa_por_unid_gestora": detalhado_aa,     # opcional para comparação por UG
                "unid_gestora_usuario": ug_usuario,                # <- **novo**: UG do usuário logado (ou None)
            })
        except Exception as e:
            logger.exception("Erro em IndicadoresPDV: de=%s ate=%s", data_inicio, data_fim)
            return Response({"error": str(e)}, status=500)


class VendasPorVendedorView(APIView):
    def get(self, request):
        data_inicio = request.GET.get("de")
        data_fim = request.GET.get("ate")

        print("\n============================")
        print("🔥 [VENDAS POR VENDEDOR] INÍCIO")
        print(f"Período solicitado: de={data_inicio} até={data_fim}")
        print("============================")

        if not data_inicio or not data_fim:
            return Response(
                {"error": "Parâmetros 'de' e 'ate' são obrigatórios."},
                status=400
            )

        # === CONTEXTO DO USUÁRIO ===
        ctx = get_role_context(request.user)

        # usa getattr para não quebrar se o atributo não existir
        is_vendedor = getattr(ctx, "is_vendedor", False)
        is_supervisor = getattr(ctx, "is_supervisor", False)
        is_gerente = getattr(ctx, "is_gerente", False)  # 👈 NOVO

        print(f"[DEBUG] Usuário: {request.user}")
        print(
            f"[DEBUG] Papel detectado -> "
            f"vendedor={is_vendedor}, supervisor={is_supervisor}, gerente={is_gerente}"
        )
        print(f"[DEBUG] Cod funcionário: {getattr(ctx, 'cod_funcionario', None)}")
        print("----------------------------")

        rotas_info = buscar_rotas_usuario(ctx)
        vendedores = None

        # === REGRAS DE EXIBIÇÃO (PRIORIDADE: GERENTE > SUPERVISOR > VENDEDOR) ===
        if is_gerente:
            # gerente: não aplica filtro → vê todos
            vendedores = None
            print("[DEBUG] Usuário é GERENTE → NÃO será aplicado filtro de vendedores (acesso a todos).")

        elif is_supervisor:
            # supervisor: usa o escopo já calculado em buscar_rotas_usuario
            vendedores = rotas_info.get("vendedores") if rotas_info else None
            print(f"[DEBUG] Usuário é SUPERVISOR → vendedores do escopo: {vendedores}")

        elif is_vendedor:
            # vendedor: lista apenas ele + colegas da mesma supervisão
            vendedores = buscar_vendedores_mesma_supervisao(ctx.cod_funcionario)
            print(f"[DEBUG] Usuário é VENDEDOR → vendedores da mesma supervisão: {vendedores}")

        else:
            # outros perfis “acima” ou diferentes → também não filtra
            vendedores = None
            print("[DEBUG] Usuário NÃO é vendedor/supervisor/gerente → sem filtro de vendedores (acesso a todos).")

        # helper robusto para int
        def to_int(v):
            try:
                return int(str(v).strip())
            except Exception:
                return None

# --- 1. PREPARA O FILTRO (Restaurado) ---
        vendedores_set = set()
        if vendedores:
            vendedores_set = {to_int(v) for v in vendedores if to_int(v) is not None}
            print(f"[DEBUG] vendedores_set gerado para filtro: {vendedores_set}")

        print("----------------------------")

        # --- 2. BUSCA DADOS NO BANCO (Restaurado - AQUI estava o erro) ---
        resultado = buscar_vendas_por_vendedor(data_inicio, data_fim)
        lista = resultado.get("vendas_por_vendedor", []) or []

        print(f"[DEBUG] Total bruto retornado por buscar_vendas_por_vendedor: {len(lista)} vendedores")

        # === 3. APLICA FILTRO + PREENCHIMENTO (Gap Filling) ===
        if vendedores_set:
            lista_filtrada = [
                item for item in lista
                if to_int(item.get("codcampo")) in vendedores_set
            ]
            
            # --- FIX: Gap Filling (Vendedores sem venda mas no escopo) ---
            existing_ids = {to_int(it.get("codcampo")) for it in lista_filtrada if to_int(it.get("codcampo")) is not None}
            missing_ids = vendedores_set - existing_ids
            
            if missing_ids:
                print(f"[DEBUG] Gap Filling Tabela: Adicionando {len(missing_ids)} vendedores sem venda: {missing_ids}")
                
                # --- BUSCA ROBUSTA DE NOMES ---
                name_map = {}
                
                # Tentativa 1: Todos_Vendedores (Dados Comerciais)
                try:
                    todos = Todos_Vendedores().get("detalhamento", [])
                    for v in todos:
                        # Tenta pegar código e nome com variações de chave
                        c = v.get("CodFuncionario") or v.get("cod_funcionario")
                        n = v.get("Funcionario") or v.get("Nome") or v.get("nome")
                        if c and n:
                            try:
                                # Salva como INT e STRING para garantir o match
                                name_map[int(c)] = n.strip()
                                name_map[str(c).strip()] = n.strip()
                            except: pass
                except Exception as e:
                    print(f"[DEBUG] Erro ao carregar Todos_Vendedores: {e}")

                # Tentativa 2: listar_funcionarios (Dados de Cadastro - Fallback)
                if len(name_map) < len(missing_ids):
                    try:
                        from dashboard.services.usuarios.funcionario_service import listar_funcionarios
                        funcs = listar_funcionarios()
                        for f in funcs:
                            c = f.get("codigo") or f.get("id")
                            n = f.get("nome") or f.get("usuario")
                            if c and n:
                                try:
                                    name_map[int(c)] = n.strip()
                                    name_map[str(c).strip()] = n.strip()
                                except: pass
                    except Exception as e:
                        print(f"[DEBUG] Erro ao carregar listar_funcionarios: {e}")

                # Preenchimento
                for mid in missing_ids:
                    # Busca o nome no mapa (tenta como int e str)
                    nome = name_map.get(mid) or name_map.get(str(mid)) or f"Vendedor {mid}"
                    
                    lista_filtrada.append({
                        "codcampo": str(mid),
                        "Campo": nome, # Agora deve vir o nome correto!
                        "ValorLiquido": 0.0,
                        "PesoTotal": 0.0,
                        "Mix": 0,
                        "QtdClientes": 0,
                        "PreVenda_Valor": 0.0,
                        "Ruptura_TotalValor": 0.0,
                        "Positivacao_Realizado": 0.0,
                        "Ano_anterior_QtdClientes": 0,
                        "Ano_anterior_ValorLiquido": 0,
                        "Ano_anterior_PesoTotal": 0,
                        "Ano_anterior_Mix": 0
                    })

            print(
                f"[DEBUG] Filtro APLICADO → de {len(lista)} foram mantidos "
                f"{len(lista_filtrada)} vendedores (com gap filling)."
            )
            resultado["vendas_por_vendedor"] = lista_filtrada
            
        # Atualiza a lista final
        lista = resultado.get("vendas_por_vendedor", [])
        print(f"[DEBUG] Total bruto retornado por buscar_vendas_por_vendedor: {len(lista)} vendedores")

        # === APLICA FILTRO (somente se houver lista de vendedores) ===
        if vendedores_set:
            lista_filtrada = [
                item for item in lista
                if to_int(item.get("codcampo")) in vendedores_set
            ]
            print(
                f"[DEBUG] Filtro APLICADO → de {len(lista)} foram mantidos "
                f"{len(lista_filtrada)} vendedores."
            )
            resultado["vendas_por_vendedor"] = lista_filtrada
        else:
            print("[DEBUG] Nenhum filtro aplicado → mantendo TODOS os vendedores retornados.")

        print("----------------------------")
        print("[DEBUG] Iniciando cálculo de pré-venda…")

        chave = f"prevenda_{data_inicio}_{data_fim}"
        prevenda = buscar_pre_venda(data_inicio, data_fim)

        prevenda_por_vendedor = defaultdict(float)
        for item in prevenda.get("detalhado", []):
            cod_vend = to_int(item.get("CodVendedor"))
            if cod_vend is None:
                continue
            valor = float(item.get("Valor", 0) or 0)
            prevenda_por_vendedor[cod_vend] += valor
        
        print("[DEBUG] Iniciando cálculo de cupons PDV...")
        lista_cupons = buscar_cupons_por_vendedor(data_inicio, data_fim)
        
        # Cria um dicionário para facilitar a busca por código do vendedor
        cupons_por_vendedor = {}
        for c in lista_cupons:
            cod_vend = to_int(c.get("CodVendedor"))
            if cod_vend is not None:
                cupons_por_vendedor[cod_vend] = {
                    "quantidade": c.get("QuantidadeCupons", 0),
                    "valor": float(c.get("ValorTotalCupons", 0) or 0)
                }

        print(f"[DEBUG] Pré-venda calculada para {len(prevenda_por_vendedor)} vendedores")

        # Enriquecendo vendedores
        for vendedor in resultado.get("vendas_por_vendedor", []):
            codcampo_int = to_int(vendedor.get("codcampo"))
            valor_prevenda = prevenda_por_vendedor.get(codcampo_int, 0.0)
            # Pega os cupons (se não tiver, retorna 0)
            dados_cupom = cupons_por_vendedor.get(codcampo_int, {"quantidade": 0})
            valor_realizado = float(vendedor.get("ValorLiquido", 0) or 0)
            vendedor["pre-venda"] = round(valor_prevenda, 2)
            vendedor["alocado"] = round(valor_realizado + valor_prevenda, 2)
            # Adiciona as novas chaves no dicionário do vendedor que vai para o FrontEnd
            vendedor["cupons_quantidade"] = dados_cupom["quantidade"]

            print(
                f"[DEBUG] Vendedor {codcampo_int}: "
                f"ValorLiquido={valor_realizado}, prevenda={valor_prevenda}, alocado={vendedor['alocado']}"
                f" Cupons(Qtd)={dados_cupom['quantidade']}, "
            )

        print("🔥 [VENDAS POR VENDEDOR] FIM")
        print("============================\n")

        return Response({"resultado": resultado})

class ObjetivoMensalVendedorView(APIView):
    #permission_classes = [IsAuthenticated]

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

                """print(
                    f"[DEBUG][OBJ-VEND ITEM] vendedor_id={vendedor_id}, nome={nome}, "
                    f"financeiro={valor_fin}, mix={valor_mix}, peso={valor_peso}, pos={valor_pos}"
                )"""

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

        """print(
            f"[DEBUG][OBJETIVO_MENSAL][TOTAL] usuario={request.user.id}, mes={mes_referencia}, "
            f"fin={total_empresa_fin}, mix={total_empresa_mix}, peso={total_empresa_peso}, pos={total_empresa_pos}"
        )"""
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
        """print("dados de cadastro",validated_data)"""
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
        from django.db.models import Q  # Importação necessária para filtros OR
        
        search = request.query_params.get('search', '')
        
        # 1. Identifica o Papel do Usuário
        ctx = get_role_context(request.user)
        is_gerente = getattr(ctx, "is_gerente", False) or request.user.is_superuser
        is_supervisor = getattr(ctx, "is_supervisor", False)
        is_vendedor = getattr(ctx, "is_vendedor", False)

        # 2. Query Base de Usuários
        users_qs = User.objects.filter(username__icontains=search)

        # 3. Aplica Filtros de Permissão
        if is_gerente:
            # Gerente vê todos -> Não aplica filtro extra
            pass
            
        elif is_supervisor:
            # Supervisor vê: Ele mesmo + Vendedores da sua equipe
            rotas_info = buscar_rotas_usuario(ctx)
            vendedores_ids = rotas_info.get("vendedores", []) if rotas_info else []
            
            # Converte para string para garantir match com o campo do Profile
            vendedores_ids_str = [str(v) for v in vendedores_ids if v is not None]
            
            users_qs = users_qs.filter(
                Q(pk=request.user.pk) |  # Ele mesmo
                Q(profile__cod_funcionario__in=vendedores_ids_str)  # Sua equipe
            ).distinct()

        elif is_vendedor:
            # Vendedor vê apenas a si mesmo
            users_qs = users_qs.filter(pk=request.user.pk)
            
        else:
            # Fallback (outros perfis): vê apenas a si mesmo por segurança
            users_qs = users_qs.filter(pk=request.user.pk)

        # 4. Monta a Resposta
        users = users_qs.values(
            'id', 'username', 'first_name', 'last_name', 'email', 'is_active', 'is_staff'
        )
        
        # Lista de funcionários do ERP (para cadastro de novos)
        # Mantemos aberta para busca, mas a edição (acima) já está restrita
        funcionarios = listar_funcionarios(search=search)
        
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


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    # 1. Serializa e destrava o dicionário
    serializer = MeSerializer(request.user)
    user_data = dict(serializer.data)
    
    # 2. Obtém o contexto e a regra de rotas
    try:
        ctx = get_role_context(request.user)
        
        # --- A CORREÇÃO MÁGICA AQUI ---
        # Consultamos a mesma lógica que a tela de Indicadores usa
        rotas_info = buscar_rotas_usuario(ctx)
        eh_gerente_por_rota = rotas_info.get("e_gerente", False)
        # ------------------------------
        
    except Exception as e:
        print(f"DEBUG: Erro ao obter contexto/rotas: {e}")
        ctx = None
        eh_gerente_por_rota = False

    # 3. Injeta as permissões
    if ctx:
        user_data['cod_funcionario']  = getattr(ctx, 'cod_funcionario', None)
        user_data['cod_unid_gestora'] = getattr(ctx, 'cod_unid_gestora', None)
        
        user_data['supervisor'] = getattr(ctx, "is_supervisor", False)
        user_data['vendedor']   = getattr(ctx, "is_vendedor", False)
        user_data['admin']      = getattr(ctx, "is_admin", False)
        
        # REGRA FINAL: É gerente se o contexto diz OU se as rotas dizem
        val_gerente = getattr(ctx, "is_gerente", False) or eh_gerente_por_rota or request.user.is_superuser
        user_data['gerente']    = val_gerente
        user_data['is_gerente'] = val_gerente
    else:
        # Fallback
        user_data['is_gerente'] = False

    return Response(user_data)

class TodosVendedoresView(APIView):
    # permission_classes = [IsAuthenticated]

    def get(self, request):
        # Verifica se o front pediu apenas ativos
        apenas_ativos_param = request.query_params.get('ativos')
        
        # Converte string 'true'/'1' para boolean
        somente_ativos = apenas_ativos_param in ['true', 'True', '1']

        # Chama o serviço passando o flag
        vendedores = Todos_Vendedores(somente_ativos=somente_ativos)
        
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


class ObjetivoMixNivelView(APIView):
    # permission_classes = [IsAuthenticated] # Habilite conforme sua segurança

    def get(self, request):
        """
        GET /objetivos-mix-nivel/?mes=YYYY-MM-DD
        Retorna todas as metas hierárquicas daquele mês.
        """
        mes_str = request.query_params.get('mes')
        if not mes_str:
            return Response({"error": "Parâmetro 'mes' (YYYY-MM-DD) obrigatório."}, status=400)

        # Ajusta para o dia 01 para garantir consistência
        try:
            data_ref = datetime.strptime(mes_str, "%Y-%m-%d").date().replace(day=1)
        except ValueError:
            return Response({"error": "Formato de data inválido."}, status=400)

        # Busca no banco
        metas = ObjetivoMixNivel.objects.filter(mes_referencia=data_ref)
        serializer = ObjetivoMixNivelSerializer(metas, many=True)
        return Response(serializer.data)

    def post(self, request):
        """
        POST /objetivos-mix-nivel/
        Payload esperado:
        {
            "mes_referencia": "2026-01-01",
            "metas": [
                {"nivel": "EMPRESA", "codigo_alvo": 0, "objetivo_mix": 500},
                {"nivel": "SUPERVISOR", "codigo_alvo": 241, "objetivo_mix": 150},
                {"nivel": "UNID_GESTORA", "codigo_alvo": 1, "objetivo_mix": 300}
            ]
        }
        """
        data = request.data
        mes_str = data.get("mes_referencia")
        metas_list = data.get("metas", [])

        if not mes_str or not isinstance(metas_list, list):
            return Response({"error": "Payload inválido. Informe 'mes_referencia' e lista 'metas'."}, status=400)

        try:
            data_ref = datetime.strptime(mes_str, "%Y-%m-%d").date().replace(day=1)
        except ValueError:
            return Response({"error": "Data inválida."}, status=400)

        response_data = []
        
        with transaction.atomic():
            for item in metas_list:
                nivel = item.get("nivel")
                codigo = item.get("codigo_alvo", 0)
                valor = item.get("objetivo_mix", 0)

                if not nivel: 
                    continue

                obj, created = ObjetivoMixNivel.objects.update_or_create(
                    mes_referencia=data_ref,
                    nivel=nivel,
                    codigo_alvo=codigo,
                    defaults={"objetivo_mix": valor}
                )
                response_data.append({
                    "nivel": nivel, 
                    "codigo": codigo, 
                    "mix": valor, 
                    "status": "created" if created else "updated"
                })

        return Response({"message": "Metas de Mix processadas com sucesso.", "detalhes": response_data})