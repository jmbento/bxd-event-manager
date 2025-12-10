/**
 * Serviço de Auditoria - BXD Event Manager
 * 
 * Registra todas as ações dos usuários para controle e segurança.
 * Inclui: logins, ações em módulos, alterações de dados, etc.
 */

import type { AuditLog, AuditAction, ModuleKey, SystemUser, UserPermissions, UserRole, UserInvite, AccessSession } from '../types';

// ============================================================
// STORAGE KEYS
// ============================================================
const STORAGE_KEYS = {
  AUDIT_LOGS: 'bxd_audit_logs',
  USERS: 'bxd_users',
  INVITES: 'bxd_invites',
  SESSIONS: 'bxd_sessions',
  CURRENT_USER: 'bxd_current_user',
  CURRENT_SESSION: 'bxd_current_session',
};

// ============================================================
// HELPERS
// ============================================================

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function generateToken(): string {
  return `${Math.random().toString(36).substr(2, 15)}${Math.random().toString(36).substr(2, 15)}`;
}

async function getLocationFromIP(): Promise<{ city?: string; region?: string; country?: string } | undefined> {
  try {
    // Usa API gratuita para geolocalização (em produção, usar serviço mais robusto)
    const response = await fetch('https://ipapi.co/json/', { 
      signal: AbortSignal.timeout(3000) 
    });
    if (response.ok) {
      const data = await response.json();
      return {
        city: data.city,
        region: data.region,
        country: data.country_name,
      };
    }
  } catch {
    // Silenciosamente ignora erros de geolocalização
  }
  return undefined;
}

function getUserAgent(): string {
  return navigator.userAgent;
}

// ============================================================
// AUDIT LOG FUNCTIONS
// ============================================================

export function getAuditLogs(): AuditLog[] {
  const stored = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
  return stored ? JSON.parse(stored) : [];
}

function saveAuditLogs(logs: AuditLog[]): void {
  // Manter apenas últimos 1000 registros para não sobrecarregar localStorage
  const trimmedLogs = logs.slice(-1000);
  localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(trimmedLogs));
}

export async function logAction(
  action: AuditAction,
  options: {
    module?: ModuleKey;
    details?: string;
    targetUserId?: string;
  } = {}
): Promise<void> {
  const currentUser = getCurrentUser();
  const currentSession = getCurrentSession();
  
  if (!currentUser) return;

  const location = await getLocationFromIP();

  const log: AuditLog = {
    id: generateId(),
    userId: currentUser.id,
    userEmail: currentUser.email,
    userName: currentUser.name,
    action,
    module: options.module,
    details: options.details,
    targetUserId: options.targetUserId,
    ipAddress: undefined, // Em produção, pegar do servidor
    userAgent: getUserAgent(),
    location,
    timestamp: new Date().toISOString(),
    sessionId: currentSession?.id,
  };

  const logs = getAuditLogs();
  logs.push(log);
  saveAuditLogs(logs);
}

export function getAuditLogsByUser(userId: string): AuditLog[] {
  return getAuditLogs().filter(log => log.userId === userId);
}

export function getAuditLogsByAction(action: AuditAction): AuditLog[] {
  return getAuditLogs().filter(log => log.action === action);
}

export function getRecentAuditLogs(limit: number = 50): AuditLog[] {
  const logs = getAuditLogs();
  return logs.slice(-limit).reverse();
}

// ============================================================
// USER MANAGEMENT
// ============================================================

export function getUsers(): SystemUser[] {
  const stored = localStorage.getItem(STORAGE_KEYS.USERS);
  if (!stored) {
    // Criar admin padrão se não existir
    const defaultAdmin = createDefaultAdmin();
    saveUsers([defaultAdmin]);
    return [defaultAdmin];
  }
  return JSON.parse(stored);
}

