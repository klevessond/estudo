import React, { useState } from 'react';
import { useAuth } from '../../../contexts/auth';
import { Link } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { user, roles } = useAuth();

    const podeGerenciarFeriados =
        user?.is_superuser ||
        user?.is_gerente === true ||
        user?.gerente === true;

    const podeGerenciarCampanhas =
        user?.is_superuser ||
        user?.is_gerente === true ||
        user?.gerente === true ||
        user?.supervisor === true;

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

                    <li>
                        <Link to="/cadastros" className="sidebar-link">
                            <span className="icon">📊</span>
                            <span className="label">Cadastros</span>
                        </Link>
                    </li>

                    <li>
                        <Link to="/cadastro_user" className="sidebar-link">
                            <span className="icon">👤</span>
                            <span className="label">Usuários</span>
                        </Link>
                    </li>

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
