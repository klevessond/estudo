import React, { useEffect, useState } from 'react';
import { getVendaHoje } from '../../services/indicadoresApi';
import { contarDiasUteisLocal } from '../../utils/diasUteis';
import './CardsColaborador.css';

// ===== Card Diário Necessário — vendedor individual =====
const CardDiarioNecessarioVendedor = ({
  codFuncionario,
  periodoSelecionado,
  objetivoFinanceiro,
  faturado,
  diasInfo,
}) => {
  const [vendaHojeInfo, setVendaHojeInfo] = useState(null); // { valor, preVenda } | null = carregando
  const [loadingHoje, setLoadingHoje] = useState(false);

  useEffect(() => {
    if (!codFuncionario) return;
    let cancelado = false;
    setLoadingHoje(true);
    getVendaHoje()
      .then(({ data }) => {
        if (cancelado) return;
        const entry = data?.por_vendedor?.[String(codFuncionario)];
        setVendaHojeInfo({
          valor: Number(entry?.valor || 0),
          preVenda: Number(entry?.pre_venda || 0),
        });
      })
      .catch(() => { if (!cancelado) setVendaHojeInfo({ valor: 0, preVenda: 0 }); })
      .finally(() => { if (!cancelado) setLoadingHoje(false); });
    return () => { cancelado = true; };
  }, [codFuncionario, periodoSelecionado?.de]);

  const fmt = (v) => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  let nDecorridos, nRestantes, nTotal;
  if (diasInfo) {
    nDecorridos = diasInfo.decorridos ?? 1;
    nRestantes  = diasInfo.restantes  ?? 0;
    nTotal      = diasInfo.totais     ?? 20;
  } else {
    const di   = periodoSelecionado?.de  ? new Date(periodoSelecionado.de  + 'T00:00:00') : null;
    const df   = periodoSelecionado?.ate ? new Date(periodoSelecionado.ate + 'T00:00:00') : null;
    const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
    const amanha = new Date(hoje); amanha.setDate(hoje.getDate() + 1);

    nTotal      = di && df ? contarDiasUteisLocal(di, df) : 20;
    nDecorridos = di && df ? contarDiasUteisLocal(di, hoje <= df ? hoje : df) : 1;
    nRestantes  = di && df && hoje < df ? contarDiasUteisLocal(amanha, df) : 0;
  }

  const meta   = objetivoFinanceiro || 0;
  const venda  = faturado || 0;
  const falta  = Math.max(meta - venda, 0);
  const batida = venda >= meta;
  const diaNec = (!batida && nRestantes > 0) ? falta / nRestantes : 0;

  const corDiaNec = batida ? '#16a34a' : '#d97706';

  const vendaHojeSemPre = vendaHojeInfo?.valor ?? null;
  const vendidoHojeTotal = vendaHojeInfo ? vendaHojeInfo.valor + vendaHojeInfo.preVenda : null;

  const corHojeSemPre = vendaHojeSemPre === null
    ? '#888'
    : vendaHojeSemPre >= diaNec ? '#16a34a'
    : vendaHojeSemPre >= diaNec * 0.7 ? '#d97706'
    : '#dc2626';

  const corHojeComPre = vendidoHojeTotal === null
    ? '#888'
    : vendidoHojeTotal >= diaNec ? '#16a34a'
    : vendidoHojeTotal >= diaNec * 0.7 ? '#d97706'
    : '#dc2626';

  if (!meta) return null;

  return (
    <div className="card" style={{ background: '#f0fdfa', borderLeft: '4px solid #0f766e' }}>
      <div className="card-title" style={{ color: '#0f766e' }}>📅 Diário Necessário</div>

      {/* Valor necessário por dia */}
      <div style={{ fontSize: '1.15rem', fontWeight: 800, color: corDiaNec, margin: '4px 0' }}>
        {batida ? '🏆 Meta atingida!'
          : nRestantes === 0 ? 'Período encerrado'
          : fmt(diaNec)}
      </div>
      <div style={{ fontSize: '0.75rem', color: '#555' }}>necessário/dia para bater a meta</div>

      {/* Barra de progresso */}
      <div className="progress-container" style={{ height: 6, margin: '6px 0' }}>
        <div
          className={`progress-bar ${batida ? 'progress-high' : falta / meta < 0.5 ? 'progress-medium' : 'progress-low'}`}
          style={{ width: `${Math.min((venda / meta) * 100, 100).toFixed(1)}%` }}
        />
      </div>

      {/* Vendido hoje — sem pré-venda */}
      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: corHojeSemPre, marginTop: '6px' }}>
        {loadingHoje ? '...' : vendaHojeSemPre === null ? '--' : fmt(vendaHojeSemPre)}
      </div>
      <div style={{ fontSize: '0.75rem', color: '#555' }}>vendido hoje (sem pré-venda)</div>

      {/* Vendido hoje — com pré-venda somada */}
      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: corHojeComPre, marginTop: '4px' }}>
        {loadingHoje ? '...' : vendidoHojeTotal === null ? '--' : fmt(vendidoHojeTotal)}
      </div>
      <div style={{ fontSize: '0.75rem', color: '#555' }}>vendido hoje (com pré-venda)</div>

      {/* Pré-venda efetuada hoje (valor isolado, para referência) */}
      <div style={{ fontSize: '0.78rem', color: '#555', marginTop: '4px' }}>
        Pré-venda: {loadingHoje ? '...' : fmt(vendaHojeInfo?.preVenda)}
      </div>

      {/* Calendário + falta */}
      <div style={{ fontSize: '0.78rem', color: '#555' }}>
        🗓 {nDecorridos}/{nTotal} dias · {nRestantes} restantes
      </div>
      {!batida && (
        <div style={{ fontSize: '0.78rem', color: '#888', marginTop: '2px' }}>
          Falta: {fmt(falta)}
        </div>
      )}
    </div>
  );
};

export default CardDiarioNecessarioVendedor;
