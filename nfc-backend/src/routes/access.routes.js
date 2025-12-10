/**
 * Rotas de Controle de Acesso
 */

const express = require('express');
const router = express.Router();
const { body, query, validationResult } = require('express-validator');
const accessService = require('../services/access.service');
const { requirePermission } = require('../middleware/auth.middleware');

/**
 * POST /api/access-logs/check-in
 * Verificar e registrar acesso (entrada ou saída)
 * Este é o endpoint principal para controle de acesso nos portões
 */
router.post('/check-in', requirePermission('can_check_access'), [
  body('wristband_uid').notEmpty().withMessage('UID da pulseira é obrigatório'),
  body('gate').notEmpty().withMessage('Portão é obrigatório'),
  body('direction').optional().isIn(['in', 'out']).withMessage('Direção deve ser "in" ou "out"')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { wristband_uid, gate, direction, latitude, longitude } = req.body;
    
    const result = await accessService.checkAccess({
      wristband_uid,
      gate,
      direction: direction || 'in',
      operator_id: req.user.id,
      operator_name: req.user.full_name || req.user.username,
      latitude,
      longitude
    });
    
    // Resposta com status HTTP adequado
    if (result.allowed) {
      res.json({
        success: true,
        ...result
      });
    } else {
      res.status(403).json({
        success: false,
        ...result
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/access-logs
 * Listar logs de acesso
 */
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('gate').optional(),
  query('status').optional().isIn(['allowed', 'denied', 'manual_override']),
  query('direction').optional().isIn(['in', 'out']),
  query('wristband_uid').optional(),
  query('from_date').optional().isISO8601(),
  query('to_date').optional().isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { page, limit, gate, status, direction, wristband_uid, from_date, to_date } = req.query;
    
    const result = await accessService.listLogs({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 50,
      gate,
      status,
      direction,
      wristband_uid,
      from_date,
      to_date
    });
    
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/access-logs/wristband/:uid/history
 * Histórico de acesso de uma pulseira
 */
router.get('/wristband/:uid/history', async (req, res) => {
  try {
    const result = await accessService.getWristbandHistory(req.params.uid);
    
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/access-logs/stats
 * Estatísticas de acesso
 */
router.get('/stats', [
  query('gate').optional(),
  query('from_date').optional().isISO8601(),
  query('to_date').optional().isISO8601()
], async (req, res) => {
  try {
    const { gate, from_date, to_date } = req.query;
    
    const stats = await accessService.getStats({ gate, from_date, to_date });
    
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/access-logs/gates
 * Listar portões configurados
 */
router.get('/gates', async (req, res) => {
  try {
    const gates = await accessService.listGates();
    
    res.json({
      success: true,
      gates
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
