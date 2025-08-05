import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './EditarUsuario.css';

function EditarUsuario() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    telefone: '',
    password: '',
    confirmPassword: '',
    funcionario: ''
  });
  const [funcionarios, setFuncionarios] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:8000/usuario/${id}/`)
      .then(res => res.json())
      .then(data => setUsuario({
        ...usuario,
        username: data.username || '',
        email: data.email || '',
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        telefone: data.telefone || '',
        funcionario: data.funcionario || ''
      }));

    fetch("http://localhost:8000/funcionarios/")
      .then(res => res.json())
      .then(data => setFuncionarios(data.funcionarios_sql || []));
  }, [id]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (usuario.password !== usuario.confirmPassword) {
      alert("As senhas não coincidem!");
      return;
    }

    fetch(`http://localhost:8000/usuario/${id}/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(usuario),
    })
      .then(res => {
        if (res.ok) {
          alert("Usuário atualizado com sucesso!");
          navigate('/uscadastro_users');
        } else {
          alert("Erro ao atualizar usuário.");
        }
      });
  };

 return (
  <div className="editar-user-container">
    <form className="editar-user-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <input
          type="text"
          placeholder="Usuário"
          value={usuario.username}
          onChange={e => setUsuario({ ...usuario, username: e.target.value })}
        />
      </div>

      <div className="form-group">
        <input
          type="email"
          placeholder="Email"
          value={usuario.email}
          onChange={e => setUsuario({ ...usuario, email: e.target.value })}
        />
      </div>

      <div className="form-group">
        <input
          type="text"
          placeholder="Nome"
          value={usuario.first_name}
          onChange={e => setUsuario({ ...usuario, first_name: e.target.value })}
        />
      </div>

      <div className="form-group">
        <input
          type="text"
          placeholder="Sobrenome"
          value={usuario.last_name}
          onChange={e => setUsuario({ ...usuario, last_name: e.target.value })}
        />
      </div>

      <div className="form-group">
        <input
          type="tel"
          placeholder="Telefone"
          value={usuario.telefone}
          onChange={e => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 11) value = value.substring(0, 11);
            if (value.length > 0) {
              value = `(${value.substring(0, 2)}) ${value.substring(2)}`;
              if (value.length > 9) value = `${value.substring(0, 10)}-${value.substring(10)}`;
            }
            setUsuario({ ...usuario, telefone: value });
          }}
        />
      </div>

      <div className="form-group">
        <input
          type="password"
          placeholder="Senha"
          value={usuario.password}
          onChange={e => setUsuario({ ...usuario, password: e.target.value })}
        />
      </div>

      <div className="form-group">
        <input
          type="password"
          placeholder="Confirmar Senha"
          value={usuario.confirmPassword}
          onChange={e => setUsuario({ ...usuario, confirmPassword: e.target.value })}
        />
      </div>

      <div className="form-group">
        <select
          value={usuario.funcionario}
          onChange={e => setUsuario({ ...usuario, funcionario: e.target.value })}
        >
          <option value="">Selecione o Funcionário</option>
          {funcionarios.map(f => (
            <option key={f.CodFuncionario} value={f.CodFuncionario}>
              {f.Funcionario.trim()}
            </option>
          ))}
        </select>
      </div>

      <button className="submit-button" type="submit">Salvar</button>
    </form>
  </div>
);
}

export default EditarUsuario;
