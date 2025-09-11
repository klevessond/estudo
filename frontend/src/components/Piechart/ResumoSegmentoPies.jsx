// src/components/Piechart/ResumoSegmentoPies.jsx
import React, { useEffect, useMemo, useState } from "react";
import Plot from "react-plotly.js";
import api from "../../api";
import "../Piechart/PieChart.css"; // usa o seu CSS

// Paleta base (personalize à vontade)
const PALETTE = [
  "#2563EB", "#16A34A", "#DC2626", "#F59E0B", "#8B5CF6",
  "#0891B2", "#EF4444", "#10B981", "#F97316", "#0EA5E9",
  "#84CC16", "#A855F7", "#E11D48", "#14B8A6", "#F43F5E",
  "#22C55E", "#3B82F6", "#D946EF", "#9CA3AF", "#7C3AED",
];

export default function ResumoSegmentoPies({ periodoSelecionado, codFuncionario }) {
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);
  const [clientesData, setClientesData] = useState([]); // [{ Segmento, QtdCliente, PercCliente }]
  const [positData, setPositData] = useState([]);       // [{ Segmento, QtdClientePedido, PercPositivacao }]
  const [rateData, setRateData] = useState([]);         // [{ Segmento, QtdCliente, QtdClientePedido, PercTaxaPositivacao }]

  useEffect(() => {
    (async () => {
      try {
        setErro(null);
        if (!periodoSelecionado?.de || !periodoSelecionado?.ate || !codFuncionario) {
          setClientesData([]);
          setPositData([]);
          setRateData([]);
          return;
        }
        setLoading(true);
        const { de, ate } = periodoSelecionado;

        const response = await api.get("/resumo-segmento-area-venda/", {
          params: { de, ate, cod_funcionarios: codFuncionario },
        });

        const g = response?.data?.graficos || {};
        setClientesData(Array.isArray(g.segmentos_clientes) ? g.segmentos_clientes : []);
        setPositData(Array.isArray(g.segmentos_positivacoes) ? g.segmentos_positivacoes : []);
        setRateData(Array.isArray(g.segmentos_taxa_positivacao) ? g.segmentos_taxa_positivacao : []);
      } catch (e) {
        setErro(e?.message || "Erro ao carregar resumo.");
        setClientesData([]);
        setPositData([]);
        setRateData([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [periodoSelecionado, codFuncionario]);

  // Pie 1 — Segmentos x Clientes
  const { labelsCli, valuesCli, percsCli, totalCli } = useMemo(() => {
    const labels = clientesData.map(x => x.Segmento ?? "—");
    const values = clientesData.map(x => Number(x.QtdCliente) || 0);
    const percs  = clientesData.map(x => Number(x.PercCliente) || 0);
    const total  = values.reduce((a, b) => a + b, 0);
    return { labelsCli: labels, valuesCli: values, percsCli: percs, totalCli: total };
  }, [clientesData]);

  // Pie 2 — Segmentos x Positivações
  const { labelsPos, valuesPos, percsPos, totalPos } = useMemo(() => {
    const labels = positData.map(x => x.Segmento ?? "—");
    const values = positData.map(x => Number(x.QtdClientePedido) || 0);
    const percs  = positData.map(x => Number(x.PercPositivacao) || 0);
    const total  = values.reduce((a, b) => a + b, 0);
    return { labelsPos: labels, valuesPos: values, percsPos: percs, totalPos: total };
  }, [positData]);

  // Pie 3 — % Positivação por Segmento (dados já do backend)
  const {
    labelsRate,
    valuesRateBase,   // base de clientes (tamanho da fatia)
    posCounts,        // positivaram
    percsRate,        // % taxa (backend)
    totalRateBase
  } = useMemo(() => {
    const labels = rateData.map(x => x.Segmento ?? "—");
    const base   = rateData.map(x => Number(x.QtdCliente) || 0);
    const pos    = rateData.map(x => Number(x.QtdClientePedido) || 0);
    const percs  = rateData.map(x => Number(x.PercTaxaPositivacao) || 0);
    const total  = base.reduce((a, b) => a + b, 0);
    return { labelsRate: labels, valuesRateBase: base, posCounts: pos, percsRate: percs, totalRateBase: total };
  }, [rateData]);

  // Hover já formatado (evita customdata[...])
  const hoverTextRate = useMemo(() => {
    const fmt = (n, d = 2) => Number(n).toLocaleString("pt-BR", { minimumFractionDigits: d, maximumFractionDigits: d });
    return labelsRate.map((seg, i) =>
      `${seg}<br>Clientes: ${valuesRateBase[i]}<br>Positivaram: ${posCounts[i]} (${fmt(percsRate[i])}%)`
    );
  }, [labelsRate, valuesRateBase, posCounts, percsRate]);

  // Cores consistentes por segmento (mesmas nos 3 gráficos)
  const allSegments = useMemo(() => {
    return Array.from(new Set([...labelsCli, ...labelsPos, ...labelsRate])).filter(Boolean).sort();
  }, [labelsCli, labelsPos, labelsRate]);

  const colorMap = useMemo(() => {
    const map = new Map();
    allSegments.forEach((seg, i) => map.set(seg, PALETTE[i % PALETTE.length]));
    return map;
  }, [allSegments]);

  const colorsCli  = useMemo(() => labelsCli.map(seg => colorMap.get(seg) || PALETTE[0]), [labelsCli, colorMap]);
  const colorsPos  = useMemo(() => labelsPos.map(seg => colorMap.get(seg) || PALETTE[0]), [labelsPos, colorMap]);
  const colorsRate = useMemo(() => labelsRate.map(seg => colorMap.get(seg) || PALETTE[0]), [labelsRate, colorMap]);

  if (loading) return <div>Carregando gráficos…</div>;
  if (erro) return <div style={{ color: "crimson" }}>{erro}</div>;

  return (
    // Wrapper flex: mantém seu CSS nos cards e coloca lado a lado quando houver espaço (>= 560*2 + gap)
    <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "stretch" }}>
      {/* Pie 1: Segmentos × Clientes (legenda à direita) */}
      <div className="pie-chart-plotly-container">
        <h2>Segmentos × Clientes</h2>
        {totalCli > 0 ? (
          <Plot
            data={[
              {
                type: "pie",
                labels: labelsCli,
                values: valuesCli,
                customdata: percsCli, // percentual vindo da API
                textinfo: "label+value+percent",
                insidetextorientation: "auto",
                textposition: "inside",
                hovertemplate:
                  "%{label}<br>Clientes: %{value}<br>Participação: %{customdata:.2f}%<extra></extra>",
                domain: { x: [0, 0.78], y: [0, 1] },
                sort: false,
                marker: { colors: colorsCli },
              },
            ]}
            layout={{
              margin: { t: 24, b: 24, l: 24, r: 180 },
              height: 380,
              showlegend: true,
              legend: { orientation: "v", x: 1.02, xanchor: "left", y: 0.5 },
            }}
            config={{ responsive: true, displaylogo: false, modeBarButtonsToRemove: ["toImage"] }}
            useResizeHandler
            style={{ width: "100%", height: "380px" }}
          />
        ) : (
          <div>Sem valores &gt; 0 para Clientes.</div>
        )}
      </div>

      {/* Pie 2: Segmentos × Positivações (legenda à direita) */}
      <div className="pie-chart-plotly-container">
        <h2>Segmentos × Positivações</h2>
        {totalPos > 0 ? (
          <Plot
            data={[
              {
                type: "pie",
                labels: labelsPos,
                values: valuesPos,
                customdata: percsPos, // percentual vindo da API
                textinfo: "label+value+percent",
                insidetextorientation: "auto",
                textposition: "inside",
                hovertemplate:
                  "%{label}<br>Positivações: %{value}<br>Participação: %{customdata:.2f}%<extra></extra>",
                domain: { x: [0, 0.78], y: [0, 1] },
                sort: false,
                marker: { colors: colorsPos },
              },
            ]}
            layout={{
              margin: { t: 24, b: 24, l: 24, r: 180 },
              height: 380,
              showlegend: true,
              legend: { orientation: "v", x: 1.02, xanchor: "left", y: 0.5 },
            }}
            config={{ responsive: true, displaylogo: false, modeBarButtonsToRemove: ["toImage"] }}
            useResizeHandler
            style={{ width: "100%", height: "380px" }}
          />
        ) : (
          <div>Sem valores &gt; 0 para Positivações.</div>
        )}
      </div>

      {/* Pie 3: % Positivação por Segmento (pizza, legenda à direita) */}
      <div className="pie-chart-plotly-container">
        <h2>% Positivação por Segmento</h2>
        {totalRateBase > 0 ? (
          <Plot
            data={[
              {
                type: "pie",
                labels: labelsRate,
                values: valuesRateBase, // base de clientes do segmento (tamanho da fatia)
                text: percsRate.map(p => `${Number(p).toFixed(1)}%`), // mostra a % na fatia
                textinfo: "label+text",
                textposition: "inside",
                insidetextorientation: "auto",
                hovertext: labelsRate.map((seg, i) => {
                  const fmt = (n, d = 2) =>
                    Number(n).toLocaleString("pt-BR", { minimumFractionDigits: d, maximumFractionDigits: d });
                  return `${seg}<br>Clientes: ${valuesRateBase[i]}<br>Positivaram: ${posCounts[i]} (${fmt(percsRate[i])}%)`;
                }),
                hovertemplate: "%{hovertext}<extra></extra>", // evita customdata[...]
                domain: { x: [0, 0.78], y: [0, 1] },
                sort: false,
                marker: { colors: colorsRate },
              },
            ]}
            layout={{
              margin: { t: 24, b: 24, l: 24, r: 180 },
              height: 380,
              showlegend: true,
              legend: { orientation: "v", x: 1.02, xanchor: "left", y: 0.5 },
            }}
            config={{ responsive: true, displaylogo: false, modeBarButtonsToRemove: ["toImage"] }}
            useResizeHandler
            style={{ width: "100%", height: "380px" }}
          />
        ) : (
          <div>Sem valores &gt; 0 para Taxa de Positivação.</div>
        )}
      </div>
    </div>
  );
}
