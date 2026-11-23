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

export default function RupturaItens() {
  const params = useLocalSearchParams();
  const vendedores = lerCods(params.vendedores);
  const escopo = lerTexto(params.escopo);
  const { periodo } = usePainel();

  const [criterio, setCriterio] = useState('valor');
  const [busca, setBusca] = useState('');

  const chave = `${periodo.de}|${periodo.ate}|${vendedores.join(',')}|${criterio}`;
  const { dados, carregando, atualizando, erro, recarregar } = useConsulta(
    () => consultas.rupturaItens({ de: periodo.de, ate: periodo.ate, vendedores, criterio }),
    chave
  );

  const itens = useMemo(
    () =>
      (dados?.itens || []).filter(
        (i) => !busca || contem(i.Material, busca) || contem(i.Fabricante, busca) || contem(i.Grupo, busca)
      ),
    [dados, busca]
  );
  const porValor = criterio === 'valor';

  return (
    <>
      <Stack.Screen options={{ title: 'Ruptura por item' }} />
      <FlatList
        data={carregando || erro ? [] : itens}
        keyExtractor={(i, idx) => String(i.CodMaterial ?? idx)}
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={atualizando} onRefresh={recarregar} tintColor={cores.marca} />}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <Cabecalho escopo={escopo}>
            {!carregando && !erro && dados ? (
              <View style={s.totais}>
                <View style={{ flex: 1 }}>
                  <Text style={s.totalRotulo}>Deixou de faturar</Text>
                  <Text style={[s.totalValor, numeros]}>{moeda(dados.total_valor)}</Text>
                </View>
                <View>
                  <Text style={s.totalRotulo}>Unidades</Text>
                  <Text style={[s.totalMenor, numeros]}>{numero(dados.total_qtd)}</Text>
                </View>
                <View>
                  <Text style={s.totalRotulo}>Produtos</Text>
                  <Text style={[s.totalMenor, numeros]}>{numero(dados.qtd_itens_distintos ?? dados.itens?.length)}</Text>
                </View>
              </View>
            ) : null}
            <Segmentado
              opcoes={[
                { valor: 'valor', rotulo: 'Por valor' },
                { valor: 'qtd', rotulo: 'Por quantidade' },
              ]}
              valor={criterio}
              aoMudar={setCriterio}
            />
            <Busca valor={busca} aoMudar={setBusca} placeholder="Buscar produto, fabricante ou grupo" />
          </Cabecalho>
        }
        ListEmptyComponent={
          <EstadoTela
            carregando={carregando}
            erro={erro}
            aoTentar={recarregar}
            vazio
            textoVazio={busca ? 'Nenhum item com esse nome.' : 'Nenhuma ruptura neste período.'}
          />
        }
        renderItem={({ item }) => {
          const pct = porValor ? item.PercValor : item.PercQtd;
          const origem = [item.Fabricante, item.Grupo].filter(Boolean).join(', ');
          return (
            <View style={s.item}>
              <Text style={s.nome} numberOfLines={2}>
                {item.Material}
              </Text>
              {origem ? (
                <Text style={s.origem} numberOfLines={1}>
                  {origem}
                </Text>
              ) : null}
              <View style={s.linhaValores}>
                <Text style={[s.valor, numeros]}>
                  {porValor ? moeda(item.ValorTotal) : `${numero(item.QtdItens)} un.`}
                </Text>
                <Text style={[s.secundario, numeros]}>
                  {porValor ? `${numero(item.QtdItens)} un.` : moeda(item.ValorTotal)}
                </Text>
                <Text style={[s.pct, numeros]}>{percentual(pct)}</Text>
              </View>
              <Barra percentual={pct} cor={cores.ruim} />
            </View>
          );
        }}
      />
    </>
  );
}

const s = StyleSheet.create({
  totais: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 16,
    backgroundColor: cores.superficie,
    borderRadius: 14,
    padding: 16,
  },
  totalRotulo: { fontSize: 13, color: cores.suave },
  totalValor: { fontSize: 22, fontWeight: '800', color: cores.ruim, marginTop: 2 },
  totalMenor: { fontSize: 17, fontWeight: '700', color: cores.tinta, marginTop: 2 },
  item: {
    backgroundColor: cores.superficie,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: cores.linha,
  },
  nome: { fontSize: 15, fontWeight: '600', color: cores.tinta },
  origem: { fontSize: 13, color: cores.suave, marginTop: 2 },
  linhaValores: { flexDirection: 'row', alignItems: 'baseline', gap: 12, marginTop: 4 },
  valor: { fontSize: 15, fontWeight: '700', color: cores.tinta },
  secundario: { flex: 1, fontSize: 13, color: cores.suave },
  pct: { fontSize: 13, fontWeight: '600', color: cores.suave },
});
