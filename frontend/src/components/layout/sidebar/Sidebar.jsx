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
                <li>{isCollapsed ? '🏠' : 'Home'}</li>

                <li>
                    <Link to="/cadastros" style={{ textDecoration: 'none', color: 'inherit' }}>
                        {isCollapsed ? '📊' : 'Cadastros'}
                    </Link>
                </li>
            </ul>
        </aside>
    );
};

export default Sidebar;
