# backend/dashboard/services/indicadores/pdv_service.py
from django.db import connections

def buscar_vendas_pdv(data_inicio, data_fim):
  with connections['dados_industria'].cursor() as cursor:
        cursor.execute(f"""
            DECLARE @P1 datetime2 = '{data_inicio}';
            DECLARE @P2 datetime2 = '{data_fim}';

            SELECT
              SUM(ViewVendaItens.quantidade * ViewVendaItens.qtdembalagem) AS Qtd,
              CAST(SUM(dbo.Round2(ViewVendaItens.quantidade * ViewVendaItens.qtdembalagem / Material.QtdVolume)) AS INT) AS QtdEmbalagem,
              SUM(dbo.Round2(ViewVendaItens.quantidade * ViewVendaItens.ValorEmbalagem)) AS ValorProdutos,
              SUM(ViewVendaItens.Quantidade * ViewVendaItens.QtdEmbalagem * Material.PesoBruto) AS Peso
            FROM ViewVenda
              LEFT JOIN ViewVendaItens ON (
                  ViewVenda.CodPedidoVenda = ViewVendaItens.CodPedidoVenda
                  AND ViewVenda.ECFSerial = ViewVendaItens.ECFSerial
                  AND ViewVenda.CodCupom = ViewVendaItens.CodCupom
              )
              LEFT JOIN Material ON ViewVendaItens.CodMaterial = Material.CodMaterial
              LEFT JOIN NaturezaOperacao ON ViewVenda.CodNaturezaOperacao = NaturezaOperacao.CodNaturezaOperacao
            WHERE
              Material.EmbRetornavel = 0
              AND NaturezaOperacao.Venda = 1
              AND ViewVenda.Status = 0
              AND ViewVenda.CodPedidoVenda = 0 -- PDV: não é pedido (NFC-e)
              AND ViewVenda.UnidGestora IN (1, 2, 3, 4, 5, 6, 8, 9, 10)
              AND ViewVenda.DataVenda >= @P1
              AND ViewVenda.DataVenda < @P2
        """)

        columns = [col[0] for col in cursor.description]
        rows = cursor.fetchall()
        dados = [dict(zip(columns, row)) for row in rows]

        valor_total = sum(r.get("ValorProdutos", 0) or 0 for r in dados)
        peso_total = sum(r.get("Peso", 0) or 0 for r in dados)

        return {
            "valor_pdv": valor_total,
            "peso_pdv": peso_total
        }