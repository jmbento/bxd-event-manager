/**
 * AdminAccessControl - Painel de Controle de Acesso
 * 
 * Permite ao administrador:
 * - Convidar novos usuários
 * - Definir permissões por módulo
 * - Bloquear/desbloquear usuários
 * - Visualizar logs de auditoria
 */

import React, { useState, useEffect } from 'react';
import {
  Shield,
  UserPlus,
  Users,
  History,
  Lock,
  Unlock,
  Mail,
  Copy,
  Check,
  X,
  Eye,
  EyeOff,
  AlertTriangle,
  Clock,
  MapPin,
  Monitor,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  RefreshCw,
  Trash2,
  Edit,
  Save,
} from 'lucide-react';
import { MODULE_DEFINITIONS } from '../config/moduleConfig';
import type { SystemUser, UserInvite, AuditLog, UserPermissions, UserRole, ModuleKey } from '../types';
import {
  getUsers,
  getInvites,
  getAuditLogs,
  createInvite,
  blockUser,
  unblockUser,
  updateUserPermissions,
  revokeInvite,
  getCurrentUser,
  isAdmin,
  getLoginStats,
} from '../services/auditService';

// ============================================================
// SUBCOMPONENTS
// ============================================================

interface InviteModalProps {
  onClose: () => void;
  onInvite: (email: string, name: string, role: UserRole, permissions: UserPermissions) => void;
}

