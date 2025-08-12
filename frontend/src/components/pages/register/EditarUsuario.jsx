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
    funcionario: '',         // CodFuncionario (string)
    funcionario_nome: '',    // apenas exibição

    // dados que vamos ENVIAR no profile (sem exibir inputs)
    cod_unid_gestora: null,
    entregador: false,
    supervisor: false,
    transportador: false,
    transportador_aux: false,
    vendedor: false,
    cobrador: false,
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [showFuncionarios, setShowFuncionarios] = useState(false);
  const [funcionarios, setFuncionarios] = useState([]);

  const [errors, setErrors] = useState({ global: null, fields: {} });

  // Busca funcionários ao digitar
  useEffect(() => {
    if (searchTerm.length > 2) {
      fetch(`http://localhost:8000/funcionarios/?search=${encodeURIComponent(searchTerm)}`)
        .then(r => r.json())
        .then(data => setFuncionarios(data.funcionarios_sql || []))
        .catch(err => console.error('Erro ao buscar funcionários:', err));
    }
  }, [searchTerm]);

  // Carrega dados do usuário + lista inicial de funcionários
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
          telefone: data.profile?.phone ? formatPhone(data.profile.phone) : '',
          funcionario: cod_funcionario,

          // flags atuais do PROFILE (mantemos enquanto não trocar de funcionário)
          cod_unid_gestora: data.profile?.cod_unid_gestora ?? null,
          entregador: !!data.profile?.entregador,
          supervisor: !!data.profile?.supervisor,
          transportador: !!data.profile?.transportador,
          transportador_aux: !!data.profile?.transportador_aux,
          vendedor: !!data.profile?.vendedor,
          cobrador: !!data.profile?.cobrador,
        }));

        // Lista base de funcionários e tenta obter o nome do atual
        fetch("http://localhost:8000/funcionarios/")
          .then(r => r.json())
          .then(listData => {
            let lista = listData.funcionarios_sql || [];
            const jaTem = lista.some(f => f.CodFuncionario?.toString() === cod_funcionario);

            if (cod_funcionario && !jaTem) {
              // Busca individual se não veio na lista
              fetch(`http://localhost:8000/funcionarios/${cod_funcionario}/`)
                .then(r => r.json())
                .then(func => {
                  if (func && func.CodFuncionario) lista.push(func);
                  setFuncionarios(lista);
                  const nome = func?.Funcionario || '';
                  setUsuario(prev => ({ ...prev, funcionario_nome: nome }));
                })
                .catch(() => setFuncionarios(lista));
            } else {
              setFuncionarios(lista);
              const func = lista.find(f => f.CodFuncionario?.toString() === cod_funcionario);
              if (func) {
                setUsuario(prev => ({ ...prev, funcionario_nome: func.Funcionario }));
              }
            }
          });
      })
      .catch(err => console.error('Erro ao buscar usuário/funcionários:', err));
  }, [id]);

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
      profile: {
        phone: (usuario.telefone || '').replace(/\D/g, ''),
        cod_funcionario: usuario.funcionario ? parseInt(usuario.funcionario, 10) : null,
        cod_unid_gestora: usuario.cod_unid_gestora != null ? parseInt(usuario.cod_unid_gestora, 10) : null,
        entregador: !!usuario.entregador,
        supervisor: !!usuario.supervisor,
        transportador: !!usuario.transportador,
        transportador_aux: !!usuario.transportador_aux,
        vendedor: !!usuario.vendedor,
        cobrador: !!usuario.cobrador,
      },
    };

    if (usuario.password && usuario.password.trim() !== '') {
      payload.password = usuario.password;
    }

    fetch(`http://localhost:8000/usuario/${id}/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(async res => {
        if (res.ok) {
          alert("Usuário atualizado com sucesso!");
          onSaved?.();
          return;
        }
        // Tenta ler JSON de erro
        let data = {};
        try { data = await res.json(); } catch { /* mantém vazio */ }

        // Extrai mensagem amigável (ex.: profile.cod_funcionario já usado)
        const msg =
          data?.profile?.cod_funcionario?.[0] ||
          data?.detail ||
          'Erro ao atualizar usuário.';

        // Preenche estado de erros para mostrar na página
        setErrors({
          global: msg,
          fields: {
            cod_funcionario: data?.profile?.cod_funcionario?.[0],
          },
        });
      })

      .catch(err => console.error('Erro ao atualizar usuário:', err));
  };

  // Quando escolher um funcionário, pegamos os flags dele e **aplicamos ao profile**
  const escolherFuncionario = (func) => {
    setUsuario(prev => ({
      ...prev,
      funcionario: func.CodFuncionario?.toString() || '',
      funcionario_nome: func.Funcionario || '',
      cod_unid_gestora: func.UnidGestora ?? null,

      // Deriva perfis a partir do funcionário
      entregador: !!func.Entregador,
      supervisor: !!func.Supervisor,
      transportador: !!func.Transportador,
      transportador_aux: !!func.TransportadorAux,
      vendedor: !!func.Vendedor,
      cobrador: !!func.Cobrador,
    }));
    setSearchTerm(func.Funcionario || '');
    setShowFuncionarios(false);
    setErrors({ global: null, fields: {} });
  };

  const onChangeTelefone = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.substring(0, 11);
    setUsuario(prev => ({ ...prev, telefone: formatPhone(value) }));
  };

  return (
    <div className="editar-user-container">
      {errors.global && (
  <div className="alert-error" role="alert">
    <span>{errors.global}</span>
    <button
      type="button"
      className="alert-close"
      onClick={() => setErrors({ global: null, fields: {} })}
      aria-label="Fechar alerta"
    >
      ×
    </button>
  </div>
)}

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
            placeholder="(00) 00000-0000"
            value={usuario.telefone}
            onChange={onChangeTelefone}
            maxLength={15}
          />
        </div>

        <div className="form-group">
          <label>Senha (opcional):</label>
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

        {/* Busca/seleção do funcionário (sem checkboxes de perfil) */}
        <div className="form-group funcionario-search">
          <label>Funcionário:</label>
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
                    funcionario_nome: '',
                    // se limpar, também podemos “zerar” os perfis, se fizer sentido:
                    // entregador: false, supervisor: false, transportador: false,
                    // transportador_aux: false, vendedor: false, cobrador: false,
                    // cod_unid_gestora: null,
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
                  <li key={func.CodFuncionario} onClick={() => escolherFuncionario(func)}>
                    <div className="funcionario-name">{func.Funcionario}</div>
                    <div className="funcionario-roles">
                      {func.Vendedor && <span>Vendedor</span>}
                      {func.Supervisor && <span>Supervisor</span>}
                      {func.Transportador && <span>Transportador</span>}
                      {func.Entregador && <span>Entregador</span>}
                      {func.TransportadorAux && <span>Aux. Transp.</span>}
                      {func.Cobrador && <span>Cobrador</span>}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Campo oculto para validação no submit */}
          <input type="hidden" name="funcionario" value={usuario.funcionario} required />
          {errors.fields?.cod_funcionario && (
            <span className="field-error">{errors.fields.cod_funcionario}</span>
          )}
        </div>

        <div className="actions">
          <button className="submit-button" type="submit">Salvar</button>
          <button type="button" onClick={() => onCancel?.()}>Cancelar</button>
        </div>
      </form>
    </div>
  );
}

// Helpers
function formatPhone(digits) {
  const v = (digits || '').replace(/\D/g, '');
  if (!v) return '';
  const isNine = v.length > 10;
  const ddd = v.slice(0, 2);
  const p1 = isNine ? v.slice(2, 7) : v.slice(2, 6);
  const p2 = isNine ? v.slice(7, 11) : v.slice(6, 10);
  return `(${ddd}) ${p1}${p2 ? '-' + p2 : ''}`;
}

export default EditarUsuario;
