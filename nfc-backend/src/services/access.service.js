/**
 * Serviço de Controle de Acesso
 * Gerencia entradas e saídas em portões/áreas
 */

const { supabase } = require('../config/supabase');
const { v4: uuidv4 } = require('uuid');
const wristbandService = require('./wristband.service');

// Armazenamento em memória
let inMemoryAccessLogs = [];
let inMemoryGates = [
  { id: '1', name: 'Entrada Principal', code: 'GATE_MAIN', area_type: 'entrance', allowed_ticket_types: ['standard', 'vip', 'backstage', 'staff', 'press'], is_active: true },
  { id: '2', name: 'Entrada VIP', code: 'GATE_VIP', area_type: 'vip', allowed_ticket_types: ['vip', 'backstage', 'staff', 'press'], is_active: true },
  { id: '3', name: 'Backstage', code: 'GATE_BACKSTAGE', area_type: 'backstage', allowed_ticket_types: ['backstage', 'staff'], is_active: true },
  { id: '4', name: 'Saída Principal', code: 'GATE_EXIT', area_type: 'exit', allowed_ticket_types: ['standard', 'vip', 'backstage', 'staff', 'press'], is_active: true }
];

class AccessService {
  
  /**
   * Verificar e registrar acesso (check-in/check-out)
   */
  async checkAccess({ wristband_uid, gate, direction, operator_id, operator_name, latitude, longitude }) {
    // Buscar pulseira
    const wristband = await wristbandService.findByUid(wristband_uid);
    
    // Preparar log base
    const now = new Date().toISOString();
    const logBase = {
      id: uuidv4(),
      wristband_id: wristband?.id || null,
      gate,
      gate_id: null,
      direction: direction || 'in',
      operator_id: operator_id || null,
      operator_name: operator_name || null,
      latitude: latitude || null,
      longitude: longitude || null,
      created_at: now
    };
    
    // Pulseira não encontrada
    if (!wristband) {
      const log = {
        ...logBase,
        status: 'denied',
        reason: 'Pulseira não registrada no sistema'
      };
      
      await this.saveLog(log);
      
      return {
        allowed: false,
        status: 'denied',
        reason: 'Pulseira não registrada no sistema',
        wristband_uid,
        log_id: log.id
      };
    }
    
    logBase.wristband_id = wristband.id;
    
    // Verificar status da pulseira
    if (wristband.status === 'blocked') {
      const log = {
        ...logBase,
        status: 'denied',
        reason: `Pulseira bloqueada: ${wristband.block_reason || 'sem motivo especificado'}`
      };
      
      await this.saveLog(log);
      
      return {
        allowed: false,
        status: 'denied',
        reason: 'Pulseira bloqueada',
        block_reason: wristband.block_reason,
        wristband_uid,
        log_id: log.id
      };
    }
    
    if (wristband.status === 'lost') {
      const log = {
        ...logBase,
        status: 'denied',
        reason: 'Pulseira reportada como perdida'
      };
      
      await this.saveLog(log);
      
      return {
        allowed: false,
        status: 'denied',
        reason: 'Pulseira reportada como perdida',
        wristband_uid,
        log_id: log.id
      };
    }
    
    if (wristband.status === 'new' || !wristband.attendee_id) {
      const log = {
        ...logBase,
        status: 'denied',
        reason: 'Pulseira não vinculada a um participante'
      };
      
      await this.saveLog(log);
      
      return {
        allowed: false,
        status: 'denied',
        reason: 'Pulseira não ativada',
        wristband_uid,
        log_id: log.id
      };
    }
    
    // Buscar informações do portão (se configurado)
    const gateConfig = await this.getGate(gate);
    
    // Verificar tipo de ingresso (se portão tem restrição)
    let attendee = null;
    if (wristband.attendee) {
      attendee = wristband.attendee;
    } else if (wristband.attendee_id && supabase) {
      const { data } = await supabase
        .from('attendees')
        .select('*')
        .eq('id', wristband.attendee_id)
        .single();
      attendee = data;
    }
    
    if (gateConfig && gateConfig.allowed_ticket_types && attendee) {
      const ticketType = attendee.ticket_type || 'standard';
      if (!gateConfig.allowed_ticket_types.includes(ticketType)) {
        const log = {
          ...logBase,
          status: 'denied',
          reason: `Tipo de ingresso "${ticketType}" não permitido neste portão`
        };
        
        await this.saveLog(log);
        
        return {
          allowed: false,
          status: 'denied',
          reason: `Acesso restrito para tipo de ingresso: ${ticketType}`,
          gate_restriction: gateConfig.allowed_ticket_types,
          wristband_uid,
          attendee_name: attendee?.full_name,
          log_id: log.id
        };
      }
    }
    
    // ACESSO PERMITIDO
    const log = {
      ...logBase,
      status: 'allowed',
      reason: null
    };
    
    await this.saveLog(log);
    
    return {
      allowed: true,
      status: 'allowed',
      wristband_uid,
      wristband_status: wristband.status,
      attendee: attendee ? {
        id: attendee.id,
        name: attendee.full_name,
        ticket_type: attendee.ticket_type
      } : null,
      gate,
      direction,
      log_id: log.id,
      timestamp: now
    };
  }
  
