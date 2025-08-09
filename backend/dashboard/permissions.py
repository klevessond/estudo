# permissions.py
from rest_framework.permissions import BasePermission, SAFE_METHODS

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