function saveUsers(users: SystemUser[]): void {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

function createDefaultAdmin(): SystemUser {
  return {
    id: 'admin-default',
    email: 'admin@evento.com',
    name: 'Administrador',
    role: 'admin',
    status: 'active',
    permissions: {
      modules: ['dashboard', 'settings', 'finance', 'agenda', 'staffManager', 'crm', 'marketing', 'analytics', 'team', 'volunteers', 'polls', 'canvas', 'marketingAdvanced', 'advancedFinance', 'ecoGestao', 'legal', 'accounting', 'compliance', 'profile', 'help'],
      canInvite: true,
      canExport: true,
      canDelete: true,
      canEditFinance: true,
    },
    createdAt: new Date().toISOString(),
    createdBy: 'system',
  };
}

export function getUserById(id: string): SystemUser | undefined {
  return getUsers().find(u => u.id === id);
}

export function getUserByEmail(email: string): SystemUser | undefined {
  return getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
}

export function updateUser(userId: string, updates: Partial<SystemUser>): SystemUser | null {
  const users = getUsers();
  const index = users.findIndex(u => u.id === userId);
  
  if (index === -1) return null;
  
  users[index] = { ...users[index], ...updates };
  saveUsers(users);
  
  return users[index];
}

export function blockUser(userId: string, reason: string): boolean {
  const currentUser = getCurrentUser();
  if (!currentUser || currentUser.role !== 'admin') return false;
  
  const updated = updateUser(userId, {
    status: 'blocked',
    blockedAt: new Date().toISOString(),
    blockedBy: currentUser.id,
    blockedReason: reason,
  });
  
  if (updated) {
    logAction('block_user', {
      targetUserId: userId,
      details: `Bloqueou usuário: ${reason}`,
    });
    
    // Encerrar todas as sessões do usuário bloqueado
    endAllUserSessions(userId);
    
    return true;
  }
  
  return false;
}

export function unblockUser(userId: string): boolean {
  const currentUser = getCurrentUser();
  if (!currentUser || currentUser.role !== 'admin') return false;
  
  const updated = updateUser(userId, {
    status: 'active',
    blockedAt: undefined,
    blockedBy: undefined,
    blockedReason: undefined,
  });
  
  if (updated) {
    logAction('unblock_user', {
      targetUserId: userId,
      details: 'Desbloqueou usuário',
    });
    return true;
  }
  
  return false;
}

export function updateUserPermissions(userId: string, permissions: UserPermissions): boolean {
  const currentUser = getCurrentUser();
  if (!currentUser || currentUser.role !== 'admin') return false;
  
  const user = getUserById(userId);
  if (!user) return false;
  
  const updated = updateUser(userId, { permissions });
  
  if (updated) {
    logAction('update_permissions', {
      targetUserId: userId,
      details: `Atualizou permissões: ${permissions.modules.length} módulos`,
    });
    return true;
  }
  
  return false;
}

// ============================================================
// INVITE MANAGEMENT
// ============================================================

export function getInvites(): UserInvite[] {
  const stored = localStorage.getItem(STORAGE_KEYS.INVITES);
  return stored ? JSON.parse(stored) : [];
}

function saveInvites(invites: UserInvite[]): void {
  localStorage.setItem(STORAGE_KEYS.INVITES, JSON.stringify(invites));
}

export function createInvite(
  email: string,
  name: string,
  role: UserRole,
  permissions: UserPermissions
): UserInvite | null {
  const currentUser = getCurrentUser();
  if (!currentUser || !currentUser.permissions.canInvite) return null;
  
  // Verificar se já existe usuário ou convite para este email
  if (getUserByEmail(email)) {
    throw new Error('Já existe um usuário com este e-mail');
  }
  
  const existingInvite = getInvites().find(
    i => i.email.toLowerCase() === email.toLowerCase() && i.status === 'pending'
  );
  if (existingInvite) {
    throw new Error('Já existe um convite pendente para este e-mail');
  }
  
  const invite: UserInvite = {
    id: generateId(),
    email,
    name,
    role,
    permissions,
    token: generateToken(),
    createdAt: new Date().toISOString(),
    createdBy: currentUser.id,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 dias
    status: 'pending',
  };
  
  const invites = getInvites();
  invites.push(invite);
  saveInvites(invites);
  
  logAction('invite_user', {
    details: `Convidou ${name} (${email}) como ${role}`,
  });
  
  return invite;
}

export function getInviteByToken(token: string): UserInvite | undefined {
  return getInvites().find(i => i.token === token && i.status === 'pending');
}

export function acceptInvite(token: string, password: string): SystemUser | null {
  const invite = getInviteByToken(token);
  if (!invite) return null;
  
  // Verificar se não expirou
  if (new Date(invite.expiresAt) < new Date()) {
    updateInviteStatus(invite.id, 'expired');
    return null;
  }
  
  // Criar usuário
  const newUser: SystemUser = {
    id: generateId(),
    email: invite.email,
    name: invite.name,
    role: invite.role,
    status: 'active',
    permissions: invite.permissions,
    createdAt: new Date().toISOString(),
    createdBy: invite.createdBy,
  };
  
  const users = getUsers();
  users.push(newUser);
  saveUsers(users);
  
  // Marcar convite como aceito
  updateInviteStatus(invite.id, 'accepted');
  
  return newUser;
}

export function revokeInvite(inviteId: string): boolean {
  const currentUser = getCurrentUser();
  if (!currentUser || currentUser.role !== 'admin') return false;
  
  return updateInviteStatus(inviteId, 'revoked');
}

function updateInviteStatus(inviteId: string, status: UserInvite['status']): boolean {
  const invites = getInvites();
  const index = invites.findIndex(i => i.id === inviteId);
  
  if (index === -1) return false;
  
  invites[index].status = status;
  if (status === 'accepted') {
    invites[index].usedAt = new Date().toISOString();
  }
  
  saveInvites(invites);
  return true;
}

// ============================================================
// SESSION MANAGEMENT
// ============================================================

export function getSessions(): AccessSession[] {
  const stored = localStorage.getItem(STORAGE_KEYS.SESSIONS);
  return stored ? JSON.parse(stored) : [];
}

function saveSessions(sessions: AccessSession[]): void {
  localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
}

export function getCurrentSession(): AccessSession | null {
  const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_SESSION);
  return stored ? JSON.parse(stored) : null;
}

