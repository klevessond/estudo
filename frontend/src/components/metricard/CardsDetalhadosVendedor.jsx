import React, { useState, useEffect } from 'react';
import '../ResumoVendas/ResumoVendas.css'; // Reutilizando estilos dos botões
import TabelaClientesvendedor from './TabelaClientesPosotivados';
import TabelaMixProdutosVendedor from './TabelaMixProdutosVendedor';
import { getRupturaItens } from '../../services/indicadoresApi';
import { fmtMoeda } from '../../utils/formatters';


const CardsDetalhadosVendedor = ({ codFuncionario, periodoSelecionado }) => {
  const [visao, setVisao] = useState('positivados');

  // ===== Dados mockados originais (Positivados / Não / MIX) mantidos como estavam =====
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

  const itensVendidos = [...new Set(vendas.flatMap(v => v.itens))];
  const itensMixAtendidos = mixEsperado.filter(item => itensVendidos.includes(item));
  const percentualMix = (itensMixAtendidos.length / mixEsperado.length) * 100;

  // ===== Ruptura (dados reais via API, filtrados pelo vendedor selecionado) =====
  const [itensRuptura, setItensRuptura] = useState([]);
  const [totaisRuptura, setTotaisRuptura] = useState({ total_valor: 0, total_qtd: 0 });
  const [loadingRuptura, setLoadingRuptura] = useState(false);
  const [criterioValor, setCriterioValor] = useState(true); // true = valor, false = qtd

  useEffect(() => {
    if (visao !== 'ruptura' || !codFuncionario || !periodoSelecionado?.de || !periodoSelecionado?.ate) return;

    setLoadingRuptura(true);
    getRupturaItens({
      params: {
        de: periodoSelecionado.de,
        ate: periodoSelecionado.ate,
        vendedores: String(codFuncionario), // sempre o vendedor individual selecionado
        criterio: criterioValor ? 'valor' : 'qtd',
      },
    })
      .then(({ data }) => {
        setItensRuptura(data?.itens || []);
        setTotaisRuptura({
          total_valor: data?.total_valor || 0,
          total_qtd: data?.total_qtd || 0,
        });
      })
      .catch(() => {
        setItensRuptura([]);
        setTotaisRuptura({ total_valor: 0, total_qtd: 0 });
      })
      .finally(() => setLoadingRuptura(false));
  }, [visao, codFuncionario, periodoSelecionado?.de, periodoSelecionado?.ate, criterioValor]);

  return (
    <div style={{ marginTop: '2rem' }}>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
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
        <button
          className={`btn-modo ${visao === 'ruptura' ? 'ativo' : ''}`}
          onClick={() => setVisao('ruptura')}
          style={visao === 'ruptura' ? { background: '#dc2626', color: '#fff' } : undefined}
        >
          🚫 Ruptura
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

      {visao === 'ruptura' && (
        <div style={{ background: '#fff', borderRadius: '8px', padding: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h4 style={{ margin: 0 }}>
              Itens em Ruptura
              <span style={{ fontSize: '0.8rem', fontWeight: 400, color: '#888', marginLeft: 8 }}>
                ({itensRuptura.length} produtos)
              </span>
            </h4>

            {/* Toggle critério */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: criterioValor ? '#aaa' : '#1e88e5', fontWeight: criterioValor ? 400 : 600 }}>
                📦 Qtd
              </span>
              <div onClick={() => setCriterioValor(v => !v)}
                style={{
                  width: '40px', height: '22px', borderRadius: '999px', cursor: 'pointer',
                  background: criterioValor ? '#dc2626' : '#9ca3af',
                  position: 'relative', transition: 'background 0.2s',
                }}>
                <div style={{
                  position: 'absolute', top: '3px',
                  left: criterioValor ? '21px' : '3px',
                  width: '16px', height: '16px', borderRadius: '50%',
                  background: '#fff', transition: 'left 0.2s',
                }} />
              </div>
              <span style={{ fontSize: '0.8rem', color: criterioValor ? '#dc2626' : '#aaa', fontWeight: criterioValor ? 600 : 400 }}>
                💰 Valor
              </span>
            </div>
          </div>

          {/* Totais */}
          <div style={{
            display: 'flex', gap: '1.5rem', padding: '8px 12px',
            background: '#fef2f2', borderRadius: '6px', marginBottom: '0.75rem', fontSize: '0.85rem',
          }}>
            <div>
              <div style={{ color: '#888', fontSize: '0.72rem' }}>Valor total em ruptura</div>
              <div style={{ fontWeight: 700, color: '#dc2626' }}>{fmtMoeda(totaisRuptura.total_valor)}</div>
            </div>
            <div>
              <div style={{ color: '#888', fontSize: '0.72rem' }}>Quantidade total</div>
              <div style={{ fontWeight: 700, color: '#dc2626' }}>
                {Number(totaisRuptura.total_qtd || 0).toLocaleString('pt-BR')}
              </div>
            </div>
          </div>

          {loadingRuptura ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>Carregando...</div>
          ) : itensRuptura.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
              Nenhum item em ruptura no período.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#fee2e2', textAlign: 'left' }}>
                    <th style={{ padding: '6px 8px' }}>#</th>
                    <th style={{ padding: '6px 8px' }}>Produto</th>
                    <th style={{ padding: '6px 8px' }}>Grupo</th>
                    <th style={{ padding: '6px 8px', textAlign: 'right' }}>Qtd</th>
                    <th style={{ padding: '6px 8px', textAlign: 'right' }}>Valor</th>
                    <th style={{ padding: '6px 8px', textAlign: 'right' }}>%</th>
                  </tr>
                </thead>
                <tbody>
                  {itensRuptura.map((item, i) => (
                    <tr key={item.CodMaterial} style={{ borderBottom: '1px solid #eee', background: i % 2 === 0 ? '#fef2f2' : '#fff' }}>
                      <td style={{ padding: '5px 8px', color: '#888' }}>{i + 1}</td>
                      <td style={{ padding: '5px 8px' }}>{item.Material || `Cod: ${item.CodMaterial}`}</td>
                      <td style={{ padding: '5px 8px', color: '#555', fontSize: '0.78rem' }}>{item.Grupo}</td>
                      <td style={{ padding: '5px 8px', textAlign: 'right' }}>
                        {Number(item.QtdItens).toLocaleString('pt-BR')}
                      </td>
                      <td style={{ padding: '5px 8px', textAlign: 'right' }}>{fmtMoeda(item.ValorTotal)}</td>
                      <td style={{ padding: '5px 8px', textAlign: 'right', color: '#dc2626', fontWeight: 500 }}>
                        {criterioValor ? `${Number(item.PercValor || 0).toFixed(1)}%` : `${Number(item.PercQtd || 0).toFixed(1)}%`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CardsDetalhadosVendedor;
