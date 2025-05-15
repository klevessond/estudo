import React, { useState } from 'react';
import './ResumoVendas.css';

const PeriodoSelector = ({ onChange }) => {
  const [periodoSelecionado, setPeriodoSelecionado] = useState('mes');
  const [mesAtual, setMesAtual] = useState(() => {
    const hoje = new Date();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const ano = hoje.getFullYear();
    return `${ano}-${mes}`;
  });
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  const handlePeriodoChange = (periodo) => {
    setPeriodoSelecionado(periodo);
    if (periodo === 'hoje') {
      const hoje = new Date().toISOString().split('T')[0];
      onChange({ tipo: 'hoje', de: hoje, ate: hoje });
    } else if (periodo === 'mes') {
      onChange({ tipo: 'mes', mes: mesAtual });
    } else {
      onChange({ tipo: 'periodo', de: dataInicio, ate: dataFim });
    }
  };

  const renderCamposData = () => {
    if (periodoSelecionado === 'mes') {
      return (
        <div className="campos-periodo">
          <input
            type="month"
            className="input-periodo"
            value={mesAtual}
            onChange={(e) => {
              setMesAtual(e.target.value);
              onChange({ tipo: 'mes', mes: e.target.value });
            }}
          />
        </div>
      );
    }

    if (periodoSelecionado === 'periodo') {
      return (
        <div className="campos-periodo">
          <label>De:</label>
          <input
            type="date"
            className="input-periodo"
            value={dataInicio}
            onChange={(e) => {
              setDataInicio(e.target.value);
              onChange({ tipo: 'periodo', de: e.target.value, ate: dataFim });
            }}
          />
          <label>Até:</label>
          <input
            type="date"
            className="input-periodo"
            value={dataFim}
            onChange={(e) => {
              setDataFim(e.target.value);
              onChange({ tipo: 'periodo', de: dataInicio, ate: e.target.value });
            }}
          />
        </div>
      );
    }

    return null;
  };

  return (
    <div className="periodo-selector">
      <label className="periodo-label">Selecionar período:</label>
      <div className="botoes-periodo">
        {['hoje', 'mes', 'periodo'].map((tipo) => (
          <button
            key={tipo}
            className={`btn-periodo ${periodoSelecionado === tipo ? 'ativo' : ''}`}
            onClick={() => handlePeriodoChange(tipo)}
          >
            {tipo === 'hoje' ? 'Hoje' : tipo === 'mes' ? 'Mês' : 'Período'}
          </button>
        ))}
      </div>
      {renderCamposData()}
    </div>
  );
};

export default PeriodoSelector;
