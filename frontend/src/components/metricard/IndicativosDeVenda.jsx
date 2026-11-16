import React, { useEffect, useState, useMemo } from 'react';
import './IndicativosDeVenda.css';
import { getIndicadores, getPdv, getPreVendaStatus, getMixItensArea, getClientesPositivacaoArea, getRupturaItens } from '../../services/indicadoresApi';
import BarChartColaboradores from '../BarChart/BarChartColaboradores';
import Select from 'react-select';
import { useAuth } from '../../contexts/auth';
import { fmtMoeda, fmtNum2, toNum, safeDiv, pct } from '../../utils/formatters';
import Card from './indicativos/Card';
import Gauge from './indicativos/Gauge';
import CardDiarioNecessario from './indicativos/CardDiarioNecessario';
import ProjectionModal from './indicativos/ProjectionModal';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';


const DEV = process.env.NODE_ENV !== 'production';
const dlog = (...args) => { if (DEV) console.log('[IndicativosDeVenda]', ...args); };

/* ========= HELPERS GERAIS (FORA DO COMPONENTE) ========= */


function filtrarPorSupervisao(data, selecionadas) {

  if (!data) return data;

  const escopo = data.escopo_rotas || {};
  if (!escopo.e_gerente) return data;

  const selectedIds = (selecionadas || []).map((s) => s.value);
  if (!selectedIds.length) {
    return data;
  }

  const areas = escopo.areas_supervisao || [];
  const vendedoresSet = new Set();

  areas.forEach((area) => {
    if (selectedIds.includes(area.cod_area_supervisao)) {
      (area.vendedores || []).forEach((v) => vendedoresSet.add(String(v)));
    }
  });

  const listaOriginal = data?.vendas?.vendas_por_vendedor || [];
  const listaFiltrada = listaOriginal.filter((row) =>
    vendedoresSet.has(String(row.codcampo))
  );

  // se não achou nenhum vendedor, devolve tudo zerado pra não quebrar
  if (!listaFiltrada.length) {
    return {
      ...data,
      vendas: {
        ...(data.vendas || {}),
        vendas_por_vendedor: [],
        agregados_area: {
          PreVenda_Valor: 0,
          Ruptura_TotalValor: 0,
          QtdClientes: 0,
        },
        ano_anterior_agregado: {
          QtdClientes: 0,
          ValorLiquido: 0,
          PesoTotal: 0,
          Mix: 0,
        },
        ano_anterior_agregado_mes: {
          QtdClientes: 0,
          ValorLiquido: 0,
          PesoTotal: 0,
          Mix: 0,
        },
      },
      realizado_financeiro: {
        ...(data.realizado_financeiro || {}),
        valor: 0,
        percentual_cobertura: 0,
        variacao: 0,
      },
      realizado_peso: {
        ...(data.realizado_peso || {}),
        realizado: 0,
        percentual: 0,
        variacao: 0,
      },
      realizado_mix: {
        ...(data.realizado_mix || {}),
        realizado: 0,
        percentual: 0,
        variacao: 0,
      },
      positivacao: {
        ...(data.positivacao || {}),
        realizado: 0,
        percentual: 0,
        variacao: 0,
      },
      evolucao: {
        ...(data.evolucao || {}),
        valor_ano_anterior: 0,
        percentual: 0,
      },
      'pre-venda': {
        ...(data['pre-venda'] || {}),
        valor_prevenda: 0,
        valor_alocado: 0,
        percentual_prevenda_alocado: 0,
        variacao_prevenda: 0,
      },
      ruptura: {
        ...(data.ruptura || {}),
        total_valor: 0,
        percentual_captado: 0,
      },
    };
  }

  const sumKey = (key) =>
    listaFiltrada.reduce((acc, it) => acc + toNum(it[key]), 0);

  const vendaRealizada = sumKey('ValorLiquido');
  const pesoRealizado = sumKey('PesoTotal');
  const mixRealizado = sumKey('Mix');
  const preVendaAgregado = sumKey('PreVenda_Valor');
  const rupturaAgregado = sumKey('Ruptura_TotalValor');
  const posReal = sumKey('QtdClientes');

  const anoAnteriorAgregado = {
    QtdClientes: sumKey('Ano_anterior_QtdClientes'),
    ValorLiquido: sumKey('Ano_anterior_ValorLiquido'),
    PesoTotal: sumKey('Ano_anterior_PesoTotal'),
    Mix: sumKey('Ano_anterior_Mix'),
  };

  const anoAnteriorAgregadoMes = {
    QtdClientes: sumKey('Ano_anterior_mes_QtdClientes'),
    ValorLiquido: sumKey('Ano_anterior_mes_ValorLiquido'),
    PesoTotal: sumKey('Ano_anterior_mes_PesoTotal'),
    Mix: sumKey('Ano_anterior_mes_Mix'),
  };

  const objetivo = data.objetivo || {};
  const objetivoFinanceiro = toNum(objetivo.financeiro);
  const objetivoPeso = toNum(objetivo.objetivo_peso);
  const objetivoMix = toNum(objetivo.objetivo_mix);
  const objetivoPositivacao = toNum(objetivo.objetivo_positivacao);

  const vendaAnoAnterior = anoAnteriorAgregado.ValorLiquido || 0;
  const evolucaoPercentual =
    safeDiv(vendaRealizada - vendaAnoAnterior, vendaAnoAnterior) * 100;

  const valorAlocado = vendaRealizada + preVendaAgregado;


  return {
    ...data,
    vendas: {
      ...(data.vendas || {}),
      vendas_por_vendedor: listaFiltrada,
      agregados_area: {
        PreVenda_Valor: preVendaAgregado,
        Ruptura_TotalValor: rupturaAgregado,
        QtdClientes: posReal,
      },
      ano_anterior_agregado: anoAnteriorAgregado,
      ano_anterior_agregado_mes: anoAnteriorAgregadoMes,
    },
    realizado_financeiro: {
      ...(data.realizado_financeiro || {}),
      valor: vendaRealizada,
      percentual_cobertura: safeDiv(vendaRealizada, objetivoFinanceiro) * 100,
      variacao: vendaRealizada - objetivoFinanceiro,
    },
    realizado_peso: {
      ...(data.realizado_peso || {}),
      realizado: pesoRealizado,
      percentual: safeDiv(pesoRealizado, objetivoPeso) * 100,
      variacao: pesoRealizado - objetivoPeso,
    },
    realizado_mix: {
      ...(data.realizado_mix || {}),
      realizado: mixRealizado,
      percentual: safeDiv(mixRealizado, objetivoMix) * 100,
      variacao: mixRealizado - objetivoMix,
    },
    positivacao: {
      ...(data.positivacao || {}),
      realizado: posReal,
      percentual: safeDiv(posReal, objetivoPositivacao) * 100,
      variacao: posReal - objetivoPositivacao,
    },
    evolucao: {
      ...(data.evolucao || {}),
      valor_ano_anterior: vendaAnoAnterior,
      percentual: evolucaoPercentual,
    },
    'pre-venda': {
      ...(data['pre-venda'] || {}),
      valor_prevenda: preVendaAgregado,
      valor_alocado: valorAlocado,
      percentual_prevenda_alocado:
        safeDiv(valorAlocado, objetivoFinanceiro) * 100,
      variacao_prevenda: valorAlocado - objetivoFinanceiro,
    },
    ruptura: {
      ...(data.ruptura || {}),
      total_valor: rupturaAgregado,
      percentual_captado: safeDiv(rupturaAgregado, vendaRealizada) * 100,
    },
  };
}

// ===== GERENTE: somas por areas_supervisao (sem filtrar lista de vendedores) =====
const sumAreas = (areas, key) =>
  (Array.isArray(areas) ? areas : []).reduce((acc, a) => acc + toNum(a?.[key]), 0);

const getVendaBases = ({ rawData, selecionadas }) => {
  const escopo = rawData?.escopo_rotas || {};
  const isGerente = Boolean(escopo.e_gerente);

  // NÃO gerente: mantém o comportamento antigo (usa payload padrão)
  if (!isGerente) {
    const atual = toNum(rawData?.realizado_financeiro?.valor);
    const aa = toNum(rawData?.evolucao?.valor_ano_anterior); // já vem do backend hoje
    return { atual, aa };
  }

  // Gerente: usa escopo_rotas.areas_supervisao
  const areas = pickAreas(escopo.areas_supervisao || [], selecionadas);

  const atual = sumAreas(areas, "venda_realizada_area");
  const aa = sumAreas(areas, "venda_ano_anterior_area");

  return { atual, aa };
};


const pickAreas = (areas, selecionadas) => {
  const ids = (selecionadas || []).map((s) => String(s.value));
  if (!ids.length) return Array.isArray(areas) ? areas : [];
  return (Array.isArray(areas) ? areas : []).filter((a) =>
    ids.includes(String(a?.cod_area_supervisao))
  );
};

const calcGerenteVendaFromEscopo = (data, selecionadas) => {
  const escopo = data?.escopo_rotas || {};
  const areas = pickAreas(escopo.areas_supervisao || [], selecionadas);

  const atual = sumAreas(areas, "venda_realizada_area");         // ano atual (período consultado)
  const aa    = sumAreas(areas, "venda_ano_anterior_area");      // ano anterior (mês cheio, por área)
  return { atual, aa };
};

// ===== GERENTE: objetivos por areas_supervisao =====
const calcGerenteObjetivosFromEscopo = (data, selecionadas) => {
  const escopo = data?.escopo_rotas || {};
  const areas = pickAreas(escopo.areas_supervisao || [], selecionadas);

  const objetivo_financeiro = sumAreas(areas, "objetivo_financeiro_area");
  const objetivo_peso = sumAreas(areas, "objetivo_peso_area");
  const objetivo_mix = sumAreas(areas, "objetivo_mix_area");
  const objetivo_positivacao = sumAreas(areas, "objetivo_positivacao_area");

  return {
    objetivo_financeiro,
    objetivo_peso,
    objetivo_mix,
    objetivo_positivacao,
  };
};


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
  valorAnoAnteriorBase,
  usarPDV,
  vendaPDVAnoAnterior
) => {
  if (!rawData) return '--';

  const pdvAA = usarPDV ? Number(vendaPDVAnoAnterior || 0) : 0;

  // 👥 SOMA DA ÁREA
  if (somarArea) {
    const baseMesArea =
      Number(valorAnoAnteriorMesCheioBase || 0) ||
      Number(rawData?.vendas?.ano_anterior_agregado_mes?.ValorLiquido || 0);

    const total = Number(baseMesArea || 0) + pdvAA;
    return total ? fmtMoeda(total) : '--';
  }

  // 👤 INDIVIDUAL
  const linha = getMinhaLinha(rawData);
  const vendMes = Number(linha?.Ano_anterior_mes_ValorLiquido || 0);

  // se tiver mês cheio do vendedor, soma PDV AA
  if (vendMes) {
    const total = vendMes + pdvAA;
    return fmtMoeda(total);
  }

  // fallback “até hoje”
  const base = Number(valorAnoAnteriorBase || 0);
  const total = base + pdvAA;
  return total ? fmtMoeda(total) : '--';
};

