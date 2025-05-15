import React from 'react';
import './IndicativosDeVenda.css';

const IndicadoresFiltro = ({ selected, onSelect, showMyIndexes, onToggleMyIndexes }) => {
  const buttons = ['Financeiro', 'Peso', 'Mix', 'Positivação'];

  return (
    <div className="indicativos-buttons">
      {buttons.map((btn) => (
        <button
          key={btn}
          className={`indicativo-button ${selected === btn ? 'active' : ''}`}
          onClick={() => onSelect(btn)}
        >
          {btn}
        </button>
      ))}
      <button
        className={`indicativo-button ${showMyIndexes ? 'active' : ''}`}
        onClick={onToggleMyIndexes}
      >
        Meus Índices
      </button>
    </div>
  );
};

export default IndicadoresFiltro;
