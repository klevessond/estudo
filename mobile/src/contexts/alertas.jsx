import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState, Linking, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import api from '../api';
import { storage } from '../lib/storage';
import { useAuth } from './auth';

// Mostra o banner mesmo com o app aberto.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const INTERVALO_MS = 60 * 1000;

const AlertasCtx = createContext(null);
export const useAlertas = () => useContext(AlertasCtx);

async function avisarNoCelular(novos) {
  const conteudo =
    novos.length === 1
      ? { title: novos[0].titulo, body: novos[0].mensagem }
      : {
          title: `${novos.length} novas rupturas`,
          body:
            novos
              .slice(0, 3)
              .map((a) => a.dados?.cliente || a.titulo)
              .join(', ') + (novos.length > 3 ? '…' : ''),
        };

  // trigger: null = notificação LOCAL imediata. Funciona no Expo Go.
  await Notifications.scheduleNotificationAsync({
    content: { ...conteudo, data: { rota: '/alertas' } },
    trigger: null,
  });
}

export function AlertasProvider({ children }) {
  const { me, logado } = useAuth();
  const [naoLidos, setNaoLidos] = useState(0);
  const [permissao, setPermissao] = useState('undetermined');
  const ultimoIdRef = useRef(null);
  const chave = me?.id ? `alertas_ultimo_id_${me.id}` : null;

  // Troca de usuário: esquece o último id visto.
  useEffect(() => {
    ultimoIdRef.current = null;
    if (!logado) setNaoLidos(0);
  }, [chave, logado]);

  const pedirPermissao = useCallback(async () => {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Alertas de ruptura',
        importance: Notifications.AndroidImportance.HIGH,
      });
    }
    const atual = await Notifications.getPermissionsAsync();
    let status = atual.status;
    if (status !== 'granted') {
      if (atual.canAskAgain) {
        status = (await Notifications.requestPermissionsAsync()).status;
      } else {
        Linking.openSettings();
      }
    }
    setPermissao(status);
    return status;
  }, []);

  useEffect(() => {
    if (logado) pedirPermissao();
  }, [logado, pedirPermissao]);

  const verificar = useCallback(async () => {
    if (!logado || !chave) return;
    try {
      if (ultimoIdRef.current === null) {
        ultimoIdRef.current = Number((await storage.get(chave)) || 0);
      }
      const desde = ultimoIdRef.current;
      const { data } = await api.get('/alertas/', { params: { apos_id: desde, limite: 20 } });
      setNaoLidos(Number(data?.nao_lidos || 0));

      const novos = data?.results || [];
      if (!novos.length) return;

      // Na primeira consulta (desde = 0) só registra o ponto de partida,
      // para não despejar o histórico inteiro como notificação.
      if (desde > 0) await avisarNoCelular(novos);

      const maior = Math.max(...novos.map((a) => a.id));
      ultimoIdRef.current = maior;
      await storage.set(chave, maior);
    } catch {
      // Sem rede ou servidor fora: a próxima rodada tenta de novo.
    }
  }, [logado, chave]);

  // Consulta ao abrir, ao voltar para o app e a cada minuto enquanto ele está aberto.
  useEffect(() => {
    if (!logado) return undefined;
    verificar();
    let timer = setInterval(verificar, INTERVALO_MS);
    const sub = AppState.addEventListener('change', (estado) => {
      clearInterval(timer);
      if (estado === 'active') {
        verificar();
        timer = setInterval(verificar, INTERVALO_MS);
      }
    });
    return () => {
      clearInterval(timer);
      sub.remove();
    };
  }, [logado, verificar]);

  // Tocar na notificação abre a aba de alertas.
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((resp) => {
      const rota = resp?.notification?.request?.content?.data?.rota;
      if (rota) router.push(rota);
    });
    return () => sub.remove();
  }, []);

  const valor = useMemo(
    () => ({ naoLidos, setNaoLidos, verificar, permissao, pedirPermissao }),
    [naoLidos, verificar, permissao, pedirPermissao]
  );

  return <AlertasCtx.Provider value={valor}>{children}</AlertasCtx.Provider>;
}
