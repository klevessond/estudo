# backend/dashboard/services/indicadores/vendas_service.py
from __future__ import annotations

from typing import Iterable, Optional, List, Dict, Any
from datetime import datetime, timedelta, date

from dashboard.db_conn import query_all  # usa pyodbc + FreeTDS

# ----------------- utilidades -----------------

def _validar_data(data: str | date) -> date:
    if isinstance(data, date):
        return data
    return datetime.strptime(str(data), "%Y-%m-%d").date()

def _dt_bounds(data_inicio: str | date, data_fim: str | date) -> tuple[datetime, datetime]:
    """Gera (início inclusivo, fim exclusivo) em datetime (00:00)."""
    di = _validar_data(data_inicio)
    df = _validar_data(data_fim) + timedelta(days=1)
    di_dt = datetime.combine(di, datetime.min.time())
    df_dt = datetime.combine(df, datetime.min.time())
    return di_dt, df_dt

def _in_clause_int(values: Optional[Iterable]) -> str:
    vals = [int(v) for v in (values or []) if v is not None]
    vals = list(dict.fromkeys(vals))
    return f" IN ({','.join(map(str, vals))}) " if vals else ""

# ----------------- serviços -----------------

def buscar_vendido(data_inicio: str | date, data_fim: str | date, rotas: Optional[Iterable[int]] = None) -> Dict[str, Any]:
    """
    Soma vendido por Rota. Se 'rotas' vier, aplica AND Rota.CodRota IN (...).
    """
    p1, p2 = _dt_bounds(data_inicio, data_fim)

    rota_filter_sql = ""
    if rotas:
        r = [int(x) for x in rotas if x is not None]
        r = list(dict.fromkeys(r))
        if r:
            rota_filter_sql = f" AND Rota.CodRota IN ({','.join(map(str, r))}) "

    sql = f"""
        DECLARE @P1 datetime2 = '{p1:%Y-%m-%d %H:%M:%S}';
        DECLARE @P2 datetime2 = '{p2:%Y-%m-%d %H:%M:%S}';

   SELECT 
    Count(distinct QtdClientes) QtdClientes, 
    CodVendedor, -- Novo campo solicitado
    CodCampo, 
    Campo, 
    sum(Qtd) Qtd, 
    Cast(sum(QtdEmbalagem) as integer) QtdEmbalagem, 
    sum(Volume) Volume,  
    sum(Peso) Peso, 
    sum(ValorProdutos) ValorProdutos,
    Sum(QtdBonificacao) QtdBonificacao,
    Cast(Sum(QtdEmbalagemBonificacao) as integer) QtdEmbalagemBonificacao,
    Sum(Bonificacao) Bonificacao, 
    Sum(QtdAvaria) QtdAvaria, 
    Cast(Sum(QtdEmbalagemAvaria) as integer) QtdEmbalagemAvaria, 
    Sum(Avaria) Avaria, 
    Sum(QtdOutros) QtdOutros, 
    Cast(Sum(QtdEmbalagemOutros) as integer) QtdEmbalagemOutros, 
    Sum(Outros) Outros,
    Sum(Desconto) Desconto, 
    Sum(DescontoRef) DescontoRef,
    Sum(AcrescimoRef) AcrescimoRef, 
    Sum(Custo) Custo, 
    Sum(QuantidadePedido) QuantidadePedido, 
    Sum(AReceber2) AReceber2, 
    Sum(Recebido2) Recebido2,
    (SELECT COUNT(CodMaterial) FROM (
        SELECT distinct PVI.CodMaterial as CodMaterial
        FROM PedidoVendaItens PVI
        INNER JOIN PedidoVenda PV ON PV.CodPedidoVenda = PVI.CodPedidoVenda
        LEFT JOIN ClienteRotaVendedor CRV ON (PV.CodVendedor = CRV.CodVendedor and PV.CodCliente = CRV.CodCliente)
        LEFT JOIN Cliente CL ON PV.CodCliente = CL.CodCliente
        LEFT JOIN Rota R ON IsNull(CRV.CodRota, CL.CodRota) = R.CodRota
        LEFT JOIN Material Mat ON PVI.CodMaterial = Mat.CodMaterial
        LEFT JOIN NaturezaOperacao Nat ON PV.CodNaturezaOperacao = Nat.CodNaturezaOperacao
        WHERE PV.Status = 0 AND Nat.Venda = 1
          AND PV.DataVenda >= @p1 AND PV.DataVenda < @p2
          AND Mat.EmbRetornavel = 0
          AND R.CodRota = CodCampo 
          AND PV.CodVendedor = Consulta.CodVendedor -- FILTRO DO VENDEDOR NO MIX
    ) as Tb) Mix
FROM (
    SELECT 
        Cliente.CodCliente as QtdClientes,
        PedidoVenda.CodVendedor, -- Selecionando o vendedor
        Cast(Rota.CodRota as VarChar) as CodCampo,
        Rota.Rota as Campo,
        -- Venda
        sum(case NaturezaOperacao.Venda when 1 then PedidoVendaItens.quantidade * PedidoVendaItens.qtdembalagem else 0 end) As Qtd,
        sum(case NaturezaOperacao.Venda when 1 then (PedidoVendaItens.Quantidade * PedidoVendaItens.QtdEmbalagem * Material.VolumeBruto) else 0 end) As Volume,
        sum(case NaturezaOperacao.Venda when 1 then (PedidoVendaItens.Quantidade * PedidoVendaItens.QtdEmbalagem * Material.PesoBruto) else 0 end) As Peso,
        sum(case NaturezaOperacao.Venda when 1 then dbo.Round2(pedidovendaitens.quantidade * pedidovendaitens.qtdembalagem / Material.QtdVolume) else 0 end) As QtdEmbalagem,
        case NaturezaOperacao.Venda when 1 then sum(dbo.Round2(PedidoVendaItens.quantidade * (PedidoVendaItens.ValorEmbalagem))) else 0 end As ValorProdutos,
        -- Bonificacao
        sum(case NaturezaOperacao.Bonificacao when 1 then PedidoVendaItens.quantidade * PedidoVendaItens.qtdembalagem else 0 end) As QtdBonificacao,
        sum(case NaturezaOperacao.Bonificacao when 1 then dbo.Round2(pedidovendaitens.quantidade * pedidovendaitens.qtdembalagem / Material.QtdVolume) else 0 end) As QtdEmbalagemBonificacao,
        case NaturezaOperacao.Bonificacao when 1 then sum(dbo.Round2(PedidoVendaItens.quantidade * (PedidoVendaItens.ValorEmbalagem))) else 0 end As Bonificacao,
        -- Avaria e outros campos (simplificados para brevidade, mantendo sua lógica original)
        sum(case NaturezaOperacao.Avaria when 1 then dbo.Round2(PedidoVendaItens.quantidade * PedidoVendaItens.qtdembalagem) else 0 end) As QtdAvaria,
        sum(case NaturezaOperacao.Avaria when 1 then dbo.Round2(pedidovendaitens.quantidade * pedidovendaitens.qtdembalagem / Material.QtdVolume) else 0 end ) As QtdEmbalagemAvaria,
        case NaturezaOperacao.Avaria when 1 then sum(dbo.Round2(PedidoVendaItens.quantidade * (PedidoVendaItens.ValorEmbalagem))) else 0 end As Avaria,
        0.0 As QtdOutros, 0 As QtdEmbalagemOutros, 0.0 As Outros,
        sum(case NaturezaOperacao.Venda when 1 then dbo.Round2(PedidoVendaItens.DescontoRef + (PedidoVendaItens.Desconto * PedidoVendaItens.quantidade)) else 0 end) As Desconto,
        sum(dbo.Round2(PedidoVendaItens.DescontoRef)) as DescontoRef,
        sum(dbo.Round2(PedidoVendaItens.AcrescimoRef)) as AcrescimoRef,
        sum(dbo.Round2(PedidoVendaItens.quantidade * PedidoVendaItens.QtdEmbalagem * Material.UltimoCusto)) as Custo,
        Count(Distinct PedidoVenda.CodPedidoVenda) as QuantidadePedido,
        (
            SELECT ISNULL(SUM(Coalesce(ValorAReceberConta, Campo)), 0) FROM (
                Select 
                    (Select Sum(Round(100 * (CR.Saldo) ,0))/100 From ContasReceber CR Where CR.Baixa = 0 AND CR.Recebido = 2 AND CR.CodPedido = PV.CodPedidoVenda) ValorAReceberConta,
                    IsNull(Sum(Round(100 * (PVI2.Quantidade * (PVI2.ValorEmbalagem - PVI2.Desconto)),0))/100, 0) Campo
                From PedidoVenda PV 
                inner join PedidoVendaItens PVI2 on PV.CodPedidoVenda = PVI2.CodPedidoVenda
                left join ClienteRotaVendedor CRV2 on (PV.CodVendedor = CRV2.CodVendedor and PV.CodCliente = CRV2.CodCliente)
                left join Cliente CL2 on PV.CodCliente = CL2.CodCliente
                left join Rota R2 on IsNull(CRV2.CodRota, CL2.CodRota) = R2.CodRota
                left join NaturezaOperacao Nat2 on PV.CodNaturezaOperacao = Nat2.CodNaturezaOperacao
                where PV.Status = 0 and Nat2.Venda = 1
                  and PV.DataVenda >= @p1 and PV.DataVenda < @p2
                  and R2.CodRota = Rota.CodRota 
                  and PV.CodVendedor = PedidoVenda.CodVendedor -- FILTRO VENDEDOR
                  and CL2.CodCliente = Cliente.CodCliente
                Group by PV.CodPedidoVenda
            ) Tb
        ) AReceber2,
        (
            Select sum(dbo.Round2((case Nat3.Venda when 1 then dbo.Round2(PVI3.quantidade * (PVI3.valorembalagem - PVI3.Desconto)) else 0 end)*Coalesce((CR3.ValorRecebido + CR3.Desconto - CR3.Acrescimo)/PV3.Valor,1)))
            From PedidoVenda PV3
            inner join PedidoVendaItens PVI3 on PV3.CodPedidoVenda = PVI3.CodPedidoVenda
            left join ContasReceber CR3 on PV3.CodPedidoVenda = CR3.CodPedido
            left join ClienteRotaVendedor CRV3 on (PV3.CodVendedor = CRV3.CodVendedor and PV3.CodCliente = CRV3.CodCliente)
            left join Cliente CL3 on PV3.CodCliente = CL3.CodCliente
            left join Rota R3 on IsNull(CRV3.CodRota, CL3.CodRota) = R3.CodRota
            left join NaturezaOperacao Nat3 on PV3.CodNaturezaOperacao = Nat3.CodNaturezaOperacao
            Where PV3.Status = 0 and Nat3.Venda = 1
              and PV3.DataVenda >= @p1 and PV3.DataVenda < @p2
              and R3.CodRota = Rota.CodRota
              and PV3.CodVendedor = PedidoVenda.CodVendedor -- FILTRO VENDEDOR
              and CL3.CodCliente = Cliente.CodCliente
        ) Recebido2
    FROM PedidoVenda 
    LEFT JOIN ClienteRotaVendedor CRV ON (PedidoVenda.CodVendedor = CRV.CodVendedor and PedidoVenda.CodCliente = CRV.CodCliente) 
    LEFT JOIN PedidoVendaItens ON PedidoVenda.CodPedidoVenda = PedidoVendaItens.CodPedidoVenda 
    LEFT JOIN Material ON PedidoVendaItens.CodMaterial = Material.CodMaterial
    LEFT JOIN Cliente ON PedidoVenda.CodCliente = Cliente.CodCliente
    LEFT JOIN Rota ON IsNull(CRV.CodRota, Cliente.CodRota) = Rota.CodRota
    LEFT JOIN NaturezaOperacao ON PedidoVenda.CodNaturezaOperacao = NaturezaOperacao.CodNaturezaOperacao
    WHERE Material.EmbRetornavel = 0 AND PedidoVenda.Status = 0
      AND PedidoVenda.DataVenda >= @p1 AND PedidoVenda.DataVenda < @p2
	  {rota_filter_sql}
    GROUP BY Rota.CodRota, Rota.Rota, PedidoVenda.CodVendedor, Cliente.CodCliente, NaturezaOperacao.Venda, NaturezaOperacao.Avaria, NaturezaOperacao.Bonificacao
) Consulta
GROUP BY CodVendedor, CodCampo, Campo
ORDER BY Campo, CodVendedor;
    """
    dados = query_all(sql)

    peso_realizado = sum(float(r.get("Peso") or 0) for r in dados)
    venda_bruta = sum(float(r.get("ValorProdutos") or 0) for r in dados)
    desconto_total = sum(float(r.get("Desconto") or 0) for r in dados)
    venda_liquida = venda_bruta - desconto_total

    return {"peso_realizado": peso_realizado, "venda_realizada": venda_liquida, "detalhamento": dados}


