# Graph Report - dash-dev  (2026-11-10)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 1440 nodes · 2698 edges · 105 communities (63 shown, 42 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 49 edges (avg confidence: 0.94)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `10e2ea5b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- models.py
- dbo.Cliente
- .get
- campanhas_views.py
- APIView
- os
- pdv_mix_service.py
- dbo.Funcionario
- IndicativosDeVenda.jsx
- APIView
- pdv_service.py
- App.js
- Feriado
- django_core_management_base
- pre_venda_status_service.py
- buscar_rotas_usuario
- CacheAdminSection.jsx
- dbo.FormaReceb
- Dashboard.jsx
- CardsDetalhadosVendedor.jsx
- GerenciarCampanhas.jsx
- dbo.NaturezaOperacao
- models.py
- MultiDBRouter
- campanhas_views.py
- query_all
- Command
- CardsColaborador.jsx
- Pivot/PivotVendas.jsx
- dbo.Conta
- api.js
- .get
- index.js
- django_core_management_base
- query_all
- ResumoVendas.jsx
- ref_react
- campanhas_service.py
- Command
- Meta
- buscar_ruptura
- admin.py
- venda_hoje_service.py
- buscar_dump_vendas
- manage.py
- Pivot/PivotVendas.jsx
- datetime
- dashboard/management/__init__.py
- indicadores/__init__.py
- services/__init__.py
- signals.py
- backend/management/commands/__init__.py
- backend/management/__init__.py
- RegisterMix.jsx
- admin.py
- setupTests.js
- CustomUserSerializer
- HasAnyRole
- apps.py
- VendedorTelegram
- RupturaNotificacaoGerente
- converter_schema.py
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
- CardsDetalhadosVendedor.jsx
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
- UserRegisterSerializer
- dbo.UnidadeGestora
- dbo.ContasPagar
- dbo.ClienteDocumento
- dbo.VeiculoMovimentacao
- dbo.ClienteAnotacao
- dbo.CriterioFornecedorFornecedor

## God Nodes (most connected - your core abstractions)
1. `query_all()` - 58 edges
2. `dbo.Material` - 46 edges
3. `dbo.Cliente` - 43 edges
4. `get_role_context()` - 26 edges
5. `dbo.Funcionario` - 22 edges
6. `api` - 20 edges
7. `IndicadoresCards()` - 19 edges
8. `buscar_rotas_usuario()` - 18 edges
9. `useAuth()` - 15 edges
10. `buscar_ruptura()` - 14 edges

## Surprising Connections (you probably didn't know these)
- `ObjetivoMensalVendedorView` --uses--> `ObjetivoMensal`  [INFERRED]
  backend/dashboard/views/main_views.py → backend/dashboard/models.py
- `get_dias_uteis_info()` --uses--> `Feriado`  [INFERRED]
  backend/dashboard/services/indicadores/calculos_projecao.py → backend/dashboard/models.py
- `Command` --uses--> `RupturaNotificada`  [INFERRED]
  backend/dashboard/management/commands/notificar_ruptura.py → backend/dashboard/models.py
- `Command` --uses--> `RupturaNotificada`  [INFERRED]
  backend/management/commands/notificar_ruptura.py → backend/dashboard/models.py
- `Command` --uses--> `TelegramLinkCode`  [INFERRED]
  backend/dashboard/management/commands/notificar_ruptura.py → backend/dashboard/models.py

## Import Cycles
- None detected.

## Communities (105 total, 42 thin omitted)

### Community 0 - "models.py"
Cohesion: 0.01
Nodes (346): dbo.ApuracaoTipo, dbo.AtivosTI, dbo.Auditoria, dbo.Autorizacao, dbo.BancoEstabelecimento, dbo.BancoExtrato, dbo.BancoHora, dbo.BancoSaldo (+338 more)

### Community 1 - "dbo.Cliente"
Cohesion: 0.10
Nodes (21): dbo.Almoxarifado, dbo.Bairro, dbo.Cidade, dbo.Cliente, dbo.ClienteCota, dbo.ClienteDesconto, dbo.ClienteDiaSemana, dbo.ClienteExtrato (+13 more)

