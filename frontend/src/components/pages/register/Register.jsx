// src/components/pages/Register.jsx
import './register.css';
import { useNavigate } from 'react-router-dom';
import React, { useEffect, useState, useMemo } from 'react';
import api from '../../../api';

const toYYYYMM = (dateObj) => {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
};

const addMonthsYYYYMM = (yyyyMm, delta) => {
  if (!yyyyMm) return yyyyMm;
  const [y, m] = yyyyMm.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return toYYYYMM(d);
};

const RegisterObjetivosVendedores = () => {
  const [vendedores, setVendedores] = useState([]);
  
  // Objetivos Individuais (Vendedores)
  const [objetivosFinanceiros, setObjetivosFinanceiros] = useState({});
  const [objetivosMix, setObjetivosMix] = useState({});
  const [objetivosPeso, setObjetivosPeso] = useState({});
  const [objetivosPos, setObjetivosPos] = useState({});

  // Objetivos Hierárquicos (Mix Nível)
  const [mixEmpresa, setMixEmpresa] = useState('');
  const [mixSupervisores, setMixSupervisores] = useState({});

  // Filtros e Controle
  const [mesReferencia, setMesReferencia] = useState('');
  const [selectedSupervisor, setSelectedSupervisor] = useState('');
  const [loading, setLoading] = useState(false);

  // Estados para Cálculo em Massa
  const [mesBaseCalculo, setMesBaseCalculo] = useState('');
  const [percCrescimento, setPercCrescimento] = useState(0);
  const [selectedIds, setSelectedIds] = useState(new Set());

  const navigate = useNavigate();

  // 1) Carrega lista
  useEffect(() => {
    const today = new Date();
    const strToday = toYYYYMM(today);
    setMesReferencia(strToday);
    setMesBaseCalculo(addMonthsYYYYMM(strToday, -1));

    (async () => {
      try {
        const { data: venResp } = await api.get('/todos-vendedores/?ativos=true');
        setVendedores(venResp.detalhamento || []);
      } catch (err) {
        console.error('Erro ao buscar vendedores:', err);
      }
    })();
  }, []);

  // 2) Dropdown Supervisores
  const supervisoresOptions = useMemo(() => {
    const map = new Map();
    vendedores.forEach((v) => {
      if (v.CodSupervisor) {
        map.set(v.CodSupervisor, v.NomeSupervisor || `Sup ${v.CodSupervisor}`);
      }
    });
    return Array.from(map.entries()).map(([id, label]) => ({ id, label }));
  }, [vendedores]);

  // 3) Filtro Tabela
  const vendedoresFiltrados = useMemo(() => {
    if (!selectedSupervisor) return vendedores;
    return vendedores.filter((v) => String(v.CodSupervisor) === String(selectedSupervisor));
  }, [vendedores, selectedSupervisor]);

  // 4) Carrega Objetivos
  useEffect(() => {
    const fetchObjetivos = async () => {
      if (!mesReferencia) return;
      setLoading(true);
      
      try {
        const dataRef = `${mesReferencia}-01`;

        const { data: objResp } = await api.get('/objetivos-vendedores/', {
          params: { mes_referencia: dataRef },
        });
        
        const objFin = {};
        const objMixInd = {};
        const objPeso = {};
        const objPos = {};

        (objResp.objetivos || []).forEach((e) => {
          const vid = e.vendedor_id;
          objFin[vid] = e.objetivo_financeiro;
          objMixInd[vid] = e.objetivo_mix;
          objPeso[vid] = e.objetivo_peso;
          objPos[vid] = e.objetivo_positivacao;
        });

        setObjetivosFinanceiros(objFin);
        setObjetivosMix(objMixInd);
        setObjetivosPeso(objPeso);
        setObjetivosPos(objPos);

        const { data: mixNivelResp } = await api.get('/objetivos-mix-nivel/', {
          params: { mes: dataRef },
        });

        const metaEmpresa = mixNivelResp.find(m => m.nivel === 'EMPRESA');
        setMixEmpresa(metaEmpresa ? metaEmpresa.objetivo_mix : '');

        const mapSup = {};
        mixNivelResp.filter(m => m.nivel === 'SUPERVISOR').forEach(m => {
          mapSup[m.codigo_alvo] = m.objetivo_mix;
        });
        setMixSupervisores(mapSup);

      } catch (err) {
        console.error('Erro ao buscar objetivos:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchObjetivos();
  }, [mesReferencia]);

  const handleIndChange = (setter, id, val) => setter(p => ({ ...p, [id]: val }));
  const handleMixSupChange = (supId, val) => setMixSupervisores(p => ({ ...p, [supId]: val }));

  const handleSelectOne = (id, checked) => {
    const newSet = new Set(selectedIds);
    if (checked) newSet.add(id);
    else newSet.delete(id);
    setSelectedIds(newSet);
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      const ids = vendedoresFiltrados.map(v => v.CodFuncionario);
      setSelectedIds(new Set(ids));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleAplicarCrescimento = async () => {
    if (!mesBaseCalculo) return alert("Selecione um mês base.");
    if (selectedIds.size === 0) return alert("Selecione pelo menos um vendedor.");

    if (!window.confirm(`Aplicar ${percCrescimento}% sobre ${mesBaseCalculo} para ${selectedIds.size} vendedores?`)) return;

    setLoading(true);
    try {
      const { data: objResp } = await api.get('/objetivos-vendedores/', {
        params: { mes_referencia: `${mesBaseCalculo}-01` },
      });

      const metasBase = objResp.objetivos || [];
      const fator = 1 + (parseFloat(percCrescimento) / 100);

      const novoFin = { ...objetivosFinanceiros };
      const novoPeso = { ...objetivosPeso };
      const novoMix = { ...objetivosMix };
      const novoPos = { ...objetivosPos };

      selectedIds.forEach(id => {
        const metaAntiga = metasBase.find(m => String(m.vendedor_id) === String(id));
        if (metaAntiga) {
          novoFin[id] = (parseFloat(metaAntiga.objetivo_financeiro || 0) * fator).toFixed(2);
          novoPeso[id] = (parseFloat(metaAntiga.objetivo_peso || 0) * fator).toFixed(2);
          novoMix[id] = Math.round(parseFloat(metaAntiga.objetivo_mix || 0) * fator);
          novoPos[id] = Math.round(parseFloat(metaAntiga.objetivo_positivacao || 0) * fator);
        }
      });

      setObjetivosFinanceiros(novoFin);
      setObjetivosPeso(novoPeso);
      setObjetivosMix(novoMix);
      setObjetivosPos(novoPos);
      alert("Cálculo aplicado!");
    } catch (err) {
      console.error("Erro:", err);
      alert("Erro ao buscar dados.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    const dataFormatada = `${mesReferencia}-01`;
    setLoading(true);
    try {
      const payloadInd = {
        mes_referencia: dataFormatada,
        objetivos: vendedores.map((v) => ({
          vendedor_id: v.CodFuncionario,
          nome_vendedor: v.Nome,
          objetivo_financeiro: parseFloat(objetivosFinanceiros[v.CodFuncionario]) || 0,
          objetivo_mix: parseFloat(objetivosMix[v.CodFuncionario]) || 0,
          objetivo_peso: parseFloat(objetivosPeso[v.CodFuncionario]) || 0,
          objetivo_positivacao: parseInt(objetivosPos[v.CodFuncionario]) || 0,
        })),
      };
      await api.post('/objetivos-vendedores/', payloadInd);

      const metasMix = [];
      if (mixEmpresa) metasMix.push({ nivel: 'EMPRESA', codigo_alvo: 0, objetivo_mix: parseInt(mixEmpresa) });
      supervisoresOptions.forEach(sup => {
        const val = mixSupervisores[sup.id];
        if (val) metasMix.push({ nivel: 'SUPERVISOR', codigo_alvo: sup.id, objetivo_mix: parseInt(val) });
      });

      if (metasMix.length > 0) {
        await api.post('/objetivos-mix-nivel/', {
          mes_referencia: dataFormatada,
          metas: metasMix
        });
      }
      alert('Objetivos salvos com sucesso!');
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar.');
    } finally {
      setLoading(false);
    }
  };

  // Totais
  const sumVals = (obj) => Object.values(obj).reduce((acc, v) => acc + (parseFloat(v)||0), 0);
  const totalFin = sumVals(objetivosFinanceiros).toFixed(2);
  const totalPeso = sumVals(objetivosPeso).toFixed(2);

  return (
    <div className="register-container">
      {/* Header */}
      <div className="register-header">
        <h2 className="register-title">Cadastro de Metas Integrado</h2>
        
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button onClick={() => setMesReferencia((m) => addMonthsYYYYMM(m, -1))} style={{padding: '5px 10px'}}>◀</button>
          <input 
            type="month" 
            value={mesReferencia} 
            onChange={(e) => setMesReferencia(e.target.value)} 
            style={{padding: '8px', borderRadius: '4px', border: '1px solid #ccc'}}
          />
          <button onClick={() => setMesReferencia((m) => addMonthsYYYYMM(m, +1))} style={{padding: '5px 10px'}}>▶</button>
        </div>
      </div>

      {/* --- SEÇÃO SUPERIOR: CARDS LADO A LADO --- */}
      <div className="register-top-row">
        
        {/* Card 1: Meta Empresa */}
        <div className="register-card" style={{ background: '#e3f2fd', borderLeft: '5px solid #2196f3' }}>
          <h3>🏢 Meta Geral da Empresa</h3>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div>
              <label style={{display: 'block', marginBottom: '5px'}}><strong>Mix Empresa:</strong></label>
              <input 
                type="number" 
                value={mixEmpresa} 
                onChange={(e) => setMixEmpresa(e.target.value)} 
                style={{ padding: 8, width: 120 }}
                placeholder="Ex: 500"
              />
            </div>
            <div style={{ opacity: 0.8, fontSize: '0.9rem' }}>
              <div style={{marginBottom: 4}}>Total Financeiro: <strong>R$ {Number(totalFin).toLocaleString('pt-BR')}</strong></div>
              <div>Total Peso: <strong>{Number(totalPeso).toLocaleString('pt-BR')} kg</strong></div>
            </div>
          </div>
        </div>

        {/* Card 2: Ferramenta de Projeção */}
        <div className="register-card" style={{ background: '#f0fdf4', borderLeft: '5px solid #22c55e' }}>
          <h3>🚀 Projeção em Massa</h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '15px', flexWrap: 'wrap' }}>
            <div>
              <label style={{ display: 'block', marginBottom: 5, fontSize: '0.9rem' }}>Baseado em:</label>
              <input 
                type="month" 
                value={mesBaseCalculo} 
                onChange={(e) => setMesBaseCalculo(e.target.value)} 
                style={{ padding: '6px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 5, fontSize: '0.9rem' }}>Crescimento (%):</label>
              <input 
                type="number" 
                value={percCrescimento} 
                onChange={(e) => setPercCrescimento(e.target.value)} 
                placeholder="%"
                style={{ width: '80px', padding: '6px' }}
              />
            </div>
            <button 
              onClick={handleAplicarCrescimento} 
              disabled={loading}
              style={{ backgroundColor: '#22c55e', padding: '8px 16px', fontSize: '0.9rem' }}
            >
              Aplicar ⚡
            </button>
          </div>
        </div>

      </div>

      {/* --- SEÇÃO PRINCIPAL: FILTRO E TABELA --- */}
      <div className="register-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 15 }}>
          <div>
            <label><strong>Filtrar Supervisor:</strong> </label>
            <select 
              value={selectedSupervisor} 
              onChange={(e) => setSelectedSupervisor(e.target.value)}
              style={{ padding: 8, borderRadius: 4, minWidth: '200px' }}
            >
              <option value="">-- Todos --</option>
              {supervisoresOptions.map(s => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </div>

          {/* Meta de Mix do Supervisor */}
          {selectedSupervisor && (
            <div style={{ background: '#fff3e0', padding: '8px 15px', borderRadius: 6, border: '1px solid #ffe0b2', display: 'flex', alignItems: 'center' }}>
              <label style={{marginRight: 10}}><strong>Mix da Supervisão:</strong> </label>
              <input
                type="number"
                value={mixSupervisores[selectedSupervisor] || ''}
                onChange={(e) => handleMixSupChange(selectedSupervisor, e.target.value)}
                style={{ width: 100, padding: 5 }}
                placeholder="Meta Mix"
              />
            </div>
          )}
        </div>

        {/* TABELA DE VENDEDORES */}
        <div style={{ overflowX: 'auto' }}>
          <table className="register-table">
            <thead>
              <tr>
                <th style={{ width: '40px', textAlign: 'center' }}>
                  <input 
                    type="checkbox" 
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    checked={vendedoresFiltrados.length > 0 && vendedoresFiltrados.every(v => selectedIds.has(v.CodFuncionario))}
                  />
                </th>
                <th style={{width: '25%'}}>Vendedor</th>
                <th>Financeiro (R$)</th>
                <th>Peso (kg)</th>
                <th>Mix (Individual)</th>
                <th>Positivação</th>
              </tr>
            </thead>
            <tbody>
              {vendedoresFiltrados.map((v) => (
                <tr key={v.CodFuncionario} className={selectedIds.has(v.CodFuncionario) ? 'selected-row' : ''}>
                  <td style={{ textAlign: 'center' }}>
                    <input 
                      type="checkbox" 
                      checked={selectedIds.has(v.CodFuncionario)}
                      onChange={(e) => handleSelectOne(v.CodFuncionario, e.target.checked)}
                    />
                  </td>
                  <td>
                    <div style={{fontWeight: 500}}>{v.Nome}</div>
                    <div style={{fontSize:'0.8em', color:'#888'}}>
                      {v.NomeSupervisor ? `Sup: ${v.NomeSupervisor.split(' ')[0]}` : ''}
                    </div>
                  </td>
                  <td>
                    <input
                      type="number"
                      value={objetivosFinanceiros[v.CodFuncionario] || ''}
                      onChange={(e) => handleIndChange(setObjetivosFinanceiros, v.CodFuncionario, e.target.value)}
                      placeholder="Financeiro"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={objetivosPeso[v.CodFuncionario] || ''}
                      onChange={(e) => handleIndChange(setObjetivosPeso, v.CodFuncionario, e.target.value)}
                      placeholder="Peso"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={objetivosMix[v.CodFuncionario] || ''}
                      onChange={(e) => handleIndChange(setObjetivosMix, v.CodFuncionario, e.target.value)}
                      placeholder="Mix"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={objetivosPos[v.CodFuncionario] || ''}
                      onChange={(e) => handleIndChange(setObjetivosPos, v.CodFuncionario, e.target.value)}
                      placeholder="Positivação"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="register-card register-form">
        <button onClick={handleSubmit} disabled={loading} style={{width:'100%', fontSize:'1.1rem', fontWeight: 'bold'}}>
          {loading ? 'Salvando...' : '💾 Salvar Todas as Metas'}
        </button>
      </div>
    </div>
  );
};

export default RegisterObjetivosVendedores;