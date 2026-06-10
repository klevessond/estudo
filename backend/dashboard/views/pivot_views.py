# dashboard/views/pivot_views.py
import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from dashboard.services.indicadores.pivot_service import buscar_dump_vendas

# Configuração do Logger local do arquivo
logger = logging.getLogger(__name__)

class PivotVendasView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        de  = request.GET.get('de')
        ate = request.GET.get('ate')

        # LOG 1: Entrada da Requisição e identificação do usuário autenticado
        logger.info(
            f"[PivotVendasView] Requisição HTTP GET recebida. "
            f"Usuário: {request.user.username} (ID: {request.user.id}) | "
            f"Query Params enviados -> de: '{de}', ate: '{ate}'"
        )

        if not de or not ate:
            # LOG 2: Alerta de requisição inconsistente
            logger.warning(
                f"[PivotVendasView] Falha na validação de parâmetros. "
                f"Valores recebidos -> de: {repr(de)}, ate: {repr(ate)}"
            )
            return Response(
                {'error': "Parâmetros obrigatórios: 'de' e 'ate'."},
                status=400
            )

        try:
            # LOG 3: Execução da Procedure/Query SQL via service
            logger.info(f"[PivotVendasView] Disparando query no Banco de Dados para o período: {de} até {ate}")
            dados = buscar_dump_vendas(de, ate)
            
            # LOG 4: Confirmação de volumetria extraída do PyODBC
            total_linhas = len(dados) if isinstance(dados, list) else 0
            logger.info(
                f"[PivotVendasView] Banco de dados respondeu com sucesso. "
                f"Total de registros recuperados e enviados ao front: {total_linhas} linhas."
            )
            
            return Response({'resultado': dados})
            
        except Exception as e:
            # LOG 5: Captura automática do traceback completo da stack trace
            logger.exception(
                f"[PivotVendasView] Exceção disparada ao processar pivô de vendas "
                f"no intervalo de {de} a {ate}. Motivo: {str(e)}"
            )
            return Response({'error': 'Erro interno ao buscar dados.'}, status=500)