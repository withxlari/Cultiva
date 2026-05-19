import pool from '../db/pool.js';

function calcularDistancia(lat1, lon1, lat2, lon2) {
  const p = 0.017453292519943295;
  const c = Math.cos;
  const a = 0.5 - c((lat2 - lat1) * p) / 2 + c(lat1 * p) * c(lat2 * p) * (1 - c((lon2 - lon1) * p)) / 2;
  return 12742 * Math.asin(Math.sqrt(a));
}

function mapearTermoParaOsm(termo) {
  if (!termo) return 'nwr["shop"]';
  
  const t = termo.toLowerCase().trim();
  
  const dicionario = {
    'padaria': 'nwr["shop"="bakery"]',
    'pão': 'nwr["shop"="bakery"]',
    'mercado': 'nwr["shop"~"supermarket|convenience|grocery"]',
    'mercearia': 'nwr["shop"~"supermarket|convenience|grocery"]',
    'supermercado': 'nwr["shop"="supermarket"]',
    'restaurante': 'nwr["amenity"="restaurant"]',
    'comida': 'nwr["amenity"~"restaurant|fast_food|food_court"]',
    'lanchonete': 'nwr["amenity"="fast_food"]',
    'pastel': 'nwr["amenity"="fast_food"]',
    'pizzaria': 'nwr["amenity"="restaurant"]',
    'café': 'nwr["amenity"="cafe"]',
    'cafeteria': 'nwr["amenity"="cafe"]',
    'salão': 'nwr["shop"="hairdresser"]',
    'cabeleireiro': 'nwr["shop"="hairdresser"]',
    'beleza': 'nwr["shop"~"hairdresser|beauty"]',
    'estética': 'nwr["shop"="beauty"]',
    'manicure': 'nwr["shop"="beauty"]',
    'barbearia': 'nwr["shop"="barber"]',
    'barbeiro': 'nwr["shop"="barber"]',
    'farmácia': 'nwr["amenity"="pharmacy"]',
    'remédio': 'nwr["amenity"="pharmacy"]',
    'roupa': 'nwr["shop"="clothes"]',
    'vestuário': 'nwr["shop"="clothes"]',
    'loja': 'nwr["shop"]',
    'costura': 'nwr["craft"="tailor"]',
    'costureira': 'nwr["craft"="tailor"]',
    'oficina': 'nwr["craft"~"mechanic|car_repair"]',
    'mecânico': 'nwr["amenity"="car_repair"]'
  };

  return dicionario[t] || `nwr["shop"~"${t}", i]`;
}

