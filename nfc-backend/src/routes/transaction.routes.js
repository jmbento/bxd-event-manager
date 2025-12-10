/**
 * Rotas de Transações Cashless
 */

const express = require('express');
const router = express.Router();
const { body, query, validationResult } = require('express-validator');
const transactionService = require('../services/transaction.service');
const { requirePermission } = require('../middleware/auth.middleware');

/**
 * POST /api/transactions/topup
 * Realizar recarga de créditos na pulseira
 */
router.post('/topup', requirePermission('can_topup'), [
  body('wristband_uid').notEmpty().withMessage('UID da pulseira é obrigatório'),
  body('amount_cents').isInt({ min: 1 }).withMessage('Valor deve ser positivo (em centavos)'),
  body('method').isIn(['pix', 'credit_card', 'debit_card', 'cash', 'promo', 'voucher']).withMessage('Método de pagamento inválido'),
  body('pos_reference').optional(),
  body('description').optional()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { wristband_uid, amount_cents, method, pos_reference, description } = req.body;
    
    const result = await transactionService.topup({
      wristband_uid,
      amount_cents,
      method,
      pos_reference,
      description,
      processed_by: req.user.id
    });
    
    res.json({
      success: true,
      message: 'Recarga realizada com sucesso',
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
 * POST /api/transactions/purchase
 * Registrar compra (débito do saldo)
 */
router.post('/purchase', requirePermission('can_process_purchase'), [
  body('wristband_uid').notEmpty().withMessage('UID da pulseira é obrigatório'),
  body('amount_cents').isInt({ min: 1 }).withMessage('Valor deve ser positivo (em centavos)'),
  body('description').optional(),
  body('category').optional(),
  body('vendor_id').optional(),
  body('vendor_name').optional()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { wristband_uid, amount_cents, description, category, vendor_id, vendor_name } = req.body;
    
    const result = await transactionService.purchase({
      wristband_uid,
      amount_cents,
      description,
      category,
      vendor_id,
      vendor_name,
      processed_by: req.user.id
    });
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Compra registrada com sucesso',
        ...result
      });
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/transactions/:id/refund
 * Estornar transação
 */
router.post('/:id/refund', requirePermission('can_refund'), async (req, res) => {
  try {
    const result = await transactionService.refund(req.params.id, req.user.id);
    
    res.json({
      success: true,
      message: 'Estorno realizado com sucesso',
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
 * GET /api/transactions/summary
 * Resumo financeiro geral
 */
router.get('/summary', requirePermission('can_view_reports'), async (req, res) => {
  try {
    const summary = await transactionService.getSummary();
    
    // Formatar valores para exibição
    const formatCurrency = (cents) => (cents / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
    
    res.json({
      success: true,
      summary: {
        ...summary,
        total_loaded_formatted: formatCurrency(summary.total_loaded_cents),
        total_spent_formatted: formatCurrency(summary.total_spent_cents),
        total_refunded_formatted: formatCurrency(summary.total_refunded_cents),
        total_in_wallets_formatted: formatCurrency(summary.total_in_wallets_cents)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
