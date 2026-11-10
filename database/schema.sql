-- Schema simplificado para o graphify (gerado por converter_schema.py)

CREATE TABLE dbo.Almoxarifado (
    CodAlmoxarifado int,
    Almoxarifado varchar(100),
    CodPai int,
    Nivel int,
    CodigoFull varchar(50),
    Codigo varchar(50),
    AlmoxarifadoFull varchar(100),
    Atualizar bit,
    Expedicao bit,
    UnidGestora int,
    Ativo bit,
    Posse int,
    CodCliente int,
    ContaContabil varchar(50),
    PRIMARY KEY (CodAlmoxarifado)
);

CREATE TABLE dbo.Analise (
    CodAnalise int,
    Analise varchar(100),
    Ativo bit,
    CodAnaliseEmitente int,
    PRIMARY KEY (CodAnalise)
);

CREATE TABLE dbo.AnaliseCertificado (
    CodAnaliseCertificado int,
    CodFuncionario int,
    CodLote int,
    CodMaterial int,
    DataEmissao datetime,
    Usuario char(20),
    Ativo bit,
    CodNotaRecebimento int,
    CodTanque int,
    CodAnalise int,
    CodAnaliseEmitente int,
    PRIMARY KEY (CodAnaliseCertificado)
);

CREATE TABLE dbo.AnaliseCertificadoItem (
    CodAnaliseCertificado int,
    CodAnaliseCertificadoItem int,
    CodAnaliseItem int,
    Resultado varchar(100),
    PRIMARY KEY (CodAnaliseCertificado, CodAnaliseCertificadoItem)
);

CREATE TABLE dbo.AnaliseEmitente (
    CodAnaliseEmitente int,
    Logo varbinary(max),
    Emitente varchar(100),
    CGC varchar(50),
    EMAIL varchar(100),
    TELEFONE1 varchar(50),
    TELEFONE2 varchar(50),
    SITE varchar(100),
    Descricao1 varchar(3000),
    Descricao2 varchar(3000),
    TituloDescricao1 varchar(100),
    TituloDescricao2 varchar(100),
    EmitenteDescricao varchar(150),
    Ativo bit,
    Observacoes varchar(300),
    CREA bit,
    CRQ bit,
    Lote bit,
    ExibirDataFabricacao bit,
    ExibirLote bit,
    PRIMARY KEY (CodAnaliseEmitente)
);

CREATE TABLE dbo.AnaliseGrupo (
    CodAnaliseGrupo int,
    AnaliseGrupo varchar(100),
    CodAnalise int,
    Sequencia int,
    Ativo bit,
    CodTipoGrupo int,
    PRIMARY KEY (CodAnaliseGrupo)
);

CREATE TABLE dbo.AnaliseItem (
    CodAnaliseItem int,
    AnaliseItem varchar(100),
    CodAnaliseGrupo int,
    Sequencia int,
    Normal varchar(50),
    Descricao varchar(250),
    NormalInicial float,
    NormalFinal float,
    CodAnaliseItemFaixaNormal int,
    Padrao varchar(50),
    Ativo bit,
    PRIMARY KEY (CodAnaliseItem)
);

CREATE TABLE dbo.AnaliseItemFaixa (
    CodAnaliseItemFaixa int,
    AnaliseItemFaixa varchar(100),
    CodAnaliseItem int,
    Sequencia int,
    ValorInicial float,
    ValorFinal float,
    Pontuacao int,
    PRIMARY KEY (CodAnaliseItemFaixa)
);

CREATE TABLE dbo.AnaliseMaterial (
    CodAnalise int,
    CodMaterial int,
    PRIMARY KEY (CodAnalise, CodMaterial)
);

CREATE TABLE dbo.Anotacao (
    CodAnotacao int,
    Anotacao varchar(200),
    Positivado bit,
    PRIMARY KEY (CodAnotacao)
);

CREATE TABLE dbo.ApuracaoTipo (
    CodApuracaoTipo int,
    ApuracaoTipo varchar(50),
    PRIMARY KEY (CodApuracaoTipo)
);

CREATE TABLE dbo.AreaSupervisao (
    CodAreaSupervisao int,
    AreaSupervisao varchar(100),
    Descricao varchar(100),
    CodSupervisor int,
    Ativa bit,
    CodTabelaComissao int,
    CodGerente int,
    CodTabelaComissaoProd int,
    PRIMARY KEY (CodAreaSupervisao)
);

CREATE TABLE dbo.AreaVenda (
    CodAreaVenda int,
    AreaVenda varchar(100),
    Descricao varchar(100),
    CodAreaSupervisao int,
    CodVendedor int,
    Ativa bit,
    CodTabelaComissaoProd int,
    TotalIndiceComissao float,
    Venda bit,
    Entrega bit,
    PRIMARY KEY (CodAreaVenda)
);

CREATE TABLE dbo.AreaVendaFabricante (
    CodAreaVenda int,
    CodFabricante int,
    Meta float,
    ComissaoAdicional float,
    PRIMARY KEY (CodAreaVenda, CodFabricante)
);

CREATE TABLE dbo.AreaVendaMetaPositivacao (
    CodAreaVenda int,
    Ano int,
    Mes int,
    MetaPositivacao int,
    PRIMARY KEY (CodAreaVenda, Ano, Mes)
);

CREATE TABLE dbo.Assinatura (
    UUIDAssinatura uniqueidentifier,
    Imagem image,
    DataCadastro datetime,
    CodFuncionario int,
    PRIMARY KEY (UUIDAssinatura)
);

CREATE TABLE dbo.AtivosTI (
    CodAtivo int,
    Usuario varchar(50),
    CodFilial int,
    Localizacao varchar(50),
    Ativo varchar(50),
    TipoAtivo int,
    TipoMaquina varchar(50),
    NotaFiscal varchar(50),
    Marca varchar(50),
    Modelo varchar(50),
    SN varchar(50),
    Observacoes varchar(255),
    PRIMARY KEY (CodAtivo)
);

CREATE TABLE dbo.Auditoria (
    Data datetime,
    Tabela varchar(50),
    Campo varchar(50),
    Codigo int,
    ValorAnterior varchar(100),
    ValorNovo varchar(100),
    Usuario varchar(50),
    idAuditoria int,
    PRIMARY KEY (idAuditoria)
);

CREATE TABLE dbo.Autorizacao (
    CodAutorizacao int,
    CodCliente int,
    Data datetime,
    UsuarioEmissao varchar(50),
    CodPedido int,
    UsuarioPedido varchar(50),
    Aut01 bit,
    Aut02 bit,
    Aut03 bit,
    Aut04 bit,
    Aut05 bit,
    Aut06 bit,
    Aut07 bit,
    Aut08 bit,
    Aut09 bit,
    Aut10 bit,
    Status bit,
    UsuarioCancelamento varchar(50),
    CodContaReceber int,
    CodDoc int,
    CodPocket int,
    PRIMARY KEY (CodAutorizacao)
);

CREATE TABLE dbo.Bairro (
    CodBairro int,
    CodCidade int,
    Bairro varchar(50),
    CodRotaVenda int,
    CodRotaEntrega int,
    DataAlteracao datetime,
    PRIMARY KEY (CodBairro)
);

CREATE TABLE dbo.Banco (
    CodBanco int,
    UnidGestora int,
    Banco varchar(50),
    NumBanco varchar(5),
    NumAgencia varchar(20),
    NumConta varchar(20),
    CPF varchar(11),
    CNPJ varchar(15),
    CodTipoConta int,
    CodConta char(7),
    CaixaExtrato bit,
    Ativo bit,
    PRIMARY KEY (CodBanco)
);

CREATE TABLE dbo.BancoBloqueio (
    CodBancoBloqueio int,
    CodBanco int,
    Usuario varchar(50),
    Data date,
    Bloqueado bit,
    PRIMARY KEY (CodBancoBloqueio)
);

CREATE TABLE dbo.BancoEstabelecimento (
    CodBanco varchar(10),
    Banco varchar(50),
    Logo image,
    PRIMARY KEY (CodBanco)
);

CREATE TABLE dbo.BancoExtrato (
    CodBancoExtrato int,
    CodBanco int,
    Data datetime,
    Ano smallint,
    Mes smallint,
    Valor float,
    Credito float,
    Debito float,
    Saldo float,
    Descricao varchar(200),
    Documento varchar(50),
    TipoMovimentacao char(2),
    Estorno char(1),
    CodBancoExtratoEstorno int,
    Observacao varchar(50),
    DataRegistro datetime,
    CodCaixa int,
    CodMoeda int,
    Usuario varchar(20),
    CodBancoExtratoConciliacao int,
    Conciliacao char(1),
    DataConciliacao datetime,
    UsuarioConciliacao varchar(20),
    PRIMARY KEY (CodBancoExtrato)
);

CREATE TABLE dbo.BancoExtratoConciliacao (
    CodBancoExtratoConciliacao int,
    CodBanco int,
    Tipo char(1),
    Data date,
    Valor float,
    Documento varchar(255),
    Descricao varchar(255),
    Hash varchar(50),
    Conciliado char(1),
    PRIMARY KEY (CodBancoExtratoConciliacao)
);

CREATE TABLE dbo.BancoHora (
    CodBancoHora int,
    CodFuncionario int,
    Data datetime,
    Usuario varchar(50),
    Operacao int,
    Debito int,
    Credito int,
    VarSaldo int,
    Descricao varchar(50),
    PRIMARY KEY (CodBancoHora, CodFuncionario)
);

CREATE TABLE dbo.BancoSaldo (
    CodBanco int,
    Saldo float,
    PRIMARY KEY (CodBanco)
);

CREATE TABLE dbo.BICubo (
    CodBICubo int,
    CodModulo char(2),
    Cubo varchar(50),
    Descricao varchar(50),
    Ativo bit,
    PRIMARY KEY (CodBICubo)
);

CREATE TABLE dbo.BIDashboard (
    CodDashboard int,
    Descricao varchar(100),
    Dados varbinary(max),
    Padrao bit,
    CodBICubo int,
    Ativo bit,
    Ordenacao int,
    PRIMARY KEY (CodDashboard)
);

CREATE TABLE dbo.BIDashboardUsuario (
    CodDashboard int,
    CodUsuario char(20),
    Filtros varchar(max),
    PRIMARY KEY (CodDashboard, CodUsuario)
);

CREATE TABLE dbo.BILayout (
    CodLayout int,
    CodBICubo int,
    Descricao varchar(100),
    Layout image,
    LayoutGrafico image,
    Padrao bit,
    MDX varchar(max),
    LayoutWeb varchar(max),
    ChartLayoutWeb varchar(max),
    AtivoWeb bit,
    PRIMARY KEY (CodLayout)
);

CREATE TABLE dbo.BILogUsuario (
    CodBILogUsuario int,
    ID varchar(50),
    Data datetime,
    PRIMARY KEY (CodBILogUsuario)
);

CREATE TABLE dbo.BIMenuLayout (
    CodRelatorioBI int,
    DescricaoLayout varchar(100),
    MenuTipo int,
    MenuGrupo int,
    MenuNivel int,
    DescricaoMenuRelatorio varchar(100),
    PRIMARY KEY (CodRelatorioBI)
);

CREATE TABLE dbo.BIObjetivoMaterial (
    Mes int,
    Ano int,
    CodMaterial int,
    QtdObjetivoUnidade float,
    QtdObjetivoEmbalagem float,
    CodAreaVenda int,
    DataDe datetime,
    CodBIObjetivoMaterial int,
    PRIMARY KEY (CodBIObjetivoMaterial)
);

CREATE TABLE dbo.BIPreferenciasWeb (
    CodUsuario char(20),
    CodCuboSelecionado int
);

CREATE TABLE dbo.BKP_Ano_Processamento (
    CodProcessamento int,
    Tipo varchar(50),
    Dia int,
    Mes int,
    Ano int,
    Processado bit,
    ProcData datetime,
    PRIMARY KEY (CodProcessamento)
);

CREATE TABLE dbo.BKP_BIDashboard (
    CodDashboard int,
    Descricao varchar(100),
    Dados varbinary(max),
    Padrao bit,
    CodBICubo int,
    Ativo bit,
    Ordenacao int
);

CREATE TABLE dbo.BKP_BIDashboardUsuario (
    CodDashboard int,
    CodUsuario char(20),
    Filtros varchar(max)
);

CREATE TABLE dbo.BKP_CCS_erros (
    UnidGestora int,
    CodConta char(9),
    Int01 int,
    Int02 int,
    Int03 int,
    Int04 int,
    Int05 int,
    Int06 int,
    Int07 int,
    Int08 int,
    Int09 int,
    Int10 int,
    Int11 int,
    Int12 int,
    Int13 int,
    Int14 int,
    Int15 int,
    Str01 varchar(20),
    Str02 varchar(20),
    Str03 varchar(20),
    Str04 varchar(20),
    Str05 varchar(20),
    Aux01 varchar(20),
    Aux02 varchar(20),
    Aux03 varchar(20),
    Aux04 varchar(20),
    Aux05 varchar(20),
    TipoContaCorrente char(20),
    Data datetime,
    Saldo float,
    FSaldo float,
    NumCC int,
    Auxiliar varchar(250)
);

CREATE TABLE dbo.BKP_CCS_erros2 (
    UnidGestora int,
    CodConta char(9),
    Int01 int,
    Int02 int,
    Int03 int,
    Int04 int,
    Int05 int,
    Int06 int,
    Int07 int,
    Int08 int,
    Int09 int,
    Int10 int,
    Int11 int,
    Int12 int,
    Int13 int,
    Int14 int,
    Int15 int,
    Str01 varchar(20),
    Str02 varchar(20),
    Str03 varchar(20),
    Str04 varchar(20),
    Str05 varchar(20),
    Aux01 varchar(20),
    Aux02 varchar(20),
    Aux03 varchar(20),
    Aux04 varchar(20),
    Aux05 varchar(20),
    TipoContaCorrente char(20),
    Data datetime,
    Saldo float,
    FSaldo float,
    NumCC int,
    Auxiliar varchar(250)
);

CREATE TABLE dbo.BKP_Cliente (
    CodCliente int,
    UnidGestora int,
    Cliente varchar(100),
    ClienteFantasia varchar(100),
    Endereco varchar(100),
    CEP char(8),
    Celular varchar(20),
    Celular2 varchar(20),
    Fone varchar(20),
    Fone2 varchar(20),
    Fax varchar(20),
    CodEstadoFiscal char(2),
    CodEstado char(2),
    email varchar(100),
    CodCidade int,
    CodBairro int,
    CodZona int,
    CodRegiao int,
    CodRota int,
    CodSegmento int,
    CGC varchar(20),
    CPF varchar(11),
    IE varchar(20),
    CAE varchar(20),
    RG varchar(20),
    RGORGAO varchar(20),
    RGUF char(2),
    CobrancaEndereco varchar(100),
    CodCobrancaBairro int,
    CodCobrancaCidade int,
    CodCobrancaEstado char(2),
    CobrancaCEP char(8),
    CobrancaFone varchar(20),
    CobrancaFone2 varchar(20),
    CobrancaCelular varchar(20),
    CobrancaCelular2 varchar(20),
    Contato varchar(100),
    ContatoEndereco varchar(100),
    CodContatoBairro int,
    CodContatoCidade int,
    CodContatoEstado char(2),
    ContatoCEP char(8),
    ContatoFone varchar(20),
    ContatoFone2 varchar(20),
    ContatoCelular varchar(20),
    ContatoCelular2 varchar(20),
    CodEstadoCivil int,
    DataNasc datetime,
    MesNasc smallint,
    Pai varchar(100),
    Mae varchar(100),
    Nacionalidade varchar(50),
    Naturalidade varchar(50),
    ReferBancaria varchar(100),
    ReferBancariaInform varchar(100),
    ReferBancariaFone varchar(20),
    ReferBancaria2 varchar(100),
    ReferBancaria2Inform varchar(100),
    ReferBancaria2Fone varchar(20),
    ReferBancaria3 varchar(100),
    ReferBancaria3Inform varchar(100),
    ReferBancaria3Fone varchar(20),
    ReferComercial varchar(100),
    ReferComercialInform varchar(100),
    ReferComercialFone varchar(20),
    ReferComercial2 varchar(100),
    ReferComercial2Inform varchar(100),
    ReferComercial2Fone varchar(20),
    ReferComercial3 varchar(100),
    ReferComercial3Inform varchar(100),
    ReferComercial3Fone varchar(20),
    CodFormaPagto int,
    ReferPessoal varchar(100),
    ReferPessoalInform varchar(100),
    ReferPessoalFone varchar(20),
    AreaAcao varchar(100),
    RendaMensal float,
    RendaOutros float,
    LimiteCredito float,
    PontoReferencia varchar(200),
    Saldo float,
    CodTabelaPreco int,
    TabelaReferencia char(1),
    FreezerProprio bit,
    Ativo bit,
    DataAtivacao datetime,
    DataDesativacao datetime,
    DataUltimaCompra datetime,
    QtdCompra int,
    Bloqueado bit,
    ObsBloqueado varchar(100),
    QtdMaxPedido int,
    QtdMaxConta int,
    FisicaJuridica char(1),
    Observacao varchar(100),
    CodTabelaMeta int,
    Qtd1 int,
    Qtd2 int,
    Qtd3 int,
    Qtd4 int,
    Qtd5 int,
    Qtd6 int,
    Qtd7 int,
    Qtd8 int,
    Qtd9 int,
    Qtd10 int,
    AtivoAuto bit,
    Usuario varchar(50),
    DataAlteracao datetime,
    CodDiaSemana int,
    Titular varchar(100),
    TitularCPF varchar(11),
    TitularCGC varchar(20),
    Banco int,
    Agencia varchar(20),
    Conta varchar(20),
    CodSPC int,
    ObsPedido varchar(50),
    Bonus bit,
    Sequencia int,
    TotalEmAberto float,
    Meta float,
    Meta1 float,
    Meta2 float,
    Meta3 float,
    Meta4 float,
    Meta5 float,
    Meta6 float,
    Meta7 float,
    Meta8 float,
    Meta9 float,
    Meta10 float,
    Meta11 float,
    Meta12 float,
    IsentoICMSSubst bit,
    IsentoIPI bit,
    PrazoProtesto int,
    ComissaoAdicional float,
    Historico text,
    QtdMaxPedidoAtraso int,
    QtdMaxContaAtraso int,
    LimiteCreditoAtraso float,
    CodRede int,
    Mensalista int,
    Latitude float,
    Longitude float,
    Altitude float,
    Operador int,
    CodOperador int,
    CodRotaEntrega int,
    email2 varchar(100),
    EnviaEmail bit,
    DiaNasc smallint,
    Sexo char(1),
    CodProfissao int,
    CodIndicacao int,
    Termo bit,
    DataTermo datetime,
    CodNaturezaOpPadrao int,
    Conjuge varchar(100),
    Numero varchar(10),
    CodClienteContabil int,
    CodClienteICMSSubst int,
    CodClienteTributacao int,
    ContaContabil varchar(50),
    Qtd11 int,
    Qtd12 int,
    Qtd13 int,
    Qtd14 int,
    Qtd15 int,
    Qtd16 int,
    Qtd17 int,
    Qtd18 int,
    Qtd19 int,
    Qtd20 int,
    CodCSOSN int,
    DataCRT datetime,
    CCDataEmissaoCartao datetime,
    CCDataEntregaCartao datetime,
    CCCartaoEntregue bit,
    CodClienteIndicacao int,
    TempoEntrega int,
    CFOP int,
    ECliente bit,
    EFornecedor bit,
    ETransportador bit,
    CodFornecedor int,
    IM varchar(50),
    ContatoDepto varchar(100),
    MensalistaPeriodo int,
    Objetivo float,
    Destaque bit,
    CodFormaPagtoRemessa int,
    Empenho bit,
    EProdutor bit,
    Credito1 float,
    Credito2 float,
    Credito3 float,
    Debito1 float,
    Debito2 float,
    Debito3 float,
    ContaContabilTipo int,
    Credito4 float,
    Credito5 float,
    Debito4 float,
    Debito5 float,
    ContaContabilForn varchar(50),
    CodBoletoFormato int,
    CodTabelaPrecoBaseFlex int,
    Periodicidade int,
    Integrar bit,
    IsentoBoleto bit,
    EnviarDanfe bit,
    EnviarBoleto bit,
    BoletoLimiteParcela float,
    DescontoFinanceiro float,
    UsuarioBloqueio varchar(50),
    DataBloqueio datetime,
    CodMotivoBloqueio int
);

CREATE TABLE dbo.BKP_Cliente_Celular (
    CodCliente int,
    Celular varchar(20),
    Celular2 varchar(20),
    CobrancaCelular varchar(20),
    CobrancaCelular2 varchar(20),
    ContatoCelular varchar(20),
    ContatoCelular2 varchar(20)
);

CREATE TABLE dbo.BKP_ContaCorrenteSaldo_Almox0 (
    UnidGestora int,
    CodConta char(9),
    Int01 int,
    Int02 int,
    Int03 int,
    Int04 int,
    Int05 int,
    Int06 int,
    Int07 int,
    Int08 int,
    Int09 int,
    Int10 int,
    Int11 int,
    Int12 int,
    Int13 int,
    Int14 int,
    Int15 int,
    Str01 varchar(20),
    Str02 varchar(20),
    Str03 varchar(20),
    Str04 varchar(20),
    Str05 varchar(20),
    Aux01 varchar(20),
    Aux02 varchar(20),
    Aux03 varchar(20),
    Aux04 varchar(20),
    Aux05 varchar(20),
    TipoContaCorrente char(20),
    Data datetime,
    Saldo float,
    FSaldo float,
    NumCC int,
    Auxiliar varchar(250)
);

CREATE TABLE dbo.bkp_ext (
    CodBancoExtrato int,
    CodBanco int,
    Data datetime,
    Ano smallint,
    Mes smallint,
    Valor float,
    Credito float,
    Debito float,
    Saldo float,
    Descricao varchar(200),
    Documento varchar(50),
    TipoMovimentacao char(2),
    Estorno char(1),
    CodBancoExtratoEstorno int,
    Observacao varchar(50),
    DataRegistro datetime,
    CodCaixa int,
    CodMoeda int,
    Usuario varchar(20)
);

CREATE TABLE dbo.BKP_FuncionarioArquivo (
    CodFuncionarioArquivo int,
    CodFuncionario int,
    Descricao varchar(50),
    Arquivo varbinary(max),
    ArquivoTipo varchar(5),
    ArquivoNome varchar(100),
    Data datetime,
    Usuario varchar(50)
);

CREATE TABLE dbo.BKP_GrupoConta (
    CodGrupoConta char(4),
    TipoConta char(1),
    GrupoConta varchar(100),
    Ativo bit,
    Custo int
);

CREATE TABLE dbo.BKP_MaterialCodigoBarra (
    CodMaterial int,
    CodigoBarra varchar(50)
);

CREATE TABLE dbo.BKP_MaterialComissao_20230927 (
    CodMaterial int,
    Tabela1 float,
    Tabela2 float,
    Tabela3 float,
    Tabela4 float,
    Tabela5 float,
    Tabela6 float,
    Tabela7 float,
    Tabela8 float,
    Tabela9 float,
    Tabela10 float,
    Tabela11 float,
    Tabela12 float,
    Tabela13 float,
    Tabela14 float,
    Tabela15 float,
    Tabela16 float,
    Tabela17 float,
    Tabela18 float,
    Tabela19 float,
    Tabela20 float,
    Tabela21 float,
    Tabela22 float,
    Tabela23 float,
    Tabela24 float,
    Tabela25 float,
    Tabela26 float,
    Tabela27 float,
    Tabela28 float,
    Tabela29 float,
    Tabela30 float,
    Tabela31 float,
    Tabela32 float,
    Tabela33 float,
    Tabela34 float,
    Tabela35 float,
    Tabela36 float,
    Tabela37 float,
    Tabela38 float,
    Tabela39 float,
    Tabela40 float,
    Tabela41 float,
    Tabela42 float,
    Tabela43 float,
    Tabela44 float,
    Tabela45 float,
    Tabela46 float,
    Tabela47 float,
    Tabela48 float,
    Tabela49 float,
    Tabela50 float,
    Tipo1 int,
    Tipo2 int,
    Tipo3 int,
    Tipo4 int,
    Tipo5 int,
    Tipo6 int,
    Tipo7 int,
    Tipo8 int,
    Tipo9 int,
    Tipo10 int,
    Tipo11 int,
    Tipo12 int,
    Tipo13 int,
    Tipo14 int,
    Tipo15 int,
    Tipo16 int,
    Tipo17 int,
    Tipo18 int,
    Tipo19 int,
    Tipo20 int,
    Tipo21 int,
    Tipo22 int,
    Tipo23 int,
    Tipo24 int,
    Tipo25 int,
    Tipo26 int,
    Tipo27 int,
    Tipo28 int,
    Tipo29 int,
    Tipo30 int,
    Tipo31 int,
    Tipo32 int,
    Tipo33 int,
    Tipo34 int,
    Tipo35 int,
    Tipo36 int,
    Tipo37 int,
    Tipo38 int,
    Tipo39 int,
    Tipo40 int,
    Tipo41 int,
    Tipo42 int,
    Tipo43 int,
    Tipo44 int,
    Tipo45 int,
    Tipo46 int,
    Tipo47 int,
    Tipo48 int,
    Tipo49 int,
    Tipo50 int
);

CREATE TABLE dbo.BKP_MaterialComissao250123 (
    CodMaterial int,
    Tabela1 float,
    Tabela2 float,
    Tabela3 float,
    Tabela4 float,
    Tabela5 float,
    Tabela6 float,
    Tabela7 float,
    Tabela8 float,
    Tabela9 float,
    Tabela10 float,
    Tabela11 float,
    Tabela12 float,
    Tabela13 float,
    Tabela14 float,
    Tabela15 float,
    Tabela16 float,
    Tabela17 float,
    Tabela18 float,
    Tabela19 float,
    Tabela20 float,
    Tabela21 float,
    Tabela22 float,
    Tabela23 float,
    Tabela24 float,
    Tabela25 float,
    Tabela26 float,
    Tabela27 float,
    Tabela28 float,
    Tabela29 float,
    Tabela30 float,
    Tabela31 float,
    Tabela32 float,
    Tabela33 float,
    Tabela34 float,
    Tabela35 float,
    Tabela36 float,
    Tabela37 float,
    Tabela38 float,
    Tabela39 float,
    Tabela40 float,
    Tabela41 float,
    Tabela42 float,
    Tabela43 float,
    Tabela44 float,
    Tabela45 float,
    Tabela46 float,
    Tabela47 float,
    Tabela48 float,
    Tabela49 float,
    Tabela50 float,
    Tipo1 int,
    Tipo2 int,
    Tipo3 int,
    Tipo4 int,
    Tipo5 int,
    Tipo6 int,
    Tipo7 int,
    Tipo8 int,
    Tipo9 int,
    Tipo10 int,
    Tipo11 int,
    Tipo12 int,
    Tipo13 int,
    Tipo14 int,
    Tipo15 int,
    Tipo16 int,
    Tipo17 int,
    Tipo18 int,
    Tipo19 int,
    Tipo20 int,
    Tipo21 int,
    Tipo22 int,
    Tipo23 int,
    Tipo24 int,
    Tipo25 int,
    Tipo26 int,
    Tipo27 int,
    Tipo28 int,
    Tipo29 int,
    Tipo30 int,
    Tipo31 int,
    Tipo32 int,
    Tipo33 int,
    Tipo34 int,
    Tipo35 int,
    Tipo36 int,
    Tipo37 int,
    Tipo38 int,
    Tipo39 int,
    Tipo40 int,
    Tipo41 int,
    Tipo42 int,
    Tipo43 int,
    Tipo44 int,
    Tipo45 int,
    Tipo46 int,
    Tipo47 int,
    Tipo48 int,
    Tipo49 int,
    Tipo50 int
);

CREATE TABLE dbo.BKP_MaterialEmbalagemCodigoBarra (
    CodMaterial int,
    CodEmbalagem int,
    CodigoBarra varchar(50)
);

CREATE TABLE dbo.BKP_MaterialHistoricoCusto (
    CodDoc int,
    CodMaterial int,
    CodEmbalagem int,
    Qtd float,
    ValorUnit float,
    ValorUnitBruto float,
    CodFornecedor int,
    Data datetime,
    Status int,
    Ativo bit,
    Sequencia int,
    ValorUnitMedio float,
    ValorUnitBrutoMedio float,
    UsuarioEdicao varchar(50),
    DataEdicao datetime,
    UnidGestora int,
    QtdPerdida float,
    QtdInicial float
);

CREATE TABLE dbo.Bkp_MaterialHistoricoCusto_122024 (
    CodDoc int,
    CodMaterial int,
    CodEmbalagem int,
    Qtd float,
    ValorUnit float,
    ValorUnitBruto float,
    CodFornecedor int,
    Data datetime,
    Status int,
    Ativo bit,
    Sequencia int,
    ValorUnitMedio float,
    ValorUnitBrutoMedio float,
    UsuarioEdicao varchar(50),
    DataEdicao datetime,
    UnidGestora int,
    QtdPerdida float,
    QtdInicial float,
    QtdEmbalagem int
);

CREATE TABLE dbo.BKP_NaturezaOperacaoSituacao (
    CodNaturezaOperacao int,
    Situacao char(1),
    SituacaoPagamento char(1)
);

CREATE TABLE dbo.BKP_NCM2017 (
    CodNCM varchar(15),
    DataInicio date,
    DataFim date
);

CREATE TABLE dbo.bkp_NotaFiscal_15dez16 (
    CodNotaFiscal int,
    NumNotaFiscal int,
    NumNotaFiscalForm int,
    NotaFiscalModelo int,
    NotaFiscalSerie char(3),
    NotaFiscalEmitente char(1),
    NotaFiscalES char(1),
    Situacao char(1),
    CodPedido int,
    DataEmissao datetime,
    UsuarioEmissao varchar(50),
    DataRegistroEmissao datetime,
    DataCancelamento datetime,
    UsuarioCancelamento varchar(50),
    DataEstorno datetime,
    UsuarioEstorno varchar(50),
    NotaFiscalBaseICMS float,
    NotaFiscalICMS float,
    NotaFiscalBaseSubst float,
    NotaFiscalICMSSubst float,
    NotaFiscalTotalProdutos float,
    NotaFiscalFrete float,
    NotaFiscalSeguro float,
    NotaFiscalDespesas float,
    NotaFiscalBaseIPI float,
    NotaFiscalIPI float,
    NotaFiscalTotal float,
    Continua int,
    NotaFiscalVolumes int,
    NotaFiscalPesoBruto float,
    NotaFiscalPesoLiquido float,
    NotaFiscalDesconto float,
    SequenciaAIDF int,
    DataAIDF datetime,
    NotaFiscalBasePIS float,
    NotaFiscalPIS float,
    NotaFiscalBaseCOFINS float,
    NotaFiscalCOFINS float,
    UnidGestora int,
    DataSaida datetime,
    FretePorConta int,
    NFeTipoEmissao char(1),
    NFeChave varchar(50),
    NFeProtocolo varchar(50),
    NFeStatus int,
    NFeProtocoloCanc varchar(50),
    MotivoCanc varchar(50),
    NotaFiscalBaseICMSIsento float,
    NotaFiscalBaseSubstIsento float,
    NotaFiscalBaseIPIIsento float,
    NotaFiscalBasePISIsento float,
    NotaFiscalBaseCOFINSIsento float,
    NotaFiscalBaseImpostos float,
    CodNotaFiscalFormato int,
    NotaFiscalDescontoRef float,
    Enviado bit,
    Especificacao text,
    NotaFiscalDescontoFin float,
    NotaFiscalICMSSN float,
    NotaFiscalICMSOutros float,
    NotaFiscalEspecie varchar(60),
    NotaFiscalMarca varchar(60),
    ExportacaoUFEmbarque char(2),
    ExportacaoLocalEmbarque varchar(60),
    ImportacaoNumDI varchar(10),
    ImportacaoDataDI datetime,
    ImportacaoUFDesembaraco char(2),
    ImportacaoLocalDesembaraco varchar(60),
    ImportacaoDataDesembaraco datetime,
    Empenho varchar(17),
    EmpenhoPedido varchar(60),
    EmpenhoContrato varchar(60),
    NotaFiscalBasePISST float,
    NotaFiscalBasePISSTIsento float,
    NotaFiscalPISST float,
    NotaFiscalBaseCOFINSST float,
    NotaFiscalBaseCOFINSSTIsento float,
    NotaFiscalCOFINSST float,
    NotaFiscalBaseISSQN float,
    NotaFiscalBaseISSQNIsento float,
    NotaFiscalISSQN float,
    NotaFiscalBaseII float,
    NotaFiscalII float,
    NotaFiscalIIDesp float,
    NotaFiscalIIIOF float,
    TaxaCambio float,
    VeiculoPlaca char(8),
    VeiculoUF char(2),
    VeiculoRNTC varchar(50),
    NFeTipoAmbiente int,
    CodCliente int,
    CodVendedor int,
    CodTransportador int,
    CodFormaReceb int,
    CodNaturezaOpFiscal int,
    CodNaturezaOperacao int,
    ImportacaoViaTransporte int,
    ImportacaoNotaFiscalValorAFRMM float,
    NotaFiscalAcrescimoFin float,
    NFeFinalidade int,
    NotaFiscalBaseICMSOutros float,
    NotaFiscalBaseICMSUFDest float,
    NotaFiscalValorICMSUFDest float,
    NotaFiscalValorICMSFCPUFDest float,
    NotaFiscalValorICMSUFRemet float
);

CREATE TABLE dbo.bkp_NotaFiscal_Recalculo (
    CodNotaFiscal int,
    NumNotaFiscal int,
    NumNotaFiscalForm int,
    NotaFiscalModelo int,
    NotaFiscalSerie char(3),
    NotaFiscalEmitente char(1),
    NotaFiscalES char(1),
    Situacao char(1),
    CodPedido int,
    DataEmissao datetime,
    UsuarioEmissao varchar(50),
    DataRegistroEmissao datetime,
    DataCancelamento datetime,
    UsuarioCancelamento varchar(50),
    DataEstorno datetime,
    UsuarioEstorno varchar(50),
    NotaFiscalBaseICMS float,
    NotaFiscalICMS float,
    NotaFiscalBaseSubst float,
    NotaFiscalICMSSubst float,
    NotaFiscalTotalProdutos float,
    NotaFiscalFrete float,
    NotaFiscalSeguro float,
    NotaFiscalDespesas float,
    NotaFiscalBaseIPI float,
    NotaFiscalIPI float,
    NotaFiscalTotal float,
    Continua int,
    NotaFiscalVolumes int,
    NotaFiscalPesoBruto float,
    NotaFiscalPesoLiquido float,
    NotaFiscalDesconto float,
    SequenciaAIDF int,
    DataAIDF datetime,
    NotaFiscalBasePIS float,
    NotaFiscalPIS float,
    NotaFiscalBaseCOFINS float,
    NotaFiscalCOFINS float,
    UnidGestora int,
    DataSaida datetime,
    FretePorConta int,
    NFeTipoEmissao char(1),
    NFeChave varchar(50),
    NFeProtocolo varchar(50),
    NFeStatus int,
    NFeProtocoloCanc varchar(50),
    MotivoCanc varchar(50),
    NotaFiscalBaseICMSIsento float,
    NotaFiscalBaseSubstIsento float,
    NotaFiscalBaseIPIIsento float,
    NotaFiscalBasePISIsento float,
    NotaFiscalBaseCOFINSIsento float,
    NotaFiscalBaseImpostos float,
    CodNotaFiscalFormato int,
    NotaFiscalDescontoRef float,
    Enviado bit,
    Especificacao text,
    NotaFiscalDescontoFin float,
    NotaFiscalICMSSN float,
    NotaFiscalICMSOutros float,
    NotaFiscalEspecie varchar(60),
    NotaFiscalMarca varchar(60),
    ExportacaoUFEmbarque char(2),
    ExportacaoLocalEmbarque varchar(60),
    ImportacaoNumDI varchar(10),
    ImportacaoDataDI datetime,
    ImportacaoUFDesembaraco char(2),
    ImportacaoLocalDesembaraco varchar(60),
    ImportacaoDataDesembaraco datetime,
    Empenho varchar(17),
    EmpenhoPedido varchar(60),
    EmpenhoContrato varchar(60),
    NotaFiscalBasePISST float,
    NotaFiscalBasePISSTIsento float,
    NotaFiscalPISST float,
    NotaFiscalBaseCOFINSST float,
    NotaFiscalBaseCOFINSSTIsento float,
    NotaFiscalCOFINSST float,
    NotaFiscalBaseISSQN float,
    NotaFiscalBaseISSQNIsento float,
    NotaFiscalISSQN float,
    NotaFiscalBaseII float,
    NotaFiscalII float,
    NotaFiscalIIDesp float,
    NotaFiscalIIIOF float,
    TaxaCambio float,
    VeiculoPlaca char(8),
    VeiculoUF char(2),
    VeiculoRNTC varchar(50),
    NFeTipoAmbiente int,
    CodCliente int,
    CodVendedor int,
    CodTransportador int,
    CodFormaReceb int,
    CodNaturezaOpFiscal int,
    CodNaturezaOperacao int,
    ImportacaoViaTransporte int,
    ImportacaoNotaFiscalValorAFRMM float,
    NotaFiscalAcrescimoFin float,
    NFeFinalidade int,
    NotaFiscalBaseICMSOutros float,
    NotaFiscalBaseICMSUFDest float,
    NotaFiscalValorICMSUFDest float,
    NotaFiscalValorICMSFCPUFDest float,
    NotaFiscalValorICMSUFRemet float,
    EmitiuDanfe bit,
    NFeProtocoloData datetime,
    CodCupom int
);

CREATE TABLE dbo.Bkp_NotaFiscal_RecalculoMargarina (
    CodNotaFiscal int,
    NumNotaFiscal int,
    NumNotaFiscalForm int,
    NotaFiscalModelo int,
    NotaFiscalSerie char(3),
    NotaFiscalEmitente char(1),
    NotaFiscalES char(1),
    Situacao char(1),
    CodPedido int,
    DataEmissao datetime,
    UsuarioEmissao varchar(50),
    DataRegistroEmissao datetime,
    DataCancelamento datetime,
    UsuarioCancelamento varchar(50),
    DataEstorno datetime,
    UsuarioEstorno varchar(50),
    NotaFiscalBaseICMS float,
    NotaFiscalICMS float,
    NotaFiscalBaseSubst float,
    NotaFiscalICMSSubst float,
    NotaFiscalTotalProdutos float,
    NotaFiscalFrete float,
    NotaFiscalSeguro float,
    NotaFiscalDespesas float,
    NotaFiscalBaseIPI float,
    NotaFiscalIPI float,
    NotaFiscalTotal float,
    Continua int,
    NotaFiscalVolumes int,
    NotaFiscalPesoBruto float,
    NotaFiscalPesoLiquido float,
    NotaFiscalDesconto float,
    SequenciaAIDF int,
    DataAIDF datetime,
    NotaFiscalBasePIS float,
    NotaFiscalPIS float,
    NotaFiscalBaseCOFINS float,
    NotaFiscalCOFINS float,
    UnidGestora int,
    DataSaida datetime,
    FretePorConta int,
    NFeTipoEmissao char(1),
    NFeChave varchar(50),
    NFeProtocolo varchar(50),
    NFeStatus int,
    NFeProtocoloCanc varchar(50),
    MotivoCanc varchar(50),
    NotaFiscalBaseICMSIsento float,
    NotaFiscalBaseSubstIsento float,
    NotaFiscalBaseIPIIsento float,
    NotaFiscalBasePISIsento float,
    NotaFiscalBaseCOFINSIsento float,
    NotaFiscalBaseImpostos float,
    CodNotaFiscalFormato int,
    NotaFiscalDescontoRef float,
    Enviado bit,
    Especificacao text,
    NotaFiscalDescontoFin float,
    NotaFiscalICMSSN float,
    NotaFiscalICMSOutros float,
    NotaFiscalEspecie varchar(60),
    NotaFiscalMarca varchar(60),
    ExportacaoUFEmbarque char(2),
    ExportacaoLocalEmbarque varchar(60),
    ImportacaoNumDI varchar(10),
    ImportacaoDataDI datetime,
    ImportacaoUFDesembaraco char(2),
    ImportacaoLocalDesembaraco varchar(60),
    ImportacaoDataDesembaraco datetime,
    Empenho varchar(17),
    EmpenhoPedido varchar(60),
    EmpenhoContrato varchar(60),
    NotaFiscalBasePISST float,
    NotaFiscalBasePISSTIsento float,
    NotaFiscalPISST float,
    NotaFiscalBaseCOFINSST float,
    NotaFiscalBaseCOFINSSTIsento float,
    NotaFiscalCOFINSST float,
    NotaFiscalBaseISSQN float,
    NotaFiscalBaseISSQNIsento float,
    NotaFiscalISSQN float,
    NotaFiscalBaseII float,
    NotaFiscalII float,
    NotaFiscalIIDesp float,
    NotaFiscalIIIOF float,
    TaxaCambio float,
    VeiculoPlaca char(8),
    VeiculoUF char(2),
    VeiculoRNTC varchar(50),
    NFeTipoAmbiente int,
    CodCliente int,
    CodVendedor int,
    CodTransportador int,
    CodFormaReceb int,
    CodNaturezaOpFiscal int,
    CodNaturezaOperacao int,
    ImportacaoViaTransporte int,
    ImportacaoNotaFiscalValorAFRMM float,
    NotaFiscalAcrescimoFin float,
    NFeFinalidade int,
    NotaFiscalBaseICMSOutros float,
    NotaFiscalBaseICMSUFDest float,
    NotaFiscalValorICMSUFDest float,
    NotaFiscalValorICMSFCPUFDest float,
    NotaFiscalValorICMSUFRemet float
);

CREATE TABLE dbo.BKP_NotaFiscal20231128 (
    CodNotaFiscal int,
    NumNotaFiscal int,
    NumNotaFiscalForm int,
    NotaFiscalModelo int,
    NotaFiscalSerie char(3),
    NotaFiscalEmitente char(1),
    NotaFiscalES char(1),
    Situacao char(1),
    CodPedido int,
    DataEmissao datetime,
    UsuarioEmissao varchar(50),
    DataRegistroEmissao datetime,
    DataCancelamento datetime,
    UsuarioCancelamento varchar(50),
    DataEstorno datetime,
    UsuarioEstorno varchar(50),
    NotaFiscalBaseICMS float,
    NotaFiscalICMS float,
    NotaFiscalBaseSubst float,
    NotaFiscalICMSSubst float,
    NotaFiscalTotalProdutos float,
    NotaFiscalFrete float,
    NotaFiscalSeguro float,
    NotaFiscalDespesas float,
    NotaFiscalBaseIPI float,
    NotaFiscalIPI float,
    NotaFiscalTotal float,
    Continua int,
    NotaFiscalVolumes int,
    NotaFiscalPesoBruto float,
    NotaFiscalPesoLiquido float,
    NotaFiscalDesconto float,
    SequenciaAIDF int,
    DataAIDF datetime,
    NotaFiscalBasePIS float,
    NotaFiscalPIS float,
    NotaFiscalBaseCOFINS float,
    NotaFiscalCOFINS float,
    UnidGestora int,
    DataSaida datetime,
    FretePorConta int,
    NFeTipoEmissao char(1),
    NFeChave varchar(50),
    NFeProtocolo varchar(50),
    NFeStatus int,
    NFeProtocoloCanc varchar(50),
    MotivoCanc varchar(50),
    NotaFiscalBaseICMSIsento float,
    NotaFiscalBaseSubstIsento float,
    NotaFiscalBaseIPIIsento float,
    NotaFiscalBasePISIsento float,
    NotaFiscalBaseCOFINSIsento float,
    NotaFiscalBaseImpostos float,
    CodNotaFiscalFormato int,
    NotaFiscalDescontoRef float,
    Enviado bit,
    Especificacao text,
    NotaFiscalDescontoFin float,
    NotaFiscalICMSSN float,
    NotaFiscalICMSOutros float,
    NotaFiscalEspecie varchar(60),
    NotaFiscalMarca varchar(60),
    ExportacaoUFEmbarque char(2),
    ExportacaoLocalEmbarque varchar(60),
    ImportacaoNumDI varchar(10),
    ImportacaoDataDI datetime,
    ImportacaoUFDesembaraco char(2),
    ImportacaoLocalDesembaraco varchar(60),
    ImportacaoDataDesembaraco datetime,
    Empenho varchar(17),
    EmpenhoPedido varchar(60),
    EmpenhoContrato varchar(60),
    NotaFiscalBasePISST float,
    NotaFiscalBasePISSTIsento float,
    NotaFiscalPISST float,
    NotaFiscalBaseCOFINSST float,
    NotaFiscalBaseCOFINSSTIsento float,
    NotaFiscalCOFINSST float,
    NotaFiscalBaseISSQN float,
    NotaFiscalBaseISSQNIsento float,
    NotaFiscalISSQN float,
    NotaFiscalBaseII float,
    NotaFiscalII float,
    NotaFiscalIIDesp float,
    NotaFiscalIIIOF float,
    TaxaCambio float,
    VeiculoPlaca char(8),
    VeiculoUF char(2),
    VeiculoRNTC varchar(50),
    NFeTipoAmbiente int,
    CodCliente int,
    CodVendedor int,
    CodTransportador int,
    CodFormaReceb int,
    CodNaturezaOpFiscal int,
    CodNaturezaOperacao int,
    ImportacaoViaTransporte int,
    ImportacaoNotaFiscalValorAFRMM float,
    NotaFiscalAcrescimoFin float,
    NFeFinalidade int,
    NotaFiscalBaseICMSOutros float,
    NotaFiscalBaseICMSUFDest float,
    NotaFiscalValorICMSUFDest float,
    NotaFiscalValorICMSFCPUFDest float,
    NotaFiscalValorICMSUFRemet float,
    EmitiuDanfe bit,
    NFeProtocoloData datetime,
    CodCupom int
);

CREATE TABLE dbo.bkp_NotaFiscalItens_15dez16 (
    CodNotaFiscal int,
    CodMaterial int,
    CodEmbalagem int,
    CodNaturezaOpFiscal int,
    SequenciaNotaFiscal int,
    Quantidade float,
    CodUnidade int,
    QtdEmbalagem int,
    ValorEmbalagem float,
    ValorEmbalagemRef float,
    Desconto float,
    iValorProduto int,
    iValorDesconto int,
    ICMS float,
    iBaseICMS int,
    iBaseICMSIsento int,
    iValorICMS int,
    TipoIPI int,
    IPI float,
    iBaseIPI int,
    iBaseIPIIsento int,
    iValorIPI int,
    TipoICMSSubst int,
    ICMSSubst float,
    iBaseICMSSubst int,
    iBaseICMSSubstIsento int,
    iValorICMSSubst int,
    cst int,
    TipoPIS int,
    PIS float,
    iBasePIS int,
    iBasePISIsento int,
    iValorPIS int,
    AliquotaPIS float,
    cstPIS int,
    TipoCOFINS int,
    COFINS float,
    iBaseCOFINS int,
    iBaseCOFINSIsento int,
    iValorCOFINS int,
    AliquotaCOFINS float,
    cstCOFINS int,
    cstIPI int,
    AliquotaIPI float,
    AliquotaICMSSubst float,
    DescontoRef float,
    iValorDescontoRef int,
    Especificacao text,
    iBaseImpostos int,
    ICMSReducaoBC float,
    ICMSSTReducaoBC float,
    AliquotaICMS float,
    AliquotaICMSSUBSTperc float,
    AliquotaIPIperc float,
    AliquotaPISperc float,
    AliquotaCOFINSperc float,
    AliquotaICMSSN float,
    iValorICMSSN int,
    ICMSSN float,
    iValorFrete int,
    iValorSeguro int,
    iValorDespesas int,
    iValorICMSOutros int,
    TipoPISST int,
    PISST float,
    AliquotaPISST float,
    AliquotaPISSTperc float,
    iBasePISST int,
    iBasePISSTIsento int,
    iValorPISST int,
    TipoCOFINSST int,
    COFINSST float,
    AliquotaCOFINSST float,
    AliquotaCOFINSSTperc float,
    iBaseCOFINSST int,
    iBaseCOFINSSTIsento int,
    iValorCOFINSST int,
    TipoISSQN int,
    ISSQN float,
    AliquotaISSQN float,
    AliquotaISSQNperc float,
    iBaseISSQN int,
    iBaseISSQNIsento int,
    iValorISSQN int,
    cstISSQN char(1),
    codISSQNItem int,
    TipoII int,
    II float,
    IIBC float,
    IIDesp float,
    IIIOF float,
    iValorII int,
    iValorIIBC int,
    iValorIIDesp int,
    iValorIIIOF int,
    PISUnit float,
    PISUnitTipo int,
    iBasePISQtd int,
    COFINSUnit float,
    COFINSUnitTipo int,
    iBaseCOFINSQtd int,
    CSOSimples int,
    iBaseICMSOutros int,
    AliquotaICMSOutros float,
    iBaseICMSUFDest int,
    AliquotaICMSFCPUFDest float,
    AliquotaICMSUFDest float,
    AliquotaICMSInter float,
    PercentualICMSPart float,
    iValorICMSPartUFDest int,
    iValorICMSPartUFRemet int
);

CREATE TABLE dbo.bkp_NotaFiscalItens_Recalculo (
    CodNotaFiscal int,
    CodMaterial int,
    CodEmbalagem int,
    CodNaturezaOpFiscal int,
    SequenciaNotaFiscal int,
    Quantidade float,
    CodUnidade int,
    QtdEmbalagem int,
    ValorEmbalagem float,
    ValorEmbalagemRef float,
    Desconto float,
    iValorProduto int,
    iValorDesconto int,
    ICMS float,
    iBaseICMS int,
    iBaseICMSIsento int,
    iValorICMS int,
    TipoIPI int,
    IPI float,
    iBaseIPI int,
    iBaseIPIIsento int,
    iValorIPI int,
    TipoICMSSubst int,
    ICMSSubst float,
    iBaseICMSSubst int,
    iBaseICMSSubstIsento int,
    iValorICMSSubst int,
    cst int,
    TipoPIS int,
    PIS float,
    iBasePIS int,
    iBasePISIsento int,
    iValorPIS int,
    AliquotaPIS float,
    cstPIS int,
    TipoCOFINS int,
    COFINS float,
    iBaseCOFINS int,
    iBaseCOFINSIsento int,
    iValorCOFINS int,
    AliquotaCOFINS float,
    cstCOFINS int,
    cstIPI int,
    AliquotaIPI float,
    AliquotaICMSSubst float,
    DescontoRef float,
    iValorDescontoRef int,
    Especificacao text,
    iBaseImpostos int,
    ICMSReducaoBC float,
    ICMSSTReducaoBC float,
    AliquotaICMS float,
    AliquotaICMSSUBSTperc float,
    AliquotaIPIperc float,
    AliquotaPISperc float,
    AliquotaCOFINSperc float,
    AliquotaICMSSN float,
    iValorICMSSN int,
    ICMSSN float,
    iValorFrete int,
    iValorSeguro int,
    iValorDespesas int,
    iValorICMSOutros int,
    TipoPISST int,
    PISST float,
    AliquotaPISST float,
    AliquotaPISSTperc float,
    iBasePISST int,
    iBasePISSTIsento int,
    iValorPISST int,
    TipoCOFINSST int,
    COFINSST float,
    AliquotaCOFINSST float,
    AliquotaCOFINSSTperc float,
    iBaseCOFINSST int,
    iBaseCOFINSSTIsento int,
    iValorCOFINSST int,
    TipoISSQN int,
    ISSQN float,
    AliquotaISSQN float,
    AliquotaISSQNperc float,
    iBaseISSQN int,
    iBaseISSQNIsento int,
    iValorISSQN int,
    cstISSQN char(1),
    codISSQNItem int,
    TipoII int,
    II float,
    IIBC float,
    IIDesp float,
    IIIOF float,
    iValorII int,
    iValorIIBC int,
    iValorIIDesp int,
    iValorIIIOF int,
    PISUnit float,
    PISUnitTipo int,
    iBasePISQtd int,
    COFINSUnit float,
    COFINSUnitTipo int,
    iBaseCOFINSQtd int,
    CSOSimples int,
    iBaseICMSOutros int,
    AliquotaICMSOutros float,
    iBaseICMSUFDest int,
    AliquotaICMSFCPUFDest float,
    AliquotaICMSUFDest float,
    AliquotaICMSInter float,
    PercentualICMSPart float,
    iValorICMSPartUFDest int,
    iValorICMSPartUFRemet int,
    CodCupom int
);

CREATE TABLE dbo.Bkp_NotaFiscalItens_RecalculoMargarina (
    CodNotaFiscal int,
    CodMaterial int,
    CodEmbalagem int,
    CodNaturezaOpFiscal int,
    SequenciaNotaFiscal int,
    Quantidade float,
    CodUnidade int,
    QtdEmbalagem int,
    ValorEmbalagem float,
    ValorEmbalagemRef float,
    Desconto float,
    iValorProduto int,
    iValorDesconto int,
    ICMS float,
    iBaseICMS int,
    iBaseICMSIsento int,
    iValorICMS int,
    TipoIPI int,
    IPI float,
    iBaseIPI int,
    iBaseIPIIsento int,
    iValorIPI int,
    TipoICMSSubst int,
    ICMSSubst float,
    iBaseICMSSubst int,
    iBaseICMSSubstIsento int,
    iValorICMSSubst int,
    cst int,
    TipoPIS int,
    PIS float,
    iBasePIS int,
    iBasePISIsento int,
    iValorPIS int,
    AliquotaPIS float,
    cstPIS int,
    TipoCOFINS int,
    COFINS float,
    iBaseCOFINS int,
    iBaseCOFINSIsento int,
    iValorCOFINS int,
    AliquotaCOFINS float,
    cstCOFINS int,
    cstIPI int,
    AliquotaIPI float,
    AliquotaICMSSubst float,
    DescontoRef float,
    iValorDescontoRef int,
    Especificacao text,
    iBaseImpostos int,
    ICMSReducaoBC float,
    ICMSSTReducaoBC float,
    AliquotaICMS float,
    AliquotaICMSSUBSTperc float,
    AliquotaIPIperc float,
    AliquotaPISperc float,
    AliquotaCOFINSperc float,
    AliquotaICMSSN float,
    iValorICMSSN int,
    ICMSSN float,
    iValorFrete int,
    iValorSeguro int,
    iValorDespesas int,
    iValorICMSOutros int,
    TipoPISST int,
    PISST float,
    AliquotaPISST float,
    AliquotaPISSTperc float,
    iBasePISST int,
    iBasePISSTIsento int,
    iValorPISST int,
    TipoCOFINSST int,
    COFINSST float,
    AliquotaCOFINSST float,
    AliquotaCOFINSSTperc float,
    iBaseCOFINSST int,
    iBaseCOFINSSTIsento int,
    iValorCOFINSST int,
    TipoISSQN int,
    ISSQN float,
    AliquotaISSQN float,
    AliquotaISSQNperc float,
    iBaseISSQN int,
    iBaseISSQNIsento int,
    iValorISSQN int,
    cstISSQN char(1),
    codISSQNItem int,
    TipoII int,
    II float,
    IIBC float,
    IIDesp float,
    IIIOF float,
    iValorII int,
    iValorIIBC int,
    iValorIIDesp int,
    iValorIIIOF int,
    PISUnit float,
    PISUnitTipo int,
    iBasePISQtd int,
    COFINSUnit float,
    COFINSUnitTipo int,
    iBaseCOFINSQtd int,
    CSOSimples int,
    iBaseICMSOutros int,
    AliquotaICMSOutros float,
    iBaseICMSUFDest int,
    AliquotaICMSFCPUFDest float,
    AliquotaICMSUFDest float,
    AliquotaICMSInter float,
    PercentualICMSPart float,
    iValorICMSPartUFDest int,
    iValorICMSPartUFRemet int
);

CREATE TABLE dbo.BKP_NotaFiscalItens20231128 (
    CodNotaFiscal int,
    CodMaterial int,
    CodEmbalagem int,
    CodNaturezaOpFiscal int,
    SequenciaNotaFiscal int,
    Quantidade float,
    CodUnidade int,
    QtdEmbalagem int,
    ValorEmbalagem float,
    ValorEmbalagemRef float,
    Desconto float,
    iValorProduto int,
    iValorDesconto int,
    ICMS float,
    iBaseICMS int,
    iBaseICMSIsento int,
    iValorICMS int,
    TipoIPI int,
    IPI float,
    iBaseIPI int,
    iBaseIPIIsento int,
    iValorIPI int,
    TipoICMSSubst int,
    ICMSSubst float,
    iBaseICMSSubst int,
    iBaseICMSSubstIsento int,
    iValorICMSSubst int,
    cst int,
    TipoPIS int,
    PIS float,
    iBasePIS int,
    iBasePISIsento int,
    iValorPIS int,
    AliquotaPIS float,
    cstPIS int,
    TipoCOFINS int,
    COFINS float,
    iBaseCOFINS int,
    iBaseCOFINSIsento int,
    iValorCOFINS int,
    AliquotaCOFINS float,
    cstCOFINS int,
    cstIPI int,
    AliquotaIPI float,
    AliquotaICMSSubst float,
    DescontoRef float,
    iValorDescontoRef int,
    Especificacao text,
    iBaseImpostos int,
    ICMSReducaoBC float,
    ICMSSTReducaoBC float,
    AliquotaICMS float,
    AliquotaICMSSUBSTperc float,
    AliquotaIPIperc float,
    AliquotaPISperc float,
    AliquotaCOFINSperc float,
    AliquotaICMSSN float,
    iValorICMSSN int,
    ICMSSN float,
    iValorFrete int,
    iValorSeguro int,
    iValorDespesas int,
    iValorICMSOutros int,
    TipoPISST int,
    PISST float,
    AliquotaPISST float,
    AliquotaPISSTperc float,
    iBasePISST int,
    iBasePISSTIsento int,
    iValorPISST int,
    TipoCOFINSST int,
    COFINSST float,
    AliquotaCOFINSST float,
    AliquotaCOFINSSTperc float,
    iBaseCOFINSST int,
    iBaseCOFINSSTIsento int,
    iValorCOFINSST int,
    TipoISSQN int,
    ISSQN float,
    AliquotaISSQN float,
    AliquotaISSQNperc float,
    iBaseISSQN int,
    iBaseISSQNIsento int,
    iValorISSQN int,
    cstISSQN char(1),
    codISSQNItem int,
    TipoII int,
    II float,
    IIBC float,
    IIDesp float,
    IIIOF float,
    iValorII int,
    iValorIIBC int,
    iValorIIDesp int,
    iValorIIIOF int,
    PISUnit float,
    PISUnitTipo int,
    iBasePISQtd int,
    COFINSUnit float,
    COFINSUnitTipo int,
    iBaseCOFINSQtd int,
    CSOSimples int,
    iBaseICMSOutros int,
    AliquotaICMSOutros float,
    iBaseICMSUFDest int,
    AliquotaICMSFCPUFDest float,
    AliquotaICMSUFDest float,
    AliquotaICMSInter float,
    PercentualICMSPart float,
    iValorICMSPartUFDest int,
    iValorICMSPartUFRemet int,
    CodCupom int
);

CREATE TABLE dbo.BKP_NotaFiscalParcelas20231128 (
    CodNotaFiscal int,
    Parcela int,
    DataVencimento datetime,
    Valor float,
    CodMoeda int,
    Valor2 float,
    CodCupom int,
    ECFSerial varchar(60)
);

CREATE TABLE dbo.bkp_pdv_estornar (
    CodPDVCupom int,
    CodCupom int,
    ECFSerial varchar(60),
    TotalLiquido numeric(15,3),
    TotalItens numeric(38,3),
    CodDoc int
);

CREATE TABLE dbo.bkp_pdv2023 (
    CodCupom int,
    ECFSerial varchar(60),
    COO varchar(10),
    CCF varchar(10),
    CodCliente int,
    ClienteCPFCNPJ varchar(30),
    ClienteNome varchar(100),
    ClienteEndereco varchar(100),
    TotalBruto numeric(15,3),
    Descontos numeric(15,3),
    Acrescimos numeric(15,3),
    TotalLiquido numeric(15,3),
    Data datetime,
    Usuario varchar(100),
    Status char(1),
    MDF varchar(60),
    MDFAdic varchar(60),
    UnidGestora int,
    CodAlmoxarifado int,
    HashKey varchar(32),
    PV int,
    SituacaoPagamento char(1),
    CodPDVCupom int,
    IBPTImposto numeric(15,3),
    Devolvido int,
    CodVendedor int,
    DAV int,
    CRZ varchar(10),
    CodNFCeFormato int,
    Serie int,
    EmitirNotaEstoque char(1),
    MotivoDevolucao varchar(100),
    CodPocket int,
    CodDoc int,
    CodPedidoVenda int
);

CREATE TABLE dbo.BKP_PDVBandeiraTef (
    CodPDVBandeiraTef int,
    Bandeira varchar(50)
);

CREATE TABLE dbo.bkp_pdvCupom_15Dez16 (
    CodCupom int,
    ECFSerial varchar(60),
    COO varchar(10),
    CCF varchar(10),
    CodCliente int,
    ClienteCPFCNPJ varchar(30),
    ClienteNome varchar(100),
    ClienteEndereco varchar(100),
    TotalBruto numeric(15,3),
    Descontos numeric(15,3),
    Acrescimos numeric(15,3),
    TotalLiquido numeric(15,3),
    Data datetime,
    Usuario varchar(100),
    Status char(1),
    MDF varchar(60),
    MDFAdic varchar(60),
    UnidGestora int,
    CodAlmoxarifado int,
    HashKey varchar(32),
    PV int,
    SituacaoPagamento char(1),
    CodPDVCupom int,
    IBPTImposto numeric(15,3),
    Devolvido int,
    CodVendedor int,
    DAV int,
    CRZ varchar(10)
);

CREATE TABLE dbo.BKP_PDVCupom20231128 (
    CodCupom int,
    ECFSerial varchar(60),
    COO varchar(10),
    CCF varchar(10),
    CodCliente int,
    ClienteCPFCNPJ varchar(30),
    ClienteNome varchar(100),
    ClienteEndereco varchar(100),
    TotalBruto numeric(15,3),
    Descontos numeric(15,3),
    Acrescimos numeric(15,3),
    TotalLiquido numeric(15,3),
    Data datetime,
    Usuario varchar(100),
    Status char(1),
    MDF varchar(60),
    MDFAdic varchar(60),
    UnidGestora int,
    CodAlmoxarifado int,
    HashKey varchar(32),
    PV int,
    SituacaoPagamento char(1),
    CodPDVCupom int,
    IBPTImposto numeric(15,3),
    Devolvido int,
    CodVendedor int,
    DAV int,
    CRZ varchar(10),
    CodNFCeFormato int,
    Serie int,
    EmitirNotaEstoque char(1),
    MotivoDevolucao varchar(100),
    CodPocket int,
    CodDoc int,
    CodPedidoVenda int
);

CREATE TABLE dbo.bkp_pdvCupomItens_15Dez16 (
    CodCupom int,
    ECFSerial varchar(60),
    Item int,
    CodTabelaPreco int,
    CodMaterial int,
    CodEmbalagem int,
    Quantidade numeric(15,3),
    QtdEmbalagem int,
    ValorEmbalagem numeric(15,3),
    Desconto numeric(15,3),
    Acrescimo numeric(15,3),
    ValorTotal numeric(15,3),
    Aliquota varchar(10),
    Data datetime,
    Usuario varchar(100),
    Status char(1),
    HashKey varchar(32),
    CodNaturezaOpFiscal int,
    ICMS float,
    iBaseICMS int,
    iBaseICMSIsento int,
    iValorICMS int,
    TipoPIS int,
    PIS float,
    PISUnit float,
    PISUnitTipo int,
    iBasePIS int,
    iBasePISIsento int,
    iBasePISQtd int,
    iValorPIS int,
    AliquotaPIS float,
    cstPIS int,
    TipoCOFINS int,
    COFINS float,
    COFINSUnit float,
    COFINSUnitTipo int,
    iBaseCOFINS int,
    iBaseCOFINSIsento int,
    iBaseCOFINSQtd int,
    iValorCOFINS int,
    AliquotaCOFINS float,
    cstCOFINS int
);

CREATE TABLE dbo.BKP_PDVCupomItens20231128 (
    CodCupom int,
    ECFSerial varchar(60),
    Item int,
    CodTabelaPreco int,
    CodMaterial int,
    CodEmbalagem int,
    Quantidade numeric(15,3),
    QtdEmbalagem int,
    ValorEmbalagem numeric(15,3),
    Desconto numeric(15,3),
    Acrescimo numeric(15,3),
    ValorTotal numeric(15,3),
    Aliquota varchar(10),
    Data datetime,
    Usuario varchar(100),
    Status char(1),
    HashKey varchar(32),
    CodNaturezaOpFiscal int,
    ICMS float,
    iBaseICMS int,
    iBaseICMSIsento int,
    iValorICMS int,
    TipoPIS int,
    PIS float,
    PISUnit float,
    PISUnitTipo int,
    iBasePIS int,
    iBasePISIsento int,
    iBasePISQtd int,
    iValorPIS int,
    AliquotaPIS float,
    cstPIS int,
    TipoCOFINS int,
    COFINS float,
    COFINSUnit float,
    COFINSUnitTipo int,
    iBaseCOFINS int,
    iBaseCOFINSIsento int,
    iBaseCOFINSQtd int,
    iValorCOFINS int,
    AliquotaCOFINS float,
    cstCOFINS int,
    Desconto2 numeric(15,3)
);

CREATE TABLE dbo.BKP_PdvCupomParcelas20231128 (
    CodCupom int,
    ECFSerial varchar(60),
    Item int,
    CodMoeda int,
    Total numeric(15,3),
    Data datetime,
    Usuario varchar(100),
    HashKey varchar(32),
    DataVencimento datetime,
    Documento varchar(50),
    Titular varchar(100),
    Agencia varchar(20),
    Banco int,
    Conta varchar(20),
    CNPJ varchar(15),
    CPF varchar(11),
    NumCheque varchar(20),
    CodPDVCartaCredito int,
    CodMoedaFinanceiro int,
    TEFNSU varchar(50),
    TEFRede varchar(50),
    TEFDataHoraTransacao datetime,
    TEFFinalizacao varchar(50),
    Status char(1),
    TEFTotalCancelado numeric(15,2)
);

CREATE TABLE dbo.bkp_PDVDevolucao (
    CodPDVDevolucao int,
    CodCupom int,
    CodCliente int,
    ECFSerial varchar(60),
    CodPDVCartaCredito int,
    Valor float,
    DataCadastro datetime,
    UsuarioCadastro varchar(50),
    Ativo bit
);

CREATE TABLE dbo.bkp_PDVDevolucaoItens (
    CodPDVDevolucaoItens int,
    CodPDVDevolucao int,
    Item int,
    Quantidade numeric(15,3),
    Valor numeric(15,3)
);

CREATE TABLE dbo.BKP_PedidoVendaSituacao (
    CodPedidoVenda int,
    Situacao char(1),
    SituacaoAnterior char(1),
    SituacaoPagamento char(1)
);

CREATE TABLE dbo.BKP_PostoAbastecimento (
    CodPosto int,
    Posto varchar(50),
    PostoFantasia varchar(100),
    Contato varchar(50),
    Endereco varchar(100),
    Bairro varchar(50),
    Cidade varchar(50),
    UF char(2),
    CEP char(8),
    Fone varchar(20),
    Fone2 varchar(20),
    Fax varchar(20),
    email varchar(50),
    CPF varchar(20),
    CGC varchar(20),
    IE varchar(20),
    Ativo bit,
    AbastecimentoInterno bit
);

CREATE TABLE dbo.BKP_SintegraEstabelecimento (
    UnidGestora int,
    CGC varchar(14),
    IE varchar(14),
    RazaoSocial varchar(60),
    Nome varchar(35),
    Logradouro varchar(34),
    Numero varchar(5),
    Complemento varchar(22),
    Bairro varchar(25),
    CEP varchar(8),
    Cidade varchar(30),
    CodEstado varchar(2),
    Fax varchar(10),
    Contato varchar(28),
    Telefone varchar(12),
    CodMasterFiscal char(3),
    CodCidade varchar(7),
    NFeCertificadoNome varchar(255),
    NFeDir varchar(255),
    NFeValidade datetime,
    CodClienteTributacao int,
    CodNaturezaPJ int,
    CodTipoAtividade int,
    emailCompra varchar(100),
    IM varchar(14),
    FortesEmpresa varchar(50),
    FortesEstabelecimento varchar(50)
);

CREATE TABLE dbo.BKP_vendasvendedor23 (
    CodSupervisor int,
    CodPedidoVenda int
);

CREATE TABLE dbo.BKPSyncDataBaseItens (
    CodSyncDataBase int,
    CodSyncDataBaseItens int,
    Descricao varchar(60),
    Comando text,
    Tabela varchar(40),
    Ativo bit,
    Excluir bit,
    Incluir bit,
    Atualizar bit,
    Importar bit,
    Exportar bit,
    Sequencia int,
    Condicao text
);

CREATE TABLE dbo.Boleto (
    CodBoleto int,
    CodBoletoFormato int,
    CodBoletoTipo int,
    CodBanco int,
    NumBoleto decimal(18,0),
    aNumBoleto varchar(50),
    StrNumBoleto varchar(50),
    Boleto varchar(50),
    Parcela int,
    QtdParcelas int,
    Situacao char(1),
    CodPedido int,
    UsuarioEmissao varchar(50),
    DataEmissao datetime,
    UsuarioCancelamento varchar(50),
    DataCancelamento datetime,
    UsuarioEntrega varchar(50),
    DataEntrega datetime,
    DataVencimento datetime,
    Valor float,
    CodigoBarra varchar(44),
    LinhaDigitavel varchar(54),
    CodBoletoDadosItens int,
    Status int,
    CodErro varchar(200),
    CodBoletoDados int,
    RetornoTarifaCobranca float,
    RetornoOutrasTaxas float,
    RetornoJuros float,
    RetornoIOF float,
    RetornoAbatimento float,
    RetornoDesconto float,
    RetornoJurosMora float,
    CodContaReceber int,
    Enviado bit,
    DescontoFin float,
    StatusAnterior int,
    NNumBoleto varchar(50),
    MotivoCancelamento varchar(50),
    SituacaoRegistroOnLine char(1),
    DataRegistroOnLine datetime,
    IdentificadorTransacao varchar(100),
    UrlLocalizacao varchar(200),
    QrCode varchar(max),
    Json varchar(max),
    PRIMARY KEY (CodBoleto)
);

CREATE TABLE dbo.BoletoClassificador (
    CodClassificador int,
    Classificador varchar(100),
    Sigla varchar(10),
    Tamanho int,
    CodClassificadorTipo int,
    PRIMARY KEY (CodClassificador)
);

CREATE TABLE dbo.BoletoClassificadorTipo (
    CodClassificadorTipo int,
    ClassificadorTipo varchar(100),
    CodBoletoTipo int,
    PRIMARY KEY (CodClassificadorTipo)
);

CREATE TABLE dbo.BoletoDados (
    CodBoletoDados int,
    CodBoletoTipo int,
    CodTipo int,
    Usuario varchar(50),
    DataRegistro datetime,
    DataDe datetime,
    DataAte datetime,
    Arquivo varchar(250),
    Status bit,
    UsuarioEstorno varchar(50),
    DataEstorno datetime,
    DataLancamento datetime,
    ArquivoCompleto text,
    PRIMARY KEY (CodBoletoDados)
);

CREATE TABLE dbo.BoletoDadosItens (
    CodBoletoDadosItens int,
    CodBoletoDados int,
    CodBoleto int,
    Registro varchar(max),
    Registro2 varchar(max),
    Boleto varchar(50),
    Status int,
    CodErro varchar(200),
    NBoleto varchar(50),
    CodBoletoDadosItensRemessa int,
    TarifaCobranca float,
    DataCredito datetime,
    PRIMARY KEY (CodBoletoDadosItens)
);

CREATE TABLE dbo.BoletoDV (
    CodBoletoDV int,
    BoletoDV varchar(50),
    PRIMARY KEY (CodBoletoDV)
);

CREATE TABLE dbo.BoletoFormato (
    CodBoletoFormato int,
    BoletoFormato varchar(50),
    CodBoletoTipo int,
    CodBanco int,
    NossoNumero varchar(50),
    Altura float,
    DataVencimentoTop float,
    DataVencimentoLeft float,
    DataDocumentoTop float,
    DataDocumentoLeft float,
    NumDocumentoTop float,
    NumDocumentoLeft float,
    NotaFiscalTop float,
    NotaFiscalLeft float,
    EspecieDocTop float,
    EspecieDocLeft float,
    DataProcessamentoTop float,
    DataProcessamentoLeft float,
    EspecieTop float,
    EspecieLeft float,
    QuantidadeTop float,
    QuantidadeLeft float,
    ValorTop float,
    ValorLeft float,
    ValorDocumentoTop float,
    ValorDocumentoLeft float,
    InstrucoesTop float,
    InstrucoesLeft float,
    InstrucoesAltura float,
    SacadoTop float,
    SacadoLeft float,
    SacadoAltura float,
    LocalPagtoTop float,
    LocalPagtoLeft float,
    MapaExpedTop float,
    MapaExpedLeft float,
    Instrucoes1 varchar(100),
    Instrucoes2 varchar(100),
    Instrucoes3 varchar(100),
    Instrucoes4 varchar(100),
    Instrucoes5 varchar(100),
    LocalPagto varchar(100),
    BBAgencia varchar(20),
    BBAgenciaCB char(4),
    BBAgenciaDVCB char(1),
    BBCodCedente varchar(20),
    BBCodCedenteCB char(8),
    BBCodCedenteDVCB char(1),
    BBCedente varchar(100),
    BBCarteira varchar(20),
    BBCarteiraCB char(2),
    BBBancoNome varchar(50),
    BBBancoCodigo varchar(10),
    BBBancoCodigoCB char(4),
    BBConvenioCB varchar(10),
    BBConvenioProdutoCB varchar(4),
    CodUsuario char(10),
    Juros float,
    Multa int,
    NumContrato char(10),
    CodAceite int,
    CodCarteira int,
    CodEspecie int,
    CodInstrucao int,
    CodMoeda int,
    CodServico int,
    BBServicoCB char(3),
    BBTipoCobrancaCB int,
    CodBancoCaixa int,
    BoletoFormatoRAV varchar(50),
    CNAB int,
    DiasProtesto int,
    DiasDevolucao int,
    UnidGestora int,
    ACBr bit,
    CaracTitulo int,
    BenefRazaoSocial varchar(100),
    BenefCNPJ varchar(14),
    BenefLogradouro varchar(100),
    BenefNumero varchar(5),
    BenefBairro varchar(50),
    BenefCidade varchar(50),
    BenefCodEstado varchar(2),
    BenefCEP varchar(8),
    Sigla varchar(4),
    NumRemessaAtual int,
    CodFornecedor int,
    CodContaTarifaBancaria varchar(50),
    LancarValorLiquido bit,
    LancamentoTarifa bit,
    Ativo bit,
    Ambiente int,
    BBDeveloperApplication varchar(100),
    BBClientId varchar(200),
    BBClientSecret varchar(max),
    CodInstituicaoFinanceira int,
    BBCodigoNegativacao int,
    PRIMARY KEY (CodBoletoFormato)
);

CREATE TABLE dbo.BoletoStatus (
    CodBoletoStatus int,
    Status varchar(100),
    PRIMARY KEY (CodBoletoStatus)
);

CREATE TABLE dbo.BoletoTipo (
    CodBoletoTipo int,
    BoletoTipo varchar(50),
    CodBoletoDV int,
    Ativo bit,
    PRIMARY KEY (CodBoletoTipo)
);

CREATE TABLE dbo.Caixa (
    CodCaixa int,
    CodBanco int,
    CodCaixaTipo int,
    Data datetime,
    Valor float,
    Desconto float,
    Acrescimo float,
    ValorTotal float,
    CodFormaReceb smallint,
    Descricao varchar(250),
    Documento varchar(250),
    Debito float,
    Credito float,
    TipoMovimentacao char(1),
    QtdParcelas smallint,
    Estorno bit,
    CodCliente int,
    CodFornecedor int,
    Usuario varchar(50),
    CodCaixaClasse int,
    CodMapaExpedicao int,
    CodCaixaEstorno int,
    EstornoStr char(1),
    UnidGestora int,
    Observacao varchar(250),
    CodDescontoTipo int,
    DataLancamento datetime,
    NumSequencia int,
    CodBoletoDados int,
    CodCaixaApoio int,
    CodCaixaVisibilidade int,
    DescricaoNF varchar(250),
    PRIMARY KEY (CodCaixa)
);

CREATE TABLE dbo.CaixaItens (
    CodCaixa int,
    Sequencia int,
    CodContaPagar int,
    CodContaReceber int,
    CodPedidoVenda int,
    CodBancoExtrato int,
    CodOperacao int,
    Valor float,
    Desconto float,
    Acrescimo float,
    ValorLiquido float,
    CodInsert int,
    CodDescontoTipo int,
    CodPDVCupom int,
    CodDoc int,
    PRIMARY KEY (CodCaixa, Sequencia)
);

CREATE TABLE dbo.CaixaParcelas (
    CodCaixa int,
    Parcela smallint,
    DataVencimento datetime,
    Valor float,
    CodBanco int,
    CodBancoExtrato int,
    CodContaPagar int,
    CodContaReceber int,
    Documento varchar(100),
    ContaReceber bit,
    CodMoeda int,
    CodOperacao int,
    CodCaixaVisibilidade int,
    CodClienteExtrato int,
    CodPedidoVenda int,
    CodVoucher int,
    PRIMARY KEY (CodCaixa, Parcela)
);

CREATE TABLE dbo.CaixaTipo (
    CodCaixaTipo int,
    CaixaTipo varchar(50),
    ContaContabil varchar(50),
    ContaContabil1 varchar(50),
    ContaContabil2 varchar(50),
    ContaContabil3 varchar(50),
    ContaContabil4 varchar(50),
    ContaContabil5 varchar(50),
    ContaContabil6 varchar(50),
    ContaContabil7 varchar(50),
    ContaContabil8 varchar(50),
    ContaContabil9 varchar(50),
    ContaContabil10 varchar(50),
    Integracao bit,
    PRIMARY KEY (CodCaixaTipo)
);

CREATE TABLE dbo.CaixaTipoParcela (
    CodCaixaTipoParcela int,
    CaixaTipoParcela varchar(50),
    PRIMARY KEY (CodCaixaTipoParcela)
);

CREATE TABLE dbo.CallCenterFaixa (
    Faixa int,
    Minutos int,
    Descricao char(30),
    PRIMARY KEY (Faixa)
);

CREATE TABLE dbo.Cargo (
    CodCargo int,
    Cargo varchar(50),
    PRIMARY KEY (CodCargo)
);

CREATE TABLE dbo.CartaoFormato (
    CodCartaoFormato int,
    Formato varchar(50),
    Ativo bit,
    PRIMARY KEY (CodCartaoFormato)
);

CREATE TABLE dbo.CartaoProcess (
    CodCartaoProcess int,
    CodCartaoFormato int,
    Arquivo varchar(255),
    Hash varchar(50),
    Ativo bit,
    Usuario varchar(50),
    Data datetime,
    UsuarioEstorno varchar(50),
    DataEstorno datetime,
    ArquivoCompleto text,
    PRIMARY KEY (CodCartaoProcess)
);

CREATE TABLE dbo.CartaoProcessItens (
    CodCartaoProcessItens int,
    CodCartaoProcess int,
    DataVenda date,
    DataPagamento date,
    Valor float,
    ValorLiquido float,
    NSU varchar(50),
    Autorizacao varchar(50),
    Hash varchar(50),
    Situacao varchar(1),
    Bandeira varchar(50),
    Descricao varchar(50),
    NumeroCartao varchar(50),
    NumMaquina varchar(50),
    Estabelecimento varchar(50),
    CodContaReceber int,
    CodCaixa int,
    CodCartaoStatus int,
    PRIMARY KEY (CodCartaoProcessItens)
);

CREATE TABLE dbo.CartaoStatus (
    CodCartaoStatus int,
    Status varchar(100),
    PRIMARY KEY (CodCartaoStatus)
);

CREATE TABLE dbo.CelulaProducao (
    CodCelulaProducao int,
    CelulaProducao varchar(100),
    Ativo bit,
    CodCentroCusto int,
    PRIMARY KEY (CodCelulaProducao)
);

CREATE TABLE dbo.CelulaProducaoLinha (
    CodCelulaProducao int,
    CodLinhaProducao int,
    PRIMARY KEY (CodCelulaProducao, CodLinhaProducao)
);

CREATE TABLE dbo.CentroCusto (
    CodCentroCusto int,
    CentroCusto varchar(100),
    DataInclusao datetime,
    SPED int,
    Usuario char(20),
    CC bit,
    CR bit,
    CCRContabil varchar(50),
    SPEDManutencaoMaquina int,
    Ativo bit,
    PRIMARY KEY (CodCentroCusto)
);

CREATE TABLE dbo.CentroCustoContabil (
    CodCentroCustoContabil int,
    CentroCustoContabil varchar(50),
    PRIMARY KEY (CodCentroCustoContabil)
);

CREATE TABLE dbo.CEST (
    CodCEST varchar(7),
    CodNCM varchar(15),
    Descricao varchar(512),
    PRIMARY KEY (CodCEST, CodNCM)
);

CREATE TABLE dbo.CheckList (
    CodCheckList int,
    CheckList varchar(100),
    Modulo varchar(20),
    Sequencia int,
    ComandoQtd text,
    Comando text,
    Ativo bit,
    FiltrarUsuario bit,
    VerificarAoFechar bit
);

CREATE TABLE dbo.Cidade (
    CodCidade int,
    Cidade varchar(50),
    CodMMaq int,
    CodEstado char(2),
    CodCidadeIBGE char(10),
    ComissaoAdicional float,
    CodPaisIBGE int,
    DataAlteracao datetime,
    PRIMARY KEY (CodCidade)
);

CREATE TABLE dbo.CidadeIBGE (
    CodCidadeIBGE char(10),
    CidadeIBGE varchar(50),
    CodEstado char(2),
    CodEstadoIBGE char(2),
    CodRegiaoIBGE char(2),
    CodMicroRegiaoIBGE char(3),
    IBSMun float,
    PRIMARY KEY (CodCidadeIBGE)
);

CREATE TABLE dbo.Classificador (
    CodClassificador int,
    Classificador varchar(100),
    Sigla char(1),
    CodClassificadorTipo int,
    NumClassificador int,
    PRIMARY KEY (CodClassificador)
);

CREATE TABLE dbo.ClassificadorTipo (
    CodClassificadorTipo int,
    ClassificadorTipo varchar(100),
    Nome varchar(50),
    PRIMARY KEY (CodClassificadorTipo)
);

CREATE TABLE dbo.Cliente (
    CodCliente int,
    UnidGestora int,
    Cliente varchar(100),
    ClienteFantasia varchar(100),
    Endereco varchar(100),
    CEP char(8),
    Celular varchar(20),
    Celular2 varchar(20),
    Fone varchar(20),
    Fone2 varchar(20),
    Fax varchar(20),
    CodEstadoFiscal char(2),
    CodEstado char(2),
    email varchar(100),
    CodCidade int,
    CodBairro int,
    CodZona int,
    CodRegiao int,
    CodRota int,
    CodSegmento int,
    CGC varchar(20),
    CPF varchar(11),
    IE varchar(20),
    CAE varchar(20),
    RG varchar(20),
    RGORGAO varchar(20),
    RGUF char(2),
    CobrancaEndereco varchar(100),
    CodCobrancaBairro int,
    CodCobrancaCidade int,
    CodCobrancaEstado char(2),
    CobrancaCEP char(8),
    CobrancaFone varchar(20),
    CobrancaFone2 varchar(20),
    CobrancaCelular varchar(20),
    CobrancaCelular2 varchar(20),
    Contato varchar(100),
    ContatoEndereco varchar(100),
    CodContatoBairro int,
    CodContatoCidade int,
    CodContatoEstado char(2),
    ContatoCEP char(8),
    ContatoFone varchar(20),
    ContatoFone2 varchar(20),
    ContatoCelular varchar(20),
    ContatoCelular2 varchar(20),
    CodEstadoCivil int,
    DataNasc datetime,
    MesNasc smallint,
    Pai varchar(100),
    Mae varchar(100),
    Nacionalidade varchar(50),
    Naturalidade varchar(50),
    ReferBancaria varchar(100),
    ReferBancariaInform varchar(100),
    ReferBancariaFone varchar(20),
    ReferBancaria2 varchar(100),
    ReferBancaria2Inform varchar(100),
    ReferBancaria2Fone varchar(20),
    ReferBancaria3 varchar(100),
    ReferBancaria3Inform varchar(100),
    ReferBancaria3Fone varchar(20),
    ReferComercial varchar(100),
    ReferComercialInform varchar(100),
    ReferComercialFone varchar(20),
    ReferComercial2 varchar(100),
    ReferComercial2Inform varchar(100),
    ReferComercial2Fone varchar(20),
    ReferComercial3 varchar(100),
    ReferComercial3Inform varchar(100),
    ReferComercial3Fone varchar(20),
    CodFormaPagto int,
    ReferPessoal varchar(100),
    ReferPessoalInform varchar(100),
    ReferPessoalFone varchar(20),
    AreaAcao varchar(100),
    RendaMensal float,
    RendaOutros float,
    LimiteCredito float,
    PontoReferencia varchar(255),
    Saldo float,
    CodTabelaPreco int,
    TabelaReferencia char(1),
    FreezerProprio bit,
    Ativo bit,
    DataAtivacao datetime,
    DataDesativacao datetime,
    DataUltimaCompra datetime,
    QtdCompra int,
    Bloqueado bit,
    ObsBloqueado varchar(100),
    QtdMaxPedido int,
    QtdMaxConta int,
    FisicaJuridica char(1),
    Observacao varchar(100),
    CodTabelaMeta int,
    Qtd1 int,
    Qtd2 int,
    Qtd3 int,
    Qtd4 int,
    Qtd5 int,
    Qtd6 int,
    Qtd7 int,
    Qtd8 int,
    Qtd9 int,
    Qtd10 int,
    AtivoAuto bit,
    Usuario varchar(50),
    DataAlteracao datetime,
    CodDiaSemana int,
    Titular varchar(100),
    TitularCPF varchar(11),
    TitularCGC varchar(20),
    Banco int,
    Agencia varchar(20),
    Conta varchar(20),
    CodSPC int,
    ObsPedido varchar(50),
    Bonus bit,
    Sequencia int,
    TotalEmAberto float,
    Meta float,
    Meta1 float,
    Meta2 float,
    Meta3 float,
    Meta4 float,
    Meta5 float,
    Meta6 float,
    Meta7 float,
    Meta8 float,
    Meta9 float,
    Meta10 float,
    Meta11 float,
    Meta12 float,
    IsentoICMSSubst bit,
    IsentoIPI bit,
    PrazoProtesto int,
    ComissaoAdicional float,
    Historico text,
    QtdMaxPedidoAtraso int,
    QtdMaxContaAtraso int,
    LimiteCreditoAtraso float,
    CodRede int,
    Mensalista int,
    Latitude float,
    Longitude float,
    Altitude float,
    Operador int,
    CodOperador int,
    CodRotaEntrega int,
    email2 varchar(100),
    EnviaEmail bit,
    DiaNasc smallint,
    Sexo char(1),
    CodProfissao int,
    CodIndicacao int,
    Termo bit,
    DataTermo datetime,
    CodNaturezaOpPadrao int,
    Conjuge varchar(100),
    Numero varchar(10),
    CodClienteContabil int,
    CodClienteICMSSubst int,
    CodClienteTributacao int,
    ContaContabil varchar(50),
    Qtd11 int,
    Qtd12 int,
    Qtd13 int,
    Qtd14 int,
    Qtd15 int,
    Qtd16 int,
    Qtd17 int,
    Qtd18 int,
    Qtd19 int,
    Qtd20 int,
    CodCSOSN int,
    DataCRT datetime,
    CCDataEmissaoCartao datetime,
    CCDataEntregaCartao datetime,
    CCCartaoEntregue bit,
    CodClienteIndicacao int,
    TempoEntrega int,
    CFOP int,
    ECliente bit,
    EFornecedor bit,
    ETransportador bit,
    CodFornecedor int,
    IM varchar(50),
    ContatoDepto varchar(100),
    MensalistaPeriodo int,
    Objetivo float,
    Destaque bit,
    CodFormaPagtoRemessa int,
    Empenho bit,
    EProdutor bit,
    Credito1 float,
    Credito2 float,
    Credito3 float,
    Debito1 float,
    Debito2 float,
    Debito3 float,
    ContaContabilTipo int,
    Credito4 float,
    Credito5 float,
    Debito4 float,
    Debito5 float,
    ContaContabilForn varchar(50),
    CodBoletoFormato int,
    CodTabelaPrecoBaseFlex int,
    Periodicidade int,
    Integrar bit,
    IsentoBoleto bit,
    EnviarDanfe bit,
    EnviarBoleto bit,
    BoletoLimiteParcela float,
    DescontoFinanceiro float,
    UsuarioBloqueio varchar(50),
    DataBloqueio datetime,
    CodMotivoBloqueio int,
    CodOperacao int,
    CCAtivo bit,
    CodMicroRegiao int,
    Complemento varchar(100),
    ConsumidorFinal bit,
    CobrancaNumero varchar(10),
    SequenciaEntrega int,
    SaldoFidelidade int,
    NomeSocio varchar(100),
    CPFSocio varchar(11),
    RGSocio varchar(20),
    EnderecoSocio varchar(100),
    CodCidadeSocio int,
    CodBairroSocio int,
    ObservacaoSocio varchar(255),
    CelularSocio varchar(20),
    FoneSocio varchar(20),
    EmailSocio varchar(255),
    ComplementoSocio varchar(100),
    PontoReferenciaSocio varchar(100),
    NumeroSocio varchar(10),
    CodEstadoSocio varchar(2),
    GeraFlex bit,
    SUFRAMA varchar(9),
    IsentoICMS bit,
    CodClienteAvalista int,
    CodTanque int,
    DescontoCota1 float,
    DescontoCota2 float,
    DescontoCota3 float,
    DescontoCota4 float,
    DescontoCota5 float,
    Pronafiano bit,
    CodCooperativa int,
    CodPromotor int,
    CodTabelaPrecoQtd int,
    DescontoComercial float,
    CodClientePeriodicidade int,
    AbastecimentoInterno bit,
    EPosto bit,
    Regime int,
    EnviarPix bit,
    DescontoGerencial float,
    PocketUltPesqSatisfacao datetime,
    Fiador varchar(100),
    FiadorCPF varchar(11),
    EInstituicaoFinanceira bit,
    ContaContabilFortes varchar(50),
    ContaContabilFornFortes varchar(50),
    ContaContabilDominio varchar(50),
    ContaContabilFornDominio varchar(50),
    CodFormaPagtoFornecedor int,
    RetencaoPIS bit,
    RetencaoCOFINS bit,
    RetencaoCSLL bit,
    RetencaoIRRF bit,
    RetencaoPrev bit,
    ProdutorPrecoQualidade bit,
    IsentoICMSFCP bit,
    Protestado bit,
    CCCDataConsulta datetime,
    CCCSemRestricao bit,
    PRIMARY KEY (CodCliente)
);

CREATE TABLE dbo.ClienteAgenda (
    CodClienteAgenda int,
    CodTipo int,
    Data datetime,
    CodCliente int,
    CodPatrimonio int,
    AnaliseCliente varchar(100),
    AnaliseClienteFantasia varchar(100),
    AnaliseEndereco varchar(100),
    AnaliseCEP char(8),
    AnaliseCelular varchar(20),
    AnaliseFone varchar(20),
    AnaliseFone2 varchar(20),
    AnaliseFax varchar(20),
    AnaliseCodEstado char(2),
    AnaliseCodCidade int,
    AnaliseCodBairro int,
    Observacao varchar(50),
    Status int,
    AnaliseCodVendedor int
);

CREATE TABLE dbo.ClienteAnamnese (
    CodClienteAnamneseConfig int,
    CodCliente int,
    Resposta varchar(250),
    Observacao varchar(100),
    PRIMARY KEY (CodClienteAnamneseConfig, CodCliente)
);

CREATE TABLE dbo.ClienteAnamneseConfig (
    CodClienteAnamneseConfig int,
    Pergunta varchar(250),
    Respostas text,
    Observacao varchar(100),
    PRIMARY KEY (CodClienteAnamneseConfig)
);

CREATE TABLE dbo.ClienteAnotacao (
    CodClienteAnotacao int,
    CodCliente int,
    CodAnotacao int,
    Anotacao varchar(max),
    UsuarioAnotacao varchar(50),
    DataAnotacao datetime,
    Enviado bit,
    DataLembrete datetime,
    PRIMARY KEY (CodClienteAnotacao)
);

CREATE TABLE dbo.ClienteComentario (
    CodClienteComentario int,
    CodCliente int,
    CodVendedor int,
    TipoComentario int,
    CodPedidoVenda int,
    UsuarioComentario varchar(50),
    DataComentario datetime,
    Motivo text,
    UsuarioCancelamento varchar(50),
    DataCancelamento datetime,
    MotivoCancelamento text,
    Ativo bit,
    PRIMARY KEY (CodClienteComentario)
);

CREATE TABLE dbo.ClienteCota (
    CodCliente int,
    CodMaterial int,
    Data datetime,
    CodEmbalagem int,
    Cota1 int,
    Cota2 int,
    Cota3 int,
    Cota4 int,
    Cota5 int,
    PRIMARY KEY (CodCliente, CodMaterial, Data)
);

CREATE TABLE dbo.ClienteDesconto (
    CodCliente int,
    CodGrupo int,
    CodMaterial int,
    Tipo char(1),
    Desconto float,
    DataInicio datetime,
    DataFim datetime
);

CREATE TABLE dbo.ClienteDiaSemana (
    CodCliente int,
    CodRota int,
    CodDiaSemana int,
    Sequencia int,
    PRIMARY KEY (CodCliente, CodRota, CodDiaSemana)
);

CREATE TABLE dbo.ClienteDiaSemanaReprogramacao (
    CodClienteDiaSemanaReprogramacao int,
    ClienteDiaSemanaReprogramacao nvarchar(50),
    Data datetime,
    CodDiaSemana int,
    CodDiaSemanaAdicional int,
    Sequencia int,
    PRIMARY KEY (CodClienteDiaSemanaReprogramacao)
);

CREATE TABLE dbo.ClienteDiaSemanaRepRota (
    CodClienteDiaSemanaReprogramacao int,
    CodRota int
);

CREATE TABLE dbo.ClienteDocumento (
    CodClienteDocumento int,
    CodCliente int,
    CodDocumentoTipo int,
    Data datetime,
    Documento image,
    Dados text,
    PRIMARY KEY (CodClienteDocumento)
);

CREATE TABLE dbo.ClienteExtrato (
    CodClienteExtrato int,
    CodCliente int,
    CodClienteOperacao int,
    Int01 int,
    Int02 int,
    TipoMovimentacao char(1),
    Debito float,
    Credito float,
    Saldo float,
    VarSaldo float,
    Data datetime,
    Usuario varchar(50),
    Descricao varchar(200),
    CodClassificador int,
    CodNotaPagamento int,
    Status int,
    PRIMARY KEY (CodClienteExtrato)
);

CREATE TABLE dbo.ClienteGPS (
    CodClienteGPS int,
    CodCliente int,
    Ativo bit,
    Data datetime,
    Altitude float,
    Latitude float,
    Longitude float,
    Status int,
    PRIMARY KEY (CodClienteGPS)
);

CREATE TABLE dbo.ClienteHistoricoCredito (
    CodProcessamento int,
    CodCliente int,
    DataProcessamento datetime,
    UsuarioProcessamento varchar(50),
    DataCancelamento datetime,
    UsuarioCancelamento varchar(50),
    Bloqueado bit,
    ObsBloqueado varchar(100),
    LimiteCreditoAnterior float,
    LimiteCreditoAtual float,
    LimiteCreditoAtrasoAnterior float,
    LimiteCreditoAtrasoAtual float,
    Tipo int,
    QtdMaxPedidoAnterior int,
    QtdMaxPedidoAtual int,
    QtdMaxPedidoAtrasoAnterior int,
    QtdMaxPedidoAtrasoAtual int,
    QtdMaxContaAnterior int,
    QtdMaxContaAtual int,
    QtdMaxContaAtrasoAnterior int,
    QtdMaxContaAtrasoAtual int,
    PRIMARY KEY (CodProcessamento, CodCliente)
);

CREATE TABLE dbo.ClienteICMSSubst (
    CodClienteICMSSubst int,
    ClienteICMSSubst varchar(50),
    PRIMARY KEY (CodClienteICMSSubst)
);

CREATE TABLE dbo.ClienteImagem (
    CodCliente int,
    Imagem image
);

CREATE TABLE dbo.ClienteMarketing (
    CodClienteMarketing int,
    CodCliente int,
    Venda bit,
    Observacao varchar(100),
    CodPedidoVenda int,
    Data datetime,
    Usuario varchar(50),
    PRIMARY KEY (CodClienteMarketing)
);

CREATE TABLE dbo.ClienteMaterialEmbalagem (
    CodCliente int,
    cProd varchar(100),
    uCom varchar(50),
    cEAN varchar(15),
    xProd varchar(150),
    CodMaterial int,
    CodEmbalagem int,
    PRIMARY KEY (CodCliente, cProd, uCom)
);

CREATE TABLE dbo.ClienteMigracao (
    CodClienteMigracao int,
    CodCliente int,
    CodClienteMigracaoTipo int,
    Data datetime,
    Old varchar(50),
    New varchar(50),
    PRIMARY KEY (CodClienteMigracao, CodCliente)
);

CREATE TABLE dbo.ClienteMigracaoTipo (
    CodClienteMigracaoTipo int,
    ClienteMigracaoTipo varchar(50),
    ClienteTipoDado varchar(50),
    ClienteCampo varchar(50),
    RelacaoTabela varchar(50),
    RelacaoChave varchar(50),
    RelacaoCampo varchar(50),
    RelacaoWhere varchar(100),
    PRIMARY KEY (CodClienteMigracaoTipo)
);

CREATE TABLE dbo.ClientePeriodicidade (
    CodClientePeriodicidade int,
    ClientePeriodicidade varchar(35),
    PRIMARY KEY (CodClientePeriodicidade)
);

CREATE TABLE dbo.ClienteSistema (
    CodCliente int,
    Cliente varchar(100),
    Imagem image,
    Endereco varchar(100),
    Bairro varchar(50),
    CEP varchar(10),
    Cidade varchar(50),
    EMail varchar(50),
    Telefone varchar(50),
    Fax varchar(50),
    CGC varchar(50),
    ImagemOn bit,
    ImagemH int,
    ImagemW int,
    ImagemL int,
    ImagemT int,
    ImagemAlign int,
    Titulo1 varchar(50),
    Titulo1On bit,
    Titulo1L int,
    Titulo1T int,
    Titulo1Fonte varchar(50),
    Titulo1Size int,
    Titulo1Align int,
    Titulo2 varchar(50),
    Titulo2On bit,
    Titulo2L int,
    Titulo2T int,
    Titulo2Fonte varchar(50),
    Titulo2Size int,
    Titulo2Align int,
    DadosL int,
    CodModulo01 bit,
    CodModulo02 bit,
    CodModulo03 bit,
    CodModulo04 bit,
    CodModulo05 bit,
    CodModulo06 bit,
    CodModulo07 bit,
    CodModulo08 bit,
    CodModulo09 bit,
    CodModulo10 bit,
    CodModulo11 bit,
    CodModulo12 bit,
    CodModulo13 bit,
    CodModulo14 bit,
    CodModulo15 bit,
    CodModulo16 bit,
    CodModulo17 bit,
    CodModulo18 bit,
    CodModulo19 bit,
    CodModulo20 bit,
    Data01 varchar(50),
    Data02 varchar(50),
    Data03 varchar(50),
    Data04 varchar(50),
    Data05 varchar(50),
    site varchar(100),
    RazaoSocial varchar(100),
    CodModulo21 bit,
    CodModulo22 bit,
    CodModulo23 bit,
    CodModulo24 bit,
    CodModulo25 bit,
    CodModulo26 bit,
    CodModulo27 bit,
    CodModulo28 bit,
    CodModulo29 bit,
    CodModulo30 bit,
    UUIDEmpresa varchar(50),
    PRIMARY KEY (CodCliente)
);

CREATE TABLE dbo.ClienteTitular (
    CodClienteTitular int,
    CodCliente int,
    Titular varchar(100),
    CPF varchar(11),
    CNPJ varchar(15),
    Banco int,
    Agencia varchar(20),
    Conta varchar(20),
    PRIMARY KEY (CodClienteTitular)
);

CREATE TABLE dbo.ClienteTributacao (
    CodClienteTributacao int,
    ClienteTributacao varchar(50),
    PRIMARY KEY (CodClienteTributacao)
);

CREATE TABLE dbo.COFINSAliquota (
    COFINSAliquota float,
    Tipo int,
    Usuario varchar(50),
    Data datetime,
    PRIMARY KEY (COFINSAliquota, Tipo)
);

CREATE TABLE dbo.ComandoSQL (
    CodComandoSQL int,
    ComandoSQL text,
    Descricao varchar(50),
    PRIMARY KEY (CodComandoSQL)
);

CREATE TABLE dbo.Complemento (
    CodComplemento int,
    Complemento varchar(100),
    TipoContaCorrente char(20),
    Texto varchar(50),
    Tabela varchar(50),
    PRIMARY KEY (CodComplemento)
);

CREATE TABLE dbo.CompraDocFisReferenciado (
    CodCompraDocFisReferenciado int,
    CodDoc int,
    Tipo int,
    NFeChave varchar(50),
    PRIMARY KEY (CodCompraDocFisReferenciado)
);

CREATE TABLE dbo.ConferenciaCallCenter (
    CodConferenciaCallCenter int,
    DataCaixa datetime,
    CodBanco int,
    DataCadastro datetime,
    UsuarioCadastro varchar(50),
    PRIMARY KEY (CodConferenciaCallCenter)
);

CREATE TABLE dbo.ConferenciaCallCenterItens (
    CodConferenciaCallCenterItens int,
    CodConferenciaCallCenter int,
    CodMoeda int,
    Total float,
    PRIMARY KEY (CodConferenciaCallCenterItens)
);

CREATE TABLE dbo.ConfigDBGrid (
    UserUsuario varchar(100),
    Form varchar(100),
    DBGrid varchar(100),
    Config text,
    PRIMARY KEY (UserUsuario, Form, DBGrid)
);

CREATE TABLE dbo.ConhecimentoTransporte (
    CodCTe int,
    NumeroNF int,
    CodModelo char(2),
    Serie varchar(10),
    SubSerie varchar(10),
    NumeroCT int,
    ChaveCTe varchar(44),
    DataEmissao datetime,
    DataAquisicao datetime,
    TipoCTe int,
    ValorDocumento float,
    ValorDesconto float,
    IndicadorTipoFrete int,
    ValorFrete float,
    ValorICMS float,
    ValorICMSIsento float,
    DataRegistro datetime,
    CodParticipante int,
    BaseICMS float,
    BaseICMSIsento float,
    Cancelado bit,
    Usuario varchar(50),
    UnidGestora int,
    TipoEmissao int,
    BasePIS float,
    BaseCOFINS float,
    ValorPIS float,
    ValorCOFINS float,
    cstPIS int,
    cstCOFINS int,
    AliquotaPIS int,
    AliquotaCOFINS int,
    CodOperacao int,
    IndNaturezaFrete int,
    CFOP int,
    NumDoc int,
    AnoDoc int,
    PRIMARY KEY (CodCTe)
);

CREATE TABLE dbo.Conta (
    CodGrupoConta varchar(4),
    TipoConta char(1),
    CodConta varchar(20),
    Conta varchar(100),
    Ativo int,
    TipoValor int,
    CustoFixoVar int,
    CustoDirInd int,
    Custo int,
    Meta float,
    Valor1 float,
    Valor2 float,
    Valor3 float,
    Valor4 float,
    Valor5 float,
    Valor6 float,
    Valor7 float,
    Valor8 float,
    Valor9 float,
    Valor10 float,
    Valor11 float,
    Valor12 float,
    Valor13 float,
    Valor14 float,
    Valor15 float,
    Valor16 float,
    Valor17 float,
    Valor18 float,
    Valor19 float,
    Valor20 float,
    Valor21 float,
    Valor22 float,
    Valor23 float,
    Valor24 float,
    Valor25 float,
    Valor26 float,
    Valor27 float,
    Valor28 float,
    Valor29 float,
    Valor30 float,
    Valor31 float,
    Valor32 float,
    Valor33 float,
    Valor34 float,
    Valor35 float,
    Valor36 float,
    Valor37 float,
    Valor38 float,
    Valor39 float,
    Valor40 float,
    Valor41 float,
    Valor42 float,
    Valor43 float,
    Valor44 float,
    Valor45 float,
    Valor46 float,
    Valor47 float,
    Valor48 float,
    Valor49 float,
    Valor50 float,
    Valor51 float,
    Valor52 float,
    Valor53 float,
    Valor54 float,
    Valor55 float,
    Valor56 float,
    Valor57 float,
    Valor58 float,
    Valor59 float,
    Valor60 float,
    Valor61 float,
    Valor62 float,
    Valor63 float,
    Valor64 float,
    Valor65 float,
    Valor66 float,
    Valor67 float,
    Valor68 float,
    Valor69 float,
    Valor70 float,
    Valor71 float,
    Valor72 float,
    Valor73 float,
    Valor74 float,
    Valor75 float,
    Valor76 float,
    Valor77 float,
    Valor78 float,
    Valor79 float,
    Valor80 float,
    Valor81 float,
    Valor82 float,
    Valor83 float,
    Valor84 float,
    Valor85 float,
    Valor86 float,
    Valor87 float,
    Valor88 float,
    Valor89 float,
    Valor90 float,
    Valor91 float,
    Valor92 float,
    Valor93 float,
    Valor94 float,
    Valor95 float,
    Valor96 float,
    Valor97 float,
    Valor98 float,
    Valor99 float,
    ContaContabil varchar(50),
    ContaContabilAuxiliar varchar(50),
    CodNaturezaConta int,
    SPED int,
    DataInclusao datetime,
    Usuario char(20),
    PDV int,
    TipoIntegracao int,
    UnidGestora int,
    Lancamento int,
    ContaContabilDominio varchar(50),
    ContaContabilFortes varchar(50),
    Diaria bit,
    Complemento bit,
    ValorPadrao float,
    PRIMARY KEY (CodConta)
);

CREATE TABLE dbo.ContaCorrenteComp (
    NumContaCorrenteComp int,
    UnidGestora int,
    Int01 int,
    Int02 int,
    Int03 int,
    Int04 int,
    Int05 int,
    Int06 int,
    Int07 int,
    Int08 int,
    Int09 int,
    Int10 int,
    Int11 int,
    Int12 int,
    Int13 int,
    Int14 int,
    Int15 int,
    Str01 varchar(20),
    Str02 varchar(20),
    Str03 varchar(20),
    Str04 varchar(20),
    Str05 varchar(20),
    Aux01 varchar(20),
    Aux02 varchar(20),
    Aux03 varchar(20),
    Aux04 varchar(20),
    Aux05 varchar(20),
    TipoContaCorrente char(20),
    PRIMARY KEY (NumContaCorrenteComp)
);

CREATE TABLE dbo.ContaCorrenteDC (
    UnidGestora int,
    CodConta char(9),
    Int01 int,
    Int02 int,
    Int03 int,
    Int04 int,
    Int05 int,
    Int06 int,
    Int07 int,
    Int08 int,
    Int09 int,
    Int10 int,
    Int11 int,
    Int12 int,
    Int13 int,
    Int14 int,
    Int15 int,
    Str01 varchar(20),
    Str02 varchar(20),
    Str03 varchar(20),
    Str04 varchar(20),
    Str05 varchar(20),
    Aux01 varchar(20),
    Aux02 varchar(20),
    Aux03 varchar(20),
    Aux04 varchar(20),
    Aux05 varchar(20),
    Mes int,
    Ano int,
    TipoContaCorrente char(20),
    Data datetime,
    Debito float,
    Credito float,
    VarSaldo float,
    FDebito float,
    FCredito float,
    FVarSaldo float,
    NumCC int,
    Auxiliar varchar(250),
    PRIMARY KEY (NumCC)
);

CREATE TABLE dbo.ContaCorrenteExtrato (
    UnidGestora int,
    CodConta char(9),
    Int01 int,
    Int02 int,
    Int03 int,
    Int04 int,
    Int05 int,
    Int06 int,
    Int07 int,
    Int08 int,
    Int09 int,
    Int10 int,
    Int11 int,
    Int12 int,
    Int13 int,
    Int14 int,
    Int15 int,
    Str01 varchar(20),
    Str02 varchar(20),
    Str03 varchar(20),
    Str04 varchar(20),
    Str05 varchar(20),
    Aux01 varchar(20),
    Aux02 varchar(20),
    Aux03 varchar(20),
    Aux04 varchar(20),
    Aux05 varchar(20),
    Mes int,
    Ano int,
    TipoContaCorrente char(20),
    Data datetime,
    Valor float,
    Debito float,
    Credito float,
    Saldo float,
    VarSaldo float,
    FValor float,
    FDebito float,
    FCredito float,
    FSaldo float,
    FVarSaldo float,
    CodEvento char(5),
    CodDoc int,
    NumLanc int,
    NumCC int,
    Auxiliar varchar(250),
    PRIMARY KEY (NumCC)
);

CREATE TABLE dbo.ContaCorrenteSaldo (
    UnidGestora int,
    CodConta char(9),
    Int01 int,
    Int02 int,
    Int03 int,
    Int04 int,
    Int05 int,
    Int06 int,
    Int07 int,
    Int08 int,
    Int09 int,
    Int10 int,
    Int11 int,
    Int12 int,
    Int13 int,
    Int14 int,
    Int15 int,
    Str01 varchar(20),
    Str02 varchar(20),
    Str03 varchar(20),
    Str04 varchar(20),
    Str05 varchar(20),
    Aux01 varchar(20),
    Aux02 varchar(20),
    Aux03 varchar(20),
    Aux04 varchar(20),
    Aux05 varchar(20),
    TipoContaCorrente char(20),
    Data datetime,
    Saldo float,
    FSaldo float,
    NumCC int,
    Auxiliar varchar(250),
    PRIMARY KEY (NumCC)
);

CREATE TABLE dbo.ContaCorrenteSaldoData (
    UnidGestora int,
    CodAlmoxarifado int,
    CodMaterial int,
    DataProc datetime,
    EstoqueDataProc float,
    Data datetime,
    MovEstoque float,
    EstoqueData float,
    PRIMARY KEY (UnidGestora, CodAlmoxarifado, CodMaterial, DataProc)
);

CREATE TABLE dbo.ContaPagarCompra (
    CodContaPagar int,
    CodDoc int,
    UnidGestora int,
    CodTipoDoc int,
    CodNotaServico int,
    NFModelo int,
    NFSerie varchar(20),
    CodCTe int,
    PRIMARY KEY (CodContaPagar, CodDoc, CodTipoDoc)
);

CREATE TABLE dbo.ContasDescricao (
    Descricao varchar(100),
    PRIMARY KEY (Descricao)
);

CREATE TABLE dbo.ContaSetor (
    CodConta varchar(20),
    CodSetor int,
    Percentual smallint,
    PRIMARY KEY (CodConta, CodSetor)
);

CREATE TABLE dbo.ContasOperacao (
    CodOperacao int,
    Conta varchar(50),
    Tipo char(1),
    PRIMARY KEY (CodOperacao)
);

CREATE TABLE dbo.ContasPagar (
    CodContaPagar int,
    UnidGestora int,
    DataCadastro datetime,
    DataPagamento datetime,
    DataVencimento datetime,
    Pago int,
    Usuario varchar(50),
    UsuarioCadastro varchar(50),
    Valor float,
    Desconto float,
    Acrescimo float,
    ValorPago float,
    Saldo float,
    CodBanco int,
    CodBancoExtrato int,
    CodBoleto int,
    CodCaixa int,
    CodConta varchar(20),
    CodContaOrig varchar(20),
    CodDuplicata int,
    CodFornecedor int,
    CodMoeda int,
    CodMoedaTipo int,
    Descricao varchar(250),
    Documento varchar(250),
    Observacao varchar(250),
    Origem char(1),
    TipoCobranca char(1),
    Titular varchar(100),
    Agencia varchar(20),
    Banco int,
    BancoCodBanco int,
    Conta varchar(20),
    CNPJ varchar(15),
    CPF varchar(11),
    NumCheque varchar(20),
    BoletoNumDoc varchar(50),
    NumBoleto decimal(18,0),
    StrNumBoleto varchar(50),
    NumCartao varchar(20),
    NumGuia varchar(50),
    Duplicata varchar(50),
    CodRepasse int,
    UsuarioRepasse varchar(50),
    DataRepasse datetime,
    CodBancoRepasse int,
    DataAutorizacao datetime,
    UsuarioAutorizacao varchar(50),
    Autorizado int,
    DataBaixa datetime,
    Baixa bit,
    UsuarioBaixa varchar(50),
    CodCentroCusto int,
    Data datetime,
    DataRegPagto datetime,
    CodContaReceber int,
    CodCliente int,
    CodDoc int,
    NumeroNF int,
    CodAdiantamento int,
    DataLancamento datetime,
    DataPrevPag datetime
);

CREATE TABLE dbo.ContasPagarDetalhes (
    CodContasPagarDetalhes int,
    CodContaPagar int,
    CodConta varchar(20),
    CodCentroCusto int,
    Valor float,
    PRIMARY KEY (CodContasPagarDetalhes)
);

CREATE TABLE dbo.ContasPagarExtrato (
    CodContaPagar int,
    Data datetime,
    Mes int,
    Ano int,
    Valor float,
    Debito float,
    Credito float,
    Saldo float,
    VarSaldo float,
    Desconto float,
    Acrescimo float,
    CodCaixa int,
    NumCC int,
    CodOperacao int,
    DataPagamento datetime,
    PRIMARY KEY (NumCC)
);

CREATE TABLE dbo.ContasReceber (
    CodContaReceber int,
    UnidGestora int,
    DataBaixa datetime,
    DataCadastro datetime,
    DataDevolucao datetime,
    DataRecebimento datetime,
    DataVencimento datetime,
    DataCustodia datetime,
    DataCobranca datetime,
    Baixa bit,
    Devolvido bit,
    Recebido int,
    Antecipado int,
    Usuario varchar(50),
    UsuarioBaixa varchar(50),
    UsuarioCadastro varchar(50),
    UsuarioDevolucao varchar(50),
    Valor float,
    Desconto float,
    Acrescimo float,
    ValorRecebido float,
    Saldo float,
    CodBanco int,
    CodBancoExtrato int,
    CodBoleto int,
    CodCaixa int,
    CodCliente int,
    CodConta varchar(20),
    CodContaOrig varchar(20),
    CodContaPagar int,
    CodDuplicata int,
    CodFornecedor int,
    CodMoeda int,
    CodMoedaTipo int,
    CodPedido int,
    CodResponsavel int,
    Descricao varchar(250),
    Documento varchar(250),
    Observacao varchar(250),
    Titular varchar(100),
    Agencia varchar(20),
    Banco int,
    Conta varchar(20),
    CNPJ varchar(15),
    CPF varchar(11),
    NumCheque varchar(20),
    BoletoNumDoc varchar(50),
    NumBoleto decimal(18,0),
    StrNumBoleto varchar(50),
    NumCartao varchar(20),
    NumGuia varchar(50),
    Duplicata varchar(50),
    CodRepasse int,
    UsuarioRepasse varchar(50),
    DataRepasse datetime,
    CodBancoRepasse int,
    SerasaTipo int,
    CodSerasaErro int,
    Data datetime,
    DataRegReceb datetime,
    Excluida bit,
    CodAdiantamento int,
    EmitirBoleto bit,
    MotivoBaixa varchar(255),
    DataLancamento datetime,
    TEFNSU varchar(50),
    TEFRede varchar(50),
    TEFDataHoraTransacao datetime,
    TEFFinalizacao varchar(50),
    TEFBandeira varchar(50),
    TEFTarifa float,
    UUIDPix uniqueidentifier,
    IdentificadorTransacao varchar(100),
    EndToEndId varchar(50),
    PRIMARY KEY (CodContaReceber)
);

CREATE TABLE dbo.ContasReceberExtrato (
    CodContaReceber int,
    Data datetime,
    Mes int,
    Ano int,
    Valor float,
    Debito float,
    Credito float,
    Saldo float,
    VarSaldo float,
    Desconto float,
    Acrescimo float,
    CodCaixa int,
    NumCC int,
    CodOperacao int,
    DataRecebimento datetime,
    PRIMARY KEY (NumCC)
);

CREATE TABLE dbo.ContasReceberPedido (
    CodContaReceber int,
    CodPedidoVenda int,
    PRIMARY KEY (CodPedidoVenda, CodContaReceber)
);

CREATE TABLE dbo.Contrato (
    CodContrato int,
    CodCliente int,
    DataEmissao datetime,
    DataEncerramento datetime,
    Situacao char(1),
    UsuarioEmissao varchar(50),
    UsuarioEncerramento varchar(50),
    CodClienteDocumento int,
    NumContrato int,
    CodDocumentoTipo int,
    Sequencia int,
    CodClassificador int,
    MotivoRescisao varchar(100),
    PRIMARY KEY (CodContrato)
);

CREATE TABLE dbo.ContratoPatrimonio (
    CodContrato int,
    CodPatrimonio int,
    Operacao int,
    Situacao int,
    Qtd int,
    PRIMARY KEY (CodContrato, CodPatrimonio)
);

CREATE TABLE dbo.Corretora (
    CodCorretora int,
    Corretora varchar(40),
    Corretor varchar(40),
    Fone varchar(12),
    Celular varchar(12),
    Fax varchar(12),
    Email varchar(12),
    PRIMARY KEY (CodCorretora)
);

CREATE TABLE dbo.CreditoPresumido (
    cCredPres int,
    CreditoPresumido varchar(250),
    Descricao text,
    ind_NF varchar(50),
    ind_Evento varchar(50),
    ind_DeduzCredPres varchar(50),
    ind_gCBSCredPres varchar(50),
    ind_gIBSCredPres varchar(50),
    ind_Aliquota_CBS varchar(50),
    ind_Aliquota_IBS varchar(50),
    pAliqCredPresCBS varchar(50),
    cClass_NF_Referenciada varchar(50),
    PRIMARY KEY (cCredPres)
);

CREATE TABLE dbo.CriterioFornecedor (
    CodCriterioFornecedor int,
    CriterioFornecedor varchar(150),
    Validade bit,
    Arquivo bit,
    PRIMARY KEY (CodCriterioFornecedor)
);

CREATE TABLE dbo.CriterioFornecedorFornecedor (
    CodCriterioFornecedor int,
    CodFornecedor int,
    CodClienteArquivo int,
    Situacao tinyint,
    Observacao varchar(200),
    DataVencimento datetime,
    UsuarioAlteracao varchar(50),
    DataAlteracao datetime
);

CREATE TABLE dbo.CSOSN (
    CodCSOSN char(3),
    CSOSN varchar(100),
    ECFAliquota char(1),
    PRIMARY KEY (CodCSOSN)
);

CREATE TABLE dbo.CST (
    cst int,
    Descricao varchar(100),
    ECFAliquota char(1),
    PRIMARY KEY (cst)
);

CREATE TABLE dbo.CSTBaseCredito (
    CodBaseCredito int,
    Descricao varchar(100),
    PRIMARY KEY (CodBaseCredito)
);

CREATE TABLE dbo.CSTCOFINS (
    cstCOFINS int,
    Descricao varchar(100),
    ES char(1),
    cstCOFINSRelacao int,
    PRIMARY KEY (cstCOFINS)
);

CREATE TABLE dbo.CSTIBSCBS (
    cstIBSCBS int,
    Descricao varchar(100),
    ind_gIBSCBS varchar(50),
    ind_gIBSCBSMono varchar(50),
    ind_gRed varchar(50),
    ind_gDif varchar(50),
    ind_gTransfCred varchar(50),
    indNFe varchar(50),
    indNFCe varchar(50),
    indCTe varchar(50),
    indCteOS varchar(50),
    indBPe varchar(50),
    indBPeTM varchar(50),
    indNF3e varchar(50),
    indNFCom varchar(50),
    indNFSe varchar(50),
    PRIMARY KEY (cstIBSCBS)
);

CREATE TABLE dbo.CSTIBSCBSClassTrib (
    cstIBSCBSClassTrib int,
    cstIBSCBS int,
    Descricao varchar(250),
    pRedIBS float,
    pRedCBS float,
    ind_RedutorBC varchar(50),
    ind_gTribRegular varchar(50),
    ind_CredPres varchar(50),
    ind_Mono varchar(50),
    ind_MonoReten varchar(50),
    ind_MonoRet varchar(50),
    ind_MonoDif varchar(50),
    TipoAliquota varchar(50),
    PRIMARY KEY (cstIBSCBSClassTrib)
);

CREATE TABLE dbo.CSTIPI (
    cstIPI int,
    Descricao varchar(100),
    ES char(1),
    cstIPIRelacao int,
    PRIMARY KEY (cstIPI)
);

CREATE TABLE dbo.CSTISSQN (
    cstISSQN char(1),
    Descricao varchar(100),
    PRIMARY KEY (cstISSQN)
);

CREATE TABLE dbo.CSTNaturezaReceita (
    CodNaturezaReceita int,
    CST int,
    Descricao varchar(200),
    PRIMARY KEY (CodNaturezaReceita, CST)
);

CREATE TABLE dbo.CSTPIS (
    cstPIS int,
    Descricao varchar(100),
    ES char(1),
    cstPISRelacao int,
    PRIMARY KEY (cstPIS)
);

CREATE TABLE dbo.CSTTipoCredito (
    CodTipoCredito int,
    Descricao varchar(100),
    PRIMARY KEY (CodTipoCredito)
);

CREATE TABLE dbo.Curso (
    CodCurso int,
    Curso varchar(50),
    PRIMARY KEY (CodCurso)
);

CREATE TABLE dbo.DadosContabeis (
    CodArquivo int,
    DataRegistro datetime,
    DataDe datetime,
    DataAte datetime,
    NomeArquivo varchar(50),
    Usuario varchar(50),
    UnidGestora int,
    PRIMARY KEY (CodArquivo)
);

CREATE TABLE dbo.DadosContabeisItens (
    CodArquivo int,
    NumArquivo int,
    Registro char(250),
    Registro2 char(250),
    Registro3 char(250),
    Registro4 char(250),
    Registro5 char(250),
    PRIMARY KEY (CodArquivo, NumArquivo)
);

CREATE TABLE dbo.DDADados (
    CodDDADados int,
    Usuario varchar(50),
    DataRegistro datetime,
    Arquivo varchar(250),
    Status int,
    UsuarioEstorno varchar(50),
    DataEstorno datetime,
    ArquivoCompleto text,
    PRIMARY KEY (CodDDADados)
);

CREATE TABLE dbo.DDADadosItens (
    CodDDADados int,
    Sequencia int,
    CodContaPagar int,
    Status char(3),
    Erro varchar(200),
    CodigoBarra varchar(60),
    Valor float,
    DataVencimento datetime,
    Fornecedor varchar(30),
    CNPJ varchar(15),
    Registro varchar(240),
    PRIMARY KEY (CodDDADados, Sequencia)
);

CREATE TABLE dbo.Definicoes (
    Codigo smallint,
    Definicao char(50),
    Valor char(200),
    Descricao varchar(200),
    Uso bit,
    UsuarioEdicao varchar(50),
    Tipo char(1),
    ValoresPossiveis varchar(200),
    Mobile int,
    PRIMARY KEY (Codigo)
);

CREATE TABLE dbo.DefinicoesPocket (
    CodDefinicoesPocket int,
    Codigo int,
    CodPocket int,
    Valor char(200),
    PRIMARY KEY (CodDefinicoesPocket)
);

CREATE TABLE dbo.DefinicoesUnidadeGestora (
    CodDefinicoesUnidadeGestora int,
    Codigo int,
    UnidGestora int,
    Valor char(200),
    PRIMARY KEY (CodDefinicoesUnidadeGestora)
);

CREATE TABLE dbo.Departamento (
    CodDepartamento int,
    Departamento varchar(50),
    UnidGestora int,
    Ativo bit,
    PRIMARY KEY (CodDepartamento)
);

CREATE TABLE dbo.Dependente (
    CodFuncionario int,
    CodDependente int,
    Dependente varchar(50),
    DataNascimento datetime,
    CodParentesco int,
    CPF varchar(20),
    PRIMARY KEY (CodFuncionario, CodDependente)
);

CREATE TABLE dbo.Depreciacao (
    CodDepreciacao int,
    Depreciacao varchar(100),
    VidaUtil int,
    Percentual float,
    PRIMARY KEY (CodDepreciacao)
);

CREATE TABLE dbo.DescricaoColuna (
    Tabela varchar(200),
    Campo varchar(200),
    Descricao varchar(200),
    PRIMARY KEY (Tabela, Campo, Descricao)
);

CREATE TABLE dbo.DescricaoData (
    Tabela varchar(50),
    Campo varchar(50),
    Nome varchar(50),
    Descricao varchar(200),
    Operacoes varchar(200),
    PRIMARY KEY (Tabela, Campo)
);

CREATE TABLE dbo.DescricaoMemo (
    Descricao varchar(100),
    Texto text
);

CREATE TABLE dbo.DescricaoStatus (
    Tabela varchar(200),
    Campo varchar(200),
    Valor varchar(200),
    Descricao varchar(200),
    PRIMARY KEY (Tabela, Campo, Valor)
);

CREATE TABLE dbo.DespesaConferencia (
    CodDespesaConferencia int,
    DespesaConferencia varchar(50),
    HoraIni time(7),
    HoraFinal time(7),
    VeiculoES char(1),
    CodConta varchar(20),
    PRIMARY KEY (CodDespesaConferencia)
);

CREATE TABLE dbo.DiaSemana (
    CodDiaSemana int,
    DiaSemana varchar(50),
    PRIMARY KEY (CodDiaSemana)
);

CREATE TABLE dbo.Documento (
    CodDoc int,
    UnidGestora int,
    UnidFavorecida int,
    CodTipoDoc int,
    AnoDoc int,
    NumDoc int,
    DataDoc datetime,
    Historico varchar(200),
    Responsavel varchar(50),
    DataRegistro datetime,
    Estorno char(1),
    CodDocEstorno int,
    CodDocApoio int,
    Valor float,
    Int01 int,
    Int02 int,
    Int03 int,
    Int04 int,
    Int05 int,
    Int06 int,
    Int07 int,
    Int08 int,
    Int09 int,
    Int10 int,
    Int11 int,
    Int12 int,
    Int13 int,
    Int14 int,
    Int15 int,
    Str01 varchar(20),
    Str02 varchar(20),
    Str03 varchar(20),
    Str04 varchar(20),
    Str05 varchar(20),
    Aux01 int,
    Aux02 int,
    Aux03 int,
    Aux04 int,
    Aux05 int,
    Aux06 int,
    Aux07 int,
    Aux08 int,
    Aux09 int,
    Aux10 int,
    Evento varchar(5),
    ComplementoTxt varchar(255),
    Status int,
    Estacao varchar(20),
    Total01 int,
    Total02 int,
    Total03 int,
    Total04 int,
    Total05 int,
    Total06 int,
    Total07 int,
    Total08 int,
    Total09 int,
    Total10 int,
    Total11 int,
    Total12 int,
    NFStr01 varchar(20),
    NFStr02 varchar(20),
    NFData datetime,
    NFCFOP int,
    Total13 int,
    Total14 int,
    Total15 int,
    Total16 int,
    Total17 int,
    Total18 int,
    Total19 int,
    Total20 int,
    Total21 int,
    Total22 int,
    Total23 int,
    Total24 int,
    Total25 int,
    Total26 int,
    Total27 int,
    Total28 int,
    Total29 int,
    Total30 int,
    NFModelo int,
    NFTipoFrete int,
    NFDataEntrada datetime,
    NFChaveNFe varchar(50),
    Contato varchar(50),
    PrazoEntrega datetime,
    Observacoes varchar(255),
    Int16 int,
    UsuarioAutorizacao varchar(50),
    DataAutorizacao datetime,
    Autorizado bit,
    XML text,
    UsuarioBaixa varchar(20),
    MotivoBaixa varchar(250),
    DataBaixa datetime,
    DataValidade datetime,
    Total31 int,
    Total32 int,
    Total33 int,
    Total34 int,
    UsuarioEncerramento varchar(20),
    MotivoEncerramento varchar(250),
    DataEncerramento datetime,
    Odometro int,
    CodMotorista int,
    CodResponsavel int,
    EnvioEmail bit,
    CodOperacao int,
    CodInfComplementar varchar(6),
    TipoLigacao int,
    GrupoTensao int,
    UsuarioEdicao varchar(50),
    Total35 int,
    Total36 int,
    NotaFiscalES char(1),
    JustificativaEstorno varchar(255),
    CodBanco int,
    PesoBruto float,
    DataSugestaoEmissaoNF datetime,
    Importado bit,
    Importado_Lancamento int,
    ContasPagarOK int,
    CodRemetente int,
    Total37 int,
    Total38 int,
    Total39 int,
    Total40 int,
    NFCodVerificacao varchar(50),
    CodDocOrdemProducao int,
    StatusComplementar tinyint,
    CodPatrimonio int,
    SituacaoConferencia int,
    Int17 int,
    Int18 int,
    CodPedidoVendaRepasse int,
    ComissaoPercentual float,
    ComissaoValor float,
    ComissaoProc bit,
    ComissaoProcData datetime,
    ComissaoProcUsuario varchar(50),
    ComissaoEstProcData datetime,
    ComissaoEstProcUsuario varchar(50),
    ComissaoRepasse bit,
    ComissaoRepasseData datetime,
    ComissaoRepasseUsuario varchar(50),
    CodPedidoVendaRepasseSup int,
    ComissaoPercentualSup float,
    ComissaoValorSup float,
    ComissaoProcSup bit,
    ComissaoEstProcDataSup datetime,
    ComissaoEstProcUsuarioSup varchar(50),
    ComissaoProcDataSup datetime,
    ComissaoProcUsuarioSup varchar(50),
    ComissaoRepasseSup bit,
    ComissaoRepasseDataSup datetime,
    ComissaoRepasseUsuarioSup varchar(50),
    CodVendedorProc int,
    CodSupervisorProc int,
    ObservacaoDevolucao varchar(255),
    CodDevolMotivo int,
    CodSolucao int,
    NotaFiscalIS float,
    NotaFiscalBaseIBSCBS float,
    NotaFiscalIBSUF float,
    NotaFiscalIBSUFDif float,
    NotaFiscalIBSUFDevTrib float,
    NotaFiscalIBSMun float,
    NotaFiscalIBSMunDif float,
    NotaFiscalIBSMunDevTrib float,
    NotaFiscalCBS float,
    NotaFiscalCBSDif float,
    NotaFiscalCBSDevTrib float,
    NotaFiscalIBSMono float,
    NotaFiscalCBSMono float,
    NotaFiscalTotIBSCBS float,
    CodNFe int,
    PRIMARY KEY (CodDoc)
);

CREATE TABLE dbo.DocumentoAssinatura (
    UUIDDocumentoAssinatura uniqueidentifier,
    UUIDAssinatura uniqueidentifier,
    UUIDRecibo uniqueidentifier,
    DataAssinatura datetime,
    CodFuncionarioExtrato int,
    CodFuncionario int,
    PRIMARY KEY (UUIDDocumentoAssinatura)
);

CREATE TABLE dbo.DocumentoConferencia (
    CodDocumentoConferencia int,
    CodNFe int,
    CodDoc int,
    CodPedidoVenda int,
    CodDocumentoConferenciaTipo int,
    UsuarioConferencia varchar(255),
    DataInicioConferencia datetime,
    DataFimConferencia datetime,
    Status int,
    Usuario varchar(255),
    Data datetime,
    Observacao ntext,
    PRIMARY KEY (CodDocumentoConferencia)
);

CREATE TABLE dbo.DocumentoConferenciaTipo (
    CodDocumentoConferenciaTipo int,
    Tipo varchar(255),
    PRIMARY KEY (CodDocumentoConferenciaTipo)
);

CREATE TABLE dbo.DocumentoDetalhes (
    CodDocDetalhe int,
    CodDoc int,
    CodConta char(7),
    CodCentroCusto int,
    Valor float,
    PRIMARY KEY (CodDocDetalhe)
);

CREATE TABLE dbo.DocumentoFornecedorMult (
    CodDoc int,
    CodFornecedor int,
    PRIMARY KEY (CodDoc, CodFornecedor)
);

CREATE TABLE dbo.DocumentoImagem (
    CodDocumentoImagem int,
    CodDoc int,
    Imagem image,
    PRIMARY KEY (CodDocumentoImagem)
);

CREATE TABLE dbo.DocumentoIntegracaoCampos (
    CodDocumentoIntegracaoCampos int,
    DocumentoIntegracaoCampos varchar(50),
    PRIMARY KEY (CodDocumentoIntegracaoCampos)
);

CREATE TABLE dbo.DocumentoIntegracaoTIpo (
    CodDocumentoIntegracaoTipo int,
    DocumentoIntegracaoTipo varchar(50),
    PRIMARY KEY (CodDocumentoIntegracaoTipo)
);

CREATE TABLE dbo.DocumentoItens (
    CodDoc int,
    Sequencia int,
    CodMaterial int,
    CodEmbalagem int,
    Qtd1 float,
    Qtd2 float,
    Qtd3 float,
    ValorUnit float,
    Int01 int,
    Int03 int,
    Int10 int,
    ValorUnitBruto float,
    Total01 int,
    Total02 int,
    Total03 int,
    Total04 int,
    Total05 int,
    Total06 int,
    Total07 int,
    Total08 int,
    Total09 int,
    Total10 int,
    Total11 int,
    Total12 int,
    Total13 int,
    Total14 int,
    Total15 int,
    Total16 int,
    Int13 int,
    MovEstoque int,
    Total17 int,
    Total18 int,
    Total19 int,
    Total20 int,
    Total21 int,
    Total22 int,
    Total23 int,
    Total24 int,
    Total25 int,
    Total26 int,
    Total27 int,
    Total28 int,
    Total29 int,
    Total30 int,
    CSTPIS int,
    CSTCOFINS int,
    CodNaturezaOPFiscal int,
    Total31 int,
    Total32 int,
    Total33 int,
    Total34 int,
    CSTICMS int,
    CSTIPI int,
    CSOSIMPLES int,
    TipoPIS int,
    TipoCOFINS int,
    Total35 int,
    Total36 int,
    AliquotaISS int,
    Int11 int,
    Int14 int,
    Total37 int,
    Total38 int,
    Total39 int,
    Total40 int,
    cstIBSCBS int,
    cstIBSCBSClassTrib int,
    TipoIS int,
    ISAliquota float,
    ISAliquotaUnit float,
    ISUnidadeTrib varchar(10),
    ISQtdTrib float,
    iValorIS bigint,
    ValorIS float,
    TipoIBSCBS int,
    iBaseIBSCBS bigint,
    BaseIBSCBS float,
    AliquotaCBS float,
    CBS float,
    iValorCBS bigint,
    AliquotaCBSDif float,
    CBSDif float,
    iValorCBSDif bigint,
    AliquotaCBSDevolucao float,
    CBSDevolucao float,
    iValorCBSDevolucao bigint,
    CBSRedAliq float,
    CBSAliquotaEfetiva float,
    CBSMonoAliquotaUnit float,
    AliquotaCBSMonoAdRemIBS float,
    AliquotaCBSMonoAdRemCBS float,
    CBSMonoAdRemIBS float,
    CBSMonoAdRemCBS float,
    AliquotaIBSUF float,
    IBSUF float,
    iValorIBSUF bigint,
    AliquotaIBSUFDif float,
    IBSUFDif float,
    iValorIBSUFDif bigint,
    AliquotaIBSUFDevolucao float,
    IBSUFDevolucao float,
    iValorIBSUFDevolucao bigint,
    IBSUFRedAliq float,
    IBSUFAliquotaEfetiva float,
    AliquotaIBSMun float,
    IBSMun float,
    iValorIBSMun bigint,
    AliquotaIBSMunDif float,
    IBSMunDif float,
    iValorIBSMunDif bigint,
    AliquotaIBSMunDevolucao float,
    IBSMunDevolucao float,
    iValorIBSMunDevolucao bigint,
    IBSMunRedAliq float,
    IBSMunAliquotaEfetiva float,
    TribRegCstIBSCBS int,
    TribRegCstIBSCBSClassTrib int,
    TribRegAliquotaCBS float,
    TribRegAliquotaIBSUF float,
    TribRegAliquotaIBSMun float,
    CBSMonoRetAdRemIBS float,
    CBSMonoRetAdRemCBS float,
    cCredPres int,
    pIBSCredPres float,
    vIBSCredPres float,
    pIBSCredPresCondSus float,
    vIBSCredPresCondSus float,
    pCBSCredPres float,
    vCBSCredPres float,
    pCBSCredPresCondSus float,
    vCBSCredPresCondSus float,
    competApur varchar(10),
    tpCredPresIBSZFM int,
    pCredPresIBSZFM float,
    vCredPresIBSZFM float,
    PRIMARY KEY (CodDoc, Sequencia)
);

CREATE TABLE dbo.DocumentoItensConferencia (
    CodDocumentoItensConferencia int,
    CodDocumentoConferencia int,
    cProd varchar(50),
    uCom varchar(50),
    CodMaterial int,
    CodEmbalagem int,
    Quantidade float,
    QuantidadeConferencia float,
    UsuarioConferencia varchar(255),
    DataConferencia datetime,
    FaltaMercadoria int,
    SobraMercadoria int,
    TrocaMercadoria int,
    Ativo int,
    PRIMARY KEY (CodDocumentoItensConferencia)
);

CREATE TABLE dbo.DocumentoModelo (
    CodDocumentoModelo int,
    CodDocumentoTipo int,
    Modelo varchar(50),
    DocumentoModelo image,
    DocumentoDados text,
    PRIMARY KEY (CodDocumentoModelo)
);

CREATE TABLE dbo.DocumentoProcesso (
    CodDoc int,
    CodMaterial int,
    CodUnidade int,
    Ordem int,
    DataInicial datetime,
    DataFinal datetime,
    CodProcessoDesc int,
    PRIMARY KEY (CodDoc, CodMaterial, CodUnidade, Ordem)
);

CREATE TABLE dbo.DocumentoProcessoFunc (
    CodDoc int,
    CodMaterial int,
    CodUnidade int,
    Ordem int,
    CodFuncionario int,
    PRIMARY KEY (CodDoc, CodMaterial, CodUnidade, Ordem, CodFuncionario)
);

CREATE TABLE dbo.DocumentoTipo (
    CodDocumentoTipo int,
    DocumentoTipo varchar(50),
    PRIMARY KEY (CodDocumentoTipo)
);

CREATE TABLE dbo.DocumentoTotal (
    CodDocumentoTotal int,
    DocumentoTotal varchar(50),
    PRIMARY KEY (CodDocumentoTotal)
);

CREATE TABLE dbo.Duplicata (
    CodDuplicata int,
    Duplicata varchar(50),
    Situacao char(1),
    CodPedido int,
    DataEmissao datetime,
    UsuarioEmissao varchar(50),
    DataCancelamento datetime,
    UsuarioCancelamento varchar(50),
    DataVencimento datetime,
    UsuarioEntrega varchar(50),
    DataEntrega datetime,
    Valor float,
    DataRecebimento datetime,
    DescontoReceb float,
    AcrescimoReceb float,
    ValorRecebido float,
    Parcela int,
    PRIMARY KEY (CodDuplicata)
);

CREATE TABLE dbo.DuplicataFormato (
    CodDuplicataFormato int,
    Sequencia int,
    Descricao varchar(50),
    Valor varchar(100),
    PRIMARY KEY (CodDuplicataFormato, Sequencia)
);

CREATE TABLE dbo.EficienciaSeparacaoPedido (
    CodPedidoVenda int,
    CodFuncionario int,
    InicioConferencia datetime,
    FimConferencia datetime,
    TempoDecorrido int,
    DataConferencia datetime,
    PRIMARY KEY (CodPedidoVenda, CodFuncionario)
);

CREATE TABLE dbo.EmailCheckList (
    CodPerfil int,
    CodCheckList int,
    SeqCheckList int,
    Periodicidade int,
    LastSend datetime,
    Dia varchar(20),
    Hora datetime
);

CREATE TABLE dbo.EmailConta (
    EmailConta varchar(50),
    EmailFromNome varchar(150),
    EmailFromEndereco varchar(150),
    EmailTo varchar(150),
    EmailToCopia varchar(150),
    Usuario varchar(150),
    Senha varchar(50),
    Assunto varchar(150),
    Texto text,
    SMTPHost varchar(150),
    SMTPPort int,
    UsaTLS bit,
    PRIMARY KEY (EmailConta)
);

CREATE TABLE dbo.Embalagem (
    CodEmbalagem int,
    CodUnidade int,
    Embalagem varchar(50),
    SiglaEmbalagem char(5),
    QtdEmbalagem int,
    Usuario varchar(50),
    DataAlteracao datetime,
    Ativo bit,
    PRIMARY KEY (CodEmbalagem)
);

CREATE TABLE dbo.EmbalagemTipo (
    CodEmbalagemTipo int,
    EmbalagemTipo varchar(50),
    PRIMARY KEY (CodEmbalagemTipo)
);

CREATE TABLE dbo.Equipe (
    CodEquipe int,
    Equipe varchar(40),
    PRIMARY KEY (CodEquipe)
);

CREATE TABLE dbo.EquipeFuncionario (
    CodEquipe int,
    CodFuncionario int,
    CodMaterial int,
    PRIMARY KEY (CodEquipe, CodFuncionario, CodMaterial)
);

CREATE TABLE dbo.Estacao (
    CodEstacao int,
    Estacao varchar(200),
    PRIMARY KEY (CodEstacao)
);

CREATE TABLE dbo.EstacaoStone (
    CodEstacaoStone int,
    CodEstacao int,
    UUIDStoneMaquina uniqueidentifier,
    PRIMARY KEY (CodEstacaoStone)
);

CREATE TABLE dbo.Estado (
    CodEstado char(2),
    Estado varchar(50),
    ICMS float,
    Ativo int,
    ICMSCred float,
    ICMSEstadual float,
    ICMSInterEstadual float,
    ICMSFCP float,
    CodEstadoIBGE char(2),
    IBSUF float,
    PRIMARY KEY (CodEstado)
);

CREATE TABLE dbo.EstadoCivil (
    CodEstadoCivil int,
    EstadoCivil varchar(50),
    PRIMARY KEY (CodEstadoCivil)
);

CREATE TABLE dbo.Evento (
    CodEvento char(5),
    CodSubGrupo char(2),
    Evento varchar(100),
    Valor char(1),
    Ativo bit,
    Tipo int,
    Classe int,
    EvDetalhe1 varchar(5),
    EvDetalhe2 varchar(5),
    EvDetalhe3 varchar(5),
    EvDetalhe4 varchar(5),
    EvDetalhe5 varchar(5),
    EvDetalhe6 varchar(5),
    DefinirLote bit,
    UtilizarLote bit,
    PRIMARY KEY (CodEvento)
);

CREATE TABLE dbo.EventoComplemento (
    CodEvento char(5),
    CodComplemento int,
    Aux1 int,
    PRIMARY KEY (CodEvento, CodComplemento)
);

CREATE TABLE dbo.EventoGrupo (
    CodGrupo char(1),
    Grupo varchar(100),
    PRIMARY KEY (CodGrupo)
);

CREATE TABLE dbo.EventoMaterialTipo (
    CodEvento char(5),
    CodMaterialTipo int,
    PRIMARY KEY (CodEvento, CodMaterialTipo)
);

CREATE TABLE dbo.EventoSubGrupo (
    CodSubGrupo char(2),
    SubGrupo varchar(100),
    CodGrupo char(1),
    PRIMARY KEY (CodSubGrupo)
);

CREATE TABLE dbo.EventoTipoDocumento (
    CodEvento char(5),
    CodTipoDoc int,
    PRIMARY KEY (CodEvento, CodTipoDoc)
);

CREATE TABLE dbo.EvNumeracao (
    Ano int,
    UnidGestora int,
    Tabela varchar(30),
    Numero int,
    PRIMARY KEY (Ano, UnidGestora, Tabela)
);

CREATE TABLE dbo.Fabricante (
    CodFabricante int,
    Fabricante varchar(50),
    Ordem int,
    Meta float,
    AdicionalComissao float,
    GerenciaObjetivo bit,
    SiglaGenexis char(3),
    RazaoSocial varchar(50),
    CNPJ varchar(20),
    PRIMARY KEY (CodFabricante)
);

CREATE TABLE dbo.FabricanteAreaVenda (
    CodAreaVenda int,
    CodFabricante int,
    Usuario varchar(50),
    Data datetime,
    PRIMARY KEY (CodAreaVenda, CodFabricante)
);

CREATE TABLE dbo.Feriado (
    CodFeriado datetime,
    Feriado varchar(50),
    PRIMARY KEY (CodFeriado)
);

CREATE TABLE dbo.FidelidadeExtrato (
    CodFidelidadeExtrato int,
    CodCliente int,
    CodPedidoVenda int,
    TipoOperacao char(1),
    TipoMovimentacao char(1),
    ValorOperacao float,
    Debito int,
    Credito int,
    Saldo int,
    Data datetime,
    Usuario varchar(50),
    Descricao varchar(150),
    PRIMARY KEY (CodFidelidadeExtrato)
);

CREATE TABLE dbo.FidelidadePontuacao (
    CodFidelidadePontuacao int,
    Tipo char(1),
    Valor float,
    Pontos int,
    PontuacaoMinima int,
    PRIMARY KEY (CodFidelidadePontuacao)
);

CREATE TABLE dbo.FlexExtrato (
    CodFlexExtrato int,
    Data datetime,
    DataCadastro datetime,
    Descricao varchar(100),
    Mes int,
    Ano int,
    Valor float,
    Credito float,
    Debito float,
    Usuario varchar(20),
    CodCliente int,
    CodPedidoVenda int,
    CodSupervisor int,
    CodVendedor int,
    PRIMARY KEY (CodFlexExtrato)
);

CREATE TABLE dbo.flyway_schema_history_erp (
    installed_rank int,
    version nvarchar(50),
    description nvarchar(200),
    type nvarchar(20),
    script nvarchar(1000),
    checksum int,
    installed_by nvarchar(100),
    installed_on datetime,
    execution_time int,
    success bit,
    PRIMARY KEY (installed_rank)
);

CREATE TABLE dbo.FormaReceb (
    CodFormaReceb smallint,
    CodFormaRecebGrupo int,
    CodFormaRecebTipo int,
    CodGrupoFormaReceb int,
    CodMoeda int,
    CodTabelaPreco int,
    FormaReceb varchar(50),
    QtdParcelas smallint,
    Prazo smallint,
    Tarifa float,
    TarifaIsencao float,
    LimiteFlex float,
    Venda bit,
    Compra bit,
    Ativo bit,
    Pix bit,
    PRIMARY KEY (CodFormaReceb)
);

CREATE TABLE dbo.FormaRecebGrupo (
    CodFormaRecebGrupo int,
    FormaRecebGrupo varchar(30),
    GrupoNFe int,
    PRIMARY KEY (CodFormaRecebGrupo)
);

CREATE TABLE dbo.FormaRecebParcelas (
    CodFormaReceb smallint,
    Sequencia smallint,
    CodMoeda int,
    CodFormaRecebParcelaTipo int,
    Prazo smallint,
    ContaReceber bit,
    Percentual int,
    aPercentual float,
    PRIMARY KEY (CodFormaReceb, Sequencia)
);

CREATE TABLE dbo.FormaRecebParcelaTipo (
    CodFormaRecebParcelaTipo int,
    FormaRecebParcelaTipo varchar(50),
    PRIMARY KEY (CodFormaRecebParcelaTipo)
);

CREATE TABLE dbo.Formato (
    CodFormato int,
    CodFormatoTipo int,
    Sequencia int,
    Campo varchar(40),
    Horizontal float,
    Vertical float,
    Tamanho float,
    PRIMARY KEY (CodFormato)
);

CREATE TABLE dbo.FormatoTipo (
    CodFormatoTipo int,
    NomFormatoTipo varchar(40),
    PRIMARY KEY (CodFormatoTipo)
);

CREATE TABLE dbo.FornecedorConta (
    CodFornecedor int,
    CodConta int
);

CREATE TABLE dbo.FreteTipo (
    CodFreteTipo int,
    Frete varchar(100),
    Abreviacao varchar(50),
    ModFreteNFe varchar(5),
    Ativo bit,
    PRIMARY KEY (CodFreteTipo)
);

CREATE TABLE dbo.Funcionario (
    CodFuncionario int,
    Funcionario varchar(100),
    Nome varchar(50),
    NumRegistro int,
    Ativo bit,
    CodSetor int,
    CodCargo int,
    CodEstadoCivil int,
    CodFuncionarioTipo int,
    CodSupervisor int,
    CodTabelaObjetivo int,
    UnidGestora int,
    Entregador bit,
    Supervisor bit,
    Transportador bit,
    TransportadorAux bit,
    Vendedor bit,
    Cobrador bit,
    Endereco varchar(100),
    CodBairro int,
    CodCidade int,
    Cidade varchar(50),
    CodEstado char(2),
    Celular varchar(15),
    Telefone varchar(15),
    DataNascimento datetime,
    Escolaridade int,
    Nacionalidade varchar(30),
    Naturalidade varchar(50),
    Pai varchar(50),
    Mae varchar(50),
    QtdDependentes int,
    CNH varchar(20),
    CNHValidade datetime,
    CGC varchar(20),
    CTPS varchar(20),
    IE varchar(20),
    PIS varchar(20),
    RG varchar(20),
    RGOrgao varchar(10),
    RGUF char(2),
    TituloEleitoral varchar(20),
    ContaAgencia varchar(20),
    ContaBanco int,
    ContaCGC varchar(20),
    ContaCPF varchar(11),
    ContaNumero varchar(20),
    ContaTitular varchar(50),
    AbastecimentoLitros float,
    AbastecimentoValor float,
    DataAdmissao datetime,
    DataLimiteFerias datetime,
    ComissaoAdicional float,
    Observacao text,
    CodPontoHorario int,
    Cep char(8),
    CodPontoHorario2 int,
    CodPontoHorario3 int,
    CodPontoHorario4 int,
    EscalaTipo int,
    EscalaData datetime,
    Salario float,
    SalarioAdicional float,
    CCSituacao int,
    TipoSanguineo int,
    FatorRh int,
    Sexo char(1),
    NumRegistroDV int,
    AutorizaServicos bit,
    email varchar(100),
    EnviarDANFE bit,
    Gerente bit,
    PercentualComissao float,
    CREA varchar(30),
    CREAUF varchar(30),
    DataExpedicaoRG datetime,
    DataExpedicaoCNH datetime,
    Promotor bit,
    CRQ varchar(30),
    CRQUF varchar(30),
    Restaurante bit,
    CodCliente int,
    CartaoPagamento varchar(50),
    Saldo float,
    ComissaoMinima float,
    PRIMARY KEY (CodFuncionario)
);

CREATE TABLE dbo.FuncionarioComissao (
    CodFuncionario int,
    Tabela1 float,
    Tabela2 float,
    Tabela3 float,
    Tabela4 float,
    Tabela5 float,
    Tabela6 float,
    Tabela7 float,
    Tabela8 float,
    Tabela9 float,
    Tabela10 float,
    Tabela11 float,
    Tabela12 float,
    Tabela13 float,
    Tabela14 float,
    Tabela15 float,
    Tabela16 float,
    Tabela17 float,
    Tabela18 float,
    Tabela19 float,
    Tabela20 float,
    Tabela21 float,
    Tabela22 float,
    Tabela23 float,
    Tabela24 float,
    Tabela25 float,
    Tabela26 float,
    Tabela27 float,
    Tabela28 float,
    Tabela29 float,
    Tabela30 float,
    Tabela31 float,
    Tabela32 float,
    Tabela33 float,
    Tabela34 float,
    Tabela35 float,
    Tabela36 float,
    Tabela37 float,
    Tabela38 float,
    Tabela39 float,
    Tabela40 float,
    Tabela41 float,
    Tabela42 float,
    Tabela43 float,
    Tabela44 float,
    Tabela45 float,
    Tabela46 float,
    Tabela47 float,
    Tabela48 float,
    Tabela49 float,
    Tabela50 float,
    PRIMARY KEY (CodFuncionario)
);

CREATE TABLE dbo.FuncionarioCurso (
    CodFuncionarioCurso int,
    CodFuncionario int,
    CodCurso int,
    CargaHoraria float,
    DataInicio datetime,
    DataConclusao datetime,
    Instituicao varchar(100),
    Interno bit,
    PRIMARY KEY (CodFuncionarioCurso)
);

CREATE TABLE dbo.FuncionarioDigital (
    CodFuncionario int,
    Amostra int,
    Digital image,
    PRIMARY KEY (CodFuncionario, Amostra)
);

CREATE TABLE dbo.FuncionarioExtrato (
    CodFuncionarioExtrato int,
    CodFuncionario int,
    CodFuncionarioOperacao int,
    TipoMovimentacao char(1),
    Debito float,
    Credito float,
    Saldo float,
    VarSaldo float,
    Data datetime,
    Usuario varchar(50),
    Descricao varchar(200),
    CodMapaExpedicao int,
    Status int,
    Enviado bit,
    DataEnvio datetime,
    UUIDAssinatura uniqueidentifier,
    DataAssinatura datetime,
    Exportar bit,
    PRIMARY KEY (CodFuncionarioExtrato)
);

CREATE TABLE dbo.FuncionarioFerias (
    CodFuncionario int,
    AnoExercicio int,
    DataInicio1 datetime,
    DataFim1 datetime,
    Duracao1 int,
    DataInicio2 datetime,
    DataFim2 datetime,
    Duracao2 int,
    DiasVendidos int,
    Status char(1),
    PRIMARY KEY (CodFuncionario, AnoExercicio)
);

CREATE TABLE dbo.FuncionarioFoto (
    CodFuncionario int,
    Foto image,
    PRIMARY KEY (CodFuncionario)
);

CREATE TABLE dbo.FuncionarioHistorico (
    CodFuncionarioHistorico int,
    Avaliacao varchar(100),
    AvaliacaoDesc text,
    CodCargo int,
    CodFuncionario int,
    CodFuncionarioCurso int,
    CodHistoricoTipo int,
    CodSetor int,
    Data datetime,
    Empresa varchar(50),
    MotivoDemissao varchar(100),
    Salario float,
    PRIMARY KEY (CodFuncionarioHistorico)
);

CREATE TABLE dbo.FuncionarioMovServico (
    CodFuncionarioMovServico int,
    CodFuncionario int,
    CodFuncionarioServico int,
    Data datetime,
    Valor float,
    Tamanho varchar(20),
    Quantidade int,
    PRIMARY KEY (CodFuncionarioMovServico)
);

CREATE TABLE dbo.FuncionarioProgServico (
    CodFuncionarioProgServico int,
    CodFuncionario int,
    CodFuncionarioServico int,
    Periodo int,
    Ativo bit,
    Data1 datetime,
    Data2 datetime,
    PRIMARY KEY (CodFuncionarioProgServico)
);

CREATE TABLE dbo.FuncionarioServico (
    CodFuncionarioServico int,
    CodFuncionarioServicoTipo int,
    FuncionarioServico varchar(50),
    Periodo int,
    PRIMARY KEY (CodFuncionarioServico)
);

CREATE TABLE dbo.FuncionarioTipo (
    CodFuncionarioTipo int,
    FuncionarioTipo varchar(50),
    PRIMARY KEY (CodFuncionarioTipo)
);

CREATE TABLE dbo.Grupo (
    CodGrupo int,
    Grupo varchar(50),
    CodPai int,
    Nivel int,
    CodigoFull varchar(50),
    Codigo varchar(50),
    GrupoFull varchar(100),
    Atualizar bit,
    Custo bit,
    Bonus bit,
    CodGrupoClasse int,
    Meta bit,
    GrupoImpressao int,
    GrupoExpedicao int,
    ContaContabil varchar(50),
    CodGenero int,
    Conferencia bit,
    CodArmazenamento int,
    Precificacao char(1),
    TipoConferencia tinyint,
    PRIMARY KEY (CodGrupo)
);

CREATE TABLE dbo.GrupoBonus (
    CodGrupo int,
    Qtd1 float,
    Qtd2 float,
    Qtd3 float,
    PRIMARY KEY (CodGrupo, Qtd1)
);

CREATE TABLE dbo.GrupoClasse (
    CodGrupoClasse int,
    GrupoClasse varchar(50),
    PRIMARY KEY (CodGrupoClasse)
);

CREATE TABLE dbo.GrupoComissao (
    UnidGestora int,
    CodGrupo int,
    ComissaoPercVenda float,
    ComissaoPercSuper float,
    ComissaoPercGeren float,
    CotaQtd1 float,
    CotaPerc1 float,
    CotaQtd2 float,
    CotaPerc2 float,
    CotaQtd3 float,
    CotaPerc3 float,
    CotaQtd4 float,
    CotaPerc4 float,
    CotaQtd5 float,
    CotaPerc5 float,
    ComissaoValorMinimo float,
    ComissaoQtdMinimo float,
    PRIMARY KEY (UnidGestora, CodGrupo)
);

CREATE TABLE dbo.GrupoNaturezaOpFiscal (
    CodGrupo int,
    CodNaturezaOpFiscal1 int,
    CodNaturezaOpFiscal2 int,
    CodNaturezaOpFiscal3 int,
    CodNaturezaOpFiscal4 int,
    CodNaturezaOpFiscal5 int,
    CodNaturezaOpFiscal6 int,
    CodNaturezaOpFiscal7 int,
    CodNaturezaOpFiscal8 int,
    CodNaturezaOpFiscal9 int,
    CodNaturezaOpFiscal10 int,
    CodNaturezaOpFiscal11 int,
    CodNaturezaOpFiscal12 int,
    CodNaturezaOpFiscal13 int,
    CodNaturezaOpFiscal14 int,
    CodNaturezaOpFiscal15 int,
    CodNaturezaOpFiscal16 int,
    CodNaturezaOpFiscal17 int,
    CodNaturezaOpFiscal18 int,
    CodNaturezaOpFiscal19 int,
    CodNaturezaOpFiscal20 int,
    CodNaturezaOpFiscal21 int,
    CodNaturezaOpFiscal22 int,
    CodNaturezaOpFiscal23 int,
    CodNaturezaOpFiscal24 int,
    CodNaturezaOpFiscal25 int,
    CodNaturezaOpFiscal26 int,
    CodNaturezaOpFiscal27 int,
    CodNaturezaOpFiscal28 int,
    CodNaturezaOpFiscal29 int,
    CodNaturezaOpFiscal30 int,
    CodNaturezaOpFiscal31 int,
    CodNaturezaOpFiscal32 int,
    CodNaturezaOpFiscal33 int,
    CodNaturezaOpFiscal34 int,
    CodNaturezaOpFiscal35 int,
    CodNaturezaOpFiscal36 int,
    CodNaturezaOpFiscal37 int,
    CodNaturezaOpFiscal38 int,
    CodNaturezaOpFiscal39 int,
    CodNaturezaOpFiscal40 int,
    CodNaturezaOpFiscal41 int,
    CodNaturezaOpFiscal42 int,
    CodNaturezaOpFiscal43 int,
    CodNaturezaOpFiscal44 int,
    CodNaturezaOpFiscal45 int,
    CodNaturezaOpFiscal46 int,
    CodNaturezaOpFiscal47 int,
    CodNaturezaOpFiscal48 int,
    CodNaturezaOpFiscal49 int,
    CodNaturezaOpFiscal50 int,
    PRIMARY KEY (CodGrupo)
);

CREATE TABLE dbo.GS1Prefix (
    Inicio int,
    Fim int,
    Especial bit,
    Descricao varchar(100),
    PRIMARY KEY (Inicio, Fim)
);

CREATE TABLE dbo.HabitanteIBGE (
    CodCidadeIBGE char(10),
    UF varchar(2),
    Estado varchar(100),
    Cidade varchar(200),
    Habitantes int,
    DensidadeDemografica float,
    PRIMARY KEY (CodCidadeIBGE)
);

CREATE TABLE dbo.IBSMun (
    IBSMun float,
    IBSMunPdv float,
    IBSMunDif float,
    IBSMunDevol float,
    IBSMunRedAliq float
);

CREATE TABLE dbo.IBSMunTabela (
    CodIBSMunTabela int,
    IBSMunTabela varchar(100),
    Ativo bit,
    PRIMARY KEY (CodIBSMunTabela)
);

CREATE TABLE dbo.IBSMunTabelaCidade (
    CodIBSMunTabela int,
    CodCidadeIBGE char(10),
    PRIMARY KEY (CodIBSMunTabela, CodCidadeIBGE)
);

CREATE TABLE dbo.IBSUF (
    IBSUFRN float,
    IBSUFPB float,
    IBSUFPE float,
    IBSUFCE float,
    IBSUFPI float,
    IBSUFMA float,
    IBSUFSE float,
    IBSUFAL float,
    IBSUFBA float,
    IBSUFRJ float,
    IBSUFSP float,
    IBSUFMG float,
    IBSUFES float,
    IBSUFRS float,
    IBSUFPR float,
    IBSUFSC float,
    IBSUFGO float,
    IBSUFDF float,
    IBSUFMT float,
    IBSUFMS float,
    IBSUFTO float,
    IBSUFAM float,
    IBSUFPA float,
    IBSUFAC float,
    IBSUFRO float,
    IBSUFRR float,
    IBSUFAP float,
    IBSUFEX float,
    IBSUFPdvRN float,
    IBSUFPdvPB float,
    IBSUFPdvPE float,
    IBSUFPdvCE float,
    IBSUFPdvPI float,
    IBSUFPdvMA float,
    IBSUFPdvSE float,
    IBSUFPdvAL float,
    IBSUFPdvBA float,
    IBSUFPdvRJ float,
    IBSUFPdvSP float,
    IBSUFPdvMG float,
    IBSUFPdvES float,
    IBSUFPdvRS float,
    IBSUFPdvPR float,
    IBSUFPdvSC float,
    IBSUFPdvGO float,
    IBSUFPdvDF float,
    IBSUFPdvMT float,
    IBSUFPdvMS float,
    IBSUFPdvTO float,
    IBSUFPdvAM float,
    IBSUFPdvPA float,
    IBSUFPdvAC float,
    IBSUFPdvRO float,
    IBSUFPdvRR float,
    IBSUFPdvAP float,
    IBSUFPdvEX float,
    IBSUFDifRN float,
    IBSUFDifPB float,
    IBSUFDifPE float,
    IBSUFDifCE float,
    IBSUFDifPI float,
    IBSUFDifMA float,
    IBSUFDifSE float,
    IBSUFDifAL float,
    IBSUFDifBA float,
    IBSUFDifRJ float,
    IBSUFDifSP float,
    IBSUFDifMG float,
    IBSUFDifES float,
    IBSUFDifRS float,
    IBSUFDifPR float,
    IBSUFDifSC float,
    IBSUFDifGO float,
    IBSUFDifDF float,
    IBSUFDifMT float,
    IBSUFDifMS float,
    IBSUFDifTO float,
    IBSUFDifAM float,
    IBSUFDifPA float,
    IBSUFDifAC float,
    IBSUFDifRO float,
    IBSUFDifRR float,
    IBSUFDifAP float,
    IBSUFDifEX float,
    IBSUFDevolRN float,
    IBSUFDevolPB float,
    IBSUFDevolPE float,
    IBSUFDevolCE float,
    IBSUFDevolPI float,
    IBSUFDevolMA float,
    IBSUFDevolSE float,
    IBSUFDevolAL float,
    IBSUFDevolBA float,
    IBSUFDevolRJ float,
    IBSUFDevolSP float,
    IBSUFDevolMG float,
    IBSUFDevolES float,
    IBSUFDevolRS float,
    IBSUFDevolPR float,
    IBSUFDevolSC float,
    IBSUFDevolGO float,
    IBSUFDevolDF float,
    IBSUFDevolMT float,
    IBSUFDevolMS float,
    IBSUFDevolTO float,
    IBSUFDevolAM float,
    IBSUFDevolPA float,
    IBSUFDevolAC float,
    IBSUFDevolRO float,
    IBSUFDevolRR float,
    IBSUFDevolAP float,
    IBSUFDevolEX float,
    IBSUFRedAliqRN float,
    IBSUFRedAliqPB float,
    IBSUFRedAliqPE float,
    IBSUFRedAliqCE float,
    IBSUFRedAliqPI float,
    IBSUFRedAliqMA float,
    IBSUFRedAliqSE float,
    IBSUFRedAliqAL float,
    IBSUFRedAliqBA float,
    IBSUFRedAliqRJ float,
    IBSUFRedAliqSP float,
    IBSUFRedAliqMG float,
    IBSUFRedAliqES float,
    IBSUFRedAliqRS float,
    IBSUFRedAliqPR float,
    IBSUFRedAliqSC float,
    IBSUFRedAliqGO float,
    IBSUFRedAliqDF float,
    IBSUFRedAliqMT float,
    IBSUFRedAliqMS float,
    IBSUFRedAliqTO float,
    IBSUFRedAliqAM float,
    IBSUFRedAliqPA float,
    IBSUFRedAliqAC float,
    IBSUFRedAliqRO float,
    IBSUFRedAliqRR float,
    IBSUFRedAliqAP float,
    IBSUFRedAliqEX float
);

CREATE TABLE dbo.ICMS (
    icmsRN float,
    icmsPB float,
    icmsPE float,
    icmsCE float,
    icmsPI float,
    icmsMA float,
    icmsSE float,
    icmsAL float,
    icmsBA float,
    icmsRJ float,
    icmsSP float,
    icmsMG float,
    icmsES float,
    icmsRS float,
    icmsPR float,
    icmsSC float,
    icmsGO float,
    icmsDF float,
    icmsMT float,
    icmsMS float,
    icmsTO float,
    icmsAM float,
    icmsPA float,
    icmsAC float,
    icmsRO float,
    icmsRR float,
    icmsAP float,
    icmsCredRN float,
    icmsCredPB float,
    icmsCredPE float,
    icmsCredCE float,
    icmsCredPI float,
    icmsCredMA float,
    icmsCredSE float,
    icmsCredAL float,
    icmsCredBA float,
    icmsCredRJ float,
    icmsCredSP float,
    icmsCredMG float,
    icmsCredES float,
    icmsCredRS float,
    icmsCredPR float,
    icmsCredSC float,
    icmsCredGO float,
    icmsCredDF float,
    icmsCredMT float,
    icmsCredMS float,
    icmsCredTO float,
    icmsCredAM float,
    icmsCredPA float,
    icmsCredAC float,
    icmsCredRO float,
    icmsCredRR float,
    icmsCredAP float,
    icmsEX float,
    icmsCredEX float,
    icmsPDV float,
    icmsEstadualRN float,
    icmsEstadualPB float,
    icmsEstadualPE float,
    icmsEstadualCE float,
    icmsEstadualPI float,
    icmsEstadualMA float,
    icmsEstadualSE float,
    icmsEstadualAL float,
    icmsEstadualBA float,
    icmsEstadualRJ float,
    icmsEstadualSP float,
    icmsEstadualMG float,
    icmsEstadualES float,
    icmsEstadualRS float,
    icmsEstadualPR float,
    icmsEstadualSC float,
    icmsEstadualGO float,
    icmsEstadualDF float,
    icmsEstadualMT float,
    icmsEstadualMS float,
    icmsEstadualTO float,
    icmsEstadualAM float,
    icmsEstadualPA float,
    icmsEstadualAC float,
    icmsEstadualRO float,
    icmsEstadualRR float,
    icmsEstadualAP float,
    icmsEstadualEX float,
    icmsInterEstadualRN float,
    icmsInterEstadualPB float,
    icmsInterEstadualPE float,
    icmsInterEstadualCE float,
    icmsInterEstadualPI float,
    icmsInterEstadualMA float,
    icmsInterEstadualSE float,
    icmsInterEstadualAL float,
    icmsInterEstadualBA float,
    icmsInterEstadualRJ float,
    icmsInterEstadualSP float,
    icmsInterEstadualMG float,
    icmsInterEstadualES float,
    icmsInterEstadualRS float,
    icmsInterEstadualPR float,
    icmsInterEstadualSC float,
    icmsInterEstadualGO float,
    icmsInterEstadualDF float,
    icmsInterEstadualMT float,
    icmsInterEstadualMS float,
    icmsInterEstadualTO float,
    icmsInterEstadualAM float,
    icmsInterEstadualPA float,
    icmsInterEstadualAC float,
    icmsInterEstadualRO float,
    icmsInterEstadualRR float,
    icmsInterEstadualAP float,
    icmsInterEstadualEX float,
    icmsFCPRN float,
    icmsFCPPB float,
    icmsFCPPE float,
    icmsFCPCE float,
    icmsFCPPI float,
    icmsFCPMA float,
    icmsFCPSE float,
    icmsFCPAL float,
    icmsFCPBA float,
    icmsFCPRJ float,
    icmsFCPSP float,
    icmsFCPMG float,
    icmsFCPES float,
    icmsFCPRS float,
    icmsFCPPR float,
    icmsFCPSC float,
    icmsFCPGO float,
    icmsFCPDF float,
    icmsFCPMT float,
    icmsFCPMS float,
    icmsFCPTO float,
    icmsFCPAM float,
    icmsFCPPA float,
    icmsFCPAC float,
    icmsFCPRO float,
    icmsFCPRR float,
    icmsFCPAP float,
    icmsFCPEX float,
    icmsDifRN float,
    icmsDifPB float,
    icmsDifPE float,
    icmsDifCE float,
    icmsDifPI float,
    icmsDifMA float,
    icmsDifSE float,
    icmsDifAL float,
    icmsDifBA float,
    icmsDifRJ float,
    icmsDifSP float,
    icmsDifMG float,
    icmsDifES float,
    icmsDifRS float,
    icmsDifPR float,
    icmsDifSC float,
    icmsDifGO float,
    icmsDifDF float,
    icmsDifMT float,
    icmsDifMS float,
    icmsDifTO float,
    icmsDifAM float,
    icmsDifPA float,
    icmsDifAC float,
    icmsDifRO float,
    icmsDifRR float,
    icmsDifAP float,
    icmsDifEX float
);

CREATE TABLE dbo.ICMSAliquota (
    IcmsAliquota float,
    Usuario varchar(50),
    Data datetime,
    PRIMARY KEY (IcmsAliquota)
);

CREATE TABLE dbo.ICMSSubst (
    IcmsSubstRN float,
    IcmsSubstPB float,
    IcmsSubstPE float,
    IcmsSubstCE float,
    IcmsSubstPI float,
    IcmsSubstMA float,
    IcmsSubstSE float,
    IcmsSubstAL float,
    IcmsSubstBA float,
    IcmsSubstRJ float,
    IcmsSubstSP float,
    IcmsSubstMG float,
    IcmsSubstES float,
    IcmsSubstRS float,
    IcmsSubstPR float,
    IcmsSubstSC float,
    IcmsSubstGO float,
    IcmsSubstDF float,
    IcmsSubstMT float,
    IcmsSubstMS float,
    IcmsSubstTO float,
    IcmsSubstAM float,
    IcmsSubstPA float,
    IcmsSubstAC float,
    IcmsSubstRO float,
    IcmsSubstRR float,
    IcmsSubstAP float,
    TipoIcmsSubstRN int,
    TipoIcmsSubstPB int,
    TipoIcmsSubstPE int,
    TipoIcmsSubstCE int,
    TipoIcmsSubstPI int,
    TipoIcmsSubstMA int,
    TipoIcmsSubstSE int,
    TipoIcmsSubstAL int,
    TipoIcmsSubstBA int,
    TipoIcmsSubstRJ int,
    TipoIcmsSubstSP int,
    TipoIcmsSubstMG int,
    TipoIcmsSubstES int,
    TipoIcmsSubstRS int,
    TipoIcmsSubstPR int,
    TipoIcmsSubstSC int,
    TipoIcmsSubstGO int,
    TipoIcmsSubstDF int,
    TipoIcmsSubstMT int,
    TipoIcmsSubstMS int,
    TipoIcmsSubstTO int,
    TipoIcmsSubstAM int,
    TipoIcmsSubstPA int,
    TipoIcmsSubstAC int,
    TipoIcmsSubstRO int,
    TipoIcmsSubstRR int,
    TipoIcmsSubstAP int,
    IcmsSubstEX float,
    TipoIcmsSubstEX int,
    CodEstado char(2),
    IcmsSubst2RN float,
    IcmsSubst2PB float,
    IcmsSubst2PE float,
    IcmsSubst2CE float,
    IcmsSubst2PI float,
    IcmsSubst2MA float,
    IcmsSubst2SE float,
    IcmsSubst2AL float,
    IcmsSubst2BA float,
    IcmsSubst2RJ float,
    IcmsSubst2SP float,
    IcmsSubst2MG float,
    IcmsSubst2ES float,
    IcmsSubst2RS float,
    IcmsSubst2PR float,
    IcmsSubst2SC float,
    IcmsSubst2GO float,
    IcmsSubst2DF float,
    IcmsSubst2MT float,
    IcmsSubst2MS float,
    IcmsSubst2TO float,
    IcmsSubst2AM float,
    IcmsSubst2PA float,
    IcmsSubst2AC float,
    IcmsSubst2RO float,
    IcmsSubst2RR float,
    IcmsSubst2AP float,
    IcmsSubst2EX float,
    TipoIcmsFuncepRN int,
    TipoIcmsFuncepPB int,
    TipoIcmsFuncepPE int,
    TipoIcmsFuncepCE int,
    TipoIcmsFuncepPI int,
    TipoIcmsFuncepMA int,
    TipoIcmsFuncepSE int,
    TipoIcmsFuncepAL int,
    TipoIcmsFuncepBA int,
    TipoIcmsFuncepRJ int,
    TipoIcmsFuncepSP int,
    TipoIcmsFuncepMG int,
    TipoIcmsFuncepES int,
    TipoIcmsFuncepRS int,
    TipoIcmsFuncepPR int,
    TipoIcmsFuncepSC int,
    TipoIcmsFuncepGO int,
    TipoIcmsFuncepDF int,
    TipoIcmsFuncepMT int,
    TipoIcmsFuncepMS int,
    TipoIcmsFuncepTO int,
    TipoIcmsFuncepAM int,
    TipoIcmsFuncepPA int,
    TipoIcmsFuncepAC int,
    TipoIcmsFuncepRO int,
    TipoIcmsFuncepRR int,
    TipoIcmsFuncepAP int,
    TipoIcmsFuncepEX int,
    IcmsFuncepRN float,
    IcmsFuncepPB float,
    IcmsFuncepPE float,
    IcmsFuncepCE float,
    IcmsFuncepPI float,
    IcmsFuncepMA float,
    IcmsFuncepSE float,
    IcmsFuncepAL float,
    IcmsFuncepBA float,
    IcmsFuncepRJ float,
    IcmsFuncepSP float,
    IcmsFuncepMG float,
    IcmsFuncepES float,
    IcmsFuncepRS float,
    IcmsFuncepPR float,
    IcmsFuncepSC float,
    IcmsFuncepGO float,
    IcmsFuncepDF float,
    IcmsFuncepMT float,
    IcmsFuncepMS float,
    IcmsFuncepTO float,
    IcmsFuncepAM float,
    IcmsFuncepPA float,
    IcmsFuncepAC float,
    IcmsFuncepRO float,
    IcmsFuncepRR float,
    IcmsFuncepAP float,
    IcmsFuncepEX float
);

CREATE TABLE dbo.ICMSSubstTabela (
    CodICMSSubstTabela int,
    ICMSSubstTabela varchar(50),
    PRIMARY KEY (CodICMSSubstTabela)
);

CREATE TABLE dbo.ICMSSubstTipo (
    CodICMSSubstTipo int,
    ICMSSubstTipo varchar(50),
    PRIMARY KEY (CodICMSSubstTipo)
);

CREATE TABLE dbo.IESubst (
    CodEstado char(2),
    IESubst varchar(20),
    Mascara varchar(50),
    UnidGestora int,
    PRIMARY KEY (CodEstado, UnidGestora)
);

CREATE TABLE dbo.Incontrol (
    CodIncontrol int,
    Incontrol varchar(50),
    IncontrolOdbc varchar(50),
    IP varchar(50),
    Porta int,
    Usuario varchar(50),
    Senha varchar(50),
    PRIMARY KEY (CodIncontrol)
);

CREATE TABLE dbo.Incontrol_tb_eventos_dispositivos (
    IdIncontrol int,
    CodIncontrol int,
    id int,
    de_data_evento datetime,
    nr_tipo_evento int,
    nr_status_evento int,
    de_detalhe varchar(200),
    de_observacoes varchar(254),
    lv_sistema bit,
    lv_special bit,
    nr_pin int,
    nr_num_dedo int,
    de_cod_cartao varchar(250),
    de_cod_operacao varchar(8),
    dt_created_at date,
    nr_credencial_id int,
    nr_dispositivo_id int,
    nr_ponto_acesso_id int,
    nr_operador_id int,
    de_acesso_porta varchar(15),
    nr_pessoa_id int,
    lv_facial bit,
    de_last_id_mip int,
    de_cod_controle_remoto varchar(250),
    de_cod_timestamp_controle varchar(250),
    de_nome_pessoa varchar(250),
    de_tipo_evento_xpe varchar(25),
    de_pessoa_nivel_visitante bit,
    de_nome_dispositivo varchar(200),
    de_nome_ponto_acesso varchar(200),
    de_cor varchar(120),
    de_imagem_veiculo int,
    de_marca varchar(120),
    de_modelo varchar(120),
    de_placa varchar(15),
    de_cpf varchar(14),
    de_rg varchar(20),
    de_departamento varchar(120),
    de_apart varchar(10),
    de_matricula varchar(254),
    de_nome_visitado varchar(250),
    de_placa_cor_reconhecida varchar(30),
    de_placa_detectada varchar(10),
    de_veiculo_cor_reconhecida varchar(30),
    de_veiculo_tipo_reconhecido varchar(30),
    PRIMARY KEY (IdIncontrol)
);

CREATE TABLE dbo.Indicacao (
    CodIndicacao int,
    Indicacao varchar(40),
    PRIMARY KEY (CodIndicacao)
);

CREATE TABLE dbo.IndiceComissao (
    CodIndiceComissao int,
    IndiceComissao varchar(50),
    Peso float,
    Status char(1),
    Descricao varchar(200),
    CodIndiceModelo int,
    IndiceTipo int,
    PRIMARY KEY (CodIndiceComissao)
);

CREATE TABLE dbo.IndiceComissaoFaixa (
    CodIndiceComissaoFaixa int,
    IndiceComissaoFaixa varchar(100),
    CodIndiceComissao int,
    FaixaInicio float,
    FaixaFim float,
    IndiceFaixa float,
    PRIMARY KEY (CodIndiceComissaoFaixa)
);

CREATE TABLE dbo.IndiceComissaoHistorico (
    CodAreaVenda int,
    CodIndiceComissao int,
    iProposto float,
    iTotal float,
    Indice float,
    IndiceFaixa float,
    iAvaria float,
    CodAreaSupervisao int
);

CREATE TABLE dbo.IndiceModelo (
    CodIndiceModelo int,
    IndiceModelo varchar(100),
    Descricao varchar(200),
    PRIMARY KEY (CodIndiceModelo)
);

CREATE TABLE dbo.Integracao (
    CodIntegracao int,
    Descricao varchar(50),
    Data datetime,
    Usuario varchar(50),
    DataInicio datetime,
    DataFim datetime,
    UnidGestora int,
    ExportacaoFaturamento bit,
    ExportacaoFinanceiro bit,
    ExportacaoDocumento bit,
    Ativo bit,
    DataEstorno datetime,
    UsuarioEstorno varchar(50),
    ExportacaoCompra bit,
    PRIMARY KEY (CodIntegracao)
);

CREATE TABLE dbo.IntegracaoContabilConfigDocumento (
    CodIntegContabilConfigDocumento int,
    Sequencia int,
    CodDocumentoIntegracaoTipo int,
    TipoContaContabil varchar(50),
    ContaContabilFixaC varchar(100),
    ContaContabilFixaD varchar(100),
    TipoCentroCusto varchar(50),
    CentroCustoFixaC varchar(100),
    CentroCustoFixaD varchar(100),
    Filtro varchar(100),
    Descricao varchar(100),
    PRIMARY KEY (CodIntegContabilConfigDocumento)
);

CREATE TABLE dbo.IntegracaoContabilConfigDocumentoCampos (
    CodIntegContabilConfigDocumento int,
    CodDocumentoIntegracaoCampos int,
    PRIMARY KEY (CodIntegContabilConfigDocumento, CodDocumentoIntegracaoCampos)
);

CREATE TABLE dbo.IntegracaoContabilConfigFinanceiro (
    CodIntegContConfigFinanceiro int,
    Sequencia int,
    Referencia varchar(50),
    CodCaixaTipo int,
    TipoContaContabil varchar(50),
    ContaContabilFixa varchar(100),
    TipoCentroCusto varchar(50),
    CentroCustolFixa varchar(100),
    VincContaPagar int,
    VincContaReceber int,
    VincPedidoVenda int,
    VincPDVCupom int,
    VincBancoExtrato int,
    VincMoeda int,
    Filtro varchar(100),
    ContabilCD char(1),
    Descricao varchar(100),
    VincDoc int,
    PRIMARY KEY (CodIntegContConfigFinanceiro)
);

CREATE TABLE dbo.IntegracaoContabilConfigNotaFiscal (
    CodIntegContabilConfigNF int,
    Sequencia int,
    CodNotaFiscalIntegracaoTipo int,
    TipoContaContabil varchar(50),
    ContaContabilFixaC varchar(100),
    ContaContabilFixaD varchar(100),
    TipoCentroCusto varchar(50),
    CentroCustoFixaC varchar(100),
    CentroCustoFixaD varchar(100),
    Filtro varchar(100),
    Descricao varchar(100),
    PRIMARY KEY (CodIntegContabilConfigNF)
);

CREATE TABLE dbo.IntegracaoContabilConfigNotaFiscalCampos (
    CodIntegContabilConfigNF int,
    CodNotaFiscalIntegracaoCampos int,
    PRIMARY KEY (CodIntegContabilConfigNF, CodNotaFiscalIntegracaoCampos)
);

CREATE TABLE dbo.IntegracaoLancamento (
    Sequencia int,
    CodIntegracaoMovimento int,
    CodContaContabil varchar(20),
    CodCentroCusto varchar(20),
    Valor float,
    CD char(1),
    PRIMARY KEY (Sequencia, CodIntegracaoMovimento)
);

CREATE TABLE dbo.IntegracaoMovimento (
    CodIntegracao int,
    CodIntegracaoMovimento int,
    CodCaixa int,
    CodNotaFiscal int,
    CodDoc int,
    CodPDVReducaoZ int,
    DataLancamento datetime,
    Descricao varchar(250),
    Valor float,
    TipoOperacao varchar(50),
    Ativo bit,
    DataEstorno datetime,
    UsuarioEstorno varchar(50),
    PRIMARY KEY (CodIntegracaoMovimento)
);

CREATE TABLE dbo.Inventario (
    CodMaterial int,
    Quantidade float,
    UltimoCusto float,
    ValorProduto float,
    Posse int,
    CNPJ varchar(14),
    IE varchar(14),
    UF varchar(2),
    UnidGestora int,
    Mes int,
    Ano int,
    CodCliente int,
    ContaContabil varchar(50)
);

CREATE TABLE dbo.ISOCodificacao (
    NomeRelatorio varchar(300),
    NomeISO varchar(100),
    PRIMARY KEY (NomeRelatorio)
);

CREATE TABLE dbo.ISSQNItem (
    CodISSQNItem int,
    ISSQNItem varchar(250),
    PRIMARY KEY (CodISSQNItem)
);

CREATE TABLE dbo.JurosMulta (
    CodJurosMulta int,
    TipoJuros int,
    Juros float,
    TipoMulta int,
    Multa float,
    PRIMARY KEY (CodJurosMulta)
);

CREATE TABLE dbo.Lancamento (
    NumLanc int,
    UnidGestora int,
    CodDoc int,
    Sequencia int,
    CodEvento char(5),
    NumContaCorrenteComp int,
    Valor float,
    FValor float,
    DataLanc datetime,
    Estorno bit,
    NumLancEstorno int,
    DocItensSequencia int,
    PRIMARY KEY (NumLanc)
);

CREATE TABLE dbo.LancamentoConta (
    NumLanc int,
    Operacao char(1),
    CodConta char(9),
    idLancamentoConta int,
    PRIMARY KEY (idLancamentoConta)
);

CREATE TABLE dbo.LinhaProducao (
    CodLinhaProducao int,
    LinhaProducao varchar(100),
    Ativo bit,
    PRIMARY KEY (CodLinhaProducao)
);

CREATE TABLE dbo.LinhaProducaoMaterial (
    CodLinhaProducao int,
    CodMaterial int,
    PRIMARY KEY (CodLinhaProducao, CodMaterial)
);

CREATE TABLE dbo.LogErro (
    Data datetime,
    Sistema varchar(50),
    Usuario varchar(50),
    Erro varchar(50),
    ExceptionMessage varchar(400),
    Obs varchar(100),
    Estacao varchar(50),
    Form varchar(100),
    idLogErro int,
    Versao int,
    PRIMARY KEY (idLogErro)
);

CREATE TABLE dbo.LoginGrupoUsuario (
    CodGrupoUsuario int,
    GrupoUsuario varchar(100),
    PRIMARY KEY (CodGrupoUsuario)
);

CREATE TABLE dbo.LoginUsuario (
    CodUsuario int,
    Usuario varchar(100),
    LoginDB varchar(100),
    CodCliente int,
    CodGrupoUsuario int,
    PRIMARY KEY (CodUsuario)
);

CREATE TABLE dbo.LoginUsuarioUnidade (
    CodUsuario varchar(50),
    CodUnidGestora int,
    Padrao int,
    PRIMARY KEY (CodUnidGestora, CodUsuario)
);

CREATE TABLE dbo.LogOperacao (
    DataIni datetime,
    DataFim datetime,
    TempoTotal bigint,
    Operacao varchar(50),
    Sistema varchar(50),
    Status char(1),
    Usuario varchar(50),
    Estacao varchar(50),
    Form varchar(100),
    idLogOperacao int,
    PRIMARY KEY (idLogOperacao)
);

CREATE TABLE dbo.LogTransacao (
    Data datetime,
    Sistema varchar(50),
    Usuario varchar(50),
    Operacao varchar(50),
    Status char(1),
    Estacao varchar(50),
    Form varchar(100),
    ID int,
    Versao varchar(10),
    idLogTransacao int,
    PRIMARY KEY (idLogTransacao)
);

CREATE TABLE dbo.MapaAbastecimento (
    CodMapaAbastecimento int,
    CodFornecedor int,
    DataInicio datetime,
    DataFim datetime,
    Status int,
    UsuarioCadastro varchar(50),
    DataCadastro datetime,
    UsuarioEncerramento varchar(50),
    DataEncerramento datetime,
    UsuarioCancelamento varchar(50),
    DataCancelamento datetime,
    Descricao varchar(255),
    MotivoCancelamento varchar(255),
    PRIMARY KEY (CodMapaAbastecimento)
);

CREATE TABLE dbo.MapaAbastecimentoMovimentacao (
    CodMapaAbastecimento int,
    CodMovimentacao int,
    PRIMARY KEY (CodMapaAbastecimento, CodMovimentacao)
);

CREATE TABLE dbo.MapaEvento (
    CodMapaEvento int,
    UnidGestora int,
    CodCliente int,
    CodVendedor int,
    Evento varchar(100),
    DataEvento datetime,
    Endereco varchar(100),
    Gerador int,
    DataInicio datetime,
    DataFinal datetime,
    Situacao char(1),
    Observacao text,
    Evento2 varchar(100),
    DataEvento2 datetime,
    Endereco2 varchar(100),
    Gerador2 int,
    Evento3 varchar(100),
    DataEvento3 datetime,
    Endereco3 varchar(100),
    Gerador3 int,
    PRIMARY KEY (CodMapaEvento)
);

CREATE TABLE dbo.MapaExpedicao (
    CodMapaExpedicao int,
    CodMapaExpedicaoRetorno int,
    CodMapaExpedicaoTipo int,
    EmitiuMapa bit,
    UnidGestora int,
    DataExpedicao datetime,
    CodMotorista int,
    CodVeiculo int,
    CodVendedor int,
    Status int,
    Auto bit,
    Usuario varchar(50),
    Data datetime,
    CodAuxiliar1 int,
    CodAuxiliar2 int,
    CodAuxiliar3 int,
    CodAuxiliar4 int,
    ValorInicial float,
    ValorFinal float,
    Valor float,
    Peso float,
    Volume float,
    QtdEntrega int,
    QtdEmbalagem int,
    ValorEmbInicial float,
    ValorEmbFinal float,
    ValorBonifInicial float,
    ValorBonifFinal float,
    ValorDespesa float,
    ValorDevolucao float,
    ValorAvaria float,
    UsuarioSaida varchar(50),
    DataSaida datetime,
    UsuarioRetorno varchar(50),
    DataRetorno datetime,
    UsuarioEncerramento varchar(50),
    DataEncerramento datetime,
    UsuarioCancelamento varchar(50),
    DataCancelamento datetime,
    CodGrupo int,
    CodRotaEntrega int,
    DataPrevisao datetime,
    ValorRealocado float,
    Observacao varchar(100),
    KMTotal float,
    TemSaida float,
    TemRetorno float,
    DataEnvio datetime,
    CodFreteTipo int,
    PRIMARY KEY (CodMapaExpedicao)
);

CREATE TABLE dbo.MapaExpedicaoCarregamento (
    CodMapaExpedicaoCarregamento int,
    CodMapaExpedicao int,
    NumEtiqueta smallint,
    CodVeiculo int,
    UsuarioCarregamento varchar(50),
    DataCarragamento datetime,
    Situacao tinyint,
    Porta int,
    PRIMARY KEY (CodMapaExpedicaoCarregamento)
);

CREATE TABLE dbo.MapaExpedicaoConferencia (
    CodMapaExpedicaoConferencia int,
    CodMapaExpedicao int,
    UsuarioConferencia varchar(255),
    DataInicioConferencia datetime,
    DataFimConferencia datetime,
    Status int,
    PRIMARY KEY (CodMapaExpedicaoConferencia)
);

CREATE TABLE dbo.MapaExpedicaoDespesa (
    CodMapaExpedicao int,
    CodConta varchar(20),
    Restituir bit,
    Valor float,
    CodResponsavel int,
    CodMapaExpedicaoDespesa int,
    CodContaPagar int,
    CodMoeda int,
    Qtd int,
    ValorUnit float,
    Data datetime,
    Usuario varchar(50),
    Situacao int,
    CodPagamentoDadosItens int,
    CodFuncionarioExtratoCredito int,
    CodFuncionarioExtratoDebito int,
    QtdDebito int,
    Diaria bit,
    Complemento bit,
    SituacaoDevolucao int,
    DataADevolver datetime,
    UsuarioADevolver varchar(50),
    DataDevolvido datetime,
    UsuarioDevolvido varchar(50),
    SituacaoDevolucaoInteira int,
    PRIMARY KEY (CodMapaExpedicaoDespesa)
);

CREATE TABLE dbo.MapaExpedicaoItens (
    CodMapaExpedicao int,
    CodMaterial int,
    CodEmbalagem int,
    QtdInicial float,
    QtdFinal float,
    QtdDevolucao float,
    QtdAvaria float,
    ValorEmbalagem float,
    QtdRetorno float,
    Checkout int,
    QtdVendaMatRetornavel float,
    PRIMARY KEY (CodMapaExpedicao, CodMaterial, CodEmbalagem)
);

CREATE TABLE dbo.MapaExpedicaoItensConferencia (
    CodMapaExpedicaoItensConferencia int,
    CodMapaExpedicaoConferencia int,
    CodMapaExpedicao int,
    CodMaterial int,
    CodEmbalagem int,
    UsuarioConferencia varchar(255),
    Quantidade float,
    QuantidadeConferencia float,
    DataConferencia datetime,
    FaltaMercadoria int,
    SobraMercadoria int,
    TrocaMercadoria int,
    Ativo int,
    PRIMARY KEY (CodMapaExpedicaoItensConferencia)
);

CREATE TABLE dbo.MapaExpedicaoMoeda (
    CodMapaExpedicao int,
    CodMoeda int,
    ValorInicial float,
    ValorFinal float,
    ValorDevolucao float,
    ValorAvaria float,
    ValorFinalApp float,
    ValorDevolucaoApp float,
    PRIMARY KEY (CodMapaExpedicao, CodMoeda)
);

CREATE TABLE dbo.MapaExpedicaoPedido (
    CodMapaExpedicao int,
    CodPedidoVenda int,
    CodRomaneio int,
    Status int,
    ValorInicial float,
    ValorFinal float,
    Grupo int,
    TipoPedido int,
    Sequencia int,
    PRIMARY KEY (CodMapaExpedicao, CodPedidoVenda)
);

CREATE TABLE dbo.MapaExpedicaoPreVenda (
    CodMapaExpedicao int,
    CodPocket int,
    CodDoc int,
    PRIMARY KEY (CodMapaExpedicao, CodPocket, CodDoc)
);

CREATE TABLE dbo.MapaExpedicaoTipo (
    CodMapaExpedicaoTipo int,
    MapaExpedicaoTipo varchar(50),
    Ativo bit,
    PRIMARY KEY (CodMapaExpedicaoTipo)
);

CREATE TABLE dbo.MapaPagamento (
    CodMapaPagamento int,
    UnidGestora int,
    Data datetime,
    DataFechamento datetime,
    DataEncerramento datetime,
    DataCancelamento datetime,
    DataInicial datetime,
    DataFinal datetime,
    Status int,
    Usuario varchar(50),
    UsuarioFechamento varchar(50),
    UsuarioEncerramento varchar(50),
    UsuarioCancelamento varchar(50),
    UsuarioEstEncerramento varchar(50),
    DataEstEncerramento datetime,
    UsuarioEstFechamento varchar(50),
    DataEstFechamento datetime,
    Descricao varchar(100),
    PRIMARY KEY (CodMapaPagamento)
);

CREATE TABLE dbo.MapaProducao (
    CodMapaProducao int,
    CodMapaProducaoTipo int,
    UnidGestora int,
    DataProducao datetime,
    CodCliente int,
    CodMotorista int,
    CodVeiculo int,
    CodVendedor int,
    Status int,
    QualidadeCarga int,
    Lote varchar(20),
    Observacao varchar(100),
    Usuario varchar(50),
    UsuarioEntrada varchar(50),
    DataEntrada datetime,
    UsuarioSaida varchar(50),
    DataSaida datetime,
    UsuarioConferencia varchar(50),
    DataConferencia datetime,
    ValorVenda float,
    ValorBonif float,
    ValorAvaria float,
    ValorDespesa float,
    Peso float,
    Volume float,
    UsuarioEncerramento varchar(50),
    DataEncerramento datetime,
    UsuarioCancelamento varchar(50),
    DataCancelamento datetime,
    ValorEmbInicial float,
    QtdEntrega int,
    ValorInicial float,
    ValorFinal float,
    ValorBonifInicial float,
    ValorBonifFinal float,
    CodLinhaProducao int,
    NumLinhaProducao int,
    Iteracao int,
    Descricao varchar(50),
    Etapa int,
    CodMapaProducaoSubTipo int,
    CodCelulaProducao int,
    QtdEtapas int,
    QtdDiasEtapa int,
    DataProducaoInicio datetime,
    DataProducaoFim datetime,
    MotivoCancelamento varchar(100),
    CodAlmoxarifado int,
    PRIMARY KEY (CodMapaProducao)
);

CREATE TABLE dbo.MapaProducaoApoio (
    CodMapaProducao int,
    CodMapaProducaoApoio int,
    PRIMARY KEY (CodMapaProducao, CodMapaProducaoApoio)
);

CREATE TABLE dbo.MapaProducaoControle (
    CodMapaProducaoControle int,
    MapaProducaoControle varchar(40),
    Status int,
    CodPai int,
    CalcQtdFaturado int,
    CalcQtdProduzido int,
    CalcQtdBonif int,
    CalcQtdAvaria int,
    CalcQtdVasilhame int,
    PRIMARY KEY (CodMapaProducaoControle)
);

CREATE TABLE dbo.MapaProducaoDocumento (
    CodMapaProducao int,
    CodDoc int,
    CodTipoDoc int,
    Status int,
    CodMapaProducaoApoio int,
    Etapa int,
    PRIMARY KEY (CodMapaProducao, CodTipoDoc, CodDoc)
);

CREATE TABLE dbo.MapaProducaoEtapa (
    CodMapaProducao int,
    Etapa int,
    DataInicial datetime,
    DataFinal datetime,
    Status int,
    CodDoc int,
    PRIMARY KEY (CodMapaProducao, Etapa)
);

CREATE TABLE dbo.MapaProducaoInsumo (
    CodMapaProducaoInsumo int,
    CodMaterial int,
    QtdDesejada float,
    CodMapaProducao int,
    PRIMARY KEY (CodMapaProducaoInsumo)
);

CREATE TABLE dbo.MapaProducaoItens (
    CodMapaProducao int,
    CodMaterial int,
    CodEmbalagem int,
    QtdInicial float,
    QtdFinal float,
    QtdDevolucao float,
    QtdAvaria float,
    ValorEmbalagem float,
    PRIMARY KEY (CodMapaProducao, CodMaterial, CodEmbalagem)
);

CREATE TABLE dbo.MapaProducaoMaterial (
    CodMapaProducao int,
    CodMaterial int,
    CodEmbalagem int,
    Qtd1 float,
    Qtd2 float,
    Qtd3 float,
    Qtd4 float,
    Qtd5 float,
    Qtd6 float,
    Qtd7 float,
    Qtd8 float,
    Qtd9 float,
    Qtd10 float,
    Qtd11 float,
    Qtd12 float,
    Qtd13 float,
    Qtd14 float,
    Qtd15 float,
    Qtd16 float,
    Qtd17 float,
    Qtd18 float,
    Qtd19 float,
    Qtd20 float,
    QtdFaturado float,
    QtdProduzir float,
    QtdBonif float,
    QtdAvaria float,
    QtdVasilhame float,
    Qtd21 float,
    Qtd22 float,
    Qtd23 float,
    Qtd24 float,
    Qtd25 float,
    Qtd26 float,
    Qtd27 float,
    Qtd28 float,
    Qtd29 float,
    Qtd30 float,
    Qtd31 float,
    Qtd32 float,
    Qtd33 float,
    Qtd34 float,
    Qtd35 float,
    Qtd36 float,
    Qtd37 float,
    Qtd38 float,
    Qtd39 float,
    Qtd40 float,
    Qtd41 float,
    Qtd42 float,
    Qtd43 float,
    Qtd44 float,
    Qtd45 float,
    Qtd46 float,
    Qtd47 float,
    Qtd48 float,
    Qtd49 float,
    Qtd50 float,
    QtdEstoque float,
    QtdPedidoVenda float,
    GiroMensal float,
    QtdProjecao int,
    QtdMinima int,
    PRIMARY KEY (CodMapaProducao, CodMaterial, CodEmbalagem)
);

CREATE TABLE dbo.MapaProducaoPedido (
    CodMapaProducao int,
    CodPedidoVenda int,
    Status int,
    ValorInicial float,
    ValorFinal float,
    PRIMARY KEY (CodMapaProducao, CodPedidoVenda)
);

CREATE TABLE dbo.MapaProducaoProcControle (
    CodMapaProducaoProcControle int,
    MapaProducaoProcControle varchar(50),
    Ativo bit,
    PRIMARY KEY (CodMapaProducaoProcControle)
);

CREATE TABLE dbo.MapaProducaoProcesso (
    CodMapaProducao int,
    CodMaterial int,
    CodUnidade int,
    Ordem int,
    DataInicial datetime,
    DataFinal datetime,
    CodProcessoDesc int,
    Iteracao int,
    Valor01 float,
    Valor02 float,
    Valor03 float,
    Valor04 float,
    Valor05 float,
    Valor06 float,
    Valor07 float,
    Valor08 float,
    Valor09 float,
    Valor10 float,
    Etapa int,
    Qtd float,
    ValorUnit float,
    ValorTotal float,
    PRIMARY KEY (CodMapaProducao, CodMaterial, Ordem)
);

CREATE TABLE dbo.MapaProducaoProcessoFunc (
    CodMapaProducao int,
    CodMaterial int,
    CodUnidade int,
    Ordem int,
    CodFuncionario int,
    PRIMARY KEY (CodMapaProducao, CodMaterial, Ordem, CodFuncionario)
);

CREATE TABLE dbo.MapaProducaoProcessoMaterial (
    CodMapaProducao int,
    CodMaterial int,
    CodUnidade int,
    Ordem int,
    CodItem int,
    CodEmbalagem int,
    Meta float,
    Qtd float,
    PRIMARY KEY (CodMapaProducao, CodMaterial, Ordem, CodItem)
);

CREATE TABLE dbo.MapaProducaoSubTipo (
    CodMapaProducaoSubTipo int,
    MapaProducaoSubTipo varchar(100),
    CodMapaProducaoTipo int,
    QtdEtapas int,
    QtdDiasEtapa int,
    PRIMARY KEY (CodMapaProducaoSubTipo)
);

CREATE TABLE dbo.MapaProducaoTipo (
    CodMapaProducaoTipo int,
    MapaProducaoTipo varchar(40),
    PRIMARY KEY (CodMapaProducaoTipo)
);

CREATE TABLE dbo.MapaRecebimento (
    CodMapaRecebimento int,
    UnidGestora int,
    CodAlmoxarifado int,
    CodMotorista int,
    CodVeiculo int,
    Data datetime,
    DataPesagem datetime,
    DataRecebimento datetime,
    DataEncerramento datetime,
    DataCancelamento datetime,
    DataPesoInicial datetime,
    DataPesoFinal datetime,
    Peso float,
    PesoInicial float,
    PesoFinal float,
    PesoIndice int,
    Status int,
    Usuario varchar(50),
    UsuarioPesagem varchar(50),
    UsuarioRecebimento varchar(50),
    UsuarioEncerramento varchar(50),
    UsuarioCancelamento varchar(50),
    DataMapa datetime,
    DataEstEncerramento datetime,
    UsuarioEstEncerramento varchar(50),
    Volume float,
    DataEstRecebimento datetime,
    UsuarioEstRecebimento varchar(50),
    PRIMARY KEY (CodMapaRecebimento)
);

CREATE TABLE dbo.Material (
    CodMaterial int,
    Material varchar(50),
    CodUnidade int,
    CodGrupo int,
    CodSabor int,
    Volume float,
    VolumeBruto float,
    CodFabricante int,
    PesoLiquido float,
    PesoBruto float,
    CodMaterial1 int,
    Material1 varchar(120),
    CodMaterial2 int,
    Material2 varchar(120),
    Visibilidade int,
    CodigoGrupo int,
    CodigoFaixa int,
    UltimoCusto float,
    CustoMedio float,
    QtdVolume int,
    Tipo int,
    Ativo bit,
    UltimoCustoProd float,
    CustoMedioProd float,
    UltimoCustoBruto float,
    CustoMedioBruto float,
    Usuario varchar(50),
    DataAlteracao datetime,
    QtdProducao float,
    Nivel int,
    RegProducao bit,
    Vender bit,
    GerenciarObjetivo bit,
    VendaRapida bit,
    VendaRapidaSeq int,
    Densidade float,
    CalcDensidade bit,
    Especificacao text,
    Catalogo bit,
    CodMaterialDensidade int,
    CodClassificadorFiscal int,
    cst int,
    CodNCM varchar(15),
    DescontoMax float,
    AcrescimoMax float,
    CodMaterialObservacao int,
    CodEmbalagemTipo int,
    CodMaterialServico int,
    DataCadastro datetime,
    QtdEficiencia float,
    Lote bit,
    EmbRetornavel bit,
    CodEmbRetornavel1 int,
    CodEmbRetornavel2 int,
    UnidEmbRetornavel1 int,
    UnidEmbRetornavel2 int,
    CodAlmoxarifadoUG01 int,
    CodAlmoxarifadoUG02 int,
    CodAlmoxarifadoUG03 int,
    CodAlmoxarifadoUG04 int,
    CodAlmoxarifadoUG05 int,
    CodAlmoxarifadoUG06 int,
    CodAlmoxarifadoUG07 int,
    CodAlmoxarifadoUG08 int,
    CodAlmoxarifadoUG09 int,
    CodAlmoxarifadoUG10 int,
    TempoAquisicao int,
    TempoReAquisicao int,
    QtdEstoque float,
    QtdPedidoCompra float,
    QtdPedidoVenda float,
    GiroMensal float,
    QtdMinimo float,
    QtdReposicao float,
    QtdMinimoCalc float,
    QtdReposicaoCalc float,
    QtdAquisicao float,
    QtdAquisicaoCalc float,
    TabelaPreco bit,
    TipoICMSSubst int,
    ICMSSubst float,
    ICMSSubstituicao bit,
    TipoIPI int,
    IPI float,
    TipoPIS int,
    PIS float,
    TipoCOFINS int,
    COFINS float,
    IsentoICMS int,
    IsentoIPI bit,
    IsentoPIS bit,
    IsentoCOFINS bit,
    ICMSReducaoBC float,
    ICMSSTReducaoBC float,
    ICMSReducaoBCInter float,
    ICMSSTReducaoBCInter float,
    BaseICMSSTAquisicao float,
    ValorICMSSTAquisicao float,
    CodCSOSN char(3),
    ContaContabil varchar(50),
    CodApuracaoTipo int,
    CodMaterialOrdem int,
    cstIPI int,
    cstIPIent int,
    cstPIS int,
    cstPISent int,
    cstCOFINS int,
    cstCOFINSent int,
    TipoPISST int,
    PISST float,
    IsentoPISST bit,
    TipoCOFINSST int,
    COFINSST float,
    IsentoCOFINSST bit,
    TipoISSQN int,
    ISSQN float,
    IsentoISSQN bit,
    cstISSQN char(1),
    codISSQNItem int,
    TipoII int,
    II float,
    IsentoII int,
    IIBC float,
    IIDesp float,
    IIIOF float,
    DUN varchar(50),
    CodNaturezaReceita int,
    CodContribuicaoSocial int,
    PISUnit float,
    COFINSUnit float,
    PISUnitTipo int,
    COFINSUnitTipo int,
    CodTipoCredito int,
    CodBaseCredito int,
    Receber bit,
    QtdProjecao int,
    Fidelidade bit,
    PDV bit,
    PDVInformaValorTotal bit,
    CodMaterialPai int,
    NivelMarkup int,
    CCAtivo bit,
    cstPDV int,
    ContaCustoCredito varchar(15),
    ContaCustoDebito varchar(15),
    CodNaturezaReceitaCST4 int,
    CodNaturezaReceitaCST5 int,
    CodNaturezaReceitaCST6 int,
    CodNaturezaReceitaCST7 int,
    CodNaturezaReceitaCST8 int,
    CodNaturezaReceitaCST9 int,
    VenderFracionada bit,
    ICMSReducaoBCRN bit,
    ICMSReducaoBCPB bit,
    ICMSReducaoBCPE bit,
    ICMSReducaoBCCE bit,
    ICMSReducaoBCPI bit,
    ICMSReducaoBCMA bit,
    ICMSReducaoBCSE bit,
    ICMSReducaoBCAL bit,
    ICMSReducaoBCBA bit,
    ICMSReducaoBCRJ bit,
    ICMSReducaoBCSP bit,
    ICMSReducaoBCMG bit,
    ICMSReducaoBCES bit,
    ICMSReducaoBCRS bit,
    ICMSReducaoBCPR bit,
    ICMSReducaoBCSC bit,
    ICMSReducaoBCGO bit,
    ICMSReducaoBCDF bit,
    ICMSReducaoBCMT bit,
    ICMSReducaoBCMS bit,
    ICMSReducaoBCTO bit,
    ICMSReducaoBCAM bit,
    ICMSReducaoBCPA bit,
    ICMSReducaoBCAC bit,
    ICMSReducaoBCRO bit,
    ICMSReducaoBCRR bit,
    ICMSReducaoBCAP bit,
    ModoPreparo text,
    Brix varchar(100),
    Ph varchar(100),
    CodClassificadorVolume int,
    QtdPedidoBonAva float,
    CodPlanoContabil varchar(20),
    ProducaoConsumo char(1),
    CodCEST varchar(7),
    Medicamento bit,
    PrecoMaximo float,
    CodigoAnvisa varchar(20),
    ContaCustoCredito1 varchar(15),
    ContaCustoDebito1 varchar(15),
    ContaCustoCredito2 varchar(15),
    ContaCustoDebito2 varchar(15),
    ContaCustoCredito3 varchar(15),
    ContaCustoDebito3 varchar(15),
    ContaCustoCredito4 varchar(15),
    ContaCustoDebito4 varchar(15),
    CodAlmoxarifadoUG11 int,
    CodAlmoxarifadoUG12 int,
    CodAlmoxarifadoUG13 int,
    CodAlmoxarifadoUG14 int,
    CodAlmoxarifadoUG15 int,
    CodAlmoxarifadoUG16 int,
    CodAlmoxarifadoUG17 int,
    CodAlmoxarifadoUG18 int,
    CodAlmoxarifadoUG19 int,
    CodAlmoxarifadoUG20 int,
    ProducaoDeduzirCusto bit,
    EXTIPI int,
    Precificacao char(1),
    Material3 varchar(120),
    PesagemObrigatoria bit,
    SPED bit,
    MixPositivacao bit,
    CestaBasica bit,
    CodMaterialANP int,
    TabelaReferencia char(1),
    CodMaterialRetornavel int,
    UnidEmbMaterialRetornavel int,
    CodVeiculoServicoGrupo int,
    Voucher bit,
    CodMaterialVincVoucher int,
    RetencaoCSLL float,
    RetencaoIRRF float,
    RetencaoPrev float,
    CodRestauranteFila int,
    TipoIS int,
    ISAliquota float,
    ISAliquotaUnit float,
    ISUnidadeTrib varchar(10),
    ISQtdTrib float,
    TipoIBSCBS int,
    CBS float,
    CBSDif float,
    CBSDevolucao float,
    CBSRedAliq float,
    CBSMonoAliquotaUnit float,
    CBSMonoAdRemIBS float,
    CBSMonoAdRemCBS float,
    TribRegCstIBSCBS int,
    TribRegCstIBSCBSClassTrib int,
    TribRegAliquotaCBS float,
    TribRegAliquotaIBSUF float,
    TribRegAliquotaIBSMun float,
    CBSMonoRetAdRemIBS float,
    CBSMonoRetAdRemCBS float,
    cCredPres int,
    pIBSCredPres float,
    pIBSCredPresCondSus float,
    pCBSCredPres float,
    pCBSCredPresCondSus float,
    competApur varchar(10),
    tpCredPresIBSZFM int,
    pCredPresIBSZFM float,
    BonificacaoBloqueio bit,
    PISReducaoBC float,
    COFINSReducaoBC float,
    PRIMARY KEY (CodMaterial)
);

CREATE TABLE dbo.MaterialANP (
    CodMaterialANP int,
    MaterialANP varchar(100),
    PRIMARY KEY (CodMaterialANP)
);

CREATE TABLE dbo.MaterialAut (
    CodMaterialAut int,
    CodMaterial int,
    CPFCNPJ varchar(20),
    PRIMARY KEY (CodMaterialAut)
);

CREATE TABLE dbo.MaterialBonusVolume (
    CodMaterialBonusVolume int,
    CodMaterial int,
    VolumeInicial int,
    VolumeFinal int,
    Bonus float,
    PRIMARY KEY (CodMaterialBonusVolume)
);

CREATE TABLE dbo.MaterialComissao (
    CodMaterial int,
    Tabela1 float,
    Tabela2 float,
    Tabela3 float,
    Tabela4 float,
    Tabela5 float,
    Tabela6 float,
    Tabela7 float,
    Tabela8 float,
    Tabela9 float,
    Tabela10 float,
    Tabela11 float,
    Tabela12 float,
    Tabela13 float,
    Tabela14 float,
    Tabela15 float,
    Tabela16 float,
    Tabela17 float,
    Tabela18 float,
    Tabela19 float,
    Tabela20 float,
    Tabela21 float,
    Tabela22 float,
    Tabela23 float,
    Tabela24 float,
    Tabela25 float,
    Tabela26 float,
    Tabela27 float,
    Tabela28 float,
    Tabela29 float,
    Tabela30 float,
    Tabela31 float,
    Tabela32 float,
    Tabela33 float,
    Tabela34 float,
    Tabela35 float,
    Tabela36 float,
    Tabela37 float,
    Tabela38 float,
    Tabela39 float,
    Tabela40 float,
    Tabela41 float,
    Tabela42 float,
    Tabela43 float,
    Tabela44 float,
    Tabela45 float,
    Tabela46 float,
    Tabela47 float,
    Tabela48 float,
    Tabela49 float,
    Tabela50 float,
    Tipo1 int,
    Tipo2 int,
    Tipo3 int,
    Tipo4 int,
    Tipo5 int,
    Tipo6 int,
    Tipo7 int,
    Tipo8 int,
    Tipo9 int,
    Tipo10 int,
    Tipo11 int,
    Tipo12 int,
    Tipo13 int,
    Tipo14 int,
    Tipo15 int,
    Tipo16 int,
    Tipo17 int,
    Tipo18 int,
    Tipo19 int,
    Tipo20 int,
    Tipo21 int,
    Tipo22 int,
    Tipo23 int,
    Tipo24 int,
    Tipo25 int,
    Tipo26 int,
    Tipo27 int,
    Tipo28 int,
    Tipo29 int,
    Tipo30 int,
    Tipo31 int,
    Tipo32 int,
    Tipo33 int,
    Tipo34 int,
    Tipo35 int,
    Tipo36 int,
    Tipo37 int,
    Tipo38 int,
    Tipo39 int,
    Tipo40 int,
    Tipo41 int,
    Tipo42 int,
    Tipo43 int,
    Tipo44 int,
    Tipo45 int,
    Tipo46 int,
    Tipo47 int,
    Tipo48 int,
    Tipo49 int,
    Tipo50 int,
    PRIMARY KEY (CodMaterial)
);

CREATE TABLE dbo.MaterialComissaoAnual (
    CodMaterial int,
    Tabela1 float,
    Tabela2 float,
    Tabela3 float,
    Tabela4 float,
    Tabela5 float,
    Tabela6 float,
    Tabela7 float,
    Tabela8 float,
    Tabela9 float,
    Tabela10 float,
    Tabela101 float,
    Tabela102 float,
    Tabela103 float,
    Tabela104 float,
    Tabela105 float,
    Tabela106 float,
    Tabela107 float,
    Tabela108 float,
    Tabela109 float,
    Tabela110 float,
    PRIMARY KEY (CodMaterial)
);

CREATE TABLE dbo.MaterialCusto (
    UnidGestora int,
    CodMaterial int,
    UltimoCusto float,
    CustoMedio float,
    UltimoCustoBruto float,
    CustoMedioBruto float,
    CustoMedioProd float,
    UltimoCustoProd float,
    PRIMARY KEY (UnidGestora, CodMaterial)
);

CREATE TABLE dbo.MaterialCustoProducaoLog (
    codigo int,
    data datetime,
    operacao varchar(50),
    PRIMARY KEY (codigo)
);

CREATE TABLE dbo.MaterialDensidade (
    CodMaterialDensidade int,
    MaterialDensidade varchar(50),
    PRIMARY KEY (CodMaterialDensidade)
);

CREATE TABLE dbo.MaterialDescricao (
    CodMaterialDescricao int,
    MaterialDescricao varchar(50),
    PRIMARY KEY (CodMaterialDescricao)
);

CREATE TABLE dbo.MaterialEficiencia (
    CodMaterial int,
    CodLinhaProducao int,
    QtdEficiencia float
);

CREATE TABLE dbo.MaterialEmbalagem (
    CodMaterial int,
    CodEmbalagem int,
    Ativo bit,
    Padrao bit,
    Venda bit,
    Exportar bit,
    CodigoBarra varchar(50),
    PDV bit,
    Integrar bit,
    Romaneio bit,
    PRIMARY KEY (CodMaterial, CodEmbalagem)
);

CREATE TABLE dbo.MaterialEstoqueMinimo (
    CodMaterial int,
    UnidGestora int,
    QtdMinimo float,
    QtdMinimoCalc float,
    QtdAquisicao float,
    QtdAquisicaoCalc float,
    QtdReposicao float,
    QtdReposicaoCalc float,
    TempoAquisicao int,
    TempoReAquisicao int,
    PRIMARY KEY (CodMaterial, UnidGestora)
);

CREATE TABLE dbo.MaterialFaturamentoContabil (
    CodMaterial int,
    ContaContabilCredito varchar(15),
    ContaContabilDebito varchar(15),
    ContaICMSCredito varchar(15),
    ContaICMSDebito varchar(15),
    ContaICMSSTCredito varchar(15),
    ContaICMSSTDebito varchar(15),
    ContaIPICredito varchar(15),
    ContaIPIDebito varchar(15),
    ContaPISCredito varchar(15),
    ContaPISDebito varchar(15),
    ContaCOFINSCredito varchar(15),
    ContaCOFINSDebito varchar(15),
    ContaDescontoCredito varchar(15),
    ContaDescontoDebito varchar(15),
    ContaContabilCredito2 varchar(15),
    ContaContabilDebito2 varchar(15),
    ContaICMSCredito2 varchar(15),
    ContaICMSDebito2 varchar(15),
    ContaICMSSTCredito2 varchar(15),
    ContaICMSSTDebito2 varchar(15),
    ContaIPICredito2 varchar(15),
    ContaIPIDebito2 varchar(15),
    ContaPISCredito2 varchar(15),
    ContaPISDebito2 varchar(15),
    ContaCOFINSCredito2 varchar(15),
    ContaCOFINSDebito2 varchar(15),
    ContaDescontoCredito2 varchar(15),
    ContaDescontoDebito2 varchar(15),
    ContaContabilCredito3 varchar(15),
    ContaContabilDebito3 varchar(15),
    ContaICMSCredito3 varchar(15),
    ContaICMSDebito3 varchar(15),
    ContaICMSSTCredito3 varchar(15),
    ContaICMSSTDebito3 varchar(15),
    ContaIPICredito3 varchar(15),
    ContaIPIDebito3 varchar(15),
    ContaPISCredito3 varchar(15),
    ContaPISDebito3 varchar(15),
    ContaCOFINSCredito3 varchar(15),
    ContaCOFINSDebito3 varchar(15),
    ContaDescontoCredito3 varchar(15),
    ContaDescontoDebito3 varchar(15),
    ContaContabilCredito4 varchar(15),
    ContaContabilDebito4 varchar(15),
    ContaICMSCredito4 varchar(15),
    ContaICMSDebito4 varchar(15),
    ContaICMSSTCredito4 varchar(15),
    ContaICMSSTDebito4 varchar(15),
    ContaIPICredito4 varchar(15),
    ContaIPIDebito4 varchar(15),
    ContaPISCredito4 varchar(15),
    ContaPISDebito4 varchar(15),
    ContaCOFINSCredito4 varchar(15),
    ContaCOFINSDebito4 varchar(15),
    ContaDescontoCredito4 varchar(15),
    ContaDescontoDebito4 varchar(15),
    ContaICMSCompraCredito varchar(15),
    ContaICMSCompraDebito varchar(15),
    ContaFreteICMSCredito varchar(15),
    ContaFreteICMSDebito varchar(15),
    ContaIPICompraCredito varchar(15),
    ContaIPICompraDebito varchar(15),
    ContaDescontoCliCredito varchar(15),
    ContaDescontoCliDebito varchar(15),
    ContaDescontoCliCredito2 varchar(15),
    ContaDescontoCliDebito2 varchar(15),
    ContaDescontoCliCredito3 varchar(15),
    ContaDescontoCliDebito3 varchar(15),
    ContaDescontoCliCredito4 varchar(15),
    ContaDescontoCliDebito4 varchar(15),
    PRIMARY KEY (CodMaterial)
);

CREATE TABLE dbo.MaterialFornecedor (
    CodMaterial int,
    CodFornecedor int
);

CREATE TABLE dbo.MaterialHistoricoCusto (
    CodDoc int,
    CodMaterial int,
    CodEmbalagem int,
    Qtd float,
    ValorUnit float,
    ValorUnitBruto float,
    CodFornecedor int,
    Data datetime,
    Status int,
    Ativo bit,
    Sequencia int,
    ValorUnitMedio float,
    ValorUnitBrutoMedio float,
    UsuarioEdicao varchar(50),
    DataEdicao datetime,
    UnidGestora int,
    QtdPerdida float,
    QtdInicial float,
    QtdEmbalagem int,
    CodMaterialHistoricoCusto int,
    PRIMARY KEY (CodMaterialHistoricoCusto)
);

CREATE TABLE dbo.MaterialIBSMun (
    CodIBSMunTabela int,
    CodMaterial int,
    IBSMun float,
    IBSMunPdv float,
    IBSMunDif float,
    IBSMunDevol float,
    IBSMunRedAliq float,
    PRIMARY KEY (CodIBSMunTabela, CodMaterial)
);

CREATE TABLE dbo.MaterialIBSUF (
    CodMaterial int,
    IBSUFRN float,
    IBSUFPB float,
    IBSUFPE float,
    IBSUFCE float,
    IBSUFPI float,
    IBSUFMA float,
    IBSUFSE float,
    IBSUFAL float,
    IBSUFBA float,
    IBSUFRJ float,
    IBSUFSP float,
    IBSUFMG float,
    IBSUFES float,
    IBSUFRS float,
    IBSUFPR float,
    IBSUFSC float,
    IBSUFGO float,
    IBSUFDF float,
    IBSUFMT float,
    IBSUFMS float,
    IBSUFTO float,
    IBSUFAM float,
    IBSUFPA float,
    IBSUFAC float,
    IBSUFRO float,
    IBSUFRR float,
    IBSUFAP float,
    IBSUFEX float,
    IBSUFPdvRN float,
    IBSUFPdvPB float,
    IBSUFPdvPE float,
    IBSUFPdvCE float,
    IBSUFPdvPI float,
    IBSUFPdvMA float,
    IBSUFPdvSE float,
    IBSUFPdvAL float,
    IBSUFPdvBA float,
    IBSUFPdvRJ float,
    IBSUFPdvSP float,
    IBSUFPdvMG float,
    IBSUFPdvES float,
    IBSUFPdvRS float,
    IBSUFPdvPR float,
    IBSUFPdvSC float,
    IBSUFPdvGO float,
    IBSUFPdvDF float,
    IBSUFPdvMT float,
    IBSUFPdvMS float,
    IBSUFPdvTO float,
    IBSUFPdvAM float,
    IBSUFPdvPA float,
    IBSUFPdvAC float,
    IBSUFPdvRO float,
    IBSUFPdvRR float,
    IBSUFPdvAP float,
    IBSUFPdvEX float,
    IBSUFDifRN float,
    IBSUFDifPB float,
    IBSUFDifPE float,
    IBSUFDifCE float,
    IBSUFDifPI float,
    IBSUFDifMA float,
    IBSUFDifSE float,
    IBSUFDifAL float,
    IBSUFDifBA float,
    IBSUFDifRJ float,
    IBSUFDifSP float,
    IBSUFDifMG float,
    IBSUFDifES float,
    IBSUFDifRS float,
    IBSUFDifPR float,
    IBSUFDifSC float,
    IBSUFDifGO float,
    IBSUFDifDF float,
    IBSUFDifMT float,
    IBSUFDifMS float,
    IBSUFDifTO float,
    IBSUFDifAM float,
    IBSUFDifPA float,
    IBSUFDifAC float,
    IBSUFDifRO float,
    IBSUFDifRR float,
    IBSUFDifAP float,
    IBSUFDifEX float,
    IBSUFDevolRN float,
    IBSUFDevolPB float,
    IBSUFDevolPE float,
    IBSUFDevolCE float,
    IBSUFDevolPI float,
    IBSUFDevolMA float,
    IBSUFDevolSE float,
    IBSUFDevolAL float,
    IBSUFDevolBA float,
    IBSUFDevolRJ float,
    IBSUFDevolSP float,
    IBSUFDevolMG float,
    IBSUFDevolES float,
    IBSUFDevolRS float,
    IBSUFDevolPR float,
    IBSUFDevolSC float,
    IBSUFDevolGO float,
    IBSUFDevolDF float,
    IBSUFDevolMT float,
    IBSUFDevolMS float,
    IBSUFDevolTO float,
    IBSUFDevolAM float,
    IBSUFDevolPA float,
    IBSUFDevolAC float,
    IBSUFDevolRO float,
    IBSUFDevolRR float,
    IBSUFDevolAP float,
    IBSUFDevolEX float,
    IBSUFRedAliqRN float,
    IBSUFRedAliqPB float,
    IBSUFRedAliqPE float,
    IBSUFRedAliqCE float,
    IBSUFRedAliqPI float,
    IBSUFRedAliqMA float,
    IBSUFRedAliqSE float,
    IBSUFRedAliqAL float,
    IBSUFRedAliqBA float,
    IBSUFRedAliqRJ float,
    IBSUFRedAliqSP float,
    IBSUFRedAliqMG float,
    IBSUFRedAliqES float,
    IBSUFRedAliqRS float,
    IBSUFRedAliqPR float,
    IBSUFRedAliqSC float,
    IBSUFRedAliqGO float,
    IBSUFRedAliqDF float,
    IBSUFRedAliqMT float,
    IBSUFRedAliqMS float,
    IBSUFRedAliqTO float,
    IBSUFRedAliqAM float,
    IBSUFRedAliqPA float,
    IBSUFRedAliqAC float,
    IBSUFRedAliqRO float,
    IBSUFRedAliqRR float,
    IBSUFRedAliqAP float,
    IBSUFRedAliqEX float,
    PRIMARY KEY (CodMaterial)
);

CREATE TABLE dbo.MaterialICMS (
    CodMaterial int,
    icmsRN float,
    icmsPB float,
    icmsPE float,
    icmsCE float,
    icmsPI float,
    icmsMA float,
    icmsSE float,
    icmsAL float,
    icmsBA float,
    icmsRJ float,
    icmsSP float,
    icmsMG float,
    icmsES float,
    icmsRS float,
    icmsPR float,
    icmsSC float,
    icmsGO float,
    icmsDF float,
    icmsMT float,
    icmsMS float,
    icmsTO float,
    icmsAM float,
    icmsPA float,
    icmsAC float,
    icmsRO float,
    icmsRR float,
    icmsAP float,
    icmsCredRN float,
    icmsCredPB float,
    icmsCredPE float,
    icmsCredCE float,
    icmsCredPI float,
    icmsCredMA float,
    icmsCredSE float,
    icmsCredAL float,
    icmsCredBA float,
    icmsCredRJ float,
    icmsCredSP float,
    icmsCredMG float,
    icmsCredES float,
    icmsCredRS float,
    icmsCredPR float,
    icmsCredSC float,
    icmsCredGO float,
    icmsCredDF float,
    icmsCredMT float,
    icmsCredMS float,
    icmsCredTO float,
    icmsCredAM float,
    icmsCredPA float,
    icmsCredAC float,
    icmsCredRO float,
    icmsCredRR float,
    icmsCredAP float,
    icmsEX float,
    icmsCredEX float,
    icmsPDV float,
    icmsEstadualRN float,
    icmsEstadualPB float,
    icmsEstadualPE float,
    icmsEstadualCE float,
    icmsEstadualPI float,
    icmsEstadualMA float,
    icmsEstadualSE float,
    icmsEstadualAL float,
    icmsEstadualBA float,
    icmsEstadualRJ float,
    icmsEstadualSP float,
    icmsEstadualMG float,
    icmsEstadualES float,
    icmsEstadualRS float,
    icmsEstadualPR float,
    icmsEstadualSC float,
    icmsEstadualGO float,
    icmsEstadualDF float,
    icmsEstadualMT float,
    icmsEstadualMS float,
    icmsEstadualTO float,
    icmsEstadualAM float,
    icmsEstadualPA float,
    icmsEstadualAC float,
    icmsEstadualRO float,
    icmsEstadualRR float,
    icmsEstadualAP float,
    icmsEstadualEX float,
    icmsInterEstadualRN float,
    icmsInterEstadualPB float,
    icmsInterEstadualPE float,
    icmsInterEstadualCE float,
    icmsInterEstadualPI float,
    icmsInterEstadualMA float,
    icmsInterEstadualSE float,
    icmsInterEstadualAL float,
    icmsInterEstadualBA float,
    icmsInterEstadualRJ float,
    icmsInterEstadualSP float,
    icmsInterEstadualMG float,
    icmsInterEstadualES float,
    icmsInterEstadualRS float,
    icmsInterEstadualPR float,
    icmsInterEstadualSC float,
    icmsInterEstadualGO float,
    icmsInterEstadualDF float,
    icmsInterEstadualMT float,
    icmsInterEstadualMS float,
    icmsInterEstadualTO float,
    icmsInterEstadualAM float,
    icmsInterEstadualPA float,
    icmsInterEstadualAC float,
    icmsInterEstadualRO float,
    icmsInterEstadualRR float,
    icmsInterEstadualAP float,
    icmsInterEstadualEX float,
    icmsFCPRN float,
    icmsFCPPB float,
    icmsFCPPE float,
    icmsFCPCE float,
    icmsFCPPI float,
    icmsFCPMA float,
    icmsFCPSE float,
    icmsFCPAL float,
    icmsFCPBA float,
    icmsFCPRJ float,
    icmsFCPSP float,
    icmsFCPMG float,
    icmsFCPES float,
    icmsFCPRS float,
    icmsFCPPR float,
    icmsFCPSC float,
    icmsFCPGO float,
    icmsFCPDF float,
    icmsFCPMT float,
    icmsFCPMS float,
    icmsFCPTO float,
    icmsFCPAM float,
    icmsFCPPA float,
    icmsFCPAC float,
    icmsFCPRO float,
    icmsFCPRR float,
    icmsFCPAP float,
    icmsFCPEX float,
    icmsDifRN float,
    icmsDifPB float,
    icmsDifPE float,
    icmsDifCE float,
    icmsDifPI float,
    icmsDifMA float,
    icmsDifSE float,
    icmsDifAL float,
    icmsDifBA float,
    icmsDifRJ float,
    icmsDifSP float,
    icmsDifMG float,
    icmsDifES float,
    icmsDifRS float,
    icmsDifPR float,
    icmsDifSC float,
    icmsDifGO float,
    icmsDifDF float,
    icmsDifMT float,
    icmsDifMS float,
    icmsDifTO float,
    icmsDifAM float,
    icmsDifPA float,
    icmsDifAC float,
    icmsDifRO float,
    icmsDifRR float,
    icmsDifAP float,
    icmsDifEX float,
    PRIMARY KEY (CodMaterial)
);

CREATE TABLE dbo.MaterialICMSSubst (
    CodMaterial int,
    CodIcmsSubstTabela int,
    IcmsSubstRN float,
    IcmsSubstPB float,
    IcmsSubstPE float,
    IcmsSubstCE float,
    IcmsSubstPI float,
    IcmsSubstMA float,
    IcmsSubstSE float,
    IcmsSubstAL float,
    IcmsSubstBA float,
    IcmsSubstRJ float,
    IcmsSubstSP float,
    IcmsSubstMG float,
    IcmsSubstES float,
    IcmsSubstRS float,
    IcmsSubstPR float,
    IcmsSubstSC float,
    IcmsSubstGO float,
    IcmsSubstDF float,
    IcmsSubstMT float,
    IcmsSubstMS float,
    IcmsSubstTO float,
    IcmsSubstAM float,
    IcmsSubstPA float,
    IcmsSubstAC float,
    IcmsSubstRO float,
    IcmsSubstRR float,
    IcmsSubstAP float,
    TipoIcmsSubstRN int,
    TipoIcmsSubstPB int,
    TipoIcmsSubstPE int,
    TipoIcmsSubstCE int,
    TipoIcmsSubstPI int,
    TipoIcmsSubstMA int,
    TipoIcmsSubstSE int,
    TipoIcmsSubstAL int,
    TipoIcmsSubstBA int,
    TipoIcmsSubstRJ int,
    TipoIcmsSubstSP int,
    TipoIcmsSubstMG int,
    TipoIcmsSubstES int,
    TipoIcmsSubstRS int,
    TipoIcmsSubstPR int,
    TipoIcmsSubstSC int,
    TipoIcmsSubstGO int,
    TipoIcmsSubstDF int,
    TipoIcmsSubstMT int,
    TipoIcmsSubstMS int,
    TipoIcmsSubstTO int,
    TipoIcmsSubstAM int,
    TipoIcmsSubstPA int,
    TipoIcmsSubstAC int,
    TipoIcmsSubstRO int,
    TipoIcmsSubstRR int,
    TipoIcmsSubstAP int,
    IcmsSubstEX float,
    TipoIcmsSubstEX int,
    CodEstado char(2),
    IcmsSubst2RN float,
    IcmsSubst2PB float,
    IcmsSubst2PE float,
    IcmsSubst2CE float,
    IcmsSubst2PI float,
    IcmsSubst2MA float,
    IcmsSubst2SE float,
    IcmsSubst2AL float,
    IcmsSubst2BA float,
    IcmsSubst2RJ float,
    IcmsSubst2SP float,
    IcmsSubst2MG float,
    IcmsSubst2ES float,
    IcmsSubst2RS float,
    IcmsSubst2PR float,
    IcmsSubst2SC float,
    IcmsSubst2GO float,
    IcmsSubst2DF float,
    IcmsSubst2MT float,
    IcmsSubst2MS float,
    IcmsSubst2TO float,
    IcmsSubst2AM float,
    IcmsSubst2PA float,
    IcmsSubst2AC float,
    IcmsSubst2RO float,
    IcmsSubst2RR float,
    IcmsSubst2AP float,
    IcmsSubst2EX float,
    TipoIcmsFuncepRN int,
    TipoIcmsFuncepPB int,
    TipoIcmsFuncepPE int,
    TipoIcmsFuncepCE int,
    TipoIcmsFuncepPI int,
    TipoIcmsFuncepMA int,
    TipoIcmsFuncepSE int,
    TipoIcmsFuncepAL int,
    TipoIcmsFuncepBA int,
    TipoIcmsFuncepRJ int,
    TipoIcmsFuncepSP int,
    TipoIcmsFuncepMG int,
    TipoIcmsFuncepES int,
    TipoIcmsFuncepRS int,
    TipoIcmsFuncepPR int,
    TipoIcmsFuncepSC int,
    TipoIcmsFuncepGO int,
    TipoIcmsFuncepDF int,
    TipoIcmsFuncepMT int,
    TipoIcmsFuncepMS int,
    TipoIcmsFuncepTO int,
    TipoIcmsFuncepAM int,
    TipoIcmsFuncepPA int,
    TipoIcmsFuncepAC int,
    TipoIcmsFuncepRO int,
    TipoIcmsFuncepRR int,
    TipoIcmsFuncepAP int,
    TipoIcmsFuncepEX int,
    IcmsFuncepRN float,
    IcmsFuncepPB float,
    IcmsFuncepPE float,
    IcmsFuncepCE float,
    IcmsFuncepPI float,
    IcmsFuncepMA float,
    IcmsFuncepSE float,
    IcmsFuncepAL float,
    IcmsFuncepBA float,
    IcmsFuncepRJ float,
    IcmsFuncepSP float,
    IcmsFuncepMG float,
    IcmsFuncepES float,
    IcmsFuncepRS float,
    IcmsFuncepPR float,
    IcmsFuncepSC float,
    IcmsFuncepGO float,
    IcmsFuncepDF float,
    IcmsFuncepMT float,
    IcmsFuncepMS float,
    IcmsFuncepTO float,
    IcmsFuncepAM float,
    IcmsFuncepPA float,
    IcmsFuncepAC float,
    IcmsFuncepRO float,
    IcmsFuncepRR float,
    IcmsFuncepAP float,
    IcmsFuncepEX float,
    PRIMARY KEY (CodMaterial, CodIcmsSubstTabela, CodEstado)
);

CREATE TABLE dbo.MaterialImagem (
    CodMaterial int,
    Imagem image,
    PRIMARY KEY (CodMaterial)
);

CREATE TABLE dbo.MaterialImposto (
    CodMaterial int,
    Tabela1 float,
    Tabela2 float,
    Tabela3 float,
    Tabela4 float,
    Tabela5 float,
    Tabela6 float,
    Tabela7 float,
    Tabela8 float,
    Tabela9 float,
    Tabela10 float,
    Tabela11 float,
    Tabela12 float,
    Tabela13 float,
    Tabela14 float,
    Tabela15 float,
    Tabela16 float,
    Tabela17 float,
    Tabela18 float,
    Tabela19 float,
    Tabela20 float,
    Tabela21 float,
    Tabela22 float,
    Tabela23 float,
    Tabela24 float,
    Tabela25 float,
    Tabela26 float,
    Tabela27 float,
    Tabela28 float,
    Tabela29 float,
    Tabela30 float,
    Tabela31 float,
    Tabela32 float,
    Tabela33 float,
    Tabela34 float,
    Tabela35 float,
    Tabela36 float,
    Tabela37 float,
    Tabela38 float,
    Tabela39 float,
    Tabela40 float,
    Tabela41 float,
    Tabela42 float,
    Tabela43 float,
    Tabela44 float,
    Tabela45 float,
    Tabela46 float,
    Tabela47 float,
    Tabela48 float,
    Tabela49 float,
    Tabela50 float,
    Tabela51 float,
    Tabela52 float,
    Tabela53 float,
    Tabela54 float,
    Tabela55 float,
    Tabela56 float,
    Tabela57 float,
    Tabela58 float,
    Tabela59 float,
    Tabela60 float,
    Tabela61 float,
    Tabela62 float,
    Tabela63 float,
    Tabela64 float,
    Tabela65 float,
    Tabela66 float,
    Tabela67 float,
    Tabela68 float,
    Tabela69 float,
    Tabela70 float,
    Tabela71 float,
    Tabela72 float,
    Tabela73 float,
    Tabela74 float,
    Tabela75 float,
    Tabela76 float,
    Tabela77 float,
    Tabela78 float,
    Tabela79 float,
    Tabela80 float,
    Tabela81 float,
    Tabela82 float,
    Tabela83 float,
    Tabela84 float,
    Tabela85 float,
    Tabela86 float,
    Tabela87 float,
    Tabela88 float,
    Tabela89 float,
    Tabela90 float,
    Tabela91 float,
    Tabela92 float,
    Tabela93 float,
    Tabela94 float,
    Tabela95 float,
    Tabela96 float,
    Tabela97 float,
    Tabela98 float,
    Tabela99 float,
    Tabela100 float,
    Tabela101 float,
    Tabela102 float,
    Tabela103 float,
    Tabela104 float,
    Tabela105 float,
    Tabela106 float,
    Tabela107 float,
    Tabela108 float,
    Tabela109 float,
    Tabela110 float,
    Tabela111 float,
    Tabela112 float,
    Tabela113 float,
    Tabela114 float,
    Tabela115 float,
    Tabela116 float,
    Tabela117 float,
    Tabela118 float,
    Tabela119 float,
    Tabela120 float,
    Tabela121 float,
    Tabela122 float,
    Tabela123 float,
    Tabela124 float,
    Tabela125 float,
    Tabela126 float,
    Tabela127 float,
    Tabela128 float,
    Tabela129 float,
    Tabela130 float,
    Tabela131 float,
    Tabela132 float,
    Tabela133 float,
    Tabela134 float,
    Tabela135 float,
    Tabela136 float,
    Tabela137 float,
    Tabela138 float,
    Tabela139 float,
    Tabela140 float,
    Tabela141 float,
    Tabela142 float,
    Tabela143 float,
    Tabela144 float,
    Tabela145 float,
    Tabela146 float,
    Tabela147 float,
    Tabela148 float,
    Tabela149 float,
    Tabela150 float,
    ICMSS1 float,
    ICMSS2 float,
    ICMSS3 float,
    ICMSS4 float,
    ICMSS5 float,
    ICMSS6 float,
    ICMSS7 float,
    ICMSS8 float,
    ICMSS9 float,
    ICMSS10 float,
    ICMSS11 float,
    ICMSS12 float,
    ICMSS13 float,
    ICMSS14 float,
    ICMSS15 float,
    ICMSS16 float,
    ICMSS17 float,
    ICMSS18 float,
    ICMSS19 float,
    ICMSS20 float,
    ICMSS21 float,
    ICMSS22 float,
    ICMSS23 float,
    ICMSS24 float,
    ICMSS25 float,
    ICMSS26 float,
    ICMSS27 float,
    ICMSS28 float,
    ICMSS29 float,
    ICMSS30 float,
    ICMSS31 float,
    ICMSS32 float,
    ICMSS33 float,
    ICMSS34 float,
    ICMSS35 float,
    ICMSS36 float,
    ICMSS37 float,
    ICMSS38 float,
    ICMSS39 float,
    ICMSS40 float,
    ICMSS41 float,
    ICMSS42 float,
    ICMSS43 float,
    ICMSS44 float,
    ICMSS45 float,
    ICMSS46 float,
    ICMSS47 float,
    ICMSS48 float,
    ICMSS49 float,
    ICMSS50 float,
    ICMSS51 float,
    ICMSS52 float,
    ICMSS53 float,
    ICMSS54 float,
    ICMSS55 float,
    ICMSS56 float,
    ICMSS57 float,
    ICMSS58 float,
    ICMSS59 float,
    ICMSS60 float,
    ICMSS61 float,
    ICMSS62 float,
    ICMSS63 float,
    ICMSS64 float,
    ICMSS65 float,
    ICMSS66 float,
    ICMSS67 float,
    ICMSS68 float,
    ICMSS69 float,
    ICMSS70 float,
    ICMSS71 float,
    ICMSS72 float,
    ICMSS73 float,
    ICMSS74 float,
    ICMSS75 float,
    ICMSS76 float,
    ICMSS77 float,
    ICMSS78 float,
    ICMSS79 float,
    ICMSS80 float,
    ICMSS81 float,
    ICMSS82 float,
    ICMSS83 float,
    ICMSS84 float,
    ICMSS85 float,
    ICMSS86 float,
    ICMSS87 float,
    ICMSS88 float,
    ICMSS89 float,
    ICMSS90 float,
    ICMSS91 float,
    ICMSS92 float,
    ICMSS93 float,
    ICMSS94 float,
    ICMSS95 float,
    ICMSS96 float,
    ICMSS97 float,
    ICMSS98 float,
    ICMSS99 float,
    ICMSS100 float,
    ICMSS101 float,
    ICMSS102 float,
    ICMSS103 float,
    ICMSS104 float,
    ICMSS105 float,
    ICMSS106 float,
    ICMSS107 float,
    ICMSS108 float,
    ICMSS109 float,
    ICMSS110 float,
    ICMSS111 float,
    ICMSS112 float,
    ICMSS113 float,
    ICMSS114 float,
    ICMSS115 float,
    ICMSS116 float,
    ICMSS117 float,
    ICMSS118 float,
    ICMSS119 float,
    ICMSS120 float,
    ICMSS121 float,
    ICMSS122 float,
    ICMSS123 float,
    ICMSS124 float,
    ICMSS125 float,
    ICMSS126 float,
    ICMSS127 float,
    ICMSS128 float,
    ICMSS129 float,
    ICMSS130 float,
    ICMSS131 float,
    ICMSS132 float,
    ICMSS133 float,
    ICMSS134 float,
    ICMSS135 float,
    ICMSS136 float,
    ICMSS137 float,
    ICMSS138 float,
    ICMSS139 float,
    ICMSS140 float,
    ICMSS141 float,
    ICMSS142 float,
    ICMSS143 float,
    ICMSS144 float,
    ICMSS145 float,
    ICMSS146 float,
    ICMSS147 float,
    ICMSS148 float,
    ICMSS149 float,
    ICMSS150 float,
    IPI1 float,
    IPI2 float,
    IPI3 float,
    IPI4 float,
    IPI5 float,
    IPI6 float,
    IPI7 float,
    IPI8 float,
    IPI9 float,
    IPI10 float,
    IPI11 float,
    IPI12 float,
    IPI13 float,
    IPI14 float,
    IPI15 float,
    IPI16 float,
    IPI17 float,
    IPI18 float,
    IPI19 float,
    IPI20 float,
    IPI21 float,
    IPI22 float,
    IPI23 float,
    IPI24 float,
    IPI25 float,
    IPI26 float,
    IPI27 float,
    IPI28 float,
    IPI29 float,
    IPI30 float,
    IPI31 float,
    IPI32 float,
    IPI33 float,
    IPI34 float,
    IPI35 float,
    IPI36 float,
    IPI37 float,
    IPI38 float,
    IPI39 float,
    IPI40 float,
    IPI41 float,
    IPI42 float,
    IPI43 float,
    IPI44 float,
    IPI45 float,
    IPI46 float,
    IPI47 float,
    IPI48 float,
    IPI49 float,
    IPI50 float,
    IPI51 float,
    IPI52 float,
    IPI53 float,
    IPI54 float,
    IPI55 float,
    IPI56 float,
    IPI57 float,
    IPI58 float,
    IPI59 float,
    IPI60 float,
    IPI61 float,
    IPI62 float,
    IPI63 float,
    IPI64 float,
    IPI65 float,
    IPI66 float,
    IPI67 float,
    IPI68 float,
    IPI69 float,
    IPI70 float,
    IPI71 float,
    IPI72 float,
    IPI73 float,
    IPI74 float,
    IPI75 float,
    IPI76 float,
    IPI77 float,
    IPI78 float,
    IPI79 float,
    IPI80 float,
    IPI81 float,
    IPI82 float,
    IPI83 float,
    IPI84 float,
    IPI85 float,
    IPI86 float,
    IPI87 float,
    IPI88 float,
    IPI89 float,
    IPI90 float,
    IPI91 float,
    IPI92 float,
    IPI93 float,
    IPI94 float,
    IPI95 float,
    IPI96 float,
    IPI97 float,
    IPI98 float,
    IPI99 float,
    IPI100 float,
    IPI101 float,
    IPI102 float,
    IPI103 float,
    IPI104 float,
    IPI105 float,
    IPI106 float,
    IPI107 float,
    IPI108 float,
    IPI109 float,
    IPI110 float,
    IPI111 float,
    IPI112 float,
    IPI113 float,
    IPI114 float,
    IPI115 float,
    IPI116 float,
    IPI117 float,
    IPI118 float,
    IPI119 float,
    IPI120 float,
    IPI121 float,
    IPI122 float,
    IPI123 float,
    IPI124 float,
    IPI125 float,
    IPI126 float,
    IPI127 float,
    IPI128 float,
    IPI129 float,
    IPI130 float,
    IPI131 float,
    IPI132 float,
    IPI133 float,
    IPI134 float,
    IPI135 float,
    IPI136 float,
    IPI137 float,
    IPI138 float,
    IPI139 float,
    IPI140 float,
    IPI141 float,
    IPI142 float,
    IPI143 float,
    IPI144 float,
    IPI145 float,
    IPI146 float,
    IPI147 float,
    IPI148 float,
    IPI149 float,
    IPI150 float
);

CREATE TABLE dbo.MaterialIntegracaoContabil (
    CodGrupo int,
    CodMaterial int,
    CodIntegContabilConfigNF int,
    CodNotaFiscalIntegracaoTipo int,
    CodNotaFiscalIntegracaoCampos int,
    ContaContabilC varchar(100),
    ContaContabilD varchar(100),
    CodCliente int,
    PRIMARY KEY (CodGrupo, CodMaterial, CodIntegContabilConfigNF, CodNotaFiscalIntegracaoTipo, CodNotaFiscalIntegracaoCampos, CodCliente)
);

CREATE TABLE dbo.MaterialIntegracaoContabilDocumento (
    CodGrupo int,
    CodMaterial int,
    CodDocumentoIntegracaoTipo int,
    CodDocumentoIntegracaoCampos int,
    CodIntegContabilConfigDocumento int,
    ContaContabilC varchar(100),
    ContaContabilD varchar(100),
    PRIMARY KEY (CodGrupo, CodMaterial, CodDocumentoIntegracaoTipo, CodDocumentoIntegracaoCampos, CodIntegContabilConfigDocumento)
);

CREATE TABLE dbo.MaterialItens (
    CodMaterial int,
    CodItem int,
    CodSequencia int,
    Qtd float,
    Altura float,
    Largura float,
    QtdUnid float,
    Expandir bit,
    Observacao varchar(100),
    CodItemSub int,
    PRIMARY KEY (CodMaterial, CodItem, CodSequencia)
);

CREATE TABLE dbo.MaterialLote (
    CodLote int,
    CodMaterial int,
    Lote varchar(50),
    Data datetime,
    Ativo bit,
    DataFabricacao datetime,
    PRIMARY KEY (CodLote)
);

CREATE TABLE dbo.MaterialMarkupCampos (
    Campo varchar(100),
    Descricao varchar(100),
    CV char(1),
    Fator float,
    Ordem int,
    PRIMARY KEY (Campo)
);

CREATE TABLE dbo.MaterialMarkupValor (
    CodMaterial int,
    Campo varchar(100),
    Valor float,
    PRIMARY KEY (CodMaterial, Campo)
);

CREATE TABLE dbo.MaterialNaturezaOpFiscal (
    CodMaterial int,
    CodNaturezaOpFiscal1 int,
    CodNaturezaOpFiscal2 int,
    CodNaturezaOpFiscal3 int,
    CodNaturezaOpFiscal4 int,
    CodNaturezaOpFiscal5 int,
    CodNaturezaOpFiscal6 int,
    CodNaturezaOpFiscal7 int,
    CodNaturezaOpFiscal8 int,
    CodNaturezaOpFiscal9 int,
    CodNaturezaOpFiscal10 int,
    CodNaturezaOpFiscal11 int,
    CodNaturezaOpFiscal12 int,
    CodNaturezaOpFiscal13 int,
    CodNaturezaOpFiscal14 int,
    CodNaturezaOpFiscal15 int,
    CodNaturezaOpFiscal16 int,
    CodNaturezaOpFiscal17 int,
    CodNaturezaOpFiscal18 int,
    CodNaturezaOpFiscal19 int,
    CodNaturezaOpFiscal20 int,
    CodNaturezaOpFiscal21 int,
    CodNaturezaOpFiscal22 int,
    CodNaturezaOpFiscal23 int,
    CodNaturezaOpFiscal24 int,
    CodNaturezaOpFiscal25 int,
    CodNaturezaOpFiscal26 int,
    CodNaturezaOpFiscal27 int,
    CodNaturezaOpFiscal28 int,
    CodNaturezaOpFiscal29 int,
    CodNaturezaOpFiscal30 int,
    CodNaturezaOpFiscal31 int,
    CodNaturezaOpFiscal32 int,
    CodNaturezaOpFiscal33 int,
    CodNaturezaOpFiscal34 int,
    CodNaturezaOpFiscal35 int,
    CodNaturezaOpFiscal36 int,
    CodNaturezaOpFiscal37 int,
    CodNaturezaOpFiscal38 int,
    CodNaturezaOpFiscal39 int,
    CodNaturezaOpFiscal40 int,
    CodNaturezaOpFiscal41 int,
    CodNaturezaOpFiscal42 int,
    CodNaturezaOpFiscal43 int,
    CodNaturezaOpFiscal44 int,
    CodNaturezaOpFiscal45 int,
    CodNaturezaOpFiscal46 int,
    CodNaturezaOpFiscal47 int,
    CodNaturezaOpFiscal48 int,
    CodNaturezaOpFiscal49 int,
    CodNaturezaOpFiscal50 int,
    PRIMARY KEY (CodMaterial)
);

CREATE TABLE dbo.MaterialNaturezaOpFiscalCompra (
    CodMaterial int,
    CodNaturezaOperacao int,
    CSTICMS int,
    CSTIPI int,
    CSTPIS int,
    TipoPIS int,
    ALIQPIS float,
    CSTCOFINS int,
    TipoCOFINS int,
    ALIQCOFINS float,
    CSOSimples int,
    CodNaturezaOpFiscal int,
    cstIBSCBS int,
    cstIBSCBSClassTrib int,
    IsentoIBSCBS bit,
    ReducaoIBSCBS bit,
    CBSRedAliq float,
    IBSUFRedAliq float,
    IBSMunRedAliq float,
    PRIMARY KEY (CodMaterial, CodNaturezaOperacao)
);

CREATE TABLE dbo.MaterialNaturezaOpFiscalVenda (
    CodMaterial int,
    CodNaturezaOperacao int,
    CSTICMS int,
    CSTIPI int,
    TipoIPI int,
    ALIQIPI float,
    CSTPIS int,
    TipoPIS int,
    ALIQPIS float,
    CSTCOFINS int,
    TipoCOFINS int,
    ALIQCOFINS float,
    CSOSimples int,
    IsentoICMS bit,
    IsentoICMSSubst bit,
    IsentoIPI bit,
    IsentoPIS bit,
    IsentoCOFINS bit,
    CodNaturezaOpFiscal int,
    Vender bit,
    cstIBSCBS int,
    cstIBSCBSClassTrib int,
    IsentoIBSCBS bit,
    ReducaoIBSCBS bit,
    CBSRedAliq float,
    IBSUFRedAliq float,
    IBSMunRedAliq float,
    PRIMARY KEY (CodMaterial, CodNaturezaOperacao)
);

CREATE TABLE dbo.MaterialObjetivo (
    Mes int,
    CodMaterial int,
    Tabela1 float,
    Tabela2 float,
    Tabela3 float,
    Tabela4 float,
    Tabela5 float,
    Tabela6 float,
    Tabela7 float,
    Tabela8 float,
    Tabela9 float,
    Tabela10 float,
    Tabela11 float,
    Tabela12 float,
    Tabela13 float,
    Tabela14 float,
    Tabela15 float,
    Tabela16 float,
    Tabela17 float,
    Tabela18 float,
    Tabela19 float,
    Tabela20 float,
    Tabela21 float,
    Tabela22 float,
    Tabela23 float,
    Tabela24 float,
    Tabela25 float,
    Tabela26 float,
    Tabela27 float,
    Tabela28 float,
    Tabela29 float,
    Tabela30 float,
    Tabela31 float,
    Tabela32 float,
    Tabela33 float,
    Tabela34 float,
    Tabela35 float,
    Tabela36 float,
    Tabela37 float,
    Tabela38 float,
    Tabela39 float,
    Tabela40 float,
    Tabela41 float,
    Tabela42 float,
    Tabela43 float,
    Tabela44 float,
    Tabela45 float,
    Tabela46 float,
    Tabela47 float,
    Tabela48 float,
    Tabela49 float,
    Tabela50 float,
    Ano int,
    Tabela51 float,
    Tabela52 float,
    Tabela53 float,
    Tabela54 float,
    Tabela55 float,
    Tabela56 float,
    Tabela57 float,
    Tabela58 float,
    Tabela59 float,
    Tabela60 float,
    Tabela61 float,
    Tabela62 float,
    Tabela63 float,
    Tabela64 float,
    Tabela65 float,
    Tabela66 float,
    Tabela67 float,
    Tabela68 float,
    Tabela69 float,
    Tabela70 float,
    Tabela71 float,
    Tabela72 float,
    Tabela73 float,
    Tabela74 float,
    Tabela75 float,
    Tabela76 float,
    Tabela77 float,
    Tabela78 float,
    Tabela79 float,
    Tabela80 float,
    Tabela81 float,
    Tabela82 float,
    Tabela83 float,
    Tabela84 float,
    Tabela85 float,
    Tabela86 float,
    Tabela87 float,
    Tabela88 float,
    Tabela89 float,
    Tabela90 float,
    Tabela91 float,
    Tabela92 float,
    Tabela93 float,
    Tabela94 float,
    Tabela95 float,
    Tabela96 float,
    Tabela97 float,
    Tabela98 float,
    Tabela99 float,
    Tabela100 float,
    PRIMARY KEY (Mes, CodMaterial, Ano)
);

CREATE TABLE dbo.MaterialObservacao (
    CodMaterialObservacao int,
    MaterialObservacao varchar(100),
    MaterialObservacaoText text,
    CodEstado char(2),
    PRIMARY KEY (CodMaterialObservacao)
);

CREATE TABLE dbo.MaterialOrdem (
    CodMaterialOrdem int,
    MaterialOrdem varchar(50),
    PRIMARY KEY (CodMaterialOrdem)
);

CREATE TABLE dbo.MaterialPontuacao (
    CodMaterialPontuacao int,
    MaterialPontuacao varchar(100),
    CodMaterial int,
    Sequencia int,
    PontuacaoInicial int,
    PontuacaoFinal int,
    PRIMARY KEY (CodMaterialPontuacao)
);

CREATE TABLE dbo.MaterialPontuacaoPrecoCompra (
    CodMaterialPontuacaoPrecoCompra int,
    CodMaterial int,
    CodMaterialPontuacao int,
    Data datetime,
    Tabela1 float,
    Tabela2 float,
    Tabela3 float,
    Tabela4 float,
    Tabela5 float,
    PRIMARY KEY (CodMaterialPontuacaoPrecoCompra)
);

CREATE TABLE dbo.MaterialPreco (
    CodMaterial int,
    Tabela1 float,
    Tabela2 float,
    Tabela3 float,
    Tabela4 float,
    Tabela5 float,
    Tabela6 float,
    Tabela7 float,
    Tabela8 float,
    Tabela9 float,
    Tabela10 float,
    Tabela11 float,
    Tabela12 float,
    Tabela13 float,
    Tabela14 float,
    Tabela15 float,
    Tabela16 float,
    Tabela17 float,
    Tabela18 float,
    Tabela19 float,
    Tabela20 float,
    Tabela21 float,
    Tabela22 float,
    Tabela23 float,
    Tabela24 float,
    Tabela25 float,
    Tabela26 float,
    Tabela27 float,
    Tabela28 float,
    Tabela29 float,
    Tabela30 float,
    Tabela31 float,
    Tabela32 float,
    Tabela33 float,
    Tabela34 float,
    Tabela35 float,
    Tabela36 float,
    Tabela37 float,
    Tabela38 float,
    Tabela39 float,
    Tabela40 float,
    Tabela41 float,
    Tabela42 float,
    Tabela43 float,
    Tabela44 float,
    Tabela45 float,
    Tabela46 float,
    Tabela47 float,
    Tabela48 float,
    Tabela49 float,
    Tabela50 float,
    Tabela51 float,
    Tabela52 float,
    Tabela53 float,
    Tabela54 float,
    Tabela55 float,
    Tabela56 float,
    Tabela57 float,
    Tabela58 float,
    Tabela59 float,
    Tabela60 float,
    Tabela61 float,
    Tabela62 float,
    Tabela63 float,
    Tabela64 float,
    Tabela65 float,
    Tabela66 float,
    Tabela67 float,
    Tabela68 float,
    Tabela69 float,
    Tabela70 float,
    Tabela71 float,
    Tabela72 float,
    Tabela73 float,
    Tabela74 float,
    Tabela75 float,
    Tabela76 float,
    Tabela77 float,
    Tabela78 float,
    Tabela79 float,
    Tabela80 float,
    Tabela81 float,
    Tabela82 float,
    Tabela83 float,
    Tabela84 float,
    Tabela85 float,
    Tabela86 float,
    Tabela87 float,
    Tabela88 float,
    Tabela89 float,
    Tabela90 float,
    Tabela91 float,
    Tabela92 float,
    Tabela93 float,
    Tabela94 float,
    Tabela95 float,
    Tabela96 float,
    Tabela97 float,
    Tabela98 float,
    Tabela99 float,
    Tabela100 float,
    Tabela101 float,
    Tabela102 float,
    Tabela103 float,
    Tabela104 float,
    Tabela105 float,
    Tabela106 float,
    Tabela107 float,
    Tabela108 float,
    Tabela109 float,
    Tabela110 float,
    Tabela111 float,
    Tabela112 float,
    Tabela113 float,
    Tabela114 float,
    Tabela115 float,
    Tabela116 float,
    Tabela117 float,
    Tabela118 float,
    Tabela119 float,
    Tabela120 float,
    Tabela121 float,
    Tabela122 float,
    Tabela123 float,
    Tabela124 float,
    Tabela125 float,
    Tabela126 float,
    Tabela127 float,
    Tabela128 float,
    Tabela129 float,
    Tabela130 float,
    Tabela131 float,
    Tabela132 float,
    Tabela133 float,
    Tabela134 float,
    Tabela135 float,
    Tabela136 float,
    Tabela137 float,
    Tabela138 float,
    Tabela139 float,
    Tabela140 float,
    Tabela141 float,
    Tabela142 float,
    Tabela143 float,
    Tabela144 float,
    Tabela145 float,
    Tabela146 float,
    Tabela147 float,
    Tabela148 float,
    Tabela149 float,
    Tabela150 float,
    Usuario varchar(50),
    Data datetime,
    DescontoMax1 float,
    DescontoMax2 float,
    DescontoMax3 float,
    DescontoMax4 float,
    DescontoMax5 float,
    DescontoMax6 float,
    DescontoMax7 float,
    DescontoMax8 float,
    DescontoMax9 float,
    DescontoMax10 float,
    DescontoMax11 float,
    DescontoMax12 float,
    DescontoMax13 float,
    DescontoMax14 float,
    DescontoMax15 float,
    DescontoMax16 float,
    DescontoMax17 float,
    DescontoMax18 float,
    DescontoMax19 float,
    DescontoMax20 float,
    DescontoMax21 float,
    DescontoMax22 float,
    DescontoMax23 float,
    DescontoMax24 float,
    DescontoMax25 float,
    DescontoMax26 float,
    DescontoMax27 float,
    DescontoMax28 float,
    DescontoMax29 float,
    DescontoMax30 float,
    DescontoMax31 float,
    DescontoMax32 float,
    DescontoMax33 float,
    DescontoMax34 float,
    DescontoMax35 float,
    DescontoMax36 float,
    DescontoMax37 float,
    DescontoMax38 float,
    DescontoMax39 float,
    DescontoMax40 float,
    DescontoMax41 float,
    DescontoMax42 float,
    DescontoMax43 float,
    DescontoMax44 float,
    DescontoMax45 float,
    DescontoMax46 float,
    DescontoMax47 float,
    DescontoMax48 float,
    DescontoMax49 float,
    DescontoMax50 float,
    DescontoMax51 float,
    DescontoMax52 float,
    DescontoMax53 float,
    DescontoMax54 float,
    DescontoMax55 float,
    DescontoMax56 float,
    DescontoMax57 float,
    DescontoMax58 float,
    DescontoMax59 float,
    DescontoMax60 float,
    DescontoMax61 float,
    DescontoMax62 float,
    DescontoMax63 float,
    DescontoMax64 float,
    DescontoMax65 float,
    DescontoMax66 float,
    DescontoMax67 float,
    DescontoMax68 float,
    DescontoMax69 float,
    DescontoMax70 float,
    DescontoMax71 float,
    DescontoMax72 float,
    DescontoMax73 float,
    DescontoMax74 float,
    DescontoMax75 float,
    DescontoMax76 float,
    DescontoMax77 float,
    DescontoMax78 float,
    DescontoMax79 float,
    DescontoMax80 float,
    DescontoMax81 float,
    DescontoMax82 float,
    DescontoMax83 float,
    DescontoMax84 float,
    DescontoMax85 float,
    DescontoMax86 float,
    DescontoMax87 float,
    DescontoMax88 float,
    DescontoMax89 float,
    DescontoMax90 float,
    DescontoMax91 float,
    DescontoMax92 float,
    DescontoMax93 float,
    DescontoMax94 float,
    DescontoMax95 float,
    DescontoMax96 float,
    DescontoMax97 float,
    DescontoMax98 float,
    DescontoMax99 float,
    DescontoMax100 float,
    DescontoMax101 float,
    DescontoMax102 float,
    DescontoMax103 float,
    DescontoMax104 float,
    DescontoMax105 float,
    DescontoMax106 float,
    DescontoMax107 float,
    DescontoMax108 float,
    DescontoMax109 float,
    DescontoMax110 float,
    DescontoMax111 float,
    DescontoMax112 float,
    DescontoMax113 float,
    DescontoMax114 float,
    DescontoMax115 float,
    DescontoMax116 float,
    DescontoMax117 float,
    DescontoMax118 float,
    DescontoMax119 float,
    DescontoMax120 float,
    DescontoMax121 float,
    DescontoMax122 float,
    DescontoMax123 float,
    DescontoMax124 float,
    DescontoMax125 float,
    DescontoMax126 float,
    DescontoMax127 float,
    DescontoMax128 float,
    DescontoMax129 float,
    DescontoMax130 float,
    DescontoMax131 float,
    DescontoMax132 float,
    DescontoMax133 float,
    DescontoMax134 float,
    DescontoMax135 float,
    DescontoMax136 float,
    DescontoMax137 float,
    DescontoMax138 float,
    DescontoMax139 float,
    DescontoMax140 float,
    DescontoMax141 float,
    DescontoMax142 float,
    DescontoMax143 float,
    DescontoMax144 float,
    DescontoMax145 float,
    DescontoMax146 float,
    DescontoMax147 float,
    DescontoMax148 float,
    DescontoMax149 float,
    DescontoMax150 float,
    PRIMARY KEY (CodMaterial)
);

CREATE TABLE dbo.MaterialPrecoHistorico (
    CodMaterial int,
    Tabela int,
    Data datetime,
    PrecoAnterior float,
    Preco float,
    Usuario varchar(50),
    PRIMARY KEY (CodMaterial, Tabela, Data)
);

CREATE TABLE dbo.MaterialTipo (
    CodMaterialTipo int,
    MaterialTipo varchar(100),
    PRIMARY KEY (CodMaterialTipo)
);

CREATE TABLE dbo.MaterialUnidGestora (
    UnidGestora int,
    CodMaterial int,
    CodAlmoxarifado int,
    AjusteRN020001_RN020002 bit,
    PRIMARY KEY (UnidGestora, CodMaterial)
);

CREATE TABLE dbo.MDFe (
    CodMDFe int,
    Chave varchar(50),
    Status int,
    Serie varchar(3),
    Numero int,
    TipoEmissao int,
    TipoAmbiente int,
    UnidGestora int,
    CodVeiculo int,
    CodMotorista int,
    CodEstadoInicial char(2),
    CodEstadoFinal char(2),
    DataEmissao datetime,
    Usuario varchar(50),
    Data datetime,
    ProtocoloAutorizacao varchar(50),
    DataAutorizacao datetime,
    UsuarioAutorizacao varchar(50),
    ProtocoloCancelamento varchar(50),
    DataCancelamento datetime,
    UsuarioCancelamento varchar(50),
    ProtocoloEncerramento varchar(50),
    DataEncerramento datetime,
    UsuarioEncerramento varchar(50),
    Percurso varchar(50),
    CodMotorista2 int,
    CodMotorista3 int,
    CodMotorista4 int,
    CodMotorista5 int,
    CodVeiculoReboque int,
    CodVeiculoReboque2 int,
    CodVeiculoReboque3 int,
    PRIMARY KEY (CodMDFe)
);

CREATE TABLE dbo.MDFeFormato (
    CodMDFeFormato int,
    MDFeFormato varchar(50),
    Serie varchar(3),
    PRIMARY KEY (CodMDFeFormato)
);

CREATE TABLE dbo.MDFeItens (
    CodMDFe int,
    CodNotaFiscal int,
    Usuario varchar(50),
    DataInclusao datetime,
    PRIMARY KEY (CodMDFe, CodNotaFiscal)
);

CREATE TABLE dbo.MDFeItensTerceiros (
    CodMDFe int,
    NFeChave varchar(44),
    Usuario varchar(60),
    DataInclusao datetime,
    Observacoes varchar(255),
    NotaFiscalPesoBruto float,
    NotaFiscalTotal float,
    CodIBGEDestino varchar(10),
    CodIBGEOrigem varchar(10),
    SegCodBarra varchar(36),
    PRIMARY KEY (CodMDFe, NFeChave)
);

CREATE TABLE dbo.MDFeLote (
    CodMDFeLote int,
    Data datetime,
    Usuario varchar(50),
    NumRecibo varchar(50),
    Status int,
    PRIMARY KEY (CodMDFeLote)
);

CREATE TABLE dbo.MDFeLoteItens (
    CodMDFeLote int,
    CodMDFe int,
    Chave varchar(50),
    Status int,
    PRIMARY KEY (CodMDFeLote, CodMDFe)
);

CREATE TABLE dbo.MDFeStatus (
    Status int,
    Descricao varchar(200),
    PRIMARY KEY (Status)
);

CREATE TABLE dbo.Mensagem (
    CodMensagem int,
    Usuario char(20),
    Titulo varchar(30),
    Mensagem varchar(255),
    Data datetime,
    PRIMARY KEY (CodMensagem)
);

CREATE TABLE dbo.MensalistaGrupo (
    CodMensalistaGrupo int,
    MensalistaGrupo varchar(50),
    PRIMARY KEY (CodMensalistaGrupo)
);

CREATE TABLE dbo.MensalistaProcess (
    CodMensalistaProcess int,
    CodCliente int,
    Situacao int,
    Data datetime,
    Usuario varchar(50),
    Mes int,
    Ano int,
    QtdItens int,
    TotalItens float,
    Observacao varchar(100)
);

CREATE TABLE dbo.MensalistaProcessItem (
    CodMensalistaProcess int,
    TipoProcess int,
    CodPedidoVenda int,
    CodNaturezaOperacao int
);

CREATE TABLE dbo.Mes (
    CodMes int,
    Mes varchar(20),
    Sigla char(3),
    PRIMARY KEY (CodMes)
);

CREATE TABLE dbo.MetaCrescimento (
    CodMetaCrescimento int,
    CodAreaVenda int,
    CodGrupo int,
    Tipo char(1),
    Percentual float,
    PRIMARY KEY (CodMetaCrescimento)
);

CREATE TABLE dbo.MetaFaixa (
    CodMetaFaixa int,
    MetaFaixa varchar(50),
    FaixaInicio int,
    FaixaFim int,
    Ativa bit,
    PRIMARY KEY (CodMetaFaixa)
);

CREATE TABLE dbo.MicroRegiao (
    CodMicroRegiao int,
    MicroRegiao varchar(50),
    CodMicroRegiaoIBGE char(3),
    CodRegiaoIBGE char(2),
    CodEstadoIBGE char(2),
    ativo bit,
    PRIMARY KEY (CodMicroRegiao)
);

CREATE TABLE dbo.Moeda (
    CodMoeda int,
    Moeda varchar(50),
    ContaReceber bit,
    ContaPagar bit,
    CodMoedaTipo int,
    ReceberPedido bit,
    PDV bit,
    PDVDoc bit,
    PDVCliente bit,
    Prazo smallint,
    CodConta varchar(20),
    Tarifa float,
    CodPDVBandeiraTef int
);

CREATE TABLE dbo.MoedaTipo (
    CodMoedaTipo int,
    MoedaTipo varchar(50),
    ContaReceber bit,
    JurosMulta bit,
    PRIMARY KEY (CodMoedaTipo)
);

CREATE TABLE dbo.MultaTipo (
    CodMultaTipo int,
    MultaTipo varchar(255),
    Gravidade int,
    Pontos int,
    Valor float,
    CodInfracao int,
    Status int,
    PRIMARY KEY (CodMultaTipo)
);

CREATE TABLE dbo.NaturezaOp (
    CodNaturezaOperacao int,
    CodNaturezaOpFiscal int,
    PRIMARY KEY (CodNaturezaOperacao, CodNaturezaOpFiscal)
);

CREATE TABLE dbo.NaturezaOpCliente (
    CodNaturezaOperacao int,
    CodCliente int,
    PRIMARY KEY (CodNaturezaOperacao, CodCliente)
);

CREATE TABLE dbo.NaturezaOpCompra (
    CodNaturezaOperacao int,
    CodNaturezaOpFiscal int,
    PRIMARY KEY (CodNaturezaOperacao, CodNaturezaOpFiscal)
);

CREATE TABLE dbo.NaturezaOperacao (
    CodNaturezaOperacao int,
    NaturezaOperacao varchar(50),
    NotaFiscal varchar(50),
    ES char(1),
    IPI bit,
    ICMS bit,
    ICMSSubst bit,
    Ativar bit,
    Expedir bit,
    Receber bit,
    Comissionar bit,
    Contabilizar bit,
    ExpedirUG01 int,
    ExpedirUG02 int,
    ExpedirUG03 int,
    ExpedirUG04 int,
    ExpedirUG05 int,
    CodTabelaComissao int,
    Descricao text,
    NumNaturezaOperacao int,
    Titulo varchar(50),
    Venda bit,
    Bonificacao bit,
    Avaria bit,
    MapaExpedAuto bit,
    CodMapaExpedicaoTipo int,
    Ativo bit,
    Situacao char(1),
    SituacaoPagamento char(1),
    GerenciarPedido bit,
    GerenciarDuplicata bit,
    GerenciarBoleto bit,
    GerenciarNotaFiscal bit,
    NaturezaOperacaoClasse char(2),
    ComissaoAdicional float,
    CodNaturezaOpDevolucao int,
    CodNaturezaOpFiscalPadrao int,
    Mestre bit,
    Detalhe bit,
    TipoMaterial int,
    ExpedirUG06 int,
    ExpedirUG07 int,
    ExpedirUG08 int,
    ExpedirUG09 int,
    ExpedirUG10 int,
    CallCenter bit,
    ICMSSimples bit,
    Especificacao text,
    DataSaida bit,
    PIS bit,
    COFINS bit,
    ISS bit,
    CodNaturezaOperacaoTipo int,
    Remessa bit,
    BaseICMSIncluiIPI bit,
    VincularMapaProducao bit,
    VincularCupomFiscal bit,
    VincularDocumento bit,
    VincularMapaExpedicao bit,
    CodNotaFiscalIntegracaoTipo int,
    UnidGestora int,
    CodNaturezaOpClasse int,
    HistoricoCliente bit,
    CodClassificadorSegmento int,
    ExpedirUG11 int,
    ExpedirUG12 int,
    ExpedirUG13 int,
    ExpedirUG14 int,
    ExpedirUG15 int,
    ExpedirUG16 int,
    ExpedirUG17 int,
    ExpedirUG18 int,
    ExpedirUG19 int,
    ExpedirUG20 int,
    CodClienteTributacao int,
    Transferencia bit,
    ICMSSubstICMSIsento bit,
    ICMSCodTabelaPreco int,
    Devolucao bit,
    PRIMARY KEY (CodNaturezaOperacao)
);

CREATE TABLE dbo.NaturezaOperacaoClasse (
    CodNaturezaOpClasse int,
    NaturezaOpClasse varchar(50),
    Venda int,
    Bonificacao int,
    Avaria int,
    PRIMARY KEY (CodNaturezaOpClasse)
);

CREATE TABLE dbo.NaturezaOperacaoCompra (
    CodNaturezaOperacao int,
    NaturezaOperacao varchar(50),
    IPI bit,
    ICMS bit,
    ICMSSubst bit,
    NumNaturezaOperacao int,
    Ativo bit,
    ICMSSimples bit,
    PIS bit,
    COFINS bit,
    ISS bit,
    CodClassificadorSegmento int,
    BasePISCOFINSIncluiIPI bit,
    CodEvento char(5),
    CSTICMS int,
    CSTIPI int,
    CSTPIS int,
    CSTCOFINS int,
    CSOSIMPLES int,
    ALIQPIS float,
    ALIQCOFINS float,
    TipoPIS int,
    TipoCOFINS int,
    CodNaturezaOpFiscal int,
    Patrimonio bit,
    Devolucao bit,
    PRIMARY KEY (CodNaturezaOperacao)
);

CREATE TABLE dbo.NaturezaOperacaoContabil (
    CodNaturezaOperacao int,
    CustosVendas bit,
    DescontosFinanceiros bit,
    ValorContabil bit,
    ICMS bit,
    ICMSSubstituto bit,
    IPI bit,
    PIS bit,
    COFINS bit,
    PRIMARY KEY (CodNaturezaOperacao)
);

CREATE TABLE dbo.NaturezaOperacaoTipo (
    CodNaturezaOperacaoTipo int,
    NaturezaOperacaoTipo varchar(50),
    Situacao char(1),
    SituacaoPagamento char(1),
    PRIMARY KEY (CodNaturezaOperacaoTipo)
);

CREATE TABLE dbo.NaturezaOperacaoUnidGestora (
    UnidGestora int,
    CodNaturezaOperacao int,
    Expedir int,
    PRIMARY KEY (UnidGestora, CodNaturezaOperacao)
);

CREATE TABLE dbo.NaturezaOpFiscal (
    CodNaturezaOpFiscal int,
    NaturezaOpFiscal varchar(250),
    Codigo varchar(20),
    CodOpFiscal int,
    CodNaturezaOpFiscalDevolucao int,
    Ativo int,
    Devolucao bit,
    CodPlanoContabil varchar(20),
    PRIMARY KEY (CodNaturezaOpFiscal)
);

CREATE TABLE dbo.NaturezaOpFormaReceb (
    CodNaturezaOperacao int,
    CodFormaReceb smallint,
    PRIMARY KEY (CodNaturezaOperacao, CodFormaReceb)
);

CREATE TABLE dbo.NCM (
    CodNCM varchar(15),
    NCM varchar(55),
    CodNBM varchar(12),
    IBPTAliqNacional float,
    IBPTAliqImportado float,
    IBPTAliqEstadual float,
    IBPTAliqMunicipal float,
    DataInicio date,
    DataFim date,
    Ativo bit,
    CEST varchar(10),
    PRIMARY KEY (CodNCM)
);

CREATE TABLE dbo.NFCeFormato (
    CodNFCeFormato int,
    UnidGestora int,
    Serie int,
    Numero int,
    Descricao varchar(100),
    CodAlmoxarifado int,
    CSC varchar(100),
    IDCSC int,
    Registrado bit,
    Dataregistro datetime,
    Maquina varchar(100),
    Data datetime,
    Usuario varchar(50),
    CodPixFormato int,
    IdentificadorTransacao varchar(100),
    UUIDStoneMaquina uniqueidentifier,
    PRIMARY KEY (CodNFCeFormato)
);

CREATE TABLE dbo.NFe (
    CodNFe int,
    cUF int,
    cNF int,
    natOp varchar(60),
    serie int,
    nNF int,
    dhEmi datetime,
    dhSaiEnt datetime,
    cMunFG int,
    emitCNPJ varchar(14),
    emitxNome varchar(100),
    emitxFant varchar(100),
    emitEnderxLgr varchar(200),
    emitEnderNro varchar(60),
    emitEnderxBairro varchar(100),
    emitEndercMun varchar(10),
    emitEnderxMun varchar(100),
    emitEnderUF varchar(2),
    emitEnderCEP varchar(8),
    emitEnderxPais varchar(60),
    emitEnderFone varchar(50),
    emitIE varchar(20),
    emitCRT int,
    destCNPJ varchar(14),
    destxNome varchar(100),
    destEnderxLgr varchar(200),
    destEnderNro varchar(60),
    destEnderxBairro varchar(100),
    destEndercMun varchar(10),
    destEnderxMun varchar(100),
    destEnderUF varchar(2),
    destEnderCEP varchar(8),
    destEnderxPais varchar(60),
    destEnderFone varchar(50),
    destIE varchar(20),
    destEmail varchar(60),
    entregaCNPJ varchar(14),
    entregaxLgr varchar(200),
    entregaxNro varchar(60),
    entregaxBairro varchar(100),
    entregacMun varchar(10),
    entregaxMun varchar(100),
    entregaUF varchar(2),
    entregaCEP varchar(8),
    entregaxPais varchar(60),
    vBC float,
    vICMS float,
    vICMSDeson float,
    vFCP float,
    vBCST float,
    vST float,
    vFCPST float,
    vProd float,
    vFrete float,
    vSeg float,
    vDesc float,
    vII float,
    vIPI float,
    vPIS float,
    vCOFINS float,
    vOutro float,
    vNF float,
    vTotTrib float,
    cobrnFat varchar(60),
    cobrvOrig float,
    cobrvDesc float,
    cobrvLiq float,
    chNFe varchar(50),
    UsuarioDownload varchar(50),
    DataDownload datetime,
    DataConferencia datetime,
    SituacaoConferencia int,
    Placa varchar(8),
    PRIMARY KEY (CodNFe)
);

CREATE TABLE dbo.NFeDest (
    CodNFeDest int,
    Tipo int,
    NSU varchar(50),
    chNFe varchar(50),
    CNPJ varchar(50),
    CPF varchar(50),
    xNome varchar(100),
    IE varchar(50),
    dEmi datetime,
    tpNF int,
    vNF float,
    digVal varchar(50),
    dhRecbto datetime,
    cSitNFe int,
    cSitConf int,
    dhEvento datetime,
    tpEvento varchar(50),
    nSeqEvento int,
    descEvento varchar(50),
    xCorrecao varchar(255),
    DataConfirmar datetime,
    DataDarCiencia datetime,
    DataDesconhecer datetime,
    DataRecusar datetime,
    UsuarioConfirmar varchar(50),
    UsuarioDarCiencia varchar(50),
    UsuarioDesconhecer varchar(50),
    UsuarioRecusar varchar(50),
    xCorrecaoText text,
    CodMotivoDesconhecer int,
    PRIMARY KEY (CodNFeDest)
);

CREATE TABLE dbo.NFeDestConfRec (
    CodNFeDest int,
    Sequencia int,
    DataConfRec datetime,
    Usuario varchar(50),
    idLote varchar(50),
    id varchar(100),
    cOrgao int,
    tpAmb int,
    dhEvento datetime,
    tpEvento varchar(50),
    xJust varchar(255),
    idInfRet varchar(50),
    verAplic varchar(50),
    cStat int,
    xMotivo varchar(255),
    emailDest varchar(255),
    dhRegEvento datetime,
    nProt varchar(50),
    PRIMARY KEY (CodNFeDest, Sequencia)
);

CREATE TABLE dbo.NFeDestImport (
    CodNFeDestImport int,
    DataConsulta datetime,
    UnidGestora int,
    Usuario varchar(50),
    tpAmb int,
    CNPJ varchar(50),
    indNFe int,
    indEmi int,
    ultNSU varchar(50),
    verAplic varchar(50),
    cStat int,
    xMotivo varchar(255),
    dhResp datetime,
    indCont int,
    ultNSUret varchar(50),
    PRIMARY KEY (CodNFeDestImport)
);

CREATE TABLE dbo.NFeDestImportItens (
    CodNFeDestImport int,
    Sequencia int,
    CodNFeDest int,
    cSitNFe int,
    cSitConf int,
    PRIMARY KEY (CodNFeDestImport, Sequencia)
);

CREATE TABLE dbo.NFeDup (
    CodNFeDup int,
    CodNFe int,
    nDup varchar(60),
    dVenc datetime,
    vDup float,
    PRIMARY KEY (CodNFeDup)
);

CREATE TABLE dbo.NFeItem (
    CodNFeItem int,
    CodNFe int,
    cProd varchar(60),
    cEAN varchar(20),
    xProd varchar(120),
    NCM varchar(10),
    CEST varchar(10),
    CFOP varchar(10),
    uCom varchar(10),
    qCom float,
    vUnCom float,
    vProd float,
    xPed varchar(20),
    nItemPed int,
    PRIMARY KEY (CodNFeItem)
);

CREATE TABLE dbo.NFeLogErro (
    CodNFeLogErro int,
    CodNFeLote int,
    CodNotaFiscal int,
    Data datetime,
    Usuario varchar(50),
    Erro varchar(250),
    PRIMARY KEY (CodNFeLogErro)
);

CREATE TABLE dbo.NFeLote (
    CodNFeLote int,
    Data datetime,
    Usuario varchar(50),
    NumRecibo varchar(50),
    Status int,
    UnidGestora int,
    PRIMARY KEY (CodNFeLote)
);

CREATE TABLE dbo.NFeLoteItens (
    CodNFeLote int,
    CodNotaFiscal int,
    TipoEmissao char(1),
    Chave varchar(50),
    Status int,
    PRIMARY KEY (CodNFeLote, CodNotaFiscal)
);

CREATE TABLE dbo.NFeRastro (
    CodNFeRastro int,
    CodNFe int,
    nLote varchar(50),
    qLote int,
    dFab datetime,
    dVal datetime,
    cProd varchar(60),
    qLoteFloat float,
    PRIMARY KEY (CodNFeRastro)
);

CREATE TABLE dbo.NFeStatus (
    Status int,
    Descricao varchar(200),
    PRIMARY KEY (Status)
);

CREATE TABLE dbo.NotaFiscal (
    CodNotaFiscal int,
    NumNotaFiscal int,
    NumNotaFiscalForm int,
    NotaFiscalModelo int,
    NotaFiscalSerie char(3),
    NotaFiscalEmitente char(1),
    NotaFiscalES char(1),
    Situacao char(1),
    CodPedido int,
    DataEmissao datetime,
    UsuarioEmissao varchar(50),
    DataRegistroEmissao datetime,
    DataCancelamento datetime,
    UsuarioCancelamento varchar(50),
    DataEstorno datetime,
    UsuarioEstorno varchar(50),
    NotaFiscalBaseICMS float,
    NotaFiscalICMS float,
    NotaFiscalBaseSubst float,
    NotaFiscalICMSSubst float,
    NotaFiscalTotalProdutos float,
    NotaFiscalFrete float,
    NotaFiscalSeguro float,
    NotaFiscalDespesas float,
    NotaFiscalBaseIPI float,
    NotaFiscalIPI float,
    NotaFiscalTotal float,
    Continua int,
    NotaFiscalVolumes int,
    NotaFiscalPesoBruto float,
    NotaFiscalPesoLiquido float,
    NotaFiscalDesconto float,
    SequenciaAIDF int,
    DataAIDF datetime,
    NotaFiscalBasePIS float,
    NotaFiscalPIS float,
    NotaFiscalBaseCOFINS float,
    NotaFiscalCOFINS float,
    UnidGestora int,
    DataSaida datetime,
    FretePorConta int,
    NFeTipoEmissao char(1),
    NFeChave varchar(50),
    NFeProtocolo varchar(50),
    NFeStatus int,
    NFeProtocoloCanc varchar(50),
    MotivoCanc varchar(50),
    NotaFiscalBaseICMSIsento float,
    NotaFiscalBaseSubstIsento float,
    NotaFiscalBaseIPIIsento float,
    NotaFiscalBasePISIsento float,
    NotaFiscalBaseCOFINSIsento float,
    NotaFiscalBaseImpostos float,
    CodNotaFiscalFormato int,
    NotaFiscalDescontoRef float,
    Enviado bit,
    Especificacao text,
    NotaFiscalDescontoFin float,
    NotaFiscalICMSSN float,
    NotaFiscalICMSOutros float,
    NotaFiscalEspecie varchar(60),
    NotaFiscalMarca varchar(60),
    ExportacaoUFEmbarque char(2),
    ExportacaoLocalEmbarque varchar(60),
    ImportacaoNumDI varchar(10),
    ImportacaoDataDI datetime,
    ImportacaoUFDesembaraco char(2),
    ImportacaoLocalDesembaraco varchar(60),
    ImportacaoDataDesembaraco datetime,
    Empenho varchar(17),
    EmpenhoPedido varchar(60),
    EmpenhoContrato varchar(60),
    NotaFiscalBasePISST float,
    NotaFiscalBasePISSTIsento float,
    NotaFiscalPISST float,
    NotaFiscalBaseCOFINSST float,
    NotaFiscalBaseCOFINSSTIsento float,
    NotaFiscalCOFINSST float,
    NotaFiscalBaseISSQN float,
    NotaFiscalBaseISSQNIsento float,
    NotaFiscalISSQN float,
    NotaFiscalBaseII float,
    NotaFiscalII float,
    NotaFiscalIIDesp float,
    NotaFiscalIIIOF float,
    TaxaCambio float,
    VeiculoPlaca char(8),
    VeiculoUF char(2),
    VeiculoRNTC varchar(50),
    NFeTipoAmbiente int,
    CodCliente int,
    CodVendedor int,
    CodTransportador int,
    CodFormaReceb int,
    CodNaturezaOpFiscal int,
    CodNaturezaOperacao int,
    ImportacaoViaTransporte int,
    ImportacaoNotaFiscalValorAFRMM float,
    NotaFiscalAcrescimoFin float,
    NFeFinalidade int,
    NotaFiscalBaseICMSOutros float,
    NotaFiscalBaseICMSUFDest float,
    NotaFiscalValorICMSUFDest float,
    NotaFiscalValorICMSFCPUFDest float,
    NotaFiscalValorICMSUFRemet float,
    EmitiuDanfe bit,
    NFeProtocoloData datetime,
    CodCupom int
);

CREATE TABLE dbo.NotaFiscalAut (
    CodNotaFiscalAut int,
    CodNotaFiscal int,
    CPFCNPJ varchar(20),
    PRIMARY KEY (CodNotaFiscalAut)
);

CREATE TABLE dbo.NotaFiscalCCe (
    CodNotaFiscal int,
    Sequencia int,
    DataEmissao datetime,
    UsuarioEmissao varchar(50),
    Correcao text,
    NFeProtocolo varchar(50),
    PRIMARY KEY (CodNotaFiscal, Sequencia)
);

CREATE TABLE dbo.NotaFiscalFormato (
    CodNotaFiscalFormato int,
    NotaFiscalFormato varchar(50),
    NotaFiscalModelo int,
    NotaFiscalSerie char(3),
    NotaFiscalPageLength float,
    NotaFiscalPageWidth float,
    SaidaLeft float,
    SaidaTop float,
    EntradaLeft float,
    EntradaTop float,
    NumeroNota1Left float,
    NumeroNota1Top float,
    NaturezaOperacaoLeft float,
    NaturezaOperacaoTop float,
    CodigoOperacaoLeft float,
    CodigoOperacaoTop float,
    CFOLeft float,
    CFOTop float,
    InscrEstSubstTribLeft float,
    InscrEstSubstTribTop float,
    ClienteCodLeft float,
    ClienteCodTop float,
    ClienteNomeLeft float,
    ClienteNomeTop float,
    ClienteFantasiaLeft float,
    ClienteFantasiaTop float,
    ClienteCNPJLeft float,
    ClienteCNPJTop float,
    ClienteEnderecoLeft float,
    ClienteEnderecoTop float,
    ClienteBairroLeft float,
    ClienteBairroTop float,
    ClienteCEPLeft float,
    ClienteCEPTop float,
    ClienteMunicipioLeft float,
    ClienteMunicipioTop float,
    ClienteFoneLeft float,
    ClienteFoneTop float,
    ClienteUFLeft float,
    ClienteUFTop float,
    ClienteInscrEstLeft float,
    ClienteInscrEstTop float,
    ClienteReferenciaLeft float,
    ClienteReferenciaTop float,
    DataEmissaoLeft float,
    DataEmissaoTop float,
    DataSaidaLeft float,
    DataSaidaTop float,
    HoraSaidaLeft float,
    HoraSaidaTop float,
    FormaRecebTop float,
    FormaRecebLeft float,
    TabelaPrecoTop float,
    TabelaPrecoLeft float,
    ExtensoLeft float,
    ExtensoTop float,
    MapaLeft float,
    MapaTop float,
    FaturaALeft float,
    FaturaATop float,
    FaturaAAltura float,
    FaturaALargura float,
    FaturaBTop float,
    FaturaBLeft float,
    FaturaCTop float,
    FaturaCLeft float,
    FaturaDTop float,
    FaturaDLeft float,
    FaturaETop float,
    FaturaELeft float,
    PedidoResumoLeft float,
    PedidoResumoTop float,
    ProdutoCodigoLeft float,
    ProdutoCodigoTop float,
    ProdutoCodigoAltura float,
    ProdutoCodigoWidth float,
    ProdutoLeft float,
    ProdutoWidth float,
    CFLeft float,
    CFWidth float,
    STLeft float,
    STWidth float,
    UNLeft float,
    UNWidth float,
    QuantidadeLeft float,
    QuantidadeWidth float,
    ValorUnitarioLeft float,
    ValorUnitarioWidth float,
    ValorDescontoUnitLeft float,
    ValorDescontoUnitWidth float,
    ValorTotalLeft float,
    ValorTotalWidth float,
    AlicotaICMSLeft float,
    AlicotaICMSWidth float,
    ValorIPIUnitLeft float,
    ValorIPIUnitWidth float,
    AlicotaIPILeft float,
    AlicotaIPIWidth float,
    DescontoLeft float,
    DescontoWidth float,
    DescontoValorLeft float,
    DescontoValorWidth float,
    BaseICMSLeft float,
    BaseICMSTop float,
    ValorICMSLeft float,
    BaseICMSSubstLeft float,
    ValorICMSSubstLeft float,
    ValorProdutosLeft float,
    ValorFreteLeft float,
    ValorFreteTop float,
    ValorSeguroLeft float,
    OutrasDespesasLeft float,
    ValorIPILeft float,
    ValorNotaLeft float,
    TranspNomeLeft float,
    TranspNomeTop float,
    TranspFreteContaTop float,
    TranspFreteContaLeft float,
    TranspPlacaLeft float,
    TranspPlacaTop float,
    TranspPlacaUFLeft float,
    TranspPlacaUFTop float,
    TranspCNPJLeft float,
    TranspCNPJTop float,
    TranspEnderecoLeft float,
    TranspEnderecoTop float,
    TranspMunicipioLeft float,
    TranspMunicipioTop float,
    TranspUFLeft float,
    TranspUFTop float,
    TranspInscrEstLeft float,
    TranspInscrEstTop float,
    TranspQtdVolumeLeft float,
    TranspQtdVolumeTop float,
    TranspEspecieLeft float,
    TranspEspecieTop float,
    TranspMarcaLeft float,
    TranspMarcaTop float,
    TranspNumeroLeft float,
    TranspNumeroTop float,
    TranspPesoBrutoLeft float,
    TranspPesoBrutoTop float,
    TranspPesoLiqLeft float,
    TranspPesoLiqTop float,
    NumeroNota2Left float,
    NumeroNota2Top float,
    NumeroPedidoLeft float,
    NumeroPedidoTop float,
    VendedorCodigoLeft float,
    VendedorCodigoTop float,
    VendedorLeft float,
    VendedorTop float,
    RotaLeft float,
    RotaTop float,
    DadosAdicionaisLeft float,
    DadosAdicionaisTop float,
    DadosAdicionaisAltura float,
    DadosAdicionais1 varchar(50),
    DadosAdicionais2 varchar(50),
    DadosAdicionais3 varchar(50),
    DadosAdicionais4 varchar(50),
    DadosAdicionais5 varchar(50),
    ReferenciaLeft float,
    ReferenciaTop float,
    EspecificacaoLeft float,
    EspecificacaoTop float,
    ProdutoEspecificacaoLargura float,
    DadosAdicionaisLargura float,
    DadosAdicionais text,
    PRIMARY KEY (CodNotaFiscalFormato)
);

CREATE TABLE dbo.NotaFiscalIntegracaoCampos (
    CodNotaFiscalIntegracaoCampos int,
    NotaFiscalIntegracaoCampos varchar(50),
    PRIMARY KEY (CodNotaFiscalIntegracaoCampos)
);

CREATE TABLE dbo.NotaFiscalIntegracaoTipo (
    CodNotaFiscalIntegracaoTipo int,
    NotaFiscalIntegracaoTipo varchar(50),
    PRIMARY KEY (CodNotaFiscalIntegracaoTipo)
);

CREATE TABLE dbo.NotaFiscalItens (
    CodNotaFiscal int,
    CodMaterial int,
    CodEmbalagem int,
    CodNaturezaOpFiscal int,
    SequenciaNotaFiscal int,
    Quantidade float,
    CodUnidade int,
    QtdEmbalagem int,
    ValorEmbalagem float,
    ValorEmbalagemRef float,
    Desconto float,
    iValorProduto int,
    iValorDesconto int,
    ICMS float,
    iBaseICMS int,
    iBaseICMSIsento int,
    iValorICMS int,
    TipoIPI int,
    IPI float,
    iBaseIPI int,
    iBaseIPIIsento int,
    iValorIPI int,
    TipoICMSSubst int,
    ICMSSubst float,
    iBaseICMSSubst int,
    iBaseICMSSubstIsento int,
    iValorICMSSubst int,
    cst int,
    TipoPIS int,
    PIS float,
    iBasePIS int,
    iBasePISIsento int,
    iValorPIS int,
    AliquotaPIS float,
    cstPIS int,
    TipoCOFINS int,
    COFINS float,
    iBaseCOFINS int,
    iBaseCOFINSIsento int,
    iValorCOFINS int,
    AliquotaCOFINS float,
    cstCOFINS int,
    cstIPI int,
    AliquotaIPI float,
    AliquotaICMSSubst float,
    DescontoRef float,
    iValorDescontoRef int,
    Especificacao text,
    iBaseImpostos int,
    ICMSReducaoBC float,
    ICMSSTReducaoBC float,
    AliquotaICMS float,
    AliquotaICMSSUBSTperc float,
    AliquotaIPIperc float,
    AliquotaPISperc float,
    AliquotaCOFINSperc float,
    AliquotaICMSSN float,
    iValorICMSSN int,
    ICMSSN float,
    iValorFrete int,
    iValorSeguro int,
    iValorDespesas int,
    iValorICMSOutros int,
    TipoPISST int,
    PISST float,
    AliquotaPISST float,
    AliquotaPISSTperc float,
    iBasePISST int,
    iBasePISSTIsento int,
    iValorPISST int,
    TipoCOFINSST int,
    COFINSST float,
    AliquotaCOFINSST float,
    AliquotaCOFINSSTperc float,
    iBaseCOFINSST int,
    iBaseCOFINSSTIsento int,
    iValorCOFINSST int,
    TipoISSQN int,
    ISSQN float,
    AliquotaISSQN float,
    AliquotaISSQNperc float,
    iBaseISSQN int,
    iBaseISSQNIsento int,
    iValorISSQN int,
    cstISSQN char(1),
    codISSQNItem int,
    TipoII int,
    II float,
    IIBC float,
    IIDesp float,
    IIIOF float,
    iValorII int,
    iValorIIBC int,
    iValorIIDesp int,
    iValorIIIOF int,
    PISUnit float,
    PISUnitTipo int,
    iBasePISQtd int,
    COFINSUnit float,
    COFINSUnitTipo int,
    iBaseCOFINSQtd int,
    CSOSimples int,
    iBaseICMSOutros int,
    AliquotaICMSOutros float,
    iBaseICMSUFDest int,
    AliquotaICMSFCPUFDest float,
    AliquotaICMSUFDest float,
    AliquotaICMSInter float,
    PercentualICMSPart float,
    iValorICMSPartUFDest int,
    iValorICMSPartUFRemet int,
    CodCupom int
);

CREATE TABLE dbo.NotaFiscalModelo (
    CodModeloSintegra int,
    CodModeloFortts varchar(5),
    CodModeloMasterMac varchar(2),
    Descricao varchar(100),
    Ativo bit,
    Sigla char(5),
    PRIMARY KEY (CodModeloSintegra)
);

CREATE TABLE dbo.NotaFiscalParcelas (
    CodNotaFiscal int,
    Parcela int,
    DataVencimento datetime,
    Valor float,
    CodMoeda int,
    Valor2 float,
    CodCupom int,
    ECFSerial varchar(60),
    PRIMARY KEY (CodNotaFiscal, Parcela)
);

CREATE TABLE dbo.NotaFiscalServico (
    CodNotaServico int,
    CodParticipante int,
    NumDoc int,
    ChaveNFSe varchar(44),
    Serie varchar(10),
    Subserie varchar(10),
    CodTipoDoc int,
    DataEmissao datetime,
    DataConclusao datetime,
    DataRegistro datetime,
    TipoPagamento int,
    ValorTotal float,
    ValorDesconto float,
    BasePIS float,
    BaseCOFINS float,
    ValorPIS float,
    ValorCOFINS float,
    BaseISS float,
    ValorISS float,
    BaseICMS float,
    ValorICMS float,
    UnidGestora int,
    Responsavel varchar(50),
    Cancelado bit,
    CodOperacao int,
    ValorServico float,
    NotaFiscalES char(1),
    NumNotaFiscal int,
    AnoDoc int,
    PRIMARY KEY (CodNotaServico)
);

CREATE TABLE dbo.NotaFiscalServicoItens (
    CodNotaServico int,
    Sequencia int,
    CodMaterial int,
    ValorTotal int,
    ValorDesconto int,
    BasePIS int,
    BaseCOFINS int,
    ValorPIS int,
    ValorCOFINS int,
    BaseISS int,
    ValorISS int,
    BaseICMS int,
    ValorICMS int,
    CSTPis char(2),
    CSTCofins char(2),
    AliquotaPIS int,
    AliquotaCOFINS int,
    AliquotaISS int,
    AliquotaICMS int,
    Quantidade float,
    ValorServico int,
    CFOP int,
    CSTICMS char(3),
    PRIMARY KEY (CodNotaServico, Sequencia)
);

CREATE TABLE dbo.NotaPagamento (
    CodNotaPagamento int,
    UnidGestora int,
    AnoDoc int,
    NumDoc int,
    CodCliente int,
    Data datetime,
    DataFechamento datetime,
    DataCancelamento datetime,
    Status int,
    Usuario varchar(50),
    UsuarioFechamento varchar(50),
    UsuarioCancelamento varchar(50),
    ValorTotal float,
    Credito1 float,
    Credito2 float,
    Credito3 float,
    ValorBruto float,
    Debito1 float,
    Debito2 float,
    Debito3 float,
    ValorLiquido float,
    Credito float,
    Debito float,
    ValorPagar float,
    CodMapaPagamento int,
    EmitiuPedidoVenda bit,
    CodPedidoVenda int,
    UsuarioPedidoVenda varchar(50),
    DataPedidoVenda datetime,
    EmitiuContaPagar bit,
    CodContaPagar int,
    UsuarioContaPagar varchar(50),
    DataContaPagar datetime,
    Credito4 float,
    Credito5 float,
    Debito4 float,
    Debito5 float,
    ValorNF float,
    UsuarioEstFechamento varchar(50),
    DataEstFechamento datetime,
    PRIMARY KEY (CodNotaPagamento)
);

CREATE TABLE dbo.NotaPagamentoItens (
    CodNotaPagamento int,
    Sequencia int,
    CodMaterial int,
    CodEmbalagem int,
    Qtd1 float,
    Qtd2 float,
    Qtd3 float,
    Qtd4 float,
    Qtd5 float,
    Valor1 float,
    Valor2 float,
    Valor3 float,
    Valor4 float,
    Valor5 float,
    Qtd float,
    Valor float,
    ValorLiquido int,
    ValorNF int,
    PRIMARY KEY (CodNotaPagamento, Sequencia)
);

CREATE TABLE dbo.NotaRecebimento (
    CodNotaRecebimento int,
    UnidGestora int,
    AnoDoc int,
    NumDoc int,
    CodAlmoxarifado int,
    CodCliente int,
    Data datetime,
    DataRecebimento datetime,
    DataAnalise datetime,
    DataCancelamento datetime,
    NumDias int,
    PontuacaoMedia int,
    Status int,
    Usuario varchar(50),
    UsuarioRecebimento varchar(50),
    UsuarioAnalise varchar(50),
    UsuarioCancelamento varchar(50),
    ValorTotal float,
    CodMapaRecebimento int,
    CodNotaPagamento int,
    CodDoc int,
    CodDocEstorno int,
    DataDoc datetime,
    QtdBomTotal float,
    PRIMARY KEY (CodNotaRecebimento)
);

CREATE TABLE dbo.NotaRecebimentoItens (
    CodNotaRecebimento int,
    Sequencia int,
    CodMaterial int,
    CodEmbalagem int,
    QtdBom float,
    QtdAvariado float,
    CodMaterialPontuacao int,
    PontuacaoTotal int,
    PrecoMedio float,
    Qtd1 float,
    Qtd2 float,
    Qtd3 float,
    Qtd4 float,
    Qtd5 float,
    Valor1 float,
    Valor2 float,
    Valor3 float,
    Valor4 float,
    Valor5 float,
    PRIMARY KEY (CodNotaRecebimento, Sequencia)
);

CREATE TABLE dbo.NotaRecebimentoItensAnalise (
    CodNotaRecebimento int,
    Sequencia int,
    CodAnaliseItem int,
    ValorAnalise float,
    Pontuacao int,
    Resultado varchar(100),
    PRIMARY KEY (CodNotaRecebimento, Sequencia, CodAnaliseItem)
);

CREATE TABLE dbo.Numeracao (
    Tabela varchar(30),
    Ano int,
    Numero int,
    PRIMARY KEY (Tabela, Ano)
);

CREATE TABLE dbo.NumeracaoDocumento (
    UnidGestora int,
    CodTipoDoc int,
    AnoDoc int,
    NumDoc int,
    PRIMARY KEY (UnidGestora, CodTipoDoc, AnoDoc)
);

CREATE TABLE dbo.NumeracaoFaixa (
    UnidGestora int,
    Tabela varchar(50),
    TabelaCampo varchar(50),
    NumeracaoTamFaixa int,
    NumeracaoFaixa int,
    Ativo bit,
    PRIMARY KEY (UnidGestora, Tabela, TabelaCampo)
);

CREATE TABLE dbo.ObjetivoFinanceiro (
    CodObjetivoFinanceiro int,
    CodAreaVenda int,
    CodRota int,
    Tipo int,
    DataDe datetime,
    DataAte datetime,
    Valor float,
    Positivacao int,
    ValorNaoGerenciaveis float,
    PositivacaoNaoGerenciaveis int,
    PRIMARY KEY (CodObjetivoFinanceiro)
);

CREATE TABLE dbo.ObjetivoFinanceiroAnual (
    CodObjetivoFinanceiroAnual int,
    CodAreaVenda int,
    Mes int,
    Valor float,
    PRIMARY KEY (CodObjetivoFinanceiroAnual)
);

CREATE TABLE dbo.ObjetivoFinanceiroFabricante (
    CodObjetivoFinanceiro int,
    CodFabricante int,
    Valor float,
    positivacao int,
    PRIMARY KEY (CodObjetivoFinanceiro, CodFabricante)
);

CREATE TABLE dbo.Orcamento (
    CodConta char(7),
    Ano int,
    Mes int,
    Valor float,
    Valor1 float,
    Valor2 float,
    Valor3 float,
    Valor4 float,
    Valor5 float,
    Valor6 float,
    Valor7 float,
    Valor8 float,
    Valor9 float,
    Valor10 float,
    Valor11 float,
    Valor12 float,
    Valor13 float,
    Valor14 float,
    Valor15 float,
    Valor16 float,
    Valor17 float,
    Valor18 float,
    Valor19 float,
    Valor20 float,
    PRIMARY KEY (CodConta, Ano, Mes)
);

CREATE TABLE dbo.PagamentoDados (
    CodPagamentoDados int,
    CodTipo int,
    Usuario varchar(50),
    DataRegistro datetime,
    Arquivo varchar(250),
    Status int,
    UsuarioEstorno varchar(50),
    DataEstorno datetime,
    DataLancamento datetime,
    ArquivoCompleto text,
    PRIMARY KEY (CodPagamentoDados)
);

CREATE TABLE dbo.PagamentoDadosItens (
    CodPagamentoDadosItens int,
    CodPagamentoDados int,
    CodContaPagar int,
    Status char(3),
    CodErro varchar(200),
    CodMapaExpedicaoDespesa int,
    CodFuncionarioExtrato int,
    PRIMARY KEY (CodPagamentoDadosItens)
);

CREATE TABLE dbo.PagamentoFormato (
    CodPagamentoFormato int,
    BancoCodigo varchar(3),
    Agencia varchar(5),
    AgenciaDV char(1),
    Conta varchar(12),
    ContaDV char(1),
    BancoNome varchar(30),
    Convenio varchar(20),
    Descricao varchar(50),
    UnidGestora int,
    PRIMARY KEY (CodPagamentoFormato)
);

CREATE TABLE dbo.PagamentoPeriodico (
    CodPagamentoPeriodico int,
    PagamentoPeriodico varchar(100),
    Ativo bit,
    Descricao varchar(100),
    PRIMARY KEY (CodPagamentoPeriodico)
);

CREATE TABLE dbo.PagamentoPeriodicoItem (
    CodPagamentoPeriodicoItem int,
    CodPagamentoPeriodico int,
    Valor float,
    CodFornecedor int,
    CodConta varchar(20),
    CodCentroCusto int,
    CodMoeda int,
    PRIMARY KEY (CodPagamentoPeriodicoItem)
);

CREATE TABLE dbo.PagamentoTipo (
    CodPagamentoTipo int,
    PagamentoTipo varchar(50),
    PRIMARY KEY (CodPagamentoTipo)
);

CREATE TABLE dbo.PaisIBGE (
    CodPaisIBGE int,
    PaisIBGE varchar(100),
    DDI varchar(10),
    PRIMARY KEY (CodPaisIBGE)
);

CREATE TABLE dbo.Patrimonio (
    CodPatrimonio int,
    Patrimonio varchar(100),
    NumeroPatrimonio int,
    NotaFiscal varchar(50),
    TipoEquipamento int,
    TipoFreezer int,
    CodContrato int,
    CodCliente int,
    CodPatrimonioTipo int,
    NotaFiscalData datetime,
    NumeroSerie varchar(50),
    Ativo bit,
    Status int,
    CodBarra varchar(20),
    ValorPatrimonio float,
    DepreciacaoPatrimonio float,
    CodMotivoInativacao int,
    DataInativacao datetime,
    OrigemDoBemIncorporado int,
    UtilizacaoDoBemIncorporado int,
    ParcelasApropriadas int,
    CSTPIS int,
    CSTCOFINS int,
    AtivoImobilizado bit,
    IdentDoBemIncorporado int,
    AliquotaPIS float,
    AliquotaCOFINS float,
    DataExtincaoCredito datetime,
    CreditoUsadoTotalmente bit,
    BlocoDeLancamento int,
    UnidGestora int,
    DataEntrada datetime,
    Funcao varchar(255),
    CodConta char(7),
    CodCentroCusto int,
    TipoMercadoria char(1),
    CodPatrimonioPrincipal int,
    DataEntradaCIAP datetime,
    ValorICMS float,
    ValorICMSSubst float,
    ValorFrete float,
    ValorICMSDiferencial float,
    CodFornecedor int,
    CodDoc int,
    CodMaterial int,
    MaterialSequencia int,
    NFModelo varchar(3),
    CodCTe int,
    CodPlanoContabil varchar(20),
    ChaveNFe varchar(50),
    CodDepreciacao int,
    Obra bit,
    ObraSituacao char(10),
    PRIMARY KEY (CodPatrimonio)
);

CREATE TABLE dbo.PatrimonioMeta (
    CodTabelaMeta int,
    CodPatrimonioTipo int,
    Mes int,
    Meta float,
    PRIMARY KEY (CodTabelaMeta, CodPatrimonioTipo, Mes)
);

CREATE TABLE dbo.PatrimonioServico (
    CodPatrimonioServico int,
    NumPatrimonioServico int,
    Ano int,
    CodTipo int,
    Situacao varchar(1),
    DataInicio datetime,
    DataPrevista datetime,
    DataFim datetime,
    Valor float,
    CodPatrimonio int,
    CodCliente int,
    CodFuncionario int,
    Descricao varchar(max),
    Solucao varchar(200),
    Prioridade int,
    CodSetor int,
    CodTipoManutencao int
);

CREATE TABLE dbo.PatrimonioServicoClassificador (
    CodPatrimonioServico int,
    CodClassificador int
);

CREATE TABLE dbo.PatrimonioServicoDetalhe (
    CodPatrimonioServico int,
    Tecnico1 varchar(100),
    Tecnico2 varchar(100),
    Conferente varchar(100)
);

CREATE TABLE dbo.PatrimonioServicoItens (
    CodPatrimonioServico int,
    CodMaterial int,
    CodEmbalagem int,
    CodUnidade int,
    Sequencia int,
    Quantidade float,
    QtdEmbalagem int,
    ValorEmbalagem float,
    Valor float,
    DataInicio datetime,
    DataFim datetime,
    CodDoc int
);

CREATE TABLE dbo.PatrimonioTipo (
    CodPatrimonioTipo int,
    PatrimonioTipo varchar(50),
    PatrimonioTipoSigla varchar(10),
    CodGrupo int,
    Ativo bit,
    Meta bit,
    CodArmazenamento int,
    PRIMARY KEY (CodPatrimonioTipo)
);

CREATE TABLE dbo.PDVCaixa (
    CodPDVCaixa int,
    DataLancamento datetime,
    CodConta int,
    Historico varchar(50),
    Valor numeric(15,2),
    Usuario varchar(50),
    Data datetime
);

CREATE TABLE dbo.PDVCartaCredito (
    CodPDVCartaCredito int,
    CodPDVCartaCreditoDV int,
    CodCupom int,
    ECFSerial varchar(60),
    CodCliente int,
    Valor float,
    CadastroData datetime,
    CadastroUsuario varchar(50),
    Status char(1),
    UtilizadoCodCupom int,
    UtilizadoECFSerial varchar(60),
    UtilizadoData datetime,
    UtilizadoUsuario varchar(50),
    QtdDias int,
    PRIMARY KEY (CodPDVCartaCredito)
);

CREATE TABLE dbo.PDVCupom (
    CodCupom int,
    ECFSerial varchar(60),
    COO varchar(10),
    CCF varchar(10),
    CodCliente int,
    ClienteCPFCNPJ varchar(30),
    ClienteNome varchar(100),
    ClienteEndereco varchar(100),
    TotalBruto numeric(15,3),
    Descontos numeric(15,3),
    Acrescimos numeric(15,3),
    TotalLiquido numeric(15,3),
    Data datetime,
    Usuario varchar(100),
    Status char(1),
    MDF varchar(60),
    MDFAdic varchar(60),
    UnidGestora int,
    CodAlmoxarifado int,
    HashKey varchar(32),
    PV int,
    SituacaoPagamento char(1),
    CodPDVCupom int,
    IBPTImposto numeric(15,3),
    Devolvido int,
    CodVendedor int,
    DAV int,
    CRZ varchar(10),
    CodNFCeFormato int,
    Serie int,
    EmitirNotaEstoque char(1),
    MotivoDevolucao varchar(100),
    CodPocket int,
    CodDoc int,
    CodPedidoVenda int,
    PRIMARY KEY (CodCupom, ECFSerial)
);

CREATE TABLE dbo.PDVCupomItens (
    CodCupom int,
    ECFSerial varchar(60),
    Item int,
    CodTabelaPreco int,
    CodMaterial int,
    CodEmbalagem int,
    Quantidade numeric(15,3),
    QtdEmbalagem int,
    ValorEmbalagem numeric(15,3),
    Desconto numeric(15,3),
    Acrescimo numeric(15,3),
    ValorTotal numeric(15,3),
    Aliquota varchar(10),
    Data datetime,
    Usuario varchar(100),
    Status char(1),
    HashKey varchar(32),
    CodNaturezaOpFiscal int,
    ICMS float,
    iBaseICMS int,
    iBaseICMSIsento int,
    iValorICMS int,
    TipoPIS int,
    PIS float,
    PISUnit float,
    PISUnitTipo int,
    iBasePIS int,
    iBasePISIsento int,
    iBasePISQtd int,
    iValorPIS int,
    AliquotaPIS float,
    cstPIS int,
    TipoCOFINS int,
    COFINS float,
    COFINSUnit float,
    COFINSUnitTipo int,
    iBaseCOFINS int,
    iBaseCOFINSIsento int,
    iBaseCOFINSQtd int,
    iValorCOFINS int,
    AliquotaCOFINS float,
    cstCOFINS int,
    Desconto2 numeric(15,3),
    CSTIBSCBS int,
    CSTIBSCBSClassTrib int,
    TipoIS int,
    ISAliquota float,
    ISAliquotaUnit float,
    ISUnidadeTrib varchar(10),
    ISQtdTrib float,
    IValorIS bigint,
    ValorIS float,
    TipoIBSCBS int,
    IBaseIBSCBS bigint,
    BaseIBSCBS float,
    AliquotaCBS float,
    CBS float,
    IValorCBS bigint,
    AliquotaCBSDif float,
    CBSDif float,
    IValorCBSDif bigint,
    AliquotaCBSDevolucao float,
    CBSDevolucao float,
    IValorCBSDevolucao bigint,
    CBSRedAliq float,
    CBSAliquotaEfetiva float,
    CBSMonoAliquotaUnit float,
    AliquotaCBSMonoAdRemIBS float,
    AliquotaCBSMonoAdRemCBS float,
    CBSMonoAdRemIBS float,
    CBSMonoAdRemCBS float,
    AliquotaIBSUF float,
    IBSUF float,
    IValorIBSUF bigint,
    AliquotaIBSUFDif float,
    IBSUFDif float,
    IValorIBSUFDif bigint,
    AliquotaIBSUFDevolucao float,
    IBSUFDevolucao float,
    IValorIBSUFDevolucao bigint,
    IBSUFRedAliq float,
    IBSUFAliquotaEfetiva float,
    AliquotaIBSMun float,
    IBSMun float,
    IValorIBSMun bigint,
    AliquotaIBSMunDif float,
    IBSMunDif float,
    IValorIBSMunDif bigint,
    AliquotaIBSMunDevolucao float,
    IBSMunDevolucao float,
    IValorIBSMunDevolucao bigint,
    IBSMunRedAliq float,
    IBSMunAliquotaEfetiva float,
    TribRegCstIBSCBS int,
    TribRegCstIBSCBSClassTrib int,
    TribRegAliquotaCBS float,
    TribRegAliquotaIBSUF float,
    TribRegAliquotaIBSMun float,
    CBSMonoRetAdRemIBS float,
    CBSMonoRetAdRemCBS float,
    cCredPres int,
    pIBSCredPres float,
    vIBSCredPres float,
    pIBSCredPresCondSus float,
    vIBSCredPresCondSus float,
    pCBSCredPres float,
    vCBSCredPres float,
    pCBSCredPresCondSus float,
    vCBSCredPresCondSus float,
    competApur varchar(10),
    tpCredPresIBSZFM int,
    pCredPresIBSZFM float,
    vCredPresIBSZFM float,
    PRIMARY KEY (CodCupom, ECFSerial, Item)
);

CREATE TABLE dbo.PDVCupomParcelas (
    CodCupom int,
    ECFSerial varchar(60),
    Item int,
    CodMoeda int,
    Total numeric(15,3),
    Data datetime,
    Usuario varchar(100),
    HashKey varchar(32),
    DataVencimento datetime,
    Documento varchar(50),
    Titular varchar(100),
    Agencia varchar(20),
    Banco int,
    Conta varchar(20),
    CNPJ varchar(15),
    CPF varchar(11),
    NumCheque varchar(20),
    CodPDVCartaCredito int,
    CodMoedaFinanceiro int,
    TEFNSU varchar(50),
    TEFRede varchar(50),
    TEFDataHoraTransacao datetime,
    TEFFinalizacao varchar(50),
    Status char(1),
    TEFTotalCancelado numeric(15,2)
);

CREATE TABLE dbo.PDVDAVAudit (
    CodPDVDAVAudit int,
    CodPocket int,
    CodDoc int,
    Sequencia int,
    Tipo char(1),
    Data datetime,
    Usuario varchar(50),
    PRIMARY KEY (CodPDVDAVAudit)
);

CREATE TABLE dbo.PDVDefinicoes (
    ECFSerial varchar(60),
    Definicao varchar(60),
    Valor varchar(200),
    Descricao varchar(200),
    PRIMARY KEY (ECFSerial, Definicao)
);

CREATE TABLE dbo.PDVDevolucao (
    CodPDVDevolucao int,
    CodCupom int,
    CodCliente int,
    ECFSerial varchar(60),
    CodPDVCartaCredito int,
    Valor float,
    DataCadastro datetime,
    UsuarioCadastro varchar(50),
    Ativo bit,
    PRIMARY KEY (CodPDVDevolucao)
);

CREATE TABLE dbo.PDVDevolucaoItens (
    CodPDVDevolucaoItens int,
    CodPDVDevolucao int,
    Item int,
    Quantidade numeric(15,3),
    Valor numeric(15,3),
    PRIMARY KEY (CodPDVDevolucaoItens)
);

CREATE TABLE dbo.PDVECF (
    ECFSerial varchar(60),
    UnidGestora int,
    MFD varchar(60),
    MFAdic varchar(60),
    Tipo varchar(10),
    Marca varchar(60),
    Modelo varchar(60),
    Loja varchar(10),
    Caixa varchar(10),
    SBVersao varchar(20),
    SBData datetime,
    CNPJ varchar(30),
    IE varchar(30),
    IM varchar(30),
    COO varchar(10),
    CCF varchar(10),
    GNF varchar(10),
    GRZ varchar(10),
    Data datetime,
    Usuario varchar(100),
    HashKey varchar(32),
    CodAlmoxarifado int,
    PRIMARY KEY (ECFSerial)
);

CREATE TABLE dbo.PDVHash (
    ECF varchar(32),
    HashKey1 varchar(32),
    HashKey2 varchar(32),
    HashKey3 varchar(32),
    HashKey4 varchar(32),
    HashKey5 varchar(32),
    HashKey6 varchar(32),
    PRIMARY KEY (ECF)
);

CREATE TABLE dbo.PDVNaoFiscal (
    ECFSerial varchar(60),
    COO varchar(10),
    GNF varchar(10),
    GRG varchar(10),
    CDC varchar(10),
    Indice varchar(10),
    Descricao varchar(50),
    Valor numeric(15,2),
    Data datetime,
    Usuario varchar(100),
    HashKey varchar(32),
    PRIMARY KEY (ECFSerial, COO)
);

CREATE TABLE dbo.PDVReducaoZ (
    ECFSerial varchar(60),
    CRZ varchar(10),
    MFD varchar(60),
    MFAdic varchar(60),
    Tipo varchar(10),
    Marca varchar(60),
    Modelo varchar(60),
    Loja varchar(10),
    Caixa varchar(10),
    SBVersao varchar(20),
    SBData datetime,
    CNPJ varchar(30),
    IE varchar(30),
    IM varchar(30),
    DataMovimento datetime,
    COOInicial varchar(10),
    COOFinal varchar(10),
    CCF varchar(10),
    CRO varchar(10),
    VendaBruta numeric(15,2),
    GrandeTotal numeric(15,2),
    Data datetime,
    Usuario varchar(100),
    HashKey varchar(32),
    EmitirNotaEstoque char(1),
    CodPDVReducaoZ int,
    PRIMARY KEY (ECFSerial, CRZ)
);

CREATE TABLE dbo.PDVReducaoZItens (
    ECFSerial varchar(60),
    CRZ varchar(10),
    Item int,
    Grupo varchar(50),
    Descricao varchar(50),
    Valor varchar(20),
    Indice varchar(10),
    Aliquota varchar(10),
    Tipo varchar(20),
    HashKey varchar(32),
    PRIMARY KEY (ECFSerial, CRZ, Item)
);

CREATE TABLE dbo.PDVVersao (
    Versao varchar(20),
    Data datetime,
    MD5 varchar(32),
    Contador int,
    PRIMARY KEY (Versao)
);

CREATE TABLE dbo.PedidoImagem (
    CodPedidoImagem int,
    CodPedidoVenda int,
    Imagem image,
    Descricao varchar(200),
    Data datetime,
    Recebedor varchar(50),
    CPFRecebedor varchar(11),
    ImagemB64 varchar(max),
    CodPocket int,
    CodDoc int,
    UUIDPocketImagens uniqueidentifier,
    PRIMARY KEY (CodPedidoImagem)
);

CREATE TABLE dbo.PedidoVenda (
    CodPedidoVenda int,
    NumPedidoVenda int,
    UnidGestora int,
    Ano int,
    Data datetime,
    DataVenda datetime,
    CodCliente int,
    CodVendedor int,
    CodNaturezaOperacao int,
    CodNaturezaOpFiscal int,
    Status int,
    Situacao char(1),
    SituacaoAnterior char(1),
    SituacaoPagamento char(1),
    CodFormaReceb int,
    EmitiuPedido bit,
    EmitiuDuplicata bit,
    EmitiuBoleto bit,
    EmitiuNotaFiscal bit,
    CodNotaFiscal int,
    NotaFiscalDataEmissao datetime,
    NotaFiscalDesconto float,
    NotaFiscalBaseICMS float,
    NotaFiscalICMS float,
    NotaFiscalBaseSubst float,
    NotaFiscalICMSSubst float,
    NotaFiscalTotalProdutos float,
    NotaFiscalFrete float,
    NotaFiscalSeguro float,
    NotaFiscalDespesas float,
    NotaFiscalBaseIPI float,
    NotaFiscalIPI float,
    NotaFiscalTotal float,
    NotaFiscalVolume float,
    NotaFiscalVolumes int,
    NotaFiscalPesoBruto float,
    NotaFiscalPesoLiquido float,
    FretePorConta char(1),
    CodTransportador int,
    CodVeiculo int,
    DadosAdicionais1 varchar(50),
    DadosAdicionais2 varchar(50),
    DadosAdicionais3 varchar(50),
    DadosAdicionais4 varchar(50),
    DadosAdicionais5 varchar(50),
    DataPrevExpedicao datetime,
    TipoValor char(1),
    SaldoUtilizado float,
    Valor float,
    ValorEmbRetornavel float,
    ValorRecebido float,
    Observacao varchar(200),
    UsuarioEmissao varchar(50),
    UsuarioPedido varchar(50),
    UsuarioDuplicata varchar(50),
    UsuarioBoleto varchar(50),
    UsuarioNotaFiscal varchar(50),
    UsuarioExpedicao varchar(50),
    UsuarioCancelamento varchar(50),
    UsuarioEntrega varchar(50),
    UsuarioRecebimento varchar(50),
    DataExpedicao datetime,
    CodPedidoVendaExpedicao int,
    DataCancelamento datetime,
    MotivoCancelamento varchar(50),
    DataRecebimento datetime,
    CodCaixa int,
    DataEntrega datetime,
    CodBancoBoleto int,
    CodTabelaPreco int,
    CodPocketDocumento int,
    CodPocketDocProcess int,
    CodResponsavel int,
    ComissaoProc bit,
    ComissaoProcData datetime,
    ComissaoProcUsuario varchar(50),
    ComissaoEstProcData datetime,
    ComissaoEstProcUsuario varchar(50),
    ComissaoValor float,
    ComissaoPercentual float,
    ComissaoRepasse bit,
    ComissaoRepasseData datetime,
    ComissaoRepasseUsuario varchar(50),
    ComissaoLiberacao bit,
    ComissaoLiberacaoData datetime,
    ComissaoLiberacaoUsuario varchar(50),
    Resumo varchar(200),
    CodPedidoVendaRepasse int,
    CodMapaExpedicao int,
    UsuarioEstorno varchar(50),
    DataEstorno datetime,
    MotivoEstorno varchar(50),
    CodPedidoApoio int,
    NumPedidoApoio int,
    AnoPedidoApoio int,
    CodPedidoDevolucao int,
    NumPedidoDevolucao int,
    AnoPedidoDevolucao int,
    UsuarioEdicao varchar(50),
    DataEdicao datetime,
    UnidGestoraEstoque int,
    EmitiuCartao bit,
    UsuarioCartao varchar(50),
    DataCartao datetime,
    Titular varchar(100),
    NumCartao varchar(20),
    NumGuia varchar(50),
    CodMapaProducao int,
    ComissaoProcSup bit,
    ComissaoProcDataSup datetime,
    ComissaoProcUsuarioSup varchar(50),
    ComissaoEstProcDataSup datetime,
    ComissaoEstProcUsuarioSup varchar(50),
    ComissaoValorSup float,
    ComissaoPercentualSup float,
    ComissaoRepasseSup bit,
    ComissaoRepasseDataSup datetime,
    ComissaoRepasseUsuarioSup varchar(50),
    ComissaoLiberacaoSup bit,
    ComissaoLiberacaoDataSup datetime,
    ComissaoLiberacaoUsuarioSup varchar(50),
    CodPedidoVendaRepasseSup int,
    CodFormaRecebOrig int,
    ComissaoEstLibData datetime,
    ComissaoEstLibUsuario varchar(50),
    ComissaoEstLibDataSup datetime,
    ComissaoEstLibUsuarioSup varchar(50),
    CodCobrador int,
    ComissaoCobrador float,
    ComissaoLiberacaoCob bit,
    ComissaoRepasseCob bit,
    CodMaterialDescricao int,
    SaldoVendaMestre float,
    CodClienteApoio int,
    NotaFiscalBasePIS float,
    NotaFiscalPIS float,
    NotaFiscalBaseCOFINS float,
    NotaFiscalCOFINS float,
    EmitiuDanfe bit,
    NotaFiscalBaseICMSIsento float,
    NotaFiscalBaseSubstIsento float,
    NotaFiscalBaseIPIIsento float,
    NotaFiscalBasePISIsento float,
    NotaFiscalBaseCOFINSIsento float,
    NotaFiscalBaseImpostos float,
    NotaFiscalDescontoRef float,
    CCSituacao varchar(1),
    CCDataAtendimento datetime,
    CCDataEntrega datetime,
    CCUsuarioAtendimento varchar(50),
    CCUsuarioEntrega varchar(50),
    FidelidadeProc bit,
    FidelidadeProcData datetime,
    FidelidadeProcValor float,
    Fidelidade bit,
    FidelidadeDataProc datetime,
    Especificacao text,
    NotaFiscalDescontoFin float,
    NotaFiscalDataSaida datetime,
    NotaFiscalICMSSN float,
    NotaFiscalICMSOutros float,
    NotaFiscalEspecie varchar(60),
    NotaFiscalMarca varchar(60),
    CodPropostaTipo int,
    ExportacaoUFEmbarque char(2),
    ExportacaoLocalEmbarque varchar(60),
    ImportacaoNumDI varchar(10),
    ImportacaoDataDI datetime,
    ImportacaoUFDesembaraco char(2),
    ImportacaoLocalDesembaraco varchar(60),
    ImportacaoDataDesembaraco datetime,
    Empenho varchar(17),
    EmpenhoPedido varchar(60),
    EmpenhoContrato varchar(60),
    InicioConferencia datetime,
    FimConferencia datetime,
    NotaFiscalBasePISST float,
    NotaFiscalBasePISSTIsento float,
    NotaFiscalPISST float,
    NotaFiscalBaseCOFINSST float,
    NotaFiscalBaseCOFINSSTIsento float,
    NotaFiscalCOFINSST float,
    NotaFiscalBaseISSQN float,
    NotaFiscalBaseISSQNIsento float,
    NotaFiscalISSQN float,
    NotaFiscalBaseII float,
    NotaFiscalII float,
    NotaFiscalIIDesp float,
    NotaFiscalIIIOF float,
    TaxaCambio float,
    VeiculoPlaca char(8),
    VeiculoUF char(2),
    VeiculoRNTC varchar(50),
    UsuarioConferencia varchar(50),
    DadosAdicionais text,
    Invoice varchar(20),
    InvoiceEntrega int,
    InvoiceFrete float,
    InvoiceSeguro float,
    InvoiceDespesas float,
    ValorDescontoFlex float,
    ValorAcrescimoFlex float,
    LimiteFlex float,
    LimiteFlexRef float,
    CodPDVCupom int,
    ImportacaoViaTransporte int,
    ImportacaoNotaFiscalValorAFRMM float,
    NotaFiscalAcrescimoFin float,
    NFeFinalidade int,
    NotaFiscalBaseICMSOutros float,
    NotaFiscalBaseICMSUFDest float,
    NotaFiscalValorICMSUFDest float,
    NotaFiscalValorICMSFCPUFDest float,
    NotaFiscalValorICMSUFRemet float,
    StatusConferencia int,
    ObservacaoBoleto varchar(100),
    FidelidadeProcPontuacao int,
    CodFuncionarioConferencia int,
    PrioridadeConferencia int,
    CodFidelidadeExtrato int,
    CodFidelidadeExtratoResgate int,
    FidelidadeProcPontuacaoResgate int,
    NotaFiscalICMSIsento float,
    NotaFiscalICMSDif float,
    NotaFiscalICMSFCP float,
    NotaFiscalICMSFCPSubst float,
    CodClienteAvalista int,
    CodCaixaClienteExtrato int,
    NotaFiscalICMSFuncep float,
    TEFBandeira varchar(50),
    CodCaixaReceb int,
    CodSupervisor int,
    CodTabelaPrecoCusto int,
    CodTabelaPrecoReferencia int,
    CodTabelaPrecoCustoReferencia int,
    EmitiuPix bit,
    UsuarioPix varchar(50),
    DataPix datetime,
    UUIDPix uniqueidentifier,
    UUIDTransacaoStone varchar(100),
    NotaFiscalDescontoMaterial float,
    NotaFiscalCSLL float,
    NotaFiscalIRRF float,
    NotaFiscalPrev float,
    Arquivado bit,
    NotaFiscalIS float,
    NotaFiscalBaseIBSCBS float,
    NotaFiscalIBSUF float,
    NotaFiscalIBSUFDif float,
    NotaFiscalIBSUFDevTrib float,
    NotaFiscalIBSMun float,
    NotaFiscalIBSMunDif float,
    NotaFiscalIBSMunDevTrib float,
    NotaFiscalCBS float,
    NotaFiscalCBSDif float,
    NotaFiscalCBSDevTrib float,
    NotaFiscalIBSMono float,
    NotaFiscalCBSMono float,
    NotaFiscalTotIBSCBS float,
    ObservacaoDevolucao varchar(255),
    CodDevolMotivo int,
    CodSolucao int,
    PRIMARY KEY (CodPedidoVenda)
);

CREATE TABLE dbo.PedidoVendaDocFisReferenciado (
    CodPedidoVendaDocFisReferenciado int,
    CodPedidoVenda int,
    Tipo int,
    NFeChave varchar(50),
    NFUF varchar(2),
    NFEmissao datetime,
    NFCNPJ varchar(20),
    NFSerie varchar(3),
    NFNum varchar(9),
    CFCaixa varchar(3),
    CFCOO varchar(6),
    PRIMARY KEY (CodPedidoVendaDocFisReferenciado)
);

CREATE TABLE dbo.PedidoVendaExpedicao (
    CodPedidoVendaExpedicao int,
    CodResponsavel int,
    Data datetime,
    CodMapaExpedicao int,
    PRIMARY KEY (CodPedidoVendaExpedicao)
);

CREATE TABLE dbo.PedidoVendaItens (
    CodPedidoVenda int,
    CodMaterial int,
    CodEmbalagem int,
    CodNaturezaOpFiscal int,
    Sequencia int,
    SequenciaNotaFiscal int,
    Quantidade float,
    CodUnidade int,
    QtdEmbalagem int,
    QtdEntregue float,
    QtdExpedida float,
    QtdDevolvida float,
    ValorEmbalagem float,
    ValorEmbalagemRef float,
    Desconto float,
    iValorProduto int,
    iValorDesconto int,
    ICMS float,
    iBaseICMS int,
    iBaseICMSIsento int,
    iValorICMS int,
    TipoIPI int,
    IPI float,
    iBaseIPI int,
    iBaseIPIIsento int,
    iValorIPI int,
    TipoICMSSubst int,
    ICMSSubst float,
    iBaseICMSSubst int,
    iBaseICMSSubstIsento int,
    iValorICMSSubst int,
    cst int,
    ComissaoProc bit,
    ComissaoValor float,
    ComissaoPercentual float,
    ComissaoProcSup bit,
    ComissaoValorSup float,
    ComissaoPercentualSup float,
    TipoPIS int,
    PIS float,
    iBasePIS int,
    iBasePISIsento int,
    iValorPIS int,
    AliquotaPIS float,
    cstPIS int,
    TipoCOFINS int,
    COFINS float,
    iBaseCOFINS int,
    iBaseCOFINSIsento int,
    iValorCOFINS int,
    AliquotaCOFINS float,
    cstCOFINS int,
    cstIPI int,
    AliquotaIPI float,
    AliquotaICMSSubst float,
    CodTabelaPreco int,
    CodTipo int,
    DescontoRef float,
    iValorDescontoRef int,
    Especificacao text,
    iBaseImpostos int,
    ICMSReducaoBC float,
    ICMSSTReducaoBC float,
    AliquotaICMS float,
    AliquotaICMSSUBSTperc float,
    AliquotaIPIperc float,
    AliquotaPISperc float,
    AliquotaCOFINSperc float,
    AliquotaICMSSN float,
    iValorICMSSN int,
    ICMSSN float,
    iValorFrete int,
    iValorSeguro int,
    iValorDespesas int,
    iValorICMSOutros int,
    TipoPISST int,
    PISST float,
    AliquotaPISST float,
    AliquotaPISSTperc float,
    iBasePISST int,
    iBasePISSTIsento int,
    iValorPISST int,
    TipoCOFINSST int,
    COFINSST float,
    AliquotaCOFINSST float,
    AliquotaCOFINSSTperc float,
    iBaseCOFINSST int,
    iBaseCOFINSSTIsento int,
    iValorCOFINSST int,
    TipoISSQN int,
    ISSQN float,
    AliquotaISSQN float,
    AliquotaISSQNperc float,
    iBaseISSQN int,
    iBaseISSQNIsento int,
    iValorISSQN int,
    cstISSQN char(1),
    codISSQNItem int,
    TipoII int,
    II float,
    IIBC float,
    IIDesp float,
    IIIOF float,
    iValorII int,
    iValorIIBC int,
    iValorIIDesp int,
    iValorIIIOF int,
    ValorEmbalagemRefFlex float,
    iValorDescontoFlex int,
    iValorAcrescimoFlex int,
    PISUnit float,
    PISUnitTipo int,
    iBasePISQtd int,
    COFINSUnit float,
    COFINSUnitTipo int,
    iBaseCOFINSQtd int,
    AcrescimoRef float,
    iValorAcrescimoRef int,
    CSOSimples int,
    iBaseICMSOutros int,
    AliquotaICMSOutros float,
    iBaseICMSUFDest int,
    AliquotaICMSFCPUFDest float,
    AliquotaICMSUFDest float,
    AliquotaICMSInter float,
    PercentualICMSPart float,
    iValorICMSPartUFDest int,
    iValorICMSPartUFRemet int,
    QtdVolumes int,
    CodAvariaInicial int,
    CodAvaria int,
    PrecoEmbalagem float,
    iValorICMSIsento int,
    iValorICMSDif int,
    AliquotaICMSDif float,
    AliquotaICMSFCP float,
    iValorICMSFCP int,
    AliquotaICMSFCPSubst float,
    iValorICMSFCPSubst int,
    TipoIcmsFuncep int,
    AliquotaIcmsFuncep float,
    iValorIcmsFuncep int,
    QtdPedido float,
    Pesagem bit,
    CodTabelaPrecoReferencia int,
    DescontoFin float,
    iValorDescontoFin int,
    AcrescimoFin float,
    iValorAcrescimoFin int,
    ValorEmbalagemCusto float,
    ValorEmbalagemReferencia float,
    ValorEmbalagemCustoReferencia float,
    TabelaReferencia char(1),
    DescontoMaterial float,
    iValorDescontoMaterial int,
    CSLL float,
    iValorCSLL int,
    IRRF float,
    iValorIRRF int,
    Prev float,
    iValorPrev int,
    cstIBSCBS int,
    cstIBSCBSClassTrib int,
    TipoIS int,
    ISAliquota float,
    ISAliquotaUnit float,
    ISUnidadeTrib varchar(10),
    ISQtdTrib float,
    iValorIS bigint,
    ValorIS float,
    TipoIBSCBS int,
    iBaseIBSCBS bigint,
    BaseIBSCBS float,
    AliquotaCBS float,
    CBS float,
    iValorCBS bigint,
    AliquotaCBSDif float,
    CBSDif float,
    iValorCBSDif bigint,
    AliquotaCBSDevolucao float,
    CBSDevolucao float,
    iValorCBSDevolucao bigint,
    CBSRedAliq float,
    CBSAliquotaEfetiva float,
    CBSMonoAliquotaUnit float,
    AliquotaCBSMonoAdRemIBS float,
    AliquotaCBSMonoAdRemCBS float,
    CBSMonoAdRemIBS float,
    CBSMonoAdRemCBS float,
    AliquotaIBSUF float,
    IBSUF float,
    iValorIBSUF bigint,
    AliquotaIBSUFDif float,
    IBSUFDif float,
    iValorIBSUFDif bigint,
    AliquotaIBSUFDevolucao float,
    IBSUFDevolucao float,
    iValorIBSUFDevolucao bigint,
    IBSUFRedAliq float,
    IBSUFAliquotaEfetiva float,
    AliquotaIBSMun float,
    IBSMun float,
    iValorIBSMun bigint,
    AliquotaIBSMunDif float,
    IBSMunDif float,
    iValorIBSMunDif bigint,
    AliquotaIBSMunDevolucao float,
    IBSMunDevolucao float,
    iValorIBSMunDevolucao bigint,
    IBSMunRedAliq float,
    IBSMunAliquotaEfetiva float,
    TribRegCstIBSCBS int,
    TribRegCstIBSCBSClassTrib int,
    TribRegAliquotaCBS float,
    TribRegAliquotaIBSUF float,
    TribRegAliquotaIBSMun float,
    CBSMonoRetAdRemIBS float,
    CBSMonoRetAdRemCBS float,
    cCredPres int,
    pIBSCredPres float,
    vIBSCredPres float,
    pIBSCredPresCondSus float,
    vIBSCredPresCondSus float,
    pCBSCredPres float,
    vCBSCredPres float,
    pCBSCredPresCondSus float,
    vCBSCredPresCondSus float,
    competApur varchar(10),
    tpCredPresIBSZFM int,
    pCredPresIBSZFM float,
    vCredPresIBSZFM float,
    PISReducaoBC float,
    COFINSReducaoBC float,
    PRIMARY KEY (CodPedidoVenda, Sequencia)
);

CREATE TABLE dbo.PedidoVendaParcelas (
    CodPedidoVenda int,
    Parcela smallint,
    DataVencimento datetime,
    DataCobranca datetime,
    Valor float,
    CodMoeda int,
    Valor2 float,
    DescontoFin float,
    Usuario varchar(20),
    Documento varchar(50),
    Status char(1),
    TEFNSU varchar(50),
    TEFRede varchar(50),
    TEFDataHoraTransacao datetime,
    TEFFinalizacao varchar(50),
    TEFBandeira varchar(50),
    TEFTarifa float,
    PRIMARY KEY (CodPedidoVenda, Parcela)
);

CREATE TABLE dbo.PedidoVendaPropostaItem (
    CodPedidoVenda int,
    CodPropostaTipo int,
    sequencia int,
    PropostaTipoItem varchar(50),
    PropostaTipoDescricao text,
    PRIMARY KEY (CodPedidoVenda, CodPropostaTipo, sequencia)
);

CREATE TABLE dbo.PedidoVendaRepasse (
    CodPedidoVendaRepasse int,
    Data datetime,
    Usuario varchar(50),
    CodVendedor int,
    CodSupervisor int,
    CodCobrador int,
    UsuarioEst varchar(50),
    DataEst datetime,
    CodContaPagar int,
    PRIMARY KEY (CodPedidoVendaRepasse)
);

CREATE TABLE dbo.PerfilEmail (
    CodPerfil int,
    NomPerfil varchar(50),
    ListEmail varchar(150),
    EmailCC varchar(150),
    EmailCCO varchar(150)
);

CREATE TABLE dbo.PISAliquota (
    PISAliquota float,
    Tipo int,
    Usuario varchar(50),
    Data datetime,
    PRIMARY KEY (PISAliquota, Tipo)
);

CREATE TABLE dbo.Pix (
    UUIDPix uniqueidentifier,
    CodPixFormato int,
    CodPedidoVenda int,
    CodCupom int,
    ECFSerial varchar(60),
    CodContaReceber int,
    DataCriacao datetime,
    Expiracao int,
    DevedorCPF varchar(20),
    DevedorCNPJ varchar(20),
    DevedorNome varchar(100),
    ValorOriginal float,
    ChaveRecebedor varchar(100),
    IdentificadorTransacao varchar(100),
    UrlLocalizacao varchar(200),
    QrCode varchar(max),
    SolicitacaoPagador varchar(100),
    Json varchar(max),
    Situacao varchar(50),
    DataEmissao datetime,
    UsuarioEmissao varchar(50),
    DataCancelamento datetime,
    UsuarioCancelamento varchar(50),
    DataRecebimento datetime,
    UsuarioRecebimento varchar(50),
    Enviado bit,
    CodPocket int,
    CodDoc int,
    PRIMARY KEY (UUIDPix)
);

CREATE TABLE dbo.PixFormato (
    CodPixFormato int,
    CodBanco int,
    CodPixTipo int,
    PixFormato varchar(100),
    ChaveRecebedor varchar(100),
    Expiracao int,
    Ambiente int,
    RecebedorNome varchar(25),
    RecebedorCidade varchar(15),
    BBDeveloperApplication varchar(100),
    BBClientId varchar(200),
    BBClientSecret varchar(max),
    Ativo bit,
    PRIMARY KEY (CodPixFormato)
);

CREATE TABLE dbo.PixFormatoEstatico (
    CodPixFormato int,
    IdentificadorTransacao varchar(100),
    PRIMARY KEY (CodPixFormato, IdentificadorTransacao)
);

CREATE TABLE dbo.PixRecebimento (
    UUIDPixRecebimento uniqueidentifier,
    DataRegistro datetime,
    UsuarioRegistro varchar(50),
    UUIDPix uniqueidentifier,
    SituacaoPix varchar(50),
    IdentificadorTransacao varchar(100),
    EndToEndId varchar(50),
    ValorRecebido float,
    DataRecebimento datetime,
    PagadorCPF varchar(20),
    PagadorCNPJ varchar(20),
    PagadorNome varchar(100),
    InformacaoPagador varchar(100),
    Json varchar(max),
    CodCaixa int,
    CodCaixaReceb int,
    SituacaoRecebimento char(1),
    CodPixFormato int,
    UUIDPixRecebimentoLote uniqueidentifier,
    UsuarioUso varchar(50),
    DataUso datetime,
    PRIMARY KEY (UUIDPixRecebimento)
);

CREATE TABLE dbo.PlanoConta (
    CodConta char(9),
    CodPai char(9),
    Nivel int,
    Conta varchar(100),
    ContaFull varchar(100),
    TipoContaCorrente char(20),
    Inversao bit,
    Lancamento bit,
    Natureza char(1),
    Retificadora bit,
    PRIMARY KEY (CodConta)
);

CREATE TABLE dbo.PlanoContabilDominio (
    CodContaContabil int,
    CodPlanoContabil varchar(20),
    PlanoContabil varchar(250),
    Tipo char(1),
    Natureza int,
    Nivel int,
    SPED int,
    DataInclusao datetime,
    CodPlanoContabilRFB varchar(20),
    CodPlanoContabilDominio varchar(250),
    PRIMARY KEY (CodContaContabil)
);

CREATE TABLE dbo.PlanoContabilFortes (
    CodContaContabil int,
    CodPlanoContabil varchar(20),
    PlanoContabil varchar(250),
    Tipo char(1),
    Natureza int,
    Nivel int,
    SPED int,
    DataInclusao datetime,
    CodPlanoContabilRFB varchar(20),
    CodPlanoContabilDominio varchar(250),
    PRIMARY KEY (CodContaContabil)
);

CREATE TABLE dbo.PlanoContaComplemento (
    CodConta char(9),
    CodComplemento int,
    PRIMARY KEY (CodConta, CodComplemento)
);

CREATE TABLE dbo.Pocket (
    CodPocket int,
    Pocket varchar(100),
    CodPocketTipo int,
    CodVendedor int,
    DirPDBExport varchar(100),
    DirPDBImport varchar(100),
    NumRegistro int,
    FileList image,
    QtdDias int,
    FTPUsuario varchar(50),
    FTPSenha varchar(50),
    FTPSenha2 varchar(50),
    FTPDir varchar(200),
    FTPServidor varchar(50),
    FTPServidorAux varchar(50),
    HistoricoExport bit,
    FTPSync bit,
    FTPSyncUnidGestoraEst int,
    FTPSyncRota1 int,
    FTPSyncRota2 int,
    FTPSyncRota3 int,
    FTPSyncRota4 int,
    FTPSyncRota5 int,
    FTPSyncRota6 int,
    FTPSyncRota7 int,
    FTPServidorLocal varchar(50),
    Ativo bit,
    FTPPassivo bit,
    HTTP1 varchar(50),
    HTTP2 varchar(50),
    HTTP3 varchar(50),
    FrequenciaExport bit,
    FTPSyncAux bit,
    TMPDir varchar(200),
    TimerGPS int,
    TimerWeb int,
    Aparelho varchar(100),
    VersaoAPK varchar(50),
    TodosClientesExport bit,
    LiberacaoEnvio datetime,
    AutorizaCliente bit,
    RastreioGPS bit,
    RastreioHoraInicio datetime,
    RastreioHoraFim datetime,
    RastreioMetros int,
    RastreioSegundos int,
    UUIDStoneMaquina uniqueidentifier,
    PRIMARY KEY (CodPocket)
);

CREATE TABLE dbo.PocketArquivo (
    CodArquivo int,
    Arquivo varchar(50),
    Enviar int,
    Receber int,
    Criar int,
    Compactar int
);

CREATE TABLE dbo.PocketAutorizacao (
    CodPocket int,
    CodCliente int,
    Data datetime,
    Aut01 bit,
    Aut02 bit,
    Aut03 bit,
    Aut04 bit,
    Aut05 bit,
    Aut06 bit,
    Aut07 bit,
    Aut08 bit,
    Aut09 bit,
    Aut10 bit,
    Status bit,
    PRIMARY KEY (CodPocket, CodCliente, Data)
);

CREATE TABLE dbo.PocketCliente (
    CodPocket int,
    CodPocketCliente int,
    DataCadastro datetime,
    CodVendedor int,
    Cliente varchar(100),
    ClienteFantasia varchar(100),
    Endereco varchar(100),
    CodBairro int,
    Bairro varchar(100),
    CodCidade int,
    Cidade varchar(100),
    CodEstado varchar(2),
    CEP varchar(8),
    PontoReferencia varchar(100),
    Fone varchar(20),
    Fone2 varchar(20),
    CPF varchar(11),
    CGC varchar(20),
    IE varchar(20),
    UnidGestora int,
    CodTabelaPreco int,
    CodGrupoTabelaPreco int,
    CodFormaReceb int,
    CodGrupoFormaReceb int,
    CodRota int,
    Status int,
    Numero varchar(10),
    Email varchar(100),
    CodCliente int,
    Celular varchar(20),
    Fax varchar(20),
    Complemento varchar(40),
    CodSegmento int,
    CodNaturezaOpPadrao int,
    DataNasc datetime,
    RG varchar(20),
    RGOrgao varchar(20),
    RGUF char(2),
    IM varchar(50),
    ReferComercial varchar(100),
    ReferComercialInform varchar(100),
    ReferComercialFone varchar(20),
    ReferComercial2 varchar(100),
    ReferComercial2Inform varchar(100),
    ReferComercial2Fone varchar(20),
    ReferBancaria varchar(100),
    ReferBancariaInform varchar(100),
    ReferBancariaFone varchar(20),
    Contato varchar(100),
    Latitude float,
    Longitude float,
    Observacao varchar(100),
    CamposAlterados varchar(500),
    ConsumidorFinal bit,
    CodTabelaPrecoQtd int,
    Inativar bit,
    CodRede int,
    PRIMARY KEY (CodPocket, CodPocketCliente, DataCadastro)
);

CREATE TABLE dbo.PocketClienteGPS (
    CodPocket int,
    CodCliente int,
    Data datetime,
    Status int,
    Latitude float,
    Longitude float,
    UUIDPocketClienteGPS uniqueidentifier,
    PRIMARY KEY (CodPocket, CodCliente, Data)
);

CREATE TABLE dbo.PocketDiaSemana (
    CodDiaSemana int,
    CodPocket int,
    HoraInicial datetime,
    HoraFinal datetime,
    PRIMARY KEY (CodDiaSemana, CodPocket)
);

CREATE TABLE dbo.PocketDocPesqSatisfacao (
    CodPocketDocPesqSatisfacao int,
    CodPocketPesqSatisfacao int,
    CodPocket int,
    CodVisita int,
    Satisfacao int,
    PRIMARY KEY (CodPocketDocPesqSatisfacao)
);

CREATE TABLE dbo.PocketDocProcess (
    CodPocketDocProcess int,
    Data datetime,
    Usuario varchar(50),
    Status int,
    Observacao varchar(100),
    PRIMARY KEY (CodPocketDocProcess)
);

CREATE TABLE dbo.PocketDocProcessDoc (
    CodPocketDocProcess int,
    CodPocket int,
    CodPocketDocumento int,
    Status int,
    Observacao varchar(250),
    HoraInicio datetime,
    HoraFim datetime,
    TempoTotal bigint,
    PRIMARY KEY (CodPocketDocProcess, CodPocket, CodPocketDocumento)
);

CREATE TABLE dbo.PocketDocPropostaItem (
    CodPocket int,
    CodDoc int,
    CodPropostaTipo int,
    Sequencia int,
    PropostaTipoItem varchar(50),
    PropostaTipoDescricao text,
    PRIMARY KEY (CodPocket, CodDoc, CodPropostaTipo, Sequencia)
);

CREATE TABLE dbo.PocketDocumento (
    CodPocket int,
    CodDoc int,
    UnidGestora int,
    CodTipoDoc int,
    AnoDoc int,
    NumDoc int,
    DataDoc datetime,
    DataRegistro datetime,
    HoraIni varchar(10),
    HoraFim varchar(10),
    CodCliente int,
    CodFormaReceb int,
    CodTabelaPreco int,
    CodVendedor int,
    CodVisita int,
    NotaFiscal bit,
    Observacao varchar(200),
    Status int,
    Valor float,
    CodPocketDocProcess int,
    CodPedidoVenda int,
    NumPedidoVenda int,
    AnoPedidoVenda int,
    StatusExp int,
    DataAlteracao datetime,
    ValorDescontoFlex float,
    ValorAcrescimoFlex float,
    LimiteFlex float,
    PDV bit,
    Editado bit,
    CodMapaEvento int,
    CodPropostaTipo int,
    CodPocketApoio int,
    CodDocApoio int,
    LimiteFlexRef float,
    DataCancelamento datetime,
    UsuarioCancelamento varchar(20),
    MotivoCancelamento varchar(255),
    DataEntradaSis datetime,
    COO varchar(10),
    DAVData datetime,
    DAVUsuario varchar(50),
    HashKey varchar(32),
    Solicitante varchar(50),
    ObservacaoNFe varchar(150),
    StatusPDV int,
    CodPocketDocumento int,
    NotaFiscalFrete float,
    EmpenhoPedido varchar(60),
    PRIMARY KEY (CodPocket, CodDoc)
);

CREATE TABLE dbo.PocketDocumentoItens (
    CodPocket int,
    CodDoc int,
    Sequencia int,
    CodMaterial1 int,
    CodEmbalagem1 int,
    Qtd1 float,
    ValorEmbalagem1 float,
    Desconto1 float,
    Status int,
    CodMaterial2 int,
    CodEmbalagem2 int,
    Qtd2 float,
    ValorEmbalagem2 float,
    Desconto2 float,
    CodTabelaPreco int,
    CodTipo int,
    ValorEmbalagemRefFlex float,
    iValorDescontoFlex int,
    iValorAcrescimoFlex int,
    CodAvaria int,
    HashKey varchar(32),
    Reemitido bit,
    PRIMARY KEY (CodPocket, CodDoc, Sequencia)
);

CREATE TABLE dbo.PocketDocumentoRegra (
    CodPocketDocumentoRegra int,
    PocketDocumentoRegra varchar(100),
    Ativo bit,
    ValorLimite float,
    QuantidadeLimite float,
    RegraGrupoLimite int,
    RegraGrupoExcluidoDoPedido int,
    RegraGrupoInseridoNoPedido int,
    PRIMARY KEY (CodPocketDocumentoRegra)
);

CREATE TABLE dbo.PocketDocumentoRegraGrupo (
    CodPocketDocumentoRegraGrupo int,
    PocketDocumentoRegraGrupo varchar(100),
    PRIMARY KEY (CodPocketDocumentoRegraGrupo)
);

CREATE TABLE dbo.PocketDocumentoRegraGrupoItens (
    CodPocketDocumentoRegraGrupo int,
    CodGrupo int,
    Grupo varchar(50),
    CodFull varchar(50),
    PRIMARY KEY (CodPocketDocumentoRegraGrupo, CodGrupo)
);

CREATE TABLE dbo.PocketFTPSyncLog (
    CodPocketFTPSyncLog int,
    CodPocket int,
    Data datetime,
    Msg varchar(100),
    Tipo varchar(1),
    PRIMARY KEY (CodPocketFTPSyncLog)
);

CREATE TABLE dbo.PocketGPS (
    CodPocketGPS int,
    CodPocket int,
    Ativo bit,
    Data datetime,
    Altitude float,
    Latitude float,
    Longitude float,
    Status int,
    CodEmpresa int,
    CodVendedor int,
    PRIMARY KEY (CodPocketGPS)
);

CREATE TABLE dbo.PocketLogErro (
    Data datetime,
    Sistema nvarchar(50),
    CodVendedor int,
    Erro nvarchar(50),
    ExceptionMessage nvarchar(200),
    Obs nvarchar(200),
    CodPocket int,
    Form nvarchar(50),
    Procedimento nvarchar(50),
    PRIMARY KEY (Data)
);

CREATE TABLE dbo.PocketMensagem (
    CodMensagem int,
    CodPocket int,
    DataRecebimento datetime,
    PRIMARY KEY (CodMensagem, CodPocket)
);

CREATE TABLE dbo.PocketNumeracao (
    Tabela varchar(30),
    Ano int,
    Numero int,
    CodPocket int,
    PRIMARY KEY (Tabela, Ano, CodPocket)
);

CREATE TABLE dbo.PocketPedidoVenda (
    UnidGestora int,
    CodPedidoVenda int,
    NumPedidoVenda int,
    Ano int,
    DataVenda datetime,
    CodCliente int,
    CodFormaReceb int,
    CodTabelaPreco int,
    Valor float,
    PRIMARY KEY (CodPedidoVenda)
);

CREATE TABLE dbo.PocketPedidoVendaItens (
    CodPedidoVenda int,
    CodMaterial int,
    CodEmbalagem int,
    Quantidade float,
    ValorEmbalagem float,
    Desconto float,
    PRIMARY KEY (CodPedidoVenda, CodMaterial)
);

CREATE TABLE dbo.PocketPesqSatisfacao (
    CodPocketPesqSatisfacao int,
    Pergunta varchar(100),
    PRIMARY KEY (CodPocketPesqSatisfacao)
);

CREATE TABLE dbo.PocketPontoMovimento (
    CodFuncionario int,
    Dia datetime,
    UnidGestora int,
    CodCliente1 int,
    Ent1 datetime,
    LatitudeEnt1 float,
    LongitudeEnt1 float,
    TipoLocalizacaoEnt1 int,
    Sai1 datetime,
    LatitudeSai1 float,
    LongitudeSai1 float,
    TipoLocalizacaoSai1 int,
    CodCliente2 int,
    Ent2 datetime,
    LatitudeEnt2 float,
    LongitudeEnt2 float,
    TipoLocalizacaoEnt2 int,
    Sai2 datetime,
    LatitudeSai2 float,
    LongitudeSai2 float,
    TipoLocalizacaoSai2 int,
    CodCliente3 int,
    Ent3 datetime,
    LatitudeEnt3 float,
    LongitudeEnt3 float,
    TipoLocalizacaoEnt3 int,
    Sai3 datetime,
    LatitudeSai3 float,
    LongitudeSai3 float,
    TipoLocalizacaoSai3 int,
    PRIMARY KEY (CodFuncionario, Dia, UnidGestora)
);

CREATE TABLE dbo.PocketRastreio (
    CodPocketRastreio int,
    CodPocket int,
    Localizacao varchar(200),
    Latitude float,
    Longitude float,
    DataHora datetime,
    PRIMARY KEY (CodPocketRastreio)
);

CREATE TABLE dbo.PocketSincronizacao (
    VersaoAndroid varchar(20),
    CodSyncDataBase smallint,
    CodSyncEstoque smallint,
    PRIMARY KEY (VersaoAndroid)
);

CREATE TABLE dbo.PocketTabelaPreco (
    CodPocket int,
    CodTabelaPreco int,
    Usuario varchar(50),
    Data datetime,
    PRIMARY KEY (CodPocket, CodTabelaPreco)
);

CREATE TABLE dbo.PocketTabelas (
    NomeTabela varchar(50),
    Campos varchar(250),
    Onde varchar(150),
    Enviar bit,
    Baixar bit,
    Descricao varchar(30),
    Ordem int,
    PRIMARY KEY (NomeTabela)
);

CREATE TABLE dbo.PocketTipo (
    CodPocketTipo int,
    Tipo varchar(50),
    PRIMARY KEY (CodPocketTipo)
);

CREATE TABLE dbo.PocketTipoDocumento (
    CodPocket int,
    CodTipoDoc int,
    Usuario varchar(50),
    Data datetime,
    PRIMARY KEY (CodPocket, CodTipoDoc)
);

CREATE TABLE dbo.PocketTransmissao (
    CodPocket int,
    CodTransmissao int,
    Data datetime,
    NumTabela int,
    PRIMARY KEY (CodPocket, CodTransmissao)
);

CREATE TABLE dbo.PocketVersao (
    CodPocket int,
    Versao varchar(10),
    Data datetime,
    CodModulo01 int,
    CodModulo02 int,
    CodModulo03 int,
    CodModulo04 int,
    CodModulo05 int,
    PRIMARY KEY (CodPocket, Versao)
);

CREATE TABLE dbo.PocketVisita (
    CodPocket int,
    CodVisita int,
    Ano int,
    Num int,
    Data datetime,
    HoraIni varchar(10),
    HoraFim varchar(10),
    CodCliente int,
    CodConfPatrimonio int,
    CodDocVenda int,
    CodNaoVenda int,
    CodVendedor int,
    Historico2 varchar(100),
    Historico3 varchar(100),
    Limpeza bit,
    QtdPedidos int,
    Venda bit,
    Historico varchar(200),
    StatusSolicitacao int,
    UsuarioSolicitacao varchar(20),
    DataSolicitacao datetime,
    Latitude float,
    Longitude float,
    PRIMARY KEY (CodPocket, CodVisita)
);

CREATE TABLE dbo.PontoHorario (
    CodPontoHorario int,
    Horario varchar(50),
    ExtraFeriado bit,
    ExtraCalculo int,
    Fechamento datetime,
    PRIMARY KEY (CodPontoHorario)
);

CREATE TABLE dbo.PontoHorarioDia (
    CodPontoHorario int,
    DiaSemana int,
    Ent1 datetime,
    Sai1 datetime,
    Ent2 datetime,
    Sai2 datetime,
    Ent3 datetime,
    Sai3 datetime,
    ToleranciaFalta int,
    ToleranciaExtra int,
    Compensado bit,
    CargaHoraria datetime,
    AutoEnt1 bit,
    AutoSai1 bit,
    AutoEnt2 bit,
    AutoSai2 bit,
    AutoEnt3 bit,
    AutoSai3 bit,
    PRIMARY KEY (CodPontoHorario, DiaSemana)
);

CREATE TABLE dbo.PontoJustificativa (
    CodPontoJustificativa int,
    Justificativa varchar(20),
    Abonar bit,
    PRIMARY KEY (CodPontoJustificativa)
);

CREATE TABLE dbo.PontoMovimento (
    CodFuncionario int,
    Dia datetime,
    UnidGestora int,
    Feriado bit,
    Ent1 datetime,
    Sai1 datetime,
    Ent2 datetime,
    Sai2 datetime,
    Ent3 datetime,
    Sai3 datetime,
    Just1 int,
    Just2 int,
    Just3 int,
    Total datetime,
    Normal datetime,
    Ajuste float,
    Falta datetime,
    Extra datetime,
    Noturno datetime,
    Abono datetime,
    Compensado bit,
    CargaHoraria datetime,
    CodBancoHora int,
    Observacao varchar(50),
    BatEnt1 int,
    BatSai1 int,
    BatEnt2 int,
    BatSai2 int,
    BatEnt3 int,
    BatSai3 int,
    ExtraPerc int,
    CodPontoHorario int,
    PRIMARY KEY (CodFuncionario, Dia, UnidGestora)
);

CREATE TABLE dbo.ProcessoDesc (
    CodProcessoDesc int,
    ProcessoDesc varchar(50)
);

CREATE TABLE dbo.Profissao (
    CodProfissao int,
    Profissao varchar(40),
    PRIMARY KEY (CodProfissao)
);

CREATE TABLE dbo.PropostaTipo (
    CodPropostaTipo int,
    PropostaTipo varchar(50),
    PRIMARY KEY (CodPropostaTipo)
);

CREATE TABLE dbo.PropostaTipoItem (
    CodPropostaTipo int,
    sequencia int,
    PropostaTipoItem varchar(50),
    PropostaTipoDescricao text,
    PRIMARY KEY (CodPropostaTipo, sequencia)
);

CREATE TABLE dbo.Recibo (
    CodRecibo int,
    CodFuncionario int,
    Valor float,
    Data datetime,
    Referente text,
    Lote int,
    PRIMARY KEY (CodRecibo)
);

CREATE TABLE dbo.ReciboFormato (
    CodReciboFormato int,
    ReciboFormato varchar(50),
    Texto text,
    TipoMovimentacao char(1),
    Detalhe bit,
    Cupom bit,
    Titulo varchar(50),
    PRIMARY KEY (CodReciboFormato)
);

CREATE TABLE dbo.ReciboTipo (
    CodReciboTipo int,
    ReciboTipo varchar(50),
    Ativo bit,
    PRIMARY KEY (CodReciboTipo)
);

CREATE TABLE dbo.ReciboTipoItem (
    CodReciboItem int,
    CodReciboTipo int,
    CodFuncionario int,
    Valor float,
    PRIMARY KEY (CodReciboItem)
);

CREATE TABLE dbo.Rede (
    CodRede int,
    Rede varchar(40),
    PRIMARY KEY (CodRede)
);

CREATE TABLE dbo.RedmineRevisao (
    CodRevisao int,
    Revisao varchar(10),
    Data datetime,
    PRIMARY KEY (CodRevisao)
);

CREATE TABLE dbo.RedmineRevisaoItens (
    CodRevisaoItens int,
    CodRevisao int,
    CodSistema int,
    CodChamado int,
    Versao varchar(50),
    Descricao varchar(250),
    Solicitado bit,
    PRIMARY KEY (CodRevisaoItens)
);

CREATE TABLE dbo.Regiao (
    CodRegiao int,
    Regiao varchar(50),
    CodRegiaoIBGE char(2),
    CodEstadoIBGE char(2),
    ativo bit,
    PRIMARY KEY (CodRegiao)
);

CREATE TABLE dbo.RegraTributacao (
    CodRegraTributacao int,
    RegraTributacao varchar(150),
    TipoCST int,
    TipoEmpresa int,
    Ativo bit,
    TipoRegra int,
    Venda bit,
    Compra bit,
    PRIMARY KEY (CodRegraTributacao)
);

CREATE TABLE dbo.RegraTributacaoItem (
    CodRegraTributacaoItem int,
    CodRegraTributacao int,
    CSTICMS int,
    CSOSN int,
    CSTPIS int,
    CSTIPI int,
    CFOP int,
    PRIMARY KEY (CodRegraTributacaoItem)
);

CREATE TABLE dbo.RelatorioAvaliacao (
    CodRelatorioAvaliacao int,
    RelatorioAvaliacao varchar(100),
    Sequencia int,
    Comando text,
    ComandoDetalhe text,
    Ativo bit,
    PRIMARY KEY (CodRelatorioAvaliacao)
);

CREATE TABLE dbo.RelatorioCapa (
    Titulo varchar(100),
    SubTitulo1 varchar(100),
    SubTitulo2 varchar(100),
    SubTitulo3 varchar(100),
    SubTitulo4 varchar(100),
    SubTitulo5 varchar(50)
);

CREATE TABLE dbo.RestauranteCaixa (
    CodRestauranteCaixa int,
    CodRestaurantePedidoVenda int,
    CodFuncionario int,
    DataPagto datetime,
    ValorConta float,
    ValorPago float,
    Desconto float,
    CodFormaReceb smallint,
    Documento varchar(40),
    PRIMARY KEY (CodRestauranteCaixa)
);

CREATE TABLE dbo.RestauranteFila (
    CodRestauranteFila int,
    RestauranteFila varchar(100),
    Impressora varchar(100),
    TipoAtendimento tinyint,
    PRIMARY KEY (CodRestauranteFila)
);

CREATE TABLE dbo.RestauranteOpcional (
    CodRestauranteOpcional int,
    RestauranteOpcional varchar(100),
    MinSelecionado int,
    MaxSelecionado int,
    PRIMARY KEY (CodRestauranteOpcional)
);

CREATE TABLE dbo.RestauranteOpcionalItens (
    CodRestauranteOpcionalItens int,
    RestauranteOpcionalItens varchar(100),
    CodRestauranteOpcional int,
    PRIMARY KEY (CodRestauranteOpcionalItens)
);

CREATE TABLE dbo.RestauranteOpcionalMaterial (
    CodRestauranteOpcional int,
    CodMaterial int,
    PRIMARY KEY (CodRestauranteOpcional, CodMaterial)
);

CREATE TABLE dbo.RestaurantePedidoRapido (
    CodMaterial1 int,
    CodMaterial2 int,
    CodMaterial3 int,
    CodMaterial4 int,
    CodMaterial5 int,
    CodMaterial6 int,
    CodMaterial7 int,
    CodMaterial8 int,
    CodMaterial9 int,
    CodMaterial10 int,
    CodMaterial11 int,
    CodMaterial12 int,
    CodMaterial13 int,
    CodMaterial14 int,
    CodMaterial15 int,
    CodMaterial16 int,
    CodMaterial17 int,
    CodMaterial18 int,
    CodMaterial19 int,
    CodMaterial20 int
);

CREATE TABLE dbo.RestaurantePedidoVenda (
    CodRestaurantePedidoVenda int,
    DataEntrada datetime,
    DataSaida datetime,
    Numero int,
    Tipo char(1),
    Situacao char(1),
    CodFuncionario int,
    CodCliente int,
    NomeCliente varchar(40),
    CodTabelaPreco int,
    ValorConta float,
    Desconto float,
    ValorPago float,
    CodFormaReceb smallint,
    Comissao float,
    QtdPessoas int,
    EmitidoPDV bit,
    NumeroStr varchar(10),
    PRIMARY KEY (CodRestaurantePedidoVenda)
);

CREATE TABLE dbo.RestaurantePedidoVendaItens (
    CodRestaurantePedidoVendaItens int,
    CodRestaurantePedidoVenda int,
    Data datetime,
    CodMaterial int,
    CodFuncionario int,
    Qtd float,
    ValorUnitario float,
    ValorTotal float,
    Ativo bit,
    Atendido bit,
    UsuarioAtendimento varchar(50),
    DataAtendimento datetime,
    Impresso bit,
    UsuarioImpressao varchar(50),
    DataImpressao datetime,
    PRIMARY KEY (CodRestaurantePedidoVendaItens)
);

CREATE TABLE dbo.RestaurantePedidoVendaItensOpcionalItens (
    CodRestaurantePedidoVendaItens int,
    CodRestauranteOpcionalItens int
);

CREATE TABLE dbo.Rota (
    CodRota int,
    Rota varchar(50),
    Descricao varchar(200),
    CodAreaVenda int,
    CodVendedor int,
    CodTransportador int,
    CodVeiculo int,
    TipoVisita char(1),
    DiaVisita int,
    CodRotaGrupo int,
    TipoDesenho varchar(50),
    Coordenadas text,
    Cor varchar(7),
    Ativa bit,
    CodRotaRecuperacao int,
    UnidGestora int,
    CodAuxiliar1 int,
    CodAuxiliar2 int,
    CodAuxiliar3 int,
    CodAuxiliar4 int,
    CodFreteTipo int,
    QtdDiasPrevisao int,
    PRIMARY KEY (CodRota)
);

CREATE TABLE dbo.RotaDespesa (
    CodRotaDespesa int,
    CodRota int,
    CodConta varchar(20),
    CodMoeda int,
    Qtd int,
    ValorUnit float,
    Diaria bit,
    PRIMARY KEY (CodRotaDespesa)
);

CREATE TABLE dbo.RotaGrupo (
    CodRotaGrupo int,
    RotaGrupo varchar(50),
    PRIMARY KEY (CodRotaGrupo)
);

CREATE TABLE dbo.RotaMetaPositivacao (
    CodRota int,
    Ano int,
    Mes int,
    MetaPositivacao int,
    PRIMARY KEY (CodRota, Ano, Mes)
);

CREATE TABLE dbo.RotaObjetivo (
    CodRota int,
    Mes int,
    Valor float,
    DataDe datetime,
    DataAte datetime,
    CodRotaObjetivo int,
    PRIMARY KEY (CodRotaObjetivo)
);

CREATE TABLE dbo.RotaObjetivoFabricante (
    CodRotaObjetivo int,
    CodFabricante int,
    Valor float,
    PRIMARY KEY (CodRotaObjetivo, CodFabricante)
);

CREATE TABLE dbo.RoteiroC (
    CodEvento char(5),
    Sequencia int,
    CodConta char(9),
    PRIMARY KEY (CodEvento, Sequencia)
);

CREATE TABLE dbo.RoteiroD (
    CodEvento char(5),
    Sequencia int,
    CodConta char(9),
    PRIMARY KEY (CodEvento, Sequencia)
);

CREATE TABLE dbo.RoteiroFull (
    Operacao char(1),
    CodEvento char(5),
    Sequencia int,
    CodConta char(9),
    PRIMARY KEY (Operacao, CodEvento, Sequencia, CodConta)
);

CREATE TABLE dbo.Sabor (
    CodSabor int,
    Sabor varchar(50),
    PRIMARY KEY (CodSabor)
);

CREATE TABLE dbo.Segmento (
    CodSegmento int,
    Segmento varchar(50),
    Ativo bit,
    PRIMARY KEY (CodSegmento)
);

CREATE TABLE dbo.Sequencia (
    CodSequencia int,
    Sequencia varchar(50),
    CodSequenciaTipo int,
    NumSequencia int,
    CodNotaFiscalFormato int,
    CodBoletoFormato int,
    UnidGestora int,
    CodMDFeFormato int,
    PRIMARY KEY (CodSequencia)
);

CREATE TABLE dbo.SequenciaTipo (
    CodSequenciaTipo int,
    SequenciaTipo varchar(50),
    PRIMARY KEY (CodSequenciaTipo)
);

CREATE TABLE dbo.SerasaBureau (
    CodSerasaBureau int,
    CodCliente int,
    TipoDoc int,
    Documento varchar(20),
    AnotacaoNegativa varchar(1),
    Registro image,
    DataCadastro datetime,
    UsuarioCadastro varchar(50),
    PRIMARY KEY (CodSerasaBureau)
);

CREATE TABLE dbo.SerasaClassificador (
    CodClassificador int,
    CodClassificadorTipo int,
    Classificador varchar(100),
    Abreviacao varchar(3),
    PRIMARY KEY (CodClassificadorTipo, CodClassificador)
);

CREATE TABLE dbo.SerasaClassificadorTipo (
    CodClassificadorTipo int,
    ClassificadorTipo varchar(50),
    PRIMARY KEY (CodClassificadorTipo)
);

CREATE TABLE dbo.SerasaInformante (
    Usuario varchar(8),
    Senha varchar(8),
    Contato varchar(50),
    DDD varchar(4),
    Tel varchar(8),
    Ramal varchar(4),
    DirPefin varchar(255),
    DirRelato varchar(255),
    ProxyServer varchar(50),
    ProxyPort int,
    ProxyUserName varchar(50),
    ProxyPassWord varchar(50),
    MonitoreHost varchar(50),
    MonitorePort int,
    MonitoreUser varchar(50),
    MonitorePassword varchar(50),
    MonitoreAut int
);

CREATE TABLE dbo.SerasaMonitore (
    CodSerasaMonitore int,
    CodCliente int,
    TipoDoc int,
    Documento varchar(20),
    AnotacaoNegativa varchar(1),
    Registro image,
    DataCadastro datetime,
    UsuarioCadastro varchar(50),
    PRIMARY KEY (CodSerasaMonitore)
);

CREATE TABLE dbo.SerasaRemessa (
    CodSerasaRemessa int,
    Data datetime,
    Usuario varchar(50),
    ProcessRetorno bit,
    Arquivo varchar(250),
    PRIMARY KEY (CodSerasaRemessa)
);

CREATE TABLE dbo.SerasaRemessaItens (
    CodSerasaRemessa int,
    CodContaReceber int,
    CodCliente int,
    CodTipo int,
    CodMotivoBaixa int,
    CodErro varchar(60),
    PRIMARY KEY (CodSerasaRemessa, CodContaReceber)
);

CREATE TABLE dbo.Setor (
    CodSetor int,
    Setor varchar(50),
    PRIMARY KEY (CodSetor)
);

CREATE TABLE dbo.SetorExpedicao (
    CodSetorExpedicao int,
    SetorExpedicao varchar(50),
    PRIMARY KEY (CodSetorExpedicao)
);

CREATE TABLE dbo.SintegraContabilista (
    UnidGestora int,
    Contabilista varchar(100),
    CPF varchar(11),
    CRC varchar(15),
    CNPJ varchar(20),
    CEP varchar(8),
    Endereco varchar(100),
    Numero varchar(10),
    Complemento varchar(50),
    Bairro varchar(100),
    Fone varchar(20),
    Fax varchar(20),
    email varchar(100),
    CodCidadeIBGE char(10),
    PRIMARY KEY (UnidGestora)
);

CREATE TABLE dbo.SPC (
    CodSPC int,
    SPC varchar(50),
    PRIMARY KEY (CodSPC)
);

CREATE TABLE dbo.SPEDInformacaoComplementar (
    CodInfComplementar varchar(6),
    Texto text,
    Ativo bit,
    Usuario varchar(50),
    PRIMARY KEY (CodInfComplementar)
);

CREATE TABLE dbo.SPEDPISTabela4310 (
    CODIGO int,
    DESC_PROD varchar(400),
    DT_INI datetime,
    DT_FIM datetime,
    NCM varchar(255),
    NCM_EX varchar(15),
    EX_IPI varchar(3),
    ALIQ_PIS float,
    ALIQ_COFIN float
);

CREATE TABLE dbo.SPEDPISTabela4311 (
    CODIGO int,
    DESC_PROD varchar(400),
    DT_INI datetime,
    DT_FIM datetime,
    NCM varchar(100),
    NCM_EX varchar(15),
    EX_IPI varchar(3),
    UNID varchar(20),
    ALIQ_PIS float,
    ALIQ_COFIN float
);

CREATE TABLE dbo.SPEDPISTabela4312 (
    CODIGO int,
    DESC_PROD varchar(400),
    DT_INI datetime,
    DT_FIM datetime,
    NCM varchar(15),
    NCM_EX varchar(15),
    EX_IPI varchar(3),
    ALIQ_PIS float,
    ALIQ_COFIN float
);

CREATE TABLE dbo.SPEDPISTabela4313 (
    CODIGO int,
    DESC_PROD varchar(400),
    DT_INI datetime,
    DT_FIM datetime,
    NCM varchar(15),
    NCM_EX varchar(15),
    EX_IPI varchar(3)
);

CREATE TABLE dbo.SPEDPISTabela4314 (
    CODIGO int,
    DESC_PROD varchar(400),
    DT_INI datetime,
    DT_FIM datetime,
    NCM varchar(15),
    NCM_EX varchar(15),
    EX_IPI varchar(3)
);

CREATE TABLE dbo.SPEDPISTabela4315 (
    CODIGO int,
    DESC_PROD varchar(400),
    DT_INI datetime,
    DT_FIM datetime,
    NCM varchar(15),
    NCM_EX varchar(15),
    EX_IPI varchar(3)
);

CREATE TABLE dbo.SPEDPISTabela4316 (
    CODIGO int,
    DESC_PROD varchar(400),
    DT_INI datetime,
    DT_FIM datetime,
    NCM varchar(15),
    NCM_EX varchar(15),
    EX_IPI varchar(3)
);

CREATE TABLE dbo.SPEDPISTabela4317 (
    CODIGO int,
    DESC_PROD varchar(400),
    DT_INI datetime,
    DT_FIM datetime,
    NCM varchar(15),
    NCM_EX varchar(15),
    EX_IPI varchar(3),
    ALIQ_PIS_P float,
    ALIQ_PIS_R float,
    ALIQ_COF_P float,
    ALIQ_COF_R float
);

CREATE TABLE dbo.SPEDTabela (
    CodSPEDTabela int,
    Tabela varchar(50),
    Versao varchar(50),
    CODIGO int,
    DESC_PROD varchar(400),
    DT_INI datetime,
    DT_FIM datetime,
    NCM varchar(200),
    NCM_EX varchar(200),
    EX_IPI varchar(50),
    UNID varchar(100),
    ALIQ_PIS float,
    ALIQ_COFIN float,
    ALIQ_PIS_P float,
    ALIQ_PIS_R float,
    ALIQ_COF_P float,
    ALIQ_COF_R float,
    PRIMARY KEY (CodSPEDTabela)
);

CREATE TABLE dbo.SPEDTabelaVersao (
    Tabela varchar(50),
    Versao varchar(50)
);

CREATE TABLE dbo.StoneEstabelecimento (
    UUIDStoneEstabelecimento uniqueidentifier,
    UnidGestora int,
    IdStoneEstabelecimento varchar(50),
    RazaoSocial varchar(50),
    NomeFantasia varchar(50),
    CNPJ varchar(14),
    StoneCode varchar(50),
    Ativo bit,
    DataRegistro datetime,
    SecretKey varchar(50),
    PRIMARY KEY (UUIDStoneEstabelecimento)
);

CREATE TABLE dbo.StoneMaquina (
    UUIDStoneMaquina uniqueidentifier,
    UUIDStoneEstabelecimento uniqueidentifier,
    IdStoneMaquina varchar(50),
    Descricao varchar(50),
    Serial varchar(50),
    Ativo bit,
    DataRegistro datetime,
    PRIMARY KEY (UUIDStoneMaquina)
);

CREATE TABLE dbo.StoneTransacao (
    UUIDStoneTransacao uniqueidentifier,
    UUIDStoneMaquina uniqueidentifier,
    Descricao varchar(50),
    Valor float,
    Tipo varchar(10),
    Parcelas int,
    CobrarJuros bit,
    IdStonePreTransacao varchar(50),
    IdStoneCiclos varchar(50),
    FinalAdministradora varchar(50),
    FinalNSU varchar(50),
    FinalAutorizacao varchar(50),
    FinalValorLiquido float,
    FinalPrevisaoLiquidacao date,
    DataRegistro datetime,
    Ativo bit,
    Processado bit,
    PRIMARY KEY (UUIDStoneTransacao)
);

CREATE TABLE dbo.StoneTransacaoV2 (
    UUIDStoneTransacao uniqueidentifier,
    UUIDStoneMaquina uniqueidentifier,
    Descricao varchar(50),
    Valor float,
    Tipo varchar(10),
    Parcelas int,
    CobrarJuros bit,
    IdStone varchar(50),
    FinalAdministradora varchar(50),
    FinalNSU varchar(50),
    FinalAutorizacao varchar(50),
    DataRegistro datetime,
    Situacao char(1),
    PRIMARY KEY (UUIDStoneTransacao)
);

CREATE TABLE dbo.SugestaoPreco (
    CodSugestaoPreco int,
    Descricao varchar(50),
    DataCadastro datetime,
    UsuarioCadastro char(100),
    Ativo bit,
    InicioVigencia datetime,
    PRIMARY KEY (CodSugestaoPreco)
);

CREATE TABLE dbo.SugestaoPrecoMaterial (
    CodSugestaoPreco int,
    CodMaterial int,
    Valor float,
    VigenciaAnt datetime,
    PRIMARY KEY (CodSugestaoPreco, CodMaterial)
);

CREATE TABLE dbo.SyncDataBase (
    CodSyncDataBase int,
    SyncDataBase varchar(60),
    Ativo bit,
    Excluir bit,
    PRIMARY KEY (CodSyncDataBase)
);

CREATE TABLE dbo.SyncDataBaseCampo (
    CodSyncDataBase int,
    CodSyncDataBaseItens int,
    Sequencia int,
    Campo varchar(30),
    Chave bit,
    Inc bit,
    PRIMARY KEY (CodSyncDataBase, CodSyncDataBaseItens, Sequencia)
);

CREATE TABLE dbo.SyncDataBaseData (
    CodSyncDataBase int,
    CodSyncDataBaseItens int,
    DataImportacao datetime,
    DataExportacao datetime,
    PRIMARY KEY (CodSyncDataBase, CodSyncDataBaseItens)
);

CREATE TABLE dbo.SyncDataBaseItens (
    CodSyncDataBase int,
    CodSyncDataBaseItens int,
    Descricao varchar(60),
    Comando text,
    Tabela varchar(40),
    Ativo bit,
    Excluir bit,
    Incluir bit,
    Atualizar bit,
    Importar bit,
    Exportar bit,
    Sequencia int,
    Condicao text,
    PRIMARY KEY (CodSyncDataBase, CodSyncDataBaseItens)
);

CREATE TABLE dbo.SyncDataBaseLog (
    CodSyncDataBase int,
    Data datetime,
    UnidGestora int,
    Operacao varchar(255),
    ip varchar(50)
);

CREATE TABLE dbo.TabelaComissao (
    CodTabelaComissao int,
    TabelaComissao varchar(50),
    Ativa bit,
    PRIMARY KEY (CodTabelaComissao)
);

CREATE TABLE dbo.TabelaComissaoProd (
    CodTabelaComissaoProd int,
    TabelaComissaoProd varchar(50),
    Ativa bit,
    PRIMARY KEY (CodTabelaComissaoProd)
);

CREATE TABLE dbo.TabelaCusto (
    Sequencia int,
    CodFornecedor int,
    CodMaterial int,
    Valor float,
    DataInicio datetime,
    DataTermino datetime,
    DataCadastro datetime,
    UsuarioCadastro char(20),
    PRIMARY KEY (Sequencia, CodFornecedor, CodMaterial)
);

CREATE TABLE dbo.TabelaMeta (
    CodTabelaMeta int,
    TabelaMeta varchar(50),
    Descricao varchar(200),
    Ativa bit,
    PRIMARY KEY (CodTabelaMeta)
);

CREATE TABLE dbo.TabelaObjetivo (
    CodTabelaObjetivo int,
    TabelaObjetivo varchar(100),
    Descricao varchar(100),
    CodVendedor int,
    Ativa bit,
    PRIMARY KEY (CodTabelaObjetivo)
);

CREATE TABLE dbo.TabelaPreco (
    CodTabelaPreco int,
    NumTabelaPreco int,
    TabelaPreco varchar(50),
    Descricao varchar(200),
    Ativa bit,
    CodGrupoTabelaPreco int,
    Referencia bit,
    ComissaoAdicional float,
    PercCusto float,
    Exporta bit,
    PDV bit,
    Markup bit,
    CodTabelaPai int,
    Codigo varchar(50),
    CodigoFull varchar(50),
    PercentualMarkup float,
    Nivel int,
    Mobile bit,
    PRIMARY KEY (CodTabelaPreco)
);

CREATE TABLE dbo.TabelaPrecoCompra (
    CodTabelaPrecoCompra int,
    TabelaPrecoCompra varchar(100),
    PRIMARY KEY (CodTabelaPrecoCompra)
);

CREATE TABLE dbo.TabelaPrecoFormaReceb (
    CodTabelaPreco int,
    CodFormaReceb smallint,
    data datetime,
    Usuario char(20),
    PRIMARY KEY (CodTabelaPreco, CodFormaReceb)
);

CREATE TABLE dbo.TabelaPrecoPeriodo (
    CodTabelaPrecoPeriodo int,
    CodTabelaPreco1 int,
    CodTabelaPreco2 int,
    DataInicio datetime,
    DataFim datetime,
    PRIMARY KEY (CodTabelaPrecoPeriodo)
);

CREATE TABLE dbo.TabelaPrecoPromocional (
    CodTabelaPrecoPromocional int,
    CodMaterial int,
    Tipo char(1),
    CodTabelaPreco1 int,
    CodTabelaPreco2 int,
    DataInicio datetime,
    DataFim datetime,
    Quantidade int,
    PRIMARY KEY (CodTabelaPrecoPromocional)
);

CREATE TABLE dbo.TabelaPrecoTerceirizado (
    CodTabelaPrecoTerceirizado int,
    CodTerceirizado int,
    Vigencia datetime,
    Valor float,
    CodMaterial int,
    PRIMARY KEY (CodTabelaPrecoTerceirizado)
);

CREATE TABLE dbo.TabelaPrecoUnidadeGestora (
    CodTabelaPreco int,
    UnidGestora int,
    PRIMARY KEY (CodTabelaPreco, UnidGestora)
);

CREATE TABLE dbo.TabelaPrecoVenda (
    CodTabelaPreco1 int,
    CodTabelaPreco2 int,
    Venda float,
    Quantidade int,
    Tipo char(1),
    CodTabelaPrecoVenda int,
    PRIMARY KEY (CodTabelaPrecoVenda)
);

CREATE TABLE dbo.Tanque (
    CodTanque int,
    Tanque varchar(100),
    AnaliseIndividual bit,
    PRIMARY KEY (CodTanque)
);

CREATE TABLE dbo.TEFAdministradora (
    CodTEFAdministradora int,
    TEFAdministradora varchar(50)
);

CREATE TABLE dbo.TEFBandeira (
    CodTEFBandeira int,
    TEFBandeira varchar(50),
    Ativo bit,
    PRIMARY KEY (CodTEFBandeira)
);

CREATE TABLE dbo.TEFConfig (
    CodTEFConfig int,
    Estacao varchar(50),
    CodTEFAdministradora int,
    EsperaSleep int,
    EsperaSTS int,
    ArqREQ varchar(250),
    ArqRESP varchar(250),
    ArqSTS varchar(250),
    ArqTEMP varchar(250),
    ArqEXE varchar(250),
    GP varchar(50),
    NumDeVias int,
    PRIMARY KEY (CodTEFConfig)
);

CREATE TABLE dbo.TipoDocumento (
    CodTipoDoc int,
    TipoDoc varchar(100),
    Sigla varchar(20),
    Estornavel bit,
    CodModulo varchar(20),
    CodNaturezaOperacao int,
    TipoOperacao int,
    CodDocumentoIntegracaoTipo int,
    PRIMARY KEY (CodTipoDoc)
);

CREATE TABLE dbo.Unidade (
    CodUnidade int,
    Unidade varchar(50),
    SiglaUnidade char(3),
    Usuario varchar(50),
    DataAlteracao datetime,
    PRIMARY KEY (CodUnidade)
);

CREATE TABLE dbo.UnidadeGestora (
    UnidGestora int,
    Unidade varchar(100),
    CodNotaFiscalFormato int,
    imagem image,
    Gerenciar bit,
    CGC varchar(14),
    IE varchar(14),
    RazaoSocial varchar(100),
    Nome varchar(100),
    Logradouro varchar(100),
    Numero varchar(5),
    Complemento varchar(50),
    Bairro varchar(30),
    CEP varchar(8),
    Cidade varchar(50),
    CodEstado varchar(2),
    Fax varchar(10),
    Contato varchar(30),
    Telefone varchar(12),
    CodMasterFiscal varchar(3),
    CodCidade varchar(7),
    NFeCertificadoNome varchar(255),
    NFeDir varchar(255),
    NFeValidade datetime,
    CodClienteTributacao int,
    CodNaturezaPJ int,
    CodTipoAtividade int,
    emailCompra varchar(255),
    IM varchar(14),
    FortesEmpresa varchar(50),
    FortesEstabelecimento varchar(50),
    Sped bit,
    ICMSSN float,
    NFeCertificadoTipo int,
    NFeCertificadoSenha varchar(255),
    NFeCertificado varbinary(max),
    Login bit,
    PercentualLaudoEnergia float,
    Email varchar(100),
    CodTabelaPrecoCusto int,
    CodTabelaPrecoReferencia int,
    CodTabelaPrecoMinimo int,
    Latitude float,
    Longitude float,
    CodTabelaPrecoCustoReferencia int,
    RegimeAtacadistaRN bit,
    CodTabelaPrecoMaximoCompra int,
    CodFilialDominio int,
    UnidadeFantasia varchar(100),
    Orcamento int,
    PRIMARY KEY (UnidGestora)
);

CREATE TABLE dbo.UnidadeGestoraOperacao (
    UnidGestoraOperacao int,
    UnidadeGestoraOperacao varchar(50),
    Modulo1 varchar(50),
    Modulo2 varchar(50),
    PRIMARY KEY (UnidGestoraOperacao)
);

CREATE TABLE dbo.UnidadeGestoraRelacao (
    UnidGestoraOperacao int,
    UnidGestora1 int,
    UnidGestora2 int,
    PRIMARY KEY (UnidGestoraOperacao, UnidGestora1, UnidGestora2)
);

CREATE TABLE dbo.UnidadeGestoraTipoDocumento (
    UnidGestora int,
    CodTipoDoc int,
    Usuario varchar(50),
    Data datetime,
    PRIMARY KEY (UnidGestora, CodTipoDoc)
);

CREATE TABLE dbo.UserGrupoUsuario (
    CodModulo char(2),
    GrupoUsuario char(20),
    PRIMARY KEY (CodModulo, GrupoUsuario)
);

CREATE TABLE dbo.UserGrupoUsuarioOp (
    CodModulo char(2),
    GrupoUsuario char(20),
    MenuItem varchar(100),
    PRIMARY KEY (CodModulo, GrupoUsuario, MenuItem)
);

CREATE TABLE dbo.UserGrupoUsuarioOpAdicional (
    CodModulo char(2),
    GrupoUsuario char(20),
    MenuItem varchar(100),
    CodUserModuloMenuAdicional int,
    Valor varchar(100),
    PRIMARY KEY (CodModulo, GrupoUsuario, MenuItem, CodUserModuloMenuAdicional)
);

CREATE TABLE dbo.UserGrupoUsuarioOpWeb (
    CodModulo char(2),
    GrupoUsuario char(20),
    MenuItem varchar(100),
    PRIMARY KEY (CodModulo, GrupoUsuario, MenuItem)
);

CREATE TABLE dbo.UserModulo (
    CodModulo char(2),
    Modulo varchar(100),
    PRIMARY KEY (CodModulo)
);

CREATE TABLE dbo.UserModuloMenu (
    CodModulo char(2),
    MenuItem varchar(100),
    MenuCaption varchar(100),
    MenuGrupo int,
    MenuNivel int,
    PRIMARY KEY (CodModulo, MenuItem)
);

CREATE TABLE dbo.UserModuloMenuAdicional (
    CodUserModuloMenuAdicional int,
    CodModulo char(2),
    MenuItem varchar(100),
    Tipo char(1),
    Adicional varchar(100),
    Descricao varchar(100),
    PRIMARY KEY (CodUserModuloMenuAdicional)
);

CREATE TABLE dbo.UserModuloMenuWeb (
    CodModulo char(2),
    MenuItem varchar(100),
    MenuCaption varchar(100),
    MenuGrupo int,
    MenuNivel int,
    MenuLabel varchar(100),
    URL varchar(200),
    TelaInicial bit,
    PRIMARY KEY (CodModulo, MenuItem)
);

CREATE TABLE dbo.UserNivel (
    Nivel int,
    NivelStr varchar(50),
    PRIMARY KEY (Nivel)
);

CREATE TABLE dbo.UserUsuario (
    ID char(20),
    Usuario varchar(100),
    Matricula char(20),
    Senha varchar(100),
    Obs varchar(200),
    FoneResidencial varchar(20),
    FoneTrabalho varchar(20),
    RamalTrabalho varchar(20),
    CodFuncionario int,
    GerencUser bit,
    UnidGestora int,
    VersaoRevisao int,
    SenhaMD5 varchar(32),
    UltimoAcesso datetime,
    AlteracaoSenha datetime,
    Ativo bit,
    CodUserUsuario int,
    TelaInicialURL varchar(200),
    PRIMARY KEY (ID)
);

CREATE TABLE dbo.UserUsuarioAlmoxarifado (
    ID char(20),
    CodAlmoxarifado int,
    Usuario char(20),
    PRIMARY KEY (ID, CodAlmoxarifado)
);

CREATE TABLE dbo.UserUsuarioBanco (
    ID char(20),
    CodBanco int,
    Data datetime,
    Usuario varchar(50),
    TipoConta char(1)
);

CREATE TABLE dbo.UserUsuarioConta (
    ID char(20),
    CodConta varchar(20),
    Data datetime,
    Usuario varchar(50),
    PRIMARY KEY (ID, CodConta)
);

CREATE TABLE dbo.userUsuarioEvento (
    ID char(20),
    CodEvento char(5),
    Data datetime,
    Usuario varchar(50),
    PRIMARY KEY (ID, CodEvento)
);

CREATE TABLE dbo.UserUsuarioHistorico (
    ID char(20),
    CodModulo char(2),
    GrupoUsuario char(20),
    Data datetime
);

CREATE TABLE dbo.UserUsuarioLinhaProducao (
    ID char(20),
    CodLinhaProducao int,
    Data datetime,
    Usuario varchar(50),
    PRIMARY KEY (ID, CodLinhaProducao)
);

CREATE TABLE dbo.UserUsuarioMaterialTipo (
    GrupoUsuario varchar(20),
    CodModulo char(2),
    CodMaterialTipo int,
    MaterialTipo varchar(50),
    Usuario varchar(50),
    Data datetime
);

CREATE TABLE dbo.UserUsuarioModulo (
    ID char(20),
    CodModulo char(2),
    PRIMARY KEY (ID, CodModulo)
);

CREATE TABLE dbo.UserUsuarioOp (
    ID char(20),
    CodModulo char(2),
    GrupoUsuario char(20),
    PRIMARY KEY (ID, CodModulo, GrupoUsuario)
);

CREATE TABLE dbo.UserUsuarioSenhaConfig (
    SenhaTamanho int,
    SenhaUltimoAcesso int,
    SenhaAlterada int
);

CREATE TABLE dbo.UserUsuarioUnidade (
    ID char(20),
    UnidGestora int,
    Padrao bit,
    PRIMARY KEY (ID, UnidGestora)
);

CREATE TABLE dbo.Usuario (
    Dado1 varchar(80),
    Dado2 varchar(40),
    Dado3 varchar(44)
);

CREATE TABLE dbo.UsuarioWeb (
    UserName varchar(100),
    CPF varchar(14),
    CNPJ varchar(20),
    Codigos varchar(50),
    Descricao varchar(100),
    Fantasia varchar(100),
    Telefone varchar(20),
    Tipo int,
    Status int,
    UsuarioAutorizacao varchar(100),
    DataAutorizacao datetime,
    PRIMARY KEY (UserName)
);

CREATE TABLE dbo.UsuarioWebCliente (
    UserName varchar(100),
    CodCliente int,
    UsuarioCadastro varchar(50),
    DataCadastro datetime
);

CREATE TABLE dbo.UsuarioWebMembership (
    UserName varchar(100),
    Password varchar(128),
    Email varchar(100),
    PasswordQuestion varchar(200),
    PasswordAnswer varchar(200),
    CreateDate datetime,
    LastLoginDate datetime,
    LastPasswordChangedDate datetime,
    FailedPasswordAttemptCount int,
    FailedPasswordAnswerAttemptCount int,
    PRIMARY KEY (UserName)
);

CREATE TABLE dbo.Veiculo (
    CodVeiculo int,
    Veiculo varchar(50),
    CodVeiculoClasse int,
    Placa char(8),
    CodEstado char(2),
    Volume float,
    Peso float,
    Km float,
    Situacao int,
    KmMensal float,
    Ativo bit,
    CapacidadeEntrega int,
    CapacidadeValor float,
    MaxCombustivel float,
    MediaKm float,
    RNTC varchar(20),
    Renavam int,
    CodVeiculoMarca int,
    CodSetor int,
    CodSeguradora int,
    CodCorretora int,
    Ano int,
    Modelo int,
    Chassi varchar(40),
    NumeroApolice varchar(40),
    ValidadeApolice datetime,
    CodTipoVeiculo int,
    CodRodado int,
    CodCarroceria int,
    Tara int,
    UsuarioEdicao varchar(50),
    Reboque int,
    StrRenavam varchar(20),
    Portas int,
    PRIMARY KEY (CodVeiculo)
);

CREATE TABLE dbo.VeiculoCombustivel (
    CodCombustivel int,
    Combustivel varchar(50),
    CodMaterial int,
    EConsumo bit,
    PRIMARY KEY (CodCombustivel)
);

CREATE TABLE dbo.VeiculoMarca (
    CodVeiculoMarca int,
    VeiculoMarca varchar(50),
    PRIMARY KEY (CodVeiculoMarca)
);

CREATE TABLE dbo.VeiculoMovimentacao (
    Ativo int,
    CodCombustivel int,
    CodCombustivelPrincipal int,
    CodCombustivelSecundario int,
    CodMapaExpedicao int,
    CodMovimentacao int,
    CodMovimentacaoTipo int,
    CodMotorista int,
    CodPosto int,
    CodResponsavel int,
    CodRota int,
    CodVeiculo int,
    CodVeiculoServico int,
    Combustivel int,
    DataSaida datetime,
    DataRetorno datetime,
    Documentos int,
    Equipamento int,
    Farois int,
    KmCombustivelPrincipal float,
    KmSaida float,
    KmRetorno float,
    NumComanda int,
    NumMovimentacao int,
    Observacao varchar(100),
    Ocorrencia varchar(100),
    Pneus int,
    Qtd float,
    QtdFreezers int,
    QtdFreezersRecolhidos int,
    QtdFreezersRetornados int,
    QtdPedidos int,
    QtdPedidosRetornados int,
    Valor float,
    Velocimetro int,
    VistoriaResultado bit,
    CodMaterial int,
    CodFornecedor int,
    CodDocApoio int,
    CodPatrimonio int,
    Tipo int,
    PRIMARY KEY (CodMovimentacao)
);

CREATE TABLE dbo.VeiculoMovServico (
    CodVeiculoMovServico int,
    CodVeiculo int,
    CodVeiculoServico int,
    Data datetime,
    Km float,
    Qtd float,
    Valor float,
    CodMotorista int,
    PRIMARY KEY (CodVeiculoMovServico)
);

CREATE TABLE dbo.VeiculoMulta (
    CodVeiculoMulta int,
    CodMultaTipo int,
    CodVeiculo int,
    CodMotorista int,
    Data datetime,
    Usuario varchar(100),
    Observacao varchar(255),
    Situacao int,
    Status int,
    PRIMARY KEY (CodVeiculoMulta)
);

CREATE TABLE dbo.VeiculoOrdemServico (
    CodOS int,
    NumOS int,
    Ano int,
    CodTipo int,
    Situacao varchar(1),
    DataInicio datetime,
    DataPrevista datetime,
    DataFim datetime,
    Valor float,
    CodVeiculo int,
    CodFornecedor int,
    CodFuncionario int,
    Descricao varchar(max),
    Solucao varchar(200),
    Tecnico1 varchar(100),
    Tecnico2 varchar(100),
    Conferente varchar(100)
);

CREATE TABLE dbo.VeiculoProgExpedicao (
    CodVeiculoProgExpedicao int,
    Usuario varchar(50),
    Data datetime,
    DataExpedicao datetime,
    CodVeiculo int,
    CodMotorista int,
    CodAuxiliar1 int,
    CodAuxiliar2 int,
    CodAuxiliar3 int,
    CodAuxiliar4 int,
    Ativo bit,
    CodGrupoExpedicao int,
    PRIMARY KEY (CodVeiculoProgExpedicao)
);

CREATE TABLE dbo.VeiculoProgServico (
    CodVeiculoProgServico int,
    Ativo bit,
    CodVeiculo int,
    CodVeiculoServico int,
    TipoProgramacao int,
    Data datetime,
    Km float,
    Periodo int,
    Qtd float,
    ValorEstimado float,
    CodPatrimonio int,
    Tipo int,
    DataInclusao datetime,
    UsuarioInclusao varchar(50),
    PRIMARY KEY (CodVeiculoProgServico)
);

CREATE TABLE dbo.VeiculoServico (
    CodVeiculoServico int,
    VeiculoServico varchar(50),
    TipoProgramacao int,
    Km float,
    Periodo int,
    VistoriaResultado int,
    CodServicoVistoria int,
    CodVeiculoServicoGrupo int,
    Manutencao bit,
    Veiculos bit,
    Ativo bit,
    PRIMARY KEY (CodVeiculoServico)
);

CREATE TABLE dbo.VeiculoServicoGrupo (
    CodVeiculoServicoGrupo int,
    VeiculoServicoGrupo varchar(50),
    Ativo bit,
    PRIMARY KEY (CodVeiculoServicoGrupo)
);

CREATE TABLE dbo.VersaoSistema (
    Versao varchar(50),
    Data datetime,
    svn varchar(20),
    CodModulo01 int,
    CodModulo02 int,
    CodModulo03 int,
    CodModulo04 int,
    CodModulo05 int,
    CodModulo06 int,
    CodModulo07 int,
    CodModulo08 int,
    CodModulo09 int,
    CodModulo10 int,
    CodModulo11 int,
    CodModulo12 int,
    CodModulo13 int,
    CodModulo14 int,
    CodModulo15 int,
    CodModulo16 int,
    CodModulo17 int,
    CodModulo18 int,
    CodModulo19 int,
    CodModulo20 int,
    CodModulo21 int,
    CodModulo22 int,
    CodModulo23 int,
    CodModulo24 int,
    CodModulo25 int,
    CodModulo26 int,
    CodModulo27 int,
    CodModulo28 int,
    CodModulo29 int,
    CodModulo30 int
);

CREATE TABLE dbo.VersaoSolicitacao (
    CodSistema int,
    Versao varchar(50),
    Solicitacao varchar(200),
    Descricao varchar(400),
    svn varchar(20)
);

CREATE TABLE dbo.Voucher (
    CodVoucher int,
    NumVoucher int,
    CodMaterialVoucher int,
    Valor float,
    Situacao int,
    DataCadastro datetime,
    UsuarioCadastro varchar(50),
    CodClienteVenda int,
    CodPedidoVenda int,
    DataVenda datetime,
    UsuarioVenda varchar(50),
    CodClienteUtilizacao int,
    CodPedidoVendaUtilizacao int,
    DataUtilizacao datetime,
    UsuarioUtilizacao varchar(50),
    DataCancelamento datetime,
    UsuarioCancelamento varchar(50),
    PRIMARY KEY (CodVoucher)
);

CREATE TABLE dbo.Widget (
    CodWidget int,
    Widget nvarchar(50),
    PRIMARY KEY (CodWidget)
);

CREATE TABLE dbo.WidgetConfig (
    CodWidgetConfig int,
    CodWidget int,
    CodPerfilEmail int,
    Sequencia int,
    Ativo bit,
    TipoData int,
    PRIMARY KEY (CodWidgetConfig)
);

CREATE TABLE dbo.WordDocumento (
    CodWordDocumento int,
    CodDocumentoTipo int,
    Modelo varchar(50),
    DocumentoModelo image,
    Aux1 bit,
    Aux1Nome varchar(50),
    Aux2 bit,
    Aux2Nome varchar(50),
    Aux3 bit,
    Aux3Nome varchar(50),
    PRIMARY KEY (CodWordDocumento, CodDocumentoTipo)
);

CREATE TABLE dbo.Zona (
    CodZona int,
    Zona varchar(50),
    PRIMARY KEY (CodZona)
);

ALTER TABLE dbo.Almoxarifado ADD CONSTRAINT FK_Almoxarifado_Cliente FOREIGN KEY (CodCliente) REFERENCES dbo.Cliente (CodCliente);

ALTER TABLE dbo.Analise ADD CONSTRAINT FK_AnaliseEmitente_Analise FOREIGN KEY (CodAnaliseEmitente) REFERENCES dbo.AnaliseEmitente (CodAnaliseEmitente);

ALTER TABLE dbo.AnaliseCertificado ADD CONSTRAINT FK_AnaliseCertificado_Analise FOREIGN KEY (CodAnalise) REFERENCES dbo.Analise (CodAnalise);

ALTER TABLE dbo.AnaliseCertificado ADD CONSTRAINT FK_AnaliseCertificado_AnaliseEmitente FOREIGN KEY (CodAnaliseEmitente) REFERENCES dbo.AnaliseEmitente (CodAnaliseEmitente);

ALTER TABLE dbo.AnaliseCertificado ADD CONSTRAINT FK_AnaliseCertificado_Funcionario FOREIGN KEY (CodFuncionario) REFERENCES dbo.Funcionario (CodFuncionario);

ALTER TABLE dbo.AnaliseCertificado ADD CONSTRAINT FK_AnaliseCertificado_Material FOREIGN KEY (CodMaterial) REFERENCES dbo.Material (CodMaterial);

ALTER TABLE dbo.AnaliseCertificado ADD CONSTRAINT FK_AnaliseCertificado_MaterialLote FOREIGN KEY (CodLote) REFERENCES dbo.MaterialLote (CodLote);

ALTER TABLE dbo.AnaliseCertificado ADD CONSTRAINT FK_AnaliseCertificado_NotaRecebimento FOREIGN KEY (CodNotaRecebimento) REFERENCES dbo.NotaRecebimento (CodNotaRecebimento);

ALTER TABLE dbo.AnaliseCertificado ADD CONSTRAINT FK_AnaliseCertificado_Tanque FOREIGN KEY (CodTanque) REFERENCES dbo.Tanque (CodTanque);

ALTER TABLE dbo.AnaliseCertificadoItem ADD CONSTRAINT FK_AnaliseCertificadoItem_AnaliseCertificado FOREIGN KEY (CodAnaliseCertificado) REFERENCES dbo.AnaliseCertificado (CodAnaliseCertificado);

ALTER TABLE dbo.AnaliseCertificadoItem ADD CONSTRAINT FK_AnaliseCertificadoItem_AnaliseItem FOREIGN KEY (CodAnaliseItem) REFERENCES dbo.AnaliseItem (CodAnaliseItem);

ALTER TABLE dbo.AnaliseGrupo ADD CONSTRAINT FK_AnaliseGrupo_Analise FOREIGN KEY (CodAnalise) REFERENCES dbo.Analise (CodAnalise);

ALTER TABLE dbo.AnaliseItem ADD CONSTRAINT FK_AnaliseItem_AnaliseGrupo FOREIGN KEY (CodAnaliseGrupo) REFERENCES dbo.AnaliseGrupo (CodAnaliseGrupo);

ALTER TABLE dbo.AnaliseItemFaixa ADD CONSTRAINT FK_AnaliseItemFaixa_AnaliseItem FOREIGN KEY (CodAnaliseItem) REFERENCES dbo.AnaliseItem (CodAnaliseItem);

ALTER TABLE dbo.AnaliseMaterial ADD CONSTRAINT FK_AnaliseMaterial_Analise FOREIGN KEY (CodAnalise) REFERENCES dbo.Analise (CodAnalise);

ALTER TABLE dbo.AnaliseMaterial ADD CONSTRAINT FK_AnaliseMaterial_Material FOREIGN KEY (CodMaterial) REFERENCES dbo.Material (CodMaterial);

ALTER TABLE dbo.AreaVenda ADD CONSTRAINT FK_AreaVenda_AreaSupervisao FOREIGN KEY (CodAreaSupervisao) REFERENCES dbo.AreaSupervisao (CodAreaSupervisao);

ALTER TABLE dbo.AreaVendaFabricante ADD CONSTRAINT FK_AreaVendaFabricante_AreaVenda FOREIGN KEY (CodAreaVenda) REFERENCES dbo.AreaVenda (CodAreaVenda);

ALTER TABLE dbo.AreaVendaFabricante ADD CONSTRAINT FK_AreaVendaFabricante_Fabricante FOREIGN KEY (CodFabricante) REFERENCES dbo.Fabricante (CodFabricante);

ALTER TABLE dbo.AreaVendaMetaPositivacao ADD CONSTRAINT FK_AreaVendaMetaPositivacao_AreaVenda FOREIGN KEY (CodAreaVenda) REFERENCES dbo.AreaVenda (CodAreaVenda);

ALTER TABLE dbo.Bairro ADD CONSTRAINT FK_Bairro_Cidade FOREIGN KEY (CodCidade) REFERENCES dbo.Cidade (CodCidade);

ALTER TABLE dbo.BancoBloqueio ADD CONSTRAINT FK_BancoBloqueio_Banco FOREIGN KEY (CodBanco) REFERENCES dbo.Banco (CodBanco);

ALTER TABLE dbo.BancoExtratoConciliacao ADD CONSTRAINT FK_BancoExtratoConciliacao_Banco FOREIGN KEY (CodBanco) REFERENCES dbo.Banco (CodBanco);

ALTER TABLE dbo.BICubo ADD CONSTRAINT FK_BICubo_UserModulo FOREIGN KEY (CodModulo) REFERENCES dbo.UserModulo (CodModulo);

ALTER TABLE dbo.BILayout ADD CONSTRAINT FK_BILayout_BICubo FOREIGN KEY (CodBICubo) REFERENCES dbo.BICubo (CodBICubo);

ALTER TABLE dbo.BIMenuLayout ADD CONSTRAINT FK_BIMenuLayout_BILayout FOREIGN KEY (DescricaoLayout) REFERENCES dbo.BILayout (Descricao);

ALTER TABLE dbo.Boleto ADD CONSTRAINT FK_Boleto_ContasReceber FOREIGN KEY (CodContaReceber) REFERENCES dbo.ContasReceber (CodContaReceber);

ALTER TABLE dbo.Boleto ADD CONSTRAINT FK_Boleto_PedidoVenda FOREIGN KEY (CodPedido) REFERENCES dbo.PedidoVenda (CodPedidoVenda);

ALTER TABLE dbo.BoletoFormato ADD CONSTRAINT FK_BoletoFormato_BoletoTipo FOREIGN KEY (CodBoletoTipo) REFERENCES dbo.BoletoTipo (CodBoletoTipo);

ALTER TABLE dbo.BoletoFormato ADD CONSTRAINT FK_BoletoFormato_InstituicaoFinanceira FOREIGN KEY (CodInstituicaoFinanceira) REFERENCES dbo.Cliente (CodFornecedor);

ALTER TABLE dbo.BoletoFormato ADD CONSTRAINT FK_BoletoFormato_UnidadeGestora FOREIGN KEY (UnidGestora) REFERENCES dbo.UnidadeGestora (UnidGestora);

ALTER TABLE dbo.Caixa ADD CONSTRAINT FK_Caixa_Cliente FOREIGN KEY (CodCliente) REFERENCES dbo.Cliente (CodCliente);

ALTER TABLE dbo.CaixaParcelas ADD CONSTRAINT FK_CaixaParcelas_Caixa FOREIGN KEY (CodCaixa) REFERENCES dbo.Caixa (CodCaixa);

ALTER TABLE dbo.CaixaParcelas ADD CONSTRAINT FK_CaixaParcelas_Moeda FOREIGN KEY (CodMoeda) REFERENCES dbo.Moeda (CodMoeda);

ALTER TABLE dbo.CartaoProcess ADD CONSTRAINT FK_CartaoProcess_CartaoFormato FOREIGN KEY (CodCartaoFormato) REFERENCES dbo.CartaoFormato (CodCartaoFormato);

ALTER TABLE dbo.CartaoProcessItens ADD CONSTRAINT FK_CartaoProcessItens_CartaoProcess FOREIGN KEY (CodCartaoProcess) REFERENCES dbo.CartaoProcess (CodCartaoProcess);

ALTER TABLE dbo.CartaoProcessItens ADD CONSTRAINT FK_CartaoProcessItens_CartaoStatus FOREIGN KEY (CodCartaoStatus) REFERENCES dbo.CartaoStatus (CodCartaoStatus);

ALTER TABLE dbo.CelulaProducao ADD CONSTRAINT FK_CelulaProducao_CentroCusto FOREIGN KEY (CodCentroCusto) REFERENCES dbo.CentroCusto (CodCentroCusto);

ALTER TABLE dbo.CelulaProducaoLinha ADD CONSTRAINT FK_CelulaProducaoLinha_CelulaProducao FOREIGN KEY (CodCelulaProducao) REFERENCES dbo.CelulaProducao (CodCelulaProducao);

ALTER TABLE dbo.CelulaProducaoLinha ADD CONSTRAINT FK_CelulaProducaoLinha_LinhaProducao FOREIGN KEY (CodLinhaProducao) REFERENCES dbo.LinhaProducao (CodLinhaProducao);

ALTER TABLE dbo.Classificador ADD CONSTRAINT FK_Classificador_ClassificadorTipo FOREIGN KEY (CodClassificadorTipo) REFERENCES dbo.ClassificadorTipo (CodClassificadorTipo);

ALTER TABLE dbo.Cliente ADD CONSTRAINT FK_Cliente_Bairro FOREIGN KEY (CodBairro) REFERENCES dbo.Bairro (CodBairro);

ALTER TABLE dbo.Cliente ADD CONSTRAINT FK_Cliente_Cidade FOREIGN KEY (CodCidade) REFERENCES dbo.Cidade (CodCidade);

ALTER TABLE dbo.Cliente ADD CONSTRAINT FK_Cliente_DiaSemana FOREIGN KEY (CodDiaSemana) REFERENCES dbo.DiaSemana (CodDiaSemana);

ALTER TABLE dbo.Cliente ADD CONSTRAINT FK_Cliente_Estado FOREIGN KEY (CodEstado) REFERENCES dbo.Estado (CodEstado);

ALTER TABLE dbo.Cliente ADD CONSTRAINT FK_Cliente_EstadoCivil FOREIGN KEY (CodEstadoCivil) REFERENCES dbo.EstadoCivil (CodEstadoCivil);

ALTER TABLE dbo.Cliente ADD CONSTRAINT FK_Cliente_EstadoFiscal FOREIGN KEY (CodEstadoFiscal) REFERENCES dbo.Estado (CodEstado);

ALTER TABLE dbo.Cliente ADD CONSTRAINT FK_Cliente_Indicacao FOREIGN KEY (CodIndicacao) REFERENCES dbo.Indicacao (CodIndicacao);

ALTER TABLE dbo.Cliente ADD CONSTRAINT FK_Cliente_MicroRegiao FOREIGN KEY (CodMicroRegiao) REFERENCES dbo.MicroRegiao (CodMicroRegiao);

ALTER TABLE dbo.Cliente ADD CONSTRAINT FK_Cliente_Profissao FOREIGN KEY (CodProfissao) REFERENCES dbo.Profissao (CodProfissao);

ALTER TABLE dbo.Cliente ADD CONSTRAINT FK_Cliente_Rede FOREIGN KEY (CodRede) REFERENCES dbo.Rede (CodRede);

ALTER TABLE dbo.Cliente ADD CONSTRAINT FK_Cliente_Regiao FOREIGN KEY (CodRegiao) REFERENCES dbo.Regiao (CodRegiao);

ALTER TABLE dbo.Cliente ADD CONSTRAINT FK_Cliente_Rota FOREIGN KEY (CodRota) REFERENCES dbo.Rota (CodRota);

ALTER TABLE dbo.Cliente ADD CONSTRAINT FK_Cliente_RotaEntrega FOREIGN KEY (CodRotaEntrega) REFERENCES dbo.Rota (CodRota);

ALTER TABLE dbo.Cliente ADD CONSTRAINT FK_Cliente_Segmento FOREIGN KEY (CodSegmento) REFERENCES dbo.Segmento (CodSegmento);

ALTER TABLE dbo.Cliente ADD CONSTRAINT FK_Cliente_TabelaPreco FOREIGN KEY (CodTabelaPreco) REFERENCES dbo.TabelaPreco (CodTabelaPreco);

ALTER TABLE dbo.Cliente ADD CONSTRAINT FK_Cliente_Zona FOREIGN KEY (CodZona) REFERENCES dbo.Zona (CodZona);

ALTER TABLE dbo.ClienteAnotacao ADD CONSTRAINT FK_ClienteAnotacao_Anotacao FOREIGN KEY (CodAnotacao) REFERENCES dbo.Anotacao (CodAnotacao);

ALTER TABLE dbo.ClienteAnotacao ADD CONSTRAINT FK_ClienteAnotacao_Cliente FOREIGN KEY (CodCliente) REFERENCES dbo.Cliente (CodCliente);

ALTER TABLE dbo.ClienteComentario ADD CONSTRAINT FK_ClienteComentario_Cliente FOREIGN KEY (CodCliente) REFERENCES dbo.Cliente (CodCliente);

ALTER TABLE dbo.ClienteComentario ADD CONSTRAINT FK_ClienteComentario_Funcionario FOREIGN KEY (CodVendedor) REFERENCES dbo.Funcionario (CodFuncionario);

ALTER TABLE dbo.ClienteCota ADD CONSTRAINT FK_ClienteCota_Cliente FOREIGN KEY (CodCliente) REFERENCES dbo.Cliente (CodCliente);

ALTER TABLE dbo.ClienteDesconto ADD CONSTRAINT FK_ClienteDesconto_Cliente FOREIGN KEY (CodCliente) REFERENCES dbo.Cliente (CodCliente);

ALTER TABLE dbo.ClienteDiaSemana ADD CONSTRAINT FK_ClienteDiaSemana_Cliente FOREIGN KEY (CodCliente) REFERENCES dbo.Cliente (CodCliente);

ALTER TABLE dbo.ClienteDiaSemana ADD CONSTRAINT FK_ClienteDiaSemana_DiaSemana FOREIGN KEY (CodDiaSemana) REFERENCES dbo.DiaSemana (CodDiaSemana);

ALTER TABLE dbo.ClienteDocumento ADD CONSTRAINT FK_ClienteDocumento_Cliente FOREIGN KEY (CodCliente) REFERENCES dbo.Cliente (CodCliente);

ALTER TABLE dbo.ClienteDocumento ADD CONSTRAINT FK_ClienteDocumento_DocumentoTipo FOREIGN KEY (CodDocumentoTipo) REFERENCES dbo.DocumentoTipo (CodDocumentoTipo);

ALTER TABLE dbo.ClienteExtrato ADD CONSTRAINT FK_CClienteExtrato_CCliente FOREIGN KEY (CodCliente) REFERENCES dbo.Cliente (CodCliente);

ALTER TABLE dbo.ClienteHistoricoCredito ADD CONSTRAINT FK_ClienteHistoricoCredito_Cliente FOREIGN KEY (CodCliente) REFERENCES dbo.Cliente (CodCliente);

ALTER TABLE dbo.ClienteMaterialEmbalagem ADD CONSTRAINT FK_ClienteMaterialEmbalagem_Cliente FOREIGN KEY (CodCliente) REFERENCES dbo.Cliente (CodCliente);

ALTER TABLE dbo.ClienteMaterialEmbalagem ADD CONSTRAINT FK_ClienteMaterialEmbalagem_MaterialEmbalagem FOREIGN KEY (CodMaterial, CodEmbalagem) REFERENCES dbo.MaterialEmbalagem (CodMaterial, CodEmbalagem);

ALTER TABLE dbo.Conta ADD CONSTRAINT FK_Conta_UnidadeGestora FOREIGN KEY (UnidGestora) REFERENCES dbo.UnidadeGestora (UnidGestora);

ALTER TABLE dbo.ContaSetor ADD CONSTRAINT FK_ContaSetor_Conta FOREIGN KEY (CodConta) REFERENCES dbo.Conta (CodConta);

ALTER TABLE dbo.ContaSetor ADD CONSTRAINT FK_ContaSetor_Setor FOREIGN KEY (CodSetor) REFERENCES dbo.Setor (CodSetor);

ALTER TABLE dbo.ContasPagar ADD CONSTRAINT FK_ContasPagar_CentroCusto FOREIGN KEY (CodCentroCusto) REFERENCES dbo.CentroCusto (CodCentroCusto);

ALTER TABLE dbo.ContasPagar ADD CONSTRAINT FK_ContasPagar_Conta FOREIGN KEY (CodConta) REFERENCES dbo.Conta (CodConta);

ALTER TABLE dbo.ContasPagar ADD CONSTRAINT FK_ContasPagar_Conta1 FOREIGN KEY (CodContaOrig) REFERENCES dbo.Conta (CodConta);

ALTER TABLE dbo.ContasPagar ADD CONSTRAINT FK_ContasPagar_Fornecedor FOREIGN KEY (CodFornecedor) REFERENCES dbo.Cliente (CodFornecedor);

ALTER TABLE dbo.ContasReceber ADD CONSTRAINT FK_ContasReceber_Cliente FOREIGN KEY (CodCliente) REFERENCES dbo.Cliente (CodCliente);

ALTER TABLE dbo.ContasReceber ADD CONSTRAINT FK_ContasReceber_Conta FOREIGN KEY (CodConta) REFERENCES dbo.Conta (CodConta);

ALTER TABLE dbo.ContasReceber ADD CONSTRAINT FK_ContasReceber_Conta1 FOREIGN KEY (CodContaOrig) REFERENCES dbo.Conta (CodConta);

ALTER TABLE dbo.Contrato ADD CONSTRAINT FK_Contrato_CCliente FOREIGN KEY (CodCliente) REFERENCES dbo.Cliente (CodCliente);

ALTER TABLE dbo.Contrato ADD CONSTRAINT FK_Contrato_Classificador FOREIGN KEY (CodClassificador) REFERENCES dbo.Classificador (CodClassificador);

ALTER TABLE dbo.ContratoPatrimonio ADD CONSTRAINT FK_ContratoPatrimonio_Contrato FOREIGN KEY (CodContrato) REFERENCES dbo.Contrato (CodContrato);

ALTER TABLE dbo.ContratoPatrimonio ADD CONSTRAINT FK_ContratoPatrimonio_Patrimonio FOREIGN KEY (CodPatrimonio) REFERENCES dbo.Patrimonio (CodPatrimonio);

ALTER TABLE dbo.CriterioFornecedorFornecedor ADD CONSTRAINT FK_CriterioFornecedorFornecedor_Cliente FOREIGN KEY (CodFornecedor) REFERENCES dbo.Cliente (CodFornecedor);

ALTER TABLE dbo.CriterioFornecedorFornecedor ADD CONSTRAINT FK_CriterioFornecedorFornecedor_CriterioFornecedor FOREIGN KEY (CodCriterioFornecedor) REFERENCES dbo.CriterioFornecedor (CodCriterioFornecedor);

ALTER TABLE dbo.Documento ADD CONSTRAINT FK_Documento_PedidoVendaRepasse FOREIGN KEY (CodPedidoVendaRepasse) REFERENCES dbo.PedidoVendaRepasse (CodPedidoVendaRepasse);

ALTER TABLE dbo.Documento ADD CONSTRAINT FK_Documento_PedidoVendaRepasseSup FOREIGN KEY (CodPedidoVendaRepasseSup) REFERENCES dbo.PedidoVendaRepasse (CodPedidoVendaRepasse);

ALTER TABLE dbo.Documento ADD CONSTRAINT FK_Documento_TipoDocumento FOREIGN KEY (CodTipoDoc) REFERENCES dbo.TipoDocumento (CodTipoDoc);

ALTER TABLE dbo.DocumentoAssinatura ADD CONSTRAINT FK_DocumentoAssinatura_Assinatura FOREIGN KEY (UUIDAssinatura) REFERENCES dbo.Assinatura (UUIDAssinatura);

ALTER TABLE dbo.DocumentoAssinatura ADD CONSTRAINT FK_DocumentoAssinatura_FuncionarioExtrato FOREIGN KEY (CodFuncionarioExtrato) REFERENCES dbo.FuncionarioExtrato (CodFuncionarioExtrato);

ALTER TABLE dbo.DocumentoConferencia ADD CONSTRAINT FK_DocumentoConferencia_DocumentoConferenciaTipo FOREIGN KEY (CodDocumentoConferenciaTipo) REFERENCES dbo.DocumentoConferenciaTipo (CodDocumentoConferenciaTipo);

ALTER TABLE dbo.DocumentoFornecedorMult ADD CONSTRAINT FK_DocumentoFornecedorMult_Cliente FOREIGN KEY (CodFornecedor) REFERENCES dbo.Cliente (CodFornecedor);

ALTER TABLE dbo.DocumentoFornecedorMult ADD CONSTRAINT FK_DocumentoFornecedorMult_Documento FOREIGN KEY (CodDoc) REFERENCES dbo.Documento (CodDoc);

ALTER TABLE dbo.DocumentoImagem ADD CONSTRAINT FK_DocumentoImagem_Documento FOREIGN KEY (CodDoc) REFERENCES dbo.Documento (CodDoc);

ALTER TABLE dbo.DocumentoItens ADD CONSTRAINT FK_DocumentoItens_Documento FOREIGN KEY (CodDoc) REFERENCES dbo.Documento (CodDoc);

ALTER TABLE dbo.DocumentoItensConferencia ADD CONSTRAINT FK_DocumentoItensConferencia_DocumentoConferencia FOREIGN KEY (CodDocumentoConferencia) REFERENCES dbo.DocumentoConferencia (CodDocumentoConferencia);

ALTER TABLE dbo.DocumentoModelo ADD CONSTRAINT FK_DocumentoModelo_DocumentoTipo FOREIGN KEY (CodDocumentoTipo) REFERENCES dbo.DocumentoTipo (CodDocumentoTipo);

ALTER TABLE dbo.DocumentoProcesso ADD CONSTRAINT FK_DocumentoProcesso_Documento FOREIGN KEY (CodDoc) REFERENCES dbo.Documento (CodDoc);

ALTER TABLE dbo.DocumentoProcesso ADD CONSTRAINT FK_DocumentoProcesso_Material FOREIGN KEY (CodMaterial) REFERENCES dbo.Material (CodMaterial);

ALTER TABLE dbo.DocumentoProcesso ADD CONSTRAINT FK_DocumentoProcesso_Unidade FOREIGN KEY (CodUnidade) REFERENCES dbo.Unidade (CodUnidade);

ALTER TABLE dbo.DocumentoProcessoFunc ADD CONSTRAINT FK_DocumentoProcessoFunc_DocumentoProcesso FOREIGN KEY (CodDoc, CodMaterial, CodUnidade, Ordem) REFERENCES dbo.DocumentoProcesso (CodDoc, CodMaterial, CodUnidade, Ordem);

ALTER TABLE dbo.EficienciaSeparacaoPedido ADD CONSTRAINT FK_EficienciaSeparacaoPedido_Funcionario FOREIGN KEY (CodFuncionario) REFERENCES dbo.Funcionario (CodFuncionario);

ALTER TABLE dbo.EficienciaSeparacaoPedido ADD CONSTRAINT FK_EficienciaSeparacaoPedido_PedidoVenda FOREIGN KEY (CodPedidoVenda) REFERENCES dbo.PedidoVenda (CodPedidoVenda);

ALTER TABLE dbo.Embalagem ADD CONSTRAINT FK_Embalagem_Unidade FOREIGN KEY (CodUnidade) REFERENCES dbo.Unidade (CodUnidade);

ALTER TABLE dbo.EquipeFuncionario ADD CONSTRAINT FK_EquipeFuncionario_Equipe FOREIGN KEY (CodEquipe) REFERENCES dbo.Equipe (CodEquipe);

ALTER TABLE dbo.EquipeFuncionario ADD CONSTRAINT FK_EquipeFuncionario_Funcionario FOREIGN KEY (CodFuncionario) REFERENCES dbo.Funcionario (CodFuncionario);

ALTER TABLE dbo.EquipeFuncionario ADD CONSTRAINT FK_EquipeFuncionario_Material FOREIGN KEY (CodMaterial) REFERENCES dbo.Material (CodMaterial);

ALTER TABLE dbo.EstacaoStone ADD CONSTRAINT FK_EstacaoStone_Estacao FOREIGN KEY (CodEstacao) REFERENCES dbo.Estacao (CodEstacao);

ALTER TABLE dbo.EstacaoStone ADD CONSTRAINT FK_EstacaoStone_StoneMaquina FOREIGN KEY (UUIDStoneMaquina) REFERENCES dbo.StoneMaquina (UUIDStoneMaquina);

ALTER TABLE dbo.Evento ADD CONSTRAINT FK_Evento_EventoSubGrupo FOREIGN KEY (CodSubGrupo) REFERENCES dbo.EventoSubGrupo (CodSubGrupo);

ALTER TABLE dbo.EventoComplemento ADD CONSTRAINT FK_EventoComplemento_Complemento FOREIGN KEY (CodComplemento) REFERENCES dbo.Complemento (CodComplemento);

ALTER TABLE dbo.EventoComplemento ADD CONSTRAINT FK_EventoComplemento_Evento FOREIGN KEY (CodEvento) REFERENCES dbo.Evento (CodEvento);

ALTER TABLE dbo.EventoMaterialTipo ADD CONSTRAINT FK_EventoMaterialTipo_Evento FOREIGN KEY (CodEvento) REFERENCES dbo.Evento (CodEvento);

ALTER TABLE dbo.EventoMaterialTipo ADD CONSTRAINT FK_EventoMaterialTipo_MaterialTipo FOREIGN KEY (CodMaterialTipo) REFERENCES dbo.MaterialTipo (CodMaterialTipo);

ALTER TABLE dbo.EventoSubGrupo ADD CONSTRAINT FK_EventoSubGrupo_EventoGrupo FOREIGN KEY (CodGrupo) REFERENCES dbo.EventoGrupo (CodGrupo);

ALTER TABLE dbo.EventoTipoDocumento ADD CONSTRAINT FK_EventoTipoDocumento_Evento FOREIGN KEY (CodEvento) REFERENCES dbo.Evento (CodEvento);

ALTER TABLE dbo.EventoTipoDocumento ADD CONSTRAINT FK_EventoTipoDocumento_TipoDocumento FOREIGN KEY (CodTipoDoc) REFERENCES dbo.TipoDocumento (CodTipoDoc);

ALTER TABLE dbo.FormaReceb ADD CONSTRAINT FK_FormaReceb_FormaRecebGrupo FOREIGN KEY (CodFormaRecebGrupo) REFERENCES dbo.FormaRecebGrupo (CodFormaRecebGrupo);

ALTER TABLE dbo.FormaRecebParcelas ADD CONSTRAINT FK_FormaRecebParcelas_FormaReceb FOREIGN KEY (CodFormaReceb) REFERENCES dbo.FormaReceb (CodFormaReceb);

ALTER TABLE dbo.FormaRecebParcelas ADD CONSTRAINT FK_FormaRecebParcelas_Moeda FOREIGN KEY (CodMoeda) REFERENCES dbo.Moeda (CodMoeda);

ALTER TABLE dbo.Formato ADD CONSTRAINT FK_Formato_FormatoTipo FOREIGN KEY (CodFormatoTipo) REFERENCES dbo.FormatoTipo (CodFormatoTipo);

ALTER TABLE dbo.Funcionario ADD CONSTRAINT FK_Funcionario_Cargo FOREIGN KEY (CodCargo) REFERENCES dbo.Cargo (CodCargo);

ALTER TABLE dbo.Funcionario ADD CONSTRAINT FK_Funcionario_PontoHorario FOREIGN KEY (CodPontoHorario) REFERENCES dbo.PontoHorario (CodPontoHorario);

ALTER TABLE dbo.Funcionario ADD CONSTRAINT FK_Funcionario_Setor FOREIGN KEY (CodSetor) REFERENCES dbo.Setor (CodSetor);

ALTER TABLE dbo.FuncionarioCurso ADD CONSTRAINT FK_FuncionarioCurso_Funcionario FOREIGN KEY (CodFuncionario) REFERENCES dbo.Funcionario (CodFuncionario);

ALTER TABLE dbo.FuncionarioDigital ADD CONSTRAINT FK_FuncionarioDigital_Funcionario FOREIGN KEY (CodFuncionario) REFERENCES dbo.Funcionario (CodFuncionario);

ALTER TABLE dbo.FuncionarioExtrato ADD CONSTRAINT FK_CFuncionarioExtrato_CFuncionario FOREIGN KEY (CodFuncionario) REFERENCES dbo.Funcionario (CodFuncionario);

ALTER TABLE dbo.FuncionarioFerias ADD CONSTRAINT FK_FuncionarioFerias_Funcionario FOREIGN KEY (CodFuncionario) REFERENCES dbo.Funcionario (CodFuncionario);

ALTER TABLE dbo.FuncionarioFoto ADD CONSTRAINT FK_FuncionarioFoto_Funcionario FOREIGN KEY (CodFuncionario) REFERENCES dbo.Funcionario (CodFuncionario);

ALTER TABLE dbo.FuncionarioHistorico ADD CONSTRAINT FK_FuncionarioHistorico_Cargo FOREIGN KEY (CodCargo) REFERENCES dbo.Cargo (CodCargo);

ALTER TABLE dbo.FuncionarioHistorico ADD CONSTRAINT FK_FuncionarioHistorico_Funcionario FOREIGN KEY (CodFuncionario) REFERENCES dbo.Funcionario (CodFuncionario);

ALTER TABLE dbo.FuncionarioHistorico ADD CONSTRAINT FK_FuncionarioHistorico_FuncionarioCurso FOREIGN KEY (CodFuncionarioCurso) REFERENCES dbo.FuncionarioCurso (CodFuncionarioCurso);

ALTER TABLE dbo.FuncionarioHistorico ADD CONSTRAINT FK_FuncionarioHistorico_Setor FOREIGN KEY (CodSetor) REFERENCES dbo.Setor (CodSetor);

ALTER TABLE dbo.Grupo ADD CONSTRAINT FK_Grupo_GrupoClasse FOREIGN KEY (CodGrupoClasse) REFERENCES dbo.GrupoClasse (CodGrupoClasse);

ALTER TABLE dbo.IndiceComissao ADD CONSTRAINT FK_IndiceComissao_IndiceModelo FOREIGN KEY (CodIndiceModelo) REFERENCES dbo.IndiceModelo (CodIndiceModelo);

ALTER TABLE dbo.IndiceComissaoFaixa ADD CONSTRAINT FK_IndiceComissaoFaixa_IndiceComissao FOREIGN KEY (CodIndiceComissao) REFERENCES dbo.IndiceComissao (CodIndiceComissao);

ALTER TABLE dbo.IntegracaoContabilConfigDocumentoCampos ADD CONSTRAINT FK_IntegracaoContabilConfigDocumentoCampos_IntegracaoContabilConfigDocumentoCampos FOREIGN KEY (CodIntegContabilConfigDocumento) REFERENCES dbo.IntegracaoContabilConfigDocumento (CodIntegContabilConfigDocumento);

ALTER TABLE dbo.IntegracaoContabilConfigNotaFiscalCampos ADD CONSTRAINT FK_IntegracaoContabilConfigNotaFiscalCampos_IntegracaoContabilConfigNotaFiscal FOREIGN KEY (CodIntegContabilConfigNF) REFERENCES dbo.IntegracaoContabilConfigNotaFiscal (CodIntegContabilConfigNF);

ALTER TABLE dbo.IntegracaoLancamento ADD CONSTRAINT FK_IntegracaoLancamento_IntegracaoMovimento FOREIGN KEY (CodIntegracaoMovimento) REFERENCES dbo.IntegracaoMovimento (CodIntegracaoMovimento);

ALTER TABLE dbo.IntegracaoMovimento ADD CONSTRAINT FK_IntegracaoMovimento_Integracao FOREIGN KEY (CodIntegracao) REFERENCES dbo.Integracao (CodIntegracao);

ALTER TABLE dbo.Lancamento ADD CONSTRAINT FK_Lancamento_Documento FOREIGN KEY (CodDoc) REFERENCES dbo.Documento (CodDoc);

ALTER TABLE dbo.LancamentoConta ADD CONSTRAINT FK_LancamentoConta_Lancamento FOREIGN KEY (NumLanc) REFERENCES dbo.Lancamento (NumLanc);

ALTER TABLE dbo.LinhaProducaoMaterial ADD CONSTRAINT FK_LinhaProducaoMaterial_LinhaProducao FOREIGN KEY (CodLinhaProducao) REFERENCES dbo.LinhaProducao (CodLinhaProducao);

ALTER TABLE dbo.LinhaProducaoMaterial ADD CONSTRAINT FK_LinhaProducaoMaterial_Material FOREIGN KEY (CodMaterial) REFERENCES dbo.Material (CodMaterial);

ALTER TABLE dbo.LoginUsuario ADD CONSTRAINT FK_LoginUsuario_ClienteSistema FOREIGN KEY (CodCliente) REFERENCES dbo.ClienteSistema (CodCliente);

ALTER TABLE dbo.LoginUsuario ADD CONSTRAINT FK_LoginUsuario_LoginGrupoUsuario FOREIGN KEY (CodGrupoUsuario) REFERENCES dbo.LoginGrupoUsuario (CodGrupoUsuario);

ALTER TABLE dbo.LoginUsuarioUnidade ADD CONSTRAINT FK_LoginUsuarioUnidade_UnidadeGestora FOREIGN KEY (CodUnidGestora) REFERENCES dbo.UnidadeGestora (UnidGestora);

ALTER TABLE dbo.MapaAbastecimento ADD CONSTRAINT FK_MapaAbastecimento_Fornecedor FOREIGN KEY (CodFornecedor) REFERENCES dbo.Cliente (CodFornecedor);

ALTER TABLE dbo.MapaAbastecimentoMovimentacao ADD CONSTRAINT FK_MapaAbastecimentoMovimentacao_MapaAbastecimento FOREIGN KEY (CodMapaAbastecimento) REFERENCES dbo.MapaAbastecimento (CodMapaAbastecimento);

ALTER TABLE dbo.MapaAbastecimentoMovimentacao ADD CONSTRAINT FK_MapaAbastecimentoMovimentacao_Movimentacao FOREIGN KEY (CodMovimentacao) REFERENCES dbo.VeiculoMovimentacao (CodMovimentacao);

ALTER TABLE dbo.MapaEvento ADD CONSTRAINT FK_MapaEvento_Cliente FOREIGN KEY (CodCliente) REFERENCES dbo.Cliente (CodCliente);

ALTER TABLE dbo.MapaEvento ADD CONSTRAINT FK_MapaEvento_Funcionario FOREIGN KEY (CodVendedor) REFERENCES dbo.Funcionario (CodFuncionario);

ALTER TABLE dbo.MapaExpedicao ADD CONSTRAINT FK_MapaExpedicao_MapaExpedicao FOREIGN KEY (CodMapaExpedicaoRetorno) REFERENCES dbo.MapaExpedicao (CodMapaExpedicao);

ALTER TABLE dbo.MapaExpedicaoDespesa ADD CONSTRAINT FK_MapaExpedicaoDespesa_MapaExpedicao FOREIGN KEY (CodMapaExpedicao) REFERENCES dbo.MapaExpedicao (CodMapaExpedicao);

ALTER TABLE dbo.MapaExpedicaoItensConferencia ADD CONSTRAINT FK_MapaExpedicaoItensConferencia_MapaExpedicaoConferencia FOREIGN KEY (CodMapaExpedicaoConferencia) REFERENCES dbo.MapaExpedicaoConferencia (CodMapaExpedicaoConferencia);

ALTER TABLE dbo.MapaExpedicaoPedido ADD CONSTRAINT FK_MapaExpedicaoPedido_MapaExpedicao FOREIGN KEY (CodMapaExpedicao) REFERENCES dbo.MapaExpedicao (CodMapaExpedicao);

ALTER TABLE dbo.MapaExpedicaoPedido ADD CONSTRAINT FK_MapaExpedicaoPedido_PedidoVenda FOREIGN KEY (CodPedidoVenda) REFERENCES dbo.PedidoVenda (CodPedidoVenda);

ALTER TABLE dbo.MapaExpedicaoPreVenda ADD CONSTRAINT FK_MapaExpedicaoPreVenda_MapaExpedicao FOREIGN KEY (CodMapaExpedicao) REFERENCES dbo.MapaExpedicao (CodMapaExpedicao);

ALTER TABLE dbo.MapaProducao ADD CONSTRAINT FK_MapaProducao_Cliente FOREIGN KEY (CodCliente) REFERENCES dbo.Cliente (CodCliente);

ALTER TABLE dbo.MapaProducao ADD CONSTRAINT FK_MapaProducao_Motorista FOREIGN KEY (CodMotorista) REFERENCES dbo.Funcionario (CodFuncionario);

ALTER TABLE dbo.MapaProducao ADD CONSTRAINT FK_MapaProducao_Veiculo FOREIGN KEY (CodVeiculo) REFERENCES dbo.Veiculo (CodVeiculo);

ALTER TABLE dbo.MapaProducao ADD CONSTRAINT FK_MapaProducao_Vendedor FOREIGN KEY (CodVendedor) REFERENCES dbo.Funcionario (CodFuncionario);

ALTER TABLE dbo.MapaProducaoApoio ADD CONSTRAINT FK_MapaProducaoApoio_MapaProducao FOREIGN KEY (CodMapaProducao) REFERENCES dbo.MapaProducao (CodMapaProducao);

ALTER TABLE dbo.MapaProducaoApoio ADD CONSTRAINT FK_MapaProducaoApoio_MapaProducao1 FOREIGN KEY (CodMapaProducaoApoio) REFERENCES dbo.MapaProducao (CodMapaProducao);

ALTER TABLE dbo.MapaProducaoDocumento ADD CONSTRAINT FK_MapaProducaoDocumento_MapaProducao FOREIGN KEY (CodMapaProducao) REFERENCES dbo.MapaProducao (CodMapaProducao);

ALTER TABLE dbo.MapaProducaoEtapa ADD CONSTRAINT FK_MapaProducaoEtapa_MapaProducao FOREIGN KEY (CodMapaProducao) REFERENCES dbo.MapaProducao (CodMapaProducao);

ALTER TABLE dbo.MapaProducaoInsumo ADD CONSTRAINT FK_MapaProducaoInsumo_MapaProducao FOREIGN KEY (CodMapaProducao) REFERENCES dbo.MapaProducao (CodMapaProducao);

ALTER TABLE dbo.MapaProducaoInsumo ADD CONSTRAINT FK_MapaProducaoInsumo_Material FOREIGN KEY (CodMaterial) REFERENCES dbo.Material (CodMaterial);

ALTER TABLE dbo.MapaProducaoMaterial ADD CONSTRAINT FK_MapaProducaoMaterial_Embalagem FOREIGN KEY (CodEmbalagem) REFERENCES dbo.Embalagem (CodEmbalagem);

ALTER TABLE dbo.MapaProducaoMaterial ADD CONSTRAINT FK_MapaProducaoMaterial_MapaProducao FOREIGN KEY (CodMapaProducao) REFERENCES dbo.MapaProducao (CodMapaProducao);

ALTER TABLE dbo.MapaProducaoMaterial ADD CONSTRAINT FK_MapaProducaoMaterial_Material FOREIGN KEY (CodMaterial) REFERENCES dbo.Material (CodMaterial);

ALTER TABLE dbo.MapaProducaoPedido ADD CONSTRAINT FK_MapaProducaoPedido_MapaProducao FOREIGN KEY (CodMapaProducao) REFERENCES dbo.MapaProducao (CodMapaProducao);

ALTER TABLE dbo.MapaProducaoPedido ADD CONSTRAINT FK_MapaProducaoPedido_PedidoVenda FOREIGN KEY (CodPedidoVenda) REFERENCES dbo.PedidoVenda (CodPedidoVenda);

ALTER TABLE dbo.MapaProducaoProcesso ADD CONSTRAINT FK_MapaProducaoProcesso_MapaProducao FOREIGN KEY (CodMapaProducao) REFERENCES dbo.MapaProducao (CodMapaProducao);

ALTER TABLE dbo.MapaProducaoProcesso ADD CONSTRAINT FK_MapaProducaoProcesso_Material FOREIGN KEY (CodMaterial) REFERENCES dbo.Material (CodMaterial);

ALTER TABLE dbo.MapaProducaoProcesso ADD CONSTRAINT FK_MapaProducaoProcesso_Unidade FOREIGN KEY (CodUnidade) REFERENCES dbo.Unidade (CodUnidade);

ALTER TABLE dbo.MapaProducaoProcessoFunc ADD CONSTRAINT FK_MapaProducaoProcessoFunc_MapaProducaoProcesso FOREIGN KEY (CodMapaProducao, CodMaterial, Ordem) REFERENCES dbo.MapaProducaoProcesso (CodMapaProducao, CodMaterial, Ordem);

ALTER TABLE dbo.MapaProducaoProcessoMaterial ADD CONSTRAINT FK_MapaProducaoProcessoMaterial_MapaProducaoProcesso FOREIGN KEY (CodMapaProducao, CodMaterial, Ordem) REFERENCES dbo.MapaProducaoProcesso (CodMapaProducao, CodMaterial, Ordem);

ALTER TABLE dbo.MapaProducaoSubTipo ADD CONSTRAINT FK_MapaProducaoSubTipo_MapaProducaoTipo FOREIGN KEY (CodMapaProducaoTipo) REFERENCES dbo.MapaProducaoTipo (CodMapaProducaoTipo);

ALTER TABLE dbo.Material ADD CONSTRAINT FK_Material_EmbalagemTipo FOREIGN KEY (CodEmbalagemTipo) REFERENCES dbo.EmbalagemTipo (CodEmbalagemTipo);

ALTER TABLE dbo.Material ADD CONSTRAINT FK_Material_Fabricante FOREIGN KEY (CodFabricante) REFERENCES dbo.Fabricante (CodFabricante);

ALTER TABLE dbo.Material ADD CONSTRAINT FK_Material_MaterialOrdem FOREIGN KEY (CodMaterialOrdem) REFERENCES dbo.MaterialOrdem (CodMaterialOrdem);

ALTER TABLE dbo.Material ADD CONSTRAINT FK_Material_MaterialRetornavel FOREIGN KEY (CodMaterialRetornavel) REFERENCES dbo.Material (CodMaterial);

ALTER TABLE dbo.Material ADD CONSTRAINT FK_Material_MaterialVendaVoucher FOREIGN KEY (CodMaterialVincVoucher) REFERENCES dbo.Material (CodMaterial);

ALTER TABLE dbo.Material ADD CONSTRAINT FK_Material_RestauranteFila FOREIGN KEY (CodRestauranteFila) REFERENCES dbo.RestauranteFila (CodRestauranteFila);

ALTER TABLE dbo.Material ADD CONSTRAINT FK_Material_Sabor FOREIGN KEY (CodSabor) REFERENCES dbo.Sabor (CodSabor);

ALTER TABLE dbo.Material ADD CONSTRAINT FK_Material_Unidade FOREIGN KEY (CodUnidade) REFERENCES dbo.Unidade (CodUnidade);

ALTER TABLE dbo.MaterialAut ADD CONSTRAINT FK_MaterialAut_Material FOREIGN KEY (CodMaterial) REFERENCES dbo.Material (CodMaterial);

ALTER TABLE dbo.MaterialBonusVolume ADD CONSTRAINT FK_MaterialBonusVolume_Material FOREIGN KEY (CodMaterial) REFERENCES dbo.Material (CodMaterial);

ALTER TABLE dbo.MaterialComissao ADD CONSTRAINT FK_MaterialComissao_Material FOREIGN KEY (CodMaterial) REFERENCES dbo.Material (CodMaterial);

ALTER TABLE dbo.MaterialComissaoAnual ADD CONSTRAINT FK_MaterialComissaoAnual_Material FOREIGN KEY (CodMaterial) REFERENCES dbo.Material (CodMaterial);

ALTER TABLE dbo.MaterialEficiencia ADD CONSTRAINT FK_MaterialEficiencia_Material FOREIGN KEY (CodMaterial) REFERENCES dbo.Material (CodMaterial);

ALTER TABLE dbo.MaterialEmbalagem ADD CONSTRAINT FK_MaterialEmbalagem_Embalagem FOREIGN KEY (CodEmbalagem) REFERENCES dbo.Embalagem (CodEmbalagem);

ALTER TABLE dbo.MaterialEmbalagem ADD CONSTRAINT FK_MaterialEmbalagem_Material FOREIGN KEY (CodMaterial) REFERENCES dbo.Material (CodMaterial);

ALTER TABLE dbo.MaterialFornecedor ADD CONSTRAINT FK_MaterialFornecedor_Fornecedor FOREIGN KEY (CodFornecedor) REFERENCES dbo.Cliente (CodFornecedor);

ALTER TABLE dbo.MaterialFornecedor ADD CONSTRAINT FK_MaterialFornecedor_Material FOREIGN KEY (CodMaterial) REFERENCES dbo.Material (CodMaterial);

ALTER TABLE dbo.MaterialHistoricoCusto ADD CONSTRAINT FK_MaterialHistoricoCusto_Embalagem FOREIGN KEY (CodEmbalagem) REFERENCES dbo.Embalagem (CodEmbalagem);

ALTER TABLE dbo.MaterialHistoricoCusto ADD CONSTRAINT FK_MaterialHistoricoCusto_Material FOREIGN KEY (CodMaterial) REFERENCES dbo.Material (CodMaterial);

ALTER TABLE dbo.MaterialIBSMun ADD CONSTRAINT FK_MaterialIBSMun_Material FOREIGN KEY (CodMaterial) REFERENCES dbo.Material (CodMaterial);

ALTER TABLE dbo.MaterialIBSUF ADD CONSTRAINT FK_MaterialIBSUF_Material FOREIGN KEY (CodMaterial) REFERENCES dbo.Material (CodMaterial);

ALTER TABLE dbo.MaterialICMS ADD CONSTRAINT FK_MaterialICMS_Material FOREIGN KEY (CodMaterial) REFERENCES dbo.Material (CodMaterial);

ALTER TABLE dbo.MaterialICMSSubst ADD CONSTRAINT FK_MaterialICMSSubst_Material FOREIGN KEY (CodMaterial) REFERENCES dbo.Material (CodMaterial);

ALTER TABLE dbo.MaterialImagem ADD CONSTRAINT FK_MaterialImagem_Material FOREIGN KEY (CodMaterial) REFERENCES dbo.Material (CodMaterial);

ALTER TABLE dbo.MaterialImposto ADD CONSTRAINT FK_MaterialImposto_Material FOREIGN KEY (CodMaterial) REFERENCES dbo.Material (CodMaterial);

ALTER TABLE dbo.MaterialIntegracaoContabil ADD CONSTRAINT FK_MaterialIntegracaoContabil_NotaFiscalIntegracaoCampos FOREIGN KEY (CodNotaFiscalIntegracaoCampos) REFERENCES dbo.NotaFiscalIntegracaoCampos (CodNotaFiscalIntegracaoCampos);

ALTER TABLE dbo.MaterialIntegracaoContabil ADD CONSTRAINT FK_MaterialIntegracaoContabil_NotaFiscalIntegracaoTipo FOREIGN KEY (CodNotaFiscalIntegracaoTipo) REFERENCES dbo.NotaFiscalIntegracaoTipo (CodNotaFiscalIntegracaoTipo);

ALTER TABLE dbo.MaterialIntegracaoContabilDocumento ADD CONSTRAINT FK_MaterialIntegracaoContabilDocumento_DocumentoIntegracaoCampos FOREIGN KEY (CodDocumentoIntegracaoCampos) REFERENCES dbo.DocumentoIntegracaoCampos (CodDocumentoIntegracaoCampos);

ALTER TABLE dbo.MaterialIntegracaoContabilDocumento ADD CONSTRAINT FK_MaterialIntegracaoContabilDocumento_DocumentoIntegracaoTIpo FOREIGN KEY (CodDocumentoIntegracaoTipo) REFERENCES dbo.DocumentoIntegracaoTIpo (CodDocumentoIntegracaoTipo);

ALTER TABLE dbo.MaterialItens ADD CONSTRAINT FK_MaterialItens_Material_1 FOREIGN KEY (CodMaterial) REFERENCES dbo.Material (CodMaterial);

ALTER TABLE dbo.MaterialItens ADD CONSTRAINT FK_MaterialItens_Material_2 FOREIGN KEY (CodItem) REFERENCES dbo.Material (CodMaterial);

ALTER TABLE dbo.MaterialLote ADD CONSTRAINT FK_MaterialLote_Material FOREIGN KEY (CodMaterial) REFERENCES dbo.Material (CodMaterial);

ALTER TABLE dbo.MaterialMarkupValor ADD CONSTRAINT FK_MaterialMarkupValor_Material FOREIGN KEY (CodMaterial) REFERENCES dbo.Material (CodMaterial);

ALTER TABLE dbo.MaterialMarkupValor ADD CONSTRAINT FK_MaterialMarkupValor_MaterialMarkupCampos FOREIGN KEY (Campo) REFERENCES dbo.MaterialMarkupCampos (Campo);

ALTER TABLE dbo.MaterialNaturezaOpFiscal ADD CONSTRAINT FK_MaterialNaturezaOpFiscal_Material FOREIGN KEY (CodMaterial) REFERENCES dbo.Material (CodMaterial);

ALTER TABLE dbo.MaterialObjetivo ADD CONSTRAINT FK_MaterialObjetivo_Material FOREIGN KEY (CodMaterial) REFERENCES dbo.Material (CodMaterial);

ALTER TABLE dbo.MaterialPontuacao ADD CONSTRAINT FK_MaterialPontuacao_Material FOREIGN KEY (CodMaterial) REFERENCES dbo.Material (CodMaterial);

ALTER TABLE dbo.MaterialPontuacaoPrecoCompra ADD CONSTRAINT FK_MaterialPontuacaoPrecoCompra_MaterialPontuacao FOREIGN KEY (CodMaterialPontuacao) REFERENCES dbo.MaterialPontuacao (CodMaterialPontuacao);

ALTER TABLE dbo.MaterialPreco ADD CONSTRAINT FK_MaterialPreco_Material FOREIGN KEY (CodMaterial) REFERENCES dbo.Material (CodMaterial);

ALTER TABLE dbo.MaterialPrecoHistorico ADD CONSTRAINT FK_MaterialPrecoHistorico_Material FOREIGN KEY (CodMaterial) REFERENCES dbo.Material (CodMaterial);

ALTER TABLE dbo.Moeda ADD CONSTRAINT FK_Moeda_Conta FOREIGN KEY (CodConta) REFERENCES dbo.Conta (CodConta);

ALTER TABLE dbo.Moeda ADD CONSTRAINT FK_Moeda_InstituicaoFinanceira FOREIGN KEY (CodInstituicaoFinanceira) REFERENCES dbo.Cliente (CodFornecedor);

ALTER TABLE dbo.NaturezaOp ADD CONSTRAINT FK_NaturezaOp_NaturezaOperacao FOREIGN KEY (CodNaturezaOperacao) REFERENCES dbo.NaturezaOperacao (CodNaturezaOperacao);

ALTER TABLE dbo.NaturezaOp ADD CONSTRAINT FK_NaturezaOp_NaturezaOpFiscal FOREIGN KEY (CodNaturezaOpFiscal) REFERENCES dbo.NaturezaOpFiscal (CodNaturezaOpFiscal);

ALTER TABLE dbo.NaturezaOpCliente ADD CONSTRAINT FK_NaturezaOpCliente_Cliente FOREIGN KEY (CodCliente) REFERENCES dbo.Cliente (CodCliente);

ALTER TABLE dbo.NaturezaOpCliente ADD CONSTRAINT FK_NaturezaOpCliente_NaturezaOp FOREIGN KEY (CodNaturezaOperacao) REFERENCES dbo.NaturezaOperacao (CodNaturezaOperacao);

ALTER TABLE dbo.NaturezaOpCompra ADD CONSTRAINT FK_NaturezaOpCompra_NaturezaOperacao FOREIGN KEY (CodNaturezaOperacao) REFERENCES dbo.NaturezaOperacaoCompra (CodNaturezaOperacao);

ALTER TABLE dbo.NaturezaOpCompra ADD CONSTRAINT FK_NaturezaOpCompra_NaturezaOpFiscal FOREIGN KEY (CodNaturezaOpFiscal) REFERENCES dbo.NaturezaOpFiscal (CodNaturezaOpFiscal);

ALTER TABLE dbo.NaturezaOperacao ADD CONSTRAINT FK_NaturezaOperacao_NaturezaOperacaoClasse FOREIGN KEY (CodNaturezaOpClasse) REFERENCES dbo.NaturezaOperacaoClasse (CodNaturezaOpClasse);

ALTER TABLE dbo.NaturezaOperacao ADD CONSTRAINT FK_NaturezaOperacao_NotaFiscalIntegracaoTipo FOREIGN KEY (CodNotaFiscalIntegracaoTipo) REFERENCES dbo.NotaFiscalIntegracaoTipo (CodNotaFiscalIntegracaoTipo);

ALTER TABLE dbo.NaturezaOpFormaReceb ADD CONSTRAINT FK_NaturezaOpFormaReceb_FormaReceb FOREIGN KEY (CodFormaReceb) REFERENCES dbo.FormaReceb (CodFormaReceb);

ALTER TABLE dbo.NaturezaOpFormaReceb ADD CONSTRAINT FK_NaturezaOpFormaReceb_NaturezaOp FOREIGN KEY (CodNaturezaOperacao) REFERENCES dbo.NaturezaOperacao (CodNaturezaOperacao);

ALTER TABLE dbo.NFeDestConfRec ADD CONSTRAINT FK_NFeDestConfRec_NFeDest FOREIGN KEY (CodNFeDest) REFERENCES dbo.NFeDest (CodNFeDest);

ALTER TABLE dbo.NFeDestImportItens ADD CONSTRAINT FK_NFeDestImportItens_NFeDest FOREIGN KEY (CodNFeDest) REFERENCES dbo.NFeDest (CodNFeDest);

ALTER TABLE dbo.NFeDestImportItens ADD CONSTRAINT FK_NFeDestImportItens_NFeDestImport FOREIGN KEY (CodNFeDestImport) REFERENCES dbo.NFeDestImport (CodNFeDestImport);

ALTER TABLE dbo.NFeDup ADD CONSTRAINT FK_NFeDup_NFe FOREIGN KEY (CodNFe) REFERENCES dbo.NFe (CodNFe);

ALTER TABLE dbo.NFeItem ADD CONSTRAINT FK_NFeItem_NFe FOREIGN KEY (CodNFe) REFERENCES dbo.NFe (CodNFe);

ALTER TABLE dbo.NFeRastro ADD CONSTRAINT FK_NFeRastro_NFe FOREIGN KEY (CodNFe) REFERENCES dbo.NFe (CodNFe);

ALTER TABLE dbo.NotaFiscalAut ADD CONSTRAINT FK_NotaFiscalAut_NotaFiscal FOREIGN KEY (CodNotaFiscal) REFERENCES dbo.NotaFiscal (CodNotaFiscal);

ALTER TABLE dbo.NotaFiscalItens ADD CONSTRAINT FK_NotaFiscalItens_Material FOREIGN KEY (CodMaterial) REFERENCES dbo.Material (CodMaterial);

ALTER TABLE dbo.NotaFiscalItens ADD CONSTRAINT FK_NotaFiscalItens_NotaFiscal FOREIGN KEY (CodNotaFiscal) REFERENCES dbo.NotaFiscal (CodNotaFiscal);

ALTER TABLE dbo.NotaPagamento ADD CONSTRAINT FK_NotaPagamento_MapaPagamento FOREIGN KEY (CodMapaPagamento) REFERENCES dbo.MapaPagamento (CodMapaPagamento);

ALTER TABLE dbo.NotaPagamentoItens ADD CONSTRAINT FK_NotaPagamentoItens_NotaPagamento FOREIGN KEY (CodNotaPagamento) REFERENCES dbo.NotaPagamento (CodNotaPagamento);

ALTER TABLE dbo.NotaRecebimento ADD CONSTRAINT FK_NotaRecebimento_MapaRecebimento FOREIGN KEY (CodMapaRecebimento) REFERENCES dbo.MapaRecebimento (CodMapaRecebimento);

ALTER TABLE dbo.NotaRecebimento ADD CONSTRAINT FK_NotaRecebimento_NotaPagamento FOREIGN KEY (CodNotaPagamento) REFERENCES dbo.NotaPagamento (CodNotaPagamento);

ALTER TABLE dbo.NotaRecebimentoItens ADD CONSTRAINT FK_NotaRecebimentoItens_NotaRecebimento FOREIGN KEY (CodNotaRecebimento) REFERENCES dbo.NotaRecebimento (CodNotaRecebimento);

ALTER TABLE dbo.NotaRecebimentoItensAnalise ADD CONSTRAINT FK_NotaRecebimentoItensAnalise_AnaliseItem FOREIGN KEY (CodAnaliseItem) REFERENCES dbo.AnaliseItem (CodAnaliseItem);

ALTER TABLE dbo.NotaRecebimentoItensAnalise ADD CONSTRAINT FK_NotaRecebimentoItensAnalise_NotaRecebimentoItens FOREIGN KEY (CodNotaRecebimento, Sequencia) REFERENCES dbo.NotaRecebimentoItens (CodNotaRecebimento, Sequencia);

ALTER TABLE dbo.ObjetivoFinanceiroFabricante ADD CONSTRAINT FK_ObjetivoFinanceiroFabricante_Fabricante FOREIGN KEY (CodFabricante) REFERENCES dbo.Fabricante (CodFabricante);

ALTER TABLE dbo.ObjetivoFinanceiroFabricante ADD CONSTRAINT FK_ObjetivoFinanceiroFabricante_ObjetivoFinanceiro FOREIGN KEY (CodObjetivoFinanceiro) REFERENCES dbo.ObjetivoFinanceiro (CodObjetivoFinanceiro);

ALTER TABLE dbo.PagamentoPeriodicoItem ADD CONSTRAINT FK_PagamentoPeriodicoItem_ClienteFornecedor FOREIGN KEY (CodFornecedor) REFERENCES dbo.Cliente (CodFornecedor);

ALTER TABLE dbo.PagamentoPeriodicoItem ADD CONSTRAINT FK_PagamentoPeriodicoItem_Conta FOREIGN KEY (CodConta) REFERENCES dbo.Conta (CodConta);

ALTER TABLE dbo.PagamentoPeriodicoItem ADD CONSTRAINT FK_PagamentoPeriodicoItem_PagamentoPeriodico FOREIGN KEY (CodPagamentoPeriodico) REFERENCES dbo.PagamentoPeriodico (CodPagamentoPeriodico);

ALTER TABLE dbo.Patrimonio ADD CONSTRAINT FK_Patrimonio_Depreciacao FOREIGN KEY (CodDepreciacao) REFERENCES dbo.Depreciacao (CodDepreciacao);

ALTER TABLE dbo.Patrimonio ADD CONSTRAINT FK_Patrimonio_PatrimonioTipo FOREIGN KEY (CodPatrimonioTipo) REFERENCES dbo.PatrimonioTipo (CodPatrimonioTipo);

ALTER TABLE dbo.PatrimonioMeta ADD CONSTRAINT FK_PatrimonioMeta_PatrimonioTipo FOREIGN KEY (CodPatrimonioTipo) REFERENCES dbo.PatrimonioTipo (CodPatrimonioTipo);

ALTER TABLE dbo.PatrimonioMeta ADD CONSTRAINT FK_PatrimonioMeta_TabelaMeta FOREIGN KEY (CodTabelaMeta) REFERENCES dbo.TabelaMeta (CodTabelaMeta);

ALTER TABLE dbo.PDVCartaCredito ADD CONSTRAINT FK_PDVCartaCredito_PDVCupom FOREIGN KEY (CodCupom, ECFSerial) REFERENCES dbo.PDVCupom (CodCupom, ECFSerial);

ALTER TABLE dbo.PDVCupomItens ADD CONSTRAINT FK__PDVCupomItens__PDVCupom FOREIGN KEY (CodCupom, ECFSerial) REFERENCES dbo.PDVCupom (CodCupom, ECFSerial);

ALTER TABLE dbo.PDVCupomParcelas ADD CONSTRAINT FK__PDVCupomParcelas__PDVCupom FOREIGN KEY (CodCupom, ECFSerial) REFERENCES dbo.PDVCupom (CodCupom, ECFSerial);

ALTER TABLE dbo.PDVDevolucao ADD CONSTRAINT FK_PDVDevolucao_PDVCartaCredito FOREIGN KEY (CodPDVCartaCredito) REFERENCES dbo.PDVCartaCredito (CodPDVCartaCredito);

ALTER TABLE dbo.PDVDevolucao ADD CONSTRAINT FK_PDVDevolucao_PDVCupom FOREIGN KEY (CodCupom, ECFSerial) REFERENCES dbo.PDVCupom (CodCupom, ECFSerial);

ALTER TABLE dbo.PDVDevolucaoItens ADD CONSTRAINT FK_PDVDevolucaoItens_PDVDevolucao FOREIGN KEY (CodPDVDevolucao) REFERENCES dbo.PDVDevolucao (CodPDVDevolucao);

ALTER TABLE dbo.PDVReducaoZ ADD CONSTRAINT FK__PDVReducaoZ__PDVECF FOREIGN KEY (ECFSerial) REFERENCES dbo.PDVECF (ECFSerial);

ALTER TABLE dbo.PDVReducaoZItens ADD CONSTRAINT FK__PDVReducaoZItens__PDVECF FOREIGN KEY (ECFSerial) REFERENCES dbo.PDVECF (ECFSerial);

ALTER TABLE dbo.PDVReducaoZItens ADD CONSTRAINT FK__PDVReducaoZItens__PDVReducaoZ FOREIGN KEY (ECFSerial, CRZ) REFERENCES dbo.PDVReducaoZ (ECFSerial, CRZ);

ALTER TABLE dbo.PedidoVenda ADD CONSTRAINT FK_PedidoVenda_Cliente FOREIGN KEY (CodCliente) REFERENCES dbo.Cliente (CodCliente);

ALTER TABLE dbo.PedidoVenda ADD CONSTRAINT FK_PedidoVenda_Cobrador FOREIGN KEY (CodCobrador) REFERENCES dbo.Funcionario (CodFuncionario);

ALTER TABLE dbo.PedidoVenda ADD CONSTRAINT FK_PedidoVenda_Funcionario FOREIGN KEY (CodTransportador) REFERENCES dbo.Funcionario (CodFuncionario);

ALTER TABLE dbo.PedidoVenda ADD CONSTRAINT FK_PedidoVenda_NaturezaOperacao FOREIGN KEY (CodNaturezaOperacao) REFERENCES dbo.NaturezaOperacao (CodNaturezaOperacao);

ALTER TABLE dbo.PedidoVenda ADD CONSTRAINT FK_PedidoVenda_NaturezaOpFiscal FOREIGN KEY (CodNaturezaOpFiscal) REFERENCES dbo.NaturezaOpFiscal (CodNaturezaOpFiscal);

ALTER TABLE dbo.PedidoVenda ADD CONSTRAINT FK_PedidoVenda_PedidoVendaExpedicao FOREIGN KEY (CodPedidoVendaExpedicao) REFERENCES dbo.PedidoVendaExpedicao (CodPedidoVendaExpedicao);

ALTER TABLE dbo.PedidoVenda ADD CONSTRAINT FK_PedidoVenda_Veiculo FOREIGN KEY (CodVeiculo) REFERENCES dbo.Veiculo (CodVeiculo);

ALTER TABLE dbo.PedidoVenda ADD CONSTRAINT FK_PedidoVenda_Vendedor FOREIGN KEY (CodVendedor) REFERENCES dbo.Funcionario (CodFuncionario);

ALTER TABLE dbo.PedidoVendaItens ADD CONSTRAINT FK_PedidoVendaItens_Material FOREIGN KEY (CodMaterial) REFERENCES dbo.Material (CodMaterial);

ALTER TABLE dbo.PedidoVendaItens ADD CONSTRAINT FK_PedidoVendaItens_PedidoVenda FOREIGN KEY (CodPedidoVenda) REFERENCES dbo.PedidoVenda (CodPedidoVenda);

ALTER TABLE dbo.PedidoVendaParcelas ADD CONSTRAINT FK_PedidoVendaParcelas_PedidoVenda FOREIGN KEY (CodPedidoVenda) REFERENCES dbo.PedidoVenda (CodPedidoVenda);

ALTER TABLE dbo.PlanoContaComplemento ADD CONSTRAINT FK_PlanoContaComplemento_PlanoConta FOREIGN KEY (CodConta) REFERENCES dbo.PlanoConta (CodConta);

ALTER TABLE dbo.Pocket ADD CONSTRAINT FK_StoneMaquina_Pocket FOREIGN KEY (UUIDStoneMaquina) REFERENCES dbo.StoneMaquina (UUIDStoneMaquina);

ALTER TABLE dbo.PocketDiaSemana ADD CONSTRAINT FK_PocketDiaSemana_DiaSemana FOREIGN KEY (CodDiaSemana) REFERENCES dbo.DiaSemana (CodDiaSemana);

ALTER TABLE dbo.PocketDiaSemana ADD CONSTRAINT FK_PocketDiaSemana_Pocket FOREIGN KEY (CodPocket) REFERENCES dbo.Pocket (CodPocket);

ALTER TABLE dbo.PocketDocProcessDoc ADD CONSTRAINT FK_PocketDocProcessDoc_PocketDocProcess FOREIGN KEY (CodPocketDocProcess) REFERENCES dbo.PocketDocProcess (CodPocketDocProcess);

ALTER TABLE dbo.PocketDocPropostaItem ADD CONSTRAINT FK_PocketDocPropostaItem_PocketDocumento FOREIGN KEY (CodPocket, CodDoc) REFERENCES dbo.PocketDocumento (CodPocket, CodDoc);

ALTER TABLE dbo.PocketMensagem ADD CONSTRAINT FK_PocketMensagem_Mensagem FOREIGN KEY (CodMensagem) REFERENCES dbo.Mensagem (CodMensagem);

ALTER TABLE dbo.PocketMensagem ADD CONSTRAINT FK_PocketMensagem_Pocket FOREIGN KEY (CodPocket) REFERENCES dbo.Pocket (CodPocket);

ALTER TABLE dbo.PocketPedidoVendaItens ADD CONSTRAINT FK_PocketPedidoVendaItens_PocketPedidoVenda FOREIGN KEY (CodPedidoVenda) REFERENCES dbo.PocketPedidoVenda (CodPedidoVenda);

ALTER TABLE dbo.PontoHorarioDia ADD CONSTRAINT FK_PontoHorario_PontoHorarioDia FOREIGN KEY (CodPontoHorario) REFERENCES dbo.PontoHorario (CodPontoHorario);

ALTER TABLE dbo.ReciboTipoItem ADD CONSTRAINT FK_ReciboTipoItem_ReciboTipo FOREIGN KEY (CodReciboTipo) REFERENCES dbo.ReciboTipo (CodReciboTipo);

ALTER TABLE dbo.RestauranteCaixa ADD CONSTRAINT FK_RestauranteCaixa_FormaReceb FOREIGN KEY (CodFormaReceb) REFERENCES dbo.FormaReceb (CodFormaReceb);

ALTER TABLE dbo.RestauranteCaixa ADD CONSTRAINT FK_RestauranteCaixa_Funcionario FOREIGN KEY (CodFuncionario) REFERENCES dbo.Funcionario (CodFuncionario);

ALTER TABLE dbo.RestauranteCaixa ADD CONSTRAINT FK_RestauranteCaixa_RestaurantePedidoVenda FOREIGN KEY (CodRestaurantePedidoVenda) REFERENCES dbo.RestaurantePedidoVenda (CodRestaurantePedidoVenda);

ALTER TABLE dbo.RestauranteOpcionalItens ADD CONSTRAINT FK_RestauranteOpcionalItens_RestauranteOpcional FOREIGN KEY (CodRestauranteOpcional) REFERENCES dbo.RestauranteOpcional (CodRestauranteOpcional);

ALTER TABLE dbo.RestauranteOpcionalMaterial ADD CONSTRAINT FK_RestauranteOpcionalMaterial_Material FOREIGN KEY (CodMaterial) REFERENCES dbo.Material (CodMaterial);

ALTER TABLE dbo.RestauranteOpcionalMaterial ADD CONSTRAINT FK_RestauranteOpcionalMaterial_RestauranteOpcional FOREIGN KEY (CodRestauranteOpcional) REFERENCES dbo.RestauranteOpcional (CodRestauranteOpcional);

ALTER TABLE dbo.RestaurantePedidoVenda ADD CONSTRAINT FK_RestaurantePedidoVenda_Cliente FOREIGN KEY (CodCliente) REFERENCES dbo.Cliente (CodCliente);

ALTER TABLE dbo.RestaurantePedidoVenda ADD CONSTRAINT FK_RestaurantePedidoVenda_FormaReceb FOREIGN KEY (CodFormaReceb) REFERENCES dbo.FormaReceb (CodFormaReceb);

ALTER TABLE dbo.RestaurantePedidoVenda ADD CONSTRAINT FK_RestaurantePedidoVenda_Funcionario FOREIGN KEY (CodFuncionario) REFERENCES dbo.Funcionario (CodFuncionario);

ALTER TABLE dbo.RestaurantePedidoVenda ADD CONSTRAINT FK_RestaurantePedidoVenda_TabelaPreco FOREIGN KEY (CodTabelaPreco) REFERENCES dbo.TabelaPreco (CodTabelaPreco);

ALTER TABLE dbo.RestaurantePedidoVendaItens ADD CONSTRAINT FK_RestaurantePedidoVendaItens_Funcionario FOREIGN KEY (CodFuncionario) REFERENCES dbo.Funcionario (CodFuncionario);

ALTER TABLE dbo.RestaurantePedidoVendaItens ADD CONSTRAINT FK_RestaurantePedidoVendaItens_Material FOREIGN KEY (CodMaterial) REFERENCES dbo.Material (CodMaterial);

ALTER TABLE dbo.RestaurantePedidoVendaItens ADD CONSTRAINT FK_RestaurantePedidoVendaItens_RestaurantePedidoVenda FOREIGN KEY (CodRestaurantePedidoVenda) REFERENCES dbo.RestaurantePedidoVenda (CodRestaurantePedidoVenda);

ALTER TABLE dbo.RestaurantePedidoVendaItensOpcionalItens ADD CONSTRAINT FK_RestaurantePedidoVendaItensOpcionalItens_RestauranteOpcionalItens FOREIGN KEY (CodRestauranteOpcionalItens) REFERENCES dbo.RestauranteOpcionalItens (CodRestauranteOpcionalItens);

ALTER TABLE dbo.RestaurantePedidoVendaItensOpcionalItens ADD CONSTRAINT FK_RestaurantePedidoVendaItensOpcionalItens_RestaurantePedidoVendaItens FOREIGN KEY (CodRestaurantePedidoVendaItens) REFERENCES dbo.RestaurantePedidoVendaItens (CodRestaurantePedidoVendaItens);

ALTER TABLE dbo.Rota ADD CONSTRAINT FK_Rota_AreaVenda FOREIGN KEY (CodAreaVenda) REFERENCES dbo.AreaVenda (CodAreaVenda);

ALTER TABLE dbo.RotaDespesa ADD CONSTRAINT FK_RotaDespesa_Conta FOREIGN KEY (CodConta) REFERENCES dbo.Conta (CodConta);

ALTER TABLE dbo.RotaDespesa ADD CONSTRAINT FK_RotaDespesa_Rota FOREIGN KEY (CodRota) REFERENCES dbo.Rota (CodRota);

ALTER TABLE dbo.RotaMetaPositivacao ADD CONSTRAINT FK_RotaMetaPositivacao_Rota FOREIGN KEY (CodRota) REFERENCES dbo.Rota (CodRota);

ALTER TABLE dbo.RotaObjetivoFabricante ADD CONSTRAINT FK_RotaObjetivoFabricante_Fabricante FOREIGN KEY (CodFabricante) REFERENCES dbo.Fabricante (CodFabricante);

ALTER TABLE dbo.RotaObjetivoFabricante ADD CONSTRAINT FK_RotaObjetivoFabricante_RotaObjetivo FOREIGN KEY (CodRotaObjetivo) REFERENCES dbo.RotaObjetivo (CodRotaObjetivo);

ALTER TABLE dbo.RoteiroC ADD CONSTRAINT FK_RoteiroC_Evento FOREIGN KEY (CodEvento) REFERENCES dbo.Evento (CodEvento);

ALTER TABLE dbo.RoteiroC ADD CONSTRAINT FK_RoteiroC_PlanoConta FOREIGN KEY (CodConta) REFERENCES dbo.PlanoConta (CodConta);

ALTER TABLE dbo.RoteiroD ADD CONSTRAINT FK_RoteiroD_Evento FOREIGN KEY (CodEvento) REFERENCES dbo.Evento (CodEvento);

ALTER TABLE dbo.RoteiroD ADD CONSTRAINT FK_RoteiroD_PlanoConta FOREIGN KEY (CodConta) REFERENCES dbo.PlanoConta (CodConta);

ALTER TABLE dbo.Sequencia ADD CONSTRAINT FK_Sequencia_SequenciaTipo FOREIGN KEY (CodSequenciaTipo) REFERENCES dbo.SequenciaTipo (CodSequenciaTipo);

ALTER TABLE dbo.StoneMaquina ADD CONSTRAINT FK_StoneMaquina_StoneEstabelecimento FOREIGN KEY (UUIDStoneEstabelecimento) REFERENCES dbo.StoneEstabelecimento (UUIDStoneEstabelecimento);

ALTER TABLE dbo.StoneTransacao ADD CONSTRAINT FK_StoneTransacao_StoneMaquina FOREIGN KEY (UUIDStoneMaquina) REFERENCES dbo.StoneMaquina (UUIDStoneMaquina);

ALTER TABLE dbo.StoneTransacaoV2 ADD CONSTRAINT FK_StoneTransacaoV2_StoneMaquina FOREIGN KEY (UUIDStoneMaquina) REFERENCES dbo.StoneMaquina (UUIDStoneMaquina);

ALTER TABLE dbo.SugestaoPrecoMaterial ADD CONSTRAINT FK_Material_SugestaoPrecoMaterial FOREIGN KEY (CodMaterial) REFERENCES dbo.Material (CodMaterial);

ALTER TABLE dbo.SugestaoPrecoMaterial ADD CONSTRAINT FK_SugestaoPreco_SugestaoPrecoMaterial FOREIGN KEY (CodSugestaoPreco) REFERENCES dbo.SugestaoPreco (CodSugestaoPreco);

ALTER TABLE dbo.SyncDataBaseCampo ADD CONSTRAINT FK_SyncDataBaseCampo_SyncDataBaseItens FOREIGN KEY (CodSyncDataBase, CodSyncDataBaseItens) REFERENCES dbo.SyncDataBaseItens (CodSyncDataBase, CodSyncDataBaseItens);

ALTER TABLE dbo.SyncDataBaseData ADD CONSTRAINT FK_SyncDataBaseData_SyncDataBaseItens FOREIGN KEY (CodSyncDataBase, CodSyncDataBaseItens) REFERENCES dbo.SyncDataBaseItens (CodSyncDataBase, CodSyncDataBaseItens);

ALTER TABLE dbo.SyncDataBaseItens ADD CONSTRAINT FK_SyncDataBaseItens_SyncDataBase FOREIGN KEY (CodSyncDataBase) REFERENCES dbo.SyncDataBase (CodSyncDataBase);

ALTER TABLE dbo.TabelaPrecoFormaReceb ADD CONSTRAINT fk_TabelaPrecoFormReceb_FormaReceb FOREIGN KEY (CodFormaReceb) REFERENCES dbo.FormaReceb (CodFormaReceb);

ALTER TABLE dbo.TabelaPrecoFormaReceb ADD CONSTRAINT fk_TabelaPrecoFormReceb_TabelaPreco FOREIGN KEY (CodTabelaPreco) REFERENCES dbo.TabelaPreco (CodTabelaPreco);

ALTER TABLE dbo.TabelaPrecoUnidadeGestora ADD CONSTRAINT FK_TabelaPrecoUnidadeGestora_TabelaPreco FOREIGN KEY (CodTabelaPreco) REFERENCES dbo.TabelaPreco (CodTabelaPreco);

ALTER TABLE dbo.TabelaPrecoUnidadeGestora ADD CONSTRAINT FK_TabelaPrecoUnidadeGestora_UnidadeGestora FOREIGN KEY (UnidGestora) REFERENCES dbo.UnidadeGestora (UnidGestora);

ALTER TABLE dbo.TabelaPrecoVenda ADD CONSTRAINT FK_TabelaPrecoVenda_TabelaPreco FOREIGN KEY (CodTabelaPreco1) REFERENCES dbo.TabelaPreco (CodTabelaPreco);

ALTER TABLE dbo.TabelaPrecoVenda ADD CONSTRAINT FK_TabelaPrecoVenda_TabelaPreco1 FOREIGN KEY (CodTabelaPreco2) REFERENCES dbo.TabelaPreco (CodTabelaPreco);

ALTER TABLE dbo.TipoDocumento ADD CONSTRAINT FK_TipoDocumento_DocumentoIntegracaoTipo FOREIGN KEY (CodDocumentoIntegracaoTipo) REFERENCES dbo.DocumentoIntegracaoTIpo (CodDocumentoIntegracaoTipo);

ALTER TABLE dbo.UserGrupoUsuario ADD CONSTRAINT FK_UserGrupoUsuario_UserModulo FOREIGN KEY (CodModulo) REFERENCES dbo.UserModulo (CodModulo);

ALTER TABLE dbo.UserGrupoUsuarioOp ADD CONSTRAINT FK_UserGrupoUsuarioOp_UserGrupoUsuario FOREIGN KEY (CodModulo, GrupoUsuario) REFERENCES dbo.UserGrupoUsuario (CodModulo, GrupoUsuario);

ALTER TABLE dbo.UserGrupoUsuarioOp ADD CONSTRAINT FK_UserGrupoUsuarioOp_UserModuloMenu FOREIGN KEY (CodModulo, MenuItem) REFERENCES dbo.UserModuloMenu (CodModulo, MenuItem);

ALTER TABLE dbo.UserGrupoUsuarioOpAdicional ADD CONSTRAINT FK_UserGrupoUsuarioOpAdicional_UserGrupoUsuario FOREIGN KEY (CodModulo, GrupoUsuario) REFERENCES dbo.UserGrupoUsuario (CodModulo, GrupoUsuario);

ALTER TABLE dbo.UserGrupoUsuarioOpAdicional ADD CONSTRAINT FK_UserGrupoUsuarioOpAdicional_UserModuloMenu FOREIGN KEY (CodModulo, MenuItem) REFERENCES dbo.UserModuloMenu (CodModulo, MenuItem);

ALTER TABLE dbo.UserGrupoUsuarioOpWeb ADD CONSTRAINT FK_UserGrupoUsuarioOpWeb_UserGrupoUsuario FOREIGN KEY (CodModulo, GrupoUsuario) REFERENCES dbo.UserGrupoUsuario (CodModulo, GrupoUsuario);

ALTER TABLE dbo.UserGrupoUsuarioOpWeb ADD CONSTRAINT FK_UserGrupoUsuarioOpWeb_UserModuloMenuWeb FOREIGN KEY (CodModulo, MenuItem) REFERENCES dbo.UserModuloMenuWeb (CodModulo, MenuItem);

ALTER TABLE dbo.UserModuloMenu ADD CONSTRAINT FK_UserModuloMenu_UserModulo FOREIGN KEY (CodModulo) REFERENCES dbo.UserModulo (CodModulo);

ALTER TABLE dbo.UserModuloMenuAdicional ADD CONSTRAINT FK_UserModuloMenuAdicional_UserModuloMenu FOREIGN KEY (CodModulo, MenuItem) REFERENCES dbo.UserModuloMenu (CodModulo, MenuItem);

ALTER TABLE dbo.UserModuloMenuWeb ADD CONSTRAINT FK_UserModuloMenuWeb_UserModulo FOREIGN KEY (CodModulo) REFERENCES dbo.UserModulo (CodModulo);

ALTER TABLE dbo.UserUsuarioModulo ADD CONSTRAINT FK_UserUsuarioModulo_UserModulo FOREIGN KEY (CodModulo) REFERENCES dbo.UserModulo (CodModulo);

ALTER TABLE dbo.UserUsuarioModulo ADD CONSTRAINT FK_UserUsuarioModulo_UserUsuario FOREIGN KEY (ID) REFERENCES dbo.UserUsuario (ID);

ALTER TABLE dbo.UserUsuarioOp ADD CONSTRAINT FK_UserUsuarioOp_UserGrupoUsuario FOREIGN KEY (CodModulo, GrupoUsuario) REFERENCES dbo.UserGrupoUsuario (CodModulo, GrupoUsuario);

ALTER TABLE dbo.UserUsuarioOp ADD CONSTRAINT FK_UserUsuarioOp_UserUsuario FOREIGN KEY (ID) REFERENCES dbo.UserUsuario (ID);

ALTER TABLE dbo.UserUsuarioOp ADD CONSTRAINT FK_UserUsuarioOp_UserUsuarioModulo FOREIGN KEY (ID, CodModulo) REFERENCES dbo.UserUsuarioModulo (ID, CodModulo);

ALTER TABLE dbo.UserUsuarioUnidade ADD CONSTRAINT FK_UserUsuarioUnidade_UnidadeGestora FOREIGN KEY (UnidGestora) REFERENCES dbo.UnidadeGestora (UnidGestora);

ALTER TABLE dbo.UserUsuarioUnidade ADD CONSTRAINT FK_UserUsuarioUnidade_UserUsuario FOREIGN KEY (ID) REFERENCES dbo.UserUsuario (ID);

ALTER TABLE dbo.UsuarioWeb ADD CONSTRAINT FK_UsuarioWeb_UsuarioWebMembership FOREIGN KEY (UserName) REFERENCES dbo.UsuarioWebMembership (UserName);

ALTER TABLE dbo.Veiculo ADD CONSTRAINT FK_VeiculoCorretora_Veiculo FOREIGN KEY (CodCorretora) REFERENCES dbo.Corretora (CodCorretora);

ALTER TABLE dbo.Veiculo ADD CONSTRAINT FK_VeiculoMarca_Veiculo FOREIGN KEY (CodVeiculoMarca) REFERENCES dbo.VeiculoMarca (CodVeiculoMarca);

ALTER TABLE dbo.Veiculo ADD CONSTRAINT FK_VeiculoSeguradora_Veiculo FOREIGN KEY (CodSeguradora) REFERENCES dbo.Classificador (CodClassificador);

ALTER TABLE dbo.Veiculo ADD CONSTRAINT FK_VeiculoSetor_Veiculo FOREIGN KEY (CodSetor) REFERENCES dbo.Setor (CodSetor);

ALTER TABLE dbo.Veiculo ADD CONSTRAINT FK_VeiculoTipo_Veiculo FOREIGN KEY (CodTipoVeiculo) REFERENCES dbo.Classificador (CodClassificador);

ALTER TABLE dbo.VeiculoCombustivel ADD CONSTRAINT FK_VeiculoCombustivel_Material FOREIGN KEY (CodMaterial) REFERENCES dbo.Material (CodMaterial);

ALTER TABLE dbo.VeiculoMovimentacao ADD CONSTRAINT FK_VeiculoMovimentacao_Patrimonio FOREIGN KEY (CodPatrimonio) REFERENCES dbo.Patrimonio (CodPatrimonio);

ALTER TABLE dbo.VeiculoMovimentacao ADD CONSTRAINT FK_VeiculoMovimentacao_PostoAbastecimento FOREIGN KEY (CodPosto) REFERENCES dbo.Cliente (CodFornecedor);

ALTER TABLE dbo.VeiculoMovimentacao ADD CONSTRAINT FK_VeiculoMovimentacao_Veiculo FOREIGN KEY (CodVeiculo) REFERENCES dbo.Veiculo (CodVeiculo);

ALTER TABLE dbo.VeiculoMovServico ADD CONSTRAINT FK_VeiculoMovServico_Veiculo FOREIGN KEY (CodVeiculo) REFERENCES dbo.Veiculo (CodVeiculo);

ALTER TABLE dbo.VeiculoMovServico ADD CONSTRAINT FK_VeiculoMovServico_VeiculoServico FOREIGN KEY (CodVeiculoServico) REFERENCES dbo.VeiculoServico (CodVeiculoServico);

ALTER TABLE dbo.VeiculoMulta ADD CONSTRAINT FK_VeiculoMulta_CodMotoristao FOREIGN KEY (CodMotorista) REFERENCES dbo.Funcionario (CodFuncionario);

ALTER TABLE dbo.VeiculoMulta ADD CONSTRAINT FK_VeiculoMulta_CodMultaTipo FOREIGN KEY (CodMultaTipo) REFERENCES dbo.MultaTipo (CodMultaTipo);

ALTER TABLE dbo.VeiculoMulta ADD CONSTRAINT FK_VeiculoMulta_CodVeiculo FOREIGN KEY (CodVeiculo) REFERENCES dbo.Veiculo (CodVeiculo);

ALTER TABLE dbo.VeiculoProgExpedicao ADD CONSTRAINT FK_VeiculoProgExpedicao_Auxiliar1 FOREIGN KEY (CodAuxiliar1) REFERENCES dbo.Funcionario (CodFuncionario);

ALTER TABLE dbo.VeiculoProgExpedicao ADD CONSTRAINT FK_VeiculoProgExpedicao_Auxiliar2 FOREIGN KEY (CodAuxiliar2) REFERENCES dbo.Funcionario (CodFuncionario);

ALTER TABLE dbo.VeiculoProgExpedicao ADD CONSTRAINT FK_VeiculoProgExpedicao_Auxiliar3 FOREIGN KEY (CodAuxiliar3) REFERENCES dbo.Funcionario (CodFuncionario);

ALTER TABLE dbo.VeiculoProgExpedicao ADD CONSTRAINT FK_VeiculoProgExpedicao_Funcionario FOREIGN KEY (CodAuxiliar4) REFERENCES dbo.Funcionario (CodFuncionario);

ALTER TABLE dbo.VeiculoProgExpedicao ADD CONSTRAINT FK_VeiculoProgExpedicao_Motorista FOREIGN KEY (CodMotorista) REFERENCES dbo.Funcionario (CodFuncionario);

ALTER TABLE dbo.VeiculoProgExpedicao ADD CONSTRAINT FK_VeiculoProgExpedicao_Veiculo FOREIGN KEY (CodVeiculo) REFERENCES dbo.Veiculo (CodVeiculo);

ALTER TABLE dbo.VeiculoProgServico ADD CONSTRAINT FK_VeiculoProgServico_Patrimonio FOREIGN KEY (CodPatrimonio) REFERENCES dbo.Patrimonio (CodPatrimonio);

ALTER TABLE dbo.VeiculoProgServico ADD CONSTRAINT FK_VeiculoProgServico_Veiculo FOREIGN KEY (CodVeiculo) REFERENCES dbo.Veiculo (CodVeiculo);

ALTER TABLE dbo.VeiculoProgServico ADD CONSTRAINT FK_VeiculoProgServico_VeiculoServico FOREIGN KEY (CodVeiculoServico) REFERENCES dbo.VeiculoServico (CodVeiculoServico);

ALTER TABLE dbo.VeiculoServico ADD CONSTRAINT FK_VeiculoServico_VeiculoServicoGrupo FOREIGN KEY (CodVeiculoServicoGrupo) REFERENCES dbo.VeiculoServicoGrupo (CodVeiculoServicoGrupo);

ALTER TABLE dbo.Voucher ADD CONSTRAINT FK_Voucher_ClienteUtilizacao FOREIGN KEY (CodClienteUtilizacao) REFERENCES dbo.Cliente (CodCliente);

ALTER TABLE dbo.Voucher ADD CONSTRAINT FK_Voucher_ClienteVenda FOREIGN KEY (CodClienteVenda) REFERENCES dbo.Cliente (CodCliente);

ALTER TABLE dbo.Voucher ADD CONSTRAINT FK_Voucher_Material FOREIGN KEY (CodMaterialVoucher) REFERENCES dbo.Material (CodMaterial);

ALTER TABLE dbo.WidgetConfig ADD CONSTRAINT FK_WidgetConfig_Widget FOREIGN KEY (CodWidget) REFERENCES dbo.Widget (CodWidget);
