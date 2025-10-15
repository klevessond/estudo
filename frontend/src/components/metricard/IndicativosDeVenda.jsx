import React, { useEffect, useState } from 'react';
import './IndicativosDeVenda.css';
import ReactSpeedometer from 'react-d3-speedometer';
import api from '../../api';
import BarChartColaboradores from '../BarChart/BarChartColaboradores';

const Card = ({ title, title2, value, value2, subtitle, subtitle2, percentage, variation, icon, className }) => (
  <div className={`indicativo-card ${className || ''}`}>
    <div className="card-header">
      <h2>{title}</h2>
      {icon && <img src={icon} alt="Ícone" className="card-icon" />}
    </div>
    <div className="card-group">
      <div className="card-value">{value}</div>
      {subtitle && <p className="card-subtitle">{subtitle}</p>}
    </div>
    <div className="card-group">
      <div className="card-value">{value2}</div>
    </div>
    <div className="card-subtitle">
      {title2}
      {icon && <img src={icon} alt="Ícone" className="card-icon" />}
    </div>
    <div className="card-group">
      {percentage && <p className="card-percentage">{percentage}</p>}
      {subtitle2 && <p className="card-subtitle">{subtitle2}</p>}
    </div>
    {variation && <p className="card-variation"> {variation} Desvio</p>}
  </div>
);

