// src/components/layout/header/Header.jsx
import React, { useEffect, useState } from 'react';
import './Header.css';

const Header = () => {
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const apiBase = `http://${window.location.hostname}:8000`;

  useEffect(() => {
    let alive = true;

    async function fetchWithJWT(token) {
      const res = await fetch(`${apiBase}/me/`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      return res;
    }

    async function fetchWithSession() {
      const res = await fetch(`${apiBase}/me/`, {
        method: 'GET',
        credentials: 'include',
      });
      return res;
    }

    async function load() {
      try {
        setLoading(true);

        // pega token em 'access' OU 'token'
        const token =
          localStorage.getItem('access') ||
          localStorage.getItem('token') ||
          null;

        let res;

        if (token) {
          console.log('[Header] Tentando /me/ com JWT…');
          res = await fetchWithJWT(token);
          console.log('[Header] /me/ (JWT) status:', res.status);
        } else {
          console.warn('[Header] Nenhum token em localStorage. Tentando sessão…');
          res = await fetchWithSession();
          console.log('[Header] /me/ (sessão) status:', res.status);
        }

        if (!alive) return;

        if (!res.ok) {
          // tentativa alternativa: se JWT falhou por 401, tenta sessão
          if (token && res.status === 401) {
            console.log('[Header] JWT 401, tentando sessão…');
            const res2 = await fetchWithSession();
            console.log('[Header] /me/ (fallback sessão) status:', res2.status);
            if (res2.ok) {
              const json2 = await res2.json();
              console.log('[Header] /me/ JSON (sessão):', json2);
              setMe(json2);
              return;
            }
          }
          console.warn('[Header] /me/ falhou:', res.status);
          setMe(null);
          return;
        }

        const json = await res.json();
        console.log('[Header] /me/ JSON:', json);
        setMe(json);
      } catch (e) {
        console.error('[Header] erro carregando /me/:', e);
        setMe(null);
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [apiBase]);

  // Constrói as funções visíveis a partir do profile/flags
  const rolesVisiveis = (() => {
    if (!me) return [];
    const p = me.profile || {};
    const roles = [];

    if (me.is_superuser) roles.push('admin');
    if (p.vendedor) roles.push('vendedor');
    if (p.supervisor) roles.push('supervisor');
    if (p.transportador) roles.push('motorista'); // renomeando
    if (p.transportador_aux) roles.push('auxiliar de motorista');
    if (p.entregador) roles.push('entregador');
    if (p.cobrador) roles.push('cobrador');

    // se backend já envia me.roles, adiciona sem duplicar
    if (Array.isArray(me.roles)) {
      me.roles.forEach(r => {
        if (!roles.includes(r)) roles.push(r);
      });
    }

    return roles;
  })();

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
            {/* Apenas o username */}
            <strong>{me.username}</strong>

            {/* Badges das funções ativas */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {rolesVisiveis.map((r) => (
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
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
