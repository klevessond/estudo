// Linhas por vendedor a partir de /api/Indicadores/ (vendas.vendas_por_vendedor +
// objetivos_vendedores). Mesmas regras da tabela por vendedor do web: números de
// rotas, cobertura = faturado / objetivo, e some quem não tem meta nem movimento.
import { linhaDoVendedor, projecaoDaLinha } from './indicadores';

const num = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const pct = (real, meta) => (meta > 0 ? (real / meta) * 100 : 0);

/** "JOAO DA SILVA" -> "Joao"; "FILIAL CENTRO" -> "Centro" (igual à tabela do web). */
export function nomeCurto(nome) {
  const partes = String(nome || '').trim().split(/\s+/).filter(Boolean);
  if (!partes.length) return '';
  const escolhido = partes[0].toUpperCase() === 'FILIAL' && partes.length > 1 ? partes[1] : partes[0];
  return escolhido.charAt(0).toUpperCase() + escolhido.slice(1).toLowerCase();
}

export function nomeCompleto(nome) {
  return String(nome || '')
    .trim()
    .toLowerCase()
    .replace(/(^|\s)\S/g, (l) => l.toUpperCase());
}

function objetivosPorCod(data) {
  const mapa = new Map();
  for (const o of data?.objetivos_vendedores || []) {
    mapa.set(String(o.vendedor_id), o);
  }
  return mapa;
}

function montarLinha(linha, obj) {
  const faturado = num(linha?.ValorLiquido);
  const preVenda = num(linha?.PreVenda_Valor);
  const objetivo = num(obj?.objetivo_financeiro);
  const peso = num(linha?.PesoTotal);
  const objPeso = num(obj?.objetivo_peso);
  const mix = num(linha?.Mix);
  const objMix = num(obj?.objetivo_mix);
  const positivacao = num(linha?.Positivacao_Realizado ?? linha?.pos_rotas ?? linha?.QtdClientes);
  const objPositivacao = num(obj?.objetivo_positivacao);
  const nome = (linha?.Campo || obj?.nome_vendedor || '').trim();

  return {
    cod: Number(linha?.codcampo ?? obj?.vendedor_id),
    nome,
    curto: nomeCurto(nome),
    faturado,
    preVenda,
    alocado: faturado + preVenda,
    objetivo,
    cobertura: pct(faturado, objetivo),
    variacao: faturado - objetivo,
    peso,
    objPeso,
    mix,
    objMix,
    positivacao,
    objPositivacao,
    ruptura: num(linha?.Ruptura_TotalValor),
  };
}

export function linhasDeVendedores(data) {
  const objetivos = objetivosPorCod(data);
  return (data?.vendas?.vendas_por_vendedor || [])
    .map((l) => montarLinha(l, objetivos.get(String(l.codcampo))))
    .filter((v) => {
      const movimento = Math.abs(v.faturado) + Math.abs(v.preVenda) + Math.abs(v.peso);
      const temMeta = v.objetivo > 0 || v.objPeso > 0 || v.objMix > 0 || v.objPositivacao > 0;
      return Number.isFinite(v.cod) && (movimento > 0.01 || temMeta);
    });
}

/** Tudo o que o detalhe de um vendedor mostra, sem nova chamada à API. */
export function resumoDoVendedor(data, cod) {
  const linhaBruta = linhaDoVendedor(data, cod);
  const obj = objetivosPorCod(data).get(String(cod));
  if (!linhaBruta && !obj) return null;
  const v = montarLinha(linhaBruta || { codcampo: cod }, obj);

  const ind = (chave, rotulo, unidade, realizado, objetivo) => ({
    chave,
    rotulo,
    unidade,
    realizado,
    objetivo,
    percentual: pct(realizado, objetivo),
    falta: Math.max(objetivo - realizado, 0),
  });

  return {
    ...v,
    itens: [
      ind('financeiro', 'Faturamento', 'moeda', v.faturado, v.objetivo),
      ind('peso', 'Peso', 'kg', v.peso, v.objPeso),
      ind('mix', 'Mix de itens', 'qtd', v.mix, v.objMix),
      ind('positivacao', 'Positivação', 'qtd', v.positivacao, v.objPositivacao),
    ],
    projecao: projecaoDaLinha(
      data,
      linhaBruta,
      { fin: v.objetivo, peso: v.objPeso, mix: v.objMix, pos: v.objPositivacao },
      v.faturado
    ),
  };
}

const ORDENACOES = {
  cobertura: (a, b) => b.cobertura - a.cobertura,
  faturado: (a, b) => b.faturado - a.faturado,
  nome: (a, b) => a.nome.localeCompare(b.nome, 'pt-BR'),
};

export function ordenarVendedores(lista, chave) {
  return [...lista].sort(ORDENACOES[chave] || ORDENACOES.cobertura);
}

/**
 * Mesma regra do web (CardsColaborador): gerente; supervisor da matriz (UG 1);
 * vendedor só a própria e só se for da matriz. O backend barra o resto com 403.
 */
export function podeVerComissoes(me, cod) {
  if (!me) return false;
  const matriz = String(me.cod_unid_gestora) === '1';
  if (me.gerente || me.is_gerente) return true;
  if (me.supervisor) return matriz;
  if (me.vendedor) return matriz && String(me.cod_funcionario) === String(cod);
  return false;
}
