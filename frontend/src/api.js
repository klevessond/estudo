import axios from 'axios';
import { createBrowserHistory } from 'history';

const history = createBrowserHistory();

const api = axios.create({
  baseURL: 'http://localhost:8000',
});

// Adiciona token automaticamente
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Se token inválido, redireciona para login
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      history.push('/login');
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

export default api;
