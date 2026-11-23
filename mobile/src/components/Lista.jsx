import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Botao } from './Botao';
import { cores, numeros } from '../theme';

/** Linha tocável com seta, para abrir um detalhamento. */
export function LinhaLink({ titulo, detalhe, valor, corValor, aoTocar, ultimo, icone }) {
  return (
    <Pressable
      onPress={aoTocar}
      style={({ pressed }) => [s.link, !ultimo && s.divisor, pressed && { backgroundColor: cores.trilho }]}
      accessibilityRole="button"
    >
      {icone ? <Ionicons name={icone} size={20} color={cores.marca} style={{ marginRight: 12 }} /> : null}
      <View style={{ flex: 1 }}>
        <Text style={s.linkTitulo}>{titulo}</Text>
        {detalhe ? <Text style={s.linkDetalhe}>{detalhe}</Text> : null}
      </View>
      {valor != null ? <Text style={[s.linkValor, numeros, corValor && { color: corValor }]}>{valor}</Text> : null}
      <Ionicons name="chevron-forward" size={18} color={cores.suave} />
    </Pressable>
  );
}

/** Carregando / erro com "tentar de novo" / vazio. Devolve null quando há conteúdo. */
export function EstadoTela({ carregando, erro, vazio, textoVazio, aoTentar, textoCarregando }) {
  if (carregando) {
    return (
      <View style={s.estado}>
        <ActivityIndicator size="large" color={cores.marca} />
        {textoCarregando ? <Text style={s.estadoTexto}>{textoCarregando}</Text> : null}
      </View>
    );
  }
  if (erro) {
    return (
      <View style={s.estado}>
        <Text style={s.estadoTitulo}>Não foi possível carregar</Text>
        <Text style={s.estadoTexto}>{erro}</Text>
        {aoTentar ? (
          <View style={{ alignSelf: 'stretch', marginTop: 16 }}>
            <Botao titulo="Tentar de novo" aoTocar={aoTentar} />
          </View>
        ) : null}
      </View>
    );
  }
  if (vazio) {
    return (
      <View style={s.estado}>
        <Text style={s.estadoTexto}>{textoVazio}</Text>
      </View>
    );
  }
  return null;
}

export function Busca({ valor, aoMudar, placeholder }) {
  return (
    <View style={s.busca}>
      <Ionicons name="search" size={18} color={cores.suave} />
      <TextInput
        value={valor}
        onChangeText={aoMudar}
        placeholder={placeholder}
        placeholderTextColor={cores.suave}
        style={s.buscaInput}
        autoCorrect={false}
        clearButtonMode="while-editing"
        returnKeyType="search"
      />
    </View>
  );
}

/** Barra de proporção 0–100% (uma cor só, trilho neutro). */
export function Barra({ percentual, cor = cores.marca }) {
  const largura = `${Math.min(Math.max(percentual || 0, 0), 100)}%`;
  return (
    <View style={s.barra}>
      <View style={[s.barraCheia, { width: largura, backgroundColor: cor }]} />
    </View>
  );
}

/** Rótulo de seção acima de um bloco branco. */
export function TituloSecao({ children }) {
  return <Text style={s.secao}>{children}</Text>;
}

export function Bloco({ children, style }) {
  return <View style={[s.bloco, style]}>{children}</View>;
}

/** Normaliza para busca sem acento e sem caixa. */
export function contem(texto, termo) {
  const n = (t) =>
    String(t || '')
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase();
  return n(texto).includes(n(termo));
}

const s = StyleSheet.create({
  link: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, gap: 8 },
  divisor: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: cores.linha },
  linkTitulo: { fontSize: 15, fontWeight: '600', color: cores.tinta },
  linkDetalhe: { fontSize: 13, color: cores.suave, marginTop: 2 },
  linkValor: { fontSize: 15, fontWeight: '700', color: cores.tinta },
  estado: { alignItems: 'center', paddingVertical: 48, paddingHorizontal: 24 },
  estadoTitulo: { fontSize: 18, fontWeight: '700', color: cores.tinta, textAlign: 'center' },
  estadoTexto: { color: cores.suave, fontSize: 15, textAlign: 'center', marginTop: 10, lineHeight: 21 },
  busca: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: cores.superficie,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: cores.linha,
    paddingHorizontal: 12,
  },
  buscaInput: { flex: 1, paddingVertical: 10, fontSize: 16, color: cores.tinta },
  barra: { height: 6, borderRadius: 3, backgroundColor: cores.trilho, overflow: 'hidden', marginTop: 8 },
  barraCheia: { height: 6, borderRadius: 3 },
  secao: { fontSize: 13, fontWeight: '600', color: cores.suave, marginTop: 22, marginBottom: 8, marginLeft: 4 },
  bloco: { backgroundColor: cores.superficie, borderRadius: 14, overflow: 'hidden' },
});
