import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from "./contexts/auth.jsx";
import Dashboard from './components/pages/Dashborad/Dashboard.jsx';
import Layout from './components/layout/layout.jsx';
import PivotVendas from './components/pages/PivotVendas.jsx';
import Login from './components/pages/Login.jsx';
import PrivateRoute from './components/routes/PrivateRoute.jsx';
import Register from './components/pages/register/Register.jsx';
import RegisterUser from'./components/pages/register/RegisterUser.jsx'
import EditarUsuario from './components/pages/register/EditarUsuario.jsx';
import Feriados from './components/pages/register/Feriados.jsx';



const App = () => {
  return (
   <AuthProvider>
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
      <Route
        path="/cadastro_user"
        element={
          <PrivateRoute>
            <Layout>
              <RegisterUser />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/editar-usuario/:id"
        element={
          <PrivateRoute>
            <Layout>
              <EditarUsuario />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route 
        path="/feriados" 
        element={
          <PrivateRoute> {/* Se você usa proteção de rotas */}
            <Layout>
              <Feriados />
            </Layout>
          </PrivateRoute>
        } 
      />
      </Routes>
    </Router></AuthProvider>
  );
};

export default App;
