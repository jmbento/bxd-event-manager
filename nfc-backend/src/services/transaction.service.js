/**
 * Serviço de Transações Cashless
 * Gerencia recargas, compras, estornos
 */

const { supabase } = require('../config/supabase');
const { v4: uuidv4 } = require('uuid');
const wristbandService = require('./wristband.service');

// Armazenamento em memória
let inMemoryTransactions = [];

class TransactionService {
  
  /**
   * Buscar conta por UID da pulseira
   */
  async getAccountByWristbandUid(uid) {
    const wristband = await wristbandService.findByUid(uid);
    
    if (!wristband) {
      throw new Error('Pulseira não encontrada');
    }
    
    if (!wristband.account) {
      throw new Error('Pulseira não possui conta cashless vinculada');
    }
    
    return {
      account: wristband.account,
      wristband
    };
  }
  
  /**
   * Realizar recarga (top-up)
   */
  async topup({ wristband_uid, amount_cents, method, pos_reference, description, processed_by }) {
    if (amount_cents <= 0) {
      throw new Error('Valor da recarga deve ser positivo');
    }
    
    const { account, wristband } = await this.getAccountByWristbandUid(wristband_uid);
    
    if (!account.is_active) {
      throw new Error('Conta inativa');
    }
    
    const newBalance = account.balance_cents + amount_cents;
    const now = new Date().toISOString();
    
    const transaction = {
      id: uuidv4(),
      account_id: account.id,
      type: 'topup',
      amount_cents: amount_cents,
      balance_after_cents: newBalance,
      method: method || null,
      pos_reference: pos_reference || null,
      external_id: null,
      description: description || `Recarga via ${method || 'não informado'}`,
      category: null,
      vendor_id: null,
      vendor_name: null,
      processed_by: processed_by || null,
      is_reversed: false,
      reversed_at: null,
      reversed_by: null,
      original_transaction_id: null,
      created_at: now
    };
    
    if (supabase) {
      // Iniciar transação
      const { data: txData, error: txError } = await supabase
        .from('transactions')
        .insert(transaction)
        .select()
        .single();
      
      if (txError) throw txError;
      
      // Atualizar saldo
      const { error: accError } = await supabase
        .from('accounts')
        .update({ 
          balance_cents: newBalance,
          updated_at: now
        })
        .eq('id', account.id);
      
      if (accError) throw accError;
      
      return {
        transaction: txData,
        previous_balance_cents: account.balance_cents,
        new_balance_cents: newBalance,
        new_balance_formatted: (newBalance / 100).toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        })
      };
    }
    
    // Fallback em memória
    inMemoryTransactions.push(transaction);
    
    // Atualizar saldo na conta em memória
    const memAccount = wristbandService._inMemoryAccounts.find(a => a.id === account.id);
    if (memAccount) {
      memAccount.balance_cents = newBalance;
      memAccount.updated_at = now;
    }
    
    return {
      transaction,
      previous_balance_cents: account.balance_cents,
      new_balance_cents: newBalance,
      new_balance_formatted: (newBalance / 100).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      })
    };
  }
  
  /**
   * Realizar compra (débito)
   */
  async purchase({ wristband_uid, amount_cents, description, category, vendor_id, vendor_name, processed_by }) {
    if (amount_cents <= 0) {
      throw new Error('Valor da compra deve ser positivo');
    }
    
    const { account, wristband } = await this.getAccountByWristbandUid(wristband_uid);
    
    if (!account.is_active) {
      throw new Error('Conta inativa');
    }
    
    // Verificar saldo
    if (account.balance_cents < amount_cents) {
      return {
        success: false,
        error: 'INSUFFICIENT_BALANCE',
        message: 'Saldo insuficiente',
        current_balance_cents: account.balance_cents,
        required_cents: amount_cents,
        missing_cents: amount_cents - account.balance_cents
      };
    }
    
    // Verificar limite por transação (se configurado)
    if (account.transaction_limit_cents && amount_cents > account.transaction_limit_cents) {
      return {
        success: false,
        error: 'TRANSACTION_LIMIT_EXCEEDED',
        message: 'Valor excede limite por transação',
        limit_cents: account.transaction_limit_cents
      };
    }
    
    const newBalance = account.balance_cents - amount_cents;
    const now = new Date().toISOString();
    
    const transaction = {
      id: uuidv4(),
      account_id: account.id,
      type: 'purchase',
      amount_cents: -amount_cents, // Negativo para débito
      balance_after_cents: newBalance,
      method: null,
      pos_reference: null,
      external_id: null,
      description: description || 'Compra',
      category: category || null,
      vendor_id: vendor_id || null,
      vendor_name: vendor_name || null,
      processed_by: processed_by || null,
      is_reversed: false,
      reversed_at: null,
      reversed_by: null,
      original_transaction_id: null,
      created_at: now
    };
    
    if (supabase) {
      const { data: txData, error: txError } = await supabase
        .from('transactions')
        .insert(transaction)
        .select()
        .single();
      
      if (txError) throw txError;
      
      const { error: accError } = await supabase
        .from('accounts')
        .update({ 
          balance_cents: newBalance,
          updated_at: now
        })
        .eq('id', account.id);
      
      if (accError) throw accError;
      
      return {
        success: true,
        transaction: txData,
        previous_balance_cents: account.balance_cents,
        new_balance_cents: newBalance,
        new_balance_formatted: (newBalance / 100).toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        })
      };
    }
    
    // Fallback em memória
    inMemoryTransactions.push(transaction);
    
    const memAccount = wristbandService._inMemoryAccounts.find(a => a.id === account.id);
    if (memAccount) {
      memAccount.balance_cents = newBalance;
      memAccount.updated_at = now;
    }
    
    return {
      success: true,
      transaction,
      previous_balance_cents: account.balance_cents,
      new_balance_cents: newBalance,
      new_balance_formatted: (newBalance / 100).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      })
    };
  }
  
  /**
   * Estornar transação
   */
  async refund(transactionId, reversedBy = null) {
    let originalTx;
    
    if (supabase) {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', transactionId)
        .single();
      
      if (error) throw error;
      originalTx = data;
    } else {
      originalTx = inMemoryTransactions.find(t => t.id === transactionId);
    }
    
    if (!originalTx) {
      throw new Error('Transação não encontrada');
    }
    
    if (originalTx.is_reversed) {
      throw new Error('Transação já foi estornada');
    }
    
    if (originalTx.type === 'refund') {
      throw new Error('Não é possível estornar um estorno');
    }
    
    // Buscar conta
    let account;
    if (supabase) {
      const { data } = await supabase
        .from('accounts')
        .select('*')
        .eq('id', originalTx.account_id)
        .single();
      account = data;
    } else {
      account = wristbandService._inMemoryAccounts.find(a => a.id === originalTx.account_id);
    }
    
    if (!account) {
      throw new Error('Conta não encontrada');
    }
    
    // Calcular novo saldo (reverter o valor)
    const refundAmount = -originalTx.amount_cents; // Inverte o sinal
    const newBalance = account.balance_cents + refundAmount;
    const now = new Date().toISOString();
    
    // Criar transação de estorno
    const refundTx = {
      id: uuidv4(),
      account_id: account.id,
      type: 'refund',
      amount_cents: refundAmount,
      balance_after_cents: newBalance,
      method: originalTx.method,
      pos_reference: null,
      external_id: null,
      description: `Estorno: ${originalTx.description}`,
      category: originalTx.category,
      vendor_id: originalTx.vendor_id,
      vendor_name: originalTx.vendor_name,
      processed_by: reversedBy,
      is_reversed: false,
      reversed_at: null,
      reversed_by: null,
      original_transaction_id: originalTx.id,
      created_at: now
    };
    
    if (supabase) {
      // Marcar original como estornada
      await supabase
        .from('transactions')
        .update({
          is_reversed: true,
          reversed_at: now,
          reversed_by: reversedBy
        })
        .eq('id', transactionId);
      
      // Criar transação de estorno
      const { data: refundData, error: refundError } = await supabase
        .from('transactions')
        .insert(refundTx)
        .select()
        .single();
      
      if (refundError) throw refundError;
      
      // Atualizar saldo
      await supabase
        .from('accounts')
        .update({ 
          balance_cents: newBalance,
          updated_at: now
        })
        .eq('id', account.id);
      
      return {
        success: true,
        refund_transaction: refundData,
        original_transaction_id: transactionId,
        refunded_amount_cents: refundAmount,
        new_balance_cents: newBalance
      };
    }
    
    // Fallback em memória
    originalTx.is_reversed = true;
    originalTx.reversed_at = now;
    originalTx.reversed_by = reversedBy;
    
    inMemoryTransactions.push(refundTx);
    
    const memAccount = wristbandService._inMemoryAccounts.find(a => a.id === account.id);
    if (memAccount) {
      memAccount.balance_cents = newBalance;
      memAccount.updated_at = now;
    }
    
    return {
      success: true,
      refund_transaction: refundTx,
      original_transaction_id: transactionId,
      refunded_amount_cents: refundAmount,
      new_balance_cents: newBalance
    };
  }
  
  /**
   * Buscar extrato por UID da pulseira
   */
  async getStatement(wristbandUid, { page = 1, limit = 20 } = {}) {
    const { account, wristband } = await this.getAccountByWristbandUid(wristbandUid);
    const offset = (page - 1) * limit;
    
    let transactions;
    let total;
    
    if (supabase) {
      const { data, error, count } = await supabase
        .from('transactions')
        .select('*', { count: 'exact' })
        .eq('account_id', account.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      
      if (error) throw error;
      transactions = data;
      total = count;
    } else {
      const allTx = inMemoryTransactions
        .filter(t => t.account_id === account.id)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      
      total = allTx.length;
      transactions = allTx.slice(offset, offset + limit);
    }
    
    return {
      account_id: account.id,
      wristband_uid: wristband.uid,
      current_balance_cents: account.balance_cents,
      current_balance_formatted: (account.balance_cents / 100).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }),
      transactions: transactions.map(t => ({
        ...t,
        amount_formatted: (Math.abs(t.amount_cents) / 100).toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }),
        is_credit: t.amount_cents > 0
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
  
  /**
   * Resumo financeiro geral
   */
  async getSummary() {
    if (supabase) {
      const { data: transactions } = await supabase
        .from('transactions')
        .select('type, amount_cents, method, vendor_id');
      
      const { data: accounts } = await supabase
        .from('accounts')
        .select('balance_cents');
      
      const summary = this.calculateSummary(transactions || [], accounts || []);
      return summary;
    }
    
    const accounts = wristbandService._inMemoryAccounts;
    return this.calculateSummary(inMemoryTransactions, accounts);
  }
  
  calculateSummary(transactions, accounts) {
    const topups = transactions.filter(t => t.type === 'topup');
    const purchases = transactions.filter(t => t.type === 'purchase');
    const refunds = transactions.filter(t => t.type === 'refund');
    
    const totalLoaded = topups.reduce((sum, t) => sum + t.amount_cents, 0);
    const totalSpent = purchases.reduce((sum, t) => sum + Math.abs(t.amount_cents), 0);
    const totalRefunded = refunds.reduce((sum, t) => sum + t.amount_cents, 0);
    const totalInWallets = accounts.reduce((sum, a) => sum + a.balance_cents, 0);
    
    // Por método de pagamento
    const byMethod = {};
    topups.forEach(t => {
      const method = t.method || 'outros';
      byMethod[method] = (byMethod[method] || 0) + t.amount_cents;
    });
    
    // Por vendor
    const byVendor = {};
    purchases.forEach(t => {
      const vendor = t.vendor_id || 'outros';
      byVendor[vendor] = (byVendor[vendor] || 0) + Math.abs(t.amount_cents);
    });
    
    return {
      total_loaded_cents: totalLoaded,
      total_spent_cents: totalSpent,
      total_refunded_cents: totalRefunded,
      total_in_wallets_cents: totalInWallets,
      transaction_count: {
        topups: topups.length,
        purchases: purchases.length,
        refunds: refunds.length,
        total: transactions.length
      },
      by_payment_method: Object.entries(byMethod).map(([method, amount]) => ({
        method,
        amount_cents: amount
      })),
      by_vendor: Object.entries(byVendor).map(([vendor, amount]) => ({
        vendor,
        amount_cents: amount
      })).sort((a, b) => b.amount_cents - a.amount_cents)
    };
  }
}

module.exports = new TransactionService();