const IndicadoresCards = ({ periodoSelecionado, usarPDV, onObjetivosRecebidos }) => {
  const [loading, setLoading] = useState(false);

  // --- estados exibidos nos cards/gauges ---
  const [peso, setPeso] = useState(null);
  const [pesoPercentual, setPesoPercentual] = useState(null);
  const [pesoVariacao, setPesoVariacao] = useState(null);
  const [pesoRealizado, setPesoRealizado] = useState(null);

  const [positivadoObjetivo, setPositivadoObjetivo] = useState('');
  const [positivadoRealizado, setPositivadoRealizado] = useState(null);
  const [positivadoPercentual, setPositivadoPercentual] = useState(null);
  const [positivadoVariacao, setPositivadoVariacao] = useState(null);

  const [vendaRealizada, setVendaRealizada] = useState(null);
  const [vendaPercentual, setVendaPercentual] = useState(null);
  const [vendaVariacao, setVendaVariacao] = useState(null);

  const [evolucaoAnoAnterior, setEvolucaoAnoAnterior] = useState(null);
  const [evolucaoValor, setEvolucaoValor] = useState(null);

  const [mixRealizado, setMixRealizado] = useState(null);
  const [mixPercentual, setMixPercentual] = useState(null);
  const [mixVariacao, setMixVariacao] = useState(null);

  const [objetivoFinanceiro, setObjetivoFinanceiro] = useState(null);
  const [objetivoMix, setObjetivoMix] = useState(null);

  const [alocacaoRealizada, setAlocacaoRealizada] = useState(null);
  const [alocacaoPrevenda, setAlocacaoPrevenda] = useState(null);
  const [alocacaoPercentual, setAlocacaoPercentual] = useState(null);
  const [alocacaoVariacao, setAlocacaoVariacao] = useState(null);

  const [vendaRealizadaBase, setVendaRealizadaBase] = useState(null);
  const [valorPDVBase, setValorPDVBase] = useState(null);
  const [vendaPDVFormatada, setVendaPDVFormatada] = useState(null);
  const [vendaTotalFormatada, setVendaTotalFormatada] = useState(null);

  const [pesoRealizadoBase, setPesoRealizadoBase] = useState(null);
  const [pesoPDVBase, setPesoPDVBase] = useState(null);
  const [pesoPDVFormatado, setPesoPDVFormatado] = useState(null);
  const [pesoTotalFormatado, setPesoTotalFormatado] = useState(null);

  const [valorAnoAnteriorBase, setValorAnoAnteriorBase] = useState(null);
  const [vendaPDVAnoAnterior, setVendaPDVAnoAnterior] = useState(null);
  const [evolucao_venda_vendapdv, setEvolucao_venda_vendapdv] = useState(null);

  const [captadoValor, setCaptadoValor] = useState(null);
  const [percCaptado, setCpercCaptado] = useState(null);

  const [modo, setModo] = useState('indicadores');

  // ====== NOVO: cache do payload bruto + toggle do escopo ======
  const [rawData, setRawData] = useState(null);
  const [somarArea, setSomarArea] = useState(false); // false: individual, true: soma da área

  // helpers
  const fmtMoeda = (n) => Number(n || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const fmtNum2  = (n) => Number(n || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
  const pct      = (num, den) => (Number(den) ? (Number(num) / Number(den)) * 100 : 0);

  // ========= aplica "escopo individual" usando data.minha_visao =========
  const applyIndividualFromRaw = (data) => {
    if (!data) return;
    const m = data.minha_visao;
    if (m) {
      // Venda
      setVendaRealizada(fmtMoeda(m.realizado_financeiro));
      setVendaRealizadaBase(m.realizado_financeiro);
      setObjetivoFinanceiro(fmtMoeda(m.objetivo_financeiro));
      setVendaPercentual(`${Number(m.percentual_cobertura || 0).toFixed(2)}%`);
      setVendaVariacao(`R$ ${Number(m.variacao_financeira || 0) < 0 ? '-' : ''}${Math.abs(Number(m.variacao_financeira || 0)).toFixed(2).replace('.', ',')}`);

      // Peso
      setPeso((Number(m.objetivo_peso || 0)).toLocaleString('pt-BR'));
      setPesoRealizado(fmtNum2(m.realizado_peso));
      setPesoRealizadoBase(m.realizado_peso);
      setPesoPercentual(`${Number(m.percentual_peso || 0).toFixed(2)}%`);
      setPesoVariacao(fmtNum2(Number(m.variacao_peso || 0)));

      // Mix
      setObjetivoMix(String(m.objetivo_mix || 0));
      setMixRealizado(String(m.mix_realizado || 0));
      setMixPercentual(`${Number(m.percentual_mix || 0).toFixed(2)}%`);
      setMixVariacao(String(Number(m.variacao_mix || 0)));

    } else {
      // Fallback: se não veio minha_visao, mantém a individual original (área com objetivos)
      const percentual = data.realizado_peso?.percentual || 0;
      const variacao = data.realizado_peso?.variacao || 0;
      const objetivoPeso = data.objetivo?.objetivo_peso || 0;
      const realizadoPeso = Number((data.realizado_peso?.realizado ?? data.vendas?.peso_realizado ?? 0));

      setPesoRealizado(fmtNum2(realizadoPeso));
      setPeso(objetivoPeso.toLocaleString('pt-BR'));
      setPesoPercentual(`${percentual.toFixed(2)}%`);
      setPesoVariacao(fmtNum2(variacao));

      const realizadoFinanceiro = data.realizado_financeiro || {};
      const valorVenda = realizadoFinanceiro.valor || 0;
      const percentualVenda = realizadoFinanceiro.percentual_cobertura || 0;
      const variacaoVenda = realizadoFinanceiro.variacao || 0;

      setVendaRealizada(fmtMoeda(valorVenda));
      setVendaPercentual(`${percentualVenda.toFixed(2)}%`);
      setVendaVariacao(`${variacaoVenda < 0 ? '-' : ''}${fmtMoeda(Math.abs(variacaoVenda))}`);
      setObjetivoFinanceiro(fmtMoeda(data.objetivo?.financeiro || 0));

      setVendaRealizadaBase(valorVenda);
      setPesoRealizadoBase(realizadoPeso);

      setObjetivoMix(String(data.objetivo?.objetivo_mix || 0));
      setMixRealizado(String(data.realizado_mix?.realizado || 0));
      setMixPercentual(`${Number(data.realizado_mix?.percentual || 0).toFixed(2)}%`);
      setMixVariacao(String(data.realizado_mix?.variacao || 0));
    }

    // Demais métricas que não temos por-vendedor continuam do backend
    const evolucao = data.evolucao?.percentual || 0;
    const evolucaoValor = data.evolucao?.valor_ano_anterior || 0;
    setEvolucaoAnoAnterior(`${Number(evolucao).toFixed(2)}%`);
    setEvolucaoValor(evolucaoValor != null ? fmtMoeda(evolucaoValor) : 'R$ 0,00');

    const objetivoPos = data.objetivo?.objetivo_positivacao || 0;
    const positivado = data.positivacao?.realizado || 0;
    const percentualPos = data.positivacao?.percentual || 0;
    const variacaoPos = data.positivacao?.variacao || 0;
    setPositivadoObjetivo((objetivoPos).toLocaleString('pt-BR'));
    setPositivadoRealizado((positivado).toLocaleString('pt-BR'));
    setPositivadoPercentual(`${Number(percentualPos).toFixed(2)}%`);
    setPositivadoVariacao((variacaoPos).toLocaleString('pt-BR'));

    const alocacao = data['pre-venda'] || {};
    const valorAlocado = alocacao.valor_alocado || 0;
    const valorPrevenda = alocacao.valor_prevenda || 0;
    const percentualAlocado = alocacao.percentual_prevenda_alocado || 0;
    const variacaoPrevenda = alocacao.variacao_prevenda || 0;

    setAlocacaoRealizada(fmtMoeda(valorAlocado));
    setAlocacaoPrevenda(fmtMoeda(valorPrevenda));
    setAlocacaoPercentual(`${Number(percentualAlocado).toFixed(2)}%`);
    setAlocacaoVariacao(
      Number(variacaoPrevenda) < 0
        ? `R$ -${Math.abs(Number(variacaoPrevenda)).toFixed(2).replace('.', ',')}`
        : `R$ ${Number(variacaoPrevenda).toFixed(2).replace('.', ',')}`
    );

    // Ruptura
    const captado = Number(data?.ruptura?.total_valor || 0);
    setCaptadoValor(fmtMoeda(captado));
    const _percCaptado = Number(data?.ruptura?.percentual_captado || 0);
    setCpercCaptado(`${_percCaptado.toFixed(2)}%`);
  };

  // ========= aplica "escopo área" agregando vendedores já recebidos =========
  const applyAreaFromRaw = (data) => {
    if (!data) return;

    // Agregados (área) já estão prontos no payload; só refletimos nos cards
    const realizadoFinanceiro = data.realizado_financeiro || {};
    const valorVendaGrupo = Number(realizadoFinanceiro.valor || 0);
    const percentualVendaGrupo = Number(realizadoFinanceiro.percentual_cobertura || 0);
    const variacaoVendaGrupo = Number(realizadoFinanceiro.variacao || 0);

    setVendaRealizada(fmtMoeda(valorVendaGrupo));
    setVendaRealizadaBase(valorVendaGrupo);
    setVendaPercentual(`${percentualVendaGrupo.toFixed(2)}%`);
    setVendaVariacao(`${variacaoVendaGrupo < 0 ? '-' : ''}${fmtMoeda(Math.abs(variacaoVendaGrupo))}`);
    setObjetivoFinanceiro(fmtMoeda(Number(data.objetivo?.financeiro || 0)));

    const realizadoPesoGrupo = Number((data.realizado_peso?.realizado ?? data.vendas?.peso_realizado ?? 0));
    const percentual = data.realizado_peso?.percentual || 0;
    const variacao = data.realizado_peso?.variacao || 0;
    const objetivoPeso = Number(data.objetivo?.objetivo_peso || 0);

    setPesoRealizado(fmtNum2(realizadoPesoGrupo));
    setPesoRealizadoBase(realizadoPesoGrupo);
    setPeso(objetivoPeso.toLocaleString('pt-BR'));
    setPesoPercentual(`${Number(percentual).toFixed(2)}%`);
    setPesoVariacao(fmtNum2(Number(variacao)));

    // Mix / Positivação / Evolução / Ruptura / Alocação – mantêm como vêm da API (grupo)
    const objetivoMixValor = data.objetivo?.objetivo_mix || 0;
    setObjetivoMix(String(objetivoMixValor));
    const realizadoMix = data.realizado_mix?.realizado || 0;
    const percentualMix = data.realizado_mix?.percentual || 0;
    const variacaoMix = data.realizado_mix?.variacao || 0;
    setMixRealizado(String(realizadoMix));
    setMixPercentual(`${Number(percentualMix).toFixed(2)}%`);
    setMixVariacao(String(variacaoMix));

    const evolPerc = data.evolucao?.percentual || 0;
    const evolVal = data.evolucao?.valor_ano_anterior || 0;
    setEvolucaoAnoAnterior(`${Number(evolPerc).toFixed(2)}%`);
    setEvolucaoValor(evolVal != null ? fmtMoeda(evolVal) : 'R$ 0,00');

    const objetivoPos = data.objetivo?.objetivo_positivacao || 0;
    const positivado = data.positivacao?.realizado || 0;
    const percentualPos = data.positivacao?.percentual || 0;
    const variacaoPos = data.positivacao?.variacao || 0;
    setPositivadoObjetivo((objetivoPos).toLocaleString('pt-BR'));
    setPositivadoRealizado((positivado).toLocaleString('pt-BR'));
    setPositivadoPercentual(`${Number(percentualPos).toFixed(2)}%`);
    setPositivadoVariacao((variacaoPos).toLocaleString('pt-BR'));

    const alocacao = data['pre-venda'] || {};
    const valorAlocado = alocacao.valor_alocado || 0;
    const valorPrevenda = alocacao.valor_prevenda || 0;
    const percentualAlocado = alocacao.percentual_prevenda_alocado || 0;
    const variacaoPrevenda = alocacao.variacao_prevenda || 0;
    setAlocacaoRealizada(fmtMoeda(valorAlocado));
    setAlocacaoPrevenda(fmtMoeda(valorPrevenda));
    setAlocacaoPercentual(`${Number(percentualAlocado).toFixed(2)}%`);
    setAlocacaoVariacao(
      Number(variacaoPrevenda) < 0
        ? `R$ -${Math.abs(Number(variacaoPrevenda)).toFixed(2).replace('.', ',')}`
        : `R$ ${Number(variacaoPrevenda).toFixed(2).replace('.', ',')}`
    );

    const captado = Number(data?.ruptura?.total_valor || 0);
    setCaptadoValor(fmtMoeda(captado));
    const _percCaptado = Number(data?.ruptura?.percentual_captado || 0);
    setCpercCaptado(`${_percCaptado.toFixed(2)}%`);
  };

  // ========= fetch inicial =========
  useEffect(() => {
    const fetchIndicadores = async () => {
      const { de, ate } = periodoSelecionado || {};
      if (!de || !ate) return;
      setValorPDVBase(null);
      setLoading(true);

      try {
        const { data } = await api.get('/Indicadores/', { params: { de, ate } });

        // notificar objetivos brutos (existente)
        const objetivos = [];

        if (Array.isArray(data.objetivo?.detalhamento)) {
          const detalhamento = data.objetivo.detalhamento.map(item => ({
            codFuncionario: Number(item.CodFuncionario),
            nomeFuncionario: item.Funcionario,
          }));
          objetivos.push(...detalhamento);
        }

        if (Array.isArray(data.objetivos_vendedores)) {
          const vendedores = data.objetivos_vendedores.map(item => ({
            codFuncionario: Number(item.vendedor_id),
            objetivo_financeiro: item.objetivo_financeiro || 0,
            objetivo_mix: item.objetivo_mix || 0,
            objetivo_peso: item.objetivo_peso ?? 0,
            objetivo_positivacao: item.objetivo_positivacao ?? 0,
            nomeFuncionario: item.nome_vendedor,
          }));
          objetivos.push(...vendedores);
        }

        const objetivosUnificados = objetivos.reduce((acc, curr) => {
          const existente = acc.find(o => o.codFuncionario === curr.codFuncionario);
          if (!existente) acc.push(curr);
          else Object.assign(existente, { ...existente, ...curr });
          return acc;
        }, []);

        if (onObjetivosRecebidos) onObjetivosRecebidos(objetivosUnificados);

        // guardar payload bruto para alternar escopo sem nova request
        setRawData(data);
        setSomarArea(false);
        applyIndividualFromRaw(data); // Individual padrão
      } catch (error) {
        console.error('Erro ao buscar os indicadores:', error);
        setPeso('Erro');
      } finally {
        setLoading(false);
      }
    };

    fetchIndicadores();
  }, [periodoSelecionado, onObjetivosRecebidos]);

  // ========= PDV (soma com base) =========
  useEffect(() => {
    const atualizarValoresPDV = (valorPDV, pesoPDV) => {
      const novoValor = usarPDV ? vendaRealizadaBase + valorPDV : vendaRealizadaBase;

      setVendaRealizada(novoValor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));

      if (usarPDV) {
        setVendaPDVFormatada(valorPDV.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));
        setVendaTotalFormatada(novoValor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));
      } else {
        setVendaPDVFormatada(null);
        setVendaTotalFormatada(null);
      }

      const objetivoFin = parseFloat((objetivoFinanceiro?.replace(/[^\d,-]/g, '').replace(',', '.') || '0'));
      const percentualCorrigido = objetivoFin ? (novoValor / objetivoFin) * 100 : 0;
      const variacaoCorrigida = novoValor - objetivoFin;

      setVendaPercentual(`${percentualCorrigido.toFixed(2)}%`);
      if (variacaoCorrigida < 0) {
        setVendaVariacao(`R$ -${Math.abs(variacaoCorrigida).toFixed(2).replace('.', ',')}`);
      } else {
        setVendaVariacao(`R$ ${variacaoCorrigida.toFixed(2).replace('.', ',')}`);
      }

      const novoPeso = usarPDV ? pesoRealizadoBase + pesoPDV : pesoRealizadoBase;
      setPesoRealizado(novoPeso.toLocaleString('pt-BR', { minimumFractionDigits: 2 }));

      if (usarPDV) {
        setPesoPDVFormatado(pesoPDV.toLocaleString('pt-BR', { minimumFractionDigits: 2 }));
        setPesoTotalFormatado(novoPeso.toLocaleString('pt-BR', { minimumFractionDigits: 2 }));
      } else {
        setPesoPDVFormatado(null);
        setPesoTotalFormatado(null);
      }

      const objetivoPeso = parseFloat((peso || '0').replace(/[^\d,-]/g, '').replace(',', '.'));
      const percentualPeso = objetivoPeso ? (novoPeso / objetivoPeso) * 100 : 0;
      const variacaoPeso = novoPeso - objetivoPeso;

      setPesoPercentual(`${percentualPeso.toFixed(2)}%`);
      setPesoVariacao(variacaoPeso.toLocaleString('pt-BR', { minimumFractionDigits: 2 }));
    };

    const fetchPDV = async () => {
      setLoading(true);
      try {
        const { de, ate } = periodoSelecionado || {};
        if (!de || !ate) return;
        const { data } = await api.get('/indicadores/pdv/', { params: { de, ate } });

        const valorPDV = data.vendas_pdv?.venda_realizada || 0;
        const pesoPDV = data.vendas_pdv?.peso_realizado || 0;
        const vendaAnoAnterior = data.vendas_pdv?.venda_realizada_ano_anterior || 0;

        setValorPDVBase(valorPDV);
        setPesoPDVBase(pesoPDV);
        setVendaPDVAnoAnterior(vendaAnoAnterior);
        atualizarValoresPDV(valorPDV, pesoPDV);
      } catch (err) {
        console.error('Erro ao buscar vendas de PDV:', err);
      }
      setLoading(false);
    };

    if (vendaRealizadaBase === null || !periodoSelecionado?.de || !periodoSelecionado?.ate) return;

    if (usarPDV) {
      if (valorPDVBase != null && pesoPDVBase != null) {
        atualizarValoresPDV(valorPDVBase, pesoPDVBase);
      } else {
        fetchPDV();
      }
    } else {
      atualizarValoresPDV(valorPDVBase || 0, pesoPDVBase || 0);
    }
  }, [usarPDV, periodoSelecionado, vendaRealizadaBase, valorPDVBase, objetivoFinanceiro, peso, pesoRealizadoBase, pesoPDVBase]);

  useEffect(() => {
    if (vendaRealizadaBase != null && valorAnoAnteriorBase != null && vendaPDVAnoAnterior != null) {
      const somaAnoAnterior = valorAnoAnteriorBase + vendaPDVAnoAnterior;
      const percentual = somaAnoAnterior > 0 ? (vendaRealizadaBase / somaAnoAnterior) * 100 - 100 : 0;
      setEvolucao_venda_vendapdv(`${percentual.toFixed(2)}%`);
    }
  }, [vendaRealizadaBase, valorAnoAnteriorBase, vendaPDVAnoAnterior]);

  const Gauge = ({ label, percent }) => {
    const val =
      typeof percent === 'number'
        ? percent
        : parseFloat(String(percent || '0').replace('%', '').replace(',', '.')) || 0;

    return (
      <div>
        <h4>
          {label} <small style={{ opacity: 0.7 }}>({val.toFixed(2)}%)</small>
        </h4>
        <ReactSpeedometer
          maxValue={100}
          value={val}
          segments={5}
          height={160}
          currentValueText="${value}%"
          valueFormat=".2f"
          needleTransitionDuration={500}
          needleTransition="easeElastic"
        />
      </div>
    );
  };

  // ====== Botão para alternar o escopo sem nova chamada ======
  const handleToggleArea = () => {
    const novo = !somarArea;
    setSomarArea(novo);
    if (novo) {
      applyAreaFromRaw(rawData);
    } else {
      applyIndividualFromRaw(rawData);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      {loading && (
        <div className="overlay-loader">
          <div className="spinner"></div>
        </div>
      )}

      <div className="modo-toggle">
        <button onClick={() => setModo('indicadores')} className={modo === 'indicadores' ? 'ativo-indicadores' : ''}>
          🎯 Indicadores
        </button>
        <button onClick={() => setModo('graficos')} className={modo === 'graficos' ? 'ativo-graficos' : ''}>
          📊 Graficos
        </button>
        {/* NOVO: alternância de escopo */}
        <button
          onClick={handleToggleArea}
          className={`btn-scope ${somarArea ? 'ativo-area' : ''}`}
          style={{ marginLeft: 'auto' }}
          title="Alternar entre valores individuais e soma da área"
        >
          {somarArea ? '👥 Soma da Minha Área (ON)' : '👤 Individual (ON)'}
        </button>
      </div>

      {modo === 'graficos' ? (
        <div className="dashboard-graficos">
          <h2>Velocímetros de Meta</h2>
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            <Gauge label="Venda"       percent={vendaPercentual} />
            <Gauge label="Peso"        percent={pesoPercentual} />
            <Gauge label="Positivação" percent={positivadoPercentual} />
            <Gauge label="Mix"         percent={mixPercentual} />
          </div>
        </div>
      ) : (
        <div className="indicativos-container">
          <div className="indicativo-stack">
            <Card title="Objetivo (R$)" value={objetivoFinanceiro ?? '...'} className="card-objetivo" />
            <Card
              title="Evo % vs Ano Ant. (R$)"
              value={evolucao_venda_vendapdv ?? evolucaoAnoAnterior ?? '...'}
              subtitle={`Ano Anterior: ${evolucaoValor ?? '--'}`}
              className="card-evolucao"
            />
          </div>

          <Card
            title="Venda Realizada"
            value={
              usarPDV ? (
                <>
                  <div>{vendaRealizadaBase?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
                  <div>PDV: {vendaPDVFormatada}</div>
                  <div>Total: {vendaTotalFormatada}</div>
                </>
              ) : (
                vendaRealizada
              )
            }
            subtitle="Faturamento"
            percentage={vendaPercentual ?? '...'}
            subtitle2=" Cobertura Atual"
            variation={vendaVariacao ?? '...'}
            className="card-venda"
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
            className="card-alocacao"
          />

          <Card
            title="Captado"
            value={captadoValor ?? '...'}
            subtitle="Valor Captado"
            percentage={percCaptado ?? '0%'}
            subtitle2=" Cobertura"
            variation="0"
            className="card-captar"
          />

          <Card
            title="Peso"
            value={peso ?? '...'}
            subtitle="OBJETIVO KG"
            title2="Realizado KG"
            value2={
              usarPDV ? (
                <>
                  <div>{pesoRealizadoBase?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                  <div>PDV: {pesoPDVFormatado}</div>
                  <div>Total: {pesoTotalFormatado}</div>
                </>
              ) : (
                pesoRealizado ?? '...'
              )
            }
            percentage={pesoPercentual}
            subtitle2=" Cobertura"
            variation={pesoVariacao}
            className="card-peso"
          />

          <Card
            title="Positivação"
            value={positivadoObjetivo ?? '...'}
            subtitle="OBJETIVO"
            value2={positivadoRealizado ?? '...'}
            title2="Realizado"
            percentage={positivadoPercentual}
            subtitle2=" Cobertura"
            variation={positivadoVariacao}
            className="card-positivado"
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
            className="card-mix"
          />
        </div>
      )}
    </div>
  );
};

export default IndicadoresCards;
