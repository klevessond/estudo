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
        // SDK 58 deixa o cabeçalho transparente no iOS com Liquid Glass; aqui ele é sólido.
        headerTransparent: false,
        headerTintColor: cores.marca,
        headerTitleStyle: { fontWeight: '700', color: cores.tinta },
        headerBackTitle: 'Voltar',
        contentStyle: { backgroundColor: cores.fundo },
      }}
    />
  );
}
