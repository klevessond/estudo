from django.urls import path
from . import views
from .views import IndicadoresView, ObjetivoMensalView,ObjetivoMensalResumoView,IndicadoresPDV,VendasPorVendedorView,ObjetivoMensalVendedorView,ComissoesVendedorView
from .views import RegisterView,FuncionariosListView,UsuarioDetailView,funcionario_detail, me,TodosVendedoresView,RupturaView,RupturaItensView
from .views import PreVendaItensView,TelegramGerarCodigoView, TelegramStatusView, TelegramDesvincularView,VendaHojeView, PreVendaStatusView,CacheMesAdminView,ClientesPositivacaoAreaView,MixItensAreaView,ClientesPositivacaoView,MixItensPorVendedorView,ResumoSegmentoAreaVendaView,MinhaUnidGestoraView,PDVPorVendedorAPIView,ObjetivoMixNivelView,FeriadoView
from .views.pivot_views import PivotVendasView
from .views import AlertasListView, AlertasMarcarLidosView
urlpatterns = [
    path('Indicadores/', IndicadoresView.as_view(), name='Indicadores'),
    path('objetivos-mensais/', ObjetivoMensalView.as_view(), name='objetivo-mensal'),
    path('objetivo-mensal-resumo/', ObjetivoMensalResumoView.as_view(), name='objetivo-mensal-resumo'),
    path('objetivos-vendedores/', ObjetivoMensalVendedorView.as_view()),
    path("indicadores/pdv/", IndicadoresPDV.as_view(), name="indicadores-pdv"),
    path("vendas-por-vendedor/", VendasPorVendedorView.as_view(), name='VendasPorVendedorView'),
    path('register/', RegisterView.as_view(), name='register'),
    path('funcionarios/', FuncionariosListView.as_view(), name='funcionarios-list'),
    path('usuario/<int:user_id>/', UsuarioDetailView.as_view(), name='usuario-detail'),
    path('funcionarios/<int:cod_funcionario>/', funcionario_detail, name='funcionario-detail'),
    path("me/", me, name="me"),
    path('todos-vendedores/', TodosVendedoresView.as_view(), name='todos-vendedores'),
    path('ruptura/', RupturaView.as_view(), name='ruptura'),
    path('indicadores/ruptura-itens/', RupturaItensView.as_view(), name='ruptura-itens'),
    path('resumo-segmento-area-venda/', ResumoSegmentoAreaVendaView.as_view(), name='resumo-segmento-area-venda'),
    path('indicadores/minha-ug/', MinhaUnidGestoraView.as_view(), name='minha-ug'),
    path('indicadores/pdv-por-vendedor/', PDVPorVendedorAPIView.as_view(), name='pdv-por-vendedor'),
    path('objetivos-mix-nivel/', ObjetivoMixNivelView.as_view(), name='objetivos-mix-nivel'),
    path('feriados/', FeriadoView.as_view(), name='feriados-list'),
    path('feriados/<int:pk>/', FeriadoView.as_view(), name='feriados-delete'),
    path('comissoes-vendedor/', ComissoesVendedorView.as_view(), name='comissoes-vendedor'),
    path('indicadores/mix-itens/', MixItensPorVendedorView.as_view(), name='mix-itens'),
    path('indicadores/clientes-positivacao/', ClientesPositivacaoView.as_view(), name='clientes-positivacao'),
    path('indicadores/mix-itens-area/', MixItensAreaView.as_view(), name='mix-itens-area'),
    path('indicadores/clientes-positivacao-area/', ClientesPositivacaoAreaView.as_view(), name='clientes-positivacao-area'),
    path('admin/cache-mes/', CacheMesAdminView.as_view(), name='cache-mes-admin'),
    path('indicadores/pre-venda-status/', PreVendaStatusView.as_view(), name='pre-venda-status'),
    path('indicadores/pivot-vendas/', PivotVendasView.as_view(), name='pivot-vendas'),
    path('indicadores/venda-hoje/', VendaHojeView.as_view(), name='venda-hoje'),
    path('telegram/gerar-codigo/', TelegramGerarCodigoView.as_view(), name='telegram-gerar-codigo'),
    path('telegram/status/', TelegramStatusView.as_view(), name='telegram-status'),
    path('telegram/desvincular/', TelegramDesvincularView.as_view(), name='telegram-desvincular'),
    path('indicadores/pre-venda-itens/', PreVendaItensView.as_view(), name='pre-venda-itens'),
    # Central de alertas do app mobile
    path('alertas/', AlertasListView.as_view(), name='alertas'),
    path('alertas/marcar-lidos/', AlertasMarcarLidosView.as_view(), name='alertas-marcar-lidos'),

]

from rest_framework.routers import DefaultRouter
from .views.campanhas_views import (
    CampanhaVendaViewSet,
    CampanhaVendaObjetivoViewSet,
    CampanhaVendaProgressoView,
    CampanhasPainelView,
    MaterialSearchView,
    FabricanteSearchView,
    GrupoSearchView,
)

router = DefaultRouter()
router.register(r'campanhas', CampanhaVendaViewSet, basename='campanhas')
router.register(r'campanhas-objetivos', CampanhaVendaObjetivoViewSet, basename='campanhas-objetivos')

# Rotas específicas PRIMEIRO, antes do router.urls: senão o DefaultRouter
# interpreta "painel"/"buscar-fabricante"/"buscar-material"/"buscar-grupo" como o <pk>
# de uma campanha e responde 404.
urlpatterns += [
    path('campanhas/painel/', CampanhasPainelView.as_view(), name='campanhas-painel'),
    path('campanhas/<int:campanha_id>/progresso/', CampanhaVendaProgressoView.as_view(), name='campanha-progresso'),
    path('campanhas/buscar-material/', MaterialSearchView.as_view(), name='campanha-buscar-material'),
    path('campanhas/buscar-fabricante/', FabricanteSearchView.as_view(), name='campanha-buscar-fabricante'),
    path('campanhas/buscar-grupo/', GrupoSearchView.as_view(), name='campanha-buscar-grupo'),
]

urlpatterns += router.urls