  /**
   * Salvar log de acesso
   */
  async saveLog(log) {
    if (supabase) {
      const { error } = await supabase
        .from('access_logs')
        .insert(log);
      
      if (error) console.error('Erro ao salvar log de acesso:', error);
    } else {
      inMemoryAccessLogs.push(log);
    }
  }
  
  /**
   * Buscar configuração do portão
   */
  async getGate(gateNameOrCode) {
    if (supabase) {
      const { data } = await supabase
        .from('gates')
        .select('*')
        .or(`name.eq.${gateNameOrCode},code.eq.${gateNameOrCode}`)
        .single();
      
      return data;
    }
    
    return inMemoryGates.find(g => 
      g.name === gateNameOrCode || g.code === gateNameOrCode
    );
  }
  
  /**
   * Listar portões
   */
  async listGates() {
    if (supabase) {
      const { data, error } = await supabase
        .from('gates')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data;
    }
    
    return inMemoryGates.filter(g => g.is_active);
  }
  
  /**
   * Listar logs de acesso
   */
  async listLogs({ page = 1, limit = 50, gate, status, direction, wristband_uid, from_date, to_date }) {
    const offset = (page - 1) * limit;
    
    if (supabase) {
      let query = supabase
        .from('access_logs')
        .select(`
          *,
          wristband:wristbands(
            uid,
            attendee:attendees(full_name, ticket_type)
          )
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      
      if (gate) query = query.eq('gate', gate);
      if (status) query = query.eq('status', status);
      if (direction) query = query.eq('direction', direction);
      if (from_date) query = query.gte('created_at', from_date);
      if (to_date) query = query.lte('created_at', to_date);
      
      if (wristband_uid) {
        // Buscar wristband_id pelo uid
        const wristband = await wristbandService.findByUid(wristband_uid);
        if (wristband) {
          query = query.eq('wristband_id', wristband.id);
        }
      }
      
      const { data, error, count } = await query;
      if (error) throw error;
      
      return {
        data,
        pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) }
      };
    }
    
    // Fallback em memória
    let filtered = [...inMemoryAccessLogs].sort((a, b) => 
      new Date(b.created_at) - new Date(a.created_at)
    );
    
    if (gate) filtered = filtered.filter(l => l.gate === gate);
    if (status) filtered = filtered.filter(l => l.status === status);
    if (direction) filtered = filtered.filter(l => l.direction === direction);
    if (from_date) filtered = filtered.filter(l => new Date(l.created_at) >= new Date(from_date));
    if (to_date) filtered = filtered.filter(l => new Date(l.created_at) <= new Date(to_date));
    
    const total = filtered.length;
    const data = filtered.slice(offset, offset + limit);
    
    return {
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    };
  }
  
  /**
   * Histórico de acesso de uma pulseira
   */
  async getWristbandHistory(wristband_uid) {
    const wristband = await wristbandService.findByUid(wristband_uid);
    
    if (!wristband) {
      throw new Error('Pulseira não encontrada');
    }
    
    if (supabase) {
      const { data, error } = await supabase
        .from('access_logs')
        .select('*')
        .eq('wristband_id', wristband.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return {
        wristband_uid: wristband.uid,
        total_entries: data.filter(l => l.direction === 'in' && l.status === 'allowed').length,
        total_exits: data.filter(l => l.direction === 'out' && l.status === 'allowed').length,
        logs: data
      };
    }
    
    const logs = inMemoryAccessLogs
      .filter(l => l.wristband_id === wristband.id)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    return {
      wristband_uid: wristband.uid,
      total_entries: logs.filter(l => l.direction === 'in' && l.status === 'allowed').length,
      total_exits: logs.filter(l => l.direction === 'out' && l.status === 'allowed').length,
      logs
    };
  }
  
  /**
   * Estatísticas de acesso
   */
  async getStats({ gate, from_date, to_date } = {}) {
    let logs;
    
    if (supabase) {
      let query = supabase.from('access_logs').select('*');
      if (gate) query = query.eq('gate', gate);
      if (from_date) query = query.gte('created_at', from_date);
      if (to_date) query = query.lte('created_at', to_date);
      
      const { data } = await query;
      logs = data || [];
    } else {
      logs = inMemoryAccessLogs.filter(l => {
        if (gate && l.gate !== gate) return false;
        if (from_date && new Date(l.created_at) < new Date(from_date)) return false;
        if (to_date && new Date(l.created_at) > new Date(to_date)) return false;
        return true;
      });
    }
    
    const entriesAllowed = logs.filter(l => l.direction === 'in' && l.status === 'allowed').length;
    const entriesDenied = logs.filter(l => l.direction === 'in' && l.status === 'denied').length;
    const exitsAllowed = logs.filter(l => l.direction === 'out' && l.status === 'allowed').length;
    
    // Unique check-ins (participantes únicos que entraram)
    const uniqueWristbands = new Set(
      logs
        .filter(l => l.direction === 'in' && l.status === 'allowed' && l.wristband_id)
        .map(l => l.wristband_id)
    );
    
    // Por portão
    const byGate = {};
    logs.forEach(l => {
      if (!byGate[l.gate]) {
        byGate[l.gate] = { entries: 0, exits: 0, denied: 0 };
      }
      if (l.status === 'allowed') {
        if (l.direction === 'in') byGate[l.gate].entries++;
        else byGate[l.gate].exits++;
      } else {
        byGate[l.gate].denied++;
      }
    });
    
    // Por hora (últimas 24h)
    const byHour = {};
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    logs
      .filter(l => new Date(l.created_at) >= last24h && l.direction === 'in' && l.status === 'allowed')
      .forEach(l => {
        const hour = new Date(l.created_at).getHours();
        byHour[hour] = (byHour[hour] || 0) + 1;
      });
    
    return {
      total_scans: logs.length,
      entries_allowed: entriesAllowed,
      entries_denied: entriesDenied,
      exits_allowed: exitsAllowed,
      unique_attendees: uniqueWristbands.size,
      current_inside: entriesAllowed - exitsAllowed, // Estimativa
      by_gate: Object.entries(byGate).map(([gate, stats]) => ({ gate, ...stats })),
      by_hour_last_24h: Object.entries(byHour)
        .map(([hour, count]) => ({ hour: parseInt(hour), count }))
        .sort((a, b) => a.hour - b.hour)
    };
  }
}

module.exports = new AccessService();
