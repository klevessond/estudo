import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePainel } from '../../contexts/painel';
import { useAuth } from '../../contexts/auth';
import { useNavegar } from '../../lib/navegar';
import { nomeCompleto, ordenarVendedores } from '../../lib/vendedores';
import { statusDe } from '../../lib/indicadores';
import { criarPeriodo, OPCOES_PERIODO } from '../../lib/periodos';
import { moeda, numero, percentual } from '../../lib/format';
import { Segmentado } from '../../components/Segmentado';
import { Barra, Busca, EstadoTela, contem } from '../../components/Lista';
import { cores, numeros } from '../../theme';

const COR = { ok: cores.ok, atencao: cores.atencao, ruim: cores.ruim, neutro: cores.marca };

export default function Equipe() {
  const { codFuncionario } = useAuth();
  const { abrirVendedor } = useNavegar();
  const { vendedores, esperado, carregando, atualizando, erro, buscar, chavePeriodo, setChavePeriodo, dados } =
    usePainel();
  const [ordem, setOrdem] = useState('cobertura');
  const [busca, setBusca] = useState('');

  const lista = useMemo(
    () => ordenarVendedores(vendedores, ordem).filter((v) => !busca || contem(v.nome, busca)),
    [vendedores, ordem, busca]
  );

  const noRitmo = vendedores.filter((v) => v.objetivo > 0 && statusDe(v.cobertura, esperado) === 'ok').length;
  const comMeta = vendedores.filter((v) => v.objetivo > 0).length;

  return (
    <FlatList
      data={!dados ? [] : lista}
      keyExtractor={(v) => String(v.cod)}
      contentContainerStyle={{ paddingBottom: 32 }}
      refreshControl={<RefreshControl refreshing={atualizando} onRefresh={() => buscar(true)} tintColor={cores.marca} />}
      keyboardShouldPersistTaps="handled"
      ListHeaderComponent={
        <View style={s.cabecalho}>
          <Segmentado
            opcoes={OPCOES_PERIODO.map((c) => ({ valor: c, rotulo: criarPeriodo(c).rotulo }))}
            valor={chavePeriodo}
            aoMudar={setChavePeriodo}
          />
          <Segmentado
            opcoes={[
              { valor: 'cobertura', rotulo: '% da meta' },
              { valor: 'faturado', rotulo: 'Faturado' },
              { valor: 'nome', rotulo: 'Nome' },
            ]}
            valor={ordem}
            aoMudar={setOrdem}
          />
          <Busca valor={busca} aoMudar={setBusca} placeholder="Buscar vendedor" />
          {dados && comMeta > 0 ? (
            <Text style={s.resumo}>
              {esperado != null && esperado < 1
                ? `${numero(noRitmo)} de ${numero(comMeta)} vendedores no ritmo da meta de faturamento`
                : `${numero(noRitmo)} de ${numero(comMeta)} vendedores bateram a meta de faturamento`}
            </Text>
          ) : null}
          {carregando && dados ? <Text style={s.resumo}>Atualizando…</Text> : null}
        </View>
      }
      ListEmptyComponent={
        <EstadoTela
          carregando={carregando && !dados}
          erro={!dados ? erro : null}
          aoTentar={() => buscar()}
          textoCarregando="Calculando indicadores… pode levar alguns segundos."
          vazio
          textoVazio={busca ? 'Nenhum vendedor com esse nome.' : 'Nenhum vendedor com meta ou movimento no período.'}
        />
      }
      renderItem={({ item: v }) => {
        const semMeta = v.objetivo <= 0;
        const cor = semMeta ? cores.suave : COR[statusDe(v.cobertura, esperado)];
        const souEu = String(v.cod) === String(codFuncionario);
        return (
          <Pressable
            onPress={() => abrirVendedor(v.cod)}
            style={({ pressed }) => [s.item, pressed && { backgroundColor: cores.trilho }]}
            accessibilityRole="button"
            accessibilityLabel={`${nomeCompleto(v.nome)}, ${semMeta ? 'sem meta' : `${Math.round(v.cobertura)}% da meta`}`}
          >
            <View style={{ flex: 1 }}>
              <View style={s.topo}>
                <Text style={s.nome} numberOfLines={1}>
                  {nomeCompleto(v.nome)}
                  {souEu ? <Text style={s.voce}>  você</Text> : null}
                </Text>
                <Text style={[s.pct, numeros, { color: cor }]}>{semMeta ? 'sem meta' : percentual(v.cobertura, 0)}</Text>
              </View>
              {!semMeta && <Barra percentual={v.cobertura} cor={cor} />}
              <View style={s.linha}>
                <Text style={[s.valor, numeros]}>
                  {moeda(v.faturado)}
                  {!semMeta && <Text style={s.meta}> de {moeda(v.objetivo)}</Text>}
                </Text>
              </View>
              <Text style={[s.meta, numeros]}>
                Pré-venda {moeda(v.preVenda)}, mix {numero(v.mix)}
                {v.ruptura > 0 ? `, ruptura ${moeda(v.ruptura)}` : ''}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={cores.suave} />
          </Pressable>
        );
      }}
    />
  );
}

const s = StyleSheet.create({
  cabecalho: { padding: 16, gap: 10 },
  resumo: { fontSize: 13, color: cores.suave },
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
  topo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 },
  nome: { flex: 1, fontSize: 16, fontWeight: '700', color: cores.tinta },
  voce: { fontSize: 13, fontWeight: '600', color: cores.marca },
  pct: { fontSize: 18, fontWeight: '800' },
  linha: { flexDirection: 'row', marginTop: 6 },
  valor: { fontSize: 15, fontWeight: '600', color: cores.tinta },
  meta: { fontSize: 13, fontWeight: '400', color: cores.suave, marginTop: 2 },
});
