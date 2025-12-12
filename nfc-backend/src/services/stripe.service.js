/**
 * BXD Event Manager - Stripe Service
 * Integração com Stripe para pagamentos e assinaturas
 */

const Stripe = require('stripe');

// Inicializar Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16'
});

// IDs dos preços no Stripe (configurar no dashboard)
const PRICE_IDS = {
  starter: {
    monthly: process.env.STRIPE_PRICE_STARTER_MONTHLY,
    yearly: process.env.STRIPE_PRICE_STARTER_YEARLY
  },
  pro: {
    monthly: process.env.STRIPE_PRICE_PRO_MONTHLY,
    yearly: process.env.STRIPE_PRICE_PRO_YEARLY
  },
  enterprise: {
    monthly: process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY,
    yearly: process.env.STRIPE_PRICE_ENTERPRISE_YEARLY
  }
};

/**
 * Criar cliente no Stripe
 */
async function createCustomer({ email, name, organizationId, metadata = {} }) {
  try {
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        organization_id: organizationId,
        ...metadata
      }
    });

    console.log(`✅ Cliente Stripe criado: ${customer.id}`);
    return customer;
  } catch (error) {
    console.error('❌ Erro ao criar cliente Stripe:', error);
    throw error;
  }
}

/**
 * Criar sessão de checkout para assinatura
 */
async function createCheckoutSession({ 
  customerId, 
  priceId, 
  organizationId,
  successUrl, 
  cancelUrl,
  trialDays = 0,
  metadata = {}
}) {
  try {
    const sessionParams = {
      customer: customerId,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{
        price: priceId,
        quantity: 1
      }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        organization_id: organizationId,
        ...metadata
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      // Configurações específicas para Brasil
      payment_method_options: {
        card: {
          installments: { enabled: false }
        }
      },
      locale: 'pt-BR'
    };

    // Adicionar trial se ainda não usou
    if (trialDays > 0) {
      sessionParams.subscription_data = {
        trial_period_days: trialDays,
        metadata: { organization_id: organizationId }
      };
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    console.log(`✅ Sessão de checkout criada: ${session.id}`);
    return session;
  } catch (error) {
    console.error('❌ Erro ao criar sessão de checkout:', error);
    throw error;
  }
}

/**
 * Criar portal do cliente (para gerenciar assinatura)
 */
async function createPortalSession({ customerId, returnUrl }) {
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl
    });

    console.log(`✅ Portal session criada: ${session.id}`);
    return session;
  } catch (error) {
    console.error('❌ Erro ao criar portal session:', error);
    throw error;
  }
}

/**
 * Obter assinatura
 */
async function getSubscription(subscriptionId) {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ['default_payment_method', 'latest_invoice']
    });
    return subscription;
  } catch (error) {
    console.error('❌ Erro ao obter assinatura:', error);
    throw error;
  }
}

/**
 * Cancelar assinatura
 */
async function cancelSubscription(subscriptionId, cancelAtPeriodEnd = true) {
  try {
    let subscription;
    
    if (cancelAtPeriodEnd) {
      // Cancela no final do período (recomendado)
      subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true
      });
    } else {
      // Cancela imediatamente
      subscription = await stripe.subscriptions.cancel(subscriptionId);
    }

    console.log(`✅ Assinatura cancelada: ${subscriptionId}`);
    return subscription;
  } catch (error) {
    console.error('❌ Erro ao cancelar assinatura:', error);
    throw error;
  }
}

/**
 * Reativar assinatura cancelada (se ainda no período)
 */
async function reactivateSubscription(subscriptionId) {
  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false
    });

    console.log(`✅ Assinatura reativada: ${subscriptionId}`);
    return subscription;
  } catch (error) {
    console.error('❌ Erro ao reativar assinatura:', error);
    throw error;
  }
}

/**
 * Mudar plano de assinatura (upgrade/downgrade)
 */
async function changePlan(subscriptionId, newPriceId) {
  try {
    // Obter assinatura atual
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    // Atualizar para novo plano
    const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
      items: [{
        id: subscription.items.data[0].id,
        price: newPriceId
      }],
      proration_behavior: 'create_prorations' // Cobra proporcional
    });

    console.log(`✅ Plano alterado: ${subscriptionId}`);
    return updatedSubscription;
  } catch (error) {
    console.error('❌ Erro ao mudar plano:', error);
    throw error;
  }
}

/**
 * Obter faturas do cliente
 */
async function getInvoices(customerId, limit = 10) {
  try {
    const invoices = await stripe.invoices.list({
      customer: customerId,
      limit
    });
    return invoices.data;
  } catch (error) {
    console.error('❌ Erro ao obter faturas:', error);
    throw error;
  }
}

/**
 * Obter métodos de pagamento do cliente
 */
async function getPaymentMethods(customerId) {
  try {
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card'
    });
    return paymentMethods.data;
  } catch (error) {
    console.error('❌ Erro ao obter métodos de pagamento:', error);
    throw error;
  }
}

/**
 * Processar evento webhook
 */
async function constructWebhookEvent(payload, signature) {
  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    return event;
  } catch (error) {
    console.error('❌ Erro ao verificar webhook:', error);
    throw error;
  }
}

/**
 * Obter ID do preço pelo plano e período
 */
function getPriceId(planId, billingPeriod = 'monthly') {
  const plan = PRICE_IDS[planId];
  if (!plan) {
    throw new Error(`Plano não encontrado: ${planId}`);
  }
  
  const priceId = plan[billingPeriod];
  if (!priceId) {
    throw new Error(`Período não encontrado: ${billingPeriod}`);
  }
  
  return priceId;
}

/**
 * Criar cupom de desconto
 */
async function createCoupon({ percentOff, duration = 'once', name }) {
  try {
    const coupon = await stripe.coupons.create({
      percent_off: percentOff,
      duration,
      name
    });
    return coupon;
  } catch (error) {
    console.error('❌ Erro ao criar cupom:', error);
    throw error;
  }
}

module.exports = {
  stripe,
  createCustomer,
  createCheckoutSession,
  createPortalSession,
  getSubscription,
  cancelSubscription,
  reactivateSubscription,
  changePlan,
  getInvoices,
  getPaymentMethods,
  constructWebhookEvent,
  getPriceId,
  createCoupon,
  PRICE_IDS
};
