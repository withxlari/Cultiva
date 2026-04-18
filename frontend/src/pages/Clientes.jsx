import { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Pencil, Trash2, MessageCircle, History } from 'lucide-react';
import styles from './Page.module.css';

const formInicial = { nome: '', telefone: '', email: '', observacoes: '' };

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [form, setForm] = useState(formInicial);
  const [editando, setEditando] = useState(null);
  const [modal, setModal] = useState(false);
  const [historico, setHistorico] = useState(null);
  const [clienteSel, setClienteSel] = useState(null);

  useEffect(() => { carregar(); }, []);

  async function carregar() {
    const { data } = await api.get('/clientes');
    setClientes(data);
  }

  async function salvar(e) {
    e.preventDefault();
    try {
      if (editando) await api.put(`/clientes/${editando}`, form);
      else await api.post('/clientes', form);
      setModal(false);
      setForm(formInicial);
      setEditando(null);
      carregar();
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao salvar.');
    }
  }

  async function deletar(id) {
    if (!confirm('Remover cliente?')) return;
    await api.delete(`/clientes/${id}`);
    carregar();
  }

  async function verHistorico(c) {
    const { data } = await api.get(`/clientes/${c.id}/historico`);
    setHistorico(data);
    setClienteSel(c);
  }

  async function alertaWhatsapp(id) {
    const { data } = await api.get(`/clientes/${id}/alerta-whatsapp`);
    if (data.link_whatsapp) window.open(data.link_whatsapp, '_blank');
    else alert('Cliente sem telefone cadastrado.');
  }

  function editar(c) {
    setForm({ nome: c.nome, telefone: c.telefone || '', email: c.email || '', observacoes: c.observacoes || '' });
    setEditando(c.id);
    setModal(true);
  }

  const fmt = (v) => `R$ ${parseFloat(v || 0).toFixed(2).replace('.', ',')}`;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1>Clientes</h1>
          <p>Gerencie seus clientes e fiados</p>
        </div>
        <button className={styles.btn} onClick={() => { setModal(true); setForm(formInicial); setEditando(null); }}>
          <Plus size={16} /> Novo cliente
        </button>
      </div>

      <div className={styles.list}>
        {clientes.map(c => (
          <div key={c.id} className={styles.listItem}>
            <div className={styles.listAvatar}>{c.nome.charAt(0).toUpperCase()}</div>
            <div className={styles.listInfo}>
              <strong>{c.nome}</strong>
              <span>{c.telefone || 'Sem telefone'}</span>
            </div>
            <div className={styles.listMeta}>
              {parseFloat(c.total_pendente) > 0 && (
                <span className={styles.pendente}>{fmt(c.total_pendente)} pendente</span>
              )}
              <span className={styles.totalVendas}>{c.total_vendas} vendas</span>
            </div>
            <div className={styles.listActions}>
              <button className={styles.iconBtn} title="Histórico" onClick={() => verHistorico(c)}><History size={14} /></button>
              <button className={styles.iconBtn} title="WhatsApp" onClick={() => alertaWhatsapp(c.id)}><MessageCircle size={14} /></button>
              <button className={styles.iconBtn} onClick={() => editar(c)}><Pencil size={14} /></button>
              <button className={`${styles.iconBtn} ${styles.danger}`} onClick={() => deletar(c.id)}><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
        {clientes.length === 0 && <p className={styles.empty}>Nenhum cliente cadastrado ainda.</p>}
      </div>

      {modal && (
        <div className={styles.overlay} onClick={() => setModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h2>{editando ? 'Editar cliente' : 'Novo cliente'}</h2>
            <form onSubmit={salvar} className={styles.form}>
              <div className={styles.field}>
                <label>Nome</label>
                <input value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} required />
              </div>
              <div className={styles.grid2}>
                <div className={styles.field}>
                  <label>Telefone</label>
                  <input value={form.telefone} onChange={e => setForm({ ...form, telefone: e.target.value })} placeholder="(11) 99999-9999" />
                </div>
                <div className={styles.field}>
                  <label>Email</label>
                  <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                </div>
              </div>
              <div className={styles.field}>
                <label>Observações</label>
                <textarea value={form.observacoes} onChange={e => setForm({ ...form, observacoes: e.target.value })} rows={2} />
              </div>
              <div className={styles.modalFooter}>
                <button type="button" className={styles.btnSecondary} onClick={() => setModal(false)}>Cancelar</button>
                <button type="submit" className={styles.btn}>Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {historico && clienteSel && (
        <div className={styles.overlay} onClick={() => setHistorico(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h2>Histórico — {clienteSel.nome}</h2>
            <div className={styles.form}>
              {historico.length === 0 && <p className={styles.empty}>Sem vendas registradas.</p>}
              {historico.map(v => (
                <div key={v.id} className={styles.historicoItem}>
                  <div>
                    <strong>{v.descricao || 'Venda'}</strong>
                    <span>{new Date(v.created_at).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <strong>{fmt(v.valor)}</strong>
                    <span className={v.status === 'pago' ? styles.pago : styles.pendenteBadge}>{v.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}