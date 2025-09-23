// frontend/src/api.js
import axios from "axios";

// Em produção, padrão é "/api" (Nginx proxy -> backend).
// Em dev, você pode setar REACT_APP_API_URL=http://localhost:8000
const baseURL =
  (process.env.REACT_APP_API_URL && process.env.REACT_APP_API_URL.replace(/\/$/, "")) ||
  "/api";

const api = axios.create({
  baseURL,
  timeout: 60000,
  headers: { "Content-Type": "application/json" },
});

// token Bearer
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// se 401 -> login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem("token");
      if (window.location.pathname !== "/login") window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;
