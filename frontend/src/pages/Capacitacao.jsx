import { useState, useEffect } from 'react';
import api from '../services/api';
import { BookOpen, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import styles from './Page.module.css';

const categoriasLabel = { financas: 'Finanças', gestao: 'Gestão', marketing: 'Marketing', formalizacao: 'Formalização' };

const getYouTubeEmbedUrl = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
};

export default function Capacitacao() {
  const [conteudos, setConteudos] = useState([]);
  const [aberto, setAberto] = useState(null);
  const [seeded, setSeeded] = useState(false);

  useEffect(() => { carregar(); }, []);

  async function carregar() {
    const { data } = await api.get('/capacitacao');
    setConteudos(data);
  }

  async function seed() {
    await api.post('/capacitacao/seed');
    setSeeded(true);
    carregar();
  }

  const grupos = conteudos.reduce((acc, c) => {
    const cat = c.categoria || 'outros';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(c);
    return acc;
  }, {});

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1>Trilha de Capacitação</h1>
          <p>Pílulas de conhecimento para seu negócio crescer</p>
        </div>
        {conteudos.length === 0 && !seeded && (
          <button className={styles.btn} onClick={seed}>Carregar conteúdos</button>
        )}
      </div>

      {conteudos.length === 0 && (
        <div className={styles.empty} style={{ marginTop: 40 }}>
          Clique em "Carregar conteúdos" para ver os materiais disponíveis.
        </div>
      )}

      {Object.entries(grupos).map(([cat, items]) => (
        <div key={cat} className={styles.section}>
          <h2 className={styles.catTitle}>{categoriasLabel[cat] || cat}</h2>
          <div className={styles.accordion}>
            {items.map(c => (
              <div key={c.id} className={styles.accordionItem}>
                <button className={styles.accordionHeader} onClick={() => setAberto(aberto === c.id ? null : c.id)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <BookOpen size={16} color="var(--primary)" />
                    <span>{c.titulo}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: 12 }}>
                    {c.duracao_minutos && <span><Clock size={12} /> {c.duracao_minutos} min</span>}
                    {aberto === c.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </button>
                
                {aberto === c.id && (
                  <div className={styles.accordionBody}>
                    {c.descricao && <p className={styles.acordDesc} style={{ marginBottom: '16px' }}>{c.descricao}</p>}
                    
                    {c.url_video && getYouTubeEmbedUrl(c.url_video) && (
                      <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '8px', marginBottom: '16px' }}>
                        <iframe
                          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                          src={getYouTubeEmbedUrl(c.url_video)}
                          title={c.titulo}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      </div>
                    )}

                    {c.conteudo && <p className={styles.conteudoTexto}>{c.conteudo}</p>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}