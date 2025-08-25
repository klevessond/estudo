// src/components/layout/header/Header.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/auth.jsx';
import './Header.css';

const Header = () => {
  const { me, roles, loading, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="header">
      <h1>Dashboard Analytics</h1>

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
        {loading && <span style={{ color: '#666' }}>Carregando…</span>}

        {!loading && !me && (
          <a href="/login" style={{ color: '#2a6ae9' }}>Entrar</a>
        )}

        {!loading && me && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <strong>{me.username}</strong>

            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {roles.map((r) => (
                <span
                  key={r}
                  className={`header-badge header-badge-${r}`}
                  style={{
                    padding: '2px 8px',
                    borderRadius: '999px',
                    border: '1px solid #ddd',
                    fontSize: '12px',
                    background: '#0c0c0cff',
                    textTransform: 'none',
                  }}
                >
                  {r}
                </span>
              ))}
            </div>

            <button
              onClick={handleLogout}
              style={{
                background: '#e53935',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 12px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Sair
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
