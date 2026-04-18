import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;

const client = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

const migrations = `
  CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

  CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    nome_negocio VARCHAR(150),
    descricao_negocio TEXT,
    categoria VARCHAR(100),
    telefone VARCHAR(20),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    endereco_texto VARCHAR(255),
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS insumos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    nome VARCHAR(150) NOT NULL,
    custo DECIMAL(10, 2) NOT NULL,
    unidade VARCHAR(50),
    quantidade DECIMAL(10, 3) DEFAULT 1,
    tipo VARCHAR(50) DEFAULT 'variavel',
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS produtos_servicos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    nome VARCHAR(150) NOT NULL,
    descricao TEXT,
    preco_custo DECIMAL(10, 2) DEFAULT 0,
    margem_lucro DECIMAL(5, 2) DEFAULT 30,
    preco_venda DECIMAL(10, 2) NOT NULL,
    categoria VARCHAR(100),
    imagem_url VARCHAR(500),
    visivel_vitrine BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS clientes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    nome VARCHAR(150) NOT NULL,
    telefone VARCHAR(20),
    email VARCHAR(150),
    observacoes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS vendas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
    produto_id UUID REFERENCES produtos_servicos(id) ON DELETE SET NULL,
    descricao VARCHAR(255),
    valor DECIMAL(10, 2) NOT NULL,
    tipo VARCHAR(20) DEFAULT 'avista',
    status VARCHAR(20) DEFAULT 'pago',
    data_vencimento DATE,
    data_pagamento DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS fluxo_caixa (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    descricao VARCHAR(255) NOT NULL,
    valor DECIMAL(10, 2) NOT NULL,
    tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('entrada', 'saida')),
    categoria VARCHAR(100),
    data_registro DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS capacitacao (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    titulo VARCHAR(200) NOT NULL,
    descricao TEXT,
    tipo VARCHAR(20) DEFAULT 'texto',
    conteudo TEXT,
    url_video VARCHAR(500),
    categoria VARCHAR(100),
    duracao_minutos INTEGER,
    ordem INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE INDEX IF NOT EXISTS idx_usuarios_lat_lng ON usuarios(latitude, longitude);
  CREATE INDEX IF NOT EXISTS idx_vendas_usuario ON vendas(usuario_id);
  CREATE INDEX IF NOT EXISTS idx_vendas_status ON vendas(status);
  CREATE INDEX IF NOT EXISTS idx_fluxo_usuario ON fluxo_caixa(usuario_id);
  CREATE INDEX IF NOT EXISTS idx_produtos_vitrine ON produtos_servicos(visivel_vitrine, usuario_id);
`;

async function run() {
  try {
    await client.connect();
    console.log('Executando migrations...');
    await client.query(migrations);
    console.log('Migrations executadas com sucesso.');
    await client.end();
  } catch (err) {
    console.error('Erro nas migrations:', err);
    await client.end();
    process.exit(1);
  }
}

run();