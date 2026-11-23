import { router } from 'expo-router';
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

/** tipo: 'mix' | 'clientes' | 'ruptura' | 'pre-venda' */
export function abrirDetalhe(tipo, { vendedores, escopo }) {
  router.push({ pathname: `/${tipo}`, params: { vendedores: csv(vendedores), escopo } });
}

export function abrirVendedor(cod) {
  router.push({ pathname: '/vendedor/[cod]', params: { cod: String(cod) } });
}
