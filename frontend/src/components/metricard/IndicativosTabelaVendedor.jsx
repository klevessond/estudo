// IndicativosTabelaVendedor.jsx
import React, { useEffect, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';

import api from '../../api';
import './IndicativosTabelaVendedor.css';

const IndicativosTabelaVendedor = ({ periodoSelecionado, onSelecionarColaborador, onDadosAtualizados,onObjetivosRecebidos  }) => {
  const [globalFilter, setGlobalFilter] = useState('');
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!periodoSelecionado?.de || !periodoSelecionado?.ate) return;
      try {
        const response = await api.get(`/vendas-por-vendedor/?de=${periodoSelecionado.de}&ate=${periodoSelecionado.ate}`);
        const json = response.data;

        // Extrair objetivos dos vendedores
        if (response.data.objetivo?.detalhamento) {
          const objetivos = response.data.objetivo.detalhamento.map(item => ({
            codFuncionario: item.CodFuncionario,
            objetivo: item.ObjetivoTotalVendedor,
            obrotatotal:item.PositivacaoTotalVendedor,
            nomeFuncionario: item.Funcionario
          }));
          onObjetivosRecebidos(objetivos);
        }
        
        const tabela = json.resultado.vendas_por_vendedor.map(vendedor => ({
          colaborador: vendedor.Campo.trim(),
          codFuncionario: Number(vendedor.codcampo),
          faturado: vendedor.ValorLiquido,
          aFaturar: json.resultado?.prevenda?.detalhado
            ?.filter(p => p.CodVendedor?.toString() === vendedor.codcampo?.toString())
            .reduce((acc, cur) => acc + cur.Valor, 0) || 0,
          alocado: vendedor.alocado || vendedor.ValorLiquido,
          cobertura: 0,
          variacao: 0,
          pesototalvendido:vendedor.PesoTotal,
          qtdClientes:vendedor.QtdClientes
          
        }));

        setData(tabela);
        onDadosAtualizados?.(tabela);
      } catch (error) {
        console.error('Erro ao buscar dados de vendas por vendedor:', error);
      }
    };

    fetchData();
  }, [periodoSelecionado, onObjetivosRecebidos]);

  const columns = React.useMemo(() => [
    {
      accessorKey: 'colaborador',
      header: 'Colaborador',
      cell: info => info.getValue(),
    },
    {
      accessorKey: 'faturado',
      header: 'Faturado R$',
      cell: info => info.getValue().toLocaleString('pt-BR'),
    },
    {
      accessorKey: 'aFaturar',
      header: 'A Faturar R$',
      cell: info => info.getValue().toLocaleString('pt-BR'),
    },
    {
      accessorKey: 'alocado',
      header: 'Alocado R$',
      cell: info => info.getValue().toLocaleString('pt-BR'),
    },
    {
      accessorKey: 'cobertura',
      header: 'Cob %',
      cell: info => (
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '1.25rem', color: 'green', fontWeight: 'bold' }}>⬆</span>
          <span style={{ fontWeight: 600 }}>{info.getValue().toFixed(2)}%</span>
        </span>
      ),
    },
    {
      accessorKey: 'variacao',
      header: 'Variação R$',
      cell: info => info.getValue().toLocaleString('pt-BR'),
    },
  ], []);

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
        onChange={e => setGlobalFilter(e.target.value)}
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
        <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: '800px' }}>
          <thead style={{ background: '#0074c2', color: '#fff' }}>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
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
                {row.getVisibleCells().map(cell => (
                  <td
                    key={cell.id}
                    style={{ padding: '8px', borderBottom: '1px solid #eee' }}
                  >
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