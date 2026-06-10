# backend/dashboard/services/indicadores/pivot_service.py
from typing import List, Dict, Any
from dashboard.db_conn import query_all

def buscar_dump_vendas(data_inicio: str, data_fim: str) -> List[Dict[str, Any]]:
    # Query limpa sem GROUP BY para pivotagem no front-end
    sql = f"""
        SELECT 
            PV.DataVenda,
            F.Funcionario AS Vendedor,
            C.Cliente,
            R.Rota,
            G.Grupo,
            M.Material,
            PVI.Quantidade,
            PVI.ValorEmbalagem,
            (PVI.Quantidade * PVI.ValorEmbalagem) AS ValorBruto,
            dbo.Round2(PVI.DescontoRef + (PVI.Desconto * PVI.Quantidade)) AS Desconto,
            (PVI.Quantidade * PVI.ValorEmbalagem) - dbo.Round2(PVI.DescontoRef + (PVI.Desconto * PVI.Quantidade)) AS ValorLiquido
        FROM PedidoVenda PV
        INNER JOIN PedidoVendaItens PVI ON PV.CodPedidoVenda = PVI.CodPedidoVenda
        INNER JOIN Material M ON PVI.CodMaterial = M.CodMaterial
        INNER JOIN Grupo G ON M.CodGrupo = G.CodGrupo
        INNER JOIN Cliente C ON PV.CodCliente = C.CodCliente
        INNER JOIN Funcionario F ON PV.CodVendedor = F.CodFuncionario
        LEFT JOIN ClienteRotaVendedor CRV ON PV.CodVendedor = CRV.CodVendedor AND PV.CodCliente = CRV.CodCliente
        LEFT JOIN Rota R ON ISNULL(CRV.CodRota, C.CodRota) = R.CodRota
        WHERE PV.Status = 0
        AND PV.DataVenda >= '{data_inicio}'
        AND PV.DataVenda < '{data_fim}'
    """
    return query_all(sql)