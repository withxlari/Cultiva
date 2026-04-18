import { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Pencil, Trash2, Calculator, Eye, EyeOff } from 'lucide-react';
import styles from './Page.module.css';

const categorias = ['Alimentação', 'Beleza', 'Costura', 'Artesanato', 'Serviços Gerais', 'Educação', 'Saúde', 'Outros'];

const formInicial = { nome: '', descricao: '', preco_custo: '', margem_lucro: 30, preco_venda: '', categoria: '', visivel_vitrine: true };

export default function Produtos() {
  const [produtos, setProdutos] = useState([]);
  const [form, setForm] = useState(formInicial);
  const [editando, setEditando] = useState(null);
  const [modal, setModal] = useState(false);
  const [calculadora, setCalculadora] = useState(false);
  const [calc, setCalc] = useState({ insumos: [{ nome: '', custo: '', quantidade: 1 }], tempo_horas: '', valor_hora: '', margem_lucro: 30 });
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { carregar(); }, []);

  async function carregar() {
    const { data } = await api.get('/produtos');
    setProdutos(data);
  }

  async function salvar(e) {
    e.preventDefault();
    setLoading(true);
    try {
      if (editando) {
        await api.put(`/produtos/${editando}`, form);
      } else {
        await api.post('/produtos', form);
      }
      setModal(false);
      setForm(formInicial);
      setEditando(null);
      carregar();
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao salvar.');
    } finally {
      setLoading(false);
    }
  }

  async function deletar(id) {
    if (!confirm('Remover produto?')) return;
    await api.delete(`/produtos/${id}`);
    carregar();
  }

  function editar(p) {
    setForm({ nome: p.nome, descricao: p.descricao || '', preco_custo: p.preco_custo, margem_lucro: p.margem_lucro, preco_venda: p.preco_venda, categoria: p.categoria || '', visivel_vitrine: p.visivel_vitrine });
    setEditando(p.id);
    setModal(true);
  }

  async function calcular() {
    const { data } = await api.post('/produtos/calcular-preco', calc);
    setResultado(data);
  }

  function usarResultado() {
    setForm(f => ({ ...f, preco_custo: resultado.custo_total, preco_venda: resultado.preco_sugerido, margem_lucro: calc.margem_lucro }));
    setCalculadora(false);
    setModal(true);
  }

  const fmt = (v) => `R$ ${parseFloat(v || 0).toFixed(2).replace('.', ',')}`;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1>Produtos e Serviços</h1>
          <p>Gerencie o que você vende</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className={styles.btnSecondary} onClick={() => setCalculadora(true)}>
            <Calculator size={16} /> Calculadora
          </button>
          <button className={styles.btn} onClick={() => { setModal(true); setForm(formInicial); setEditando(null); }}>
            <Plus size={16} /> Novo produto
          </button>
        </div>
      </div>

      <div className={styles.grid}>
        {produtos.map(p => (
          <div key={p.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.badge}>{p.categoria || 'Sem categoria'}</span>
              <div style={{ display: 'flex', gap: 4 }}>
                <button className={styles.iconBtn} onClick={() => editar(p)}><Pencil size={14} /></button>
                <button className={`${styles.iconBtn} ${styles.danger}`} onClick={() => deletar(p.id)}><Trash2 size={14} /></button>
              </div>
            </div>
            <h3 className={styles.cardTitle}>{p.nome}</h3>
            {p.descricao && <p className={styles.cardDesc}>{p.descricao}</p>}
            <div className={styles.cardFooter}>
              <strong className={styles.preco}>{fmt(p.preco_venda)}</strong>
              <span className={styles.vitrine}>{p.visivel_vitrine ? <Eye size={14} /> : <EyeOff size={14} />}</span>
            </div>
          </div>
        ))}
        {produtos.length === 0 && <p className={styles.empty}>Nenhum produto cadastrado ainda.</p>}
      </div>

      {modal && (
        <div className={styles.overlay} onClick={() => setModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h2>{editando ? 'Editar produto' : 'Novo produto'}</h2>
            <form onSubmit={salvar} className={styles.form}>
              <div className={styles.field}>
                <label>Nome</label>
                <input value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} required />
              </div>
              <div className={styles.field}>
                <label>Descrição</label>
                <textarea value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} rows={2} />
              </div>
              <div className={styles.grid2}>
                <div className={styles.field}>
                  <label>Custo (R$)</label>
                  <input type="number" step="0.01" value={form.preco_custo} onChange={e => setForm({ ...form, preco_custo: e.target.value })} />
                </div>
                <div className={styles.field}>
                  <label>Margem (%)</label>
                  <input type="number" value={form.margem_lucro} onChange={e => setForm({ ...form, margem_lucro: e.target.value })} />
                </div>
              </div>
              <div className={styles.grid2}>
                <div className={styles.field}>
                  <label>Preço de venda (R$)</label>
                  <input type="number" step="0.01" value={form.preco_venda} onChange={e => setForm({ ...form, preco_venda: e.target.value })} required />
                </div>
                <div className={styles.field}>
                  <label>Categoria</label>
                  <select value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })}>
                    <option value="">Selecione...</option>
                    {categorias.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <label className={styles.checkLabel}>
                <input type="checkbox" checked={form.visivel_vitrine} onChange={e => setForm({ ...form, visivel_vitrine: e.target.checked })} />
                Visível na vitrine pública
              </label>
              <div className={styles.modalFooter}>
                <button type="button" className={styles.btnSecondary} onClick={() => setModal(false)}>Cancelar</button>
                <button type="submit" className={styles.btn} disabled={loading}>{loading ? 'Salvando...' : 'Salvar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {calculadora && (
        <div className={styles.overlay} onClick={() => setCalculadora(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h2>Calculadora de preço</h2>
            <div className={styles.form}>
              <label style={{ fontSize: 13, fontWeight: 600 }}>Insumos</label>
              {calc.insumos.map((ins, i) => (
                <div key={i} className={styles.grid3}>
                  <input placeholder="Nome" value={ins.nome} onChange={e => { const n = [...calc.insumos]; n[i].nome = e.target.value; setCalc({ ...calc, insumos: n }); }} />
                  <input placeholder="Custo R$" type="number" step="0.01" value={ins.custo} onChange={e => { const n = [...calc.insumos]; n[i].custo = e.target.value; setCalc({ ...calc, insumos: n }); }} />
                  <input placeholder="Qtd" type="number" value={ins.quantidade} onChange={e => { const n = [...calc.insumos]; n[i].quantidade = e.target.value; setCalc({ ...calc, insumos: n }); }} />
                </div>
              ))}
              <button type="button" className={styles.btnSecondary} onClick={() => setCalc({ ...calc, insumos: [...calc.insumos, { nome: '', custo: '', quantidade: 1 }] })}>
                + Adicionar insumo
              </button>
              <div className={styles.grid2}>
                <div className={styles.field}>
                  <label>Horas trabalhadas</label>
                  <input type="number" step="0.5" value={calc.tempo_horas} onChange={e => setCalc({ ...calc, tempo_horas: e.target.value })} />
                </div>
                <div className={styles.field}>
                  <label>Valor por hora (R$)</label>
                  <input type="number" step="0.01" value={calc.valor_hora} onChange={e => setCalc({ ...calc, valor_hora: e.target.value })} />
                </div>
              </div>
              <div className={styles.field}>
                <label>Margem de lucro (%)</label>
                <input type="number" value={calc.margem_lucro} onChange={e => setCalc({ ...calc, margem_lucro: e.target.value })} />
              </div>
              <button className={styles.btn} onClick={calcular}>Calcular</button>
              {resultado && (
                <div className={styles.resultado}>
                  <div className={styles.resultRow}><span>Custo insumos</span><strong>R$ {resultado.custo_insumos}</strong></div>
                  <div className={styles.resultRow}><span>Custo mão de obra</span><strong>R$ {resultado.custo_tempo}</strong></div>
                  <div className={styles.resultRow}><span>Custo total</span><strong>R$ {resultado.custo_total}</strong></div>
                  <div className={`${styles.resultRow} ${styles.resultDestaque}`}><span>Preço sugerido</span><strong>R$ {resultado.preco_sugerido}</strong></div>
                  <div className={styles.resultRow}><span>Lucro estimado</span><strong style={{ color: 'var(--success)' }}>R$ {resultado.lucro_estimado}</strong></div>
                  <button className={styles.btn} onClick={usarResultado}>Usar esse preço</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}