/* ========= COMPONENTES DE APRESENTAÇÃO ========= */

/* ========= COMPONENTE PRINCIPAL ========= */

const IndicadoresCards = ({
  periodoSelecionado,
  usarPDV,
  onObjetivosRecebidos,
  onPDVResumoChange,
  onVendedoresPermitidosTabelaChange,
  onProjecoesPorVendedorChange,
}) => {
  const { user } = useAuth();

  dlog('[DEBUG] User Context:', user);

  const [vendaDia, setVendaDia] = useState(0);
  const [showProjectionModal, setShowProjectionModal] = useState(false);
  const [modalPreVendaAberto, setModalPreVendaAberto] = useState(false);
  const [pendenciasPreVenda,  setPendenciasPreVenda]  = useState([]);
  const [loadingPreVenda,     setLoadingPreVenda]     = useState(false);
  const [projecaoPercentual, setProjecaoPercentual] = useState(null);
  const [projecaoRotasValor, setProjecaoRotasValor] = useState(null);
  const [projPercentFin, setProjPercentFin] = useState('--');
  const [projPercentPeso, setProjPercentPeso] = useState('--');
  const [projPercentMix, setProjPercentMix] = useState('--');
  const [projPercentPos, setProjPercentPos] = useState('--');

  const [loading, setLoading] = useState(false);
  const [erroCarga, setErroCarga] = useState(null);
  const [tentativa, setTentativa] = useState(0);
  const [erroMixArea, setErroMixArea] = useState(false);
  const [erroPosArea, setErroPosArea] = useState(false);
  const [erroRupturaArea, setErroRupturaArea] = useState(false);
  const [erroPreVenda, setErroPreVenda] = useState(false);
// === ✅ COLE AQUI (NOVO CÓDIGO) ===
  const [valorRotasAnoAnterior, setValorRotasAnoAnterior] = useState(0); 
  const [valorRotasAnoAnteriorFmt, setValorRotasAnoAnteriorFmt] = useState(null); 
  const [evolucaoRotas, setEvolucaoRotas] = useState(null);
  // --- estados exibidos nos cards/gauges ---
  const [peso, setPeso] = useState(null);
  const [pesoPercentual, setPesoPercentual] = useState(null);
  const [pesoVariacao, setPesoVariacao] = useState(null);
  const [pesoRealizado, setPesoRealizado] = useState(null);

  const [positivadoObjetivo, setPositivadoObjetivo] = useState('');
  const [positivadoRealizado, setPositivadoRealizado] = useState(null);
  const [positivadoPercentual, setPositivadoPercentual] = useState(null);
  const [positivadoVariacao, setPositivadoVariacao] = useState(null);

  const [positivadoRealizadoBase, setPositivadoRealizadoBase] = useState(null); // rotas
  const [positivadoCuponsPDV, setPositivadoCuponsPDV] = useState(null);         // cupons
  const [positivadoTotalFormatado, setPositivadoTotalFormatado] = useState(null); // total

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
  const [objetivoFinanceiroBase, setObjetivoFinanceiroBase] = useState(0); // valor numérico para cálculos
  const [objetivoMix, setObjetivoMix] = useState(null);

  const [alocacaoRealizada, setAlocacaoRealizada] = useState(null);
  const [alocacaoPrevenda, setAlocacaoPrevenda] = useState(null);
  const [alocacaoPercentual, setAlocacaoPercentual] = useState(null);
  const [alocacaoVariacao, setAlocacaoVariacao] = useState(null);
  const [preVendaBaseNum, setPreVendaBaseNum] = useState(0);  

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
  const [dataEscopoAtual, setDataEscopoAtual] = useState(null);

  const [ugUsuario, setUgUsuario] = useState(null);
  const [pdvValorUG, setPdvValorUG] = useState(null);
  const [pdvPesoUG, setPdvPesoUG] = useState(null);
  const [pdvValorArea, setPdvValorArea] = useState(null);
  const [pdvPesoArea, setPdvPesoArea] = useState(null);
  const [pdvValorAAUG, setPdvValorAAUG] = useState(null);
  const [pdvValorAAArea, setPdvValorAAArea] = useState(null);

  const [pdvSelecionadoAtual, setPdvSelecionadoAtual] = useState(0);
  const [isGerente, setIsGerente] = useState(false);
  const [supervisaoOptions, setSupervisaoOptions] = useState([]);
  const [supervisaoSelecionada, setSupervisaoSelecionada] = useState([]);
  const [mapSupVendedores, setMapSupVendedores] = useState({});
  const [modalMixAreaAberto,  setModalMixAreaAberto]  = useState(false);

  // === Modal Pré-Venda Status ===
  useEffect(() => {
    if (!modalPreVendaAberto || !periodoSelecionado) return;
    setLoadingPreVenda(true);
    setErroPreVenda(false);
    setPendenciasPreVenda([]);
    const { de, ate } = periodoSelecionado;
    getPreVendaStatus({ params: { de, ate } })
      .then(({ data }) => setPendenciasPreVenda(data.pendencias || []))
      .catch(err => { console.error('[PreVendaStatus] erro:', err); setErroPreVenda(true); })
      .finally(() => setLoadingPreVenda(false));
  }, [modalPreVendaAberto, periodoSelecionado, tentativa]);
  const [modalPosAreaAberto,  setModalPosAreaAberto]   = useState(false);
  const [itensMixArea,        setItensMixArea]         = useState([]);
  const [clientesPosArea,     setClientesPosArea]      = useState([]);
  const [loadingMixArea,      setLoadingMixArea]       = useState(false);
  const [loadingPosArea,      setLoadingPosArea]       = useState(false);
  const [mostrarNaoVendidosArea, setMostrarNaoVendidosArea] = useState(false);
  const [mostrarNaoPosArea,   setMostrarNaoPosArea]    = useState(false);
  const [criterioValorArea,   setCriterioValorArea]    = useState(false);

  // === Modal Ruptura (Captado) ===
  const [modalRupturaAberto,   setModalRupturaAberto]   = useState(false);
  const [itensRupturaArea,     setItensRupturaArea]     = useState([]);
  const [loadingRupturaArea,   setLoadingRupturaArea]   = useState(false);
  const [criterioValorRuptura, setCriterioValorRuptura] = useState(true); // true = valor, false = qtd
  const [totaisRuptura,        setTotaisRuptura]        = useState({ total_valor: 0, total_qtd: 0 });
  const [filtroFabricanteRuptura, setFiltroFabricanteRuptura] = useState('Todos');


  // === evolução base (sem PDV)
  const applyEvolucaoFromRaw = (data, isArea, atualOverride) => {
    const isGerente = Boolean(data?.escopo_rotas?.e_gerente);
    if (isGerente) return; // gerente já tem evolução própria

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
  setDataEscopoAtual(data);

    const m = data.minha_visao;
    const linha = getMinhaLinha(data);
    setVendaDia(Number(linha?.venda_media_diaria_atual || 0));

    dlog('applyIndividualFromRaw - minha_visao:', m);
    dlog('applyIndividualFromRaw - minha linha:', linha);

    if (m) {
      setVendaRealizada(fmtMoeda(m.realizado_financeiro));
      setVendaRealizadaBase(m.realizado_financeiro);
      setObjetivoFinanceiro(fmtMoeda(m.objetivo_financeiro));
      setObjetivoFinanceiroBase(Number(m.objetivo_financeiro) || 0);
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

      
      const mixPdvLinha = Number(linha?.mix_pdv?.mix || linha?.mix_pdv_realizado || 0);
      const mixParaCard = (usarPDV && mixPdvLinha > 0) ? mixPdvLinha : Number(m?.mix_realizado || 0);
      const objMixNum   = Number(m?.objetivo_mix || 0);

      setObjetivoMix(String(objMixNum));
      setMixRealizado(String(mixParaCard));
      setMixPercentual(`${objMixNum > 0 ? ((mixParaCard / objMixNum) * 100).toFixed(2) : 0}%`);
      setMixVariacao(String(mixParaCard - objMixNum));
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
      setObjetivoFinanceiroBase(Number(data.objetivo?.financeiro) || 0);

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

    const posReal = Number(
      m?.realizado_positivacao ?? linha?.QtdClientes ?? 0
    );
    const objPos = Number(
      m?.objetivo_positivacao ??
        data?.objetivo?.objetivo_positivacao ??
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
    setPreVendaBaseNum(pre);
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

    const cuponsPDV = Number(data?.positivacao?.cupons_pdv || 0);
    const posTotal  = posReal + cuponsPDV;

    setPositivadoRealizadoBase(posReal.toLocaleString('pt-BR'));
    setPositivadoCuponsPDV(cuponsPDV > 0 ? cuponsPDV.toLocaleString('pt-BR') : null);
    setPositivadoTotalFormatado(posTotal.toLocaleString('pt-BR'));
    setPositivadoObjetivo(objPos.toLocaleString('pt-BR'));
    setPositivadoRealizado(posReal.toLocaleString('pt-BR'));
    setPositivadoPercentual(`${pct(posReal, objPos).toFixed(2)}%`);
    setPositivadoVariacao((posReal - objPos).toLocaleString('pt-BR'));

    applyEvolucaoFromRaw(data, false);
  };

  const applyAreaFromRaw = (data, selecionadasOverride = null) => {
    if (!data) return;
    setDataEscopoAtual(data);

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
    setObjetivoFinanceiroBase(Number(data.objetivo?.financeiro) || 0);

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

    const mixPdvGrupo  = data?.realizado_mix?.mix_pdv_grupo;
    const mixPdvReal   = Number(mixPdvGrupo?.mix_grupo || 0);
    const realizadoMix = (usarPDV && mixPdvReal > 0) ? mixPdvReal : Number(data.realizado_mix?.realizado || 0);
    //const percentualMix = data.realizado_mix?.percentual || 0;
    //const variacaoMix   = data.realizado_mix?.variacao   || 0;
    const objMix        = Number(data.objetivo?.objetivo_mix || 0);

    setObjetivoMix(String(objMix));
    setMixRealizado(String(realizadoMix));
    setMixPercentual(objMix > 0 ? `${((realizadoMix / objMix) * 100).toFixed(2)}%` : '0%');
    setMixVariacao(String(realizadoMix - objMix));

    const agg = data?.vendas?.agregados_area || {};
    const list = data?.vendas?.vendas_por_vendedor || [];
    const soma = (k) => list.reduce((acc, it) => acc + Number(it?.[k] || 0), 0);
    dlog('[DEBUG venda_dia] list:', list.map(v => ({ cod: v.codcampo, venda_dia: v.venda_dia })));
    setVendaDia(Math.round(soma('venda_media_diaria_atual')));

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
      data?.positivacao?.realizado ??
        ((agg.QtdClientes ?? null) !== null ? agg.QtdClientes : soma('QtdClientes'))
    );

    dlog('AREA preAgg:', preAgg, 'rupAgg:', rupAgg, 'posAgg(QtdClientes soma):', posAgg);

// ======= Alocação (Venda + Pré-venda) ======
// Regra (sem quebrar o atual):
// - GERENTE => usa escopo_rotas.areas_supervisao (respeita filtro do Select)
// - NÃO gerente => mantém agregados_area/lista (como já estava)

const escopo = data?.escopo_rotas || {};
const gerente = Boolean(escopo.e_gerente);

// ✅ usa a seleção “passada” (quando existir) para evitar state desatualizado
const selecionadasNow = Array.isArray(selecionadasOverride)
  ? selecionadasOverride
  : (Array.isArray(supervisaoSelecionada) ? supervisaoSelecionada : []);

const allAreas = Array.isArray(escopo.areas_supervisao) ? escopo.areas_supervisao : [];
const areasUsadas = gerente ? pickAreas(allAreas, selecionadasNow) : [];

// === OBJETIVO ===
const objFin = gerente
  ? sumAreas(areasUsadas, "objetivo_financeiro_area")
  : toNum(data?.objetivo?.financeiro);

// === PRÉ-VENDA ===
const prevendaBase = gerente
  ? sumAreas(areasUsadas, "pre_venda_area")
  : toNum(preAgg);

// === VENDA REALIZADA (base do período) ===
const vendaRealizadaBaseLocal = gerente
  ? sumAreas(areasUsadas, "venda_realizada_area")
  : toNum(valorVendaGrupo);

// === ALOCAÇÃO FINAL ===
const valorAlocado = vendaRealizadaBaseLocal + prevendaBase;
setPreVendaBaseNum(prevendaBase);

setAlocacaoPrevenda(fmtMoeda(prevendaBase));
setAlocacaoRealizada(fmtMoeda(valorAlocado));

const percAlocado = pct(valorAlocado, objFin);
setAlocacaoPercentual(`${percAlocado.toFixed(2)}%`);
setAlocacaoVariacao(
  (valorAlocado - objFin).toLocaleString("pt-BR", { minimumFractionDigits: 2 })
);

    // Captado base + exibido (área)
    setCaptadoBase(rupAgg);
    setCaptadoValor(fmtMoeda(rupAgg));
    setCpercCaptado(`${pct(rupAgg, valorVendaGrupo).toFixed(2)}%`);

    const objPos = Number(data?.objetivo?.objetivo_positivacao || 0);
    dlog('AREA objPos (objetivo_positivacao):', objPos);

    const cuponsPDVArea = Number(data?.positivacao?.cupons_pdv || 0);
    const posTotalArea  = posAgg + cuponsPDVArea;

    setPositivadoRealizadoBase(posAgg.toLocaleString('pt-BR'));
    setPositivadoCuponsPDV(cuponsPDVArea > 0 ? cuponsPDVArea.toLocaleString('pt-BR') : null);
    setPositivadoTotalFormatado(posTotalArea.toLocaleString('pt-BR'));
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
    // 🔧 invalida cache do PDV para forçar novo fetch ao trocar período
    setPdvValorUG(null);
    setPdvPesoUG(null);
    setPdvValorArea(null);
    setPdvPesoArea(null);
    setPdvValorAAUG(null);
    setPdvValorAAArea(null);
    setLoading(true);
    setErroCarga(null);

      try {
        const { data } = await getIndicadores({ params: { de, ate } });
        dlog('payload bruto /Indicadores:', data);

        const objetivos = [];
        const rotasTotal = Number(data?.vendas?.venda_ano_anterior_rotas?.valor_total || 0);
        setValorRotasAnoAnterior(rotasTotal);
        

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

// 1. Injeta todos que estão na lista de vendas (para garantir que os desligados entrem)
if (Array.isArray(data?.vendas?.vendas_por_vendedor)) {
          const vendedoresComVenda = data.vendas.vendas_por_vendedor.map((item) => ({
            codFuncionario: Number(item.codcampo),
            nomeFuncionario: item.Campo,
            objetivo_financeiro: 0,
            objetivo_mix: 0,
            objetivo_peso: 0,
            objetivo_positivacao: 0,
          }));
          objetivos.push(...vendedoresComVenda);
        }

// 2. Unifica os dados para não ter o mesmo vendedor duplicado (Protegendo as metas!)
        let objetivosUnificados = objetivos.reduce((acc, curr) => {
          const existente = acc.find(
            (o) => o.codFuncionario === curr.codFuncionario
          );
          
          if (!existente) {
            acc.push(curr);
          } else {
            // Se o vendedor já existe na lista, NÃO deixamos os zeros apagarem as metas reais!
            existente.objetivo_financeiro = existente.objetivo_financeiro || curr.objetivo_financeiro || 0;
            existente.objetivo_mix = existente.objetivo_mix || curr.objetivo_mix || 0;
            existente.objetivo_peso = existente.objetivo_peso || curr.objetivo_peso || 0;
            existente.objetivo_positivacao = existente.objetivo_positivacao || curr.objetivo_positivacao || 0;
            existente.nomeFuncionario = existente.nomeFuncionario || curr.nomeFuncionario;
          }
          return acc;
        }, []);
        // ---> 🚨 INÍCIO DOS LOGS DE DEBUG 🚨 <---
        dlog("🔍 1. Quantos vendedores existem ANTES do filtro?", objetivosUnificados.length);
        
        const listaVendasParaFiltro = data?.vendas?.vendas_por_vendedor || [];
        
        objetivosUnificados = objetivosUnificados.filter((obj) => {
          const dadosVenda = listaVendasParaFiltro.find(v => Number(v.codcampo) === obj.codFuncionario);
          
          const faturado = Math.abs(Number(dadosVenda?.ValorLiquido) || 0);
          const preVenda = Math.abs(Number(dadosVenda?.PreVenda_Valor) || 0);
          const pesoVend = Math.abs(Number(dadosVenda?.PesoTotal) || 0);
          const pdvCupon = Math.abs(Number(dadosVenda?.pos_cupons_pdv) || 0);
          
          const atividadeTotal = faturado + preVenda + pesoVend + pdvCupon;
          const passouNoFiltro = atividadeTotal > 0.01;
          
          // Imprime o "raciocínio" do sistema para CADA vendedor
          dlog(`👤 Vendedor: [${obj.codFuncionario}] ${obj.nomeFuncionario} | ` +
                      `Faturado: ${faturado} | Pre: ${preVenda} | Peso: ${pesoVend} | PDV: ${pdvCupon} | ` +
                      `Total: ${atividadeTotal} -> PASSOU? ${passouNoFiltro ? "✅ SIM" : "❌ NÃO"}`);

          return passouNoFiltro;
        });

        dlog("🔍 2. Quantos vendedores sobraram DEPOIS do filtro?", objetivosUnificados.length);
        // ---> 🚨 FIM DOS LOGS DE DEBUG 🚨 <---

        // 4. Envia para o React gerar os cards
        if (onObjetivosRecebidos) {
          onObjetivosRecebidos(objetivosUnificados);
        }

            if (onObjetivosRecebidos) onObjetivosRecebidos(objetivosUnificados);

            // Extrai projecoes_detalhadas de cada vendedor e emite para o pai
        if (typeof onProjecoesPorVendedorChange === 'function') {
          const mapaProjecoes = {};
          const lista = data?.vendas?.vendas_por_vendedor || [];
          lista.forEach((v) => {
            const cod = Number(v.codcampo);
            if (cod && v.projecoes_detalhadas) {
              mapaProjecoes[cod] = {
                ...v.projecoes_detalhadas,
                pos_cupons_pdv: Number(v.pos_cupons_pdv || 0),
                pos_rotas:      Number(v.pos_rotas || 0),
                pos_total:      Number(v.pos_total || 0),
              };
            }
          });
          onProjecoesPorVendedorChange(mapaProjecoes);
        }

            setRawData(data);
            setDataEscopoAtual(data);

            const escopo = data?.escopo_rotas || {};
            const gerente = Boolean(escopo.e_gerente);
            setIsGerente(gerente);

            if (Array.isArray(escopo.areas_supervisao)) {
              const map = {};
              const opts = escopo.areas_supervisao.map((item) => {
                const value = item.cod_area_supervisao; // vindo do backend

                const vendedoresDaSup = Array.isArray(item.vendedores)
                  ? item.vendedores.map((v) => Number(v))
                  : [];

                map[value] = vendedoresDaSup;

                return {
                  value,
                  label: `${item.area_supervisao} - ${item.nome_supervisor}`,
                };
              });

              setSupervisaoOptions(opts);
              setSupervisaoSelecionada([]); // começa SEM nada selecionado
              if (typeof onVendedoresPermitidosTabelaChange === 'function') {
                  onVendedoresPermitidosTabelaChange([]); // <<< NOVO: filtro vazio = mostra todos
                }
              setMapSupVendedores(map);
            } else {
              setSupervisaoOptions([]);
              setMapSupVendedores({});
              if (typeof onVendedoresPermitidosTabelaChange === 'function') {
                onVendedoresPermitidosTabelaChange([]); // garante “sem filtro”
              }
            }

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

            // visão padrão conforme o tipo de usuário
            if (gerente || user?.supervisor) {
              // gerente: visão área (todos os vendedores)
              setSomarArea(true);
              applyAreaFromRaw(data);
            } else {
              // vendedor / supervisor: visão individual
              setSomarArea(false);
              applyIndividualFromRaw(data);
            }
            } catch (error) {
              console.error('Erro ao buscar os indicadores:', error);
              setErroCarga('Não foi possível carregar os indicadores. Verifique a conexão e tente novamente.');
              setPeso('Erro');
            } finally {
              setLoading(false);
            }
            };



    fetchIndicadores();
  }, [periodoSelecionado, onObjetivosRecebidos, user, tentativa]);

  // === CÁLCULO ESPECÍFICO PARA O CARD "ROTAS" (GERÊNCIA) ===

  useEffect(() => {
  // 1. Definição do Realizado Atual (Considera PDV se estiver ativo)
  const atualTotal = Number(vendaRealizadaBase || 0) + 
                     (usarPDV ? Number(pdvSelecionadoAtual || 0) : 0);

  // 2. Definição da Base Anterior (Usa o campo "Rotas" + PDV Ano Anterior se ativo)
  const baseRotasTotal = Number(valorRotasAnoAnterior || 0) + 
                         (usarPDV ? Number(vendaPDVAnoAnterior || 0) : 0);

  // 3. Cálculo do Percentual de Evolução
  // (Atual - Anterior) / Anterior * 100
  const perc = baseRotasTotal > 0 ? ((atualTotal - baseRotasTotal) / baseRotasTotal) * 100 : 0;

  // 4. Formatação para exibição
  setValorRotasAnoAnteriorFmt(
    baseRotasTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  );
  setEvolucaoRotas(`${perc.toFixed(2)}%`);

}, [
  vendaRealizadaBase, 
  valorRotasAnoAnterior, 
  usarPDV, 
  pdvSelecionadoAtual, 
  vendaPDVAnoAnterior
]);

  useEffect(() => {
  if (!rawData) return;

  const isGerente = Boolean(rawData?.escopo_rotas?.e_gerente);

  if (isGerente) {
    // 🔥 PONTO-CHAVE:
    // filtro vazio = soma TODAS as supervisões
    applySupervisaoFromRaw(rawData, []);
  }
}, [rawData]);

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

      if (dataEscopoAtual) {
        if (valorAASel != null) {
          setVendaPDVAnoAnterior(valorAASel);
        }
        applyEvolucaoFromRaw(dataEscopoAtual, somarArea, novoValor);
      }

      notifyPDVResumo(somarArea, usarPDV);
    };

    const fetchPDV = async () => {
      setLoading(true);
      try {
        const { de, ate } = periodoSelecionado || {};
        if (!de || !ate) return;

        const res = await getPdv({ params: { de, ate } });
        const data = res.data || {};

        dlog('[DEBUG PDV] Payload Recebido do Backend:', data);
        dlog('[DEBUG PDV] UG do Usuário:', data.unid_gestora_usuario);
        dlog('[DEBUG PDV] Detalhado AA (Ano Anterior):', data.detalhado_aa_por_unid_gestora);
        dlog('[IndicadoresPDV][RAW]', data);

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
        setErroCarga('Não foi possível carregar os dados de PDV. Tente novamente.');
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
    tentativa,
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
    const vendaBase = Number(vendaRealizadaBase || 0);
    const captadoNum = Number(captadoBase || 0);
    const objetivoFinNum = parseFloat(
      (objetivoFinanceiro
        ?.replace(/[^\d,-]/g, '')
        .replace(',', '.') || '0')
    );

    const preVendaNum = Number(preVendaBaseNum || 0);
    const totalProj = vendaBase + preVendaNum + captadoNum;
    const percProj = objetivoFinNum ? (totalProj / objetivoFinNum) * 100 : 0;

    setCaptadoProjTotalFmt(
      totalProj.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    );
    setCaptadoProjPercentFmt(`${percProj.toFixed(2)}%`);
  }, [usarPDV, vendaRealizadaBase,preVendaBaseNum, captadoBase, objetivoFinanceiro]);
