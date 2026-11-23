"""Administração do cache mensal de indicadores. Movido de main_views.py."""
import logging

from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from dashboard.roles import get_role_context
from dashboard.services.indicadores.cache_mes import (
    invalidar_cache_mes,
    invalidar_por_periodo,
    invalidar_por_tipo_e_periodo,
    listar_periodos_cacheados,
    stats_cache_mes,
)

logger = logging.getLogger(__name__)


class CacheMesAdminView(APIView):
    permission_classes = [IsAuthenticated]
 
    def _checar_admin(self, request):
        logger.info(f"[CacheAdmin] Verificando permissão para o utilizador: {request.user.username} | Superuser: {request.user.is_superuser}")
        
        # 1. Superuser do Django sempre pode
        if request.user.is_superuser:
            return None
        
        # 2. Verifica contexto
        ctx = get_role_context(request.user)
        is_admin = getattr(ctx, "is_admin", False)
        is_gerente = getattr(ctx, "is_gerente", False)
        is_sup = getattr(ctx, "is_supervisor", False)
        
        logger.info(f"[CacheAdmin] Contexto detectado -> admin:{is_admin}, gerente:{is_gerente}, supervisor:{is_sup}")
        
        if is_admin or is_gerente or is_sup:
            return None

        logger.warning(f"[CacheAdmin] Acesso negado para {request.user.username}. Papel insuficiente.")
        return Response({"error": "Acesso restrito a administradores."}, status=403)
 
    # ── GET ──────────────────────────────────────────────────────────────────
    def get(self, request):
        erro = self._checar_admin(request)
        if erro:
            return erro
 
        periodos = listar_periodos_cacheados()
        stats    = stats_cache_mes()
 
        return Response({
            "stats":    stats,
            "periodos": periodos,
        })
 
    # ── DELETE ───────────────────────────────────────────────────────────────
    def delete(self, request):
        logger.info("\n[CacheAdmin] ================= INÍCIO DELETE =================")
        try:
            erro = self._checar_admin(request)
            if erro:
                return erro
     
            modo     = request.query_params.get("modo", "tudo")
            data_ini = request.query_params.get("data_ini")
            data_fim = request.query_params.get("data_fim")
            tipo     = request.query_params.get("tipo")
            
            logger.info(f"[CacheAdmin] Recebido pedido de DELETE | Modo: '{modo}' | Tipo: '{tipo}' | Período: {data_ini} a {data_fim}")
     
            if modo == "tudo":
                logger.info("[CacheAdmin] A executar limpeza total do cache...")
                removidos = invalidar_cache_mes()
                logger.info(f"[CacheAdmin] Sucesso: {removidos} registos apagados.")
                return Response({"ok": True, "modo": "tudo", "removidos": removidos})
     
            if modo == "periodo":
                if not data_ini or not data_fim:
                    logger.error("[CacheAdmin] Falhou: data_ini e data_fim não enviados.")
                    return Response({"error": "Informe data_ini e data_fim para modo=periodo."}, status=400)
                logger.info(f"[CacheAdmin] A apagar período {data_ini} a {data_fim}...")
                removidos = invalidar_por_periodo(data_ini, data_fim)
                logger.info(f"[CacheAdmin] Sucesso: {removidos} registos apagados.")
                return Response({"ok": True, "modo": "periodo", "data_ini": data_ini, "data_fim": data_fim, "removidos": removidos})
     
            if modo == "tipo":
                if not tipo:
                    logger.error("[CacheAdmin] Falhou: tipo não enviado.")
                    return Response({"error": "Informe tipo para modo=tipo."}, status=400)
                logger.info(f"[CacheAdmin] A apagar tipo {tipo}...")
                removidos = invalidar_cache_mes(tipo=tipo)
                logger.info(f"[CacheAdmin] Sucesso: {removidos} registos apagados.")
                return Response({"ok": True, "modo": "tipo", "tipo": tipo, "removidos": removidos})
     
            if modo == "entrada":
                if not tipo or not data_ini or not data_fim:
                    logger.error("[CacheAdmin] Falhou: parâmetros incompletos para modo entrada.")
                    return Response({"error": "Informe tipo, data_ini e data_fim para modo=entrada."}, status=400)
                logger.info(f"[CacheAdmin] A apagar entrada específica ({tipo}) de {data_ini} a {data_fim}...")
                removidos = invalidar_por_tipo_e_periodo(tipo, data_ini, data_fim)
                logger.info(f"[CacheAdmin] Sucesso: {removidos} registos apagados.")
                return Response({"ok": True, "modo": "entrada", "tipo": tipo, "data_ini": data_ini, "data_fim": data_fim, "removidos": removidos})
     
            logger.error(f"[CacheAdmin] Modo desconhecido: '{modo}'")
            return Response({"error": f"Modo desconhecido: '{modo}'."}, status=400)

        except Exception as e:
            # Esta linha regista o erro real no terminal do Linux
            logger.exception(f"[CacheAdmin] ERRO CRÍTICO DURANTE A ELIMINAÇÃO: {str(e)}")
            # Devolvemos o erro para o React (assim você vê na aba "Network" do F12 o que falhou)
            return Response({"error": f"Erro interno na base de dados: {str(e)}"}, status=500)
