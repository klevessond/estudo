import React, { useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  LabelList,
} from 'recharts';
import './BarChartsColaboradoresKPIs.css';

function toPct(num, den) {
  const n = Number(num || 0);
  const d = Number(den || 0);
  if (!d) return 0;
  return (n / d) * 100;
}

const BarChartsColaboradoresKPIs = ({ dados = [], objetivos = [] }) => {
  const [modo, setModo] = useState('financeiro'); // 'financeiro' | 'positivacao' | 'peso' | 'mix'

  // Map objetivos por vendedor_id (string) para lookup rápido
  const objetivosMap = useMemo(() => {
    const map = new Map();
    (objetivos || []).forEach((o) => {
      map.set(String(o.vendedor_id ?? o.codFuncionario), o);
    });
    return map;
  }, [objetivos]);

  // Dataset para o gráfico (percentual por vendedor, com ordenação)
  const dataset = useMemo(() => {
    const rows = (dados || []).map((v) => {
      const obj = objetivosMap.get(String(v.codFuncionario)) || {};
      const nomeCurto =
        String(v.colaborador || '')
          .trim()
          .split(' ')
          .slice(0, 2)
          .join(' ') || '—';

      let pct = 0;
      if (modo === 'financeiro') {
        pct = toPct(v.faturado, obj.objetivo_financeiro);
      } else if (modo === 'positivacao') {
        pct = toPct(v.qtdClientes, obj.objetivo_positivacao);
      } else if (modo === 'peso') {
        pct = toPct(v.pesototalvendido, obj.objetivo_peso);
      } else if (modo === 'mix') {
        pct = toPct(v.mix, obj.objetivo_mix);
      }

      return {
        nome: nomeCurto,
        Percentual: Number.isFinite(pct) ? pct : 0,
      };
    });

    rows.sort((a, b) => b.Percentual - a.Percentual);
    return rows;
  }, [dados, objetivosMap, modo]);

  // Somatórios (realizado e objetivo) para cada KPI — usados no título
  const sums = useMemo(() => {
    return (dados || []).reduce(
      (acc, v) => {
        const obj = objetivosMap.get(String(v.codFuncionario)) || {};
        // financeiro
        acc.finReal += Number(v.faturado || 0);
        acc.finObj += Number(obj.objetivo_financeiro || 0);
        // positivação
        acc.posReal += Number(v.qtdClientes || 0);
        acc.posObj += Number(obj.objetivo_positivacao || 0);
        // peso
        acc.pesoReal += Number(v.pesototalvendido || 0);
        acc.pesoObj += Number(obj.objetivo_peso || 0);
        // mix
        acc.mixReal += Number(v.mix || 0);
        acc.mixObj += Number(obj.objetivo_mix || 0);
        return acc;
      },
      {
        finReal: 0,
        finObj: 0,
        posReal: 0,
        posObj: 0,
        pesoReal: 0,
        pesoObj: 0,
        mixReal: 0,
        mixObj: 0,
      }
    );
  }, [dados, objetivosMap]);

  // Percentual total atingido conforme modo atual (para o título)
  const totalPct = useMemo(() => {
    if (modo === 'financeiro') return toPct(sums.finReal, sums.finObj);
    if (modo === 'positivacao') return toPct(sums.posReal, sums.posObj);
    if (modo === 'peso') return toPct(sums.pesoReal, sums.pesoObj);
    if (modo === 'mix') return toPct(sums.mixReal, sums.mixObj);
    return 0;
  }, [modo, sums]);

  // Média dos percentuais individuais (linha no gráfico)
  const mediaPct = useMemo(() => {
    if (!dataset.length) return 0;
    const soma = dataset.reduce((acc, r) => acc + Number(r.Percentual || 0), 0);
    return soma / dataset.length;
  }, [dataset]);

  const tituloBase = {
    financeiro: '% — Financeiro',
    positivacao: '% — Positivação',
    peso: '% — Peso',
    mix: '% — Mix',
  }[modo];

  // eixo Y adaptativo (mín. 100, sobe em múltiplos de 10 conforme topo, média + 10% de folga)
  const yMax = useMemo(() => {
    const top = Math.max(dataset[0]?.Percentual || 0, mediaPct, 100);
    const step = 10;
    return Math.ceil((top * 1.1) / step) * step;
  }, [dataset, mediaPct]);

  // Label custom pra aparecer no topo da barra (ex.: "87.5%")
  const renderBarLabel = (props) => {
    const { x, y, width, height, value } = props;
    const val = Number(value ?? 0);
    if (!Number.isFinite(val) || height < 12) return null; // oculta em barras muito baixas
    const cx = x + width / 2;
    const cy = y - 6; // 6px acima do topo da barra
    return (
      <text x={cx} y={cy} textAnchor="middle" className="bar-label">
        {val.toFixed(1)}%
      </text>
    );
  };

  return (
    <div className="barcharts-kpis">
      <div className="kpis-toolbar">
        <div className="kpis-tabs">
          <button
            onClick={() => setModo('financeiro')}
            className={`mode-btn ${modo === 'financeiro' ? 'active' : ''}`}
          >
            Financeiro %
          </button>
          <button
            onClick={() => setModo('positivacao')}
            className={`mode-btn ${modo === 'positivacao' ? 'active' : ''}`}
          >
            Positivação %
          </button>
          <button
            onClick={() => setModo('peso')}
            className={`mode-btn ${modo === 'peso' ? 'active' : ''}`}
          >
            Peso %
          </button>
          <button
            onClick={() => setModo('mix')}
            className={`mode-btn ${modo === 'mix' ? 'active' : ''}`}
          >
            Mix %
          </button>
        </div>
      </div>

      {/* Título centralizado com destaque no percentual total */}
      <div className="kpis-title">
        {tituloBase}• Total atingido:{' '}
        <span className="kpis-title__highlight">{totalPct.toFixed(2)}%</span>
      </div>

      <div className="chart-shell">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dataset} margin={{ top: 20, right: 20, left: 20, bottom: 80 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="nome" angle={-45} textAnchor="end" interval={0} height={80} />
            <YAxis domain={[0, yMax]} />
            <Tooltip
              formatter={(value) => `${Number(value).toFixed(2)}%`}
              contentStyle={{ borderRadius: 10, boxShadow: '0 6px 20px rgba(0,0,0,.12)' }}
            />
              <Bar dataKey="Percentual" fill="var(--kpi-blue)" radius={[6, 6, 0, 0]}>
                <LabelList dataKey="Percentual" content={renderBarLabel} />
              </Bar>

              {/* Agora as linhas ficam NA FRENTE porque vêm depois no DOM */}
              <ReferenceLine
                y={mediaPct}
                stroke="var(--kpi-orange)"
                strokeDasharray="6 2"
                strokeWidth={2}
                label={{ value: `Média ${mediaPct.toFixed(1)}%`, position: 'center', fill: 'var(--danger, red)' }}
              />
              <ReferenceLine
                y={100}
                stroke="var(--kpi-green)"
                strokeDasharray="3 3"
                strokeWidth={2}
                label="Meta 100%"
              />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="kpis-legend">
        <span className="dot dot-blue" /> Percentual atingido
        <span className="spacer" />
        <span className="dot dot-green" /> Linha de meta (100%)
        <span className="spacer" />
        <span className="dot dot-orange" /> Média da equipe
      </div>
    </div>
  );
};

export default BarChartsColaboradoresKPIs;
