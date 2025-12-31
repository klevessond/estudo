// Register.jsx (RegisterObjetivosVendedores)
import './register.css';
import { useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
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
  const [objetivosFinanceiros, setObjetivosFinanceiros] = useState({});
  const [objetivosMix, setObjetivosMix] = useState({});
  const [objetivosPeso, setObjetivosPeso] = useState({});
  const [objetivosPos, setObjetivosPos] = useState({});
  const [mesReferencia, setMesReferencia] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // 1) Inicializa mês atual + carrega vendedores 1x
  useEffect(() => {
    const today = new Date();
    setMesReferencia(toYYYYMM(today));

    (async () => {
      try {
        const { data: venResp } = await api.get('/todos-vendedores/');
        setVendedores(venResp.detalhamento || []);
      } catch (err) {
        console.error('Erro ao buscar vendedores:', err);
        setVendedores([]);
      }
    })();
  }, []);

  // 2) Sempre que o mês mudar (e já tiver vendedores), recarrega objetivos do mês
  useEffect(() => {
    const fetchObjetivosMes = async () => {
      const { length } = vendedores || [];
      if (!mesReferencia || !length) return;

      setLoading(true);
      try {
        const mesReferenciaAtual = `${mesReferencia}-01`;

        const { data: objResp } = await api.get('/objetivos-vendedores/', {
          params: { mes_referencia: mesReferenciaAtual },
        });

        const existentes = objResp.objetivos || [];

        const objFin = {};
        const objMix = {};
        const objPeso = {};
        const objPos = {};

        vendedores.forEach((v) => {
          const e = existentes.find(
            (x) => Number(x.vendedor_id) === Number(v.CodFuncionario)
          );

          objFin[v.CodFuncionario] = e ? e.objetivo_financeiro : '';
          objMix[v.CodFuncionario] = e ? e.objetivo_mix : '';
          objPeso[v.CodFuncionario] = e ? e.objetivo_peso : '';
          objPos[v.CodFuncionario] = e ? e.objetivo_positivacao : '';
        });

        setObjetivosFinanceiros(objFin);
        setObjetivosMix(objMix);
        setObjetivosPeso(objPeso);
        setObjetivosPos(objPos);
      } catch (err) {
        console.error('Erro ao buscar objetivos do mês:', err);
        // opcional: limpar inputs quando falhar
        setObjetivosFinanceiros({});
        setObjetivosMix({});
        setObjetivosPeso({});
        setObjetivosPos({});
      } finally {
        setLoading(false);
      }
    };

    fetchObjetivosMes();
  }, [mesReferencia, vendedores]);

  const handleFinanceiroChange = (id, value) =>
    setObjetivosFinanceiros((p) => ({ ...p, [id]: value }));

  const handleMixChange = (id, value) =>
    setObjetivosMix((p) => ({ ...p, [id]: value }));

  const handlePesoChange = (id, value) =>
    setObjetivosPeso((p) => ({ ...p, [id]: value }));

  const handlePosChange = (id, value) =>
    setObjetivosPos((p) => ({ ...p, [id]: value }));

  const handleSubmit = async () => {
    const dataFormatada = `${mesReferencia}-01`;

    const payload = {
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

    try {
      const res = await api.post('/objetivos-vendedores/', payload);
      if (res.status >= 200 && res.status < 300) {
        alert('Objetivos cadastrados com sucesso!');
        navigate('/');
      } else {
        alert('Erro ao cadastrar objetivos.');
      }
    } catch (err) {
      console.error('Erro ao cadastrar objetivos:', err);
      alert('Erro ao cadastrar objetivos.');
    }
  };

  const totalFinanceiro = Object.values(objetivosFinanceiros)
    .reduce((acc, v) => acc + (parseFloat(v) || 0), 0)
    .toFixed(2);

  const totalPeso = Object.values(objetivosPeso)
    .reduce((acc, v) => acc + (parseFloat(v) || 0), 0)
    .toFixed(2);

  const totalMix = Object.values(objetivosMix)
    .reduce((acc, v) => acc + (parseFloat(v) || 0), 0)
    .toFixed(2);

  const totalPos = Object.values(objetivosPos)
    .reduce((acc, v) => acc + (parseInt(v) || 0), 0);

  return (
    <div className="register-container">
      <h2 className="register-title">Cadastro de Objetivos por Vendedor</h2>

      <div
        className="register-card register-form"
        style={{ display: 'flex', gap: 10, alignItems: 'center' }}
      >
        <button
          type="button"
          onClick={() => setMesReferencia((m) => addMonthsYYYYMM(m, -1))}
        >
          ◀ Anterior
        </button>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label>Mês de Referência:</label>
          <input
            type="month"
            value={mesReferencia}
            onChange={(e) => setMesReferencia(e.target.value)}
          />
          {loading ? (
            <small style={{ opacity: 0.8 }}>Carregando objetivos…</small>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => setMesReferencia((m) => addMonthsYYYYMM(m, +1))}
        >
          Próximo ▶
        </button>
      </div>

      <div className="register-card">
        <table className="register-table">
          <thead>
            <tr>
              <th>Vendedor</th>
              <th>Objetivo Financeiro (R$)</th>
              <th>Objetivo Peso (kg)</th>
              <th>Objetivo Mix</th>
              <th>Objetivo Positivação (clientes)</th>
            </tr>
          </thead>

          <tbody>
            {vendedores.map((v) => (
              <tr key={v.CodFuncionario}>
                <td>{v.Nome}</td>

                {/* Financeiro */}
                <td>
                  <input
                    type="number"
                    value={objetivosFinanceiros[v.CodFuncionario] || ''}
                    onChange={(e) =>
                      handleFinanceiroChange(v.CodFuncionario, e.target.value)
                    }
                    placeholder="financeiro"
                  />
                </td>

                {/* Peso */}
                <td>
                  <input
                    type="number"
                    step="0.01"
                    value={objetivosPeso[v.CodFuncionario] || ''}
                    onChange={(e) =>
                      handlePesoChange(v.CodFuncionario, e.target.value)
                    }
                    placeholder="kg"
                  />
                </td>

                {/* Mix */}
                <td>
                  <input
                    type="number"
                    value={objetivosMix[v.CodFuncionario] || ''}
                    onChange={(e) =>
                      handleMixChange(v.CodFuncionario, e.target.value)
                    }
                    placeholder="mix"
                  />
                </td>

                {/* Positivação */}
                <td>
                  <input
                    type="number"
                    value={objetivosPos[v.CodFuncionario] || ''}
                    onChange={(e) =>
                      handlePosChange(v.CodFuncionario, e.target.value)
                    }
                    placeholder="clientes"
                  />
                </td>
              </tr>
            ))}

            {/* totalização */}
            <tr className="register-total-row">
              <td>
                <strong>Total Empresa</strong>
              </td>
              <td>
                <strong>{totalFinanceiro}</strong>
              </td>
              <td>
                <strong>{totalPeso}</strong>
              </td>
              <td>
                <strong>{totalMix}</strong>
              </td>
              <td>
                <strong>{totalPos}</strong>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="register-card register-form">
        <button onClick={handleSubmit} disabled={loading}>
          Salvar Objetivos
        </button>
      </div>
    </div>
  );
};

export default RegisterObjetivosVendedores;
