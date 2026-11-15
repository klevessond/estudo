// frontend/src/components/metricard/CardsCampanhas.jsx
// Campanhas em andamento na tela principal, logo abaixo dos KPIs.
//  - RESUMO: cards compactos no mesmo porte/estilo dos KPIs (uma faixa, scroll horizontal).
//  - DETALHE: clicar num card abre uma JANELA (modal) por cima da tela, com as medidas
//    e a lista de vendedores.
// Os números já chegam escopados por papel pelo backend (/campanhas/painel/):
// admin = toda a equipe, supervisor/gerente = sua supervisão, vendedor = só ele.
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import api from '../../api';
import { fmtNum, fmtNum1, fmtMoeda, fmtMoedaCurta, fmtPct, fmtDataBR as fmtData } from '../../utils/formatters';
import './CardsCampanhas.css';

const REFRESH_MS = 5 * 60 * 1000;
const RETA_FINAL_DIAS = 7;


const MEDIDAS = {
  peso:       { label: 'Peso',       fmt: (v) => `${fmtNum(v)} kg`, curto: (v) => `${fmtNum1(v)} kg` },
  financeiro: { label: 'Financeiro', fmt: fmtMoeda,                 curto: fmtMoedaCurta },
  quantidade: { label: 'Quantidade', fmt: (v) => `${fmtNum(v)} un`, curto: (v) => `${fmtNum1(v)} un` },
};

const ROTULO_ESCOPO = {
  EQUIPE: '👥 Toda a equipe',
  SUPERVISAO: '👥 Sua supervisão',
  VENDEDOR: '👤 Seu resultado',
};

// detalhe: <50 vermelho, 50–99 amarelo, >=100 verde (mesmas faixas do CardsColaborador)
const classePct = (p) => (p >= 100 ? 'camp-alto' : p >= 50 ? 'camp-medio' : 'camp-baixo');

const textoPrazo = (dias) => (dias === 0 ? 'Último dia' : dias === 1 ? '1 dia' : `${dias} dias`);

// Cor do card: ok = todas as metas batidas; risco = faltam <=7 dias e ainda não bateu;
// neutro = sem objetivos/erro; padrao = em andamento.
const statusCard = (c) => {
  const ativas = c.medidas_ativas || [];
  if (c.erro || c.sem_objetivos || ativas.length === 0 || !c.totais) return 'neutro';
  if (ativas.every((m) => (c.totais[m].percentual ?? 0) >= 100)) return 'ok';
  if (c.dias_restantes <= RETA_FINAL_DIAS) return 'risco';
  return 'padrao';
};

const ROTULO_STATUS = {
  ok: 'Meta batida',
  risco: `Reta final: faltam ${RETA_FINAL_DIAS} dias ou menos e a meta ainda não foi batida`,
  padrao: 'Em andamento',
  neutro: 'Sem objetivos ou sem dados',
};

const ritmoDe = (c) => (c.dias_total ? (c.dias_decorridos / c.dias_total) * 100 : 0);

/* ===================== RESUMO (compacto, estilo KPI) ===================== */

const CardResumo = ({ c, onAbrir }) => {
  const status = statusCard(c);
  const ritmo = ritmoDe(c);

  const onKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onAbrir();
    }
  };

  return (
    <article
      className={`camp-resumo camp-resumo--${status}`}
      role="button"
      tabIndex={0}
      aria-haspopup="dialog"
      title={`${c.nome} — ${ROTULO_STATUS[status]}. Clique para ver os detalhes.`}
      onClick={onAbrir}
      onKeyDown={onKeyDown}
    >
      <div className="camp-resumo-topo">
        <h2>{c.nome}</h2>
        <span className="camp-resumo-seta" aria-hidden="true">🔍</span>
      </div>
      <div className="camp-resumo-sub">{c.nome_fabricante} · ⏳ {textoPrazo(c.dias_restantes)}</div>

      {c.erro ? (
        <div className="camp-resumo-aviso">Erro ao carregar</div>
      ) : c.sem_objetivos ? (
        <div className="camp-resumo-aviso">Sem objetivos</div>
      ) : (
        (c.medidas_ativas || []).map((m) => {
          const d = c.totais[m];
          const pct = d.percentual ?? 0;
          return (
            <div key={m} className="camp-resumo-medida">
              <div className="camp-resumo-linha">
                <span>{MEDIDAS[m].label}</span>
                <strong>{fmtPct(pct)}</strong>
              </div>
              <div className="camp-resumo-barra">
                <div className="camp-resumo-fill" style={{ width: `${Math.min(pct, 100)}%` }} />
                <div className="camp-resumo-ritmo" style={{ left: `${Math.min(ritmo, 100)}%` }} />
              </div>
              <div className="camp-resumo-valor">
                {MEDIDAS[m].curto(d.realizado)} de {MEDIDAS[m].curto(d.objetivo)}
              </div>
            </div>
          );
        })
      )}
    </article>
  );
};

