from django.urls import path
from . import views
from .views import IndicadoresView

urlpatterns = [
    path('dados-sql/', views.get_dados_sql, name='get_dados_sql'),
    path('api/clientes/', views.get_dados_sql_api, name='get_dados_sql_api'),
    path('Indicadores/', IndicadoresView.as_view(), name='Indicadores'),
]