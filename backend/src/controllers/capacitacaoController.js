import pool from '../db/pool.js';

export async function listar(req, res) {
  const { categoria } = req.query;
  let query = 'SELECT * FROM capacitacao';
  const params = [];
  if (categoria) { params.push(categoria); query += ' WHERE categoria=$1'; }
  query += ' ORDER BY categoria, ordem, created_at';

  try {
    const result = await pool.query(query, params);
    return res.json(result.rows);
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao listar conteúdos.', detail: err.message });
  }
}

export async function criar(req, res) {
  const { titulo, descricao, tipo, conteudo, url_video, categoria, duracao_minutos, ordem } = req.body;
  if (!titulo) return res.status(400).json({ error: 'Título é obrigatório.' });

  try {
    const result = await pool.query(
      `INSERT INTO capacitacao (titulo, descricao, tipo, conteudo, url_video, categoria, duracao_minutos, ordem)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [titulo, descricao, tipo || 'texto', conteudo, url_video, categoria, duracao_minutos, ordem || 0]
    );
    return res.status(201).json(result.rows[0]);
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao criar conteúdo.', detail: err.message });
  }
}

export async function seedConteudos(req, res) {
  const conteudos = [
    {
      titulo: 'Como separar o dinheiro da empresa do dinheiro pessoal',
      descricao: 'Aprenda a importância de não misturar as finanças pessoais com as do seu negócio.',
      tipo: 'video',
      categoria: 'financas',
      conteudo: 'Dicas práticas para manter contas separadas e organizar seu caixa.',
      url_video: 'https://www.youtube.com/watch?v=X1hRP2dX61g',
      duracao_minutos: 6,
      ordem: 1
    },
    {
      titulo: 'Fluxo de caixa simplificado',
      descricao: 'Entenda como registrar e controlar as entradas e saídas diárias.',
      tipo: 'video',
      categoria: 'financas',
      conteudo: 'O fluxo de caixa é essencial para a saúde financeira do seu empreendimento.',
      url_video: 'https://www.youtube.com/watch?v=L9DNl1nJFPE',
      duracao_minutos: 8,
      ordem: 2
    },
    {
      titulo: 'Como precificar meu produto passo a passo',
      descricao: 'Descubra como definir o preço certo para cobrir custos e ter lucro.',
      tipo: 'video',
      categoria: 'financas',
      conteudo: 'Aprenda a identificar todos os custos envolvidos no seu produto ou serviço.',
      url_video: 'https://www.youtube.com/watch?v=ofuPr0mkmNA',
      duracao_minutos: 10,
      ordem: 3
    },
    {
      titulo: 'Como calcular margem de lucro para pequenos negócios',
      descricao: 'Entenda a diferença entre lucro e faturamento e como calcular sua margem.',
      tipo: 'video',
      categoria: 'financas',
      conteudo: 'A margem de lucro correta garante a sustentabilidade do seu negócio.',
      url_video: 'https://www.youtube.com/watch?v=NaWNrVt34us',
      duracao_minutos: 5,
      ordem: 4
    },
    {
      titulo: 'Como cobrar cliente pelo WhatsApp sem ser chato',
      descricao: 'Técnicas de comunicação para cobrar valores em atraso de forma amigável.',
      tipo: 'video',
      categoria: 'gestao',
      conteudo: 'Mantenha um bom relacionamento com o cliente mesmo na hora da cobrança.',
      url_video: 'https://www.youtube.com/watch?v=BC9v0uUNYe0',
      duracao_minutos: 7,
      ordem: 1
    },
    {
      titulo: 'Como organizar as vendas do mês',
      descricao: 'Métodos simples para registrar e acompanhar o desempenho das suas vendas.',
      tipo: 'video',
      categoria: 'gestao',
      conteudo: 'Acompanhe seus resultados mensais para tomar decisões melhores.',
      url_video: 'https://www.youtube.com/watch?v=pncp4qij7sM',
      duracao_minutos: 6,
      ordem: 2
    },
    {
      titulo: 'Dicas de gestão para quem trabalha sozinho',
      descricao: 'Como otimizar seu tempo e organizar as tarefas sendo um "euempreendedor".',
      tipo: 'video',
      categoria: 'gestao',
      conteudo: 'Produtividade e organização são fundamentais quando você faz tudo no negócio.',
      url_video: 'https://www.youtube.com/watch?v=69l-iaw_Vz0',
      duracao_minutos: 9,
      ordem: 3
    },
    {
      titulo: 'Como tirar fotos de produtos com o celular',
      descricao: 'Aprenda a valorizar seus produtos usando apenas a câmera do seu smartphone.',
      tipo: 'video',
      categoria: 'marketing',
      conteudo: 'Dicas de iluminação, ângulos e composição para fotos atrativas.',
      url_video: 'https://www.youtube.com/watch?v=3jl5RVRo-DM',
      duracao_minutos: 8,
      ordem: 1
    },
    {
      titulo: 'Vantagens de ser MEI',
      descricao: 'Conheça todos os benefícios de formalizar seu negócio como Microempreendedor Individual.',
      tipo: 'video',
      categoria: 'formalizacao',
      conteudo: 'Ao se tornar MEI, você ganha acesso a direitos previdenciários e linhas de crédito.',
      url_video: 'https://www.youtube.com/watch?v=Zk9J1Jppfxk',
      duracao_minutos: 5,
      ordem: 1
    },
    {
      titulo: 'Como abrir um MEI passo a passo 2026',
      descricao: 'Tutorial completo e atualizado para realizar a abertura do seu CNPJ MEI.',
      tipo: 'video',
      categoria: 'formalizacao',
      conteudo: 'Processo gratuito e simplificado através do Portal do Empreendedor.',
      url_video: 'https://www.youtube.com/watch?v=acIloPocI8I&t=171s',
      duracao_minutos: 12,
      ordem: 2
    },
    {
      titulo: 'Quais são os impostos do MEI',
      descricao: 'Entenda os custos mensais para manter sua empresa MEI regularizada.',
      tipo: 'texto',
      categoria: 'formalizacao',
      conteudo: 'O MEI paga um valor fixo mensal através do DAS (Documento de Arrecadação do Simples Nacional). Esse valor inclui a contribuição para o INSS (5% do salário mínimo) e os impostos ICMS (R$ 1,00 para comércio/indústria) ou ISS (R$ 5,00 para serviços). Manter o DAS em dia é obrigatório para não perder os benefícios.',
      url_video: null,
      duracao_minutos: 3,
      ordem: 3
    },
    {
      titulo: 'Direitos do MEI: auxílio doença e aposentadoria',
      descricao: 'Saiba quais são as coberturas previdenciárias que o MEI tem direito.',
      tipo: 'texto',
      categoria: 'formalizacao',
      conteudo: 'Ao pagar o DAS em dia, o MEI garante vários direitos pelo INSS. Entre eles estão: Aposentadoria por idade (mulheres aos 62 anos e homens aos 65, com mínimo de 15 anos de contribuição); Auxílio-doença e Aposentadoria por invalidez (após 12 meses de contribuição); Salário-maternidade (após 10 meses) e Pensão por morte para os dependentes.',
      url_video: null,
      duracao_minutos: 4,
      ordem: 4
    }
  ];

  try {
    for (const c of conteudos) {
      await pool.query(
        `INSERT INTO capacitacao (titulo, descricao, tipo, conteudo, url_video, categoria, duracao_minutos, ordem)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
         ON CONFLICT DO NOTHING`,
        [c.titulo, c.descricao, c.tipo, c.conteudo, c.url_video, c.categoria, c.duracao_minutos, c.ordem]
      );
    }
    return res.json({ message: 'Conteúdos adicionados com sucesso.' });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao adicionar conteúdos.', detail: err.message });
  }
}