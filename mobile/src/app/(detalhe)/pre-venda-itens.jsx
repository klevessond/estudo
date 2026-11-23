import React from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useConsulta } from '../../hooks/useConsulta';
import { consultas } from '../../lib/consultas';
import { lerTexto } from '../../lib/navegar';
import { moeda, numero } from '../../lib/format';
import { EstadoTela } from '../../components/Lista';
import { cores, numeros } from '../../theme';

export default function PreVendaItens() {
  const params = useLocalSearchParams();
  const codPocket = lerTexto(params.pocket);
  const codDoc = lerTexto(params.doc);
  const cliente = lerTexto(params.cliente);

  const { dados, carregando, atualizando, erro, recarregar } = useConsulta(
    () => consultas.preVendaItens({ codPocket, codDoc }),
    `${codPocket}|${codDoc}`
  );

  return (
    <>
      <Stack.Screen options={{ title: 'Itens da pré-venda' }} />
      <FlatList
        data={carregando || erro ? [] : dados?.itens || []}
        keyExtractor={(i, idx) => `${i.CodMaterial}-${idx}`}
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={atualizando} onRefresh={recarregar} tintColor={cores.marca} />}
        ListHeaderComponent={
          <View style={s.cabecalho}>
            <Text style={s.cliente}>{cliente}</Text>
            <Text style={s.doc}>Documento {codDoc}</Text>
            {!carregando && !erro && dados ? (
              <Text style={[s.total, numeros]}>
                {moeda(dados.valor_total)}
                <Text style={s.totalItens}> em {numero(dados.total_itens)} itens</Text>
              </Text>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          <EstadoTela carregando={carregando} erro={erro} aoTentar={recarregar} vazio textoVazio="Documento sem itens." />
        }
        renderItem={({ item }) => (
          <View style={s.item}>
            <Text style={s.nome} numberOfLines={2}>
              {item.Material}
            </Text>
            <View style={s.linha}>
              <Text style={[s.qtd, numeros]}>
                {numero(item.Qtd1, item.Qtd1 % 1 ? 2 : 0)} × {moeda(item.ValorUnitario)}
              </Text>
              <Text style={[s.valor, numeros]}>{moeda(item.ValorTotal)}</Text>
            </View>
          </View>
        )}
      />
    </>
  );
}

const s = StyleSheet.create({
  cabecalho: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 14 },
  cliente: { fontSize: 20, fontWeight: '800', color: cores.tinta },
  doc: { fontSize: 13, color: cores.suave, marginTop: 2 },
  total: { fontSize: 22, fontWeight: '800', color: cores.tinta, marginTop: 10 },
  totalItens: { fontSize: 14, fontWeight: '400', color: cores.suave },
  item: {
    backgroundColor: cores.superficie,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: cores.linha,
  },
  nome: { fontSize: 15, fontWeight: '600', color: cores.tinta },
  linha: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 4 },
  qtd: { fontSize: 14, color: cores.suave },
  valor: { fontSize: 15, fontWeight: '700', color: cores.tinta },
});
