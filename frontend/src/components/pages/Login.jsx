import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import logo from '../../assets/logo.png';


const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const apiBase = `http://${window.location.hostname}:8000`;

  const handleLogin = async () => {
    try {
      const response = await axios.post(`${apiBase}/api/token/`, {
        username,
        password,
      });

      localStorage.setItem('token', response.data.access);
      navigate('/');
    } catch (error) {
      alert('Usuário ou senha inválidos');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <img src={logo} alt="Logo da empresa" className="login-logo" />
        <h2>Login</h2>
        <input
          value={username}
          onChange={e => setUsername(e.target.value)}
          placeholder="Usuário"
        />
        <input
          value={password}
          onChange={e => setPassword(e.target.value)}
          type="password"
          placeholder="Senha"
        />
        <button onClick={handleLogin}>Entrar</button>
      </div>
    </div>
  );
};

export default Login;
