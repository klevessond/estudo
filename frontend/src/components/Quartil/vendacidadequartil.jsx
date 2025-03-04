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
  // - Q1: mediana dos 14 primeiros valores (média dos itens de índice 6 e 7)
  // - Q2: mediana do conjunto (valor de índice 14, pois há 29 itens)
  // - Q3: mediana dos 14 últimos valores (média dos itens de índice 21 e 22)
  const Q1 = (salesValues[6] + salesValues[7]) / 2; // 1090.32
  const Q2 = salesValues[14]; // 2487.42
  const Q3 = (salesValues[21] + salesValues[22]) / 2; // 5351.285

  // Cálculo do IQR e dos limites de outline (ainda usados para o gráfico)
  const iqr = Q3 - Q1;
  const lowerOutline = Q1 - 1.5 * iqr;
  const upperOutline = Q3 + 1.5 * iqr;

  // Determinação da simetria da distribuição:
  // Se a dispersão na parte superior (Q3 - Q2) for maior que a inferior (Q2 - Q1), há assimetria positiva (cauda à direita).
  const diffLower = Q2 - Q1;
  const diffUpper = Q3 - Q2;
  let simetria = "Simétrica";
  if (diffUpper > diffLower) {
    simetria = "Assimetria Positiva";
  } else if (diffUpper < diffLower) {
    simetria = "Assimetria Negativa";
  }

  // Eixo X: usamos o índice (de 1 a 29)
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

    // Trace para o Q1 (linha horizontal)
    const traceQ1 = {
      x: [1, n],
      y: [Q1, Q1],
      mode: 'lines',
      name: 'Q1',
      line: { dash: 'dash', color: 'green' }
    };

    // Trace para a Mediana (Q2)
    const traceQ2 = {
      x: [1, n],
      y: [Q2, Q2],
      mode: 'lines',
      name: 'Mediana (Q2)',
      line: { dash: 'dash', color: 'orange' }
    };

    // Trace para o Q3
    const traceQ3 = {
      x: [1, n],
      y: [Q3, Q3],
      mode: 'lines',
      name: 'Q3',
      line: { dash: 'dash', color: 'red' }
    };

    // Trace para o outline inferior
    const traceLowerOutline = {
      x: [1, n],
      y: [lowerOutline, lowerOutline],
      mode: 'lines',
      name: 'Outline Inferior',
      line: { dash: 'dash', color: 'purple' }
    };

    // Trace para o outline superior
    const traceUpperOutline = {
      x: [1, n],
      y: [upperOutline, upperOutline],
      mode: 'lines',
      name: 'Outline Superior',
      line: { dash: 'dash', color: 'brown' }
    };

    const data = [
      traceSales,
      traceQ1,
      traceQ2,
      traceQ3,
      traceLowerOutline,
      traceUpperOutline
    ];

    const layout = {
      title: 'Relatório de Dispersão - Valores de Venda e Quartis',
      xaxis: {
        title: 'Índice dos Produtos',
        dtick: 1
      },
      yaxis: {
        title: 'Valor de Venda (R$)'
      },
      margin: { t: 50, b: 50, l: 50, r: 50 }
    };

    Plotly.newPlot(chartRef.current, data, layout);
  }, [xValues, salesValues, n, Q1, Q2, Q3, lowerOutline, upperOutline]);

  return (
    <div className="chart-container">
      <h2>Relatório de Dispersão - Valores de Venda</h2>
      <p>
      Amplitude Interquartil - 50% dos valores estão entre <strong>Q1({Q1.toFixed(2)}) e Q3 ({Q3.toFixed(2)})</strong>
        </p>
        <p>
          <strong>Tipo de Simetria:</strong> {simetria}
        </p>
      <div ref={chartRef} className="chart"></div>
      <div className="chart-info">
        
      </div>
    </div>
  );
};

export default VendacidadeQuartil;
