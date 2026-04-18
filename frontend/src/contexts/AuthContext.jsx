import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('cultiva_token');
    const usuarioSalvo = localStorage.getItem('cultiva_usuario');
    if (token && usuarioSalvo) {
      setUsuario(JSON.parse(usuarioSalvo));
    }
    setLoading(false);
  }, []);

  async function login(email, senha) {
    const { data } = await api.post('/auth/login', { email, senha });
    localStorage.setItem('cultiva_token', data.token);
    localStorage.setItem('cultiva_usuario', JSON.stringify(data.usuario));
    setUsuario(data.usuario);
    return data;
  }

  async function register(dados) {
    const { data } = await api.post('/auth/register', dados);
    localStorage.setItem('cultiva_token', data.token);
    localStorage.setItem('cultiva_usuario', JSON.stringify(data.usuario));
    setUsuario(data.usuario);
    return data;
  }

  function logout() {
    localStorage.removeItem('cultiva_token');
    localStorage.removeItem('cultiva_usuario');
    setUsuario(null);
  }

  return (
    <AuthContext.Provider value={{ usuario, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}