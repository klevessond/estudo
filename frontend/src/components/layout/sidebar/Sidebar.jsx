import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);

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
            </ul>
        </aside>
    );
};

export default Sidebar;
