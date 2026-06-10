import React, { useState } from 'react';
import api from '../../api';
import PivotTableUI from 'react-pivottable/PivotTableUI';
import 'react-pivottable/pivottable.css';

const PivotVendas = () => {
  const hoje = new Date().toISOString().slice(0, 10);
  const inicioMes = hoje.slice(0, 8) + '01';

  const [datas, setDatas] = useState({ de: inicioMes, ate: hoje });
  const [data, setData] = useState([]);
  const [pivotState, setPivotState] = useState({});
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);

  const buscarDados = async () => {
    if (!datas.de || !datas.ate) {
      setErro('Selecione as duas datas antes de carregar.');
      return;
    }
    setErro(null);
    setLoading(true);

    // LOG 1: Parâmetros de envio
    console.log(`%c[PivotVendas] 🚀 Solicitando dados ao servidor...`, 'color: #0074c2; font-weight: bold;');
    console.log(`[PivotVendas] Parâmetros da URL -> de: "${datas.de}", ate: "${datas.ate}"`);

    try {
      const url = `/indicadores/pivot-vendas/?de=${datas.de}&ate=${datas.ate}`;
      const { data: json } = await api.get(url);

      // LOG 2: Resposta HTTP pura recebida
      console.log('%c[PivotVendas] ✅ Resposta recebida do servidor:', 'color: #10b981; font-weight: bold;', json);

      const resultado = json?.resultado;
      
      // LOG 3: Validação estrutural do payload
      console.log(`[PivotVendas] Estrutura do payload válido? ${Array.isArray(resultado) ? 'SIM' : 'NÃO'}`);
      console.log(`[PivotVendas] Quantidade de objetos (linhas) dentro do array: ${resultado ? resultado.length : 0}`);

      if (!Array.isArray(resultado) || resultado.length === 0) {
        setErro('Nenhum dado encontrado para o período selecionado.');
        setData([]);
      } else {
        // LOG 4: Inspeção amostral do primeiro item para validar mapeamento de propriedades
        console.log('[PivotVendas] Amostra do primeiro registro mapeado:', resultado[0]);
        setData(resultado);
      }
    } catch (err) {
      // LOG 5: Erro detalhado com status da API
      console.error('%c[PivotVendas] ❌ Falha catastrófica na requisição:', 'color: #ef4444; font-weight: bold;');
      if (err.response) {
        console.error('[PivotVendas] Erro do Servidor (Response):', err.response.status, err.response.data);
      } else if (err.request) {
        console.error('[PivotVendas] O servidor não respondeu (Request):', err.request);
      } else {
        console.error('[PivotVendas] Erro de configuração local:', err.message);
      }
      
      setErro('Erro ao carregar dados. Verifique o período e tente novamente.');
      setData([]);
    } finally {
      setLoading(false);
    }


  };


  
  return (
    <div style={{ padding: '20px', background: '#fff', borderRadius: '8px' }}>
      <h3 style={{ marginBottom: '16px', color: '#0074c2' }}>
        📊 Tabela Dinâmica de Vendas
      </h3>

      {/* Barra de Filtros */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
        <label style={{ fontSize: '0.875rem', color: '#555' }}>
          De:&nbsp;
          <input
            type="date"
            value={datas.de}
            onChange={(e) => setDatas({ ...datas, de: e.target.value })}
            style={{ padding: '6px 8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </label>
        <label style={{ fontSize: '0.875rem', color: '#555' }}>
          Até:&nbsp;
          <input
            type="date"
            value={datas.ate}
            onChange={(e) => setDatas({ ...datas, ate: e.target.value })}
            style={{ padding: '6px 8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </label>
        <button
          onClick={buscarDados}
          disabled={loading}
          style={{
            padding: '7px 18px',
            background: loading ? '#aaa' : '#0074c2',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 600,
          }}
        >
          {loading ? 'Carregando...' : 'Carregar Dados'}
        </button>
        {data.length > 0 && (
          <span style={{ fontSize: '0.8rem', color: '#888' }}>
            {data.length.toLocaleString('pt-BR')} linhas carregadas
          </span>
        )}
      </div>

      {/* Mensagem de erro */}
      {erro && (
        <div style={{
          padding: '10px 14px', background: '#fee2e2', color: '#b91c1c',
          borderRadius: '6px', marginBottom: '16px', fontSize: '0.875rem',
        }}>
          ⚠️ {erro}
        </div>
      )}

      {/* Pivot Table */}
      {data.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <PivotTableUI
            data={data}
            onChange={(s) => setPivotState(s)}
            {...pivotState}
          />
        </div>
      )}

      {/* Estado inicial — antes de carregar */}
      {data.length === 0 && !loading && !erro && (
        <div style={{
          textAlign: 'center', padding: '40px', color: '#aaa',
          border: '2px dashed #e5e7eb', borderRadius: '8px',
        }}>
          Selecione um período e clique em <strong>Carregar Dados</strong>.
        </div>
      )}
    </div>
  );
};

export default PivotVendas;