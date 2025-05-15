import React, { useState, useEffect } from 'react';
import './ResumoVendas.css';

const PeriodoSelector = ({ defaultValue, label = 'Selecionar período:', onChange }) => {
  // Mês corrente padrão (ex: '2025-05')
  const hoje = new Date();
  const mesCorrente = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`;
  const dataHoje = hoje.toISOString().split('T')[0];

  const [periodo, setPeriodo] = useState(() => {
    if (!defaultValue || typeof defaultValue !== 'object') return 'mes';
    return defaultValue.tipo;
  });

  const [mesAtual, setMesAtual] = useState(() => {
    if (defaultValue?.tipo === 'mes') return defaultValue.mes || mesCorrente;
    return mesCorrente;
  });

  const [dataInicio, setDataInicio] = useState(() => {
    if (defaultValue?.tipo === 'periodo') return defaultValue.de || '';
    return '';
  });

  const [dataFim, setDataFim] = useState(() => {
    if (defaultValue?.tipo === 'periodo') return defaultValue.ate || '';
    return '';
  });

  useEffect(() => {
    if (periodo === 'hoje') {
      onChange?.({ tipo: 'hoje', de: dataHoje, ate: dataHoje });
    } else if (periodo === 'mes') {
      onChange?.({ tipo: 'mes', mes: mesAtual });
    } else if (periodo === 'periodo') {
      onChange?.({ tipo: 'periodo', de: dataInicio, ate: dataFim });
    }
  }, [periodo, mesAtual, dataInicio, dataFim]);

  return (
    <div className="periodo-selector">
      <label className="periodo-label">{label}</label>
      <div className="botoes-periodo">
        <button
          className={`btn-periodo ${periodo === 'hoje' ? 'ativo' : ''}`}
          onClick={() => setPeriodo('hoje')}
        >
          Hoje
        </button>
        <button
          className={`btn-periodo ${periodo === 'mes' ? 'ativo' : ''}`}
          onClick={() => setPeriodo('mes')}
        >
          Mês
        </button>
        <button
          className={`btn-periodo ${periodo === 'periodo' ? 'ativo' : ''}`}
          onClick={() => setPeriodo('periodo')}
        >
          Período
        </button>
      </div>

      {periodo === 'mes' && (
        <div className="campos-periodo">
          <input
            type="month"
            className="input-periodo"
            value={mesAtual}
            onChange={(e) => setMesAtual(e.target.value)}
          />
        </div>
      )}

      {periodo === 'periodo' && (
        <div className="campos-periodo">
          <label>De:</label>
          <input
            type="date"
            className="input-periodo"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
          />
          <label>Até:</label>
          <input
            type="date"
            className="input-periodo"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
          />
        </div>
      )}
    </div>
  );
};

export default PeriodoSelector;
