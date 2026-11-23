import { useMemo } from 'react';
import { useRouter } from 'expo-router';
import { csv } from './consultas';

/** Parâmetros de rota chegam como texto: "10,20" -> [10, 20]. */
export function lerCods(param) {
  return String(Array.isArray(param) ? param[0] : param || '')
    .split(',')
    .map((x) => Number(x.trim()))
    .filter((n) => Number.isFinite(n) && n > 0);
}

export function lerTexto(param) {
  return String(Array.isArray(param) ? param[0] : param ?? '');
}

/**
 * Atalhos de navegação. Usa useRouter() (Expo Router 58 desaconselha o `router`
 * global, que lança erro se for chamado antes da primeira renderização).
 */
export function useNavegar() {
  const router = useRouter();
  return useMemo(
    () => ({
      router,
      /** tipo: 'mix' | 'clientes' | 'ruptura' | 'pre-venda' */
      abrirDetalhe: (tipo, { vendedores, escopo }) =>
        router.push({ pathname: `/${tipo}`, params: { vendedores: csv(vendedores), escopo } }),
      abrirVendedor: (cod) => router.push({ pathname: '/vendedor/[cod]', params: { cod: String(cod) } }),
    }),
    [router]
  );
}
