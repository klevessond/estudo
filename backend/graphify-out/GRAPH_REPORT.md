# Graph Report - backend  (2026-10-07)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 524 nodes · 1147 edges · 31 communities (18 shown, 13 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 43 edges (avg confidence: 0.95)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `df3d3d81`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Community 0
- Community 1
- Community 2
- Community 3
- Community 4
- Community 5
- Community 6
- Community 7
- Community 8
- Community 9
- Community 10
- Community 11
- Community 12
- Community 13
- Community 14
- Community 15
- Community 16
- Community 17
- Community 18
- Community 19
- Community 20
- Community 21

## God Nodes (most connected - your core abstractions)
1. `query_all()` - 57 edges
2. `get_role_context()` - 24 edges
3. `buscar_rotas_usuario()` - 16 edges
4. `buscar_ruptura()` - 14 edges
5. `_dt_bounds()` - 13 edges
6. `get_cache_mes()` - 12 edges
7. `set_cache_mes()` - 12 edges
8. `Meta` - 11 edges
9. `TelegramLinkCode` - 11 edges
10. `VendedorTelegram` - 11 edges

## Surprising Connections (you probably didn't know these)
- `cod_supervisor_de()` --calls--> `obter_cod_supervisor()`  [EXTRACTED]
  management/commands/notificar_ruptura.py → dashboard/services/indicadores/info_service.py
- `Command` --uses--> `RupturaNotificacaoGerente`  [INFERRED]
  management/commands/notificar_ruptura.py → dashboard/models.py
- `Command` --uses--> `RupturaNotificada`  [INFERRED]
  management/commands/notificar_ruptura.py → dashboard/models.py
- `Command` --uses--> `TelegramLinkCode`  [INFERRED]
  management/commands/notificar_ruptura.py → dashboard/models.py
- `Command` --uses--> `TelegramPollState`  [INFERRED]
  management/commands/notificar_ruptura.py → dashboard/models.py

## Import Cycles
- None detected.

## Communities (31 total, 13 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.06
Nodes (19): Command, cod_supervisor_de(), Command, create_user_profile(), Meta, RupturaNotificacaoGerente, RupturaNotificada, save_user_profile() (+11 more)

### Community 1 - "Community 1"
Cohesion: 0.06
Nodes (19): conn_str(), _connect(), _ensure_nocount(), query_all(), query_one(), buscar_fabricantes(), buscar_materiais(), buscar_realizado_campanha() (+11 more)

### Community 2 - "Community 2"
Cohesion: 0.07
Nodes (19): _chave(), get_cache_aa(), _get_conn(), _init_db(), invalidar_cache_aa(), set_cache_aa(), _chave(), get_cache_mes() (+11 more)

### Community 3 - "Community 3"
Cohesion: 0.07
Nodes (16): CampanhaVenda, CampanhaVendaObjetivo, ObjetivoMixNivel, Profile, CampanhaVendaObjetivoSerializer, CampanhaVendaSerializer, CustomUserSerializer, MeSerializer (+8 more)

### Community 4 - "Community 4"
Cohesion: 0.12
Nodes (19): _build_in_filter(), buscar_venda_hoje(), _hoje_brasil(), buscar_clientes_positivacao_lista(), buscar_clientes_positivacao_por_vendedor(), buscar_comissoes_vendedor(), buscar_itens_mix_por_vendedor(), buscar_itens_nao_vendidos_por_vendedor() (+11 more)

### Community 5 - "Community 5"
Cohesion: 0.07
Nodes (7): ObjetivoMensalAdmin, HasAnyRole, buscar_dump_vendas(), _validar_data(), FabricanteSearchView, MaterialSearchView, PivotVendasView

### Community 6 - "Community 6"
Cohesion: 0.08
Nodes (8): get_cached_data(), get_funcionario_por_codigo(), _calc_liquido_por_vendedor_por_rotas(), clientes_top10(), funcionario_detail(), get_dados_excel(), _resumo_detalhamento(), _to_float_safe()

