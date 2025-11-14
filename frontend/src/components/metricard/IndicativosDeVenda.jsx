import React, { useEffect, useState } from 'react';
import './IndicativosDeVenda.css';
import ReactSpeedometer from 'react-d3-speedometer';
import api from '../../api';
import BarChartColaboradores from '../BarChart/BarChartColaboradores';

const dlog = (...args) => console.log('[IndicativosDeVenda]', ...args);

/* ========= HELPERS GERAIS (FORA DO COMPONENTE) ========= */

const fmtMoeda = (n) =>
  Number(n || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const fmtNum2 = (n) =>
  Number(n || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 });

const pct = (num, den) => (Number(den) ? (Number(num) / Number(den)) * 100 : 0);

const getMinhaLinha = (data) => {
  const meuCod = Number(data?.minha_visao?.cod_funcionario || 0);
  if (!meuCod) return null;
  const arr = data?.vendas?.vendas_por_vendedor || [];
  return arr.find((x) => Number(x?.codcampo) === meuCod) || null;
};

// 🔍 helper só para exibir o texto do "Vendas Ano Anterior" no card
const getValorAnoAnteriorTexto = (
  rawData,
  somarArea,
  valorAnoAnteriorMesCheioBase,
  valorAnoAnteriorBase
) => {
  if (!rawData) return '--';

  // 👥 SOMA DA MINHA ÁREA (ON) -> usa o agregado de mês cheio do ano anterior
  if (somarArea) {
    const baseMesArea =
      Number(valorAnoAnteriorMesCheioBase || 0) ||
      Number(rawData?.vendas?.ano_anterior_agregado_mes?.ValorLiquido || 0);

    if (!baseMesArea) return '--';
    return fmtMoeda(baseMesArea);
  }

  // 👤 INDIVIDUAL (ON) -> usa o mês cheio do vendedor (codcampo), se existir
  const linha = getMinhaLinha(rawData);
  const vendMes = Number(linha?.Ano_anterior_mes_ValorLiquido || 0);

  if (vendMes) {
    return fmtMoeda(vendMes);
  }

  // fallback: se não tiver mês cheio, mostra o "até hoje" que já usamos na evolução
  const base = Number(valorAnoAnteriorBase || 0);
  if (base) {
    return fmtMoeda(base);
  }

  return '--';
};

/* ========= COMPONENTES DE APRESENTAÇÃO ========= */

