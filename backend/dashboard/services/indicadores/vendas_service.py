from django.db import connections
from datetime import datetime, timedelta, date

def buscar_vendido(data_inicio, data_fim):
    data_inicio = datetime.strptime(data_inicio, "%Y-%m-%d").date()
    data_fim = datetime.strptime(data_fim, "%Y-%m-%d").date() + timedelta(days=1)
    data_inicio = validar_data(data_inicio)
    data_fim = validar_data(data_fim) + timedelta(days=1)

    with connections['dados_industria'].cursor() as cursor:
        cursor.execute(f"""
            DECLARE @P1 datetime2 = '{data_inicio}';
            DECLARE @P2 datetime2 = '{data_fim}';

            
                select Count(distinct QtdClientes) QtdClientes, CodCampo, Campo, sum(Qtd) Qtd, Cast(sum(QtdEmbalagem) as integer) QtdEmbalagem, sum(Volume) Volume,  sum(Peso) Peso, sum(ValorProdutos) ValorProdutos,Sum(QtdBonificacao) QtdBonificacao,
                Cast(Sum(QtdEmbalagemBonificacao) as integer) QtdEmbalagemBonificacao,Sum(Bonificacao) Bonificacao, Sum(QtdAvaria) QtdAvaria, Cast(Sum(QtdEmbalagemAvaria) as integer) QtdEmbalagemAvaria, Sum(Avaria) Avaria, 
                Sum(QtdOutros) QtdOutros, Cast(Sum(QtdEmbalagemOutros) as integer) QtdEmbalagemOutros, Sum(Outros) Outros,
                Sum(Desconto) Desconto, Sum(DescontoRef) DescontoRef,
                Sum(AcrescimoRef) AcrescimoRef, Sum(Custo) Custo, Sum(QuantidadePedido) QuantidadePedido, Sum(AReceber2) AReceber2, Sum(Recebido2) Recebido2 from (
                select Cliente.CodCliente as QtdClientes,
                Cast(Rota.CodRota as VarChar) as CodCampo,
                Rota.Rota as Campo,
                -- Venda
                sum(
                case NaturezaOperacao.Venda 
                    when 1 then PedidoVendaItens.quantidade * PedidoVendaItens.qtdembalagem
                    else 0
                end) As Qtd,
                sum(
                case NaturezaOperacao.Venda 
                    when 1 then (PedidoVendaItens.Quantidade * PedidoVendaItens.QtdEmbalagem * Material.VolumeBruto)
                    else 0
                end) As Volume,
                sum(
                case NaturezaOperacao.Venda 
                    when 1 then (PedidoVendaItens.Quantidade * PedidoVendaItens.QtdEmbalagem * Material.PesoBruto)
                    else 0
                end) As Peso,
                sum(
                case NaturezaOperacao.Venda 
                    when 1 then dbo.Round2(pedidovendaitens.quantidade * pedidovendaitens.qtdembalagem / Material.QtdVolume) 
                    else 0
                end) As QtdEmbalagem,
                case NaturezaOperacao.Venda 
                    when 1 then sum(dbo.Round2(PedidoVendaItens.quantidade * (PedidoVendaItens.ValorEmbalagem)))
                    else 0
                end As ValorProdutos,
                -- Bonificacao
                sum(
                case NaturezaOperacao.Bonificacao 
                    when 1 then PedidoVendaItens.quantidade * PedidoVendaItens.qtdembalagem
                    else 0
                end) As QtdBonificacao,
                sum(
                case NaturezaOperacao.Bonificacao 
                    when 1 then dbo.Round2(pedidovendaitens.quantidade * pedidovendaitens.qtdembalagem / Material.QtdVolume) 
                    else 0
                end) As QtdEmbalagemBonificacao,
                case NaturezaOperacao.Bonificacao
                    when 1 then sum(dbo.Round2(PedidoVendaItens.quantidade * (PedidoVendaItens.ValorEmbalagem)))
                    else 0
                end As Bonificacao,
                -- Avaria
                sum(
                case NaturezaOperacao.Avaria 
                    when 1 then dbo.Round2(PedidoVendaItens.quantidade * PedidoVendaItens.qtdembalagem)
                    else 0
                end) As QtdAvaria,
                sum(
                case NaturezaOperacao.Avaria 
                    when 1 then dbo.Round2(pedidovendaitens.quantidade * pedidovendaitens.qtdembalagem / Material.QtdVolume) 
                    else 0
                end ) As QtdEmbalagemAvaria,
                case NaturezaOperacao.Avaria
                    when 1 then sum(dbo.Round2(PedidoVendaItens.quantidade * (PedidoVendaItens.ValorEmbalagem)))
                    else 0
                end As Avaria,
                -- Outros
                0.0 As QtdOutros,
                0 As QtdEmbalagemOutros,
                0.0 As Outros,
                sum(
                case NaturezaOperacao.Venda 
                    when 1 then dbo.Round2(PedidoVendaItens.DescontoRef + (PedidoVendaItens.Desconto * PedidoVendaItens.quantidade))
                    else 0
                end) As Desconto,
                sum(dbo.Round2(PedidoVendaItens.DescontoRef)) as DescontoRef,
                sum(dbo.Round2(PedidoVendaItens.AcrescimoRef)) as AcrescimoRef,
                sum(dbo.Round2(PedidoVendaItens.quantidade * PedidoVendaItens.QtdEmbalagem * Material.UltimoCusto)) as Custo,
                Count(Distinct PedidoVenda.CodPedidoVenda) as QuantidadePedido,
                (
                select ISNULL(SUM(Coalesce(ValorAReceberConta, Campo)), 0) Campo from (
                    Select
                    (
                        Select
                        Sum(Round(100 * (CR.Saldo) ,0))/100 ValorAReceberConta
                        From
                        ContasReceber CR
                        Where
                        CR.Baixa = 0
                        AND CR.Recebido = 2
                        AND CR.CodPedido = PV.CodPedidoVenda
                    ) ValorAReceberConta,
                    IsNull(Sum(Round(100 * (PedidoVendaItens.Quantidade * (PedidoVendaItens.ValorEmbalagem - PedidoVendaItens.Desconto)),0))/100, 0) Campo
                    From
                    PedidoVenda PV left join ClienteRotaVendedor CRV on (PV.CodVendedor = CRV.CodVendedor and PV.CodCliente = CRV.CodCliente)
                    left join  PedidoVendaItens on (PV.CodPedidoVenda = PedidoVendaItens.CodPedidoVenda)
                    left join FormaReceb FR on PV.CodFormaReceb = FR.CodFormaReceb
                    left join Moeda M on FR.CodMoeda = M.CodMoeda
                    left join Material Mat on PedidoVendaItens.CodMaterial = Mat.CodMaterial
                    left join Grupo G on Mat.CodGrupo = G.CodGrupo
                    left join Cliente CL on PV.CodCliente = CL.CodCliente
                    left join Fabricante F on Mat.CodFabricante = F.CodFabricante
                    left join Rota R on IsNull(CRV.CodRota, CL.CodRota) = R.CodRota
                    left join AreaVenda AV on R.CodAreaVenda = AV.CodAreaVenda
                    left join AreaSupervisao AreaSup on AV.CodAreaSupervisao = AreaSup.CodAreaSupervisao
                    left join Cidade C on CL.CodCidade = C.CodCidade
                    left join GrupoClasse GC on GC.CodGrupoClasse = G.CodGrupoClasse
                    left join Estado E on CL.CodEstado = E.CodEstado
                    left join Regiao RG on CL.CodRegiao = RG.CodRegiao
                    left join Segmento S on CL.CodSegmento = S.CodSegmento
                    left join Zona Z on CL.CodZona = Z.CodZona
                    left join TabelaPreco TP on CL.CodTabelaPreco = TP.CodTabelaPreco
                    left join Funcionario Func on PV.CodVendedor = Func.CodFuncionario
                    left join Rede RD on CL.CodRede = RD.CodRede
                    left join Sabor SA on Mat.CodSabor = SA.CodSabor
                    left join NaturezaOperacao Nat on PV.CodNaturezaOperacao = Nat.CodNaturezaOperacao
                    left join MicroRegiao MR on CL.CodMicroRegiao = MR.CodMicroRegiao
                    where ((PV.SituacaoPagamento = 'N' )
                            or PV.CodPedidoVenda In
                                (
                                Select CodPedido
                                From ContasReceber
                                Where ContasReceber.CodPedido = PV.CodPedidoVenda
                                    and (
                                        (M.CodMoedaTipo = 2 or M.CodMoedaTipo = 4 or M.CodMoedaTipo = 5)
                                            and (Baixa = 0)
                                            and ((Recebido = 0) or (Recebido = 2) or (Devolvido = 1) Or (Antecipado = 1 and DataCustodia >= GetDate()) )
                                        )
                                ))
                        and Mat.EmbRetornavel = 0
                        and PV.Status = 0
                        and (Nat.Venda = 1)
                        and PV.UnidGestora in (select UnidGestora from UnidadeGestora )
                        and PV.DataVenda >= @P1
                        and PV.DataVenda < @P2
                        and R.CodRota = Rota.CodRota
                        and PV.UnidGestora = PedidoVenda.UnidGestora
                        and Nat.Venda = NaturezaOperacao.Venda
                        and CL.CodCLiente = Cliente.CodCliente
                Group by PV.UnidGestora, Nat.Venda, CL.CodCliente, PV.CodPedidoVenda
                ) ConsultaAReceber
                ) AReceber2,
                (
                Select
                    sum(dbo.Round2((case Nat.Venda
                    when 1 then dbo.Round2(PedidoVendaItens.quantidade * (PedidoVendaItens.valorembalagem - PedidoVendaItens.Desconto))
                    else 0
                    end)*Coalesce((ContasReceber.ValorRecebido + ContasReceber.Desconto - ContasReceber.Acrescimo)/PV.Valor,1))) As Recebido
                From
                    PedidoVenda PV left join ClienteRotaVendedor CRV on (PV.CodVendedor = CRV.CodVendedor and PV.CodCliente = CRV.CodCliente)
                    left join  PedidoVendaItens on (PV.CodPedidoVenda = PedidoVendaItens.CodPedidoVenda)
                    left join FormaReceb FR on PV.CodFormaReceb = FR.CodFormaReceb
                    left join Moeda M on FR.CodMoeda = M.CodMoeda
                    left join Material Mat on PedidoVendaItens.CodMaterial = Mat.CodMaterial
                    left join Grupo G on Mat.CodGrupo = G.CodGrupo
                    left join Cliente CL on PV.CodCliente = CL.CodCliente
                    left join Fabricante F on Mat.CodFabricante = F.CodFabricante
                    left join Rota R on IsNull(CRV.CodRota, CL.CodRota) = R.CodRota
                    left join AreaVenda AV on R.CodAreaVenda = AV.CodAreaVenda
                    left join AreaSupervisao AreaSup on AV.CodAreaSupervisao = AreaSup.CodAreaSupervisao
                    left join Cidade C on CL.CodCidade = C.CodCidade
                    left join GrupoClasse GC on GC.CodGrupoClasse = G.CodGrupoClasse
                    left join Estado E on CL.CodEstado = E.CodEstado
                    left join Regiao RG on CL.CodRegiao = RG.CodRegiao
                    left join Segmento S on CL.CodSegmento = S.CodSegmento
                    left join Zona Z on CL.CodZona = Z.CodZona
                    left join TabelaPreco TP on CL.CodTabelaPreco = TP.CodTabelaPreco
                    left join Funcionario Func on PV.CodVendedor = Func.CodFuncionario
                    left join Rede RD on CL.CodRede = RD.CodRede
                    left join Sabor SA on Mat.CodSabor = SA.CodSabor
                    left join NaturezaOperacao Nat on PV.CodNaturezaOperacao = Nat.CodNaturezaOperacao
                    left join MicroRegiao MR on CL.CodMicroRegiao = MR.CodMicroRegiao
                    left join ContasReceber on (PV.CodPedidoVenda = ContasReceber.CodPedido)
                Where
                ( ((ContasReceber.CodContaReceber is null) and (PV.SituacaoPagamento = 'S')) or 
                (ContasReceber.Baixa = 0 and ContasReceber.Devolvido = 0 and ContasReceber.Recebido in (1,2)) ) 
                    and Mat.EmbRetornavel = 0
                    and PV.Status = 0
                    and (Nat.Venda = 1)
                    and PV.UnidGestora in (select UnidGestora from UnidadeGestora )
                    and PV.DataVenda >= @P1
                    and PV.DataVenda < @P2
                    and R.CodRota = Rota.CodRota
                    and PV.UnidGestora = PedidoVenda.UnidGestora
                    and Nat.Venda = NaturezaOperacao.Venda
                    and CL.CodCLiente = Cliente.CodCliente
                ) Recebido2
                From PedidoVenda left join ClienteRotaVendedor CRV on (PedidoVenda.CodVendedor = CRV.CodVendedor and PedidoVenda.CodCliente = CRV.CodCliente) 
                left join PedidoVendaItens on PedidoVenda.CodPedidoVenda = PedidoVendaItens.CodPedidoVenda 
                left join Material on PedidoVendaItens.CodMaterial = Material.CodMaterial
                left join Grupo on Material.CodGrupo = Grupo.CodGrupo
                left join Cliente on PedidoVenda.CodCliente = Cliente.CodCliente
                left join Fabricante on Material.CodFabricante = Fabricante.CodFabricante
                left join Rota on IsNull(CRV.CodRota, Cliente.CodRota) = Rota.CodRota
                left join AreaVenda on Rota.CodAreaVenda = AreaVenda.CodAreaVenda
                left join AreaSupervisao on AreaVenda.CodAreaSupervisao = AreaSupervisao.CodAreaSupervisao
                left join Cidade on Cliente.CodCidade = Cidade.CodCidade
                left join GrupoClasse on GrupoClasse.CodGrupoClasse = Grupo.CodGrupoClasse
                left join Estado on Cliente.CodEstado = Estado.CodEstado
                left join FormaReceb on PedidoVenda.CodFormaReceb = FormaReceb.CodFormaReceb
                left join Moeda on FormaReceb.CodMoeda = Moeda.CodMoeda
                left join Regiao on Cliente.CodRegiao = Regiao.CodRegiao
                left join Segmento on Cliente.CodSegmento = Segmento.CodSegmento
                left join Zona on Cliente.CodZona = Zona.CodZona
                left join TabelaPreco on coalesce(nullif(PedidoVendaItens.CodTabelaPreco, 0), PedidoVenda.CodTabelaPreco) = TabelaPreco.CodTabelaPreco
                left join Funcionario on PedidoVenda.CodVendedor = Funcionario.CodFuncionario
                left join Rede on Cliente.CodRede = Rede.CodRede
                left join Sabor on Material.CodSabor = Sabor.CodSabor
                left join NaturezaOperacao on PedidoVenda.CodNaturezaOperacao = NaturezaOperacao.CodNaturezaOperacao
                left join MicroRegiao on Cliente.CodMicroRegiao = MicroRegiao.CodMicroRegiao
                Where
                Material.EmbRetornavel = 0
                and PedidoVenda.Status = 0
                and (NaturezaOperacao.Venda = 1 OR NaturezaOperacao.Bonificacao = 1 OR NaturezaOperacao.Avaria = 1)
                and PedidoVenda.UnidGestora in (select UnidGestora from UnidadeGestora )
                and PedidoVenda.DataVenda >= @P1
                and PedidoVenda.DataVenda < @P2
                Group By Rota.CodRota, Rota.Rota, PedidoVenda.UnidGestora, NaturezaOperacao.Venda, NaturezaOperacao.Avaria, NaturezaOperacao.Bonificacao, Cliente.CodCliente
                ) Consulta
                Group By CodCampo, Campo
                Order By Campo
        """)
        columns = [col[0] for col in cursor.description]
        rows = cursor.fetchall()
        dados = [dict(zip(columns, row)) for row in rows]

        # O total está em PTE.PesoVendidoTotal - vamos pegar do primeiro registro (se existir)
        peso_realizado = sum(r["Peso"] for r in dados)
        venda_realizada = sum(r['ValorProdutos'] for r in dados)
        desconto_total = sum(r['Desconto'] for r in dados)
        venda_realizada=venda_realizada-desconto_total


        return {
            "peso_realizado": peso_realizado,
            "venda_realizada": venda_realizada,
            "detalhamento": dados
        }

