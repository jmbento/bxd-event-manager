/**
 * Serviço de Pulseiras (Wristbands)
 * Gerencia ciclo de vida das pulseiras NFC/RFID
 */

const { supabase } = require('../config/supabase');
const { v4: uuidv4 } = require('uuid');

// Armazenamento em memória para desenvolvimento
let inMemoryWristbands = [];
let inMemoryAccounts = [];

class WristbandService {
  
  /**
   * Registrar nova pulseira no sistema
   */
  async register(uid, batchCode = null) {
    const wristband = {
      id: uuidv4(),
      uid: uid.toUpperCase(),
      status: 'new',
      attendee_id: null,
      block_reason: null,
      blocked_at: null,
      blocked_by: null,
      batch_code: batchCode,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      assigned_at: null,
      assigned_by: null
    };
    
    if (supabase) {
      const { data, error } = await supabase
        .from('wristbands')
        .insert(wristband)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }
    
    inMemoryWristbands.push(wristband);
    return wristband;
  }
  
  /**
   * Buscar pulseira por UID
   */
  async findByUid(uid) {
    const normalizedUid = uid.toUpperCase();
    
    if (supabase) {
      const { data, error } = await supabase
        .from('wristbands')
        .select(`
          *,
          attendee:attendees(*),
          account:accounts(*)
        `)
        .eq('uid', normalizedUid)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    }
    
    const wristband = inMemoryWristbands.find(w => w.uid === normalizedUid);
    if (!wristband) return null;
    
    // Anexar dados relacionados
    const account = inMemoryAccounts.find(a => a.wristband_id === wristband.id);
    return { ...wristband, account };
  }
  
