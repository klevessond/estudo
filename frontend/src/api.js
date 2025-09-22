// frontend/src/api.js
import axios from "axios";

// Se houver REACT_APP_API_URL, usa. Senão, monta a partir do hostname atual.
const baseURL =
  (process.env.REACT_APP_API_URL && process.env.REACT_APP_API_URL.replace(/\/$/, "")) ||
  `http://${window.location.hostname}:8000`;

const api = axios.create({
  baseURL,           // ex.: http://72.60.151.69:8000
  timeout: 60000,
  headers: { "Content-Type": "application/json" },
});

console.log("[API] baseURL =", baseURL);
// Anexa token Bearer automaticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Se 401, limpa token e vai pro /login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem("token");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