export async function startSession(user: SystemUser): Promise<AccessSession> {
  const location = await getLocationFromIP();
  
  const session: AccessSession = {
    id: generateId(),
    userId: user.id,
    startedAt: new Date().toISOString(),
    lastActivity: new Date().toISOString(),
    userAgent: getUserAgent(),
    location,
    isActive: true,
  };
  
  // Salvar sessão na lista
  const sessions = getSessions();
  sessions.push(session);
  saveSessions(sessions);
  
  // Salvar sessão atual
  localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, JSON.stringify(session));
  
  return session;
}

export function updateSessionActivity(): void {
  const session = getCurrentSession();
  if (!session) return;
  
  session.lastActivity = new Date().toISOString();
  localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, JSON.stringify(session));
  
  // Atualizar na lista também
  const sessions = getSessions();
  const index = sessions.findIndex(s => s.id === session.id);
  if (index !== -1) {
    sessions[index] = session;
    saveSessions(sessions);
  }
}

export function endCurrentSession(): void {
  const session = getCurrentSession();
  if (!session) return;
  
  session.isActive = false;
  
  const sessions = getSessions();
  const index = sessions.findIndex(s => s.id === session.id);
  if (index !== -1) {
    sessions[index] = session;
    saveSessions(sessions);
  }
  
  localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
}

export function endAllUserSessions(userId: string): void {
  const sessions = getSessions();
  sessions.forEach(session => {
    if (session.userId === userId) {
      session.isActive = false;
    }
  });
  saveSessions(sessions);
}

export function getActiveSessionsByUser(userId: string): AccessSession[] {
  return getSessions().filter(s => s.userId === userId && s.isActive);
}

// ============================================================
// CURRENT USER MANAGEMENT
// ============================================================

export function getCurrentUser(): SystemUser | null {
  const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return stored ? JSON.parse(stored) : null;
}

export function setCurrentUser(user: SystemUser): void {
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
}

export function clearCurrentUser(): void {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
}

// ============================================================
// LOGIN / LOGOUT
// ============================================================

