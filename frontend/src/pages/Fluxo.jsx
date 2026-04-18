import { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import styles from './Page.module.css';

const formInicial = { descricao: '', valor: '', tipo: 'entrada', categoria: '', data_registro: new Date().toISOString().split('T')[0] };

export default function Fluxo() {
  const [lancamentos, setLancamentos] = useState([]);
  const [saldo, setSaldo] = useState(null);
  const [form, setForm] = useState(formInicial);
  const [modal, setModal] = useState(false);

  useEffect(() => { carregar(); }, []);

  async function carregar() {
    const [l, s] = await Promise.all([api.get('/fluxo'), api.get('/fluxo/saldo')]);
    setLancamentos(l.data);
    setSaldo(s.data);
  }

  async function salvar(e) {
    e.preventDefault();
    try {
      await api.post('/fluxo', form);
      setModal(false);
      setForm(formInicial);
      carregar();
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao salvar.');
    }
  }

  async function deletar(id) {
    if (!confirm('Remover lançamento?')) return;
    await api.delete(`/fluxo/${id}`);
    carregar();
  }

  const fmt = (v) => `R$ ${parseFloat(v || 0).toFixed(2).replace('.', ',')}`;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1>Fluxo de Caixa</h1>
          <p>Registre entradas e saídas do dia</p>
        </div>
        <button className={styles.btn} onClick={() => setModal(true)}>
          <Plus size={16} /> Novo lançamento
        </button>
      </div>

      {saldo && (
        <div className={styles.saldoCards}>
          <div className={`${styles.saldoCard} ${styles.entrada}`}>
            <TrendingUp size={18} />
            <div>
              <span>Entradas</span>
              <strong>{fmt(saldo.total_entradas)}</strong>
            </div>
          </div>
          <div className={`${styles.saldoCard} ${styles.saida}`}>
            <TrendingDown size={18} />
            <div>
              <span>Saídas</span>
              <strong>{fmt(saldo.total_saidas)}</strong>
            </div>
          </div>
          <div className={`${styles.saldoCard} ${parseFloat(saldo.saldo) >= 0 ? styles.entrada : styles.saida}`}>
            <div>
              <span>Saldo</span>
              <strong>{fmt(saldo.saldo)}</strong>
            </div>
          </div>
        </div>
      )}

      <div className={styles.list}>
        {lancamentos.map(l => (
          <div key={l.id} className={styles.listItem}>
            <div className={`${styles.tipoIcon} ${l.tipo === 'entrada' ? styles.entradaIcon : styles.saidaIcon}`}>
              {l.tipo === 'entrada' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            </div>
            <div className={styles.listInfo}>
              <strong>{l.descricao}</strong>
              <span>{l.categoria || 'Sem categoria'} · {new Date(l.data_registro).toLocaleDateString('pt-BR')}</span>
            </div>
            <strong className={l.tipo === 'entrada' ? styles.valorEntrada : styles.valorSaida}>
              {l.tipo === 'entrada' ? '+' : '-'} {fmt(l.valor)}
            </strong>
            <button className={`${styles.iconBtn} ${styles.danger}`} onClick={() => deletar(l.id)}><Trash2 size={14} /></button>
          </div>
        ))}
        {lancamentos.length === 0 && <p className={styles.empty}>Nenhum lançamento registrado.</p>}
      </div>

      {modal && (
        <div className={styles.overlay} onClick={() => setModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h2>Novo lançamento</h2>
            <form onSubmit={salvar} className={styles.form}>
              <div className={styles.field}>
                <label>Descrição</label>
                <input value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} required />
              </div>
              <div className={styles.grid2}>
                <div className={styles.field}>
                  <label>Valor (R$)</label>
                  <input type="number" step="0.01" value={form.valor} onChange={e => setForm({ ...form, valor: e.target.value })} required />
                </div>
                <div className={styles.field}>
                  <label>Tipo</label>
                  <select value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })}>
                    <option value="entrada">Entrada</option>
                    <option value="saida">Saída</option>
                  </select>
                </div>
              </div>
              <div className={styles.grid2}>
                <div className={styles.field}>
                  <label>Categoria</label>
                  <input value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })} placeholder="ex: mercado, aluguel..." />
                </div>
                <div className={styles.field}>
                  <label>Data</label>
                  <input type="date" value={form.data_registro} onChange={e => setForm({ ...form, data_registro: e.target.value })} />
                </div>
              </div>
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