export async function buscarPorProximidade(req, res) {
  const { lat, lng, raio_km = 3, categoria, busca } = req.query;
  if (!lat || !lng) return res.status(400).json({ error: 'Latitude e longitude são obrigatórios.' });

  const raio = Math.min(Math.max(parseFloat(raio_km), 1), 10);

  let query = `
    SELECT
      u.id, u.nome_negocio, u.descricao_negocio, u.categoria,
      u.telefone, u.endereco_texto, u.latitude, u.longitude,
      u.instagram, u.horario_funcionamento, u.formas_pagamento,
      u.aceita_encomenda, u.entrega_bairro, u.logo_url, u.capa_url,
      (6371 * acos(LEAST(1, cos(radians($1)) * cos(radians(u.latitude)) * cos(radians(u.longitude) - radians($2)) + sin(radians($1)) * sin(radians(u.latitude))))) AS distancia_km,
      json_agg(
        json_build_object(
          'id', p.id, 'nome', p.nome, 'descricao', p.descricao,
          'preco_venda', p.preco_venda, 'categoria', p.categoria, 'imagem_url', p.imagem_url
        ) ORDER BY p.nome
      ) FILTER (WHERE p.id IS NOT NULL) as produtos
    FROM usuarios u
    LEFT JOIN produtos_servicos p ON p.usuario_id = u.id AND p.visivel_vitrine = true
    WHERE u.ativo = true AND u.latitude IS NOT NULL AND u.longitude IS NOT NULL
  `;

  const params = [parseFloat(lat), parseFloat(lng)];

  if (categoria) { params.push(categoria); query += ` AND u.categoria = $${params.length}`; }
  if (busca) { params.push(`%${busca}%`); query += ` AND (u.nome_negocio ILIKE $${params.length} OR u.descricao_negocio ILIKE $${params.length})`; }

  params.push(raio);
  query += `
    GROUP BY u.id
    HAVING (6371 * acos(LEAST(1, cos(radians($1)) * cos(radians(u.latitude)) * cos(radians(u.longitude) - radians($2)) + sin(radians($1)) * sin(radians(u.latitude))))) <= $${params.length}
  `;

  try {
    const result = await pool.query(query, params);
    let locais = result.rows.map(r => ({ ...r, is_osm: false }));

    const raioMetros = Math.floor(raio * 1000);
    const termoFiltro = busca || categoria || '';
    
    let overpassQuery = '';
    
    if (termoFiltro) {
      const seletorOsm = mapearTermoParaOsm(termoFiltro);
      
      if (seletorOsm.includes('=')) {
        overpassQuery = `
          [out:json][timeout:15];
          (
            ${seletorOsm}(around:${raioMetros},${lat},${lng});
            nwr["shop"](around:${raioMetros},${lat},${lng})["name"~"${termoFiltro}", i];
            nwr["amenity"](around:${raioMetros},${lat},${lng})["name"~"${termoFiltro}", i];
          );
          out center;
        `;
      } else {
        overpassQuery = `
          [out:json][timeout:15];
          (
            nwr["shop"](around:${raioMetros},${lat},${lng})["name"~"${termoFiltro}", i];
            nwr["amenity"](around:${raioMetros},${lat},${lng})["name"~"${termoFiltro}", i];
            nwr["craft"](around:${raioMetros},${lat},${lng})["name"~"${termoFiltro}", i];
          );
          out center;
        `;
      }
    } else {
      overpassQuery = `
        [out:json][timeout:15];
        (
          nwr["shop"](around:${raioMetros},${lat},${lng});
          nwr["amenity"~"cafe|restaurant|fast_food|pharmacy|barber|hairdresser"](around:${raioMetros},${lat},${lng});
          nwr["craft"](around:${raioMetros},${lat},${lng});
        );
        out center;
      `;
    }

    try {
      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
          'User-Agent': 'CultivaApp/1.0 (teste local vitrine)'
        },
        body: 'data=' + encodeURIComponent(overpassQuery)
      });
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.elements) {
          const osmPlaces = data.elements.filter(e => e.tags && e.tags.name).map(place => {
            const latPlace = place.lat || place.center?.lat;
            const lonPlace = place.lon || place.center?.lon;
            const dist = calcularDistancia(parseFloat(lat), parseFloat(lng), latPlace, lonPlace);
            
            let endereco = '';
            if (place.tags["addr:street"]) {
              endereco = place.tags["addr:street"];
              if (place.tags["addr:housenumber"]) endereco += `, ${place.tags["addr:housenumber"]}`;
            }

            let catExibicao = place.tags.shop || place.tags.amenity || place.tags.craft || 'Local';
            const traducoes = {
              'bakery': 'Padaria',
              'supermarket': 'Supermercado',
              'convenience': 'Mercado',
              'grocery': 'Mercearia',
              'restaurant': 'Restaurante',
              'fast_food': 'Lanchonete',
              'cafe': 'Cafeteria',
              'hairdresser': 'Salão de Beleza',
              'barber': 'Barbearia',
              'beauty': 'Estética',
              'pharmacy': 'Farmácia',
              'clothes': 'Loja de Roupas',
              'tailor': 'Costura'
            };

            return {
              id: `osm_${place.id}`,
              nome_negocio: place.tags.name,
              descricao_negocio: 'Encontrado via mapa público local',
              categoria: traducoes[catExibicao] || catExibicao.toUpperCase(),
              telefone: place.tags.phone || place.tags["contact:phone"] || null,
              endereco_texto: endereco || 'Endereço disponível no mapa',
              latitude: latPlace,
              longitude: lonPlace,
              distancia_km: dist,
              produtos: [],
              is_osm: true,
              logo_url: null,
              horario_funcionamento: place.tags.opening_hours || null
            };
          }).filter(p => p.distancia_km <= raio);
          
          locais = [...locais, ...osmPlaces];
        }
      }
    } catch (err) {
      console.error(err);
    }

    locais.sort((a, b) => a.distancia_km - b.distancia_km);
    return res.json(locais.slice(0, 50));

  } catch (err) {
    return res.status(500).json({ error: 'Erro na busca por proximidade.', detail: err.message });
  }
}

export async function detalheNegocio(req, res) {
  const { id } = req.params;
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