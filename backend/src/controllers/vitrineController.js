import pool from '../db/pool.js';

export async function buscarPorProximidade(req, res) {
  const { lat, lng, raio_km = 3, categoria, busca } = req.query;
  if (!lat || !lng) return res.status(400).json({ error: 'Latitude e longitude são obrigatórios.' });

  const raio = Math.min(Math.max(parseFloat(raio_km), 1), 10);

  let query = `
    SELECT
      u.id, u.nome_negocio, u.descricao_negocio, u.categoria,
      u.telefone, u.endereco_texto, u.latitude, u.longitude,
      (6371 * acos(LEAST(1, cos(radians($1)) * cos(radians(u.latitude)) * cos(radians(u.longitude) - radians($2)) + sin(radians($1)) * sin(radians(u.latitude))))) AS distancia_km,
      json_agg(json_build_object('id', p.id, 'nome', p.nome, 'descricao', p.descricao, 'preco_venda', p.preco_venda, 'categoria', p.categoria) ORDER BY p.nome) FILTER (WHERE p.id IS NOT NULL) as produtos
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
    ORDER BY distancia_km ASC
    LIMIT 50
  `;

  try {
    const result = await pool.query(query, params);
    return res.json(result.rows);
  } catch (err) {
    return res.status(500).json({ error: 'Erro na busca por proximidade.', detail: err.message });
  }
}

export async function detalheNegocio(req, res) {
  const { id } = req.params;
  try {
    const negocio = await pool.query(
      `SELECT id, nome_negocio, descricao_negocio, categoria, telefone, endereco_texto, latitude, longitude
       FROM usuarios WHERE id=$1 AND ativo=true`,
      [id]
    );
    if (negocio.rows.length === 0) return res.status(404).json({ error: 'Negócio não encontrado.' });

    const produtos = await pool.query(
      'SELECT id, nome, descricao, preco_venda, categoria FROM produtos_servicos WHERE usuario_id=$1 AND visivel_vitrine=true ORDER BY nome',
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