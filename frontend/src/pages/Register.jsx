import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Sprout } from 'lucide-react';
import styles from './Auth.module.css';

const categorias = ['Alimentação', 'Beleza', 'Costura', 'Artesanato', 'Serviços Gerais', 'Educação', 'Saúde', 'Outros'];

export default function Register() {
  const [form, setForm] = useState({ nome: '', email: '', senha: '', nome_negocio: '', descricao_negocio: '', categoria: '', telefone: '' });
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  function capturarLocalizacao() {
    navigator.geolocation.getCurrentPosition(
      (pos) => setForm(f => ({ ...f, latitude: pos.coords.latitude, longitude: pos.coords.longitude })),
      () => setErro('Não foi possível capturar localização.')
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');
    setLoading(true);
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setErro(err.response?.data?.error || 'Erro ao cadastrar.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card} style={{ maxWidth: 480 }}>
        <div className={styles.logo}>
          <Sprout size={32} />
          <h1>Cultiva</h1>
        </div>
        <p className={styles.sub}>Crie sua conta gratuitamente</p>
        <form onSubmit={handleSubmit} className={styles.form}>
          {erro && <div className={styles.erro}>{erro}</div>}
          <div className={styles.grid2}>
            <div className={styles.field}>
              <label>Seu nome</label>
              <input value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} required />
            </div>
            <div className={styles.field}>
              <label>Telefone</label>
              <input value={form.telefone} onChange={e => setForm({ ...form, telefone: e.target.value })} placeholder="(11) 99999-9999" />
            </div>
          </div>
          <div className={styles.field}>
            <label>Email</label>
            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className={styles.field}>
            <label>Senha</label>
            <input type="password" value={form.senha} onChange={e => setForm({ ...form, senha: e.target.value })} required />
          </div>
          <div className={styles.field}>
            <label>Nome do negócio</label>
            <input value={form.nome_negocio} onChange={e => setForm({ ...form, nome_negocio: e.target.value })} />
          </div>
          <div className={styles.field}>
            <label>Descrição do negócio</label>
            <textarea value={form.descricao_negocio} onChange={e => setForm({ ...form, descricao_negocio: e.target.value })} rows={2} />
          </div>
          <div className={styles.field}>
            <label>Categoria</label>
            <select value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })}>
              <option value="">Selecione...</option>
              {categorias.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <button type="button" onClick={capturarLocalizacao} className={styles.btnSecondary}>
            {form.latitude ? 'Localizacao capturada' : 'Capturar minha localizacao'}
          </button>
          <button type="submit" className={styles.btn} disabled={loading}>
            {loading ? 'Cadastrando...' : 'Criar conta'}
          </button>
        </form>
        <p className={styles.link}>Já tem conta? <Link to="/login">Entre aqui</Link></p>
      </div>
    </div>
  );
}