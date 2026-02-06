import React, { useState, useEffect } from 'react';
import api from '../../../api';
import './Feriados.css'; // Vamos criar o CSS abaixo

const Feriados = () => {
  const [feriados, setFeriados] = useState([]);
  const [novaData, setNovaData] = useState('');
  const [descricao, setDescricao] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  // Carregar feriados ao abrir a tela
  useEffect(() => {
    carregarFeriados();
  }, []);

  const carregarFeriados = async () => {
    try {
      const res = await api.get('/feriados/');
      // Ordenar por data (do backend já vem, mas garantindo)
      const sorted = res.data.sort((a, b) => new Date(a.data) - new Date(b.data));
      setFeriados(sorted);
    } catch (error) {
      console.error("Erro ao buscar feriados", error);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!novaData || !descricao) return;
    setErro('');
    setLoading(true);

    try {
      await api.post('/feriados/', {
        data: novaData,
        descricao: descricao
      });
      // Limpa form e recarrega
      setNovaData('');
      setDescricao('');
      carregarFeriados();
    } catch (error) {
      if (error.response?.data?.data) {
        setErro("Já existe um feriado nesta data.");
      } else {
        setErro("Erro ao cadastrar feriado.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Deseja realmente excluir este feriado?")) return;
    
    try {
      await api.delete(`/feriados/${id}/`);
      setFeriados(feriados.filter(f => f.id !== id));
    } catch (error) {
      alert("Erro ao excluir.");
    }
  };

  // Formata data para exibir PT-BR (ajustando fuso horário simples)
  const formatarData = (dataIso) => {
    const [ano, mes, dia] = dataIso.split('-');
    return `${dia}/${mes}/${ano}`;
  };

  return (
    <div className="feriados-container">
      <h2>📅 Cadastro de Feriados</h2>
      <p className="subtitle">Defina os dias não úteis para ajustar o cálculo de projeção.</p>

      {/* Formulário de Adição */}
      <div className="feriado-card form-card">
        <form onSubmit={handleAdd} className="feriado-form">
          <div className="form-group">
            <label>Data:</label>
            <input 
              type="date" 
              value={novaData} 
              onChange={(e) => setNovaData(e.target.value)} 
              required 
            />
          </div>
          <div className="form-group">
            <label>Descrição:</label>
            <input 
              type="text" 
              placeholder="Ex: Natal, Carnaval..." 
              value={descricao} 
              onChange={(e) => setDescricao(e.target.value)} 
              required 
            />
          </div>
          <button type="submit" disabled={loading} className="btn-add">
            {loading ? 'Salvando...' : 'Adicionar Feriado'}
          </button>
        </form>
        {erro && <p className="error-msg">{erro}</p>}
      </div>

      {/* Lista de Feriados */}
      <div className="feriado-card list-card">
        <h3>Feriados Cadastrados ({feriados.length})</h3>
        <div className="table-responsive">
          <table className="feriados-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Descrição</th>
                <th style={{textAlign: 'center'}}>Ação</th>
              </tr>
            </thead>
            <tbody>
              {feriados.length === 0 ? (
                <tr>
                  <td colSpan="3" style={{textAlign: 'center', padding: '20px'}}>
                    Nenhum feriado cadastrado.
                  </td>
                </tr>
              ) : (
                feriados.map((f) => (
                  <tr key={f.id}>
                    <td>{formatarData(f.data)}</td>
                    <td>{f.descricao}</td>
                    <td style={{textAlign: 'center'}}>
                      <button 
                        className="btn-delete" 
                        onClick={() => handleDelete(f.id)}
                        title="Excluir"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Feriados;