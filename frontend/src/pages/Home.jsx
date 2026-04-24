import { Link } from 'react-router-dom';
import { Sprout, ArrowRight, Calculator, Users, TrendingUp, Map, BookOpen, ShoppingBag, CheckCircle, UserPlus, Settings, Store, ChevronDown, ChevronUp, Utensils, Scissors, Sparkles, Hammer, GraduationCap, Heart } from 'lucide-react';
import styles from './Home.module.css';
import { useState } from 'react';

const funcionalidades = [
  { icon: Calculator, titulo: 'Precificação inteligente', desc: 'Coloque o custo dos seus materiais, o tempo que você leva, e a plataforma calcula o preço certo para você não trabalhar no prejuízo.', tag: 'Gestão' },
  { icon: ShoppingBag, titulo: 'Fiado digital', desc: 'Acabou o caderninho. Registre quem deve, quanto deve e quando vence. Gere um alerta de cobrança pelo WhatsApp com um clique.', tag: 'Cobranças' },
  { icon: TrendingUp, titulo: 'Fluxo de caixa simples', desc: 'Anote entradas e saídas do dia sem complicação. Veja seu saldo real e entenda se o negócio está crescendo ou sangrando.', tag: 'Financeiro' },
  { icon: Map, titulo: 'Vitrine no bairro', desc: 'Seu negócio aparece para clientes que estão a até 5km de você. Quem busca bolo, costura, ou serviço de beleza, te encontra.', tag: 'Visibilidade' },
  { icon: Users, titulo: 'Gestão de clientes', desc: 'Histórico completo de cada cliente, o que comprou, quanto deve, e formas de entrar em contato sem precisar procurar em papel.', tag: 'Relacionamento' },
  { icon: BookOpen, titulo: 'Trilha de capacitação', desc: 'Pílulas de conhecimento sobre precificação, formalização MEI, marketing de boca a boca e finanças pessoais para empreendedores.', tag: 'Aprendizado' },
];

const passos = [
  { num: '01', icon: UserPlus, titulo: 'Crie sua conta', desc: 'Cadastro gratuito em menos de 5 minutos. Só nome, email e senha. Sem burocracia.' },
  { num: '02', icon: Settings, titulo: 'Configure seu negócio', desc: 'Adicione seus produtos, capture sua localização e personalize as informações do seu negócio.' },
  { num: '03', icon: Store, titulo: 'Apareça na vitrine', desc: 'Seu negócio fica visível para clientes que buscam serviços perto deles. Você vende, eles encontram.' },
];

const faqs = [
  { pergunta: 'Precisa pagar alguma coisa?', resposta: 'Não. O Cultiva é 100% gratuito. É um projeto de extensão universitária desenvolvido para apoiar microempreendedores.' },
  { pergunta: 'Preciso ser MEI para usar?', resposta: 'Não. O Cultiva funciona para qualquer empreendedor, formal ou informal. A trilha de capacitação inclusive tem um módulo explicando os benefícios de se formalizar como MEI.' },
  { pergunta: 'Meus dados ficam seguros?', resposta: 'Sim. Seus dados financeiros são privados e só você tem acesso. As únicas informações públicas na vitrine são o nome do negócio, categoria, descrição e produtos — tudo que você escolher mostrar.' },
  { pergunta: 'Funciona pelo celular?', resposta: 'Sim. A plataforma funciona no navegador do celular sem precisar instalar nada.' },
  { pergunta: 'Como apareço na vitrine?', resposta: 'Basta cadastrar sua localização no perfil. Depois disso, clientes que buscarem serviços próximos a você vão te encontrar automaticamente.' },
  { pergunta: 'Posso usar sem ter produtos cadastrados?', resposta: 'Sim. Você pode usar o fluxo de caixa, registrar fiados e gerenciar clientes independentemente de ter produtos na vitrine.' },
];

