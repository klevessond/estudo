// IndicativosTabelaVendedor.jsx
import React from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';

import './IndicativosTabelaVendedor.css'
const data = [
  {
    colaborador: 'Ana Paula Silva Peixoto 75493',
    faturado: 1043851,
    aFaturar: 84332,
    alocado: 1182183,
    cobertura: 257.86,
    variacao: 690665,
  },
  {
    colaborador: 'Carlos Alexandre Pereira Da Costa 75145',
    faturado: 1223006,
    aFaturar: 338164,
    alocado: 1561170,
    cobertura: 246.63,
    variacao: 928168,
  },
  {
    colaborador: 'Bruno Simoes Amorim 41760',
    faturado: 1461327,
    aFaturar: 244970,
    alocado: 1706297,
    cobertura: 239.86,
    variacao: 994926,
  },
  {
    colaborador: 'Fabio Jose Goncalves 37785',
    faturado: 365924,
    aFaturar: 179211,
    alocado: 545135,
    cobertura: 208.76,
    variacao: 284001,
  },
  {
    colaborador: 'Liliane Tente De Almeida Parreiras 75427',
    faturado: 396397,
    aFaturar: 285807,
    alocado: 682204,
    cobertura: 175.00,
    variacao: 292379,
  },
  {
    colaborador: 'Valter Paulino De Araujo 37863',
    faturado: 1526127,
    aFaturar: 383652,
    alocado: 1909779,
    cobertura: 153.36,
    variacao: 664494,
  },
  {
    colaborador: 'Gabriela Maria Figueiredo De Freitas 75202',
    faturado: 2778248,
    aFaturar: 712202,
    alocado: 3490451,
    cobertura: 145.03,
    variacao: 1083775,
  },
  {
    colaborador: 'Rafael Tavares Moreira 75300',
    faturado: 1_987_452,
    aFaturar: 387_620,
    alocado: 2_538_764,
    cobertura: 166.32,
    variacao: 551_312,
  },
  {
    colaborador: 'Joana Cristina Azevedo 75133',
    faturado: 2_384_901,
    aFaturar: 129_843,
    alocado: 2_791_448,
    cobertura: 192.44,
    variacao: 406_547,
  },
  {
    colaborador: 'Marcelo Henrique Souza 75055',
    faturado: 964_380,
    aFaturar: 212_478,
    alocado: 1_308_933,
    cobertura: 185.79,
    variacao: 344_553,
  },
  {
    colaborador: 'Fernanda Lopes Vieira 75498',
    faturado: 735_126,
    aFaturar: 104_312,
    alocado: 972_889,
    cobertura: 164.37,
    variacao: 237_763,
  },
  {
    colaborador: 'Claudio Mendes 74888',
    faturado: 1_152_708,
    aFaturar: 298_721,
    alocado: 1_577_423,
    cobertura: 173.91,
    variacao: 424_715,
  },
  {
    colaborador: 'Júlia Teixeira Barros 75012',
    faturado: 2_612_093,
    aFaturar: 442_117,
    alocado: 3_080_716,
    cobertura: 158.20,
    variacao: 468_623,
  },
  {
    colaborador: 'Luciano Martins Pereira 75267',
    faturado: 1_809_390,
    aFaturar: 304_750,
    alocado: 2_214_140,
    cobertura: 161.92,
    variacao: 404_750,
  },
  {
    colaborador: 'Débora Almeida Costa 75349',
    faturado: 1_289_341,
    aFaturar: 223_760,
    alocado: 1_605_803,
    cobertura: 169.85,
    variacao: 316_462,
  },
  {
    colaborador: 'Rodrigo Ferreira Dias 75199',
    faturado: 842_715,
    aFaturar: 167_334,
    alocado: 1_130_301,
    cobertura: 184.50,
    variacao: 287_586,
  },
  {
    colaborador: 'Carla Regina Souza 75401',
    faturado: 1_004_988,
    aFaturar: 190_554,
    alocado: 1_304_665,
    cobertura: 173.12,
    variacao: 299_677,
  },
  

];

const columns = [
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
      <span>
        <span style={{ color: 'green', marginRight: 5 }}>⬆</span>
        {info.getValue().toFixed(2)}%
      </span>
    ),
  },
  {
    accessorKey: 'variacao',
    header: 'Variação R$',
    cell: info => info.getValue().toLocaleString('pt-BR'),
  },
];

const IndicativosTabelaVendedor = () => {
  const [globalFilter, setGlobalFilter] = React.useState('');

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
        Acompanhamento de desvios por Colaboradores
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
          maxHeight: '200px',         // Altura máxima (~10 linhas)
          overflowY: 'auto',
          border: '2px solid #0074c2', // Borda azul ao redor
          borderRadius: '8px',
        }}
      >
        <table
          style={{
            borderCollapse: 'collapse',
            width: '100%',
            minWidth: '800px',
          }}
        >
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
                style={{
                  background: idx % 2 === 0 ? '#f9f9f9' : '#fff',
                }}
              >
                {row.getVisibleCells().map(cell => (
                  <td
                    key={cell.id}
                    style={{
                      padding: '8px',
                      borderBottom: '1px solid #eee',
                    }}
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
