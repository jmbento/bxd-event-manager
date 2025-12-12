/**
 * BXD Event Manager - Subscription Routes
 * Rotas para gerenciamento de assinaturas
 */

const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const stripeService = require('../services/stripe.service');

// Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
);

/**
 * GET /api/subscription/plans
 * Lista todos os planos disponíveis
 */
router.get('/plans', async (req, res) => {
  try {
    const { data: plans, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;

    // Formatar preços para exibição
    const formattedPlans = plans.map(plan => ({
      ...plan,
      price_monthly_display: (plan.price_monthly / 100).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }),
      price_yearly_display: (plan.price_yearly / 100).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }),
      price_yearly_monthly: ((plan.price_yearly / 12) / 100).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }),
      yearly_savings: Math.round((1 - (plan.price_yearly / (plan.price_monthly * 12))) * 100)
    }));

    res.json({ plans: formattedPlans });
  } catch (error) {
    console.error('Erro ao listar planos:', error);
    res.status(500).json({ error: 'Erro ao listar planos' });
  }
});

/**
 * GET /api/subscription/status/:organizationId
 * Status da assinatura de uma organização
 */
router.get('/status/:organizationId', async (req, res) => {
  try {
    const { organizationId } = req.params;

    const { data: org, error } = await supabase
      .from('organizations')
      .select(`
        *,
        subscription_plans (*)
      `)
      .eq('id', organizationId)
      .single();

    if (error) throw error;
    if (!org) {
      return res.status(404).json({ error: 'Organização não encontrada' });
    }

    // Calcular dias restantes
    const now = new Date();
    const trialEnd = new Date(org.trial_ends_at);
    const daysRemaining = Math.max(0, Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24)));

    // Verificar status real
    let effectiveStatus = org.subscription_status;
    if (org.subscription_status === 'trial' && daysRemaining === 0) {
      effectiveStatus = 'expired';
    }

    res.json({
      organization_id: org.id,
      name: org.name,
      status: effectiveStatus,
      plan: org.subscription_plans || {
        id: org.subscription_plan,
        name: org.subscription_plan.charAt(0).toUpperCase() + org.subscription_plan.slice(1)
      },
      trial: {
        is_trial: org.subscription_status === 'trial',
        starts_at: org.trial_starts_at,
        ends_at: org.trial_ends_at,
        days_remaining: daysRemaining
      },
      subscription: {
        starts_at: org.subscription_starts_at,
        ends_at: org.subscription_ends_at,
        canceled_at: org.canceled_at
      },
      limits: {
        max_events: org.max_events,
        max_team_members: org.max_team_members,
        max_transactions: org.max_transactions
      },
      can_access: effectiveStatus === 'active' || (effectiveStatus === 'trial' && daysRemaining > 0)
    });
  } catch (error) {
    console.error('Erro ao obter status:', error);
    res.status(500).json({ error: 'Erro ao obter status da assinatura' });
  }
});

/**
 * POST /api/subscription/checkout
 * Criar sessão de checkout do Stripe
 */
router.post('/checkout', async (req, res) => {
  try {
    const { organizationId, planId, billingPeriod = 'monthly' } = req.body;

    if (!organizationId || !planId) {
      return res.status(400).json({ 
        error: 'organizationId e planId são obrigatórios' 
      });
    }

    // Buscar organização
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', organizationId)
      .single();

    if (orgError || !org) {
      return res.status(404).json({ error: 'Organização não encontrada' });
    }

    // Criar cliente Stripe se não existir
    let customerId = org.stripe_customer_id;
    
    if (!customerId) {
      // Buscar email do owner
      const { data: owner } = await supabase
        .auth.admin.getUserById(org.owner_id);

      const customer = await stripeService.createCustomer({
        email: owner?.user?.email || `org-${org.id}@bxd.events`,
        name: org.name,
        organizationId: org.id
      });

      customerId = customer.id;

      // Salvar customer_id na organização
      await supabase
        .from('organizations')
        .update({ stripe_customer_id: customerId })
        .eq('id', organizationId);
    }

    // Obter price_id do Stripe
    const priceId = stripeService.getPriceId(planId, billingPeriod);

    // Criar sessão de checkout
    const session = await stripeService.createCheckoutSession({
      customerId,
      priceId,
      organizationId,
      successUrl: `${process.env.APP_URL}/settings/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${process.env.APP_URL}/settings/billing?canceled=true`,
      metadata: {
        plan_id: planId,
        billing_period: billingPeriod
      }
    });

    res.json({ 
      checkoutUrl: session.url,
      sessionId: session.id
    });
  } catch (error) {
    console.error('Erro ao criar checkout:', error);
    res.status(500).json({ 
      error: 'Erro ao criar sessão de checkout',
      details: error.message 
    });
  }
});

