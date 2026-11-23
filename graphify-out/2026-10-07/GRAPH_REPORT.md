# Graph Report - dash-dev  (2026-10-07)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 785 nodes · 1636 edges · 69 communities (41 shown, 28 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 43 edges (avg confidence: 0.95)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `568c057b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- backend/management/commands/notificar_ruptura.py
- Feriado
- cache_mes.py
- vendas_service.py
- dashboard/urls.py
- dependencies
- campanhas_service.py
- pdv_mix_service.py
- main_views.py
- IndicativosDeVenda.jsx
- package.json
- pdv_service.py
- query_all
- react
- buscar_rotas_usuario
- App.js
- APIView
- api.js
- CacheAdminSection.jsx
- get_role_context
- Dashboard.jsx
- auth.jsx
- .get
- ComboChart.jsx
- pre_venda_status_service.py
- db_conn.py
- venda_hoje_service.py
- manifest.json
- CardsColaborador.jsx
- GerenciarCampanhas.jsx
- Pivot/PivotVendas.jsx
- UserRegisterSerializer
- MultiDBRouter
- HasAnyRole
- DencidadeCidadeChart.jsx
- .get
- manage.py
- scripts
- apps.py
- ObjetivoMensalVendedorView
- extends
- reportWebVitals.js
- Learn More
- models.py
- serializers.py
- ObjetivoMensal
- browserslist
- SalesMap.jsx
- @testing-library/jest-dom
- CampanhaVenda
- Meta
- CampanhaVendaObjetivo
- CustomUserSerializer
- FeriadoView
- typing
- teste_db.py
- ObjetivoMixNivelView
- .get

## God Nodes (most connected - your core abstractions)
1. `query_all()` - 57 edges
2. `react` - 43 edges
3. `get_role_context()` - 24 edges
4. `IndicadoresCards()` - 19 edges
5. `api` - 19 edges
6. `buscar_rotas_usuario()` - 16 edges
7. `useAuth()` - 15 edges
8. `buscar_ruptura()` - 14 edges
9. `App()` - 13 edges
10. `_dt_bounds()` - 13 edges

## Surprising Connections (you probably didn't know these)
- `TelegramGerarCodigoView` --uses--> `TelegramLinkCode`  [INFERRED]
  backend/dashboard/views/main_views.py → backend/dashboard/models.py
- `TelegramDesvincularView` --uses--> `VendedorTelegram`  [INFERRED]
  backend/dashboard/views/main_views.py → backend/dashboard/models.py
- `TelegramStatusView` --uses--> `VendedorTelegram`  [INFERRED]
  backend/dashboard/views/main_views.py → backend/dashboard/models.py
- `Command` --uses--> `RupturaNotificacaoGerente`  [INFERRED]
  backend/management/commands/notificar_ruptura.py → backend/dashboard/models.py
- `FeriadoSerializer` --uses--> `Feriado`  [INFERRED]
  backend/dashboard/serializers.py → backend/dashboard/models.py

## Import Cycles
- None detected.

## Communities (69 total, 28 thin omitted)

### Community 0 - "backend/management/commands/notificar_ruptura.py"
Cohesion: 0.06
Nodes (19): Command, cod_supervisor_de(), Command, RupturaNotificada, TelegramLinkCode, TelegramPollState, VendedorTelegram, obter_cod_supervisor() (+11 more)

### Community 1 - "Feriado"
Cohesion: 0.24
Nodes (4): Feriado, calcular_matematica_projecao(), get_dias_uteis_info(), _hoje_brasil()

### Community 2 - "cache_mes.py"
Cohesion: 0.08
Nodes (19): _chave(), get_cache_aa(), _get_conn(), _init_db(), invalidar_cache_aa(), set_cache_aa(), _chave(), get_cache_mes() (+11 more)

### Community 3 - "vendas_service.py"
Cohesion: 0.17
Nodes (15): buscar_clientes_positivacao_lista(), buscar_clientes_positivacao_por_vendedor(), buscar_comissoes_vendedor(), buscar_itens_mix_por_vendedor(), buscar_itens_nao_vendidos_por_vendedor(), buscar_mix_agregado(), buscar_positivacao_por_rota(), buscar_resumo_segmento_area_venda() (+7 more)

### Community 4 - "dashboard/urls.py"
Cohesion: 0.08
Nodes (6): buscar_dump_vendas(), _validar_data(), CampanhaVendaViewSet, FabricanteSearchView, MaterialSearchView, PivotVendasView

### Community 5 - "dependencies"
Cohesion: 0.06
Nodes (32): dependencies, assert, axios, buffer, chart.js, chartjs-adapter-date-fns, chartjs-plugin-annotation, chartjs-plugin-datalabels (+24 more)

