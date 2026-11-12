# Reexporta as views para o urls.py (from .views import ...).
# Ao mover uma view para outro arquivo, troque só a linha de import dela aqui.
from .main_views import (
    ComissoesVendedorView,
    MinhasRotasSupervisorView,
    IndicadoresView,
    ObjetivoMensalView,
    ObjetivoMensalResumoView,
    get_objetivo_mensal_serializado,
    MinhaUnidGestoraView,
    PDVPorVendedorAPIView,
    IndicadoresPDV,
    VendasPorVendedorView,
    ObjetivoMensalVendedorView,
    get_objetivos_vendedores_por_mes,
    RupturaView,
    RupturaItensView,
    ResumoSegmentoAreaVendaView,
    ObjetivoMixNivelView,
    ClientesPositivacaoView,
    MixItensPorVendedorView,
    MixItensAreaView,
    ClientesPositivacaoAreaView,
    PreVendaStatusView,
    VendaHojeView,
    PreVendaItensView,
)
from .feriados_views import FeriadoView
from .telegram_views import TelegramGerarCodigoView, TelegramStatusView, TelegramDesvincularView
from .cache_admin_views import CacheMesAdminView
from .legacy_views import get_dados_sql, get_dados_sql_api
from .usuarios_views import RegisterView, FuncionariosListView, UsuarioDetailView, funcionario_detail, me, TodosVendedoresView
from .pivot_views import PivotVendasView
