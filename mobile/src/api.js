import axios from 'axios';
import { storage } from './lib/storage';

// Defina no arquivo .env do projeto Expo:
//   EXPO_PUBLIC_API_URL=http://192.168.0.10:8002/api        (desenvolvimento, mesma rede Wi-Fi)
//   EXPO_PUBLIC_API_URL=https://app.comercialdotrigo.com.br/api   (produção)
export const API_URL = (process.env.EXPO_PUBLIC_API_URL || '').replace(/\/$/, '');

const api = axios.create({
  baseURL: API_URL,
  timeout: 120000,
  headers: { 'Content-Type': 'application/json' },
});

let aoPerderSessao = () => {};
export function definirAoPerderSessao(fn) {
  aoPerderSessao = fn;
}

api.interceptors.request.use(async (config) => {
  const token = await storage.get('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Várias requisições podem receber 401 ao mesmo tempo; todas esperam o mesmo refresh.
let refreshEmAndamento = null;

async function renovarToken() {
  const refresh = await storage.get('refresh');
  if (!refresh) throw new Error('sem refresh token');
  const { data } = await axios.post(`${API_URL}/token/refresh/`, { refresh }, { timeout: 20000 });
  await storage.set('token', data.access);
  if (data.refresh) await storage.set('refresh', data.refresh); // ROTATE_REFRESH_TOKENS
  return data.access;
}

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    const status = err?.response?.status;
    const rotaDeToken = String(original?.url || '').includes('/token/');

    if (status === 401 && original && !original._retry && !rotaDeToken) {
      original._retry = true;
      try {
        if (!refreshEmAndamento) {
          refreshEmAndamento = renovarToken().finally(() => {
            refreshEmAndamento = null;
          });
        }
        const novo = await refreshEmAndamento;
        original.headers.Authorization = `Bearer ${novo}`;
        return api(original);
      } catch {
        await storage.del('token');
        await storage.del('refresh');
        aoPerderSessao();
      }
    }
    return Promise.reject(err);
  }
);

export function mensagemDeErro(err) {
  if (err?.code === 'ECONNABORTED') return 'O servidor demorou demais para responder. Tente de novo.';
  if (!err?.response) return 'Sem conexão com o servidor. Verifique a internet.';
  const d = err.response.data;
  return d?.error || d?.detail || `Erro ${err.response.status} no servidor.`;
}

export default api;
