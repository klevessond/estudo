// Formatadores numéricos/monetários pt-BR compartilhados.
// Movidos dos componentes sem alteração de lógica.

export const fmtMoeda = (v) => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const fmtMoedaCurta = (v) => Number(v || 0).toLocaleString('pt-BR', {
  style: 'currency', currency: 'BRL', notation: 'compact', minimumFractionDigits: 0, maximumFractionDigits: 1,
});

export const fmtNum = (v) => Number(v || 0).toLocaleString('pt-BR', { maximumFractionDigits: 2 });

export const fmtNum1 = (v) => Number(v || 0).toLocaleString('pt-BR', { maximumFractionDigits: 1 });

export const fmtNum2 = (v) => Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const fmtPct = (v) => `${Number(v || 0).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`;

export const fmtDataBR = (iso) => (iso ? String(iso).split('-').reverse().join('/') : '');

export const toNum = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

export const safeDiv = (n, d) => (d ? n / d : 0);

export const pct = (num, den) => (Number(den) ? (Number(num) / Number(den)) * 100 : 0);
