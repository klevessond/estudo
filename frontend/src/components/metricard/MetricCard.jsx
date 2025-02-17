import React, { useRef, useEffect } from 'react';
import { Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale } from 'chart.js';
import './MetricCard.css';

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale);

const MetricCard = ({ title, value, percentage, trend, graphColor }) => {
    const chartRef = useRef(null);
    const chartInstance = useRef(null); // Referência para a instância do gráfico

    useEffect(() => {
        const ctx = chartRef.current.getContext('2d');

        // Destruir o gráfico anterior, se existir
        if (chartInstance.current) {
            chartInstance.current.destroy();
        }

        // Criar um novo gráfico
        chartInstance.current = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
                datasets: [{
                    data: [12, 19, 3, 5, 2],
                    borderColor: graphColor,
                    borderWidth: 2,
                    tension: 0.4,
                    fill: false,
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false,
                    },
                },
                scales: {
                    x: {
                        display: false,
                    },
                    y: {
                        display: false,
                    },
                },
            },
        });

        // Limpar o gráfico quando o componente for desmontado
        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, [graphColor]);

    const trendColor = trend === 'up' ? 'green' : 'red';

    return (
        <div className="metric-card">
            <h3>{title}</h3>
            <div className="metric-value">
                <span>{value}</span>
                <span className="percentage" style={{ color: trendColor }}>
                    {percentage} {trend === 'up' ? '↑' : '↓'}
                </span>
            </div>
            <div className="metric-graph">
                <canvas ref={chartRef}></canvas>
            </div>
        </div>
    );
};

export default MetricCard;