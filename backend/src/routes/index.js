import { Router } from 'express';
import { register, login, getMe, updateMe } from '../controllers/authController.js';
import { listar as listarProdutos, criar as criarProduto, atualizar as atualizarProduto, deletar as deletarProduto, calcularPreco } from '../controllers/produtosController.js';
import { listar as listarClientes, criar as criarCliente, atualizar as atualizarCliente, deletar as deletarCliente, historico, gerarAlertaWhatsapp } from '../controllers/clientesController.js';
import { listar as listarVendas, criar as criarVenda, atualizarStatus, relatorio } from '../controllers/vendasController.js';
import { listar as listarFluxo, criar as criarLancamento, deletar as deletarLancamento, saldo } from '../controllers/fluxoController.js';
import { buscarPorProximidade, detalheNegocio, categorias } from '../controllers/vitrineController.js';
import { listar as listarCapacitacao, criar as criarCapacitacao, seedConteudos } from '../controllers/capacitacaoController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/auth/me', authMiddleware, getMe);
router.put('/auth/me', authMiddleware, updateMe);

router.get('/produtos', authMiddleware, listarProdutos);
router.post('/produtos', authMiddleware, criarProduto);
router.put('/produtos/:id', authMiddleware, atualizarProduto);
router.delete('/produtos/:id', authMiddleware, deletarProduto);
router.post('/produtos/calcular-preco', calcularPreco);

router.get('/clientes', authMiddleware, listarClientes);
router.post('/clientes', authMiddleware, criarCliente);
router.put('/clientes/:id', authMiddleware, atualizarCliente);
router.delete('/clientes/:id', authMiddleware, deletarCliente);
router.get('/clientes/:id/historico', authMiddleware, historico);
router.get('/clientes/:id/alerta-whatsapp', authMiddleware, gerarAlertaWhatsapp);

router.get('/vendas', authMiddleware, listarVendas);
router.post('/vendas', authMiddleware, criarVenda);
router.patch('/vendas/:id/status', authMiddleware, atualizarStatus);
router.get('/vendas/relatorio', authMiddleware, relatorio);

router.get('/fluxo', authMiddleware, listarFluxo);
router.post('/fluxo', authMiddleware, criarLancamento);
router.delete('/fluxo/:id', authMiddleware, deletarLancamento);
router.get('/fluxo/saldo', authMiddleware, saldo);

router.get('/vitrine', buscarPorProximidade);
router.get('/vitrine/categorias', categorias);
router.get('/vitrine/:id', detalheNegocio);

router.get('/capacitacao', listarCapacitacao);
router.post('/capacitacao', authMiddleware, criarCapacitacao);
router.post('/capacitacao/seed', seedConteudos);

export default router;