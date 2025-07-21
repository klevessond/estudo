import React from 'react';
import './CardsColaborador.css';
import ReactSpeedometer from 'react-d3-speedometer';

const CardsColaborador = ({ colaborador, objetivosVendedores }) => {
  const [modo, setModo] = React.useState('graficos');
  if (!colaborador) return null;

  const codFuncionario = Number(colaborador.codFuncionario);
  const dadosColaborador = objetivosVendedores.find(
    obj => obj.codFuncionario === codFuncionario
  );

  const objetivoPeso = dadosColaborador?.objetivo || 0;
  const obrotaTotal = dadosColaborador?.obrotatotal || 0;
  const pesototalvendido = colaborador.pesototalvendido || 0;
  const qtdClientes = colaborador.qtdClientes || 0;
  const objetivoFinanceiro = dadosColaborador?.objetivo_financeiro || 0;
  const percentualFinanceiro = objetivoFinanceiro > 0
    ? (colaborador.faturado / objetivoFinanceiro) * 100
    : 0;
  const faturado = colaborador.faturado || 0;
  const variacaoFinanceira = objetivoFinanceiro ? (faturado - objetivoFinanceiro) : 0;
  const porcentagemPositivação = obrotaTotal > 0 ? (qtdClientes / obrotaTotal) * 100 : 0;
  const porcentagemPeso = objetivoPeso > 0 ? (pesototalvendido / objetivoPeso) * 100 : 0;

  const getProgressClass = (percentage) => {
    if (percentage >= 100) return 'progress-high';
    if (percentage >= 50) return 'progress-medium';
    return 'progress-low';
  };

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 className="card-title" style={{
          fontSize: '1.5rem',
          color: '#0074c2',
          borderBottom: '2px solid #0074c2',
          paddingBottom: '0.5rem',
          marginBottom: 0
        }}>
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
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            <div>
              <h4>Faturado</h4>
              <ReactSpeedometer
                maxValue={100}
                value={parseFloat(percentualFinanceiro.toFixed(1))}
                segments={5}
                height={160}
              />
            </div>
            <div>
              <h4>Peso</h4>
              <ReactSpeedometer
                maxValue={100}
                value={parseFloat(porcentagemPeso.toFixed(1))}
                segments={5}
                height={160}
              />
            </div>
            <div>
              <h4>Positivação</h4>
              <ReactSpeedometer
                maxValue={100}
                value={parseFloat(porcentagemPositivação.toFixed(1))}
                segments={5}
                height={160}
              />
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
          {/* Card Faturado */}
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

          {/* Card A Faturar */}
          <div className="card" style={{ background: '#eaf2fa' }}>
            <div className="card-title">A Faturar:</div>
            R$ {colaborador.aFaturar?.toLocaleString('pt-BR')}
          </div>

          {/* Card Alocado */}
          <div className="card" style={{ background: '#f9f0e6' }}>
            <div className="card-title">Alocado:</div>
            R$ {colaborador.alocado?.toLocaleString('pt-BR')}
          </div>

          {/* Card Variação */}
          <div className="card" style={{ background: '#f1faff' }}>
            <div className="card-title">Variação:</div>
            R$ {variacaoFinanceira.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>

          {/* Card Positivação */}
          <div className="card" style={{ background: '#fff0f3' }}>
            <div className="card-title">Positivação:</div>
            <div>{qtdClientes} / {obrotaTotal.toLocaleString('pt-BR')}</div>
            <div className="progress-container">
              <div
                className={`progress-bar ${getProgressClass(porcentagemPositivação)}`}
                style={{ width: `${Math.min(porcentagemPositivação, 100)}%` }}
              />
            </div>
            <div>Objetivo: {obrotaTotal.toLocaleString('pt-BR')} clientes</div>
            <div>Progresso: {porcentagemPositivação.toFixed(1)}%</div>
          </div>

          {/* Card Peso */}
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
        </div>
      )}
    </>
  );
};

export default CardsColaborador;
