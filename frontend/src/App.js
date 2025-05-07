import logo from './logo.svg';
import React, { useState, useEffect } from 'react';
import './App.css';
import ClienteServices from './services/Clienteservices.js';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/pages/Dashborad/Dashboard.jsx';
import Layout from './components/layout/layout.jsx';
import ResumoVendas from './components/ResumoVendas/ResumoVendas.jsx';
import PivotVendas from './components/pages/PivotVendas.jsx'; // ✅ Corrigido

const App = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/pivot-vendas" element={<PivotVendas />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
