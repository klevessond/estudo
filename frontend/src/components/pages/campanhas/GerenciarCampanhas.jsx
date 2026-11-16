// frontend/src/components/pages/campanhas/GerenciarCampanhas.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useToast } from '../../ui/Toast.jsx';
import { buscarCatalogo, listarCampanhas, criarCampanha, atualizarCampanha, getProgressoCampanha, salvarObjetivoCampanha, excluirObjetivoCampanha } from '../../../services/campanhasApi';
import { getTodosVendedores } from '../../../services/cadastrosApi';
import { fmtNum, fmtMoeda, fmtDataBR } from '../../../utils/formatters';
import './GerenciarCampanhas.css';

const TIPOS = [
  { value: 'MATERIAL', label: 'Fabricante x Material(is)', itemLabel: 'Materiais da campanha' },
  { value: 'GRUPO',    label: 'Fabricante x Grupo(s) de material', itemLabel: 'Grupos da campanha' },
];


const MEDIDAS = [
  { key: 'peso',       label: 'Peso',       unidade: 'kg', fmt: (v) => `${fmtNum(v)} kg` },
  { key: 'financeiro', label: 'Financeiro', unidade: 'R$', fmt: fmtMoeda },
  { key: 'quantidade', label: 'Quantidade', unidade: 'un', fmt: (v) => `${fmtNum(v)} un` },
];

