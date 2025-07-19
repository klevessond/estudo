import React from 'react';
import './CardsColaborador.css';

const CardsColaborador = ({ colaborador, objetivosVendedores }) => {
    if (!colaborador) return null;

    console.log('Dados recebidos no CardsColaborador:', {
      colaborador,
      objetivosVendedores
    });

    const codFuncionario = Number(colaborador.codFuncionario);
    const dadosColaborador = objetivosVendedores.find(
      obj => obj.codFuncionario === codFuncionario
    );
    
    
    // Valores com fallback para 0
    const objetivoPeso = dadosColaborador?.objetivo || 0;
    const obrotaTotal = dadosColaborador?.obrotatotal || 0;
    const pesototalvendido = colaborador.pesototalvendido || 0;
    const qtdClientes = colaborador.qtdClientes || 0;
    const objetivoFinanceiro = dadosColaborador?.objetivo_financeiro || 0;
    const percentualFinanceiro = objetivoFinanceiro > 0 ? (colaborador.faturado / objetivoFinanceiro) * 100 : 0;
    const faturado = colaborador.faturado || 0;
    const variacaoFinanceira = objetivoFinanceiro ? (faturado - objetivoFinanceiro) : 0;

    // Cálculo da porcentagem de positivação (clientes atendidos)
    const porcentagemPositivação = obrotaTotal > 0 
      ? (qtdClientes / obrotaTotal) * 100 
      : 0;

    // Cálculo da porcentagem de peso vendido
    const porcentagemPeso = objetivoPeso > 0
      ? (pesototalvendido / objetivoPeso) * 100
      : 0;

    // Função para determinar a classe CSS baseada na porcentagem
    const getProgressClass = (percentage) => {
      if (percentage >= 100) return 'progress-high';
      if (percentage >= 50) return 'progress-medium';
      return 'progress-low';
    };

    return (
      <div style={{ marginTop: '1rem' }}>
        <h2 className="card-title" style={{
          fontSize: '1.5rem',
          color: '#0074c2',
          borderBottom: '2px solid #0074c2',
          paddingBottom: '0.5rem',
        }}>
          {colaborador.colaborador}
        </h2>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
          {/* Card Faturado */}
          <div className="card" style={{ background: '#eafaf1' }}>
          <div className="card-title">Faturado:</div>
          <div>R$ {colaborador.faturado.toLocaleString('pt-BR')}</div>

          {objetivoFinanceiro > 0 && (
            <>
              <div className="progress-container">
                <div
                  className={`progress-bar ${getProgressClass(percentualFinanceiro)}`}
                  style={{ width: `${Math.min(percentualFinanceiro, 100)}%` }}
                />
              </div>
              <div className="progress-info">
                <span>Objetivo: R$ {objetivoFinanceiro.toLocaleString('pt-BR')}</span>
                <strong>{percentualFinanceiro.toFixed(1)}%</strong>
              </div>
            </>
          )}
        </div>

          {/* Card A Faturar */}
          <div className="card" style={{ background: '#eaf2fa' }}>
            <div className="card-title">A Faturar:</div>
            R$ {colaborador.aFaturar.toLocaleString('pt-BR')}
          </div>

          {/* Card Alocado */}
          <div className="card" style={{ background: '#f9f0e6' }}>
            <div className="card-title">Alocado:</div>
            R$ {colaborador.alocado.toLocaleString('pt-BR')}
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
            
            <div className="progress-info">
              <span>Progresso:</span>
              <strong>{porcentagemPositivação.toFixed(1)}%</strong>
            </div>
          </div>


          {/* Card Peso */}
          <div className="card" style={{ background: '#eafae1' }}>
            <div className="card-title">Peso Vendido: </div>
            {pesototalvendido.toLocaleString('pt-BR')}  kg 
            
            <div className="progress-container">
              <div 
                className={`progress-bar ${getProgressClass(porcentagemPeso)}`}
                style={{ width: `${Math.min(porcentagemPeso, 100)}%` }}
              />
            </div>
            
            <div className="progress-info">
              <span>Objetivo:  {objetivoPeso.toLocaleString('pt-BR')} kg</span>
              <strong>{porcentagemPeso.toFixed(1)}%</strong>
            </div>
          </div>
        </div>
      </div>
    );
};

export default CardsColaborador;