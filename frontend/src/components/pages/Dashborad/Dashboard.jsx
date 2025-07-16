// Dashboard.jsx
import React, { useState, useEffect } from 'react';
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
  const [objetivosVendedores, setObjetivosVendedores] = useState([]);
  const [periodoSelecionado, setPeriodoSelecionado] = useState(null);
  const [usarPDV, setUsarPDV] = useState(false);
  const [vendasColaboradores, setVendasColaboradores] = useState([]);

  useEffect(() => {
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
        <PeriodoSelector 
          onChange={(dados) => {
            if (dados?.de && dados?.ate) {
              setPeriodoSelecionado({ de: dados.de, ate: dados.ate });
            } else if (dados?.mes) {
              const [ano, mes] = dados.mes.split('-');
              const de = `${ano}-${mes}-01`;
              const ate = new Date(ano, mes, 0).toISOString().split('T')[0];
              setPeriodoSelecionado({ de, ate });
            }
          }} 
          usarPDV={usarPDV}
          onTogglePDV={() => setUsarPDV(prev => !prev)}
        />
        <IndicativosDeVenda periodoSelecionado={periodoSelecionado} usarPDV={usarPDV} onObjetivosRecebidos={setObjetivosVendedores} />
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
            <BarChartColaboradores dados={vendasColaboradores} />
          )}

          {modo === 'individual' && colaboradorSelecionado && (
            <>
              <CardsColaborador colaborador={colaboradorSelecionado} objetivosVendedores={objetivosVendedores} />
              {colaboradorSelecionado.colaborador}
            </>
          )}
        </div>

        <div style={{ flex: 1 }}>
          {modo === 'geral' && (
            <IndicativosTabelaVendedor 
              periodoSelecionado={periodoSelecionado}
              onSelecionarColaborador={colab => {
                setColaboradorSelecionado(colab);
                setModo('individual');
              }}
              onDadosAtualizados={setVendasColaboradores}
              onObjetivosRecebidos={setObjetivosVendedores}
            />
          )}

          {modo === 'individual' && colaboradorSelecionado && (
            colaboradorSelecionado.colaborador.includes('Ana Paula Silva Peixoto') && (
              <CardsDetalhadosVendedor />
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
