import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { MapPin, Save, CheckCircle } from 'lucide-react';
import styles from './Page.module.css';

const categorias = ['Alimentação', 'Beleza', 'Costura', 'Artesanato', 'Serviços Gerais', 'Educação', 'Saúde', 'Outros'];

export default function Perfil() {
  const { usuario, login } = useAuth();
  const [form, setForm] = useState({ nome: '', nome_negocio: '', descricao_negocio: '', categoria: '', telefone: '', endereco_texto: '', latitude: '', longitude: '' });
  const [loading, setLoading] = useState(false);
  const [localizando, setLocalizando] = useState(false);
  const [sucesso, setSucesso] = useState('');
  const [erro, setErro] = useState('');

  useEffect(() => {
    async function carregar() {
      const { data } = await api.get('/auth/me');
      setForm({
        nome: data.nome || '',
        nome_negocio: data.nome_negocio || '',
        descricao_negocio: data.descricao_negocio || '',
        categoria: data.categoria || '',
        telefone: data.telefone || '',
        endereco_texto: data.endereco_texto || '',
        latitude: data.latitude || '',
        longitude: data.longitude || '',
      });
    }
    carregar();
  }, []);

  function capturarLocalizacao() {
    setLocalizando(true);
    setErro('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm(f => ({ ...f, latitude: pos.coords.latitude, longitude: pos.coords.longitude }));
        setLocalizando(false);
      },
      () => {
        setErro('Não foi possível capturar a localização. Verifique as permissões do navegador.');
        setLocalizando(false);
      }
    );
  }

  async function salvar(e) {
    e.preventDefault();
    setLoading(true);
    setErro('');
    try {
      await api.put('/auth/me', form);
      setSucesso('Perfil atualizado com sucesso.');
      setTimeout(() => setSucesso(''), 3000);
    } catch (err) {
      setErro(err.response?.data?.error || 'Erro ao salvar.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1>Meu Perfil</h1>
          <p>Informações do seu negócio e localização</p>
        </div>
      </div>

      {sucesso && <div className={styles.sucesso}>{sucesso}</div>}
      {erro && <div className={styles.erroMsg}>{erro}</div>}

      <form onSubmit={salvar}>
        <div className={styles.perfilGrid}>
          <div className={styles.perfilCard}>
            <h2 className={styles.perfilSecao}>Dados pessoais</h2>
            <div className={styles.field}>
              <label>Seu nome</label>
              <input value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} required />
            </div>
            <div className={styles.field}>
              <label>Telefone</label>
              <input value={form.telefone} onChange={e => setForm({ ...form, telefone: e.target.value })} placeholder="(11) 99999-9999" />
            </div>
          </div>

          <div className={styles.perfilCard}>
            <h2 className={styles.perfilSecao}>Dados do negócio</h2>
            <div className={styles.field}>
              <label>Nome do negócio</label>
              <input value={form.nome_negocio} onChange={e => setForm({ ...form, nome_negocio: e.target.value })} />
            </div>
            <div className={styles.field}>
              <label>Categoria</label>
              <select value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })}>
                <option value="">Selecione...</option>
                {categorias.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className={styles.field}>
              <label>Descrição</label>
              <textarea value={form.descricao_negocio} onChange={e => setForm({ ...form, descricao_negocio: e.target.value })} rows={3} placeholder="Descreva seu negócio para aparecer na vitrine..." />
            </div>
          </div>

          <div className={styles.perfilCard}>
            <h2 className={styles.perfilSecao}>Localização</h2>
            <p className={styles.perfilDica}>Sua localização é usada para aparecer na vitrine quando clientes buscam negócios próximos.</p>
            <div className={styles.field}>
              <label>Endereço (opcional)</label>
              <input value={form.endereco_texto} onChange={e => setForm({ ...form, endereco_texto: e.target.value })} placeholder="Ex: Rua das Flores, 123 - Vila Nova" />
            </div>
            <button type="button" className={styles.btnLocalizacao} onClick={capturarLocalizacao} disabled={localizando}>
              <MapPin size={16} />
              {localizando ? 'Capturando...' : form.latitude ? 'Atualizar localização' : 'Capturar minha localização'}
            </button>
            {form.latitude && (
              <div className={styles.coordsInfo}>
                <CheckCircle size={14} color="var(--success)" />
                <span>Localização capturada: {parseFloat(form.latitude).toFixed(4)}, {parseFloat(form.longitude).toFixed(4)}</span>
              </div>
            )}
          </div>
        </div>

        <div className={styles.perfilFooter}>
          <button type="submit" className={styles.btn} disabled={loading}>
            <Save size={16} />
            {loading ? 'Salvando...' : 'Salvar perfil'}
          </button>
        </div>
      </form>
    </div>
  );
}