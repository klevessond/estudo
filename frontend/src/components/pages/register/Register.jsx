import React, { useEffect, useState } from 'react';

const RegisterObjetivosVendedores = () => {
  const [vendedores, setVendedores] = useState([]);
  const [objetivosFinanceiros, setObjetivosFinanceiros] = useState({});
  const [objetivosMix, setObjetivosMix] = useState({});
  const [mesReferencia, setMesReferencia] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const dataInicio = firstDay.toISOString().split('T')[0];
  const dataFim = lastDay.toISOString().split('T')[0];

  const mesReferenciaAtual = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`;
  setMesReferencia(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`);

  // Primeiro busca os vendedores
  fetch(`http://localhost:8000/vendas-por-vendedor/?de=${dataInicio}&ate=${dataFim}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(async data => {
      const lista = data.resultado?.vendas_por_vendedor || [];
      setVendedores(lista);

      const objetivosFinanceirosTemp = {};
      const objetivosMixTemp = {};

      // Busca objetivos já cadastrados
      const resposta = await fetch(`http://localhost:8000/objetivos-vendedores/?mes_referencia=${mesReferenciaAtual}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const dados = await resposta.json();
      const existentes = dados.objetivos || [];

      // Preenche os campos com base nos objetivos existentes
      lista.forEach(v => {
        const objExistente = existentes.find(e => e.vendedor_id === v.codcampo);
        objetivosFinanceirosTemp[v.codcampo] = objExistente ? objExistente.objetivo_financeiro : '';
        objetivosMixTemp[v.codcampo] = objExistente ? objExistente.objetivo_mix : '';
      });

      setObjetivosFinanceiros(objetivosFinanceirosTemp);
      setObjetivosMix(objetivosMixTemp);
    })
    .catch(err => {
      console.error("Erro ao buscar vendedores ou objetivos existentes:", err);
      setVendedores([]);
    });
}, [token]);

  const handleFinanceiroChange = (id, value) => {
    setObjetivosFinanceiros(prev => ({ ...prev, [id]: value }));
  };

  const handleMixChange = (id, value) => {
    setObjetivosMix(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async () => {
    const dataFormatada = `${mesReferencia}-01`;
    const payload = {
      mes_referencia: dataFormatada,
      objetivos: vendedores.map(v => ({
        vendedor_id: v.codcampo,
        nome_vendedor: v.Campo.trim(),
        objetivo_financeiro: parseFloat(objetivosFinanceiros[v.codcampo]) || 0,
        objetivo_mix: parseFloat(objetivosMix[v.codcampo]) || 0
      }))
    };

    const res = await fetch('http://localhost:8000/objetivos-vendedores/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      alert('Objetivos cadastrados com sucesso!');
    } else {
      alert('Erro ao cadastrar objetivos.');
    }
  };

  return (
    <div>
      <h2>Cadastro de Objetivos por Vendedor</h2>
      <label>Mês de Referência:</label>
      <input type="month" value={mesReferencia} onChange={e => setMesReferencia(e.target.value)} />

      <table>
        <thead>
          <tr>
            <th>Vendedor</th>
            <th>Objetivo Financeiro (R$)</th>
            <th>Objetivo Mix</th>
          </tr>
        </thead>
        <tbody>
          {vendedores.map(v => (
            <tr key={v.codcampo}>
              <td>{v.Campo.trim()}</td>
              <td>
                <input
                  type="number"
                  value={objetivosFinanceiros[v.codcampo] || ''}
                  onChange={e => handleFinanceiroChange(v.codcampo, e.target.value)}
                />
              </td>
              <td>
                <input
                  type="number"
                  value={objetivosMix[v.codcampo] || ''}
                  onChange={e => handleMixChange(v.codcampo, e.target.value)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={handleSubmit}>Salvar Objetivos</button>
    </div>
  );
};

export default RegisterObjetivosVendedores;
