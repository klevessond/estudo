import React, { useMemo, useState } from 'react';
import { RefreshControl, SectionList, StyleSheet, Text, View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { usePainel } from '../../contexts/painel';
import { useConsulta } from '../../hooks/useConsulta';
import { consultas } from '../../lib/consultas';
import { lerCods, lerTexto } from '../../lib/navegar';
import { numero } from '../../lib/format';
import { Cabecalho } from '../../components/Cabecalho';
import { Segmentado } from '../../components/Segmentado';
import { Busca, EstadoTela, contem } from '../../components/Lista';
import { cores } from '../../theme';

export default function Clientes() {
  const params = useLocalSearchParams();
  const vendedores = lerCods(params.vendedores);
  const escopo = lerTexto(params.escopo);
  const { periodo } = usePainel();

  const [positivados, setPositivados] = useState(true);
  const [busca, setBusca] = useState('');

  const chave = `${periodo.de}|${periodo.ate}|${vendedores.join(',')}|${positivados}`;
  const { dados, carregando, atualizando, erro, recarregar } = useConsulta(
    () => consultas.clientes({ de: periodo.de, ate: periodo.ate, vendedores, positivados }),
    chave
  );

  // Agrupa por rota (o backend já devolve ordenado por rota e cliente).
  const secoes = useMemo(() => {
    const grupos = new Map();
    for (const c of dados?.clientes || []) {
      if (busca && !contem(c.Cliente, busca) && !contem(c.ClienteFantasia, busca)) continue;
      const rota = c.Rota || 'Sem rota';
      if (!grupos.has(rota)) grupos.set(rota, []);
      grupos.get(rota).push(c);
    }
    return [...grupos.entries()].map(([title, data]) => ({ title, data }));
  }, [dados, busca]);

  const total = (dados?.clientes || []).length;
  const naBusca = secoes.reduce((acc, sec) => acc + sec.data.length, 0);

  return (
    <>
      <Stack.Screen options={{ title: positivados ? 'Clientes positivados' : 'Clientes sem compra' }} />
      <SectionList
        sections={carregando || erro ? [] : secoes}
        keyExtractor={(c, idx) => String(c.CodCliente ?? idx)}
        stickySectionHeadersEnabled
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={atualizando} onRefresh={recarregar} tintColor={cores.marca} />}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <Cabecalho escopo={escopo}>
            <Segmentado
              opcoes={[
                { valor: 'sim', rotulo: 'Positivados' },
                { valor: 'nao', rotulo: 'Sem compra' },
              ]}
              valor={positivados ? 'sim' : 'nao'}
              aoMudar={(v) => setPositivados(v === 'sim')}
            />
            <Busca valor={busca} aoMudar={setBusca} placeholder="Buscar cliente" />
            {!carregando && !erro && (
              <Text style={s.resumo}>
                {numero(total)} {positivados ? 'clientes compraram' : 'clientes da rota não compraram'}
                {busca ? `, ${numero(naBusca)} na busca` : ''}
              </Text>
            )}
          </Cabecalho>
        }
        ListEmptyComponent={
          <EstadoTela
            carregando={carregando}
            erro={erro}
            aoTentar={recarregar}
            textoCarregando="Buscando os clientes de cada rota…"
            vazio
            textoVazio={
              busca
                ? 'Nenhum cliente com esse nome.'
                : positivados
                  ? 'Nenhum cliente comprou neste período.'
                  : 'Todos os clientes das rotas compraram neste período.'
            }
          />
        }
        renderSectionHeader={({ section }) => (
          <View style={s.secao}>
            <Text style={s.secaoTitulo}>{section.title}</Text>
            <Text style={s.secaoQtd}>{numero(section.data.length)}</Text>
          </View>
        )}
        renderItem={({ item }) => {
          const fantasia = item.ClienteFantasia && item.ClienteFantasia !== item.Cliente ? item.ClienteFantasia : null;
          return (
            <View style={s.item}>
              <Text style={s.nome} numberOfLines={1}>
                {fantasia || item.Cliente}
              </Text>
              {fantasia ? (
                <Text style={s.razao} numberOfLines={1}>
                  {item.Cliente}
                </Text>
              ) : null}
            </View>
          );
        }}
      />
    </>
  );
}

const s = StyleSheet.create({
  resumo: { fontSize: 13, color: cores.suave },
  secao: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: cores.fundo,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 6,
  },
  secaoTitulo: { fontSize: 13, fontWeight: '700', color: cores.suave },
  secaoQtd: { fontSize: 13, color: cores.suave },
  item: {
    backgroundColor: cores.superficie,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: cores.linha,
  },
  nome: { fontSize: 15, fontWeight: '600', color: cores.tinta },
  razao: { fontSize: 13, color: cores.suave, marginTop: 2 },
});
