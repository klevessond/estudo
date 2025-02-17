import logo from './logo.svg';
import React, { useState, useEffect } from 'react';
import './App.css';
import ClienteServices from './services/Clienteservices.js';
import Layout from './components/layout/layout.jsx';

/* 
function App() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    buscarClientes();
  }, []);

  const buscarClientes = async () => {
    try {
      const data = await ClienteServices.buscarClientes();
      setClientes(data);
      setLoading(false);
      setError(null);
    } catch (error) {
      setError('Erro ao carregar clientes');
      setLoading(false);
    }
  };

//Função auxiliar para renderizar qualquer tipo de dados
const renderValue =(value) =>{
  if (typeof value === 'object' && value !== null){
      return <pre>{JSON.stringify(value,null,2)}</pre>;
  }
  return String(value);
}
  

return (
    <div className="App">
      <h1>Lista de Clientes</h1>
      
      {loading && <p>Carregando...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      <div className="data-container">
        <pre className="json-display">
          {JSON.stringify(clientes, null, 2)}
        </pre>
      </div>
    </div>
  );
}
*/
const App = () =>{
  return(
    <Layout>

    </Layout>

  );
};

export default App;