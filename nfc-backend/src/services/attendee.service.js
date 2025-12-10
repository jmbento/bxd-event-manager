/**
 * Serviço de Participantes (Attendees)
 * Gerencia cadastro de participantes/leads
 */

const { supabase } = require('../config/supabase');
const { v4: uuidv4 } = require('uuid');

// Armazenamento em memória para desenvolvimento sem Supabase
let inMemoryAttendees = [];

class AttendeeService {
  
  /**
   * Criar novo participante
   */
  async create(data) {
    const attendee = {
      id: uuidv4(),
      full_name: data.full_name,
      email: data.email || null,
      phone: data.phone || null,
      cpf: data.cpf || null,
      age: data.age || null,
      birth_date: data.birth_date || null,
      city: data.city || null,
      state: data.state || null,
      ticket_type: data.ticket_type || 'standard',
      ticket_code: data.ticket_code || null,
      marketing_opt_in: data.marketing_opt_in || false,
      privacy_accepted: data.privacy_accepted || false,
      privacy_accepted_at: data.privacy_accepted ? new Date().toISOString() : null,
      notes: data.notes || null,
      tags: data.tags || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: data.created_by || null
    };
    
    if (supabase) {
      const { data: result, error } = await supabase
        .from('attendees')
        .insert(attendee)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    }
    
    // Fallback em memória
    inMemoryAttendees.push(attendee);
    return attendee;
  }
  
  /**
   * Buscar por ID
   */
  async findById(id) {
    if (supabase) {
      const { data, error } = await supabase
        .from('attendees')
        .select('*')
        .eq('id', id)
        .is('deleted_at', null)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    }
    
    return inMemoryAttendees.find(a => a.id === id && !a.deleted_at);
  }
  
  /**
   * Buscar por CPF
   */
  async findByCpf(cpf) {
    const normalizedCpf = cpf.replace(/\D/g, '');
    
    if (supabase) {
      const { data, error } = await supabase
        .from('attendees')
        .select('*')
        .eq('cpf', cpf)
        .is('deleted_at', null)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    }
    
    return inMemoryAttendees.find(a => 
      a.cpf && a.cpf.replace(/\D/g, '') === normalizedCpf && !a.deleted_at
    );
  }
  
  /**
   * Buscar por email
   */
  async findByEmail(email) {
    if (supabase) {
      const { data, error } = await supabase
        .from('attendees')
        .select('*')
        .eq('email', email.toLowerCase())
        .is('deleted_at', null)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    }
    
    return inMemoryAttendees.find(a => 
      a.email && a.email.toLowerCase() === email.toLowerCase() && !a.deleted_at
    );
  }
  
  /**
   * Atualizar participante
   */
  async update(id, data) {
    const updateData = {
      ...data,
      updated_at: new Date().toISOString()
    };
    
    // Remover campos que não devem ser atualizados
    delete updateData.id;
    delete updateData.created_at;
    
    if (supabase) {
      const { data: result, error } = await supabase
        .from('attendees')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    }
    
    const index = inMemoryAttendees.findIndex(a => a.id === id);
    if (index === -1) return null;
    
    inMemoryAttendees[index] = { ...inMemoryAttendees[index], ...updateData };
    return inMemoryAttendees[index];
  }
  
  /**
   * Listar participantes com filtros
   */
  async list({ page = 1, limit = 50, city, state, ticket_type, marketing_opt_in, search }) {
    const offset = (page - 1) * limit;
    
    if (supabase) {
      let query = supabase
        .from('attendees')
        .select('*', { count: 'exact' })
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      
      if (city) query = query.eq('city', city);
      if (state) query = query.eq('state', state);
      if (ticket_type) query = query.eq('ticket_type', ticket_type);
      if (marketing_opt_in !== undefined) query = query.eq('marketing_opt_in', marketing_opt_in);
      if (search) {
        query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,cpf.ilike.%${search}%`);
      }
      
      const { data, error, count } = await query;
      if (error) throw error;
      
      return {
        data,
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      };
    }
    
    // Fallback em memória
    let filtered = inMemoryAttendees.filter(a => !a.deleted_at);
    
    if (city) filtered = filtered.filter(a => a.city === city);
    if (state) filtered = filtered.filter(a => a.state === state);
    if (ticket_type) filtered = filtered.filter(a => a.ticket_type === ticket_type);
    if (marketing_opt_in !== undefined) filtered = filtered.filter(a => a.marketing_opt_in === marketing_opt_in);
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(a => 
        (a.full_name && a.full_name.toLowerCase().includes(s)) ||
        (a.email && a.email.toLowerCase().includes(s)) ||
        (a.cpf && a.cpf.includes(s))
      );
    }
    
    const total = filtered.length;
    const data = filtered.slice(offset, offset + limit);
    
    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
  
  /**
   * Soft delete (LGPD)
   */
  async softDelete(id) {
    if (supabase) {
      const { data, error } = await supabase
        .from('attendees')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }
    
    const attendee = inMemoryAttendees.find(a => a.id === id);
    if (attendee) {
      attendee.deleted_at = new Date().toISOString();
    }
    return attendee;
  }
  
  /**
   * Anonimizar dados (LGPD)
   */
  async anonymize(id) {
    const anonData = {
      full_name: 'DADOS ANONIMIZADOS',
      email: null,
      phone: null,
      cpf: null,
      age: null,
      birth_date: null,
      city: null,
      state: null,
      notes: null,
      tags: [],
      anonymized_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    if (supabase) {
      const { data, error } = await supabase
        .from('attendees')
        .update(anonData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }
    
    const attendee = inMemoryAttendees.find(a => a.id === id);
    if (attendee) {
      Object.assign(attendee, anonData);
    }
    return attendee;
  }
  
  /**
   * Estatísticas gerais
   */
  async getStats() {
    if (supabase) {
      const { data: total } = await supabase
        .from('attendees')
        .select('id', { count: 'exact', head: true })
        .is('deleted_at', null);
      
      const { data: withMarketing } = await supabase
        .from('attendees')
        .select('id', { count: 'exact', head: true })
        .is('deleted_at', null)
        .eq('marketing_opt_in', true);
      
      const { data: byCityResult } = await supabase
        .from('attendees')
        .select('city')
        .is('deleted_at', null)
        .not('city', 'is', null);
      
      // Agrupar por cidade
      const byCity = {};
      if (byCityResult) {
        byCityResult.forEach(r => {
          byCity[r.city] = (byCity[r.city] || 0) + 1;
        });
      }
      
      return {
        total: total || 0,
        withMarketingOptIn: withMarketing || 0,
        byCity: Object.entries(byCity)
          .map(([city, count]) => ({ city, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10)
      };
    }
    
    // Fallback em memória
    const active = inMemoryAttendees.filter(a => !a.deleted_at);
    const byCity = {};
    active.forEach(a => {
      if (a.city) byCity[a.city] = (byCity[a.city] || 0) + 1;
    });
    
    return {
      total: active.length,
      withMarketingOptIn: active.filter(a => a.marketing_opt_in).length,
      byCity: Object.entries(byCity)
        .map(([city, count]) => ({ city, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)
    };
  }
}

module.exports = new AttendeeService();
