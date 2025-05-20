import React, { useState } from 'react';
import '../ResumoVendas/ResumoVendas.css'; // Reutilizando estilos dos botões

const CardsDetalhadosVendedor = () => {
  const [visao, setVisao] = useState('positivados');

  const clientesAnaPaula = [
    'Supermercado São José',
    'Mercadinho Boa Esperança',
    'Comercial Oliveira',
    'Depósito Central',
    'Atacadão da Vila',
    'Mini Box Dantas',
    'Casa Freitas',
    'Mercado Bom Preço',
  ];

  const vendas = [
    { cliente: 'Supermercado São José', itens: ['Arroz', 'Feijão', 'Macarrão'] },
    { cliente: 'Comercial Oliveira', itens: ['Arroz', 'Açúcar'] },
    { cliente: 'Depósito Central', itens: ['Feijão', 'Óleo'] },
    { cliente: 'Mini Box Dantas', itens: ['Café', 'Leite'] },
  ];

  const mixEsperado = ['Arroz', 'Feijão', 'Macarrão', 'Óleo', 'Sal', 'Açúcar', 'Café', 'Leite'];

  const clientesPositivados = vendas.map(v => v.cliente);
  const clientesNaoPositivados = clientesAnaPaula.filter(c => !clientesPositivados.includes(c));
  const percentualPositivados = (clientesPositivados.length / clientesAnaPaula.length) * 100;
  const percentualNaoPositivados = 100 - percentualPositivados;

  const itensVendidos = [...new Set(vendas.flatMap(v => v.itens))];
  const itensMixAtendidos = mixEsperado.filter(item => itensVendidos.includes(item));
  const percentualMix = (itensMixAtendidos.length / mixEsperado.length) * 100;

  return (
    <div style={{ marginTop: '2rem' }}>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <button
          className={`btn-modo ${visao === 'positivados' ? 'ativo' : ''}`}
          onClick={() => setVisao('positivados')}
        >
          Positivados
        </button>
        <button
          className={`btn-modo ${visao === 'nao' ? 'ativo' : ''}`}
          onClick={() => setVisao('nao')}
        >
          Não Positivados
        </button>
        <button
          className={`btn-modo ${visao === 'mix' ? 'ativo' : ''}`}
          onClick={() => setVisao('mix')}
        >
          MIX
        </button>
      </div>

      {visao === 'positivados' && (
        <div>
          <strong>Total: {clientesPositivados.length} clientes ({percentualPositivados.toFixed(1)}%)</strong>
          <ul>
            {clientesPositivados.map(cliente => (
              <li key={cliente}>{cliente}</li>
            ))}
          </ul>
        </div>
      )}

      {visao === 'nao' && (
        <div>
          <strong>Total: {clientesNaoPositivados.length} clientes ({percentualNaoPositivados.toFixed(1)}%)</strong>
          <ul>
            {clientesNaoPositivados.map(cliente => (
              <li key={cliente}>{cliente}</li>
            ))}
          </ul>
        </div>
      )}

      {visao === 'mix' && (
        <div>
          <strong>Mix atendido: {itensMixAtendidos.length}/{mixEsperado.length} ({percentualMix.toFixed(1)}%)</strong>
          <table style={{ marginTop: '1rem', borderCollapse: 'collapse' }}>
            <thead>
              <tr><th style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>Item</th></tr>
            </thead>
            <tbody>
              {itensMixAtendidos.map(item => (
                <tr key={item}><td style={{ padding: '6px 0' }}>{item}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CardsDetalhadosVendedor;
