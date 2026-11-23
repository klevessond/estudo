"""Mix de itens, positivação de clientes e comissões. Movido de main_views.py."""
import logging

from rest_framework.response import Response
from rest_framework.views import APIView

from dashboard.roles import get_role_context
from dashboard.services.indicadores.pdv_mix_service import (
    buscar_itens_mix_por_ug,
    buscar_itens_nao_vendidos_por_ug,
)
from dashboard.services.indicadores.vendas_service import (
    buscar_clientes_positivacao_lista,
    buscar_comissoes_vendedor,
    buscar_itens_mix_por_vendedor,
    buscar_itens_nao_vendidos_por_vendedor,
)
from dashboard.services.usuarios.funcionario_service import obter_unid_gestoras_por_vendedores

logger = logging.getLogger(__name__)


class ComissoesVendedorView(APIView):
    def get(self, request):
        cod_vendedor = request.query_params.get("cod_vendedor")
        de  = request.query_params.get("de")
        ate = request.query_params.get("ate")

        if not cod_vendedor:
            return Response({"error": "Parâmetro 'cod_vendedor' obrigatório."}, status=400)
        try:
            cod_vendedor = int(cod_vendedor)
        except ValueError:
            return Response({"error": "cod_vendedor deve ser inteiro."}, status=400)

        # Segurança: vendedor só pode ver a própria comissão
        ctx = get_role_context(request.user)
        is_vendedor_puro = (
            getattr(ctx, "is_vendedor", False)
            and not getattr(ctx, "is_supervisor", False)
            and not getattr(ctx, "is_gerente", False)
            and not getattr(ctx, "is_admin", False)
        )
        if is_vendedor_puro and int(ctx.cod_funcionario or 0) != cod_vendedor:
            return Response({"error": "Acesso negado."}, status=403)

        try:
            dados = buscar_comissoes_vendedor(cod_vendedor, data_inicio=de, data_fim=ate)
            return Response(dados)
        except Exception as e:
            logger.exception("Erro em ComissoesVendedorView: cod=%s", cod_vendedor)
            return Response({"error": str(e)}, status=500)


class ClientesPositivacaoView(APIView):
    def get(self, request):
        de           = request.GET.get("de")
        ate          = request.GET.get("ate")
        cod_vend     = request.GET.get("cod_vendedor")
        positivados  = request.GET.get("positivados", "true").lower() == "true"

        if not de or not ate or not cod_vend:
            return Response({"error": "Parâmetros obrigatórios: de, ate, cod_vendedor"}, status=400)

        try:
            cod_vend_int = int(cod_vend)
            
            # A MÁGICA ESTÁ AQUI: Usar a mesma função da visão de Área!
            clientes = buscar_clientes_positivacao_lista(
                de, ate, cod_vend_int, apenas_positivados=positivados
            )

            # Organiza alfabeticamente pela Rota e depois pelo Cliente
            clientes.sort(key=lambda x: (x.get("Rota",""), x.get("Cliente","")))
            
            return Response({
                "clientes": clientes, 
                "total": len(clientes), 
                "positivados": positivados
            })
            
        except Exception:
            logger.exception("[ClientesPositivacaoView] erro")
            return Response({"error": "Erro interno"}, status=500)


class MixItensPorVendedorView(APIView):
    def get(self, request):
        de       = request.GET.get("de")
        ate      = request.GET.get("ate")
        cod_vend = request.GET.get("cod_vendedor")
        ordem    = request.GET.get("ordem",   "top")
        criterio = request.GET.get("criterio", "qtd")
        modo     = request.GET.get("modo",    "vendidos")  
        total_qtd   = float(request.GET.get("total_qtd",   0) or 0)
        total_valor = float(request.GET.get("total_valor", 0) or 0)

        if not de or not ate or not cod_vend:
            return Response({"error": "Parâmetros obrigatórios: de, ate, cod_vendedor"}, status=400)

        try:
            cod_vend_int = int(cod_vend)
        except ValueError:
            return Response({"error": "cod_vendedor inválido"}, status=400)

        try:
            # Busca UGs do vendedor
            raw_ugs = obter_unid_gestoras_por_vendedores([cod_vend_int])
            ugs = [str(u) for u in raw_ugs.get(cod_vend_int, [])
                   if str(u).strip() and str(u) != "1"]

            if ugs:
                if modo == "nao_vendidos":
                    itens = buscar_itens_nao_vendidos_por_ug(de, ate, ugs)
                else:
                    itens = buscar_itens_mix_por_ug(de, ate, ugs, ordem=ordem, criterio=criterio)
            else:
                if modo == "nao_vendidos":
                    itens = buscar_itens_nao_vendidos_por_vendedor(de, ate, cod_vend_int)
                else:
                    itens = buscar_itens_mix_por_vendedor(de, ate, cod_vend_int, ordem=ordem, criterio=criterio)

            return Response({"itens": itens, "modo": modo, "criterio": criterio, "total_mix": len(itens)})

        except Exception:
            logger.exception("[MixItensPorVendedorView] erro")
            return Response({"error": "Erro interno"}, status=500)


