import React from 'react';
import MetricCard from '../../metricard/MetricCard';
import BarChart from '../../BarChart/BarChart';
import PieChart from  '../../Piechart/PieChart';
import ComboChart from '../../ComboChart/ComboChart';
import SalesMap from '../../Map/SalesMap';
import './Dashboard.css';

const Dashboard = () => {
    return (
        <div className="dashboard">
            <ComboChart />
            <div className="dashboard-container">
                <div>
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
                        <MetricCard
                            title="Clientes Positivados"
                            value="$17,489"
                            percentage="-12%"
                            trend="down"
                            graphColor="#ff8b94"
                            backgroundColor="#fff5f6"
                        />
                    </div>
                    <div className="chart-section">
                        <PieChart/>
                    </div>
                </div>
                <div className="chart-section right-section">
                    <BarChart />
                </div>
            </div>
            {/* Container independente para o mapa */}
            <div className="map-section">
                <SalesMap />
            </div>
        </div>
    );
};

export default Dashboard;
