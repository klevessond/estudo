# Reexporta as views para o urls.py (from .views import ...).
# Ao mover uma view para outro arquivo, troque só a linha de import dela aqui.
from .main_views import (
    clientes_top10,
    get_dados_sql,
    get_dados_sql_api,
    get_dados_excel,
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
    UserRegisterSerializer,
    RegisterView,
    FuncionariosListView,
    UsuarioDetailView,
    funcionario_detail,
    me,
    TodosVendedoresView,
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
from .pivot_views import PivotVendasView
