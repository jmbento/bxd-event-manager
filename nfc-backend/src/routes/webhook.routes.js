/**
 * BXD Event Manager - Stripe Webhook Handler
 * Processa eventos do Stripe
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
 * POST /api/webhooks/stripe
 * Recebe eventos do Stripe
 */
router.post('/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const signature = req.headers['stripe-signature'];
  
  let event;
  
  try {
    event = await stripeService.constructWebhookEvent(req.body, signature);
  } catch (err) {
    console.error(`❌ Webhook signature verification failed:`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log(`📥 Webhook received: ${event.type}`);

  try {
    switch (event.type) {
      // ========================================
      // CHECKOUT
      // ========================================
      case 'checkout.session.completed': {
        const session = event.data.object;
        console.log('✅ Checkout completed:', session.id);
        
        const organizationId = session.metadata?.organization_id;
        if (!organizationId) {
          console.warn('⚠️ Checkout sem organization_id');
          break;
        }

        // Obter subscription do checkout
        const subscriptionId = session.subscription;
        const planId = session.metadata?.plan_id || 'starter';

        // Atualizar organização
        const { error } = await supabase
          .from('organizations')
          .update({
            subscription_status: 'active',
            subscription_plan: planId,
            stripe_subscription_id: subscriptionId,
            subscription_starts_at: new Date().toISOString(),
            canceled_at: null
          })
          .eq('id', organizationId);

        if (error) {
          console.error('❌ Erro ao atualizar organização:', error);
        } else {
          console.log(`✅ Organização ${organizationId} ativada com plano ${planId}`);
        }

        // Registrar pagamento
        await supabase.from('payment_history').insert({
          organization_id: organizationId,
          stripe_payment_intent_id: session.payment_intent,
          amount: session.amount_total,
          currency: session.currency,
          status: 'succeeded',
          plan_id: planId,
          billing_period: session.metadata?.billing_period || 'monthly'
        });

        break;
      }

      // ========================================
      // SUBSCRIPTION EVENTS
      // ========================================
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        console.log(`📝 Subscription ${event.type}:`, subscription.id);
        
        const organizationId = subscription.metadata?.organization_id;
        if (!organizationId) {
          // Tentar buscar pelo customer_id
          const { data: org } = await supabase
            .from('organizations')
            .select('id')
            .eq('stripe_customer_id', subscription.customer)
            .single();
          
          if (org) {
            // Mapear status do Stripe para nosso status
            const statusMap = {
              'active': 'active',
              'trialing': 'trial',
              'past_due': 'active', // Ainda dar acesso, mas notificar
              'canceled': 'canceled',
              'unpaid': 'expired',
              'incomplete': 'trial',
              'incomplete_expired': 'expired'
            };

            await supabase
              .from('organizations')
              .update({
                subscription_status: statusMap[subscription.status] || 'active',
                stripe_subscription_id: subscription.id,
                subscription_ends_at: subscription.current_period_end 
                  ? new Date(subscription.current_period_end * 1000).toISOString()
                  : null
              })
              .eq('id', org.id);
          }
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        console.log('🗑️ Subscription deleted:', subscription.id);
        
        // Buscar organização pelo subscription_id
        const { data: org } = await supabase
          .from('organizations')
          .select('id')
          .eq('stripe_subscription_id', subscription.id)
          .single();

        if (org) {
          await supabase
            .from('organizations')
            .update({
              subscription_status: 'expired',
              subscription_ends_at: new Date().toISOString()
            })
            .eq('id', org.id);
          
          console.log(`⚠️ Organização ${org.id} expirada`);
        }
        break;
      }

      // ========================================
      // INVOICE EVENTS
      // ========================================
      case 'invoice.paid': {
        const invoice = event.data.object;
        console.log('💰 Invoice paid:', invoice.id);
        
        // Buscar organização
        const { data: org } = await supabase
          .from('organizations')
          .select('id')
          .eq('stripe_customer_id', invoice.customer)
          .single();

        if (org) {
          // Registrar pagamento
          await supabase.from('payment_history').insert({
            organization_id: org.id,
            stripe_invoice_id: invoice.id,
            stripe_payment_intent_id: invoice.payment_intent,
            amount: invoice.amount_paid,
            currency: invoice.currency,
            status: 'succeeded',
            receipt_url: invoice.hosted_invoice_url,
            invoice_pdf_url: invoice.invoice_pdf
          });
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        console.log('❌ Invoice payment failed:', invoice.id);
        
        // Buscar organização
        const { data: org } = await supabase
          .from('organizations')
          .select('id, owner_id')
          .eq('stripe_customer_id', invoice.customer)
          .single();

        if (org) {
          // Registrar falha
          await supabase.from('payment_history').insert({
            organization_id: org.id,
            stripe_invoice_id: invoice.id,
            amount: invoice.amount_due,
            currency: invoice.currency,
            status: 'failed'
          });

          // TODO: Enviar email notificando falha no pagamento
          console.log(`📧 TODO: Notificar owner ${org.owner_id} sobre falha no pagamento`);
        }
        break;
      }

      // ========================================
      // CUSTOMER EVENTS
      // ========================================
      case 'customer.created': {
        const customer = event.data.object;
        console.log('👤 Customer created:', customer.id);
        break;
      }

      case 'customer.updated': {
        const customer = event.data.object;
        console.log('👤 Customer updated:', customer.id);
        break;
      }

      // ========================================
      // DEFAULT
      // ========================================
      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error(`❌ Error processing webhook:`, error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

module.exports = router;
