// frontend/src/services/Api.js
import axios from "axios";

// Se seu backend expõe os endpoints de clientes em /api/clientes/,
// deixe o fallback com /api.
// Caso NÃO use o prefixo /api no Django, remova o "/api" do fallback.
const fallback = `${window.location.protocol}//${window.location.hostname}:8000/api`;
const baseURL = (process.env.REACT_APP_API_URL || fallback).replace(/\/$/, "");

const api = axios.create({
  baseURL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

const apiServices = {
  // Clientes
  getClientes: () => api.get("/clientes/"),
  getClienteById: (id) => api.get(`/clientes/${id}/`),
  createCliente: (data) => api.post("/clientes/", data),
  updateCliente: (id, data) => api.put(`/clientes/${id}/`, data),
  deleteCliente: (id) => api.delete(`/clientes/${id}/`),
};

export default apiServices;
