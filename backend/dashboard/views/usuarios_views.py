"""Cadastro e consulta de usuários/funcionários. Movido de main_views.py."""
import logging

from django.contrib.auth import get_user_model
from django.http import JsonResponse
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from dashboard.roles import get_role_context
from dashboard.serializers import CustomUserSerializer, MeSerializer, UserRegisterSerializer
from dashboard.services.indicadores.info_service import Todos_Vendedores
from dashboard.services.indicadores.rotas_simples import buscar_rotas_usuario
from dashboard.services.usuarios.funcionario_service import (
    get_funcionario_por_codigo,
    listar_funcionarios,
)

User = get_user_model()
logger = logging.getLogger(__name__)


class RegisterView(APIView):
    #permission_classes = [IsAdminUser]
    def post(self, request):
        serializer = UserRegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "Usuário registrado com sucesso!"},
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class FuncionariosListView(APIView):
    def get(self, request):
        from django.db.models import Q  # Importação necessária para filtros OR
        
        search = request.query_params.get('search', '')
        
        # 1. Identifica o Papel do Usuário
        ctx = get_role_context(request.user)
        is_gerente = getattr(ctx, "is_gerente", False) or request.user.is_superuser
        is_supervisor = getattr(ctx, "is_supervisor", False)
        is_vendedor = getattr(ctx, "is_vendedor", False)

        # 2. Query Base de Usuários
        users_qs = User.objects.filter(username__icontains=search)

        # 3. Aplica Filtros de Permissão
        if is_gerente:
            # Gerente vê todos -> Não aplica filtro extra
            pass
            
        elif is_supervisor:
            # Supervisor vê: Ele mesmo + Vendedores da sua equipe
            rotas_info = buscar_rotas_usuario(ctx)
            vendedores_ids = rotas_info.get("vendedores", []) if rotas_info else []
            
            # Converte para string para garantir match com o campo do Profile
            vendedores_ids_str = [str(v) for v in vendedores_ids if v is not None]
            
            users_qs = users_qs.filter(
                Q(pk=request.user.pk) |  # Ele mesmo
                Q(profile__cod_funcionario__in=vendedores_ids_str)  # Sua equipe
            ).distinct()

        elif is_vendedor:
            # Vendedor vê apenas a si mesmo
            users_qs = users_qs.filter(pk=request.user.pk)
            
        else:
            # Fallback (outros perfis): vê apenas a si mesmo por segurança
            users_qs = users_qs.filter(pk=request.user.pk)

        # 4. Monta a Resposta
        users = users_qs.values(
            'id', 'username', 'first_name', 'last_name', 'email', 'is_active', 'is_staff'
        )
        
        # Lista de funcionários do ERP (para cadastro de novos)
        # Mantemos aberta para busca, mas a edição (acima) já está restrita
        funcionarios = listar_funcionarios(search=search)
        
        return Response({
            "funcionarios_sql": funcionarios,
            "usuarios_django": list(users)
        })


class UsuarioDetailView(APIView):
    def get(self, request, user_id):
        try:
            usuario = User.objects.get(pk=user_id)
            serializer = CustomUserSerializer(usuario)
            return Response(serializer.data)
        except User.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

    def put(self, request, user_id):
        try:
            usuario = User.objects.get(pk=user_id)
            serializer = CustomUserSerializer(usuario, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except User.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def funcionario_detail(request, cod_funcionario):
    if request.method == 'GET':
        funcionario = get_funcionario_por_codigo(cod_funcionario)
        if funcionario:
            return JsonResponse(funcionario, safe=False)
        else:
            return JsonResponse({'error': 'Funcionário não encontrado'}, status=404)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    # 1. Serializa e destrava o dicionário
    serializer = MeSerializer(request.user)
    user_data = dict(serializer.data)
    
    # 2. Obtém o contexto e a regra de rotas
    try:
        ctx = get_role_context(request.user)
        
        # --- A CORREÇÃO MÁGICA AQUI ---
        # Consultamos a mesma lógica que a tela de Indicadores usa
        rotas_info = buscar_rotas_usuario(ctx)
        eh_gerente_por_rota = rotas_info.get("e_gerente", False)
        # ------------------------------
        
    except Exception as e:
        logger.debug(f"DEBUG: Erro ao obter contexto/rotas: {e}")
        ctx = None
        eh_gerente_por_rota = False

    # 3. Injeta as permissões
    if ctx:
        user_data['cod_funcionario']  = getattr(ctx, 'cod_funcionario', None)
        user_data['cod_unid_gestora'] = getattr(ctx, 'cod_unid_gestora', None)
        
        user_data['supervisor'] = getattr(ctx, "is_supervisor", False)
        user_data['vendedor']   = getattr(ctx, "is_vendedor", False)
        user_data['admin']      = getattr(ctx, "is_admin", False)
        
        # REGRA FINAL: É gerente se o contexto diz OU se as rotas dizem
        val_gerente = getattr(ctx, "is_gerente", False) or eh_gerente_por_rota or request.user.is_superuser
        user_data['gerente']    = val_gerente
        user_data['is_gerente'] = val_gerente
    else:
        # Fallback
        user_data['is_gerente'] = False

    return Response(user_data)


def _cod_vend_int(valor):
    try:
        return int(valor)
    except (TypeError, ValueError):
        return None


class TodosVendedoresView(APIView):
    """
    Lista de vendedores para selects (ex.: tela de Campanhas).
 
      - admin                         -> todos
      - supervisor / vendedor / gerente -> só os de rotas_info["vendedores"]
                                         (None = sem filtro, como nas outras telas)
      - outros papéis                 -> lista vazia
 
    Query param: ativos = 'true' | '1'  -> apenas vendedores ativos.
    """
    permission_classes = [IsAuthenticated]
 
    def get(self, request):
        apenas_ativos_param = request.query_params.get('ativos')
        somente_ativos = apenas_ativos_param in ['true', 'True', '1']
 
        ctx = get_role_context(request.user)
        rotas_info = buscar_rotas_usuario(ctx) or {}
 
        if ctx.is_admin:
            permitidos = None
        elif ctx.is_supervisor or ctx.is_vendedor or rotas_info.get('e_gerente'):
            vend = rotas_info.get('vendedores')
            permitidos = None if vend is None else {int(v) for v in vend if v is not None}
        else:
            return Response({"detalhamento": []})
 
        detalhamento = Todos_Vendedores(somente_ativos=somente_ativos).get("detalhamento", [])
        if permitidos is not None:
            detalhamento = [v for v in detalhamento if _cod_vend_int(v.get("CodFuncionario")) in permitidos]
 
        return Response({"detalhamento": detalhamento})
