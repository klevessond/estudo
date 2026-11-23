/**
 * Clientes por segmento: tamanho da carteira e quanto dela comprou.
 * Substitui as 3 pizzas do web (clientes, positivações e % de positivação por
 * segmento): barras numa mesma base comparam melhor, e cabem na tela do celular.
 */
export function linhasDeSegmentos(graficos) {
  const totalClientes = Number(graficos?.totais?.clientes) || 0;
  return (graficos?.segmentos_taxa_positivacao || [])
    .map((r) => {
      const clientes = Number(r.QtdCliente) || 0;
      const positivados = Number(r.QtdClientePedido) || 0;
      return {
        segmento: r.Segmento || 'Sem segmento',
        clientes,
        positivados,
        taxa: Number(r.PercTaxaPositivacao) || (clientes ? (positivados / clientes) * 100 : 0),
        fatia: totalClientes ? (clientes / totalClientes) * 100 : 0,
      };
    })
    .sort((a, b) => b.clientes - a.clientes);
}
