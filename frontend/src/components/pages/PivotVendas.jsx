// src/pages/PivotVendas.jsx
import React, { useState } from 'react';
import PivotTableUI from 'react-pivottable/PivotTableUI';
import 'react-pivottable/pivottable.css';
import { useLocation } from 'react-router-dom';

const PivotVendas = () => {
  const location = useLocation();
  const top10Itens = location.state?.top10Itens || [];

  const [pivotState, setPivotState] = useState({
    data: [
      ['Nome', 'Quantidade', 'Valor Unit.', 'Valor Total', '% Lucro'],
      ...top10Itens.map(item => [
        item.nome,
        item.quantidade,
        item.valorUnit,
        item.valorTotal,
        item.percentualLucro,
      ]),
    ],
    rows: ['Nome'],
    cols: ['% Lucro'],
  });

  return (
    <div style={{ padding: 20 }}>
      <h2>Tabela Dinâmica de Vendas</h2>
      <PivotTableUI
        data={pivotState.data}
        onChange={s => setPivotState(s)}
        {...pivotState}
      />
    </div>
  );
};

export default PivotVendas;