/* ===================== MODAL DE DETALHE ===================== */

const BlocoMedida = ({ chave, dados, ritmo }) => {
  const m = MEDIDAS[chave];
  const pct = dados.percentual ?? 0;
  const falta = dados.objetivo - dados.realizado;
  return (
    <div className="camp-medida">
      <div className="camp-medida-topo">
        <span className="camp-medida-rotulo">{m.label}</span>
        <span className={`camp-pct ${classePct(pct)}`}>{fmtPct(pct)}</span>
      </div>
      <div className="camp-medida-valor">
        <strong>{m.fmt(dados.realizado)}</strong> de {m.fmt(dados.objetivo)}
      </div>
      <div className="camp-barra" role="progressbar" aria-label={`${m.label}: ${fmtPct(pct)} do objetivo`}
        aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.min(Math.round(pct), 100)}>
        <div className={`camp-barra-fill ${classePct(pct)}`} style={{ width: `${Math.min(pct, 100)}%` }} />
        <div className="camp-barra-ritmo" style={{ left: `${Math.min(ritmo, 100)}%` }}
          title={`Ritmo esperado para hoje: ${fmtPct(ritmo)}`} />
      </div>
      <div className="camp-medida-rodape">
        {falta > 0 ? `Falta ${m.fmt(falta)}` : `✅ Meta batida${falta < 0 ? ` · +${m.fmt(-falta)}` : ''}`}
      </div>
    </div>
  );
};

