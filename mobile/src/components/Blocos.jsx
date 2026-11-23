import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { cores, numeros } from '../theme';
import { moeda, percentual } from '../lib/format';

function corDoPercentual(p) {
  if (p == null) return cores.suave;
  if (p >= 100) return cores.ok;
  if (p >= 90) return cores.atencao;
  return cores.ruim;
}

function Secao({ titulo, children }) {
  return (
    <View style={s.secao}>
      <Text style={s.secaoTitulo}>{titulo}</Text>
      <View style={s.bloco}>{children}</View>
    </View>
  );
}

function Par({ rotulo, valor, cor, dica }) {
  return (
    <View style={s.par}>
      <Text style={s.parRotulo}>{rotulo}</Text>
      <Text style={[s.parValor, numeros, cor && { color: cor }]}>{valor}</Text>
      {dica ? <Text style={s.dica}>{dica}</Text> : null}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Fechamento previsto
// ---------------------------------------------------------------------------
export function BlocoProjecao({ projecao }) {
  if (!projecao) return null;
  const { valorFinal, objetivo, percentualFinal, ritmoDia, necessarioDia, dias, outros } = projecao;
  const cor = corDoPercentual(percentualFinal);
  const precisaAcelerar = necessarioDia != null && necessarioDia > ritmoDia;

  return (
    <Secao titulo="Fechamento previsto">
      <View style={s.pad}>
        <Text style={[s.grande, numeros]}>{moeda(valorFinal)}</Text>
        <Text style={s.frase}>
          {percentualFinal != null ? (
            <>
              <Text style={[s.fraseForte, { color: cor }]}>{percentual(percentualFinal)} da meta</Text>
              {objetivo > 0 && ` de ${moeda(objetivo)}`} se o ritmo atual continuar.
            </>
          ) : (
            'Projeção pelo ritmo atual de vendas.'
          )}
        </Text>
        {dias && (
          <Text style={s.dica}>
            Dia útil {dias.decorridos} de {dias.totais}, faltam {dias.restantes}.
          </Text>
        )}
      </View>

      <View style={[s.linhaPares, s.divisorTopo]}>
        <Par rotulo="Vendendo por dia" valor={moeda(ritmoDia)} />
        {necessarioDia != null && (
          <Par
            rotulo="Precisa vender por dia"
            valor={necessarioDia > 0 ? moeda(necessarioDia) : 'meta batida'}
            cor={precisaAcelerar ? cores.ruim : cores.ok}
          />
        )}
      </View>

      {outros.length > 0 && (
        <View style={[s.linhaPares, s.divisorTopo]}>
          {outros.map((o) => (
            <Par key={o.chave} rotulo={o.rotulo} valor={percentual(o.percentual)} cor={corDoPercentual(o.percentual)} />
          ))}
        </View>
      )}
    </Secao>
  );
}

// ---------------------------------------------------------------------------
// Alocado = faturado + pré-venda
// ---------------------------------------------------------------------------
export function BlocoAlocacao({ alocacao }) {
  if (!alocacao) return null;
  const { faturado, preVenda, alocado, objetivo, cobertura } = alocacao;
  const total = Math.max(alocado, objetivo, 1);
  const largFat = `${(faturado / total) * 100}%`;
  const largPre = `${(preVenda / total) * 100}%`;
  const posMeta = objetivo > 0 ? `${(objetivo / total) * 100}%` : null;

  return (
    <Secao titulo="Alocado (faturado + pré-venda)">
      <View style={s.pad}>
        <View style={s.topoLinha}>
          <Text style={[s.grande, numeros]}>{moeda(alocado)}</Text>
          {objetivo > 0 && (
            <Text style={[s.pctLado, numeros, { color: corDoPercentual(cobertura) }]}>{percentual(cobertura)}</Text>
          )}
        </View>
        {objetivo > 0 && <Text style={s.dica}>Cobertura prevista da meta de {moeda(objetivo)}</Text>}

        <View style={s.barraEmpilhada} accessibilityLabel="Faturado e pré-venda em relação à meta">
          <View style={[s.segmento, s.inicio, { width: largFat, backgroundColor: cores.marca }]} />
          <View style={[s.segmento, { width: largPre, backgroundColor: cores.trigo }]} />
          {posMeta && <View style={[s.marcaMeta, { left: posMeta }]} />}
        </View>

        <View style={s.legenda}>
          <View style={s.legendaItem}>
            <View style={[s.bolinha, { backgroundColor: cores.marca }]} />
            <Text style={s.legendaTexto}>
              Faturado <Text style={[s.legendaValor, numeros]}>{moeda(faturado)}</Text>
            </Text>
          </View>
          <View style={s.legendaItem}>
            <View style={[s.bolinha, { backgroundColor: cores.trigo }]} />
            <Text style={s.legendaTexto}>
              Pré-venda <Text style={[s.legendaValor, numeros]}>{moeda(preVenda)}</Text>
            </Text>
          </View>
        </View>
      </View>
    </Secao>
  );
}

// ---------------------------------------------------------------------------
// Evolução contra o ano anterior
// ---------------------------------------------------------------------------
export function BlocoEvolucao({ evolucao }) {
  if (!evolucao) return null;
  const { atual, anoAnterior, anoAnteriorMes, percentual: p } = evolucao;
  const cor = p == null ? cores.suave : p >= 0 ? cores.ok : cores.ruim;
  const sinal = p != null && p > 0 ? '+' : '';

  return (
    <Secao titulo="Comparado ao ano passado">
      <View style={s.pad}>
        {p == null ? (
          <Text style={s.frase}>Sem vendas no mesmo período do ano passado para comparar.</Text>
        ) : (
          <>
            <Text style={[s.grande, numeros, { color: cor }]}>
              {sinal}
              {percentual(p)}
            </Text>
            <Text style={s.frase}>
              {moeda(atual)} agora contra {moeda(anoAnterior)} no mesmo período do ano passado.
            </Text>
          </>
        )}
        {anoAnteriorMes > 0 && (
          <Text style={[s.dica, { marginTop: 8 }]}>
            O mês inteiro do ano passado fechou em {moeda(anoAnteriorMes)}.
          </Text>
        )}
      </View>
    </Secao>
  );
}

// ---------------------------------------------------------------------------
// Ruptura
// ---------------------------------------------------------------------------
export function BlocoRuptura({ ruptura }) {
  if (!ruptura) return null;
  return (
    <Secao titulo="Ruptura">
      <View style={[s.pad, s.topoLinha]}>
        <Text style={[s.medio, numeros, ruptura.valor > 0 && { color: cores.ruim }]}>{moeda(ruptura.valor)}</Text>
        {ruptura.valor > 0 && (
          <Text style={s.dica}>{percentual(ruptura.percentualDoFaturado)} do faturado</Text>
        )}
      </View>
    </Secao>
  );
}

const s = StyleSheet.create({
  secao: { marginTop: 22 },
  secaoTitulo: { fontSize: 13, fontWeight: '600', color: cores.suave, marginBottom: 8, marginLeft: 4 },
  bloco: { backgroundColor: cores.superficie, borderRadius: 14 },
  pad: { padding: 18 },
  grande: { fontSize: 28, fontWeight: '800', color: cores.tinta, letterSpacing: -0.5 },
  medio: { fontSize: 20, fontWeight: '700', color: cores.tinta },
  frase: { fontSize: 15, color: cores.tinta, marginTop: 4, lineHeight: 21 },
  fraseForte: { fontWeight: '700' },
  dica: { fontSize: 13, color: cores.suave, marginTop: 4 },
  topoLinha: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 },
  pctLado: { fontSize: 22, fontWeight: '800' },
  linhaPares: { flexDirection: 'row', paddingHorizontal: 18, paddingVertical: 14, gap: 12 },
  divisorTopo: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: cores.linha },
  par: { flex: 1 },
  parRotulo: { fontSize: 13, color: cores.suave },
  parValor: { fontSize: 17, fontWeight: '700', color: cores.tinta, marginTop: 3 },
  barraEmpilhada: {
    flexDirection: 'row',
    height: 12,
    borderRadius: 6,
    backgroundColor: cores.trilho,
    marginTop: 14,
    overflow: 'visible',
  },
  segmento: { height: 12 },
  inicio: { borderTopLeftRadius: 6, borderBottomLeftRadius: 6 },
  marcaMeta: { position: 'absolute', top: -4, width: 2, height: 20, marginLeft: -1, backgroundColor: cores.tinta },
  legenda: { marginTop: 12, gap: 6 },
  legendaItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  bolinha: { width: 10, height: 10, borderRadius: 5 },
  legendaTexto: { fontSize: 14, color: cores.suave },
  legendaValor: { color: cores.tinta, fontWeight: '600' },
});
