import pool from '../db/pool.js';

function calcularDistancia(lat1, lon1, lat2, lon2) {
  const p = 0.017453292519943295;
  const c = Math.cos;
  const a = 0.5 - c((lat2 - lat1) * p) / 2 + c(lat1 * p) * c(lat2 * p) * (1 - c((lon2 - lon1) * p)) / 2;
  return 12742 * Math.asin(Math.sqrt(a));
}

function normalizarTexto(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

const traducoes = {
  bakery: 'Padaria',
  supermarket: 'Supermercado',
  convenience: 'Mercado',
  grocery: 'Mercearia',
  restaurant: 'Restaurante',
  fast_food: 'Lanchonete',
  cafe: 'Cafeteria',
  hairdresser: 'Salão de Beleza',
  barber: 'Barbearia',
  beauty: 'Estética',
  pharmacy: 'Farmácia',
  clothes: 'Loja de Roupas',
  tailor: 'Costura',
  pet: 'Pet Shop',
  car_repair: 'Mecânica',
  butcher: 'Açougue',
  greengrocer: 'Hortifruti',
  electronics: 'Eletrônicos',
  mobile_phone: 'Celular',
  computer: 'Informática',
  furniture: 'Móveis',
  hardware: 'Ferragens',
  doityourself: 'Material de Construção',
  veterinary: 'Veterinária',
  dentist: 'Dentista',
  doctors: 'Médico',
  clinic: 'Clínica',
  laundry: 'Lavanderia',
  school: 'Escola',
  gift: 'Presentes',
  jewelry: 'Joalheria',
  shoes: 'Calçados',
};

const dicionarioOsm = {
  alimentacao: ['amenity~"restaurant|cafe|fast_food|food_court"'],
  restaurante: ['amenity=restaurant'],
  padaria: ['shop=bakery'],
  panificadora: ['shop=bakery'],
  pao: ['shop=bakery'],
  lanchonete: ['amenity=fast_food'],
  pastel: ['amenity=fast_food'],
  pizzaria: ['amenity=restaurant'],
  cafe: ['amenity=cafe'],
  cafeteria: ['amenity=cafe'],
  comida: ['amenity~"restaurant|fast_food|food_court"'],
  beleza: ['shop~"hairdresser|beauty|barber|cosmetics"'],
  salao: ['shop=hairdresser'],
  cabeleireiro: ['shop=hairdresser'],
  estetica: ['shop=beauty'],
  manicure: ['shop=beauty'],
  barbearia: ['shop=barber'],
  barbeiro: ['shop=barber'],
  costura: ['craft=tailor'],
  costureira: ['craft=tailor'],
  mecanica: ['shop=car_repair'],
  oficina: ['shop=car_repair'],
  mecanico: ['shop=car_repair'],
  mercado: ['shop~"supermarket|convenience|grocery"'],
  mercearia: ['shop~"supermarket|convenience|grocery"'],
  supermercado: ['shop=supermarket'],
  acougue: ['shop=butcher'],
  hortifruti: ['shop=greengrocer'],
  'pet shop': ['shop~"pet|pet_grooming"'],
  pet: ['shop~"pet|pet_grooming"'],
  veterinaria: ['amenity=veterinary'],
  farmacia: ['amenity=pharmacy'],
  remedio: ['amenity=pharmacy'],
  dentista: ['amenity=dentist'],
  medico: ['amenity=doctors'],
  clinica: ['amenity=clinic'],
  saude: ['amenity~"pharmacy|clinic|doctors|dentist"'],
  celular: ['shop=mobile_phone'],
  eletronicos: ['shop=electronics'],
  roupa: ['shop=clothes'],
  vestuario: ['shop=clothes'],
  sapato: ['shop=shoes'],
  calcado: ['shop=shoes'],
  escola: ['amenity=school'],
  curso: ['amenity~"school|language_school"'],
};

function buildOverpassQuery(raioMetros, lat, lng, termo) {
  const t = termo ? normalizarTexto(termo) : '';
  const filtros = t && dicionarioOsm[t] ? dicionarioOsm[t] : null;

  let blocos = '';

  if (filtros) {
    for (const f of filtros) {
      blocos += `  nwr[${f}](around:${raioMetros},${lat},${lng});\n`;
    }
  } else if (t) {
    blocos += `  nwr["shop"](around:${raioMetros},${lat},${lng});\n`;
    blocos += `  nwr["amenity"~"cafe|restaurant|fast_food|pharmacy|barber|hairdresser|bakery"](around:${raioMetros},${lat},${lng});\n`;
    blocos += `  nwr["craft"](around:${raioMetros},${lat},${lng});\n`;
  } else {
    blocos += `  nwr["shop"](around:${raioMetros},${lat},${lng});\n`;
    blocos += `  nwr["amenity"~"cafe|restaurant|fast_food|pharmacy|barber|hairdresser"](around:${raioMetros},${lat},${lng});\n`;
    blocos += `  nwr["craft"](around:${raioMetros},${lat},${lng});\n`;
  }

  return `[out:json][timeout:20];\n(\n${blocos});\nout center tags;`;
}

function osmParaNegocio(place, lat, lng, raio) {
  const latPlace = place.lat ?? place.center?.lat;
  const lonPlace = place.lon ?? place.center?.lon;

  if (!latPlace || !lonPlace || !place.tags?.name) return null;

  const dist = calcularDistancia(parseFloat(lat), parseFloat(lng), latPlace, lonPlace);
  if (dist > raio) return null;

  let endereco = '';
  if (place.tags['addr:street']) {
    endereco = place.tags['addr:street'];
    if (place.tags['addr:housenumber']) endereco += `, ${place.tags['addr:housenumber']}`;
  }

  const catRaw = place.tags.shop || place.tags.amenity || place.tags.craft || 'local';
  const catExibicao = traducoes[catRaw] || catRaw.charAt(0).toUpperCase() + catRaw.slice(1);

  return {
    id: `osm_${place.id}`,
    nome_negocio: place.tags.name,
    descricao_negocio: 'Encontrado via mapa público local',
    categoria: catExibicao,
    telefone: place.tags.phone || place.tags['contact:phone'] || null,
    endereco_texto: endereco || 'Endereço disponível no mapa',
    latitude: latPlace,
    longitude: lonPlace,
    distancia_km: dist,
    produtos: [],
    is_osm: true,
    logo_url: null,
    horario_funcionamento: place.tags.opening_hours || null,
  };
}

async function buscarOsm(lat, lng, raioMetros, raio, termo) {
  const query = buildOverpassQuery(raioMetros, lat, lng, termo);

  const urls = [
    'https://overpass-api.de/api/interpreter',
    'https://overpass.kumi.systems/api/interpreter',
  ];

  for (const url of urls) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
          'User-Agent': 'CultivaApp/1.0',
        },
        body: 'data=' + encodeURIComponent(query),
        signal: AbortSignal.timeout(18000),
      });

      if (!response.ok) continue;

      const data = await response.json();
      if (!data.elements) return [];

      const termo_norm = termo ? normalizarTexto(termo) : '';

      return data.elements
        .map(place => osmParaNegocio(place, lat, lng, raio))
        .filter(Boolean)
        .filter(p => {
          if (!termo_norm) return true;
          const nome_norm = normalizarTexto(p.nome_negocio);
          const cat_norm = normalizarTexto(p.categoria);
          return nome_norm.includes(termo_norm) || cat_norm.includes(termo_norm) || !!dicionarioOsm[termo_norm];
        });
    } catch {
      continue;
    }
  }

  return [];
}

