# dashboard/mixins.py
from rest_framework.permissions import IsAuthenticated
from .roles import get_role_context

class RoleContextMixin:
    permission_classes = [IsAuthenticated]

    @property
    def role_ctx(self):
        # calculado on-demand
        return get_role_context(self.request.user)