def buscar_positivacao_por_rota(data_inicio, data_fim):
    with connections['dados_industria'].cursor() as cursor:
        cursor.execute(f"""
                    DECLARE @DataInicio DATE = '{data_inicio}';
                    DECLARE @DataFim DATE = '{data_fim}';

                    WITH Vendedores AS (
                        SELECT 
                            F.CodFuncionario,
                            F.Nome,
                            AV.CodAreaVenda,
                            AV.AreaVenda
                        FROM Funcionario F
                        INNER JOIN AreaVenda AV ON F.CodFuncionario = AV.CodVendedor
                        WHERE F.Vendedor = 1
                    ),
                    PedidosFiltrados AS (
                        SELECT 
                            PV.CodVendedor,
                            PV.CodCliente,
                            C.CodRota
                        FROM PedidoVenda PV
                        INNER JOIN Cliente C ON C.CodCliente = PV.CodCliente
                        INNER JOIN PedidoVendaItens PVI ON PVI.CodPedidoVenda = PV.CodPedidoVenda
                        INNER JOIN Material M ON M.CodMaterial = PVI.CodMaterial
                        INNER JOIN NaturezaOperacao NO ON NO.CodNaturezaOperacao = PV.CodNaturezaOperacao
                        WHERE PV.DataVenda BETWEEN @DataInicio AND @DataFim
                        AND PV.Status = 0
                        AND NO.Venda = 1
                        AND M.EmbRetornavel = 0
                    ),
                    ClientesPorRota AS (
                        SELECT DISTINCT 
                            PF.CodCliente,
                            V.CodFuncionario,
                            V.Nome,
                            V.CodAreaVenda,
                            V.AreaVenda,
                            PF.CodRota,
                            R.Rota
                        FROM PedidosFiltrados PF
                        INNER JOIN Vendedores V ON PF.CodVendedor = V.CodFuncionario
                        INNER JOIN Rota R ON R.CodRota = PF.CodRota
                    ),
                    ClientesCadastrados AS (
                        SELECT 
                            C.CodRota,
                            R.Rota,
                            AV.CodAreaVenda,
                            AV.AreaVenda,
                            COUNT(DISTINCT C.CodCliente) AS ClientesCadastradosRota
                        FROM Cliente C
                        INNER JOIN Rota R ON C.CodRota = R.CodRota
                        INNER JOIN AreaVenda AV ON R.CodAreaVenda = AV.CodAreaVenda
                        where C.Ativo=1 and C.AtivoAuto=1
                        GROUP BY C.CodRota, R.Rota, AV.CodAreaVenda, AV.AreaVenda
                    ),
                    ClientesPositivadosRota AS (
                        SELECT 
                            CodFuncionario,
                            Nome,
                            CodAreaVenda,
                            AreaVenda,
                            CodRota,
                            Rota,
                            COUNT(DISTINCT CodCliente) AS ClientesPositivadosRota
                        FROM ClientesPorRota
                        GROUP BY CodFuncionario, Nome, CodAreaVenda, AreaVenda, CodRota, Rota
                    ),
                    ClientesPositivadosEmpresa AS (
                        SELECT COUNT(DISTINCT CodCliente) AS ClientesPositivadosEmpresa
                        FROM ClientesPorRota
                    )

                    SELECT 
                        P.CodFuncionario,
                        P.Nome,
                        P.CodAreaVenda,
                        P.AreaVenda,
                        P.CodRota,
                        P.Rota,
                        C.ClientesCadastradosRota,
                        P.ClientesPositivadosRota,
                        CAST(P.ClientesPositivadosRota * 100.0 / NULLIF(C.ClientesCadastradosRota, 0) AS DECIMAL(5,2)) AS PositivacaoPercentual,
                        E.ClientesPositivadosEmpresa
                    FROM ClientesPositivadosRota P
                    LEFT JOIN ClientesCadastrados C ON P.CodRota = C.CodRota
                    CROSS JOIN ClientesPositivadosEmpresa E
                    ORDER BY P.Nome, P.Rota;
                    """)
        columns = [col[0] for col in cursor.description]
        rows = cursor.fetchall()
        dados = [dict(zip(columns, row)) for row in rows]
        positivados_total = dados[0].get("ClientesPositivadosEmpresa", 0) if dados else 0


        return {
        "positivacao_realizado_geral": positivados_total,
        "detalhado": dados
    }