### Community 2 - ".get"
Cohesion: 0.05
Nodes (47): dbo.ClienteMaterialEmbalagem, dbo.DocumentoProcesso, dbo.DocumentoProcessoFunc, dbo.Embalagem, dbo.EmbalagemTipo, dbo.MapaProducaoMaterial, dbo.MapaProducaoProcesso, dbo.MapaProducaoProcessoFunc (+39 more)

### Community 3 - "campanhas_views.py"
Cohesion: 0.08
Nodes (18): _chave(), get_cache_aa(), _get_conn(), _init_db(), invalidar_cache_aa(), set_cache_aa(), _chave(), get_cache_mes() (+10 more)

### Community 4 - "APIView"
Cohesion: 0.05
Nodes (22): RoleContextMixin, get_role_context(), RoleContext, ClientesPositivacaoAreaView, ClientesPositivacaoView, _cod_vend_int(), ComissoesVendedorView, FuncionariosListView (+14 more)

### Community 6 - "pdv_mix_service.py"
Cohesion: 0.15
Nodes (21): BarChartColaboradores(), calcGerenteObjetivosFromEscopo(), calcGerenteVendaFromEscopo(), Card(), CardDiarioNecessario(), diasUteisEntre(), dlog(), filtrarPorSupervisao() (+13 more)

### Community 7 - "dbo.Funcionario"
Cohesion: 0.06
Nodes (39): dbo.Assinatura, dbo.Cargo, dbo.ClienteComentario, dbo.ContaSetor, dbo.Corretora, dbo.DocumentoAssinatura, dbo.EficienciaSeparacaoPedido, dbo.Equipe (+31 more)

### Community 8 - "IndicativosDeVenda.jsx"
Cohesion: 0.18
Nodes (12): _as_date(), buscar_itens_mix_por_ug(), buscar_itens_nao_vendidos_por_ug(), _buscar_mapa_materiais_por_ug(), buscar_mix_pdv_gerente(), buscar_mix_pdv_por_perfil(), buscar_mix_pdv_supervisor(), buscar_mix_pdv_vendedor() (+4 more)

### Community 9 - "APIView"
Cohesion: 0.15
Nodes (16): buscar_clientes_positivacao_lista(), buscar_clientes_positivacao_por_vendedor(), buscar_comissoes_vendedor(), buscar_itens_mix_por_vendedor(), buscar_itens_nao_vendidos_por_vendedor(), buscar_mix_agregado(), buscar_positivacao_por_rota(), buscar_pre_venda() (+8 more)

### Community 10 - "pdv_service.py"
Cohesion: 0.16
Nodes (13): BarChartsColaboradoresKPIs(), toPct(), CardsCampanhas(), CardDiarioNecessarioVendedor(), CardsColaborador(), contarDiasUteisLocal(), dlog(), IndicativosTabelaVendedor() (+5 more)

### Community 11 - "App.js"
Cohesion: 0.06
Nodes (18): ObjetivoMensalVendedor, Meta, get_cached_data(), _calc_liquido_por_vendedor_por_rotas(), clientes_top10(), get_dados_excel(), get_objetivo_mensal_serializado(), get_objetivos_vendedores_por_mes() (+10 more)

### Community 12 - "Feriado"
Cohesion: 0.33
Nodes (5): Feriado, Meta, FeriadoSerializer, Meta, FeriadoView

### Community 14 - "pre_venda_status_service.py"
Cohesion: 0.09
Nodes (23): dbo.Complemento, dbo.Documento, dbo.DocumentoFornecedorMult, dbo.DocumentoImagem, dbo.DocumentoIntegracaoCampos, dbo.DocumentoIntegracaoTIpo, dbo.DocumentoItens, dbo.Evento (+15 more)

