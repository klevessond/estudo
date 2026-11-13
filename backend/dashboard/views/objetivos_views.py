"""Objetivos mensais (por usuário, por vendedor e de mix por nível).

Movido de main_views.py sem alteração de lógica. As funções
get_objetivo_mensal_serializado e get_objetivos_vendedores_por_mes são
consumidas pela IndicadoresView; a ida delas para objetivos_service.py
fica para a etapa de extração de regras de negócio.
"""
import logging
from datetime import datetime

from django.contrib.auth import get_user_model
from django.db import transaction
from django.db.models import Sum
from rest_framework.response import Response
from rest_framework.views import APIView

from dashboard.models import ObjetivoMensal, ObjetivoMensalVendedor, ObjetivoMixNivel
from dashboard.serializers import ObjetivoMensalSerializer, ObjetivoMixNivelSerializer

from ._helpers import _meses_no_periodo

User = get_user_model()
logger = logging.getLogger(__name__)


class ObjetivoMensalView(APIView):

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

            logger.debug(f"[DEBUG][OBJETIVO_MENSAL][OUT] created={created}, "
                     f"financeiro={objetivo.objetivo_financeiro}, mix={objetivo.objetivo_mix}, "
                     f"peso={objetivo.objetivo_peso}, pos={objetivo.objetivo_positivacao}")
            return Response(ObjetivoMensalSerializer(objetivo).data)
        return Response(serializer.errors, status=400)


class ObjetivoMensalResumoView(APIView):

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


def get_objetivo_mensal_serializado(user, data_inicio, data_fim=None, cod_vendedores=None):
    try:
        if user.is_anonymous:
            user = User.objects.filter(is_superuser=True).first()
 
        meses    = _meses_no_periodo(data_inicio, data_fim or data_inicio)
        num_meses = max(len(meses), 1)
 
        if cod_vendedores:
            ids = [str(v) for v in cod_vendedores]
            agg = ObjetivoMensalVendedor.objects.filter(
                mes_referencia__in=meses,
                vendedor_id__in=ids
            ).aggregate(
                objetivo_financeiro=Sum('objetivo_financeiro'),
                objetivo_mix=Sum('objetivo_mix'),
                objetivo_peso=Sum('objetivo_peso'),
                objetivo_positivacao=Sum('objetivo_positivacao'),
            )
        else:
            agg = ObjetivoMensal.objects.filter(
                usuario=user,
                mes_referencia__in=meses
            ).aggregate(
                objetivo_financeiro=Sum('objetivo_financeiro'),
                objetivo_mix=Sum('objetivo_mix'),
                objetivo_peso=Sum('objetivo_peso'),
                objetivo_positivacao=Sum('objetivo_positivacao'),
            )
 
        return {
            # Financeiro e Peso: SOMA (acumulam no tempo)
            "objetivo_financeiro": float(agg.get('objetivo_financeiro') or 0),
            "objetivo_peso":       float(agg.get('objetivo_peso') or 0),
            # Mix e Positivação: MÉDIA (metas mensais recorrentes)
            "objetivo_mix":         round(float(agg.get('objetivo_mix') or 0) / num_meses, 1),
            "objetivo_positivacao": round(float(agg.get('objetivo_positivacao') or 0) / num_meses, 1),
        }
    except Exception:
        return {"objetivo_financeiro": 0, "objetivo_mix": 0,
                "objetivo_peso": 0,       "objetivo_positivacao": 0}


class ObjetivoMensalVendedorView(APIView):

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


def get_objetivos_vendedores_por_mes(data_inicio, data_fim=None):
    meses    = _meses_no_periodo(data_inicio, data_fim or data_inicio)
    num_meses = max(len(meses), 1)
 
    from django.db.models import Sum as DjangoSum
    qs = (
        ObjetivoMensalVendedor.objects
        .filter(mes_referencia__in=meses)
        .values('vendedor_id', 'nome_vendedor')
        .annotate(
            objetivo_financeiro=DjangoSum('objetivo_financeiro'),
            objetivo_mix=DjangoSum('objetivo_mix'),
            objetivo_peso=DjangoSum('objetivo_peso'),
            objetivo_positivacao=DjangoSum('objetivo_positivacao'),
        )
    )
    return [
        {
            "vendedor_id":   row['vendedor_id'],
            "nome_vendedor": row['nome_vendedor'],
            # Financeiro e Peso: SOMA
            "objetivo_financeiro": float(row['objetivo_financeiro'] or 0),
            "objetivo_peso":       float(row['objetivo_peso'] or 0),
            # Mix e Positivação: MÉDIA mensal
            "objetivo_mix":         round(float(row['objetivo_mix'] or 0) / num_meses, 1),
            "objetivo_positivacao": round(float(row['objetivo_positivacao'] or 0) / num_meses, 1),
        }
        for row in qs
    ]


class ObjetivoMixNivelView(APIView):

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
