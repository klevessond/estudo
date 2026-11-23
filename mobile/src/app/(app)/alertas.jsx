import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from 'expo-router';
import api, { mensagemDeErro } from '../../api';
import { useAlertas } from '../../contexts/alertas';
import { dataCurta, moeda, tempoRelativo } from '../../lib/format';
import { cores, numeros } from '../../theme';

const POR_PAGINA = 30;

export default function Alertas() {
  const { setNaoLidos, naoLidos } = useAlertas();
  const navigation = useNavigation();
  const [itens, setItens] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [maisAntigos, setMaisAntigos] = useState(false);
  const [acabou, setAcabou] = useState(false);
  const [erro, setErro] = useState(null);

  const carregar = useCallback(
    async ({ antesId, puxou } = {}) => {
      if (antesId) setMaisAntigos(true);
      else if (puxou) setAtualizando(true);
      setErro(null);
      try {
        const params = { limite: POR_PAGINA };
        if (antesId) params.antes_id = antesId;
        const { data } = await api.get('/alertas/', { params });
        const novos = data?.results || [];
        setItens((atual) => (antesId ? [...atual, ...novos] : novos));
        setAcabou(novos.length < POR_PAGINA);
        setNaoLidos(Number(data?.nao_lidos || 0));
      } catch (err) {
        setErro(mensagemDeErro(err));
      } finally {
        setCarregando(false);
        setAtualizando(false);
        setMaisAntigos(false);
      }
    },
    [setNaoLidos]
  );

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  const marcar = useCallback(
    async (corpo, idsLocais) => {
      setItens((atual) => atual.map((a) => (idsLocais === 'todos' || idsLocais.includes(a.id) ? { ...a, lido: true } : a)));
      try {
        const { data } = await api.post('/alertas/marcar-lidos/', corpo);
        setNaoLidos(Number(data?.nao_lidos || 0));
      } catch {
        carregar(); // se falhar, volta ao estado do servidor
      }
    },
    [carregar, setNaoLidos]
  );

  // Botão "Marcar todos como lidos" no cabeçalho
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () =>
        naoLidos > 0 ? (
          <Pressable onPress={() => marcar({ todos: true }, 'todos')} style={{ paddingHorizontal: 16 }} hitSlop={8}>
            <Text style={{ color: cores.marca, fontWeight: '600', fontSize: 15 }}>Marcar como lidos</Text>
          </Pressable>
        ) : null,
    });
  }, [navigation, naoLidos, marcar]);

  if (carregando) {
    return (
      <View style={s.centro}>
        <ActivityIndicator size="large" color={cores.marca} />
      </View>
    );
  }

  return (
    <FlatList
      data={itens}
      keyExtractor={(a) => String(a.id)}
      contentContainerStyle={itens.length ? s.lista : s.listaVazia}
      refreshControl={<RefreshControl refreshing={atualizando} onRefresh={() => carregar({ puxou: true })} tintColor={cores.marca} />}
      onEndReachedThreshold={0.4}
      onEndReached={() => {
        if (!acabou && !maisAntigos && itens.length) carregar({ antesId: itens[itens.length - 1].id });
      }}
      ListFooterComponent={maisAntigos ? <ActivityIndicator color={cores.marca} style={{ margin: 16 }} /> : null}
      ListEmptyComponent={
        <View style={s.centro}>
          <Text style={s.vazioTitulo}>{erro ? 'Não foi possível carregar' : 'Nenhuma ruptura por aqui'}</Text>
          <Text style={s.vazioTexto}>
            {erro || 'Quando um pedido de cliente seu tiver item não atendido, o aviso aparece nesta lista.'}
          </Text>
        </View>
      }
      renderItem={({ item }) => <LinhaAlerta alerta={item} aoTocar={() => !item.lido && marcar({ ids: [item.id] }, [item.id])} />}
    />
  );
}

function LinhaAlerta({ alerta, aoTocar }) {
  const d = alerta.dados || {};
  const mostrarVendedor = alerta.papel !== 'vendedor' && d.vendedor;

  return (
    <Pressable onPress={aoTocar} style={({ pressed }) => [s.item, pressed && { opacity: 0.8 }]}>
      <View style={[s.ponto, { backgroundColor: alerta.lido ? 'transparent' : cores.trigo }]} />
      <View style={{ flex: 1 }}>
        <View style={s.itemTopo}>
          <Text style={[s.titulo, alerta.lido && { fontWeight: '500' }]} numberOfLines={1}>
            {alerta.titulo}
          </Text>
          <Text style={s.quando}>{tempoRelativo(alerta.criado_em)}</Text>
        </View>
        <Text style={s.cliente} numberOfLines={1}>{d.cliente}</Text>
        <Text style={s.material} numberOfLines={2}>{d.material}</Text>
        <View style={s.itemRodape}>
          <Text style={[s.valor, numeros]}>{moeda(d.valor)}</Text>
          <Text style={s.meta} numberOfLines={1}>
            Pedido de {dataCurta(d.data_doc)}
            {mostrarVendedor ? ` · ${d.vendedor}` : ''}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  lista: { padding: 12, gap: 8 },
  listaVazia: { flexGrow: 1 },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  vazioTitulo: { fontSize: 18, fontWeight: '700', color: cores.tinta, textAlign: 'center' },
  vazioTexto: { fontSize: 15, color: cores.suave, textAlign: 'center', marginTop: 8, lineHeight: 21 },
  item: { flexDirection: 'row', backgroundColor: cores.superficie, borderRadius: 12, padding: 14, gap: 10 },
  ponto: { width: 8, height: 8, borderRadius: 4, marginTop: 7 },
  itemTopo: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  titulo: { flex: 1, fontSize: 14, fontWeight: '700', color: cores.suave },
  quando: { fontSize: 12, color: cores.suave },
  cliente: { fontSize: 17, fontWeight: '700', color: cores.tinta, marginTop: 4 },
  material: { fontSize: 15, color: cores.tinta, marginTop: 2 },
  itemRodape: { flexDirection: 'row', alignItems: 'baseline', gap: 10, marginTop: 8 },
  valor: { fontSize: 16, fontWeight: '700', color: cores.ruim },
  meta: { flex: 1, fontSize: 13, color: cores.suave },
});
