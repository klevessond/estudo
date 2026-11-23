# Graph Report - dash-dev  (2026-10-09)

## Corpus Check
- 101 files · ~76,834 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 33 file(s) not represented in the graph (top: .css 29, (none) 4)

## Summary
- 730 nodes · 1609 edges · 57 communities (33 shown, 24 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 46 edges (avg confidence: 0.95)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `7492d133`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- models.py
- serializers.py
- .get
- campanhas_views.py
- cache_mes.py
- db_conn.py
- pdv_mix_service.py
- main_views.py
- IndicativosDeVenda.jsx
- APIView
- pdv_service.py
- App.js
- ObjetivoMensal
- get_role_context
- pre_venda_status_service.py
- buscar_rotas_usuario
- CacheAdminSection.jsx
- ref_react
- Dashboard.jsx
- CardsDetalhadosVendedor.jsx
- GerenciarCampanhas.jsx
- .get
- UserRegisterSerializer
- MultiDBRouter
- HasAnyRole
- query_all
- Command
- CardsColaborador.jsx
- Pivot/PivotVendas.jsx
- apps.py
- api.js
- ComboChart.jsx
- index.js
- django_core_management_base
- ResumoVendas.jsx
- campanhas_service.py
- Command
- Meta
- buscar_ruptura
- admin.py
- venda_hoje_service.py
- buscar_dump_vendas
- manage.py
- TelegramLinkCode

## God Nodes (most connected - your core abstractions)
1. `query_all()` - 58 edges
2. `get_role_context()` - 24 edges
3. `api` - 19 edges
4. `IndicadoresCards()` - 19 edges
5. `buscar_rotas_usuario()` - 16 edges
6. `useAuth()` - 15 edges
7. `buscar_ruptura()` - 14 edges
8. `CampanhaVendaSerializer` - 13 edges
9. `_dt_bounds()` - 13 edges
10. `App()` - 13 edges

## Surprising Connections (you probably didn't know these)
- `clientes_top10()` --calls--> `query_all()`  [EXTRACTED]
  backend/dashboard/views/main_views.py → backend/dashboard/db_conn.py
- `Command` --uses--> `RupturaNotificada`  [INFERRED]
  backend/dashboard/management/commands/notificar_ruptura.py → backend/dashboard/models.py
- `Command` --uses--> `TelegramLinkCode`  [INFERRED]
  backend/dashboard/management/commands/notificar_ruptura.py → backend/dashboard/models.py
- `Command` --uses--> `TelegramPollState`  [INFERRED]
  backend/dashboard/management/commands/notificar_ruptura.py → backend/dashboard/models.py
- `Command` --uses--> `VendedorTelegram`  [INFERRED]
  backend/dashboard/management/commands/notificar_ruptura.py → backend/dashboard/models.py

## Import Cycles
- None detected.

## Communities (57 total, 24 thin omitted)

### Community 0 - "models.py"
Cohesion: 0.19
Nodes (4): create_user_profile(), save_user_profile(), TelegramPollState, VendedorTelegram

### Community 1 - "serializers.py"
Cohesion: 0.06
Nodes (18): CampanhaVendaItem, CampanhaVendaObjetivo, Feriado, ObjetivoMixNivel, Profile, CampanhaVendaItemSerializer, CampanhaVendaObjetivoSerializer, CampanhaVendaSerializer (+10 more)

### Community 2 - ".get"
Cohesion: 0.09
Nodes (23): calcular_matematica_projecao(), get_dias_uteis_info(), _hoje_brasil(), buscar_clientes_positivacao_lista(), buscar_clientes_positivacao_por_vendedor(), buscar_comissoes_vendedor(), buscar_itens_nao_vendidos_por_vendedor(), buscar_mix_agregado() (+15 more)

### Community 3 - "campanhas_views.py"
Cohesion: 0.10
Nodes (8): CampanhaVendaProgressoView, CampanhaVendaViewSet, FabricanteSearchView, GrupoSearchView, MaterialSearchView, _pct(), _to_int_or_none(), PivotVendasView

### Community 4 - "cache_mes.py"
Cohesion: 0.08
Nodes (19): _chave(), get_cache_aa(), _get_conn(), _init_db(), invalidar_cache_aa(), set_cache_aa(), _chave(), get_cache_mes() (+11 more)

### Community 5 - "db_conn.py"
Cohesion: 0.13
Nodes (4): conn_str(), _connect(), _ensure_nocount(), query_one()

### Community 6 - "pdv_mix_service.py"
Cohesion: 0.15
Nodes (13): _as_date(), buscar_itens_mix_por_ug(), buscar_itens_nao_vendidos_por_ug(), _buscar_mapa_materiais_por_ug(), buscar_mix_pdv_gerente(), buscar_mix_pdv_por_perfil(), buscar_mix_pdv_supervisor(), buscar_mix_pdv_vendedor() (+5 more)

### Community 7 - "main_views.py"
Cohesion: 0.08
Nodes (8): get_cached_data(), get_funcionario_por_codigo(), _calc_liquido_por_vendedor_por_rotas(), clientes_top10(), funcionario_detail(), get_dados_excel(), _resumo_detalhamento(), _to_float_safe()

### Community 8 - "IndicativosDeVenda.jsx"
Cohesion: 0.15
Nodes (21): BarChartColaboradores(), calcGerenteObjetivosFromEscopo(), calcGerenteVendaFromEscopo(), Card(), CardDiarioNecessario(), diasUteisEntre(), dlog(), filtrarPorSupervisao() (+13 more)

### Community 9 - "APIView"
Cohesion: 0.11
Nodes (10): ClientesPositivacaoAreaView, ClientesPositivacaoView, ComissoesVendedorView, IndicadoresView, MixItensAreaView, MixItensPorVendedorView, PDVPorVendedorAPIView, RupturaItensView (+2 more)

### Community 10 - "pdv_service.py"
Cohesion: 0.18
Nodes (8): _as_date(), buscar_pdv_comparativo(), buscar_pdv_por_unid_gestora(), buscar_pdv_por_unid_gestora_ano_anterior(), buscar_vendas_pdv(), _intervalo_ano_anterior(), _intervalo_exclusivo(), somar_linhas_pdv()

### Community 11 - "App.js"
Cohesion: 0.30
Nodes (7): App(), Login(), EditarUsuario(), formatPhone(), Feriados(), RegisterUser(), PrivateRoute()

### Community 12 - "ObjetivoMensal"
Cohesion: 0.16
Nodes (9): ObjetivoMensal, ObjetivoMensalVendedor, ObjetivoMensalSerializer, get_objetivo_mensal_serializado(), get_objetivos_vendedores_por_mes(), _meses_no_periodo(), ObjetivoMensalResumoView, ObjetivoMensalVendedorView (+1 more)

### Community 13 - "get_role_context"
Cohesion: 0.12
Nodes (6): RoleContextMixin, get_role_context(), RoleContext, TelegramDesvincularView, TelegramGerarCodigoView, TelegramStatusView

### Community 14 - "pre_venda_status_service.py"
Cohesion: 0.24
Nodes (5): buscar_itens_pre_venda(), buscar_status_pre_vendas(), _dt_bounds(), _validar_data(), PreVendaItensView

### Community 15 - "buscar_rotas_usuario"
Cohesion: 0.10
Nodes (9): buscar_rotas_usuario(), FuncionariosListView, me(), MinhasRotasSupervisorView, MinhaUnidGestoraView, PreVendaStatusView, _to_int(), TodosVendedoresView (+1 more)

### Community 16 - "CacheAdminSection.jsx"
Cohesion: 0.25
Nodes (12): CacheAdminSection(), chevronStyle(), feedbackStyle(), fmtData(), fmtDataHora(), S, tagStyle(), TIPO_CORES (+4 more)

### Community 17 - "ref_react"
Cohesion: 0.20
Nodes (8): Footer(), Header(), Layout(), Sidebar(), AuthCtx, AuthProvider(), getVisibleRoles(), useAuth()

### Community 18 - "Dashboard.jsx"
Cohesion: 0.27
Nodes (7): BarChartsColaboradoresKPIs(), toPct(), dlog(), IndicativosTabelaVendedor(), Dashboard(), logUG(), PeriodoSelector()

### Community 19 - "CardsDetalhadosVendedor.jsx"
Cohesion: 0.52
Nodes (4): CardsDetalhadosVendedor(), fmtMoeda(), TabelaClientesvendedor(), TabelaMixProdutosVendedor()

### Community 20 - "GerenciarCampanhas.jsx"
Cohesion: 0.21
Nodes (14): BuscaAutocomplete(), cardStyle, CelulaMedida(), corPct(), DetalheCampanha(), extrairErro(), fmtDataBR(), FormNovaCampanha() (+6 more)

### Community 22 - "UserRegisterSerializer"
Cohesion: 0.29
Nodes (3): Meta, RegisterView, UserRegisterSerializer

### Community 25 - "query_all"
Cohesion: 0.11
Nodes (11): query_all(), Todos_Vendedores(), buscar_objetivo_peso_positivacao(), _to_int_list(), buscar_cupons_por_vendedor(), buscar_vendedores_mesma_supervisao(), listar_funcionarios(), obter_funcionario_por_codigo() (+3 more)

### Community 26 - "Command"
Cohesion: 0.23
Nodes (5): Command, _bot_token(), buscar_updates(), enviar_mensagem(), formatar_moeda_brl()

### Community 27 - "CardsColaborador.jsx"
Cohesion: 0.29
Nodes (5): CardDiarioNecessarioVendedor(), CardsColaborador(), contarDiasUteisLocal(), PALETTE, ResumoSegmentoPies()

### Community 28 - "Pivot/PivotVendas.jsx"
Cohesion: 0.32
Nodes (4): fmt(), MODOS, PivotVendas(), TabelaComSubtotal()

### Community 30 - "api.js"
Cohesion: 0.20
Nodes (5): api, AuthCtx, TelegramVincular(), apiServices, ClienteService

### Community 33 - "django_core_management_base"
Cohesion: 0.13
Nodes (3): Command, Command, Command

### Community 37 - "campanhas_service.py"
Cohesion: 0.26
Nodes (5): buscar_fabricantes(), buscar_grupos(), buscar_materiais(), buscar_realizado_campanha(), _clamp_limit()

### Community 38 - "Command"
Cohesion: 0.27
Nodes (4): cod_supervisor_de(), obter_cod_supervisor(), Command, cod_supervisor_de()

### Community 39 - "Meta"
Cohesion: 0.20
Nodes (4): CampanhaVenda, Meta, RupturaNotificacaoGerente, RupturaNotificada

### Community 40 - "buscar_ruptura"
Cohesion: 0.36
Nodes (4): buscar_ruptura(), buscar_ruptura_itens_detalhado(), _to_int_list(), _validar_data()

### Community 42 - "venda_hoje_service.py"
Cohesion: 0.38
Nodes (3): _build_in_filter(), buscar_venda_hoje(), _hoje_brasil()

## Knowledge Gaps
- **17 isolated node(s):** `Meta`, `AuthCtx`, `rawDataMoM`, `rawDataYoY`, `PALETTE` (+12 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 255 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **24 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `query_all()` connect `query_all` to `models.py`, `.get`, `campanhas_service.py`, `db_conn.py`, `Command`, `pdv_mix_service.py`, `buscar_ruptura`, `pdv_service.py`, `buscar_dump_vendas`, `venda_hoje_service.py`, `main_views.py`, `pre_venda_status_service.py`, `buscar_rotas_usuario`?**
  _High betweenness centrality (0.051) - this node is a cross-community bridge._
- **What connects `Meta`, `AuthCtx`, `rawDataMoM` to the rest of the system?**
  _17 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `serializers.py` be split into smaller, more focused modules?**
  _Cohesion score 0.0602322206095791 - nodes in this community are weakly interconnected._
- **Why does `get_role_context()` connect `get_role_context` to `serializers.py`, `.get`, `cache_mes.py`, `main_views.py`, `APIView`, `buscar_rotas_usuario`, `.get`, `query_all`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **Should `.get` be split into smaller, more focused modules?**
  _Cohesion score 0.08585858585858586 - nodes in this community are weakly interconnected._
- **Why does `CampanhaVendaSerializer` connect `serializers.py` to `campanhas_views.py`, `main_views.py`, `Meta`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **Should `campanhas_views.py` be split into smaller, more focused modules?**
  _Cohesion score 0.09879032258064516 - nodes in this community are weakly interconnected._