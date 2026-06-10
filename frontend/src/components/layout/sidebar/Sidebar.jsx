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
        user?.gerente === true; // Verifica a outra chave também

    return (
        <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
            <button className="toggle-button" onClick={() => setIsCollapsed(!isCollapsed)}>
                {isCollapsed ? '→' : '←'}
            </button>
            <ul>
                <li>
                    <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                        {isCollapsed ? '🏠' : 'Home'}
                    </Link>

                </li>

                <li>
                    <Link to="/cadastros" style={{ textDecoration: 'none', color: 'inherit' }}>
                        {isCollapsed ? '📊' : 'Cadastros'}
                    </Link>
                </li>
                 {/* Novo item para Cadastro de Usuários */}
                <li>
                    <Link to="/cadastro_user" style={{ textDecoration: 'none', color: 'inherit' }}>
                        {isCollapsed ? '👤' : 'Usuários'}
                    </Link>
                </li>
                {podeGerenciarFeriados && (
                    <li>
                    <Link to="/feriados" style={{ textDecoration: 'none', color: 'inherit' }}>
                        {isCollapsed ? '📅' : 'Feriados'}
                    </Link>
                    </li>
                    
                )}

                <li>
                    <Link to="/pivot-vendas" style={{ textDecoration: 'none', color: 'inherit' }}>
                        {isCollapsed ? '⚙️' : 'Tabela Dinâmica'}
                    </Link>
                </li>
                        </ul>
        </aside>
    );
};

export default Sidebar;
