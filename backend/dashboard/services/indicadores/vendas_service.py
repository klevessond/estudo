from django.db import connections

def buscar_peso_vendido(data_inicio, data_fim):
    with connections['dados_industria'].cursor() as cursor:
        cursor.execute(f"""
            DECLARE @DataInicio DATE = '{data_inicio}';
            DECLARE @DataFim DATE = '{data_fim}';

            ;WITH Vendedores AS (
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
                    C.CodRota,
                    PVI.Quantidade,
                    PVI.QtdEmbalagem,
                    M.PesoBruto
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
            PesoPorClienteRota AS (
                SELECT
                    PF.CodCliente,
                    V.CodFuncionario,
                    V.Nome,
                    V.CodAreaVenda,
                    V.AreaVenda,
                    PF.CodRota,
                    R.Rota,
                    SUM(ISNULL(PF.Quantidade * PF.QtdEmbalagem * PF.PesoBruto, 0)) AS PesoDistribuidoRota
                FROM PedidosFiltrados PF
                INNER JOIN Vendedores V ON PF.CodVendedor = V.CodFuncionario
                INNER JOIN Rota R ON R.CodRota = PF.CodRota
                GROUP BY 
                    PF.CodCliente, V.CodFuncionario, V.Nome, V.CodAreaVenda, V.AreaVenda, PF.CodRota, R.Rota
            ),
            PesoPorRota AS (
                SELECT
                    CodFuncionario,
                    Nome,
                    CodAreaVenda,
                    AreaVenda,
                    CodRota,
                    Rota,
                    SUM(PesoDistribuidoRota) AS PesoVendidoRota
                FROM PesoPorClienteRota
                GROUP BY CodFuncionario, Nome, CodAreaVenda, AreaVenda, CodRota, Rota
            ),
            PesoPorArea AS (
                SELECT 
                    CodFuncionario,
                    Nome,
                    CodAreaVenda,
                    AreaVenda,
                    SUM(PesoVendidoRota) AS PesoVendidoArea
                FROM PesoPorRota
                GROUP BY CodFuncionario, Nome, CodAreaVenda, AreaVenda
            ),
            PesoTotalEmpresa AS (
                SELECT SUM(PesoVendidoArea) AS PesoVendidoTotal FROM PesoPorArea
            )

            SELECT 
                PR.CodFuncionario,
                PR.Nome,
                PR.CodAreaVenda,
                PR.AreaVenda,
                PR.CodRota,
                PR.Rota,
                PR.PesoVendidoRota,
                PA.PesoVendidoArea,
                PTE.PesoVendidoTotal
            FROM PesoPorRota PR
            INNER JOIN PesoPorArea PA ON PR.CodAreaVenda = PA.CodAreaVenda
            CROSS JOIN PesoTotalEmpresa PTE
            ORDER BY PR.CodFuncionario, PR.CodRota;
        """)
        columns = [col[0] for col in cursor.description]
        rows = cursor.fetchall()
        dados = [dict(zip(columns, row)) for row in rows]

        # O total está em PTE.PesoVendidoTotal - vamos pegar do primeiro registro (se existir)
        peso_realizado = dados[0]['PesoVendidoTotal'] if dados else 0

        return {
            "peso_realizado": peso_realizado,
            "detalhamento": dados
        }
