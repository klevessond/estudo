import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { usePainel } from '../contexts/painel';
import { dataCurta } from '../lib/format';
import { cores } from '../theme';

/** Diz de quem e de quando são os números da tela. */
export function Cabecalho({ escopo, children }) {
  const { periodo } = usePainel();
  const quando =
    periodo.de === periodo.ate ? dataCurta(periodo.de) : `${dataCurta(periodo.de)} a ${dataCurta(periodo.ate)}`;
  return (
    <View style={s.caixa}>
      <Text style={s.escopo}>{escopo ? `${escopo}, ${quando}` : quando}</Text>
      {children}
    </View>
  );
}

const s = StyleSheet.create({
  caixa: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 12, gap: 10 },
  escopo: { fontSize: 13, color: cores.suave },
});
