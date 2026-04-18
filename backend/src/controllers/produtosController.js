import pool from '../db/pool.js';

export async function listar(req, res) {
  try {
    const result = await pool.query(
      'SELECT * FROM produtos_servicos WHERE usuario_id = $1 ORDER BY created_at DESC',
      [req.usuario.id]
    );
    return res.json(result.rows);
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao listar produtos.', detail: err.message });
  }
}

export async function criar(req, res) {
  const { nome, descricao, preco_custo, margem_lucro, preco_venda, categoria, imagem_url, visivel_vitrine } = req.body;

  if (!nome || !preco_venda) {
    return res.status(400).json({ error: 'Nome e preço de venda são obrigatórios.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO produtos_servicos (usuario_id, nome, descricao, preco_custo, margem_lucro, preco_venda, categoria, imagem_url, visivel_vitrine)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [req.usuario.id, nome, descricao, preco_custo || 0, margem_lucro || 30, preco_venda, categoria, imagem_url, visivel_vitrine !== false]
    );
    return res.status(201).json(result.rows[0]);
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao criar produto.', detail: err.message });
  }
}

export async function atualizar(req, res) {
  const { id } = req.params;
  const { nome, descricao, preco_custo, margem_lucro, preco_venda, categoria, imagem_url, visivel_vitrine } = req.body;

  try {
    const result = await pool.query(
      `UPDATE produtos_servicos SET nome=$1, descricao=$2, preco_custo=$3, margem_lucro=$4, preco_venda=$5, categoria=$6, imagem_url=$7, visivel_vitrine=$8, updated_at=NOW()
       WHERE id=$9 AND usuario_id=$10 RETURNING *`,
      [nome, descricao, preco_custo, margem_lucro, preco_venda, categoria, imagem_url, visivel_vitrine, id, req.usuario.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Produto não encontrado.' });
    }
    return res.json(result.rows[0]);
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao atualizar produto.', detail: err.message });
  }
}

export async function deletar(req, res) {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM produtos_servicos WHERE id=$1 AND usuario_id=$2', [id, req.usuario.id]);
    return res.json({ message: 'Produto removido.' });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao remover produto.', detail: err.message });
  }
}

export async function calcularPreco(req, res) {
  const { insumos, tempo_horas, valor_hora, margem_lucro } = req.body;

  let custo_insumos = 0;
  if (insumos && Array.isArray(insumos)) {
    custo_insumos = insumos.reduce((acc, i) => acc + (parseFloat(i.custo) * parseFloat(i.quantidade || 1)), 0);
  }

  const custo_tempo = (parseFloat(tempo_horas) || 0) * (parseFloat(valor_hora) || 0);
  const custo_total = custo_insumos + custo_tempo;
  const margem = parseFloat(margem_lucro) || 30;
  const preco_sugerido = custo_total / (1 - margem / 100);

  return res.json({
    custo_insumos: custo_insumos.toFixed(2),
    custo_tempo: custo_tempo.toFixed(2),
    custo_total: custo_total.toFixed(2),
    margem_lucro: margem,
    preco_sugerido: preco_sugerido.toFixed(2),
    lucro_estimado: (preco_sugerido - custo_total).toFixed(2),
  });
}