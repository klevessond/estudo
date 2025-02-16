import apiServices from './Api';

// Serviço para gerenciar todas as operações relacionadas a clientes
const ClienteService = {
    // Buscar todos os clientes
    buscarClientes: async () => {
        try {
            const response = await apiServices.getClientes();
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar clientes:', error);
            throw error;
        }
    }
}
export default ClienteService;