def buscar_positivacao_por_rota(
    data_inicio: str | date,
    data_fim: str | date,
    rotas: Optional[Iterable[int]] = None,
    cod_vendedores: Optional[Iterable[int]] = None,
) -> Dict[str, Any]:
    rota_filter_sql = ""
    if rotas:
        r = [int(x) for x in rotas if x is not None]
        r = list(dict.fromkeys(r))
        if r:
            rota_filter_sql = f" AND R.CodRota IN ({','.join(map(str, r))}) "

    vend_filter_sql = ""
    if cod_vendedores:
        vend_in = _in_clause_int(cod_vendedores)
        if vend_in:
            vend_filter_sql = f" AND F.CodFuncionario {vend_in} "

    di, df = _validar_data(data_inicio), _validar_data(data_fim)
    sql = f"""
        DECLARE @DataInicio DATE = '{di:%Y-%m-%d}';
        DECLARE @DataFim    DATE = '{df:%Y-%m-%d}';

        WITH Vendedores AS (
            SELECT F.CodFuncionario, F.Nome, AV.CodAreaVenda, AV.AreaVenda
            FROM Funcionario F
            INNER JOIN AreaVenda AV ON F.CodFuncionario = AV.CodVendedor
            WHERE F.Vendedor = 1
            {vend_filter_sql}
        ),
        PedidosFiltrados AS (
            SELECT PV.CodVendedor, PV.CodCliente, C.CodRota
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
            SELECT DISTINCT PF.CodCliente, V.CodFuncionario, V.Nome, V.CodAreaVenda, V.AreaVenda, PF.CodRota, R.Rota
            FROM PedidosFiltrados PF
            INNER JOIN Vendedores V ON PF.CodVendedor = V.CodFuncionario
            INNER JOIN Rota R ON R.CodRota = PF.CodRota
            WHERE 1=1 {rota_filter_sql}
        ),
        ClientesCadastrados AS (
            SELECT C.CodRota, R.Rota, AV.CodAreaVenda, AV.AreaVenda,
                   COUNT(DISTINCT C.CodCliente) AS ClientesCadastradosRota
            FROM Cliente C
            INNER JOIN Rota R ON C.CodRota = R.CodRota
            INNER JOIN AreaVenda AV ON R.CodAreaVenda = AV.CodAreaVenda
            WHERE C.Ativo=1 AND C.AtivoAuto=1 {rota_filter_sql}
            GROUP BY C.CodRota, R.Rota, AV.CodAreaVenda, AV.AreaVenda
        ),
        ClientesPositivadosRota AS (
            SELECT CodFuncionario, Nome, CodAreaVenda, AreaVenda, CodRota, Rota,
                   COUNT(DISTINCT CodCliente) AS ClientesPositivadosRota
            FROM ClientesPorRota
            GROUP BY CodFuncionario, Nome, CodAreaVenda, AreaVenda, CodRota, Rota
        ),
        ClientesPositivadosEmpresa AS (
            SELECT COUNT(DISTINCT CodCliente) AS ClientesPositivadosEmpresa
            FROM ClientesPorRota
        )
        SELECT P.CodFuncionario, P.Nome, P.CodAreaVenda, P.AreaVenda, P.CodRota, P.Rota,
               C.ClientesCadastradosRota, P.ClientesPositivadosRota,
               CAST(P.ClientesPositivadosRota * 100.0 / NULLIF(C.ClientesCadastradosRota, 0) AS DECIMAL(5,2)) AS PositivacaoPercentual,
               E.ClientesPositivadosEmpresa
        FROM ClientesPositivadosRota P
        LEFT JOIN ClientesCadastrados C ON P.CodRota = C.CodRota
        CROSS JOIN ClientesPositivadosEmpresa E
        ORDER BY P.Nome, P.Rota;
    """
    dados = query_all(sql)
    positivados_total = int(dados[0]["ClientesPositivadosEmpresa"]) if dados else 0
    return {"positivacao_realizado_geral": positivados_total, "detalhado": dados}


