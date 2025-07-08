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

const IndicativosTabelaVendedor = ({ periodoSelecionado }) => {
  const [globalFilter, setGlobalFilter] = useState('');
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const inicio = periodoSelecionado?.de;
      const fim = periodoSelecionado?.ate;

      if (!inicio || !fim) return;

      try {
        const token = localStorage.getItem('token');
        const response = await api.get(`/vendas-por-vendedor/?de=${inicio}&ate=${fim}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
});
        
        const json = response.data; // ✅
        console.log('JSON recebido:', json);

        const tabela = json.resultado.vendas_por_vendedor.map(vendedor => ({
          colaborador: vendedor.Campo?.trim() || '',
          faturado: vendedor.ValorLiquido || 0,
          aFaturar: vendedor["pre-venda"] ?? 0,
          alocado: vendedor.alocado || vendedor.ValorLiquido || 0,
          cobertura: 0,
          variacao: 0
        }));

        setData(tabela);
      } catch (error) {
        console.error('Erro ao buscar dados de vendas por vendedor:', error);
      }
    };

    fetchData();
  }, [periodoSelecionado]);

  const columns = useMemo(
    () => [
      { header: 'Colaborador', accessorKey: 'colaborador' },
      { header: 'Faturado', accessorKey: 'faturado' },
      { header: 'A Faturar', accessorKey: 'aFaturar' },
      { header: 'Alocado', accessorKey: 'alocado' },
      { header: 'Cobertura', accessorKey: 'cobertura' },
      { header: 'Variação', accessorKey: 'variacao' },
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    state: { globalFilter },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="tabela-container">
      <input
        className="filtro-global"
        value={globalFilter ?? ''}
        onChange={e => setGlobalFilter(e.target.value)}
        placeholder="Filtrar por colaborador..."
      />

      <table className="tabela-vendedor">
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th key={header.id}>
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map(row => (
            <tr key={row.id}>
              {row.getVisibleCells().map(cell => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default IndicativosTabelaVendedor;
