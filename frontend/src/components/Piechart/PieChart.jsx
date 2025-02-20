import React from 'react';
import Plot from 'react-plotly.js';

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

  return (
    <div className="pie-chart-plotly-container">
      <h2>Vendas por Grupo de Produto</h2>
      <Plot
        data={[
          {
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
          },
        ]}
        layout={{
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
        }}
        config={{
          responsive: true,
          displayModeBar: true,
          displaylogo: false,
          modeBarButtonsToRemove: ['toImage'],
        }}
        onInitialized={(figure, graphDiv) => {
          // Adiciona o listener para o clique na legenda
          graphDiv.on('plotly_legendclick', (eventData) => {
            console.log('Label clicada:', eventData.label);
            // Aqui você pode realizar cálculos ou outras ações.
            // Não retorne false para que o comportamento padrão ocorra.
          });
        }}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};

export default PieChart;
