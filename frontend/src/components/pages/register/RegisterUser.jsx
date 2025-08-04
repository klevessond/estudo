import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './RegisterUser.css';

const RegisterUser = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    password: '',
    password2: '',
    cod_funcionario: '',
    cod_unid_gestora: '',
    entregador: false,
    supervisor: false,
    transportador: false,
    transportador_aux: false,
    vendedor: false,
    cobrador: false,
    funcionario_nome: ''
  });

  const [funcionarios, setFuncionarios] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFuncionarios, setShowFuncionarios] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const apiBase = `http://${window.location.hostname}:8000`;

  // Buscar funcionários ao digitar
  useEffect(() => {
    if (searchTerm.length > 2) {
      axios.get(`${apiBase}/funcionarios/?search=${searchTerm}`)
        .then(response => setFuncionarios(response.data))
        .catch(err => console.error('Erro ao buscar funcionários:', err));
    } else {
      setFuncionarios([]);
    }
  }, [searchTerm, apiBase]);

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
      if (value.length > 9) {
        value = `${value.substring(0, 10)}-${value.substring(10)}`;
      }
    }
    
    setFormData({
      ...formData,
      phone: value
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Limpa erros quando o usuário começa a digitar
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
    
    // Verifica se as senhas coincidem
    if ((name === 'password' || name === 'password2') && formData.password && formData.password2) {
      if (formData.password !== formData.password2) {
        setErrors({
          ...errors,
          password2: 'As senhas não coincidem'
        });
      } else if (errors.password2 === 'As senhas não coincidem') {
        setErrors({
          ...errors,
          password2: null
        });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validações adicionais
    if (!formData.cod_funcionario) {
      setErrors({...errors, cod_funcionario: 'Selecione um funcionário'});
      return;
    }
    
    if (formData.password !== formData.password2) {
      setErrors({
        ...errors,
        password2: 'As senhas não coincidem'
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Remove formatação do telefone antes de enviar
      const dataToSend = {
        ...formData,
        phone: formData.phone.replace(/\D/g, '')
      };
      
      const response = await axios.post(`${apiBase}/register/`, dataToSend);
      alert('Usuário cadastrado com sucesso!');
      navigate('/login');
    } catch (error) {
      if (error.response && error.response.data) {
        setErrors(error.response.data);
      } else {
        alert('Erro ao cadastrar usuário. Por favor, tente novamente.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="register-user-container">
      <div className="register-user-card">
        <h2>Cadastro de Usuário</h2>
        <form onSubmit={handleSubmit}>
          {/* Campos básicos do usuário (mantidos como estavam) */}
          <div className="form-group">
            <label>Nome de usuário:</label>
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

          <div className="form-group">
            <label>Senha:</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            {errors.password && <span className="error">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label>Confirme a senha:</label>
            <input
              type="password"
              name="password2"
              value={formData.password2}
              onChange={handleChange}
              required
            />
            {errors.password2 && <span className="error">{errors.password2}</span>}
          </div>

          {/* Novo campo de busca de funcionário */}
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
                    setFormData({
                      ...formData,
                      cod_funcionario: '',
                      funcionario_nome: ''
                    });
                    setSearchTerm('');
                  }}
                >
                  ×
                </button>
              </div>
            )}

            {showFuncionarios && funcionarios.length > 0 && (
              <div className="funcionarios-dropdown">
                <ul>
                  {funcionarios.map(func => (
                    <li 
                      key={func.CodFuncionario}
                      onClick={() => handleSelectFuncionario(func)}
                    >
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
    </div>
  );
};

export default RegisterUser;