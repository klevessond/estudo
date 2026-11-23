import React, { useCallback, useState } from 'react';
import { Alert, Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import api, { mensagemDeErro } from '../../api';
import { useAuth } from '../../contexts/auth';
import { useAlertas } from '../../contexts/alertas';
import { Botao } from '../../components/Botao';
import { cores } from '../../theme';

const NOMES_PAPEIS = { admin: 'Administrador', gerente: 'Gerente', supervisor: 'Supervisor', vendedor: 'Vendedor' };

export default function Perfil() {
  const { me, papeis, codFuncionario, sair } = useAuth();
  const { permissao, pedirPermissao } = useAlertas();
  const [telegram, setTelegram] = useState(null); // null = carregando
  const [vinculando, setVinculando] = useState(false);

  const checarTelegram = useCallback(async () => {
    try {
      const { data } = await api.get('/telegram/status/');
      setTelegram(!!data?.vinculado);
    } catch {
      setTelegram(false);
    }
  }, []);

  // Rechecagem ao voltar do Telegram para o app
  useFocusEffect(
    useCallback(() => {
      checarTelegram();
    }, [checarTelegram])
  );

  const vincularTelegram = async () => {
    setVinculando(true);
    try {
      const { data } = await api.post('/telegram/gerar-codigo/');
      if (!data?.bot_username) throw new Error('Bot do Telegram não configurado no servidor.');
      // Abre o bot já com o código; o usuário só toca em "Iniciar".
      await Linking.openURL(`https://t.me/${data.bot_username}?start=${data.codigo}`);
      Alert.alert(
        'Quase lá',
        'Toque em "Iniciar" no Telegram. A confirmação chega por lá em até 15 minutos.'
      );
    } catch (err) {
      Alert.alert('Não foi possível vincular', err?.response ? mensagemDeErro(err) : err.message);
    } finally {
      setVinculando(false);
    }
  };

  const desvincularTelegram = () =>
    Alert.alert('Desvincular Telegram?', 'Você deixa de receber os alertas por lá.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Desvincular',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.post('/telegram/desvincular/');
            setTelegram(false);
          } catch (err) {
            Alert.alert('Erro', mensagemDeErro(err));
          }
        },
      },
    ]);

  const confirmarSaida = () =>
    Alert.alert('Sair da conta?', undefined, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: sair },
    ]);

  const nome = [me?.first_name, me?.last_name].filter(Boolean).join(' ') || me?.username;
  const notificacoesOk = permissao === 'granted';

  return (
    <ScrollView contentContainerStyle={s.conteudo}>
      <View style={s.bloco}>
        <Text style={s.nome}>{nome}</Text>
        <Text style={s.linhaInfo}>
          {papeis.map((p) => NOMES_PAPEIS[p]).filter(Boolean).join(', ') || 'Sem perfil definido'}
          {codFuncionario ? ` · código ${codFuncionario}` : ''}
        </Text>
      </View>

      <Text style={s.secao}>Alertas no celular</Text>
      <View style={s.bloco}>
        <Text style={s.status}>{notificacoesOk ? 'Notificações permitidas' : 'Notificações desligadas'}</Text>
        <Text style={s.texto}>
          Nesta versão, o aviso de nova ruptura aparece quando o app está aberto ou ao voltar para ele. Com o app
          fechado, use o Telegram para não perder nada.
        </Text>
        {!notificacoesOk && (
          <View style={s.acao}>
            <Botao titulo="Permitir notificações" aoTocar={pedirPermissao} />
          </View>
        )}
      </View>

      <Text style={s.secao}>Telegram</Text>
      <View style={s.bloco}>
        <Text style={s.status}>
          {telegram === null ? 'Verificando…' : telegram ? 'Vinculado' : 'Não vinculado'}
        </Text>
        <Text style={s.texto}>Recebe os alertas de ruptura mesmo com o app fechado.</Text>
        <View style={s.acao}>
          {telegram ? (
            <Botao titulo="Desvincular" variante="perigo" aoTocar={desvincularTelegram} />
          ) : (
            <Botao
              titulo="Vincular Telegram"
              variante="secundario"
              aoTocar={vincularTelegram}
              carregando={vinculando}
              desativado={telegram === null}
            />
          )}
        </View>
      </View>

      <View style={{ marginTop: 28 }}>
        <Botao titulo="Sair da conta" variante="perigo" aoTocar={confirmarSaida} />
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  conteudo: { padding: 16, paddingBottom: 40 },
  bloco: { backgroundColor: cores.superficie, borderRadius: 14, padding: 18 },
  nome: { fontSize: 22, fontWeight: '800', color: cores.tinta },
  linhaInfo: { fontSize: 14, color: cores.suave, marginTop: 4 },
  secao: { fontSize: 13, fontWeight: '600', color: cores.suave, marginTop: 24, marginBottom: 8, marginLeft: 4 },
  status: { fontSize: 16, fontWeight: '700', color: cores.tinta },
  texto: { fontSize: 14, color: cores.suave, marginTop: 6, lineHeight: 20 },
  acao: { marginTop: 14 },
});
