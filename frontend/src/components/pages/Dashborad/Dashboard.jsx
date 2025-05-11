import React from 'react';
import MetricCard from '../../metricard/MetricCard';
import BarChart from '../../BarChart/BarChart';
import PieChart from  '../../Piechart/PieChart';
import ComboChart from '../../ComboChart/ComboChart';
import SalesMap from '../../Map/SalesMap';
import PieVendasCanceladas from '../../Piechart/PieVendasCanceladas';
import Linevendedores from '../../LineChart/Linevendedores';
import DencidadeCidadeChart from '../../ComboChart/DencidadeCidadeChart';
import VendacidadeQuartil from '../../Quartil/vendacidadequartil';
import ResumoVendas from '../../ResumoVendas/ResumoVendas';
import IndicativosDeVenda from '../../metricard/IndicativosDeVenda'; // já no padrão
import IndicativosTabelaVendedor from '../../metricard/IndicativosTabelaVendedor';
import './Dashboard.css';

const Dashboard = () => {
    return (
        <div>
            <div style={{ display: 'flex', flexDirection: 'row', gap: '2rem' }}>
                            <div><IndicativosDeVenda /></div>
                            <div><IndicativosTabelaVendedor /></div>
                </div>
            <div><ResumoVendas /></div>   
             <div className="metric-cards">
                        <MetricCard
                            title="Novos clientes"
                            value="50"
                            percentage="+49%"
                            trend="up"
                            graphColor="#a8e6cf"
                            backgroundColor="#f7fffa"
                        />
                        <MetricCard
                            title="Vendas novos clientes"
                            value="$170,489"
                            percentage="-12%"
                            trend="down"
                            graphColor="#ff8b94"
                            backgroundColor="#fff5f6"
                        />
                        <MetricCard
                            title="Clientes não Positivados"
                            value="25"
                            percentage="+8%"
                            trend="up"
                            graphColor="#ffd3b6"
                            backgroundColor="#fff9f5"
                        />
                        <MetricCard
                            title="Clientes Positivados"
                            value="  145"
                            percentage="-12%"
                            trend="down"
                            graphColor="#ff8b94"
                            backgroundColor="#fff5f6"
                        />
                    </div>
            <ComboChart/>
            <div>
                <div>
                   
                    <div className="chart-section">
                        <div className="pie-charts-row">
                            <PieChart />
                            <PieVendasCanceladas/>
                            </div>
                    </div>
                </div>
                <div>
                    <div className="chart-section right-section">
                       <VendacidadeQuartil />
                        <Linevendedores/>
                    </div>
                </div>
            </div>
            <div>
                {/* Container independente para o mapa */}
                <div className="map-section">
                    <SalesMap />
                    <DencidadeCidadeChart/>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
