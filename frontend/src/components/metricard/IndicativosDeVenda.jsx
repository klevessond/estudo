import React, { useEffect, useState } from 'react';
import './IndicativosDeVenda.css';
import axios from 'axios';
import BarChartColaboradores from '../BarChart/BarChartColaboradores';

const Card = ({ title, value, subtitle, subtitle2, percentage, variation, icon }) => (
  <div className="indicativo-card">
    <div className="card-header">
      <h2>{title}</h2>
      {icon && <img src={icon} alt="Ícone" className="card-icon" />}
    </div>
    <div className="card-group">
      <p className="card-value">{value}</p>
      {subtitle && <p className="card-subtitle">{subtitle}</p>}
    </div>
    <div className="card-group">
      {percentage && <p className="card-percentage">{percentage}</p>}
      {subtitle2 && <p className="card-subtitle">{subtitle2}</p>}
    </div>
    {variation && <p className="card-variation">Variação: {variation}</p>}
  </div>
);

const IndicadoresCards = () => {
  const [peso, setPeso] = useState(null);

  useEffect(() => {
    const fetchPeso = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8000/objetivo-peso/', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const valor = response.data.objetivo_peso || 0;
        setPeso(valor.toLocaleString('pt-BR'));
      } catch (error) {
        console.error('Erro ao buscar o objetivo de peso:', error);
        setPeso('Erro');
      }
    };

    fetchPeso();
  }, []);

  return (
    <div className="indicativos-container">
      <div className="indicativo-stack">
        <Card title="Objetivo (R$)" value="38.525.281" />
        <Card title="Alocado" value="43,92%" subtitle="Evo % vs Ano Ant." />
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
      <Card
        title="Peso"
        value={peso ?? '...'}
        subtitle="Valor Captado"
        percentage="297,27%"
        subtitle2=" Cobertura Captado"
        variation="75.998.461"
      />
      <Card
        title="Positivado"
        value="114.523.742"
        subtitle="Valor Captado"
        percentage="297,27%"
        subtitle2=" Cobertura Captado"
        variation="75.998.461"
      />
      <Card
        title="MIX"
        value="114.523.742"
        subtitle="Valor Captado"
        percentage="297,27%"
        subtitle2=" Cobertura Captado"
        variation="75.998.461"
      />
      
    </div>
  );
};

export default IndicadoresCards;