### Community 7 - "Community 7"
Cohesion: 0.18
Nodes (12): _as_date(), buscar_itens_mix_por_ug(), buscar_itens_nao_vendidos_por_ug(), _buscar_mapa_materiais_por_ug(), buscar_mix_pdv_gerente(), buscar_mix_pdv_por_perfil(), buscar_mix_pdv_supervisor(), buscar_mix_pdv_vendedor() (+4 more)

### Community 8 - "Community 8"
Cohesion: 0.15
Nodes (9): _as_date(), buscar_pdv_comparativo(), buscar_pdv_por_unid_gestora(), buscar_pdv_por_unid_gestora_ano_anterior(), buscar_vendas_pdv(), _intervalo_ano_anterior(), _intervalo_exclusivo(), somar_linhas_pdv() (+1 more)

### Community 9 - "Community 9"
Cohesion: 0.12
Nodes (8): buscar_rotas_usuario(), FuncionariosListView, me(), MinhasRotasSupervisorView, MinhaUnidGestoraView, _to_int(), TodosVendedoresView, VendaHojeView

### Community 10 - "Community 10"
Cohesion: 0.14
Nodes (9): ObjetivoMensalVendedor, get_objetivo_mensal_serializado(), get_objetivos_vendedores_por_mes(), _media_ponderada_gerente(), _media_ponderada_supervisor(), _meses_no_periodo(), _num(), safe_divide() (+1 more)

### Community 11 - "Community 11"
Cohesion: 0.19
Nodes (6): Feriado, FeriadoSerializer, calcular_matematica_projecao(), get_dias_uteis_info(), _hoje_brasil(), FeriadoView

### Community 12 - "Community 12"
Cohesion: 0.12
Nodes (8): ClientesPositivacaoAreaView, ClientesPositivacaoView, IndicadoresView, MixItensAreaView, MixItensPorVendedorView, TelegramDesvincularView, TelegramGerarCodigoView, VendasPorVendedorView

### Community 13 - "Community 13"
Cohesion: 0.16
Nodes (5): RoleContextMixin, get_role_context(), RoleContext, ComissoesVendedorView, TelegramStatusView

### Community 14 - "Community 14"
Cohesion: 0.18
Nodes (6): buscar_itens_pre_venda(), buscar_status_pre_vendas(), _dt_bounds(), _validar_data(), PreVendaItensView, PreVendaStatusView

### Community 15 - "Community 15"
Cohesion: 0.20
Nodes (6): buscar_ruptura(), buscar_ruptura_itens_detalhado(), _to_int_list(), _validar_data(), RupturaItensView, RupturaView

### Community 16 - "Community 16"
Cohesion: 0.24
Nodes (5): ObjetivoMensal, ObjetivoMensalSerializer, ObjetivoMensalResumoView, ObjetivoMensalVendedorView, ObjetivoMensalView

### Community 17 - "Community 17"
Cohesion: 0.29
Nodes (3): Meta, RegisterView, UserRegisterSerializer

## Knowledge Gaps
- **1 isolated node(s):** `Meta`
  These have ≤1 connection - possible missing edges. (Counts symbols only; 200 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **13 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `query_all()` connect `Community 1` to `Community 4`, `Community 5`, `Community 6`, `Community 7`, `Community 8`, `Community 9`, `Community 14`, `Community 15`?**
  _High betweenness centrality (0.090) - this node is a cross-community bridge._
- **What connects `Meta` to the rest of the system?**
  _1 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.055944055944055944 - nodes in this community are weakly interconnected._
- **Why does `get_role_context()` connect `Community 13` to `Community 1`, `Community 2`, `Community 6`, `Community 9`, `Community 10`, `Community 11`, `Community 12`, `Community 14`, `Community 19`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.05909090909090909 - nodes in this community are weakly interconnected._
- **Why does `buscar_ruptura()` connect `Community 15` to `Community 0`, `Community 1`, `Community 10`, `Community 6`?**
  _High betweenness centrality (0.027) - this node is a cross-community bridge._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.07428571428571429 - nodes in this community are weakly interconnected._