import React, { useState } from 'react';
import { TeamMember } from '../types';
import { 
  Video, Phone, Mail, User, Shield, Plus, X, Send, CheckCircle, 
  UserPlus, Settings, Copy, Eye, EyeOff, Trash2, Edit2, Save,
  LayoutDashboard, DollarSign, Map, Trello, BarChart3, Users, Vote,
  UserCircle2, Leaf, Scale, Calculator, HelpCircle, AlertCircle
} from 'lucide-react';

interface Props {
  team: TeamMember[];
}

// Módulos disponíveis para permissão
const AVAILABLE_MODULES = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, description: 'Visão geral do evento' },
  { key: 'finance', label: 'Financeiro', icon: DollarSign, description: 'Controle financeiro' },
  { key: 'agenda', label: 'Agenda', icon: Map, description: 'Planejamento e produção' },
  { key: 'marketing', label: 'Marketing', icon: Trello, description: 'Quadro criativo' },
  { key: 'crm', label: 'CRM', icon: UserCircle2, description: 'Gestão de contatos' },
  { key: 'analytics', label: 'Analytics', icon: BarChart3, description: 'Métricas e relatórios' },
  { key: 'team', label: 'Equipe', icon: Users, description: 'Time interno' },
  { key: 'volunteers', label: 'Voluntários', icon: UserPlus, description: 'Gestão de voluntários' },
  { key: 'polls', label: 'Pesquisas', icon: Vote, description: 'Feedback do público' },
  { key: 'compliance', label: 'Compliance', icon: Scale, description: 'Documentos legais' },
  { key: 'ecogestao', label: 'EcoGestão', icon: Leaf, description: 'Sustentabilidade' },
  { key: 'accountingAdvisor', label: 'IA Contábil', icon: Calculator, description: 'Assistente contábil' },
  { key: 'legalAdvisor', label: 'IA Jurídica', icon: HelpCircle, description: 'Assistente jurídico' },
];

// Perfis de permissão pré-definidos
const PERMISSION_PROFILES = [
  { 
    id: 'admin', 
    label: 'Administrador', 
    description: 'Acesso total a todos os módulos',
    modules: AVAILABLE_MODULES.map(m => m.key)
  },
  { 
    id: 'financeiro', 
    label: 'Financeiro', 
    description: 'Foco em controle financeiro e compliance',
    modules: ['dashboard', 'finance', 'compliance', 'accountingAdvisor']
  },
  { 
    id: 'producao', 
    label: 'Produção', 
    description: 'Agenda, logística e operação',
    modules: ['dashboard', 'agenda', 'team', 'volunteers']
  },
  { 
    id: 'marketing', 
    label: 'Marketing', 
    description: 'Criativo, analytics e pesquisas',
    modules: ['dashboard', 'marketing', 'analytics', 'polls', 'crm']
  },
  { 
    id: 'visualizador', 
    label: 'Visualizador', 
    description: 'Apenas visualização do dashboard',
    modules: ['dashboard']
  },
  { 
    id: 'custom', 
    label: 'Personalizado', 
    description: 'Escolha manual dos módulos',
    modules: []
  },
];

interface InvitedMember {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions: string[];
  status: 'pending' | 'accepted' | 'expired';
  invitedAt: string;
  inviteLink?: string;
}

// Modal de Convite
interface InviteModalProps {
  onClose: () => void;
  onInvite: (member: InvitedMember) => void;
}

