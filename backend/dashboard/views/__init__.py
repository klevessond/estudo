# Reexporta as views para o urls.py (from .views import ...).
# Ao mover uma view para outro arquivo, troque só a linha de import dela aqui.
from .indicadores_views import (
    IndicadoresView,
)
from .feriados_views import FeriadoView
from .telegram_views import TelegramGerarCodigoView, TelegramStatusView, TelegramDesvincularView
from .alertas_views import AlertasListView, AlertasMarcarLidosView
from .cache_admin_views import CacheMesAdminView
from .usuarios_views import RegisterView, FuncionariosListView, UsuarioDetailView, funcionario_detail, me, TodosVendedoresView
from .ruptura_views import RupturaView, RupturaItensView
from .pre_venda_views import PreVendaStatusView, PreVendaItensView
from .mix_positivacao_views import ComissoesVendedorView, ClientesPositivacaoView, MixItensPorVendedorView, MixItensAreaView, ClientesPositivacaoAreaView
from .objetivos_views import ObjetivoMensalView, ObjetivoMensalResumoView, get_objetivo_mensal_serializado, ObjetivoMensalVendedorView, get_objetivos_vendedores_por_mes, ObjetivoMixNivelView
from .pdv_views import MinhaUnidGestoraView, PDVPorVendedorAPIView, IndicadoresPDV
from .vendas_views import VendasPorVendedorView, ResumoSegmentoAreaVendaView, VendaHojeView
from .pivot_views import PivotVendasView