### Community 15 - "buscar_rotas_usuario"
Cohesion: 0.23
Nodes (10): App(), Login(), EditarUsuario(), formatPhone(), Feriados(), RegisterUser(), PrivateRoute(), AuthCtx (+2 more)

### Community 16 - "CacheAdminSection.jsx"
Cohesion: 0.15
Nodes (13): dbo.Classificador, dbo.ClassificadorTipo, dbo.Contrato, dbo.ContratoPatrimonio, dbo.Depreciacao, dbo.Patrimonio, dbo.PatrimonioMeta, dbo.PatrimonioTipo (+5 more)

### Community 17 - "dbo.FormaReceb"
Cohesion: 0.28
Nodes (9): dbo.FormaReceb, dbo.FormaRecebGrupo, dbo.FormaRecebParcelas, dbo.NaturezaOpFormaReceb, dbo.RestauranteCaixa, dbo.RestaurantePedidoVenda, dbo.TabelaPreco, dbo.TabelaPrecoFormaReceb (+1 more)

### Community 18 - "Dashboard.jsx"
Cohesion: 0.17
Nodes (6): api, AuthCtx, TelegramVincular(), PALETTE, apiServices, ClienteService

### Community 19 - "CardsDetalhadosVendedor.jsx"
Cohesion: 0.16
Nodes (6): RupturaNotificada, Meta, TelegramLinkCode, Meta, TelegramPollState, Meta

### Community 20 - "GerenciarCampanhas.jsx"
Cohesion: 0.18
Nodes (8): _as_date(), buscar_pdv_comparativo(), buscar_pdv_por_unid_gestora(), buscar_pdv_por_unid_gestora_ano_anterior(), buscar_vendas_pdv(), _intervalo_ano_anterior(), _intervalo_exclusivo(), somar_linhas_pdv()

### Community 21 - "dbo.NaturezaOperacao"
Cohesion: 0.20
Nodes (10): dbo.MaterialIntegracaoContabil, dbo.NaturezaOp, dbo.NaturezaOpCliente, dbo.NaturezaOpCompra, dbo.NaturezaOperacao, dbo.NaturezaOperacaoClasse, dbo.NaturezaOperacaoCompra, dbo.NaturezaOpFiscal (+2 more)

### Community 22 - "models.py"
Cohesion: 0.17
Nodes (7): create_user_profile(), Profile, save_user_profile(), MeSerializer, Meta, ProfileSerializer, Meta

### Community 23 - "MultiDBRouter"
Cohesion: 0.31
Nodes (6): ObjetivoMensal, Meta, ObjetivoMensalSerializer, Meta, ObjetivoMensalResumoView, ObjetivoMensalView

### Community 24 - "campanhas_views.py"
Cohesion: 0.11
Nodes (11): buscar_fabricantes(), buscar_grupos(), buscar_materiais(), buscar_realizado_campanha(), _clamp_limit(), buscar_rotas_usuario(), CampanhasPainelView, _consolidar() (+3 more)

### Community 25 - "query_all"
Cohesion: 0.14
Nodes (17): dbo.Analise, dbo.AnaliseCertificado, dbo.AnaliseCertificadoItem, dbo.AnaliseEmitente, dbo.AnaliseGrupo, dbo.AnaliseItem, dbo.AnaliseItemFaixa, dbo.AnaliseMaterial (+9 more)

### Community 26 - "Command"
Cohesion: 0.21
Nodes (12): BlocoMedida(), CardResumo(), classePct(), fmtData(), fmtPct(), MEDIDAS, ModalCampanha(), ritmoDe() (+4 more)

### Community 27 - "CardsColaborador.jsx"
Cohesion: 0.21
Nodes (14): BuscaAutocomplete(), cardStyle, CelulaMedida(), corPct(), DetalheCampanha(), extrairErro(), fmtDataBR(), FormNovaCampanha() (+6 more)

### Community 28 - "Pivot/PivotVendas.jsx"
Cohesion: 0.22
Nodes (3): buscar_dump_vendas(), _validar_data(), PivotVendasView