const categorias = [
  { icon: Utensils, label: 'Alimentação' },
  { icon: Sparkles, label: 'Beleza' },
  { icon: Scissors, label: 'Costura' },
  { icon: Hammer, label: 'Artesanato' },
  { icon: GraduationCap, label: 'Educação' },
  { icon: Heart, label: 'Saúde' },
];

export default function Home() {
  const [faqAberto, setFaqAberto] = useState(null);

  return (
    <div className={styles.page}>
      <nav className={styles.nav}>
        <div className={styles.navLogo}>
          <Sprout size={20} />
          <span>Cultiva</span>
        </div>
        <div className={styles.navLinks}>
          <Link to="/vitrine" className={styles.navLink}>Ver vitrine</Link>
          <Link to="/login" className={styles.navLink}>Entrar</Link>
          <Link to="/register" className={styles.navCta}>Começar grátis</Link>
        </div>
      </nav>

      <section className={styles.hero}>
        <div className={styles.heroTag}>Plataforma para microempreendedores</div>
        <h1 className={styles.heroTitle}>
          Seu negócio de<br />
          <em>bairro merece</em><br />
          ferramentas reais.
        </h1>
        <p className={styles.heroDesc}>
          O Cultiva reúne tudo que um pequeno empreendedor precisa: precificação, controle de fiado, fluxo de caixa e uma vitrine para clientes te encontrarem perto de casa.
        </p>
        <div className={styles.heroCtas}>
          <Link to="/register" className={styles.btnPrimary}>
            Criar minha conta grátis <ArrowRight size={16} />
          </Link>
          <Link to="/vitrine" className={styles.btnGhost}>
            Ver negócios perto de mim
          </Link>
        </div>
        <div className={styles.heroStats}>
          <div className={styles.stat}>
            <strong>100%</strong>
            <span>gratuito</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <strong>5 min</strong>
            <span>para cadastrar</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <strong>sem</strong>
            <span>burocracia</span>
          </div>
        </div>
        <div className={styles.heroOrb1} />
        <div className={styles.heroOrb2} />
      </section>

      <section className={styles.problemSection}>
        <div className={styles.problemInner}>
          <div className={styles.problemText}>
            <span className={styles.sectionTag}>O problema</span>
            <h2>A maioria dos pequenos negócios fecha não por falta de talento, mas por falta de gestão.</h2>
            <p>Caderninho de fiado que se perde. Preço chutado. Dinheiro que entra mas some sem explicação. Clientes que não te encontram porque você não tem presença digital. O Cultiva resolve isso.</p>
          </div>
          <div className={styles.problemList}>
            {['Saber exatamente quanto lucrar em cada produto', 'Nunca mais perder um fiado', 'Entender se o mês foi bom ou ruim', 'Ser encontrado por quem está perto'].map((item, i) => (
              <div key={i} className={styles.problemItem}>
                <CheckCircle size={18} color="var(--primary)" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.passosSection}>
        <div className={styles.passosInner}>
          <div className={styles.passosHeader}>
            <span className={styles.sectionTag}>Como funciona</span>
            <h2>Três passos para começar.</h2>
          </div>
          <div className={styles.passosGrid}>
            {passos.map((p, i) => (
              <div key={i} className={styles.passoCard}>
                <div className={styles.passoNum}>{p.num}</div>
                <div className={styles.passoIcon}><p.icon size={22} /></div>
                <h3>{p.titulo}</h3>
                <p>{p.desc}</p>
                {i < passos.length - 1 && <div className={styles.passoSeta}><ArrowRight size={18} /></div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.funcSection}>
        <div className={styles.funcHeader}>
          <span className={styles.sectionTag}>Funcionalidades</span>
          <h2>Tudo que você precisa, nada que não precisa.</h2>
        </div>
        <div className={styles.funcGrid}>
          {funcionalidades.map((f, i) => (
            <div key={i} className={styles.funcCard} style={{ animationDelay: `${i * 0.08}s` }}>
              <div className={styles.funcTop}>
                <div className={styles.funcIcon}><f.icon size={20} /></div>
                <span className={styles.funcTag}>{f.tag}</span>
              </div>
              <h3>{f.titulo}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.categoriasSection}>
        <div className={styles.categoriasInner}>
          <span className={styles.sectionTag}>Vitrine local</span>
          <h2>Encontre negócios de tudo que você precisa.</h2>
          <p>Explore as categorias disponíveis na vitrine e descubra empreendedores do seu bairro.</p>
          <div className={styles.categoriasGrid}>
            {categorias.map((c, i) => (
              <Link to="/vitrine" key={i} className={styles.categoriaCard}>
                <div className={styles.categoriaIcon}><c.icon size={24} /></div>
                <span>{c.label}</span>
              </Link>
            ))}
          </div>
          <Link to="/vitrine" className={styles.btnPrimary} style={{ marginTop: 32, display: 'inline-flex' }}>
            Ver vitrine completa <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <section className={styles.vitrineSection}>
        <div className={styles.vitrineInner}>
          <div className={styles.vitrineText}>
            <span className={styles.sectionTag}>Vitrine local</span>
            <h2>Seu bairro como seu maior cliente.</h2>
            <p>Quando alguém busca um serviço ou produto perto de casa, seu negócio aparece. Sem anúncio pago, sem algoritmo complicado. Só localização e relevância.</p>
            <Link to="/vitrine" className={styles.btnPrimary} style={{ display: 'inline-flex', marginTop: 8 }}>
              Explorar vitrine <ArrowRight size={16} />
            </Link>
          </div>
          <div className={styles.vitrineCard}>
            <div className={styles.vitrineCardHeader}>
              <div className={styles.vitrineAvatar}>M</div>
              <div>
                <strong>Salgados da Maria</strong>
                <span>0.3 km de você</span>
              </div>
            </div>
            <p className={styles.vitrineCardDesc}>Salgados artesanais, bolos e doces para festas e eventos. Encomendas com 2 dias de antecedência.</p>
            <div className={styles.vitrineCardTag}>Alimentação</div>
            <div className={styles.vitrineCardProdutos}>
              <div className={styles.vitrineProduto}><span>Coxinha (dz)</span><strong>R$ 18,00</strong></div>
              <div className={styles.vitrineProduto}><span>Bolo simples</span><strong>R$ 65,00</strong></div>
              <div className={styles.vitrineProduto}><span>Brigadeiro (dz)</span><strong>R$ 22,00</strong></div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.faqSection}>
        <div className={styles.faqInner}>
          <div className={styles.faqHeader}>
            <span className={styles.sectionTag}>Dúvidas frequentes</span>
            <h2>Perguntas e respostas.</h2>
          </div>
          <div className={styles.faqList}>
            {faqs.map((f, i) => (
              <div key={i} className={styles.faqItem}>
                <button className={styles.faqPergunta} onClick={() => setFaqAberto(faqAberto === i ? null : i)}>
                  <span>{f.pergunta}</span>
                  {faqAberto === i ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                {faqAberto === i && (
                  <div className={styles.faqResposta}>{f.resposta}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.ctaSection}>
        <div className={styles.ctaInner}>
          <h2>Pronto para ter controle do seu negócio?</h2>
          <p>Cadastro gratuito. Sem cartão de crédito. Sem letra miúda.</p>
          <Link to="/register" className={styles.btnPrimaryLarge}>
            Começar agora <ArrowRight size={18} />
          </Link>
        </div>
        <div className={styles.ctaOrb} />
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerLogo}>
          <Sprout size={18} />
          <span>Cultiva</span>
        </div>
        <p>2026</p>
        <div className={styles.footerLinks}>
          <Link to="/login">Entrar</Link>
          <Link to="/register">Cadastrar</Link>
          <Link to="/vitrine">Vitrine</Link>
        </div>
      </footer>
    </div>
  );
}