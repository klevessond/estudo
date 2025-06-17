from django.urls import path
from . import views
from .views import IndicadoresView, ObjetivoMensalView,ObjetivoMensalResumoView,IndicadoresPDV

urlpatterns = [
    path('dados-sql/', views.get_dados_sql, name='get_dados_sql'),
    path('api/clientes/', views.get_dados_sql_api, name='get_dados_sql_api'),
    path('Indicadores/', IndicadoresView.as_view(), name='Indicadores'),
    path('objetivos-mensais/', ObjetivoMensalView.as_view(), name='objetivo-mensal'),
    path('objetivo-mensal-resumo/', ObjetivoMensalResumoView.as_view(), name='objetivo-mensal-resumo'),
    path("indicadores/pdv/", IndicadoresPDV.as_view(), name="indicadores-pdv")

]