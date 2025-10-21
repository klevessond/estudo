import React, { useEffect, useState } from 'react';
import './IndicativosDeVenda.css';
import ReactSpeedometer from 'react-d3-speedometer';
import api from '../../api';
import BarChartColaboradores from '../BarChart/BarChartColaboradores';

const dlog = (...args) => console.log('[IndicativosDeVenda]', ...args);

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

  // ====== cache do payload bruto + toggle do escopo ======
  const [rawData, setRawData] = useState(null);
  const [somarArea, setSomarArea] = useState(false); // false: individual, true: soma da área

  // helpers
  const fmtMoeda = (n) => Number(n || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const fmtNum2  = (n) => Number(n || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
  const pct = (num, den) => (Number(den) ? (Number(num) / Number(den)) * 100 : 0);

  const getMinhaLinha = (data) => {
    const meuCod = Number(data?.minha_visao?.cod_funcionario || 0);
    if (!meuCod) return null;
    const arr = data?.vendas?.vendas_por_vendedor || [];
    return arr.find(x => Number(x?.codcampo) === meuCod) || null;
  };

  // ===== Evolução (Ano Anterior) sensível ao escopo =====
  const applyEvolucaoFromRaw = (data, isArea, atualOverride) => {
    if (!data) return;

    let valorAnoAnterior = 0;

    if (isArea) {
      // tenta vir agregado; fallback: soma por vendedor
      valorAnoAnterior = Number(data?.vendas?.ano_anterior_agregado?.ValorLiquido || 0);
      if (!valorAnoAnterior && Array.isArray(data?.vendas?.vendas_por_vendedor)) {
        valorAnoAnterior = data.vendas.vendas_por_vendedor.reduce(
          (acc, x) => acc + Number(x?.Ano_anterior_ValorLiquido || 0),
          0
        );
      }
    } else {
      const linha = getMinhaLinha(data);
      valorAnoAnterior = Number(linha?.Ano_anterior_ValorLiquido || 0) || Number(data?.evolucao?.valor_ano_anterior || 0);
    }

    setValorAnoAnteriorBase(valorAnoAnterior);
    setEvolucaoValor(
      Number.isFinite(valorAnoAnterior)
        ? valorAnoAnterior.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
        : 'R$ 0,00'
    );

    // valor atual (override) ou derivado do escopo
    let atual = Number(atualOverride ?? 0);
    if (!atual) {
      atual = Number(
        isArea
          ? (data?.realizado_financeiro?.valor || 0)
          : (data?.minha_visao?.realizado_financeiro || 0)
      );
      if (!isArea && !atual) {
        atual = Number(data?.realizado_financeiro?.valor || 0);
      }
    }

    if (valorAnoAnterior > 0) {
      const perc = ((atual - valorAnoAnterior) / valorAnoAnterior) * 100;
      setEvolucaoAnoAnterior(`${perc.toFixed(2)}%`);
    } else {
      const percBack = Number(data?.evolucao?.percentual || 0);
      setEvolucaoAnoAnterior(`${(percBack || 0).toFixed(2)}%`);
    }
  };

  // ========= aplica "escopo individual" =========
  const applyIndividualFromRaw = (data) => {
    if (!data) return;

    const m = data.minha_visao;
    const linha = getMinhaLinha(data);

    dlog('applyIndividualFromRaw - minha_visao:', m);
    dlog('applyIndividualFromRaw - minha linha:', linha);

    if (m) {
      // Venda
      setVendaRealizada(fmtMoeda(m.realizado_financeiro));
      setVendaRealizadaBase(m.realizado_financeiro);
      setObjetivoFinanceiro(fmtMoeda(m.objetivo_financeiro));
      setVendaPercentual(`${Number(m.percentual_cobertura || 0).toFixed(2)}%`);
      setVendaVariacao(
        `R$ ${Number(m.variacao_financeira || 0) < 0 ? '-' : ''}${Math.abs(Number(m.variacao_financeira || 0)).toFixed(2).replace('.', ',')}`
      );

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
      // Fallback: individual sem minha_visao → usa agregados atuais
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

    // ==== NOVO: Individual — usa linha do vendedor ====
    const vendaAtual = Number(m?.realizado_financeiro || 0);
    const objFin     = Number(m?.objetivo_financeiro || 0);

    const pre = Number(linha?.PreVenda_Valor || 0);
    const ruptura = Number(linha?.Ruptura_TotalValor || 0);

    // NOVO: positivação (realizado) = QtdClientes da linha
    const posReal = Number(linha?.QtdClientes || 0);
    // objetivo de positivação: preferir minha_visao; fallback: objetivo geral
    const objPos  = Number(m?.objetivo_positivacao ?? data?.objetivo?.objetivo_positivacao ?? 0);

    dlog('INDIVIDUAL pre:', pre, 'ruptura:', ruptura, 'posReal(QtdClientes):', posReal, 'objPos:', objPos);

    // Alocação (Fat + A Faturar)
    const valorAlocado = vendaAtual + pre;
    setAlocacaoPrevenda(fmtMoeda(pre));
    setAlocacaoRealizada(fmtMoeda(valorAlocado));
    const percAlocado = pct(valorAlocado, objFin);
    setAlocacaoPercentual(`${percAlocado.toFixed(2)}%`);
    setAlocacaoVariacao(
      (valorAlocado - objFin).toLocaleString('pt-BR', { minimumFractionDigits: 2 })
    );

    // Ruptura (captado)
    setCaptadoValor(fmtMoeda(ruptura));
    setCpercCaptado(`${pct(ruptura, vendaAtual).toFixed(2)}%`);

    // Positivação
    setPositivadoObjetivo((objPos).toLocaleString('pt-BR'));
    setPositivadoRealizado((posReal).toLocaleString('pt-BR'));
    setPositivadoPercentual(`${pct(posReal, objPos).toFixed(2)}%`);
    setPositivadoVariacao((posReal - objPos).toLocaleString('pt-BR'));

    // Evolução (Individual)
    applyEvolucaoFromRaw(data, false);
  };

  // ========= aplica "escopo área" =========
  const applyAreaFromRaw = (data) => {
    if (!data) return;

    // Agregados (área) do payload
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

    // Mix – como vem da API (grupo)
    const objetivoMixValor = data.objetivo?.objetivo_mix || 0;
    setObjetivoMix(String(objetivoMixValor));
    const realizadoMix = data.realizado_mix?.realizado || 0;
    const percentualMix = data.realizado_mix?.percentual || 0;
    const variacaoMix = data.realizado_mix?.variacao || 0;
    setMixRealizado(String(realizadoMix));
    setMixPercentual(`${Number(percentualMix).toFixed(2)}%`);
    setMixVariacao(String(variacaoMix));

    // ==== NOVO: Área — usa vendas.agregados_area (fallback: somatório da lista) ====
    const agg = data?.vendas?.agregados_area || {};
    const list = data?.vendas?.vendas_por_vendedor || [];
    const soma = (k) => list.reduce((acc, it) => acc + Number(it?.[k] || 0), 0);

    const preAgg  = Number((agg.PreVenda_Valor ?? null) !== null ? agg.PreVenda_Valor : soma('PreVenda_Valor'));
    const rupAgg  = Number((agg.Ruptura_TotalValor ?? null) !== null ? agg.Ruptura_TotalValor : soma('Ruptura_TotalValor'));

    // NOVO: positivação (realizado do grupo) = soma de QtdClientes (fallback), se não vier agregados
    const posAgg  = Number(
      (agg.Positivacao_Realizado ?? null) !== null
        ? agg.Positivacao_Realizado
        : soma('QtdClientes')
    );

    dlog('AREA preAgg:', preAgg, 'rupAgg:', rupAgg, 'posAgg(QtdClientes soma):', posAgg);

    // Alocação (Fat + A Faturar) – usa objetivo financeiro geral
    const objFin = Number(data?.objetivo?.financeiro || 0);
    const valorAlocado = valorVendaGrupo + preAgg;
    setAlocacaoPrevenda(fmtMoeda(preAgg));
    setAlocacaoRealizada(fmtMoeda(valorAlocado));
    const percAlocado = pct(valorAlocado, objFin);
    setAlocacaoPercentual(`${percAlocado.toFixed(2)}%`);
    setAlocacaoVariacao(
      (valorAlocado - objFin).toLocaleString('pt-BR', { minimumFractionDigits: 2 })
    );

    // Ruptura (captado) – percentual sobre venda do grupo
    setCaptadoValor(fmtMoeda(rupAgg));
    setCpercCaptado(`${pct(rupAgg, valorVendaGrupo).toFixed(2)}%`);

    // Positivação – objetivo geral
    const objPos = Number(data?.objetivo?.objetivo_positivacao || 0);
    dlog('AREA objPos (objetivo_positivacao):', objPos);

    setPositivadoObjetivo((objPos).toLocaleString('pt-BR'));
    setPositivadoRealizado((posAgg).toLocaleString('pt-BR'));
    setPositivadoPercentual(`${pct(posAgg, objPos).toFixed(2)}%`);
    setPositivadoVariacao((posAgg - objPos).toLocaleString('pt-BR'));

    // Evolução (Área)
    applyEvolucaoFromRaw(data, true);
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
        dlog('payload bruto /Indicadores:', data);

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

      // Atualiza evolução com override do “atual”
      if (rawData) {
        applyEvolucaoFromRaw(rawData, somarArea, novoValor);
      }
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
  }, [usarPDV, periodoSelecionado, vendaRealizadaBase, valorPDVBase, objetivoFinanceiro, peso, pesoRealizadoBase, pesoPDVBase, rawData, somarArea]);

  // Evolução com PDV (opcional)
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

  // ====== alternância de escopo ======
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
