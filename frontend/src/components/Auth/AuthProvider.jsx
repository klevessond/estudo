// src/components/Auth/AuthProvider.jsx
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "../../api";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [me, setMe] = useState(null);
  const [loadingMe, setLoadingMe] = useState(true);

  const loadMe = useCallback(async () => {
    setLoadingMe(true);
    try {
      // Envia cookie de sessão se houver (útil quando autenticação é via sessionid)
      const { data } = await api.get("/me/", { withCredentials: true });
      // esperado: { id, username, first_name, last_name, is_superuser, profile:{...}, roles:[...] }
      setMe(data || null);
    } catch (_err) {
      setMe(null);
    } finally {
      setLoadingMe(false);
    }
  }, []);

  useEffect(() => {
    loadMe();
  }, [loadMe]);

  const hasRole = useCallback((roles = []) => {
    if (!me?.roles) return false;
    if (me.roles.includes("admin")) return true;
    return roles.some((r) => me.roles.includes(r));
  }, [me]);

  const refreshMe = useCallback(() => loadMe(), [loadMe]);

  return (
    <AuthCtx.Provider value={{ me, loadingMe, hasRole, refreshMe }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  return useContext(AuthCtx);
}
