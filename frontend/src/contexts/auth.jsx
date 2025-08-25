// src/contexts/auth.jsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

function getVisibleRoles(me) {
  if (!me) return [];
  const p = me.profile || {};
  const roles = [];
  if (me.is_superuser) roles.push("admin");
  if (p.vendedor) roles.push("vendedor");
  if (p.supervisor) roles.push("supervisor");
  if (p.transportador) roles.push("motorista");
  if (p.transportador_aux) roles.push("auxiliar de motorista");
  if (p.entregador) roles.push("entregador");
  if (p.cobrador) roles.push("cobrador");
  if (Array.isArray(me.roles)) {
    me.roles.forEach((r) => { if (!roles.includes(r)) roles.push(r); });
  }
  return roles;
}

export const AuthProvider = ({ children }) => {
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authVersion, setAuthVersion] = useState(0); // <- tick para refetch
  const apiBase = `http://${window.location.hostname}:8000`;

  async function fetchWithJWT(token) {
    return fetch(`${apiBase}/me/`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    });
  }
  async function fetchWithSession() {
    return fetch(`${apiBase}/me/`, { method: "GET", credentials: "include" });
  }

  // Carrega/relê o /me/ sempre que authVersion muda (login/logout)
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("access") || localStorage.getItem("token") || null;
        let res = token ? await fetchWithJWT(token) : await fetchWithSession();
        if (!alive) return;

        if (!res.ok && token && res.status === 401) {
          res = await fetchWithSession();
        }
        if (res.ok) {
          const json = await res.json();
          if (!alive) return;
          setMe(json);
        } else {
          setMe(null);
        }
      } catch (e) {
        console.error("[Auth] /me error:", e);
        setMe(null);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [apiBase, authVersion]);

  // Ações
  const login = (token) => {
    // salve no mesmo nome que o Login usa (ele usa 'token' hoje):contentReference[oaicite:0]{index=0}
    localStorage.setItem("token", token);
    setAuthVersion((v) => v + 1); // dispara refetch do /me/
  };
  const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("token");
    setMe(null);
    setAuthVersion((v) => v + 1);
  };
  const refresh = () => setAuthVersion((v) => v + 1);

  const roles = useMemo(() => getVisibleRoles(me), [me]);
  const value = useMemo(
    () => ({
      me, roles, loading,
      is: (role) => roles.includes(role),
      can: (anyOf) => anyOf.some((r) => roles.includes(r)),
      login, logout, refresh,
    }),
    [me, roles, loading]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
};
