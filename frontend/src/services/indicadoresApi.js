// Endpoints de indicadores/dashboard — camada fina sobre o axios.
// Cada função repassa o config do axios ({ params: ... }) sem alteração.
import api from '../api.js';

export const getIndicadores = (config) => api.get('/Indicadores/', config);
export const getVendaHoje = () => api.get('/indicadores/venda-hoje/');
export const getPdv = (config) => api.get('/indicadores/pdv/', config);
export const getPdvPorVendedor = (config) => api.get('/indicadores/pdv-por-vendedor/', config);
export const getMinhaUg = () => api.get('/indicadores/minha-ug/');
export const getPreVendaStatus = (config) => api.get('/indicadores/pre-venda-status/', config);
export const getPreVendaItens = (config) => api.get('/indicadores/pre-venda-itens/', config);
export const getRupturaItens = (config) => api.get('/indicadores/ruptura-itens/', config);
export const getMixItens = (config) => api.get('/indicadores/mix-itens/', config);
export const getMixItensArea = (config) => api.get('/indicadores/mix-itens-area/', config);
export const getClientesPositivacao = (config) => api.get('/indicadores/clientes-positivacao/', config);
export const getClientesPositivacaoArea = (config) => api.get('/indicadores/clientes-positivacao-area/', config);
export const getComissoesVendedor = (config) => api.get('/comissoes-vendedor/', config);
export const getResumoSegmentoAreaVenda = (config) => api.get('/resumo-segmento-area-venda/', config);
export const getVendasPorVendedor = ({ de, ate }) => api.get(`/vendas-por-vendedor/?de=${de}&ate=${ate}`);
export const getPivotVendas = ({ de, ate }) => api.get(`/indicadores/pivot-vendas/?de=${de}&ate=${ate}`);
