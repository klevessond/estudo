import React, { useState } from 'react';
import './register.css';

const Register = () => {
  const token = localStorage.getItem('token'); // ou como você estiver salvando
  const [financeiro, setFinanceiro] = useState('');
  const [mix, setMix] = useState('');
  const [mesReferencia, setMesReferencia] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      mes_referencia: mesReferencia,
    };

    if (financeiro) payload.objetivo_financeiro = financeiro;
    if (mix) payload.objetivo_mix = mix;

    try {
      const res = await fetch('http://localhost:8000/objetivos-mensais/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include', // importante se estiver usando autenticação por sessão/cookie
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert('Objetivos salvos com sucesso!');
        setFinanceiro('');
        setMix('');
        setMesReferencia('');
      } else {
        const erro = await res.json();
        alert('Erro ao salvar objetivos: ' + JSON.stringify(erro));
      }
    } catch (error) {
      console.error(error);
      alert('Erro na requisição.');
    }
  };

  return (
    <div className="register-container">
      <h2 className="register-title">Cadastro de Objetivos</h2>

      <form className="register-form" onSubmit={handleSubmit}>
        <label htmlFor="mes">Mês de Referência (Ex: 01-06-2025):</label>
        <input
          type="date"
          id="mes"
          value={mesReferencia}
          onChange={(e) => setMesReferencia(e.target.value)}
          required
        />

        <label htmlFor="financeiro">Objetivo Financeiro (R$):</label>
        <input
          type="number"
          id="financeiro"
          value={financeiro}
          onChange={(e) => setFinanceiro(e.target.value)}
          placeholder="Ex: 50000"
        />

        <label htmlFor="mix">Objetivo de MIX (Qtd. de Produtos):</label>
        <input
          type="number"
          id="mix"
          value={mix}
          onChange={(e) => setMix(e.target.value)}
          placeholder="Ex: 15"
        />

        <button type="submit">Salvar Objetivos</button>
      </form>
    </div>
  );
};

export default Register;
