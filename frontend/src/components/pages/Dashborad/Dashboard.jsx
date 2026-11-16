import React, { useState, useEffect, useMemo, useRef } from 'react';
import './Dashboard.css';
import { getMinhaUg, getPdvPorVendedor } from '../../../services/indicadoresApi';

import { useAuth } from '../../../contexts/auth';

import PeriodoSelector from '../../ResumoVendas/PeriodoSelector';
import IndicativosDeVenda from '../../metricard/IndicativosDeVenda';
import IndicativosTabelaVendedor from '../../metricard/IndicativosTabelaVendedor';
import CardsColaborador from '../../metricard/CardsColaborador';
import CardsDetalhadosVendedor from '../../metricard/CardsDetalhadosVendedor';
import BarChartsColaboradoresKPIs from '../../BarChart/BarChartsColaboradoresKPIs';
import CardsCampanhas from '../../metricard/CardsCampanhas';

// LOG helper
const logUG = (payload, extra = {}) => {
  const ts = new Date().toISOString();
  console.groupCollapsed(
    '%c[UG] %c/indicadores/minha-ug%c @ ' + ts,
    'color:#6b7280;font-weight:bold;',
    'color:#2563eb;',
    'color:#6b7280;'
  );
  console.info('↳ payload:', payload);
  if (Object.keys(extra).length) console.info('↳ meta:', extra);
  console.groupEnd();
};

