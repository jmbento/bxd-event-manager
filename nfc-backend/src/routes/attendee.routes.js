/**
 * Rotas de Participantes (Attendees)
 */

const express = require('express');
const router = express.Router();
const { body, query, validationResult } = require('express-validator');
const attendeeService = require('../services/attendee.service');
const { requirePermission } = require('../middleware/auth.middleware');

/**
 * POST /api/attendees
 * Criar/cadastrar participante
 */
router.post('/', requirePermission('can_register_attendees'), [
  body('full_name').notEmpty().withMessage('Nome completo é obrigatório'),
  body('email').optional().isEmail().withMessage('E-mail inválido'),
  body('phone').optional(),
  body('cpf').optional(),
  body('age').optional().isInt({ min: 0, max: 150 }).withMessage('Idade inválida'),
  body('city').optional(),
  body('state').optional().isLength({ max: 2 }).withMessage('Estado deve ter 2 caracteres'),
  body('ticket_type').optional().isIn(['standard', 'vip', 'backstage', 'staff', 'press']),
  body('marketing_opt_in').optional().isBoolean(),
  body('privacy_accepted').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    // Verificar se já existe por CPF ou email
    if (req.body.cpf) {
      const existingByCpf = await attendeeService.findByCpf(req.body.cpf);
      if (existingByCpf) {
        return res.status(409).json({
          success: false,
          error: 'CPF já cadastrado',
          code: 'CPF_EXISTS',
          existing_attendee_id: existingByCpf.id
        });
      }
    }
    
    if (req.body.email) {
      const existingByEmail = await attendeeService.findByEmail(req.body.email);
      if (existingByEmail) {
        return res.status(409).json({
          success: false,
          error: 'E-mail já cadastrado',
          code: 'EMAIL_EXISTS',
          existing_attendee_id: existingByEmail.id
        });
      }
    }
    
    const attendee = await attendeeService.create({
      ...req.body,
      created_by: req.user.id
    });
    
    res.status(201).json({
      success: true,
      message: 'Participante cadastrado com sucesso',
      attendee
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/attendees
 * Listar participantes
 */
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('city').optional(),
  query('state').optional(),
  query('ticket_type').optional(),
  query('marketing_opt_in').optional().isBoolean(),
  query('search').optional()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { page, limit, city, state, ticket_type, marketing_opt_in, search } = req.query;
    
    const result = await attendeeService.list({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 50,
      city,
      state,
      ticket_type,
      marketing_opt_in: marketing_opt_in === 'true' ? true : marketing_opt_in === 'false' ? false : undefined,
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
 * GET /api/attendees/stats
 * Estatísticas de participantes
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = await attendeeService.getStats();
    
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
 * GET /api/attendees/:id
 * Buscar participante por ID
 */
router.get('/:id', async (req, res) => {
  try {
    const attendee = await attendeeService.findById(req.params.id);
    
    if (!attendee) {
      return res.status(404).json({
        success: false,
        error: 'Participante não encontrado',
        code: 'NOT_FOUND'
      });
    }
    
    res.json({
      success: true,
      attendee
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/attendees/cpf/:cpf
 * Buscar participante por CPF
 */
router.get('/cpf/:cpf', async (req, res) => {
  try {
    const attendee = await attendeeService.findByCpf(req.params.cpf);
    
    if (!attendee) {
      return res.status(404).json({
        success: false,
        error: 'Participante não encontrado',
        code: 'NOT_FOUND'
      });
    }
    
    res.json({
      success: true,
      attendee
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PUT /api/attendees/:id
 * Atualizar participante
 */
router.put('/:id', requirePermission('can_register_attendees'), [
  body('full_name').optional().notEmpty(),
  body('email').optional().isEmail(),
  body('age').optional().isInt({ min: 0, max: 150 }),
  body('marketing_opt_in').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const attendee = await attendeeService.update(req.params.id, req.body);
    
    if (!attendee) {
      return res.status(404).json({
        success: false,
        error: 'Participante não encontrado',
        code: 'NOT_FOUND'
      });
    }
    
    res.json({
      success: true,
      message: 'Participante atualizado com sucesso',
      attendee
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/attendees/:id
 * Soft delete (LGPD)
 */
router.delete('/:id', requirePermission('can_manage_staff'), async (req, res) => {
  try {
    const attendee = await attendeeService.softDelete(req.params.id);
    
    if (!attendee) {
      return res.status(404).json({
        success: false,
        error: 'Participante não encontrado',
        code: 'NOT_FOUND'
      });
    }
    
    res.json({
      success: true,
      message: 'Participante removido com sucesso'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/attendees/:id/anonymize
 * Anonimizar dados (LGPD)
 */
router.post('/:id/anonymize', requirePermission('can_manage_staff'), async (req, res) => {
  try {
    const attendee = await attendeeService.anonymize(req.params.id);
    
    if (!attendee) {
      return res.status(404).json({
        success: false,
        error: 'Participante não encontrado',
        code: 'NOT_FOUND'
      });
    }
    
    res.json({
      success: true,
      message: 'Dados do participante anonimizados conforme LGPD'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