class MixItensAreaView(APIView):
    """
    Mix de itens para supervisor (suas UGs) ou gerente (filtro de área).
    Recebe: vendedores=178,190,224,242 ou cod_supervisao=4
    """
    def get(self, request):
        de          = request.GET.get("de")
        ate         = request.GET.get("ate")
        vendedores  = request.GET.get("vendedores", "")  # "178,190,224,242"
        modo        = request.GET.get("modo",     "vendidos")
        criterio    = request.GET.get("criterio", "qtd")
        ordem       = request.GET.get("ordem",    "top")
        total_valor = float(request.GET.get("total_valor", 0) or 0)
        total_qtd   = float(request.GET.get("total_qtd",   0) or 0)

        if not de or not ate or not vendedores:
            return Response({"error": "Parâmetros obrigatórios: de, ate, vendedores"}, status=400)

        try:
            ids = [int(v.strip()) for v in vendedores.split(",") if v.strip()]
        except ValueError:
            return Response({"error": "vendedores inválidos"}, status=400)

        try:
            # Coleta todas as UGs do grupo
            raw_ugs = obter_unid_gestoras_por_vendedores(ids)
            todas_ugs = list(dict.fromkeys(
                str(u) for ugs in raw_ugs.values()
                for u in ugs if str(u).strip() and str(u) != "1"
            ))

            if todas_ugs:
                if modo == "nao_vendidos":
                    itens = buscar_itens_nao_vendidos_por_ug(de, ate, todas_ugs)
                else:
                    itens = buscar_itens_mix_por_ug(
                        de, ate, todas_ugs, ordem=ordem, criterio=criterio,
                         total_qtd_ref=total_qtd, total_valor_ref=total_valor,
                    )
            else:
                from collections import defaultdict
                mapa: dict = {}  # CodMaterial → linha agregada
                for vid in ids:
                    if modo == "nao_vendidos":
                        parcial = buscar_itens_nao_vendidos_por_vendedor(de, ate, vid)
                    else:
                        parcial = buscar_itens_mix_por_vendedor(
                            de, ate, vid, ordem=ordem, criterio=criterio,
                             total_qtd_ref=total_qtd, total_valor_ref=total_valor,
                        )
                    for item in parcial:
                        cod = item["CodMaterial"]
                        if cod not in mapa:
                            mapa[cod] = dict(item)
                        else:
                            mapa[cod]["QtdItens"]   += item["QtdItens"]
                            mapa[cod]["ValorTotal"] += item["ValorTotal"]
                            mapa[cod]["Desconto"]   += item.get("Desconto", 0)
                            mapa[cod]["Peso"]       += item.get("Peso", 0)

                itens = sorted(mapa.values(),
                            key=lambda x: x["ValorTotal"] if criterio == "valor" else x["QtdItens"],
                            reverse=True)

                # Recalcula percentuais sobre o total agregado
                total_q = total_qtd  if total_qtd  > 0 else sum(r["QtdItens"]   for r in itens)
                total_v = total_valor if total_valor > 0 else sum(r["ValorTotal"] for r in itens)
                for r in itens:
                    r["PercQtd"]   = round(r["QtdItens"]   / total_q * 100, 2) if total_q else 0
                    r["PercValor"] = round(r["ValorTotal"]  / total_v * 100, 2) if total_v else 0

            return Response({"itens": itens, "modo": modo, "total": len(itens)})

        except Exception:
            logger.exception("[MixItensAreaView] erro")
            return Response({"error": "Erro interno"}, status=500)


class ClientesPositivacaoAreaView(APIView):
    def get(self, request):
        de          = request.GET.get("de")
        ate         = request.GET.get("ate")
        vendedores  = request.GET.get("vendedores", "")
        positivados = request.GET.get("positivados", "true").lower() == "true"

        if not de or not ate or not vendedores:
            return Response({"error": "Parâmetros obrigatórios: de, ate, vendedores"}, status=400)

        try:
            ids = [int(v.strip()) for v in vendedores.split(",") if v.strip()]
        except ValueError:
            return Response({"error": "vendedores inválidos"}, status=400)

        try:
            todos = []
            for vid in ids:
                clientes = buscar_clientes_positivacao_lista(
                    de, ate, vid, apenas_positivados=positivados
                )
                todos.extend(clientes)

            # Dedup por CodCliente mantendo ordem por Rota/Cliente
            vistos = set()
            dedup = []
            for c in todos:
                cod = c.get("CodCliente")
                if cod not in vistos:
                    vistos.add(cod)
                    dedup.append(c)

            dedup.sort(key=lambda x: (x.get("Rota",""), x.get("Cliente","")))

            return Response({
                "clientes"  : dedup,
                "total"     : len(dedup),
                "positivados": positivados,
            })

        except Exception:
            logger.exception("[ClientesPositivacaoAreaView] erro")
            return Response({"error": "Erro interno"}, status=500)
