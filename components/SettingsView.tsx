
import React, { useState } from 'react';
import { Settings, Users, Tag, Shield, Bell, Smartphone, Database, CreditCard, Plus, X, Edit2, Trash2, Save, Mail, CheckCircle2, XCircle, AlertCircle, Chrome, Cloud, FileText, Table, Palette, Monitor, Zap, Gift, Target, Upload, Play, Image, Send } from 'lucide-react';
import { notifyError, notifySuccess } from '../services/notificationService';

interface AppBanner {
  id: string;
  name: string;
  type: 'fullscreen' | 'footer' | 'interstitial';
  imageUrl: string;
  linkUrl?: string;
  frequency: number;
  sponsor: string;
}

interface AppModule {
  id: string;
  name: string;
  enabled: boolean;
  icon: string;
  order: number;
}

interface GameMission {
  id: string;
  title: string;
  description: string;
  trigger: string;
  reward: string;
  limit: number;
  sponsor: string;
  active: boolean;
}

interface PushNotification {
  id: string;
  title: string;
  message: string;
  segment: 'all' | 'vip' | 'attendees' | 'staff';
  scheduledAt?: string;
  sent: boolean;
}

const DEFAULT_TAGS: Tag[] = [
  { id: '1', name: 'Empresário', color: '#3b82f6', category: 'contato' },
  { id: '2', name: 'Comerciante', color: '#8b5cf6', category: 'contato' },
  { id: '3', name: 'Liderança Comunitária', color: '#f59e0b', category: 'contato' },
  { id: '4', name: 'Caminhada', color: '#10b981', category: 'evento' },
  { id: '5', name: 'Debate', color: '#ef4444', category: 'evento' },
];

const USER_ROLES: UserRole[] = [
  {
    id: 'admin',
    name: 'Administrador',
    permissions: ['all']
  },
  {
    id: 'gerente',
    name: 'Gerente de Campanha',
    permissions: ['agenda', 'crm', 'marketing', 'analytics', 'volunteers', 'polls']
  },
  {
    id: 'coordenador',
    name: 'Coordenador',
    permissions: ['agenda', 'crm', 'volunteers']
  },
  {
    id: 'voluntario',
    name: 'Voluntário',
    permissions: ['agenda_view', 'volunteers_view']
  }
];

const INITIAL_USERS: ManagedUser[] = [
  { id: 'u1', name: 'João Silva', email: 'joao@campanha.com', role: 'admin', status: 'online' },
  { id: 'u2', name: 'Maria Santos', email: 'maria@campanha.com', role: 'gerente', status: 'online' },
  { id: 'u3', name: 'Carlos Souza', email: 'carlos@campanha.com', role: 'coordenador', status: 'offline' },
  { id: 'u4', name: 'Ana Paula', email: 'ana@campanha.com', role: 'coordenador', status: 'online' },
  { id: 'u5', name: 'Pedro Lima', email: 'pedro@campanha.com', role: 'voluntario', status: 'offline' },
];

