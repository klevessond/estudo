// CardsColaborador.jsx
import React, { useState, useEffect } from 'react';
import './CardsColaborador.css';
import ResumoSegmentoPies from '../Piechart/ResumoSegmentoPies';
import ReactSpeedometer from 'react-d3-speedometer';
import api from '../../api';
import { useAuth } from '../../contexts/auth';
// jsPDF está disponível via CDN no bundle ou pode ser importado assim:
// npm install jspdf jspdf-autotable
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const CardsColaborador = ({ colaborador, objetivosVendedores, periodoSelecionado, vendedoresList = [], onNavegar, projecoesPorVendedor = {} }) => {
  const [modo, setModo] = React.useState('indicadores');
  const { user } = useAuth();

  // codFuncionario declarado ANTES do useEffect que o usa
  const codFuncionario = colaborador ? Number(colaborador.codFuncionario) : null;

  const isVendedorPuro = Boolean(user?.vendedor && !user?.supervisor && !user?.gerente && !user?.admin);
  const eOProprioPerfil = Number(user?.cod_funcionario) === codFuncionario;

 const temComissoes = Boolean(
    user?.gerente ||
    (user?.supervisor && String(user?.cod_unid_gestora) === '1') ||
    // vendedor puro: só mostra o botão quando está vendo o próprio perfil
    (isVendedorPuro && eOProprioPerfil && String(user?.cod_unid_gestora) === '1')
  );

  const [comissoes, setComissoes] = useState(null);
  const [loadingComissoes, setLoadingComissoes] = useState(false);
  const [modalMixAberto, setModalMixAberto] = useState(false);
  const [itensMix, setItensMix] = useState([]);
  const [loadingMix, setLoadingMix] = useState(false);
  const [mostrarNaoVendidos, setMostrarNaoVendidos] = useState(false);
  const [criterioValor, setCriterioValor] = useState(false);
  const [modalPosAberto, setModalPosAberto]         = useState(false);
  const [clientesPos, setClientesPos]               = useState([]);
  const [loadingPos, setLoadingPos]                 = useState(false);
  const [mostrarNaoPositivados, setMostrarNaoPositivados] = useState(false);

  
  useEffect(() => {
  if (!modalPosAberto || !codFuncionario || !periodoSelecionado) return;

  setLoadingPos(true);
  api.get('/indicadores/clientes-positivacao/', {
    params: {
      de:           periodoSelecionado.de,
      ate:          periodoSelecionado.ate,
      cod_vendedor: codFuncionario,
      positivados:  mostrarNaoPositivados ? "false" : "true",
    }
  })
    .then(res => setClientesPos(res.data?.clientes || []))
    .catch(() => setClientesPos([]))
    .finally(() => setLoadingPos(false));

}, [modalPosAberto, mostrarNaoPositivados, codFuncionario, periodoSelecionado]);


  
  useEffect(() => {
    if (modo !== 'comissoes' || !temComissoes || !codFuncionario) return;
    if (!user) return;

    // Vendedor puro só busca a própria comissão, independente do colaborador clicado
    const codParaBuscar = (user?.vendedor && !user?.supervisor && !user?.gerente && !user?.admin)
      ? Number(user.cod_funcionario)
      : codFuncionario;

    setLoadingComissoes(true);
    api.get('/comissoes-vendedor/', {
      params: {
        cod_vendedor: codParaBuscar,
        de: periodoSelecionado?.de,
        ate: periodoSelecionado?.ate,
      }
    })
      .then((res) => setComissoes(res.data))
      .catch(() => setComissoes(null))
      .finally(() => setLoadingComissoes(false));
  }, [modo, codFuncionario, temComissoes, periodoSelecionado, user]);

useEffect(() => {
  setComissoes(null);
}, [codFuncionario]);

// Busca ao abrir modal ou trocar toggle
useEffect(() => {
  if (!modalMixAberto || !codFuncionario || !periodoSelecionado) return;

  setLoadingMix(true);
  api.get('/indicadores/mix-itens/', {
    params: {
      de:           periodoSelecionado.de,
      ate:          periodoSelecionado.ate,
      cod_vendedor: codFuncionario,
      modo:    mostrarNaoVendidos ? "nao_vendidos" : "vendidos",
      criterio:     criterioValor ? "valor" : "qtd",   // ← NOVO
      ordem:          "top",
      total_qtd:      colaborador?.qtdItensTotal  || 0,   // total de unidades vendidas
      total_valor:    colaborador?.faturado        || 0,   // total financeiro do vendedor ← já existe
    }
  })
    .then(res => setItensMix(res.data?.itens || []))
    .catch(() => setItensMix([]))
    .finally(() => setLoadingMix(false));

}, [modalMixAberto, mostrarNaoVendidos, criterioValor, codFuncionario, periodoSelecionado]);

  const exportarMixPDF = () => {
    // eslint-disable-next-line no-undef
    const doc = new jsPDF();
    const titulo = mostrarNaoVendidos ? 'Produtos Não Vendidos' : 'Produtos Vendidos';
    const criterioLabel = criterioValor ? 'Valor Financeiro' : 'Quantidade';
    const nomeVendedor = colaborador?.colaborador || 'Vendedor';

    doc.setFontSize(14);
    doc.text(`Mix de Produtos — ${nomeVendedor}`, 14, 15);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`${titulo} | Ordenado por: ${criterioLabel}`, 14, 22);
    doc.text(`Período: ${periodoSelecionado?.de} a ${periodoSelecionado?.ate}`, 14, 28);
    doc.text(`Total: ${itensMix.length} produtos`, 14, 34);

    const colunas = mostrarNaoVendidos
      ? ['#', 'Produto']
      : ['#', 'Produto', 'Qtd', 'Valor (R$)', '% Qtd', '% Valor'];

    const linhas = itensMix.map((item, i) => {
      const base = [i + 1, item.Material || `Cod: ${item.CodMaterial}`];
      if (!mostrarNaoVendidos) {
        base.push(
          Number(item.QtdItens).toLocaleString('pt-BR'),
          Number(item.ValorTotal).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
          `${item.PercQtd ?? 0}%`,
          `${item.PercValor ?? 0}%`,
        );
      }
      return base;
    });

    autoTable(doc, {
      head: [colunas],
      body: linhas,
      startY: 40,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [124, 58, 237] },
      alternateRowStyles: { fillColor: [250, 245, 255] },
    });

    doc.save(`mix_${nomeVendedor.replace(/\s+/g, '_')}_${periodoSelecionado?.de}.pdf`);
  };

  const exportarPosicaoPDF = () => {
    // eslint-disable-next-line no-undef
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const titulo = mostrarNaoPositivados ? 'Clientes Não Positivados' : 'Clientes Positivados';
    const nomeVendedor = colaborador?.colaborador || 'Vendedor';

    doc.setFontSize(14);
    doc.text(`Positivação — ${nomeVendedor}`, 14, 15);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`${titulo}`, 14, 22);
    doc.text(`Período: ${periodoSelecionado?.de} a ${periodoSelecionado?.ate}`, 14, 28);
    doc.text(`Total: ${clientesPos.length} clientes`, 14, 34);

    doc.autoTable({
      head: [['#', 'Cliente', 'Rota']],
      body: clientesPos.map((c, i) => [
        i + 1,
        c.ClienteFantasia && c.ClienteFantasia !== c.Cliente
          ? `${c.Cliente} (${c.ClienteFantasia})`
          : c.Cliente,
        c.Rota,
      ]),
      startY: 40,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: mostrarNaoPositivados ? [239, 68, 68] : [34, 197, 94] },
      alternateRowStyles: { fillColor: mostrarNaoPositivados ? [255, 245, 245] : [240, 253, 244] },
    });

    doc.save(`positivacao_${nomeVendedor.replace(/\s+/g, '_')}_${periodoSelecionado?.de}.pdf`);
  };

  // early return DEPOIS de todos os hooks
  if (!colaborador) return null;
  const indiceAtual = vendedoresList.findIndex(
    (v) => Number(v.codFuncionario) === Number(colaborador.codFuncionario)
  );
  const temAnterior = indiceAtual > 0;
  const temProximo = indiceAtual < vendedoresList.length - 1;

  const irPara = (idx) => {
    const prox = vendedoresList[idx];
    if (prox) onNavegar?.(prox);
  };

  
  const dadosColaborador = objetivosVendedores.find(
    obj => obj.codFuncionario === codFuncionario
  );

  const projecoes = projecoesPorVendedor[codFuncionario] || null;
  const projFin   = projecoes?.financeiro_total ?? projecoes?.financeiro_rotas ?? null;
  const projPeso  = projecoes?.peso ?? null;
  const projMix   = projecoes?.mix ?? null;
  const projPos   = projecoes?.positivacao ?? null;
  const posCuponsPdv  = projecoes?.pos_cupons_pdv ?? 0;
  const posRotas  = projecoes?.pos_rotas ?? (colaborador.qtdClientes || 0);
  const posTotal  = projecoes?.pos_total ?? (colaborador.qtdClientes || 0);
  const temPosPdv     = posCuponsPdv > 0;

  const objetivoPeso = dadosColaborador?.objetivo_peso ?? 0;  
  const obrotaTotal = dadosColaborador?.objetivo_positivacao ?? 0;
  const pesototalvendido = colaborador.pesototalvendido || 0;
  const qtdClientes = colaborador.qtdClientes || 0;
  const objetivoFinanceiro = dadosColaborador?.objetivo_financeiro || 0;

  const faturado = colaborador.faturado || 0;
  const percentualFinanceiro = objetivoFinanceiro > 0 ? (faturado / objetivoFinanceiro) * 100 : 0;
  const variacaoFinanceira = objetivoFinanceiro ? (faturado - objetivoFinanceiro) : 0;

  const porcentagemPositivacao = obrotaTotal > 0 ? (qtdClientes / obrotaTotal) * 100 : 0;
  const porcentagemPeso = objetivoPeso > 0 ? (pesototalvendido / objetivoPeso) * 100 : 0;

  const mixRealizado = colaborador.mix || 0;
  const objetivoMix = dadosColaborador?.objetivo_mix || 0;
  const porcentagemMix = objetivoMix > 0 ? (mixRealizado / objetivoMix) * 100 : 0;


