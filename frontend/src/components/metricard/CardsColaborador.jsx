// CardsColaborador.jsx
import React from 'react';
import './CardsColaborador.css';
import ResumoSegmentoPies from '../Piechart/ResumoSegmentoPies';
import ReactSpeedometer from 'react-d3-speedometer';

const CardsColaborador = ({ colaborador, objetivosVendedores, periodoSelecionado }) => {
  const [modo, setModo] = React.useState('graficos');
  if (!colaborador) return null;

  const codFuncionario = Number(colaborador.codFuncionario);
  const dadosColaborador = objetivosVendedores.find(
    obj => obj.codFuncionario === codFuncionario
  );

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
        </h2>
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
        </div>
      </div>

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
              </>
            )}
          </div>

          <div className="card" style={{ background: '#eaf2fa' }}>
            <div className="card-title">A Faturar:</div>
            R$ {colaborador.aFaturar?.toLocaleString('pt-BR')}
          </div>

          <div className="card" style={{ background: '#f9f0e6' }}>
            <div className="card-title">Alocado:</div>
            R$ {colaborador.alocado?.toLocaleString('pt-BR')}
          </div>

          <div className="card" style={{ background: '#f1faff' }}>
            <div className="card-title">Variação:</div>
            R$ {variacaoFinanceira.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>

          <div className="card" style={{ background: '#fff0f3' }}>
            <div className="card-title">Positivação:</div>
            <div>{qtdClientes} / {obrotaTotal.toLocaleString('pt-BR')}</div>
            <div className="progress-container">
              <div
                className={`progress-bar ${getProgressClass(porcentagemPositivacao)}`}
                style={{ width: `${Math.min(porcentagemPositivacao, 100)}%` }}
              />
            </div>
            <div>Objetivo: {obrotaTotal.toLocaleString('pt-BR')} clientes</div>
            <div>Progresso: {porcentagemPositivacao.toFixed(1)}%</div>
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
        </div>
      )}
    </>
  );
};

export default CardsColaborador;
