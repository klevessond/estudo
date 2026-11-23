import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePainel } from '../../contexts/painel';
import { useConsulta } from '../../hooks/useConsulta';
import { consultas } from '../../lib/consultas';
import { lerCods, lerTexto } from '../../lib/navegar';
import { dataCurta, moeda, numero } from '../../lib/format';
import { nomeCurto } from '../../lib/vendedores';
import { Cabecalho } from '../../components/Cabecalho';
import { Segmentado } from '../../components/Segmentado';
import { EstadoTela } from '../../components/Lista';
import { cores, numeros } from '../../theme';

const SITUACAO = {
  NAO_PROCESSADA: { rotulo: 'Não processada', cor: cores.atencao, icone: 'time-outline' },
  COM_PROBLEMA: { rotulo: 'Com problema', cor: cores.ruim, icone: 'alert-circle-outline' },
};

export default function PreVenda() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const vendedores = lerCods(params.vendedores);
  const escopo = lerTexto(params.escopo);
  const { periodo } = usePainel();
  const [filtro, setFiltro] = useState('todas');

  const chave = `${periodo.de}|${periodo.ate}|${vendedores.join(',')}`;
  const { dados, carregando, atualizando, erro, recarregar } = useConsulta(
    () => consultas.preVendaStatus({ de: periodo.de, ate: periodo.ate, vendedores }),
    chave
  );

  const pendencias = useMemo(
    () => (dados?.pendencias || []).filter((p) => filtro === 'todas' || p.Situacao === filtro),
    [dados, filtro]
  );
  const variosVendedores = new Set((dados?.pendencias || []).map((p) => p.CodVendedor)).size > 1;

  return (
    <>
      <Stack.Screen options={{ title: 'Pré-venda pendente' }} />
      <FlatList
        data={carregando || erro ? [] : pendencias}
        keyExtractor={(p) => `${p.CodPocket}-${p.CodPocketDocumento}`}
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={atualizando} onRefresh={recarregar} tintColor={cores.marca} />}
        ListHeaderComponent={
          <Cabecalho escopo={escopo}>
            {!carregando && !erro && dados ? (
              <Segmentado
                opcoes={[
                  { valor: 'todas', rotulo: `Todas (${numero(dados.total)})` },
                  { valor: 'NAO_PROCESSADA', rotulo: `Não proc. (${numero(dados.total_nao_processadas)})` },
                  { valor: 'COM_PROBLEMA', rotulo: `Problema (${numero(dados.total_com_problema)})` },
                ]}
                valor={filtro}
                aoMudar={setFiltro}
              />
            ) : null}
          </Cabecalho>
        }
        ListEmptyComponent={
          <EstadoTela
            carregando={carregando}
            erro={erro}
            aoTentar={recarregar}
            vazio
            textoVazio="Nenhuma pré-venda pendente neste período. Tudo foi processado."
          />
        }
        renderItem={({ item }) => {
          const sit = SITUACAO[item.Situacao] || SITUACAO.NAO_PROCESSADA;
          const cliente = item.ClienteFantasia || item.Cliente;
          return (
            <Pressable
              onPress={() =>
                router.push({
                  pathname: '/pre-venda-itens',
                  params: {
                    pocket: String(item.CodPocket),
                    doc: String(item.CodPocketDocumento),
                    cliente,
                    valor: String(item.Valor),
                  },
                })
              }
              style={({ pressed }) => [s.item, pressed && { backgroundColor: cores.trilho }]}
              accessibilityRole="button"
            >
              <View style={{ flex: 1 }}>
                <View style={s.topo}>
                  <Ionicons name={sit.icone} size={16} color={sit.cor} />
                  <Text style={[s.situacao, { color: sit.cor }]}>{sit.rotulo}</Text>
                  <Text style={s.data}>{dataCurta(item.DataDoc)}</Text>
                </View>
                <Text style={s.cliente} numberOfLines={1}>
                  {cliente}
                </Text>
                {item.Motivo ? <Text style={s.motivo}>{item.Motivo}</Text> : null}
                <View style={s.rodape}>
                  <Text style={[s.valor, numeros]}>{moeda(item.Valor)}</Text>
                  {variosVendedores ? <Text style={s.vendedor}>{nomeCurto(item.Funcionario)}</Text> : null}
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={cores.suave} />
            </Pressable>
          );
        }}
      />
    </>
  );
}

const s = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: cores.superficie,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: cores.linha,
  },
  topo: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  situacao: { flex: 1, fontSize: 13, fontWeight: '700' },
  data: { fontSize: 13, color: cores.suave },
  cliente: { fontSize: 16, fontWeight: '700', color: cores.tinta, marginTop: 4 },
  motivo: { fontSize: 14, color: cores.ruim, marginTop: 4, lineHeight: 19 },
  rodape: { flexDirection: 'row', alignItems: 'baseline', gap: 12, marginTop: 6 },
  valor: { fontSize: 15, fontWeight: '700', color: cores.tinta },
  vendedor: { fontSize: 13, color: cores.suave },
});
