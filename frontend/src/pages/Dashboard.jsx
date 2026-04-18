import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { TrendingUp, TrendingDown, ShoppingBag, Users, DollarSign, AlertCircle } from 'lucide-react';
import styles from './Dashboard.module.css';

export default function Dashboard() {
  const { usuario } = useAuth();
  const [saldo, setSaldo] = useState(null);
  const [relatorio, setRelatorio] = useState(null);
  const [pendentes, setPendentes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregar() {
      try {
        const [s, r, v] = await Promise.all([
          api.get('/fluxo/saldo'),
          api.get('/vendas/relatorio'),
          api.get('/vendas?status=pendente'),
        ]);
        setSaldo(s.data);
        setRelatorio(r.data);
        setPendentes(v.data.slice(0, 5));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    carregar();
  }, []);

  if (loading) return <div className={styles.loading}>Carregando...</div>;

  const fmt = (v) => `R$ ${parseFloat(v || 0).toFixed(2).replace('.', ',')}`;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1>Olá, {usuario?.nome_negocio || usuario?.nome}</h1>
          <p>Aqui está um resumo do seu negócio</p>
        </div>
      </div>

      <div className={styles.cards}>
        <div className={styles.card}>
          <div className={styles.cardIcon} style={{ background: '#e6f5ee' }}>
            <TrendingUp size={20} color="var(--success)" />
          </div>
          <div>
            <span className={styles.cardLabel}>Entradas</span>
            <strong className={styles.cardValue}>{fmt(saldo?.total_entradas)}</strong>
          </div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardIcon} style={{ background: 'var(--danger-light)' }}>
            <TrendingDown size={20} color="var(--danger)" />
          </div>
          <div>
            <span className={styles.cardLabel}>Saídas</span>
            <strong className={styles.cardValue}>{fmt(saldo?.total_saidas)}</strong>
          </div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardIcon} style={{ background: '#e8f2e8' }}>
            <DollarSign size={20} color="var(--primary-dark)" />
          </div>
          <div>
            <span className={styles.cardLabel}>Saldo</span>
            <strong className={styles.cardValue} style={{ color: parseFloat(saldo?.saldo) >= 0 ? 'var(--success)' : 'var(--danger)' }}>
              {fmt(saldo?.saldo)}
            </strong>
          </div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardIcon} style={{ background: 'var(--warning-light)' }}>
            <AlertCircle size={20} color="var(--warning)" />
          </div>
          <div>
            <span className={styles.cardLabel}>A Receber</span>
            <strong className={styles.cardValue} style={{ color: 'var(--warning)' }}>{fmt(relatorio?.resumo?.total_pendente)}</strong>
          </div>
        </div>
      </div>

      {pendentes.length > 0 && (
        <div className={styles.section}>
          <h2>Fiados pendentes</h2>
          <div className={styles.table}>
            {pendentes.map(v => (
              <div key={v.id} className={styles.tableRow}>
                <div>
                  <strong>{v.cliente_nome || 'Cliente não informado'}</strong>
                  <span>{v.descricao}</span>
                </div>
                <div className={styles.tableRight}>
                  <strong style={{ color: 'var(--warning)' }}>{fmt(v.valor)}</strong>
                  {v.data_vencimento && <span>{new Date(v.data_vencimento).toLocaleDateString('pt-BR')}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {relatorio?.por_mes?.length > 0 && (
        <div className={styles.section}>
          <h2>Receita por mês</h2>
          <div className={styles.barChart}>
            {relatorio.por_mes.map(m => {
              const max = Math.max(...relatorio.por_mes.map(x => parseFloat(x.total)));
              const pct = (parseFloat(m.total) / max) * 100;
              return (
                <div key={m.mes} className={styles.barItem}>
                  <span className={styles.barValue}>{fmt(m.total)}</span>
                  <div className={styles.bar} style={{ height: `${pct}%` }} />
                  <span className={styles.barLabel}>{m.mes.slice(5)}/{m.mes.slice(2, 4)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}