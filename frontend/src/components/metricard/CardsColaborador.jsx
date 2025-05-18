const CardsColaborador = ({ colaborador }) => {
    if (!colaborador) return null;
  
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ background: '#eafaf1', padding: '1rem', borderRadius: '8px' }}>
          <strong>Faturado:</strong><br /> R$ {colaborador.faturado.toLocaleString('pt-BR')}
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
      </div>
    );
  };
  
  export default CardsColaborador;
  