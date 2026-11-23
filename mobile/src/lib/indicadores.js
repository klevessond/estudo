// Funções puras: recebem o payload de /api/Indicadores/ e devolvem o que a tela mostra.
// Não dependem de React, então podem ser compartilhadas com o frontend web.

const num = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

function indicador(chave, rotulo, unidade, realizado, objetivo, percentualBackend) {
  const r = num(realizado);
  const o = num(objetivo);
  const p =
    percentualBackend !== undefined && percentualBackend !== null
      ? num(percentualBackend)
      : o > 0
        ? (r / o) * 100
        : 0;
  return { chave, rotulo, unidade, realizado: r, objetivo: o, percentual: p, falta: Math.max(o - r, 0) };
}

export function linhaDoVendedor(data, codFuncionario) {
  const lista = data?.vendas?.vendas_por_vendedor || [];
  return lista.find((l) => String(l.codcampo) === String(codFuncionario)) || null;
}

/**
 * visao: 'individual' usa data.minha_visao; 'equipe' usa os totais do escopo
 * (área do supervisor ou empresa, conforme o backend decidiu).
 * Observação: números de ROTAS. O ajuste de PDV do web ainda não foi trazido.
 */
export function extrairResumo(data, { visao }) {
  const m = data?.minha_visao;

  if (visao === 'individual' && m) {
    return {
      escopo: 'Seus números',
      itens: [
        indicador('financeiro', 'Faturamento', 'moeda', m.realizado_financeiro, m.objetivo_financeiro, m.percentual_cobertura),
        indicador('peso', 'Peso', 'kg', m.realizado_peso, m.objetivo_peso, m.percentual_peso),
        indicador('mix', 'Mix de itens', 'qtd', m.mix_realizado, m.objetivo_mix, m.percentual_mix),
        indicador('positivacao', 'Positivação', 'qtd', m.realizado_positivacao, m.objetivo_positivacao, m.percentual_positivacao),
      ],
    };
  }

  const obj = data?.objetivo || {};
  return {
    escopo: data?.escopo_rotas?.e_gerente ? 'Empresa' : 'Sua equipe',
    itens: [
      indicador('financeiro', 'Faturamento', 'moeda', data?.realizado_financeiro?.valor, obj.financeiro, data?.realizado_financeiro?.percentual_cobertura),
      indicador('peso', 'Peso', 'kg', data?.realizado_peso?.realizado, obj.objetivo_peso, data?.realizado_peso?.percentual),
      indicador('mix', 'Mix de itens', 'qtd', data?.realizado_mix?.realizado, obj.objetivo_mix, data?.realizado_mix?.percentual),
      indicador('positivacao', 'Positivação', 'qtd', data?.positivacao?.realizado, obj.objetivo_positivacao, data?.positivacao?.percentual),
    ],
  };
}

// Compara o atingimento com o ritmo esperado para a data.
export function statusDe(percentual, esperado) {
  if (percentual >= 100) return 'ok';
  if (esperado == null) return 'neutro';
  const alvo = esperado * 100;
  if (percentual >= alvo) return 'ok';
  if (percentual >= alvo * 0.9) return 'atencao';
  return 'ruim';
}

// ============================================================================
// Cards extras: evolução, alocação, projeção e ruptura
// Mesma regra de escopo do resumo: 'individual' usa a linha do vendedor logado
// em vendas_por_vendedor; 'equipe' usa os totais do escopo.
// ============================================================================

// O backend usa "or 1.0" para evitar divisão por zero; 1,00 significa "sem dado".
const valorReal = (v) => (num(v) > 1 ? num(v) : 0);

export function extrairEvolucao(data, { visao, codFuncionario }) {
  const individual = visao === 'individual' && data?.minha_visao;
  let atual;
  let anoAnterior;
  let anoAnteriorMes;

  if (individual) {
    const linha = linhaDoVendedor(data, codFuncionario);
    atual = num(data.minha_visao.realizado_financeiro);
    anoAnterior = valorReal(linha?.Ano_anterior_ValorLiquido);
    anoAnteriorMes = valorReal(linha?.Ano_anterior_mes_ValorLiquido);
  } else {
    const v = data?.vendas || {};
    atual = num(data?.realizado_financeiro?.valor);
    anoAnterior =
      valorReal(v.ano_anterior_agregado?.ValorLiquido) ||
      valorReal(v.venda_ano_anterior_rotas?.valor_total) ||
      valorReal(data?.evolucao?.valor_ano_anterior);
    anoAnteriorMes = valorReal(v.ano_anterior_agregado_mes?.ValorLiquido);
  }

  return {
    atual,
    anoAnterior,
    anoAnteriorMes,
    percentual: anoAnterior > 0 ? ((atual - anoAnterior) / anoAnterior) * 100 : null,
  };
}

