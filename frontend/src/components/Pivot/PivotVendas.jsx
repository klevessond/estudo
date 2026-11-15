import React, { useState, useMemo } from 'react';
import { getPivotVendas } from '../../services/indicadoresApi';
import { fmtNum2 as fmt } from '../../utils/formatters';
import PivotTableUI from 'react-pivottable/PivotTableUI';
import TableRenderers from 'react-pivottable/TableRenderers';
import 'react-pivottable/pivottable.css';

/* ─── Tabela com subtotal manual ─────────────────────────────────────── */

const TabelaComSubtotal = ({ data, campoLinha1, campoLinha2, campoValor }) => {
  // Agrupa: pai → filho → soma
  const agrupado = useMemo(() => {
    const mapa = {};
    data.forEach((row) => {
      const pai   = row[campoLinha1] ?? '(vazio)';
      const filho = row[campoLinha2] ?? '(vazio)';
      const val   = parseFloat(row[campoValor]) || 0;
      if (!mapa[pai]) mapa[pai] = {};
      mapa[pai][filho] = (mapa[pai][filho] || 0) + val;
    });
    // Ordena pais e filhos alfabeticamente
    const resultado = [];
    Object.keys(mapa).sort().forEach((pai) => {
      let totalPai = 0;
      const filhos = [];
      Object.keys(mapa[pai]).sort().forEach((filho) => {
        const v = mapa[pai][filho];
        totalPai += v;
        filhos.push({ filho, valor: v });
      });
      resultado.push({ pai, filhos, totalPai });
    });
    return resultado;
  }, [data, campoLinha1, campoLinha2, campoValor]);

  const totalGeral = agrupado.reduce((s, g) => s + g.totalPai, 0);

  const thStyle = {
    background: '#dbeafe', color: '#1e3a5f', padding: '6px 10px',
    textAlign: 'left', fontSize: '0.8rem', fontWeight: 600,
    borderBottom: '1px solid #bfdbfe', whiteSpace: 'nowrap',
  };
  const tdBase = { padding: '4px 10px', fontSize: '0.8rem', borderBottom: '1px solid #f0f0f0' };

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 420 }}>
        <thead>
          <tr>
            <th style={{ ...thStyle, width: 200 }}>{campoLinha1}</th>
            <th style={{ ...thStyle, width: 220 }}>{campoLinha2}</th>
            <th style={{ ...thStyle, textAlign: 'right', width: 140 }}>{campoValor}</th>
          </tr>
        </thead>
        <tbody>
          {agrupado.map(({ pai, filhos, totalPai }) => (
            <React.Fragment key={pai}>
              {/* Linhas filhas */}
              {filhos.map(({ filho, valor }, i) => (
                <tr key={filho} style={{ background: i % 2 === 0 ? '#fff' : '#f9fafb' }}>
                  {i === 0 && (
                    <td
                      rowSpan={filhos.length}
                      style={{
                        ...tdBase,
                        fontWeight: 600, color: '#1e40af',
                        verticalAlign: 'top', paddingTop: 8,
                        borderRight: '2px solid #bfdbfe',
                      }}
                    >
                      {pai}
                    </td>
                  )}
                  <td style={{ ...tdBase, paddingLeft: 16 }}>{filho}</td>
                  <td style={{ ...tdBase, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                    {fmt(valor)}
                  </td>
                </tr>
              ))}
              {/* Linha de subtotal do pai */}
              <tr style={{ background: '#eff6ff' }}>
                <td
                  colSpan={2}
                  style={{
                    ...tdBase, fontWeight: 700, color: '#1e40af',
                    borderTop: '1px solid #bfdbfe', borderBottom: '2px solid #bfdbfe',
                    paddingLeft: 10,
                  }}
                >
                  Subtotal — {pai}
                </td>
                <td
                  style={{
                    ...tdBase, textAlign: 'right', fontWeight: 700, color: '#1e40af',
                    borderTop: '1px solid #bfdbfe', borderBottom: '2px solid #bfdbfe',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {fmt(totalPai)}
                </td>
              </tr>
            </React.Fragment>
          ))}
          {/* Total geral */}
          <tr style={{ background: '#1e40af' }}>
            <td colSpan={2} style={{ ...tdBase, color: '#fff', fontWeight: 700, fontSize: '0.85rem' }}>
              Total Geral
            </td>
            <td style={{ ...tdBase, color: '#fff', fontWeight: 700, textAlign: 'right', fontSize: '0.85rem', fontVariantNumeric: 'tabular-nums' }}>
              {fmt(totalGeral)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

/* ─── Componente principal ────────────────────────────────────────────── */
const MODOS = { pivot: 'pivot', subtotal: 'subtotal' };

const PivotVendas = () => {
  const hoje = new Date().toISOString().slice(0, 10);
  const inicioMes = hoje.slice(0, 8) + '01';

  const [datas, setDatas]     = useState({ de: inicioMes, ate: hoje });
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro]       = useState(null);
  const [modo, setModo]       = useState(MODOS.pivot);

  // Campos da tabela de subtotal
  const [campo1, setCampo1] = useState('Segmento');
  const [campo2, setCampo2] = useState('Grupo');
  const [campoVal, setCampoVal] = useState('ValorLiquido');

  const estadoPadrao = {
    rows: ['Segmento', 'Grupo'],
    cols: [],
    vals: ['ValorLiquido'],
    aggregatorName: 'Sum',
    rendererName: 'Table',
    valueFilter: {},
  };
  const [pivotState, setPivotState] = useState(estadoPadrao);

  // Campos disponíveis (detectados do primeiro registro)
  const campos = data.length > 0 ? Object.keys(data[0]) : [];
  const camposNumericos = useMemo(() => {
    if (!data.length) return [];
    return Object.keys(data[0]).filter((k) => !isNaN(parseFloat(data[0][k])));
  }, [data]);

  const buscarDados = async () => {
    if (!datas.de || !datas.ate) { setErro('Selecione as duas datas.'); return; }
    setErro(null);
    setLoading(true);
    try {
      const { data: json } = await getPivotVendas({ de: datas.de, ate: datas.ate });
      const resultado = json?.resultado;
      if (!Array.isArray(resultado) || resultado.length === 0) {
        setErro('Nenhum dado encontrado para o período selecionado.');
        setData([]);
      } else {
        setData(resultado);
      }
    } catch (err) {
      console.error(err);
      setErro('Erro ao carregar dados.');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const btnTab = (ativo) => ({
    padding: '6px 16px', cursor: 'pointer', fontWeight: ativo ? 700 : 400,
    border: 'none', borderBottom: ativo ? '3px solid #0074c2' : '3px solid transparent',
    background: 'none', color: ativo ? '#0074c2' : '#555', fontSize: '0.875rem',
  });

  return (
    <div style={{ padding: '20px', background: '#fff', borderRadius: '8px' }}>
      <h3 style={{ marginBottom: '16px', color: '#0074c2' }}>📊 Tabela Dinâmica de Vendas</h3>

      {/* Barra de filtros */}
      <div style={{ marginBottom: '16px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
        <label style={{ fontSize: '0.875rem', color: '#555' }}>
          De:&nbsp;
          <input type="date" value={datas.de}
            onChange={(e) => setDatas({ ...datas, de: e.target.value })}
            style={{ padding: '6px 8px', borderRadius: '4px', border: '1px solid #ccc' }} />
        </label>
        <label style={{ fontSize: '0.875rem', color: '#555' }}>
          Até:&nbsp;
          <input type="date" value={datas.ate}
            onChange={(e) => setDatas({ ...datas, ate: e.target.value })}
            style={{ padding: '6px 8px', borderRadius: '4px', border: '1px solid #ccc' }} />
        </label>
        <button onClick={buscarDados} disabled={loading}
          style={{ padding: '7px 18px', background: loading ? '#aaa' : '#0074c2', color: '#fff', border: 'none', borderRadius: '6px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 600 }}>
          {loading ? 'Carregando...' : 'Carregar Dados'}
        </button>
        {data.length > 0 && (
          <button onClick={() => setPivotState(estadoPadrao)}
            style={{ padding: '7px 14px', background: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>
            ↺ Resetar Layout
          </button>
        )}
        {data.length > 0 && <span style={{ fontSize: '0.8rem', color: '#888' }}>{data.length.toLocaleString('pt-BR')} linhas</span>}
      </div>

      {erro && (
        <div style={{ padding: '10px 14px', background: '#fee2e2', color: '#b91c1c', borderRadius: '6px', marginBottom: '12px', fontSize: '0.875rem' }}>
          ⚠️ {erro}
        </div>
      )}

      {/* Abas de modo */}
      {data.length > 0 && (
        <>
          <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', marginBottom: '16px' }}>
            <button style={btnTab(modo === MODOS.pivot)}    onClick={() => setModo(MODOS.pivot)}>🔀 Tabela Dinâmica</button>
            <button style={btnTab(modo === MODOS.subtotal)} onClick={() => setModo(MODOS.subtotal)}>∑ Com Subtotal</button>
          </div>

          {/* Modo subtotal: seletores de campo */}
          {modo === MODOS.subtotal && (
            <div style={{ display: 'flex', gap: '12px', marginBottom: '14px', flexWrap: 'wrap', alignItems: 'center', fontSize: '0.8rem', color: '#555' }}>
              <label>Agrupar por:&nbsp;
                <select value={campo1} onChange={(e) => setCampo1(e.target.value)}
                  style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #ccc' }}>
                  {campos.map((c) => <option key={c}>{c}</option>)}
                </select>
              </label>
              <label>Detalhar por:&nbsp;
                <select value={campo2} onChange={(e) => setCampo2(e.target.value)}
                  style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #ccc' }}>
                  {campos.map((c) => <option key={c}>{c}</option>)}
                </select>
              </label>
              <label>Valor:&nbsp;
                <select value={campoVal} onChange={(e) => setCampoVal(e.target.value)}
                  style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #ccc' }}>
                  {camposNumericos.map((c) => <option key={c}>{c}</option>)}
                </select>
              </label>
            </div>
          )}
        </>
      )}

      {/* Conteúdo */}
      {data.length > 0 && modo === MODOS.pivot && (
        <div style={{ overflowX: 'auto' }}>
          <PivotTableUI
            data={data}
            onChange={(s) => setPivotState(s)}
            renderers={TableRenderers}
            unusedOrientationCutoff={Infinity}
            {...pivotState}
          />
        </div>
      )}

      {data.length > 0 && modo === MODOS.subtotal && (
        <TabelaComSubtotal
          data={data}
          campoLinha1={campo1}
          campoLinha2={campo2}
          campoValor={campoVal}
        />
      )}

      {data.length === 0 && !loading && !erro && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#aaa', border: '2px dashed #e5e7eb', borderRadius: '8px' }}>
          Selecione um período e clique em <strong>Carregar Dados</strong>.
        </div>
      )}
    </div>
  );
};

export default PivotVendas;
