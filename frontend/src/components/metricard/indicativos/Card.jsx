import React from 'react';
import '../IndicativosDeVenda.css';

const Card = ({ title, title2, value, value2, subtitle, subtitle2, percentage, variation, icon, className, onDetailClick, extra }) => (
  <div className={`indicativo-card ${className || ''}`}>
    <div className="card-header">
      <h2>{title}</h2>
      {icon && <img src={icon} alt="Ícone" className="card-icon" />}
    </div>
    <div className="card-group">
      <div className="card-value">{value}</div>
      {subtitle && <p className="card-subtitle">{subtitle}</p>}
    </div>
    <div className="card-group">
      <div className="card-value">{value2}</div>
    </div>
    <div className="card-subtitle">
      {title2}
      {icon && <img src={icon} alt="Ícone" className="card-icon" />}
    </div>
    <div className="card-group">
      {percentage && <p className="card-percentage">{percentage}</p>}
      {subtitle2 && <p className="card-subtitle">{subtitle2}</p>}
    </div>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        {variation && <p className="card-variation"> {variation} Desvio</p>}
        {/* 👇 O BOTÃO DE DETALHAR ENTRA AQUI 👇 */}
        {onDetailClick && (
            <button 
                onClick={onDetailClick} 
                style={{ 
                    background: 'none', border: 'none', color: '#007bff', 
                    cursor: 'pointer', fontSize: '0.85rem', textDecoration: 'underline',
                    padding: 0, marginLeft: 'auto'
                }}
            >
                Detalhar 🔍
            </button>
        )}

    </div>
    {extra && (
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', marginTop: '0.25rem', paddingTop: '0.25rem', fontSize: '0.75rem', textAlign: 'center', opacity: 0.9 }}>
        {extra}
      </div>
    )}
  </div>
  
);

export default Card;
