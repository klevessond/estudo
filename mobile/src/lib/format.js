// Formatação manual: não depende do suporte a Intl do motor JS do aparelho.

function agrupar(inteiro) {
  return inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function numero(valor, casas = 0) {
  const n = Number(valor) || 0;
  const [int, dec] = Math.abs(n).toFixed(casas).split('.');
  const texto = dec ? `${agrupar(int)},${dec}` : agrupar(int);
  return n < 0 ? `-${texto}` : texto;
}

export function moeda(valor) {
  const n = Number(valor) || 0;
  return `${n < 0 ? '-' : ''}R$ ${numero(Math.abs(n), 2)}`;
}

export function percentual(valor, casas = 1) {
  return `${numero(valor, casas)}%`;
}

export function porUnidade(valor, unidade) {
  if (unidade === 'moeda') return moeda(valor);
  if (unidade === 'kg') return `${numero(valor, 0)} kg`;
  return numero(valor, 0);
}

export function dataCurta(iso) {
  if (!iso) return '';
  const s = String(iso).slice(0, 10); // YYYY-MM-DD
  const [a, m, d] = s.split('-');
  return a && m && d ? `${d}/${m}/${a}` : String(iso);
}

export function tempoRelativo(iso) {
  const t = new Date(iso).getTime();
  if (!t) return '';
  const min = Math.round((Date.now() - t) / 60000);
  if (min < 1) return 'agora';
  if (min < 60) return `há ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `há ${h} h`;
  const dias = Math.round(h / 24);
  return dias === 1 ? 'ontem' : `há ${dias} dias`;
}
