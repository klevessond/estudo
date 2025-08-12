# dashboard/roles.py
from dataclasses import dataclass
from typing import List, Optional
from django.contrib.auth import get_user_model

User = get_user_model()

@dataclass
class RoleContext:
    # papéis
    is_admin: bool
    is_supervisor: bool
    is_vendedor: bool
    is_motorista: bool       # = transportador
    is_aux_motorista: bool   # = transportador_aux
    is_entregador: bool
    is_cobrador: bool
    # escopos típicos de filtro
    user_id: int
    cod_funcionario: Optional[int]
    cod_unid_gestora: Optional[int]
    roles: List[str]

def get_role_context(user: User) -> RoleContext:
    p = getattr(user, "profile", None)
    is_admin = bool(user.is_superuser)

    def b(x): return bool(x)  # garante boolean
    rc = RoleContext(
        is_admin=is_admin,
        is_supervisor=b(getattr(p, "supervisor", False)),
        is_vendedor=b(getattr(p, "vendedor", False)),
        is_motorista=b(getattr(p, "transportador", False)),
        is_aux_motorista=b(getattr(p, "transportador_aux", False)),
        is_entregador=b(getattr(p, "entregador", False)),
        is_cobrador=b(getattr(p, "cobrador", False)),
        user_id=user.id,
        cod_funcionario=getattr(p, "cod_funcionario", None),
        cod_unid_gestora=getattr(p, "cod_unid_gestora", None),
        roles=[],
    )

    roles = []
    if rc.is_admin: roles.append("admin")
    if rc.is_supervisor: roles.append("supervisor")
    if rc.is_vendedor: roles.append("vendedor")
    if rc.is_motorista: roles.append("motorista")
    if rc.is_aux_motorista: roles.append("aux_motorista")
    if rc.is_entregador: roles.append("entregador")
    if rc.is_cobrador: roles.append("cobrador")
    rc.roles = roles
    return rc
