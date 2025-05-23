import React, { useState } from 'react';
import '../ResumoVendas/ResumoVendas.css'; // Reutilizando estilos dos botões
import TabelaClientesvendedor from './TabelaClientesPosotivados'; // certifique-se de importar corretamente
import TabelaMixProdutosVendedor from './TabelaMixProdutosVendedor'; // importar no topo

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
        <TabelaClientesvendedor
          titulo={`Clientes Positivados (${clientesPositivados.length})`}
          clientes={clientesPositivados}
        />
      )}

      {visao === 'nao' && (
        <TabelaClientesvendedor
          titulo={`Clientes Não Positivados (${clientesNaoPositivados.length})`}
          clientes={clientesNaoPositivados}
        />
    )}

      {visao === 'mix' && (
          <TabelaMixProdutosVendedor
            titulo="Mix de Produtos Atendidos"
            itens={itensMixAtendidos}
            totalEsperado={mixEsperado.length}
            percentual={percentualMix}
          />
        )}
    </div>
  );
};

export default CardsDetalhadosVendedor;
