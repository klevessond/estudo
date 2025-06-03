import React, { useEffect, useState } from 'react';
import './IndicativosDeVenda.css';
import axios from 'axios';
import BarChartColaboradores from '../BarChart/BarChartColaboradores';

const Card = ({ title,title2, value,value2, subtitle, subtitle2, percentage, variation, icon }) => (
  <div className="indicativo-card">
    <div className="card-header">
      <h2>{title}</h2>
      {icon && <img src={icon} alt="Ícone" className="card-icon" />}
    </div>
    <div className="card-group">
      <p className="card-value">{value}</p>
      {subtitle && <p className="card-subtitle">{subtitle}</p>}
    </div>
    <div className="card-header">
      <h2>{title2}</h2>
      {icon && <img src={icon} alt="Ícone" className="card-icon" />}
    </div>
    <div className="card-group">
      <p className="card-value">{value2}</p>
    
    </div>
    <div className="card-group">
      {percentage && <p className="card-percentage">{percentage}</p>}
      {subtitle2 && <p className="card-subtitle">{subtitle2}</p>}
    </div>
    {variation && <p className="card-variation">Variação: {variation}</p>}
  </div>
);

const IndicadoresCards = ({ periodoSelecionado }) => {
  //PESO
  const [peso, setPeso] = useState(null);
  const [pesoPercentual, setPesoPercentual] = useState(null);
  const [pesoVariacao, setPesoVariacao] = useState(null);
  const [pesoRealizado, setPesoRealizado] = useState(null);
  //POSITIVACAO
  const [positivadoObjetivo, setPositivadoObjetivo] = useState('');
  const [positivadoRealizado, setPositivadoRealizado] = useState(null);
  const [positivadoPercentual, setPositivadoPercentual] = useState(null);
  const [positivadoVariacao, setPositivadoVariacao] = useState(null);
  //VENDA
  const [vendaRealizada, setVendaRealizada] = useState(null);
  // OBJETIVOS MENSAIS
  const [objetivoFinanceiro, setObjetivoFinanceiro] = useState(null);
  const [objetivoMix, setObjetivoMix] = useState(null);



   useEffect(() => {
    const fetchIndicadores  = async () => {
        const { de, ate } = periodoSelecionado;
        console.log('ENVIANDO PARA BACKEND:', de, ate);
      try {
        const token = localStorage.getItem('token');
        const { de, ate } = periodoSelecionado;
        const response = await axios.get(`http://localhost:8000/Indicadores/?de=${de}&ate=${ate}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        // Objetivo Mensal (sqlite)
      const objetivoResponse = await axios.get(`http://localhost:8000/objetivo-mensal-resumo/?de=${de}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

        //PESO
        const percentual = response.data.realizado_peso?.percentual || 0;
        const variacao = response.data.realizado_peso?.variacao || 0;
        const valor = response.data.objetivo?.objetivo_peso || 0;
        const realizado = response.data.vendas?.peso_realizado || 0;

        setPesoRealizado(realizado.toLocaleString('pt-BR', { minimumFractionDigits: 2 }));
        setPeso(valor.toLocaleString('pt-BR'));
        setPesoPercentual(`${percentual.toFixed(2)}%`);
        setPesoVariacao(variacao.toLocaleString('pt-BR', { minimumFractionDigits: 2 }));

        //POSITIVACAO
        const positivado = response.data.positivacao?.realizado || 0;
        const percentualPos = response.data.positivacao?.percentual || 0;
        const variacaoPos = response.data.positivacao?.variacao || 0;
        const objetivoPos = response.data.objetivo?.objetivo_positivacao || 0;

        setPositivadoObjetivo(objetivoPos.toLocaleString('pt-BR'));
        setPositivadoRealizado(positivado.toLocaleString('pt-BR'));
        setPositivadoPercentual(`${percentualPos.toFixed(2)}%`);
        setPositivadoVariacao(variacaoPos.toLocaleString('pt-BR'));

        //VENDA
        const vendaReal = response.data.vendas?.venda_realizada || 0;
        setVendaRealizada(vendaReal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));

        // OBJETIVO FINANCEIRO E MIX (vindo do response principal)
        const objetivoFin = response.data.objetivo?.financeiro || 0;
        const objetivoMixValor = response.data.objetivo?.objetivo_mix || 0;

        setObjetivoFinanceiro(objetivoFin.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));
        setObjetivoMix(objetivoMixValor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));


      } catch (error) {
        console.error('Erro ao buscar o objetivo de peso:', error);
        setPeso('Erro');
      }
    };

    if (periodoSelecionado?.de && periodoSelecionado?.ate) {
      fetchIndicadores ();
    }
  }, [periodoSelecionado]);

  
  return (
    <div className="indicativos-container">
      <div className="indicativo-stack">
        <Card title="Objetivo (R$)" value={objetivoFinanceiro ?? '...'} />
        <Card title="Alocado" value="43,92%" subtitle="Evo % vs Ano Ant." />
      </div>

      <Card
        title="Venda Realizada"
        value={vendaRealizada ?? '...'}
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
        subtitle="OBJETIVO"
        title2="Realizado"
        value2={pesoRealizado ?? '...'}
        percentage={pesoPercentual}
        subtitle2=" Cobertura do Realizado"
        variation={pesoVariacao}
      />
      <Card
        title="Positivado"
        value={positivadoObjetivo  ?? '...'}
        subtitle="OBJETIVO"
        title2="Realizado"
        value2={positivadoRealizado ?? '...'}
        percentage={positivadoPercentual}
        subtitle2=" Cobertura do Realizado"
        variation={positivadoVariacao}
      />
      <Card
        title="MIX"
        value={objetivoMix ?? '...'}
        subtitle="Objetivo de Mix"
        title2="Realizado"
        value2="--"
        percentage="297,27%"
        subtitle2=" Cobertura Captado"
        variation="75.998.461"
      />
      
    </div>
  );
};

export default IndicadoresCards;
