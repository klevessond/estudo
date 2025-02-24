import React, { useMemo } from 'react';
import Plot from 'react-plotly.js';
import './Linevendedores.css';

const Linevendedores = () => {
  const { data, layout } = useMemo(() => {
    // Eixo X (exemplo: períodos ou meses)
    const xValues = [1, 2, 3, 4, 5];

    // Dados de cada vendedor (trace)
    const dataTraces = [
      { // Empresa A - Vendedor 1
        x: xValues,
        y: [10, 15, 13, 17, 12],
        type: 'scatter',
        mode: 'lines+markers',
        name: 'Empresa A - Vendedor 1',
        line: { color: 'blue' }
      },
      { // Empresa A - Vendedor 2
        x: xValues,
        y: [12, 18, 14, 16, 13],
        type: 'scatter',
        mode: 'lines+markers',
        name: 'Empresa A - Vendedor 2',
        line: { color: 'red' }
      },
      { // Empresa B - Vendedor 1
        x: xValues,
        y: [20, 25, 23, 30, 28],
        type: 'scatter',
        mode: 'lines+markers',
        name: 'Empresa B - Vendedor 1',
        line: { color: 'green' }
      },
      { // Empresa B - Vendedor 2
        x: xValues,
        y: [22, 28, 26, 33, 30],
        type: 'scatter',
        mode: 'lines+markers',
        name: 'Empresa B - Vendedor 2',
        line: { color: 'orange' }
      },
      { // Empresa C - Vendedor 1
        x: xValues,
        y: [5, 7, 8, 6, 9],
        type: 'scatter',
        mode: 'lines+markers',
        name: 'Empresa C - Vendedor 1',
        line: { color: 'purple' }
      },
      { // Empresa C - Vendedor 2
        x: xValues,
        y: [6, 9, 7, 8, 10],
        type: 'scatter',
        mode: 'lines+markers',
        name: 'Empresa C - Vendedor 2',
        line: { color: 'brown' }
      }
    ];

    // Anotações base com os títulos
    const baseAnnotations = [
      {
        xref: 'paper',
        yref: 'paper',
        x: 0.0,
        y: 1.15,
        xanchor: 'left',
        yanchor: 'bottom',
        text: '',
        font: { family: 'Arial', size: 24, color: 'black' },
        showarrow: false
      },
      {
        xref: 'paper',
        yref: 'paper',
        x: 0.0,
        y: 1.05,
        xanchor: 'left',
        yanchor: 'bottom',
        text: 'Desempenho dos Vendedores',
        font: { family: 'Arial', size: 24, color: 'black' },
        showarrow: false
      }
    ];

    // Anotações para os nomes dos vendedores (lado esquerdo)
    const vendorNames = ['Vendedor 1', 'Vendedor 2', 'Vendedor 1', 'Vendedor 2', 'Vendedor 1', 'Vendedor 2'];
    const vendorAnnotations = dataTraces.map((trace, i) => ({
      xref: 'paper',
      yref: 'y',
      x: 0.05, // posição fixa à esquerda
      y: trace.y[0],
      xanchor: 'right',
      yanchor: 'middle',
      text: vendorNames[i],
      showarrow: false,
      font: { family: 'Arial', size: 16, color: trace.line.color }
    }));

    // Conjunto completo de anotações para exibir inicialmente todos os vendedores
    const vendorAnnotationsAll = vendorAnnotations;

    // Layout com dropdown para filtrar os dados por empresa
    const layout = {
      title: 'Desempenho dos Vendedores',
      updatemenus: [{
        buttons: [
          {
            label: 'Todas',
            method: 'update',
            args: [
              { visible: [true, true, true, true, true, true] },
              { annotations: baseAnnotations.concat(vendorAnnotationsAll),
                title: 'Todas as Empresas' }
            ]
          },
          {
            label: 'Empresa A',
            method: 'update',
            args: [
              { visible: [true, true, false, false, false, false] },
              { annotations: baseAnnotations.concat([vendorAnnotations[0], vendorAnnotations[1]]),
                title: 'Empresa A - Vendedores' }
            ]
          },
          {
            label: 'Empresa B',
            method: 'update',
            args: [
              { visible: [false, false, true, true, false, false] },
              { annotations: baseAnnotations.concat([vendorAnnotations[2], vendorAnnotations[3]]),
                title: 'Empresa B - Vendedores' }
            ]
          },
          {
            label: 'Empresa C',
            method: 'update',
            args: [
              { visible: [false, false, false, false, true, true] },
              { annotations: baseAnnotations.concat([vendorAnnotations[4], vendorAnnotations[5]]),
                title: 'Empresa C - Vendedores' }
            ]
          }
        ],
        direction: 'down',
        pad: { r: 10, t: 10 },
        showactive: true,
        x: 0.1,
        xanchor: 'left',
        y: 1.1,
        yanchor: 'top'
      }],
      xaxis: { title: 'Período' },
      yaxis: { title: 'Desempenho' },
      margin: { t: 150 } // Aumenta a margem superior para acomodar as anotações
    };

    // Adiciona as anotações ao layout inicial
    layout.annotations = baseAnnotations.concat(vendorAnnotationsAll);

    return { data: dataTraces, layout };
  }, []);

  return (
    <div className="line-vendedores-container">
      <Plot
        data={data}
        layout={layout}
        config={{
          responsive: true,
          displayModeBar: true,
          displaylogo: false,
          modeBarButtonsToRemove: ['toImage']
        }}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};

export default Linevendedores;
