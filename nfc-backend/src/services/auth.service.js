/**
 * Serviço de Autenticação
 * Login/logout de staff
 */

const { supabase } = require('../config/supabase');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../middleware/auth.middleware');
const { v4: uuidv4 } = require('uuid');

// Staff em memória para desenvolvimento
let inMemoryStaff = [
  {
    id: uuidv4(),
    username: 'admin',
    password_hash: bcrypt.hashSync('admin123', 10),
    full_name: 'Administrador',
    email: 'admin@evento.com',
    role: 'admin',
    permissions: {
      can_register_attendees: true,
      can_assign_wristbands: true,
      can_check_access: true,
      can_topup: true,
      can_process_purchase: true,
      can_refund: true,
      can_view_reports: true,
      can_manage_staff: true,
      can_manage_gates: true,
      can_manage_vendors: true
    },
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: uuidv4(),
    username: 'operador',
    password_hash: bcrypt.hashSync('op123', 10),
    full_name: 'Operador Portão',
    email: 'operador@evento.com',
    role: 'operator',
    permissions: {
      can_register_attendees: true,
      can_assign_wristbands: true,
      can_check_access: true,
      can_topup: false,
      can_process_purchase: false,
      can_refund: false,
      can_view_reports: false,
      can_manage_staff: false,
      can_manage_gates: false,
      can_manage_vendors: false
    },
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: uuidv4(),
    username: 'caixa',
    password_hash: bcrypt.hashSync('caixa123', 10),
    full_name: 'Operador Caixa',
    email: 'caixa@evento.com',
    role: 'operator',
    permissions: {
      can_register_attendees: false,
      can_assign_wristbands: false,
      can_check_access: false,
      can_topup: true,
      can_process_purchase: true,
      can_refund: false,
      can_view_reports: false,
      can_manage_staff: false,
      can_manage_gates: false,
      can_manage_vendors: false
    },
    is_active: true,
    created_at: new Date().toISOString()
  }
];

class AuthService {
  
  /**
   * Login
   */
  async login(username, password) {
    let user;
    
    if (supabase) {
      const { data, error } = await supabase
        .from('staff_users')
        .select('*')
        .eq('username', username)
        .eq('is_active', true)
        .single();
      
      if (error || !data) {
        throw new Error('Usuário ou senha inválidos');
      }
      
      user = data;
    } else {
      user = inMemoryStaff.find(u => u.username === username && u.is_active);
      
      if (!user) {
        throw new Error('Usuário ou senha inválidos');
      }
    }
    
    // Verificar senha
    const validPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!validPassword) {
      throw new Error('Usuário ou senha inválidos');
    }
    
    // Atualizar último login
    const now = new Date().toISOString();
    
    if (supabase) {
      await supabase
        .from('staff_users')
        .update({ last_login_at: now })
        .eq('id', user.id);
    } else {
      user.last_login_at = now;
    }
    
    // Gerar token
    const token = generateToken(user);
    
    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        permissions: user.permissions
      }
    };
  }
  
  /**
   * Criar novo usuário staff
   */
  async createUser({ username, password, full_name, email, phone, role, permissions }) {
    // Verificar se username já existe
    let existing;
    
    if (supabase) {
      const { data } = await supabase
        .from('staff_users')
        .select('id')
        .eq('username', username)
        .single();
      
      existing = data;
    } else {
      existing = inMemoryStaff.find(u => u.username === username);
    }
    
    if (existing) {
      throw new Error('Username já existe');
    }
    
    const passwordHash = await bcrypt.hash(password, 10);
    
    const user = {
      id: uuidv4(),
      username,
      password_hash: passwordHash,
      full_name,
      email: email || null,
      phone: phone || null,
      role: role || 'operator',
      permissions: permissions || {
        can_register_attendees: true,
        can_assign_wristbands: true,
        can_check_access: true,
        can_topup: false,
        can_process_purchase: false,
        can_refund: false,
        can_view_reports: false,
        can_manage_staff: false,
        can_manage_gates: false,
        can_manage_vendors: false
      },
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    if (supabase) {
      const { data, error } = await supabase
        .from('staff_users')
        .insert(user)
        .select()
        .single();
      
      if (error) throw error;
      
      // Remover hash da resposta
      delete data.password_hash;
      return data;
    }
    
    inMemoryStaff.push(user);
    
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
  
  /**
   * Alterar senha
   */
  async changePassword(userId, currentPassword, newPassword) {
    let user;
    
    if (supabase) {
      const { data, error } = await supabase
        .from('staff_users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error || !data) throw new Error('Usuário não encontrado');
      user = data;
    } else {
      user = inMemoryStaff.find(u => u.id === userId);
      if (!user) throw new Error('Usuário não encontrado');
    }
    
    // Verificar senha atual
    const validPassword = await bcrypt.compare(currentPassword, user.password_hash);
    if (!validPassword) {
      throw new Error('Senha atual incorreta');
    }
    
    // Hash da nova senha
    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    
    if (supabase) {
      await supabase
        .from('staff_users')
        .update({ 
          password_hash: newPasswordHash,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
    } else {
      user.password_hash = newPasswordHash;
      user.updated_at = new Date().toISOString();
    }
    
    return { success: true };
  }
  
  /**
   * Listar usuários
   */
  async listUsers() {
    if (supabase) {
      const { data, error } = await supabase
        .from('staff_users')
        .select('id, username, full_name, email, phone, role, permissions, is_active, created_at, last_login_at')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
    
    return inMemoryStaff.map(({ password_hash, ...user }) => user);
  }
  
  /**
   * Ativar/desativar usuário
   */
  async setUserActive(userId, isActive) {
    if (supabase) {
      const { data, error } = await supabase
        .from('staff_users')
        .update({ 
          is_active: isActive,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();
      
      if (error) throw error;
      
      delete data.password_hash;
      return data;
    }
    
    const user = inMemoryStaff.find(u => u.id === userId);
    if (!user) throw new Error('Usuário não encontrado');
    
    user.is_active = isActive;
    user.updated_at = new Date().toISOString();
    
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}

module.exports = new AuthService();
