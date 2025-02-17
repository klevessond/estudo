import React, { useRef, useEffect } from 'react';
import MetricCard from '../../metricard/MetricCard';
import './Dashboard.css';

const Dashboard = () => {
    return (
        <div className="dashboard">
            <h1>Dashboard</h1>
            <div className="metric-cards">
                <MetricCard
                    title="Acme Plus"
                    value="$24,780"
                    percentage="+49%"
                    trend="up"
                    graphColor="#a8e6cf"
                />
                <MetricCard
                    title="Acme Advanced"
                    value="$17,489"
                    percentage="-12%"
                    trend="down"
                    graphColor="#ff8b94"
                />
                <MetricCard
                    title="Acme Professional"
                    value="$32,100"
                    percentage="+8%"
                    trend="up"
                    graphColor="#ffd3b6"
                />
            </div>
        </div>
    );
};

export default Dashboard;