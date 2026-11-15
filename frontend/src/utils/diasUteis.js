// Dias úteis seg-sex, sem considerar feriados (cálculo local do front-end).
// Movidos de IndicativosDeVenda.jsx e CardsColaborador.jsx sem alteração de lógica.

export function diasUteisEntre(inicio, fim) {
  const dias = [];
  const cur = new Date(inicio); cur.setHours(0,0,0,0);
  const end = new Date(fim);    end.setHours(0,0,0,0);
  while (cur <= end) {
    const d = cur.getDay();
    if (d !== 0 && d !== 6) dias.push(new Date(cur)); // seg-sex apenas (exclui sáb e dom)
    cur.setDate(cur.getDate() + 1);
  }
  return dias;
}

export function contarDiasUteisLocal(ini, fim) {
  if (!ini || !fim) return 0;
  let n = 0, c = new Date(ini); c.setHours(0, 0, 0, 0);
  while (c <= fim) { const d = c.getDay(); if (d !== 0 && d !== 6) n++; c.setDate(c.getDate() + 1); }
  return n;
}
