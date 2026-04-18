import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Sprout } from 'lucide-react';
import styles from './Auth.module.css';

export default function Login() {
  const [form, setForm] = useState({ email: '', senha: '' });
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');
    setLoading(true);
    try {
      await login(form.email, form.senha);
      navigate('/');
    } catch (err) {
      setErro(err.response?.data?.error || 'Erro ao fazer login.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <Sprout size={32} />
          <h1>Cultiva</h1>
        </div>
        <p className={styles.sub}>Gerencie seu negócio com simplicidade</p>
        <form onSubmit={handleSubmit} className={styles.form}>
          {erro && <div className={styles.erro}>{erro}</div>}
          <div className={styles.field}>
            <label>Email</label>
            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className={styles.field}>
            <label>Senha</label>
            <input type="password" value={form.senha} onChange={e => setForm({ ...form, senha: e.target.value })} required />
          </div>
          <button type="submit" className={styles.btn} disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        <p className={styles.link}>Não tem conta? <Link to="/register">Cadastre-se</Link></p>
      </div>
    </div>
  );
}