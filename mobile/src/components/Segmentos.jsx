import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { usePainel } from '../contexts/painel';
import { useConsulta } from '../hooks/useConsulta';
import { consultas } from '../lib/consultas';
import { linhasDeSegmentos } from '../lib/segmentos';
import { numero, percentual } from '../lib/format';
import { Barra, Bloco, EstadoTela } from './Lista';
import { cores, numeros } from '../theme';

// Substitui as 3 pizzas do web por uma lista de barras (ver lib/segmentos.js).
export function Segmentos({ vendedores }) {
  const { periodo } = usePainel();
  const { dados, carregando, erro, recarregar } = useConsulta(
    () => consultas.segmentos({ de: periodo.de, ate: periodo.ate, vendedores }),
    `${periodo.de}|${periodo.ate}|${(vendedores || []).join(',')}`
  );

  const linhas = useMemo(() => linhasDeSegmentos(dados?.graficos), [dados]);
  const totais = dados?.graficos?.totais;

  if (carregando || erro || !linhas.length) {
    return (
      <Bloco>
        <EstadoTela
          carregando={carregando}
          erro={erro}
          aoTentar={recarregar}
          vazio
          textoVazio="Sem clientes por segmento neste período."
        />
      </Bloco>
    );
  }

  const taxaGeral = totais?.clientes ? (totais.positivacoes / totais.clientes) * 100 : null;

  return (
    <Bloco>
      {taxaGeral != null && (
        <View style={[s.linha, s.divisor]}>
          <Text style={s.geral}>
            <Text style={[s.geralForte, numeros]}>{numero(totais.positivacoes)}</Text> de{' '}
            <Text style={[s.geralForte, numeros]}>{numero(totais.clientes)}</Text> clientes compraram (
            {percentual(taxaGeral, 0)})
          </Text>
        </View>
      )}
      {linhas.map((l, i) => (
        <View
          key={l.segmento}
          style={[s.linha, i < linhas.length - 1 && s.divisor]}
          accessibilityLabel={`${l.segmento}: ${l.positivados} de ${l.clientes} clientes compraram, ${Math.round(l.taxa)}%`}
        >
          <View style={s.topo}>
            <Text style={s.nome} numberOfLines={1}>
              {l.segmento}
            </Text>
            <Text style={[s.taxa, numeros]}>{percentual(l.taxa, 0)}</Text>
          </View>
          <Barra percentual={l.taxa} />
          <Text style={[s.detalhe, numeros]}>
            {numero(l.positivados)} de {numero(l.clientes)} clientes, {percentual(l.fatia, 0)} da carteira
          </Text>
        </View>
      ))}
    </Bloco>
  );
}

const s = StyleSheet.create({
  linha: { paddingHorizontal: 16, paddingVertical: 12 },
  divisor: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: cores.linha },
  geral: { fontSize: 14, color: cores.suave },
  geralForte: { fontWeight: '700', color: cores.tinta },
  topo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 },
  nome: { flex: 1, fontSize: 15, fontWeight: '600', color: cores.tinta },
  taxa: { fontSize: 15, fontWeight: '700', color: cores.tinta },
  detalhe: { fontSize: 13, color: cores.suave, marginTop: 6 },
});
