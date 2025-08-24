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
    me.roles.forEach(r => { if (!roles.includes(r)) roles.push(r); });
  }
  return roles;
}

export const AuthProvider = ({ children }) => {
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);

  // Corrige sua string base (precisa de crase)
  const apiBase = `http://${window.location.hostname}:8000`;

  useEffect(() => {
    let alive = true;

    async function fetchWithJWT(token) {
      return fetch(`${apiBase}/me/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
    }
    async function fetchWithSession() {
      return fetch(`${apiBase}/me/`, {
        method: "GET",
        credentials: "include",
      });
    }

    (async () => {
      try {
        setLoading(true);
        const token =
          localStorage.getItem("access") ||
          localStorage.getItem("token") ||
          null;

        let res = token ? await fetchWithJWT(token) : await fetchWithSession();

        if (!alive) return;

        if (!res.ok && token && res.status === 401) {
          // fallback sessão
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
        console.error("[Auth] erro /me/:", e);
        setMe(null);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => { alive = false; };
  }, [apiBase]);

  const roles = useMemo(() => getVisibleRoles(me), [me]);

  const value = useMemo(() => ({
    me,
    roles,
    loading,
    is: (role) => roles.includes(role),
    can: (anyOf) => anyOf.some(r => roles.includes(r)), // can(["admin","supervisor"])
  }), [me, roles, loading]);

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
};