/**
 * POST /api/subscription/portal
 * Criar sessão do portal do cliente Stripe
 */
router.post('/portal', async (req, res) => {
  try {
    const { organizationId } = req.body;

    if (!organizationId) {
      return res.status(400).json({ error: 'organizationId é obrigatório' });
    }

    // Buscar organização
    const { data: org, error } = await supabase
      .from('organizations')
      .select('stripe_customer_id')
      .eq('id', organizationId)
      .single();

    if (error || !org?.stripe_customer_id) {
      return res.status(404).json({ 
        error: 'Organização não encontrada ou sem cliente Stripe' 
      });
    }

    const session = await stripeService.createPortalSession({
      customerId: org.stripe_customer_id,
      returnUrl: `${process.env.APP_URL}/settings/billing`
    });

    res.json({ portalUrl: session.url });
  } catch (error) {
    console.error('Erro ao criar portal:', error);
    res.status(500).json({ error: 'Erro ao criar portal do cliente' });
  }
});

/**
 * POST /api/subscription/cancel
 * Cancelar assinatura
 */
router.post('/cancel', async (req, res) => {
  try {
    const { organizationId, immediately = false } = req.body;

    if (!organizationId) {
      return res.status(400).json({ error: 'organizationId é obrigatório' });
    }

    // Buscar organização
    const { data: org, error } = await supabase
      .from('organizations')
      .select('stripe_subscription_id')
      .eq('id', organizationId)
      .single();

    if (error || !org?.stripe_subscription_id) {
      return res.status(404).json({ error: 'Assinatura não encontrada' });
    }

    // Cancelar no Stripe
    const subscription = await stripeService.cancelSubscription(
      org.stripe_subscription_id,
      !immediately // cancel_at_period_end
    );

    // Atualizar no banco
    await supabase
      .from('organizations')
      .update({
        subscription_status: immediately ? 'canceled' : 'active', // ainda ativa até o fim do período
        canceled_at: new Date().toISOString()
      })
      .eq('id', organizationId);

    res.json({
      message: immediately 
        ? 'Assinatura cancelada imediatamente'
        : 'Assinatura será cancelada no fim do período',
      cancel_at: subscription.cancel_at 
        ? new Date(subscription.cancel_at * 1000).toISOString() 
        : null
    });
  } catch (error) {
    console.error('Erro ao cancelar:', error);
    res.status(500).json({ error: 'Erro ao cancelar assinatura' });
  }
});

/**
 * POST /api/subscription/reactivate
 * Reativar assinatura cancelada
 */
router.post('/reactivate', async (req, res) => {
  try {
    const { organizationId } = req.body;

    if (!organizationId) {
      return res.status(400).json({ error: 'organizationId é obrigatório' });
    }

    // Buscar organização
    const { data: org, error } = await supabase
      .from('organizations')
      .select('stripe_subscription_id')
      .eq('id', organizationId)
      .single();

    if (error || !org?.stripe_subscription_id) {
      return res.status(404).json({ error: 'Assinatura não encontrada' });
    }

    // Reativar no Stripe
    await stripeService.reactivateSubscription(org.stripe_subscription_id);

    // Atualizar no banco
    await supabase
      .from('organizations')
      .update({
        subscription_status: 'active',
        canceled_at: null
      })
      .eq('id', organizationId);

    res.json({ message: 'Assinatura reativada com sucesso!' });
  } catch (error) {
    console.error('Erro ao reativar:', error);
    res.status(500).json({ error: 'Erro ao reativar assinatura' });
  }
});

/**
 * GET /api/subscription/invoices/:organizationId
 * Listar faturas
 */
router.get('/invoices/:organizationId', async (req, res) => {
  try {
    const { organizationId } = req.params;

    // Buscar organização
    const { data: org, error } = await supabase
      .from('organizations')
      .select('stripe_customer_id')
      .eq('id', organizationId)
      .single();

    if (error || !org?.stripe_customer_id) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    const invoices = await stripeService.getInvoices(org.stripe_customer_id);

    const formattedInvoices = invoices.map(inv => ({
      id: inv.id,
      number: inv.number,
      status: inv.status,
      amount: (inv.amount_paid / 100).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }),
      amount_cents: inv.amount_paid,
      created_at: new Date(inv.created * 1000).toISOString(),
      paid_at: inv.status_transitions?.paid_at 
        ? new Date(inv.status_transitions.paid_at * 1000).toISOString() 
        : null,
      pdf_url: inv.invoice_pdf,
      hosted_url: inv.hosted_invoice_url
    }));

    res.json({ invoices: formattedInvoices });
  } catch (error) {
    console.error('Erro ao listar faturas:', error);
    res.status(500).json({ error: 'Erro ao listar faturas' });
  }
});

module.exports = router;
