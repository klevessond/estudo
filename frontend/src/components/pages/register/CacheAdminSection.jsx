// frontend/src/components/pages/register/CacheAdminSection.jsx

import React, { useState, useCallback } from 'react';
import api from '../../../api';
import { useAuth } from '../../../contexts/auth';

const fmtData = (iso) => {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
};

const fmtDataHora = (str) => {
  if (!str) return '—';
  const [d, h] = str.split(' ');
  const [y, m, dd] = (d || '').split('-');
  return `${dd}/${m}/${y} ${(h || '').slice(0, 5)}`;
};

const TIPO_LABELS = {
  vendas_por_vendedor: 'Vendas por Vendedor',
  venda_mix:           'Mix de Vendas',
  positivacao:         'Positivação',
  pre_venda:           'Pré-venda',
  ruptura:             'Ruptura',
  vendas_pdv:          'Vendas PDV',
  cupons_pdv:          'Cupons PDV',
};

const TIPO_CORES = {
  vendas_por_vendedor: '#1d4ed8',
  venda_mix:           '#7c3aed',
  positivacao:         '#065f46',
  pre_venda:           '#92400e',
  ruptura:             '#991b1b',
  vendas_pdv:          '#0e7490',
  cupons_pdv:          '#0e7490',
};

const tagStyle = (tipo) => ({
  display: 'inline-block',
  padding: '2px 8px',
  borderRadius: 999,
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  background: TIPO_CORES[tipo] || '#374151',
  color: '#fff',
  marginRight: 4,
  marginBottom: 3,
});

