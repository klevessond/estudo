// Dashboard.jsx
import React, { useState, useEffect, useMemo } from 'react';
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
  const podeVerTabela = can(['admin', 'supervisor', 'vendedor']);
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

  // === NOVO: lista de vendedores da mesma área (derivada da tabela já filtrada) ===
  const vendedoresDaArea = useMemo(
    () =>
      (vendasColaboradores || [])
        .map((v) => Number(v.codFuncionario))
        .filter((n) => Number.isFinite(n)),
    [vendasColaboradores]
  );

  return (
    <main className="dashboard">
      <div className="dashboard-container">
        {/* TOPO FIXO: filtros colapsáveis */}
        <div className="sticky-top">
          <details className="filters" open={false}>
            <summary>Selecionar período</summary>
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
              onTogglePDV={() => setUsarPDV((prev) => !prev)}
            />
          </details>
        </div>

        {/* KPIs EM FAIXA HORIZONTAL (carrossel com snap) */}
        <div className="kpi-strip">
          <IndicativosDeVenda
            periodoSelecionado={periodoSelecionado}
            usarPDV={usarPDV}
            onObjetivosRecebidos={setObjetivosVendedores}
            vendedoresDaArea={vendedoresDaArea}
          />
        </div>

        {/* Botões de modo */}
        {!isRestricted && (
          <div style={{ margin: '8px 0', display: 'flex', gap: '8px' }}>
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

        {/* SEÇÕES INFERIORES — empilha no mobile; 2 colunas no desktop */}
        <div className="grid-2">
          <section className="section">
            {/* “Geral” sempre aparece para todos */}
            {modo === 'geral' && !isRestricted && (
              <BarChartColaboradores dados={vendasColaboradores} />
            )}

            {/* “Individual” só com permissão e seleção */}
            {!isRestricted && modo === 'individual' && colaboradorSelecionado && (
              <>
                <CardsColaborador
                  colaborador={colaboradorSelecionado}
                  objetivosVendedores={objetivosVendedores}
                />
                {colaboradorSelecionado.colaborador}
              </>
            )}
          </section>

          <section className="section">
            {/* Tabela de vendedores só para admin/supervisor */}
            {modo === 'geral' && podeVerTabela && (
              <IndicativosTabelaVendedor
                periodoSelecionado={periodoSelecionado}
                onSelecionarColaborador={(colab) => {
                  setColaboradorSelecionado(colab);
                  setModo('individual');
                }}
                onDadosAtualizados={setVendasColaboradores}
                onObjetivosRecebidos={setObjetivosVendedores}
                objetivosVendedores={objetivosVendedores}
              />
            )}

            {/* Exemplo especial “Ana Paula” */}
            {!isRestricted &&
              modo === 'individual' &&
              colaboradorSelecionado &&
              colaboradorSelecionado.colaborador.includes('Ana Paula Silva Peixoto') && (
                <CardsDetalhadosVendedor />
              )}
          </section>
        </div>
      </div>
    </main>
  );
};

export default Dashboard;
