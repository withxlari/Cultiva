import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { uploadImagem } from '../services/cloudinary';
import { MapPin, Save, CheckCircle, AtSign, Clock, CreditCard, ShoppingBag, Truck, Camera, ImagePlus, Search } from 'lucide-react';
import styles from './Page.module.css';

const categorias = [
  'Alimentação', 'Artesanato', 'Beleza', 'Casa e Decoração', 'Construção e Reformas',
  'Costura', 'Educação', 'Eventos e Festas', 'Mecânica', 'Mercado e Conveniência',
  'Pet Shop', 'Saúde', 'Serviços Gerais', 'Tecnologia e Eletrônicos',
  'Transporte e Frete', 'Vestuário e Moda', 'Outros'
];

function formatarCep(v) {
  return v.replace(/\D/g, '').slice(0, 8).replace(/(\d{5})(\d)/, '$1-$2');
}

export default function Perfil() {
  const [form, setForm] = useState({
    nome: '', nome_negocio: '', descricao_negocio: '', categoria: '',
    telefone: '', endereco_texto: '', latitude: '', longitude: '',
    instagram: '', horario_funcionamento: '', formas_pagamento: '',
    aceita_encomenda: false, entrega_bairro: false,
    logo_url: '', capa_url: '',
  });

  const [endereco, setEndereco] = useState({
    cep: '', logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '',
  });

  const [loading, setLoading] = useState(false);
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [geocodificando, setGeocodificando] = useState(false);
  const [uploadandoLogo, setUploadandoLogo] = useState(false);
  const [uploadandoCapa, setUploadandoCapa] = useState(false);
  const [sucesso, setSucesso] = useState('');
  const [erro, setErro] = useState('');
  const [erroEnd, setErroEnd] = useState('');
  const logoRef = useRef();
  const capaRef = useRef();

  useEffect(() => {
    async function carregar() {
      const { data } = await api.get('/auth/me');
      setForm({
        nome: data.nome || '',
        nome_negocio: data.nome_negocio || '',
        descricao_negocio: data.descricao_negocio || '',
        categoria: data.categoria || '',
        telefone: data.telefone || '',
        endereco_texto: data.endereco_texto || '',
        latitude: data.latitude || '',
        longitude: data.longitude || '',
        instagram: data.instagram || '',
        horario_funcionamento: data.horario_funcionamento || '',
        formas_pagamento: data.formas_pagamento || '',
        aceita_encomenda: data.aceita_encomenda || false,
        entrega_bairro: data.entrega_bairro || false,
        logo_url: data.logo_url || '',
        capa_url: data.capa_url || '',
      });
    }
    carregar();
  }, []);

  async function buscarCep(cepRaw) {
    const cep = cepRaw.replace(/\D/g, '');
    if (cep.length !== 8) return;
    setBuscandoCep(true);
    setErroEnd('');
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await res.json();
      if (data.erro) {
        setErroEnd('CEP não encontrado.');
        return;
      }
      setEndereco(e => ({
        ...e,
        logradouro: data.logradouro || '',
        bairro: data.bairro || '',
        cidade: data.localidade || '',
        estado: data.uf || '',
      }));
    } catch {
      setErroEnd('Erro ao buscar CEP. Tente novamente.');
    } finally {
      setBuscandoCep(false);
    }
  }

  async function nominatimBuscar(q) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=BR&q=${encodeURIComponent(q)}`;
    const res = await fetch(url, { headers: { 'Accept-Language': 'pt-BR', 'User-Agent': 'CultivaApp/1.0' } });
    const data = await res.json();
    return data && data.length > 0 ? data[0] : null;
  }

  async function geocodificarEndereco() {
    const { cep, logradouro, numero, bairro, cidade, estado } = endereco;
    if (!logradouro || !cidade) {
      setErroEnd('Preencha pelo menos o logradouro e cidade antes de confirmar.');
      return;
    }
    setGeocodificando(true);
    setErroEnd('');

    const enderecoCompleto = [logradouro, numero, bairro, cidade, estado].filter(Boolean).join(', ');

    try {
      let resultado = null;

      resultado = await nominatimBuscar(`${logradouro}, ${numero}, ${bairro}, ${cidade}, ${estado}`);

      if (!resultado) {
        resultado = await nominatimBuscar(`${logradouro}, ${cidade}, ${estado}`);
      }

      if (!resultado) {
        resultado = await nominatimBuscar(`${bairro}, ${cidade}, ${estado}`);
      }

      if (!resultado && cep) {
        const cepLimpo = cep.replace(/\D/g, '');
        const resCep = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
        const dadosCep = await resCep.json();
        if (!dadosCep.erro) {
          resultado = await nominatimBuscar(`${dadosCep.logradouro}, ${dadosCep.localidade}, ${dadosCep.uf}`);
        }
      }

      if (!resultado) {
        setErroEnd('Não foi possível localizar este endereço. Verifique se o logradouro e cidade estão corretos.');
        return;
      }

      confirmarEndereco(resultado.lat, resultado.lon, enderecoCompleto);
    } catch {
      setErroEnd('Erro ao buscar coordenadas. Verifique sua conexão e tente novamente.');
    } finally {
      setGeocodificando(false);
    }
  }

  function confirmarEndereco(lat, lon, enderecoCompleto) {
    setForm(f => ({
      ...f,
      latitude: parseFloat(lat),
      longitude: parseFloat(lon),
      endereco_texto: enderecoCompleto,
    }));
    setErroEnd('');
    setSucesso('Endereço localizado com sucesso!');
    setTimeout(() => setSucesso(''), 3000);
  }

  async function handleUploadLogo(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploadandoLogo(true);
    try {
      const url = await uploadImagem(file);
      setForm(f => ({ ...f, logo_url: url }));
    } catch {
      setErro('Erro ao fazer upload da logo.');
    } finally {
      setUploadandoLogo(false);
    }
  }

  async function handleUploadCapa(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploadandoCapa(true);
    try {
      const url = await uploadImagem(file);
      setForm(f => ({ ...f, capa_url: url }));
    } catch {
      setErro('Erro ao fazer upload da capa.');
    } finally {
      setUploadandoCapa(false);
    }
  }

  async function salvar(e) {
    e.preventDefault();
    setLoading(true);
    setErro('');
    try {
      await api.put('/auth/me', form);
      setSucesso('Perfil atualizado com sucesso.');
      setTimeout(() => setSucesso(''), 3000);
    } catch (err) {
      setErro(err.response?.data?.error || 'Erro ao salvar.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1>Meu Perfil</h1>
          <p>Informações do seu negócio e localização</p>
        </div>
      </div>

      {sucesso && <div className={styles.sucesso}>{sucesso}</div>}
      {erro && <div className={styles.erroMsg}>{erro}</div>}

      <form onSubmit={salvar}>
        <div className={styles.perfilGrid}>

          <div className={styles.perfilCard}>
            <h2 className={styles.perfilSecao}>Imagens da loja</h2>
            <div className={styles.imagensLoja}>
              <div className={styles.capaWrap}>
                {form.capa_url
                  ? <img src={form.capa_url} alt="Capa" className={styles.capaImg} />
                  : <div className={styles.capaPlaceholder}><ImagePlus size={24} /><span>Foto de capa</span></div>
                }
                <button type="button" className={styles.btnUploadCapa} onClick={() => capaRef.current.click()} disabled={uploadandoCapa}>
                  <Camera size={14} /> {uploadandoCapa ? 'Enviando...' : 'Alterar capa'}
                </button>
                <input ref={capaRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleUploadCapa} />
              </div>
              <div className={styles.logoWrap}>
                {form.logo_url
                  ? <img src={form.logo_url} alt="Logo" className={styles.logoImg} />
                  : <div className={styles.logoPlaceholder}><Camera size={20} /></div>
                }
                <button type="button" className={styles.btnUploadLogo} onClick={() => logoRef.current.click()} disabled={uploadandoLogo}>
                  {uploadandoLogo ? 'Enviando...' : 'Alterar logo'}
                </button>
                <input ref={logoRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleUploadLogo} />
              </div>
            </div>
          </div>

          <div className={styles.perfilCard}>
            <h2 className={styles.perfilSecao}>Dados pessoais</h2>
            <div className={styles.field}>
              <label>Seu nome</label>
              <input value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} required />
            </div>
            <div className={styles.field}>
              <label>Telefone (WhatsApp)</label>
              <input value={form.telefone} onChange={e => setForm({ ...form, telefone: e.target.value })} placeholder="(11) 99999-9999" />
            </div>
          </div>

          <div className={styles.perfilCard}>
            <h2 className={styles.perfilSecao}>Dados do negócio</h2>
            <div className={styles.field}>
              <label>Nome do negócio</label>
              <input value={form.nome_negocio} onChange={e => setForm({ ...form, nome_negocio: e.target.value })} />
            </div>
            <div className={styles.field}>
              <label>Categoria</label>
              <select value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })}>
                <option value="">Selecione...</option>
                {categorias.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className={styles.field}>
              <label>Descrição</label>
              <textarea value={form.descricao_negocio} onChange={e => setForm({ ...form, descricao_negocio: e.target.value })} rows={3} placeholder="Descreva seu negócio para aparecer na vitrine..." />
            </div>
          </div>

          <div className={styles.perfilCard}>
            <h2 className={styles.perfilSecao}>Presença e contato</h2>
            <div className={styles.field}>
              <label><AtSign size={14} style={{ display: 'inline', marginRight: 4 }} />Instagram</label>
              <input value={form.instagram} onChange={e => setForm({ ...form, instagram: e.target.value })} placeholder="@seunegocio" />
            </div>
            <div className={styles.field}>
              <label><Clock size={14} style={{ display: 'inline', marginRight: 4 }} />Horário de funcionamento</label>
              <input value={form.horario_funcionamento} onChange={e => setForm({ ...form, horario_funcionamento: e.target.value })} placeholder="Ex: Seg-Sex 8h às 18h, Sáb 8h às 13h" />
            </div>
            <div className={styles.field}>
              <label><CreditCard size={14} style={{ display: 'inline', marginRight: 4 }} />Formas de pagamento</label>
              <input value={form.formas_pagamento} onChange={e => setForm({ ...form, formas_pagamento: e.target.value })} placeholder="Ex: Pix, dinheiro, cartão de débito" />
            </div>
            <div className={styles.perfilChecks}>
              <label className={styles.checkLabel}>
                <input type="checkbox" checked={form.aceita_encomenda} onChange={e => setForm({ ...form, aceita_encomenda: e.target.checked })} />
                <ShoppingBag size={14} /> Aceita encomenda
              </label>
              <label className={styles.checkLabel}>
                <input type="checkbox" checked={form.entrega_bairro} onChange={e => setForm({ ...form, entrega_bairro: e.target.checked })} />
                <Truck size={14} /> Faz entrega no bairro
              </label>
            </div>
          </div>

          <div className={styles.perfilCard}>
            <h2 className={styles.perfilSecao}>Localização</h2>
            <p className={styles.perfilDica}>Preencha o endereço completo para aparecer corretamente na vitrine.</p>

            {erroEnd && <div className={styles.erroMsg} style={{ marginBottom: 12 }}>{erroEnd}</div>}

            <div className={styles.enderecoGrid}>
              <div className={styles.field} style={{ gridColumn: '1 / 2' }}>
                <label>CEP</label>
                <div style={{ position: 'relative' }}>
                  <input
                    value={endereco.cep}
                    onChange={e => {
                      const v = formatarCep(e.target.value);
                      setEndereco(en => ({ ...en, cep: v }));
                      if (v.replace(/\D/g, '').length === 8) buscarCep(v);
                    }}
                    placeholder="00000-000"
                    maxLength={9}
                    style={{ paddingRight: 36 }}
                  />
                  {buscandoCep && (
                    <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: 'var(--text-muted)' }}>
                      Buscando...
                    </span>
                  )}
                </div>
              </div>

              <div className={styles.field} style={{ gridColumn: '1 / -1' }}>
                <label>Logradouro</label>
                <input
                  value={endereco.logradouro}
                  onChange={e => setEndereco(en => ({ ...en, logradouro: e.target.value }))}
                  placeholder="Rua, Avenida, Travessa..."
                />
              </div>

              <div className={styles.field}>
                <label>Número</label>
                <input
                  value={endereco.numero}
                  onChange={e => setEndereco(en => ({ ...en, numero: e.target.value }))}
                  placeholder="123"
                />
              </div>

              <div className={styles.field}>
                <label>Complemento</label>
                <input
                  value={endereco.complemento}
                  onChange={e => setEndereco(en => ({ ...en, complemento: e.target.value }))}
                  placeholder="Apto, Sala, Loja..."
                />
              </div>

              <div className={styles.field}>
                <label>Bairro</label>
                <input
                  value={endereco.bairro}
                  onChange={e => setEndereco(en => ({ ...en, bairro: e.target.value }))}
                  placeholder="Nome do bairro"
                />
              </div>

              <div className={styles.field}>
                <label>Cidade</label>
                <input
                  value={endereco.cidade}
                  onChange={e => setEndereco(en => ({ ...en, cidade: e.target.value }))}
                  placeholder="São Paulo"
                />
              </div>

              <div className={styles.field} style={{ gridColumn: '1 / 2' }}>
                <label>Estado</label>
                <input
                  value={endereco.estado}
                  onChange={e => setEndereco(en => ({ ...en, estado: e.target.value }))}
                  placeholder="SP"
                  maxLength={2}
                  style={{ textTransform: 'uppercase' }}
                />
              </div>
            </div>

            <button
              type="button"
              className={styles.btnLocalizacao}
              onClick={geocodificarEndereco}
              disabled={geocodificando || !endereco.logradouro}
              style={{ marginTop: 8 }}
            >
              <Search size={16} />
              {geocodificando ? 'Buscando localização...' : 'Confirmar endereço e buscar localização'}
            </button>

            {form.latitude && (
              <div className={styles.coordsInfo}>
                <CheckCircle size={14} color="var(--success)" />
                <span>
                  Localização confirmada: {parseFloat(form.latitude).toFixed(4)}, {parseFloat(form.longitude).toFixed(4)}
                </span>
              </div>
            )}

            {form.endereco_texto && (
              <div className={styles.coordsInfo} style={{ marginTop: 4 }}>
                <MapPin size={14} color="var(--primary)" />
                <span style={{ fontSize: 12 }}>{form.endereco_texto}</span>
              </div>
            )}
          </div>

        </div>

        <div className={styles.perfilFooter}>
          <button type="submit" className={styles.btn} disabled={loading}>
            <Save size={16} />
            {loading ? 'Salvando...' : 'Salvar perfil'}
          </button>
        </div>
      </form>
    </div>
  );
}