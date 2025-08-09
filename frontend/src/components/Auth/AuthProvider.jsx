import { createContext, useContext, useEffect, useState } from "react";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [me, setMe] = useState(null);
  const [loadingMe, setLoadingMe] = useState(true);
  const apiBase = `http://${window.location.hostname}:8000`;

  useEffect(() => {
    async function load() {
      setLoadingMe(true);
      try {
        const headers = {};
        // Se usa JWT:
        // const token = localStorage.getItem('access');
        // if (token) headers.Authorization = `Bearer ${token}`;

        const res = await fetch(`${apiBase}/me/`, {
          method: 'GET',
          headers,
          credentials: 'include', // mantenha se usa sessão do Django
        });
        if (!res.ok) throw new Error('unauthorized');
        const json = await res.json();
        setMe(json); // { id, username, first_name, last_name, is_superuser, profile:{...}, roles:[...] }
      } catch {
        setMe(null);
      } finally {
        setLoadingMe(false);
      }
    }
    load();
  }, [apiBase]);

  const hasRole = (roles = []) => {
    if (!me?.roles) return false;
    if (me.roles.includes('admin')) return true;
    return roles.some(r => me.roles.includes(r));
  };

  return (
    <AuthCtx.Provider value={{ me, loadingMe, hasRole, refreshMe: () => window.location.reload() }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  return useContext(AuthCtx);
}
