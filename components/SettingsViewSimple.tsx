import React, { useState } from 'react';
import { 
  Settings, Save, Calendar, MapPin, Users, Palette, Image, 
  Bell, Shield, Mail, Phone, Globe, Building, Clock, Upload,
  CheckCircle, X, Plus, Trash2, Edit2, Copy, ExternalLink, Lock
} from 'lucide-react';
import type { EventProfile } from '../types';
import { AdminAccessControl } from './AdminAccessControl';
import { isAdmin, getCurrentUser } from '../services/auditService';

interface SettingsViewProps {
  profile?: EventProfile;
  onSave?: (profile: EventProfile) => void;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'coordinator' | 'viewer';
  status: 'active' | 'pending' | 'inactive';
}

export const SettingsViewSimple: React.FC<SettingsViewProps> = ({ profile, onSave }) => {
  const [activeTab, setActiveTab] = useState<'event' | 'team' | 'access' | 'notifications' | 'security'>('event');
  const currentUser = getCurrentUser();
  const userIsAdmin = isAdmin();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Estado do perfil do evento
  const [eventData, setEventData] = useState<EventProfile>(profile || {
    eventName: '',
    edition: new Date().getFullYear().toString(),
    startDate: '',
    endDate: '',
    location: '',
    expectedAudience: 0,
    description: '',
    logoUrl: '',
    primaryColor: '#3b82f6',
    secondaryColor: '#1e40af'
  });

  // Estado da equipe
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<TeamMember['role']>('viewer');

  // Link de acesso
  const accessLink = `${window.location.origin}?event=${encodeURIComponent(eventData.eventName || 'novo-evento')}`;

  const handleSave = async () => {
    setSaving(true);
    // Simular salvamento
    await new Promise(resolve => setTimeout(resolve, 1000));
    onSave?.(eventData);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleInvite = () => {
    if (!inviteEmail) return;
    
    const newMember: TeamMember = {
      id: `team-${Date.now()}`,
      name: inviteEmail.split('@')[0],
      email: inviteEmail,
      role: inviteRole,
      status: 'pending'
    };
    
    setTeam([...team, newMember]);
    setInviteEmail('');
    setShowInviteModal(false);
  };

  const handleRemoveMember = (id: string) => {
    if (confirm('Remover este membro da equipe?')) {
      setTeam(team.filter(m => m.id !== id));
    }
  };

  const copyAccessLink = () => {
    navigator.clipboard.writeText(accessLink);
    alert('Link copiado!');
  };

  const getRoleLabel = (role: TeamMember['role']) => {
    const labels = {
      admin: 'Administrador',
      manager: 'Gerente',
      coordinator: 'Coordenador',
      viewer: 'Visualizador'
    };
    return labels[role];
  };

  const getRoleColor = (role: TeamMember['role']) => {
    const colors = {
      admin: 'bg-red-100 text-red-800',
      manager: 'bg-purple-100 text-purple-800',
      coordinator: 'bg-blue-100 text-blue-800',
      viewer: 'bg-slate-100 text-slate-800'
    };
    return colors[role];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings className="w-8 h-8 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Configurações do Evento</h2>
            <p className="text-sm text-slate-500">Configure os dados básicos e gerencie sua equipe</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Salvando...
            </>
          ) : saved ? (
            <>
              <CheckCircle className="w-4 h-4" />
              Salvo!
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Salvar
            </>
          )}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 overflow-x-auto">
        {[
          { id: 'event', label: 'Dados do Evento', icon: Calendar },
          { id: 'team', label: 'Equipe', icon: Users },
          { id: 'access', label: 'Link de Acesso', icon: ExternalLink },
          { id: 'notifications', label: 'Notificações', icon: Bell },
          ...(userIsAdmin ? [{ id: 'security', label: 'Controle de Acesso', icon: Lock }] : []),
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${
              activeTab === tab.id
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Dados do Evento */}
      {activeTab === 'event' && (
        <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-6">
          {/* Logo e Cores */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Logo do Evento
              </label>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-blue-500 transition cursor-pointer">
                {eventData.logoUrl ? (
                  <img src={eventData.logoUrl} alt="Logo" className="h-20 mx-auto" />
                ) : (
                  <>
                    <Image className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">Clique para upload</p>
                  </>
                )}
              </div>
              <input
                type="text"
                value={eventData.logoUrl}
                onChange={(e) => setEventData({...eventData, logoUrl: e.target.value})}
                placeholder="URL da logo"
                className="mt-2 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>

            <div className="md:col-span-2 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Cor Principal
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={eventData.primaryColor}
                    onChange={(e) => setEventData({...eventData, primaryColor: e.target.value})}
                    className="w-12 h-10 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={eventData.primaryColor}
                    onChange={(e) => setEventData({...eventData, primaryColor: e.target.value})}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Cor Secundária
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={eventData.secondaryColor}
                    onChange={(e) => setEventData({...eventData, secondaryColor: e.target.value})}
                    className="w-12 h-10 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={eventData.secondaryColor}
                    onChange={(e) => setEventData({...eventData, secondaryColor: e.target.value})}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Informações Básicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Nome do Evento *
              </label>
              <input
                type="text"
                value={eventData.eventName}
                onChange={(e) => setEventData({...eventData, eventName: e.target.value})}
                placeholder="Ex: Rock in Rio, Lollapalooza..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Edição
              </label>
              <input
                type="text"
                value={eventData.edition}
                onChange={(e) => setEventData({...eventData, edition: e.target.value})}
                placeholder="2025"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Datas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Data de Início *
              </label>
              <input
                type="date"
                value={eventData.startDate}
                onChange={(e) => setEventData({...eventData, startDate: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Data de Término *
              </label>
              <input
                type="date"
                value={eventData.endDate}
                onChange={(e) => setEventData({...eventData, endDate: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Local e Público */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Local / Endereço *
              </label>
              <input
                type="text"
                value={eventData.location}
                onChange={(e) => setEventData({...eventData, location: e.target.value})}
                placeholder="Ex: Parque Olímpico, Rio de Janeiro"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Público Esperado
              </label>
              <input
                type="number"
                value={eventData.expectedAudience || ''}
                onChange={(e) => setEventData({...eventData, expectedAudience: parseInt(e.target.value) || 0})}
                placeholder="5000"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Descrição do Evento
            </label>
            <textarea
              value={eventData.description}
              onChange={(e) => setEventData({...eventData, description: e.target.value})}
              placeholder="Descreva seu evento..."
              rows={4}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      )}

      {/* Tab: Equipe */}
      {activeTab === 'team' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-800">Membros da Equipe</h3>
            <button
              onClick={() => setShowInviteModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Convidar Membro
            </button>
          </div>

          {team.length === 0 ? (
            <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
              <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-slate-700 mb-2">Nenhum membro na equipe</h4>
              <p className="text-slate-500 mb-4">Convide pessoas para colaborar na gestão do evento</p>
              <button
                onClick={() => setShowInviteModal(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Convidar Primeiro Membro
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-slate-200 divide-y divide-slate-200">
              {team.map(member => (
                <div key={member.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold">
                        {member.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-800">{member.name}</h4>
                      <p className="text-sm text-slate-500">{member.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
                      {getRoleLabel(member.role)}
                    </span>
                    {member.status === 'pending' && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Pendente
                      </span>
                    )}
                    <button
                      onClick={() => handleRemoveMember(member.id)}
                      className="text-slate-400 hover:text-red-600 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Modal de Convite */}
          {showInviteModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-slate-800">Convidar Membro</h3>
                  <button onClick={() => setShowInviteModal(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      E-mail do Convidado *
                    </label>
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="email@exemplo.com"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Função
                    </label>
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value as TeamMember['role'])}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="admin">Administrador - Acesso total</option>
                      <option value="manager">Gerente - Gerencia tudo exceto configurações</option>
                      <option value="coordinator">Coordenador - Agenda, equipe e tarefas</option>
                      <option value="viewer">Visualizador - Apenas visualiza</option>
                    </select>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => setShowInviteModal(false)}
                      className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleInvite}
                      disabled={!inviteEmail}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <Mail className="w-4 h-4" />
                      Enviar Convite
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: Link de Acesso */}
      {activeTab === 'access' && (
        <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Link de Acesso ao Sistema</h3>
            <p className="text-slate-500 text-sm mb-4">
              Compartilhe este link com sua equipe para que eles possam acessar o sistema de gestão do evento.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-lg">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Link de Primeiro Acesso
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={accessLink}
                readOnly
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-600"
              />
              <button
                onClick={copyAccessLink}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Copiar
              </button>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Segurança
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Cada usuário precisará criar sua própria senha no primeiro acesso</li>
              <li>• O link expira após o primeiro uso</li>
              <li>• Você pode revogar o acesso a qualquer momento na aba Equipe</li>
            </ul>
          </div>

          <div className="border-t border-slate-200 pt-4">
            <h4 className="font-semibold text-slate-800 mb-3">Enviar Convite por E-mail</h4>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="email@gestor.com"
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg"
              />
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Enviar Convite
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Notificações */}
      {activeTab === 'notifications' && (
        <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-6">
          <h3 className="text-lg font-bold text-slate-800">Preferências de Notificação</h3>
          
          <div className="space-y-4">
            {[
              { id: 'budget', label: 'Alertas de Orçamento', desc: 'Quando gastos ultrapassarem limites' },
              { id: 'team', label: 'Atividade da Equipe', desc: 'Novos membros e alterações' },
              { id: 'tasks', label: 'Tarefas Pendentes', desc: 'Lembretes de prazos' },
              { id: 'reports', label: 'Relatórios Semanais', desc: 'Resumo semanal por e-mail' },
            ].map(item => (
              <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-slate-800">{item.label}</h4>
                  <p className="text-sm text-slate-500">{item.desc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Controle de Acesso (Admin Only) */}
      {activeTab === 'security' && userIsAdmin && (
        <AdminAccessControl />
      )}
    </div>
  );
};