export async function login(email: string, password: string): Promise<{ success: boolean; user?: SystemUser; error?: string }> {
  const user = getUserByEmail(email);
  
  if (!user) {
    await logLoginAttempt(email, false, 'Usuário não encontrado');
    return { success: false, error: 'Usuário não encontrado. Solicite um convite ao administrador.' };
  }
  
  if (user.status === 'blocked') {
    await logLoginAttempt(email, false, 'Usuário bloqueado');
    return { success: false, error: `Acesso bloqueado: ${user.blockedReason || 'Entre em contato com o administrador.'}` };
  }
  
  if (user.status === 'pending') {
    await logLoginAttempt(email, false, 'Convite pendente');
    return { success: false, error: 'Complete seu cadastro através do link de convite enviado por e-mail.' };
  }
  
  if (user.status === 'inactive') {
    await logLoginAttempt(email, false, 'Usuário inativo');
    return { success: false, error: 'Conta inativa. Entre em contato com o administrador.' };
  }
  
  // Em produção, verificar senha via Supabase Auth
  // Por enquanto, aceitar qualquer senha para facilitar desenvolvimento
  
  // Atualizar último login
  updateUser(user.id, {
    lastLogin: new Date().toISOString(),
    lastActivity: new Date().toISOString(),
  });
  
  // Criar sessão
  const session = await startSession(user);
  
  // Definir usuário atual
  setCurrentUser(user);
  
  // Registrar login bem-sucedido
  await logAction('login', {
    details: `Login realizado com sucesso`,
  });
  
  return { success: true, user };
}

async function logLoginAttempt(email: string, success: boolean, reason?: string): Promise<void> {
  const location = await getLocationFromIP();
  
  const log: AuditLog = {
    id: generateId(),
    userId: 'unknown',
    userEmail: email,
    userName: 'Tentativa de Login',
    action: success ? 'login' : 'login_failed',
    details: reason || (success ? 'Login bem-sucedido' : 'Falha no login'),
    userAgent: getUserAgent(),
    location,
    timestamp: new Date().toISOString(),
  };
  
  const logs = getAuditLogs();
  logs.push(log);
  saveAuditLogs(logs);
}

export async function logout(): Promise<void> {
  await logAction('logout', {
    details: 'Logout realizado',
  });
  
  endCurrentSession();
  clearCurrentUser();
  
  // Limpar auth básico também
  localStorage.removeItem('bxd_auth');
  localStorage.removeItem('bxd_user');
}

// ============================================================
// PERMISSION CHECKS
// ============================================================

export function canAccessModule(moduleKey: ModuleKey): boolean {
  const user = getCurrentUser();
  if (!user) return false;
  
  // Admin sempre tem acesso total
  if (user.role === 'admin') return true;
  
  // Verificar se o módulo está nas permissões
  return user.permissions.modules.includes(moduleKey);
}

export function canPerformAction(action: 'invite' | 'export' | 'delete' | 'editFinance'): boolean {
  const user = getCurrentUser();
  if (!user) return false;
  
  // Admin sempre pode tudo
  if (user.role === 'admin') return true;
  
  switch (action) {
    case 'invite':
      return user.permissions.canInvite;
    case 'export':
      return user.permissions.canExport;
    case 'delete':
      return user.permissions.canDelete;
    case 'editFinance':
      return user.permissions.canEditFinance;
    default:
      return false;
  }
}

export function isAdmin(): boolean {
  const user = getCurrentUser();
  return user?.role === 'admin';
}

// ============================================================
// MODULE ACCESS LOG
// ============================================================

export function logModuleAccess(moduleKey: ModuleKey): void {
  logAction('view_module', {
    module: moduleKey,
    details: `Acessou módulo`,
  });
  
  updateSessionActivity();
  
  // Atualizar lastActivity do usuário
  const user = getCurrentUser();
  if (user) {
    updateUser(user.id, {
      lastActivity: new Date().toISOString(),
    });
  }
}

// ============================================================
// STATISTICS
// ============================================================

export function getLoginStats(): {
  totalLogins: number;
  failedLogins: number;
  activeUsers: number;
  lastLogin?: AuditLog;
} {
  const logs = getAuditLogs();
  const users = getUsers();
  const sessions = getSessions();
  
  const loginLogs = logs.filter(l => l.action === 'login');
  const failedLogs = logs.filter(l => l.action === 'login_failed');
  const activeSessions = sessions.filter(s => s.isActive);
  
  return {
    totalLogins: loginLogs.length,
    failedLogins: failedLogs.length,
    activeUsers: activeSessions.length,
    lastLogin: loginLogs[loginLogs.length - 1],
  };
}
