import React, { useEffect, useState } from 'react';
import './EditarUsuario.css';

function EditarUsuario({ id, onSaved, onCancel }) {
  const [usuario, setUsuario] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    telefone: '',
    password: '',
    confirmPassword: '',
    funcionario: '',
    funcionario_nome: ''
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [showFuncionarios, setShowFuncionarios] = useState(false);
  const [funcionarios, setFuncionarios] = useState([]);

  // Buscar funcionário ao digitar
  useEffect(() => {
    if (searchTerm.length > 2) {
      fetch(`http://localhost:8000/funcionarios/?search=${encodeURIComponent(searchTerm)}`)
        .then(response => response.json())
        .then(data => setFuncionarios(data.funcionarios_sql || []))
        .catch(error => console.error('Erro ao buscar funcionários:', error));
    }
  }, [searchTerm]);

  // Buscar dados do usuário (usa o id vindo por props)
  useEffect(() => {
    if (!id) return;
    fetch(`http://localhost:8000/usuario/${id}/`)
      .then(res => {
        if (!res.ok) throw new Error(`Erro ao buscar usuário: ${res.status}`);
        return res.json();
      })
      .then(data => {
        const cod_funcionario = data.profile?.cod_funcionario?.toString() || '';
        setUsuario(prev => ({
          ...prev,
          username: data.username || '',
          email: data.email || '',
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          telefone: data.profile?.phone || '',
          funcionario: cod_funcionario
        }));

        // Garante que o funcionário atual esteja na lista
        fetch('http://localhost:8000/funcionarios/')
          .then(r => r.json())
          .then(dataFunc => {
            let lista = dataFunc.funcionarios_sql || [];
            if (cod_funcionario && !lista.some(f => f.CodFuncionario?.toString() === cod_funcionario)) {
              fetch(`http://localhost:8000/funcionarios/${cod_funcionario}/`)
                .then(r => r.json())
                .then(func => {
                  if (func && func.CodFuncionario) lista.push(func);
                  setFuncionarios(lista);
                  setUsuario(prev => ({ ...prev, funcionario_nome: func?.Funcionario || '' }));
                })
                .catch(() => setFuncionarios(lista));
            } else {
              setFuncionarios(lista);
              const func = lista.find(f => f.CodFuncionario?.toString() === cod_funcionario);
              if (func) setUsuario(prev => ({ ...prev, funcionario_nome: func.Funcionario }));
            }
          });
      })
      .catch(err => console.error('Erro ao buscar usuário ou funcionários:', err));
  }, [id]);

  // Submit do formulário
  const handleSubmit = (e) => {
    e.preventDefault();

    if (usuario.password !== usuario.confirmPassword) {
      alert("As senhas não coincidem!");
      return;
    }

    const payload = {
      username: usuario.username,
      email: usuario.email,
      first_name: usuario.first_name,
      last_name: usuario.last_name,
      telefone: usuario.telefone,
      funcionario: usuario.funcionario,
    };

    if (usuario.password && usuario.password.trim() !== "") {
      payload.password = usuario.password;
    }

    fetch(`http://localhost:8000/usuario/${id}/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(res => {
        if (res.ok) {
          alert("Usuário atualizado com sucesso!");
          onSaved?.(); // volta para a listagem no pai
        } else {
          alert("Erro ao atualizar usuário.");
        }
      })
      .catch(err => console.error('Erro ao atualizar usuário:', err));
  };

  return (
    <div className="editar-user-container">
      <form className="editar-user-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Usuário:</label>
          <input
            type="text"
            placeholder="Usuário"
            value={usuario.username}
            onChange={e => setUsuario({ ...usuario, username: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            placeholder="Email"
            value={usuario.email}
            onChange={e => setUsuario({ ...usuario, email: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label>Nome:</label>
          <input
            type="text"
            placeholder="Nome"
            value={usuario.first_name}
            onChange={e => setUsuario({ ...usuario, first_name: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label>Sobrenome:</label>
          <input
            type="text"
            placeholder="Sobrenome"
            value={usuario.last_name}
            onChange={e => setUsuario({ ...usuario, last_name: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label>Telefone:</label>
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
          <label>Senha:</label>
          <input
            type="password"
            placeholder="Senha"
            value={usuario.password}
            onChange={e => setUsuario({ ...usuario, password: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label>Confirmar Senha:</label>
          <input
            type="password"
            placeholder="Confirmar Senha"
            value={usuario.confirmPassword}
            onChange={e => setUsuario({ ...usuario, confirmPassword: e.target.value })}
          />
        </div>

        <div className="form-group funcionario-search">
          <label>Funcionário: <span className="required">*</span></label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowFuncionarios(true);
            }}
            placeholder="Digite para buscar funcionário"
          />

          {usuario.funcionario_nome && (
            <div className="selected-funcionario">
              <span>{usuario.funcionario_nome}</span>
              <button
                type="button"
                className="clear-funcionario"
                onClick={() => {
                  setUsuario(prev => ({
                    ...prev,
                    funcionario: '',
                    funcionario_nome: ''
                  }));
                  setSearchTerm('');
                }}
              >×</button>
            </div>
          )}

          {showFuncionarios && funcionarios.length > 0 && (
            <div className="funcionarios-dropdown">
              <ul>
                {funcionarios.map(func => (
                  <li key={func.CodFuncionario} onClick={() => {
                    setUsuario(prev => ({
                      ...prev,
                      funcionario: func.CodFuncionario.toString(),
                      funcionario_nome: func.Funcionario
                    }));
                    setSearchTerm(func.Funcionario);
                    setShowFuncionarios(false);
                  }}>
                    <div className="funcionario-name">{func.Funcionario}</div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <input type="hidden" name="funcionario" value={usuario.funcionario} required />
        </div>

        <div className="actions">
          <button className="submit-button" type="submit">Salvar</button>
          <button type="button" onClick={() => onCancel?.()}>Cancelar</button>
        </div>
      </form>
    </div>
  );
}

export default EditarUsuario;
