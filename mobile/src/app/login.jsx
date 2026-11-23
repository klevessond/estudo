import React, { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/auth';
import { mensagemDeErro, API_URL } from '../api';
import { Botao } from '../components/Botao';
import { cores } from '../theme';

export default function Login() {
  const { entrar } = useAuth();
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState(null);
  const senhaRef = useRef(null);

  const aoEntrar = async () => {
    if (!usuario.trim() || !senha) {
      setErro('Preencha usuário e senha.');
      return;
    }
    setEnviando(true);
    setErro(null);
    try {
      await entrar(usuario.trim(), senha);
      // O Stack.Protected troca para as abas sozinho quando "logado" vira true.
    } catch (err) {
      setErro(err?.response?.status === 401 ? 'Usuário ou senha incorretos.' : mensagemDeErro(err));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <SafeAreaView style={s.tela}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={s.miolo}>
        <Text style={s.marca}>Comercial do Trigo</Text>
        <Text style={s.sub}>Acompanhe suas metas e rupturas</Text>

        <View style={s.form}>
          <Text style={s.label}>Usuário</Text>
          <TextInput
            style={s.input}
            value={usuario}
            onChangeText={setUsuario}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="username"
            textContentType="username"
            returnKeyType="next"
            onSubmitEditing={() => senhaRef.current?.focus()}
          />

          <Text style={s.label}>Senha</Text>
          <TextInput
            ref={senhaRef}
            style={s.input}
            value={senha}
            onChangeText={setSenha}
            secureTextEntry
            autoComplete="current-password"
            textContentType="password"
            returnKeyType="go"
            onSubmitEditing={aoEntrar}
          />

          {erro && <Text style={s.erro}>{erro}</Text>}

          <View style={{ marginTop: 22 }}>
            <Botao titulo="Entrar" aoTocar={aoEntrar} carregando={enviando} />
          </View>
        </View>

        {__DEV__ && <Text style={s.dev}>API: {API_URL || 'EXPO_PUBLIC_API_URL não definida'}</Text>}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  miolo: { flex: 1, justifyContent: 'center', paddingHorizontal: 28 },
  marca: { fontSize: 30, fontWeight: '800', color: cores.marca, letterSpacing: -0.5 },
  sub: { fontSize: 16, color: cores.suave, marginTop: 4 },
  form: { marginTop: 36 },
  label: { fontSize: 14, fontWeight: '600', color: cores.tinta, marginBottom: 6, marginTop: 14 },
  input: {
    backgroundColor: cores.superficie,
    borderWidth: 1,
    borderColor: cores.linha,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 17,
    color: cores.tinta,
  },
  erro: { color: cores.ruim, marginTop: 14, fontSize: 14 },
  dev: { position: 'absolute', bottom: 12, left: 28, right: 28, fontSize: 11, color: cores.suave },
});
