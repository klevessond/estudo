// TabelaClientes.jsx
import React from 'react';
import './TabelaClientesPosotivados.css';

const TabelaClientesvendedor = ({ titulo, clientes }) => {
  return (
    <div className="tabela-clientes">
      <h3 className="tabela-titulo">{titulo}</h3>
      <div className="tabela-wrapper">
        <table className="tabela-estilizada">
          <thead>
            <tr>
              <th>Cliente</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((cliente, index) => (
              <tr key={index}>
                <td>{cliente}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TabelaClientesvendedor;
