/**
 * BXD Event Manager - Email Service
 * Serviço profissional de envio de emails usando Resend
 */

import { Resend } from 'resend';

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
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); padding: 30px; border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">
                🎪 ${APP_NAME}
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              ${content}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 20px 30px; border-radius: 0 0 12px 12px; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; color: #64748b; font-size: 12px; text-align: center;">
                ${footerText || `© ${new Date().getFullYear()} ${APP_NAME}. Todos os direitos reservados.`}
              </p>
              <p style="margin: 10px 0 0; color: #94a3b8; font-size: 11px; text-align: center;">
                Este email foi enviado automaticamente. Por favor, não responda.
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
 * Envia convite para membro do evento
 */
export async function sendInviteEmail({ to, inviteeName, eventName, role, inviteToken, invitedBy }) {
  const inviteUrl = `${APP_URL}/invite/${inviteToken}`;
  
  const roleLabels = {
    admin: 'Administrador',
    editor: 'Editor',
    viewer: 'Visualizador'
  };
  
  const content = `
    <h2 style="margin: 0 0 20px; color: #1e293b; font-size: 22px;">
      Olá${inviteeName ? `, ${inviteeName}` : ''}! 👋
    </h2>
    
    <p style="margin: 0 0 20px; color: #475569; font-size: 16px; line-height: 1.6;">
      Você foi convidado por <strong>${invitedBy}</strong> para participar do evento:
    </p>
    
    <div style="background-color: #f0f9ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
      <h3 style="margin: 0 0 10px; color: #1e40af; font-size: 20px;">
        🎉 ${eventName}
      </h3>
      <p style="margin: 0; color: #3b82f6; font-size: 14px;">
        Seu papel: <strong>${roleLabels[role] || role}</strong>
      </p>
    </div>
    
    <p style="margin: 20px 0; color: #475569; font-size: 16px; line-height: 1.6;">
      Clique no botão abaixo para aceitar o convite e começar a colaborar:
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${inviteUrl}" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 14px rgba(59, 130, 246, 0.4);">
        ✅ Aceitar Convite
      </a>
    </div>
    
    <p style="margin: 20px 0 0; color: #94a3b8; font-size: 13px;">
      Ou copie e cole este link no seu navegador:<br>
      <a href="${inviteUrl}" style="color: #3b82f6; word-break: break-all;">${inviteUrl}</a>
    </p>
    
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
      <p style="margin: 0; color: #94a3b8; font-size: 12px;">
        ⏰ Este convite expira em 7 dias.
      </p>
    </div>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: `🎪 Convite para ${eventName} - ${APP_NAME}`,
      html: baseTemplate(content),
    });

    if (error) {
      console.error('Erro ao enviar email de convite:', error);
      throw new Error(error.message);
    }

    console.log('✅ Email de convite enviado:', data?.id);
    return { success: true, messageId: data?.id };
  } catch (err) {
    console.error('Erro ao enviar email:', err);
    throw err;
  }
}

/**
 * Envia notificação de nova transação
 */
export async function sendTransactionNotification({ to, eventName, transaction, userName }) {
  const isIncome = transaction.amount > 0;
  const formattedAmount = new Intl.NumberFormat('pt-BR', { 
    style: 'currency', 
    currency: 'BRL' 
  }).format(Math.abs(transaction.amount));

  const content = `
    <h2 style="margin: 0 0 20px; color: #1e293b; font-size: 22px;">
      Nova Transação Registrada 💰
    </h2>
    
    <p style="margin: 0 0 20px; color: #475569; font-size: 16px; line-height: 1.6;">
      Uma nova transação foi registrada no evento <strong>${eventName}</strong>:
    </p>
    
    <div style="background-color: ${isIncome ? '#f0fdf4' : '#fef2f2'}; border-left: 4px solid ${isIncome ? '#22c55e' : '#ef4444'}; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
      <p style="margin: 0 0 10px; color: #1e293b; font-size: 14px;">
        <strong>Descrição:</strong> ${transaction.description}
      </p>
      <p style="margin: 0 0 10px; color: ${isIncome ? '#16a34a' : '#dc2626'}; font-size: 24px; font-weight: 700;">
        ${isIncome ? '+' : '-'} ${formattedAmount}
      </p>
      <p style="margin: 0; color: #64748b; font-size: 13px;">
        Categoria: ${transaction.category} | Registrado por: ${userName}
      </p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${APP_URL}/finance" style="display: inline-block; background-color: #f1f5f9; color: #475569; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 500;">
        Ver Detalhes no Sistema →
      </a>
    </div>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: `${isIncome ? '📈' : '📉'} ${isIncome ? 'Entrada' : 'Saída'}: ${formattedAmount} - ${eventName}`,
      html: baseTemplate(content),
    });

    if (error) {
      console.error('Erro ao enviar notificação:', error);
      throw new Error(error.message);
    }

    return { success: true, messageId: data?.id };
  } catch (err) {
    console.error('Erro ao enviar email:', err);
    throw err;
  }
}

