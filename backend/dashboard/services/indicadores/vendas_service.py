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
        return [dict(zip(columns, row)) for row in rows]
