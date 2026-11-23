// Endpoints de vínculo do Telegram.
import api from '../api.js';

export const getStatusTelegram = () => api.get('/telegram/status/');
export const gerarCodigoTelegram = () => api.post('/telegram/gerar-codigo/');
export const desvincularTelegram = () => api.post('/telegram/desvincular/');
