// Endpoints de cadastros: usuários, funcionários, feriados, objetivos e cache.
import api from '../api.js';

export const getFuncionarios = (config) => api.get('/funcionarios/', config);
export const getFuncionario = (codFuncionario) => api.get(`/funcionarios/${codFuncionario}/`);
export const getUsuario = (id) => api.get(`/usuario/${id}/`);
export const atualizarUsuario = (id, payload) => api.put(`/usuario/${id}/`, payload);
export const registrarUsuario = (payload) => api.post('/register/', payload);
export const getTodosVendedores = (config) => api.get('/todos-vendedores/', config);
export const listarFeriados = () => api.get('/feriados/');
export const criarFeriado = (payload) => api.post('/feriados/', payload);
export const excluirFeriado = (id) => api.delete(`/feriados/${id}/`);
export const getObjetivosVendedores = (config) => api.get('/objetivos-vendedores/', config);
export const salvarObjetivosVendedores = (payload) => api.post('/objetivos-vendedores/', payload);
export const getObjetivosMixNivel = (config) => api.get('/objetivos-mix-nivel/', config);
export const salvarObjetivoMixNivel = (payload) => api.post('/objetivos-mix-nivel/', payload);
export const getCacheMesAdmin = () => api.get('/admin/cache-mes/');
export const limparCacheMesAdmin = (query) => api.delete(`/admin/cache-mes/?${query}`);