def buscar_venda_mix(data_inicio: str | date, data_fim: str | date, cod_vendedores: Optional[Iterable[int]] = None) -> Dict[str, Any]:
    p1, p2 = _dt_bounds(data_inicio, data_fim)

    vendedor_filter_sql = ""
    if cod_vendedores:
        v = [int(x) for x in cod_vendedores if x is not None]
        v = list(dict.fromkeys(v))
        if v:
            vendedor_filter_sql = f" AND PedidoVenda.CodVendedor IN ({','.join(map(str, v))}) "

    sql = f"""
        DECLARE @P1 datetime2 = '{p1:%Y-%m-%d %H:%M:%S}';
        DECLARE @P2 datetime2 = '{p2:%Y-%m-%d %H:%M:%S}';

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
         {vendedor_filter_sql}
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
    """
    dados = query_all(sql)
    mix_realizado = sum(int(r.get("MixDeVenda") or 0) for r in dados)
    return {"mix_realizado": mix_realizado, "detalhado": dados}


def buscar_pre_venda(data_inicio: str | date, data_fim: str | date, cod_vendedores: Optional[Iterable[int]] = None) -> Dict[str, Any]:
    di, df = _validar_data(data_inicio), _validar_data(data_fim)

    vendedor_filter_sql = ""
    if cod_vendedores:
        v = [int(x) for x in cod_vendedores if x is not None]
        v = list(dict.fromkeys(v))
        if v:
            vendedor_filter_sql = f" AND PD.CodVendedor IN ({','.join(map(str, v))}) "

    sql = f"""
        DECLARE @P1 DATE = '{di:%Y-%m-%d}';
        DECLARE @P2 DATE = '{df:%Y-%m-%d}';

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
        {vendedor_filter_sql}
    """
    dados = query_all(sql)
    pre_venda_valor = sum(float(r.get("Valor") or 0) for r in dados)
    return {"pre_venda_valor": pre_venda_valor, "detalhado": dados}


