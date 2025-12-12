/**
 * BXD Event Manager - Organization Routes
 * Rotas para gerenciamento de organizações (multi-tenancy)
 */

const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

// Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
);

/**
 * POST /api/organizations
 * Criar nova organização (com trial de 15 dias)
 */
router.post('/', async (req, res) => {
  try {
    const { name, userId, userEmail } = req.body;

    if (!name || !userId) {
      return res.status(400).json({ 
        error: 'Nome da organização e userId são obrigatórios' 
      });
    }

    // Gerar slug único
    const baseSlug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    
    const slug = `${baseSlug}-${crypto.randomBytes(3).toString('hex')}`;

    // Criar organização com trial de 15 dias
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 15);

    const { data: org, error } = await supabase
      .from('organizations')
      .insert({
        name,
        slug,
        owner_id: userId,
        subscription_status: 'trial',
        subscription_plan: 'starter',
        trial_starts_at: new Date().toISOString(),
        trial_ends_at: trialEndsAt.toISOString(),
        max_events: 1, // Trial = 1 evento
        max_team_members: 3,
        max_transactions: 100
      })
      .select()
      .single();

    if (error) throw error;

    // Adicionar usuário como owner da organização
    await supabase
      .from('organization_members')
      .insert({
        organization_id: org.id,
        user_id: userId,
        role: 'owner',
        accepted_at: new Date().toISOString()
      });

    console.log(`✅ Organização criada: ${org.name} (${org.id})`);
    console.log(`📅 Trial até: ${trialEndsAt.toLocaleDateString('pt-BR')}`);

    res.status(201).json({
      message: 'Organização criada com sucesso!',
      organization: org,
      trial: {
        days: 15,
        ends_at: trialEndsAt.toISOString()
      }
    });
  } catch (error) {
    console.error('Erro ao criar organização:', error);
    res.status(500).json({ error: 'Erro ao criar organização' });
  }
});

/**
 * GET /api/organizations/user/:userId
 * Listar organizações de um usuário
 */
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Buscar organizações onde é owner ou membro
    const { data: memberships, error } = await supabase
      .from('organization_members')
      .select(`
        role,
        organization:organizations (
          id,
          name,
          slug,
          logo_url,
          subscription_status,
          subscription_plan,
          trial_ends_at,
          max_events
        )
      `)
      .eq('user_id', userId);

    if (error) throw error;

    const organizations = memberships.map(m => ({
      ...m.organization,
      my_role: m.role
    }));

    res.json({ organizations });
  } catch (error) {
    console.error('Erro ao listar organizações:', error);
    res.status(500).json({ error: 'Erro ao listar organizações' });
  }
});

/**
 * GET /api/organizations/:id
 * Detalhes de uma organização
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: org, error } = await supabase
      .from('organizations')
      .select(`
        *,
        subscription_plans (*),
        organization_members (
          id,
          role,
          user_id,
          created_at
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!org) {
      return res.status(404).json({ error: 'Organização não encontrada' });
    }

    // Calcular estatísticas
    const now = new Date();
    const trialEnd = new Date(org.trial_ends_at);
    const daysRemaining = Math.max(0, Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24)));

    // Contar eventos
    const { count: eventCount } = await supabase
      .from('campaigns')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', id);

    res.json({
      organization: org,
      stats: {
        trial_days_remaining: daysRemaining,
        is_trial_active: org.subscription_status === 'trial' && daysRemaining > 0,
        events_count: eventCount || 0,
        events_remaining: org.max_events === -1 ? 'unlimited' : Math.max(0, org.max_events - (eventCount || 0)),
        members_count: org.organization_members?.length || 0
      }
    });
  } catch (error) {
    console.error('Erro ao obter organização:', error);
    res.status(500).json({ error: 'Erro ao obter organização' });
  }
});

/**
 * PATCH /api/organizations/:id
 * Atualizar organização
 */
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, logo_url } = req.body;

    const updates = {};
    if (name) updates.name = name;
    if (logo_url !== undefined) updates.logo_url = logo_url;

    const { data: org, error } = await supabase
      .from('organizations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ organization: org });
  } catch (error) {
    console.error('Erro ao atualizar organização:', error);
    res.status(500).json({ error: 'Erro ao atualizar organização' });
  }
});

