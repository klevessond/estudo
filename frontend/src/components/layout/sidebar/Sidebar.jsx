import React, { useState } from 'react';
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
                <li>{isCollapsed ? '📊' : 'Gráficos'}</li>
                <li>{isCollapsed ? '📄' : 'Relatórios'}</li>
            </ul>
        </aside>
    );
};

export default Sidebar;