export const SettingsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'visual' | 'modules' | 'banners' | 'gamification' | 'notifications'>('visual');
  
  // App Visual Configuration
  const [appConfig, setAppConfig] = useState({
    eventName: 'Aurora Live Festival',
    logoUrl: '',
    primaryColor: '#d946ef',
    backgroundColor: '#1e293b',
    darkMode: true
  });
  
  // App Modules
  const [appModules, setAppModules] = useState<AppModule[]>([
    { id: 'lineup', name: 'Line-up', enabled: true, icon: 'Music', order: 1 },
    { id: 'map', name: 'Mapa', enabled: true, icon: 'MapPin', order: 2 },
    { id: 'cashless', name: 'Cashless', enabled: true, icon: 'CreditCard', order: 3 },
    { id: 'camping', name: 'Camping', enabled: false, icon: 'Tent', order: 4 },
    { id: 'food', name: 'Food Court', enabled: true, icon: 'UtensilsCrossed', order: 5 }
  ]);
  
  // Banners/Ads
  const [banners, setBanners] = useState<AppBanner[]>([
    { id: '1', name: 'Banner Heineken', type: 'fullscreen', imageUrl: '', frequency: 3, sponsor: 'Heineken', linkUrl: 'https://heineken.com' },
    { id: '2', name: 'Rodapé Coca-Cola', type: 'footer', imageUrl: '', frequency: 1, sponsor: 'Coca-Cola' }
  ]);
  
  // Gamification
  const [missions, setMissions] = useState<GameMission[]>([
    { id: '1', title: 'Caça ao Tesouro Coca-Cola', description: 'Escaneie o QR Code no estande', trigger: 'qr_scan_coca', reward: 'Cupom 10% no Bar', limit: 500, sponsor: 'Coca-Cola', active: true }
  ]);
  
  // Push Notifications
  const [notifications, setNotifications] = useState<PushNotification[]>([
    { id: '1', title: 'Show iniciando!', message: 'O show do Palco Mundo vai começar em 15 min!', segment: 'all', sent: false }
  ]);
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [showMissionModal, setShowMissionModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  const handleAddTag = () => {
    if (newTag.name.trim()) {
      setTags([...tags, { id: Date.now().toString(), ...newTag }]);
      setNewTag({ name: '', color: '#3b82f6', category: 'contato' });
      setShowNewTag(false);
    }
  };

  const handleDeleteTag = (id: string) => {
    setTags(tags.filter(tag => tag.id !== id));
  };

  const resetUserForm = () => {
    setUserForm({ name: '', email: '', role: 'coordenador', status: 'offline' });
    setEditingUserId(null);
  };

  const openCreateUser = () => {
    resetUserForm();
    setShowUserModal(true);
  };

  const openEditUser = (user: ManagedUser) => {
    setUserForm({ name: user.name, email: user.email, role: user.role, status: user.status });
    setEditingUserId(user.id);
    setShowUserModal(true);
  };

  const handleUserSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = userForm.name.trim();
    const trimmedEmail = userForm.email.trim().toLowerCase();

    if (!trimmedName || !trimmedEmail) {
      notifyError('Informe nome e e-mail para o usuário.');
      return;
    }

    const emailAlreadyUsed = users.some(
      (user) => user.email.toLowerCase() === trimmedEmail && user.id !== editingUserId
    );

    if (emailAlreadyUsed) {
      notifyError('Este e-mail já está cadastrado no sistema.');
      return;
    }

    if (editingUserId) {
      setUsers((prev) => prev.map((user) => (
        user.id === editingUserId
          ? { ...user, name: trimmedName, email: trimmedEmail, role: userForm.role, status: userForm.status }
          : user
      )));
      notifySuccess('Usuário atualizado com sucesso.');
    } else {
      const newUser: ManagedUser = {
        id: `user-${Date.now()}`,
        name: trimmedName,
        email: trimmedEmail,
        role: userForm.role,
        status: userForm.status,
      };
      setUsers((prev) => [newUser, ...prev]);
      notifySuccess('Usuário adicionado com sucesso.');
    }

    setShowUserModal(false);
    resetUserForm();
  };

  const handleDeleteUser = () => {
    if (!userToDelete) return;

    setUsers((prev) => prev.filter((user) => user.id !== userToDelete.id));
    notifySuccess('Usuário removido.');
    setUserToDelete(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Smartphone className="w-8 h-8 text-purple-600" />
          <div>
            <h2 className="text-2xl font-bold text-slate-800">CMS do App & Experiência</h2>
            <p className="text-sm text-slate-500">Controle remoto da experiência móvel do público</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Monitor className="w-4 h-4" />
          <span>Status: <strong className="text-green-600">App Online</strong> • 2.5k usuários</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab('visual')}
          className={`px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
            activeTab === 'visual'
              ? 'text-purple-600 border-b-2 border-purple-600'
              : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          <Palette className="w-4 h-4 inline mr-2" />
          Identidade Visual
        </button>
        <button
          onClick={() => setActiveTab('modules')}
          className={`px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
            activeTab === 'modules'
              ? 'text-purple-600 border-b-2 border-purple-600'
              : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          <Settings className="w-4 h-4 inline mr-2" />
          Módulos & Menu
        </button>
        <button
          onClick={() => setActiveTab('banners')}
          className={`px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
            activeTab === 'banners'
              ? 'text-purple-600 border-b-2 border-purple-600'
              : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          <Target className="w-4 h-4 inline mr-2" />
          Publicidade & Ads
        </button>
        <button
          onClick={() => setActiveTab('gamification')}
          className={`px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
            activeTab === 'gamification'
              ? 'text-purple-600 border-b-2 border-purple-600'
              : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          <Gift className="w-4 h-4 inline mr-2" />
          Gamification
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
            activeTab === 'notifications'
              ? 'text-purple-600 border-b-2 border-purple-600'
              : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          <Send className="w-4 h-4 inline mr-2" />
          Push Notifications
        </button>
      </div>

      {/* Tab Content - IDENTIDADE VISUAL */}
      {activeTab === 'visual' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Identidade Visual */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Palette className="w-5 h-5 text-purple-600" />
              Personalização Whitelabel
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Nome do Evento no App</label>
                <input
                  type="text"
                  defaultValue="BXD CAMPANHA"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Número do Candidato</label>
                <input
                  type="text"
                  defaultValue="55.123"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Partido</label>
                <input
                  type="text"
                  defaultValue="PSD"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">CNPJ</label>
                <input
                  type="text"
                  defaultValue="12.345.678/0001-99"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Preferências</h3>
            <div className="space-y-4">
              <label className="flex items-center justify-between p-4 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                <div>
                  <p className="font-medium text-slate-800">Notificações por E-mail</p>
                  <p className="text-sm text-slate-500">Receber alertas de eventos e prazos</p>
                </div>
                <input type="checkbox" defaultChecked className="w-5 h-5 text-blue-600" />
              </label>
              <label className="flex items-center justify-between p-4 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                <div>
                  <p className="font-medium text-slate-800">Backup Automático</p>
                  <p className="text-sm text-slate-500">Backup diário dos dados da campanha</p>
                </div>
                <input type="checkbox" defaultChecked className="w-5 h-5 text-blue-600" />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content - TAGS */}
      {activeTab === 'tags' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Tags Personalizadas</h3>
                <p className="text-sm text-slate-600 mt-1">Crie e gerencie tags para organizar contatos, eventos e conteúdos</p>
              </div>
              <button
                onClick={() => setShowNewTag(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Nova Tag
              </button>
            </div>

            {showNewTag && (
              <div className="mb-6 p-4 border-2 border-blue-200 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-slate-800">Criar Nova Tag</h4>
                  <button onClick={() => setShowNewTag(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Nome da Tag</label>
                    <input
                      type="text"
                      value={newTag.name}
                      onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
                      placeholder="Ex: Médico, Comércio Local"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Cor</label>
                    <input
                      type="color"
                      value={newTag.color}
                      onChange={(e) => setNewTag({ ...newTag, color: e.target.value })}
                      className="w-full h-10 px-2 py-1 border border-slate-300 rounded-lg cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Categoria</label>
                    <select
                      value={newTag.category}
                      onChange={(e) => setNewTag({ ...newTag, category: e.target.value as Tag['category'] })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="contato">Contato</option>
                      <option value="evento">Evento</option>
                      <option value="conteudo">Conteúdo</option>
                    </select>
                  </div>
                </div>
                <button
                  onClick={handleAddTag}
                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Salvar Tag
                </button>
              </div>
            )}

            <div className="space-y-3">
              {['contato', 'evento', 'conteudo'].map(category => (
                <div key={category}>
                  <h4 className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-2">
                    {category === 'contato' ? 'Contatos' : category === 'evento' ? 'Eventos' : 'Conteúdos'}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {tags.filter(tag => tag.category === category).map(tag => (
                      <div
                        key={tag.id}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-white"
                      >
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: tag.color }} />
                        <span className="text-sm font-medium text-slate-700">{tag.name}</span>
                        <button
                          onClick={() => handleDeleteTag(tag.id)}
                          className="text-slate-400 hover:text-red-600 ml-2"
                          title="Remover tag"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab Content - USUÁRIOS */}
      {activeTab === 'usuarios' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-500 rounded-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-800 mb-2">Controle de Acesso</h3>
                <p className="text-sm text-slate-600 mb-4">
                  Defina níveis de permissão para proteger dados sensíveis. <strong>Módulo Financeiro</strong> requer permissão específica.
                </p>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-slate-700">Seu Plano: PRO</span>
                  <span className="text-sm text-slate-600">• Até 10 usuários simultâneos</span>
                  <button className="ml-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    Upgrade Plano
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-800">Níveis de Acesso</h3>
              <button
                onClick={openCreateUser}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Convidar Usuário
              </button>
            </div>

            <div className="space-y-4">
              {USER_ROLES.map(role => (
                <div key={role.id} className="p-4 border border-slate-200 rounded-lg hover:border-blue-300 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-slate-800">{role.name}</h4>
                      <p className="text-sm text-slate-500 mt-1">
                        {role.id === 'admin' && 'Acesso total ao sistema, incluindo financeiro e configurações'}
                        {role.id === 'gerente' && 'Acesso completo exceto financeiro e configurações'}
                        {role.id === 'coordenador' && 'Gerencia agenda, contatos e voluntários'}
                        {role.id === 'voluntario' && 'Apenas visualização de agenda e lista de voluntários'}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      role.id === 'admin' ? 'bg-purple-100 text-purple-700' :
                      role.id === 'gerente' ? 'bg-blue-100 text-blue-700' :
                      role.id === 'coordenador' ? 'bg-emerald-100 text-emerald-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {role.permissions.length === 1 && role.permissions[0] === 'all' ? 'Todas' : role.permissions.length + ' permissões'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {role.permissions.slice(0, 5).map((perm, idx) => (
                      <span key={idx} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                        {perm === 'all' ? '🔓 Acesso Total' : perm.replace('_', ' ')}
                      </span>
                    ))}
                    {role.permissions.length > 5 && (
                      <span className="text-xs text-slate-500">+{role.permissions.length - 5} mais</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Usuários Ativos ({users.length}/10)</h3>
            <div className="space-y-3">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                        user.status === 'online' ? 'bg-emerald-500' : 'bg-slate-400'
                      }`} />
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">{user.name}</p>
                      <p className="text-sm text-slate-500">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                      user.role === 'gerente' ? 'bg-blue-100 text-blue-700' :
                      user.role === 'coordenador' ? 'bg-emerald-100 text-emerald-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {user.role === 'admin' ? 'Admin' : user.role === 'gerente' ? 'Gerente' : user.role === 'coordenador' ? 'Coordenador' : 'Voluntário'}
                    </span>
                    <button
                      className="text-slate-400 hover:text-slate-600"
                      title="Editar usuário"
                      onClick={() => openEditUser(user)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      className="text-slate-400 hover:text-red-500"
                      title="Remover usuário"
                      onClick={() => setUserToDelete(user)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {showUserModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-slate-800">{editingUserId ? 'Editar Usuário' : 'Adicionar Usuário'}</h2>
                  <button onClick={() => { setShowUserModal(false); resetUserForm(); }} className="text-slate-400 hover:text-slate-600" title="Fechar">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <form onSubmit={handleUserSubmit} className="p-6 space-y-4">
                  <div>
                    <label htmlFor="user-name" className="block text-sm font-medium text-slate-700 mb-2">Nome Completo *</label>
                    <input
                      id="user-name"
                      type="text"
                      value={userForm.name}
                      onChange={(e) => setUserForm((prev) => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="user-email" className="block text-sm font-medium text-slate-700 mb-2">E-mail *</label>
                    <input
                      id="user-email"
                      type="email"
                      value={userForm.email}
                      onChange={(e) => setUserForm((prev) => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="user-role" className="block text-sm font-medium text-slate-700 mb-2">Função</label>
                      <select
                        id="user-role"
                        value={userForm.role}
                        onChange={(e) => setUserForm((prev) => ({ ...prev, role: e.target.value as ManagedUser['role'] }))}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        {USER_ROLES.map((role) => (
                          <option key={role.id} value={role.id}>{role.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="user-status" className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                      <select
                        id="user-status"
                        value={userForm.status}
                        onChange={(e) => setUserForm((prev) => ({ ...prev, status: e.target.value as ManagedUser['status'] }))}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="online">Online</option>
                        <option value="offline">Offline</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => { setShowUserModal(false); resetUserForm(); }}
                      className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      {editingUserId ? 'Salvar Alterações' : 'Adicionar Usuário'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {userToDelete && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                <div className="px-6 py-4 border-b border-slate-200">
                  <h2 className="text-lg font-bold text-slate-800">Remover usuário</h2>
                </div>
                <div className="px-6 py-4 space-y-3">
                  <p className="text-sm text-slate-600">
                    Tem certeza de que deseja remover <strong>{userToDelete.name}</strong>?
                  </p>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-700">
                    Essa ação revoga imediatamente o acesso do usuário ao painel.
                  </div>
                </div>
                <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
                  <button
                    type="button"
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    onClick={() => setUserToDelete(null)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    onClick={handleDeleteUser}
                  >
                    Remover
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab Content - WHATSAPP */}
      {activeTab === 'whatsapp' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-200">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-emerald-500 rounded-lg">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-800 mb-2">⚠️ Compliance WhatsApp Business API</h3>
                <p className="text-sm text-slate-600 mb-4">
                  O sistema utiliza <strong>WhatsApp Business API</strong> para envios em massa respeitando as políticas do WhatsApp:
                </p>
                <ul className="text-sm text-slate-700 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span><strong>Opt-in obrigatório:</strong> Contatos precisam autorizar recebimento</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span><strong>Templates aprovados:</strong> Mensagens seguem modelos pré-aprovados pelo WhatsApp</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span><strong>Janela de 24h:</strong> Mensagens promocionais só após interação recente</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">✗</span>
                    <span><strong>Proibido:</strong> Spam, correntes, grupos automáticos sem consentimento</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Configuração da API</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">WhatsApp Business Account ID</label>
                <input
                  type="text"
                  placeholder="Digite o ID da sua conta business"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Access Token</label>
                <input
                  type="password"
                  placeholder="Token de acesso permanente da API"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Número de Telefone Verificado</label>
                <input
                  type="tel"
                  placeholder="+55 (24) 99999-9999"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                Testar Conexão
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Templates de Mensagem</h3>
            <p className="text-sm text-slate-600 mb-4">
              Crie e submeta templates para aprovação do WhatsApp. Apenas mensagens aprovadas podem ser enviadas em massa.
            </p>
            <div className="space-y-3">
              {[
                { name: 'convite_evento', status: 'aprovado', text: 'Olá {{nome}}, você está convidado para {{evento}}...' },
                { name: 'lembrete_agenda', status: 'aprovado', text: 'Lembrete: Evento {{titulo}} hoje às {{hora}}...' },
                { name: 'confirmacao_voluntario', status: 'pendente', text: 'Confirmamos sua inscrição como voluntário...' },
              ].map((template, idx) => (
                <div key={idx} className="p-4 border border-slate-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-slate-800">{template.name}</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      template.status === 'aprovado' 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {template.status === 'aprovado' ? '✓ Aprovado' : '⏳ Pendente'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">{template.text}</p>
                </div>
              ))}
            </div>
            <button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Novo Template
            </button>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
            <h4 className="font-semibold text-amber-900 mb-2">📋 Checklist de Compliance</h4>
            <div className="space-y-2">
              <label className="flex items-start gap-3">
                <input type="checkbox" className="mt-1 w-4 h-4 text-emerald-600" defaultChecked />
                <span className="text-sm text-slate-700">Todos os contatos forneceram opt-in explícito</span>
              </label>
              <label className="flex items-start gap-3">
                <input type="checkbox" className="mt-1 w-4 h-4 text-emerald-600" defaultChecked />
                <span className="text-sm text-slate-700">Templates submetidos e aprovados pelo WhatsApp</span>
              </label>
              <label className="flex items-start gap-3">
                <input type="checkbox" className="mt-1 w-4 h-4 text-emerald-600" />
                <span className="text-sm text-slate-700">Política de privacidade disponível aos contatos</span>
              </label>
              <label className="flex items-start gap-3">
                <input type="checkbox" className="mt-1 w-4 h-4 text-emerald-600" />
                <span className="text-sm text-slate-700">Sistema de opt-out (descadastro) implementado</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content - ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Fontes de Dados</h3>
            <p className="text-sm text-slate-600 mb-6">
              Configure as integrações para coletar dados automaticamente e alimentar o módulo Analytics.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'Instagram Business', icon: '📷', status: 'conectado', color: 'emerald' },
                { name: 'Facebook Page', icon: '👥', status: 'conectado', color: 'blue' },
                { name: 'Google Analytics', icon: '📊', status: 'desconectado', color: 'slate' },
                { name: 'YouTube Channel', icon: '🎥', status: 'desconectado', color: 'slate' },
                { name: 'Twitter/X API', icon: '🐦', status: 'conectado', color: 'emerald' },
                { name: 'TikTok Analytics', icon: '🎵', status: 'desconectado', color: 'slate' },
              ].map((source, idx) => (
                <div key={idx} className={`p-4 border-2 rounded-lg transition-all ${
                  source.status === 'conectado' 
                    ? 'border-emerald-200 bg-emerald-50' 
                    : 'border-slate-200 bg-white hover:border-blue-300'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{source.icon}</span>
                      <div>
                        <p className="font-medium text-slate-800">{source.name}</p>
                        <p className={`text-xs ${
                          source.status === 'conectado' ? 'text-emerald-600' : 'text-slate-500'
                        }`}>
                          {source.status === 'conectado' ? '✓ Conectado' : 'Não conectado'}
                        </p>
                      </div>
                    </div>
                    <button className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      source.status === 'conectado'
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}>
                      {source.status === 'conectado' ? 'Configurar' : 'Conectar'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Coleta de Dados Manuais</h3>
            <div className="space-y-4">
              <div className="p-4 border border-slate-200 rounded-lg">
                <h4 className="font-semibold text-slate-800 mb-2">Pesquisas de Intenção de Voto</h4>
                <p className="text-sm text-slate-600 mb-3">
                  Insira manualmente resultados de pesquisas eleitorais realizadas por institutos.
                </p>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  Adicionar Pesquisa
                </button>
              </div>
              <div className="p-4 border border-slate-200 rounded-lg">
                <h4 className="font-semibold text-slate-800 mb-2">Métricas de Eventos Offline</h4>
                <p className="text-sm text-slate-600 mb-3">
                  Registre público presente, engajamento e feedback de eventos presenciais.
                </p>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  Registrar Evento
                </button>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
            <h3 className="text-lg font-bold text-slate-800 mb-2">🤖 IA & Gemini Integration</h3>
            <p className="text-sm text-slate-600 mb-4">
              O módulo Analytics usa <strong>Google Gemini AI</strong> para análise preditiva e insights automáticos. 
              Configure sua API Key para ativar recursos de IA.
            </p>
            <div className="flex items-center gap-3">
              <input
                type="password"
                placeholder="Cole sua Gemini API Key"
                className="flex-1 px-4 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white"
              />
              <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content - MICROSOFT 365 */}
      {activeTab === 'microsoft' && (
        <div className="space-y-6">
          {/* Alert de Acesso Restrito */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <Shield className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-amber-900 mb-1">Acesso Restrito - Somente Administradores</h4>
              <p className="text-sm text-amber-700">
                Esta seção contém configurações sensíveis de integração com Microsoft 365. 
                Apenas usuários com perfil <strong>Administrador</strong> podem visualizar e modificar estas credenciais.
              </p>
            </div>
          </div>

          {/* Status da Conexão */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">Status da Integração</h3>
                <p className="text-sm text-slate-600">Conecte-se ao Microsoft 365 para sincronizar emails, calendário e Teams</p>
              </div>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                msConnected ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
              }`}>
                {msConnected ? (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-semibold">Conectado</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5" />
                    <span className="font-semibold">Desconectado</span>
                  </>
                )}
              </div>
            </div>

            {/* Serviços Disponíveis */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className={`p-4 border rounded-lg ${msConnected ? 'border-green-300 bg-green-50' : 'border-slate-200'}`}>
                <div className="flex items-center gap-3 mb-2">
                  <Mail className={`w-6 h-6 ${msConnected ? 'text-green-600' : 'text-slate-400'}`} />
                  <h4 className="font-semibold text-slate-800">Outlook</h4>
                </div>
                <p className="text-xs text-slate-600">Sincronize emails e contatos da campanha</p>
              </div>
              <div className={`p-4 border rounded-lg ${msConnected ? 'border-green-300 bg-green-50' : 'border-slate-200'}`}>
                <div className="flex items-center gap-3 mb-2">
                  <Shield className={`w-6 h-6 ${msConnected ? 'text-green-600' : 'text-slate-400'}`} />
                  <h4 className="font-semibold text-slate-800">Teams</h4>
                </div>
                <p className="text-xs text-slate-600">Integre reuniões e comunicação da equipe</p>
              </div>
              <div className={`p-4 border rounded-lg ${msConnected ? 'border-green-300 bg-green-50' : 'border-slate-200'}`}>
                <div className="flex items-center gap-3 mb-2">
                  <Database className={`w-6 h-6 ${msConnected ? 'text-green-600' : 'text-slate-400'}`} />
                  <h4 className="font-semibold text-slate-800">OneDrive</h4>
                </div>
                <p className="text-xs text-slate-600">Armazene e compartilhe documentos</p>
              </div>
            </div>

            {/* Resultado do Teste */}
            {connectionStatus !== 'idle' && (
              <div className={`p-4 rounded-lg mb-4 flex items-start gap-3 ${
                connectionStatus === 'success' 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                {connectionStatus === 'success' ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-green-900 mb-1">✓ Conexão bem-sucedida!</h4>
                      <p className="text-sm text-green-700">
                        Todas as credenciais foram validadas. A integração com Microsoft 365 está ativa.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-red-900 mb-1">✗ Falha na conexão</h4>
                      <p className="text-sm text-red-700">
                        Não foi possível conectar ao Microsoft 365. Verifique as credenciais e tente novamente.
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Configuração OAuth 2.0 */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Credenciais OAuth 2.0</h3>
            <p className="text-sm text-slate-600 mb-6">
              Para integrar com Microsoft 365, você precisa criar um <strong>App Registration</strong> no Azure AD Portal. 
              <a href="https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps/ApplicationsListBlade" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
                Acesse o Azure Portal →
              </a>
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Client ID (Application ID)
                </label>
                <input
                  type="text"
                  value={msConfig.clientId}
                  onChange={(e) => setMsConfig({...msConfig, clientId: e.target.value})}
                  placeholder="ex: 12345678-1234-1234-1234-123456789abc"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Encontre em: Azure AD → App registrations → Seu app → Overview
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tenant ID (Directory ID)
                </label>
                <input
                  type="text"
                  value={msConfig.tenantId}
                  onChange={(e) => setMsConfig({...msConfig, tenantId: e.target.value})}
                  placeholder="ex: 87654321-4321-4321-4321-cba987654321"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Encontre em: Azure AD → App registrations → Seu app → Overview
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Redirect URI
                </label>
                <input
                  type="text"
                  value={msConfig.redirectUri}
                  onChange={(e) => setMsConfig({...msConfig, redirectUri: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-slate-50"
                  readOnly
                />
                <p className="text-xs text-slate-500 mt-1">
                  ⚠️ Configure esta URL exata em: Azure AD → App registrations → Authentication → Redirect URIs
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setTestingConnection(true);
                    // Simular teste de conexão
                    setTimeout(() => {
                      if (msConfig.clientId && msConfig.tenantId) {
                        setConnectionStatus('success');
                        setMsConnected(true);
                      } else {
                        setConnectionStatus('error');
                        setMsConnected(false);
                      }
                      setTestingConnection(false);
                    }, 2000);
                  }}
                  disabled={testingConnection}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {testingConnection ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Testando conexão...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      Testar Conexão
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    // Salvar configurações
                    alert('Configurações salvas com sucesso!');
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Salvar Configurações
                </button>
              </div>
            </div>
          </div>

          {/* Permissões Necessárias */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Permissões da API (Scopes)</h3>
            <p className="text-sm text-slate-600 mb-4">
              Configure estas permissões no Azure AD para garantir acesso aos recursos do Microsoft 365:
            </p>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-slate-800">Mail.ReadWrite</p>
                  <p className="text-xs text-slate-600">Ler e enviar emails em nome do usuário</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-slate-800">Calendars.ReadWrite</p>
                  <p className="text-xs text-slate-600">Sincronizar eventos e compromissos</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-slate-800">Contacts.ReadWrite</p>
                  <p className="text-xs text-slate-600">Gerenciar contatos da campanha</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-slate-800">User.Read</p>
                  <p className="text-xs text-slate-600">Ler perfil básico do usuário conectado</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-slate-800">Files.ReadWrite.All</p>
                  <p className="text-xs text-slate-600">Acessar e gerenciar arquivos no OneDrive</p>
                </div>
              </div>
            </div>
          </div>

          {/* Guia Rápido */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
            <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600" />
              Guia de Configuração Rápida
            </h3>
            <ol className="space-y-2 text-sm text-slate-700">
              <li className="flex items-start gap-2">
                <span className="font-bold text-blue-600 flex-shrink-0">1.</span>
                <span>Acesse o <strong>Azure Portal</strong> e crie um novo <strong>App Registration</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-blue-600 flex-shrink-0">2.</span>
                <span>Copie o <strong>Client ID</strong> e <strong>Tenant ID</strong> da seção Overview</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-blue-600 flex-shrink-0">3.</span>
                <span>Configure o <strong>Redirect URI</strong> em Authentication → Add a platform → Web</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-blue-600 flex-shrink-0">4.</span>
                <span>Adicione as <strong>API Permissions</strong> listadas acima (Microsoft Graph)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-blue-600 flex-shrink-0">5.</span>
                <span>Clique em <strong>"Grant admin consent"</strong> para aprovar as permissões</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-blue-600 flex-shrink-0">6.</span>
                <span>Cole as credenciais aqui e clique em <strong>"Testar Conexão"</strong></span>
              </li>
            </ol>
          </div>

          {/* Quem Pode Acessar */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-amber-600" />
              Controle de Acesso
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-800">✓ Administrador</p>
                  <p className="text-sm text-slate-600">
                    Pode visualizar, configurar e testar credenciais Microsoft 365. 
                    Acesso total a todas as integrações e configurações sensíveis.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-800">✗ Demais usuários</p>
                  <p className="text-sm text-slate-600">
                    Gerentes, Coordenadores e Voluntários <strong>não podem acessar</strong> esta seção. 
                    Apenas visualizam se a integração está ativa ou não.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content - GOOGLE WORKSPACE */}
      {activeTab === 'google' && (
        <div className="space-y-6">
          {/* Alert de Acesso Restrito */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <Shield className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-amber-900 mb-1">Acesso Restrito - Somente Administradores</h4>
              <p className="text-sm text-amber-700">
                Esta seção contém configurações sensíveis de integração com Google Workspace. 
                Apenas usuários com perfil <strong>Administrador</strong> podem visualizar e modificar estas credenciais.
              </p>
            </div>
          </div>

          {/* Status da Conexão */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">Status da Integração Google</h3>
                <p className="text-sm text-slate-600">Conecte-se ao Google Workspace para sincronizar Gmail, Drive, Docs e Meet</p>
              </div>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                googleConnected ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
              }`}>
                {googleConnected ? (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-semibold">Conectado</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5" />
                    <span className="font-semibold">Desconectado</span>
                  </>
                )}
              </div>
            </div>

            {/* Serviços Google Disponíveis */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <div className={`p-4 border rounded-lg ${googleConnected ? 'border-green-300 bg-green-50' : 'border-slate-200'}`}>
                <div className="flex items-center gap-3 mb-2">
                  <Mail className={`w-6 h-6 ${googleConnected ? 'text-green-600' : 'text-slate-400'}`} />
                  <h4 className="font-semibold text-slate-800">Gmail</h4>
                </div>
                <p className="text-xs text-slate-600">Envie e receba emails da campanha</p>
              </div>
              <div className={`p-4 border rounded-lg ${googleConnected ? 'border-green-300 bg-green-50' : 'border-slate-200'}`}>
                <div className="flex items-center gap-3 mb-2">
                  <Cloud className={`w-6 h-6 ${googleConnected ? 'text-green-600' : 'text-slate-400'}`} />
                  <h4 className="font-semibold text-slate-800">Drive</h4>
                </div>
                <p className="text-xs text-slate-600">Armazene arquivos e documentos</p>
              </div>
              <div className={`p-4 border rounded-lg ${googleConnected ? 'border-green-300 bg-green-50' : 'border-slate-200'}`}>
                <div className="flex items-center gap-3 mb-2">
                  <FileText className={`w-6 h-6 ${googleConnected ? 'text-green-600' : 'text-slate-400'}`} />
                  <h4 className="font-semibold text-slate-800">Docs</h4>
                </div>
                <p className="text-xs text-slate-600">Crie e edite documentos colaborativos</p>
              </div>
              <div className={`p-4 border rounded-lg ${googleConnected ? 'border-green-300 bg-green-50' : 'border-slate-200'}`}>
                <div className="flex items-center gap-3 mb-2">
                  <Table className={`w-6 h-6 ${googleConnected ? 'text-green-600' : 'text-slate-400'}`} />
                  <h4 className="font-semibold text-slate-800">Sheets</h4>
                </div>
                <p className="text-xs text-slate-600">Gerencie planilhas e dados</p>
              </div>
              <div className={`p-4 border rounded-lg ${googleConnected ? 'border-green-300 bg-green-50' : 'border-slate-200'}`}>
                <div className="flex items-center gap-3 mb-2">
                  <Shield className={`w-6 h-6 ${googleConnected ? 'text-green-600' : 'text-slate-400'}`} />
                  <h4 className="font-semibold text-slate-800">Meet</h4>
                </div>
                <p className="text-xs text-slate-600">Agende videoconferências</p>
              </div>
              <div className={`p-4 border rounded-lg ${googleConnected ? 'border-green-300 bg-green-50' : 'border-slate-200'}`}>
                <div className="flex items-center gap-3 mb-2">
                  <Database className={`w-6 h-6 ${googleConnected ? 'text-green-600' : 'text-slate-400'}`} />
                  <h4 className="font-semibold text-slate-800">Calendar</h4>
                </div>
                <p className="text-xs text-slate-600">Sincronize agenda da equipe</p>
              </div>
            </div>

            {/* Resultado do Teste Google */}
            {googleConnectionStatus !== 'idle' && (
              <div className={`p-4 rounded-lg mb-4 flex items-start gap-3 ${
                googleConnectionStatus === 'success' 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                {googleConnectionStatus === 'success' ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-green-900 mb-1">✓ Conexão Google bem-sucedida!</h4>
                      <p className="text-sm text-green-700">
                        Credenciais validadas. A integração com Google Workspace está ativa e pronta para uso.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-red-900 mb-1">✗ Falha na conexão Google</h4>
                      <p className="text-sm text-red-700">
                        Não foi possível conectar ao Google Workspace. Verifique Client ID e Client Secret e tente novamente.
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Configuração OAuth 2.0 Google */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Credenciais OAuth 2.0 - Google Cloud</h3>
            <p className="text-sm text-slate-600 mb-6">
              Para integrar com Google Workspace, você precisa criar um projeto no <strong>Google Cloud Console</strong>. 
              <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
                Acesse o Google Cloud Console →
              </a>
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Client ID
                </label>
                <input
                  type="text"
                  value={googleConfig.clientId}
                  onChange={(e) => setGoogleConfig({...googleConfig, clientId: e.target.value})}
                  placeholder="ex: 123456789-abc123.apps.googleusercontent.com"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Encontre em: Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 Client IDs
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Client Secret
                </label>
                <input
                  type="password"
                  value={googleConfig.clientSecret}
                  onChange={(e) => setGoogleConfig({...googleConfig, clientSecret: e.target.value})}
                  placeholder="ex: GOCSPX-aBcDeFgHiJkLmNoPqRsTuVwXyZ"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Mantenha este segredo em local seguro. Não compartilhe publicamente.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Authorized Redirect URI
                </label>
                <input
                  type="text"
                  value={googleConfig.redirectUri}
                  onChange={(e) => setGoogleConfig({...googleConfig, redirectUri: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-slate-50"
                  readOnly
                />
                <p className="text-xs text-slate-500 mt-1">
                  ⚠️ Adicione esta URI em: Google Cloud Console → OAuth 2.0 Client → Authorized redirect URIs
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setTestingGoogleConnection(true);
                    // Simular teste de conexão Google
                    setTimeout(() => {
                      if (googleConfig.clientId && googleConfig.clientSecret) {
                        setGoogleConnectionStatus('success');
                        setGoogleConnected(true);
                      } else {
                        setGoogleConnectionStatus('error');
                        setGoogleConnected(false);
                      }
                      setTestingGoogleConnection(false);
                    }, 2000);
                  }}
                  disabled={testingGoogleConnection}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {testingGoogleConnection ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Testando conexão...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      Testar Conexão
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    alert('Configurações Google salvas com sucesso!');
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Salvar Configurações
                </button>
              </div>
            </div>
          </div>

          {/* APIs e Scopes Necessários */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4">APIs e Permissões (Scopes)</h3>
            <p className="text-sm text-slate-600 mb-4">
              Ative estas APIs no Google Cloud Console e configure os seguintes escopos OAuth:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-slate-800">Gmail API</p>
                  <p className="text-xs text-slate-600 mb-1">https://www.googleapis.com/auth/gmail.send</p>
                  <p className="text-xs text-slate-600">https://www.googleapis.com/auth/gmail.readonly</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-slate-800">Google Drive API</p>
                  <p className="text-xs text-slate-600 mb-1">https://www.googleapis.com/auth/drive.file</p>
                  <p className="text-xs text-slate-600">https://www.googleapis.com/auth/drive.readonly</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-slate-800">Google Docs API</p>
                  <p className="text-xs text-slate-600 mb-1">https://www.googleapis.com/auth/documents</p>
                  <p className="text-xs text-slate-600">https://www.googleapis.com/auth/documents.readonly</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-slate-800">Google Sheets API</p>
                  <p className="text-xs text-slate-600 mb-1">https://www.googleapis.com/auth/spreadsheets</p>
                  <p className="text-xs text-slate-600">https://www.googleapis.com/auth/spreadsheets.readonly</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-slate-800">Google Calendar API</p>
                  <p className="text-xs text-slate-600 mb-1">https://www.googleapis.com/auth/calendar</p>
                  <p className="text-xs text-slate-600">https://www.googleapis.com/auth/calendar.events</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-slate-800">Google Meet API</p>
                  <p className="text-xs text-slate-600 mb-1">https://www.googleapis.com/auth/meetings.space.created</p>
                  <p className="text-xs text-slate-600">https://www.googleapis.com/auth/calendar.events</p>
                </div>
              </div>
            </div>
          </div>

          {/* Guia de Configuração Google */}
          <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-6 border border-red-200">
            <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              Guia de Configuração - Google Cloud Platform
            </h3>
            <ol className="space-y-2 text-sm text-slate-700">
              <li className="flex items-start gap-2">
                <span className="font-bold text-red-600 flex-shrink-0">1.</span>
                <span>Acesse o <strong>Google Cloud Console</strong> e crie um novo projeto ou selecione existente</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-red-600 flex-shrink-0">2.</span>
                <span>Vá em <strong>APIs & Services → Library</strong> e ative as APIs: Gmail, Drive, Docs, Sheets, Calendar</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-red-600 flex-shrink-0">3.</span>
                <span>Em <strong>Credentials</strong>, clique em <strong>"Create Credentials"</strong> → OAuth 2.0 Client ID</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-red-600 flex-shrink-0">4.</span>
                <span>Selecione <strong>"Web application"</strong> como tipo de aplicação</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-red-600 flex-shrink-0">5.</span>
                <span>Adicione o <strong>Redirect URI</strong> mostrado acima na lista de URIs autorizadas</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-red-600 flex-shrink-0">6.</span>
                <span>Copie o <strong>Client ID</strong> e <strong>Client Secret</strong> e cole aqui</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-red-600 flex-shrink-0">7.</span>
                <span>Configure a <strong>OAuth consent screen</strong> com nome e logo da campanha</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-red-600 flex-shrink-0">8.</span>
                <span>Adicione os <strong>scopes</strong> listados acima na consent screen</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-red-600 flex-shrink-0">9.</span>
                <span>Clique em <strong>"Testar Conexão"</strong> para validar a integração</span>
              </li>
            </ol>
          </div>

          {/* Casos de Uso */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4">💡 Casos de Uso da Integração</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gradient-to-br from-red-50 to-pink-50 border border-red-200 rounded-lg">
                <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-red-600" />
                  Gmail
                </h4>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li>• Enviar newsletters para apoiadores</li>
                  <li>• Sincronizar contatos do CRM</li>
                  <li>• Receber doações via email</li>
                </ul>
              </div>
              <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                  <Cloud className="w-5 h-5 text-blue-600" />
                  Drive
                </h4>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li>• Backup automático de documentos</li>
                  <li>• Compartilhar materiais de campanha</li>
                  <li>• Armazenar fotos de eventos</li>
                </ul>
              </div>
              <div className="p-4 bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg">
                <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                  <Table className="w-5 h-5 text-yellow-600" />
                  Sheets
                </h4>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li>• Exportar relatórios financeiros</li>
                  <li>• Lista de voluntários e escalas</li>
                  <li>• Planilhas de pesquisas eleitorais</li>
                </ul>
              </div>
              <div className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-lg">
                <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-purple-600" />
                  Meet
                </h4>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li>• Reuniões virtuais da equipe</li>
                  <li>• Lives e debates online</li>
                  <li>• Treinamento de coordenadores</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Controle de Acesso Google */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-amber-600" />
              Controle de Acesso - Google Workspace
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-800">✓ Administrador</p>
                  <p className="text-sm text-slate-600">
                    Pode visualizar, configurar e testar credenciais do Google Workspace. 
                    Acesso total a OAuth Client ID/Secret e gerenciamento de APIs.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-800">✗ Demais usuários</p>
                  <p className="text-sm text-slate-600">
                    Gerentes, Coordenadores e Voluntários <strong>não podem acessar</strong> esta seção. 
                    Apenas utilizam os recursos se a integração estiver ativa.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