def buscar_vendas_por_vendedor(
    data_inicio: str | date,
    data_fim: str | date,
    rotas: Optional[Iterable[int]] = None,
    cod_vendedores: Optional[Iterable[int]] = None,
) -> Dict[str, Any]:
    p1, p2 = _dt_bounds(data_inicio, data_fim)

    # ✅ filtro opcional por vendedores (não altera comportamento quando None/vazio)
    vend_list = [int(v) for v in (cod_vendedores or []) if v is not None]
    vend_list = list(dict.fromkeys(vend_list))

    if len(vend_list) == 0:
        vend_filter_sql = ""
        vend_filter_mix_sql = ""
    elif len(vend_list) == 1:
        vend_filter_sql = f" AND PedidoVenda.CodVendedor = {vend_list[0]} "
        vend_filter_mix_sql = f" AND PV.CodVendedor = {vend_list[0]} "
    else:
        in_list = ",".join(map(str, vend_list))
        vend_filter_sql = f" AND PedidoVenda.CodVendedor IN ({in_list}) "
        vend_filter_mix_sql = f" AND PV.CodVendedor IN ({in_list}) "

    sql = f"""
        DECLARE @P1 datetime2 = '{p1:%Y-%m-%d %H:%M:%S}';
        DECLARE @P2 datetime2 = '{p2:%Y-%m-%d %H:%M:%S}';

        SELECT codcampo,
               Campo,
               COUNT(DISTINCT QtdClientes) AS QtdClientes,
               CAST(SUM(ValorProdutos - Desconto) AS FLOAT) AS ValorLiquido,
               CAST(SUM(Peso) AS FLOAT) AS PesoTotal,
               (
                   SELECT COUNT(DISTINCT PVI.CodMaterial)
                   FROM PedidoVendaItens PVI
                   LEFT JOIN PedidoVenda PV ON PV.CodPedidoVenda = PVI.CodPedidoVenda
                   LEFT JOIN Material M ON PVI.CodMaterial = M.CodMaterial
                   LEFT JOIN NaturezaOperacao NOP ON PV.CodNaturezaOperacao = NOP.CodNaturezaOperacao
                   WHERE PV.Status = 0
                     AND (NOP.Venda = 1 OR NOP.Bonificacao = 1)
                     AND PV.UnidGestora IN (1, 2, 3, 4, 5, 6, 8, 9, 10)
                     AND PV.DataVenda >= @P1
                     AND PV.DataVenda <  @P2
                     AND M.EmbRetornavel = 0
                     {vend_filter_mix_sql}
                     AND PV.CodVendedor = CAST(Consulta.CodCampo AS INT)
               ) AS Mix
        FROM (
            SELECT Cliente.CodCliente as QtdClientes,
                   CAST(Funcionario.CodFuncionario as VarChar) as CodCampo,
                   Funcionario.Funcionario as Campo,
                   SUM(
                     CASE NaturezaOperacao.Venda
                       WHEN 1 THEN PedidoVendaItens.quantidade * PedidoVendaItens.qtdembalagem
                       ELSE 0
                     END) As Qtd,
                   SUM(
                     CASE NaturezaOperacao.Venda
                       WHEN 1 THEN dbo.Round2(pedidovendaitens.quantidade * pedidovendaitens.qtdembalagem / Material.QtdVolume)
                       ELSE 0
                     END) As QtdEmbalagem,
                   SUM(
                     CASE NaturezaOperacao.Venda
                       WHEN 1 THEN (PedidoVendaItens.Quantidade * PedidoVendaItens.QtdEmbalagem * Material.VolumeBruto)
                       ELSE 0
                     END) As Volume,
                   SUM(
                     CASE NaturezaOperacao.Venda
                       WHEN 1 THEN (PedidoVendaItens.Quantidade * PedidoVendaItens.QtdEmbalagem * Material.PesoBruto)
                       ELSE 0
                     END) As Peso,
                   CASE NaturezaOperacao.Venda
                     WHEN 1 THEN SUM(dbo.Round2(PedidoVendaItens.quantidade * (PedidoVendaItens.ValorEmbalagem)))
                     ELSE 0
                   END As ValorProdutos,
                   SUM(
                     CASE NaturezaOperacao.Venda
                       WHEN 1 THEN dbo.Round2(PedidoVendaItens.DescontoRef + (PedidoVendaItens.Desconto * PedidoVendaItens.quantidade))
                       ELSE 0
                     END) As Desconto
            FROM PedidoVenda
            LEFT JOIN PedidoVendaItens on PedidoVenda.CodPedidoVenda = PedidoVendaItens.CodPedidoVenda
            LEFT JOIN Material on PedidoVendaItens.CodMaterial = Material.CodMaterial
            LEFT JOIN Cliente on PedidoVenda.CodCliente = Cliente.CodCliente
            LEFT JOIN Funcionario on PedidoVenda.CodVendedor = Funcionario.CodFuncionario
            LEFT JOIN NaturezaOperacao on PedidoVenda.CodNaturezaOperacao = NaturezaOperacao.CodNaturezaOperacao
            WHERE Material.EmbRetornavel = 0
              AND PedidoVenda.Status = 0
              AND (NaturezaOperacao.Venda = 1)
              AND PedidoVenda.UnidGestora in (select UnidGestora from unidadegestora)
              AND PedidoVenda.DataVenda >= @P1
              AND PedidoVenda.DataVenda < @P2
              {vend_filter_sql}
            GROUP BY Funcionario.CodFuncionario, Funcionario.Funcionario, PedidoVenda.UnidGestora, NaturezaOperacao.Venda, Cliente.CodCliente
        ) Consulta
        GROUP BY CodCampo, Campo
        ORDER BY Campo
    """
    dados = query_all(sql)
    return {"vendas_por_vendedor": dados}



