# Reexporta as views para o urls.py (from .views import ...).
# Ao mover uma view para outro arquivo, troque só a linha de import dela aqui.
from .main_views import (
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
    ResumoSegmentoAreaVendaView,
    ObjetivoMixNivelView,
    VendaHojeView,
)
from .feriados_views import FeriadoView
from .telegram_views import TelegramGerarCodigoView, TelegramStatusView, TelegramDesvincularView
from .cache_admin_views import CacheMesAdminView
from .legacy_views import get_dados_sql, get_dados_sql_api
from .usuarios_views import RegisterView, FuncionariosListView, UsuarioDetailView, funcionario_detail, me, TodosVendedoresView
from .ruptura_views import RupturaView, RupturaItensView
from .pre_venda_views import PreVendaStatusView, PreVendaItensView
from .mix_positivacao_views import ComissoesVendedorView, ClientesPositivacaoView, MixItensPorVendedorView, MixItensAreaView, ClientesPositivacaoAreaView
from .pivot_views import PivotVendasView
