import React from 'react';
import { Stack } from 'expo-router';
import { cores } from '../../theme';

// Telas de detalhamento: abrem por cima das abas, com voltar no cabeçalho.
export default function DetalheLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: cores.fundo },
        headerShadowVisible: false,
        headerTintColor: cores.marca,
        headerTitleStyle: { fontWeight: '700', color: cores.tinta },
        headerBackTitle: 'Voltar',
        contentStyle: { backgroundColor: cores.fundo },
      }}
    />
  );
}