export function extrairAlocacao(data, { visao, codFuncionario }) {
  const m = data?.minha_visao;
  if (visao === 'individual' && m) {
    const linha = linhaDoVendedor(data, codFuncionario);
    const faturado = num(m.realizado_financeiro);
    const preVenda = num(linha?.PreVenda_Valor);
    const objetivo = num(m.objetivo_financeiro);
    const alocado = faturado + preVenda;
    return { faturado, preVenda, alocado, objetivo, cobertura: objetivo > 0 ? (alocado / objetivo) * 100 : 0 };
  }

  const pv = data?.['pre-venda'] || {};
  const faturado = num(data?.realizado_financeiro?.valor);
  const preVenda = num(pv.valor_prevenda);
  const objetivo = num(data?.objetivo?.financeiro);
  const alocado = num(pv.valor_alocado) || faturado + preVenda;
  const cobertura =
    pv.percentual_prevenda_alocado != null ? num(pv.percentual_prevenda_alocado) : objetivo > 0 ? (alocado / objetivo) * 100 : 0;
  return { faturado, preVenda, alocado, objetivo, cobertura };
}

export function extrairRuptura(data, { visao, codFuncionario }) {
  if (visao === 'individual' && data?.minha_visao) {
    const linha = linhaDoVendedor(data, codFuncionario);
    const valor = num(linha?.Ruptura_TotalValor);
    const faturado = num(data.minha_visao.realizado_financeiro);
    return { valor, percentualDoFaturado: faturado > 0 ? (valor / faturado) * 100 : 0 };
  }
  return {
    valor: num(data?.ruptura?.total_valor),
    percentualDoFaturado: num(data?.ruptura?.percentual_captado),
  };
}

// Dias úteis do período (já com feriados), como o backend usou na projeção.
// A partir da refatoração vêm explícitos em projecao_empresa.dias_uteis
// (são os mesmos para todos os vendedores). Servidores antigos não mandam o
// campo; aí os dias são deduzidos da própria projeção:
// velocidade = realizado / decorridos; projeção = velocidade * totais.
function diasUteis(data, p, realizado) {
  const d = data?.projecao_empresa?.dias_uteis;
  const totais = num(d?.totais);
  const decorridos = num(d?.decorridos);
  if (totais > 0 && decorridos > 0 && decorridos <= totais) {
    return { totais, decorridos, restantes: Math.max(totais - decorridos, 0) };
  }
  return diasDaProjecao(p, realizado);
}

function diasDaProjecao(p, realizado) {
  const v = num(p?.velocidade_diaria);
  const final = num(p?.projecao_final);
  if (v <= 0 || final <= 0) return null;
  const totais = Math.round(final / v);
  const decorridos = Math.round(num(realizado) / v);
  if (!totais || !decorridos || decorridos > totais) return null;
  return { totais, decorridos, restantes: totais - decorridos };
}

function pctProjetado(p, objetivo) {
  const o = num(objetivo);
  if (o > 0 && p?.projecao_final != null) return (num(p.projecao_final) / o) * 100;
  return p?.atingimento_projetado != null ? num(p.atingimento_projetado) : null;
}

/**
 * Projeção de fechamento do período (só faz sentido no mês corrente).
 * Usa a projeção de ROTAS para o financeiro, coerente com o resto do app.
 */
export function extrairProjecao(data, { visao, codFuncionario }) {
  const m = data?.minha_visao;
  let finRotas;
  let realizado;
  let objetivos;
  let pPeso;
  let pMix;
  let pPos;

  if (visao === 'individual' && m) {
    const linha = linhaDoVendedor(data, codFuncionario);
    const d = linha?.projecoes_detalhadas;
    if (!d) return null;
    finRotas = d.financeiro_rotas;
    realizado = num(linha?.venda_rotas ?? linha?.ValorLiquido ?? m.realizado_financeiro);
    objetivos = { fin: m.objetivo_financeiro, peso: m.objetivo_peso, mix: m.objetivo_mix, pos: m.objetivo_positivacao };
    pPeso = d.peso;
    pMix = d.mix;
    pPos = d.positivacao;
  } else {
    const p = data?.projecao_empresa;
    if (!p) return null;
    const o = data?.objetivo || {};
    finRotas = p.financeiro_rotas;
    realizado = num(data?.realizado_financeiro?.valor);
    objetivos = { fin: o.financeiro, peso: o.objetivo_peso, mix: o.objetivo_mix, pos: o.objetivo_positivacao };
    pPeso = p.peso_rotas || p.peso;
    pMix = p.mix?.projecao || p.mix;
    pPos = p.positivacao;
  }

  if (!finRotas) return null;

  const objetivo = num(objetivos.fin);
  const valorFinal = num(finRotas.projecao_final);
  const dias = diasUteis(data, finRotas, realizado);
  const falta = Math.max(objetivo - realizado, 0);

  return {
    valorFinal,
    objetivo,
    percentualFinal: objetivo > 0 ? (valorFinal / objetivo) * 100 : null,
    ritmoDia: num(finRotas.velocidade_diaria),
    necessarioDia: dias ? (dias.restantes > 0 ? falta / dias.restantes : falta) : null,
    dias,
    outros: [
      { chave: 'peso', rotulo: 'Peso', percentual: pctProjetado(pPeso, objetivos.peso) },
      { chave: 'mix', rotulo: 'Mix', percentual: pctProjetado(pMix, objetivos.mix) },
      { chave: 'positivacao', rotulo: 'Positivação', percentual: pctProjetado(pPos, objetivos.pos) },
    ].filter((x) => x.percentual != null),
  };
}
