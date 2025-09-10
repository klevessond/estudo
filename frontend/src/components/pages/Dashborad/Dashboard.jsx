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
import { useAuth } from '../../../contexts/auth';
import './Dashboard.css';

const Dashboard = () => {
  const { can, loading } = useAuth();

  const [modo, setModo] = useState('geral');
  const [colaboradorSelecionado, setColaboradorSelecionado] = useState(null);
  const [objetivosVendedores, setObjetivosVendedores] = useState([]);
  const [periodoSelecionado, setPeriodoSelecionado] = useState(null);
  const [usarPDV, setUsarPDV] = useState(false);
  const [vendasColaboradores, setVendasColaboradores] = useState([]);

  // Gate: apenas admin/supervisor podem ver a tabela e o modo "individual"
  const podeVerTabela = can(["admin","supervisor","vendedor"]);
  const isRestricted = !podeVerTabela; // vendedor e afins

  useEffect(() => {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const de = `${ano}-${mes}-01`;
    const ate = new Date(ano, Number(mes), 0).toISOString().split('T')[0];
    setPeriodoSelecionado({ de, ate });
  }, []);

  // Logs auxiliares
  useEffect(() => {
    console.log('[Dashboard] objetivosVendedores atualizados:', objetivosVendedores);
  }, [objetivosVendedores]);
  useEffect(() => {
    console.log('[Dashboard] vendasColaboradores atualizados:', vendasColaboradores);
  }, [vendasColaboradores]);
  useEffect(() => {
    console.log('[Dashboard] colaboradorSelecionado atualizado:', colaboradorSelecionado);
  }, [colaboradorSelecionado]);

  // Se o usuário não tem permissão, garante que fique sempre no modo "geral"
  useEffect(() => {
    if (isRestricted && modo !== 'geral') {
      setModo('geral');
      setColaboradorSelecionado(null);
    }
  }, [isRestricted, modo]);

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
              const ate = new Date(Number(ano), Number(mes), 0).toISOString().split('T')[0];
              setPeriodoSelecionado({ de, ate });
            }
          }}
          usarPDV={usarPDV}
          onTogglePDV={() => setUsarPDV(prev => !prev)}
        />

        <IndicativosDeVenda
          periodoSelecionado={periodoSelecionado}
          usarPDV={usarPDV}
          onObjetivosRecebidos={setObjetivosVendedores}
        />
      </div>

      {/* Botões de modo: só mostram para admin/supervisor */}
      {!isRestricted && (
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
      )}

      <div style={{ display: 'flex', flexDirection: 'row', gap: '1rem', alignItems: 'flex-start' }}>
        <div style={{ flex: 2 }}>
          {/* “Geral” sempre aparece para todos */}
          {modo === 'geral' && !isRestricted && (
            <BarChartColaboradores dados={vendasColaboradores} />
          )}

          {/* “Individual” só fica acessível quando há permissão e houve seleção */}
          {!isRestricted && modo === 'individual' && colaboradorSelecionado && (
            <>
              <CardsColaborador
                colaborador={colaboradorSelecionado}
                objetivosVendedores={objetivosVendedores}
                periodoSelecionado={periodoSelecionado}
              />
              {colaboradorSelecionado.colaborador}
            </>
          )}
        </div>

        <div style={{ flex: 1 }}>
          {/* Tabela de vendedores só para admin/supervisor */}
          {modo === 'geral' && podeVerTabela && (
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

          {/* Exemplo especial “Ana Paula” continua, mas só no fluxo permitido */}
          {!isRestricted &&
            modo === 'individual' &&
            colaboradorSelecionado &&
            colaboradorSelecionado.colaborador.includes('Ana Paula Silva Peixoto') && (
              <CardsDetalhadosVendedor />
            )
          }
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