/**
 * Envia lembrete de tarefa
 */
export async function sendTaskReminder({ to, eventName, task, dueDate }) {
  const formattedDate = new Date(dueDate).toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });

  const content = `
    <h2 style="margin: 0 0 20px; color: #1e293b; font-size: 22px;">
      ⏰ Lembrete de Tarefa
    </h2>
    
    <p style="margin: 0 0 20px; color: #475569; font-size: 16px; line-height: 1.6;">
      Você tem uma tarefa com prazo se aproximando no evento <strong>${eventName}</strong>:
    </p>
    
    <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
      <h3 style="margin: 0 0 10px; color: #92400e; font-size: 18px;">
        📋 ${task.title}
      </h3>
      ${task.description ? `<p style="margin: 0 0 10px; color: #78716c; font-size: 14px;">${task.description}</p>` : ''}
      <p style="margin: 0; color: #b45309; font-size: 14px; font-weight: 600;">
        📅 Prazo: ${formattedDate}
      </p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${APP_URL}/tasks" style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600;">
        Ver Tarefa →
      </a>
    </div>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: `⏰ Lembrete: "${task.title}" - ${eventName}`,
      html: baseTemplate(content),
    });

    if (error) {
      console.error('Erro ao enviar lembrete:', error);
      throw new Error(error.message);
    }

    return { success: true, messageId: data?.id };
  } catch (err) {
    console.error('Erro ao enviar email:', err);
    throw err;
  }
}

/**
 * Envia confirmação de check-in NFC
 */
export async function sendCheckinConfirmation({ to, attendeeName, eventName, checkinTime, area }) {
  const formattedTime = new Date(checkinTime).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const content = `
    <h2 style="margin: 0 0 20px; color: #1e293b; font-size: 22px;">
      ✅ Check-in Confirmado!
    </h2>
    
    <p style="margin: 0 0 20px; color: #475569; font-size: 16px; line-height: 1.6;">
      Olá <strong>${attendeeName}</strong>, seu check-in foi registrado com sucesso!
    </p>
    
    <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
      <p style="margin: 0 0 8px; color: #166534; font-size: 16px;">
        🎪 <strong>${eventName}</strong>
      </p>
      <p style="margin: 0 0 8px; color: #15803d; font-size: 14px;">
        📍 Área: ${area || 'Entrada Principal'}
      </p>
      <p style="margin: 0; color: #16a34a; font-size: 14px;">
        🕐 Horário: ${formattedTime}
      </p>
    </div>
    
    <p style="margin: 20px 0; color: #475569; font-size: 16px; line-height: 1.6;">
      Aproveite o evento! 🎉
    </p>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: `✅ Check-in confirmado - ${eventName}`,
      html: baseTemplate(content),
    });

    if (error) {
      console.error('Erro ao enviar confirmação:', error);
      throw new Error(error.message);
    }

    return { success: true, messageId: data?.id };
  } catch (err) {
    console.error('Erro ao enviar email:', err);
    throw err;
  }
}

/**
 * Envia email de teste
 */
export async function sendTestEmail(to) {
  const content = `
    <h2 style="margin: 0 0 20px; color: #1e293b; font-size: 22px;">
      🎉 Email de Teste
    </h2>
    
    <p style="margin: 0 0 20px; color: #475569; font-size: 16px; line-height: 1.6;">
      Parabéns! Se você está lendo este email, significa que a configuração do serviço de emails está funcionando corretamente.
    </p>
    
    <div style="background-color: #f0fdf4; border: 2px dashed #22c55e; padding: 20px; margin: 20px 0; border-radius: 8px; text-align: center;">
      <p style="margin: 0; color: #16a34a; font-size: 18px; font-weight: 600;">
        ✅ Tudo funcionando!
      </p>
    </div>
    
    <p style="margin: 20px 0; color: #475569; font-size: 14px;">
      Agora você pode enviar convites, notificações e lembretes para os membros do seu evento.
    </p>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: `🧪 Teste de Email - ${APP_NAME}`,
      html: baseTemplate(content),
    });

    if (error) {
      console.error('Erro ao enviar email de teste:', error);
      throw new Error(error.message);
    }

    console.log('✅ Email de teste enviado:', data?.id);
    return { success: true, messageId: data?.id };
  } catch (err) {
    console.error('Erro ao enviar email:', err);
    throw err;
  }
}

export default {
  sendInviteEmail,
  sendTransactionNotification,
  sendTaskReminder,
  sendCheckinConfirmation,
  sendTestEmail
};
