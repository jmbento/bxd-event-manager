/**
 * Rotas de Pulseiras (Wristbands)
 */

const express = require('express');
const router = express.Router();
const { body, query, validationResult } = require('express-validator');
const wristbandService = require('../services/wristband.service');
const attendeeService = require('../services/attendee.service');
const { requirePermission } = require('../middleware/auth.middleware');

/**
 * GET /api/wristbands/:uid/status
 * Obter status completo de uma pulseira
 * Este é o endpoint principal que o app de staff vai usar
 */
router.get('/:uid/status', async (req, res) => {
  try {
    const status = await wristbandService.getStatus(req.params.uid);
    
    res.json({
      success: true,
      ...status
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/wristbands/assign
 * Vincular pulseira a um participante
 * Fluxo completo: cadastra participante (se novo) + vincula pulseira + cria conta cashless
 */
router.post('/assign', requirePermission('can_assign_wristbands'), [
  body('wristband_uid').notEmpty().withMessage('UID da pulseira é obrigatório'),
  body('attendee_id').optional(),
  // Se não tiver attendee_id, precisa dos dados do participante
  body('full_name').optional(),
  body('email').optional().isEmail(),
  body('phone').optional(),
  body('cpf').optional(),
  body('age').optional().isInt({ min: 0, max: 150 }),
  body('city').optional(),
  body('state').optional(),
  body('ticket_type').optional(),
  body('marketing_opt_in').optional().isBoolean(),
  body('privacy_accepted').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { wristband_uid, attendee_id, ...attendeeData } = req.body;
    
    let finalAttendeeId = attendee_id;
    let attendee = null;
    
    // Se não passou attendee_id, verificar se precisa criar um novo
    if (!attendee_id) {
      // Verificar se tem dados suficientes para criar
      if (!attendeeData.full_name) {
        return res.status(400).json({
          success: false,
          error: 'Informe attendee_id ou dados do participante (full_name obrigatório)',
          code: 'MISSING_ATTENDEE_DATA'
        });
      }
      
      // Verificar se já existe por CPF
      if (attendeeData.cpf) {
        const existingByCpf = await attendeeService.findByCpf(attendeeData.cpf);
        if (existingByCpf) {
          finalAttendeeId = existingByCpf.id;
          attendee = existingByCpf;
        }
      }
      
      // Se não encontrou, criar novo
      if (!finalAttendeeId) {
        attendee = await attendeeService.create({
          ...attendeeData,
          created_by: req.user.id
        });
        finalAttendeeId = attendee.id;
      }
    } else {
      // Buscar participante existente
      attendee = await attendeeService.findById(attendee_id);
      if (!attendee) {
        return res.status(404).json({
          success: false,
          error: 'Participante não encontrado',
          code: 'ATTENDEE_NOT_FOUND'
        });
      }
    }
    
    // Vincular pulseira
    const { wristband, account } = await wristbandService.assignToAttendee(
      wristband_uid,
      finalAttendeeId,
      req.user.id
    );
    
    res.status(200).json({
      success: true,
      message: 'Pulseira vinculada com sucesso',
      wristband: {
        id: wristband.id,
        uid: wristband.uid,
        status: wristband.status,
        assigned_at: wristband.assigned_at
      },
      attendee: {
        id: attendee.id,
        full_name: attendee.full_name,
        email: attendee.email,
        ticket_type: attendee.ticket_type
      },
      account: {
        id: account.id,
        balance_cents: account.balance_cents,
        balance_formatted: (account.balance_cents / 100).toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        })
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/wristbands/register
 * Registrar pulseira nova no sistema (sem vincular)
 * Útil para pré-cadastro de lotes
 */
router.post('/register', requirePermission('can_assign_wristbands'), [
  body('uid').notEmpty().withMessage('UID da pulseira é obrigatório'),
  body('batch_code').optional()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { uid, batch_code } = req.body;
    
    // Verificar se já existe
    const existing = await wristbandService.findByUid(uid);
    if (existing) {
      return res.status(409).json({
        success: false,
        error: 'Pulseira já registrada',
        code: 'WRISTBAND_EXISTS',
        wristband: existing
      });
    }
    
    const wristband = await wristbandService.register(uid, batch_code);
    
    res.status(201).json({
      success: true,
      message: 'Pulseira registrada com sucesso',
      wristband
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/wristbands/:uid/block
 * Bloquear pulseira
 */
router.post('/:uid/block', requirePermission('can_assign_wristbands'), [
  body('reason').notEmpty().withMessage('Motivo do bloqueio é obrigatório')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const wristband = await wristbandService.block(
      req.params.uid,
      req.body.reason,
      req.user.id
    );
    
    res.json({
      success: true,
      message: 'Pulseira bloqueada',
      wristband
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/wristbands/:uid/unblock
 * Desbloquear pulseira
 */
router.post('/:uid/unblock', requirePermission('can_assign_wristbands'), async (req, res) => {
  try {
    const wristband = await wristbandService.unblock(req.params.uid);
    
    res.json({
      success: true,
      message: 'Pulseira desbloqueada',
      wristband
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/wristbands/:uid/lost
 * Marcar pulseira como perdida
 */
router.post('/:uid/lost', requirePermission('can_assign_wristbands'), async (req, res) => {
  try {
    const wristband = await wristbandService.markAsLost(req.params.uid, req.user.id);
    
    res.json({
      success: true,
      message: 'Pulseira marcada como perdida',
      wristband
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/wristbands
 * Listar pulseiras
 */
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(['new', 'assigned', 'blocked', 'lost', 'returned', 'damaged']),
  query('hasAttendee').optional().isBoolean(),
  query('search').optional()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { page, limit, status, hasAttendee, search } = req.query;
    
    const result = await wristbandService.list({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 50,
      status,
      hasAttendee: hasAttendee === 'true' ? true : hasAttendee === 'false' ? false : undefined,
      search
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
 * GET /api/wristbands/stats
 * Estatísticas de pulseiras
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = await wristbandService.getStats();
    
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

module.exports = router;
