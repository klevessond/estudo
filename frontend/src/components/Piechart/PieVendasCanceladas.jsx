import React, { useMemo } from 'react';
import Plot from 'react-plotly.js';
import './PieVendasCanceladas.css';

const PieVendasCanceladas = () => {
  const labels = ["Vendas", "Devolvidas"];


  const companyData = useMemo(() => [
    {
      values: [5000, 1200],
      labels: labels,
      type: 'pie',
      name: 'Empresa A',
      marker: {
        colors: ["#1f77b4", "#ff7f0e"]
      },
      domain: { row: 0, column: 0 },
      hoverinfo: 'label+percent+name',
      textinfo: 'label+value',
      textposition: 'inside'  // Força o texto a ficar fora da fatia
    },
    {
      values: [4500, 900],
      labels: labels,
      type: 'pie',
      name: 'Empresa B',
      marker: {
        colors: ["#2ca02c", "#d62728"]
      },
      domain: { row: 0, column: 1 },
      hoverinfo: 'label+percent+name',
      textinfo: 'label+value',
      textposition: 'inside'  // Força o texto a ficar fora da fatia
    },
    {
      values: [4000, 1500],
      labels: labels,
      type: 'pie',
      name: 'Empresa C',
      marker: {
        colors: ["#9467bd", "#8c564b"]
      },
      domain: { row: 0, column: 2 },
      hoverinfo: 'label+percent+name',
      textinfo: 'label+value',
      textposition: 'inside'  // Força o texto a ficar fora da fatia
    }
  ], [labels]);

  const layout = useMemo(() => ({
    height: 350,
    width: 750,
    grid: { rows: 1, columns: 3 },
    title: {
        text: "<span style='font-size:12px;'>Devolvidas - Todas as vendas que sofreram processo logistico</span>",
        font: { size: 18 },
        x: 0.5,
        xanchor: "center"
      },
    annotations: [
        {
          text: "Empresa A",
          font: { size: 14 },
          showarrow: false,
          x: 0.10,      // posição aproximada no meio do primeiro subplot
          y: 1.1,       // posição acima do gráfico
          xref: "paper",
          yref: "paper"
        },
        {
          text: "Empresa B",
          font: { size: 14 },
          showarrow: false,
          x: 0.5,       // posição aproximada no meio do segundo subplot
          y: 1.1,
          xref: "paper",
          yref: "paper"
        },
        {
          text: "Empresa C",
          font: { size: 14 },
          showarrow: false,
          x: 0.88,      // posição aproximada no meio do terceiro subplot
          y: 1.1,
          xref: "paper",
          yref: "paper"
        }
      ]
  }), 
  []);

  return (
    <div className="pie-vendas-canceladas-container">
      <h2>Vendas e Devolucoes por Empresa</h2>
      <Plot 
        data={companyData} 
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

export default PieVendasCanceladas;