/**
 * POST /api/organizations/:id/invite
 * Convidar membro para organização
 */
router.post('/:id/invite', async (req, res) => {
  try {
    const { id } = req.params;
    const { email, role = 'member', invitedBy } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email é obrigatório' });
    }

    // Verificar se já é membro
    const { data: existingMember } = await supabase
      .from('organization_members')
      .select('id')
      .eq('organization_id', id)
      .eq('user_id', email) // TODO: buscar user_id pelo email
      .single();

    if (existingMember) {
      return res.status(400).json({ error: 'Usuário já é membro desta organização' });
    }

    // Verificar limite de membros
    const { data: org } = await supabase
      .from('organizations')
      .select('max_team_members, organization_members(id)')
      .eq('id', id)
      .single();

    if (org.max_team_members !== -1 && org.organization_members.length >= org.max_team_members) {
      return res.status(403).json({ 
        error: 'Limite de membros atingido. Faça upgrade do plano.' 
      });
    }

    // Criar convite
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const { data: invite, error } = await supabase
      .from('organization_invites')
      .insert({
        organization_id: id,
        email,
        role,
        token,
        invited_by: invitedBy,
        expires_at: expiresAt.toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    // TODO: Enviar email de convite
    console.log(`📧 TODO: Enviar convite para ${email}`);
    console.log(`🔗 Link: ${process.env.APP_URL}/invite/${token}`);

    res.status(201).json({
      message: 'Convite enviado!',
      invite: {
        id: invite.id,
        email,
        role,
        expires_at: expiresAt.toISOString()
      }
    });
  } catch (error) {
    console.error('Erro ao convidar membro:', error);
    res.status(500).json({ error: 'Erro ao enviar convite' });
  }
});

/**
 * POST /api/organizations/accept-invite
 * Aceitar convite para organização
 */
router.post('/accept-invite', async (req, res) => {
  try {
    const { token, userId } = req.body;

    if (!token || !userId) {
      return res.status(400).json({ error: 'Token e userId são obrigatórios' });
    }

    // Buscar convite
    const { data: invite, error: inviteError } = await supabase
      .from('organization_invites')
      .select('*')
      .eq('token', token)
      .is('accepted_at', null)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (inviteError || !invite) {
      return res.status(404).json({ error: 'Convite inválido ou expirado' });
    }

    // Adicionar como membro
    const { error: memberError } = await supabase
      .from('organization_members')
      .insert({
        organization_id: invite.organization_id,
        user_id: userId,
        role: invite.role,
        invited_by: invite.invited_by,
        invited_at: invite.created_at,
        accepted_at: new Date().toISOString()
      });

    if (memberError) throw memberError;

    // Marcar convite como aceito
    await supabase
      .from('organization_invites')
      .update({ accepted_at: new Date().toISOString() })
      .eq('id', invite.id);

    // Buscar nome da organização
    const { data: org } = await supabase
      .from('organizations')
      .select('name')
      .eq('id', invite.organization_id)
      .single();

    res.json({
      message: 'Convite aceito!',
      organization: {
        id: invite.organization_id,
        name: org?.name
      },
      role: invite.role
    });
  } catch (error) {
    console.error('Erro ao aceitar convite:', error);
    res.status(500).json({ error: 'Erro ao aceitar convite' });
  }
});

/**
 * DELETE /api/organizations/:id/members/:memberId
 * Remover membro da organização
 */
router.delete('/:id/members/:memberId', async (req, res) => {
  try {
    const { id, memberId } = req.params;

    const { error } = await supabase
      .from('organization_members')
      .delete()
      .eq('organization_id', id)
      .eq('id', memberId);

    if (error) throw error;

    res.json({ message: 'Membro removido' });
  } catch (error) {
    console.error('Erro ao remover membro:', error);
    res.status(500).json({ error: 'Erro ao remover membro' });
  }
});

module.exports = router;
