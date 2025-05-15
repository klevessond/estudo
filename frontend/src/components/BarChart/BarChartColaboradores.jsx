import React, { useRef, useEffect } from 'react';
import {
  Chart,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import './BarChart.css';

Chart.register(
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  annotationPlugin,
  ChartDataLabels
);

const BarChartColaboradores = () => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  const colaboradores = [
    { colaborador: 'Ana Paula Silva Peixoto 75493', faturado: 1043851, cobertura: 257.86 },
    { colaborador: 'Carlos Alexandre Pereira Da Costa 75145', faturado: 1223006, cobertura: 246.63 },
    { colaborador: 'Bruno Simoes Amorim 41760', faturado: 1461327, cobertura: 239.86 },
    { colaborador: 'Fabio Jose Goncalves 37785', faturado: 365924, cobertura: 208.76 },
    { colaborador: 'Liliane Tente De Almeida Parreiras 75427', faturado: 396397, cobertura: 175.0 },
    { colaborador: 'Valter Paulino De Araujo 37863', faturado: 1526127, cobertura: 153.36 },
    { colaborador: 'Gabriela Maria Figueiredo De Freitas 75202', faturado: 2778248, cobertura: 145.03 },
    { colaborador: 'Rafael Tavares Moreira 75300', faturado: 1987452, cobertura: 166.32 },
    { colaborador: 'Joana Cristina Azevedo 75133', faturado: 2384901, cobertura: 192.44 },
    { colaborador: 'Marcelo Henrique Souza 75055', faturado: 964380, cobertura: 185.79 },
    { colaborador: 'Fernanda Lopes Vieira 75498', faturado: 735126, cobertura: 164.37 },
    { colaborador: 'Claudio Mendes 74888', faturado: 1152708, cobertura: 173.91 },
    { colaborador: 'Júlia Teixeira Barros 75012', faturado: 2612093, cobertura: 158.2 },
    { colaborador: 'Luciano Martins Pereira 75267', faturado: 1809390, cobertura: 161.92 },
    { colaborador: 'Débora Almeida Costa 75349', faturado: 1289341, cobertura: 169.85 },
    { colaborador: 'Rodrigo Ferreira Dias 75199', faturado: 842715, cobertura: 184.5 },
    { colaborador: 'Carla Regina Souza 75401', faturado: 1004988, cobertura: 173.12 },
  ];

  const dadosOrdenados = colaboradores.slice().sort((a, b) => b.faturado - a.faturado);
  const labels = dadosOrdenados.map(c => c.colaborador.split(' ').slice(0, 2).join(' '));
  const valores = dadosOrdenados.map(c => c.faturado);
  const coberturas = dadosOrdenados.map(c => c.cobertura);
  const media = Math.round(valores.reduce((acc, val) => acc + val, 0) / valores.length);

  useEffect(() => {
    const ctx = chartRef.current.getContext('2d');

    const data = {
      labels,
      datasets: [
        {
          label: 'Faturamento (R$)',
          data: valores,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
          datalabels: {
            anchor: 'end',
            align: 'start',
            formatter: function (_value, context) {
              return `${coberturas[context.dataIndex].toFixed(1)}%`;
            },
            color: '#000',
            font: {
              weight: 'bold',
              size: 11,
            },
          },
        },
      ],
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        tooltip: {
          enabled: true,
        },
        legend: {
          display: true,
          position: 'top',
          labels: {
            generateLabels: chart => {
              const labels = Chart.defaults.plugins.legend.labels.generateLabels(chart);
              labels.push({
                text: `Média da Equipe: R$ ${media.toLocaleString('pt-BR')}`,
                fillStyle: 'red',
                strokeStyle: 'red',
                lineWidth: 2,
                hidden: false,
                index: labels.length,
              });
              return labels;
            },
          },
        },
        annotation: {
          annotations: {
            mediaLine: {
              type: 'line',
              yMin: media,
              yMax: media,
              borderColor: 'red',
              borderWidth: 2,
              label: {
                content: `Média: R$ ${media.toLocaleString('pt-BR')}`,
                enabled: true,
                position: 'end',
                backgroundColor: 'rgba(255,0,0,0.8)',
                color: 'white',
                padding: 4,
              },
            },
          },
        },
      },
      scales: {
        x: {
          ticks: {
            maxRotation: 45,
            minRotation: 45,
          },
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Faturamento (R$)',
          },
        },
      },
    };

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data,
      options,
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, []);

  return (
    <div className="bar-chart-container">
      <h3>Faturamento Equipe</h3>
      <div className="chart-wrapper">
        <canvas ref={chartRef}></canvas>
      </div>
    </div>
  );
};

export default BarChartColaboradores;