### Community 29 - "dbo.Conta"
Cohesion: 0.25
Nodes (8): dbo.Boleto, dbo.Caixa, dbo.CaixaParcelas, dbo.Conta, dbo.ContasReceber, dbo.Moeda, dbo.PagamentoPeriodico, dbo.PagamentoPeriodicoItem

### Community 30 - "api.js"
Cohesion: 0.19
Nodes (5): CampanhaVendaObjetivo, Meta, CampanhaVendaObjetivoSerializer, Meta, CampanhaVendaObjetivoViewSet

### Community 31 - ".get"
Cohesion: 0.12
Nodes (6): buscar_cupons_por_vendedor(), buscar_vendedores_mesma_supervisao(), obter_unid_gestoras_por_vendedores(), PDVPorVendedorAPIView, ResumoSegmentoAreaVendaView, VendasPorVendedorView

### Community 32 - "index.js"
Cohesion: 0.20
Nodes (14): dbo.BICubo, dbo.BILayout, dbo.BIMenuLayout, dbo.UserGrupoUsuario, dbo.UserGrupoUsuarioOp, dbo.UserGrupoUsuarioOpAdicional, dbo.UserGrupoUsuarioOpWeb, dbo.UserModulo (+6 more)

### Community 33 - "django_core_management_base"
Cohesion: 0.25
Nodes (12): CacheAdminSection(), chevronStyle(), feedbackStyle(), fmtData(), fmtDataHora(), S, tagStyle(), TIPO_CORES (+4 more)

### Community 34 - "query_all"
Cohesion: 0.10
Nodes (14): _connect(), _ensure_nocount(), query_all(), query_one(), obter_cod_supervisor(), Todos_Vendedores(), buscar_objetivo_peso_positivacao(), _to_int_list() (+6 more)

### Community 35 - "ResumoVendas.jsx"
Cohesion: 0.16
Nodes (5): CampanhaVendaProgressoView, FabricanteSearchView, GrupoSearchView, MaterialSearchView, _to_int_or_none()

### Community 36 - "ref_react"
Cohesion: 0.15
Nodes (4): Footer(), Header(), Layout(), Sidebar()

### Community 37 - "campanhas_service.py"
Cohesion: 0.18
Nodes (6): buscar_itens_pre_venda(), buscar_status_pre_vendas(), _dt_bounds(), _validar_data(), PreVendaItensView, PreVendaStatusView

### Community 38 - "Command"
Cohesion: 0.17
Nodes (12): dbo.AreaSupervisao, dbo.AreaVenda, dbo.AreaVendaFabricante, dbo.AreaVendaMetaPositivacao, dbo.Fabricante, dbo.ObjetivoFinanceiro, dbo.ObjetivoFinanceiroFabricante, dbo.Rota (+4 more)

### Community 39 - "Meta"
Cohesion: 0.25
Nodes (4): ObjetivoMixNivel, Meta, ObjetivoMixNivelSerializer, Meta

### Community 41 - "admin.py"
Cohesion: 0.21
Nodes (6): CampanhaVendaItem, Meta, CampanhaVendaItemSerializer, Meta, CampanhaVendaSerializer, Meta

### Community 42 - "venda_hoje_service.py"
Cohesion: 0.22
Nodes (5): buscar_ruptura(), buscar_ruptura_itens_detalhado(), _to_int_list(), _validar_data(), RupturaItensView

### Community 43 - "buscar_dump_vendas"
Cohesion: 0.20
Nodes (10): dbo.Estacao, dbo.EstacaoStone, dbo.Mensagem, dbo.Pocket, dbo.PocketDiaSemana, dbo.PocketMensagem, dbo.StoneEstabelecimento, dbo.StoneMaquina (+2 more)

### Community 44 - "manage.py"
Cohesion: 0.31
Nodes (3): Command, cod_supervisor_de(), formatar_moeda_brl()

