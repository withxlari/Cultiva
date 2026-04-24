import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Produtos from './pages/Produtos';
import Clientes from './pages/Clientes';
import Vendas from './pages/Vendas';
import Fluxo from './pages/Fluxo';
import Vitrine from './pages/Vitrine';
import Capacitacao from './pages/Capacitacao';
import Layout from './components/Layout';
import Perfil from './pages/Perfil';

function RotaPrivada({ children }) {
  const { usuario, loading } = useAuth();
  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--text-muted)' }}>Carregando...</div>;
  return usuario ? children : <Navigate to="/login" />;
}

function RotaPublica({ children }) {
  const { usuario, loading } = useAuth();
  if (loading) return null;
  return usuario ? <Navigate to="/dashboard" /> : children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<RotaPublica><Login /></RotaPublica>} />
      <Route path="/register" element={<RotaPublica><Register /></RotaPublica>} />
      <Route path="/vitrine" element={<Vitrine />} />
      <Route path="/dashboard" element={<RotaPrivada><Layout /></RotaPrivada>}>
        <Route index element={<Dashboard />} />
        <Route path="produtos" element={<Produtos />} />
        <Route path="clientes" element={<Clientes />} />
        <Route path="vendas" element={<Vendas />} />
        <Route path="fluxo" element={<Fluxo />} />
        <Route path="capacitacao" element={<Capacitacao />} />
        <Route path="perfil" element={<Perfil />} />
      </Route>
    </Routes>
  );
}