const inputStyle = { width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc', boxSizing: 'border-box' };
const labelStyle = { fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: 2 };
const cardStyle = { background: '#fff', borderRadius: 10, padding: '1.25rem', border: '1px solid #e5e7eb', marginBottom: '1.5rem' };

const corPct = (p) => (p >= 100 ? '#16a34a' : p >= 50 ? '#d97706' : '#dc2626');

// Mensagem legível a partir de um erro do DRF ({campo: ["msg"]}, {detail: "msg"} ou HTML de 500)
const extrairErro = (err, fallback) => {
  const d = err?.response?.data;
  if (!d) return fallback;
  if (typeof d === 'string') return d.length < 200 ? d : fallback;
  if (d.detail) return String(d.detail);
  const partes = Object.entries(d).map(([campo, v]) => {
    const txt = Array.isArray(v) ? v.map((x) => (typeof x === 'string' ? x : JSON.stringify(x))).join(' ')
      : typeof v === 'string' ? v : JSON.stringify(v);
    return `${campo}: ${txt}`;
  });
  return partes.length ? partes.join(' | ') : fallback;
};

// ===== Autocomplete genérico =====
const BuscaAutocomplete = ({ endpoint, params, placeholder, minChars = 2, mapItem, onSelecionar, disabled }) => {
  const [termo, setTermo] = useState('');
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [aberto, setAberto] = useState(false);
  const paramsKey = JSON.stringify(params || {});

  useEffect(() => {
    if (disabled || termo.trim().length < minChars) { setResultados([]); return undefined; }
    let cancelado = false;
    setLoading(true);
    const timer = setTimeout(() => {
      buscarCatalogo(endpoint, { params: { ...(params || {}), q: termo.trim() } })
        .then(({ data }) => { if (!cancelado) setResultados((data.resultados || []).map(mapItem)); })
        .catch(() => { if (!cancelado) setResultados([]); })
        .finally(() => { if (!cancelado) setLoading(false); });
    }, 300); // debounce
    return () => { cancelado = true; clearTimeout(timer); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [termo, endpoint, paramsKey, minChars, disabled]);

  const escolher = (item) => {
    onSelecionar(item);
    setTermo('');
    // Não limpa os resultados: com minChars=0 (grupos) o termo continua '' e o
    // efeito não roda de novo, então a lista precisa continuar disponível para
    // adicionar o próximo item. Se o termo mudar, o efeito recarrega sozinho.
    setAberto(false);
  };

  return (
    <div style={{ position: 'relative' }}>
      <input
        type="text"
        value={termo}
        disabled={disabled}
        onChange={(e) => { setTermo(e.target.value); setAberto(true); }}
        onFocus={() => setAberto(true)}
        onClick={() => setAberto(true)}
        onBlur={() => setTimeout(() => setAberto(false), 150)}
        placeholder={placeholder}
        style={{ ...inputStyle, background: disabled ? '#f3f4f6' : '#fff' }}
      />
      {aberto && !disabled && (loading || resultados.length > 0) && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 20,
          background: '#fff', border: '1px solid #ddd', borderRadius: 6,
          maxHeight: 220, overflowY: 'auto', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        }}>
          {loading && <div style={{ padding: 8, color: '#888', fontSize: '0.85rem' }}>Buscando...</div>}
          {!loading && resultados.map((item) => (
            <div
              key={item.cod}
              onMouseDown={() => escolher(item)}
              style={{ padding: '8px 10px', cursor: 'pointer', fontSize: '0.85rem', borderBottom: '1px solid #f0f0f0' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#f5f5f5'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; }}
            >
              {item.nome}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ===== Seletor do escopo: materiais OU grupos do fabricante (um ou mais) =====
const SeletorItens = ({ tipo, codFabricante, itens, onChange }) => {
  const isGrupo = tipo === 'GRUPO';

  const adicionar = ({ cod, nome }) => {
    if (itens.some((i) => Number(i.cod_referencia) === Number(cod))) return;
    onChange([...itens, { cod_referencia: cod, nome_referencia: nome }]);
  };
  const remover = (cod) => onChange(itens.filter((i) => Number(i.cod_referencia) !== Number(cod)));

  return (
    <div>
      <BuscaAutocomplete
        key={`${tipo}-${codFabricante || 0}`}
        endpoint={isGrupo ? '/campanhas/buscar-grupo/' : '/campanhas/buscar-material/'}
        params={{ cod_fabricante: codFabricante }}
        placeholder={
          !codFabricante ? 'Escolha o fabricante primeiro'
            : isGrupo ? 'Clique para ver os grupos do fabricante...' : 'Digite o nome do material...'
        }
        minChars={isGrupo ? 0 : 2}
        disabled={!codFabricante}
        mapItem={(r) => (isGrupo ? { cod: r.CodGrupo, nome: r.Grupo } : { cod: r.CodMaterial, nome: r.Material })}
        onSelecionar={adicionar}
      />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
        {itens.length === 0 && <span style={{ fontSize: '0.8rem', color: '#999' }}>Nenhum item selecionado.</span>}
        {itens.map((i) => (
          <span key={i.cod_referencia} style={{
            background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 999,
            padding: '3px 10px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: 6,
          }}>
            {i.nome_referencia || i.cod_referencia}
            <button type="button" onClick={() => remover(i.cod_referencia)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6', padding: 0 }}>✕</button>
          </span>
        ))}
      </div>
    </div>
  );
};

// ===== Formulário de nova campanha =====
const FormNovaCampanha = ({ onCriada, onCancelar }) => {
  const [form, setForm] = useState({ nome: '', tipo: 'MATERIAL', data_inicio: '', data_fim: '', descricao: '' });
  const [fabricante, setFabricante] = useState(null); // { cod, nome }
  const [itens, setItens] = useState([]);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  const tipoAtual = TIPOS.find((t) => t.value === form.tipo);

  // Materiais/grupos pertencem a um fabricante: trocar fabricante ou tipo zera o escopo
  const trocarFabricante = (f) => { setFabricante(f); setItens([]); };
  const trocarTipo = (tipo) => { setForm({ ...form, tipo }); setItens([]); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nome.trim()) return setErro('Informe o nome da campanha.');
    if (!fabricante) return setErro('Selecione o fabricante.');
    if (!form.data_inicio || !form.data_fim) return setErro('Informe a data de início e a data de fim.');
    if (form.data_fim < form.data_inicio) return setErro('A data fim não pode ser anterior à data início.');
    if (itens.length === 0) return setErro(`Adicione ao menos um item em "${tipoAtual.itemLabel}".`);

    setSalvando(true);
    setErro('');
    try {
      const { data } = await criarCampanha({
        nome: form.nome.trim(),
        tipo: form.tipo,
        cod_fabricante: fabricante.cod,
        nome_fabricante: fabricante.nome,
        data_inicio: form.data_inicio,
        data_fim: form.data_fim,
        descricao: form.descricao,
        itens,
      });
      onCriada(data);
    } catch (err) {
      setErro(extrairErro(err, 'Erro ao criar campanha.'));
    } finally {
      setSalvando(false);
    }
    return undefined;
  };

  return (
    <form onSubmit={handleSubmit} style={{ ...cardStyle, display: 'grid', gap: '0.75rem' }}>
      <h3 style={{ margin: 0 }}>➕ Nova Campanha</h3>
      {erro && <div style={{ color: '#dc2626', fontSize: '0.85rem' }}>{erro}</div>}

      <div>
        <label style={labelStyle}>Nome da campanha</label>
        <input type="text" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} style={inputStyle} />
      </div>

      <div>
        <label style={labelStyle}>Fabricante</label>
        {fabricante ? (
          <div style={{
            padding: 8, borderRadius: 6, background: '#eff6ff', border: '1px solid #bfdbfe',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{fabricante.nome}</span>
            <button type="button" onClick={() => trocarFabricante(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6' }}>✕ trocar</button>
          </div>
        ) : (
          <BuscaAutocomplete
            endpoint="/campanhas/buscar-fabricante/"
            placeholder="Buscar fabricante..."
            mapItem={(r) => ({ cod: r.CodFabricante, nome: r.Fabricante })}
            onSelecionar={trocarFabricante}
          />
        )}
      </div>

      <div>
        <label style={labelStyle}>Tipo de campanha</label>
        <select value={form.tipo} onChange={(e) => trocarTipo(e.target.value)} style={inputStyle}>
          {TIPOS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>

      <div>
        <label style={labelStyle}>{tipoAtual.itemLabel}</label>
        <SeletorItens tipo={form.tipo} codFabricante={fabricante?.cod} itens={itens} onChange={setItens} />
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 140 }}>
          <label style={labelStyle}>Início</label>
          <input type="date" value={form.data_inicio} onChange={(e) => setForm({ ...form, data_inicio: e.target.value })} style={inputStyle} />
        </div>
        <div style={{ flex: 1, minWidth: 140 }}>
          <label style={labelStyle}>Fim</label>
          <input type="date" value={form.data_fim} onChange={(e) => setForm({ ...form, data_fim: e.target.value })} style={inputStyle} />
        </div>
      </div>

      <div>
        <label style={labelStyle}>Descrição (opcional)</label>
        <textarea value={form.descricao} rows={2} onChange={(e) => setForm({ ...form, descricao: e.target.value })} style={inputStyle} />
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
        <button type="button" onClick={onCancelar}
          style={{ padding: '8px 16px', border: '1px solid #ccc', borderRadius: 6, background: '#fff', cursor: 'pointer' }}>
          Cancelar
        </button>
        <button type="submit" disabled={salvando}
          style={{ padding: '8px 16px', border: 'none', borderRadius: 6, background: '#16a34a', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
          {salvando ? 'Salvando...' : 'Criar Campanha'}
        </button>
      </div>
    </form>
  );
};

// ===== Célula de uma medida: realizado, "de objetivo", barra e % =====
const CelulaMedida = ({ medida, dados }) => {
  if (!dados || !dados.objetivo) return <span style={{ color: '#bbb' }}>— sem objetivo</span>;
  const pct = dados.percentual ?? 0;
  const cor = corPct(pct);
  return (
    <div style={{ minWidth: 130 }}>
      <div style={{ fontWeight: 600 }}>{medida.fmt(dados.realizado)}</div>
      <div style={{ fontSize: '0.72rem', color: '#888' }}>de {medida.fmt(dados.objetivo)}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
        <div style={{ flex: 1, height: 6, borderRadius: 3, background: '#e5e7eb', overflow: 'hidden' }}>
          <div style={{ width: `${Math.min(pct, 100)}%`, height: '100%', background: cor }} />
        </div>
        <span style={{ color: cor, fontWeight: 700, fontSize: '0.75rem', minWidth: 44, textAlign: 'right' }}>{pct}%</span>
      </div>
    </div>
  );
};

// ===== Detalhe: escopo, objetivos por vendedor e acompanhamento do realizado =====
const DetalheCampanha = ({ campanha, vendedores, onFechar, onAtualizada }) => {
  const toast = useToast();
  const [camp, setCamp] = useState(campanha);
  const [progresso, setProgresso] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erroCarga, setErroCarga] = useState('');
  const [vendSel, setVendSel] = useState('');
  const [valores, setValores] = useState({ peso: '', financeiro: '', quantidade: '' });
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [erroEscopo, setErroEscopo] = useState('');

  const tipoAtual = TIPOS.find((t) => t.value === camp.tipo) || TIPOS[0];

  // Fonte única de verdade: o /progresso/ devolve campanha (escopo + objetivos) e o realizado
  const buscarProgresso = useCallback(() => {
    setLoading(true);
    setErroCarga('');
    return getProgressoCampanha(campanha.id)
      .then(({ data }) => {
        setProgresso(data);
        if (data?.campanha) setCamp(data.campanha);
      })
      .catch((err) => {
        setProgresso(null);
        setErroCarga(extrairErro(err, 'Não foi possível carregar o realizado.'));
      })
      .finally(() => setLoading(false));
  }, [campanha.id]);

  useEffect(() => { buscarProgresso(); }, [buscarProgresso]);

  const linhas = progresso?.detalhado_por_vendedor || [];
  const medidasAtivas = MEDIDAS.filter((m) => progresso?.medidas_ativas?.includes(m.key));

  // Vendedores do select + os que já têm objetivo (podem não estar na lista do usuário logado)
  const opcoesVendedores = useMemo(() => {
    const mapa = new Map(vendedores.map((v) => [String(v.cod), v.nome]));
    linhas.forEach((l) => { if (!mapa.has(String(l.cod_vendedor))) mapa.set(String(l.cod_vendedor), l.nome_vendedor || `Vendedor ${l.cod_vendedor}`); });
    return Array.from(mapa, ([cod, nome]) => ({ cod, nome }));
  }, [vendedores, linhas]);

  // Ao escolher (ou clicar em ✏️) um vendedor que já tem objetivo, o formulário vem preenchido
  const selecionarVendedor = (cod) => {
    setVendSel(String(cod));
    setErro('');
    const l = linhas.find((x) => String(x.cod_vendedor) === String(cod));
    const val = (m) => (l && l[m].objetivo ? String(l[m].objetivo) : '');
    setValores({ peso: val('peso'), financeiro: val('financeiro'), quantidade: val('quantidade') });
  };

  const salvarObjetivo = async () => {
    setErro('');
    if (!vendSel) return setErro('Selecione o vendedor.');
    const n = { peso: Number(valores.peso || 0), financeiro: Number(valores.financeiro || 0), quantidade: Number(valores.quantidade || 0) };
    if (Object.values(n).some((v) => Number.isNaN(v) || v < 0)) return setErro('Os objetivos devem ser números maiores ou iguais a zero.');
    if (n.peso === 0 && n.financeiro === 0 && n.quantidade === 0) {
      return setErro('Informe ao menos um objetivo maior que zero (peso, financeiro ou quantidade). Zero significa "sem objetivo".');
    }
    const nome = opcoesVendedores.find((v) => String(v.cod) === String(vendSel))?.nome || '';

    setSalvando(true);
    try {
      await salvarObjetivoCampanha({
        campanha: camp.id,
        cod_vendedor: Number(vendSel),
        nome_vendedor: nome,
        objetivo_peso: n.peso,
        objetivo_financeiro: n.financeiro,
        objetivo_quantidade: n.quantidade,
      });
      setVendSel('');
      setValores({ peso: '', financeiro: '', quantidade: '' });
      await buscarProgresso();
      if (onAtualizada) onAtualizada();
    } catch (err) {
      setErro(extrairErro(err, 'Erro ao salvar objetivo.'));
    } finally {
      setSalvando(false);
    }
    return undefined;
  };

  const removerObjetivo = async (id) => {
    if (!window.confirm('Remover o objetivo deste vendedor?')) return;
    try {
      await excluirObjetivoCampanha(id);
      await buscarProgresso();
      if (onAtualizada) onAtualizada();
    } catch {
      toast.erro('Erro ao remover objetivo.');
    }
  };

  const salvarItens = async (novaLista) => {
    setErroEscopo('');
    try {
      await atualizarCampanha(camp.id, {
        itens: novaLista.map((i) => ({ cod_referencia: i.cod_referencia, nome_referencia: i.nome_referencia })),
      });
      await buscarProgresso();
      if (onAtualizada) onAtualizada();
    } catch (err) {
      setErroEscopo(extrairErro(err, 'Erro ao atualizar o escopo da campanha.'));
    }
  };

  const totais = progresso?.totais_equipe;

  return (
    <div style={cardStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <div>
          <h3 style={{ margin: 0 }}>{camp.nome}</h3>
          <span style={{ fontSize: '0.8rem', color: '#888' }}>
            {camp.nome_fabricante} · {camp.tipo_display} · {fmtDataBR(camp.data_inicio)} a {fmtDataBR(camp.data_fim)}
          </span>
        </div>
        <button onClick={onFechar} style={{ background: 'none', border: 'none', fontSize: '1.3rem', cursor: 'pointer' }}>✕</button>
      </div>

      {/* Escopo da campanha (editável) */}
      <div style={{ marginTop: '1rem' }}>
        <label style={labelStyle}>{tipoAtual.itemLabel}</label>
        <SeletorItens tipo={camp.tipo} codFabricante={camp.cod_fabricante} itens={camp.itens || []} onChange={salvarItens} />
        {erroEscopo && <div style={{ color: '#dc2626', fontSize: '0.8rem', marginTop: 6 }}>{erroEscopo}</div>}
      </div>

      {/* Objetivo por vendedor */}
      <div style={{ marginTop: '1.25rem', padding: '0.75rem', background: '#f9fafb', borderRadius: 8, border: '1px solid #eee' }}>
        <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 8 }}>Objetivo do vendedor</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.5rem', alignItems: 'end' }}>
          <div>
            <label style={labelStyle}>Vendedor</label>
            <select value={vendSel} onChange={(e) => selecionarVendedor(e.target.value)} style={inputStyle}>
              <option value="">Selecione...</option>
              {opcoesVendedores.map((v) => <option key={v.cod} value={v.cod}>{v.nome}</option>)}
            </select>
          </div>
          {MEDIDAS.map((m) => (
            <div key={m.key}>
              <label style={labelStyle}>{m.label} ({m.unidade})</label>
              <input type="number" min="0" step="0.01" placeholder="0 = sem objetivo" value={valores[m.key]}
                onChange={(e) => setValores({ ...valores, [m.key]: e.target.value })} style={inputStyle} />
            </div>
          ))}
          <button onClick={salvarObjetivo} disabled={salvando}
            style={{ padding: '9px 14px', border: 'none', borderRadius: 6, background: '#3b82f6', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
            {salvando ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
        {erro && <div style={{ color: '#dc2626', fontSize: '0.8rem', marginTop: 6 }}>{erro}</div>}
      </div>

      {/* Acompanhamento */}
      <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4 style={{ margin: 0 }}>Objetivo x Realizado</h4>
        <button onClick={buscarProgresso}
          style={{ padding: '4px 10px', border: '1px solid #16a34a', borderRadius: 6, background: '#f0fdf4', color: '#16a34a', fontWeight: 600, cursor: 'pointer', fontSize: '0.75rem' }}>
          {loading ? '⏳ Atualizando...' : '🔄 Atualizar Realizado'}
        </button>
      </div>

      {erroCarga && <div style={{ color: '#dc2626', fontSize: '0.85rem', marginTop: 8 }}>{erroCarga}</div>}

      <div style={{ marginTop: '0.5rem', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ background: '#f3f4f6', textAlign: 'left' }}>
              <th style={{ padding: 8 }}>Vendedor</th>
              {medidasAtivas.map((m) => <th key={m.key} style={{ padding: 8 }}>{m.label}</th>)}
              <th style={{ padding: 8 }} />
            </tr>
          </thead>
          <tbody>
            {loading && !progresso ? (
              <tr><td colSpan={2 + medidasAtivas.length} style={{ padding: 16, textAlign: 'center', color: '#888' }}>Carregando...</td></tr>
            ) : linhas.length === 0 ? (
              <tr><td colSpan={2 + medidasAtivas.length} style={{ padding: 16, textAlign: 'center', color: '#888' }}>Nenhum objetivo cadastrado ainda.</td></tr>
            ) : linhas.map((l) => (
              <tr key={l.id} style={{ borderBottom: '1px solid #eee', verticalAlign: 'top' }}>
                <td style={{ padding: 8, fontWeight: 600 }}>{l.nome_vendedor}</td>
                {medidasAtivas.map((m) => (
                  <td key={m.key} style={{ padding: 8 }}><CelulaMedida medida={m} dados={l[m.key]} /></td>
                ))}
                <td style={{ padding: 8, textAlign: 'right', whiteSpace: 'nowrap' }}>
                  <button title="Editar objetivo" onClick={() => selecionarVendedor(l.cod_vendedor)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer' }}>✏️</button>
                  <button title="Remover" onClick={() => removerObjetivo(l.id)}
                    style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer' }}>🗑</button>
                </td>
              </tr>
            ))}
          </tbody>
          {linhas.length > 0 && totais && (
            <tfoot>
              <tr style={{ background: '#f0fdf4', fontWeight: 700, verticalAlign: 'top' }}>
                <td style={{ padding: 8 }}>Total da equipe</td>
                {medidasAtivas.map((m) => (
                  <td key={m.key} style={{ padding: 8 }}><CelulaMedida medida={m} dados={totais[m.key]} /></td>
                ))}
                <td />
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
};

// ===== Página principal =====
const GerenciarCampanhas = () => {
  const [campanhas, setCampanhas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [campanhaAberta, setCampanhaAberta] = useState(null);
  const [vendedores, setVendedores] = useState([]);

  const carregarCampanhas = useCallback((silencioso = false) => {
    if (!silencioso) setLoading(true);
    listarCampanhas()
      .then(({ data }) => setCampanhas(Array.isArray(data) ? data : data.results || []))
      .catch(() => setCampanhas([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { carregarCampanhas(); }, [carregarCampanhas]);

  useEffect(() => {
    getTodosVendedores({ params: { ativos: true } })
      .then(({ data }) => {
        // Todos_Vendedores() no backend retorna { detalhamento: [...] }
        const lista = Array.isArray(data) ? data : (data.detalhamento || data.vendedores || data.funcionarios_sql || []);
        setVendedores(lista.map((v) => ({
          cod: v.CodFuncionario ?? v.codFuncionario ?? v.cod,
          nome: v.Nome ?? v.Funcionario ?? v.nome ?? `Vendedor ${v.CodFuncionario ?? ''}`,
        })));
      })
      .catch(() => setVendedores([]));
  }, []);

  const handleCriada = (nova) => {
    setCampanhas((prev) => [nova, ...prev]);
    setMostrarForm(false);
    setCampanhaAberta(nova);
  };

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  return (
    <div style={{ padding: '1.5rem', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', gap: 8, flexWrap: 'wrap' }}>
        <h2 style={{ margin: 0 }}>🏆 Gerenciar Campanhas de Vendas</h2>
        {!mostrarForm && (
          <button onClick={() => setMostrarForm(true)}
            style={{ padding: '10px 18px', border: 'none', borderRadius: 8, background: '#16a34a', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
            + Nova Campanha
          </button>
        )}
      </div>

      {mostrarForm && <FormNovaCampanha onCriada={handleCriada} onCancelar={() => setMostrarForm(false)} />}

      {campanhaAberta && (
        <DetalheCampanha
          key={campanhaAberta.id}
          campanha={campanhaAberta}
          vendedores={vendedores}
          onFechar={() => setCampanhaAberta(null)}
          onAtualizada={() => carregarCampanhas(true)}
        />
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>Carregando campanhas...</div>
      ) : campanhas.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>Nenhuma campanha cadastrada ainda.</div>
      ) : (
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {campanhas.map((c) => {
            const encerrada = new Date(`${c.data_fim}T00:00:00`) < hoje;
            const nItens = c.itens?.length || 0;
            const nVend = c.objetivos?.length || 0;
            return (
              <div key={c.id} onClick={() => setCampanhaAberta(c)}
                style={{
                  background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '1rem',
                  cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8,
                }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{c.nome}</div>
                  <div style={{ fontSize: '0.8rem', color: '#888' }}>
                    {c.nome_fabricante} · {c.tipo_display} · {fmtDataBR(c.data_inicio)} a {fmtDataBR(c.data_fim)}
                    {' · '}{nItens} {c.tipo === 'GRUPO' ? 'grupo(s)' : 'material(is)'} · {nVend} vendedor(es)
                  </div>
                </div>
                <span style={{
                  fontSize: '0.75rem', fontWeight: 600, padding: '4px 10px', borderRadius: 999,
                  background: encerrada ? '#fee2e2' : '#dcfce7', color: encerrada ? '#dc2626' : '#16a34a',
                }}>
                  {encerrada ? 'Encerrada' : 'Ativa'}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default GerenciarCampanhas;