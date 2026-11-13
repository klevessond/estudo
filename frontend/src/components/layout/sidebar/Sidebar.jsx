import React, { useState } from 'react';
import { useAuth } from '../../../contexts/auth';
import { Link } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { user, roles } = useAuth();

    // Mesmas regras do backend (backend/dashboard/permissions.py).
    // O backend é quem garante; aqui só escondemos o que o usuário não pode usar.
    const ehAdmin = user?.is_superuser === true;
    const ehGerente = user?.is_gerente === true || user?.gerente === true;
    const ehSupervisor = user?.supervisor === true;

    const podeGerenciarUsuarios = ehAdmin || ehGerente;
    const podeGerenciarObjetivos = ehAdmin || ehGerente || ehSupervisor;
    const podeGerenciarFeriados = podeGerenciarObjetivos;
    const podeGerenciarCampanhas = podeGerenciarObjetivos;

    return (
        <>
            {/* Fundo escurecido no mobile, quando o menu está aberto */}
            {!isCollapsed && (
                <div
                    className="sidebar-backdrop"
                    onClick={() => setIsCollapsed(true)}
                    style={{ display: 'none' }}
                    // exibido só em telas pequenas via classe utilitária, se preferir
                />
            )}

            <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
                <button className="toggle-button" onClick={() => setIsCollapsed(!isCollapsed)}>
                    {isCollapsed ? '→' : '←'}
                </button>
                <ul>
                    <li>
                        <Link to="/" className="sidebar-link">
                            <span className="icon">🏠</span>
                            <span className="label">Home</span>
                        </Link>
                    </li>

                    {podeGerenciarObjetivos && (
                        <li>
                            <Link to="/cadastros" className="sidebar-link">
                                <span className="icon">📊</span>
                                <span className="label">Cadastros</span>
                            </Link>
                        </li>
                    )}

                    {podeGerenciarUsuarios && (
                        <li>
                            <Link to="/cadastro_user" className="sidebar-link">
                                <span className="icon">👤</span>
                                <span className="label">Usuários</span>
                            </Link>
                        </li>
                    )}

                    {podeGerenciarFeriados && (
                        <li>
                            <Link to="/feriados" className="sidebar-link">
                                <span className="icon">📅</span>
                                <span className="label">Feriados</span>
                            </Link>
                        </li>
                    )}

                    <li>
                        <Link to="/pivot-vendas" className="sidebar-link">
                            <span className="icon">⚙️</span>
                            <span className="label">Tabela Dinâmica</span>
                        </Link>
                    </li>

                    <li>
                        <Link to="/telegram" className="sidebar-link">
                            <span className="icon">📱</span>
                            <span className="label">Telegram</span>
                        </Link>
                    </li>

                    {podeGerenciarCampanhas && (
                        <li>
                            <Link to="/campanhas" className="sidebar-link">
                                <span className="icon">🏆</span>
                                <span className="label">Campanhas</span>
                            </Link>
                        </li>
                    )}
                </ul>
            </aside>
        </>
    );
};

export default Sidebar;
