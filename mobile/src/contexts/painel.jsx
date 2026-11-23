import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import api, { mensagemDeErro } from '../api';
import { useAuth } from './auth';
import { criarPeriodo } from '../lib/periodos';
import { esperadoDoPeriodo } from '../lib/indicadores';
import { linhasDeVendedores } from '../lib/vendedores';

// Período escolhido + o /api/Indicadores/ dele, compartilhados pela tela inicial,
// pela lista de vendedores e pelo detalhe de cada vendedor (um só carregamento).
const PainelCtx = createContext(null);
export const usePainel = () => useContext(PainelCtx);

export function PainelProvider({ children }) {
  const { logado, ehGerente, ehSupervisor, codFuncionario } = useAuth();
  const lidera = ehGerente || ehSupervisor;

  const [chavePeriodo, setChavePeriodo] = useState('mes_atual');
  const [visao, setVisao] = useState(lidera ? 'equipe' : 'individual');
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [erro, setErro] = useState(null);
  const pedidoAtual = useRef(0);

  const periodo = useMemo(() => criarPeriodo(chavePeriodo), [chavePeriodo]);

  // Troca de usuário: volta ao padrão do novo perfil e descarta os dados do anterior.
  useEffect(() => {
    setVisao(lidera ? 'equipe' : 'individual');
    setDados(null);
  }, [codFuncionario, lidera]);

  const buscar = useCallback(
    async (puxou = false) => {
      if (!logado) return;
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
    [periodo, logado]
  );

  useEffect(() => {
    buscar();
  }, [buscar]);

  const derivados = useMemo(() => {
    const vendedores = dados ? linhasDeVendedores(dados) : [];
    // Vendedores do escopo do usuário (o backend já limitou quem vem no payload).
    const escopo = dados?.escopo_rotas?.vendedores_escopo;
    const codsEquipe =
      Array.isArray(escopo) && escopo.length ? escopo.map(Number) : vendedores.map((v) => v.cod);
    const codsDaVisao =
      visao === 'individual' && codFuncionario ? [Number(codFuncionario)] : codsEquipe;
    return {
      vendedores,
      codsDaVisao,
      esperado: dados ? esperadoDoPeriodo(dados, periodo) : periodo.esperado,
    };
  }, [dados, visao, codFuncionario, periodo]);

  const valor = useMemo(
    () => ({
      periodo,
      chavePeriodo,
      setChavePeriodo,
      visao,
      setVisao,
      lidera,
      dados,
      carregando,
      atualizando,
      erro,
      buscar,
      ...derivados,
    }),
    [periodo, chavePeriodo, visao, lidera, dados, carregando, atualizando, erro, buscar, derivados]
  );

  return <PainelCtx.Provider value={valor}>{children}</PainelCtx.Provider>;
}
