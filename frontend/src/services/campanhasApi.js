// Endpoints de campanhas de venda.
import api from '../api.js';

export const getPainelCampanhas = () => api.get('/campanhas/painel/');
export const listarCampanhas = () => api.get('/campanhas/');
export const criarCampanha = (payload) => api.post('/campanhas/', payload);
export const atualizarCampanha = (id, payload) => api.patch(`/campanhas/${id}/`, payload);
export const getProgressoCampanha = (id) => api.get(`/campanhas/${id}/progresso/`);
export const salvarObjetivoCampanha = (payload) => api.post('/campanhas-objetivos/', payload);
export const excluirObjetivoCampanha = (id) => api.delete(`/campanhas-objetivos/${id}/`);
// Busca nos catálogos do ERP (fabricantes/grupos/materiais) — endpoint variável.
export const buscarCatalogo = (endpoint, config) => api.get(endpoint, config);
