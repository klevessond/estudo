// src/components/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/auth.jsx";
import api from "../../api"; // <- usa o cliente axios centralizado (sem hardcode de host)
import "./Login.css";


const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      // Chame sempre /api/token/ (Nginx faz proxy para o backend)
      const { data } = await api.post(
        "/token/",
        { username, password },
        { withCredentials: true } // ok mesmo usando JWT; ignora se não houver cookie
      );

      // Salva o JWT via contexto (o interceptor pegará localStorage.token)
      login(data.access);

      // (Opcional) guarde o refresh se você usar refresh flow depois:
      if (data.refresh) localStorage.setItem("refresh", data.refresh);

      navigate("/");
    } catch (err) {
      console.error("[Login] erro ao autenticar:", err);
      alert("Usuário ou senha inválidos");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <img src="/logo.png" alt="Logo da empresa" className="login-logo" />
        <h2>Login</h2>

        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Usuário"
          autoComplete="username"
        />

        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="Senha"
          autoComplete="current-password"
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
        />

        <button onClick={handleLogin} disabled={submitting}>
          {submitting ? "Entrando..." : "Entrar"}
        </button>
      </div>
    </div>
  );
};

export default Login;
