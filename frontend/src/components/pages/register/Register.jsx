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
  const [mixSupervisores, setMixSupervisores] = useState({}); // { codSupervisor: valor }

  // Filtros e Controle
  const [mesReferencia, setMesReferencia] = useState('');
  const [selectedSupervisor, setSelectedSupervisor] = useState(''); // '' = Todos
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // 1) Carrega lista de vendedores (com supervisores)
  useEffect(() => {
    const today = new Date();
    setMesReferencia(toYYYYMM(today));

    (async () => {
      try {
        const { data: venResp } = await api.get('/todos-vendedores/?ativos=true');
        setVendedores(venResp.detalhamento || []);
      } catch (err) {
        console.error('Erro ao buscar vendedores:', err);
      }
    })();
  }, []);

  // 2) Lista única de supervisores para o Dropdown
  const supervisoresOptions = useMemo(() => {
    const map = new Map();
    vendedores.forEach((v) => {
      if (v.CodSupervisor) {
        map.set(v.CodSupervisor, v.NomeSupervisor || `Sup ${v.CodSupervisor}`);
      }
    });
    return Array.from(map.entries()).map(([id, label]) => ({ id, label }));
  }, [vendedores]);

  // 3) Filtra vendedores da tabela
  const vendedoresFiltrados = useMemo(() => {
    if (!selectedSupervisor) return vendedores;
    return vendedores.filter((v) => String(v.CodSupervisor) === String(selectedSupervisor));
  }, [vendedores, selectedSupervisor]);

  // 4) Carrega Objetivos (Individuais e Hierárquicos) quando muda o mês
  useEffect(() => {
    const fetchObjetivos = async () => {
      if (!mesReferencia) return;
      setLoading(true);
      
      try {
        const dataRef = `${mesReferencia}-01`;

        // A) Objetivos Individuais
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

        // B) Objetivos Hierárquicos (Mix Nível)
        const { data: mixNivelResp } = await api.get('/objetivos-mix-nivel/', {
          params: { mes: dataRef },
        });

        // Procura meta da Empresa
        const metaEmpresa = mixNivelResp.find(m => m.nivel === 'EMPRESA');
        setMixEmpresa(metaEmpresa ? metaEmpresa.objetivo_mix : '');

        // Procura metas dos Supervisores
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

  // --- Handlers de Input ---
  const handleIndChange = (setter, id, val) => setter(p => ({ ...p, [id]: val }));
  
  const handleMixSupChange = (supId, val) => {
    setMixSupervisores(p => ({ ...p, [supId]: val }));
  };

  // --- Salvar ---
  const handleSubmit = async () => {
    const dataFormatada = `${mesReferencia}-01`;
    setLoading(true);

    try {
      // 1. Salvar Individuais
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

      // 2. Salvar Hierárquicos (Mix)
      const metasMix = [];
      
      // Meta Empresa
      if (mixEmpresa) {
        metasMix.push({ nivel: 'EMPRESA', codigo_alvo: 0, objetivo_mix: parseInt(mixEmpresa) });
      }

      // Metas Supervisores (Itera sobre todos os supervisores conhecidos)
      supervisoresOptions.forEach(sup => {
        const val = mixSupervisores[sup.id];
        if (val) {
          metasMix.push({ nivel: 'SUPERVISOR', codigo_alvo: sup.id, objetivo_mix: parseInt(val) });
        }
      });

      if (metasMix.length > 0) {
        await api.post('/objetivos-mix-nivel/', {
          mes_referencia: dataFormatada,
          metas: metasMix
        });
      }

      alert('Todos os objetivos salvos com sucesso!');
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar objetivos.');
    } finally {
      setLoading(false);
    }
  };

  // Totais (Soma simples para exibição)
  const sumVals = (obj) => Object.values(obj).reduce((acc, v) => acc + (parseFloat(v)||0), 0);
  const totalFin = sumVals(objetivosFinanceiros).toFixed(2);
  const totalPeso = sumVals(objetivosPeso).toFixed(2);
  const totalPos = sumVals(objetivosPos);
  
  // Nota: Mix não soma, mas podemos mostrar a soma dos vendedores apenas para referência se quiser
  const somaMixVendedores = sumVals(objetivosMix);

  return (
    <div className="register-container">
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <h2 className="register-title">Cadastro de Metas Integrado</h2>
        
        {/* Controles de Mês */}
        <div className="register-card" style={{ display: 'flex', gap: 10, padding: '10px' }}>
          <button onClick={() => setMesReferencia((m) => addMonthsYYYYMM(m, -1))}>◀</button>
          <input type="month" value={mesReferencia} onChange={(e) => setMesReferencia(e.target.value)} />
          <button onClick={() => setMesReferencia((m) => addMonthsYYYYMM(m, +1))}>▶</button>
        </div>
      </div>

      {/* --- SEÇÃO: METAS GERAIS EMPRESA --- */}
      <div className="register-card" style={{ background: '#e3f2fd', borderLeft: '5px solid #2196f3' }}>
        <h3>🏢 Meta Geral da Empresa</h3>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <div>
            <label><strong>Mix Empresa (SKUs):</strong></label>
            <input 
              type="number" 
              value={mixEmpresa} 
              onChange={(e) => setMixEmpresa(e.target.value)} 
              style={{ marginLeft: 10, padding: 5, width: 100 }}
              placeholder="Ex: 500"
            />
            <small style={{display:'block', color:'#666'}}></small>
          </div>
          <div style={{ opacity: 0.7 }}>
            <div>Total Financeiro (Soma): <strong>R$ {Number(totalFin).toLocaleString('pt-BR')}</strong></div>
            <div>Total Peso (Soma): <strong>{Number(totalPeso).toLocaleString('pt-BR')} kg</strong></div>
          </div>
        </div>
      </div>

      {/* --- SEÇÃO: FILTRO E META SUPERVISOR --- */}
      <div className="register-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 15 }}>
          <div>
            <label><strong>Filtrar Supervisor:</strong> </label>
            <select 
              value={selectedSupervisor} 
              onChange={(e) => setSelectedSupervisor(e.target.value)}
              style={{ padding: 8, borderRadius: 4 }}
            >
              <option value="">-- Todos --</option>
              {supervisoresOptions.map(s => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </div>

          {/* Campo de Meta de Mix do Supervisor (Só aparece se um supervisor estiver selecionado) */}
          {selectedSupervisor && (
            <div style={{ background: '#fff3e0', padding: '5px 15px', borderRadius: 4, border: '1px solid #ffe0b2' }}>
              <label><strong>Mix da Supervisão:</strong> </label>
              <input
                type="number"
                value={mixSupervisores[selectedSupervisor] || ''}
                onChange={(e) => handleMixSupChange(selectedSupervisor, e.target.value)}
                style={{ width: 80, marginLeft: 10 }}
                placeholder="Meta"
              />
            </div>
          )}
        </div>

        {/* --- TABELA DE VENDEDORES --- */}
        <table className="register-table">
          <thead>
            <tr>
              <th>Vendedor</th>
              <th>Financeiro (R$)</th>
              <th>Peso (kg)</th>
              <th>Mix (Individual)</th>
              <th>Positivação</th>
            </tr>
          </thead>
          <tbody>
            {vendedoresFiltrados.map((v) => (
              <tr key={v.CodFuncionario}>
                <td>
                  {v.Nome}
                  <div style={{fontSize:'0.8em', color:'#888'}}>
                    {v.NomeSupervisor ? `Sup: ${v.NomeSupervisor.split(' ')[0]}` : ''}
                  </div>
                </td>
                <td>
                  <input
                    type="number"
                    value={objetivosFinanceiros[v.CodFuncionario] || ''}
                    onChange={(e) => handleIndChange(setObjetivosFinanceiros, v.CodFuncionario, e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={objetivosPeso[v.CodFuncionario] || ''}
                    onChange={(e) => handleIndChange(setObjetivosPeso, v.CodFuncionario, e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={objetivosMix[v.CodFuncionario] || ''}
                    onChange={(e) => handleIndChange(setObjetivosMix, v.CodFuncionario, e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={objetivosPos[v.CodFuncionario] || ''}
                    onChange={(e) => handleIndChange(setObjetivosPos, v.CodFuncionario, e.target.value)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="register-card register-form">
        <button onClick={handleSubmit} disabled={loading} style={{width:'100%', fontSize:'1.1rem'}}>
          {loading ? 'Salvando...' : '💾 Salvar Todas as Metas'}
        </button>
      </div>
    </div>
  );
};

export default RegisterObjetivosVendedores;