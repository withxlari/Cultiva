import { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, CheckCircle } from 'lucide-react';
import styles from './Page.module.css';

const formInicial = { cliente_id: '', produto_id: '', descricao: '', valor: '', tipo: 'avista', status: 'pago', data_vencimento: '' };

export default function Vendas() {
  const [vendas, setVendas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [form, setForm] = useState(formInicial);
  const [modal, setModal] = useState(false);
  const [filtro, setFiltro] = useState('');

  useEffect(() => { carregar(); }, [filtro]);

  async function carregar() {
    const params = filtro ? `?status=${filtro}` : '';
    const [v, c, p] = await Promise.all([
      api.get(`/vendas${params}`),
      api.get('/clientes'),
      api.get('/produtos'),
    ]);
    setVendas(v.data);
    setClientes(c.data);
    setProdutos(p.data);
  }

  async function salvar(e) {
    e.preventDefault();
    try {
      await api.post('/vendas', form);
      setModal(false);
      setForm(formInicial);
      carregar();
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao salvar.');
    }
  }

  async function marcarPago(id) {
    await api.patch(`/vendas/${id}/status`, { status: 'pago' });
    carregar();
  }

  function selecionarProduto(id) {
    const p = produtos.find(x => x.id === id);
    setForm(f => ({ ...f, produto_id: id, valor: p ? p.preco_venda : f.valor, descricao: p ? p.nome : f.descricao }));
  }

  const fmt = (v) => `R$ ${parseFloat(v || 0).toFixed(2).replace('.', ',')}`;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1>Vendas e Fiado</h1>
          <p>Registre vendas e controle o fiado</p>
        </div>
        <button className={styles.btn} onClick={() => { setModal(true); setForm(formInicial); }}>
          <Plus size={16} /> Nova venda
        </button>
      </div>

      <div className={styles.filtros}>
        {['', 'pago', 'pendente'].map(f => (
          <button key={f} className={`${styles.filtroBtn} ${filtro === f ? styles.filtroAtivo : ''}`} onClick={() => setFiltro(f)}>
            {f === '' ? 'Todas' : f === 'pago' ? 'Pagas' : 'Pendentes'}
          </button>
        ))}
      </div>

      <div className={styles.list}>
        {vendas.map(v => (
          <div key={v.id} className={styles.listItem}>
            <div className={styles.listInfo}>
              <strong>{v.descricao || 'Venda'}</strong>
              <span>{v.cliente_nome || 'Sem cliente'} · {new Date(v.created_at).toLocaleDateString('pt-BR')}</span>
            </div>
            <div className={styles.listMeta}>
              <strong>{fmt(v.valor)}</strong>
              <span className={v.status === 'pago' ? styles.pago : styles.pendenteBadge}>{v.tipo === 'fiado' ? 'fiado' : v.status}</span>
            </div>
            {v.status === 'pendente' && (
              <button className={styles.iconBtn} title="Marcar como pago" onClick={() => marcarPago(v.id)}>
                <CheckCircle size={16} color="var(--success)" />
              </button>
            )}
          </div>
        ))}
        {vendas.length === 0 && <p className={styles.empty}>Nenhuma venda encontrada.</p>}
      </div>

      {modal && (
        <div className={styles.overlay} onClick={() => setModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h2>Nova venda</h2>
            <form onSubmit={salvar} className={styles.form}>
              <div className={styles.field}>
                <label>Produto (opcional)</label>
                <select value={form.produto_id} onChange={e => selecionarProduto(e.target.value)}>
                  <option value="">Selecione um produto...</option>
                  {produtos.map(p => <option key={p.id} value={p.id}>{p.nome} — {fmt(p.preco_venda)}</option>)}
                </select>
              </div>
              <div className={styles.field}>
                <label>Descrição</label>
                <input value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} />
              </div>
              <div className={styles.field}>
                <label>Cliente (opcional)</label>
                <select value={form.cliente_id} onChange={e => setForm({ ...form, cliente_id: e.target.value })}>
                  <option value="">Selecione um cliente...</option>
                  {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
              </div>
              <div className={styles.grid2}>
                <div className={styles.field}>
                  <label>Valor (R$)</label>
                  <input type="number" step="0.01" value={form.valor} onChange={e => setForm({ ...form, valor: e.target.value })} required />
                </div>
                <div className={styles.field}>
                  <label>Tipo</label>
                  <select value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value, status: e.target.value === 'fiado' ? 'pendente' : 'pago' })}>
                    <option value="avista">À vista</option>
                    <option value="fiado">Fiado</option>
                  </select>
                </div>
              </div>
              {form.tipo === 'fiado' && (
                <div className={styles.field}>
                  <label>Data de vencimento</label>
                  <input type="date" value={form.data_vencimento} onChange={e => setForm({ ...form, data_vencimento: e.target.value })} />
                </div>
              )}
              <div className={styles.modalFooter}>
                <button type="button" className={styles.btnSecondary} onClick={() => setModal(false)}>Cancelar</button>
                <button type="submit" className={styles.btn}>Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}