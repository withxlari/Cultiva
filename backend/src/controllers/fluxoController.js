import pool from '../db/pool.js';

export async function listar(req, res) {
  const { data_inicio, data_fim } = req.query;
  let query = 'SELECT * FROM fluxo_caixa WHERE usuario_id=$1';
  const params = [req.usuario.id];

  if (data_inicio) { params.push(data_inicio); query += ` AND data_registro >= $${params.length}`; }
  if (data_fim) { params.push(data_fim); query += ` AND data_registro <= $${params.length}`; }
  query += ' ORDER BY data_registro DESC, created_at DESC';

  try {
    const result = await pool.query(query, params);
    return res.json(result.rows);
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao listar fluxo.', detail: err.message });
  }
}

export async function criar(req, res) {
  const { descricao, valor, tipo, categoria, data_registro } = req.body;
  if (!descricao || !valor || !tipo) return res.status(400).json({ error: 'Descricao, valor e tipo são obrigatórios.' });

  try {
    const result = await pool.query(
      `INSERT INTO fluxo_caixa (usuario_id, descricao, valor, tipo, categoria, data_registro)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [req.usuario.id, descricao, valor, tipo, categoria, data_registro || new Date()]
    );
    return res.status(201).json(result.rows[0]);
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao registrar lançamento.', detail: err.message });
  }
}

export async function deletar(req, res) {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM fluxo_caixa WHERE id=$1 AND usuario_id=$2', [id, req.usuario.id]);
    return res.json({ message: 'Lançamento removido.' });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao remover lançamento.', detail: err.message });
  }
}

export async function saldo(req, res) {
  try {
    const result = await pool.query(
      `SELECT
        SUM(CASE WHEN tipo='entrada' THEN valor ELSE 0 END) as total_entradas,
        SUM(CASE WHEN tipo='saida' THEN valor ELSE 0 END) as total_saidas,
        SUM(CASE WHEN tipo='entrada' THEN valor ELSE -valor END) as saldo
       FROM fluxo_caixa WHERE usuario_id=$1`,
      [req.usuario.id]
    );
    return res.json(result.rows[0]);
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao calcular saldo.', detail: err.message });
  }
}