import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api, { definirAoPerderSessao } from '../api';
import { storage } from '../lib/storage';

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

function papeisDe(me) {
  if (!me) return [];
  const p = me.profile || {};
  const papeis = new Set(Array.isArray(me.roles) ? me.roles : []);
  if (me.is_superuser) papeis.add('admin');
  if (me.is_gerente) papeis.add('gerente');
  if (p.vendedor || me.vendedor) papeis.add('vendedor');
  if (p.supervisor || me.supervisor) papeis.add('supervisor');
  return [...papeis];
}

export function AuthProvider({ children }) {
  const [me, setMe] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [semConexao, setSemConexao] = useState(false);

  const carregarSessao = useCallback(async () => {
    setCarregando(true);
    setSemConexao(false);
    try {
      const token = await storage.get('token');
      if (!token) {
        setMe(null);
        return;
      }
      const { data } = await api.get('/me/');
      setMe(data || null);
    } catch (err) {
      // Sem resposta = sem rede. Mantém o token e oferece "tentar de novo"
      // em vez de deslogar o vendedor que está sem sinal.
      if (!err?.response) setSemConexao(true);
      else setMe(null);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    definirAoPerderSessao(() => setMe(null));
    carregarSessao();
  }, [carregarSessao]);

  const entrar = useCallback(async (username, password) => {
    const { data } = await api.post('/token/', { username, password });
    await storage.set('token', data.access);
    if (data.refresh) await storage.set('refresh', data.refresh);
    const resp = await api.get('/me/');
    setMe(resp.data);
  }, []);

  const sair = useCallback(async () => {
    await storage.del('token');
    await storage.del('refresh');
    setMe(null);
  }, []);

  const valor = useMemo(() => {
    const papeis = papeisDe(me);
    return {
      me,
      papeis,
      logado: !!me,
      carregando,
      semConexao,
      tentarDeNovo: carregarSessao,
      entrar,
      sair,
      ehGerente: papeis.includes('gerente') || papeis.includes('admin'),
      ehSupervisor: papeis.includes('supervisor'),
      codFuncionario: me?.cod_funcionario ?? me?.profile?.cod_funcionario ?? null,
    };
  }, [me, carregando, semConexao, carregarSessao, entrar, sair]);

  return <AuthCtx.Provider value={valor}>{children}</AuthCtx.Provider>;
}
