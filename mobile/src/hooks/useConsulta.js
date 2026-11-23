import { useCallback, useEffect, useRef, useState } from 'react';
import { mensagemDeErro } from '../api';

/**
 * Executa uma consulta e refaz quando "chave" muda.
 * Respostas fora de ordem (ex.: trocou o filtro no meio) são descartadas.
 */
export function useConsulta(executar, chave) {
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [erro, setErro] = useState(null);
  const pedido = useRef(0);
  const executarRef = useRef(executar);
  executarRef.current = executar;

  const carregar = useCallback(async (puxou = false) => {
    const meu = ++pedido.current;
    puxou ? setAtualizando(true) : setCarregando(true);
    setErro(null);
    try {
      const { data } = await executarRef.current();
      if (meu === pedido.current) setDados(data);
    } catch (err) {
      if (meu === pedido.current) {
        setErro(err?.response?.status === 403 ? 'Seu perfil não tem acesso a estes dados.' : mensagemDeErro(err));
      }
    } finally {
      if (meu === pedido.current) {
        setCarregando(false);
        setAtualizando(false);
      }
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar, chave]);

  return { dados, carregando, atualizando, erro, recarregar: () => carregar(true) };
}
