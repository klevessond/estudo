// RegisterUser.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from '../../ui/Toast.jsx';
import { useNavigate } from 'react-router-dom';
import './RegisterUser.css';
import EditarUsuario from './EditarUsuario';
import { getFuncionarios, registrarUsuario } from '../../../services/cadastrosApi';

const RegisterUser = () => {
  const toast = useToast();
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

  // (2) Estados novos — controle da visão da coluna da direita
  const [mode, setMode] = useState('list'); // 'list' | 'edit'
  const [editId, setEditId] = useState(null);

  const handleUsuarioClick = (usuario) => {
    setUsuarioSelecionado(usuario);
    setFormData((prev) => ({
      ...prev,
      username: usuario.username || '',
      first_name: usuario.first_name || '',
      last_name: usuario.last_name || '',
      email: usuario.email || '',
      phone: usuario.phone || '',
      cod_funcionario: '',
      funcionario_nome: ''
    }));
    setSearchTerm('');
  };

  // Busca funcionários conforme digita (AGORA usando api + params, sem localhost)
  useEffect(() => {
    let cancel = false;

    const run = async () => {
      if (searchTerm.length <= 2) return;
      try {
        const { data } = await getFuncionarios({
          params: { search: searchTerm }
        });
        if (!cancel) setFuncionarios(data.funcionarios_sql || []);
      } catch (err) {
        console.error('Erro ao buscar funcionários:', err);
      }
    };

    // debounce simples
    const t = setTimeout(run, 300);
    return () => { cancel = true; clearTimeout(t); };
  }, [searchTerm]);

  // Listagem de usuários (AGORA usando api, sem localhost)
  const fetchUsuariosDjango = useCallback(async () => {
    try {
      const { data } = await getFuncionarios();
      setUsuariosDjango(data.usuarios_django || []);
    } catch (err) {
      console.error('Erro ao carregar usuários Django:', err);
    }
  }, []);

  // Carrega a listagem ao montar
  useEffect(() => {
    fetchUsuariosDjango();
  }, [fetchUsuariosDjango]);

  const handleSelectFuncionario = (funcionario) => {
    setFormData((prev) => ({
      ...prev,
      cod_funcionario: funcionario.CodFuncionario,
      cod_unid_gestora: funcionario.UnidGestora,
      entregador: funcionario.Entregador,
      supervisor: funcionario.Supervisor,
      transportador: funcionario.Transportador,
      transportador_aux: funcionario.TransportadorAux,
      vendedor: funcionario.Vendedor,
      cobrador: funcionario.Cobrador,
      funcionario_nome: funcionario.Funcionario
    }));
    setShowFuncionarios(false);
  };

  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.substring(0, 11);
    if (value.length > 0) {
      value = `(${value.substring(0, 2)}) ${value.substring(2)}`;
      if (value.length > 9) value = `${value.substring(0, 10)}-${value.substring(10)}`;
    }
    setFormData((prev) => ({ ...prev, phone: value }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
    if ((name === 'password' || name === 'password2') && formData.password && formData.password2) {
      setErrors((prev) => ({
        ...prev,
        password2: formData.password !== formData.password2 ? 'As senhas não coincidem' : null
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.cod_funcionario) {
      setErrors((prev) => ({ ...prev, cod_funcionario: 'Selecione um funcionário' }));
      return;
    }
    if (formData.password !== formData.password2) {
      setErrors((prev) => ({ ...prev, password2: 'As senhas não coincidem' }));
      return;
    }
    setIsSubmitting(true);
    try {
      const dataToSend = { ...formData, phone: formData.phone.replace(/\D/g, '') };
      const { status, data } = await registrarUsuario(dataToSend);
      if (status >= 200 && status < 300) {
        toast.sucesso('Usuário cadastrado com sucesso!');
        setFormData({
          username: '', email: '', first_name: '', last_name: '', phone: '',
          password: '', password2: '', cod_funcionario: '', cod_unid_gestora: '',
          entregador: false, supervisor: false, transportador: false, transportador_aux: false,
          vendedor: false, cobrador: false, funcionario_nome: ''
        });
        setSearchTerm('');
        setUsuarioSelecionado(null);
        navigate('/cadastro_user');
        fetchUsuariosDjango(); // opcional: recarrega lista
      } else {
        setErrors(data || {});
      }
    } catch (error) {
      // Se API devolver 400 com JSON de erros, exiba:
      if (error?.response?.data) setErrors(error.response.data);
      else toast.erro('Erro ao cadastrar usuário. Por favor, tente novamente.');
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
      {/* ESQUERDA: Formulário de cadastro */}
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
                    setFormData((prev) => ({ ...prev, cod_funcionario: '', funcionario_nome: '' }));
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
                      <div className="funcionarios-roles">
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

      {/* DIREITA: listagem <-> edição inline */}
      <div className="register-user-list">
        {mode === 'list' && (
          <>
            <h3>Usuários Cadastrados</h3>
            <ul className="lista-usuarios">
              {usuariosDjango.map(user => (
                <li key={user.id} onClick={() => handleUsuarioClick(user)}>
                  <strong>{user.username}</strong><br />
                  <small>{user.email}</small>
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
