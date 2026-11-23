import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from '../contexts/auth';
import { AlertasProvider } from '../contexts/alertas';
import { PainelProvider } from '../contexts/painel';
import { Botao } from '../components/Botao';
import { cores } from '../theme';

function Navegacao() {
  const { logado, carregando, semConexao, tentarDeNovo } = useAuth();

  if (carregando) {
    return (
      <View style={s.centro}>
        <ActivityIndicator size="large" color={cores.marca} />
      </View>
    );
  }

  if (semConexao) {
    return (
      <View style={s.centro}>
        <Text style={s.titulo}>Sem conexão com o servidor</Text>
        <Text style={s.texto}>Confira a internet do celular e tente de novo. Sua sessão continua salva.</Text>
        <View style={{ alignSelf: 'stretch', marginTop: 20 }}>
          <Botao titulo="Tentar de novo" aoTocar={tentarDeNovo} />
        </View>
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Router 58: guarda que falha redireciona; o destino fica explícito. */}
      <Stack.Protected guard={logado} redirectTo="/login">
        <Stack.Screen name="(app)" />
        <Stack.Screen name="(detalhe)" />
      </Stack.Protected>
      <Stack.Protected guard={!logado} redirectTo="/">
        <Stack.Screen name="login" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AlertasProvider>
        <PainelProvider>
          <StatusBar style="dark" />
          <Navegacao />
        </PainelProvider>
      </AlertasProvider>
    </AuthProvider>
  );
}

const s = StyleSheet.create({
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28, backgroundColor: cores.fundo },
  titulo: { fontSize: 20, fontWeight: '700', color: cores.tinta, textAlign: 'center' },
  texto: { fontSize: 15, color: cores.suave, textAlign: 'center', marginTop: 8, lineHeight: 21 },
});