def buscar_resumo_segmento_area_venda(
    data_inicio: str | date,
    data_fim: str | date,
    cod_funcionarios: Optional[Iterable[int]] = None,
    db_alias_ignorado: str = "dados_industria",
) -> List[Dict, Any]:
    di = _validar_data(data_inicio)
    df = _validar_data(data_fim)

    vend_list = [int(x) for x in (cod_funcionarios or []) if x is not None]
    vend_list = list(dict.fromkeys(vend_list))
    if len(vend_list) == 0:
        vend_filter_sql = ""
    elif len(vend_list) == 1:
        vend_filter_sql = f" AND Funcionario.CodFuncionario = {vend_list[0]} "
    else:
        vend_filter_sql = f" AND Funcionario.CodFuncionario IN ({','.join(map(str, vend_list))}) "

    sql = f"""
        DECLARE @P1 datetime2 = '{di:%Y-%m-%d}';
        DECLARE @P2 datetime2 = '{df:%Y-%m-%d}';

        SELECT
          Segmento.CodSegmento,
          Segmento.Segmento,
          AreaVenda.CodAreaVenda,
          AreaVenda.AreaVenda AS Tabela,
          Funcionario.CodFuncionario,
          Funcionario.Funcionario,

          ( SELECT COUNT(Cliente.CodCliente)
            FROM Rota, Cliente
            LEFT JOIN ClienteDiaSemana ON ClienteDiaSemana.CodCliente = Cliente.CodCliente
            WHERE (Cliente.CodRota = Rota.CodRota OR ClienteDiaSemana.CodRota = Rota.CodRota)
              AND Rota.CodAreaVenda = AreaVenda.CodAreaVenda
              AND Cliente.Ativo = 1
              AND Cliente.ECliente = 1
              AND Cliente.CodSegmento = Segmento.CodSegmento
          ) AS QtdCliente,

          ( SELECT COUNT(DISTINCT PedidoVenda.CodPedidoVenda)
            FROM PedidoVenda
            LEFT JOIN ClienteRotaVendedor CRV
                   ON (PedidoVenda.CodVendedor = CRV.CodVendedor AND PedidoVenda.CodCliente = CRV.CodCliente)
            LEFT JOIN PedidoVendaItens ON PedidoVenda.CodPedidoVenda = PedidoVendaItens.CodPedidoVenda
            LEFT JOIN Material ON PedidoVendaItens.CodMaterial = Material.CodMaterial
            LEFT JOIN Cliente C ON PedidoVenda.CodCliente = C.CodCliente
            LEFT JOIN Fabricante ON Material.CodFabricante = Fabricante.CodFabricante
            LEFT JOIN Rota ON ISNULL(CRV.CodRota, C.CodRota) = Rota.CodRota
            LEFT JOIN NaturezaOperacao ON PedidoVenda.CodNaturezaOperacao = NaturezaOperacao.CodNaturezaOperacao
            LEFT JOIN Grupo ON Material.CodGrupo = Grupo.CodGrupo
            WHERE
              C.Ativo = 1
              AND Material.EmbRetornavel = 0
              AND NaturezaOperacao.Venda = 1
              AND PedidoVenda.Status = 0
              AND PedidoVenda.UnidGestora IN (select UnidGestora from unidadegestora)
              AND (PedidoVenda.DataVenda >= @P1) AND (PedidoVenda.DataVenda < @P2)
              AND Rota.CodAreaVenda = AreaVenda.CodAreaVenda
              AND PedidoVenda.CodVendedor = Funcionario.CodFuncionario
              AND C.CodSegmento = Segmento.CodSegmento
          ) AS QtdPedido,

          ( SELECT COUNT(DISTINCT Cliente.CodCliente)
            FROM Rota, PedidoVenda, PedidoVendaItens, Material, Grupo, Fabricante, NaturezaOperacao, Cliente
            LEFT JOIN ClienteDiaSemana ON ClienteDiaSemana.CodCliente = Cliente.CodCliente
            WHERE
              Rota.CodAreaVenda = AreaVenda.CodAreaVenda
              AND Cliente.CodCliente = PedidoVenda.CodCliente
              AND Cliente.Ativo = 1
              AND PedidoVenda.CodPedidoVenda = PedidoVendaItens.CodPedidoVenda
              AND PedidoVendaItens.CodMaterial = Material.CodMaterial
              AND Material.CodFabricante = Fabricante.CodFabricante
              AND ((Cliente.CodRota = Rota.CodRota) OR (ClienteDiaSemana.CodRota = Rota.CodRota))
              AND Material.EmbRetornavel = 0
              AND Material.CodGrupo = Grupo.CodGrupo
              AND Cliente.CodSegmento = Segmento.CodSegmento
              AND PedidoVenda.UnidGestora IN (select UnidGestora from unidadegestora)
              AND PedidoVenda.CodNaturezaOperacao = NaturezaOperacao.CodNaturezaOperacao
              AND NaturezaOperacao.Venda = 1
              AND (PedidoVenda.DataVenda >= @P1) AND (PedidoVenda.DataVenda < @P2)
          ) AS QtdClientePedido,

          ( SELECT COUNT(DISTINCT Cliente.CodCliente)
            FROM Rota, PocketVisita, Cliente
            LEFT JOIN ClienteDiaSemana ON ClienteDiaSemana.CodCliente = Cliente.CodCliente
            WHERE
              Rota.CodAreaVenda = AreaVenda.CodAreaVenda
              AND Cliente.CodCliente = PocketVisita.CodCliente
              AND Cliente.Ativo = 1
              AND ((Cliente.CodRota = Rota.CodRota) OR (ClienteDiaSemana.CodRota = Rota.CodRota))
              AND Cliente.ECliente = 1
              AND (PocketVisita.Data >= @P1) AND (PocketVisita.Data < @P2)
              AND Cliente.CodSegmento = Segmento.CodSegmento
          ) AS QtdClienteVisita,

          ( SELECT COUNT(DISTINCT Cliente.CodCliente)
            FROM Rota, PocketVisita, Cliente
            LEFT JOIN ClienteDiaSemana ON ClienteDiaSemana.CodCliente = Cliente.CodCliente
            WHERE
              Rota.CodAreaVenda = AreaVenda.CodAreaVenda
              AND Cliente.CodCliente = PocketVisita.CodCliente
              AND Cliente.Ativo = 1
              AND Cliente.ECliente = 1
              AND Cliente.CodSegmento = Segmento.CodSegmento
              AND ((Cliente.CodRota = Rota.CodRota) OR (ClienteDiaSemana.CodRota = Rota.CodRota))
              AND (PocketVisita.Data >= @P1) AND (PocketVisita.Data < @P2)
              AND PocketVisita.QtdPedidos > 0
          ) AS QtdClienteVisitaPositivada

        FROM Funcionario, AreaVenda, Segmento
        WHERE
          Funcionario.CodFuncionario = AreaVenda.CodVendedor
          AND Funcionario.UnidGestora IN (SELECT UnidGestora FROM UserUsuarioUnidade WHERE ID = 'ESIGMA')
          {vend_filter_sql}
        ORDER BY AreaVenda.AreaVenda, Funcionario.Funcionario, Segmento.Segmento;
    """
    return query_all(sql)

