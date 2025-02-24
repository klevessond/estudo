import React, { useEffect, useRef } from 'react';
import Plotly from 'plotly.js-dist-min';
import './DencidadeCidades.css';

const DencidadeCidadeChart = () => {
  const chartRef = useRef(null);

  useEffect(() => {
    // Definindo as cidades e os respectivos dados
    const cities = ['Natal', 'Mossoró', 'Caicó'];
    // Valor Vendido (em linha)
    const valorVendido = [500, 300, 150];
    // Renda per capita (em linha) – valores de exemplo
    const rendaPercapita = [3000, 2500, 2000];
    // População (em barra) – valores de exemplo
    const population = [900000, 300000, 80000];

    // Trace para população (barra)
    const tracePopulation = {
      x: cities,
      y: population,
      name: 'População',
      type: 'bar',
      marker: {
        color: 'rgba(55,128,191,0.7)'
      },
      yaxis: 'y'
    };

    // Trace para Valor Vendido (linha)
    const traceValorVendido = {
      x: cities,
      y: valorVendido,
      name: 'Valor Vendido',
      type: 'scatter',
      mode: 'lines+markers',
      line: {
        color: 'rgba(255,99,71,1)',
        width: 2
      },
      yaxis: 'y2'
    };

    // Trace para Renda per Capita (linha)
    const traceRenda = {
      x: cities,
      y: rendaPercapita,
      name: 'Renda per Capita',
      type: 'scatter',
      mode: 'lines+markers',
      line: {
        color: 'rgba(50,205,50,1)',
        width: 2
      },
      yaxis: 'y2'
    };

    const data = [tracePopulation, traceValorVendido, traceRenda];

    // Layout: utiliza dois eixos y (um para a população e outro para as linhas)
    const layout = {
      title: 'Densidade Demográfica e Indicadores das Cidades',
      xaxis: {
        title: 'Cidades'
      },
      yaxis: {
        title: 'População',
        showgrid: true,
        zeroline: true,
        side: 'left'
      },
      yaxis2: {
        title: 'Valor Vendido / Renda per Capita',
        overlaying: 'y',
        side: 'right'
      },
      legend: {
        x: 1,
        xanchor: 'right',
        y: 1
      },
      margin: {
        l: 60,
        r: 60,
        t: 80,
        b: 60
      }
    };

    Plotly.newPlot(chartRef.current, data, layout);
  }, []);

  return (
    <div className="chart-container">
      <h2>Vendas X Densidade Demográfica</h2>
      <p>
        Valor vendido e indicadores demográficos
      </p>
      <div ref={chartRef} className="chart"></div>
    </div>
  );
};

export default DencidadeCidadeChart;
