import React from 'react';
import Plot from 'react-plotly.js';
import './PieChart.css';

const PieChart = () => {
  // Simulando 7 grupos diferentes
  const grupos = [
    'Grupo A',
    'Grupo B',
    'Grupo C',
    'Grupo D',
    'Grupo E',
    'Grupo F',
    'Grupo G',
  ];

  // Simulando valores de vendas para cada grupo
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
            textinfo: 'label+value+percent',      // Texto dentro do setor
            insidetextorientation: 'auto',        // Ajusta automaticamente o texto
            textposition: 'inside',               // Texto dentro das fatias
            hoverinfo: 'label+value+percent',     // Ao passar o mouse, exibe label, valor e percentual
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
          // Ativa a legenda (labels) no gráfico
          showlegend: true,
          legend: {
            // Ajuste a posição da legenda conforme quiser
            orientation: 'v', // 'v' = vertical, 'h' = horizontal
            x: 1.02,          // posição X (fora do gráfico, à direita)
            y: 1,
            xanchor: 'left',
            yanchor: 'auto',
          },
        }}
        /* 
          CONFIG do gráfico:
          - displayModeBar: exibe a barra de ferramentas
          - displaylogo: remove o logo do Plotly
          - modeBarButtonsToRemove: você pode remover botões indesejados 
        */
        config={{
          responsive: true,
          displayModeBar: true, 
          displaylogo: false,
          modeBarButtonsToRemove: ['toImage'] // Exemplo: remove o botão de download de imagem
        }}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};

export default PieChart;
