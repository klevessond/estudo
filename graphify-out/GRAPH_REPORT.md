# Graph Report - dash-dev  (2026-11-23)

## Corpus Check
- 117 files · ~112,775 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 35 file(s) not represented in the graph (top: .css 30, (none) 4, .example 1)
- WARNING: 35 of 154 files seen (23%) have no supported extractor and are missing from this graph entirely. It may look complete while representing only part of the codebase.

## Summary
- 1557 nodes · 3129 edges · 92 communities (55 shown, 37 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 31 edges (avg confidence: 0.94)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `cd1b8296`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- models.py
- dbo.Cliente
- .get
- campanhas_views.py
- vendas_views.py
- db_conn.py
- IndicativosDeVenda.jsx
- dbo.Funcionario
- IndicativosDeVenda.jsx
- APIView
- ref_react
- get_cached_data
- views/__init__.py
- teste_db.py
- pre_venda_status_service.py
- buscar_rotas_usuario
- CacheAdminSection.jsx
- ._ano_anterior
- api.js
- TelegramLinkCode
- GerenciarCampanhas.jsx
- dbo.PedidoVenda
- models.py
- ObjetivoMensalSerializer
- campanhas_service.py
- query_all
- indicadoresApi.js
- GerenciarCampanhas.jsx
- Pivot/PivotVendas.jsx
- telegram_views.py
- CampanhaVendaObjetivoSerializer
- pdv_views.py
- index.js
- django_core_management_base
- .get
- campanhas_views.py
- auth.jsx
- campanhas_service.py
- Command
- venda_hoje_service.py
- buscar_ruptura
- admin.py
- venda_hoje_service.py
- buscar_dump_vendas
- manage.py
- Pivot/PivotVendas.jsx
- indicadores_views.py
- UserRegisterSerializer
- indicadores/__init__.py
- RupturaNotificada
- backend/management/__init__.py
- RegisterMix.jsx
- TelegramPollState
- usuarios_views.py
- tests.py
- apps.py
- VendedorTelegram
- dbo.CartaoProcess
- dbo.NFe
- dbo.NFeDest
- dbo.SyncDataBaseItens
- dbo.Banco
- dbo.LoginUsuario
- dbo.DocumentoConferencia
- dbo.IndiceComissao
- dbo.IntegracaoMovimento
- dbo.PDVECF
- dbo.Formato
- dbo.Grupo
- dbo.IntegracaoContabilConfigDocumento
- dbo.IntegracaoContabilConfigNotaFiscal
- dbo.MapaExpedicaoConferencia
- dbo.MapaProducaoSubTipo
- dbo.PocketDocProcess
- dbo.PocketDocPropostaItem
- dbo.PocketPedidoVenda
- dbo.ReciboTipo
- dbo.Sequencia
- dbo.UsuarioWeb
- dbo.Widget

## God Nodes (most connected - your core abstractions)
1. `query_all()` - 56 edges
2. `dbo.Material` - 46 edges
3. `dbo.Cliente` - 43 edges
4. `get_role_context()` - 33 edges
5. `IndicadoresCards()` - 25 edges
6. `buscar_rotas_usuario()` - 22 edges
7. `dbo.Funcionario` - 22 edges
8. `get_cache_mes()` - 17 edges
9. `set_cache_mes()` - 17 edges
10. `useAuth()` - 15 edges

## Surprising Connections (you probably didn't know these)
- `MatrizDePermissoes` --uses--> `IsAdminOrGerente`  [INFERRED]
  backend/dashboard/tests.py → backend/dashboard/permissions.py
- `FuncionariosListView` --uses--> `IsAdminOrGerente`  [INFERRED]
  backend/dashboard/views/usuarios_views.py → backend/dashboard/permissions.py
- `RegisterView` --uses--> `IsAdminOrGerente`  [INFERRED]
  backend/dashboard/views/usuarios_views.py → backend/dashboard/permissions.py
- `MatrizDePermissoes` --uses--> `EscritaAdminGerenteSupervisor`  [INFERRED]
  backend/dashboard/tests.py → backend/dashboard/permissions.py
- `CampanhaVendaViewSet` --uses--> `EscritaAdminGerenteSupervisor`  [INFERRED]
  backend/dashboard/views/campanhas_views.py → backend/dashboard/permissions.py

## Import Cycles
- 2-file cycle: `frontend/src/components/metricard/IndicativosDeVenda.jsx -> frontend/src/components/metricard/indicativos/CardDiarioNecessario.jsx -> frontend/src/components/metricard/IndicativosDeVenda.jsx`
- 2-file cycle: `frontend/src/components/metricard/IndicativosDeVenda.jsx -> frontend/src/components/metricard/indicativos/Card.jsx -> frontend/src/components/metricard/IndicativosDeVenda.jsx`
- 2-file cycle: `frontend/src/components/metricard/IndicativosDeVenda.jsx -> frontend/src/components/metricard/indicativos/ProjectionModal.jsx -> frontend/src/components/metricard/IndicativosDeVenda.jsx`
- 2-file cycle: `frontend/src/components/metricard/CardDiarioNecessarioVendedor.jsx -> frontend/src/components/metricard/CardsColaborador.jsx -> frontend/src/components/metricard/CardDiarioNecessarioVendedor.jsx`

## Communities (92 total, 37 thin omitted)

### Community 0 - "models.py"
Cohesion: 0.01
Nodes (346): dbo.ApuracaoTipo, dbo.AtivosTI, dbo.Auditoria, dbo.Autorizacao, dbo.BancoEstabelecimento, dbo.BancoExtrato, dbo.BancoHora, dbo.BancoSaldo (+338 more)

### Community 1 - "dbo.Cliente"
Cohesion: 0.05
Nodes (49): dbo.Almoxarifado, dbo.Anotacao, dbo.Bairro, dbo.Boleto, dbo.BoletoFormato, dbo.BoletoTipo, dbo.Caixa, dbo.CaixaParcelas (+41 more)

### Community 2 - ".get"
Cohesion: 0.05
Nodes (48): dbo.ClienteMaterialEmbalagem, dbo.DocumentoProcesso, dbo.DocumentoProcessoFunc, dbo.Embalagem, dbo.EmbalagemTipo, dbo.MapaProducao, dbo.MapaProducaoApoio, dbo.MapaProducaoDocumento (+40 more)

### Community 3 - "campanhas_views.py"
Cohesion: 0.06
Nodes (21): _chave(), get_cache_aa(), _get_conn(), _init_db(), invalidar_cache_aa(), set_cache_aa(), _get_conn(), _init_db() (+13 more)

### Community 4 - "vendas_views.py"
Cohesion: 0.09
Nodes (10): RoleContextMixin, eh_gerente(), get_role_context(), RoleContext, buscar_rotas_usuario(), listar_funcionarios(), _cod_vend_int(), ResumoSegmentoAreaVendaView (+2 more)

### Community 5 - "db_conn.py"
Cohesion: 0.12
Nodes (4): conn_str(), _connect(), _ensure_nocount(), query_one()

### Community 6 - "IndicativosDeVenda.jsx"
Cohesion: 0.18
Nodes (20): Card(), Gauge(), ProjectionModal(), calcGerenteObjetivosFromEscopo(), calcGerenteVendaFromEscopo(), dlog(), filtrarPorSupervisao(), getMinhaLinha() (+12 more)

### Community 7 - "dbo.Funcionario"
Cohesion: 0.08
Nodes (30): dbo.Assinatura, dbo.Cargo, dbo.ClienteComentario, dbo.ContaSetor, dbo.DocumentoAssinatura, dbo.Equipe, dbo.EquipeFuncionario, dbo.FormaReceb (+22 more)

### Community 8 - "IndicativosDeVenda.jsx"
Cohesion: 0.16
Nodes (12): _as_date(), buscar_itens_mix_por_ug(), buscar_itens_nao_vendidos_por_ug(), _buscar_mapa_materiais_por_ug(), buscar_mix_pdv_gerente(), buscar_mix_pdv_por_perfil(), buscar_mix_pdv_supervisor(), buscar_mix_pdv_vendedor() (+4 more)

### Community 9 - "APIView"
Cohesion: 0.14
Nodes (18): query_all(), buscar_clientes_positivacao_lista(), buscar_clientes_positivacao_por_vendedor(), buscar_comissoes_vendedor(), buscar_itens_mix_por_vendedor(), buscar_itens_nao_vendidos_por_vendedor(), buscar_mix_agregado(), buscar_positivacao_por_rota() (+10 more)

### Community 10 - "ref_react"
Cohesion: 0.09
Nodes (15): BarChartsColaboradoresKPIs(), toPct(), CardsDetalhadosVendedor(), dlog(), IndicativosTabelaVendedor(), TabelaClientesvendedor(), TabelaMixProdutosVendedor(), Dashboard() (+7 more)

### Community 12 - "views/__init__.py"
Cohesion: 0.12
Nodes (12): ClientesPositivacaoAreaView, ClientesPositivacaoView, ComissoesVendedorView, MixItensAreaView, MixItensPorVendedorView, ObjetivoMensalVendedorView, PivotVendasView, PreVendaItensView (+4 more)

### Community 14 - "pre_venda_status_service.py"
Cohesion: 0.09
Nodes (23): dbo.Complemento, dbo.Documento, dbo.DocumentoFornecedorMult, dbo.DocumentoImagem, dbo.DocumentoIntegracaoCampos, dbo.DocumentoIntegracaoTIpo, dbo.DocumentoItens, dbo.Evento (+15 more)

### Community 15 - "buscar_rotas_usuario"
Cohesion: 0.17
Nodes (19): App(), Login(), EditarUsuario(), formatPhone(), Feriados(), RegisterUser(), PrivateRoute(), ToastContext (+11 more)

### Community 16 - "CacheAdminSection.jsx"
Cohesion: 0.10
Nodes (22): dbo.Classificador, dbo.ClassificadorTipo, dbo.Contrato, dbo.ContratoPatrimonio, dbo.Corretora, dbo.Depreciacao, dbo.MapaAbastecimento, dbo.MapaAbastecimentoMovimentacao (+14 more)

### Community 17 - "._ano_anterior"
Cohesion: 0.15
Nodes (10): _chave(), get_cache_mes(), periodo_cacheavel(), set_cache_mes(), _num(), safe_divide(), _to_float(), _to_int() (+2 more)

### Community 18 - "api.js"
Cohesion: 0.29
Nodes (5): api, TelegramVincular(), desvincularTelegram(), gerarCodigoTelegram(), getStatusTelegram()

### Community 20 - "GerenciarCampanhas.jsx"
Cohesion: 0.18
Nodes (8): _as_date(), buscar_pdv_comparativo(), buscar_pdv_por_unid_gestora(), buscar_pdv_por_unid_gestora_ano_anterior(), buscar_vendas_pdv(), _intervalo_ano_anterior(), _intervalo_exclusivo(), somar_linhas_pdv()

### Community 21 - "dbo.PedidoVenda"
Cohesion: 0.11
Nodes (20): dbo.EficienciaSeparacaoPedido, dbo.MapaExpedicao, dbo.MapaExpedicaoDespesa, dbo.MapaExpedicaoPedido, dbo.MapaExpedicaoPreVenda, dbo.MaterialIntegracaoContabil, dbo.NaturezaOp, dbo.NaturezaOpCliente (+12 more)

### Community 22 - "models.py"
Cohesion: 0.05
Nodes (25): ObjetivoMensalAdmin, CampanhaVenda, Meta, CampanhaVendaObjetivo, Meta, create_user_profile(), Feriado, Meta (+17 more)

### Community 23 - "ObjetivoMensalSerializer"
Cohesion: 0.39
Nodes (4): ObjetivoMensalSerializer, Meta, ObjetivoMensalResumoView, ObjetivoMensalView

### Community 24 - "campanhas_service.py"
Cohesion: 0.18
Nodes (6): buscar_fabricantes(), buscar_grupos(), buscar_materiais(), buscar_realizado_campanha(), _clamp_limit(), _to_int_or_none()

### Community 25 - "query_all"
Cohesion: 0.14
Nodes (17): dbo.Analise, dbo.AnaliseCertificado, dbo.AnaliseCertificadoItem, dbo.AnaliseEmitente, dbo.AnaliseGrupo, dbo.AnaliseItem, dbo.AnaliseItemFaixa, dbo.AnaliseMaterial (+9 more)

### Community 26 - "indicadoresApi.js"
Cohesion: 0.19
Nodes (15): CardDiarioNecessarioVendedor(), CardsColaborador(), CardDiarioNecessario(), PALETTE, ResumoSegmentoPies(), getClientesPositivacao(), getComissoesVendedor(), getMixItens() (+7 more)

### Community 27 - "GerenciarCampanhas.jsx"
Cohesion: 0.09
Nodes (39): BlocoMedida(), CardResumo(), CardsCampanhas(), classePct(), MEDIDAS, ModalCampanha(), ritmoDe(), ROTULO_ESCOPO (+31 more)

### Community 28 - "Pivot/PivotVendas.jsx"
Cohesion: 0.21
Nodes (4): buscar_objetivo_peso_positivacao(), _to_int_list(), buscar_dump_vendas(), _validar_data()

### Community 29 - "telegram_views.py"
Cohesion: 0.14
Nodes (3): TelegramDesvincularView, TelegramGerarCodigoView, TelegramStatusView

### Community 31 - "pdv_views.py"
Cohesion: 0.27
Nodes (4): obter_unid_gestora(), IndicadoresPDV, MinhaUnidGestoraView, PDVPorVendedorAPIView

### Community 32 - "index.js"
Cohesion: 0.20
Nodes (14): dbo.BICubo, dbo.BILayout, dbo.BIMenuLayout, dbo.UserGrupoUsuario, dbo.UserGrupoUsuarioOp, dbo.UserGrupoUsuarioOpAdicional, dbo.UserGrupoUsuarioOpWeb, dbo.UserModulo (+6 more)

### Community 33 - "django_core_management_base"
Cohesion: 0.20
Nodes (19): CacheAdminSection(), chevronStyle(), feedbackStyle(), fmtData(), fmtDataHora(), S, tagStyle(), TIPO_CORES (+11 more)

### Community 34 - ".get"
Cohesion: 0.17
Nodes (4): obter_cod_supervisor(), Todos_Vendedores(), buscar_cupons_por_vendedor(), obter_unid_gestoras_por_vendedores()

### Community 35 - "campanhas_views.py"
Cohesion: 0.09
Nodes (10): EscritaAdminGerenteSupervisor, CampanhasPainelView, CampanhaVendaObjetivoViewSet, CampanhaVendaProgressoView, _consolidar(), FabricanteSearchView, GrupoSearchView, _mapa_realizado() (+2 more)

### Community 36 - "auth.jsx"
Cohesion: 0.29
Nodes (9): Footer(), Header(), Layout(), Sidebar(), AuthCtx, AuthProvider(), getVisibleRoles(), useAuth() (+1 more)

### Community 37 - "campanhas_service.py"
Cohesion: 0.31
Nodes (4): buscar_itens_pre_venda(), buscar_status_pre_vendas(), _dt_bounds(), _validar_data()

### Community 38 - "Command"
Cohesion: 0.17
Nodes (12): dbo.AreaSupervisao, dbo.AreaVenda, dbo.AreaVendaFabricante, dbo.AreaVendaMetaPositivacao, dbo.Fabricante, dbo.ObjetivoFinanceiro, dbo.ObjetivoFinanceiroFabricante, dbo.Rota (+4 more)

### Community 39 - "venda_hoje_service.py"
Cohesion: 0.32
Nodes (3): _build_in_filter(), buscar_venda_hoje(), _hoje_brasil()

### Community 41 - "admin.py"
Cohesion: 0.16
Nodes (5): CampanhaVendaItem, Meta, CampanhaVendaSerializer, Meta, CampanhaVendaViewSet

### Community 42 - "venda_hoje_service.py"
Cohesion: 0.19
Nodes (6): buscar_ruptura(), buscar_ruptura_itens_detalhado(), _to_int_list(), _validar_data(), RupturaItensView, RupturaView

### Community 43 - "buscar_dump_vendas"
Cohesion: 0.20
Nodes (10): dbo.Estacao, dbo.EstacaoStone, dbo.Mensagem, dbo.Pocket, dbo.PocketDiaSemana, dbo.PocketMensagem, dbo.StoneEstabelecimento, dbo.StoneMaquina (+2 more)

### Community 45 - "Pivot/PivotVendas.jsx"
Cohesion: 0.32
Nodes (4): MODOS, PivotVendas(), TabelaComSubtotal(), getPivotVendas()

### Community 46 - "indicadores_views.py"
Cohesion: 0.10
Nodes (11): calcular_matematica_projecao(), get_dias_uteis_info(), _hoje_brasil(), buscar_vendedores_mesma_supervisao(), _meses_no_periodo(), _to_float_safe(), _calc_liquido_por_vendedor_por_rotas(), _media_ponderada_gerente() (+3 more)

### Community 48 - "indicadores/__init__.py"
Cohesion: 0.31
Nodes (4): _bot_token(), buscar_updates(), enviar_mensagem(), formatar_moeda_brl()

### Community 53 - "RegisterMix.jsx"
Cohesion: 0.40
Nodes (6): dbo.PDVCartaCredito, dbo.PDVCupom, dbo.PDVCupomItens, dbo.PDVCupomParcelas, dbo.PDVDevolucao, dbo.PDVDevolucaoItens

### Community 56 - "usuarios_views.py"
Cohesion: 0.12
Nodes (9): IsAdminOrGerente, CustomUserSerializer, Meta, MeSerializer, Meta, get_funcionario_por_codigo(), funcionario_detail(), me() (+1 more)

### Community 57 - "tests.py"
Cohesion: 0.05
Nodes (17): eh_supervisor(), HasAnyRole, IsAdminGerenteOrSupervisor, _logado(), FeriadoSerializer, Meta, FeriadosAceitaSupervisor, GerenteNaoEditaContaDeAdmin (+9 more)

### Community 62 - "dbo.CartaoProcess"
Cohesion: 0.50
Nodes (4): dbo.CartaoFormato, dbo.CartaoProcess, dbo.CartaoProcessItens, dbo.CartaoStatus

### Community 63 - "dbo.NFe"
Cohesion: 0.50
Nodes (4): dbo.NFe, dbo.NFeDup, dbo.NFeItem, dbo.NFeRastro

### Community 64 - "dbo.NFeDest"
Cohesion: 0.50
Nodes (4): dbo.NFeDest, dbo.NFeDestConfRec, dbo.NFeDestImport, dbo.NFeDestImportItens

### Community 65 - "dbo.SyncDataBaseItens"
Cohesion: 0.50
Nodes (4): dbo.SyncDataBase, dbo.SyncDataBaseCampo, dbo.SyncDataBaseData, dbo.SyncDataBaseItens

### Community 66 - "dbo.Banco"
Cohesion: 0.67
Nodes (3): dbo.Banco, dbo.BancoBloqueio, dbo.BancoExtratoConciliacao

### Community 67 - "dbo.LoginUsuario"
Cohesion: 0.67
Nodes (3): dbo.ClienteSistema, dbo.LoginGrupoUsuario, dbo.LoginUsuario

### Community 68 - "dbo.DocumentoConferencia"
Cohesion: 0.67
Nodes (3): dbo.DocumentoConferencia, dbo.DocumentoConferenciaTipo, dbo.DocumentoItensConferencia

### Community 69 - "dbo.IndiceComissao"
Cohesion: 0.67
Nodes (3): dbo.IndiceComissao, dbo.IndiceComissaoFaixa, dbo.IndiceModelo

### Community 70 - "dbo.IntegracaoMovimento"
Cohesion: 0.67
Nodes (3): dbo.Integracao, dbo.IntegracaoLancamento, dbo.IntegracaoMovimento

### Community 71 - "dbo.PDVECF"
Cohesion: 1.00
Nodes (3): dbo.PDVECF, dbo.PDVReducaoZ, dbo.PDVReducaoZItens

## Knowledge Gaps
- **37 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `query_all()` connect `APIView` to `.get`, `campanhas_views.py`, `vendas_views.py`, `db_conn.py`, `campanhas_service.py`, `venda_hoje_service.py`, `IndicativosDeVenda.jsx`, `venda_hoje_service.py`, `indicadores_views.py`, `GerenciarCampanhas.jsx`, `campanhas_service.py`, `usuarios_views.py`, `Pivot/PivotVendas.jsx`, `pdv_views.py`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **Should `models.py` be split into smaller, more focused modules?**
  _Cohesion score 0.005763688760806916 - nodes in this community are weakly interconnected._
- **Why does `FeriadoView` connect `tests.py` to `campanhas_views.py`, `views/__init__.py`?**
  _High betweenness centrality (0.009) - this node is a cross-community bridge._
- **Should `dbo.Cliente` be split into smaller, more focused modules?**
  _Cohesion score 0.0467687074829932 - nodes in this community are weakly interconnected._
- **Why does `get_role_context()` connect `vendas_views.py` to `.get`, `campanhas_views.py`, `campanhas_views.py`, `views/__init__.py`, `indicadores_views.py`, `._ano_anterior`, `usuarios_views.py`, `telegram_views.py`, `pdv_views.py`?**
  _High betweenness centrality (0.008) - this node is a cross-community bridge._
- **Should `.get` be split into smaller, more focused modules?**
  _Cohesion score 0.047872340425531915 - nodes in this community are weakly interconnected._
- **Should `campanhas_views.py` be split into smaller, more focused modules?**
  _Cohesion score 0.060496067755595885 - nodes in this community are weakly interconnected._