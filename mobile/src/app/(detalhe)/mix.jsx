import React, { useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { usePainel } from '../../contexts/painel';
import { useConsulta } from '../../hooks/useConsulta';
import { consultas } from '../../lib/consultas';
import { lerCods, lerTexto } from '../../lib/navegar';
import { moeda, numero, percentual } from '../../lib/format';
import { Cabecalho } from '../../components/Cabecalho';
import { Segmentado } from '../../components/Segmentado';
import { Barra, Busca, EstadoTela, contem } from '../../components/Lista';
import { cores, numeros } from '../../theme';

export default function MixItens() {
  const params = useLocalSearchParams();
  const vendedores = lerCods(params.vendedores);
  const escopo = lerTexto(params.escopo);
  const { periodo } = usePainel();

  const [modo, setModo] = useState('vendidos');
  const [criterio, setCriterio] = useState('qtd');
  const [busca, setBusca] = useState('');

  const chave = `${periodo.de}|${periodo.ate}|${vendedores.join(',')}|${modo}|${criterio}`;
  const { dados, carregando, atualizando, erro, recarregar } = useConsulta(
    () => consultas.mixItens({ de: periodo.de, ate: periodo.ate, vendedores, modo, criterio }),
    chave
  );

  const itens = useMemo(
    () => (dados?.itens || []).filter((i) => !busca || contem(i.Material, busca)),
    [dados, busca]
  );
  const total = (dados?.itens || []).length;
  const vendidos = modo === 'vendidos';

  return (
    <>
      <Stack.Screen options={{ title: vendidos ? 'Itens vendidos' : 'Itens não vendidos' }} />
      <FlatList
        data={carregando || erro ? [] : itens}
        keyExtractor={(i, idx) => String(i.CodMaterial ?? idx)}
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={atualizando} onRefresh={recarregar} tintColor={cores.marca} />}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <Cabecalho escopo={escopo}>
            <Segmentado
              opcoes={[
                { valor: 'vendidos', rotulo: 'Vendidos' },
                { valor: 'nao_vendidos', rotulo: 'Não vendidos' },
              ]}
              valor={modo}
              aoMudar={setModo}
            />
            {vendidos && (
              <Segmentado
                opcoes={[
                  { valor: 'qtd', rotulo: 'Por quantidade' },
                  { valor: 'valor', rotulo: 'Por valor' },
                ]}
                valor={criterio}
                aoMudar={setCriterio}
              />
            )}
            <Busca valor={busca} aoMudar={setBusca} placeholder="Buscar produto" />
            {!carregando && !erro && (
              <Text style={s.resumo}>
                {numero(total)} {vendidos ? 'produtos vendidos' : 'produtos sem venda'}
                {busca ? `, ${numero(itens.length)} na busca` : ''}
              </Text>
            )}
          </Cabecalho>
        }
        ListEmptyComponent={
          <EstadoTela
            carregando={carregando}
            erro={erro}
            aoTentar={recarregar}
            vazio
            textoVazio={busca ? 'Nenhum produto com esse nome.' : 'Nenhum produto neste período.'}
          />
        }
        renderItem={({ item }) => (
          <View style={s.item}>
            <Text style={s.nome} numberOfLines={2}>
              {item.Material}
            </Text>
            {vendidos ? (
              <>
                <View style={s.linhaValores}>
                  <Text style={[s.valor, numeros]}>
                    {criterio === 'valor' ? moeda(item.ValorTotal) : `${numero(item.QtdItens)} un.`}
                  </Text>
                  <Text style={[s.secundario, numeros]}>
                    {criterio === 'valor' ? `${numero(item.QtdItens)} un.` : moeda(item.ValorTotal)}
                  </Text>
                  <Text style={[s.pct, numeros]}>
                    {percentual(criterio === 'valor' ? item.PercValor : item.PercQtd)}
                  </Text>
                </View>
                <Barra percentual={criterio === 'valor' ? item.PercValor : item.PercQtd} />
              </>
            ) : null}
          </View>
        )}
      />
    </>
  );
}

const s = StyleSheet.create({
  resumo: { fontSize: 13, color: cores.suave },
  item: {
    backgroundColor: cores.superficie,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: cores.linha,
  },
  nome: { fontSize: 15, fontWeight: '600', color: cores.tinta },
  linhaValores: { flexDirection: 'row', alignItems: 'baseline', gap: 12, marginTop: 4 },
  valor: { fontSize: 15, fontWeight: '700', color: cores.tinta },
  secundario: { flex: 1, fontSize: 13, color: cores.suave },
  pct: { fontSize: 13, fontWeight: '600', color: cores.suave },
});
