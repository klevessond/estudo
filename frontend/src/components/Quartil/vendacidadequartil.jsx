import React, { useEffect, useRef } from 'react';
import Plotly from 'plotly.js-dist-min';
import './vendacidadequartil.css';

const VendacidadeQuartil = () => {
  const chartRef = useRef(null);

  // Valores de venda (em R$) já ordenados
  const salesValues = [
    190.98,
    415.80,
    439.02,
    700.00,
    965.52,
    1008.48,
    1049.40,
    1131.24,
    1422.12,
    1516.16,
    1518.75,
    1955.20,
    2292.80,
    2410.60,
    2487.42,
    2571.87,
    2778.00,
    3395.77,
    3983.21,
    4032.47,
    5172.88,
    5310.57,
    5392.00,
    6054.00,
    6816.20,
    9183.79,
    12066.58,
    30416.00,
  ];

  const n = salesValues.length;

  // Cálculo dos quartis:
  const Q1 = (salesValues[6] + salesValues[7]) / 2; // mediana dos 14 primeiros valores
  const Q2 = salesValues[14]; // mediana do conjunto
  const Q3 = (salesValues[21] + salesValues[22]) / 2; // mediana dos 14 últimos valores

  // Cálculo do IQR e limites de outline (mantidos no gráfico)
  const iqr = Q3 - Q1;
  const lowerOutline = Q1 - 1.5 * iqr;
  const upperOutline = Q3 + 1.5 * iqr;

  // Determinação da simetria da distribuição:
  const diffLower = Q2 - Q1;
  const diffUpper = Q3 - Q2;
  let simetria = "Simétrica";
  if (diffUpper > diffLower) {
    simetria = "Assimetria Positiva";
  } else if (diffUpper < diffLower) {
    simetria = "Assimetria Negativa";
  }

  // Cálculo da média e do desvio padrão (populacional)
  const mean = salesValues.reduce((sum, val) => sum + val, 0) / n;
  const variance = salesValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
  const std = Math.sqrt(variance);

  // Para a faixa do desvio padrão:
  const lowerStdLine = mean - std;
  const upperStdLine = mean + std;

  // Eixo X: índice dos produtos (1 a n)
  const xValues = Array.from({ length: n }, (_, i) => i + 1);

  useEffect(() => {
    // Trace para os valores de venda
    const traceSales = {
      x: xValues,
      y: salesValues,
      mode: 'lines+markers',
      name: 'Valor de Venda',
      line: { color: 'blue' }
    };

    // Traces para os quartis e outlines
    const traceQ1 = {
      x: [1, n],
      y: [Q1, Q1],
      mode: 'lines',
      name: 'Q1',
      line: { dash: 'dash', color: 'green' }
    };

    const traceQ2 = {
      x: [1, n],
      y: [Q2, Q2],
      mode: 'lines',
      name: 'Mediana (Q2)',
      line: { dash: 'dash', color: 'orange' }
    };

    const traceQ3 = {
      x: [1, n],
      y: [Q3, Q3],
      mode: 'lines',
      name: 'Q3',
      line: { dash: 'dash', color: 'red' }
    };

    const traceLowerOutline = {
      x: [1, n],
      y: [lowerOutline, lowerOutline],
      mode: 'lines',
      name: 'Outline Inferior',
      line: { dash: 'dash', color: 'purple' }
    };

    const traceUpperOutline = {
      x: [1, n],
      y: [upperOutline, upperOutline],
      mode: 'lines',
      name: 'Outline Superior',
      line: { dash: 'dash', color: 'brown' }
    };

    // Trace para a faixa do desvio padrão (band)
    const traceStdBand = {
      x: [1, n, n, 1],
      y: [lowerStdLine, lowerStdLine, upperStdLine, upperStdLine],
      fill: 'toself',
      fillcolor: 'rgba(0, 0, 255, 0.2)', // cor azul com transparência
      line: { color: 'transparent' },
      type: 'scatter',
      name: 'Média ± Desvio Padrão'
    };

    // Trace para a linha da média
    const traceMean = {
      x: [1, n],
      y: [mean, mean],
      mode: 'lines',
      name: 'Média',
      line: { dash: 'dot', color: 'black' }
    };

    const data = [
      traceStdBand,
      traceMean,
      traceSales,
      traceQ1,
      traceQ2,
      traceQ3,
      traceLowerOutline,
      traceUpperOutline
    ];

    const layout = {
      title: 'Relatório de Dispersão - Valores de Venda e Quartis',
      xaxis: { title: 'Índice dos Produtos', dtick: 1 },
      yaxis: { title: 'Valor de Venda (R$)' },
      margin: { t: 50, b: 50, l: 50, r: 50 }
    };

    Plotly.newPlot(chartRef.current, data, layout);
  }, [xValues, salesValues, n, Q1, Q2, Q3, lowerOutline, upperOutline, mean, lowerStdLine, upperStdLine]);

  return (
    <div className="chart-container">
      <h2>Relatório de Dispersão - Valores de Venda</h2>
      <p>
        50% dos valores estão entre <strong>Q1({Q1.toFixed(2)}) e Q3({Q3.toFixed(2)})</strong>
      </p>
      <p>
        Tipo de Simetria: <strong>{simetria} </strong>     
        Média: <strong>{mean.toFixed(2)}</strong> | Desvio Padrão: <strong>{std.toFixed(2)}</strong>
      </p>
      <p>
        
      </p>
      <div ref={chartRef} className="chart"></div>
    </div>
  );
};

export default VendacidadeQuartil;