export async function buscarPorProximidade(req, res) {
  const { lat, lng, raio_km = 3, categoria, busca } = req.query;
  if (!lat || !lng) return res.status(400).json({ error: 'Latitude e longitude são obrigatórios.' });

  const raio = Math.min(Math.max(parseFloat(raio_km), 1), 10);
  const raioMetros = Math.floor(raio * 1000);
  let locais = [];

  try {
    const params = [parseFloat(lat), parseFloat(lng)];
    let whereStr = `u.ativo = true AND u.latitude IS NOT NULL AND u.longitude IS NOT NULL`;

    if (categoria) {
      params.push(categoria);
      whereStr += ` AND u.categoria = $${params.length}`;
    }
    if (busca) {
      params.push(`%${busca}%`);
      whereStr += ` AND (u.nome_negocio ILIKE $${params.length} OR u.descricao_negocio ILIKE $${params.length} OR u.categoria ILIKE $${params.length})`;
    }

    params.push(raio);

    const queryLocal = `
      SELECT * FROM (
        SELECT
          u.id, u.nome_negocio, u.descricao_negocio, u.categoria,
          u.telefone, u.endereco_texto, u.latitude, u.longitude,
          u.instagram, u.horario_funcionamento, u.formas_pagamento,
          u.aceita_encomenda, u.entrega_bairro, u.logo_url, u.capa_url,
          (6371 * acos(LEAST(1, cos(radians($1)) * cos(radians(u.latitude)) * cos(radians(u.longitude) - radians($2)) + sin(radians($1)) * sin(radians(u.latitude))))) AS distancia_km,
          COALESCE(
            json_agg(
              json_build_object(
                'id', p.id, 'nome', p.nome, 'descricao', p.descricao,
                'preco_venda', p.preco_venda, 'categoria', p.categoria, 'imagem_url', p.imagem_url
              ) ORDER BY p.nome
            ) FILTER (WHERE p.id IS NOT NULL),
            '[]'::json
          ) as produtos
        FROM usuarios u
        LEFT JOIN produtos_servicos p ON p.usuario_id = u.id AND p.visivel_vitrine = true
        WHERE ${whereStr}
        GROUP BY u.id
      ) AS sub
      WHERE distancia_km <= $${params.length}
    `;

    const resultLocal = await pool.query(queryLocal, params);
    locais = resultLocal.rows.map(r => ({ ...r, is_osm: false }));
  } catch (err) {
    console.error('Erro banco:', err.message);
  }

  try {
    const termoFiltro = busca || categoria || '';
    const osmPlaces = await buscarOsm(lat, lng, raioMetros, raio, termoFiltro);

    const nomesLocais = new Set(
      locais.map(l => normalizarTexto(l.nome_negocio))
    );

    const osmFiltrados = osmPlaces.filter(
      p => !nomesLocais.has(normalizarTexto(p.nome_negocio))
    );

    locais = [...locais, ...osmFiltrados];
  } catch (err) {
    console.error('Erro OSM:', err.message);
  }

  locais.sort((a, b) => a.distancia_km - b.distancia_km);
  return res.json(locais.slice(0, 50));
}

