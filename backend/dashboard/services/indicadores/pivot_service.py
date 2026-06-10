# backend/dashboard/services/indicadores/pivot_service.py
from __future__ import annotations

from datetime import datetime, timedelta, date
from typing import List, Dict, Any

from dashboard.db_conn import query_all


def _validar_data(data: str | date) -> date:
    if isinstance(data, date):
        return data
    return datetime.strptime(str(data), "%Y-%m-%d").date()


def buscar_dump_vendas(data_inicio: str | date, data_fim: str | date) -> List[Dict[str, Any]]:
    """
    Retorna linhas detalhadas de vendas (sem GROUP BY) para pivotagem no front-end.

    Filtros de negócio aplicados (mesmos da buscar_vendas_por_vendedor):
      - PV.Status = 0
      - NaturezaOperacao.Venda = 1
      - Material.EmbRetornavel = 0
      - UnidGestora restrita ao ESIGMA
      - data_fim + 1 dia (intervalo exclusivo à direita)
    """
    di = _validar_data(data_inicio)
    df = _validar_data(data_fim) + timedelta(days=1)   # ← intervalo exclusivo

    sql = f"""
        DECLARE @P1 DATE = '{di:%Y-%m-%d}';
        DECLARE @P2 DATE = '{df:%Y-%m-%d}';

        SELECT
            CONVERT(VARCHAR(10), PV.DataVenda, 120)  AS DataVenda,
            F.Funcionario                             AS Vendedor,
            C.Cliente,
            C.ClienteFantasia,
            ISNULL(R.Rota, 'Sem Rota')               AS Rota,
            G.Grupo,
            M.Material,
            CAST(PVI.Quantidade AS FLOAT)             AS Quantidade,
            CAST(PVI.QtdEmbalagem AS FLOAT)           AS QtdEmbalagem,
            CAST(PVI.ValorEmbalagem AS FLOAT)         AS ValorEmbalagem,
            CAST(
                PVI.Quantidade * PVI.ValorEmbalagem
            AS FLOAT)                                 AS ValorBruto,
            CAST(
                dbo.Round2(PVI.DescontoRef + (PVI.Desconto * PVI.Quantidade))
            AS FLOAT)                                 AS Desconto,
            CAST(
                (PVI.Quantidade * PVI.ValorEmbalagem)
                - dbo.Round2(PVI.DescontoRef + (PVI.Desconto * PVI.Quantidade))
            AS FLOAT)                                 AS ValorLiquido,
            PV.UnidGestora,
            S.Segmento

        FROM PedidoVenda PV
        INNER JOIN PedidoVendaItens   PVI  ON PV.CodPedidoVenda  = PVI.CodPedidoVenda
        INNER JOIN Material           M    ON PVI.CodMaterial     = M.CodMaterial
        INNER JOIN Grupo              G    ON M.CodGrupo          = G.CodGrupo
        INNER JOIN Cliente            C    ON PV.CodCliente       = C.CodCliente
        INNER JOIN Funcionario        F    ON PV.CodVendedor      = F.CodFuncionario
        INNER JOIN NaturezaOperacao   NO   ON PV.CodNaturezaOperacao = NO.CodNaturezaOperacao
        LEFT  JOIN ClienteRotaVendedor CRV ON PV.CodVendedor = CRV.CodVendedor
                                          AND PV.CodCliente  = CRV.CodCliente
        LEFT  JOIN Rota               R    ON ISNULL(CRV.CodRota, C.CodRota) = R.CodRota
        LEFT  JOIN Segmento           S    ON C.CodSegmento  = S.CodSegmento

        WHERE PV.Status           = 0
          AND NO.Venda            = 1
          AND M.EmbRetornavel     = 0
          AND PV.UnidGestora IN (
              SELECT UnidGestora FROM UserUsuarioUnidade WHERE ID = 'ESIGMA'
          )
          AND PV.DataVenda >= @P1
          AND PV.DataVenda  < @P2

        ORDER BY PV.DataVenda, F.Funcionario, C.Cliente, M.Material
    """
    return query_all(sql)