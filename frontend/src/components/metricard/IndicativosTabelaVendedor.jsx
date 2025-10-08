// IndicativosTabelaVendedor.jsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';

import api from '../../api';
import './IndicativosTabelaVendedor.css';

/**
 * Props
 * - periodoSelecionado: { de, ate }
 * - onSelecionarColaborador: fn(row)
 * - onDadosAtualizados: fn(tabela)
 * - onObjetivosRecebidos: fn(objVetores)
 * - objetivosVendedores: [{ codFuncionario, objetivo_financeiro, ... }]
 */
const IndicativosTabelaVendedor = ({
  periodoSelecionado,
  onSelecionarColaborador,
  onDadosAtualizados,
  onObjetivosRecebidos,
  objetivosVendedores = [],
}) => {
  const [globalFilter, setGlobalFilter] = useState('');
  const [baseData, setBaseData] = useState([]); // dados crus vindos da API
  const [data, setData] = useState([]);         // dados enriquecidos com % e variação

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

  // 1) Busca a lista de vendas por vendedor (apenas quando o período muda)
  useEffect(() => {
    const fetchData = async () => {
      if (!periodoSelecionado?.de || !periodoSelecionado?.ate) return;
      try {
        const url = `/vendas-por-vendedor/?de=${periodoSelecionado.de}&ate=${periodoSelecionado.ate}`;
        const { data: json } = await api.get(url);

        // Monta a base da tabela (sem %/var ainda)
        const tabelaBase = (json?.resultado?.vendas_por_vendedor || []).map((vendedor) => ({
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
      } catch (error) {
        console.error('Erro ao buscar dados de vendas por vendedor:', error);
      }
    };

    fetchData();
  }, [periodoSelecionado]);

  // 2) Enriquecer a base com % de cobertura e variação assim que objetivos chegarem
  useEffect(() => {
    // Se ainda não há base, não faz nada
    if (!baseData?.length) {
      setData([]);
      return;
    }

    // Monta os campos calculados com os objetivos já recebidos
    const enriched = baseData.map((row) => {
      const objetivo = Number(objetivoFinanceiroMap.get(row.codFuncionario) || 0);
      const percVenda = objetivo > 0 ? (row.faturado / objetivo) * 100 : 0;
      const variacao = row.faturado - objetivo;

      return {
        ...row,
        percVenda, // % Cobertura
        variacao,  // Variação R$
      };
    });

    setData(enriched);
    onDadosAtualizados?.(enriched);
  }, [baseData, objetivoFinanceiroMap, onDadosAtualizados]);

  // Colunas da tabela
  const columns = useMemo(
    () => [
      {
        accessorKey: 'colaborador',
        header: 'Colaborador',
        cell: (info) => info.getValue(),
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
            v < 25 ? 'perc-lt25'
            : v < 50 ? 'perc-lt50'
            : v < 75 ? 'perc-lt75'
            : 'perc-gte100'; // 75–99 e >=100

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
        <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: '920px' }}>
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
