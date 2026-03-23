// CardsColaborador.jsx
import React, { useState, useEffect } from 'react';
import './CardsColaborador.css';
import ResumoSegmentoPies from '../Piechart/ResumoSegmentoPies';
import ReactSpeedometer from 'react-d3-speedometer';
import api from '../../api';
import { useAuth } from '../../contexts/auth';

const CardsColaborador = ({ colaborador, objetivosVendedores, periodoSelecionado, vendedoresList = [], onNavegar, projecoesPorVendedor = {} }) => {
  const [modo, setModo] = React.useState('indicadores');
  const { user } = useAuth();

  const temComissoes = Boolean(
    user?.gerente ||
    (user?.supervisor && String(user?.cod_unid_gestora) === '1') ||
    (user?.vendedor   && String(user?.cod_unid_gestora) === '1')
  );

  const [comissoes, setComissoes] = useState(null);
  const [loadingComissoes, setLoadingComissoes] = useState(false);

  // codFuncionario declarado ANTES do useEffect que o usa
  const codFuncionario = colaborador ? Number(colaborador.codFuncionario) : null;

  useEffect(() => {
    if (modo !== 'comissoes' || !temComissoes || !codFuncionario) return;
    setLoadingComissoes(true);
    api.get('/comissoes-vendedor/', { params: { cod_vendedor: codFuncionario } })
      .then((res) => setComissoes(res.data))
      .catch(() => setComissoes(null))
      .finally(() => setLoadingComissoes(false));
  }, [modo, codFuncionario, temComissoes]);

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

          <div className="card" style={{ background: '#f3e8ff' }}>
            <div className="card-title">Mix de Produtos:</div>
            <div>{mixRealizado} / {objetivoMix} itens</div>
            <div className="progress-container">
              <div
                className={`progress-bar ${getProgressClass(porcentagemMix)}`}
                style={{ width: `${Math.min(porcentagemMix, 100)}%` }}
              />
            </div>
            <div>Objetivo: {objetivoMix} itens</div>
            <div>Progresso: {porcentagemMix.toFixed(1)}%</div>
          </div>

          <div className="card" style={{ background: '#fff0f3' }}>
            <div className="card-title">Positivação:</div>
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
    </>
  );
  
};

export default CardsColaborador;