def validar_data(data):
    """
    Garante que a data esteja no formato datetime.date.
    Aceita string no formato 'YYYY-MM-DD' ou um objeto datetime.date.
    """
    if isinstance(data, date):
        return data
    return datetime.strptime(data, "%Y-%m-%d").date()


def buscar_venda_mix(data_inicio, data_fim):
    data_inicio = datetime.strptime(data_inicio, "%Y-%m-%d").date()
    data_fim = datetime.strptime(data_fim, "%Y-%m-%d").date() + timedelta(days=1)
    data_inicio = validar_data(data_inicio)
    data_fim = validar_data(data_fim)

    with connections['dados_industria'].cursor() as cursor:
        cursor.execute(f"""
            DECLARE @P1 datetime2 = '{data_inicio}';
            DECLARE @P2 datetime2 = '{data_fim}';

            select Count(distinct QtdClientes) QtdClientes, CodCampo, Campo, sum(Qtd) Qtd,
            COUNT(DISTINCT ItemVendido) AS MixDeVenda, Cast(sum(QtdEmbalagem) as integer) QtdEmbalagem, sum(Volume) Volume,  sum(Peso) Peso, sum(ValorProdutos) ValorProdutos,Sum(QtdBonificacao) QtdBonificacao,
            Cast(Sum(QtdEmbalagemBonificacao) as integer) QtdEmbalagemBonificacao,Sum(Bonificacao) Bonificacao, Sum(QtdAvaria) QtdAvaria, Cast(Sum(QtdEmbalagemAvaria) as integer) QtdEmbalagemAvaria, Sum(Avaria) Avaria, 
            Sum(QtdOutros) QtdOutros, Cast(Sum(QtdEmbalagemOutros) as integer) QtdEmbalagemOutros, Sum(Outros) Outros,
            Sum(Desconto) Desconto, Sum(DescontoRef) DescontoRef,
            Sum(AcrescimoRef) AcrescimoRef, Sum(Custo) Custo, Sum(QuantidadePedido) QuantidadePedido, Sum(AReceber2) AReceber2, Sum(Recebido2) Recebido2 from (
            select Cliente.CodCliente as QtdClientes,
            Cast(Material.CodMaterial as VarChar) as CodCampo,
            Material.Material as Campo,
                CASE WHEN NaturezaOperacao.Venda = 1 THEN Material.CodMaterial END AS ItemVendido,

            -- Venda
            sum(
            case NaturezaOperacao.Venda 
                when 1 then PedidoVendaItens.quantidade * PedidoVendaItens.qtdembalagem
                else 0
            end) As Qtd,
            sum(
            case NaturezaOperacao.Venda 
                when 1 then (PedidoVendaItens.Quantidade * PedidoVendaItens.QtdEmbalagem * Material.VolumeBruto)
                else 0
            end) As Volume,
            sum(
            case NaturezaOperacao.Venda 
                when 1 then (PedidoVendaItens.Quantidade * PedidoVendaItens.QtdEmbalagem * Material.PesoBruto)
                else 0
            end) As Peso,
            sum(
            case NaturezaOperacao.Venda 
                when 1 then dbo.Round2(pedidovendaitens.quantidade * pedidovendaitens.qtdembalagem / Material.QtdVolume) 
                else 0
            end) As QtdEmbalagem,
            case NaturezaOperacao.Venda 
                when 1 then sum(dbo.Round2(PedidoVendaItens.quantidade * (PedidoVendaItens.ValorEmbalagem)))
                else 0
            end As ValorProdutos,
            -- Bonificacao
            sum(
            case NaturezaOperacao.Bonificacao 
                when 1 then PedidoVendaItens.quantidade * PedidoVendaItens.qtdembalagem
                else 0
            end) As QtdBonificacao,
            sum(
            case NaturezaOperacao.Bonificacao 
                when 1 then dbo.Round2(pedidovendaitens.quantidade * pedidovendaitens.qtdembalagem / Material.QtdVolume) 
                else 0
            end) As QtdEmbalagemBonificacao,
            case NaturezaOperacao.Bonificacao
                when 1 then sum(dbo.Round2(PedidoVendaItens.quantidade * (PedidoVendaItens.ValorEmbalagem)))
                else 0
            end As Bonificacao,
            -- Avaria
            sum(
            case NaturezaOperacao.Avaria 
                when 1 then dbo.Round2(PedidoVendaItens.quantidade * PedidoVendaItens.qtdembalagem)
                else 0
            end) As QtdAvaria,
            sum(
            case NaturezaOperacao.Avaria 
                when 1 then dbo.Round2(pedidovendaitens.quantidade * pedidovendaitens.qtdembalagem / Material.QtdVolume) 
                else 0
            end ) As QtdEmbalagemAvaria,
            case NaturezaOperacao.Avaria
                when 1 then sum(dbo.Round2(PedidoVendaItens.quantidade * (PedidoVendaItens.ValorEmbalagem)))
                else 0
            end As Avaria,
            -- Outros
            0.0 As QtdOutros,
            0 As QtdEmbalagemOutros,
            0.0 As Outros,
            sum(
            case NaturezaOperacao.Venda 
                when 1 then dbo.Round2(PedidoVendaItens.DescontoRef + (PedidoVendaItens.Desconto * PedidoVendaItens.quantidade))
                else 0
            end) As Desconto,
            sum(dbo.Round2(PedidoVendaItens.DescontoRef)) as DescontoRef,
            sum(dbo.Round2(PedidoVendaItens.AcrescimoRef)) as AcrescimoRef,
            sum(dbo.Round2(PedidoVendaItens.quantidade * PedidoVendaItens.QtdEmbalagem * Material.UltimoCusto)) as Custo,
            Count(Distinct PedidoVenda.CodPedidoVenda) as QuantidadePedido,
            (
            select ISNULL(SUM(Coalesce(ValorAReceberConta, Campo)), 0) Campo from (
                Select
                (
                    Select
                    Sum(Round(100 * (CR.Saldo) ,0))/100 ValorAReceberConta
                    From
                    ContasReceber CR
                    Where
                    CR.Baixa = 0
                    AND CR.Recebido = 2
                    AND CR.CodPedido = PV.CodPedidoVenda
                ) ValorAReceberConta,
                IsNull(Sum(Round(100 * (PedidoVendaItens.Quantidade * (PedidoVendaItens.ValorEmbalagem - PedidoVendaItens.Desconto)),0))/100, 0) Campo
                

                From
                PedidoVenda PV left join ClienteRotaVendedor CRV on (PV.CodVendedor = CRV.CodVendedor and PV.CodCliente = CRV.CodCliente)
                left join  PedidoVendaItens on (PV.CodPedidoVenda = PedidoVendaItens.CodPedidoVenda)
                left join FormaReceb FR on PV.CodFormaReceb = FR.CodFormaReceb
                left join Moeda M on FR.CodMoeda = M.CodMoeda
                left join Material Mat on PedidoVendaItens.CodMaterial = Mat.CodMaterial
                left join Grupo G on Mat.CodGrupo = G.CodGrupo
                left join Cliente CL on PV.CodCliente = CL.CodCliente
                left join Fabricante F on Mat.CodFabricante = F.CodFabricante
                left join Rota R on IsNull(CRV.CodRota, CL.CodRota) = R.CodRota
                left join AreaVenda AV on R.CodAreaVenda = AV.CodAreaVenda
                left join AreaSupervisao AreaSup on AV.CodAreaSupervisao = AreaSup.CodAreaSupervisao
                left join Cidade C on CL.CodCidade = C.CodCidade
                left join GrupoClasse GC on GC.CodGrupoClasse = G.CodGrupoClasse
                left join Estado E on CL.CodEstado = E.CodEstado
                left join Regiao RG on CL.CodRegiao = RG.CodRegiao
                left join Segmento S on CL.CodSegmento = S.CodSegmento
                left join Zona Z on CL.CodZona = Z.CodZona
                left join TabelaPreco TP on CL.CodTabelaPreco = TP.CodTabelaPreco
                left join Funcionario Func on PV.CodVendedor = Func.CodFuncionario
                left join Rede RD on CL.CodRede = RD.CodRede
                left join Sabor SA on Mat.CodSabor = SA.CodSabor
                left join NaturezaOperacao Nat on PV.CodNaturezaOperacao = Nat.CodNaturezaOperacao
                left join MicroRegiao MR on CL.CodMicroRegiao = MR.CodMicroRegiao
                where ((PV.SituacaoPagamento = 'N' )
                        or PV.CodPedidoVenda In
                            (
                            Select CodPedido
                            From ContasReceber
                            Where ContasReceber.CodPedido = PV.CodPedidoVenda
                                and (
                                    (M.CodMoedaTipo = 2 or M.CodMoedaTipo = 4 or M.CodMoedaTipo = 5)
                                        and (Baixa = 0)
                                        and ((Recebido = 0) or (Recebido = 2) or (Devolvido = 1) Or (Antecipado = 1 and DataCustodia >= GetDate()) )
                                    )
                            ))
                    and Mat.EmbRetornavel = 0
                    and PV.Status = 0
                    and (Nat.Venda = 1)
                    and PV.UnidGestora In (
            Select UnidGestora From UserUsuarioUnidade Where ID = 'ESIGMA')
                    and PV.DataVenda >= @P1
                    and PV.DataVenda < @P2
                    and Mat.CodMaterial = Material.CodMaterial
                    and PV.UnidGestora = PedidoVenda.UnidGestora
                    and Nat.Venda = NaturezaOperacao.Venda
                    and CL.CodCLiente = Cliente.CodCliente
            Group by PV.UnidGestora, Nat.Venda, CL.CodCliente, PV.CodPedidoVenda
            ) ConsultaAReceber
            ) AReceber2,
            (
            Select
                sum(dbo.Round2((case Nat.Venda
                when 1 then dbo.Round2(PedidoVendaItens.quantidade * (PedidoVendaItens.valorembalagem - PedidoVendaItens.Desconto))
                else 0
                end)*Coalesce((ContasReceber.ValorRecebido + ContasReceber.Desconto - ContasReceber.Acrescimo)/PV.Valor,1))) As Recebido
            From
                PedidoVenda PV left join ClienteRotaVendedor CRV on (PV.CodVendedor = CRV.CodVendedor and PV.CodCliente = CRV.CodCliente)
                left join  PedidoVendaItens on (PV.CodPedidoVenda = PedidoVendaItens.CodPedidoVenda)
                left join FormaReceb FR on PV.CodFormaReceb = FR.CodFormaReceb
                left join Moeda M on FR.CodMoeda = M.CodMoeda
                left join Material Mat on PedidoVendaItens.CodMaterial = Mat.CodMaterial
                left join Grupo G on Mat.CodGrupo = G.CodGrupo
                left join Cliente CL on PV.CodCliente = CL.CodCliente
                left join Fabricante F on Mat.CodFabricante = F.CodFabricante
                left join Rota R on IsNull(CRV.CodRota, CL.CodRota) = R.CodRota
                left join AreaVenda AV on R.CodAreaVenda = AV.CodAreaVenda
                left join AreaSupervisao AreaSup on AV.CodAreaSupervisao = AreaSup.CodAreaSupervisao
                left join Cidade C on CL.CodCidade = C.CodCidade
                left join GrupoClasse GC on GC.CodGrupoClasse = G.CodGrupoClasse
                left join Estado E on CL.CodEstado = E.CodEstado
                left join Regiao RG on CL.CodRegiao = RG.CodRegiao
                left join Segmento S on CL.CodSegmento = S.CodSegmento
                left join Zona Z on CL.CodZona = Z.CodZona
                left join TabelaPreco TP on CL.CodTabelaPreco = TP.CodTabelaPreco
                left join Funcionario Func on PV.CodVendedor = Func.CodFuncionario
                left join Rede RD on CL.CodRede = RD.CodRede
                left join Sabor SA on Mat.CodSabor = SA.CodSabor
                left join NaturezaOperacao Nat on PV.CodNaturezaOperacao = Nat.CodNaturezaOperacao
                left join MicroRegiao MR on CL.CodMicroRegiao = MR.CodMicroRegiao
                left join ContasReceber on (PV.CodPedidoVenda = ContasReceber.CodPedido)
            Where
            ( ((ContasReceber.CodContaReceber is null) and (PV.SituacaoPagamento = 'S')) or 
            (ContasReceber.Baixa = 0 and ContasReceber.Devolvido = 0 and ContasReceber.Recebido in (1,2)) ) 
                and Mat.EmbRetornavel = 0
                and PV.Status = 0
                and (Nat.Venda = 1)
                and PV.UnidGestora In (
                Select UnidGestora From UserUsuarioUnidade Where ID = 'ESIGMA')
                and PV.DataVenda >= @P1
                and PV.DataVenda < @P2
                and Mat.CodMaterial = Material.CodMaterial
                and PV.UnidGestora = PedidoVenda.UnidGestora
                and Nat.Venda = NaturezaOperacao.Venda
                and CL.CodCLiente = Cliente.CodCliente
            ) Recebido2
            From PedidoVenda left join ClienteRotaVendedor CRV on (PedidoVenda.CodVendedor = CRV.CodVendedor and PedidoVenda.CodCliente = CRV.CodCliente) 
            left join PedidoVendaItens on PedidoVenda.CodPedidoVenda = PedidoVendaItens.CodPedidoVenda 
            left join Material on PedidoVendaItens.CodMaterial = Material.CodMaterial
            left join Grupo on Material.CodGrupo = Grupo.CodGrupo
            left join Cliente on PedidoVenda.CodCliente = Cliente.CodCliente
            left join Fabricante on Material.CodFabricante = Fabricante.CodFabricante
            left join Rota on IsNull(CRV.CodRota, Cliente.CodRota) = Rota.CodRota
            left join AreaVenda on Rota.CodAreaVenda = AreaVenda.CodAreaVenda
            left join AreaSupervisao on AreaVenda.CodAreaSupervisao = AreaSupervisao.CodAreaSupervisao
            left join Cidade on Cliente.CodCidade = Cidade.CodCidade
            left join GrupoClasse on GrupoClasse.CodGrupoClasse = Grupo.CodGrupoClasse
            left join Estado on Cliente.CodEstado = Estado.CodEstado
            left join FormaReceb on PedidoVenda.CodFormaReceb = FormaReceb.CodFormaReceb
            left join Moeda on FormaReceb.CodMoeda = Moeda.CodMoeda
            left join Regiao on Cliente.CodRegiao = Regiao.CodRegiao
            left join Segmento on Cliente.CodSegmento = Segmento.CodSegmento
            left join Zona on Cliente.CodZona = Zona.CodZona
            left join TabelaPreco on coalesce(nullif(PedidoVendaItens.CodTabelaPreco, 0), PedidoVenda.CodTabelaPreco) = TabelaPreco.CodTabelaPreco
            left join Funcionario on PedidoVenda.CodVendedor = Funcionario.CodFuncionario
            left join Rede on Cliente.CodRede = Rede.CodRede
            left join Sabor on Material.CodSabor = Sabor.CodSabor
            left join NaturezaOperacao on PedidoVenda.CodNaturezaOperacao = NaturezaOperacao.CodNaturezaOperacao
            left join MicroRegiao on Cliente.CodMicroRegiao = MicroRegiao.CodMicroRegiao
            Where
            Material.EmbRetornavel = 0
            and PedidoVenda.Status = 0
            and (NaturezaOperacao.Venda = 1 OR NaturezaOperacao.Bonificacao = 1 OR NaturezaOperacao.Avaria = 1)
            and PedidoVenda.UnidGestora In (
                Select UnidGestora From UserUsuarioUnidade Where ID = 'ESIGMA')
            and PedidoVenda.DataVenda >= @P1
            and PedidoVenda.DataVenda < @P2
            Group By Material.CodMaterial, Material.Material, PedidoVenda.UnidGestora, NaturezaOperacao.Venda, NaturezaOperacao.Avaria, NaturezaOperacao.Bonificacao, Cliente.CodCliente
            HAVING SUM(
            CASE NaturezaOperacao.Venda 
                WHEN 1 THEN PedidoVendaItens.quantidade * PedidoVendaItens.qtdembalagem 
                ELSE 0 
            END
            ) > 0

            ) Consulta
            Group By CodCampo, Campo
            Order By Campo
            """)
        columns = [col[0] for col in cursor.description]
        rows = cursor.fetchall()
        dados = [dict(zip(columns, row)) for row in rows]

        mix_realizado = sum(r["MixDeVenda"] for r in dados)

    return {
        "mix_realizado": mix_realizado,
        "detalhado": dados
    }

