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
  console.log('🔄 Buscando dados do usuário e funcionários para ID:', id);


  fetch(`http://localhost:8000/usuario/${id}/`)
    .then(res => {
      console.log('📦 Resposta do usuário recebida:', res);
      return res.json();
    })
    .then(data => {
      const cod_funcionario = data.profile?.cod_funcionario?.toString() || '';
      console.log('🧠 Dados do usuário:', data);
      setUsuario({
        ...usuario,
        username: data.username || '',
        email: data.email || '',
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        telefone: data.profile?.phone || '',
       funcionario: cod_funcionario
      });

      // Buscar a lista geral de funcionários
      fetch("http://localhost:8000/funcionarios/")
        .then(res => res.json())
        .then(dataFunc => {
          let lista = dataFunc.funcionarios_sql || [];

          // Se o funcionário do usuário não estiver na lista, buscá-lo separadamente
          if (cod_funcionario && !lista.some(f => f.CodFuncionario.toString() === cod_funcionario)) {
            fetch(`http://localhost:8000/funcionarios/${cod_funcionario}/`)
              .then(res => res.json())
              .then(func => {
                console.log("👤 Funcionário individual adicionado:", func);
                lista.push(func); // Adiciona o funcionário ausente
                setFuncionarios(lista);
              });
          } else {
            setFuncionarios(lista);
          }
        });
    })
    .catch(err => console.error('❌ Erro ao buscar usuário ou funcionários:', err));
}, [id]);

  const handleSubmit = (e) => {
  e.preventDefault();
  console.log('🚀 Enviando dados do formulário:', usuario);

  if (usuario.password !== usuario.confirmPassword) {
    alert("As senhas não coincidem!");
    return;
  }
    // Só inclui a senha se ela for informada
  if (usuario.password && usuario.password.trim() !== "") {
    payload.password = usuario.password;
  }
  // Monta o payload com os campos obrigatórios
  const payload = {
    username: usuario.username,
    email: usuario.email,
    first_name: usuario.first_name,
    last_name: usuario.last_name,
    telefone: usuario.telefone,
    funcionario: usuario.funcionario,
  };

  // Só inclui senha se foi informada
  if (usuario.password) {
    payload.password = usuario.password;
  }

  fetch(`http://localhost:8000/usuario/${id}/`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify(payload),
  })
    .then(res => {
      console.log('📨 Resposta do PUT:', res);
      if (res.ok) {
        alert("Usuário atualizado com sucesso!");
        navigate('/cadastro_user');
      } else {
        alert("Erro ao atualizar usuário.");
      }
    })
    .catch(err => console.error('❌ Erro ao atualizar usuário:', err));
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
          name="funcionario"
          value={usuario.funcionario}
          onChange={e => setUsuario({ ...usuario, funcionario: e.target.value })}
          required
        >
          <option value="">Selecione um funcionário</option>
          {funcionarios.map((f) => (
            <option key={f.CodFuncionario} value={f.CodFuncionario}>
              {f.Funcionario}
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
