import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://localhost:8000/api/token/', {
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
    <div>
      <h2>Login</h2>
      <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Usuário" />
      <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Senha" />
      <button onClick={handleLogin}>Entrar</button>
    </div>
  );
};

export default Login;