const alocado = colaborador.alocado || 0;

  // % do Alocado em relação ao objetivo financeiro
  const percentualAlocado = objetivoFinanceiro > 0 ? (alocado / objetivoFinanceiro) * 100 : 0;

  // % de Variação em relação ao objetivo financeiro
  // (equivale ao crescimento/queda vs meta)
  const percentualVariacaoFinanceira = objetivoFinanceiro > 0 ? (variacaoFinanceira / objetivoFinanceiro) * 100 : 0;


  const getProgressClass = (percentage) => {
    if (percentage >= 100) return 'progress-high';
    if (percentage >= 50) return 'progress-medium';
    return 'progress-low';
  };

  // === Gauge com o gradiente de cores original, mas sem números ===
  const Gauge = ({ label, valuePercent }) => {
    const val = Number.isFinite(valuePercent) ? valuePercent : 0;

    return (
      <div style={{ textAlign: 'center' }}>
        <h4 style={{ marginBottom: '0.5rem' }}>{label}</h4>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <ReactSpeedometer
            maxValue={100}
            value={val}
            segments={5} // mantém o degradê original
            height={160}
            width={250}
            ringWidth={25}
            segmentColors={['#F44336', '#FF9800', '#FFEB3B', '#8BC34A', '#4CAF50']}
            needleColor="#1E88E5"
            textColor="transparent" // esconde os números (20, 40, etc.)
            currentValueText="" // remove texto padrão
            customSegmentLabels={[]} // remove labels
            needleTransitionDuration={500}
            needleTransition="easeElastic"
          />
          {/* Valor exato centralizado */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -40%)',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#1E88E5',
            }}
          >
            {val.toFixed(1)}%
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

        {/* Setas de navegação + nome */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={() => irPara(indiceAtual - 1)}
            disabled={!temAnterior}
            title="Vendedor anterior"
            style={{
              background: 'none',
              border: '2px solid #0074c2',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              cursor: temAnterior ? 'pointer' : 'not-allowed',
              opacity: temAnterior ? 1 : 0.3,
              fontSize: '1rem',
              color: '#0074c2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            ‹
          </button>

          <h2
            className="card-title"
            style={{
              fontSize: '1.5rem',
              color: '#0074c2',
              borderBottom: '2px solid #0074c2',
              paddingBottom: '0.5rem',
              marginBottom: 0
            }}
          >
            {colaborador.colaborador}
            {vendedoresList.length > 0 && (
              <span style={{ fontSize: '0.8rem', color: '#888', marginLeft: '0.5rem', fontWeight: 'normal' }}>
                {indiceAtual + 1}/{vendedoresList.length}
              </span>
            )}
          </h2>

          <button
            onClick={() => irPara(indiceAtual + 1)}
            disabled={!temProximo}
            title="Próximo vendedor"
            style={{
              background: 'none',
              border: '2px solid #0074c2',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              cursor: temProximo ? 'pointer' : 'not-allowed',
              opacity: temProximo ? 1 : 0.3,
              fontSize: '1rem',
              color: '#0074c2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            ›
          </button>
        </div>
        <div>
          <button
            onClick={() => setModo('indicadores')}
            className={modo === 'indicadores' ? 'ativo-indicadores' : ''}
            style={{ marginRight: '0.5rem' }}
          >
            🎯 Indicadores
          </button>
          <button
            onClick={() => setModo('graficos')}
            className={modo === 'graficos' ? 'ativo-graficos' : ''}
          >
            📊 Gráficos
          </button>
                  {temComissoes && (
            <button
              onClick={() => setModo('comissoes')}
              className={modo === 'comissoes' ? 'ativo-comissoes' : ''}
            >
              💰 Comissões
            </button>
          )}
        </div>
      </div>

      {modo === 'comissoes' && temComissoes && (
        <div style={{ marginTop: '1rem' }}>
          {loadingComissoes ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#0074c2' }}>
              Carregando comissões...
            </div>
          ) : !comissoes ? (
            <div style={{ textAlign: 'center', color: '#888' }}>Sem dados de comissão.</div>
          ) : (
            <>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                <div className="card" style={{ background: '#eafaf1', minWidth: '180px' }}>
                  <div className="card-title">Total a Receber</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#0074c2' }}>
                    {Number(comissoes.total_comissao).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </div>
                </div>
                <div className="card" style={{ background: '#f0f4ff', minWidth: '180px' }}>
                  <div className="card-title">Valor dos Pedidos</div>
                  <div>
                    {Number(comissoes.total_valor_pedidos).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </div>
                </div>
              </div>

              <div style={{ overflowX: 'auto', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                  <thead style={{ background: '#0074c2', color: '#fff', position: 'sticky', top: 0 }}>
                    <tr>
                      {['Data', 'Cliente', 'Rota', 'Nat. Operação', 'Situação Pgto', '% Comissão', 'Comissão R$', 'Valor Pedido'].map((h) => (
                        <th key={h} style={{ padding: '8px', textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {comissoes.detalhado.map((row, i) => (
                      <tr key={row.CodPedidoVenda} style={{ background: i % 2 === 0 ? '#f9f9f9' : '#fff' }}>
                        <td style={{ padding: '6px 8px' }}>{row.DataVenda}</td>
                        <td style={{ padding: '6px 8px' }}>{row.Cliente}</td>
                        <td style={{ padding: '6px 8px' }}>{row.Rota}</td>
                        <td style={{ padding: '6px 8px' }}>{row.NaturezaOperacao}</td>
                        <td style={{ padding: '6px 8px' }}>{row.SituacaoPagamento}</td>
                        <td style={{ padding: '6px 8px' }}>{Number(row.ComissaoPercentual).toFixed(2)}%</td>
                        <td style={{ padding: '6px 8px', fontWeight: 600, color: '#0074c2' }}>
                          {Number(row.ComissaoValor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </td>
                        <td style={{ padding: '6px 8px' }}>
                          {Number(row.ValorPedido).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}
      
      {modo === 'graficos' ? (
        <div className="dashboard-graficos" style={{ marginTop: '1rem' }}>
          <h3>Velocímetros de Meta</h3>
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Gauge label="Faturado" valuePercent={parseFloat(percentualFinanceiro.toFixed(2))} />
            <Gauge label="Peso" valuePercent={parseFloat(porcentagemPeso.toFixed(2))} />
            <Gauge label="Positivação" valuePercent={parseFloat(porcentagemPositivacao.toFixed(2))} />
            <Gauge label="Mix" valuePercent={parseFloat(porcentagemMix.toFixed(2))} />

            <div style={{ marginTop: '1.5rem', flexBasis: '100%' }}>
              <h3>Composição por Segmento</h3>
              <ResumoSegmentoPies
                periodoSelecionado={periodoSelecionado}
                codFuncionario={Number(colaborador.codFuncionario)}
              />
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
          {/* Cards de indicadores — mantém o estilo original */}
          
          <div className="card" style={{ background: '#eafaf1' }}>
            <div className="card-title">Faturado:</div>
            <div>R$ {faturado.toLocaleString('pt-BR')}</div>
            {objetivoFinanceiro > 0 && (
              <>
                <div className="progress-container">
                  <div
                    className={`progress-bar ${getProgressClass(percentualFinanceiro)}`}
                    style={{ width: `${Math.min(percentualFinanceiro, 100)}%` }}
                  />
                </div>
                <div>Objetivo: R$ {objetivoFinanceiro.toLocaleString('pt-BR')}</div>
                <div>Progresso: {percentualFinanceiro.toFixed(1)}%</div>
                <div>Variação: R$ {variacaoFinanceira.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ({percentualVariacaoFinanceira.toFixed(1)}%)</div>
              </>
            )}
          </div>

          <div className="card" style={{ background: '#eaf2fa' }}>
            <div className="card-title">A Faturar:</div>
            R$ {colaborador.aFaturar?.toLocaleString('pt-BR')}
          </div>

            <div className="card" style={{ background: '#f9f0e6' }}>
              <div className="card-title">Alocado:</div>
              R$ {alocado.toLocaleString('pt-BR')}

              {objetivoFinanceiro > 0 && (
                <>
                  <div className="progress-container">
                    <div
                      className={`progress-bar ${getProgressClass(percentualAlocado)}`}
                      style={{ width: `${Math.min(percentualAlocado, 100)}%` }}
                    />
                  </div>
                  <div>Progresso: {percentualAlocado.toFixed(1)}%</div>
                </>
              )}
            </div>


          <div className="card" style={{ background: '#eafae1' }}>
            <div className="card-title">Peso Vendido:</div>
            {pesototalvendido.toLocaleString('pt-BR')} kg
            <div className="progress-container">
              <div
                className={`progress-bar ${getProgressClass(porcentagemPeso)}`}
                style={{ width: `${Math.min(porcentagemPeso, 100)}%` }}
              />
            </div>
            <div>Objetivo: {objetivoPeso.toLocaleString('pt-BR')} kg</div>
            <div>Progresso: {porcentagemPeso.toFixed(1)}%</div>
          </div>
            <div
              className="card"
              style={{ background: '#f3e8ff', cursor: 'pointer' }}
              onClick={() => setModalMixAberto(true)}
              title="Clique para ver os produtos"
            >
              <div className="card-title">Mix de Produtos: 🔍</div>
              <div>{mixRealizado} / {objetivoMix} itens</div>
              <div className="progress-container">
                <div className={`progress-bar ${getProgressClass(porcentagemMix)}`}
                    style={{ width: `${Math.min(porcentagemMix, 100)}%` }} />
              </div>
              <div>Objetivo: {objetivoMix} itens</div>
              <div>Progresso: {porcentagemMix.toFixed(1)}%</div>
            </div>

          <div 
          className="card" 
          onClick={() => setModalPosAberto(true)}
          style={{ background: '#fff0f3' ,cursor: 'pointer' }}
          title="Clique para ver os clientes"
          >
            <div className="card-title">Positivação: 🔍</div>
            {temPosPdv ? (
              <>
                <div>Rotas: {posRotas}</div>
                <div>PDV: {posCuponsPdv} cupons</div>
                <div><strong>Total: {posTotal} / {obrotaTotal.toLocaleString('pt-BR')}</strong></div>
              </>
            ) : (
              <div>{qtdClientes} / {obrotaTotal.toLocaleString('pt-BR')}</div>
            )}
            <div className="progress-container">
              <div
                className={`progress-bar ${getProgressClass(
                  obrotaTotal > 0 ? (posTotal / obrotaTotal) * 100 : porcentagemPositivacao
                )}`}
                style={{ width: `${Math.min(
                  obrotaTotal > 0 ? (posTotal / obrotaTotal) * 100 : porcentagemPositivacao,
                  100
                )}%` }}
              />
            </div>
            <div>Objetivo: {obrotaTotal.toLocaleString('pt-BR')} clientes</div>
            <div>Progresso: {(obrotaTotal > 0 ? (posTotal / obrotaTotal) * 100 : porcentagemPositivacao).toFixed(1)}%</div>
          </div>
          {projecoes && (
            <div style={{ flexBasis: '100%', marginTop: '0.5rem' }}>
              <div style={{
                background: '#f0f4ff',
                borderRadius: '8px',
                padding: '1rem',
              }}>
                <div className="card-title" style={{ marginBottom: '0.75rem' }}>
                  📈 Projeção (Tendência)
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>

                  {projFin && (
                    <div style={{ minWidth: '140px' }}>
                      <div style={{ fontSize: '0.75rem', color: '#555' }}>Financeiro</div>
                      <div style={{ fontWeight: 'bold', color: projFin.atingimento_projetado >= 100 ? '#4CAF50' : '#F44336' }}>
                        {projFin.atingimento_projetado?.toFixed(1)}%
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#777' }}>
                        Proj: R$ {Number(projFin.projecao_final || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#777' }}>
                        Meta/dia: R$ {Number(projFin.meta_diaria_necessaria || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  )}

                  {projPeso && (
                    <div style={{ minWidth: '140px' }}>
                      <div style={{ fontSize: '0.75rem', color: '#555' }}>Peso</div>
                      <div style={{ fontWeight: 'bold', color: projPeso.atingimento_projetado >= 100 ? '#4CAF50' : '#F44336' }}>
                        {projPeso.atingimento_projetado?.toFixed(1)}%
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#777' }}>
                        Proj: {Number(projPeso.projecao_final || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} kg
                      </div>
                    </div>
                  )}

                  {projMix && (
                    <div style={{ minWidth: '140px' }}>
                      <div style={{ fontSize: '0.75rem', color: '#555' }}>Mix</div>
                      <div style={{ fontWeight: 'bold', color: projMix.atingimento_projetado >= 100 ? '#4CAF50' : '#F44336' }}>
                        {projMix.atingimento_projetado?.toFixed(1)}%
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#777' }}>
                        Proj: {Number(projMix.projecao_final || 0).toFixed(0)} itens
                      </div>
                    </div>
                  )}

                  {projPos && (
                    <div style={{ minWidth: '140px' }}>
                      <div style={{ fontSize: '0.75rem', color: '#555' }}>Positivação</div>
                      <div style={{ fontWeight: 'bold', color: projPos.atingimento_projetado >= 100 ? '#4CAF50' : '#F44336' }}>
                        {projPos.atingimento_projetado?.toFixed(1)}%
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#777' }}>
                        Proj: {Number(projPos.projecao_final || 0).toFixed(0)} clientes
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>
          )}
        </div>
      )}


{modalMixAberto && (
  <div style={{
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000,
  }}>
    <div style={{
      background: '#fff', borderRadius: '12px', padding: '1.5rem',
      width: '90%', maxWidth: '600px', maxHeight: '80vh',
      display: 'flex', flexDirection: 'column', gap: '1rem',
    }}>
      {/* Cabeçalho */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0 }}>
          {mostrarNaoVendidos ? '❌ Não Vendidos' : '✅ Vendidos'} — Mix
          <span style={{ fontSize: '0.875rem', fontWeight: 400, color: '#888', marginLeft: 8 }}>
            ({itensMix.length} produtos)
          </span>
        </h3>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button
            onClick={exportarMixPDF}
            style={{
              background: '#7c3aed', color: '#fff', border: 'none',
              borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', fontSize: '0.8rem'
            }}
          >
            📄 Exportar PDF
          </button>
          <button onClick={() => setModalMixAberto(false)}
            style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>
            ✕
          </button>
        </div>
      </div>

      {/* Toggle mais/menos vendidos */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{
              color: mostrarNaoVendidos ? '#aaa' : '#22c55e',
              fontWeight: mostrarNaoVendidos ? 400 : 600,
              fontSize: '0.875rem'
            }}>
              ✅ Vendidos
            </span>
            <div onClick={() => setMostrarNaoVendidos(v => !v)}
              style={{
                width: '44px', height: '24px', borderRadius: '999px', cursor: 'pointer',
                background: mostrarNaoVendidos ? '#ef4444' : '#22c55e',
                position: 'relative', transition: 'background 0.2s',
              }}>
              <div style={{
                position: 'absolute', top: '3px',
                left: mostrarNaoVendidos ? '23px' : '3px',
                width: '18px', height: '18px', borderRadius: '50%',
                background: '#fff', transition: 'left 0.2s',
              }} />
            </div>
            <span style={{
              color: mostrarNaoVendidos ? '#ef4444' : '#aaa',
              fontWeight: mostrarNaoVendidos ? 600 : 400,
              fontSize: '0.875rem'
            }}>
              ❌ Não Vendidos
            </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.875rem', color: criterioValor ? '#aaa' : '#1e88e5', fontWeight: criterioValor ? 400 : 600 }}>
              📦 Quantidade
            </span>
            <div onClick={() => setCriterioValor(v => !v)}
              style={{
                width: '44px', height: '24px', borderRadius: '999px', cursor: 'pointer',
                background: criterioValor ? '#1e88e5' : '#9ca3af',
                position: 'relative', transition: 'background 0.2s',
              }}>
              <div style={{
                position: 'absolute', top: '3px',
                left: criterioValor ? '23px' : '3px',
                width: '18px', height: '18px', borderRadius: '50%',
                background: '#fff', transition: 'left 0.2s',
              }} />
            </div>
            <span style={{ fontSize: '0.875rem', color: criterioValor ? '#1e88e5' : '#aaa', fontWeight: criterioValor ? 600 : 400 }}>
              💰 Valor
            </span>
      </div>

      {/* Lista */}
      <div style={{ overflowY: 'auto', flex: 1 }}>
        {loadingMix ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
            Carregando...
          </div>
        ) : itensMix.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
            Nenhum item encontrado.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: '#f3e8ff', textAlign: 'left' }}>
                <th style={{ padding: '8px' }}>#</th>
                <th style={{ padding: '8px' }}>Produto</th>
                {!mostrarNaoVendidos && (
                  <>
                    <th style={{ padding: '8px', textAlign: 'right',
                                color: criterioValor ? '#aaa' : '#7c3aed', fontWeight: criterioValor ? 400 : 700 }}>
                      Qtd {!criterioValor && '▼'}
                    </th>
                    <th style={{ padding: '8px', textAlign: 'right',
                                color: criterioValor ? '#7c3aed' : '#aaa', fontWeight: criterioValor ? 700 : 400 }}>
                      Valor {criterioValor && '▼'}
                    </th>
                </>)}
                <th style={{ padding: '8px', textAlign: 'right', color: '#7c3aed' }}>%</th>
              </tr>
            </thead>
            <tbody>
              {itensMix.map((item, i) => (
                <tr key={item.CodMaterial}
                  style={{ borderBottom: '1px solid #eee', background: i % 2 === 0 ? '#faf5ff' : '#fff' }}>
                  <td style={{ padding: '6px 8px', color: '#888' }}>{i + 1}</td>
                  <td style={{ padding: '6px 8px' }}>{item.Material || `Cod: ${item.CodMaterial}`}</td>
                  <td style={{ padding: '6px 8px', textAlign: 'right',
                              fontWeight: criterioValor ? 400 : 700,
                              color: criterioValor ? '#555' : '#000' }}>
                    {Number(item.QtdItens).toLocaleString('pt-BR')}
                  </td>
                  <td style={{ padding: '6px 8px', textAlign: 'right',
                              fontWeight: criterioValor ? 700 : 400,
                              color: criterioValor ? '#000' : '#555' }}>
                    {Number(item.ValorTotal).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                  <td style={{ padding: '6px 8px', textAlign: 'right', color: '#7c3aed', fontWeight: 500 }}>
                      {criterioValor
                        ? `${Number(item.PercValor || 0).toFixed(1)}%`
                        : `${Number(item.PercQtd   || 0).toFixed(1)}%`
                      }
                   </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  </div>
)}

{modalPosAberto && (
  <div style={{
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000,
  }}>
    <div style={{
      background: '#fff', borderRadius: '12px', padding: '1.5rem',
      width: '90%', maxWidth: '600px', maxHeight: '80vh',
      display: 'flex', flexDirection: 'column', gap: '1rem',
    }}>
      {/* Cabeçalho */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0 }}>
          {mostrarNaoPositivados ? '❌ Não Positivados' : '✅ Positivados'}
          <span style={{ fontSize: '0.875rem', fontWeight: 400, color: '#888', marginLeft: 8 }}>
            ({clientesPos.length} clientes)
          </span>
        </h3>
        <button onClick={() => setModalPosAberto(false)}
          style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>
          ✕
        </button>
                    <button
              onClick={exportarPosicaoPDF}
              style={{
                background: mostrarNaoPositivados ? '#ef4444' : '#22c55e',
                color: '#fff', border: 'none', borderRadius: '6px',
                padding: '4px 10px', cursor: 'pointer', fontSize: '0.8rem'
              }}
            >
              📄 Exportar PDF
            </button>
        </div>

      {/* Toggle positivados / não positivados */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span style={{
          fontSize: '0.875rem',
          color: mostrarNaoPositivados ? '#aaa' : '#22c55e',
          fontWeight: mostrarNaoPositivados ? 400 : 600
        }}>
          ✅ Positivados
        </span>
        <div onClick={() => setMostrarNaoPositivados(v => !v)}
          style={{
            width: '44px', height: '24px', borderRadius: '999px', cursor: 'pointer',
            background: mostrarNaoPositivados ? '#ef4444' : '#22c55e',
            position: 'relative', transition: 'background 0.2s',
          }}>
          <div style={{
            position: 'absolute', top: '3px',
            left: mostrarNaoPositivados ? '23px' : '3px',
            width: '18px', height: '18px', borderRadius: '50%',
            background: '#fff', transition: 'left 0.2s',
          }} />
        </div>
        <span style={{
          fontSize: '0.875rem',
          color: mostrarNaoPositivados ? '#ef4444' : '#aaa',
          fontWeight: mostrarNaoPositivados ? 600 : 400
        }}>
          ❌ Não Positivados
        </span>
      </div>

      {/* Lista */}
      <div style={{ overflowY: 'auto', flex: 1 }}>
        {loadingPos ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
            Carregando...
          </div>
        ) : clientesPos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
            Nenhum cliente encontrado.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: mostrarNaoPositivados ? '#fee2e2' : '#dcfce7', textAlign: 'left' }}>
                <th style={{ padding: '8px' }}>#</th>
                <th style={{ padding: '8px' }}>Cliente</th>
                <th style={{ padding: '8px' }}>Rota</th>
              </tr>
            </thead>
            <tbody>
              {clientesPos.map((cliente, i) => (
                <tr key={cliente.CodCliente}
                  style={{
                    borderBottom: '1px solid #eee',
                    background: i % 2 === 0
                      ? (mostrarNaoPositivados ? '#fff5f5' : '#f0fdf4')
                      : '#fff'
                  }}>
                  <td style={{ padding: '6px 8px', color: '#888' }}>{i + 1}</td>
                  <td style={{ padding: '6px 8px' }}>
                    <div style={{ fontWeight: 500 }}>{cliente.Cliente}</div>
                    {cliente.ClienteFantasia && cliente.ClienteFantasia !== cliente.Cliente && (
                      <div style={{ fontSize: '0.75rem', color: '#888' }}>{cliente.ClienteFantasia}</div>
                    )}
                  </td>
                  <td style={{ padding: '6px 8px', color: '#555', fontSize: '0.8rem' }}>
                    {cliente.Rota}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  </div>
)}
    </>
  );
  
};

export default CardsColaborador;
