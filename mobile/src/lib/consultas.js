// Endpoints dos detalhamentos. São os mesmos que o dashboard web usa
// (frontend/src/services/indicadoresApi.js), com os mesmos parâmetros.
import api from '../api';

const csv = (cods) => (cods || []).filter((c) => c != null && c !== '').join(',');

export const consultas = {
  mixItens: ({ de, ate, vendedores, modo, criterio }) =>
    api.get('/indicadores/mix-itens-area/', {
      params: { de, ate, vendedores: csv(vendedores), modo, criterio, ordem: 'top' },
    }),

  clientes: ({ de, ate, vendedores, positivados }) =>
    api.get('/indicadores/clientes-positivacao-area/', {
      params: { de, ate, vendedores: csv(vendedores), positivados: positivados ? 'true' : 'false' },
    }),

  rupturaItens: ({ de, ate, vendedores, criterio }) =>
    api.get('/indicadores/ruptura-itens/', { params: { de, ate, vendedores: csv(vendedores), criterio } }),

  // Sem "vendedores" o backend usa o escopo do usuário logado.
  preVendaStatus: ({ de, ate, vendedores }) =>
    api.get('/indicadores/pre-venda-status/', {
      params: vendedores?.length ? { de, ate, vendedores: csv(vendedores) } : { de, ate },
    }),

  preVendaItens: ({ codPocket, codDoc }) =>
    api.get('/indicadores/pre-venda-itens/', { params: { cod_pocket: codPocket, cod_doc: codDoc } }),

  segmentos: ({ de, ate, vendedores }) =>
    api.get('/resumo-segmento-area-venda/', { params: { de, ate, cod_funcionarios: csv(vendedores) } }),

  comissoes: ({ de, ate, cod }) => api.get('/comissoes-vendedor/', { params: { cod_vendedor: cod, de, ate } }),
};

export { csv };
