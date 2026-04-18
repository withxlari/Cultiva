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
    { titulo: 'Como precificar seu produto corretamente', descricao: 'Aprenda a calcular seus custos e definir uma margem de lucro justa.', tipo: 'texto', categoria: 'financas', conteudo: 'Precificar corretamente é fundamental para a sustentabilidade do seu negócio. O preço deve cobrir todos os seus custos (materiais, tempo, energia) e ainda gerar lucro. Use a fórmula: Preço = Custo Total / (1 - Margem de Lucro). Por exemplo, se seu custo é R$10 e você quer 30% de margem, o preço é R$10 / 0,7 = R$14,29.', duracao_minutos: 5, ordem: 1 },
    { titulo: 'O que é fluxo de caixa e por que ele salva negócios', descricao: 'Entenda a diferença entre faturamento e dinheiro no bolso.', tipo: 'texto', categoria: 'financas', conteudo: 'Fluxo de caixa é o registro de todo dinheiro que entra e sai do seu negócio. Muitos empreendedores faturam bem mas ficam sem dinheiro porque não controlam as saídas. Anote toda entrada (venda, recebimento) e toda saída (compra de material, contas) diariamente.', duracao_minutos: 7, ordem: 2 },
    { titulo: 'Como cobrar sem perder o cliente', descricao: 'Estratégias para receber o fiado sem criar conflito.', tipo: 'texto', categoria: 'gestao', conteudo: 'Cobrar é difícil, mas necessário. Dicas: 1) Combine o prazo de pagamento na hora da venda. 2) Registre tudo. 3) Envie lembretes amigáveis antes do vencimento. 4) Use o WhatsApp com tom amistoso. 5) Se atrasar, negocie um novo prazo.', duracao_minutos: 6, ordem: 1 },
    { titulo: 'Marketing boca a boca: seu maior ativo', descricao: 'Como transformar clientes satisfeitos em promotores do seu negócio.', tipo: 'texto', categoria: 'marketing', conteudo: 'Para pequenos negócios, a indicação é a melhor propaganda. Para gerar indicações: 1) Entregue mais do que prometeu. 2) Seja pontual. 3) Peça avaliações. 4) Crie um programa simples de indicação. 5) Mantenha presença no WhatsApp com fotos do seu trabalho.', duracao_minutos: 8, ordem: 1 },
    { titulo: 'MEI: vale a pena formalizar?', descricao: 'Entenda os benefícios e como se tornar um Microempreendedor Individual.', tipo: 'texto', categoria: 'formalizacao', conteudo: 'O MEI permite faturar até R$81.000/ano com impostos simplificados (cerca de R$70/mês). Benefícios: CNPJ, acesso a crédito, aposentadoria e auxílio-doença pelo INSS. Para se registrar, acesse o Portal do Empreendedor (gov.br/mei) gratuitamente.', duracao_minutos: 10, ordem: 1 },
  ];

  try {
    for (const c of conteudos) {
      await pool.query(
        `INSERT INTO capacitacao (titulo, descricao, tipo, conteudo, categoria, duracao_minutos, ordem) VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT DO NOTHING`,
        [c.titulo, c.descricao, c.tipo, c.conteudo, c.categoria, c.duracao_minutos, c.ordem]
      );
    }
    return res.json({ message: 'Conteúdos adicionados com sucesso.' });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao adicionar conteúdos.', detail: err.message });
  }
}