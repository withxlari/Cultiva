import { useState, useEffect } from 'react';
import api from '../services/api';
import { MapPin, Search, Phone, Package } from 'lucide-react';
import styles from './Vitrine.module.css';

export default function Vitrine() {
  const [negocios, setNegocios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [busca, setBusca] = useState('');
  const [raio, setRaio] = useState(3);
  const [coords, setCoords] = useState(null);
  const [localizando, setLocalizando] = useState(false);

  function localizarMe() {
    setLocalizando(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocalizando(false);
      },
      () => {
        setErro('Não foi possível obter sua localização.');
        setLocalizando(false);
      }
    );
  }

  useEffect(() => {
    if (coords) buscarNegocios();
  }, [coords, raio]);

  async function buscarNegocios() {
    setLoading(true);
    setErro('');
    try {
      const { data } = await api.get(`/vitrine?lat=${coords.lat}&lng=${coords.lng}&raio_km=${raio}${busca ? `&busca=${busca}` : ''}`);
      setNegocios(data);
    } catch {
      setErro('Erro ao buscar negócios.');
    } finally {
      setLoading(false);
    }
  }

  const fmt = (v) => `R$ ${parseFloat(v || 0).toFixed(2).replace('.', ',')}`;

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <h1>Compre do seu bairro</h1>
        <p>Descubra negócios e empreendedores perto de você</p>
      </div>

      <div className={styles.searchBox}>
        <div className={styles.searchRow}>
          <div className={styles.searchInput}>
            <Search size={16} />
            <input placeholder="Buscar produto ou serviço..." value={busca} onChange={e => setBusca(e.target.value)} onKeyDown={e => e.key === 'Enter' && coords && buscarNegocios()} />
          </div>
          <select value={raio} onChange={e => setRaio(e.target.value)} className={styles.raioSelect}>
            <option value={1}>1 km</option>
            <option value={2}>2 km</option>
            <option value={3}>3 km</option>
            <option value={5}>5 km</option>
          </select>
          <button className={styles.btn} onClick={localizarMe} disabled={localizando}>
            <MapPin size={16} /> {localizando ? 'Localizando...' : 'Usar minha localização'}
          </button>
        </div>
        {coords && (
          <button className={styles.btnSecondary} onClick={buscarNegocios} disabled={loading}>
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
        )}
      </div>

      {erro && <p className={styles.erro}>{erro}</p>}

      {!coords && !erro && (
        <div className={styles.placeholder}>
          <MapPin size={48} color="var(--border)" />
          <p>Clique em "Usar minha localização" para ver negócios próximos a você</p>
        </div>
      )}

      <div className={styles.grid}>
        {negocios.map(n => (
          <div key={n.id} className={styles.card}>
            <div className={styles.cardTop}>
              <div className={styles.avatar}>{(n.nome_negocio || '?').charAt(0)}</div>
              <div>
                <h3>{n.nome_negocio || 'Negócio'}</h3>
                <span className={styles.distancia}><MapPin size={12} /> {parseFloat(n.distancia_km).toFixed(1)} km</span>
              </div>
            </div>
            {n.descricao_negocio && <p className={styles.desc}>{n.descricao_negocio}</p>}
            {n.categoria && <span className={styles.badge}>{n.categoria}</span>}
            {n.telefone && (
              <a href={`https://wa.me/55${n.telefone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className={styles.contato}>
                <Phone size={13} /> {n.telefone}
              </a>
            )}
            {n.produtos && n.produtos.length > 0 && (
              <div className={styles.produtos}>
                <span className={styles.produtosTitle}><Package size={13} /> Produtos</span>
                {n.produtos.slice(0, 3).map(p => (
                  <div key={p.id} className={styles.produtoItem}>
                    <span>{p.nome}</span>
                    <strong>{fmt(p.preco_venda)}</strong>
                  </div>
                ))}
                {n.produtos.length > 3 && <span className={styles.mais}>+{n.produtos.length - 3} mais</span>}
              </div>
            )}
          </div>
        ))}
        {coords && !loading && negocios.length === 0 && (
          <p className={styles.empty}>Nenhum negócio encontrado nesse raio.</p>
        )}
      </div>
    </div>
  );
}