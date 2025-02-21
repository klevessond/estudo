import React, { useState, useRef, useCallback, useMemo } from 'react';
import Plot from 'react-plotly.js';

// Memoriza o componente Plot para evitar re-renderizações desnecessárias
const MemoizedPlot = React.memo(Plot);

const PieChart = () => {
  const grupos = [
    'Grupo A',
    'Grupo B',
    'Grupo C',
    'Grupo D',
    'Grupo E',
    'Grupo F',
    'Grupo G',
  ];
  const valores = [4500, 3200, 2100, 1600, 900, 700, 500];

  // Estado para exibir o total visível
  const [total, setTotal] = useState(valores.reduce((a, b) => a + b, 0));
  // Ref para armazenar o status de visibilidade dos grupos sem causar re-render
  const visibleGroupsRef = useRef(
    grupos.reduce((acc, grupo) => {
      acc[grupo] = true;
      return acc;
    }, {})
  );

  // Dados e layout memorizados para que o gráfico não seja reinicializado
  const data = useMemo(() => [{
    type: 'pie',
    labels: grupos,
    values: valores,
    textinfo: 'label+value+percent',
    insidetextorientation: 'auto',
    textposition: 'inside',
    hoverinfo: 'label+value+percent',
    marker: {
      colors: [
        '#FF6384',
        '#36A2EB',
        '#FFCE56',
        '#4BC0C0',
        '#9966FF',
        '#FF9F40',
        '#B8860B',
      ],
    },
  }], [grupos, valores]);

  const layout = useMemo(() => ({
    margin: { t: 40, b: 40, l: 40, r: 40 },
    height: 300,
    width: 400,
    showlegend: true,
    legend: {
      orientation: 'v',
      x: 1.02,
      y: 1,
      xanchor: 'left',
      yanchor: 'auto',
    },
  }), []);

  // Função que trata o clique na legenda
  const handleLegendClick = useCallback((eventData, graphDiv) => {
    const label = eventData.label;
    // Atualiza o status do grupo clicado
    visibleGroupsRef.current[label] = !visibleGroupsRef.current[label];
    // Recalcula o total com base nos grupos visíveis
    const newTotal = grupos.reduce((sum, grupo, index) => {
      return sum + (visibleGroupsRef.current[grupo] ? valores[index] : 0);
    }, 0);
    setTotal(newTotal);
    // Permite que o comportamento padrão do Plotly (ocultar/mostrar a fatia) ocorra
  }, [grupos, valores]);

  return (
    <div className="pie-chart-plotly-container">
      <h2>Vendas por Grupo de Produto</h2>
      <div>
        <strong>Total Vendido:</strong> {total}
      </div>
      <MemoizedPlot
        data={data}
        layout={layout}
        config={{
          responsive: true,
          displayModeBar: true,
          displaylogo: false,
          modeBarButtonsToRemove: ['toImage'],
        }}
        // Usa onInitialized para adicionar o listener sem reinicializar o gráfico
        onInitialized={(figure, graphDiv) => {
          graphDiv.on('plotly_legendclick', (eventData) =>
            handleLegendClick(eventData, graphDiv)
          );
        }}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};

export default PieChart;