const Dashboard = () => {
  const { can } = useAuth();

  const [modo, setModo] = useState('geral'); // 'geral' | 'individual'
  const [modoKPI, setModoKPI] = useState('financeiro');
  const [colaboradorSelecionado, setColaboradorSelecionado] = useState(null);
  const [objetivosVendedores, setObjetivosVendedores] = useState([]);
  const [periodoSelecionado, setPeriodoSelecionado] = useState(null);
  const [usarPDV, setUsarPDV] = useState(true);
  const [vendasColaboradores, setVendasColaboradores] = useState([]);
  const [isPdvLoading, setIsPdvLoading] = useState(false);
  const [temPDV, setTemPDV] = useState(false);

  // PDV distribuído por vendedor (para a tabela somar na linha do vendedor)
  const [pdvPorVendedor, setPdvPorVendedor] = useState([]);

  // Filtro (gerente): vendedores permitidos na tabela quando uma supervisão é selecionada
  const [vendedoresPermitidosTabela, setVendedoresPermitidosTabela] = useState([]);
  const [projecoesPorVendedor, setProjecoesPorVendedor] = useState({});

  // refs para evitar chamadas repetidas/concorrentes
  const ultimaChaveFetchRef = useRef('');
  const abortCtrlRef = useRef(null);
  const ultimaAssinaturaPDVRef = useRef('');

  // Gate: apenas admin/supervisor/vendedor podem ver as seções mais completas
  const podeVerTabela = can(['admin', 'supervisor', 'vendedor']);
  const isRestricted = !podeVerTabela;

  // Define período inicial (mês corrente)
  useEffect(() => {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const de = `${ano}-${mes}-01`;
    const ate = new Date(ano, Number(mes), 0).toISOString().split('T')[0];
    setPeriodoSelecionado({ de, ate });
  }, []);

  // Checar UG do usuário (leve) e ligar PDV automaticamente se UG válida (≠ '', null, '1')
  useEffect(() => {
    const checarUG = async () => {
      try {
        const t0 = performance.now();
        const resp = await getMinhaUg();
        const data = resp.data;
        const t1 = performance.now();

        logUG(data, { status: resp.status, duration_ms: Math.round(t1 - t0) });

      const temPDVBackend = data?.tem_pdv ?? false;
      setTemPDV(temPDVBackend);
      setUsarPDV(temPDVBackend);
      } catch (err) {
        console.groupCollapsed('%c[UG][ERRO]', 'color:#b91c1c;font-weight:bold;');
        console.error(err);
        console.groupEnd();
      }
    };
    checarUG();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reseta modo se necessário
  useEffect(() => {
    if (isRestricted && modo !== 'geral') {
      setModo('geral');
      setColaboradorSelecionado(null);
    }
  }, [isRestricted, modo]);

  // Deriva lista de vendedores da área a partir da tabela já filtrada
  const vendedoresDaArea = useMemo(
    () =>
      (vendasColaboradores || [])
        .map((v) => Number(v.codFuncionario))
        .filter((n) => Number.isFinite(n)),
    [vendasColaboradores]
  );

  // Buscar PDV distribuído por vendedor e guardar em estado
  useEffect(() => {
    const fetchPDVDistribuido = async () => {
      const de = periodoSelecionado?.de;
      const ate = periodoSelecionado?.ate;

      if (!usarPDV || !de || !ate) {
        console.debug('[Dashboard] PDV distribuído: skip (usarPDV=', usarPDV, ', período=', periodoSelecionado, ')');
        setPdvPorVendedor([]);
        ultimaChaveFetchRef.current = ''; // reseta a chave
        return;
      }

      if (!Array.isArray(vendedoresDaArea) || vendedoresDaArea.length === 0) {
        console.debug('[Dashboard] PDV distribuído: skip — sem vendedoresDaArea ainda.');
        setPdvPorVendedor([]);
        ultimaChaveFetchRef.current = ''; // reseta a chave
        return;
      }

      const vendParam = vendedoresDaArea.join(',');
      const chave = `${de}|${ate}|${usarPDV ? 1 : 0}|${vendParam}`;

      if (ultimaChaveFetchRef.current === chave) {
        // já fizemos esta chamada com esses parâmetros
        console.debug('[Dashboard] PDV distribuído: já atualizado para', chave);
        return;
      }

      // cancela requisição anterior (se houver)
      if (abortCtrlRef.current) {
        abortCtrlRef.current.abort();
      }
      const ctrl = new AbortController();
      abortCtrlRef.current = ctrl;
      setIsPdvLoading(true);
      try {
        console.debug('[Dashboard] chamando /indicadores/pdv-por-vendedor', { de, ate, vendParam });

        const { data } = await getPdvPorVendedor({
          params: { de, ate, vendedores: vendParam },
          signal: ctrl.signal, // funciona no axios >=1.4 usando fetch adapter; se não, ignora
        });
        //console.log('[PDV-por-vendedor][RAW RESPONSE]', data);

        // Esperado: data.resultado é OBJETO: { "178": { pdv:{valor,peso}, ... }, "224": {...}, ... }
        const mapa = data?.resultado || {};
        const chaves = Object.keys(mapa);

        const norm = chaves.map((k) => {
          const r = mapa[k] || {};
          const pdv = r.pdv || {};
          return {
            codFuncionario: Number(k),
            valor: Number(pdv.valor || 0),
            peso: Number(pdv.peso || 0),
          };
        });

        // Evita setState se não mudou (assinatura leve)
        const assinaturaNova =
          `${norm.length}-` +
          norm
            .slice(0, 10)
            .map((x) => `${x.codFuncionario}:${x.valor}:${x.peso}`)
            .join('|');

        if (assinaturaNova !== ultimaAssinaturaPDVRef.current) {
          setPdvPorVendedor(norm);
          ultimaAssinaturaPDVRef.current = assinaturaNova;
          ultimaChaveFetchRef.current = chave;
          console.debug('[Dashboard] PDV distribuído atualizado:', {
            vendedoresSolicitados: vendedoresDaArea.length,
            vendedoresRespondidos: chaves.length,
            sample: norm.slice(0, 5),
          });
        } else {
          // nada mudou — não seta estado para não re-renderizar sem necessidade
          ultimaChaveFetchRef.current = chave;
          console.debug('[Dashboard] PDV distribuído: sem mudanças (assinatura igual).');
        }
      } catch (err) {
        if (err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED') {
          console.debug('[Dashboard] PDV distribuído: requisição cancelada.');
        } else {
          console.error('[PDV-por-vendedor][ERRO]', err);
        }
      } finally {
        // limpa o controller atual
        if (abortCtrlRef.current === ctrl) {
          abortCtrlRef.current = null;
        }
        setIsPdvLoading(false);
      }
    };

    fetchPDVDistribuido();

    // cleanup ao desmontar
    return () => {
      if (abortCtrlRef.current) {
        abortCtrlRef.current.abort();
        abortCtrlRef.current = null;
      }
    };
  }, [usarPDV, periodoSelecionado, vendedoresDaArea]);

  return (
    <main className="dashboard">
      <div className="dashboard-container">
        {/* Filtros (período + PDV toggle) */}
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
              temPDV={temPDV}
              usarPDV={usarPDV}
              onTogglePDV={() => setUsarPDV((prev) => !prev)}
            />
          </details>
        </div>

        {/* Faixa de KPIs (cards) */}
        <div className="kpi-strip">
          <IndicativosDeVenda
            periodoSelecionado={periodoSelecionado}
            usarPDV={usarPDV} // quando true, o componente somará /indicadores/pdv?de&ate
            onObjetivosRecebidos={setObjetivosVendedores}
            vendedoresDaArea={vendedoresDaArea}
            onVendasColaboradores={setVendasColaboradores}
            onVendedoresPermitidosTabelaChange={setVendedoresPermitidosTabela}
            onProjecoesPorVendedorChange={setProjecoesPorVendedor}  
          />
        </div>

        {/* Campanhas em andamento (o backend já restringe os números ao papel do usuário) */}
        <CardsCampanhas />

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

        {/* Corpo: gráficos e tabela */}
        <div className="grid-2">
          <section className="section">
            {/* KPI por colaboradores (somente para perfis com acesso amplo e no modo geral) */}
            {modo === 'geral' && !isRestricted && (
              <BarChartsColaboradoresKPIs
                dados={vendasColaboradores}
                objetivos={objetivosVendedores}
                 onModoChange={setModoKPI}
              />
            )}

            {/* Modo individual */}
            {!isRestricted && modo === 'individual' && colaboradorSelecionado && (
              <>
                <CardsColaborador
                  colaborador={colaboradorSelecionado}
                  objetivosVendedores={objetivosVendedores}
                  periodoSelecionado={periodoSelecionado}
                  vendedoresList={vendasColaboradores}
                  onNavegar={(colab) => setColaboradorSelecionado(colab)}
                  projecoesPorVendedor={projecoesPorVendedor}
                />
                {colaboradorSelecionado.colaborador}
                {colaboradorSelecionado.colaborador?.includes('Ana Paula Silva Peixoto') && (
                  <CardsDetalhadosVendedor />
                )
                }
              </>
            )}
          </section>

          <section className="section">
            {/* Tabela de vendedores (admin/supervisor/vendedor) */}
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
                /* >>> Soma PDV direto na linha do vendedor <<< */
                usarPDV={usarPDV}
                pdvPorVendedor={pdvPorVendedor}
                vendedoresPermitidosTabela={vendedoresPermitidosTabela}
                isPdvLoading={isPdvLoading}
                modoKPI={modoKPI}
              />
            )}
          </section>
        </div>
      </div>
    </main>
  );
};

export default Dashboard;