const FOCAVEIS = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const ModalCampanha = ({ c, escopo, onFechar }) => {
  const caixa = useRef(null);
  const botaoFechar = useRef(null);
  const fecharRef = useRef(onFechar);
  fecharRef.current = onFechar;

  const status = statusCard(c);
  const ritmo = ritmoDe(c);
  const ativas = c.medidas_ativas || [];
  const idTitulo = `camp-modal-titulo-${c.id}`;
  const nomes = (c.itens || []).map((i) => i.nome_referencia || String(i.cod_referencia));
  const podeVerVendedores = escopo !== 'VENDEDOR' && (c.vendedores || []).length > 0 && !c.erro;

  // Ao abrir: trava a rolagem da página e leva o foco para dentro; ao fechar: devolve ambos.
  useEffect(() => {
    const focoAnterior = document.activeElement;
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    if (botaoFechar.current) botaoFechar.current.focus();
    return () => {
      document.body.style.overflow = overflowAnterior;
      if (focoAnterior && typeof focoAnterior.focus === 'function') focoAnterior.focus();
    };
  }, []);

  // Esc fecha; Tab fica preso dentro da janela
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        fecharRef.current();
        return;
      }
      if (e.key !== 'Tab' || !caixa.current) return;
      const itens = [...caixa.current.querySelectorAll(FOCAVEIS)];
      if (itens.length === 0) {
        e.preventDefault();
        caixa.current.focus();
        return;
      }
      const primeiro = itens[0];
      const ultimo = itens[itens.length - 1];
      const ativo = document.activeElement;
      const fora = !caixa.current.contains(ativo);
      if (e.shiftKey && (fora || ativo === primeiro)) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && (fora || ativo === ultimo)) {
        e.preventDefault();
        primeiro.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  return createPortal(
    <div
      className="camp-modal-fundo"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onFechar(); }}
    >
      <div
        ref={caixa}
        className={`camp-modal camp-modal--${status}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={idTitulo}
        tabIndex={-1}
      >
        <div className="camp-modal-topo">
          <div className="camp-modal-cabecalho">
            <h2 id={idTitulo} className="camp-modal-titulo">{c.nome}</h2>
            <div className="camp-sub">
              {c.nome_fabricante}{nomes.length ? ` · ${nomes.join(', ')}` : ''}
            </div>
            <div className="camp-sub">
              {fmtData(c.data_inicio)} a {fmtData(c.data_fim)} · dia {c.dias_decorridos} de {c.dias_total}
            </div>
          </div>
          <div className="camp-acoes">
            <span className={`camp-prazo ${c.dias_restantes <= RETA_FINAL_DIAS ? 'camp-prazo-urgente' : ''}`}>
              ⏳ {textoPrazo(c.dias_restantes)}
            </span>
            <button ref={botaoFechar} type="button" className="camp-fechar" onClick={onFechar}
              aria-label="Fechar" title="Fechar (Esc)">✕</button>
          </div>
        </div>

        <div className="camp-modal-corpo" tabIndex={0} aria-label="Detalhes da campanha">
          {c.erro ? (
            <div className="camp-aviso camp-aviso-erro">Não foi possível carregar o realizado desta campanha agora.</div>
          ) : c.sem_objetivos ? (
            <div className="camp-aviso">Sem objetivos cadastrados. Defina em <strong>Campanhas</strong>.</div>
          ) : (
            <div className="camp-medidas">
              {ativas.map((m) => <BlocoMedida key={m} chave={m} dados={c.totais[m]} ritmo={ritmo} />)}
            </div>
          )}

          {podeVerVendedores && (
            <div className="camp-vendedores">
              <div className="camp-vendedores-titulo">
                Vendedores ({c.vendedores.length})
                {ativas.length > 0 && <span> · ranking pelo % de {MEDIDAS[ativas[0]].label}</span>}
              </div>
              <div className="camp-vendedores-rolagem">
                <table>
                  <thead>
                    <tr>
                      <th>Vendedor</th>
                      {ativas.map((m) => <th key={m}>{MEDIDAS[m].label}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {c.vendedores.map((v) => (
                      <tr key={v.cod_vendedor}>
                        <td>{v.nome_vendedor}</td>
                        {ativas.map((m) => (
                          <td key={m}>
                            {v[m].objetivo ? (
                              <>
                                <span className={`camp-pct ${classePct(v[m].percentual ?? 0)}`}>{fmtPct(v[m].percentual ?? 0)}</span>
                                <div className="camp-mini">{MEDIDAS[m].fmt(v[m].realizado)} / {MEDIDAS[m].fmt(v[m].objetivo)}</div>
                              </>
                            ) : <span className="camp-mini">—</span>}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="camp-escopo">{ROTULO_ESCOPO[escopo] || ''}</div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

/* ===================== SEÇÃO ===================== */

const CardsCampanhas = () => {
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState(false);
  const [abertoId, setAbertoId] = useState(null);

  const carregar = useCallback(() => {
    api.get('/campanhas/painel/')
      .then(({ data }) => { setDados(data); setErro(false); })
      .catch(() => setErro(true));
  }, []);

  useEffect(() => {
    carregar();
    const t = setInterval(carregar, REFRESH_MS);
    return () => clearInterval(t);
  }, [carregar]);

  // Falhou e não há nada para mostrar: avisa (não deixa o erro invisível)
  if (erro && !dados) {
    return (
      <section className="camp-secao">
        <div className="camp-erro">
          Não foi possível carregar as campanhas.
          <button type="button" onClick={carregar}>Tentar novamente</button>
        </div>
      </section>
    );
  }

  // Carregando, ou sem campanhas para este usuário: não ocupa espaço no dashboard
  if (!dados || !dados.campanhas || dados.campanhas.length === 0) return null;

  const aberta = dados.campanhas.find((c) => c.id === abertoId) || null;

  return (
    <section className="camp-secao">
      <div className="camp-cabecalho">
        <h3>🏆 Campanhas em andamento ({dados.campanhas.length})</h3>
        <span className="camp-legenda" aria-hidden="true">
          <span><i style={{ background: '#265c29' }} />meta batida</span>
          <span><i style={{ background: '#f01717' }} />reta final (≤ {RETA_FINAL_DIAS} dias)</span>
          <span><i style={{ background: '#fde68a' }} />ritmo esperado</span>
        </span>
        <button type="button" className="camp-atualizar" onClick={carregar} title="Atualizar">🔄</button>
      </div>

      <div className="camp-faixa">
        {dados.campanhas.map((c) => (
          <CardResumo key={c.id} c={c} onAbrir={() => setAbertoId(c.id)} />
        ))}
      </div>

      {aberta && (
        <ModalCampanha key={aberta.id} c={aberta} escopo={dados.escopo} onFechar={() => setAbertoId(null)} />
      )}
    </section>
  );
};

export default CardsCampanhas;