  /**
   * Buscar pulseira por ID
   */
  async findById(id) {
    if (supabase) {
      const { data, error } = await supabase
        .from('wristbands')
        .select(`
          *,
          attendee:attendees(*),
          account:accounts(*)
        `)
        .eq('id', id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    }
    
    const wristband = inMemoryWristbands.find(w => w.id === id);
    if (!wristband) return null;
    
    const account = inMemoryAccounts.find(a => a.wristband_id === wristband.id);
    return { ...wristband, account };
  }
  
  /**
   * Vincular pulseira a um participante e criar conta cashless
   */
  async assignToAttendee(uid, attendeeId, assignedBy = null) {
    const normalizedUid = uid.toUpperCase();
    
    // Buscar ou criar pulseira
    let wristband = await this.findByUid(normalizedUid);
    
    if (!wristband) {
      // Criar pulseira automaticamente se não existir
      wristband = await this.register(normalizedUid);
    }
    
    // Verificar se já está vinculada a outro participante
    if (wristband.attendee_id && wristband.attendee_id !== attendeeId) {
      throw new Error('Pulseira já vinculada a outro participante');
    }
    
    // Verificar status
    if (wristband.status === 'blocked') {
      throw new Error('Pulseira bloqueada');
    }
    
    const now = new Date().toISOString();
    
    if (supabase) {
      // Atualizar pulseira
      const { data: updatedWristband, error: wError } = await supabase
        .from('wristbands')
        .update({
          attendee_id: attendeeId,
          status: 'assigned',
          assigned_at: now,
          assigned_by: assignedBy,
          updated_at: now
        })
        .eq('id', wristband.id)
        .select()
        .single();
      
      if (wError) throw wError;
      
      // Criar conta cashless se não existir
      const { data: existingAccount } = await supabase
        .from('accounts')
        .select('*')
        .eq('wristband_id', wristband.id)
        .single();
      
      let account = existingAccount;
      
      if (!existingAccount) {
        const { data: newAccount, error: aError } = await supabase
          .from('accounts')
          .insert({
            id: uuidv4(),
            wristband_id: wristband.id,
            balance_cents: 0,
            is_active: true,
            created_at: now,
            updated_at: now
          })
          .select()
          .single();
        
        if (aError) throw aError;
        account = newAccount;
      }
      
      return { wristband: updatedWristband, account };
    }
    
    // Fallback em memória
    wristband.attendee_id = attendeeId;
    wristband.status = 'assigned';
    wristband.assigned_at = now;
    wristband.assigned_by = assignedBy;
    wristband.updated_at = now;
    
    // Criar conta se não existir
    let account = inMemoryAccounts.find(a => a.wristband_id === wristband.id);
    if (!account) {
      account = {
        id: uuidv4(),
        wristband_id: wristband.id,
        balance_cents: 0,
        daily_limit_cents: null,
        transaction_limit_cents: null,
        is_active: true,
        created_at: now,
        updated_at: now
      };
      inMemoryAccounts.push(account);
    }
    
    return { wristband, account };
  }
  
  /**
   * Bloquear pulseira
   */
  async block(uid, reason, blockedBy = null) {
    const normalizedUid = uid.toUpperCase();
    const now = new Date().toISOString();
    
    if (supabase) {
      const { data, error } = await supabase
        .from('wristbands')
        .update({
          status: 'blocked',
          block_reason: reason,
          blocked_at: now,
          blocked_by: blockedBy,
          updated_at: now
        })
        .eq('uid', normalizedUid)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }
    
    const wristband = inMemoryWristbands.find(w => w.uid === normalizedUid);
    if (!wristband) throw new Error('Pulseira não encontrada');
    
    wristband.status = 'blocked';
    wristband.block_reason = reason;
    wristband.blocked_at = now;
    wristband.blocked_by = blockedBy;
    wristband.updated_at = now;
    
    return wristband;
  }
  
  /**
   * Desbloquear pulseira
   */
  async unblock(uid) {
    const normalizedUid = uid.toUpperCase();
    const now = new Date().toISOString();
    
    if (supabase) {
      const { data, error } = await supabase
        .from('wristbands')
        .update({
          status: 'assigned',
          block_reason: null,
          blocked_at: null,
          blocked_by: null,
          updated_at: now
        })
        .eq('uid', normalizedUid)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }
    
    const wristband = inMemoryWristbands.find(w => w.uid === normalizedUid);
    if (!wristband) throw new Error('Pulseira não encontrada');
    
    wristband.status = wristband.attendee_id ? 'assigned' : 'new';
    wristband.block_reason = null;
    wristband.blocked_at = null;
    wristband.blocked_by = null;
    wristband.updated_at = now;
    
    return wristband;
  }
  
  /**
   * Marcar como perdida
   */
  async markAsLost(uid, reportedBy = null) {
    const normalizedUid = uid.toUpperCase();
    const now = new Date().toISOString();
    
    if (supabase) {
      const { data, error } = await supabase
        .from('wristbands')
        .update({
          status: 'lost',
          block_reason: 'Reportada como perdida',
          blocked_at: now,
          blocked_by: reportedBy,
          updated_at: now
        })
        .eq('uid', normalizedUid)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }
    
    const wristband = inMemoryWristbands.find(w => w.uid === normalizedUid);
    if (!wristband) throw new Error('Pulseira não encontrada');
    
    wristband.status = 'lost';
    wristband.block_reason = 'Reportada como perdida';
    wristband.blocked_at = now;
    wristband.blocked_by = reportedBy;
    wristband.updated_at = now;
    
    return wristband;
  }
  
  /**
   * Obter status completo da pulseira
   */
  async getStatus(uid) {
    const wristband = await this.findByUid(uid);
    
    if (!wristband) {
      return {
        found: false,
        uid: uid.toUpperCase(),
        status: 'not_registered',
        can_access: false,
        message: 'Pulseira não registrada no sistema'
      };
    }
    
    // Buscar participante se vinculado
    let attendee = null;
    if (wristband.attendee_id) {
      if (supabase) {
        const { data } = await supabase
          .from('attendees')
          .select('*')
          .eq('id', wristband.attendee_id)
          .single();
        attendee = data;
      }
    }
    
    // Determinar se pode acessar
    const canAccess = wristband.status === 'assigned';
    
    // Buscar saldo
    let balance = 0;
    if (wristband.account) {
      balance = wristband.account.balance_cents;
    }
    
    return {
      found: true,
      uid: wristband.uid,
      wristband_id: wristband.id,
      status: wristband.status,
      can_access: canAccess,
      block_reason: wristband.block_reason,
      attendee: attendee ? {
        id: attendee.id,
        name: attendee.full_name,
        city: attendee.city,
        age: attendee.age,
        ticket_type: attendee.ticket_type
      } : null,
      account: wristband.account ? {
        id: wristband.account.id,
        balance_cents: balance,
        balance_formatted: (balance / 100).toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        })
      } : null,
      assigned_at: wristband.assigned_at
    };
  }
  
  /**
   * Listar pulseiras com filtros
   */
  async list({ page = 1, limit = 50, status, hasAttendee, search }) {
    const offset = (page - 1) * limit;
    
    if (supabase) {
      let query = supabase
        .from('wristbands')
        .select(`
          *,
          attendee:attendees(id, full_name, email),
          account:accounts(balance_cents)
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      
      if (status) query = query.eq('status', status);
      if (hasAttendee === true) query = query.not('attendee_id', 'is', null);
      if (hasAttendee === false) query = query.is('attendee_id', null);
      if (search) query = query.ilike('uid', `%${search}%`);
      
      const { data, error, count } = await query;
      if (error) throw error;
      
      return {
        data,
        pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) }
      };
    }
    
    // Fallback em memória
    let filtered = [...inMemoryWristbands];
    
    if (status) filtered = filtered.filter(w => w.status === status);
    if (hasAttendee === true) filtered = filtered.filter(w => w.attendee_id);
    if (hasAttendee === false) filtered = filtered.filter(w => !w.attendee_id);
    if (search) filtered = filtered.filter(w => w.uid.includes(search.toUpperCase()));
    
    const total = filtered.length;
    const data = filtered.slice(offset, offset + limit);
    
    return {
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    };
  }
  
  /**
   * Estatísticas de pulseiras
   */
  async getStats() {
    if (supabase) {
      const { data: all } = await supabase
        .from('wristbands')
        .select('status');
      
      const stats = {
        total: all?.length || 0,
        new: all?.filter(w => w.status === 'new').length || 0,
        assigned: all?.filter(w => w.status === 'assigned').length || 0,
        blocked: all?.filter(w => w.status === 'blocked').length || 0,
        lost: all?.filter(w => w.status === 'lost').length || 0
      };
      
      return stats;
    }
    
    return {
      total: inMemoryWristbands.length,
      new: inMemoryWristbands.filter(w => w.status === 'new').length,
      assigned: inMemoryWristbands.filter(w => w.status === 'assigned').length,
      blocked: inMemoryWristbands.filter(w => w.status === 'blocked').length,
      lost: inMemoryWristbands.filter(w => w.status === 'lost').length
    };
  }
}

// Exportar instância e acesso ao storage em memória (para outros serviços)
const wristbandService = new WristbandService();
wristbandService._inMemoryAccounts = inMemoryAccounts;

module.exports = wristbandService;
