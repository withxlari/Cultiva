import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Produtos from './pages/Produtos';
import Clientes from './pages/Clientes';
import Vendas from './pages/Vendas';
import Fluxo from './pages/Fluxo';
import Vitrine from './pages/Vitrine';
import Capacitacao from './pages/Capacitacao';
import Layout from './components/Layout';

function RotaPrivada({ children }) {
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/vitrine" element={<Vitrine />} />
      <Route path="/" element={<RotaPrivada><Layout /></RotaPrivada>}>
        <Route index element={<Dashboard />} />
        <Route path="produtos" element={<Produtos />} />
        <Route path="clientes" element={<Clientes />} />
        <Route path="vendas" element={<Vendas />} />
        <Route path="fluxo" element={<Fluxo />} />
        <Route path="capacitacao" element={<Capacitacao />} />
      </Route>
    </Routes>
  );
}