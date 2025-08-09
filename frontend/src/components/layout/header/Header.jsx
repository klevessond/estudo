import React, { useEffect, useState } from 'react';
import './Header.css';

const Header = () => {
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const apiBase = `http://${window.location.hostname}:8000`;

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        const token = localStorage.getItem('access') || localStorage.getItem('token');

        if (!token) {
          console.warn('[Header] Nenhum token JWT encontrado em localStorage("access"). Mostrando "Entrar".');
          setMe(null);
          return;
        }

        console.log('[Header] Usando JWT (Bearer access):', token.slice(0, 16) + '...');

        const res = await fetch(`${apiBase}/me/`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        console.log('[Header] /me/ status:', res.status);

        if (!res.ok) {
          const txt = await res.text().catch(() => '');
          console.warn('[Header] /me/ falhou:', res.status, txt);
          setMe(null);
          return;
        }

        const json = await res.json();
        console.log('[Header] /me/ JSON recebido:', json);
        setMe(json);
      } catch (e) {
        console.error('[Header] erro carregando /me/:', e);
        setMe(null);
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => { alive = false; };
  }, [apiBase]);

  // Monta badges a partir de roles/profile
  const resolvedRoles = (() => {
    if (!me) return [];
    let roles = Array.isArray(me.roles) ? [...me.roles] : [];
    const p = me.profile || {};
    const map = [
      ['entregador', p.entregador],
      ['supervisor', p.supervisor],
      ['transportador', p.transportador],
      ['transportador_aux', p.transportador_aux],
      ['vendedor', p.vendedor],
      ['cobrador', p.cobrador],
    ];
    map.forEach(([r, v]) => { if (v && !roles.includes(r)) roles.push(r); });
    if (me.is_superuser && !roles.includes('admin')) roles.push('admin');
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
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <strong>{me.username}</strong>
              {(me.first_name || me.last_name)}
            </div>

          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
