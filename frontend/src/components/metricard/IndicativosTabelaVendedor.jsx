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
}) => {
  const [globalFilter, setGlobalFilter] = useState('');
  const [baseData, setBaseData] = useState([]); // dados crus vindos da API
  const [data, setData] = useState([]);         // dados enriquecidos (com PDV somado quando ativo)

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

  // 1) Busca a lista de vendas por vendedor (apenas quando o período muda)
  useEffect(() => {
    const fetchData = async () => {
      if (!periodoSelecionado?.de || !periodoSelecionado?.ate) return;
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
        }));

        setBaseData(tabelaBase);

        // LOG: base carregada
        dlog('baseData carregada (len):', tabelaBase.length);
        dlog('baseData sample (até 5):', tabelaBase.slice(0, 5));
        const idsBase = tabelaBase.map((r) => r.codFuncionario).filter((x) => Number.isFinite(x));
        dlog('codFuncionarios na base (até 10):', idsBase.slice(0, 10));
      } catch (error) {
        console.error('[IndicativosTabelaVendedor] Erro ao buscar /vendas-por-vendedor:', error);
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

      return {
        ...row,
        // ✅ incluímos o objetivo para renderizar/ordenar
        objetivoFinanceiro: objetivo,
        faturado,
        alocado,
        pesototalvendido: peso,
        percVenda,
        variacao,
      };
    });

    dlog('Resumo enriquecimento → usarPDV:', usarPDV, '| vendedoresComPDV:', vendedoresComPDV, '/', baseData.length);

    setData(enriched);

    // ---- Proteção contra loop: só emite se mudou de verdade ----
    // Assinatura leve: tamanho + primeiros N registros com campos críticos
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

  // Colunas da tabela (sem mudar header/estilo original)
  const columns = useMemo(
    () => [
      {
        accessorKey: 'colaborador',
        header: 'Colaborador',
        // Exibe apenas o primeiro nome
        cell: (info) => {
          const full = String(info.getValue() ?? '').trim();
          const first = full.split(/\s+/)[0] || '';
          return first || full;
        },
      },
      {
        accessorKey: 'faturado',
        header: 'Faturado R$',
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
        header: 'Alocado R$',
        cell: (info) => Number(info.getValue() || 0).toLocaleString('pt-BR'),
      },
      // ✅ NOVA COLUNA: Objetivo R$
      {
        accessorKey: 'objetivoFinanceiro',
        header: 'Objetivo R$',
        cell: (info) =>
          Number(info.getValue() || 0).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          }),
        sortingFn: 'auto',
      },
      {
        accessorKey: 'mix',
        header: 'Mix (Qtd. Produtos)',
        cell: (info) => (
          <span style={{ fontWeight: 600 }}>
            {Number(info.getValue() || 0)} itens
          </span>
        ),
      },
      {
        accessorKey: 'percVenda',
        header: '% Cobertura',
        cell: (info) => {
          const v = Number(info.getValue() || 0);
          const cls =
            v < 25 ? 'perc-lt25' : v < 50 ? 'perc-lt50' : v < 75 ? 'perc-lt75' : 'perc-gte100';
          return <span className={`badge ${cls}`}>{v.toFixed(2)}%</span>;
        },
      },
      {
        accessorKey: 'variacao',
        header: 'Variação R$',
        cell: (info) => {
          const v = Number(info.getValue() || 0);
          const cls = v < 0 ? 'var-neg' : 'var-pos';
          return <span className={`badge ${cls}`}>{v.toLocaleString('pt-BR')}</span>;
        },
      },
    ],
    []
  );

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
    <div className="indicativos-tabela" style={{ overflowX: 'auto', paddingBottom: '0.5rem' }}>
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

      <div
        style={{
          maxHeight: '250px',
          overflowY: 'auto',
          border: '2px solid #0074c2',
          borderRadius: '8px',
        }}
      >
        <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: '980px' }}>
          <thead style={{ background: '#0074c2', color: '#fff' }}>
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
