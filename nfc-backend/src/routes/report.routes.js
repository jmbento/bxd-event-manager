/**
 * Rotas de Relatórios e Leads para Marketing
 */

const express = require('express');
const router = express.Router();
const { query, validationResult } = require('express-validator');
const { supabase } = require('../config/supabase');
const attendeeService = require('../services/attendee.service');
const accessService = require('../services/access.service');
const transactionService = require('../services/transaction.service');
const wristbandService = require('../services/wristband.service');
const { requirePermission } = require('../middleware/auth.middleware');

/**
 * GET /api/reports/leads
 * Listar leads para marketing com filtros avançados
 * Retorna dados estruturados para campanhas de e-mail/SMS/WhatsApp
 */
router.get('/leads', requirePermission('can_view_reports'), [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 500 }),
  query('city').optional(),
  query('state').optional(),
  query('min_age').optional().isInt({ min: 0 }),
  query('max_age').optional().isInt({ max: 150 }),
  query('min_spent_cents').optional().isInt({ min: 0 }),
  query('max_spent_cents').optional().isInt(),
  query('attended').optional().isBoolean(),
  query('ticket_type').optional(),
  query('format').optional().isIn(['json', 'csv'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const {
      page = 1,
      limit = 100,
      city,
      state,
      min_age,
      max_age,
      min_spent_cents,
      max_spent_cents,
      attended,
      ticket_type,
      format = 'json'
    } = req.query;
    
    // Buscar participantes com opt-in de marketing
    let leads = [];
    
    if (supabase) {
      // Usar view do Supabase
      let query = supabase
        .from('v_marketing_leads')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (city) query = query.eq('city', city);
      if (state) query = query.eq('state', state);
      if (min_age) query = query.gte('age', parseInt(min_age));
      if (max_age) query = query.lte('age', parseInt(max_age));
      if (min_spent_cents) query = query.gte('total_spent_cents', parseInt(min_spent_cents));
      if (max_spent_cents) query = query.lte('total_spent_cents', parseInt(max_spent_cents));
      if (attended === 'true') query = query.eq('attended_event', true);
      if (attended === 'false') query = query.eq('attended_event', false);
      
      const { data, error } = await query;
      if (error) throw error;
      
      leads = data || [];
    } else {
      // Fallback em memória - simular com dados do attendeeService
      const { data: attendees } = await attendeeService.list({
        page: 1,
        limit: 1000,
        marketing_opt_in: true
      });
      
      leads = attendees.filter(a => {
        if (city && a.city !== city) return false;
        if (state && a.state !== state) return false;
        if (min_age && (!a.age || a.age < parseInt(min_age))) return false;
        if (max_age && (!a.age || a.age > parseInt(max_age))) return false;
        if (ticket_type && a.ticket_type !== ticket_type) return false;
        return true;
      }).map(a => ({
        id: a.id,
        full_name: a.full_name,
        email: a.email,
        phone: a.phone,
        age: a.age,
        city: a.city,
        state: a.state,
        tags: a.tags,
        created_at: a.created_at,
        total_spent_cents: 0, // Seria calculado das transações
        attended_event: false // Seria verificado nos access_logs
      }));
    }
    
    // Paginação
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const paginatedLeads = leads.slice(offset, offset + parseInt(limit));
    
    // Se formato CSV, retornar arquivo
    if (format === 'csv') {
      const csvHeader = 'Nome,Email,Telefone,Idade,Cidade,Estado,Valor Gasto,Compareceu,Data Cadastro\n';
      const csvRows = paginatedLeads.map(l => 
        `"${l.full_name}","${l.email || ''}","${l.phone || ''}",${l.age || ''},` +
        `"${l.city || ''}","${l.state || ''}",${(l.total_spent_cents || 0) / 100},` +
        `${l.attended_event ? 'Sim' : 'Não'},"${l.created_at}"`
      ).join('\n');
      
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename=leads_${new Date().toISOString().split('T')[0]}.csv`);
      return res.send('\ufeff' + csvHeader + csvRows); // BOM para Excel
    }
    
    // Formato JSON estruturado para integração
    res.json({
      success: true,
      export_info: {
        generated_at: new Date().toISOString(),
        total_leads: leads.length,
        page: parseInt(page),
        limit: parseInt(limit),
        filters_applied: {
          city, state, min_age, max_age, min_spent_cents, max_spent_cents, attended, ticket_type
        }
      },
      leads: paginatedLeads.map(l => ({
        id: l.id,
        contact: {
          name: l.full_name,
          email: l.email,
          phone: l.phone
        },
        demographics: {
          age: l.age,
          city: l.city,
          state: l.state
        },
        engagement: {
          total_spent_brl: (l.total_spent_cents || 0) / 100,
          attended_event: l.attended_event
        },
        tags: l.tags || [],
        registered_at: l.created_at
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: leads.length,
        totalPages: Math.ceil(leads.length / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/reports/dashboard
 * Dashboard consolidado com todas as métricas
 */
router.get('/dashboard', requirePermission('can_view_reports'), async (req, res) => {
  try {
    // Buscar todas as estatísticas em paralelo
    const [attendeeStats, wristbandStats, accessStats, transactionSummary] = await Promise.all([
      attendeeService.getStats(),
      wristbandService.getStats(),
      accessService.getStats(),
      transactionService.getSummary()
    ]);
    
    const formatCurrency = (cents) => (cents / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
    
    res.json({
      success: true,
      generated_at: new Date().toISOString(),
      dashboard: {
        participants: {
          total_registered: attendeeStats.total,
          marketing_opt_in: attendeeStats.withMarketingOptIn,
          opt_in_rate: attendeeStats.total > 0 
            ? ((attendeeStats.withMarketingOptIn / attendeeStats.total) * 100).toFixed(1) + '%'
            : '0%',
          top_cities: attendeeStats.byCity
        },
        wristbands: {
          total: wristbandStats.total,
          new: wristbandStats.new,
          assigned: wristbandStats.assigned,
          blocked: wristbandStats.blocked,
          lost: wristbandStats.lost,
          activation_rate: wristbandStats.total > 0
            ? ((wristbandStats.assigned / wristbandStats.total) * 100).toFixed(1) + '%'
            : '0%'
        },
        access: {
          total_scans: accessStats.total_scans,
          entries_allowed: accessStats.entries_allowed,
          entries_denied: accessStats.entries_denied,
          unique_attendees: accessStats.unique_attendees,
          current_inside_estimate: accessStats.current_inside,
          denial_rate: accessStats.total_scans > 0
            ? ((accessStats.entries_denied / accessStats.total_scans) * 100).toFixed(1) + '%'
            : '0%',
          by_gate: accessStats.by_gate,
          entries_by_hour: accessStats.by_hour_last_24h
        },
        cashless: {
          total_loaded_cents: transactionSummary.total_loaded_cents,
          total_loaded_formatted: formatCurrency(transactionSummary.total_loaded_cents),
          total_spent_cents: transactionSummary.total_spent_cents,
          total_spent_formatted: formatCurrency(transactionSummary.total_spent_cents),
          total_refunded_cents: transactionSummary.total_refunded_cents,
          total_refunded_formatted: formatCurrency(transactionSummary.total_refunded_cents),
          total_in_wallets_cents: transactionSummary.total_in_wallets_cents,
          total_in_wallets_formatted: formatCurrency(transactionSummary.total_in_wallets_cents),
          transaction_count: transactionSummary.transaction_count,
          by_payment_method: transactionSummary.by_payment_method.map(m => ({
            ...m,
            amount_formatted: formatCurrency(m.amount_cents)
          })),
          top_vendors: transactionSummary.by_vendor.slice(0, 10).map(v => ({
            ...v,
            amount_formatted: formatCurrency(v.amount_cents)
          }))
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/reports/summary
 * Resumo simples para tela inicial
 */
router.get('/summary', async (req, res) => {
  try {
    const [attendeeStats, wristbandStats, accessStats] = await Promise.all([
      attendeeService.getStats(),
      wristbandService.getStats(),
      accessService.getStats()
    ]);
    
    res.json({
      success: true,
      summary: {
        total_participants: attendeeStats.total,
        wristbands_assigned: wristbandStats.assigned,
        current_inside: accessStats.current_inside,
        total_entries: accessStats.entries_allowed
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
