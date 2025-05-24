from django.db import connections

def buscar_objetivo_peso():
    with connections['dados_industria'].cursor() as cursor:
        cursor.execute("""
            DECLARE @DataInicio DATE = '2025-01-01';
            DECLARE @DataFim DATE = '2025-01-31';

            WITH ObjetivosFiltrados AS (
                SELECT *
                FROM ObjetivoFinanceiro
                WHERE DataDe >= @DataInicio AND DataAte <= @DataFim
            ),
            Vendedores AS (
                SELECT 
                    F.CodFuncionario,
                    F.Funcionario,
                    AV.CodAreaVenda,
                    AV.AreaVenda
                FROM Funcionario F
                INNER JOIN AreaVenda AV ON F.CodFuncionario = AV.CodVendedor
                WHERE F.Vendedor = 1
            ),
            ObjetivosCompletos AS (
                SELECT 
                    V.CodFuncionario,
                    V.Funcionario,
                    V.CodAreaVenda,
                    V.AreaVenda,
                    R.CodRota,
                    R.Rota,
                    O.DataDe,
                    O.DataAte,
                    O.Valor AS ObjetivoRota,
                    SUM(O.Valor) OVER(PARTITION BY V.CodFuncionario) AS ObjetivoTotalVendedor
                FROM Vendedores V
                INNER JOIN Rota R ON R.CodAreaVenda = V.CodAreaVenda
                INNER JOIN ObjetivosFiltrados O ON O.CodRota = R.CodRota
            ),
            ObjetivoTotalEmpresa AS (
                SELECT SUM(O.Valor) AS ObjetivoTotalEmpresaPeriodo
                FROM ObjetivoFinanceiro O
                INNER JOIN Rota R ON O.CodRota = R.CodRota
                INNER JOIN AreaVenda AV ON R.CodAreaVenda = AV.CodAreaVenda
                INNER JOIN Funcionario F ON F.CodFuncionario = AV.CodVendedor
                WHERE F.Vendedor = 1
                AND O.DataDe >= @DataInicio AND O.DataAte <= @DataFim
            )

            SELECT 
                OC.CodFuncionario,
                OC.Funcionario,
                OC.CodAreaVenda,
                OC.AreaVenda,
                OC.CodRota,
                OC.Rota,
                OC.DataDe,
                OC.DataAte,
                OC.ObjetivoRota,
                OC.ObjetivoTotalVendedor,
                OTE.ObjetivoTotalEmpresaPeriodo
            FROM ObjetivosCompletos OC
            CROSS JOIN ObjetivoTotalEmpresa OTE
            ORDER BY OC.Funcionario, OC.Rota;
        """)
        columns = [col[0] for col in cursor.description]
        rows = cursor.fetchall()
        return [dict(zip(columns, row)) for row in rows]
