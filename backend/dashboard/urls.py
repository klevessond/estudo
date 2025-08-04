from django.urls import path
from . import views
from .views import IndicadoresView, ObjetivoMensalView,ObjetivoMensalResumoView,IndicadoresPDV,VendasPorVendedorView,ObjetivoMensalVendedorView
from .views import RegisterView,FuncionariosListView

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

]