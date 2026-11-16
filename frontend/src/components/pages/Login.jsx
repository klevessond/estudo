// src/components/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/auth.jsx";
import { useToast } from "../ui/Toast.jsx";
import { postLogin } from "../../services/authApi";
import "./Login.css";


const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const clienteID = process.env.REACT_APP_CLIENTE_ID || "desconhecido";

  const handleLogin = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      // Chame sempre /api/token/ (Nginx faz proxy para o backend)
      const { data } = await postLogin({ username, password });

      // Salva o JWT via contexto (o interceptor pegará localStorage.token)
      login(data.access);

      // (Opcional) guarde o refresh se você usar refresh flow depois:
      if (data.refresh) localStorage.setItem("refresh", data.refresh);

      navigate("/");
    } catch (err) {
      console.error("[Login] erro ao autenticar:", err);
      toast.erro("Usuário ou senha inválidos");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <img src="/logo.png" alt="Logo da empresa" className="login-logo" />
        <h2>Login</h2>
        <p style={{ fontSize: '10px', color: '#ccc', textAlign: 'center', marginTop: '-15px', marginBottom: '15px' }}>
          Ambiente: {clienteID}
        </p>

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
