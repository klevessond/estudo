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

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem("token");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);

export default api;
