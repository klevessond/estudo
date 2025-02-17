import React, { useRef, useEffect } from 'react';
import { Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale,Tooltip  } from 'chart.js';
import './MetricCard.css';

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale,Tooltip);

const MetricCard = ({ title, value, percentage, trend, graphColor, backgroundColor }) => {
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
                    label: 'Valores', // Rótulo do dataset (aparece no tooltip)
                    data: [12, 30, 3, 5, 2],
                    borderColor: graphColor,
                    borderWidth: 2,
                    tension: 0.4,
                    fill: false,
                    pointRadius: 3, // Tamanho do ponto
                    pointHoverRadius: 5, // Tamanho do ponto ao passar o mouse
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
                tooltip: {
                    enabled: true, // Habilita o tooltip
                    mode: 'index', // Mostra tooltips para todos os itens no mesmo índice
                    intersect: false, // Tooltip aparece ao passar o mouse sobre a linha, não apenas sobre os pontos
                    callbacks: {
                        title: (context) => {
                            // Título do tooltip (rótulo do eixo X)
                            return `Mês: ${context[0].label}`;
                        },
                        label: (context) => {
                            // Conteúdo do tooltip (valor do eixo Y)
                            return `Valor: ${context.raw}`;
                        },
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
        <div className="metric-card" style={{ backgroundColor: backgroundColor || '#ffffff' }}>
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