import React, { useState } from 'react';
import './ResumoVendas.css';

const PeriodoSelector = ({ defaultValue, label = 'Selecionar período:', onChange }) => {
  const hoje = new Date();
  const mesCorrente = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`;
  const dataHoje = hoje.toISOString().split('T')[0];

  const [periodo, setPeriodo] = useState('mes');
  const [mesAtual, setMesAtual] = useState(mesCorrente);
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  const aplicarPeriodo = () => {
    if (periodo === 'hoje') {
    console.log('ENVIANDO HOJE', dataHoje);
    onChange?.({ tipo: 'periodo', de: dataHoje, ate: dataHoje });
  } else if (periodo === 'mes') {
    const [ano, mes] = mesAtual.split('-');
    const de = `${ano}-${mes}-01`;
    const ate = new Date(ano, mes, 0).toISOString().split('T')[0];
    console.log('ENVIANDO MÊS', de, ate);
    onChange?.({ tipo: 'periodo', de, ate });
  } else if (periodo === 'periodo' && dataInicio && dataFim) {
    console.log('ENVIANDO PERÍODO', dataInicio, dataFim);
    onChange?.({ tipo: 'periodo', de: dataInicio, ate: dataFim });
  }
};

  return (
    <div className="periodo-selector">
      <label className="periodo-label">{label}</label>
      <div className="botoes-periodo">
        <button className={`btn-periodo ${periodo === 'hoje' ? 'ativo' : ''}`} onClick={() => setPeriodo('hoje')}>
          Hoje
        </button>
        <button className={`btn-periodo ${periodo === 'mes' ? 'ativo' : ''}`} onClick={() => setPeriodo('mes')}>
          Mês
        </button>
        <button className={`btn-periodo ${periodo === 'periodo' ? 'ativo' : ''}`} onClick={() => setPeriodo('periodo')}>
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

      <button onClick={aplicarPeriodo} className="btn-aplicar">Aplicar</button>
    </div>
  );
};

export default PeriodoSelector;
