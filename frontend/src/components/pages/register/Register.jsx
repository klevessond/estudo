// Register.jsx (RegisterObjetivosVendedores)
import './register.css';
import { useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import api from '../../../api'; // <- usa a instância central (pega REACT_APP_API_URL e anexa o token)

const RegisterObjetivosVendedores = () => {
  const [vendedores, setVendedores] = useState([]);
  const [objetivosFinanceiros, setObjetivosFinanceiros] = useState({});
  const [objetivosMix, setObjetivosMix] = useState({});
  const [mesReferencia, setMesReferencia] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');

    // controlado pelo input <input type="month" />
    setMesReferencia(`${y}-${m}`);

    // usamos dia 01 para consultar os objetivos do mês
    const mesReferenciaAtual = `${y}-${m}-01`;

    (async () => {
      try {
        // 1) lista de vendedores
        const { data: venResp } = await api.get('/todos-vendedores/');
        const lista = venResp.detalhamento || [];
        setVendedores(lista);

        // 2) objetivos existentes do mês
        const { data: objResp } = await api.get('/objetivos-vendedores/', {
          params: { mes_referencia: mesReferenciaAtual },
        });
        const existentes = objResp.objetivos || [];

        // 3) pré-preenche os inputs com o que já existe
        const objFin = {};
        const objMix = {};
        lista.forEach((v) => {
          const e = existentes.find((x) => Number(x.vendedor_id) === v.CodFuncionario);
          objFin[v.CodFuncionario] = e ? e.objetivo_financeiro : '';
          objMix[v.CodFuncionario] = e ? e.objetivo_mix : '';
        });
        setObjetivosFinanceiros(objFin);
        setObjetivosMix(objMix);
      } catch (err) {
        console.error('Erro ao buscar vendedores/objetivos:', err);
        setVendedores([]);
      }
    })();
  }, []);

  const handleFinanceiroChange = (id, value) => {
    setObjetivosFinanceiros((prev) => ({ ...prev, [id]: value }));
  };

  const handleMixChange = (id, value) => {
    setObjetivosMix((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async () => {
    const dataFormatada = `${mesReferencia}-01`;
    const payload = {
      mes_referencia: dataFormatada,
      objetivos: vendedores.map((v) => ({
        vendedor_id: v.CodFuncionario,
        nome_vendedor: v.Nome, // seu endpoint retorna Nome (já conferimos no backend)
        objetivo_financeiro: parseFloat(objetivosFinanceiros[v.CodFuncionario]) || 0,
        objetivo_mix: parseFloat(objetivosMix[v.CodFuncionario]) || 0,
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

  const totalMix = Object.values(objetivosMix)
    .reduce((acc, v) => acc + (parseFloat(v) || 0), 0)
    .toFixed(2);

  return (
    <div className="register-container">
      <h2 className="register-title">Cadastro de Objetivos por Vendedor</h2>

      <div className="register-card register-form">
        <label>Mês de Referência:</label>
        <input
          type="month"
          value={mesReferencia}
          onChange={(e) => setMesReferencia(e.target.value)}
        />
      </div>

      <div className="register-card">
        <table className="register-table">
          <thead>
            <tr>
              <th>Vendedor</th>
              <th>Objetivo Financeiro (R$)</th>
              <th>Objetivo Mix</th>
            </tr>
          </thead>
          <tbody>
            {vendedores.map((v) => (
              <tr key={v.CodFuncionario}>
                <td>{v.Nome}</td>
                <td>
                  <input
                    type="number"
                    value={objetivosFinanceiros[v.CodFuncionario] || ''}
                    onChange={(e) => handleFinanceiroChange(v.CodFuncionario, e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={objetivosMix[v.CodFuncionario] || ''}
                    onChange={(e) => handleMixChange(v.CodFuncionario, e.target.value)}
                  />
                </td>
              </tr>
            ))}

            {/* Linha de totalização */}
            <tr className="register-total-row">
              <td>
                <strong>Total Empresa</strong>
              </td>
              <td>
                <strong>{totalFinanceiro}</strong>
              </td>
              <td>
                <strong>{totalMix}</strong>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="register-card register-form">
        <button onClick={handleSubmit}>Salvar Objetivos</button>
      </div>
    </div>
  );
};

export default RegisterObjetivosVendedores;
