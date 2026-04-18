import pool from '../db/pool.js';

export async function listar(req, res) {
  try {
    const result = await pool.query(
      `SELECT c.*,
        COALESCE(SUM(CASE WHEN v.status='pendente' THEN v.valor ELSE 0 END), 0) as total_pendente,
        COUNT(v.id) as total_vendas
       FROM clientes c
       LEFT JOIN vendas v ON v.cliente_id = c.id
       WHERE c.usuario_id = $1
       GROUP BY c.id
       ORDER BY c.nome`,
      [req.usuario.id]
    );
    return res.json(result.rows);
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao listar clientes.', detail: err.message });
  }
}

export async function criar(req, res) {
  const { nome, telefone, email, observacoes } = req.body;
  if (!nome) return res.status(400).json({ error: 'Nome é obrigatório.' });

  try {
    const result = await pool.query(
      'INSERT INTO clientes (usuario_id, nome, telefone, email, observacoes) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [req.usuario.id, nome, telefone, email, observacoes]
    );
    return res.status(201).json(result.rows[0]);
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao criar cliente.', detail: err.message });
  }
}

export async function atualizar(req, res) {
  const { id } = req.params;
  const { nome, telefone, email, observacoes } = req.body;

  try {
    const result = await pool.query(
      'UPDATE clientes SET nome=$1, telefone=$2, email=$3, observacoes=$4 WHERE id=$5 AND usuario_id=$6 RETURNING *',
      [nome, telefone, email, observacoes, id, req.usuario.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Cliente não encontrado.' });
    return res.json(result.rows[0]);
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao atualizar cliente.', detail: err.message });
  }
}

export async function deletar(req, res) {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM clientes WHERE id=$1 AND usuario_id=$2', [id, req.usuario.id]);
    return res.json({ message: 'Cliente removido.' });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao remover cliente.', detail: err.message });
  }
}

export async function historico(req, res) {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM vendas WHERE cliente_id=$1 AND usuario_id=$2 ORDER BY created_at DESC',
      [id, req.usuario.id]
    );
    return res.json(result.rows);
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao buscar histórico.', detail: err.message });
  }
}

export async function gerarAlertaWhatsapp(req, res) {
  const { id } = req.params;
  try {
    const clienteResult = await pool.query(
      'SELECT * FROM clientes WHERE id=$1 AND usuario_id=$2',
      [id, req.usuario.id]
    );
    if (clienteResult.rows.length === 0) return res.status(404).json({ error: 'Cliente não encontrado.' });

    const cliente = clienteResult.rows[0];
    const vendasResult = await pool.query(
      `SELECT * FROM vendas WHERE cliente_id=$1 AND status='pendente' ORDER BY data_vencimento`,
      [id]
    );

    const vendas = vendasResult.rows;
    const total = vendas.reduce((acc, v) => acc + parseFloat(v.valor), 0);

    let mensagem = `Olá ${cliente.nome}! Passando para lembrar que você tem `;
    if (vendas.length === 1) {
      mensagem += `uma conta pendente no valor de R$ ${total.toFixed(2).replace('.', ',')}.`;
    } else {
      mensagem += `${vendas.length} contas pendentes totalizando R$ ${total.toFixed(2).replace('.', ',')}.`;
    }
    mensagem += ' Qualquer dúvida, estou à disposição. Obrigado!';

    const telefoneFormatado = cliente.telefone ? cliente.telefone.replace(/\D/g, '') : '';
    const linkWhatsapp = telefoneFormatado
      ? `https://wa.me/55${telefoneFormatado}?text=${encodeURIComponent(mensagem)}`
      : null;

    return res.json({ mensagem, link_whatsapp: linkWhatsapp, total_pendente: total.toFixed(2) });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao gerar alerta.', detail: err.message });
  }
}