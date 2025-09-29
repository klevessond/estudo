import api from "../api";

const apiServices = {
  getClientes: () => api.get("/clientes/"),
  getClienteById: (id) => api.get(`/clientes/${id}/`),
  createCliente: (data) => api.post("/clientes/", data),
  updateCliente: (id, data) => api.put(`/clientes/${id}/`, data),
  deleteCliente: (id) => api.delete(`/clientes/${id}/`),
};

export default apiServices;