// === NOVO useEffect: Recalcula Projeção ao mudar dados ou toggle de PDV ===
  useEffect(() => {
    if (!dataEscopoAtual) return;
    
    const projData = dataEscopoAtual.projecao_empresa || {};
    const fin = projData.financeiro || {};
    const rotas = projData.financeiro_rotas || {};
    // Pega o objetivo financeiro atual do escopo
    const objetivo = Number(dataEscopoAtual.objetivo?.financeiro || 0);

    let atingimento = 0;
    
    // LÓGICA DE CORREÇÃO:
    if (usarPDV) {
        // Se PDV está ligado, usa a projeção TOTAL (que inclui PDV se houver)
        atingimento = fin.atingimento_projetado;
    } else {
        // Se PDV está desligado, usa apenas a projeção de ROTAS
        // e calcula a % manualmente contra o objetivo
        const valProj = rotas.projecao_final || 0;
        if (objetivo > 0) {
            atingimento = (valProj / objetivo) * 100;
        }
    }

    if (atingimento) {
        setProjecaoPercentual(`${fmtNum2(atingimento)}%`);
    } else {
        setProjecaoPercentual('--');
    }

    // O valor em Reais (secundário) sempre mostra Rotas puras para referência, ou mude se preferir
    if (rotas.projecao_final) {
        setProjecaoRotasValor(fmtMoeda(rotas.projecao_final));
    } else {
        setProjecaoRotasValor('--');
    }

  }, [dataEscopoAtual, usarPDV]); // Recalcula sempre que os dados ou o switch mudam

