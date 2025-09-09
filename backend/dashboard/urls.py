from django.urls import path
from . import views
from .views import IndicadoresView, ObjetivoMensalView,ObjetivoMensalResumoView,IndicadoresPDV,VendasPorVendedorView,ObjetivoMensalVendedorView
from .views import RegisterView,FuncionariosListView,UsuarioDetailView,funcionario_detail, me,TodosVendedoresView,RupturaView
from .views import ResumoSegmentoAreaVendaView
urlpatterns = [
    path('dados-sql/', views.get_dados_sql, name='get_dados_sql'),
    path('api/clientes/', views.get_dados_sql_api, name='get_dados_sql_api'),
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
     path('resumo-segmento-area-venda/', ResumoSegmentoAreaVendaView.as_view(), name='resumo-segmento-area-venda'),

]