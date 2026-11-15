// Autenticação (JWT).
import api from '../api.js';

export const postLogin = (credentials) => api.post('/token/', credentials, { withCredentials: true });
export const getMe = () => api.get('/me/', { withCredentials: true });
