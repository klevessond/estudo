import React, { useState } from 'react';
import { useEffect } from 'react'; // certifique-se que está importado
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
import IndicativosDeVenda from '../../metricard/IndicativosDeVenda';
import CardsColaborador from '../../metricard/CardsColaborador';
import IndicativosTabelaVendedor from '../../metricard/IndicativosTabelaVendedor';
import PeriodoSelector from '../../ResumoVendas/PeriodoSelector';
import BarChartColaboradores from '../../BarChart/BarChartColaboradores';
import CardsDetalhadosVendedor from '../../metricard/CardsDetalhadosVendedor';

import './Dashboard.css';



const Dashboard = () => {

const [modo, setModo] = useState('geral'); 
const [colaboradorSelecionado, setColaboradorSelecionado] = useState(null);
const [periodoSelecionado, setPeriodoSelecionado] = useState(null);
const [usarPDV, setUsarPDV] = useState(false);

  useEffect(() => {
  // Força o envio do mês atual assim que a tela é carregada
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, '0');
  const de = `${ano}-${mes}-01`;
  const ate = new Date(ano, mes, 0).toISOString().split('T')[0];

  setPeriodoSelecionado({ de, ate });
}, []);
    return (
        <div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <PeriodoSelector onChange={(dados) => {
                console.log('RECEBIDO EM DASHBOARD:', dados);
                if (dados?.de && dados?.ate) {
                    setPeriodoSelecionado({ de: dados.de, ate: dados.ate}); // garante que sempre vem um valor booleano
  
                } else if (dados?.mes) {
                    const [ano, mes] = dados.mes.split('-');
                    const de = `${ano}-${mes}-01`;
                    const ate = new Date(ano, mes, 0).toISOString().split('T')[0];
                    setPeriodoSelecionado({ de, ate });
                }
        }} 
       usarPDV={usarPDV}
       onTogglePDV={() => setUsarPDV(prev => !prev)}
        /><IndicativosDeVenda periodoSelecionado={periodoSelecionado} usarPDV={usarPDV}/>
            </div>
            <div style={{ margin: '1rem 0', display: 'flex', gap: '0.75rem' }}>
                <button
                    className={`btn-modo ${modo === 'geral' ? 'ativo' : ''}`}
                    onClick={() => setModo('geral')}
                >
                    Geral
                </button>
                <button
                    className={`btn-modo ${modo === 'individual' ? 'ativo' : ''}`}
                    onClick={() => setModo('individual')}
                    disabled={!colaboradorSelecionado}
                    style={{ opacity: !colaboradorSelecionado ? 0.5 : 1 }}
                >
                    Individual
                </button>
                </div>
            <div style={{ display: 'flex', flexDirection: 'row', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{ flex: 2 }}>
                {modo === 'geral' && (
                    <>
                    <BarChartColaboradores />
                    </>
                )}

                {modo === 'individual' && colaboradorSelecionado && (
                    <>
                    <CardsColaborador colaborador={colaboradorSelecionado} />
                    {colaboradorSelecionado.colaborador.includes('Ana Paula Silva Peixoto') }
                    </>
                )}
                </div>

                <div style={{ flex: 1 }}>
                {modo === 'geral' && (
                    <IndicativosTabelaVendedor
                    onSelecionarColaborador={colab => {
                        setColaboradorSelecionado(colab);
                        setModo('individual');
                    }}
                    />
                )}

                {modo === 'individual' && colaboradorSelecionado && (
                    colaboradorSelecionado.colaborador.includes('Ana Paula Silva Peixoto') && (
                    <CardsDetalhadosVendedor />
                    )
                )}
                </div>

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
