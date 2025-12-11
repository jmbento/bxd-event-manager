/**
 * BXD Event Manager - Email Routes
 * Rotas para envio de emails (CommonJS)
 */

const express = require('express');
const emailService = require('../services/email.service');

const router = express.Router();

/**
 * POST /api/email/test
 */
router.post('/test', async (req, res) => {
  try {
    const { to } = req.body;
    
    if (!to) {
      return res.status(400).json({ error: 'Email de destino é obrigatório' });
    }

    const result = await emailService.sendTestEmail(to);
    res.json({ success: true, message: 'Email de teste enviado!', messageId: result.messageId });
  } catch (error) {
    console.error('Erro ao enviar email de teste:', error);
    res.status(500).json({ error: 'Falha ao enviar email', details: error.message });
  }
});

/**
 * POST /api/email/invite
 */
router.post('/invite', async (req, res) => {
  try {
    const { to, inviteeName, eventName, role, inviteToken, invitedBy } = req.body;
    
    if (!to || !eventName || !inviteToken) {
      return res.status(400).json({ error: 'Campos obrigatórios: to, eventName, inviteToken' });
    }

    const result = await emailService.sendInviteEmail({
      to, inviteeName: inviteeName || '', eventName,
      role: role || 'viewer', inviteToken, invitedBy: invitedBy || 'Administrador'
    });
    
    res.json({ success: true, message: 'Convite enviado!', messageId: result.messageId });
  } catch (error) {
    console.error('Erro ao enviar convite:', error);
    res.status(500).json({ error: 'Falha ao enviar convite', details: error.message });
  }
});

/**
 * POST /api/email/transaction
 */
router.post('/transaction', async (req, res) => {
  try {
    const { to, eventName, transaction, userName } = req.body;
    
    if (!to || !eventName || !transaction) {
      return res.status(400).json({ error: 'Campos obrigatórios: to, eventName, transaction' });
    }

    const result = await emailService.sendTransactionNotification({
      to, eventName, transaction, userName: userName || 'Sistema'
    });
    
    res.json({ success: true, message: 'Notificação enviada!', messageId: result.messageId });
  } catch (error) {
    console.error('Erro ao enviar notificação:', error);
    res.status(500).json({ error: 'Falha ao enviar notificação', details: error.message });
  }
});

/**
 * POST /api/email/task-reminder
 */
router.post('/task-reminder', async (req, res) => {
  try {
    const { to, eventName, task, dueDate } = req.body;
    
    if (!to || !eventName || !task || !dueDate) {
      return res.status(400).json({ error: 'Campos obrigatórios: to, eventName, task, dueDate' });
    }

    const result = await emailService.sendTaskReminder({ to, eventName, task, dueDate });
    res.json({ success: true, message: 'Lembrete enviado!', messageId: result.messageId });
  } catch (error) {
    console.error('Erro ao enviar lembrete:', error);
    res.status(500).json({ error: 'Falha ao enviar lembrete', details: error.message });
  }
});

/**
 * POST /api/email/checkin
 */
router.post('/checkin', async (req, res) => {
  try {
    const { to, attendeeName, eventName, checkinTime, area } = req.body;
    
    if (!to || !attendeeName || !eventName) {
      return res.status(400).json({ error: 'Campos obrigatórios: to, attendeeName, eventName' });
    }

    const result = await emailService.sendCheckinConfirmation({
      to, attendeeName, eventName,
      checkinTime: checkinTime || new Date().toISOString(),
      area: area || 'Entrada Principal'
    });
    
    res.json({ success: true, message: 'Confirmação enviada!', messageId: result.messageId });
  } catch (error) {
    console.error('Erro ao enviar confirmação:', error);
    res.status(500).json({ error: 'Falha ao enviar confirmação', details: error.message });
  }
});

module.exports = router;
