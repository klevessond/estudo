import React, { useState, useMemo, useRef, useCallback } from 'react';
import Plot from 'react-plotly.js';
import './ResumoVendas.css';

const ResumoVendas = () => {
  const receita = 1000000;
  const meta = 952000;
  const vendas = 420;
  const ticketMedio = receita / vendas;
  const percentual = ((receita / meta) * 100).toFixed(0);

  const lojas = ['Loja Norte', 'Loja Sul', 'Loja Leste', 'Loja Oeste'];
  const valores = [420000, 370000, 120000, 90000];

  const fullTotal = useMemo(() => valores.reduce((a, b) => a + b, 0), [valores]);
  const [total, setTotal] = useState(fullTotal);

  const visibleRef = useRef(
    lojas.reduce((acc, loja) => {
      acc[loja] = true;
      return acc;
    }, {})
  );

  const handleLegendClick = useCallback((eventData, graphDiv) => {
    const label = eventData.label;
    visibleRef.current[label] = !visibleRef.current[label];
    const newTotal = lojas.reduce((sum, loja, i) => {
      return sum + (visibleRef.current[loja] ? valores[i] : 0);
    }, 0);
    setTotal(newTotal);
  }, [lojas, valores]);

  const data = useMemo(() => [
    {
      type: 'pie',
      hole: 0.5,
      labels: lojas,
      values: valores,
      textinfo: 'label+value+percent',
      textposition: 'inside',
      hoverinfo: 'label+value+percent',
      marker: {
        colors: ['#36A2EB', '#FFCE56', '#4BC0C0', '#FF6384'],
      },
    },
  ], [lojas, valores]);

  const layout = useMemo(() => ({
    margin: { t: 40, b: 40, l: 40, r: 120 }, // margem maior à direita
    height: 300,
    width: 400,
    showlegend: true,
    legend: {
      orientation: 'v',
      x: 1.05,
      y: 1,
      xanchor: 'left',
      yanchor: 'top',
      font: {
        size: 12,
      },
    },
  }), []);

  const percentualVisivel = ((total / fullTotal) * 100).toFixed(1);

  return (
    <div className="resumo-container">
      <div className="resumo-layout">

        {/* Bloco 1: Receita, Meta e Percentual */}
        <div className="bloco-info">
          <div className="info-card green">
            <div className="label">Receita</div>
            <div className="value">R$ {receita.toLocaleString()}</div>
          </div>
          <div className="info-card green">
            <div className="label">Meta</div>
            <div className="value">R$ {meta.toLocaleString()}</div>
          </div>
          <div className="percent-bar">
            <div className="percent-text">{percentual}%</div>
          </div>
        </div>

        {/* Bloco 2: Gráfico de Rosca com TÍTULO centralizado */}
<div className="bloco-grafico">
  <div className="grafico-centralizado">
    <h3 className="chart-title">Vendas por Loja</h3>
    <div className="info-total">
      <strong>Total Vendido:</strong> R$ {total.toLocaleString()} ({percentualVisivel}%)
    </div>

    <Plot
      data={data}
      layout={layout}
      config={{
        responsive: true,
        displaylogo: false,
        displayModeBar: false,
      }}
      onInitialized={(figure, graphDiv) => {
        graphDiv.on('plotly_legendclick', (eventData) =>
          handleLegendClick(eventData, graphDiv)
        );
      }}
      style={{ width: '100%', height: '100%' }}
    />
  </div>
</div>


        {/* Bloco 3: Ticket Médio e Nº de Vendas */}
        <div className="bloco-kpi">
          <div className="info-card gray">
            <div className="label">Ticket Médio</div>
            <div className="value">R$ {ticketMedio.toFixed(2).toLocaleString()}</div>
          </div>
          <div className="info-card gray">
            <div className="label">Nº de Vendas</div>
            <div className="value">{vendas}</div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ResumoVendas;
