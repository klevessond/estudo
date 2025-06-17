import React, { useEffect, useState } from 'react';
import './IndicativosDeVenda.css';
import axios from 'axios';
import api from '../../api';
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
        <div className="card-group">
      <p className="card-value">{value2}</p>
    
    </div>
    <div className="card-subtitle">
        {title2}
      {icon && <img src={icon} alt="Ícone" className="card-icon" />}
    </div>
    <div className="card-group">
      {percentage && <p className="card-percentage">{percentage}</p>}
      {subtitle2 && <p className="card-subtitle">{subtitle2}</p>}
    </div>
    {variation && <p className="card-variation"> {variation} Variação</p>}
  </div>
);

const IndicadoresCards = ({ periodoSelecionado,usarPDV   }) => {
const [loading, setLoading] = useState(false);

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
  const [vendaPercentual, setVendaPercentual] = useState(null);
  const [vendaVariacao, setVendaVariacao] = useState(null);
  const [evolucaoAnoAnterior, setEvolucaoAnoAnterior] = useState(null);

  //MIX
  const [mixRealizado, setMixRealizado] = useState(null);
  const [mixPercentual, setMixPercentual] = useState(null);
  const [mixVariacao, setMixVariacao] = useState(null);
  
  // OBJETIVOS MENSAIS
  const [objetivoFinanceiro, setObjetivoFinanceiro] = useState(null);
  const [objetivoMix, setObjetivoMix] = useState(null);

  //PRE-VENDA
  const [alocacaoRealizada, setAlocacaoRealizada] = useState(null);
  const [alocacaoPrevenda, setAlocacaoPrevenda] = useState(null);
  const [alocacaoPercentual, setAlocacaoPercentual] = useState(null);
  const [alocacaoVariacao, setAlocacaoVariacao] = useState(null);




   useEffect(() => {
    const fetchIndicadores  = async () => {
      console.log(periodoSelecionado)
      const { de, ate } = periodoSelecionado;
        setLoading(true); // Ativa o loading

        try {
          const token = localStorage.getItem('token');

          // Adiciona o parâmetro 
          const response = await api.get(`http://localhost:8000/Indicadores/?de=${de}&ate=${ate}`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
        });
        // Objetivo Mensal (sqlite)
      //const objetivoResponse = await axios.get(`http://localhost:8000/objetivo-mensal-resumo/?de=${de}`, {
        //headers: { Authorization: `Bearer ${token}` }
     // });

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

        
        // Dados de VENDAS REALIZADAS
        const realizadoFinanceiro = response.data.realizado_financeiro || {};
        const valorVenda = realizadoFinanceiro.valor || 0;
        const percentualVenda = realizadoFinanceiro.percentual_cobertura || 0;
        const variacaoVenda = realizadoFinanceiro.variacao || 0;
        const evolucao = response.data.evolucao.percentual || 0;

        
        setVendaRealizada(valorVenda.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));
        setVendaPercentual(`${percentualVenda.toFixed(2)}%`);
        setVendaVariacao(Math.abs(variacaoVenda).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));
        setEvolucaoAnoAnterior(`${(evolucao).toFixed(2)}%`);

        // OBJETIVO FINANCEIRO E MIX (vindo do response principal)
        const objetivoFin = response.data.objetivo?.financeiro || 0;
        const objetivoMixValor = response.data.objetivo?.objetivo_mix || 0;

        setObjetivoFinanceiro(objetivoFin.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));
        setObjetivoMix(objetivoMixValor.toString());

        // MIX
        const realizadoMix = response.data.realizado_mix?.realizado || 0;
        const percentualMix = response.data.realizado_mix?.percentual || 0;
        const variacaoMix = response.data.realizado_mix?.variacao || 0;

        setMixRealizado(realizadoMix.toString());
        setMixPercentual(`${percentualMix.toFixed(2)}%`);
        setMixVariacao(variacaoMix.toString());


        // PRE-VENDA
          const alocacao = response.data['pre-venda'] || {};
          const valorAlocado = alocacao.valor_alocado || 0;
          const valorPrevenda = alocacao.valor_prevenda || 0;
          const percentualAlocado = alocacao.percentual_prevenda_alocado || 0;
          const variacaoPrevenda = alocacao.variacao_prevenda || 0;

          setAlocacaoRealizada(valorAlocado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));
          setAlocacaoPrevenda(valorPrevenda.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));
          setAlocacaoPercentual(`${percentualAlocado.toFixed(2)}%`);
          setAlocacaoVariacao(Math.abs(variacaoPrevenda).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));


      } catch (error) {
        console.error('Erro ao buscar o objetivo de peso:', error);
        setPeso('Erro');
      } 
    finally {
        setLoading(false); // Desativa o loading mesmo com erro
      }
    };

    if (periodoSelecionado?.de && periodoSelecionado?.ate) {
      fetchIndicadores ();
    }
  }, [periodoSelecionado]);

  useEffect(() => {
  const fetchPDV = async () => {
    if (!usarPDV  || !periodoSelecionado?.de || !periodoSelecionado?.ate) return;

    try {
      const token = localStorage.getItem('token');
      const { de, ate } = periodoSelecionado;

      const responsePDV = await api.get(`http://localhost:8000/indicadores/pdv/?de=${de}&ate=${ate}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const valorPDV = responsePDV.data.venda_realizada || 0;

      // Soma ao valor já exibido
      const valorAtual = parseFloat(
        (vendaRealizada ?? '0')
          .replace(/\./g, '')
          .replace('R$', '')
          .replace(',', '.')
      ) || 0;

      const totalSomado = valorAtual + valorPDV;

      setVendaRealizada(totalSomado.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }));
    } catch (err) {
      console.error("Erro ao buscar vendas de PDV:", err);
    }
  };

  fetchPDV();
}, [usarPDV ]);


  return (

    <div style={{ position: 'relative' }}>
    {loading && (
      <div className="overlay-loader">
        <div className="spinner"></div>
      </div>
    )}

    <div className="indicativos-container">
      <div className="indicativo-stack">
        <Card title="Objetivo (R$)" value={objetivoFinanceiro ?? '...'} />
        <Card title="Evo % vs Ano Ant." value={evolucaoAnoAnterior ?? '...'} />
      </div>

      <Card
        title="Venda Realizada"
        value={vendaRealizada ?? '...'}
        subtitle="Faturamento"
        percentage={vendaPercentual ?? '...'}
        subtitle2=" Cobertura Atual"
        variation={vendaVariacao ?? '...'}
      />
      <Card
        title="Alocações"
        value={alocacaoRealizada ?? '...'}
        subtitle="Fat + A Faturar"
        title2="Pré-Venda"
        value2={alocacaoPrevenda ?? '...'}
        percentage={alocacaoPercentual ?? '...'}
        subtitle2=" Cobertura Prevista"
        variation={alocacaoVariacao ?? '...'}
      />
      <Card
        title="Captado"
        value="0"
        subtitle="Valor Captado"
        percentage="0%"
        subtitle2=" Cobertura"
        variation="0"
      />
      <Card
        title="Peso"
        value={peso ?? '...'}
        subtitle="OBJETIVO KG"
        title2="Realizado KG"
        value2={pesoRealizado ?? '...'}
        percentage={pesoPercentual}
        subtitle2=" Cobertura"
        variation={pesoVariacao}
      />
      <Card
        title="Positivado"
        value={positivadoObjetivo  ?? '...'}
        subtitle="OBJETIVO"
        value2={positivadoRealizado ?? '...'}
        title2="Realizado"
        percentage={positivadoPercentual}
        subtitle2=" Cobertura"
        variation={positivadoVariacao}
      />
      <Card
        title="MIX"
        value={objetivoMix ?? '...'}
        subtitle="OBJETIVO"
        value2={mixRealizado ?? '--'}
        title2="Realizado"
        percentage={mixPercentual ?? '--'}
        subtitle2=" Cobertura"
        variation={mixVariacao ?? '...'}
      />
            
    </div>
    </div>
  );
};

export default IndicadoresCards;
