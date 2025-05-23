// TabelaMixProdutos.jsx
import React from 'react';
import './TabelaMixProdutosVendedor.css';

const TabelaMixProdutosVendedor = ({ titulo, itens, totalEsperado, percentual }) => {
  return (
    <div className="tabela-mix">
      <h3 className="tabela-titulo">{titulo}</h3>
      <p className="tabela-subtitulo">
        Mix atendido: {itens.length}/{totalEsperado} ({percentual.toFixed(1)}%)
      </p>
      <div className="tabela-wrapper">
        <table className="tabela-estilizada">
          <thead>
            <tr>
              <th>Produto</th>
            </tr>
          </thead>
          <tbody>
            {itens.map((item, index) => (
              <tr key={index}>
                <td>{item}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TabelaMixProdutosVendedor;
