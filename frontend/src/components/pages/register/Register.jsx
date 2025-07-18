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

    fetch(`http://localhost:8000/vendas-por-vendedor/?de=${dataInicio}&ate=${dataFim}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        const lista = data.resultado?.vendas_por_vendedor || [];
        setVendedores(lista);
        const objetivos = {};
        const mix = {};
        lista.forEach(v => {
          objetivos[v.codcampo] = '';
          mix[v.codcampo] = '';
        });
        setObjetivosFinanceiros(objetivos);
        setObjetivosMix(mix);
      })
      .catch(err => {
        console.error("Erro ao buscar vendedores:", err);
        setVendedores([]);
      });
  }, [token]);

  const handleFinanceiroChange = (id, value) => {
    setObjetivosFinanceiros(prev => ({ ...prev, [id]: value }));
  };

  const handleMixChange = (id, value) => {
    setObjetivosMix(prev => ({ ...prev, [id]: value }));
  };
  const dataFormatada = `${mesReferencia}-01`; // Adiciona o dia 01
  const handleSubmit = async () => {
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
