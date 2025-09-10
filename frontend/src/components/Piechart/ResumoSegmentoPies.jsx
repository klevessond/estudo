import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Plot from "react-plotly.js";
import api from "../../api";
import "../Piechart/PieChart.css"

// Normaliza qualquer número (aceita "1.234,56", "1234,56", "1234.56", inteiro, etc.)
function toNumber(v) {
  if (v == null) return 0;
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  if (typeof v === "string") {
    const s = v.replace(/\./g, "").replace(",", "."); // BR -> EN
    const n = Number(s.trim());
    return Number.isFinite(n) ? n : 0;
  }
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export default function ResumoSegmentoPies({ periodoSelecionado, codFuncionario }) {
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);
  const [linhas, setLinhas] = useState([]);

  // Largura reativa dos contêineres
  const wrapRef = useRef(null);
  const [wrapWidth, setWrapWidth] = useState(0);

  useLayoutEffect(() => {
    if (!wrapRef.current) return;
    const el = wrapRef.current;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) {
        const w = Math.max(320, Math.floor(e.contentRect.width / 2) - 12); // metade para cada pizza
        setWrapWidth(w);
      }
    });
    ro.observe(el);
    // dispara um "resize" para o Plotly recalcular
    const kick = () => window.dispatchEvent(new Event("resize"));
    kick();
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const run = async () => {
      try {
        setErro(null);
        if (!periodoSelecionado?.de || !periodoSelecionado?.ate || !codFuncionario) {
          setLinhas([]);
          return;
        }
        setLoading(true);
        const { de, ate } = periodoSelecionado;

        // ✅ seu padrão: await api.get com params
        const response = await api.get("/resumo-segmento-area-venda/", {
          params: { de, ate, cod_funcionarios: codFuncionario },
        });

        const data = response?.data?.resultado ?? [];
        console.log("[ResumoSegmentoPies] linhas (amostra):", data.slice(0, 5));
        setLinhas(Array.isArray(data) ? data : []);
      } catch (e) {
        setErro(e?.message || "Erro ao carregar resumo.");
        setLinhas([]);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [periodoSelecionado, codFuncionario]);

  // === Agrupamento com fallbacks robustos ===
  const { labels, valoresClientes, valoresPositivacoes, debug } = useMemo(() => {
    const acc = new Map();
    for (const r of linhas) {
      const seg =
        r.Segmento ?? r.segmento ?? r.segment ?? r.SEGMENTO ?? "—";

      // variações possíveis dos campos (PascalCase, camelCase, snake_case)
      const base =
        toNumber(r.QtdCliente ?? r.qtdCliente ?? r.qtd_cliente ?? r.QTDCLIENTE);
      const pedidoCli =
        toNumber(r.QtdClientePedido ?? r.qtdClientePedido ?? r.qtd_cliente_pedido);
      const visitaCli =
        toNumber(r.QtdClienteVisita ?? r.qtdClienteVisita ?? r.qtd_cliente_visita);
      const posiCli =
        toNumber(
          r.QtdClienteVisitaPositivada ??
            r.qtdClienteVisitaPositivada ??
            r.qtd_cliente_visita_positivada
        );
      const qtdPedido =
        toNumber(r.QtdPedido ?? r.qtdPedido ?? r.qtd_pedido);

      if (!acc.has(seg)) acc.set(seg, { base: 0, pedidoCli: 0, visitaCli: 0, posiCli: 0, qtdPedido: 0 });
      const x = acc.get(seg);
      x.base += base;
      x.pedidoCli += pedidoCli;
      x.visitaCli += visitaCli;
      x.posiCli += posiCli;
      x.qtdPedido += qtdPedido;
    }

    let sumPedidoCli = 0, sumVisitaCli = 0, sumBase = 0, sumPosi = 0, sumQtdPedido = 0;
    for (const v of acc.values()) {
      sumPedidoCli += v.pedidoCli;
      sumVisitaCli += v.visitaCli;
      sumBase += v.base;
      sumPosi += v.posiCli;
      sumQtdPedido += v.qtdPedido;
    }

    // Clientes: pedidoCli > visitaCli > base
    const keyClientes = sumPedidoCli > 0 ? "pedidoCli" : (sumVisitaCli > 0 ? "visitaCli" : "base");
    // Positivação: posiCli > qtdPedido
    const keyPosi = sumPosi > 0 ? "posiCli" : "qtdPedido";

    const labels = [];
    const valsClientes = [];
    const valsPosi = [];
    for (const [seg, v] of acc.entries()) {
      labels.push(seg);
      valsClientes.push(v[keyClientes]);
      valsPosi.push(v[keyPosi]);
    }

    const debug = { sumPedidoCli, sumVisitaCli, sumBase, sumPosi, sumQtdPedido, keyClientes, keyPosi };
    console.log("[ResumoSegmentoPies] somas:", debug);

    return { labels, valoresClientes: valsClientes, valoresPositivacoes: valsPosi, debug };
  }, [linhas]);

  if (loading) return <div>Carregando gráficos…</div>;
  if (erro) return <div style={{ color: "crimson" }}>{erro}</div>;

  const totalClientes = valoresClientes.reduce((a, b) => a + b, 0);
  const totalPosi = valoresPositivacoes.reduce((a, b) => a + b, 0);

return (
  <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
    {/* Pizza 1 */}
    <div className="pie-chart-plotly-container">
      <h4 style={{ marginBottom: 8, textAlign: "left" }}>Segmentos × Clientes</h4>
      {totalClientes > 0 ? (
        <Plot
          data={[{
            type: "pie",
            labels,
            values: valoresClientes,
            textinfo: "label+value+percent",
            insidetextorientation: "auto",
            textposition: "inside",
            hoverinfo: "label+value+percent",
            domain: { x: [0, 0.78], y: [0, 1] },
            sort: false,
          }]}
          layout={{
            margin: { t: 24, b: 24, l: 24, r: 200 },
            height: 360,
            width: 720,
            showlegend: true,
            legend: { x: 1.02, xanchor: "left", y: 0.5, orientation: "v" },
          }}
          config={{ responsive: true, displaylogo: false, modeBarButtonsToRemove: ["toImage"] }}
          style={{ width: "100%" }}
          key={`clientes-${labels.length}-${totalClientes}`}
        />
      ) : (
        <div>Sem valores &gt; 0 para Clientes.</div>
      )}
    </div>

    {/* Pizza 2 */}
    <div className="pie-chart-plotly-container">
      <h4 style={{ marginBottom: 8, textAlign: "left" }}>Segmentos × Positivações</h4>
      {totalPosi > 0 ? (
        <Plot
          data={[{
            type: "pie",
            labels,
            values: valoresPositivacoes,
            textinfo: "label+value+percent",
            insidetextorientation: "auto",
            textposition: "inside",
            hoverinfo: "label+value+percent",
            domain: { x: [0, 0.78], y: [0, 1] },
            sort: false,
          }]}
          layout={{
            margin: { t: 24, b: 24, l: 24, r: 200 },
            height: 360,
            width: 720,
            showlegend: true,
            legend: { x: 1.02, xanchor: "left", y: 0.5, orientation: "v" },
          }}
          config={{ responsive: true, displaylogo: false, modeBarButtonsToRemove: ["toImage"] }}
          style={{ width: "100%" }}
          key={`posi-${labels.length}-${totalPosi}`}
        />
      ) : (
        <div>Sem valores &gt; 0 para Positivações.</div>
      )}
    </div>
  </div>
);
}
