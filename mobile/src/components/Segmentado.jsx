import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { cores } from '../theme';

export function Segmentado({ opcoes, valor, aoMudar }) {
  return (
    <View style={s.caixa} accessibilityRole="tablist">
      {opcoes.map((o) => {
        const ativo = o.valor === valor;
        return (
          <Pressable
            key={o.valor}
            onPress={() => aoMudar(o.valor)}
            style={[s.opcao, ativo && s.ativa]}
            accessibilityRole="tab"
            accessibilityState={{ selected: ativo }}
          >
            <Text style={[s.texto, ativo && s.textoAtivo]}>{o.rotulo}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  caixa: { flexDirection: 'row', backgroundColor: cores.trilho, borderRadius: 10, padding: 3 },
  opcao: { flex: 1, paddingVertical: 9, borderRadius: 8, alignItems: 'center' },
  ativa: { backgroundColor: cores.superficie },
  texto: { fontSize: 14, color: cores.suave, fontWeight: '500' },
  textoAtivo: { color: cores.tinta, fontWeight: '700' },
});
