/**
 * Rotas de Contas Cashless
 */

const express = require('express');
const router = express.Router();
const { query, validationResult } = require('express-validator');
const transactionService = require('../services/transaction.service');

/**
 * GET /api/accounts/:wristband_uid/balance
 * Obter saldo e extrato de uma pulseira
 */
router.get('/:wristband_uid/balance', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { page, limit } = req.query;
    
    const result = await transactionService.getStatement(req.params.wristband_uid, {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20
    });
    
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

module.exports = router;
