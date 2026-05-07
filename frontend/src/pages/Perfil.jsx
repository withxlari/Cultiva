import { useState, useEffect } from 'react';
import api from '../services/api';
import { MapPin, Save, CheckCircle, AtSign, Clock, CreditCard, ShoppingBag, Truck } from 'lucide-react';
import styles from './Page.module.css';

const categorias = ['Alimentação', 'Beleza', 'Costura', 'Artesanato', 'Serviços Gerais', 'Educação', 'Saúde', 'Outros'];

export default function Perfil() {
  const [form, setForm] = useState({
    nome: '', nome_negocio: '', descricao_negocio: '', categoria: '',
    telefone: '', endereco_texto: '', latitude: '', longitude: '',
    instagram: '', horario_funcionamento: '', formas_pagamento: '',
    aceita_encomenda: false, entrega_bairro: false,
  });
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
        instagram: data.instagram || '',
        horario_funcionamento: data.horario_funcionamento || '',
        formas_pagamento: data.formas_pagamento || '',
        aceita_encomenda: data.aceita_encomenda || false,
        entrega_bairro: data.entrega_bairro || false,
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
              <label>Telefone (WhatsApp)</label>
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
            <h2 className={styles.perfilSecao}>Presença e contato</h2>
            <div className={styles.field}>
              <label>
                <AtSign size={14} style={{ display: 'inline', marginRight: 4 }} />
                Instagram
              </label>
              <input value={form.instagram} onChange={e => setForm({ ...form, instagram: e.target.value })} placeholder="@seunegocio" />
            </div>
            <div className={styles.field}>
              <label>
                <Clock size={14} style={{ display: 'inline', marginRight: 4 }} />
                Horário de funcionamento
              </label>
              <input value={form.horario_funcionamento} onChange={e => setForm({ ...form, horario_funcionamento: e.target.value })} placeholder="Ex: Seg-Sex 8h às 18h, Sáb 8h às 13h" />
            </div>
            <div className={styles.field}>
              <label>
                <CreditCard size={14} style={{ display: 'inline', marginRight: 4 }} />
                Formas de pagamento
              </label>
              <input value={form.formas_pagamento} onChange={e => setForm({ ...form, formas_pagamento: e.target.value })} placeholder="Ex: Pix, dinheiro, cartão de débito" />
            </div>
            <div className={styles.perfilChecks}>
              <label className={styles.checkLabel}>
                <input type="checkbox" checked={form.aceita_encomenda} onChange={e => setForm({ ...form, aceita_encomenda: e.target.checked })} />
                <ShoppingBag size={14} />
                Aceita encomenda
              </label>
              <label className={styles.checkLabel}>
                <input type="checkbox" checked={form.entrega_bairro} onChange={e => setForm({ ...form, entrega_bairro: e.target.checked })} />
                <Truck size={14} />
                Faz entrega no bairro
              </label>
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