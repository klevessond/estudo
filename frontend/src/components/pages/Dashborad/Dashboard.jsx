import React from 'react';
import MetricCard from '../../metricard/MetricCard';
import BarChart from '../../BarChart/BarChart';
import './Dashboard.css';

const Dashboard = () => {
    return (
        <div className="dashboard">
            <h1>Dashboard</h1>
            {/* Container pai com display:flex */}
            <div className="dashboard-container">
                {/* Div que agrupa os 3 MetricCards */}
                <div className="metric-cards">
                    <MetricCard
                        title="Novos clientes"
                        value="$24,780"
                        percentage="+49%"
                        trend="up"
                        graphColor="#a8e6cf"
                        backgroundColor="#f7fffa"
                    />
                    <MetricCard
                        title="Vendas novos clientes"
                        value="$17,489"
                        percentage="-12%"
                        trend="down"
                        graphColor="#ff8b94"
                        backgroundColor="#fff5f6"
                    />
                    <MetricCard
                        title="Clientes não Positivados"
                        value="$32,100"
                        percentage="+8%"
                        trend="up"
                        graphColor="#ffd3b6"
                        backgroundColor="#fff9f5"
                    />
                </div>

                {/* Div que agrupa o BarChart */}
                <div className="chart-section">
                    <BarChart />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
