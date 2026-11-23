# permissions.py
import logging

from rest_framework.permissions import BasePermission, SAFE_METHODS

from dashboard.roles import get_role_context
from dashboard.services.indicadores.rotas_simples import buscar_rotas_usuario

logger = logging.getLogger(__name__)

class HasAnyRole(BasePermission):
    """
    Permite acesso se o usuário logado possuir QUALQUER uma das roles exigidas pela view.
    A view deve definir um atributo: required_roles = ["vendedor", "supervisor"] (por exemplo)
    Superuser sempre passa.
    """
    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if user.is_superuser:
            return True

        required = getattr(view, "required_roles", None)
        if not required:
            # Se a view não exigir nada, permite (ajuste se quiser default deny)
            return True

        profile = getattr(user, "profile", None)
        if not profile:
            return False

        # mapeia booleanos do profile
        role_map = {
            "entregador": profile.entregador,
            "supervisor": profile.supervisor,
            "transportador": profile.transportador,
            "transportador_aux": profile.transportador_aux,
            "vendedor": profile.vendedor,
            "cobrador": profile.cobrador,
            "admin": user.is_superuser,
        }
        return any(role_map.get(r, False) for r in required)



# ---------------------------------------------------------------------------
# Perfis gerenciais
#   admin      -> user.is_superuser
#   supervisor -> flag "supervisor" do Profile
#   gerente    -> NÃO é um campo do cadastro: é o supervisor cujo código aparece
#                 como CodGerente no ERP (a mesma regra usada por /api/me/).
# ---------------------------------------------------------------------------
def eh_supervisor(user):
    return bool(getattr(getattr(user, "profile", None), "supervisor", False))


def eh_gerente(user):
    """Consulta o ERP (via buscar_rotas_usuario). Na dúvida ou em caso de erro, nega."""
    try:
        return bool(buscar_rotas_usuario(get_role_context(user)).get("e_gerente"))
    except Exception:
        logger.warning("Falha ao verificar se o usuário é gerente; acesso negado.", exc_info=True)
        return False


def _logado(request):
    user = request.user
    return bool(user and user.is_authenticated)


class IsAdminOrGerente(BasePermission):
    """Cadastro e edição de usuários."""
    message = "Apenas administradores e gerentes podem executar esta ação."

    def has_permission(self, request, view):
        if not _logado(request):
            return False
        return bool(request.user.is_superuser or eh_gerente(request.user))


class IsAdminGerenteOrSupervisor(BasePermission):
    """Feriados, objetivos e campanhas."""
    message = "Apenas administradores, gerentes e supervisores podem executar esta ação."

    def has_permission(self, request, view):
        if not _logado(request):
            return False
        user = request.user
        # supervisor é só uma leitura do Profile; o ERP só é consultado se precisar
        return bool(user.is_superuser or eh_supervisor(user) or eh_gerente(user))


class EscritaAdminGerenteSupervisor(IsAdminGerenteOrSupervisor):
    """Leitura para qualquer usuário logado; gravação (POST/PUT/PATCH/DELETE)
    só para admin, gerente e supervisor."""

    def has_permission(self, request, view):
        if not _logado(request):
            return False
        if request.method in SAFE_METHODS:
            return True
        return super().has_permission(request, view)
