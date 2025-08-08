import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './RegisterUser.css';
import EditarUsuario from './EditarUsuario'; // (1) importar form de edição

const RegisterUser = () => {
  const [formData, setFormData] = useState({
    username: '', email: '', first_name: '', last_name: '', phone: '',
    password: '', password2: '', cod_funcionario: '', cod_unid_gestora: '',
    entregador: false, supervisor: false, transportador: false, transportador_aux: false,
    vendedor: false, cobrador: false, funcionario_nome: ''
  });

  const [funcionarios, setFuncionarios] = useState([]);
  const [usuariosDjango, setUsuariosDjango] = useState([]);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFuncionarios, setShowFuncionarios] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const apiBase = `http://${window.location.hostname}:8000`;

  // (2) Estados novos — controle da visão da coluna da direita
  const [mode, setMode] = useState('list'); // 'list' | 'edit'
  const [editId, setEditId] = useState(null);

  const handleUsuarioClick = (usuario) => {
    setUsuarioSelecionado(usuario);
    setFormData({
      ...formData,
      username: usuario.username || '',
      first_name: usuario.first_name || '',
      last_name: usuario.last_name || '',
      email: usuario.email || '',
      phone: usuario.phone || '',
      cod_funcionario: '',
      funcionario_nome: ''
    });
    setSearchTerm('');
  };

  // Busca funcionários conforme digita
  useEffect(() => {
    if (searchTerm.length > 2) {
      fetch(`http://localhost:8000/funcionarios/?search=${encodeURIComponent(searchTerm)}`)
        .then(response => response.json())
        .then(data => {
          setFuncionarios(data.funcionarios_sql);
        })
        .catch(error => console.error('Erro ao buscar funcionários:', error));
    }
  }, [searchTerm]);

  // Extra: listagem extraída para poder recarregar após salvar edição
  const fetchUsuariosDjango = useCallback(() => {
    fetch('http://localhost:8000/funcionarios/')
      .then(response => response.json())
      .then(data => {
        setUsuariosDjango(data.usuarios_django);
      })
      .catch(error => console.error('Erro ao carregar usuários Django:', error));
  }, []);

  // Carrega a listagem ao montar
  useEffect(() => {
    fetchUsuariosDjango();
  }, [fetchUsuariosDjango]);

  const handleSelectFuncionario = (funcionario) => {
    setFormData({
      ...formData,
      cod_funcionario: funcionario.CodFuncionario,
      cod_unid_gestora: funcionario.UnidGestora,
      entregador: funcionario.Entregador,
      supervisor: funcionario.Supervisor,
      transportador: funcionario.Transportador,
      transportador_aux: funcionario.TransportadorAux,
      vendedor: funcionario.Vendedor,
      cobrador: funcionario.Cobrador,
      funcionario_nome: funcionario.Funcionario
    });
    setShowFuncionarios(false);
  };

  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.substring(0, 11);
    if (value.length > 0) {
      value = `(${value.substring(0, 2)}) ${value.substring(2)}`;
      if (value.length > 9) value = `${value.substring(0, 10)}-${value.substring(10)}`;
    }
    setFormData({ ...formData, phone: value });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    if (errors[name]) setErrors({ ...errors, [name]: null });
    if ((name === 'password' || name === 'password2') && formData.password && formData.password2) {
      setErrors({
        ...errors,
        password2: formData.password !== formData.password2 ? 'As senhas não coincidem' : null
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.cod_funcionario) {
      setErrors({ ...errors, cod_funcionario: 'Selecione um funcionário' });
      return;
    }
    if (formData.password !== formData.password2) {
      setErrors({ ...errors, password2: 'As senhas não coincidem' });
      return;
    }
    setIsSubmitting(true);
    try {
      const dataToSend = { ...formData, phone: formData.phone.replace(/\D/g, '') };
      const response = await fetch(`${apiBase}/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
      });

      if (response.ok) {
        alert('Usuário cadastrado com sucesso!');
        setFormData({
          username: '', email: '', first_name: '', last_name: '', phone: '',
          password: '', password2: '', cod_funcionario: '', cod_unid_gestora: '',
          entregador: false, supervisor: false, transportador: false, transportador_aux: false,
          vendedor: false, cobrador: false, funcionario_nome: ''
        });
        setSearchTerm('');
        setUsuarioSelecionado(null);
        navigate('/cadastro_user');
      } else {
        const errorData = await response.json();
        setErrors(errorData);
      }
    } catch (error) {
      alert('Erro ao cadastrar usuário. Por favor, tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // (3) Handlers de edição
  const handleEditClick = (id) => {
    if (!id) return;
    setEditId(id);
    setMode('edit');
  };

  const handleSaved = () => {
    setMode('list');
    setEditId(null);
    fetchUsuariosDjango(); // recarrega a lista após salvar
  };

  const handleCancel = () => {
    setMode('list');
    setEditId(null);
  };

  return (
    <div className="register-user-container">
      {/* ESQUERDA: Formulário de cadastro (inalterado) */}
      <div className="register-user-form">
        <h2 className="register-title">Cadastro de Usuário</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Usuário:</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
            {errors.username && <span className="error">{errors.username}</span>}
          </div>

          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            {errors.email && <span className="error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label>Nome:</label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              required
            />
            {errors.first_name && <span className="error">{errors.first_name}</span>}
          </div>

          <div className="form-group">
            <label>Sobrenome:</label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              required
            />
            {errors.last_name && <span className="error">{errors.last_name}</span>}
          </div>

          <div className="form-group">
            <label>Telefone:</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handlePhoneChange}
              required
              placeholder="(00) 00000-0000"
              maxLength="15"
            />
            {errors.phone && <span className="error">{errors.phone}</span>}
          </div>

          {['password', 'password2'].map((field, idx) => (
            <div className="form-group" key={idx}>
              <label>{field === 'password2' ? 'Confirme a senha' : 'Senha'}:</label>
              <input
                type="password"
                name={field}
                value={formData[field]}
                onChange={handleChange}
                required
              />
              {errors[field] && <span className="error">{errors[field]}</span>}
            </div>
          ))}

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
              required
            />
            {errors.cod_funcionario && <span className="error">{errors.cod_funcionario}</span>}

            {formData.funcionario_nome && (
              <div className="selected-funcionario">
                <span>{formData.funcionario_nome}</span>
                <button
                  type="button"
                  className="clear-funcionario"
                  onClick={() => {
                    setFormData({ ...formData, cod_funcionario: '', funcionario_nome: '' });
                    setSearchTerm('');
                  }}
                >×</button>
              </div>
            )}

            {showFuncionarios && funcionarios.length > 0 && (
              <div className="funcionarios-dropdown">
                <ul>
                  {funcionarios.map(func => (
                    <li key={func.CodFuncionario} onClick={() => handleSelectFuncionario(func)}>
                      <div className="funcionario-name">{func.Funcionario}</div>
                      <div className="funcionario-roles">
                        {func.Vendedor && <span>Vendedor</span>}
                        {func.Supervisor && <span>Supervisor</span>}
                        {func.Transportador && <span>Transportador</span>}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <button type="submit" disabled={isSubmitting} className="submit-button">
            {isSubmitting ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </form>
      </div>

      {/* DIREITA: listagem <-> edição inline (5) Renderização condicional */}
      <div className="register-user-list">
        {mode === 'list' && (
          <>
            <h3>Usuários Cadastrados</h3>
            <ul className="lista-usuarios">
              {usuariosDjango.map(user => (
                <li key={user.id} onClick={() => handleUsuarioClick(user)}>
                  <strong>{user.username}</strong><br />
                  <small>{user.email}</small>
                  {/* (4) Botão Editar: agora troca a visão, não navega */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditClick(user.id);
                    }}
                  >
                    Editar
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}

        {mode === 'edit' && editId && (
          <EditarUsuario
            id={editId}
            onSaved={handleSaved}
            onCancel={handleCancel}
          />
        )}
      </div>
    </div>
  );
};

export default RegisterUser;