const InviteModal: React.FC<InviteModalProps> = ({ onClose, onInvite }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('collaborator');
  const [selectedModules, setSelectedModules] = useState<ModuleKey[]>(['dashboard']);
  const [canExport, setCanExport] = useState(false);
  const [canDelete, setCanDelete] = useState(false);
  const [canEditFinance, setCanEditFinance] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigableModules = MODULE_DEFINITIONS.filter(m => m.showInNavigation && m.key !== 'dashboard');

  const toggleModule = (key: ModuleKey) => {
    if (key === 'dashboard') return; // Dashboard sempre ativo
    setSelectedModules(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const selectAllModules = () => {
    setSelectedModules(['dashboard', ...navigableModules.map(m => m.key)]);
  };

  const clearModules = () => {
    setSelectedModules(['dashboard']);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !name) {
      setError('Preencha todos os campos obrigatórios');
      return;
    }

    if (!email.includes('@')) {
      setError('E-mail inválido');
      return;
    }

    setIsSubmitting(true);

    try {
      const permissions: UserPermissions = {
        modules: selectedModules,
        canInvite: role === 'admin' || role === 'manager',
        canExport,
        canDelete,
        canEditFinance,
      };

      onInvite(email, name, role, permissions);
    } catch (err: any) {
      setError(err.message || 'Erro ao criar convite');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex justify-between items-center">
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-blue-600" />
            Convidar Novo Usuário
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Dados básicos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nome completo *
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="João Silva"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                E-mail *
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="joao@empresa.com"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Função/Cargo */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Função no sistema
            </label>
            <select
              value={role}
              onChange={e => setRole(e.target.value as UserRole)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="admin">Administrador - Acesso total</option>
              <option value="manager">Gerente - Pode convidar e gerenciar</option>
              <option value="collaborator">Colaborador - Acesso aos módulos permitidos</option>
              <option value="viewer">Visualizador - Apenas leitura</option>
            </select>
            <p className="text-xs text-slate-500 mt-1">
              {role === 'admin' && '⚠️ Administradores têm acesso total ao sistema'}
              {role === 'manager' && 'Gerentes podem convidar novos usuários e gerenciar equipe'}
              {role === 'collaborator' && 'Colaboradores podem editar dados nos módulos permitidos'}
              {role === 'viewer' && 'Visualizadores só podem ver, não podem editar'}
            </p>
          </div>

          {/* Módulos */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-slate-700">
                Módulos permitidos
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={selectAllModules}
                  className="text-xs text-blue-600 hover:text-blue-700"
                >
                  Selecionar todos
                </button>
                <span className="text-slate-300">|</span>
                <button
                  type="button"
                  onClick={clearModules}
                  className="text-xs text-slate-500 hover:text-slate-700"
                >
                  Limpar
                </button>
              </div>
            </div>
            <div className="border border-slate-200 rounded-lg p-3 max-h-48 overflow-y-auto">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {/* Dashboard sempre ativo */}
                <label className="flex items-center gap-2 p-2 bg-blue-50 rounded cursor-not-allowed opacity-60">
                  <input type="checkbox" checked disabled className="rounded" />
                  <span className="text-sm text-slate-700">📊 Dashboard</span>
                </label>
                
                {navigableModules.map(module => (
                  <label
                    key={module.key}
                    className={`flex items-center gap-2 p-2 rounded cursor-pointer transition ${
                      selectedModules.includes(module.key)
                        ? 'bg-blue-50 border border-blue-200'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedModules.includes(module.key)}
                      onChange={() => toggleModule(module.key)}
                      className="rounded text-blue-600"
                    />
                    <span className="text-sm text-slate-700">{module.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {selectedModules.length} módulo(s) selecionado(s)
            </p>
          </div>

          {/* Permissões adicionais */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Permissões adicionais
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={canExport}
                  onChange={e => setCanExport(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <span className="text-sm text-slate-700">Pode exportar dados (PDF, Excel)</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={canEditFinance}
                  onChange={e => setCanEditFinance(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <span className="text-sm text-slate-700">Pode editar dados financeiros</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={canDelete}
                  onChange={e => setCanDelete(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <span className="text-sm text-slate-700">Pode deletar registros</span>
              </label>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-slate-300 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <UserPlus className="w-4 h-4" />
              )}
              Enviar Convite
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface EditPermissionsModalProps {
  user: SystemUser;
  onClose: () => void;
  onSave: (permissions: UserPermissions) => void;
}

const EditPermissionsModal: React.FC<EditPermissionsModalProps> = ({ user, onClose, onSave }) => {
  const [selectedModules, setSelectedModules] = useState<ModuleKey[]>(user.permissions.modules);
  const [canExport, setCanExport] = useState(user.permissions.canExport);
  const [canDelete, setCanDelete] = useState(user.permissions.canDelete);
  const [canEditFinance, setCanEditFinance] = useState(user.permissions.canEditFinance);
  const [canInvite, setCanInvite] = useState(user.permissions.canInvite);

  const navigableModules = MODULE_DEFINITIONS.filter(m => m.showInNavigation && m.key !== 'dashboard');

  const toggleModule = (key: ModuleKey) => {
    if (key === 'dashboard') return;
    setSelectedModules(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const handleSave = () => {
    onSave({
      modules: selectedModules,
      canInvite,
      canExport,
      canDelete,
      canEditFinance,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Editar Permissões</h3>
            <p className="text-sm text-slate-500">{user.name} ({user.email})</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Módulos */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Módulos permitidos
            </label>
            <div className="border border-slate-200 rounded-lg p-3 max-h-48 overflow-y-auto">
              <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center gap-2 p-2 bg-blue-50 rounded cursor-not-allowed opacity-60">
                  <input type="checkbox" checked disabled className="rounded" />
                  <span className="text-sm">📊 Dashboard</span>
                </label>
                
                {navigableModules.map(module => (
                  <label
                    key={module.key}
                    className={`flex items-center gap-2 p-2 rounded cursor-pointer transition ${
                      selectedModules.includes(module.key) ? 'bg-blue-50' : 'hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedModules.includes(module.key)}
                      onChange={() => toggleModule(module.key)}
                      className="rounded text-blue-600"
                    />
                    <span className="text-sm">{module.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Permissões */}
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={canInvite}
                onChange={e => setCanInvite(e.target.checked)}
                className="rounded text-blue-600"
              />
              <span className="text-sm">Pode convidar usuários</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={canExport}
                onChange={e => setCanExport(e.target.checked)}
                className="rounded text-blue-600"
              />
              <span className="text-sm">Pode exportar dados</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={canEditFinance}
                onChange={e => setCanEditFinance(e.target.checked)}
                className="rounded text-blue-600"
              />
              <span className="text-sm">Pode editar financeiro</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={canDelete}
                onChange={e => setCanDelete(e.target.checked)}
                className="rounded text-blue-600"
              />
              <span className="text-sm">Pode deletar registros</span>
            </label>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// MAIN COMPONENT
// ============================================================

interface AdminAccessControlProps {
  onRefresh?: () => void;
}

export const AdminAccessControl: React.FC<AdminAccessControlProps> = ({ onRefresh }) => {
  const [activeTab, setActiveTab] = useState<'users' | 'invites' | 'logs'>('users');
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [invites, setInvites] = useState<UserInvite[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [stats, setStats] = useState({ totalLogins: 0, failedLogins: 0, activeUsers: 0 });

  const currentUser = getCurrentUser();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setUsers(getUsers());
    setInvites(getInvites());
    setLogs(getAuditLogs().slice(-100).reverse());
    setStats(getLoginStats());
  };

  const handleInvite = (email: string, name: string, role: UserRole, permissions: UserPermissions) => {
    try {
      const invite = createInvite(email, name, role, permissions);
      if (invite) {
        setShowInviteModal(false);
        loadData();
        // Em produção, enviar e-mail com o link
        alert(`Convite criado!\n\nLink de acesso:\n${window.location.origin}?invite=${invite.token}\n\nEnvie este link para ${name}`);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleBlockUser = (userId: string) => {
    const reason = prompt('Motivo do bloqueio:');
    if (reason) {
      blockUser(userId, reason);
      loadData();
    }
  };

  const handleUnblockUser = (userId: string) => {
    if (confirm('Deseja realmente desbloquear este usuário?')) {
      unblockUser(userId);
      loadData();
    }
  };

  const handleUpdatePermissions = (userId: string, permissions: UserPermissions) => {
    updateUserPermissions(userId, permissions);
    setEditingUser(null);
    loadData();
  };

  const handleRevokeInvite = (inviteId: string) => {
    if (confirm('Deseja revogar este convite?')) {
      revokeInvite(inviteId);
      loadData();
    }
  };

  const copyInviteLink = (token: string) => {
    const link = `${window.location.origin}?invite=${token}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(token);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredLogs = logs.filter(l =>
    l.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.action.includes(searchQuery.toLowerCase())
  );

  const getRoleBadge = (role: UserRole) => {
    const styles = {
      admin: 'bg-purple-100 text-purple-700',
      manager: 'bg-blue-100 text-blue-700',
      collaborator: 'bg-green-100 text-green-700',
      viewer: 'bg-slate-100 text-slate-700',
    };
    const labels = {
      admin: 'Admin',
      manager: 'Gerente',
      collaborator: 'Colaborador',
      viewer: 'Visualizador',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[role]}`}>
        {labels[role]}
      </span>
    );
  };

  const getStatusBadge = (status: SystemUser['status']) => {
    const styles = {
      active: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      blocked: 'bg-red-100 text-red-700',
      inactive: 'bg-slate-100 text-slate-700',
    };
    const labels = {
      active: 'Ativo',
      pending: 'Pendente',
      blocked: 'Bloqueado',
      inactive: 'Inativo',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      login: '🔓 Login',
      logout: '🔒 Logout',
      login_failed: '❌ Login falhou',
      view_module: '👁️ Visualizou',
      create_record: '➕ Criou',
      update_record: '✏️ Atualizou',
      delete_record: '🗑️ Deletou',
      export_data: '📤 Exportou',
      invite_user: '📧 Convidou',
      update_permissions: '🔐 Alterou permissões',
      block_user: '🚫 Bloqueou',
      unblock_user: '✅ Desbloqueou',
    };
    return labels[action] || action;
  };

  if (!isAdmin()) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <Shield className="w-12 h-12 text-red-400 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-red-900">Acesso Restrito</h3>
        <p className="text-red-700 mt-1">
          Apenas administradores podem acessar o controle de acesso.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{users.length}</p>
              <p className="text-sm text-slate-500">Usuários</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {invites.filter(i => i.status === 'pending').length}
              </p>
              <p className="text-sm text-slate-500">Convites pendentes</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <History className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.totalLogins}</p>
              <p className="text-sm text-slate-500">Total de logins</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.failedLogins}</p>
              <p className="text-sm text-slate-500">Logins falhos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs e Ações */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-slate-200 px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                activeTab === 'users'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              Usuários
            </button>
            <button
              onClick={() => setActiveTab('invites')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                activeTab === 'invites'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Mail className="w-4 h-4 inline mr-2" />
              Convites
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                activeTab === 'logs'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <History className="w-4 h-4 inline mr-2" />
              Logs
            </button>
          </div>

          <div className="flex gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={() => setShowInviteModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Convidar
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="space-y-3">
              {filteredUsers.length === 0 ? (
                <p className="text-center text-slate-500 py-8">Nenhum usuário encontrado</p>
              ) : (
                filteredUsers.map(user => (
                  <div
                    key={user.id}
                    className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-slate-900">{user.name}</p>
                            {getRoleBadge(user.role)}
                            {getStatusBadge(user.status)}
                          </div>
                          <p className="text-sm text-slate-500">{user.email}</p>
                          {user.lastLogin && (
                            <p className="text-xs text-slate-400">
                              Último acesso: {new Date(user.lastLogin).toLocaleString('pt-BR')}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                          {user.permissions.modules.length} módulos
                        </span>
                        
                        {user.id !== currentUser?.id && user.role !== 'admin' && (
                          <>
                            <button
                              onClick={() => setEditingUser(user)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              title="Editar permissões"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            
                            {user.status === 'blocked' ? (
                              <button
                                onClick={() => handleUnblockUser(user.id)}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                                title="Desbloquear"
                              >
                                <Unlock className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleBlockUser(user.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                title="Bloquear"
                              >
                                <Lock className="w-4 h-4" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    {user.status === 'blocked' && user.blockedReason && (
                      <div className="mt-2 bg-red-50 border border-red-200 rounded p-2 text-sm text-red-700">
                        <strong>Motivo do bloqueio:</strong> {user.blockedReason}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* Invites Tab */}
          {activeTab === 'invites' && (
            <div className="space-y-3">
              {invites.length === 0 ? (
                <p className="text-center text-slate-500 py-8">Nenhum convite enviado</p>
              ) : (
                invites.map(invite => (
                  <div
                    key={invite.id}
                    className={`border rounded-lg p-4 ${
                      invite.status === 'pending'
                        ? 'border-blue-200 bg-blue-50'
                        : invite.status === 'accepted'
                        ? 'border-green-200 bg-green-50'
                        : 'border-slate-200 bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-slate-900">{invite.name}</p>
                          {getRoleBadge(invite.role)}
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              invite.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-700'
                                : invite.status === 'accepted'
                                ? 'bg-green-100 text-green-700'
                                : invite.status === 'expired'
                                ? 'bg-orange-100 text-orange-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {invite.status === 'pending' && 'Pendente'}
                            {invite.status === 'accepted' && 'Aceito'}
                            {invite.status === 'expired' && 'Expirado'}
                            {invite.status === 'revoked' && 'Revogado'}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500">{invite.email}</p>
                        <p className="text-xs text-slate-400">
                          Enviado em {new Date(invite.createdAt).toLocaleString('pt-BR')}
                          {' • '}
                          Expira em {new Date(invite.expiresAt).toLocaleString('pt-BR')}
                        </p>
                      </div>

                      {invite.status === 'pending' && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => copyInviteLink(invite.token)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition"
                            title="Copiar link"
                          >
                            {copiedLink === invite.token ? (
                              <Check className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleRevokeInvite(invite.id)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                            title="Revogar convite"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Logs Tab */}
          {activeTab === 'logs' && (
            <div className="space-y-2">
              {filteredLogs.length === 0 ? (
                <p className="text-center text-slate-500 py-8">Nenhum log encontrado</p>
              ) : (
                filteredLogs.map(log => (
                  <div
                    key={log.id}
                    className="border border-slate-200 rounded-lg p-3 hover:bg-slate-50 transition text-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          {log.action === 'login' && <Lock className="w-4 h-4 text-green-600" />}
                          {log.action === 'logout' && <Unlock className="w-4 h-4 text-slate-500" />}
                          {log.action === 'login_failed' && <AlertTriangle className="w-4 h-4 text-red-600" />}
                          {log.action === 'view_module' && <Eye className="w-4 h-4 text-blue-600" />}
                          {log.action === 'block_user' && <Lock className="w-4 h-4 text-red-600" />}
                          {log.action === 'invite_user' && <Mail className="w-4 h-4 text-purple-600" />}
                          {!['login', 'logout', 'login_failed', 'view_module', 'block_user', 'invite_user'].includes(log.action) && (
                            <History className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-slate-900">
                              {log.userName}
                            </span>
                            <span className="text-slate-400">•</span>
                            <span className="text-slate-600">
                              {getActionLabel(log.action)}
                            </span>
                            {log.module && (
                              <span className="text-xs bg-slate-100 px-2 py-0.5 rounded">
                                {MODULE_DEFINITIONS.find(m => m.key === log.module)?.label || log.module}
                              </span>
                            )}
                          </div>
                          {log.details && (
                            <p className="text-slate-500 text-xs mt-0.5">{log.details}</p>
                          )}
                          <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(log.timestamp).toLocaleString('pt-BR')}
                            </span>
                            {log.location?.city && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {log.location.city}, {log.location.region}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showInviteModal && (
        <InviteModal
          onClose={() => setShowInviteModal(false)}
          onInvite={handleInvite}
        />
      )}

      {editingUser && (
        <EditPermissionsModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSave={(permissions) => handleUpdatePermissions(editingUser.id, permissions)}
        />
      )}
    </div>
  );
};
