// IndicativosTabelaVendedor.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';

import api from '../../api';
import './IndicativosTabelaVendedor.css';

const dlog = (...args) => console.debug('[IndicativosTabelaVendedor]', ...args);

/**
 * Props
 * - periodoSelecionado: { de, ate }
 * - onSelecionarColaborador: fn(row)
 * - onDadosAtualizados: fn(tabela)
 * - onObjetivosRecebidos: fn(objVetores)
 * - objetivosVendedores: [{ codFuncionario, objetivo_financeiro, ... }]
 * - usarPDV: boolean
 * - pdvPorVendedor: Array<{ codFuncionario: number|string, valor?: number, peso?: number }>
 */

const IndicativosTabelaVendedor = ({
  periodoSelecionado,
  onSelecionarColaborador,
  onDadosAtualizados,
  onObjetivosRecebidos,
  objetivosVendedores = [],
  usarPDV = false,
  pdvPorVendedor = [],
  vendedoresPermitidosTabela = [],
  isPdvLoading = false,
   modoKPI = 'financeiro',
}) => {
  const [globalFilter, setGlobalFilter] = useState('');
  const [baseData, setBaseData] = useState([]); // dados crus vindos da API
  const [data, setData] = useState([]);         // dados enriquecidos (com PDV somado quando ativo)
  const [baseDataAll, setBaseDataAll] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Guarda a assinatura do último payload emitido ao pai
  const lastEmittedSigRef = useRef('');

  // LOG: entrada de props relevantes
  useEffect(() => {
    dlog('props -> periodoSelecionado:', periodoSelecionado, 'usarPDV:', usarPDV);
  }, [periodoSelecionado, usarPDV]);

  useEffect(() => {
    dlog('props -> pdvPorVendedor (len):', Array.isArray(pdvPorVendedor) ? pdvPorVendedor.length : 'N/A');
    if (Array.isArray(pdvPorVendedor)) {
      dlog('props sample pdvPorVendedor (até 5):', pdvPorVendedor.slice(0, 5));
    }
  }, [pdvPorVendedor]);

  // Mapa rápido: codFuncionario -> objetivo_financeiro (número)
  const objetivoFinanceiroMap = useMemo(() => {
    const m = new Map();
    (objetivosVendedores || []).forEach((o) => {
      const id = Number(o.codFuncionario ?? o.vendedor_id);
      const fin = Number(o.objetivo_financeiro || 0);
      if (!Number.isNaN(id)) m.set(id, fin);
    });
    return m;
  }, [objetivosVendedores]);

  // Mapa de PDV por vendedor (codFuncionario -> {valor, peso})
  const pdvMap = useMemo(() => {
    const m = new Map();
    if (!Array.isArray(pdvPorVendedor)) return m;

    for (const item of pdvPorVendedor) {
      const id = Number(item?.codFuncionario);
      if (!Number.isFinite(id)) continue;
      const v = Number(item?.valor || item?.ValorProdutos || 0);
      const p = Number(item?.peso || item?.Peso || 0);
      const prev = m.get(id) || { valor: 0, peso: 0 };
      m.set(id, { valor: prev.valor + v, peso: prev.peso + p });
    }

    // LOG: resumo do mapa PDV
    dlog('pdvMap size:', m.size);
    if (m.size) {
      const amostra = Array.from(m.entries()).slice(0, 5).map(([k, v]) => ({ codFuncionario: k, ...v }));
      dlog('pdvMap sample (até 5):', amostra);
    }
    return m;
  }, [pdvPorVendedor]);

  // ✅ Filtro do gerente: quando houver lista de vendedores permitidos, limita a base exibida.
// Se estiver vazio, mantém tudo (comportamento atual).
useEffect(() => {
    const permitidos = Array.isArray(vendedoresPermitidosTabela) ? vendedoresPermitidosTabela : [];

    if (!permitidos.length) {
      setBaseData(baseDataAll);
      return;
    }

    const setPermitidos = new Set(permitidos.map((v) => Number(v)));
    const filtrada = (baseDataAll || []).filter((r) => setPermitidos.has(Number(r.codFuncionario)));

    setBaseData(filtrada);
  }, [vendedoresPermitidosTabela, baseDataAll]);


  // 1) Busca a lista de vendas por vendedor (apenas quando o período muda)
  useEffect(() => {
    const fetchData = async () => {
      if (!periodoSelecionado?.de || !periodoSelecionado?.ate) return;
      setIsLoading(true);
      try {
        const url = `/vendas-por-vendedor/?de=${periodoSelecionado.de}&ate=${periodoSelecionado.ate}`;
        const { data: json } = await api.get(url);
        dlog('valor recebido de vendas-por-vendedor:', json);

        const rows = Array.isArray(json?.resultado?.vendas_por_vendedor)
          ? json.resultado.vendas_por_vendedor
          : [];

        // Monta a base (não mexe no nome)
        const tabelaBase = rows.map((vendedor) => ({
          colaborador: (vendedor.Campo || '').trim(),
          codFuncionario: Number(vendedor.codcampo),
          faturado: Number(vendedor.ValorLiquido || 0),
          aFaturar: Number(vendedor['pre-venda'] || 0),
          alocado: Number(vendedor.alocado ?? vendedor.ValorLiquido ?? 0),
          pesototalvendido: Number(vendedor.PesoTotal || 0),
          qtdClientes: Number(vendedor.QtdClientes || 0),
          mix: Number(vendedor.Mix || 0),
          mix_pdv: Number(vendedor.mix_pdv_realizado || 0),
        }));

        setBaseDataAll(tabelaBase);

        // LOG: base carregada
        dlog('baseData carregada (len):', tabelaBase.length);
        dlog('baseData sample (até 5):', tabelaBase.slice(0, 5));
        const idsBase = tabelaBase.map((r) => r.codFuncionario).filter((x) => Number.isFinite(x));
        dlog('codFuncionarios na base (até 10):', idsBase.slice(0, 10));
      } catch (error) {
        console.error('[IndicativosTabelaVendedor] Erro ao buscar /vendas-por-vendedor:', error);
      }
       finally {
    setIsLoading(false);
  }
    };

    fetchData();
  }, [periodoSelecionado]);

  // 2) Enriquecer a base somando PDV (se ativo) e recalculando %/variação
  useEffect(() => {
    if (!Array.isArray(baseData) || baseData.length === 0) {
      setData([]);
      // emite para o pai apenas se mudou de fato
      const emptySig = 'len:0';
      if (lastEmittedSigRef.current !== emptySig) {
        onDadosAtualizados?.([]);
        lastEmittedSigRef.current = emptySig;
      } else {
        dlog('onDadosAtualizados SKIPPED (assinatura vazia igual)');
      }
      return;
    }

    let vendedoresComPDV = 0;
    const enriched = baseData.map((row) => {
      const objetivo = Number(objetivoFinanceiroMap.get(row.codFuncionario) || 0);

      // Valores originais
      let faturado = Number(row.faturado || 0);
      let alocado = Number(row.alocado || 0);
      let peso = Number(row.pesototalvendido || 0);

      // Soma PDV nessa linha se estiver ativo e se houver PDV para esse vendedor
      if (usarPDV && pdvMap.has(row.codFuncionario)) {
        const { valor: pdvValor = 0, peso: pdvPeso = 0 } = pdvMap.get(row.codFuncionario) || {};
        faturado += pdvValor;
        alocado += pdvValor;
        peso += pdvPeso;
        vendedoresComPDV += 1;

        // LOG por linha (apenas quando somou)
        dlog(
          'Somando PDV → codFuncionario:',
          row.codFuncionario,
          '| vendedor:',
          row.colaborador,
          '| +valor:',
          pdvValor,
          '| +peso:',
          pdvPeso
        );
      } else if (usarPDV) {
        // LOG de ausência de match
        dlog('Sem PDV p/ codFuncionario:', row.codFuncionario, '| vendedor:', row.colaborador);
      }

      // Calcula % e variação contra o objetivo individual
      const percVenda = objetivo > 0 ? (faturado / objetivo) * 100 : 0;
      const variacao = faturado - objetivo;
      // Mix: PDV substitui o tradicional quando ativo e existe valor
      const mix = (usarPDV && row.mix_pdv > 0) ? row.mix_pdv : row.mix;

      return {
        ...row,
        objetivoFinanceiro: objetivo,
        faturado,
        alocado,
        pesototalvendido: peso,
         mix,     
        percVenda,
        variacao,
      };
    });

    dlog('Resumo enriquecimento → usarPDV:', usarPDV, '| vendedoresComPDV:', vendedoresComPDV, '/', baseData.length);

    setData(enriched);

    // ---- Proteção contra loop: só emite se mudou de verdade ----
    const sig =
      'len:' +
      enriched.length +
      '|' +
      enriched
        .slice(0, 12)
        .map(
          (r) =>
            `${r.codFuncionario ?? 'x'}:${Number(r.faturado || 0).toFixed(2)}:${Number(
              r.pesototalvendido || 0
            ).toFixed(3)}`
        )
        .join(',');

    if (sig !== lastEmittedSigRef.current) {
      onDadosAtualizados?.(enriched);
      lastEmittedSigRef.current = sig;
    } else {
      dlog('onDadosAtualizados SKIPPED (assinatura igual)');
    }
  }, [baseData, objetivoFinanceiroMap, usarPDV, pdvMap, onDadosAtualizados]);

  // Colunas da tabela — ordem: Nome, Objetivo, Faturado, A Faturar, Alocado, Cobertura, Variação, Mix
const columns = useMemo(() => {
  // ── Coluna Colaborador — idêntica ao original ──────────────────
  const colColaborador = {
    accessorKey: 'colaborador',
    header: 'Colaborador',
    cell: (info) => {
      const full = String(info.getValue() ?? '').trim();
      if (!full) return '';
      const parts = full.split(/\s+/);
      if (parts[0].toUpperCase() === 'FILIAL' && parts.length > 1) return parts[1];
      return parts[0];
    },
  };

  // ── Coluna Mix — idêntica ao original ──────────────────────────
  const colMix = {
    accessorKey: 'mix',
    header: 'Mix (Qtd. Produtos)',
    cell: (info) => {
      const temMixPDV = usarPDV && info.row.original.mix_pdv > 0;
      return (
        <span style={{ fontWeight: 600 }}>
          {Number(info.getValue() || 0)} itens
          {temMixPDV && (
            <span style={{ fontSize: '10px', color: '#1e88e5', marginLeft: 4 }}>
              ● PDV
            </span>
          )}
        </span>
      );
    },
  };

  // ── Helper de % cobertura colorido ─────────────────────────────
  const badgePerc = (v) => {
    const cls = v < 25 ? 'perc-lt25' : v < 50 ? 'perc-lt50' : v < 75 ? 'perc-lt75' : 'perc-gte100';
    return <span className={`badge ${cls}`}>{Number(v).toFixed(1)}%</span>;
  };

  const objMap = new Map(
    (objetivosVendedores || []).map(o => [
      String(o.vendedor_id ?? o.codFuncionario),
      o,
    ])
  );
  const getObj = (row) => objMap.get(String(row.codFuncionario)) || {};

  // ── MODO FINANCEIRO — idêntico ao original ─────────────────────
  if (!modoKPI || modoKPI === 'financeiro') {
    return [
      colColaborador,
      {
        accessorKey: 'objetivoFinanceiro',
        header: 'Objetivo R$',
        cell: (info) => Number(info.getValue() || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        sortingFn: 'auto',
      },
      {
        accessorKey: 'faturado',
        header: () => (
          <span>
            Faturado R$
            {isPdvLoading && usarPDV && <span className="badge-pdv-loading">+PDV</span>}
          </span>
        ),
        cell: (info) => (
          <span style={{ fontWeight: 600 }}>
            {Number(info.getValue() || 0).toLocaleString('pt-BR')}
          </span>
        ),
      },
      {
        accessorKey: 'aFaturar',
        header: 'A Faturar R$',
        cell: (info) => Number(info.getValue() || 0).toLocaleString('pt-BR'),
      },
      {
        accessorKey: 'alocado',
        header: () => (
          <span>
            Alocado R$
            {isPdvLoading && usarPDV && <span className="badge-pdv-loading">+PDV</span>}
          </span>
        ),
        cell: (info) => Number(info.getValue() || 0).toLocaleString('pt-BR'),
      },
      {
        accessorKey: 'percVenda',
        header: '% Cobertura',
        cell: (info) => badgePerc(Number(info.getValue() || 0)),
      },
      {
        accessorKey: 'variacao',
        header: 'Variação R$',
        cell: (info) => {
          const v = Number(info.getValue() || 0);
          return <span className={`badge ${v < 0 ? 'var-neg' : 'var-pos'}`}>{v.toLocaleString('pt-BR')}</span>;
        },
      },
      colMix,
    ];
  }

  // ── MODO POSITIVAÇÃO ───────────────────────────────────────────
  if (modoKPI === 'positivacao') {
    return [
      colColaborador,
      {
        id: 'objPos',
        header: 'Objetivo Pos.',
        cell: ({ row }) => {
          const obj = getObj(row.original);
          return <span>{Number(obj.objetivo_positivacao || 0)} clientes</span>;
        },
      },
      {
        accessorKey: 'qtdClientes',
        header: 'Positivados',
        cell: (info) => <span style={{ fontWeight: 600 }}>{Number(info.getValue() || 0)} clientes</span>,
      },
      {
        id: 'percPos',
        header: '% Cobertura',
        cell: ({ row }) => {
          const obj = getObj(row.original);
          const pct = obj.objetivo_positivacao > 0
            ? (Number(row.original.qtdClientes || 0) / obj.objetivo_positivacao) * 100
            : 0;
          return badgePerc(pct);
        },
      },
      {
        id: 'varPos',
        header: 'Variação',
        cell: ({ row }) => {
          const obj = getObj(row.original);
          const v = Number(row.original.qtdClientes || 0) - Number(obj.objetivo_positivacao || 0);
          return <span className={`badge ${v < 0 ? 'var-neg' : 'var-pos'}`}>{v}</span>;
        },
      },
      colMix,
    ];
  }

  // ── MODO PESO ──────────────────────────────────────────────────
  if (modoKPI === 'peso') {
    return [
      colColaborador,
      {
        id: 'objPeso',
        header: 'Objetivo Kg',
        cell: ({ row }) => {
          const obj = getObj(row.original);
          return <span>{Number(obj.objetivo_peso || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} kg</span>;
        },
      },
      {
        accessorKey: 'pesototalvendido',
        header: 'Peso Vendido',
        cell: (info) => (
          <span style={{ fontWeight: 600 }}>
            {Number(info.getValue() || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} kg
          </span>
        ),
      },
      {
        id: 'percPeso',
        header: '% Cobertura',
        cell: ({ row }) => {
          const obj = getObj(row.original);
          const pct = obj.objetivo_peso > 0
            ? (Number(row.original.pesototalvendido || 0) / obj.objetivo_peso) * 100
            : 0;
          return badgePerc(pct);
        },
      },
      {
        id: 'varPeso',
        header: 'Variação Kg',
        cell: ({ row }) => {
          const obj = getObj(row.original);
          const v = Number(row.original.pesototalvendido || 0) - Number(obj.objetivo_peso || 0);
          return <span className={`badge ${v < 0 ? 'var-neg' : 'var-pos'}`}>{v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>;
        },
      },
      colMix,
    ];
  }

  // ── MODO MIX ───────────────────────────────────────────────────
  if (modoKPI === 'mix') {
    return [
      colColaborador,
      {
        id: 'objMix',
        header: 'Objetivo Mix',
        cell: ({ row }) => {
          const obj = getObj(row.original);
          return <span>{Number(obj.objetivo_mix || 0)} itens</span>;
        },
      },
      colMix,
      {
        id: 'percMix',
        header: '% Cobertura',
        cell: ({ row }) => {
          const obj = getObj(row.original);
          const pct = obj.objetivo_mix > 0
            ? (Number(row.original.mix || 0) / obj.objetivo_mix) * 100
            : 0;
          return badgePerc(pct);
        },
      },
      {
        id: 'varMix',
        header: 'Variação',
        cell: ({ row }) => {
          const obj = getObj(row.original);
          const v = Number(row.original.mix || 0) - Number(obj.objetivo_mix || 0);
          return <span className={`badge ${v < 0 ? 'var-neg' : 'var-pos'}`}>{v} itens</span>;
        },
      },
    ];
  }

  return [colColaborador, colMix]; // fallback
}, [modoKPI, isPdvLoading, usarPDV, objetivosVendedores]);

  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="indicativos-tabela" style={{ paddingBottom: '0.5rem' }}>
      <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
        Acompanhamento de vendas por Colaboradores
      </h3>

      <input
        type="text"
        placeholder="Buscar colaborador..."
        value={globalFilter ?? ''}
        onChange={(e) => setGlobalFilter(e.target.value)}
        style={{
          marginBottom: '1rem',
          padding: '6px 12px',
          width: '100%',
          maxWidth: '400px',
          borderRadius: '6px',
          border: '1px solid #ccc',
        }}
      />
<div style={{
  position: 'relative',
  maxHeight: '250px',
  overflowY: 'auto',
  border: '2px solid #0074c2',
  borderRadius: '8px',
}}>

  {isLoading && (
    <div style={{
      position: 'absolute',
      inset: 0,
      background: 'rgba(255, 255, 255, 0.85)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10,
      borderRadius: '6px',
      gap: '10px',
    }}>
      <div style={{
        width: '36px',
        height: '36px',
        border: '4px solid #e0e0e0',
        borderTop: '4px solid #0074c2',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <span style={{ color: '#0074c2', fontWeight: 600, fontSize: '0.9rem' }}>
        Carregando dados...
      </span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )}
  {isPdvLoading && usarPDV && (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '8px',
      padding: '6px 12px', marginBottom: '8px',
      background: '#fffbeb', border: '1px solid #f59e0b',
      borderRadius: '6px', fontSize: '0.82rem', color: '#92400e',
    }}>
      <div style={{
        width: '13px', height: '13px',
        border: '2px solid #f59e0b', borderTop: '2px solid transparent',
        borderRadius: '50%', animation: 'spin 0.8s linear infinite', flexShrink: 0,
      }} />
      Atualizando valores com vendas PDV...
    </div>
  )}
        <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: '980px' }}>
          <thead style={{ background: '#0074c2', color: '#fff', position: 'sticky', top: 0, zIndex: 2 }}>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    colSpan={header.colSpan}
                    style={{
                      padding: '8px',
                      textAlign: 'left',
                      borderBottom: '1px solid #ccc',
                      cursor: header.column.getCanSort() ? 'pointer' : 'default',
                    }}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {{
                      asc: ' 🔼',
                      desc: ' 🔽',
                    }[header.column.getIsSorted()] ?? null}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row, idx) => (
              <tr
                key={row.id}
                style={{ background: idx % 2 === 0 ? '#f9f9f9' : '#fff', cursor: 'pointer' }}
                onClick={() => onSelecionarColaborador?.(row.original)}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} style={{ padding: '8px', borderBottom: '1px solid #eee' }}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default IndicativosTabelaVendedor;