def buscar_pre_venda(data_inicio, data_fim):
    data_inicio = datetime.strptime(data_inicio, "%Y-%m-%d").date()
    data_fim = datetime.strptime(data_fim, "%Y-%m-%d").date() + timedelta(days=1)
    data_inicio = validar_data(data_inicio)
    data_fim = validar_data(data_fim)

    with connections['dados_industria'].cursor() as cursor:
        cursor.execute(f"""
            DECLARE @P1 datetime2 = '{data_inicio}';
            DECLARE @P2 datetime2 = '{data_fim}';
            SELECT 
                PD.*,
                C.Cliente,
                C.ClienteFantasia,
                C.CodTabelaPreco AS CodTabelaPrecoCliente,
                C.CodFormaPagto AS CodFormaRecebCliente,
                (SELECT SUM(PDI.Qtd1 * PDI.Desconto1)
                FROM PocketDocumentoItens PDI
                WHERE PDI.CodPocket = PD.CodPocket
                AND PDI.CodDoc = PD.CodDoc) AS Desconto,
                F.Funcionario
            FROM PocketDocumento PD
            LEFT JOIN Funcionario F ON PD.CodVendedor = F.CodFuncionario
            JOIN Cliente C ON PD.CodCliente = C.CodCliente
            JOIN TipoDocumento TD ON PD.CodTipoDoc = TD.CodTipoDoc
            JOIN NaturezaOperacao NOPE ON TD.CodNaturezaOperacao = NOPE.CodNaturezaOperacao
            WHERE PD.Status IN (0, 1)
            AND (ISNULL(PD.UnidGestora, 0) = 0 OR PD.UnidGestora IN (
                SELECT UnidGestora FROM UserUsuarioUnidade WHERE ID = 'ESIGMA'))
            AND TD.TipoOperacao <> 4
            AND NOPE.Venda = 1
            AND PD.DataDoc >= @P1
            AND PD.DataDoc < @P2


            """)
        
        columns = [col[0] for col in cursor.description]
        rows = cursor.fetchall()
        dados = [dict(zip(columns, row)) for row in rows]

        pre_venda_valor = sum(r["Valor"] for r in dados)
        
        return {
        "pre_venda_valor": pre_venda_valor,
        "detalhado": dados
    }