### Community 6 - "campanhas_service.py"
Cohesion: 0.28
Nodes (3): buscar_fabricantes(), buscar_materiais(), buscar_realizado_campanha()

### Community 7 - "pdv_mix_service.py"
Cohesion: 0.16
Nodes (12): _as_date(), buscar_itens_mix_por_ug(), buscar_itens_nao_vendidos_por_ug(), _buscar_mapa_materiais_por_ug(), buscar_mix_pdv_gerente(), buscar_mix_pdv_por_perfil(), buscar_mix_pdv_supervisor(), buscar_mix_pdv_vendedor() (+4 more)

### Community 8 - "main_views.py"
Cohesion: 0.09
Nodes (6): get_cached_data(), _calc_liquido_por_vendedor_por_rotas(), clientes_top10(), get_dados_excel(), _resumo_detalhamento(), _to_float_safe()

### Community 9 - "IndicativosDeVenda.jsx"
Cohesion: 0.16
Nodes (22): BarChartColaboradores(), calcGerenteObjetivosFromEscopo(), calcGerenteVendaFromEscopo(), Card(), CardDiarioNecessario(), diasUteisEntre(), dlog(), filtrarPorSupervisao() (+14 more)

### Community 10 - "package.json"
Cohesion: 0.08
Nodes (24): author, description, keywords, license, main, name, private, type (+16 more)

### Community 11 - "pdv_service.py"
Cohesion: 0.15
Nodes (9): _as_date(), buscar_pdv_comparativo(), buscar_pdv_por_unid_gestora(), buscar_pdv_por_unid_gestora_ano_anterior(), buscar_vendas_pdv(), _intervalo_ano_anterior(), _intervalo_exclusivo(), somar_linhas_pdv() (+1 more)

### Community 12 - "query_all"
Cohesion: 0.12
Nodes (11): query_all(), Todos_Vendedores(), buscar_cupons_por_vendedor(), buscar_vendedores_mesma_supervisao(), get_funcionario_por_codigo(), listar_funcionarios(), obter_funcionario_por_codigo(), obter_unid_gestora() (+3 more)

### Community 13 - "react"
Cohesion: 0.16
Nodes (8): CardsDetalhadosVendedor(), fmtMoeda(), TabelaClientesvendedor(), TabelaMixProdutosVendedor(), MemoizedPlot, PieChart(), react, react-plotly.js

### Community 14 - "buscar_rotas_usuario"
Cohesion: 0.12
Nodes (7): buscar_rotas_usuario(), FuncionariosListView, me(), MinhasRotasSupervisorView, MinhaUnidGestoraView, PreVendaStatusView, VendaHojeView

### Community 15 - "App.js"
Cohesion: 0.28
Nodes (9): App(), Login(), EditarUsuario(), formatPhone(), Feriados(), RegisterUser(), PrivateRoute(), root (+1 more)

### Community 16 - "APIView"
Cohesion: 0.10
Nodes (9): ClientesPositivacaoAreaView, ClientesPositivacaoView, MixItensAreaView, MixItensPorVendedorView, PreVendaItensView, RupturaItensView, RupturaView, TelegramGerarCodigoView (+1 more)

### Community 17 - "api.js"
Cohesion: 0.19
Nodes (6): api, AuthCtx, TelegramVincular(), PALETTE, apiServices, ClienteService

### Community 18 - "CacheAdminSection.jsx"
Cohesion: 0.25
Nodes (12): CacheAdminSection(), chevronStyle(), feedbackStyle(), fmtData(), fmtDataHora(), S, tagStyle(), TIPO_CORES (+4 more)

### Community 19 - "get_role_context"
Cohesion: 0.12
Nodes (6): RoleContextMixin, get_role_context(), RoleContext, ComissoesVendedorView, TelegramDesvincularView, TelegramStatusView

### Community 20 - "Dashboard.jsx"
Cohesion: 0.27
Nodes (8): BarChartsColaboradoresKPIs(), toPct(), dlog(), IndicativosTabelaVendedor(), Dashboard(), logUG(), PeriodoSelector(), @tanstack/react-table

### Community 21 - "auth.jsx"
Cohesion: 0.31
Nodes (8): Footer(), Header(), Layout(), Sidebar(), AuthCtx, AuthProvider(), getVisibleRoles(), useAuth()

### Community 22 - ".get"
Cohesion: 0.13
Nodes (10): ObjetivoMensalVendedor, get_objetivo_mensal_serializado(), get_objetivos_vendedores_por_mes(), IndicadoresView, _media_ponderada_gerente(), _media_ponderada_supervisor(), _meses_no_periodo(), _num() (+2 more)

### Community 23 - "ComboChart.jsx"
Cohesion: 0.18
Nodes (5): rawDataMoM, rawDataYoY, chart.js, chartjs-adapter-date-fns, react-chartjs-2

