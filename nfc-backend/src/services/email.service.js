/**
 * BXD Event Manager - Email Service
 * Serviço profissional de envio de emails usando Resend
 */

const { Resend } = require('resend');

// Inicializa o cliente Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Configurações
const FROM_EMAIL = process.env.FROM_EMAIL || 'BXD Events <noreply@resend.dev>';
const APP_NAME = 'BXD Event Manager';
const APP_URL = process.env.APP_URL || 'http://localhost:3000';

/**
 * Template base para emails
 */
const baseTemplate = (content, footerText = '') => `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${APP_NAME}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f1f5f9;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); padding: 30px; border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">
                🎪 ${APP_NAME}
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              ${content}
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8fafc; padding: 20px 30px; border-radius: 0 0 12px 12px; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; color: #64748b; font-size: 12px; text-align: center;">
                ${footerText || `© ${new Date().getFullYear()} ${APP_NAME}. Todos os direitos reservados.`}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

/**
 * Envia email de teste
 */
async function sendTestEmail(to) {
  const content = `
    <h2 style="margin: 0 0 20px; color: #1e293b; font-size: 22px;">
      🎉 Email de Teste
    </h2>
    <p style="margin: 0 0 20px; color: #475569; font-size: 16px; line-height: 1.6;">
      Parabéns! A configuração do serviço de emails está funcionando corretamente.
    </p>
    <div style="background-color: #f0fdf4; border: 2px dashed #22c55e; padding: 20px; margin: 20px 0; border-radius: 8px; text-align: center;">
      <p style="margin: 0; color: #16a34a; font-size: 18px; font-weight: 600;">
        ✅ Tudo funcionando!
      </p>
    </div>
  `;

  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: [to],
    subject: `�� Teste de Email - ${APP_NAME}`,
    html: baseTemplate(content),
  });

  if (error) throw new Error(error.message);
  return { success: true, messageId: data?.id };
}

/**
 * Envia convite para membro
 */
async function sendInviteEmail({ to, inviteeName, eventName, role, inviteToken, invitedBy }) {
  const inviteUrl = `${APP_URL}/invite/${inviteToken}`;
  const roleLabels = { admin: 'Administrador', editor: 'Editor', viewer: 'Visualizador' };
  
  const content = `
    <h2 style="margin: 0 0 20px; color: #1e293b;">Olá${inviteeName ? `, ${inviteeName}` : ''}! 👋</h2>
    <p style="color: #475569;">Você foi convidado por <strong>${invitedBy}</strong> para participar do evento:</p>
    <div style="background-color: #f0f9ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 20px 0;">
      <h3 style="margin: 0; color: #1e40af;">🎉 ${eventName}</h3>
      <p style="margin: 10px 0 0; color: #3b82f6;">Papel: <strong>${roleLabels[role] || role}</strong></p>
    </div>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${inviteUrl}" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600;">
        ✅ Aceitar Convite
      </a>
    </div>
  `;

  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: [to],
    subject: `🎪 Convite para ${eventName}`,
    html: baseTemplate(content),
  });

  if (error) throw new Error(error.message);
  return { success: true, messageId: data?.id };
}

/**
 * Envia notificação de transação
 */
async function sendTransactionNotification({ to, eventName, transaction, userName }) {
  const isIncome = transaction.amount > 0;
  const formattedAmount = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Math.abs(transaction.amount));

  const content = `
    <h2 style="margin: 0 0 20px; color: #1e293b;">Nova Transação 💰</h2>
    <div style="background-color: ${isIncome ? '#f0fdf4' : '#fef2f2'}; border-left: 4px solid ${isIncome ? '#22c55e' : '#ef4444'}; padding: 20px; margin: 20px 0;">
      <p style="color: #1e293b;"><strong>Descrição:</strong> ${transaction.description}</p>
      <p style="color: ${isIncome ? '#16a34a' : '#dc2626'}; font-size: 24px; font-weight: 700;">
        ${isIncome ? '+' : '-'} ${formattedAmount}
      </p>
      <p style="color: #64748b; font-size: 13px;">Categoria: ${transaction.category} | Por: ${userName}</p>
    </div>
  `;

  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: [to],
    subject: `${isIncome ? '📈' : '📉'} ${formattedAmount} - ${eventName}`,
    html: baseTemplate(content),
  });

  if (error) throw new Error(error.message);
  return { success: true, messageId: data?.id };
}

/**
 * Envia lembrete de tarefa
 */
async function sendTaskReminder({ to, eventName, task, dueDate }) {
  const formattedDate = new Date(dueDate).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

  const content = `
    <h2 style="margin: 0 0 20px; color: #1e293b;">⏰ Lembrete de Tarefa</h2>
    <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0;">
      <h3 style="margin: 0; color: #92400e;">📋 ${task.title}</h3>
      <p style="color: #b45309; margin-top: 10px;">📅 Prazo: ${formattedDate}</p>
    </div>
  `;

  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: [to],
    subject: `⏰ Lembrete: "${task.title}" - ${eventName}`,
    html: baseTemplate(content),
  });

  if (error) throw new Error(error.message);
  return { success: true, messageId: data?.id };
}

/**
 * Envia confirmação de check-in
 */
async function sendCheckinConfirmation({ to, attendeeName, eventName, checkinTime, area }) {
  const formattedTime = new Date(checkinTime).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const content = `
    <h2 style="margin: 0 0 20px; color: #1e293b;">✅ Check-in Confirmado!</h2>
    <p style="color: #475569;">Olá <strong>${attendeeName}</strong>, seu check-in foi registrado!</p>
    <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 20px; margin: 20px 0;">
      <p style="color: #166534;">🎪 <strong>${eventName}</strong></p>
      <p style="color: #15803d;">📍 Área: ${area || 'Entrada Principal'}</p>
      <p style="color: #16a34a;">🕐 Horário: ${formattedTime}</p>
    </div>
  `;

  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: [to],
    subject: `✅ Check-in confirmado - ${eventName}`,
    html: baseTemplate(content),
  });

  if (error) throw new Error(error.message);
  return { success: true, messageId: data?.id };
}

module.exports = {
  sendTestEmail,
  sendInviteEmail,
  sendTransactionNotification,
  sendTaskReminder,
  sendCheckinConfirmation
};
