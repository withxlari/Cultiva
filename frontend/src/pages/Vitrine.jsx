import { useState, useEffect } from 'react';
import api from '../services/api';
import { MapPin, Search, Phone, Package, X, AtSign, Clock, CreditCard, ShoppingBag, Truck } from 'lucide-react';
import styles from './Vitrine.module.css';

function ModalNegocio({ negocio, onClose, fmt }) {
  useEffect(() => {
    function handleKey(e) { if (e.key === 'Escape') onClose(); }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalBox} onClick={e => e.stopPropagation()}>
        <button className={styles.modalClose} onClick={onClose}><X size={20} /></button>

        <div className={styles.modalHeader}>
          <div className={styles.modalAvatar}>{(negocio.nome_negocio || '?').charAt(0)}</div>
          <div>
            <h2>{negocio.nome_negocio || 'Negócio'}</h2>
            <div className={styles.modalMeta}>
              {negocio.categoria && <span className={styles.badge}>{negocio.categoria}</span>}
              {negocio.distancia_km && (
                <span className={styles.distancia}><MapPin size={12} /> {parseFloat(negocio.distancia_km).toFixed(1)} km</span>
              )}
            </div>
          </div>
        </div>

        <div className={styles.modalTags}>
          {negocio.aceita_encomenda && (
            <span className={styles.tag}><ShoppingBag size={12} /> Aceita encomenda</span>
          )}
          {negocio.entrega_bairro && (
            <span className={styles.tag}><Truck size={12} /> Entrega no bairro</span>
          )}
        </div>

        {negocio.descricao_negocio && (
          <p className={styles.modalDesc}>{negocio.descricao_negocio}</p>
        )}

        <div className={styles.modalInfos}>
          {negocio.horario_funcionamento && (
            <div className={styles.modalInfo}>
              <Clock size={14} />
              <span>{negocio.horario_funcionamento}</span>
            </div>
          )}
          {negocio.formas_pagamento && (
            <div className={styles.modalInfo}>
              <CreditCard size={14} />
              <span>{negocio.formas_pagamento}</span>
            </div>
          )}
          {negocio.endereco_texto && (
            <div className={styles.modalInfo}>
              <MapPin size={14} />
              <span>{negocio.endereco_texto}</span>
            </div>
          )}
        </div>

        <div className={styles.modalContatos}>
          {negocio.telefone && (
            <a href={`https://wa.me/55${negocio.telefone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className={styles.btnWhatsapp}>
              <Phone size={15} /> Chamar no WhatsApp
            </a>
          )}
          {negocio.instagram && (
            <a href={`https://instagram.com/${negocio.instagram.replace('@', '')}`} target="_blank" rel="noreferrer" className={styles.btnInstagram}>
              <AtSign size={15} /> {negocio.instagram.startsWith('@') ? negocio.instagram : `@${negocio.instagram}`}
            </a>
          )}
        </div>

        {negocio.produtos && negocio.produtos.length > 0 && (
          <div className={styles.modalProdutos}>
            <h3>Produtos e Serviços</h3>
            <div className={styles.produtosGrid}>
              {negocio.produtos.map(p => (
                <div key={p.id} className={styles.produtoCard}>
                  {p.imagem_url ? (
                    <img src={p.imagem_url} alt={p.nome} className={styles.produtoImg} onError={e => { e.target.style.display = 'none'; }} />
                  ) : (
                    <div className={styles.produtoImgPlaceholder}><Package size={20} /></div>
                  )}
                  <div className={styles.produtoInfo}>
                    <strong>{p.nome}</strong>
                    {p.descricao && <span>{p.descricao}</span>}
                    <strong className={styles.produtoPreco}>{fmt(p.preco_venda)}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Vitrine() {
  const [negocios, setNegocios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [busca, setBusca] = useState('');
  const [raio, setRaio] = useState(3);
  const [coords, setCoords] = useState(null);
  const [localizando, setLocalizando] = useState(false);
  const [negocioSel, setNegocioSel] = useState(null);

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
          <div key={n.id} className={styles.card} onClick={() => setNegocioSel(n)}>
            <div className={styles.cardTop}>
              <div className={styles.avatar}>{(n.nome_negocio || '?').charAt(0)}</div>
              <div>
                <h3>{n.nome_negocio || 'Negócio'}</h3>
                <span className={styles.distancia}><MapPin size={12} /> {parseFloat(n.distancia_km).toFixed(1)} km</span>
              </div>
            </div>
            {n.descricao_negocio && <p className={styles.desc}>{n.descricao_negocio}</p>}
            <div className={styles.cardBottom}>
              {n.categoria && <span className={styles.badge}>{n.categoria}</span>}
              <div className={styles.cardTags}>
                {n.aceita_encomenda && <span className={styles.tagSmall}>Encomenda</span>}
                {n.entrega_bairro && <span className={styles.tagSmall}>Entrega</span>}
              </div>
            </div>
            {n.produtos && n.produtos.length > 0 && (
              <div className={styles.produtos}>
                <span className={styles.produtosTitle}><Package size={13} /> {n.produtos.length} produto{n.produtos.length > 1 ? 's' : ''}</span>
              </div>
            )}
            <span className={styles.verMais}>Ver perfil completo →</span>
          </div>
        ))}
        {coords && !loading && negocios.length === 0 && (
          <p className={styles.empty}>Nenhum negócio encontrado nesse raio.</p>
        )}
      </div>

      {negocioSel && (
        <ModalNegocio negocio={negocioSel} onClose={() => setNegocioSel(null)} fmt={fmt} />
      )}
    </div>
  );
}