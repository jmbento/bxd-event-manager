/**
 * Rotas de Autenticação
 */

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const authService = require('../services/auth.service');
const { authenticateToken, requireRole } = require('../middleware/auth.middleware');

/**
 * POST /api/auth/login
 * Login de staff
 */
router.post('/login', [
  body('username').notEmpty().withMessage('Username é obrigatório'),
  body('password').notEmpty().withMessage('Senha é obrigatória')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { username, password } = req.body;
    const result = await authService.login(username, password);
    
    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      ...result
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      error: error.message,
      code: 'AUTH_FAILED'
    });
  }
});

/**
 * GET /api/auth/me
 * Retorna dados do usuário logado
 */
router.get('/me', authenticateToken, (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

/**
 * POST /api/auth/change-password
 * Alterar senha do usuário logado
 */
router.post('/change-password', authenticateToken, [
  body('current_password').notEmpty().withMessage('Senha atual é obrigatória'),
  body('new_password').isLength({ min: 6 }).withMessage('Nova senha deve ter no mínimo 6 caracteres')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { current_password, new_password } = req.body;
    await authService.changePassword(req.user.id, current_password, new_password);
    
    res.json({
      success: true,
      message: 'Senha alterada com sucesso'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/auth/users
 * Criar novo usuário (admin only)
 */
router.post('/users', authenticateToken, requireRole('admin', 'manager'), [
  body('username').notEmpty().withMessage('Username é obrigatório'),
  body('password').isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres'),
  body('full_name').notEmpty().withMessage('Nome completo é obrigatório'),
  body('role').isIn(['admin', 'manager', 'operator', 'viewer']).withMessage('Role inválido')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const user = await authService.createUser(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso',
      user
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/auth/users
 * Listar usuários (admin only)
 */
router.get('/users', authenticateToken, requireRole('admin', 'manager'), async (req, res) => {
  try {
    const users = await authService.listUsers();
    
    res.json({
      success: true,
      users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PATCH /api/auth/users/:id/status
 * Ativar/desativar usuário (admin only)
 */
router.patch('/users/:id/status', authenticateToken, requireRole('admin'), [
  body('is_active').isBoolean().withMessage('is_active deve ser boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { id } = req.params;
    const { is_active } = req.body;
    
    const user = await authService.setUserActive(id, is_active);
    
    res.json({
      success: true,
      message: is_active ? 'Usuário ativado' : 'Usuário desativado',
      user
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
