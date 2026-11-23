"""Vínculo da conta do vendedor com o bot do Telegram. Movido de main_views.py."""
import random
import string
from datetime import timedelta as _timedelta

from django.conf import settings
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from dashboard.models import TelegramLinkCode, VendedorTelegram
from dashboard.roles import get_role_context


class TelegramGerarCodigoView(APIView):
    """
    Gera um código de 6 dígitos, válido por 10 minutos, para o vendedor
    logado vincular sua conta ao bot do Telegram.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        ctx = get_role_context(request.user)
        cod_func = getattr(ctx, "cod_funcionario", None)
        if not cod_func:
            return Response({"error": "Usuário sem cod_funcionario associado."}, status=400)

        # Invalida códigos antigos não usados deste vendedor (evita acúmulo de lixo)
        TelegramLinkCode.objects.filter(cod_funcionario=cod_func, usado=False).delete()

        codigo = "".join(random.choices(string.digits, k=6))
        TelegramLinkCode.objects.create(
            cod_funcionario=cod_func,
            codigo=codigo,
            expira_em=timezone.now() + _timedelta(minutes=10),
        )
        return Response({
            "codigo": codigo,
            "expira_em_minutos": 10,
            "bot_username": getattr(settings, "TELEGRAM_BOT_USERNAME", None),
        })


class TelegramStatusView(APIView):
    """Retorna se o vendedor logado já vinculou o Telegram."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        ctx = get_role_context(request.user)
        cod_func = getattr(ctx, "cod_funcionario", None)
        vinculado = VendedorTelegram.objects.filter(cod_funcionario=cod_func, ativo=True).exists()
        return Response({"vinculado": vinculado})


class TelegramDesvincularView(APIView):
    """Desativa o vínculo do Telegram do vendedor logado."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        ctx = get_role_context(request.user)
        cod_func = getattr(ctx, "cod_funcionario", None)
        VendedorTelegram.objects.filter(cod_funcionario=cod_func).update(ativo=False)
        return Response({"ok": True})
