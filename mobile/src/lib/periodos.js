const pad = (n) => String(n).padStart(2, '0');
const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

// "esperado" = fração do período que já passou (dias corridos).
// Simplificação: o web considera feriados; aqui é calendário puro.
export function criarPeriodo(chave, hoje = new Date()) {
  const ano = hoje.getFullYear();
  const mes = hoje.getMonth();

  if (chave === 'hoje') {
    return { chave, rotulo: 'Hoje', de: iso(hoje), ate: iso(hoje), esperado: null };
  }

  if (chave === 'mes_anterior') {
    const ini = new Date(ano, mes - 1, 1);
    const fim = new Date(ano, mes, 0);
    return { chave, rotulo: 'Mês passado', de: iso(ini), ate: iso(fim), esperado: 1 };
  }

  const ini = new Date(ano, mes, 1);
  const diasNoMes = new Date(ano, mes + 1, 0).getDate();
  return {
    chave: 'mes_atual',
    rotulo: 'Este mês',
    de: iso(ini),
    ate: iso(hoje),
    esperado: hoje.getDate() / diasNoMes,
  };
}

export const OPCOES_PERIODO = ['hoje', 'mes_atual', 'mes_anterior'];
