// src/contexts/auth.jsx
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import api from "../api"; // <- usa o cliente axios centralizado

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
    me.roles.forEach((r) => {
      if (!roles.includes(r)) roles.push(r);
    });
  }
  return roles;
}

export const AuthProvider = ({ children }) => {
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authVersion, setAuthVersion] = useState(0); // tick para refetch

  const loadMe = useCallback(async () => {
    setLoading(true);
    try {
      // Chama sempre /api/me/; se houver JWT, o interceptor adiciona o Bearer;
      // se for sessão, enviamos cookies com withCredentials.
      const { data } = await api.get("/me/", { withCredentials: true });
      setMe(data || null);
    } catch (e) {
      console.error("[Auth] /me error:", e);
      setMe(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Carrega/relê o /api/me sempre que authVersion muda (login/logout)
  useEffect(() => {
    let alive = true;
    (async () => {
      await loadMe();
    })();
    return () => {
      alive = false;
    };
  }, [loadMe, authVersion]);

  // Ações
  const login = (token) => {
    // Mantém compatibilidade com seu Login: ele salva como 'token'
    localStorage.setItem("token", token);
    setAuthVersion((v) => v + 1); // dispara refetch do /api/me/
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
      // Dados
      user: me,       // Mapeia 'me' para 'user'
      me,             // Mantém 'me' disponível também
      roles,
      loading,
      signed: !!me,   // Define se está logado

      // Funções
      signIn: login,  // Mapeia 'login' para 'signIn'
      login,
      signOut: logout,// Mapeia 'logout' para 'signOut'
      logout,
      refresh,

      // Helpers
      is: (role) => roles.includes(role),
      can: (anyOf) => anyOf.some((r) => roles.includes(r)),
    }),
    [me, roles, loading]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
};
