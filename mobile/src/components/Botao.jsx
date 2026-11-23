import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { cores } from '../theme';

export function Botao({ titulo, aoTocar, carregando, variante = 'primario', desativado }) {
  const sec = variante === 'secundario';
  const perigo = variante === 'perigo';
  return (
    <Pressable
      onPress={aoTocar}
      disabled={desativado || carregando}
      style={({ pressed }) => [
        s.base,
        sec || perigo ? s.contorno : s.cheio,
        perigo && { borderColor: cores.ruim },
        (pressed || desativado) && { opacity: 0.7 },
      ]}
      accessibilityRole="button"
    >
      {carregando ? (
        <ActivityIndicator color={sec || perigo ? cores.marca : '#fff'} />
      ) : (
        <Text style={[s.texto, sec && { color: cores.marca }, perigo && { color: cores.ruim }]}>{titulo}</Text>
      )}
    </Pressable>
  );
}

const s = StyleSheet.create({
  base: { minHeight: 50, borderRadius: 10, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18 },
  cheio: { backgroundColor: cores.marca },
  contorno: { borderWidth: 1.5, borderColor: cores.marca, backgroundColor: 'transparent' },
  texto: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
