# dashboard/services/indicadores/ruptura_service.py
from django.db import connections
from datetime import datetime, timedelta, date
from collections import defaultdict

def _validar_data(data):
    if isinstance(data, date):
        return data
    return datetime.strptime(data, "%Y-%m-%d").date()

def buscar_ruptura(data_inicio: str, data_fim: str, cod_vendedor: int | None = None):
    """
    Executa a consulta de 'ruptura' (itens não atendidos) para o período informado.
    - data_inicio / data_fim: 'YYYY-MM-DD'
    - cod_vendedor: opcional. Quando presente, aplica AND PD.CodVendedor = <cod_vendedor>
    Retorna: dict com:
        - detalhes: lista[dict] das linhas do SELECT
        - resumo: lista[dict] agregada por CodVendedor com soma de ValorEmbalagem1
    """

    di = _validar_data(data_inicio)
    df = _validar_data(data_fim) + timedelta(days=1)
    vend_filter_sql = ""
    if cod_vendedor is not None and str(cod_vendedor).strip() != "":
        try:
            vend = int(cod_vendedor)
            vend_filter_sql = f" AND PD.CodVendedor = {vend} "
        except ValueError:
            pass

    with connections["dados_industria"].cursor() as cursor:
        cursor.execute(f"""
            DECLARE @P1 DATE = '{di}';
            DECLARE @P2 DATE = '{df}';

            SELECT
              CAST(0 AS bit) AS Checked,
              PD.DataDoc,
              TipoDocumento.CodNaturezaOperacao,
              N.Titulo AS Operacao,
              C.CodCliente, C.Cliente, C.ClienteFantasia,
              M.CodMaterial, M.Material, E.Embalagem,
              PDI.Qtd1 AS Quantidade,
              PDI.Qtd1 * PDI.ValorEmbalagem1 AS Valor,
              PDI.Qtd1 * PDI.Desconto1 AS Desconto,
              PD.CodtabelaPreco, TabelaPreco.Descricao,
              PDI.Reemitido, PD.CodPocket, PD.UnidGestora, PD.CodTipoDoc,
              PD.CodFormaReceb, PD.CodMapaEvento, PDI.CodTipo AS CodTipoItem,
              PD.CodVendedor, PD.CodVisita, PD.NotaFiscal, PD.Observacao, PD.ObservacaoNFe,
              PD.PDV, PD.CodDoc, PDI.Sequencia, Funcionario.Funcionario,
              PDI.Desconto1, PDI.ValorEmbalagem1, PDI.CodEmbalagem1,
              PDI.CodTabelaPreco AS CodTabelaPrecoItem,
              UnidadeGestora.Unidade AS UnidadeGestora,
              FormaReceb.FormaReceb
            FROM
              Pocket P,
              PocketDocumento PD,
              Cliente C,
              PocketDocumentoItens PDI,
              Material M,
              Grupo G,
              Embalagem E,
              TipoDocumento,
              NaturezaOperacao N,
              TabelaPreco,
              UnidadeGestora,
              FormaReceb,
              Funcionario
            WHERE
              P.CodPocket = PD.CodPocket
              AND PD.CodPocket = PDI.CodPocket
              AND PD.CodDoc = PDI.CodDoc
              AND PD.CodCliente = C.CodCliente
              AND PDI.CodMaterial1 = M.CodMaterial
              AND M.CodGrupo = G.CodGrupo
              AND PDI.CodEmbalagem1 = E.CodEmbalagem
              AND PD.CodTipoDoc = TipoDocumento.CodTipoDoc
              AND TipoDocumento.CodNaturezaOperacao = N.CodNaturezaOperacao
              AND PD.CodTabelaPreco = TabelaPreco.CodTabelaPreco
              AND PDI.Status IN (20) -- Item não atendido
              AND UnidadeGestora.UnidGestora = PD.UnidGestora
              AND FormaReceb.CodFormaReceb = PD.CodFormaReceb
              AND PD.CodVendedor = Funcionario.CodFuncionario
              AND PD.DataDoc >= @P1
              AND PD.DataDoc <  @P2
              {vend_filter_sql}
              AND PD.UnidGestora IN (
                SELECT UnidGestora FROM UserUsuarioUnidade WHERE ID = 'ESIGMA'
              )
            ORDER BY PD.DataDoc, C.CodCliente, C.Cliente;
        """)
        columns = [col[0] for col in cursor.description]
        rows = cursor.fetchall()
        detalhes = [dict(zip(columns, row)) for row in rows]

        # --- novo cálculo agregado por vendedor ---
        resumo_dict = defaultdict(float)
        for row in detalhes:
            cod_vend = row.get("CodVendedor")
            valor = float(row.get("Valor") or 0)
            resumo_dict[cod_vend] += valor

        resumo = [{"CodVendedor": k, "TotalValor": v} for k, v in resumo_dict.items()]

        return {"detalhes": detalhes, "resumo": resumo}