def buscar_mix_agregado(
    data_inicio: str | date,
    data_fim: str | date,
    cod_vendedores: Optional[Iterable[int]] = None
) -> int:
    """
    Calcula o Mix (Quantidade de SKUs distintos positivados) de forma AGREGADA
    para um conjunto de vendedores.
    """
    di, df = _validar_data(data_inicio), _validar_data(data_fim)
    p1, p2 = _dt_bounds(di, df)

    vend_filter_sql = ""
    if cod_vendedores:
        v = [int(x) for x in cod_vendedores if x is not None]
        v = list(dict.fromkeys(v))
        if v:
            vend_filter_sql = f" AND PV.CodVendedor IN ({','.join(map(str, v))}) "

    sql = f"""
        DECLARE @P1 datetime2 = '{p1:%Y-%m-%d %H:%M:%S}';
        DECLARE @P2 datetime2 = '{p2:%Y-%m-%d %H:%M:%S}';

        SELECT COUNT(DISTINCT PVI.CodMaterial) as MixAgregado
        FROM PedidoVendaItens PVI
        INNER JOIN PedidoVenda PV ON PV.CodPedidoVenda = PVI.CodPedidoVenda
        INNER JOIN NaturezaOperacao NOP ON PV.CodNaturezaOperacao = NOP.CodNaturezaOperacao
        INNER JOIN Material M ON PVI.CodMaterial = M.CodMaterial
        WHERE PV.Status = 0
          AND (NOP.Venda = 1 OR NOP.Bonificacao = 1) -- Ajuste Bonificação
          AND PV.UnidGestora IN (select UnidGestora from unidadegestora)
          AND PV.DataVenda >= @P1
          AND PV.DataVenda < @P2
          AND M.EmbRetornavel = 0
          {vend_filter_sql}
    """
    rows = query_all(sql)
    if rows and rows[0].get("MixAgregado"):
        return int(rows[0]["MixAgregado"])
    return 0


