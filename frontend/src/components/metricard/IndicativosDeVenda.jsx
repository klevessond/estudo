import React, { useState } from 'react';
import './IndicativosDeVenda.css';

const Card = ({ title, value, subtitle,subtitle2, percentage, variation, icon }) => {
  return (
    <div className="indicativo-card">
      <div className="card-header">
        <h2>{title}</h2>
        {icon && <img src={icon} alt="Ícone" className="card-icon" />}
      </div>
      <p className="card-value">{value}</p>
      {subtitle && <p className="card-subtitle">{subtitle}</p>}
      {percentage && <p className="card-percentage">{percentage}</p>}
      {subtitle2 && <p className="card-subtitle">{subtitle2}</p>}
      {variation && <p className="card-variation">Variação: {variation}</p>}
    </div>
  );
};

const IndicativosDeVenda = () => {
  const [selected, setSelected] = useState('Financeiro');

  const buttons = ['Financeiro', 'Peso', 'Mix', 'Positivação'];

  return (
    <div className="indicativos-wrapper">
      <div className="indicativos-buttons">
        {buttons.map((btn) => (
          <button
            key={btn}
            className={`indicativo-button ${selected === btn ? 'active' : ''}`}
            onClick={() => setSelected(btn)}
          >
            {btn}
          </button>
        ))}
      </div>

      <div className="indicativos-container">
        <div className="indicativo-stack">
          <Card
            title="Objetivo (R$)"
            value="38.525.281"
          />
          <Card
            title="Alocado"
            value="43,92%"
            subtitle={<span>Evo % vs Ano Ant.</span>}
          />
        </div>

        <Card
          title="Realizado"
          value="32.715.084"
          subtitle="Faturamento"
          percentage="84,92%"
          subtitle2=" Cobertura Atual"
          variation="-5.810.197"
        />
        <Card
          title="Alocações"
          value="44.511.059"
          subtitle="Fat + A Faturar"
          percentage="115,54%"
          subtitle2=" Cobertura Prevista"
          variation="5.985.778"
        />
        <Card
          title="Captado"
          value="114.523.742"
          subtitle="Valor Captado"
          percentage="297,27%"
          subtitle2=" Cobertura Captado"
          variation="75.998.461"
          
        />
      </div>
    </div>
  );
};

export default IndicativosDeVenda;