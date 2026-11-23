import axios from "axios";

const isProd = process.env.NODE_ENV === "production";

const envBase =
  process.env.REACT_APP_API_URL &&
  process.env.REACT_APP_API_URL.replace(/\/$/, "");

const baseURL =
  envBase ||
  (isProd ? `${window.location.origin}/api` : `http://127.0.0.1:8002`);

const api = axios.create({
  baseURL,
  timeout: 60000,
  headers: { "Content-Type": "application/json" },
});

if (!isProd) console.log("[API] baseURL =", baseURL);

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ===== Renovação transparente do access token (JWT refresh) =====
// O access dura 3h (SIMPLE_JWT). Quando expira no meio do uso, em vez de
// derrubar o usuário para o /login (perdendo formulários abertos), tentamos
// uma única vez renovar com o refresh token e repetir a requisição original.
let renovacaoEmAndamento = null;

async function renovarAccessToken() {
  const refresh = localStorage.getItem("refresh");
  if (!refresh) throw new Error("sem refresh token");
  // axios puro: não passa pelos interceptors desta instância
  const { data } = await axios.post(
    `${baseURL}/token/refresh/`,
    { refresh },
    { headers: { "Content-Type": "application/json" }, timeout: 15000 }
  );
  localStorage.setItem("token", data.access);
  return data.access;
}

function limparSessaoERedirecionar() {
  localStorage.removeItem("token");
  localStorage.removeItem("refresh");
  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
}

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err?.config;
    const status = err?.response?.status;
    const rotaDeToken = String(original?.url || "").includes("/token/");

    if (status === 401 && original && !original._jaRenovou && !rotaDeToken) {
      original._jaRenovou = true;
      try {
        // Várias requisições com 401 simultâneo compartilham a mesma renovação
        renovacaoEmAndamento = renovacaoEmAndamento || renovarAccessToken();
        const novoAccess = await renovacaoEmAndamento;
        renovacaoEmAndamento = null;
        original.headers = {
          ...(original.headers || {}),
          Authorization: `Bearer ${novoAccess}`,
        };
        return api(original);
      } catch (e) {
        renovacaoEmAndamento = null;
        limparSessaoERedirecionar();
        return Promise.reject(err);
      }
    }

    if (status === 401 && !rotaDeToken) {
      limparSessaoERedirecionar();
    }
    return Promise.reject(err);
  }
);

export default api;
