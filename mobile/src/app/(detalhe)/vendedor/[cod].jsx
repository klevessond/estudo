import React, { useMemo } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../../contexts/auth';
import { usePainel } from '../../../contexts/painel';
import { lerTexto, abrirDetalhe } from '../../../lib/navegar';
import { nomeCompleto, podeVerComissoes, resumoDoVendedor } from '../../../lib/vendedores';
import { moeda, percentual } from '../../../lib/format';
import { IndicadorLinha } from '../../../components/IndicadorLinha';
import { BlocoProjecao } from '../../../components/Blocos';
import { Segmentos } from '../../../components/Segmentos';
import { Bloco, EstadoTela, LinhaLink, TituloSecao } from '../../../components/Lista';
import { cores, numeros } from '../../../theme';

export default function Vendedor() {
  const params = useLocalSearchParams();
  const cod = Number(lerTexto(params.cod));
  const { me } = useAuth();
  const { dados, periodo, esperado, carregando, atualizando, erro, buscar } = usePainel();

  const v = useMemo(() => (dados ? resumoDoVendedor(dados, cod) : null), [dados, cod]);
  const nome = v ? nomeCompleto(v.nome) : '';
  const vendedores = [cod];
  const abrir = (tipo) => abrirDetalhe(tipo, { vendedores, escopo: nome });
  const comissoes = podeVerComissoes(me, cod);
  const mesAtual = periodo.chave === 'mes_atual';

  return (
    <>
      <Stack.Screen options={{ title: v?.curto || 'Vendedor' }} />
      <ScrollView
        contentContainerStyle={s.conteudo}
        refreshControl={<RefreshControl refreshing={atualizando} onRefresh={() => buscar(true)} tintColor={cores.marca} />}
      >
        {!v ? (
          <EstadoTela
            carregando={carregando}
            erro={erro}
            aoTentar={() => buscar()}
            vazio
            textoVazio="Este vendedor não tem meta nem movimento no período escolhido."
          />
        ) : (
          <>
            <Text style={s.nome}>{nome}</Text>
            <Text style={s.sub}>
              Código {cod}
              {v.objetivo > 0 ? `, ${percentual(v.cobertura)} da meta de faturamento` : ''}
            </Text>

            <View style={[s.painel, { marginTop: 16 }]}>
              {v.itens.map((item, i) => (
                <IndicadorLinha
                  key={item.chave}
                  item={item}
                  esperado={esperado}
                  ultimo={i === v.itens.length - 1}
                  aoTocar={
                    item.chave === 'mix' ? () => abrir('mix') : item.chave === 'positivacao' ? () => abrir('clientes') : undefined
                  }
                  dicaToque={item.chave === 'mix' ? 'Ver produtos' : item.chave === 'positivacao' ? 'Ver clientes' : undefined}
                />
              ))}
            </View>

            {mesAtual && <BlocoProjecao projecao={v.projecao} />}

            <TituloSecao>Detalhar</TituloSecao>
            <Bloco>
              <LinhaLink
                icone="document-text-outline"
                titulo="Pré-venda"
                detalhe={`Alocado ${moeda(v.alocado)}`}
                valor={moeda(v.preVenda)}
                aoTocar={() => abrir('pre-venda')}
              />
              <LinhaLink
                icone="alert-circle-outline"
                titulo="Ruptura por item"
                valor={moeda(v.ruptura)}
                corValor={v.ruptura > 0 ? cores.ruim : undefined}
                aoTocar={() => abrir('ruptura')}
              />
              <LinhaLink icone="cube-outline" titulo="Itens do mix" aoTocar={() => abrir('mix')} />
              <LinhaLink
                icone="people-outline"
                titulo="Clientes positivados"
                aoTocar={() => abrir('clientes')}
                ultimo={!comissoes}
              />
              {comissoes && (
                <LinhaLink
                  icone="cash-outline"
                  titulo="Comissões"
                  aoTocar={() =>
                    router.push({ pathname: '/comissoes', params: { cod: String(cod), nome } })
                  }
                  ultimo
                />
              )}
            </Bloco>

            <TituloSecao>Clientes por segmento</TituloSecao>
            <Segmentos vendedores={vendedores} />

            <Text style={[s.rodape, numeros]}>Números de rotas, sem PDV.</Text>
          </>
        )}
      </ScrollView>
    </>
  );
}

const s = StyleSheet.create({
  conteudo: { padding: 16, paddingBottom: 40 },
  nome: { fontSize: 24, fontWeight: '800', color: cores.tinta, letterSpacing: -0.3 },
  sub: { fontSize: 14, color: cores.suave, marginTop: 2 },
  painel: { backgroundColor: cores.superficie, borderRadius: 14 },
  rodape: { fontSize: 12, color: cores.suave, marginTop: 16, marginLeft: 4 },
});
