from django.db import connections

def buscar_objetivo_peso_positivacao(data_inicio, data_fim,cod_vendedores=None):

    vendedor_filter_sql = ""
    if cod_vendedores:
        cod_vendedores = [int(x) for x in cod_vendedores if x is not None]
        cod_vendedores = list(dict.fromkeys(cod_vendedores))
        if cod_vendedores:
            vendedor_filter_sql = f" AND Codfuncionario IN ({','.join(map(str, cod_vendedores))}) "




    with connections['dados_industria'].cursor() as cursor:
        cursor.execute(f"""
            DECLARE @DataInicio DATE = '{data_inicio}';
            DECLARE @DataFim DATE = '{data_fim}';

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
                        O.Positivacao AS PositivacaoRota,
                        SUM(O.Valor) OVER(PARTITION BY V.CodFuncionario) AS ObjetivoTotalVendedor,
                        SUM(O.Positivacao) OVER(PARTITION BY V.CodFuncionario) AS PositivacaoTotalVendedor
                    FROM Vendedores V
                    INNER JOIN Rota R ON R.CodAreaVenda = V.CodAreaVenda
                    INNER JOIN ObjetivosFiltrados O ON O.CodRota = R.CodRota
                ),
                PositivacaoAgrupada AS (
                    SELECT 
                        CodFuncionario,
                        CodRota,
                        SUM(PositivacaoRota) AS PositivacaoRota
                    FROM ObjetivosCompletos 
                    where 1=1 
                     {vendedor_filter_sql}
                   
                    GROUP BY CodFuncionario, CodRota
                ),
                ObjetivoTotalEmpresa AS (
                    SELECT 
                        SUM(O.Valor) AS ObjetivoTotalEmpresaPeriodo,
                        SUM(O.Positivacao) AS PositivacaoTotalEmpresaPeriodo
                    FROM ObjetivoFinanceiro O
                    INNER JOIN Rota R ON O.CodRota = R.CodRota
                    INNER JOIN AreaVenda AV ON R.CodAreaVenda = AV.CodAreaVenda
                    INNER JOIN Funcionario F ON F.CodFuncionario = AV.CodVendedor
                    WHERE F.Vendedor = 1
                    AND O.DataDe >= @DataInicio AND O.DataAte <= @DataFim
                     {vendedor_filter_sql}
                    
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
                    PA.PositivacaoRota, -- soma por funcionário + rota
                    OC.ObjetivoTotalVendedor,
                    OC.PositivacaoTotalVendedor,
                    OTE.ObjetivoTotalEmpresaPeriodo,
                    OTE.PositivacaoTotalEmpresaPeriodo
                FROM ObjetivosCompletos OC
                INNER JOIN PositivacaoAgrupada PA 
                    ON OC.CodFuncionario = PA.CodFuncionario 
                    AND OC.CodRota = PA.CodRota
                CROSS JOIN ObjetivoTotalEmpresa OTE
                ORDER BY OC.Funcionario, OC.Rota;
        """)
        columns = [col[0] for col in cursor.description]
        rows = cursor.fetchall()
        dados = [dict(zip(columns, row)) for row in rows]

        # Pegamos o objetivo total da empresa de forma isolada
        objetivo_peso = dados[0]['ObjetivoTotalEmpresaPeriodo'] if dados else 0
        objetivo_positivacao = dados[0]['PositivacaoTotalEmpresaPeriodo'] if dados else 0

        return {
            "objetivo_peso": objetivo_peso,
            "objetivo_positivacao": objetivo_positivacao,
            "detalhamento": dados
        }