export async function detalheNegocio(req, res) {
  const { id } = req.params;
  if (id.startsWith('osm_')) {
    return res.json({ id, nome_negocio: 'Local Público', is_osm: true });
  }
  try {
    const negocio = await pool.query(
      `SELECT id, nome_negocio, descricao_negocio, categoria, telefone, endereco_texto, latitude, longitude,
        instagram, horario_funcionamento, formas_pagamento, aceita_encomenda, entrega_bairro, logo_url, capa_url
       FROM usuarios WHERE id=$1 AND ativo=true`,
      [id]
    );
    if (negocio.rows.length === 0) return res.status(404).json({ error: 'Negócio não encontrado.' });
    const produtos = await pool.query(
      'SELECT id, nome, descricao, preco_venda, categoria, imagem_url FROM produtos_servicos WHERE usuario_id=$1 AND visivel_vitrine=true ORDER BY nome',
      [id]
    );
    return res.json({ ...negocio.rows[0], produtos: produtos.rows });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao buscar negócio.', detail: err.message });
  }
}

export async function categorias(req, res) {
  try {
    const result = await pool.query(
      `SELECT DISTINCT categoria, COUNT(*) as total FROM usuarios WHERE ativo=true AND categoria IS NOT NULL GROUP BY categoria ORDER BY total DESC`
    );
    return res.json(result.rows);
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao listar categorias.', detail: err.message });
  }
}