### Community 24 - "pre_venda_status_service.py"
Cohesion: 0.36
Nodes (4): buscar_itens_pre_venda(), buscar_status_pre_vendas(), _dt_bounds(), _validar_data()

### Community 25 - "db_conn.py"
Cohesion: 0.13
Nodes (4): conn_str(), _connect(), _ensure_nocount(), query_one()

### Community 26 - "venda_hoje_service.py"
Cohesion: 0.36
Nodes (4): _build_in_filter(), buscar_venda_hoje(), _hoje_brasil(), buscar_pre_venda()

### Community 27 - "manifest.json"
Cohesion: 0.25
Nodes (7): background_color, display, icons, name, short_name, start_url, theme_color

### Community 28 - "CardsColaborador.jsx"
Cohesion: 0.36
Nodes (7): CardDiarioNecessarioVendedor(), CardsColaborador(), contarDiasUteisLocal(), ResumoSegmentoPies(), jspdf, jspdf-autotable, react-d3-speedometer

### Community 29 - "GerenciarCampanhas.jsx"
Cohesion: 0.43
Nodes (7): BuscaReferencia(), DetalheCampanha(), fmtMoeda(), fmtNum(), FormNovaCampanha(), GerenciarCampanhas(), TIPOS

### Community 30 - "Pivot/PivotVendas.jsx"
Cohesion: 0.32
Nodes (5): fmt(), MODOS, PivotVendas(), TabelaComSubtotal(), react-pivottable

### Community 31 - "UserRegisterSerializer"
Cohesion: 0.29
Nodes (3): Meta, RegisterView, UserRegisterSerializer

### Community 37 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, build, eject, start, test

### Community 40 - "extends"
Cohesion: 0.50
Nodes (4): eslintConfig, extends, react-app, react-app/jest

### Community 42 - "Learn More"
Cohesion: 0.14
Nodes (13): Advanced Configuration, Analyzing the Bundle Size, Available Scripts, Code Splitting, Deployment, Getting Started with Create React App, Learn More, Making a Progressive Web App (+5 more)

### Community 43 - "models.py"
Cohesion: 0.22
Nodes (3): ObjetivoMensalAdmin, create_user_profile(), save_user_profile()

### Community 44 - "serializers.py"
Cohesion: 0.29
Nodes (6): Profile, CampanhaVendaObjetivoSerializer, MeSerializer, Meta, ObjetivoMixNivelSerializer, ProfileSerializer

### Community 45 - "ObjetivoMensal"
Cohesion: 0.43
Nodes (4): ObjetivoMensal, ObjetivoMensalSerializer, ObjetivoMensalResumoView, ObjetivoMensalView

### Community 46 - "browserslist"
Cohesion: 0.67
Nodes (3): browserslist, development, production

### Community 60 - "CampanhaVenda"
Cohesion: 0.38
Nodes (3): CampanhaVenda, CampanhaVendaSerializer, CampanhaVendaProgressoView

### Community 61 - "Meta"
Cohesion: 0.29
Nodes (3): Meta, ObjetivoMixNivel, RupturaNotificacaoGerente

## Knowledge Gaps
- **89 isolated node(s):** `Meta`, `author`, `description`, `keywords`, `license` (+84 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 310 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **28 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `DencidadeCidadeChart.jsx`, `IndicativosDeVenda.jsx`, `package.json`, `App.js`, `SalesMap.jsx`, `api.js`, `CacheAdminSection.jsx`, `Dashboard.jsx`, `auth.jsx`, `ComboChart.jsx`, `CardsColaborador.jsx`, `GerenciarCampanhas.jsx`, `Pivot/PivotVendas.jsx`?**
  _High betweenness centrality (0.043) - this node is a cross-community bridge._
- **What connects `Meta`, `author`, `description` to the rest of the system?**
  _89 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `backend/management/commands/notificar_ruptura.py` be split into smaller, more focused modules?**
  _Cohesion score 0.061343204653622425 - nodes in this community are weakly interconnected._
- **Why does `query_all()` connect `query_all` to `backend/management/commands/notificar_ruptura.py`, `typing`, `vendas_service.py`, `dashboard/urls.py`, `campanhas_service.py`, `pdv_mix_service.py`, `main_views.py`, `pdv_service.py`, `buscar_rotas_usuario`, `pre_venda_status_service.py`, `db_conn.py`, `venda_hoje_service.py`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._
- **Should `cache_mes.py` be split into smaller, more focused modules?**
  _Cohesion score 0.08048103607770583 - nodes in this community are weakly interconnected._
- **Why does `dependencies` connect `dependencies` to `package.json`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **Should `dashboard/urls.py` be split into smaller, more focused modules?**
  _Cohesion score 0.07816091954022988 - nodes in this community are weakly interconnected._