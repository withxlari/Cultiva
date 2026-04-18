import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../db/pool.js';

export async function register(req, res) {
  const { nome, email, senha, nome_negocio, descricao_negocio, categoria, telefone, latitude, longitude, endereco_texto } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ error: 'Nome, email e senha são obrigatórios.' });
  }

  try {
    const existe = await pool.query('SELECT id FROM usuarios WHERE email = $1', [email]);
    if (existe.rows.length > 0) {
      return res.status(409).json({ error: 'Email já cadastrado.' });
    }

    const senha_hash = await bcrypt.hash(senha, 10);

    const result = await pool.query(
      `INSERT INTO usuarios (nome, email, senha_hash, nome_negocio, descricao_negocio, categoria, telefone, latitude, longitude, endereco_texto)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id, nome, email, nome_negocio, categoria, latitude, longitude`,
      [nome, email, senha_hash, nome_negocio, descricao_negocio, categoria, telefone, latitude, longitude, endereco_texto]
    );

    const usuario = result.rows[0];
    const token = jwt.sign({ id: usuario.id, email: usuario.email }, process.env.JWT_SECRET, { expiresIn: '7d' });

    return res.status(201).json({ usuario, token });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao registrar.', detail: err.message });
  }
}

export async function login(req, res) {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
  }

  try {
    const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    const usuario = result.rows[0];
    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
    if (!senhaValida) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    const token = jwt.sign({ id: usuario.id, email: usuario.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    const { senha_hash, ...usuarioSemSenha } = usuario;
    return res.json({ usuario: usuarioSemSenha, token });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao fazer login.', detail: err.message });
  }
}

export async function getMe(req, res) {
  try {
    const result = await pool.query(
      'SELECT id, nome, email, nome_negocio, descricao_negocio, categoria, telefone, latitude, longitude, endereco_texto, created_at FROM usuarios WHERE id = $1',
      [req.usuario.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }
    return res.json(result.rows[0]);
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao buscar perfil.', detail: err.message });
  }
}

export async function updateMe(req, res) {
  const { nome, nome_negocio, descricao_negocio, categoria, telefone, latitude, longitude, endereco_texto } = req.body;

  try {
    const result = await pool.query(
      `UPDATE usuarios SET nome=$1, nome_negocio=$2, descricao_negocio=$3, categoria=$4, telefone=$5, latitude=$6, longitude=$7, endereco_texto=$8, updated_at=NOW()
       WHERE id=$9
       RETURNING id, nome, email, nome_negocio, descricao_negocio, categoria, telefone, latitude, longitude, endereco_texto`,
      [nome, nome_negocio, descricao_negocio, categoria, telefone, latitude, longitude, endereco_texto, req.usuario.id]
    );
    return res.json(result.rows[0]);
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao atualizar perfil.', detail: err.message });
  }
}