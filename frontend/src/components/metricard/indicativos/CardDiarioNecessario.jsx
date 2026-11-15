import React, { useEffect, useState, useMemo } from 'react';
import api from '../../../api';
import { diasUteisEntre } from '../../../utils/diasUteis';
import '../IndicativosDeVenda.css';

/* ========= CARD DIÁRIO NECESSÁRIO ========= */
const CardDiarioNecessario = ({
  periodoSelecionado,
  objetivoFinanceiroBase,
  vendaRealizadaBase,
  usarPDV,
  vendaPDVBase,
}) => {
  const [vendaHojeInfo, setVendaHojeInfo] = useState(null);  // { total, rotas, preVenda } | null = ainda carregando
  const [loadingHoje, setLoadingHoje] = useState(false);

  // Busca venda do dia (rotas + pré-venda) — atualiza quando o período muda
  useEffect(() => {
    let cancelado = false;
    setLoadingHoje(true);
    api.get('/indicadores/venda-hoje/')
      .then(({ data }) => {
        if (cancelado) return;
        setVendaHojeInfo({
          total: Number(data?.total_hoje || 0),
          rotas: Number(data?.total_rotas_hoje || 0),
          preVenda: Number(data?.total_pre_venda_hoje || 0),
        });
      })
      .catch(() => { if (!cancelado) setVendaHojeInfo({ total: 0, rotas: 0, preVenda: 0 }); })
      .finally(() => { if (!cancelado) setLoadingHoje(false); });
    return () => { cancelado = true; };
  }, [periodoSelecionado?.de]);   // re-busca se o mês mudar

  const calc = useMemo(() => {
    if (!periodoSelecionado?.de || !periodoSelecionado?.ate || !objetivoFinanceiroBase) return null;

    const di   = new Date(periodoSelecionado.de  + 'T00:00:00');
    const df   = new Date(periodoSelecionado.ate + 'T00:00:00');
    const hoje = new Date(); hoje.setHours(0,0,0,0);

    const totalUteis = diasUteisEntre(di, df);
    const decorridos = diasUteisEntre(di, hoje <= df ? hoje : df);
    const amanha     = new Date(hoje); amanha.setDate(hoje.getDate() + 1);
    const restantes  = hoje < df ? diasUteisEntre(amanha, df) : [];

    const pdvNum = usarPDV ? (Number(vendaPDVBase) || 0) : 0;
    const venda  = (Number(vendaRealizadaBase) || 0) + pdvNum;
    const meta   = Number(objetivoFinanceiroBase) || 0;

    const falta    = Math.max(meta - venda, 0);
    const batida   = venda >= meta;
    const diaNec   = (!batida && restantes.length > 0) ? falta / restantes.length : 0;

    return {
      nTotal: totalUteis.length,
      nDecorridos: decorridos.length,
      nRestantes: restantes.length,
      falta,
      diaNec,
      batida,
    };
  }, [periodoSelecionado, objetivoFinanceiroBase, vendaRealizadaBase, usarPDV, vendaPDVBase]);

  if (!calc) return null;

  const fmt = (v) => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const vendaHojeTotal = vendaHojeInfo?.total ?? null;

  // Cor do diário necessário: verde se batida, vermelho se ritmo muito abaixo, amarelo se próximo
  const corDiaNec = calc.batida ? '#4ade80' : '#fde68a';

  // Cor da venda de hoje (sem pré-venda): verde se >= necessário, amarelo se próximo, vermelho se baixo
  const vendaHojeSemPre = vendaHojeInfo?.rotas ?? null;
  const corHojeSemPre = vendaHojeSemPre === null
    ? 'rgba(255,255,255,0.6)'
    : vendaHojeSemPre >= calc.diaNec
    ? '#4ade80'
    : vendaHojeSemPre >= calc.diaNec * 0.7
    ? '#fde68a'
    : '#fca5a5';

  // Cor da venda de hoje (com pré-venda): mesma régua, mas sobre o total
  const corHojeComPre = vendaHojeTotal === null
    ? 'rgba(255,255,255,0.6)'
    : vendaHojeTotal >= calc.diaNec
    ? '#4ade80'
    : vendaHojeTotal >= calc.diaNec * 0.7
    ? '#fde68a'
    : '#fca5a5';

  return (
    <div className="indicativo-card card-diario">
      <div className="card-header">
        <h2>Diário Necessário</h2>
      </div>

      {/* Necessário por dia */}
      <div className="card-value" style={{ color: corDiaNec }}>
        {calc.batida
          ? '🏆 Meta atingida!'
          : calc.nRestantes === 0
          ? 'Período encerrado'
          : fmt(calc.diaNec)}
      </div>
      <p className="card-subtitle">necessário/dia para bater a meta</p>

      {/* Separador */}
      <div style={{ borderTop:'1px solid rgba(255,255,255,0.2)', margin:'4px 0' }} />

      {/* Vendido HOJE — sem pré-venda */}
      <div className="card-value" style={{ color: corHojeSemPre, fontSize:'clamp(11px,3vw,13px)' }}>
        {loadingHoje
          ? '...'
          : vendaHojeSemPre === null
          ? '--'
          : fmt(vendaHojeSemPre)}
      </div>
      <p className="card-subtitle">vendido hoje (sem pré-venda)</p>

      {/* Vendido HOJE — com pré-venda somada */}
      <div className="card-value" style={{ color: corHojeComPre, fontSize:'clamp(11px,3vw,13px)', marginTop: 4 }}>
        {loadingHoje
          ? '...'
          : vendaHojeTotal === null
          ? '--'
          : fmt(vendaHojeTotal)}
      </div>
      <p className="card-subtitle">vendido hoje (com pré-venda)</p>

      {/* Separador */}
      <div style={{ borderTop:'1px solid rgba(255,255,255,0.2)', margin:'4px 0' }} />

      {/* Pré-venda efetuada hoje (valor isolado, para referência) */}
      <p className="card-subtitle" style={{ margin:'2px 0' }}>
        Pré-venda: {loadingHoje ? '...' : fmt(vendaHojeInfo?.preVenda)}
      </p>

      {/* Calendário + falta */}
      <p className="card-subtitle" style={{ margin:'2px 0' }}>
        🗓 {calc.nDecorridos}/{calc.nTotal} dias · {calc.nRestantes} rest.
      </p>
      {!calc.batida && (
        <p className="card-subtitle" style={{ opacity:0.8, margin:'1px 0' }}>
          Falta: {fmt(calc.falta)}
        </p>
      )}
    </div>
  );
};

export default CardDiarioNecessario;