// === NOVO useEffect: Recalcula Projeção (4 Indicadores) ===
  useEffect(() => {
    if (!dataEscopoAtual) return;
    
    // 1. Define a fonte de dados padrão (Geral/Empresa/Supervisão)
    let projData = dataEscopoAtual.projecao_empresa || {};
    let objetivos = dataEscopoAtual.objetivo || {};

    // 2. Lógica de Substituição para Visão Individual (Vendedor)
    // Se o botão "Soma da Área" estiver DESLIGADO e tivermos um usuário logado
    if (!somarArea && user?.cod_funcionario) {
        const userCod = String(user.cod_funcionario);
        
        // Procura a linha do vendedor logado nos dados detalhados
        const linhaVendedor = dataEscopoAtual.vendas?.vendas_por_vendedor?.find(
            (v) => String(v.codcampo) === userCod
        );

        // Se encontrou, usa as projeções detalhadas dele
        if (linhaVendedor && linhaVendedor.projecoes_detalhadas) {
            const d = linhaVendedor.projecoes_detalhadas;
            
            // Sobrescreve o objeto de projeção com os dados do indivíduo
            projData = {
                financeiro: d.financeiro_total,        // Total (Rotas + PDV)
                financeiro_rotas: d.financeiro_rotas,  // Só Rotas
                financeiro_pdv: d.financeiro_pdv,      // Só PDV
                
                // Nota: O backend atualmente manda o peso total em 'd.peso'. 
                // Usamos ele para ambos os casos se não houver distinção específica no backend.
                peso: d.peso,       
                peso_rotas: d.peso, 

                mix: { projecao: d.mix },       // Objeto de projeção do Mix
                positivacao: d.positivacao      // Objeto de projeção da Positivação
            };

            // Atualiza os Objetivos para usar os do Vendedor (Minha Visão)
            const mv = dataEscopoAtual.minha_visao;
            if (mv && String(mv.cod_funcionario) === userCod) {
                objetivos = {
                    financeiro: mv.objetivo_financeiro,
                    objetivo_peso: mv.objetivo_peso,
                    objetivo_mix: mv.objetivo_mix,
                    objetivo_positivacao: mv.objetivo_positivacao
                };
            }
        }
    }

    // --- Helpers de extração (Mantidos) ---
    const getProjPercent = (objProjTotal, objProjRotas, goal, isPdvOn) => {
        let atingimento = 0;
        const goalNum = Number(goal || 0);

        if (isPdvOn) {
            // Se PDV ON: usa o atingimento total calculado no backend (já inclui PDV)
            atingimento = objProjTotal?.atingimento_projetado || 0;
        } else {
            // Se PDV OFF: usa a projeção apenas de Rotas e divide pela meta
            const valProj = objProjRotas?.projecao_final || 0;
            if (goalNum > 0) {
                atingimento = (valProj / goalNum) * 100;
            }
        }
        return atingimento;
    };

    // 1. Financeiro
let pFin = 0;
    if (usarPDV && somarArea) {
        // Supervisor/Gerente com PDV ON: recalcula pelo objetivo real de cada vendedor
        // (evita dividir total rotas+PDV pelo objetivo de rotas apenas)
        const listaVend = dataEscopoAtual?.vendas?.vendas_por_vendedor || [];
        let sumProj = 0, sumObj = 0;
        listaVend.forEach(v => {
            const d = v.projecoes_detalhadas || {};
            const proj  = d.financeiro_total?.projecao_final || 0;
            const ating = d.financeiro_total?.atingimento_projetado || 0;
            sumProj += proj;
            if (ating > 0) sumObj += (proj / ating) * 100; // back-calcula objetivo real
        });
        pFin = sumObj > 0 ? (sumProj / sumObj) * 100 : 0;
    } else {
        pFin = getProjPercent(projData.financeiro, projData.financeiro_rotas, objetivos.financeiro, usarPDV);
    }
    setProjPercentFin(pFin ? `${fmtNum2(pFin)}%` : '--');

    // 2. Peso
    const pPeso = getProjPercent(
        projData.peso, 
        projData.peso_rotas, 
        objetivos.objetivo_peso, 
        usarPDV
    );
    setProjPercentPeso(pPeso ? `${fmtNum2(pPeso)}%` : '--');

    // 3. Mix (Usa a projeção direta do objeto)
    const pMix = projData.mix?.projecao?.atingimento_projetado || 0;
    setProjPercentMix(pMix ? `${fmtNum2(pMix)}%` : '--');

    // 4. Positivação (Usa a projeção direta do objeto)
    const pPos = projData.positivacao?.atingimento_projetado || 0;
    setProjPercentPos(pPos ? `${fmtNum2(pPos)}%` : '--');

  }, [dataEscopoAtual, usarPDV, somarArea, user]); // Adicionado somarArea e user nas dependências

  useEffect(() => {
  if (!modalMixAreaAberto || !rawData) return;

  const escopo = rawData?.escopo_rotas || {};
  const isGerente = Boolean(escopo.e_gerente);
  const vendedoresList = escopo.vendedores_escopo || [];

  // Para gerente com filtro ativo, usa só vendedores das áreas selecionadas
  let vendedores = vendedoresList;
  if (isGerente && supervisaoSelecionada?.length > 0) {
    const areas = escopo.areas_supervisao || [];
    const idsSel = supervisaoSelecionada.map(s => String(s.value));
    vendedores = areas
      .filter(a => idsSel.includes(String(a.cod_area_supervisao)))
      .flatMap(a => a.vendedores || []);
  }

  if (!vendedores.length) return;

  setErroMixArea(false);
  setLoadingMixArea(true);
  getMixItensArea({
    params: {
      de:          periodoSelecionado?.de,
      ate:         periodoSelecionado?.ate,
      vendedores:  vendedores.join(','),
      modo:        mostrarNaoVendidosArea ? "nao_vendidos" : "vendidos",
      criterio:    criterioValorArea ? "valor" : "qtd",
      ordem:       "top",
    }
  })
    .then(res => setItensMixArea(res.data?.itens || []))
    .catch(() => { setItensMixArea([]); setErroMixArea(true); })
    .finally(() => setLoadingMixArea(false));

}, [modalMixAreaAberto, mostrarNaoVendidosArea, criterioValorArea, rawData, supervisaoSelecionada, periodoSelecionado, tentativa]);

useEffect(() => {
  if (!modalPosAreaAberto || !rawData) return;

  const escopo = rawData?.escopo_rotas || {};
  let vendedores = escopo.vendedores_escopo || [];

  if (Boolean(escopo.e_gerente) && supervisaoSelecionada?.length > 0) {
    const areas = escopo.areas_supervisao || [];
    const idsSel = supervisaoSelecionada.map(s => String(s.value));
    vendedores = areas
      .filter(a => idsSel.includes(String(a.cod_area_supervisao)))
      .flatMap(a => a.vendedores || []);
  }

  if (!vendedores.length) return;

  setErroPosArea(false);
  setLoadingPosArea(true);
  getClientesPositivacaoArea({
    params: {
      de:          periodoSelecionado?.de,
      ate:         periodoSelecionado?.ate,
      vendedores:  vendedores.join(','),
      positivados: mostrarNaoPosArea ? "false" : "true",
    }
  })
    .then(res => setClientesPosArea(res.data?.clientes || []))
    .catch(() => { setClientesPosArea([]); setErroPosArea(true); })
    .finally(() => setLoadingPosArea(false));

}, [modalPosAreaAberto, mostrarNaoPosArea, rawData, supervisaoSelecionada, periodoSelecionado, tentativa]);