const S = {
  sectionCard: {
    background: '#fff',
    border: '1px solid #d6e4f0',
    borderLeft: '4px solid #003366',
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
    userSelect: 'none',
  },
  cardTitle: {
    fontSize: '1rem',
    fontWeight: 700,
    color: '#003366',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    background: '#e6f0fa',
    color: '#003366',
    borderRadius: 999,
    padding: '2px 10px',
    fontSize: 12,
    fontWeight: 700,
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 10,
    marginTop: 16,
    marginBottom: 16,
  },
  statCard: {
    background: '#f9fbfd',
    border: '1px solid #d6e4f0',
    borderRadius: 6,
    padding: '10px 14px',
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 10,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    fontWeight: 600,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 700,
    color: '#003366',
    marginTop: 2,
  },
  tableWrapper: {
    overflowX: 'auto',
    border: '1px solid #d6e4f0',
    borderRadius: 6,
    marginBottom: 12,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: 13,
  },
  th: {
    background: '#e6f0fa',
    color: '#003366',
    textAlign: 'left',
    padding: '10px 12px',
    borderBottom: '2px solid #c0d7eb',
    fontWeight: 700,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    whiteSpace: 'nowrap',
  },
  td: {
    padding: '10px 12px',
    borderBottom: '1px solid #e8f0f8',
    verticalAlign: 'middle',
  },
  btnInvalidar: {
    background: '#fee2e2',
    color: '#991b1b',
    border: '1px solid #fecaca',
    borderRadius: 6,
    padding: '5px 12px',
    fontSize: 11,
    fontWeight: 700,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  btnInvalidarTudo: {
    background: '#991b1b',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    padding: '9px 18px',
    fontSize: 12,
    fontWeight: 700,
    cursor: 'pointer',
  },
  btnAtualizar: {
    background: '#e6f0fa',
    color: '#003366',
    border: '1px solid #c0d7eb',
    borderRadius: 6,
    padding: '9px 18px',
    fontSize: 12,
    fontWeight: 700,
    cursor: 'pointer',
  },
  botoesGlobais: {
    display: 'flex',
    gap: 10,
    marginTop: 12,
    justifyContent: 'flex-end',
  },
  aviso: {
    background: '#fffbeb',
    border: '1px solid #fde68a',
    borderRadius: 6,
    padding: '10px 14px',
    fontSize: 11,
    color: '#92400e',
    lineHeight: 1.5,
    marginTop: 12,
  },
  loadingMsg: {
    color: '#0074c2',
    fontSize: 12,
    padding: '8px 0',
    fontStyle: 'italic',
  },
  emptyMsg: {
    color: '#94a3b8',
    fontSize: 12,
    textAlign: 'center',
    padding: '16px 0',
    fontStyle: 'italic',
  },
};

const feedbackStyle = (tipo) => ({
  padding: '10px 16px',
  borderRadius: 6,
  fontSize: 12,
  fontWeight: 600,
  marginTop: 10,
  background: tipo === 'ok' ? '#d1fae5' : '#fee2e2',
  color:      tipo === 'ok' ? '#065f46' : '#991b1b',
  border: `1px solid ${tipo === 'ok' ? '#6ee7b7' : '#fecaca'}`,
});

const chevronStyle = (aberto) => ({
  fontSize: 12,
  color: '#64748b',
  transition: 'transform 0.2s',
  transform: aberto ? 'rotate(180deg)' : 'rotate(0deg)',
  display: 'inline-block',
});

// ─── Componente ───────────────────────────────────────────────────────────────

const CacheAdminSection = () => {
  const { user } = useAuth();

  // ✅ Todos os hooks ANTES de qualquer early return
  const [expandido, setExpandido] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [dados, setDados]         = useState(null);
  const [feedback, setFeedback]   = useState(null);
  const [hover, setHover]         = useState(null);

  const mostrarFeedback = useCallback((tipo, msg) => {
    setFeedback({ tipo, msg });
    setTimeout(() => setFeedback(null), 4000);
  }, []);

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/cache-mes/');
      setDados(data);
    } catch {
      mostrarFeedback('erro', 'Erro ao carregar informações do cache.');
    } finally {
      setLoading(false);
    }
  }, [mostrarFeedback]);

  const toggleExpandido = useCallback(() => {
    setExpandido((prev) => {
      const novoEstado = !prev;
      if (novoEstado && !dados) carregar();
      return novoEstado;
    });
  }, [dados, carregar]);

  const invalidarPeriodo = useCallback(async (p) => {
    const label = `${fmtData(p.data_ini)} → ${fmtData(p.data_fim)}`;
    if (!window.confirm(
      `Remover cache de ${label}?\n\nOs dados serão reconsultados no SQL Server na próxima requisição.`
    )) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ modo: 'periodo', data_ini: p.data_ini, data_fim: p.data_fim });
      const { data } = await api.delete(`/admin/cache-mes/?${params}`);
      mostrarFeedback('ok', `✓ ${data.removidos} entrada(s) do período ${label} removida(s).`);
      await carregar();
    } catch {
      mostrarFeedback('erro', 'Falha ao invalidar o período.');
    } finally {
      setLoading(false);
    }
  }, [carregar, mostrarFeedback]);

  const invalidarTudo = useCallback(async () => {
    if (!window.confirm(
      'Remover TODO o cache de meses?\n\n' +
      'Todos os períodos serão reconsultados no SQL Server na próxima requisição.'
    )) return;
    setLoading(true);
    try {
      const { data } = await api.delete('/admin/cache-mes/?modo=tudo');
      mostrarFeedback('ok', `✓ Cache limpo — ${data.removidos} entrada(s) removida(s).`);
      await carregar();
    } catch {
      mostrarFeedback('erro', 'Falha ao limpar o cache.');
    } finally {
      setLoading(false);
    }
  }, [carregar, mostrarFeedback]);

  // ✅ Early return somente após todos os hooks
  if (!user?.is_superuser) return null;

  const total    = dados?.stats?.total ?? 0;
  const periodos = dados?.periodos ?? [];
  const porTipo  = dados?.stats?.por_tipo ?? {};

  return (
    <div style={S.sectionCard}>

      <div style={S.cardHeader} onClick={toggleExpandido}>
        <h3 style={S.cardTitle}>
          🗄️ Cache de Meses Fechados
          {total > 0 && <span style={S.badge}>{total} entradas</span>}
        </h3>
        <span style={chevronStyle(expandido)}>▼</span>
      </div>

      {expandido && (
        <div style={{ marginTop: 16 }}>

          {loading && <p style={S.loadingMsg}>⏳ Consultando cache...</p>}

          {dados && (
            <>
              
              <div style={S.statsGrid}>
                {/* Stats 
                <div style={S.statCard}>
                  <div style={S.statLabel}>Total de Entradas</div>
                  <div style={S.statValue}>{total}</div>
                </div>*/}
                <div style={S.statCard}>
                  <div style={S.statLabel}>Períodos Distintos</div>
                  <div style={S.statValue}>{periodos.length}</div>
                </div> {/* Stats 
                <div style={S.statCard}>
                  <div style={S.statLabel}>Tipos de Consulta</div>
                  <div style={S.statValue}>{Object.keys(porTipo).length}</div>
                </div>*/}
              </div>

              {/* Tags por tipo */}
              {Object.keys(porTipo).length > 0 && (
                <div style={{ marginBottom: 14, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {Object.entries(porTipo).map(([tipo, n]) => (
                    <span key={tipo} style={tagStyle(tipo)}>
                      {TIPO_LABELS[tipo] || tipo} ({n})
                    </span>
                  ))}
                </div>
              )}

              {/* Tabela */}
              {periodos.length === 0 ? (
                <p style={S.emptyMsg}>Nenhum período em cache no momento.</p>
              ) : (
                <div style={S.tableWrapper}>
                  <table style={S.table}>
                    <thead>
                      <tr>
                        <th style={S.th}>Período</th>
                        <th style={S.th}>Tipos Cacheados</th>
                        <th style={S.th}>Salvo em</th>
                        <th style={{ ...S.th, textAlign: 'center' }}>Ação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {periodos.map((p, i) => (
                        <tr
                          key={i}
                          style={hover === i ? { background: '#f0f6ff' } : {}}
                          onMouseEnter={() => setHover(i)}
                          onMouseLeave={() => setHover(null)}
                        >
                          <td style={{ ...S.td, fontWeight: 600, whiteSpace: 'nowrap' }}>
                            {fmtData(p.data_ini)} → {fmtData(p.data_fim)}
                          </td>
                          <td style={S.td}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                              {p.tipos.map((t) => (
                                <span key={t} style={tagStyle(t)}>
                                  {TIPO_LABELS[t] || t}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td style={{ ...S.td, color: '#64748b', whiteSpace: 'nowrap', fontSize: 12 }}>
                            {fmtDataHora(p.criado_em)}
                          </td>
                          <td style={{ ...S.td, textAlign: 'center' }}>
                            <button
                              style={S.btnInvalidar}
                              onClick={() => invalidarPeriodo(p)}
                              disabled={loading}
                            >
                              🗑️ Invalidar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div style={S.aviso}>
                ⚠️ Ao invalidar, o cache SQLite local é removido. Os dados serão
                reconsultados automaticamente no SQL Server na próxima vez que
                alguém acessar aquele período no dashboard.
              </div>

              {feedback && <div style={feedbackStyle(feedback.tipo)}>{feedback.msg}</div>}

              <div style={S.botoesGlobais}>
                <button style={S.btnAtualizar} onClick={carregar} disabled={loading}>
                  🔄 Atualizar
                </button>
                <button
                  style={S.btnInvalidarTudo}
                  onClick={invalidarTudo}
                  disabled={loading || total === 0}
                >
                  🗑️ Invalidar Todo o Cache
                </button>
              </div>
            </>
          )}

          {!dados && !loading && (
            <div style={{ textAlign: 'center', paddingTop: 8 }}>
              <button style={S.btnAtualizar} onClick={carregar}>
                🔄 Carregar Informações
              </button>
            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default CacheAdminSection;
