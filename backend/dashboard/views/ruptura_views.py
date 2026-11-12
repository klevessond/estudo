"""Ruptura de vendas (resumo e detalhamento por item). Movido de main_views.py."""
import logging

from rest_framework.response import Response
from rest_framework.views import APIView

from dashboard.services.indicadores.ruptura_service import (
    buscar_ruptura,
    buscar_ruptura_itens_detalhado,
)

logger = logging.getLogger(__name__)


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


class RupturaItensView(APIView):
    """
    Detalhamento da ruptura por ITEM (Material) — usado pelo modal "Detalhar"
    do card Captado (IndicativosDeVenda) e pela aba Ruptura (CardsDetalhadosVendedor).

    Recebe: de, ate, vendedores=178,190,224 (CSV), criterio=valor|qtd (default: valor)
    """
    def get(self, request):
        de         = request.GET.get("de")
        ate        = request.GET.get("ate")
        vendedores = request.GET.get("vendedores", "")
        criterio   = request.GET.get("criterio", "valor")
        fabricante = request.GET.get("fabricante")  # opcional: CodFabricante

        if not de or not ate or not vendedores:
            return Response({"error": "Parâmetros obrigatórios: de, ate, vendedores"}, status=400)

        try:
            ids = [int(v.strip()) for v in vendedores.split(",") if v.strip()]
        except ValueError:
            return Response({"error": "vendedores inválidos"}, status=400)

        if not ids:
            return Response({"error": "Nenhum vendedor válido informado"}, status=400)

        cod_fabricante = None
        if fabricante not in (None, "", "todos", "Todos"):
            try:
                cod_fabricante = int(fabricante)
            except ValueError:
                return Response({"error": "fabricante inválido"}, status=400)

        try:
            resultado = buscar_ruptura_itens_detalhado(
                de, ate, cod_vendedores=ids, criterio=criterio, cod_fabricante=cod_fabricante
            )
            return Response(resultado)
        except Exception:
            logger.exception("[RupturaItensView] erro")
            return Response({"error": "Erro interno"}, status=500)
