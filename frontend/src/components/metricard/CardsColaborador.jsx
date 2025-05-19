const CardsColaborador = ({ colaborador }) => {
    if (!colaborador) return null;
  
    return (
      <div style={{ marginTop: '1rem' }}>
        <h2
          style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            marginBottom: '1rem',
            color: '#0074c2',
            borderBottom: '2px solid #0074c2',
            paddingBottom: '0.5rem',
          }}
        >
          {colaborador.colaborador}
        </h2>
  
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ background: '#eafaf1', padding: '1rem', borderRadius: '8px' }}>
            <strong>Faturado:</strong><br /> R$ {colaborador.faturado.toLocaleString('pt-BR')}
            <div style={{ background: '#eafaf1', padding: '0rem', borderRadius: '8px' }}></div>
            <strong>Objetivo:</strong><br />
          </div>
          <div style={{ background: '#eaf2fa', padding: '1rem', borderRadius: '8px' }}>
            <strong>A Faturar:</strong><br /> R$ {colaborador.aFaturar.toLocaleString('pt-BR')}
          </div>
          <div style={{ background: '#f9f0e6', padding: '1rem', borderRadius: '8px' }}>
            <strong>Alocado:</strong><br /> R$ {colaborador.alocado.toLocaleString('pt-BR')}
          </div>
          <div style={{ background: '#fff0f3', padding: '1rem', borderRadius: '8px' }}>
            <strong>Cobertura:</strong><br /> {colaborador.cobertura.toFixed(2)}%
          </div>
          <div style={{ background: '#f1faff', padding: '1rem', borderRadius: '8px' }}>
            <strong>Variação:</strong><br /> R$ {colaborador.variacao.toLocaleString('pt-BR')}
          </div>
        </div>
      </div>
    );
  };
  
  export default CardsColaborador;
  