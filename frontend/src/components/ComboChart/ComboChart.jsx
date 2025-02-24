// components/ComboChart/ComboChart.jsx
import React from 'react';
import './ComboChart.css';

// Imports do Chart.js e do adaptador de datas
import {
  Chart as ChartJS,
  TimeScale, // Escala de tempo
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import 'chartjs-adapter-date-fns';

// Import do componente principal do React ChartJS
import { Chart } from 'react-chartjs-2';

// Registrando os componentes do Chart.js que serão usados
ChartJS.register(
  TimeScale,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Exemplo de dados (12 meses)
const rawData = [
  { month: '2023-01-01', sales: 10000, customers: 25, volume: 300 },
  { month: '2023-02-01', sales: 9000,  customers: 20, volume: 250 },
  { month: '2023-03-01', sales: 12000, customers: 30, volume: 400 },
  { month: '2023-04-01', sales: 8000,  customers: 22, volume: 270 },
  { month: '2023-05-01', sales: 15000, customers: 35, volume: 450 },
  { month: '2023-06-01', sales: 13000, customers: 31, volume: 420 },
  { month: '2023-07-01', sales: 18000, customers: 40, volume: 550 },
  { month: '2023-08-01', sales: 17000, customers: 38, volume: 520 },
  { month: '2023-09-01', sales: 9000,  customers: 18, volume: 240 },
  { month: '2023-10-01', sales: 11000, customers: 28, volume: 360 },
  { month: '2023-11-01', sales: 10000, customers: 26, volume: 320 },
  { month: '2023-12-01', sales: 14000, customers: 33, volume: 480 },
];

const ComboChart = () => {
  // Extraindo os dados
  const labels = rawData.map(item => item.month);
  const dataSales = rawData.map(item => item.sales);
  const dataCustomers = rawData.map(item => item.customers);
  const dataVolume = rawData.map(item => item.volume);

  // Configuração dos dados para o Chart.js
  const data = {
    labels,
    datasets: [
      {
        type: 'line',
        label: 'Vendas (R$)',
        data: dataSales,
        borderColor: '#36A2EB',
        backgroundColor: '#36A2EB33',
        tension: 0.2,
        yAxisID: 'ySales',
      },
      {
        type: 'bar',
        label: 'Clientes (nº)',
        data: dataCustomers,
        backgroundColor: '#FF6384',
        yAxisID: 'yCustomers',
      },
      {
        type: 'bar',
        label: 'Volume (itens)',
        data: dataVolume,
        backgroundColor: '#FFCE56',
        yAxisID: 'yVolume',
      },
    ],
  };

  // Configurações do gráfico
  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Vendas, Clientes e Volume (2023)',
      },
      legend: {
        position: 'top',
      },
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'month',
        },
        title: {
          display: true,
          text: 'Meses',
        },
      },
      ySales: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Vendas (R$)',
        },
      },
      yCustomers: {
        type: 'linear',
        display: true,
        position: 'right',
        grid: {
          drawOnChartArea: false,
        },
        title: {
          display: true,
          text: 'Clientes (nº)',
        },
      },
      yVolume: {
        type: 'linear',
        display: true,
        position: 'right',
        grid: {
          drawOnChartArea: false,
        },
        title: {
          display: true,
          text: 'Volume (itens)',
        },
      },
    },
  };

  return (
    <div className="combo-chart-container">
      <div className="combo-chart-content">
        <div className="chart-table">
          <table className="tabela">
            <thead>
              <tr>
                <th>Mês</th>
                <th>Vendas (R$)</th>
                <th>Clientes (nº)</th>
                <th>Volume (itens)</th>
              </tr>
            </thead>
            <tbody>
              {rawData.map((item, index) => (
                <tr key={index}>
                  <td>{item.month}</td>
                  <td>{item.sales}</td>
                  <td>{item.customers}</td>
                  <td>{item.volume}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="chart">
          <Chart type="bar" data={data} options={options} />
        </div>
      </div>
    </div>
  );
};

export default ComboChart;