useEffect(() => {
  if (!modalRupturaAberto || !rawData) return;

  setFiltroFabricanteRuptura('Todos'); // reseta o filtro a cada abertura

  const escopo = rawData?.escopo_rotas || {};
  let vendedores = escopo.vendedores_escopo || [];

  if (Boolean(escopo.e_gerente) && supervisaoSelecionada?.length > 0) {
    const areas = escopo.areas_supervisao || [];
    const idsSel = supervisaoSelecionada.map(s => String(s.value));
    vendedores = areas
      .filter(a => idsSel.includes(String(a.cod_area_supervisao)))
      .flatMap(a => a.vendedores || []);
  }

  if (!vendedores.length) return;

  setErroRupturaArea(false);
  setLoadingRupturaArea(true);
  getRupturaItens({
    params: {
      de:         periodoSelecionado?.de,
      ate:        periodoSelecionado?.ate,
      vendedores: vendedores.join(','),
      criterio:   criterioValorRuptura ? "valor" : "qtd",
    }
  })
    .then(res => {
      setItensRupturaArea(res.data?.itens || []);
      setTotaisRuptura({
        total_valor: res.data?.total_valor || 0,
        total_qtd:   res.data?.total_qtd || 0,
      });
    })
    .catch(() => { setItensRupturaArea([]); setTotaisRuptura({ total_valor: 0, total_qtd: 0 }); setErroRupturaArea(true); })
    .finally(() => setLoadingRupturaArea(false));

}, [modalRupturaAberto, criterioValorRuptura, rawData, supervisaoSelecionada, periodoSelecionado, tentativa]);

// Lista de fabricantes distintos presentes na ruptura (para o dropdown do modal)
const fabricantesRupturaDisponiveis = useMemo(() => {
  const nomes = new Set(itensRupturaArea.map(i => i.Fabricante || 'Sem fabricante'));
  return ['Todos', ...Array.from(nomes).sort((a, b) => a.localeCompare(b))];
}, [itensRupturaArea]);

// Itens filtrados por fabricante + totais/percentuais RECALCULADOS sobre o subconjunto filtrado
const { itensRupturaFiltrados, totaisRupturaFiltrados } = useMemo(() => {
  const base = filtroFabricanteRuptura === 'Todos'
    ? itensRupturaArea
    : itensRupturaArea.filter(i => (i.Fabricante || 'Sem fabricante') === filtroFabricanteRuptura);

  const totalValor = base.reduce((s, i) => s + Number(i.ValorTotal || 0), 0);
  const totalQtd    = base.reduce((s, i) => s + Number(i.QtdItens   || 0), 0);

  const recalculados = base.map(i => ({
    ...i,
    PercValor: totalValor ? Number(((i.ValorTotal / totalValor) * 100).toFixed(1)) : 0,
    PercQtd:   totalQtd   ? Number(((i.QtdItens   / totalQtd)   * 100).toFixed(1)) : 0,
  }));

  // ordena conforme o critério ativo, já que a filtragem pode ter alterado a ordem relativa
  recalculados.sort((a, b) =>
    criterioValorRuptura ? b.ValorTotal - a.ValorTotal : b.QtdItens - a.QtdItens
  );

  return {
    itensRupturaFiltrados: recalculados,
    totaisRupturaFiltrados: { total_valor: totalValor, total_qtd: totalQtd },
  };
}, [itensRupturaArea, filtroFabricanteRuptura, criterioValorRuptura]);

const exportarMixAreaPDF = () => {
  const doc = new jsPDF();
  autoTable(doc, {
    head: [mostrarNaoVendidosArea ? ['#', 'Produto'] : ['#', 'Produto', 'Qtd', 'Valor (R$)', '%']],
    body: itensMixArea.map((item, i) => {
      const base = [i + 1, item.Material || `Cod: ${item.CodMaterial}`];
      if (!mostrarNaoVendidosArea) {
        base.push(
          Number(item.QtdItens).toLocaleString('pt-BR'),
          Number(item.ValorTotal).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
          `${criterioValorArea ? (item.PercValor ?? 0) : (item.PercQtd ?? 0)}%`,
        );
      }
      return base;
    }),
    startY: 40,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [124, 58, 237] },
  });
  doc.save(`mix_area_${periodoSelecionado?.de}.pdf`);
};

const exportarPosAreaPDF = () => {
  const doc = new jsPDF();
  autoTable(doc, {
    head: [['#', 'Cliente', 'Rota']],
    body: clientesPosArea.map((c, i) => [i + 1, c.Cliente, c.Rota]),
    startY: 40,
    styles: { fontSize: 8 },
    headStyles: { fillColor: mostrarNaoPosArea ? [239, 68, 68] : [34, 197, 94] },
  });
  doc.save(`positivacao_area_${periodoSelecionado?.de}.pdf`);
};