const InviteModal: React.FC<InviteModalProps> = ({ onClose, onInvite }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [selectedProfile, setSelectedProfile] = useState('admin');
  const [customPermissions, setCustomPermissions] = useState<string[]>(AVAILABLE_MODULES.map(m => m.key));
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [inviteLink, setInviteLink] = useState('');

  const handleProfileChange = (profileId: string) => {
    setSelectedProfile(profileId);
    const profile = PERMISSION_PROFILES.find(p => p.id === profileId);
    if (profile && profileId !== 'custom') {
      setCustomPermissions(profile.modules);
    }
  };

  const toggleModule = (moduleKey: string) => {
    setSelectedProfile('custom');
    setCustomPermissions(prev => 
      prev.includes(moduleKey) 
        ? prev.filter(k => k !== moduleKey)
        : [...prev, moduleKey]
    );
  };

  const handleSendInvite = async () => {
    if (!email || !name) return;
    
    setSending(true);
    
    // Simular envio de email (em produção, isso iria para um backend)
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Gerar link de convite único
    const uniqueId = `inv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const generatedLink = `${window.location.origin}/invite/${uniqueId}`;
    
    const newMember: InvitedMember = {
      id: uniqueId,
      email,
      name,
      role: role || 'Colaborador',
      permissions: customPermissions,
      status: 'pending',
      invitedAt: new Date().toISOString(),
      inviteLink: generatedLink,
    };
    
    setInviteLink(generatedLink);
    setSending(false);
    setSuccess(true);
    
    onInvite(newMember);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(inviteLink);
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">Convite Enviado!</h3>
            <p className="text-slate-600 mb-4">
              Um email foi enviado para <strong>{email}</strong> com as instruções de acesso.
            </p>
            
            <div className="bg-slate-50 p-4 rounded-lg mb-4">
              <p className="text-xs text-slate-500 mb-2">Link de convite (válido por 7 dias):</p>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={inviteLink} 
                  readOnly 
                  className="flex-1 text-xs bg-white border border-slate-200 rounded px-2 py-1"
                />
                <button 
                  onClick={copyLink}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  Copiar
                </button>
              </div>
            </div>
            
            <div className="bg-blue-50 p-3 rounded-lg text-left mb-4">
              <p className="text-xs font-semibold text-blue-800 mb-1">Módulos liberados para {name}:</p>
              <div className="flex flex-wrap gap-1">
                {customPermissions.map(perm => {
                  const mod = AVAILABLE_MODULES.find(m => m.key === perm);
                  return mod ? (
                    <span key={perm} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                      {mod.label}
                    </span>
                  ) : null;
                })}
              </div>
            </div>
            
            <button 
              onClick={onClose}
              className="w-full px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex justify-between items-center">
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-blue-600" />
            Convidar Membro da Equipe
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600" title="Fechar">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Dados básicos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Nome Completo *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="João Silva"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Email *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="joao@empresa.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Função/Cargo</label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ex: Produtor, Coordenador Financeiro, Designer..."
            />
          </div>

          {/* Perfil de Permissão */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              <Shield className="w-4 h-4 inline mr-1" />
              Perfil de Acesso
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {PERMISSION_PROFILES.map(profile => (
                <button
                  key={profile.id}
                  type="button"
                  onClick={() => handleProfileChange(profile.id)}
                  className={`p-3 rounded-lg border-2 text-left transition ${
                    selectedProfile === profile.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <p className="font-semibold text-sm text-slate-900">{profile.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{profile.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Checklist de Módulos */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              <Eye className="w-4 h-4 inline mr-1" />
              Módulos que o convidado pode acessar
            </label>
            <p className="text-xs text-slate-500 mb-3">
              ✅ Marcado = Pode ver e usar | ❌ Desmarcado = Não aparece no menu
            </p>
            
            <div className="bg-slate-50 rounded-lg p-4 max-h-64 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {AVAILABLE_MODULES.map(mod => {
                  const Icon = mod.icon;
                  const isChecked = customPermissions.includes(mod.key);
                  
                  return (
                    <label 
                      key={mod.key}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition ${
                        isChecked 
                          ? 'bg-green-50 border border-green-200' 
                          : 'bg-white border border-slate-200 opacity-60'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleModule(mod.key)}
                        className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                      />
                      <Icon className={`w-5 h-5 ${isChecked ? 'text-green-600' : 'text-slate-400'}`} />
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium text-sm ${isChecked ? 'text-slate-900' : 'text-slate-500'}`}>
                          {mod.label}
                        </p>
                        <p className="text-xs text-slate-500 truncate">{mod.description}</p>
                      </div>
                      {isChecked ? (
                        <Eye className="w-4 h-4 text-green-500" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-slate-300" />
                      )}
                    </label>
                  );
                })}
              </div>
            </div>
            
            <div className="flex justify-between mt-2 text-xs">
              <button 
                onClick={() => setCustomPermissions(AVAILABLE_MODULES.map(m => m.key))}
                className="text-blue-600 hover:text-blue-700"
              >
                Selecionar todos
              </button>
              <button 
                onClick={() => setCustomPermissions(['dashboard'])}
                className="text-slate-500 hover:text-slate-700"
              >
                Apenas dashboard
              </button>
            </div>
          </div>

          {/* Resumo */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-800">Resumo do convite:</p>
                <p className="text-sm text-amber-700 mt-1">
                  <strong>{name || 'Convidado'}</strong> terá acesso a <strong>{customPermissions.length}</strong> módulos
                  {customPermissions.length < AVAILABLE_MODULES.length && 
                    ` (${AVAILABLE_MODULES.length - customPermissions.length} módulos ocultos)`
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={handleSendInvite}
              disabled={!email || !name || sending}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed font-semibold flex items-center justify-center gap-2"
            >
              {sending ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Enviar Convite
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Modal de Edição de Permissões
interface EditPermissionsModalProps {
  member: InvitedMember;
  onClose: () => void;
  onSave: (member: InvitedMember) => void;
}

const EditPermissionsModal: React.FC<EditPermissionsModalProps> = ({ member, onClose, onSave }) => {
  const [permissions, setPermissions] = useState<string[]>(member.permissions);

  const toggleModule = (moduleKey: string) => {
    setPermissions(prev => 
      prev.includes(moduleKey) 
        ? prev.filter(k => k !== moduleKey)
        : [...prev, moduleKey]
    );
  };

  const handleSave = () => {
    onSave({ ...member, permissions });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-900">
            Permissões de {member.name}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600" title="Fechar">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          <p className="text-sm text-slate-600 mb-4">
            Marque os módulos que <strong>{member.name}</strong> pode acessar:
          </p>
          
          <div className="space-y-2">
            {AVAILABLE_MODULES.map(mod => {
              const Icon = mod.icon;
              const isChecked = permissions.includes(mod.key);
              
              return (
                <label 
                  key={mod.key}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border transition ${
                    isChecked 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleModule(mod.key)}
                    className="w-5 h-5 text-green-600 rounded"
                  />
                  <Icon className={`w-5 h-5 ${isChecked ? 'text-green-600' : 'text-slate-400'}`} />
                  <span className={`font-medium ${isChecked ? 'text-slate-900' : 'text-slate-500'}`}>
                    {mod.label}
                  </span>
                </label>
              );
            })}
          </div>

          <div className="flex gap-3 mt-6">
            <button onClick={onClose} className="flex-1 px-4 py-2 border border-slate-300 rounded-lg">
              Cancelar
            </button>
            <button 
              onClick={handleSave}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
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

// Componente Principal
export const TeamViewComplete: React.FC<Props> = ({ team }) => {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [editingMember, setEditingMember] = useState<InvitedMember | null>(null);
  const [invitedMembers, setInvitedMembers] = useState<InvitedMember[]>([
    // Exemplo de membros já convidados
    {
      id: 'inv-1',
      email: 'maria@empresa.com',
      name: 'Maria Santos',
      role: 'Coordenadora Financeira',
      permissions: ['dashboard', 'finance', 'compliance', 'accountingAdvisor'],
      status: 'accepted',
      invitedAt: '2025-12-05T10:00:00Z',
    },
    {
      id: 'inv-2',
      email: 'carlos@agencia.com',
      name: 'Carlos Oliveira',
      role: 'Diretor de Marketing',
      permissions: ['dashboard', 'marketing', 'analytics', 'polls'],
      status: 'pending',
      invitedAt: '2025-12-08T14:30:00Z',
    },
  ]);

  const handleMeet = () => {
    window.open('https://meet.google.com/new', '_blank');
  };

  const handleInvite = (newMember: InvitedMember) => {
    setInvitedMembers(prev => [newMember, ...prev]);
  };

  const handleUpdatePermissions = (updatedMember: InvitedMember) => {
    setInvitedMembers(prev => 
      prev.map(m => m.id === updatedMember.id ? updatedMember : m)
    );
  };

  const handleRemoveMember = (id: string) => {
    if (confirm('Tem certeza que deseja remover este membro?')) {
      setInvitedMembers(prev => prev.filter(m => m.id !== id));
    }
  };

  const handleResendInvite = (member: InvitedMember) => {
    alert(`Convite reenviado para ${member.email}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Gestão de Equipe</h2>
          <p className="text-slate-500 text-sm mt-1">
            Convide membros e controle o que cada um pode acessar.
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-md transition-colors"
          >
            <UserPlus className="w-5 h-5" />
            <span>Convidar Membro</span>
          </button>
          <button 
            onClick={handleMeet}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium shadow-md transition-colors"
          >
            <Video className="w-5 h-5" />
            <span>Sala de Guerra</span>
          </button>
        </div>
      </div>

      {/* Membros Convidados */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Mail className="w-5 h-5 text-blue-600" />
            Membros Convidados ({invitedMembers.length})
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Gerencie permissões e acessos de cada membro
          </p>
        </div>

        {invitedMembers.length === 0 ? (
          <div className="p-8 text-center">
            <UserPlus className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">Nenhum membro convidado ainda.</p>
            <button 
              onClick={() => setShowInviteModal(true)}
              className="mt-3 text-blue-600 hover:text-blue-700 font-medium"
            >
              Convidar primeiro membro
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {invitedMembers.map(member => (
              <div key={member.id} className="p-4 hover:bg-slate-50 transition">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-slate-900">{member.name}</h4>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          member.status === 'accepted' 
                            ? 'bg-green-100 text-green-700' 
                            : member.status === 'pending'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {member.status === 'accepted' ? '✓ Ativo' : 
                           member.status === 'pending' ? '⏳ Pendente' : '✗ Expirado'}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500">{member.email}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{member.role}</p>
                      
                      {/* Módulos com acesso */}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {member.permissions.slice(0, 4).map(perm => {
                          const mod = AVAILABLE_MODULES.find(m => m.key === perm);
                          return mod ? (
                            <span key={perm} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                              {mod.label}
                            </span>
                          ) : null;
                        })}
                        {member.permissions.length > 4 && (
                          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                            +{member.permissions.length - 4}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setEditingMember(member)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Editar permissões"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                    {member.status === 'pending' && (
                      <button 
                        onClick={() => handleResendInvite(member)}
                        className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                        title="Reenviar convite"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    )}
                    <button 
                      onClick={() => handleRemoveMember(member.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Remover"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Time Interno (cards originais) */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-green-600" />
            Time Interno ({team.length})
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
          {team.map(member => (
            <div key={member.id} className="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden hover:border-blue-300 transition-all">
              <div className="p-4 flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
                  {member.photoUrl ? (
                    <img src={member.photoUrl} alt={member.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <User className="w-6 h-6" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-slate-900 truncate">{member.name}</h4>
                  <p className="text-xs text-blue-600 font-medium">{member.role}</p>
                  <div className="flex items-center gap-1.5 text-xs mt-1">
                    <span className={`w-2 h-2 rounded-full ${
                      member.status === 'active' ? 'bg-emerald-500' : 
                      member.status === 'busy' ? 'bg-amber-500' : 'bg-slate-300'
                    }`} />
                    <span className="text-slate-500">
                      {member.status === 'active' ? 'Disponível' : 
                       member.status === 'busy' ? 'Ocupado' : 'Offline'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-2 border-t border-slate-200 flex justify-around">
                <a href={`tel:${member.phone}`} className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition" title="Ligar">
                  <Phone className="w-4 h-4" />
                </a>
                <a href={`mailto:${member.email}`} className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition" title="Email">
                  <Mail className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modais */}
      {showInviteModal && (
        <InviteModal 
          onClose={() => setShowInviteModal(false)}
          onInvite={handleInvite}
        />
      )}

      {editingMember && (
        <EditPermissionsModal
          member={editingMember}
          onClose={() => setEditingMember(null)}
          onSave={handleUpdatePermissions}
        />
      )}
    </div>
  );
};

// Exportar também como padrão
export default TeamViewComplete;
