import React from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { usePainel } from '../../contexts/painel';
import { useConsulta } from '../../hooks/useConsulta';
import { consultas } from '../../lib/consultas';
import { lerTexto } from '../../lib/navegar';
import { dataCurta, moeda, numero, percentual } from '../../lib/format';
import { Cabecalho } from '../../components/Cabecalho';
import { EstadoTela } from '../../components/Lista';
import { cores, numeros } from '../../theme';

export default function Comissoes() {
  const params = useLocalSearchParams();
  const cod = lerTexto(params.cod);
  const nome = lerTexto(params.nome);
  const { periodo } = usePainel();

  const { dados, carregando, atualizando, erro, recarregar } = useConsulta(
    () => consultas.comissoes({ de: periodo.de, ate: periodo.ate, cod }),
    `${periodo.de}|${periodo.ate}|${cod}`
  );
  const pedidos = dados?.detalhado || [];

  return (
    <>
      <Stack.Screen options={{ title: 'Comissões' }} />
      <FlatList
        data={carregando || erro ? [] : pedidos}
        keyExtractor={(p) => String(p.CodPedidoVenda)}
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={atualizando} onRefresh={recarregar} tintColor={cores.marca} />}
        ListHeaderComponent={
          <Cabecalho escopo={nome}>
            {!carregando && !erro && dados ? (
              <View style={s.totais}>
                <Text style={s.rotulo}>Comissão no período</Text>
                <Text style={[s.total, numeros]}>{moeda(dados.total_comissao)}</Text>
                <Text style={s.base}>
                  sobre {moeda(dados.total_valor_pedidos)} em {numero(pedidos.length)}{' '}
                  {pedidos.length === 1 ? 'pedido' : 'pedidos'}
                </Text>
              </View>
            ) : null}
          </Cabecalho>
        }
        ListEmptyComponent={
          <EstadoTela
            carregando={carregando}
            erro={erro}
            aoTentar={recarregar}
            vazio
            textoVazio="Nenhum pedido comissionável neste período."
          />
        }
        renderItem={({ item }) => (
          <View style={s.item}>
            <View style={s.topo}>
              <Text style={s.cliente} numberOfLines={1}>
                {item.Cliente}
              </Text>
              <Text style={[s.comissao, numeros]}>{moeda(item.ComissaoValor)}</Text>
            </View>
            <View style={s.topo}>
              <Text style={s.meta} numberOfLines={1}>
                Pedido {item.NumPedidoVenda || item.CodPedidoVenda}, {dataCurta(item.DataVenda)}
              </Text>
              <Text style={[s.meta, numeros]}>
                {percentual(item.ComissaoPercentual, 2)} de {moeda(item.ValorPedido)}
              </Text>
            </View>
            {item.SituacaoPagamento || item.NaturezaOperacao ? (
              <Text style={s.meta} numberOfLines={1}>
                {[item.NaturezaOperacao, item.SituacaoPagamento].filter(Boolean).join(', ')}
              </Text>
            ) : null}
          </View>
        )}
      />
    </>
  );
}

const s = StyleSheet.create({
  totais: { backgroundColor: cores.superficie, borderRadius: 14, padding: 16 },
  rotulo: { fontSize: 13, color: cores.suave },
  total: { fontSize: 30, fontWeight: '800', color: cores.ok, letterSpacing: -0.5, marginTop: 2 },
  base: { fontSize: 14, color: cores.suave, marginTop: 2 },
  item: {
    backgroundColor: cores.superficie,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: cores.linha,
    gap: 3,
  },
  topo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 },
  cliente: { flex: 1, fontSize: 15, fontWeight: '600', color: cores.tinta },
  comissao: { fontSize: 15, fontWeight: '700', color: cores.tinta },
  meta: { fontSize: 13, color: cores.suave, flexShrink: 1 },
});
