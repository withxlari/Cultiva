import pool from '../db/pool.js';

export async function listar(req, res) {
  const { status, tipo } = req.query;
  let query = `
    SELECT v.*, c.nome as cliente_nome, p.nome as produto_nome
    FROM vendas v
    LEFT JOIN clientes c ON c.id = v.cliente_id
    LEFT JOIN produtos_servicos p ON p.id = v.produto_id
    WHERE v.usuario_id = $1
  `;
  const params = [req.usuario.id];

  if (status) { params.push(status); query += ` AND v.status = $${params.length}`; }
  if (tipo) { params.push(tipo); query += ` AND v.tipo = $${params.length}`; }
  query += ' ORDER BY v.created_at DESC';

  try {
    const result = await pool.query(query, params);
    return res.json(result.rows);
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao listar vendas.', detail: err.message });
  }
}

export async function criar(req, res) {
  const { cliente_id, produto_id, descricao, valor, tipo, status, data_vencimento } = req.body;
  if (!valor) return res.status(400).json({ error: 'Valor é obrigatório.' });

  try {
    const result = await pool.query(
      `INSERT INTO vendas (usuario_id, cliente_id, produto_id, descricao, valor, tipo, status, data_vencimento)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [req.usuario.id, cliente_id, produto_id, descricao, valor, tipo || 'avista', status || 'pago', data_vencimento]
    );

    if ((tipo || 'avista') === 'avista') {
      await pool.query(
        `INSERT INTO fluxo_caixa (usuario_id, descricao, valor, tipo, categoria) VALUES ($1,$2,$3,'entrada','venda')`,
        [req.usuario.id, descricao || 'Venda', valor]
      );
    }

    return res.status(201).json(result.rows[0]);
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao registrar venda.', detail: err.message });
  }
}

export async function atualizarStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const result = await pool.query(
      `UPDATE vendas SET status=$1, data_pagamento=CASE WHEN $1='pago' THEN CURRENT_DATE ELSE data_pagamento END
       WHERE id=$2 AND usuario_id=$3 RETURNING *`,
      [status, id, req.usuario.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Venda não encontrada.' });

    if (status === 'pago') {
      const venda = result.rows[0];
      await pool.query(
        `INSERT INTO fluxo_caixa (usuario_id, descricao, valor, tipo, categoria) VALUES ($1,$2,$3,'entrada','fiado_recebido')`,
        [req.usuario.id, venda.descricao || 'Recebimento de fiado', venda.valor]
      );
    }

    return res.json(result.rows[0]);
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao atualizar status.', detail: err.message });
  }
}

export async function relatorio(req, res) {
  try {
    const totais = await pool.query(
      `SELECT COUNT(*) as total_vendas,
        SUM(valor) as receita_total,
        SUM(CASE WHEN status='pendente' THEN valor ELSE 0 END) as total_pendente,
        SUM(CASE WHEN status='pago' THEN valor ELSE 0 END) as total_recebido
       FROM vendas WHERE usuario_id=$1`,
      [req.usuario.id]
    );

    const por_mes = await pool.query(
      `SELECT TO_CHAR(created_at, 'YYYY-MM') as mes, SUM(valor) as total
       FROM vendas WHERE usuario_id=$1 AND status='pago'
       GROUP BY mes ORDER BY mes DESC LIMIT 6`,
      [req.usuario.id]
    );

    return res.json({ resumo: totais.rows[0], por_mes: por_mes.rows });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao gerar relatório.', detail: err.message });
  }
}