const Card = ({
  title,
  title2,
  value,
  value2,
  subtitle,
  subtitle2,
  percentage,
  variation,
  icon,
  className,
}) => (
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

/* ========= COMPONENTE PRINCIPAL ========= */

const IndicadoresCards = ({
  periodoSelecionado,
  usarPDV,
  onObjetivosRecebidos,
  onPDVResumoChange,
}) => {
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
  const [valorAnoAnteriorMesCheio, setValorAnoAnteriorMesCheio] = useState(null);
  const [valorAnoAnteriorMesCheioBase, setValorAnoAnteriorMesCheioBase] = useState(null);

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

  const [captadoBase, setCaptadoBase] = useState(0);
  const [captadoProjTotalFmt, setCaptadoProjTotalFmt] = useState(null);
  const [captadoProjPercentFmt, setCaptadoProjPercentFmt] = useState(null);

  const [modo, setModo] = useState('indicadores');

  const [rawData, setRawData] = useState(null);
  const [somarArea, setSomarArea] = useState(false); // false: individual, true: soma da área

  const [ugUsuario, setUgUsuario] = useState(null);
  const [pdvValorUG, setPdvValorUG] = useState(null);
  const [pdvPesoUG, setPdvPesoUG] = useState(null);
  const [pdvValorArea, setPdvValorArea] = useState(null);
  const [pdvPesoArea, setPdvPesoArea] = useState(null);
  const [pdvValorAAUG, setPdvValorAAUG] = useState(null);
  const [pdvValorAAArea, setPdvValorAAArea] = useState(null);

  const [pdvSelecionadoAtual, setPdvSelecionadoAtual] = useState(0);

  // === evolução base (sem PDV)
  const applyEvolucaoFromRaw = (data, isArea, atualOverride) => {
    if (!data) return;
    let valorAnoAnterior = 0;

    if (isArea) {
      valorAnoAnterior = Number(data?.vendas?.ano_anterior_agregado?.ValorLiquido || 0);
      if (!valorAnoAnterior && Array.isArray(data?.vendas?.vendas_por_vendedor)) {
        valorAnoAnterior = data.vendas.vendas_por_vendedor.reduce(
          (acc, x) => acc + Number(x?.Ano_anterior_ValorLiquido || 0),
          0
        );
      }
    } else {
      const linha = getMinhaLinha(data);
      valorAnoAnterior =
        Number(linha?.Ano_anterior_ValorLiquido || 0) ||
        Number(data?.evolucao?.valor_ano_anterior || 0);
    }

    setValorAnoAnteriorBase(valorAnoAnterior);

    let atual = Number(atualOverride ?? 0);
    if (!atual) {
      atual = Number(
        isArea
          ? data?.realizado_financeiro?.valor || 0
          : data?.minha_visao?.realizado_financeiro || 0
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

  const applyIndividualFromRaw = (data) => {
    if (!data) return;

    const m = data.minha_visao;
    const linha = getMinhaLinha(data);

    dlog('applyIndividualFromRaw - minha_visao:', m);
    dlog('applyIndividualFromRaw - minha linha:', linha);

    if (m) {
      setVendaRealizada(fmtMoeda(m.realizado_financeiro));
      setVendaRealizadaBase(m.realizado_financeiro);
      setObjetivoFinanceiro(fmtMoeda(m.objetivo_financeiro));
      setVendaPercentual(`${Number(m.percentual_cobertura || 0).toFixed(2)}%`);
      setVendaVariacao(
        `R$ ${
          Number(m.variacao_financeira || 0) < 0 ? '-' : ''
        }${Math.abs(Number(m.variacao_financeira || 0))
          .toFixed(2)
          .replace('.', ',')}`
      );

      setPeso(Number(m.objetivo_peso || 0).toLocaleString('pt-BR'));
      setPesoRealizado(fmtNum2(m.realizado_peso));
      setPesoRealizadoBase(m.realizado_peso);
      setPesoPercentual(`${Number(m.percentual_peso || 0).toFixed(2)}%`);
      setPesoVariacao(fmtNum2(Number(m.variacao_peso || 0)));

      setObjetivoMix(String(m.objetivo_mix || 0));
      setMixRealizado(String(m.mix_realizado || 0));
      setMixPercentual(`${Number(m.percentual_mix || 0).toFixed(2)}%`);
      setMixVariacao(String(Number(m.variacao_mix || 0)));
    } else {
      const percentual = data.realizado_peso?.percentual || 0;
      const variacao = data.realizado_peso?.variacao || 0;
      const objetivoPeso = data.objetivo?.objetivo_peso || 0;
      const realizadoPeso = Number(
        data.realizado_peso?.realizado ?? data.vendas?.peso_realizado ?? 0
      );

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
      setVendaVariacao(
        `${variacaoVenda < 0 ? '-' : ''}${fmtMoeda(Math.abs(variacaoVenda))}`
      );
      setObjetivoFinanceiro(fmtMoeda(data.objetivo?.financeiro || 0));

      setVendaRealizadaBase(valorVenda);
      setPesoRealizadoBase(realizadoPeso);

      setObjetivoMix(String(data.objetivo?.objetivo_mix || 0));
      setMixRealizado(String(data.realizado_mix?.realizado || 0));
      setMixPercentual(
        `${Number(data.realizado_mix?.percentual || 0).toFixed(2)}%`
      );
      setMixVariacao(String(data.realizado_mix?.variacao || 0));
    }

    const vendaAtual = Number(m?.realizado_financeiro || 0);
    const objFin = Number(m?.objetivo_financeiro || 0);

    const pre = Number(linha?.PreVenda_Valor || 0);
    const ruptura = Number(linha?.Ruptura_TotalValor || 0);

    const posReal = Number(linha?.QtdClientes || 0);
    const objPos = Number(
      m?.objetivo_positivacao ??
        data?.objetoivo?.objetivo_positivacao ??
        data?.objetivo?.objetivo_positivacao ??
        0
    );

    dlog(
      'INDIVIDUAL pre:',
      pre,
      'ruptura:',
      ruptura,
      'posReal(QtdClientes):',
      posReal,
      'objPos:',
      objPos
    );

    const valorAlocado = vendaAtual + pre;
    setAlocacaoPrevenda(fmtMoeda(pre));
    setAlocacaoRealizada(fmtMoeda(valorAlocado));
    const percAlocado = pct(valorAlocado, objFin);
    setAlocacaoPercentual(`${percAlocado.toFixed(2)}%`);
    setAlocacaoVariacao(
      (valorAlocado - objFin).toLocaleString('pt-BR', { minimumFractionDigits: 2 })
    );

    // Captado base + exibido
    setCaptadoBase(ruptura);
    setCaptadoValor(fmtMoeda(ruptura));
    setCpercCaptado(`${pct(ruptura, vendaAtual).toFixed(2)}%`);

    setPositivadoObjetivo(objPos.toLocaleString('pt-BR'));
    setPositivadoRealizado(posReal.toLocaleString('pt-BR'));
    setPositivadoPercentual(`${pct(posReal, objPos).toFixed(2)}%`);
    setPositivadoVariacao((posReal - objPos).toLocaleString('pt-BR'));

    applyEvolucaoFromRaw(data, false);
  };

  const applyAreaFromRaw = (data) => {
    if (!data) return;

    const realizadoFinanceiro = data.realizado_financeiro || {};
    const valorVendaGrupo = Number(realizadoFinanceiro.valor || 0);
    const percentualVendaGrupo = Number(
      realizadoFinanceiro.percentual_cobertura || 0
    );
    const variacaoVendaGrupo = Number(realizadoFinanceiro.variacao || 0);

    setVendaRealizada(fmtMoeda(valorVendaGrupo));
    setVendaRealizadaBase(valorVendaGrupo);
    setVendaPercentual(`${percentualVendaGrupo.toFixed(2)}%`);
    setVendaVariacao(
      `${variacaoVendaGrupo < 0 ? '-' : ''}${fmtMoeda(
        Math.abs(variacaoVendaGrupo)
      )}`
    );
    setObjetivoFinanceiro(fmtMoeda(Number(data.objetivo?.financeiro || 0)));

    const realizadoPesoGrupo = Number(
      data.realizado_peso?.realizado ?? data.vendas?.peso_realizado ?? 0
    );
    const percentual = data.realizado_peso?.percentual || 0;
    const variacao = data.realizado_peso?.variacao || 0;
    const objetivoPeso = Number(data.objetivo?.objetivo_peso || 0);

    setPesoRealizado(fmtNum2(realizadoPesoGrupo));
    setPesoRealizadoBase(realizadoPesoGrupo);
    setPeso(objetivoPeso.toLocaleString('pt-BR'));
    setPesoPercentual(`${Number(percentual).toFixed(2)}%`);
    setPesoVariacao(fmtNum2(Number(variacao)));

    const objetivoMixValor = data.objetivo?.objetivo_mix || 0;
    setObjetivoMix(String(objetivoMixValor));
    const realizadoMix = data.realizado_mix?.realizado || 0;
    const percentualMix = data.realizado_mix?.percentual || 0;
    const variacaoMix = data.realizado_mix?.variacao || 0;
    setMixRealizado(String(realizadoMix));
    setMixPercentual(`${Number(percentualMix).toFixed(2)}%`);
    setMixVariacao(String(variacaoMix));

    const agg = data?.vendas?.agregados_area || {};
    const list = data?.vendas?.vendas_por_vendedor || [];
    const soma = (k) => list.reduce((acc, it) => acc + Number(it?.[k] || 0), 0);

    const preAgg = Number(
      (agg.PreVenda_Valor ?? null) !== null
        ? agg.PreVenda_Valor
        : soma('PreVenda_Valor')
    );
    const rupAgg = Number(
      (agg.Ruptura_TotalValor ?? null) !== null
        ? agg.Ruptura_TotalValor
        : soma('Ruptura_TotalValor')
    );
    const posAgg = Number(
      (agg.QtdClientes ?? null) !== null ? agg.QtdClientes : soma('QtdClientes')
    );

    dlog('AREA preAgg:', preAgg, 'rupAgg:', rupAgg, 'posAgg(QtdClientes soma):', posAgg);

    const objFin = Number(data?.objetivo?.financeiro || 0);
    const valorAlocado = valorVendaGrupo + preAgg;
    setAlocacaoPrevenda(fmtMoeda(preAgg));
    setAlocacaoRealizada(fmtMoeda(valorAlocado));
    const percAlocado = pct(valorAlocado, objFin);
    setAlocacaoPercentual(`${percAlocado.toFixed(2)}%`);
    setAlocacaoVariacao(
      (valorAlocado - objFin).toLocaleString('pt-BR', { minimumFractionDigits: 2 })
    );

    // Captado base + exibido (área)
    setCaptadoBase(rupAgg);
    setCaptadoValor(fmtMoeda(rupAgg));
    setCpercCaptado(`${pct(rupAgg, valorVendaGrupo).toFixed(2)}%`);

    const objPos = Number(data?.objetivo?.objetivo_positivacao || 0);
    dlog('AREA objPos (objetivo_positivacao):', objPos);

    setPositivadoObjetivo(objPos.toLocaleString('pt-BR'));
    setPositivadoRealizado(posAgg.toLocaleString('pt-BR'));
    setPositivadoPercentual(`${pct(posAgg, objPos).toFixed(2)}%`);
    setPositivadoVariacao((posAgg - objPos).toLocaleString('pt-BR'));

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

        const objetivos = [];

        if (Array.isArray(data.objetivo?.detalhamento)) {
          const detalhamento = data.objetivo.detalhamento.map((item) => ({
            codFuncionario: Number(item.CodFuncionario),
            nomeFuncionario: item.Funcionario,
          }));
          objetivos.push(...detalhamento);
        }

        if (Array.isArray(data.objetivos_vendedores)) {
          const vendedores = data.objetivos_vendedores.map((item) => ({
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
          const existente = acc.find(
            (o) => o.codFuncionario === curr.codFuncionario
          );
          if (!existente) acc.push(curr);
          else Object.assign(existente, { ...existente, ...curr });
          return acc;
        }, []);

        if (onObjetivosRecebidos) onObjetivosRecebidos(objetivosUnificados);

        setRawData(data);
        setSomarArea(false);

        const mesCheioNum = Number(
          data?.vendas?.ano_anterior_agregado_mes?.ValorLiquido || 0
        );
        setValorAnoAnteriorMesCheioBase(mesCheioNum || 0);
        setValorAnoAnteriorMesCheio(
          mesCheioNum
            ? mesCheioNum.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })
            : null
        );

        applyIndividualFromRaw(data);
      } catch (error) {
        console.error('Erro ao buscar os indicadores:', error);
        setPeso('Erro');
      } finally {
        setLoading(false);
      }
    };

    fetchIndicadores();
  }, [periodoSelecionado, onObjetivosRecebidos]);

  // helper para somar PDV (atual/AA) por UG e por área
  function somarPDV(rows, ugFiltro = null) {
    const arr = Array.isArray(rows) ? rows : [];
    let valor = 0;
    let peso = 0;
    for (const r of arr) {
      const ug = r.UnidGestora ?? r.unidGestora ?? r.unid_gestora ?? null;
      if (ugFiltro !== null && String(ug) !== String(ugFiltro)) continue;
      const v = Number(r.Valor ?? r.ValorProdutos ?? r.valor ?? 0);
      const p = Number(r.Peso ?? r.peso ?? 0);
      valor += isFinite(v) ? v : 0;
      peso += isFinite(p) ? p : 0;
    }
    return { valor, peso };
  }

  const notifyPDVResumo = (somarAreaAtual, ligado) => {
    if (!onPDVResumoChange) return;
    if (!ligado) {
      onPDVResumoChange(null);
      return;
    }
    const valorSel = somarAreaAtual ? pdvValorArea ?? 0 : pdvValorUG ?? 0;
    const pesoSel = somarAreaAtual ? pdvPesoArea ?? 0 : pdvPesoUG ?? 0;
    const label = somarAreaAtual
      ? 'Soma da Área'
      : ugUsuario
      ? `UG ${ugUsuario}`
      : 'UG —';
    onPDVResumoChange({ valor: valorSel || 0, peso: pesoSel || 0, label });
  };

  // ========= PDV (soma com base) =========
  useEffect(() => {
    const atualizarValoresPDV = (valorPDV, pesoPDV, valorAASel = null) => {
      const novoValor = usarPDV ? vendaRealizadaBase + valorPDV : vendaRealizadaBase;

      setVendaRealizada(
        novoValor.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        })
      );

      if (usarPDV) {
        setVendaPDVFormatada(
          valorPDV.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          })
        );
        setVendaTotalFormatada(
          novoValor.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          })
        );
      } else {
        setVendaPDVFormatada(null);
        setVendaTotalFormatada(null);
      }

      const objetivoFin = parseFloat(
        (objetivoFinanceiro
          ?.replace(/[^\d,-]/g, '')
          .replace(',', '.') || '0')
      );
      const percentualCorrigido = objetivoFin ? (novoValor / objetivoFin) * 100 : 0;
      const variacaoCorrigida = novoValor - objetivoFin;

      setVendaPercentual(`${percentualCorrigido.toFixed(2)}%`);
      if (variacaoCorrigida < 0) {
        setVendaVariacao(
          `R$ -${Math.abs(variacaoCorrigida)
            .toFixed(2)
            .replace('.', ',')}`
        );
      } else {
        setVendaVariacao(
          `R$ ${variacaoCorrigida.toFixed(2).replace('.', ',')}`
        );
      }

      const novoPeso = usarPDV ? pesoRealizadoBase + pesoPDV : pesoRealizadoBase;
      setPesoRealizado(
        novoPeso.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
      );

      if (usarPDV) {
        setPesoPDVFormatado(
          pesoPDV.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
        );
        setPesoTotalFormatado(
          novoPeso.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
        );
      } else {
        setPesoPDVFormatado(null);
        setPesoTotalFormatado(null);
      }

      const objetivoPeso = parseFloat(
        (peso || '0').replace(/[^\d,-]/g, '').replace(',', '.')
      );
      const percentualPeso = objetivoPeso ? (novoPeso / objetivoPeso) * 100 : 0;
      const variacaoPeso = novoPeso - objetivoPeso;

      setPesoPercentual(`${percentualPeso.toFixed(2)}%`);
      setPesoVariacao(
        variacaoPeso.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
      );

      setPdvSelecionadoAtual(usarPDV ? Number(valorPDV || 0) : 0);

      if (rawData) {
        if (valorAASel != null) {
          setVendaPDVAnoAnterior(valorAASel);
        }
        applyEvolucaoFromRaw(rawData, somarArea, novoValor);
      }

      notifyPDVResumo(somarArea, usarPDV);
    };

    const fetchPDV = async () => {
      setLoading(true);
      try {
        const { de, ate } = periodoSelecionado || {};
        if (!de || !ate) return;

        const res = await api.get('/indicadores/pdv/', { params: { de, ate } });
        const data = res.data || {};

        const ug =
          data.unid_gestora_usuario != null
            ? String(data.unid_gestora_usuario)
            : null;
        setUgUsuario(ug);

        const det = data.detalhado_por_unid_gestora || [];
        const detA = data.detalhado_aa_por_unid_gestora || [];

        const { valor: valorUG, peso: pesoUG } = ug
          ? somarPDV(det, ug)
          : { valor: 0, peso: 0 };
        const { valor: valorAll, peso: pesoAll } = somarPDV(det, null);

        const { valor: valorAAUG } = ug
          ? somarPDV(detA, ug)
          : { valor: 0, peso: 0 };
        const { valor: valorAAAll } = somarPDV(detA, null);

        setPdvValorUG(valorUG);
        setPdvPesoUG(pesoUG);
        setPdvValorArea(valorAll);
        setPdvPesoArea(pesoAll);
        setPdvValorAAUG(valorAAUG);
        setPdvValorAAArea(valorAAAll);

        setValorPDVBase(valorAll);
        setPesoPDVBase(pesoAll);

        const valorSel = somarArea ? valorAll : valorUG;
        const pesoSel = somarArea ? pesoAll : pesoUG;
        const valorAASel = somarArea ? valorAAAll : valorAAUG;

        atualizarValoresPDV(valorSel || 0, pesoSel || 0, valorAASel || 0);
      } catch (err) {
        console.error('Erro ao buscar vendas de PDV:', err);
      }
      setLoading(false);
    };

    if (
      vendaRealizadaBase === null ||
      !periodoSelecionado?.de ||
      !periodoSelecionado?.ate
    )
      return;

    if (usarPDV) {
      if (
        (somarArea &&
          pdvValorArea != null &&
          pdvPesoArea != null &&
          pdvValorAAArea != null) ||
        (!somarArea &&
          pdvValorUG != null &&
          pdvPesoUG != null &&
          pdvValorAAUG != null)
      ) {
        const valorSel = somarArea ? pdvValorArea : pdvValorUG;
        const pesoSel = somarArea ? pdvPesoArea : pdvPesoUG;
        const valorAASel = somarArea ? pdvValorAAArea : pdvValorAAUG;
        atualizarValoresPDV(valorSel || 0, pesoSel || 0, valorAASel || 0);
      } else {
        fetchPDV();
      }
    } else {
      atualizarValoresPDV(0, 0, 0);
      notifyPDVResumo(somarArea, false);
    }
  }, [
    usarPDV,
    periodoSelecionado,
    vendaRealizadaBase,
    objetivoFinanceiro,
    peso,
    pesoRealizadoBase,
    rawData,
    somarArea,
    pdvValorUG,
    pdvPesoUG,
    pdvValorArea,
    pdvPesoArea,
    pdvValorAAUG,
    pdvValorAAArea,
  ]);

  // ===== Evolução (considerando PDV quando ativo) =====
  useEffect(() => {
    if (vendaRealizadaBase == null || valorAnoAnteriorBase == null) return;

    const atualTotal =
      Number(vendaRealizadaBase || 0) +
      (usarPDV ? Number(pdvSelecionadoAtual || 0) : 0);
    const aaTotal =
      Number(valorAnoAnteriorBase || 0) +
      (usarPDV ? Number(vendaPDVAnoAnterior || 0) : 0);

    const perc = aaTotal > 0 ? ((atualTotal - aaTotal) / aaTotal) * 100 : 0;
    setEvolucao_venda_vendapdv(`${perc.toFixed(2)}%`);
  }, [
    vendaRealizadaBase,
    valorAnoAnteriorBase,
    usarPDV,
    pdvSelecionadoAtual,
    vendaPDVAnoAnterior,
  ]);

  // ===== Exibição do valor "Ano Anterior" no card (somando PDV quando ativo) =====
  useEffect(() => {
    const aaDisplay =
      Number(valorAnoAnteriorBase || 0) +
      (usarPDV ? Number(vendaPDVAnoAnterior || 0) : 0);
    setEvolucaoValor(
      aaDisplay.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      })
    );
  }, [valorAnoAnteriorBase, vendaPDVAnoAnterior, usarPDV]);

  // ===== Projeção de CAPTADO (apenas quando PDV estiver DESLIGADO) =====
  useEffect(() => {
    if (usarPDV) {
      setCaptadoProjTotalFmt(null);
      setCaptadoProjPercentFmt(null);
      return;
    }
    const vendaBase = Number(vendaRealizadaBase || 0);
    const captadoNum = Number(captadoBase || 0);
    const objetivoFinNum = parseFloat(
      (objetivoFinanceiro
        ?.replace(/[^\d,-]/g, '')
        .replace(',', '.') || '0')
    );

    const totalProj = vendaBase + captadoNum;
    const percProj = objetivoFinNum ? (totalProj / objetivoFinNum) * 100 : 0;

    setCaptadoProjTotalFmt(
      totalProj.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    );
    setCaptadoProjPercentFmt(`${percProj.toFixed(2)}%`);
  }, [usarPDV, vendaRealizadaBase, captadoBase, objetivoFinanceiro]);

  // ====== alternância de escopo ======
  const handleToggleArea = () => {
    const novo = !somarArea;
    setSomarArea(novo);

    if (usarPDV) {
      const valorSel = novo ? pdvValorArea ?? 0 : pdvValorUG ?? 0;
      const pesoSel = novo ? pdvPesoArea ?? 0 : pdvPesoUG ?? 0;
      const valorAASel = novo ? pdvValorAAArea ?? 0 : pdvValorAAUG ?? 0;

      const novoValor = (vendaRealizadaBase ?? 0) + (valorSel ?? 0);
      setVendaRealizada(
        novoValor.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        })
      );
      setVendaPDVFormatada(
        (valorSel ?? 0).toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        })
      );
      setVendaTotalFormatada(
        novoValor.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        })
      );

      const objetivoFin = parseFloat(
        (objetivoFinanceiro
          ?.replace(/[^\d,-]/g, '')
          .replace(',', '.') || '0')
      );
      const percentualCorrigido = objetivoFin ? (novoValor / objetivoFin) * 100 : 0;
      const variacaoCorrigida = novoValor - objetivoFin;
      setVendaPercentual(`${percentualCorrigido.toFixed(2)}%`);
      setVendaVariacao(
        variacaoCorrigida < 0
          ? `R$ -${Math.abs(variacaoCorrigida)
              .toFixed(2)
              .replace('.', ',')}`
          : `R$ ${variacaoCorrigida.toFixed(2).replace('.', ',')}`
      );

      const novoPeso = (pesoRealizadoBase ?? 0) + (pesoSel ?? 0);
      setPesoRealizado(
        novoPeso.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
      );
      setPesoPDVFormatado(
        (pesoSel ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })
      );
      setPesoTotalFormatado(
        novoPeso.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
      );

      const objetivoPeso = parseFloat(
        (peso || '0').replace(/[^\d,-]/g, '').replace(',', '.')
      );
      const percentualPeso = objetivoPeso ? (novoValor / objetivoPeso) * 100 : 0;
      const variacaoPeso = novoPeso - objetivoPeso;
      setPesoPercentual(`${percentualPeso.toFixed(2)}%`);
      setPesoVariacao(
        variacaoPeso.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
      );

      setPdvSelecionadoAtual(usarPDV ? Number(valorSel || 0) : 0);
      setVendaPDVAnoAnterior(valorAASel ?? 0);

      if (rawData) {
        applyEvolucaoFromRaw(rawData, novo, novoValor);
      }

      notifyPDVResumo(novo, usarPDV);
    } else {
      if (novo) {
        applyAreaFromRaw(rawData);
      } else {
        applyIndividualFromRaw(rawData);
      }
      notifyPDVResumo(novo, false);
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
        <button
          onClick={() => setModo('indicadores')}
          className={modo === 'indicadores' ? 'ativo-indicadores' : ''}
        >
          🎯 Indicadores
        </button>
        <button
          onClick={() => setModo('graficos')}
          className={modo === 'graficos' ? 'ativo-graficos' : ''}
        >
          📊 Graficos
        </button>
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
            <Gauge label="Venda" percent={vendaPercentual} />
            <Gauge label="Peso" percent={pesoPercentual} />
            <Gauge label="Positivação" percent={positivadoPercentual} />
            <Gauge label="Mix" percent={mixPercentual} />
          </div>
        </div>
      ) : (
        <div className="indicativos-container">
          <Card
            title="Objetivo & Evolução"
            value={objetivoFinanceiro ?? '...'}
            subtitle="Objetivo Financeiro"
            title2={
              <>
                Vendas Ano Anterior:
                <br />
                {getValorAnoAnteriorTexto(
                  rawData,
                  somarArea,
                  valorAnoAnteriorMesCheioBase,
                  valorAnoAnteriorBase
                )}
              </>
            }
            percentage={evolucao_venda_vendapdv ?? evolucaoAnoAnterior ?? '...'}
            subtitle2="Evo % vs Ano Ant."
            className="card-objetivo"
          />

          <Card
            title="Venda Realizada"
            value={
              usarPDV ? (
                <>
                  <div>
                    {vendaRealizadaBase?.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </div>
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
            title="Evolução (reservado)"
            value=""
            subtitle=""
            value2=""
            title2=""
            percentage=""
            subtitle2=""
            variation=""
            className="card-evolucao"
          />

          <Card
            title="Captado"
            value={captadoValor ?? '...'}
            subtitle="Valor Captado"
            title2={!usarPDV ? 'Se vender captado' : undefined}
            value2={!usarPDV ? captadoProjTotalFmt ?? '--' : undefined}
            percentage={
              !usarPDV ? captadoProjPercentFmt ?? '0%' : percCaptado ?? '0%'
            }
            subtitle2={!usarPDV ? ' Cobertura potencial' : ' Cobertura'}
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
                  <div>
                    {pesoRealizadoBase?.toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                    })}
                  </div>
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
