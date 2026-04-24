import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { TrendingUp, TrendingDown, ShoppingBag, Users, DollarSign, AlertCircle, Plus, Package, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import styles from './Dashboard.module.css';

export default function Dashboard() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [saldo, setSaldo] = useState(null);
  const [relatorio, setRelatorio] = useState(null);
  const [pendentes, setPendentes] = useState([]);
  const [resumo, setResumo] = useState({ clientes: 0, produtos: 0, vendas: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregar() {
      try {
        const [s, r, v, c, p] = await Promise.all([
          api.get('/fluxo/saldo'),
          api.get('/vendas/relatorio'),
          api.get('/vendas?status=pendente'),
          api.get('/clientes'),
          api.get('/produtos'),
        ]);
        setSaldo(s.data);
        setRelatorio(r.data);
        setPendentes(v.data);
        setResumo({
          clientes: c.data.length,
          produtos: p.data.length,
          vendas: r.data.resumo?.total_vendas || 0,
        });
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

  const hoje = new Date();
  const vencidos = pendentes.filter(v => v.data_vencimento && new Date(v.data_vencimento) < hoje);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1>Olá, {usuario?.nome_negocio || usuario?.nome || 'empreendedor'}</h1>
          <p>Aqui está um resumo do seu negócio</p>
        </div>
      </div>

      {vencidos.length > 0 && (
        <div className={styles.alerta}>
          <AlertTriangle size={16} />
          <span>Você tem <strong>{vencidos.length} fiado{vencidos.length > 1 ? 's' : ''} vencido{vencidos.length > 1 ? 's' : ''}</strong> que ainda não foram recebidos.</span>
          <button onClick={() => navigate('/dashboard/vendas')} className={styles.alertaBtn}>Ver agora</button>
        </div>
      )}

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

      <div className={styles.acoes}>
        <button className={styles.acao} onClick={() => navigate('/dashboard/vendas')}>
          <div className={styles.acaoIcon}><Plus size={16} /></div>
          <span>Nova venda</span>
        </button>
        <button className={styles.acao} onClick={() => navigate('/dashboard/fluxo')}>
          <div className={styles.acaoIcon}><TrendingUp size={16} /></div>
          <span>Novo lançamento</span>
        </button>
        <button className={styles.acao} onClick={() => navigate('/dashboard/clientes')}>
          <div className={styles.acaoIcon}><Users size={16} /></div>
          <span>Novo cliente</span>
        </button>
        <button className={styles.acao} onClick={() => navigate('/dashboard/produtos')}>
          <div className={styles.acaoIcon}><Package size={16} /></div>
          <span>Novo produto</span>
        </button>
      </div>

      <div className={styles.grid2col}>
        <div className={styles.section}>
          <h2>Visão geral</h2>
          <div className={styles.resumoGrid}>
            <div className={styles.resumoItem} onClick={() => navigate('/dashboard/clientes')}>
              <Users size={20} color="var(--primary)" />
              <strong>{resumo.clientes}</strong>
              <span>Clientes</span>
            </div>
            <div className={styles.resumoItem} onClick={() => navigate('/dashboard/produtos')}>
              <Package size={20} color="var(--primary)" />
              <strong>{resumo.produtos}</strong>
              <span>Produtos</span>
            </div>
            <div className={styles.resumoItem} onClick={() => navigate('/dashboard/vendas')}>
              <ShoppingBag size={20} color="var(--primary)" />
              <strong>{resumo.vendas}</strong>
              <span>Vendas</span>
            </div>
          </div>
        </div>

        {pendentes.length > 0 && (
          <div className={styles.section}>
            <h2>Fiados pendentes</h2>
            <div className={styles.table}>
              {pendentes.slice(0, 5).map(v => {
                const vencido = v.data_vencimento && new Date(v.data_vencimento) < hoje;
                return (
                  <div key={v.id} className={styles.tableRow}>
                    <div>
                      <strong>{v.cliente_nome || 'Cliente não informado'}</strong>
                      <span>{v.descricao || 'Sem descrição'}</span>
                    </div>
                    <div className={styles.tableRight}>
                      <strong style={{ color: 'var(--warning)' }}>{fmt(v.valor)}</strong>
                      {v.data_vencimento && (
                        <span style={{ color: vencido ? 'var(--danger)' : 'var(--text-muted)' }}>
                          {vencido ? 'Vencido ' : ''}{new Date(v.data_vencimento).toLocaleDateString('pt-BR')}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            {pendentes.length > 5 && (
              <button className={styles.verMais} onClick={() => navigate('/dashboard/vendas')}>
                Ver todos ({pendentes.length})
              </button>
            )}
          </div>
        )}
      </div>

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