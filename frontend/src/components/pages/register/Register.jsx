import './register.css'
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
  fetch(`http://localhost:8000/todos-vendedores/`, {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(async data => {
      const lista = data.detalhamento || [];
      setVendedores(lista);

      const objetivosFinanceirosTemp = {};
      const objetivosMixTemp = {};

      // Busca objetivos já cadastrados
      const resposta = await fetch(`http://localhost:8000/objetivos-vendedores/?mes_referencia=${mesReferenciaAtual}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const dados = await resposta.json();
      const existentes = dados.objetivos || [];

      console.log("Dados da API de objetivos:", dados);
console.log("Objetivos existentes:", existentes);
console.log("Lista de vendedores:", lista);


      // Preenche os campos com base nos objetivos existentes
      lista.forEach(v => {
        const objExistente = existentes.find(e => Number(e.vendedor_id) === v.CodFuncionario);
         console.log(`Vendedor ${v.Nome} (ID: ${v.CodFuncionario}) - Encontrado:`, objExistente);
        objetivosFinanceirosTemp[v.CodFuncionario] = objExistente ? objExistente.objetivo_financeiro : '';
        objetivosMixTemp[v.CodFuncionario] = objExistente ? objExistente.objetivo_mix : '';
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
        vendedor_id: v.CodFuncionario,
        nome_vendedor: v.Nome,
        objetivo_financeiro: parseFloat(objetivosFinanceiros[v.CodFuncionario]) || 0,
        objetivo_mix: parseFloat(objetivosMix[v.CodFuncionario]) || 0
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
  <div className="register-container">
    <h2 className="register-title">Cadastro de Objetivos por Vendedor</h2>

    <div className="register-card register-form">
      <label>Mês de Referência:</label>
      <input type="month" value={mesReferencia} onChange={e => setMesReferencia(e.target.value)} />
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
    {vendedores.map(v => (
      <tr key={v.CodFuncionario}>
        <td>{v.Nome}</td>
        <td>
          <input
            type="number"
            value={objetivosFinanceiros[v.CodFuncionario] || ''}
            onChange={e => handleFinanceiroChange(v.CodFuncionario, e.target.value)}
          />
        </td>
        <td>
          <input
            type="number"
            value={objetivosMix[v.CodFuncionario] || ''}
            onChange={e => handleMixChange(v.CodFuncionario, e.target.value)}
          />
        </td>
      </tr>
    ))}

    {/* Linha de totalização */}
    <tr className="register-total-row">
      <td><strong>Total Empresa</strong></td>
      <td>
        <strong>
          {Object.values(objetivosFinanceiros).reduce((acc, val) => acc + (parseFloat(val) || 0), 0).toFixed(2)}
        </strong>
      </td>
      <td>
        <strong>
          {Object.values(objetivosMix).reduce((acc, val) => acc + (parseFloat(val) || 0), 0).toFixed(2)}
        </strong>
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