const exportarRupturaPDF = () => {
  const doc = new jsPDF();
  doc.setFontSize(13);
  doc.text('Itens em Ruptura (não atendidos)', 14, 15);
  doc.setFontSize(9);
  doc.setTextColor(100);
  const filtroTxt = filtroFabricanteRuptura !== 'Todos' ? ` | Fabricante: ${filtroFabricanteRuptura}` : '';
  doc.text(
    `Total: ${totaisRupturaFiltrados.total_valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} | ${totaisRupturaFiltrados.total_qtd.toLocaleString('pt-BR')} unid.${filtroTxt}`,
    14, 21
  );

  autoTable(doc, {
    head: [['#', 'Produto', 'Grupo', 'Fabricante', 'Qtd', 'Valor (R$)', '%']],
    body: itensRupturaFiltrados.map((item, i) => [
      i + 1,
      item.Material || `Cod: ${item.CodMaterial}`,
      item.Grupo || '',
      item.Fabricante || 'Sem fabricante',
      Number(item.QtdItens).toLocaleString('pt-BR'),
      Number(item.ValorTotal).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      `${criterioValorRuptura ? (item.PercValor ?? 0) : (item.PercQtd ?? 0)}%`,
    ]),
    startY: 27,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [239, 68, 68] },
  });
  doc.save(`ruptura_itens_${periodoSelecionado?.de}.pdf`);
};


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

    if (dataEscopoAtual) {
      applyEvolucaoFromRaw(dataEscopoAtual, novo, novoValor);
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
  const handleChangeSupervisao = (event) => {
    const selectedValues = Array.from(event.target.selectedOptions).map((opt) =>
      String(opt.value)
    );

    const selecionadas = supervisaoOptions.filter((opt) =>
      selectedValues.includes(String(opt.value))
    );

    setSupervisaoSelecionada(selecionadas);
  };

const applySupervisaoFromRaw = (data, selecionadas) => {
  if (!data) return;

  const escopo = data?.escopo_rotas || {};
  const gerente = Boolean(escopo.e_gerente);

  // se não for gerente, mantém tudo como já está hoje
  if (!gerente) {
    setSomarArea(false);
    setDataEscopoAtual(data);
    applyIndividualFromRaw(data);
    return;
  }

  // ===== gerente: sempre visão de área =====
  setSomarArea(true);

  // (A) recalcula os demais cards pela lógica atual (filtrando vendedores quando selecionar)
  //     - vazio: aplica visão geral
  //     - selecionado: aplica filtrado
  const filtrado = !selecionadas || selecionadas.length === 0
  
    ? data
    : filtrarPorSupervisao(data, selecionadas);
  // Se tivermos filtro ativo, somamos as projeções individuais para substituir o 'projecao_empresa' global.
  if (selecionadas && selecionadas.length > 0) {
      const listaVend = filtrado.vendas?.vendas_por_vendedor || [];
      
      // Acumuladores
      let sumFinProj = 0, sumFinObj = 0, sumFinMetaDia = 0;
      let sumFinObjTotal = 0;
      let sumRotasProj = 0, sumPdvProj = 0;
      let sumPesoProj = 0, sumMixProj = 0, sumPosProj = 0;

      listaVend.forEach(v => {
          const d = v.projecoes_detalhadas || {};
          
          // Somatórios Financeiro
          if(d.financeiro_total) {
              sumFinProj += (d.financeiro_total.projecao_final || 0);
              sumFinMetaDia += (d.financeiro_total.meta_diaria_necessaria || 0);

              const ating = d.financeiro_total.atingimento_projetado || 0;
              const proj  = d.financeiro_total.projecao_final || 0;
              if (ating > 0) sumFinObjTotal += (proj / ating) * 100;
          }
          if(d.financeiro_rotas) sumRotasProj += (d.financeiro_rotas.projecao_final || 0);
          if(d.financeiro_pdv) sumPdvProj += (d.financeiro_pdv.projecao_final || 0);

          // Outros KPIs
          if(d.peso) sumPesoProj += (d.peso.projecao_final || 0);
          if(d.mix) sumMixProj += (d.mix.projecao_final || 0);
          if(d.positivacao) sumPosProj += (d.positivacao.projecao_final || 0);
      });

      // Recalcula objetivos da área selecionada
      const objArea = calcGerenteObjetivosFromEscopo(data, selecionadas);
      
      // Constrói novo objeto de projeção para a área filtrada
      const newProjEmpresa = {
          ...data.projecao_empresa, 
          financeiro: {
              ...data.projecao_empresa?.financeiro,
              projecao_final: sumFinProj,
              atingimento_projetado: sumFinObjTotal > 0 ? (sumFinProj / sumFinObjTotal) * 100 : 0,
              meta_diaria_necessaria: sumFinMetaDia
          },
          financeiro_rotas: {
              ...data.projecao_empresa?.financeiro_rotas,
              projecao_final: sumRotasProj
          },
          financeiro_pdv: {
              ...data.projecao_empresa?.financeiro_pdv,
              projecao_final: sumPdvProj
          },
          peso: {
              ...data.projecao_empresa?.peso,
              projecao_final: sumPesoProj,
              atingimento_projetado: objArea.objetivo_peso > 0 ? (sumPesoProj / objArea.objetivo_peso) * 100 : 0
          },
          mix: {
              ...data.projecao_empresa?.mix,
              projecao: {
                  ...data.projecao_empresa?.mix?.projecao,
                  atingimento_projetado: objArea.objetivo_mix > 0 ? (sumMixProj / objArea.objetivo_mix) * 100 : 0
              }
          },
          positivacao: {
              ...data.projecao_empresa?.positivacao,
              atingimento_projetado: objArea.objetivo_positivacao > 0 ? (sumPosProj / objArea.objetivo_positivacao) * 100 : 0
          },
          // Ajusta detalhes valores para o Modal
          detalhes_valores: {
              rotas: sumAreas(filtrado.vendas?.vendas_por_vendedor, "venda_rotas"),
              pdv: sumAreas(filtrado.vendas?.vendas_por_vendedor, "venda_pdv"),
              total: sumAreas(filtrado.vendas?.vendas_por_vendedor, "venda_total_geral")
          }
      };

      // Sobrescreve no objeto filtrado
      filtrado.projecao_empresa = newProjEmpresa;
  }

  setDataEscopoAtual(filtrado);
  applyAreaFromRaw(filtrado, selecionadas);


  // (B) AGORA: sobrescreve somente o que precisa ser "por escopo_rotas":
  //     - Venda Realizada (card)
  //     - Ano Anterior (base de evolução)
  //     - % evolução
  const { atual, aa } = calcGerenteVendaFromEscopo(data, selecionadas);

  // venda realizada no card (base)
  setVendaRealizadaBase(atual);
  setVendaRealizada(fmtMoeda(atual));
  // ✅ CORREÇÃO: "Vendas Ano Ant. (Rotas)" deve ser a soma da supervisão selecionada
  // =================================================================
  let rotasAA_Filtrado = 0;
  if (!selecionadas || selecionadas.length === 0) {
      // Sem filtro: usa o totalzão que veio do backend
      rotasAA_Filtrado = Number(data?.vendas?.venda_ano_anterior_rotas?.valor_total || 0);
  } else {
      // Com filtro: soma manual dos vendedores do AA (baseado no detalhamento que vem do backend)
      
      // 1. Pega IDs dos vendedores atualmente filtrados
      const idsPermitidos = new Set();
      (filtrado.vendas?.vendas_por_vendedor || []).forEach(v => idsPermitidos.add(Number(v.codcampo)));
      
      // 2. Itera sobre a lista detalhada do AA
      const listaAA = data?.vendas?.venda_ano_anterior_rotas?.por_vendedor || [];
      listaAA.forEach(item => {
          if (idsPermitidos.has(Number(item.CodVendedor))) {
              rotasAA_Filtrado += Number(item.Valor_liquido_total || 0);
          }
      });
  }
  setValorRotasAnoAnterior(rotasAA_Filtrado);
  // =================================================================

  // base do ano anterior (para evolução / texto)
  setValorAnoAnteriorBase(aa);

  // opcional: se você quiser que o "Vendas Ano Anterior" do card use esse mesmo valor
  setValorAnoAnteriorMesCheioBase(aa);
  setValorAnoAnteriorMesCheio(fmtMoeda(aa));

  // evolução % com base nos dois (sem PDV)
  const perc = aa > 0 ? ((atual - aa) / aa) * 100 : 0;
  setEvolucaoAnoAnterior(`${perc.toFixed(2)}%`);

  // ===========================
  const obj = calcGerenteObjetivosFromEscopo(data, selecionadas);

  // 1) Objetivo Financeiro (card "Objetivo & Evolução")
  setObjetivoFinanceiro(fmtMoeda(obj.objetivo_financeiro));
  setObjetivoFinanceiroBase(Number(obj.objetivo_financeiro) || 0);

  // 2) Atualiza % cobertura e desvio da VENDA usando o objetivo novo
  const vendaPerc = obj.objetivo_financeiro > 0 ? (atual / obj.objetivo_financeiro) * 100 : 0;
  const vendaVar = atual - obj.objetivo_financeiro;

  setVendaPercentual(`${vendaPerc.toFixed(2)}%`);
  setVendaVariacao(
    vendaVar < 0
      ? `R$ -${Math.abs(vendaVar).toFixed(2).replace('.', ',')}`
      : `R$ ${vendaVar.toFixed(2).replace('.', ',')}`
  );

  // 3) Peso
  setPeso(obj.objetivo_peso.toLocaleString('pt-BR'));
  const pesoReal = Number(filtrado?.realizado_peso?.realizado ?? 0);
  setPesoPercentual(`${(obj.objetivo_peso > 0 ? (pesoReal / obj.objetivo_peso) * 100 : 0).toFixed(2)}%`);
  setPesoVariacao((pesoReal - obj.objetivo_peso).toLocaleString('pt-BR', { minimumFractionDigits: 2 }));

 
  // 4) MIX
  // Se não tem filtro (selecionadas vazio), usa a Meta da Empresa que vem no payload principal.
  // Se tem filtro, usa a soma das áreas selecionadas (obj.objetivo_mix).
  let metaMixFinal = 0; // <--- ESTA LINHA É ESSENCIAL

  if (!selecionadas || selecionadas.length === 0) {
     // Sem filtro: Meta Geral da Empresa (vinda do backend já correta)
     metaMixFinal = Number(data.objetivo?.objetivo_mix || 0);
  } else {
     // Com filtro: Soma das metas dos supervisores selecionados (calculado anteriormente em 'obj')
     metaMixFinal = Number(obj.objetivo_mix || 0);
  }

  setObjetivoMix(String(metaMixFinal));
  
  // Cálculo do Realizado (usando a nova lógica de área ou fallback)
let mixReal = 0;

if (selecionadas && selecionadas.length > 0) {
  // Gerente com filtro: usa mix_pdv_grupo da área filtrada (union real — não soma)
  const areasObj  = data?.escopo_rotas?.areas_supervisao || [];
  const idsSel    = selecionadas.map(s => String(s.value));
  const areasFiltradas = areasObj.filter(a => idsSel.includes(String(a.cod_area_supervisao)));

  if (usarPDV) {
    // mix PDV: union das áreas filtradas — NÃO somar mix_pdv_grupo de cada área
    // cada área já tem mix_pdv_grupo.mix calculado via COUNT DISTINCT de suas UGs
    // para 1 área selecionada: usa diretamente
    // para N áreas: o correto seria uma nova query, mas como aproximação usamos a maior
    // (a union real estaria em projecao_empresa.mix_pdv_empresa quando todas selecionadas)
    if (areasFiltradas.length === 1) {
      mixReal = Number(areasFiltradas[0]?.mix_pdv_grupo?.mix || 0)
                || Number(areasFiltradas[0]?.mix_realizado_area || 0);
    } else {
      // múltiplas áreas: usa mix_pdv_empresa (todas as UGs juntas)
      // se todas as áreas estão selecionadas, é o mix geral
      const todosSelecionados = areasFiltradas.length === areasObj.length;
      mixReal = todosSelecionados
        ? Number(data?.projecao_empresa?.mix_pdv_empresa?.mix || 0)
        : Math.max(...areasFiltradas.map(a => Number(a?.mix_pdv_grupo?.mix || 0)));
    }
    // fallback para mix tradicional se PDV não retornou
    if (!mixReal) mixReal = areasFiltradas.reduce((acc, a) => acc + (a.mix_realizado_area || 0), 0);
  } else {
    mixReal = areasFiltradas.reduce((acc, a) => acc + (a.mix_realizado_area || 0), 0);
    if (!mixReal && areasFiltradas.length > 0) mixReal = Number(filtrado?.realizado_mix?.realizado ?? 0);
  }

} else {
  // Sem filtro: todas as áreas — usa o mix geral da empresa
  mixReal = usarPDV
    ? Number(data?.projecao_empresa?.mix_pdv_empresa?.mix || 0) || Number(data.realizado_mix?.realizado || 0)
    : Number(data.realizado_mix?.realizado || 0);
}

setMixRealizado(String(mixReal));
setMixPercentual(`${(metaMixFinal > 0 ? (mixReal / metaMixFinal) * 100 : 0).toFixed(2)}%`);
setMixVariacao(String(mixReal - metaMixFinal));

  // 5) Positivação
  const posReal = Number(filtrado?.positivacao?.realizado ?? 0);
  setPositivadoObjetivo(obj.objetivo_positivacao.toLocaleString('pt-BR'));
  setPositivadoPercentual(`${(obj.objetivo_positivacao > 0 ? (posReal / obj.objetivo_positivacao) * 100 : 0).toFixed(2)}%`);
  setPositivadoVariacao((posReal - obj.objetivo_positivacao).toLocaleString('pt-BR'));
  
};

  return (
    <div style={{ position: 'relative' }} className={loading ? 'idv-carregando' : ''}>
      {showProjectionModal && (
        <ProjectionModal 
            onClose={() => setShowProjectionModal(false)} 
            data={dataEscopoAtual || rawData}
            usarPDV={usarPDV} 
        />
      )}
      {loading && (
        <div className="overlay-loader">
          <div className="spinner"></div>
        </div>
      )}

      {erroCarga && !loading && (
        <div className="erro-carga-banner" role="alert">
          <span>⚠️ {erroCarga}</span>
          <button onClick={() => { setErroCarga(null); setTentativa((n) => n + 1); }}>
            Tentar novamente
          </button>
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
       {isGerente ? (
          <div style={{ marginLeft: "auto", minWidth: "280px" }}>
            <Select
                isMulti
                options={supervisaoOptions}
                value={supervisaoSelecionada}
                onChange={(opts) => {
                  const selecionadas = opts || [];
                  setSupervisaoSelecionada(selecionadas);

                  // mantém o comportamento atual (cards mudam)
                  applySupervisaoFromRaw(rawData, selecionadas);

                  // >>> NOVO: avisa o Dashboard quais vendedores devem aparecer na tabela <<<
                  if (typeof onVendedoresPermitidosTabelaChange === "function") {
                    const permitidos = (selecionadas || [])
                      .map((s) => String(s.value)) // ids das supervisões selecionadas
                      .flatMap((id) => mapSupVendedores[String(id)] || []) // vendedores do escopo_rotas
                      .map((v) => Number(v))
                      .filter((n) => Number.isFinite(n));

                    onVendedoresPermitidosTabelaChange(permitidos);
                  }
                }}
              placeholder="Selecione supervisões..."
              className="multi-select-supervisao"
              classNamePrefix="rs"
            />
          </div>
        ) : (
          <button
            onClick={handleToggleArea}
            className={`btn-scope ${somarArea ? "ativo-area" : ""}`}
            style={{ marginLeft: "auto" }}
          >
            {somarArea ? "👥 Soma da Minha Área (ON)" : "👤 Individual (ON)"}
          </button>
        )}

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
          {/*<Card
            title="Objetivo & Evolução"
            value={objetivoFinanceiro ?? '...'}
            subtitle="Objetivo Financeiro"
            title2={
              <>
                Vendas Ano Anterior:
                <br />
                {getValorAnoAnteriorTexto(
                  dataEscopoAtual,
                  somarArea,
                  valorAnoAnteriorMesCheioBase,
                  valorAnoAnteriorBase,
                  usarPDV,
                  vendaPDVAnoAnterior
                )}
                                </>
            }
            percentage={evolucao_venda_vendapdv ?? evolucaoAnoAnterior ?? '...'}
            subtitle2="Evo % vs Ano Ant."
            className="card-objetivo"
          />*/}

                    {/* === NOVO CARD DUPLICADO PARA GERÊNCIA (ROTAS) === */}
          <Card
            title="Evolução (Visão Rotas)" 
            value={objetivoFinanceiro ?? '...'}
            subtitle="Objetivo Financeiro"
            title2={
              <>
                Vendas Ano Ant. (Rotas):
                <br />
                {valorRotasAnoAnteriorFmt ?? '--'}
              </>
            }
            percentage={evolucaoRotas ?? '...'}
            subtitle2="Evo % vs Rotas"
            className="card-objetivo" // Pode criar uma classe CSS nova se quiser mudar a cor, ex: "card-objetivo-rotas"
            icon={null} // Ou adicione um ícone específico se desejar
          />

          <div style={{ display: 'flex', flexDirection: 'column' }}>
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
            extra={vendaDia > 0
            ? `📅 Média/dia: R$ ${vendaDia.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
            : null
          }
        />
      </div>

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
            onDetailClick={() => setModalPreVendaAberto(true)}
          />

          <Card
            title="Projeção (Tendência)"
            // Usamos o 'value' para renderizar o bloco customizado com os 4 indicadores
            value={
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.85rem', marginTop: '5px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>R$:</span> <strong>{projPercentFin}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Peso:</span> <strong>{projPercentPeso}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Mix:</span> <strong>{projPercentMix}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Pos:</span> <strong>{projPercentPos}</strong>
                    </div>
                </div>
            }
            subtitle="" // Remove subtítulo padrão
            title2=""   // Remove título secundário
            value2=""   // Remove valor secundário (R$)
            percentage="" 
            subtitle2=""
            variation=""
            className="card-evolucao" 
            onDetailClick={() => setShowProjectionModal(true)}
          />

          <Card
            title="Captado"
            value={captadoValor ?? '...'}
            subtitle="Valor Captado"
            title2="Se vender captado"
            value2={captadoProjTotalFmt ?? '--'}
            percentage={
              !usarPDV ? captadoProjPercentFmt ?? '0%' : percCaptado ?? '0%'
            }
            subtitle2={!usarPDV ? ' Cobertura potencial' : ' Cobertura'}
            variation="0"
            className="card-captar"
            onDetailClick={() => setModalRupturaAberto(true)}
          />

          {/* ===== CARD DIÁRIO NECESSÁRIO ===== */}
          <CardDiarioNecessario
            periodoSelecionado={periodoSelecionado}
            objetivoFinanceiroBase={objetivoFinanceiroBase}
            vendaRealizadaBase={vendaRealizadaBase ?? 0}
            usarPDV={usarPDV}
            vendaPDVBase={usarPDV ? (somarArea ? pdvValorArea : pdvValorUG) ?? 0 : 0}
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
            title2="Realizado"
            value2={
              usarPDV && positivadoCuponsPDV ? (
                <>
                  <div>{positivadoRealizadoBase}</div>
                  <div>PDV: {positivadoCuponsPDV} cupons</div>
                  <div>Total: {positivadoTotalFormatado}</div>
                </>
              ) : (
                positivadoRealizado ?? '...'
              )
            }
            percentage={positivadoPercentual}
            subtitle2=" Cobertura"
            variation={positivadoVariacao}
            className="card-positivado"
            onDetailClick={() => setModalPosAreaAberto(true)}
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
            onDetailClick={() => setModalMixAreaAberto(true)}
          />
        </div>
      )}
        {modalMixAreaAberto && (
  <div style={{
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000,
  }}>
    <div style={{
      background: '#fff', borderRadius: '12px', padding: '1.5rem',
      width: '90%', maxWidth: '600px', maxHeight: '80vh',
      display: 'flex', flexDirection: 'column', gap: '1rem',
    }}>
      {/* Cabeçalho */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0 }}>
          {mostrarNaoVendidosArea ? '❌ Não Vendidos' : '✅ Vendidos'} — Mix
          <span style={{ fontSize: '0.875rem', fontWeight: 400, color: '#888', marginLeft: 8 }}>
            ({itensMixArea.length} produtos)
          </span>
        </h3>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button
            onClick={exportarMixAreaPDF}
            style={{
              background: '#7c3aed', color: '#fff', border: 'none',
              borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', fontSize: '0.8rem'
            }}
          >
            📄 Exportar PDF
          </button>
          <button onClick={() => setModalMixAreaAberto(false)}
            style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>
            ✕
          </button>
        </div>
      </div>

      {/* Toggle mais/menos vendidos */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{
              color: mostrarNaoVendidosArea ? '#aaa' : '#22c55e',
              fontWeight: mostrarNaoVendidosArea ? 400 : 600,
              fontSize: '0.875rem'
            }}>
              ✅ Vendidos
            </span>
            <div onClick={() => setMostrarNaoVendidosArea(v => !v)}
              style={{
                width: '44px', height: '24px', borderRadius: '999px', cursor: 'pointer',
                background: mostrarNaoVendidosArea ? '#ef4444' : '#22c55e',
                position: 'relative', transition: 'background 0.2s',
              }}>
              <div style={{
                position: 'absolute', top: '3px',
                left: mostrarNaoVendidosArea ? '23px' : '3px',
                width: '18px', height: '18px', borderRadius: '50%',
                background: '#fff', transition: 'left 0.2s',
              }} />
            </div>
            <span style={{
              color: mostrarNaoVendidosArea ? '#ef4444' : '#aaa',
              fontWeight: mostrarNaoVendidosArea ? 600 : 400,
              fontSize: '0.875rem'
            }}>
              ❌ Não Vendidos
            </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.875rem', color: criterioValorArea ? '#aaa' : '#1e88e5', fontWeight: criterioValorArea ? 400 : 600 }}>
              📦 Quantidade
            </span>
            <div onClick={() => setCriterioValorArea(v => !v)}
              style={{
                width: '44px', height: '24px', borderRadius: '999px', cursor: 'pointer',
                background: criterioValorArea ? '#1e88e5' : '#9ca3af',
                position: 'relative', transition: 'background 0.2s',
              }}>
              <div style={{
                position: 'absolute', top: '3px',
                left: criterioValorArea ? '23px' : '3px',
                width: '18px', height: '18px', borderRadius: '50%',
                background: '#fff', transition: 'left 0.2s',
              }} />
            </div>
            <span style={{ fontSize: '0.875rem', color: criterioValorArea ? '#1e88e5' : '#aaa', fontWeight: criterioValorArea ? 600 : 400 }}>
              💰 Valor
            </span>
      </div>

      {/* Lista */}
      <div style={{ overflowY: 'auto', flex: 1 }}>
        {loadingMixArea ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
            Carregando...
          </div>
        ) : erroMixArea ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#b91c1c' }}>
            ⚠️ Não foi possível carregar os dados.{' '}
            <button
              onClick={() => setTentativa((n) => n + 1)}
              style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', textDecoration: 'underline', fontSize: 'inherit', padding: 0 }}
            >
              Tentar novamente
            </button>
          </div>
        ) : itensMixArea.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
            Nenhum item encontrado.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: '#f3e8ff', textAlign: 'left' }}>
                <th style={{ padding: '8px' }}>#</th>
                <th style={{ padding: '8px' }}>Produto</th>
                {!mostrarNaoVendidosArea && (
                  <>
                    <th style={{ padding: '8px', textAlign: 'right',
                                color: criterioValorArea ? '#aaa' : '#7c3aed', fontWeight: criterioValorArea ? 400 : 700 }}>
                      Qtd {!criterioValorArea && '▼'}
                    </th>
                    <th style={{ padding: '8px', textAlign: 'right',
                                color: criterioValorArea ? '#7c3aed' : '#aaa', fontWeight: criterioValorArea ? 700 : 400 }}>
                      Valor {criterioValorArea && '▼'}
                    </th>
                </>)}
                <th style={{ padding: '8px', textAlign: 'right', color: '#7c3aed' }}>%</th>
              </tr>
            </thead>
            <tbody>
              {itensMixArea.map((item, i) => (
                <tr key={item.CodMaterial}
                  style={{ borderBottom: '1px solid #eee', background: i % 2 === 0 ? '#faf5ff' : '#fff' }}>
                  <td style={{ padding: '6px 8px', color: '#888' }}>{i + 1}</td>
                  <td style={{ padding: '6px 8px' }}>{item.Material || `Cod: ${item.CodMaterial}`}</td>
                  <td style={{ padding: '6px 8px', textAlign: 'right',
                              fontWeight: criterioValorArea ? 400 : 700,
                              color: criterioValorArea ? '#555' : '#000' }}>
                    {Number(item.QtdItens).toLocaleString('pt-BR')}
                  </td>
                  <td style={{ padding: '6px 8px', textAlign: 'right',
                              fontWeight: criterioValorArea ? 700 : 400,
                              color: criterioValorArea ? '#000' : '#555' }}>
                    {Number(item.ValorTotal).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                  <td style={{ padding: '6px 8px', textAlign: 'right', color: '#7c3aed', fontWeight: 500 }}>
                      {criterioValorArea
                        ? `${Number(item.PercValor || 0).toFixed(1)}%`
                        : `${Number(item.PercQtd   || 0).toFixed(1)}%`
                      }
                   </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  </div>
)}

{modalPosAreaAberto && (
  <div style={{
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000,
  }}>
    <div style={{
      background: '#fff', borderRadius: '12px', padding: '1.5rem',
      width: '90%', maxWidth: '600px', maxHeight: '80vh',
      display: 'flex', flexDirection: 'column', gap: '1rem',
    }}>
      {/* Cabeçalho */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0 }}>
          {mostrarNaoPosArea ? '❌ Não Positivados' : '✅ Positivados'}
          <span style={{ fontSize: '0.875rem', fontWeight: 400, color: '#888', marginLeft: 8 }}>
            ({clientesPosArea.length} clientes)
          </span>
        </h3>
        <button onClick={() => setModalPosAreaAberto(false)}
          style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>
          ✕
        </button>
                    <button
              onClick={exportarPosAreaPDF}
              style={{
                background: mostrarNaoPosArea ? '#ef4444' : '#22c55e',
                color: '#fff', border: 'none', borderRadius: '6px',
                padding: '4px 10px', cursor: 'pointer', fontSize: '0.8rem'
              }}
            >
              📄 Exportar PDF
            </button>
        </div>

      {/* Toggle positivados / não positivados */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span style={{
          fontSize: '0.875rem',
          color: mostrarNaoPosArea ? '#aaa' : '#22c55e',
          fontWeight: mostrarNaoPosArea ? 400 : 600
        }}>
          ✅ Positivados
        </span>
        <div onClick={() => setMostrarNaoPosArea(v => !v)}
          style={{
            width: '44px', height: '24px', borderRadius: '999px', cursor: 'pointer',
            background: mostrarNaoPosArea ? '#ef4444' : '#22c55e',
            position: 'relative', transition: 'background 0.2s',
          }}>
          <div style={{
            position: 'absolute', top: '3px',
            left: mostrarNaoPosArea ? '23px' : '3px',
            width: '18px', height: '18px', borderRadius: '50%',
            background: '#fff', transition: 'left 0.2s',
          }} />
        </div>
        <span style={{
          fontSize: '0.875rem',
          color: mostrarNaoPosArea ? '#ef4444' : '#aaa',
          fontWeight: mostrarNaoPosArea ? 600 : 400
        }}>
          ❌ Não Positivados
        </span>
      </div>

      {/* Lista */}
      <div style={{ overflowY: 'auto', flex: 1 }}>
        {loadingPosArea ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
            Carregando...
          </div>
        ) : erroPosArea ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#b91c1c' }}>
            ⚠️ Não foi possível carregar os dados.{' '}
            <button
              onClick={() => setTentativa((n) => n + 1)}
              style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', textDecoration: 'underline', fontSize: 'inherit', padding: 0 }}
            >
              Tentar novamente
            </button>
          </div>
        ) : clientesPosArea.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
            Nenhum cliente encontrado.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: mostrarNaoPosArea ? '#fee2e2' : '#dcfce7', textAlign: 'left' }}>
                <th style={{ padding: '8px' }}>#</th>
                <th style={{ padding: '8px' }}>Cliente</th>
                <th style={{ padding: '8px' }}>Rota</th>
              </tr>
            </thead>
            <tbody>
              {clientesPosArea.map((cliente, i) => (
                <tr key={cliente.CodCliente}
                  style={{
                    borderBottom: '1px solid #eee',
                    background: i % 2 === 0
                      ? (mostrarNaoPosArea ? '#fff5f5' : '#f0fdf4')
                      : '#fff'
                  }}>
                  <td style={{ padding: '6px 8px', color: '#888' }}>{i + 1}</td>
                  <td style={{ padding: '6px 8px' }}>
                    <div style={{ fontWeight: 500 }}>{cliente.Cliente}</div>
                    {cliente.ClienteFantasia && cliente.ClienteFantasia !== cliente.Cliente && (
                      <div style={{ fontSize: '0.75rem', color: '#888' }}>{cliente.ClienteFantasia}</div>
                    )}
                  </td>
                  <td style={{ padding: '6px 8px', color: '#555', fontSize: '0.8rem' }}>
                    {cliente.Rota}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  </div>
)}

{modalRupturaAberto && (
  <div style={{
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000,
  }}>
    <div style={{
      background: '#fff', borderRadius: '12px', padding: '1.5rem',
      width: '90%', maxWidth: '600px', maxHeight: '80vh',
      display: 'flex', flexDirection: 'column', gap: '1rem',
    }}>
      {/* Cabeçalho */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0 }}>
          🚫 Ruptura — Itens não atendidos
          <span style={{ fontSize: '0.875rem', fontWeight: 400, color: '#888', marginLeft: 8 }}>
            ({itensRupturaFiltrados.length} produtos)
          </span>
        </h3>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button
            onClick={exportarRupturaPDF}
            style={{
              background: '#dc2626', color: '#fff', border: 'none',
              borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', fontSize: '0.8rem'
            }}
          >
            📄 Exportar PDF
          </button>
          <button onClick={() => setModalRupturaAberto(false)}
            style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>
            ✕
          </button>
        </div>
      </div>

      {/* Filtro de Fabricante */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <label style={{ fontSize: '0.8rem', color: '#555', fontWeight: 600 }}>
          🏭 Fabricante:
        </label>
        <select
          value={filtroFabricanteRuptura}
          onChange={(e) => setFiltroFabricanteRuptura(e.target.value)}
          style={{
            padding: '4px 8px', borderRadius: '6px', border: '1px solid #ddd',
            fontSize: '0.8rem', flex: 1, maxWidth: '260px',
          }}
        >
          {fabricantesRupturaDisponiveis.map(f => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
        {filtroFabricanteRuptura !== 'Todos' && (
          <button
            onClick={() => setFiltroFabricanteRuptura('Todos')}
            style={{ background: 'none', border: 'none', color: '#dc2626', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline' }}
          >
            limpar
          </button>
        )}
      </div>

      {/* Totais resumidos (já recalculados conforme o filtro) */}
      <div style={{
        display: 'flex', gap: '1.5rem', padding: '10px 14px',
        background: '#fef2f2', borderRadius: '8px', fontSize: '0.85rem',
      }}>
        <div>
          <div style={{ color: '#888', fontSize: '0.75rem' }}>Valor total em ruptura</div>
          <div style={{ fontWeight: 700, color: '#dc2626' }}>
            {totaisRupturaFiltrados.total_valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </div>
        </div>
        <div>
          <div style={{ color: '#888', fontSize: '0.75rem' }}>Quantidade total</div>
          <div style={{ fontWeight: 700, color: '#dc2626' }}>
            {totaisRupturaFiltrados.total_qtd.toLocaleString('pt-BR')}
          </div>
        </div>
      </div>

      {/* Toggle critério de ordenação */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span style={{ fontSize: '0.875rem', color: criterioValorRuptura ? '#aaa' : '#1e88e5', fontWeight: criterioValorRuptura ? 400 : 600 }}>
          📦 Quantidade
        </span>
        <div onClick={() => setCriterioValorRuptura(v => !v)}
          style={{
            width: '44px', height: '24px', borderRadius: '999px', cursor: 'pointer',
            background: criterioValorRuptura ? '#dc2626' : '#9ca3af',
            position: 'relative', transition: 'background 0.2s',
          }}>
          <div style={{
            position: 'absolute', top: '3px',
            left: criterioValorRuptura ? '23px' : '3px',
            width: '18px', height: '18px', borderRadius: '50%',
            background: '#fff', transition: 'left 0.2s',
          }} />
        </div>
        <span style={{ fontSize: '0.875rem', color: criterioValorRuptura ? '#dc2626' : '#aaa', fontWeight: criterioValorRuptura ? 600 : 400 }}>
          💰 Valor
        </span>
      </div>

      {/* Lista */}
      <div style={{ overflowY: 'auto', flex: 1 }}>
        {loadingRupturaArea ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
            Carregando...
          </div>
        ) : erroRupturaArea ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#b91c1c' }}>
            ⚠️ Não foi possível carregar os dados.{' '}
            <button
              onClick={() => setTentativa((n) => n + 1)}
              style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', textDecoration: 'underline', fontSize: 'inherit', padding: 0 }}
            >
              Tentar novamente
            </button>
          </div>
        ) : itensRupturaFiltrados.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
            Nenhum item em ruptura no período{filtroFabricanteRuptura !== 'Todos' ? ' para este fabricante.' : '.'}
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: '#fee2e2', textAlign: 'left' }}>
                <th style={{ padding: '8px' }}>#</th>
                <th style={{ padding: '8px' }}>Produto</th>
                <th style={{ padding: '8px' }}>Grupo</th>
                <th style={{ padding: '8px' }}>Fabricante</th>
                <th style={{ padding: '8px', textAlign: 'right',
                            color: criterioValorRuptura ? '#aaa' : '#dc2626', fontWeight: criterioValorRuptura ? 400 : 700 }}>
                  Qtd {!criterioValorRuptura && '▼'}
                </th>
                <th style={{ padding: '8px', textAlign: 'right',
                            color: criterioValorRuptura ? '#dc2626' : '#aaa', fontWeight: criterioValorRuptura ? 700 : 400 }}>
                  Valor {criterioValorRuptura && '▼'}
                </th>
                <th style={{ padding: '8px', textAlign: 'right', color: '#dc2626' }}>%</th>
              </tr>
            </thead>
            <tbody>
              {itensRupturaFiltrados.map((item, i) => (
                <tr key={item.CodMaterial}
                  style={{ borderBottom: '1px solid #eee', background: i % 2 === 0 ? '#fef2f2' : '#fff' }}>
                  <td style={{ padding: '6px 8px', color: '#888' }}>{i + 1}</td>
                  <td style={{ padding: '6px 8px' }}>{item.Material || `Cod: ${item.CodMaterial}`}</td>
                  <td style={{ padding: '6px 8px', color: '#555', fontSize: '0.8rem' }}>{item.Grupo}</td>
                  <td style={{ padding: '6px 8px', color: '#555', fontSize: '0.8rem' }}>{item.Fabricante}</td>
                  <td style={{ padding: '6px 8px', textAlign: 'right',
                              fontWeight: criterioValorRuptura ? 400 : 700,
                              color: criterioValorRuptura ? '#555' : '#000' }}>
                    {Number(item.QtdItens).toLocaleString('pt-BR')}
                  </td>
                  <td style={{ padding: '6px 8px', textAlign: 'right',
                              fontWeight: criterioValorRuptura ? 700 : 400,
                              color: criterioValorRuptura ? '#000' : '#555' }}>
                    {Number(item.ValorTotal).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                  <td style={{ padding: '6px 8px', textAlign: 'right', color: '#dc2626', fontWeight: 500 }}>
                    {criterioValorRuptura
                      ? `${Number(item.PercValor || 0).toFixed(1)}%`
                      : `${Number(item.PercQtd   || 0).toFixed(1)}%`
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  </div>
)}
  

  {/* ===== Modal Pré-Venda Status (Pendências Alocação) ===== */}
  {modalPreVendaAberto && (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        background: '#fff', borderRadius: '12px', padding: '1.5rem',
        width: '90%', maxWidth: '820px', maxHeight: '85vh',
        display: 'flex', flexDirection: 'column', gap: '1rem', boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
      }}>

        {/* Cabeçalho */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>
              📋 Pendências de Pré-Venda
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#888' }}>
              {pendenciasPreVenda.length} pendência(s) encontrada(s)
            </span>
          </div>
          <button onClick={() => setModalPreVendaAberto(false)}
            style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>
            ✕
          </button>
        </div>

        {/* Legenda */}
        <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.8rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} />
            Não processada
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
            Processada com problema
          </span>
        </div>

        {/* Conteúdo */}
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {loadingPreVenda ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>Carregando...</div>
          ) : erroPreVenda ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#b91c1c' }}>
            ⚠️ Não foi possível carregar os dados.{' '}
            <button
              onClick={() => setTentativa((n) => n + 1)}
              style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', textDecoration: 'underline', fontSize: 'inherit', padding: 0 }}
            >
              Tentar novamente
            </button>
          </div>
          ) : pendenciasPreVenda.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#22c55e', fontWeight: 600 }}>
              ✅ Nenhuma pendência encontrada no período.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#f3f4f6', textAlign: 'left' }}>
                  <th style={{ padding: '8px' }}>#</th>
                  <th style={{ padding: '8px' }}>Vendedor</th>
                  <th style={{ padding: '8px' }}>Cliente</th>
                  <th style={{ padding: '8px' }}>Data</th>
                  <th style={{ padding: '8px', textAlign: 'right' }}>Valor</th>
                  <th style={{ padding: '8px' }}>Situação</th>
                  <th style={{ padding: '8px' }}>Motivo</th>
                </tr>
              </thead>
              <tbody>
                {pendenciasPreVenda.map((p, i) => {
                  const isProblema = p.Situacao === 'COM_PROBLEMA';
                  return (
                    <tr key={`${p.CodPocket}-${p.CodDoc}`}
                      style={{
                        borderBottom: '1px solid #eee',
                        background: isProblema
                          ? (i % 2 === 0 ? '#fff5f5' : '#ffe4e4')
                          : (i % 2 === 0 ? '#fffbeb' : '#fef3c7'),
                      }}>
                      <td style={{ padding: '6px 8px', color: '#888' }}>{i + 1}</td>
                      <td style={{ padding: '6px 8px', fontWeight: 500 }}>{p.Funcionario}</td>
                      <td style={{ padding: '6px 8px' }}>
                        <div>{p.Cliente}</div>
                        {p.ClienteFantasia && p.ClienteFantasia !== p.Cliente && (
                          <div style={{ fontSize: '0.75rem', color: '#888' }}>{p.ClienteFantasia}</div>
                        )}
                      </td>
                      <td style={{ padding: '6px 8px', whiteSpace: 'nowrap' }}>{p.DataDoc}</td>
                      <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 600 }}>
                        {Number(p.Valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                      <td style={{ padding: '6px 8px' }}>
                        {isProblema ? (
                          <span style={{ color: '#ef4444', fontWeight: 600, fontSize: '0.78rem' }}>
                            ❌ Com problema
                          </span>
                        ) : (
                          <span style={{ color: '#f59e0b', fontWeight: 600, fontSize: '0.78rem' }}>
                            ⏳ Não processada
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '6px 8px', color: '#555', fontSize: '0.78rem' }}>
                        {p.Motivo || (isProblema ? '—' : 'Aguardando processamento')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )}
  </div>
  );
};

export default IndicadoresCards;
