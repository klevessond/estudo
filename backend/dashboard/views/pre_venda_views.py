"""Status e itens de pré-venda. Movido de main_views.py."""
import logging

from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from dashboard.roles import get_role_context
from dashboard.services.indicadores.pre_venda_status_service import (
    buscar_itens_pre_venda,
    buscar_status_pre_vendas,
)
from dashboard.services.indicadores.rotas_simples import buscar_rotas_usuario

logger = logging.getLogger(__name__)


class PreVendaStatusView(APIView):
    """
    Retorna pré-vendas pendentes (não processadas ou com problema) do período.

    Regras de acesso:
      - GERENTE     → sem filtro de vendedores (vê todos), pode filtrar por ?vendedores=1,2,3
      - SUPERVISOR  → apenas seus vendedores (escopo do buscar_rotas_usuario)
      - VENDEDOR    → apenas ele mesmo

    Query params:
      de          (obrigatório) YYYY-MM-DD
      ate         (obrigatório) YYYY-MM-DD
      vendedores  (opcional)    "178,190,224" — filtro extra para gerente
    """

    def get(self, request):
        de  = request.GET.get("de")
        ate = request.GET.get("ate")

        if not de or not ate:
            return Response({"error": "Parâmetros obrigatórios: de, ate"}, status=400)

        try:
            ctx           = get_role_context(request.user)
            is_gerente    = getattr(ctx, "is_gerente",    False)
            is_supervisor = getattr(ctx, "is_supervisor", False)
            is_vendedor   = getattr(ctx, "is_vendedor",   False)

            # Determina o filtro de vendedores conforme o papel
            # lê o parâmetro uma vez, antes de qualquer if
            param_vend = request.GET.get("vendedores", "")
            solicitados = [int(v.strip()) for v in param_vend.split(",") if v.strip().isdigit()] if param_vend else []

            if is_gerente:
                cod_vendedores = solicitados if solicitados else None

            elif is_supervisor:
                rotas_info = buscar_rotas_usuario(ctx)
                permitidos = set(rotas_info.get("vendedores") or []) if rotas_info else set()
                if solicitados:
                    cod_vendedores = [v for v in solicitados if v in permitidos] or list(permitidos)  # ← intersecta
                else:
                    cod_vendedores = list(permitidos) if permitidos else None

            elif is_vendedor:
                cod_vendedores = [int(ctx.cod_funcionario)]

            else:
                cod_vendedores = solicitados if solicitados else None

            pendencias = buscar_status_pre_vendas(
                data_inicio    = de,
                data_fim       = ate,
                cod_vendedores = cod_vendedores,
            )

            # Agrupa contadores por situação para facilitar o front
            total_nao_processadas = sum(1 for p in pendencias if p["Situacao"] == "NAO_PROCESSADA")
            total_com_problema    = sum(1 for p in pendencias if p["Situacao"] == "COM_PROBLEMA")

            return Response({
                "pendencias"          : pendencias,
                "total"               : len(pendencias),
                "total_nao_processadas": total_nao_processadas,
                "total_com_problema"  : total_com_problema,
            })

        except Exception:
            logger.exception("[PreVendaStatusView] erro")
            return Response({"error": "Erro interno"}, status=500)


class PreVendaItensView(APIView):
    """
    Retorna os itens de uma pré-venda específica (CodPocket + CodDoc),
    usado no botão "Pré-venda Detalhada" do modal de pendências.

    Query params:
      cod_pocket  (obrigatório)
      cod_doc     (obrigatório)
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        cod_pocket = request.GET.get("cod_pocket")
        cod_doc    = request.GET.get("cod_doc")

        if not cod_pocket or not cod_doc:
            return Response({"error": "Parâmetros obrigatórios: cod_pocket, cod_doc"}, status=400)

        try:
            itens = buscar_itens_pre_venda(
                cod_pocket=int(cod_pocket),
                cod_doc=int(cod_doc),
            )
            valor_total = sum(i["ValorTotal"] for i in itens)

            return Response({
                "itens": itens,
                "total_itens": len(itens),
                "valor_total": round(valor_total, 2),
            })
        except Exception:
            logger.exception("[PreVendaItensView] erro")
            return Response({"error": "Erro interno"}, status=500)
