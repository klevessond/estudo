"""Indicadores e vendas de PDV (cupons). Movido de main_views.py."""
import logging
from datetime import datetime

from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from dashboard.roles import get_role_context
from dashboard.services.indicadores.cache_mes import (
    get_cache_mes,
    periodo_cacheavel,
    set_cache_mes,
)
from dashboard.services.indicadores.pdv_service import (
    buscar_pdv_por_unid_gestora,
    buscar_vendas_pdv,
)
from dashboard.services.indicadores.rotas_simples import buscar_rotas_usuario
from dashboard.services.usuarios.funcionario_service import (
    obter_unid_gestora,
    obter_unid_gestoras_por_vendedores,
)

logger = logging.getLogger(__name__)


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
            dados_pdv = get_cache_mes("vendas_pdv", data_inicio, data_fim)
            if dados_pdv is None:
                dados_pdv = buscar_vendas_pdv(data_inicio, data_fim)
                set_cache_mes("vendas_pdv", data_inicio, data_fim, dados_pdv)
            venda_realizada_PDV = float(dados_pdv.get("valor_pdv") or 0)
            peso_realizado_PDV = float(dados_pdv.get("peso_pdv") or 0)
            detalhado_atual = dados_pdv.get("detalhado", [])

            # mesmo período do ano anterior (sem filtro)
            # ano anterior do PDV — mesma lógica condicional das rotas:
            # mês atual → vai só até o equivalente de "hoje" no ano anterior
            # mês passado → usa o mês completo
            from datetime import date as _date
            _de_dt  = datetime.strptime(data_inicio, "%Y-%m-%d").date()
            _ate_dt = datetime.strptime(data_fim,    "%Y-%m-%d").date()
            _hoje   = _date.today()

            def _sub_ano(d):
                try:
                    return d.replace(year=d.year - 1)
                except ValueError:
                    return d.replace(year=d.year - 1, day=28)

            ano_anterior_inicio = _sub_ano(_de_dt).strftime("%Y-%m-%d")

            if _de_dt.year == _hoje.year and _de_dt.month == _hoje.month:
                # mês atual: limita ao dia equivalente de hoje no ano anterior
                _aa_ini = _sub_ano(_de_dt)
                _last   = (31 if _aa_ini.month in (1,3,5,7,8,10,12)
                           else 30 if _aa_ini.month in (4,6,9,11)
                           else 29 if (_aa_ini.year % 4 == 0 and (_aa_ini.year % 100 != 0 or _aa_ini.year % 400 == 0))
                           else 28)
                ano_anterior_fim = _date(_aa_ini.year, _aa_ini.month, min(_hoje.day, _last)).strftime("%Y-%m-%d")
            else:
                # mês passado: mês completo do ano anterior
                ano_anterior_fim = _sub_ano(_ate_dt).strftime("%Y-%m-%d")

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
