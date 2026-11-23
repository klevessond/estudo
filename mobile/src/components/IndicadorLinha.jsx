import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { cores, numeros } from '../theme';
import { percentual, porUnidade } from '../lib/format';
import { statusDe } from '../lib/indicadores';

// A régua vai até 120%: dá para ver quem passou da meta sem estourar o layout.
const TETO = 120;
const posicao = (pct) => `${(Math.min(Math.max(pct, 0), TETO) / TETO) * 100}%`;

const COR_STATUS = { ok: cores.ok, atencao: cores.atencao, ruim: cores.ruim, neutro: cores.marca };

export function IndicadorLinha({ item, esperado, ultimo }) {
  const status = statusDe(item.percentual, esperado);
  const cor = COR_STATUS[status];
  const semMeta = item.objetivo <= 0;

  return (
    <View style={[s.linha, !ultimo && s.divisor]}>
      <View style={s.topo}>
        <Text style={s.rotulo}>{item.rotulo}</Text>
        <Text style={[s.pct, numeros, { color: semMeta ? cores.suave : cor }]}>
          {semMeta ? 'sem meta' : percentual(item.percentual)}
        </Text>
      </View>

      {!semMeta && (
        <View style={s.regua} accessibilityLabel={`${item.rotulo}: ${percentual(item.percentual)} da meta`}>
          <View style={[s.preenchido, { width: posicao(item.percentual), backgroundColor: cor }]} />
          {esperado != null && esperado < 1 && (
            <View style={[s.marcaEsperado, { left: posicao(esperado * 100) }]} />
          )}
          <View style={[s.marcaMeta, { left: posicao(100) }]} />
        </View>
      )}

      <View style={s.rodape}>
        <Text style={[s.valor, numeros]}>
          {porUnidade(item.realizado, item.unidade)}
          {!semMeta && <Text style={s.meta}> de {porUnidade(item.objetivo, item.unidade)}</Text>}
        </Text>
        {!semMeta && (
          <Text style={[s.falta, numeros]}>
            {item.falta > 0 ? `faltam ${porUnidade(item.falta, item.unidade)}` : 'meta batida'}
          </Text>
        )}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  linha: { paddingVertical: 18, paddingHorizontal: 20 },
  divisor: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: cores.linha },
  topo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  rotulo: { fontSize: 15, fontWeight: '600', color: cores.tinta },
  pct: { fontSize: 30, fontWeight: '800', letterSpacing: -0.5 },
  regua: {
    height: 10,
    backgroundColor: cores.trilho,
    borderRadius: 5,
    marginTop: 10,
    marginBottom: 10,
    overflow: 'visible',
  },
  preenchido: { height: 10, borderRadius: 5 },
  marcaMeta: { position: 'absolute', top: -4, width: 2, height: 18, marginLeft: -1, backgroundColor: cores.tinta },
  marcaEsperado: {
    position: 'absolute',
    top: -3,
    width: 4,
    height: 16,
    marginLeft: -2,
    borderRadius: 2,
    backgroundColor: cores.trigo,
  },
  rodape: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 },
  valor: { fontSize: 15, fontWeight: '600', color: cores.tinta, flexShrink: 1 },
  meta: { fontWeight: '400', color: cores.suave },
  falta: { fontSize: 13, color: cores.suave },
});