### Community 45 - "Pivot/PivotVendas.jsx"
Cohesion: 0.32
Nodes (4): fmt(), MODOS, PivotVendas(), TabelaComSubtotal()

### Community 46 - "datetime"
Cohesion: 0.14
Nodes (7): calcular_matematica_projecao(), get_dias_uteis_info(), _hoje_brasil(), _build_in_filter(), buscar_venda_hoje(), _hoje_brasil(), VendaHojeView

### Community 47 - "dashboard/management/__init__.py"
Cohesion: 0.25
Nodes (3): CampanhaVenda, Meta, CampanhaVendaViewSet

### Community 48 - "indicadores/__init__.py"
Cohesion: 0.39
Nodes (3): _bot_token(), buscar_updates(), enviar_mensagem()

### Community 53 - "RegisterMix.jsx"
Cohesion: 0.40
Nodes (6): dbo.PDVCartaCredito, dbo.PDVCupom, dbo.PDVCupomItens, dbo.PDVCupomParcelas, dbo.PDVDevolucao, dbo.PDVDevolucaoItens

### Community 56 - "CustomUserSerializer"
Cohesion: 0.38
Nodes (3): CustomUserSerializer, Meta, UsuarioDetailView

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

### Community 72 - "CardsDetalhadosVendedor.jsx"
Cohesion: 0.52
Nodes (4): CardsDetalhadosVendedor(), fmtMoeda(), TabelaClientesvendedor(), TabelaMixProdutosVendedor()

### Community 99 - "dbo.UnidadeGestora"
Cohesion: 0.33
Nodes (6): dbo.BoletoFormato, dbo.BoletoTipo, dbo.LoginUsuarioUnidade, dbo.TabelaPrecoUnidadeGestora, dbo.UnidadeGestora, dbo.UserUsuarioUnidade

### Community 100 - "dbo.ContasPagar"
Cohesion: 0.33
Nodes (6): dbo.CelulaProducao, dbo.CelulaProducaoLinha, dbo.CentroCusto, dbo.ContasPagar, dbo.LinhaProducao, dbo.LinhaProducaoMaterial

### Community 101 - "dbo.ClienteDocumento"
Cohesion: 0.67
Nodes (3): dbo.ClienteDocumento, dbo.DocumentoModelo, dbo.DocumentoTipo

### Community 102 - "dbo.VeiculoMovimentacao"
Cohesion: 0.67
Nodes (3): dbo.MapaAbastecimento, dbo.MapaAbastecimentoMovimentacao, dbo.VeiculoMovimentacao

## Knowledge Gaps
- **42 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `buscar_ruptura()` connect `venda_hoje_service.py` to `query_all`, `App.js`, `manage.py`, `signals.py`, `CardsDetalhadosVendedor.jsx`, `.get`?**
  _High betweenness centrality (0.009) - this node is a cross-community bridge._
- **Should `models.py` be split into smaller, more focused modules?**
  _Cohesion score 0.005763688760806916 - nodes in this community are weakly interconnected._
- **Why does `UserRegisterSerializer` connect `UserRegisterSerializer` to `App.js`, `models.py`?**
  _High betweenness centrality (0.009) - this node is a cross-community bridge._
- **Should `dbo.Cliente` be split into smaller, more focused modules?**
  _Cohesion score 0.10476190476190476 - nodes in this community are weakly interconnected._
- **Why does `query_all()` connect `query_all` to `campanhas_service.py`, `IndicativosDeVenda.jsx`, `APIView`, `venda_hoje_service.py`, `App.js`, `datetime`, `GerenciarCampanhas.jsx`, `campanhas_views.py`, `Pivot/PivotVendas.jsx`, `.get`?**
  _High betweenness centrality (0.008) - this node is a cross-community bridge._
- **Should `.get` be split into smaller, more focused modules?**
  _Cohesion score 0.04810360777058279 - nodes in this community are weakly interconnected._
- **Should `campanhas_views.py` be split into smaller, more focused modules?**
  _Cohesion score 0.08048103607770583 - nodes in this community are weakly interconnected._