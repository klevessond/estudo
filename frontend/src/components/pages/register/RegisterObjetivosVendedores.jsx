
import React, { useEffect, useState } from 'react';

const RegisterObjetivosVendedores = () => {
  const [vendedores, setVendedores] = useState([]);
  const [objetivos, setObjetivos] = useState({});
  const [mesReferencia, setMesReferencia] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetch('/todos-vendedores/', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setVendedores(data.detalhamento);
        const initialObjetivos = {};
        data.forEach(v => {
          initialObjetivos[v.vendedor_id] = '';
        });
        setObjetivos(initialObjetivos);
      });
  }, [token]);

  const handleChange = (id, value) => {
    setObjetivos(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async () => {
    const payload = {
      mes_referencia: mesReferencia,
      objetivos: vendedores.map(v => ({
        vendedor_id: v.CodFuncionario,
        nome_vendedor: v.Nome,
        objetivo_financeiro: parseFloat(objetivos[v.CodFuncionario]) || 0
      }))
    };

    const res = await fetch('/objetivos-vendedores/', {
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
          </tr>
        </thead>
        <tbody>
          {vendedores.map(v => (
            <tr key={v.CodFuncionario}>
              <td>{v.Nome}</td>
              <td>
                <input
                  type="number"
                  value={objetivos[v.CodFuncionario] || ''}
                  onChange={e => handleChange(v.CodFuncionario, e.target.value)}
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
