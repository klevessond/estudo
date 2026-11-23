"""Central de alertas do app mobile (caixa de entrada por funcionário)."""
from __future__ import annotations

from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from dashboard.models import AlertaApp
from dashboard.roles import get_role_context

LIMITE_PADRAO = 30
LIMITE_MAXIMO = 200


def _cod_funcionario(request):
    ctx = get_role_context(request.user)
    try:
        return int(str(ctx.cod_funcionario).strip())
    except (TypeError, ValueError):
        return None


def _int_param(request, nome, padrao=None):
    try:
        return int(request.GET.get(nome))
    except (TypeError, ValueError):
        return padrao


def _serializar(a: AlertaApp) -> dict:
    return {
        "id": a.id,
        "tipo": a.tipo,
        "papel": a.papel,
        "titulo": a.titulo,
        "mensagem": a.mensagem,
        "dados": a.dados,
        "criado_em": a.criado_em.isoformat(),
        "lido": a.lido_em is not None,
    }


class AlertasListView(APIView):
    """
    GET /api/alertas/
      ?apos_id=123   → só alertas com id > 123 (usado no polling do app)
      ?antes_id=456  → paginação para trás (lista rolando)
      ?nao_lidos=1   → só não lidos
      ?limite=30
    Resposta: { results: [...], nao_lidos: <int> }
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        cod = _cod_funcionario(request)
        if not cod:
            return Response({"results": [], "nao_lidos": 0})

        base = AlertaApp.objects.filter(cod_funcionario=cod)
        qs = base

        apos_id = _int_param(request, "apos_id")
        antes_id = _int_param(request, "antes_id")
        if apos_id:
            qs = qs.filter(id__gt=apos_id)
        if antes_id:
            qs = qs.filter(id__lt=antes_id)
        if request.GET.get("nao_lidos") in ("1", "true", "True"):
            qs = qs.filter(lido_em__isnull=True)

        limite = min(max(_int_param(request, "limite", LIMITE_PADRAO), 1), LIMITE_MAXIMO)
        itens = list(qs.order_by("-id")[:limite])

        return Response({
            "results": [_serializar(a) for a in itens],
            "nao_lidos": base.filter(lido_em__isnull=True).count(),
        })


class AlertasMarcarLidosView(APIView):
    """
    POST /api/alertas/marcar-lidos/
      { "ids": [1, 2, 3] }  ou  { "todos": true }
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        cod = _cod_funcionario(request)
        if not cod:
            return Response({"atualizados": 0, "nao_lidos": 0})

        qs = AlertaApp.objects.filter(cod_funcionario=cod, lido_em__isnull=True)

        if not request.data.get("todos"):
            ids = request.data.get("ids") or []
            try:
                ids = [int(i) for i in ids]
            except (TypeError, ValueError):
                return Response({"error": "ids inválidos"}, status=400)
            if not ids:
                return Response({"error": "Informe 'ids' ou 'todos': true"}, status=400)
            qs = qs.filter(id__in=ids)

        atualizados = qs.update(lido_em=timezone.now())
        nao_lidos = AlertaApp.objects.filter(cod_funcionario=cod, lido_em__isnull=True).count()
        return Response({"atualizados": atualizados, "nao_lidos": nao_lidos})
