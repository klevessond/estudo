import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import api, { mensagemDeErro } from '../../api';
import { useAuth } from '../../contexts/auth';
import { IndicadorLinha } from '../../components/IndicadorLinha';
import { Segmentado } from '../../components/Segmentado';
import { Botao } from '../../components/Botao';
import { criarPeriodo, OPCOES_PERIODO } from '../../lib/periodos';
import {
  extrairAlocacao,
  extrairEvolucao,
  extrairProjecao,
  extrairResumo,
  extrairRuptura,
} from '../../lib/indicadores';
import { BlocoAlocacao, BlocoEvolucao, BlocoProjecao, BlocoRuptura } from '../../components/Blocos';
import { dataCurta, percentual } from '../../lib/format';
import { cores } from '../../theme';

export default function Indicadores() {
  const { me, ehGerente, ehSupervisor, codFuncionario } = useAuth();
  const lidera = ehGerente || ehSupervisor;

  const [chavePeriodo, setChavePeriodo] = useState('mes_atual');
  const [visao, setVisao] = useState(lidera ? 'equipe' : 'individual');
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [erro, setErro] = useState(null);
  const pedidoAtual = useRef(0);

  const periodo = useMemo(() => criarPeriodo(chavePeriodo), [chavePeriodo]);

  const buscar = useCallback(
    async (puxou = false) => {
      const meuPedido = ++pedidoAtual.current; // ignora respostas de um período antigo
      puxou ? setAtualizando(true) : setCarregando(true);
      setErro(null);
      try {
        const { data } = await api.get('/Indicadores/', { params: { de: periodo.de, ate: periodo.ate } });
        if (meuPedido === pedidoAtual.current) setDados(data);
      } catch (err) {
        if (meuPedido === pedidoAtual.current) setErro(mensagemDeErro(err));
      } finally {
        if (meuPedido === pedidoAtual.current) {
          setCarregando(false);
          setAtualizando(false);
        }
      }
    },
    [periodo]
  );

  useEffect(() => {
    buscar();
  }, [buscar]);

  const painel = useMemo(() => {
    if (!dados) return null;
    const opc = { visao, codFuncionario };
    const ehMesAtual = periodo.chave === 'mes_atual';
    const projecao = ehMesAtual ? extrairProjecao(dados, opc) : null;
    // Dias úteis do backend (já com feriados) quando disponíveis; senão, dias corridos.
    const esperado = projecao?.dias ? projecao.dias.decorridos / projecao.dias.totais : periodo.esperado;
    return {
      resumo: extrairResumo(dados, opc),
      projecao,
      esperado,
      alocacao: extrairAlocacao(dados, opc),
      evolucao: extrairEvolucao(dados, opc),
      ruptura: extrairRuptura(dados, opc),
    };
  }, [dados, visao, codFuncionario, periodo]);
  const resumo = painel?.resumo;
  const temVisaoIndividual = !!dados?.minha_visao;

  return (
    <ScrollView
      contentContainerStyle={s.conteudo}
      refreshControl={<RefreshControl refreshing={atualizando} onRefresh={() => buscar(true)} tintColor={cores.marca} />}
    >
      <Text style={s.ola}>Olá, {me?.first_name || me?.username}</Text>
      <Text style={s.intervalo}>
        {periodo.de === periodo.ate ? dataCurta(periodo.de) : `${dataCurta(periodo.de)} a ${dataCurta(periodo.ate)}`}
      </Text>

      <View style={s.controles}>
        <Segmentado
          opcoes={OPCOES_PERIODO.map((c) => ({ valor: c, rotulo: criarPeriodo(c).rotulo }))}
          valor={chavePeriodo}
          aoMudar={setChavePeriodo}
        />
        {lidera && temVisaoIndividual && (
          <View style={{ marginTop: 8 }}>
            <Segmentado
              opcoes={[
                { valor: 'equipe', rotulo: ehGerente ? 'Empresa' : 'Equipe' },
                { valor: 'individual', rotulo: 'Só eu' },
              ]}
              valor={visao}
              aoMudar={setVisao}
            />
          </View>
        )}
      </View>

      {carregando && !dados ? (
        <View style={s.estado}>
          <ActivityIndicator size="large" color={cores.marca} />
          <Text style={s.estadoTexto}>Calculando indicadores… pode levar alguns segundos.</Text>
        </View>
      ) : erro && !dados ? (
        <View style={s.estado}>
          <Text style={s.erroTitulo}>Não foi possível carregar</Text>
          <Text style={s.estadoTexto}>{erro}</Text>
          <View style={{ alignSelf: 'stretch', marginTop: 16 }}>
            <Botao titulo="Tentar de novo" aoTocar={() => buscar()} />
          </View>
        </View>
      ) : resumo ? (
        <>
          {carregando && <ActivityIndicator color={cores.marca} style={{ marginBottom: 8 }} />}
          <Text style={s.escopo}>{resumo.escopo}</Text>
          <View style={s.painel}>
            {resumo.itens.map((item, i) => (
              <IndicadorLinha
                key={item.chave}
                item={item}
                esperado={painel.esperado}
                ultimo={i === resumo.itens.length - 1}
              />
            ))}
          </View>

          {painel.esperado != null && painel.esperado < 1 && (
            <Text style={s.legenda}>
              Traço escuro: meta. Traço dourado: onde você deveria estar hoje ({percentual(painel.esperado * 100, 0)} do
              mês).
            </Text>
          )}

          <BlocoProjecao projecao={painel.projecao} />
          <BlocoAlocacao alocacao={painel.alocacao} />
          <BlocoEvolucao evolucao={painel.evolucao} />
          <BlocoRuptura ruptura={painel.ruptura} />
        </>
      ) : null}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  conteudo: { padding: 16, paddingBottom: 40 },
  ola: { fontSize: 24, fontWeight: '800', color: cores.tinta, letterSpacing: -0.3 },
  intervalo: { fontSize: 14, color: cores.suave, marginTop: 2 },
  controles: { marginTop: 16, marginBottom: 18 },
  escopo: { fontSize: 13, fontWeight: '600', color: cores.suave, marginBottom: 8, marginLeft: 4 },
  painel: { backgroundColor: cores.superficie, borderRadius: 14 },
  legenda: { fontSize: 12, color: cores.suave, marginTop: 10, marginHorizontal: 4, lineHeight: 17 },
  estado: { alignItems: 'center', paddingVertical: 48, paddingHorizontal: 12 },
  estadoTexto: { color: cores.suave, fontSize: 15, textAlign: 'center', marginTop: 12, lineHeight: 21 },
  erroTitulo: { fontSize: 18, fontWeight: '700', color: cores.tinta },
});
