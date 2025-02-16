import axios from 'axios';

// Criando uma instância do axios com configurações base
const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api',
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Objeto com todas as chamadas da API
const apiServices = {
    // Clientes
    getClientes: () => api.get('/clientes/'),
    getClienteById: (id) => api.get(`/clientes/${id}/`),
    createCliente: (data) => api.post('/clientes/', data),
    updateCliente: (id, data) => api.put(`/clientes/${id}/`, data),
    deleteCliente: (id) => api.delete(`/clientes/${id}/`),

    // Você pode adicionar outras rotas aqui seguindo o mesmo padrão
    // Exemplo para produtos:
    // getProdutos: () => api.get('/produtos/'),
    // createProduto: (data) => api.post('/produtos/', data),
};

export default apiServices;
