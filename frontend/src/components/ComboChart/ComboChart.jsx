// components/ComboChart/ComboChart.jsx
import React, { useState } from 'react';
import './ComboChart.css';

// Imports do Chart.js e do adaptador de datas
import {
  Chart as ChartJS,
  TimeScale,
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
import { Chart } from 'react-chartjs-2';

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

// Dados MoM – 12 meses de 2023
const rawDataMoM = [
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

// Dados YoY – 12 meses para 2024 e 2023
const rawDataYoY = [
  // Dados para 2024
  { year: 2024, month: '01', sales: 12000, customers: 30, volume: 400 },
  { year: 2024, month: '02', sales: 13000, customers: 32, volume: 420 },
  { year: 2024, month: '03', sales: 15000, customers: 35, volume: 450 },
  { year: 2024, month: '04', sales: 14000, customers: 33, volume: 430 },
  { year: 2024, month: '05', sales: 16000, customers: 36, volume: 460 },
  { year: 2024, month: '06', sales: 15500, customers: 34, volume: 440 },
  { year: 2024, month: '07', sales: 17000, customers: 38, volume: 480 },
  { year: 2024, month: '08', sales: 16500, customers: 37, volume: 470 },
  { year: 2024, month: '09', sales: 15000, customers: 35, volume: 450 },
  { year: 2024, month: '10', sales: 14500, customers: 34, volume: 430 },
  { year: 2024, month: '11', sales: 16000, customers: 36, volume: 460 },
  { year: 2024, month: '12', sales: 17500, customers: 39, volume: 490 },
  // Dados para 2023
  { year: 2023, month: '01', sales: 10000, customers: 25, volume: 300 },
  { year: 2023, month: '02', sales: 9000,  customers: 20, volume: 250 },
  { year: 2023, month: '03', sales: 12000, customers: 30, volume: 400 },
  { year: 2023, month: '04', sales: 11000, customers: 28, volume: 350 },
  { year: 2023, month: '05', sales: 13000, customers: 32, volume: 380 },
  { year: 2023, month: '06', sales: 12500, customers: 31, volume: 370 },
  { year: 2023, month: '07', sales: 14000, customers: 33, volume: 390 },
  { year: 2023, month: '08', sales: 13500, customers: 32, volume: 380 },
  { year: 2023, month: '09', sales: 11000, customers: 27, volume: 340 },
  { year: 2023, month: '10', sales: 10500, customers: 26, volume: 330 },
  { year: 2023, month: '11', sales: 12000, customers: 30, volume: 400 },
  { year: 2023, month: '12', sales: 13000, customers: 32, volume: 420 },
];

const ComboChart = () => {
  const [mode, setMode] = useState('MoM'); // 'MoM' ou 'YoY'

  let data, options, tableRows, tableHeaderLabel;

  if (mode === 'MoM') {
    // Dados MoM
    const labels = rawDataMoM.map(item => item.month);
    const dataSales = rawDataMoM.map(item => item.sales);
    const dataCustomers = rawDataMoM.map(item => item.customers);
    const dataVolume = rawDataMoM.map(item => item.volume);

    data = {
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

    options = {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Evolução MoM - Vendas, Clientes e Volume (2023)',
        },
        legend: { position: 'top' },
      },
      scales: {
        x: {
          type: 'time',
          time: { unit: 'month' },
          title: { display: true, text: 'Meses' },
        },
        ySales: {
          type: 'linear',
          display: true,
          position: 'left',
          title: { display: true, text: 'Vendas (R$)' },
        },
        yCustomers: {
          type: 'linear',
          display: true,
          position: 'right',
          grid: { drawOnChartArea: false },
          title: { display: true, text: 'Clientes (nº)' },
        },
        yVolume: {
          type: 'linear',
          display: true,
          position: 'right',
          grid: { drawOnChartArea: false },
          title: { display: true, text: 'Volume (itens)' },
        },
      },
    };

    tableHeaderLabel = 'Mês';
    tableRows = rawDataMoM.map((item, index) => {
      const formattedMonth = `${item.month.substring(5,7)}/${item.month.substring(0,4)}`;
      let salesIndicator = null, customersIndicator = null, volumeIndicator = null;
      if (index > 0) {
        const prev = rawDataMoM[index - 1];
        const salesChange = ((item.sales - prev.sales) / prev.sales) * 100;
        const customersChange = ((item.customers - prev.customers) / prev.customers) * 100;
        const volumeChange = ((item.volume - prev.volume) / prev.volume) * 100;
        if (salesChange < 0)
          salesIndicator = <span className="decrease-indicator">↓ {Math.abs(salesChange).toFixed(1)}%</span>;
        else if (salesChange > 0)
          salesIndicator = <span className="increase-indicator">↑ {salesChange.toFixed(1)}%</span>;
        if (customersChange < 0)
          customersIndicator = <span className="decrease-indicator">↓ {Math.abs(customersChange).toFixed(1)}%</span>;
        else if (customersChange > 0)
          customersIndicator = <span className="increase-indicator">↑ {customersChange.toFixed(1)}%</span>;
        if (volumeChange < 0)
          volumeIndicator = <span className="decrease-indicator">↓ {Math.abs(volumeChange).toFixed(1)}%</span>;
        else if (volumeChange > 0)
          volumeIndicator = <span className="increase-indicator">↑ {volumeChange.toFixed(1)}%</span>;
      }
      return (
        <tr key={index}>
          <td>{formattedMonth}</td>
          <td>{item.sales} {salesIndicator}</td>
          <td>{item.customers} {customersIndicator}</td>
          <td>{item.volume} {volumeIndicator}</td>
        </tr>
      );
    });
  } else {
    // Modo YoY: Intercalar dados de cada mês (primeiro 2023, depois 2024)
    const grouped = {};
    rawDataYoY.forEach(item => {
      if (!grouped[item.month]) {
        grouped[item.month] = [];
      }
      grouped[item.month].push(item);
    });
    const sortedMonths = Object.keys(grouped).sort();
    tableRows = [];
    sortedMonths.forEach(month => {
      // Ordena por ano (2023 primeiro)
      const items = grouped[month].sort((a, b) => a.year - b.year);
      items.forEach((item, idx) => {
        const formatted = `${item.month}/${item.year}`;
        let salesIndicator = null, customersIndicator = null, volumeIndicator = null;
        // Se for o segundo registro do mesmo mês, compare com o primeiro
        if (idx > 0) {
          const prev = items[idx - 1];
          const salesChange = ((item.sales - prev.sales) / prev.sales) * 100;
          const customersChange = ((item.customers - prev.customers) / prev.customers) * 100;
          const volumeChange = ((item.volume - prev.volume) / prev.volume) * 100;
          if (salesChange < 0)
            salesIndicator = <span className="decrease-indicator">↓ {Math.abs(salesChange).toFixed(1)}%</span>;
          else if (salesChange > 0)
            salesIndicator = <span className="increase-indicator">↑ {salesChange.toFixed(1)}%</span>;
          if (customersChange < 0)
            customersIndicator = <span className="decrease-indicator">↓ {Math.abs(customersChange).toFixed(1)}%</span>;
          else if (customersChange > 0)
            customersIndicator = <span className="increase-indicator">↑ {customersChange.toFixed(1)}%</span>;
          if (volumeChange < 0)
            volumeIndicator = <span className="decrease-indicator">↓ {Math.abs(volumeChange).toFixed(1)}%</span>;
          else if (volumeChange > 0)
            volumeIndicator = <span className="increase-indicator">↑ {volumeChange.toFixed(1)}%</span>;
        }
        tableRows.push(
          <tr key={`${month}-${item.year}`}>
            <td>{formatted}</td>
            <td>{item.sales} {salesIndicator}</td>
            <td>{item.customers} {customersIndicator}</td>
            <td>{item.volume} {volumeIndicator}</td>
          </tr>
        );
      });
    });

    // Para o gráfico, separar os dados por ano
    const data2024 = rawDataYoY.filter(item => item.year === 2024).sort((a, b) => a.month.localeCompare(b.month));
    const data2023 = rawDataYoY.filter(item => item.year === 2023).sort((a, b) => a.month.localeCompare(b.month));
    const months = data2024.map(item => item.month);
    data = {
      labels: months,
      datasets: [
        {
          type: 'line',
          label: 'Vendas (2024)',
          data: data2024.map(item => item.sales),
          borderColor: '#36A2EB',
          backgroundColor: '#36A2EB33',
          tension: 0.2,
          yAxisID: 'ySales',
        },
        {
          type: 'line',
          label: 'Vendas (2023)',
          data: data2023.map(item => item.sales),
          borderColor: '#FF6384',
          backgroundColor: '#FF638433',
          tension: 0.2,
          yAxisID: 'ySales',
        },
        {
          type: 'bar',
          label: 'Clientes (2024)',
          data: data2024.map(item => item.customers),
          backgroundColor: '#FFCE56',
          yAxisID: 'yCustomers',
        },
        {
          type: 'bar',
          label: 'Clientes (2023)',
          data: data2023.map(item => item.customers),
          backgroundColor: '#4BC0C0',
          yAxisID: 'yCustomers',
        },
        {
          type: 'bar',
          label: 'Volume (2024)',
          data: data2024.map(item => item.volume),
          backgroundColor: '#9966FF',
          yAxisID: 'yVolume',
        },
        {
          type: 'bar',
          label: 'Volume (2023)',
          data: data2023.map(item => item.volume),
          backgroundColor: '#FF9F40',
          yAxisID: 'yVolume',
        },
      ],
    };

    options = {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Comparação YoY - Vendas, Clientes e Volume',
        },
        legend: { position: 'top' },
      },
      scales: {
        x: {
          type: 'category',
          title: { display: true, text: 'Meses' },
        },
        ySales: {
          type: 'linear',
          display: true,
          position: 'left',
          title: { display: true, text: 'Vendas (R$)' },
        },
        yCustomers: {
          type: 'linear',
          display: true,
          position: 'right',
          grid: { drawOnChartArea: false },
          title: { display: true, text: 'Clientes (nº)' },
        },
        yVolume: {
          type: 'linear',
          display: true,
          position: 'right',
          grid: { drawOnChartArea: false },
          title: { display: true, text: 'Volume (itens)' },
        },
      },
    };

    tableHeaderLabel = 'Mês/ Ano';
  }

  return (
    <div className="combo-chart-container">
      <button onClick={() => setMode(mode === 'MoM' ? 'YoY' : 'MoM')}>
        Mudar para {mode === 'MoM' ? 'YoY' : 'MoM'}
      </button>
      <div className="combo-chart-content">
        <div className="chart-table">
          <table className="tabela">
            <thead>
              <tr>
                <th>{tableHeaderLabel}</th>
                <th>Vendas (R$)</th>
                <th>Clientes (nº)</th>
                <th>Volume (itens)</th>
              </tr>
            </thead>
            <tbody>{tableRows}</tbody>
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
