import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/pages/Dashborad/Dashboard.jsx';
import Layout from './components/layout/layout.jsx';
import PivotVendas from './components/pages/PivotVendas.jsx';
import Login from './components/pages/Login.jsx';
import PrivateRoute from './components/routes/PrivateRoute.jsx';
import Register from './components/pages/register/Register.jsx';
import RegisterUser from'./components/pages/register/RegisterUser.jsx'



const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/pivot-vendas"
          element={
            <PrivateRoute>
              <Layout>
                <PivotVendas />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
            path="/cadastros"
            element={
              <PrivateRoute>
                <Layout>
                  <Register />
                </Layout>
              </PrivateRoute>
            }
/>
            <Route path="/cadastro_user" element={<RegisterUser />} />
      </Routes>
    </Router>
  );
};

export default App;
