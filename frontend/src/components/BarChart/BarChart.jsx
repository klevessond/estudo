import React, { useRef, useEffect } from 'react';
import { Chart, BarController, BarElement, CategoryScale, LinearScale, Tooltip } from 'chart.js';
import './BarChart.css';

// Registrar os componentes necessários do Chart.js
Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip);

const BarChart = () => {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    useEffect(() => {
        const ctx = chartRef.current.getContext('2d');

        // Dados do gráfico
        const data = {
            labels: ['Dec', 'Jan', 'Feb',], // Meses
            datasets: [
                {
                    label: 'Vendas 2022',
                    data: [8.25, 10, 12, 15, 18, 20], // Vendas para 2022
                    backgroundColor: 'rgba(75, 192, 192, 0.6)', // Cor das barras
                    borderColor: 'rgba(75, 192, 192, 1)', // Cor da borda
                    borderWidth: 1,
                },
                {
                    label: 'Vendas 2023',
                    data: [10, 12, 14, 16, 20, 22], // Vendas para 2023
                    backgroundColor: 'rgba(153, 102, 255, 0.6)', // Cor das barras
                    borderColor: 'rgba(153, 102, 255, 1)', // Cor da borda
                    borderWidth: 1,
                },
                {
                    label: 'Vendas 2024',
                    data: [12, 14, 16, 18, 22, 24], // Vendas para 2024
                    backgroundColor: 'rgba(255, 159, 64, 0.6)', // Cor das barras
                    borderColor: 'rgba(255, 159, 64, 1)', // Cor da borda
                    borderWidth: 1,
                },
            ],
        };

        // Configurações do gráfico
        const options = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                tooltip: {
                    enabled: true,
                    mode: 'index',
                    intersect: false,
                },
                legend: {
                    display: true,
                    position: 'top',
                },
            },
            scales: {
                x: {
                    stacked: false, // Barras não empilhadas
                },
                y: {
                    stacked: false, // Barras não empilhadas
                    beginAtZero: true, // Começar o eixo Y do zero
                },
            },
        };

        // Destruir o gráfico anterior, se existir
        if (chartInstance.current) {
            chartInstance.current.destroy();
        }

        // Criar um novo gráfico
        chartInstance.current = new Chart(ctx, {
            type: 'bar',
            data: data,
            options: options,
        });

        // Limpar o gráfico quando o componente for desmontado
        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, []);

    return (
        <div className="bar-chart-container">
            <h2>Evolucao de Vendas por Mês (2022, 2023, 2024)</h2>
            <div className="chart-wrapper">
                <canvas ref={chartRef}></canvas>
            </div>
        </div>
    );
};

export default BarChart;