import React, { useState } from 'react';
import './register.css';

const Register = () => {
  const [financeiro, setFinanceiro] = useState('');
  const [mix, setMix] = useState('');

  const handleSubmitFinanceiro = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:8000/api/objetivo-financeiro/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ valor: financeiro }),
      });
      if (res.ok) {
        alert('Objetivo financeiro cadastrado com sucesso!');
        setFinanceiro('');
      } else {
        alert('Erro ao cadastrar objetivo financeiro.');
      }
    } catch (error) {
      console.error(error);
      alert('Erro na requisição.');
    }
  };

  const handleSubmitMix = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:8000/api/objetivo-mix/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ valor: mix }),
      });
      if (res.ok) {
        alert('Objetivo de mix cadastrado com sucesso!');
        setMix('');
      } else {
        alert('Erro ao cadastrar objetivo de mix.');
      }
    } catch (error) {
      console.error(error);
      alert('Erro na requisição.');
    }
  };

  return (
    <div className="register-container">
      <h2 className="register-title">Cadastro de Objetivos</h2>

      <div className="register-card">
        <form className="register-form" onSubmit={handleSubmitFinanceiro}>
          <label htmlFor="financeiro">Objetivo Financeiro (R$):</label>
          <input
            type="number"
            id="financeiro"
            value={financeiro}
            onChange={(e) => setFinanceiro(e.target.value)}
            placeholder="Ex: 50000"
            required
          />
          <button type="submit">Salvar Objetivo Financeiro</button>
        </form>
      </div>

      <div className="register-card">
        <form className="register-form" onSubmit={handleSubmitMix}>
          <label htmlFor="mix">Objetivo de MIX (Qtd. de Produtos):</label>
          <input
            type="number"
            id="mix"
            value={mix}
            onChange={(e) => setMix(e.target.value)}
            placeholder="Ex: 15"
            required
          />
          <button type="submit">Salvar Objetivo de MIX</button>
        </form>
      </div>
    </div>
  );
};

export default Register;