def buscar_comissoes_vendedor(cod_vendedor: int, data_inicio: str = None, data_fim: str = None) -> Dict[str, Any]:
    """
    Retorna todas as vendas comissionáveis do vendedor no período informado,
    calculando a comissão com base no percentual do pedido aplicado ao valor líquido.
 
    Filtros aplicados:
        - NO.Comissionar = 1  (natureza de operação comissionável)
        - NO.Venda       = 1  (é uma venda)
        - M.EmbRetornavel = 0 (exclui embalagens retornáveis)
        - PV.Status      = 0  (pedido ativo)
        - PV.Situacao <> 'A'  (não anulado)
        - CodVendedor    = cod_vendedor
        - DataVenda no período informado
 
    Retorno:
    {
        "total_comissao":      float,   # soma calculada (ValorPedido * ComissaoPercentual / 100)
        "total_valor_pedidos": float,   # soma do valor líquido dos pedidos
        "detalhado": [
            {
                "CodPedidoVenda":         int,
                "NumPedidoVenda":         str,
                "DataVenda":              str (YYYY-MM-DD),
                "Cliente":                str,
                "Rota":                   str,
                "Cidade":                 str,
                "NaturezaOperacao":       str,
                "SituacaoPagamento":      str,
                "ComissaoPercentual":     float,
                "ComissaoValor":          float,  # calculado: ValorPedido * ComissaoPercentual / 100
                "ValorPedido":            float,  # valor líquido do pedido
            },
            ...
        ]
    }
    """
    if not data_inicio or not data_fim:
        raise ValueError("data_inicio e data_fim são obrigatórios.")
 
    ini     = datetime.strptime(data_inicio, "%Y-%m-%d").date()
    fim_excl = datetime.strptime(data_fim, "%Y-%m-%d").date() + timedelta(days=1)
    p_ini   = ini.strftime("%Y%m%d")
    p_fim   = fim_excl.strftime("%Y%m%d")
    p_vend  = int(cod_vendedor)
 
    sql = """
        SELECT
            PV.CodPedidoVenda,
            PV.NumPedidoVenda,
            CONVERT(VARCHAR(10), PV.DataVenda, 120)                                          AS DataVenda,
            C.Cliente,
            R.Rota,
            Cidade.Cidade,
            NO.NaturezaOperacao,
            PV.SituacaoPagamento,
            PV.ComissaoPercentual,
            SUM(ROUND(100 * PVI.Quantidade * (PVI.ValorEmbalagem - PVI.Desconto), 0)) / 100 AS ValorPedido
        FROM PedidoVenda PV
        INNER JOIN NaturezaOperacao NO  ON PV.CodNaturezaOperacao = NO.CodNaturezaOperacao
        INNER JOIN PedidoVendaItens  PVI ON PV.CodPedidoVenda     = PVI.CodPedidoVenda
        INNER JOIN Cliente           C   ON PV.CodCliente          = C.CodCliente
        INNER JOIN Rota              R   ON C.CodRota              = R.CodRota
        INNER JOIN Cidade                ON C.CodCidade            = Cidade.CodCidade
        INNER JOIN Funcionario       F   ON PV.CodVendedor         = F.CodFuncionario
        INNER JOIN Material          M   ON PVI.CodMaterial        = M.CodMaterial
        INNER JOIN MaterialComissao  MC  ON M.CodMaterial          = MC.CodMaterial
        INNER JOIN TabelaPreco       TP  ON PVI.CodTabelaPreco     = TP.CodTabelaPreco
        INNER JOIN Classificador     CL  ON PVI.CodTipo            = CL.CodClassificador
        WHERE
            NO.Comissionar   = 1
            AND NO.Venda     = 1
            AND M.EmbRetornavel = 0
            AND PV.Status    = 0
            AND PV.Situacao <> 'A'
            AND PV.CodVendedor = ?
            AND PV.DataVenda  >= ?
            AND PV.DataVenda   < ?
        GROUP BY
            PV.CodPedidoVenda, PV.NumPedidoVenda, PV.DataVenda,
            C.Cliente, R.Rota, Cidade.Cidade, NO.NaturezaOperacao,
            PV.SituacaoPagamento, PV.ComissaoPercentual
        ORDER BY
            PV.DataVenda DESC, C.Cliente, PV.CodPedidoVenda
    """
 
    params = [p_vend, p_ini, p_fim]
    rows   = query_all(sql, params)
 
    detalhado           = []
    total_comissao      = 0.0
    total_valor_pedidos = 0.0
 
    for r in rows:
        valor    = float(r.get("ValorPedido")       or 0)
        perc     = float(r.get("ComissaoPercentual") or 0)
        comissao = round(valor * perc / 100, 2)   # calcula em vez de usar campo armazenado
 
        total_comissao      += comissao
        total_valor_pedidos += valor
 
        detalhado.append({
            "CodPedidoVenda":     int(r.get("CodPedidoVenda") or 0),
            "NumPedidoVenda":     str(r.get("NumPedidoVenda") or ""),
            "DataVenda":          str(r.get("DataVenda") or ""),
            "Cliente":            str(r.get("Cliente") or ""),
            "Rota":               str(r.get("Rota") or ""),
            "Cidade":             str(r.get("Cidade") or ""),
            "NaturezaOperacao":   str(r.get("NaturezaOperacao") or ""),
            "SituacaoPagamento":  str(r.get("SituacaoPagamento") or ""),
            "ComissaoPercentual": perc,
            "ComissaoValor":      comissao,
            "ValorPedido":        round(valor, 2),
        })
 
    return {
        "total_comissao":      round(total_comissao, 2),
        "total_valor_pedidos": round(total_valor_pedidos, 2),
        "detalhado":           detalhado,
    }