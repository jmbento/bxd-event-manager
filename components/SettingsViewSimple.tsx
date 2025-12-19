import React, { useState, useEffect } from 'react';
import { 
  Settings, Save, Calendar, MapPin, Users, Palette, Image, 
  Bell, Shield, Mail, Phone, Globe, Building, Clock, Upload,
  CheckCircle, X, Plus, Trash2, Edit2, Copy, ExternalLink, Lock, ChevronLeft, ChevronRight,
  DollarSign, CreditCard, Ticket, Wine, Home, Info, Image as ImageIcon
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
  const [activeTab, setActiveTab] = useState<'event' | 'team' | 'sales' | 'access' | 'notifications' | 'security'>('event');
  const currentUser = getCurrentUser();
  const userIsAdmin = isAdmin();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  
  // Banner states
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [showBannerMenu, setShowBannerMenu] = useState(false);
  const [bannerMenuPosition, setBannerMenuPosition] = useState({ x: 0, y: 0 });
  
  const [bannerImages, setBannerImages] = useState<string[]>(() => {
    const saved = localStorage.getItem('settings_banner_images');
    if (saved) return JSON.parse(saved);
    return [
      'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&h=300&fit=crop',
      'https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&h=300&fit=crop',
      'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1200&h=300&fit=crop',
    ];
  });

  useEffect(() => {
    localStorage.setItem('settings_banner_images', JSON.stringify(bannerImages));
  }, [bannerImages]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % bannerImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [bannerImages.length]);

  useEffect(() => {
    const handleClick = () => setShowBannerMenu(false);
    if (showBannerMenu) {
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [showBannerMenu]);

  const handleBannerRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setBannerMenuPosition({ x: e.clientX, y: e.clientY });
    setShowBannerMenu(true);
  };

  const handleChangeBannerImage = () => {
    const url = prompt('Cole a URL da imagem (deixe vazio para Unsplash aleatório):');
    if (url === null) return;
    const newUrl = url.trim() || `https://source.unsplash.com/1200x300/?business,${Date.now()}`;
    const updated = [...bannerImages];
    updated[currentBannerIndex] = newUrl;
    setBannerImages(updated);
    setShowBannerMenu(false);
  };

  const handleAddBannerImage = () => {
    const url = prompt('Cole a URL da nova imagem:');
    if (url && url.trim()) {
      setBannerImages([...bannerImages, url.trim()]);
    }
    setShowBannerMenu(false);
  };

  const handleRemoveBannerImage = () => {
    if (bannerImages.length > 1 && confirm('Remover esta imagem?')) {
      const updated = bannerImages.filter((_, i) => i !== currentBannerIndex);
      setBannerImages(updated);
      setCurrentBannerIndex(0);
    }
    setShowBannerMenu(false);
  };

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

  // Configuração de Vendas
  interface SalesSource {
    id: string;
    name: string;
    type: 'ingressos' | 'bar' | 'camarote' | 'outro';
    enabled: boolean;
    system: 'bxd' | 'sympla' | 'eventbrite' | 'mercadopago' | 'custom';
    apiKey?: string;
    apiUrl?: string;
    customName?: string;
  }

  const [isFreeEvent, setIsFreeEvent] = useState(false);
  const [salesSources, setSalesSources] = useState<SalesSource[]>(() => {
    const saved = localStorage.getItem('event_sales_config');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'ing1', name: 'Ingressos', type: 'ingressos', enabled: false, system: 'bxd' },
      { id: 'bar1', name: 'Bar', type: 'bar', enabled: false, system: 'bxd' },
      { id: 'cam1', name: 'Camarote', type: 'camarote', enabled: false, system: 'bxd' },
      { id: 'est1', name: 'Estacionamento', type: 'outro', enabled: false, system: 'bxd', customName: 'Estacionamento' },
    ];
  });

  useEffect(() => {
    localStorage.setItem('event_sales_config', JSON.stringify(salesSources));
  }, [salesSources]);

  useEffect(() => {
    localStorage.setItem('event_is_free', JSON.stringify(isFreeEvent));
  }, [isFreeEvent]);

  const handleAddSalesSource = () => {
    const customName = prompt('Nome da fonte de receita:');
    if (!customName) return;
    
    const newSource: SalesSource = {
      id: `custom-${Date.now()}`,
      name: customName,
      type: 'outro',
      enabled: true,
      system: 'custom',
      customName
    };
    setSalesSources([...salesSources, newSource]);
  };

  const handleToggleSalesSource = (id: string) => {
    setSalesSources(prev => prev.map(s => 
      s.id === id ? { ...s, enabled: !s.enabled } : s
    ));
  };

  const handleUpdateSalesSystem = (id: string, system: SalesSource['system'], apiKey?: string, apiUrl?: string) => {
    setSalesSources(prev => prev.map(s => 
      s.id === id ? { ...s, system, apiKey, apiUrl } : s
    ));
  };

  const handleRemoveSalesSource = (id: string) => {
    if (confirm('Remover esta fonte de receita?')) {
      setSalesSources(prev => prev.filter(s => s.id !== id));
    }
  };

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
      {/* Banner Carousel */}
      <div 
        className="relative w-full h-48 rounded-xl overflow-hidden group cursor-pointer"
        onContextMenu={handleBannerRightClick}
      >
        <img 
          src={bannerImages[currentBannerIndex]} 
          alt="Configurações"
          className="w-full h-full object-cover transition-opacity duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        
        <button
          onClick={() => setCurrentBannerIndex((prev) => (prev - 1 + bannerImages.length) % bannerImages.length)}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={() => setCurrentBannerIndex((prev) => (prev + 1) % bannerImages.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {bannerImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentBannerIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentBannerIndex ? 'bg-white w-8' : 'bg-white/50'
              }`}
            />
          ))}
        </div>

        <div className="absolute bottom-6 left-6 text-white">
          <h3 className="text-2xl font-bold mb-1">Configurações do Evento</h3>
          <p className="text-sm text-white/90">Personalize seu evento • Clique direito para trocar imagem</p>
        </div>
      </div>

      {showBannerMenu && (
        <div
          className="fixed bg-white rounded-lg shadow-xl border border-slate-200 py-1 z-50"
          style={{ top: bannerMenuPosition.y, left: bannerMenuPosition.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleChangeBannerImage}
            className="w-full px-4 py-2 text-left text-sm hover:bg-slate-100 flex items-center gap-2"
          >
            🖼️ Trocar esta imagem
          </button>
          <button
            onClick={handleAddBannerImage}
            className="w-full px-4 py-2 text-left text-sm hover:bg-slate-100 flex items-center gap-2"
          >
            ➕ Adicionar nova imagem
          </button>
          {bannerImages.length > 1 && (
            <button
              onClick={handleRemoveBannerImage}
              className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
            >
              🗑️ Remover esta imagem
            </button>
          )}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings className="w-8 h-8 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Configurações</h2>
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
          { id: 'sales', label: 'Vendas & Receitas', icon: DollarSign },
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

      {/* Tab: Vendas & Receitas */}
      {activeTab === 'sales' && (
        <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-6">
          {/* Evento Gratuito */}
          <div className="border-b border-slate-200 pb-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isFreeEvent}
                onChange={(e) => setIsFreeEvent(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-base font-semibold text-slate-800">Evento Gratuito (sem vendas)</span>
            </label>
            
            {isFreeEvent && (
              <div className="mt-4 border-2 border-dashed border-slate-300 rounded-lg p-8 text-center bg-slate-50">
                <div className="flex flex-col items-center gap-2">
                  <ImageIcon className="w-12 h-12 text-slate-400" />
                  <p className="text-sm text-slate-600">Adicione uma imagem representativa do evento gratuito</p>
                  <button className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
                    Selecionar Imagem
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Fontes de Receita */}
          {!isFreeEvent && (
            <>
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-4">Fontes de Receita</h3>
                <p className="text-sm text-slate-600 mb-4">
                  Configure as fontes de receita do seu evento e escolha entre usar o sistema BXD Event ou integrar com plataformas de terceiros.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {salesSources.map((source) => (
                  <div key={source.id} className="border border-slate-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
                    {/* Cabeçalho do Card */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        {source.type === 'ingressos' && <Ticket className="w-5 h-5 text-blue-600" />}
                        {source.type === 'bar' && <Wine className="w-5 h-5 text-purple-600" />}
                        {source.type === 'camarote' && <Home className="w-5 h-5 text-green-600" />}
                        {source.type === 'outro' && <DollarSign className="w-5 h-5 text-orange-600" />}
                        <span className="font-semibold text-slate-800">
                          {source.customName || source.name}
                        </span>
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <span className="text-xs text-slate-500">Ativo</span>
                        <input
                          type="checkbox"
                          checked={source.enabled}
                          onChange={() => handleToggleSalesSource(source.id)}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                      </label>
                    </div>

                    {/* Configurações (quando ativo) */}
                    {source.enabled && (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">
                            Sistema de Vendas
                          </label>
                          <select
                            value={source.system}
                            onChange={(e) => handleUpdateSalesSystem(source.id, e.target.value as any, source.apiKey, source.apiUrl)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="bxd">🏠 BXD Event (Sistema Interno)</option>
                            <option value="sympla">🎫 Sympla API</option>
                            <option value="eventbrite">🎪 Eventbrite API</option>
                            <option value="mercadopago">💳 MercadoPago</option>
                            <option value="custom">⚙️ API Customizada</option>
                          </select>
                        </div>

                        {/* Campos de API (somente para sistemas externos) */}
                        {source.system !== 'bxd' && (
                          <div className="space-y-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                            <div>
                              <label className="block text-xs font-medium text-slate-700 mb-1">
                                {source.system === 'custom' ? 'Token de Autenticação' : 'API Key'}
                              </label>
                              <input
                                type="text"
                                placeholder={`Digite a API Key do ${source.system === 'sympla' ? 'Sympla' : source.system === 'eventbrite' ? 'Eventbrite' : source.system === 'mercadopago' ? 'MercadoPago' : 'sistema'}`}
                                value={source.apiKey || ''}
                                onChange={(e) => handleUpdateSalesSystem(source.id, source.system, e.target.value, source.apiUrl)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>
                            
                            {source.system === 'custom' && (
                              <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">
                                  URL da API
                                </label>
                                <input
                                  type="text"
                                  placeholder="https://api.exemplo.com/vendas"
                                  value={source.apiUrl || ''}
                                  onChange={(e) => handleUpdateSalesSystem(source.id, source.system, source.apiKey, e.target.value)}
                                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                              </div>
                            )}

                            <div className="flex items-start gap-2 mt-2">
                              <CreditCard className="w-4 h-4 text-slate-400 mt-0.5" />
                              <p className="text-xs text-slate-600">
                                {source.system === 'sympla' && 'Configure sua API key no painel do Sympla em Configurações > Integrações'}
                                {source.system === 'eventbrite' && 'Crie um token de acesso em Account Settings > API Keys'}
                                {source.system === 'mercadopago' && 'Obtenha suas credenciais em Seu perfil > Credenciais'}
                                {source.system === 'custom' && 'Certifique-se de que sua API aceita requisições REST e retorna JSON'}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Botão Remover (somente para fontes customizadas) */}
                    {source.type === 'outro' && (
                      <button
                        onClick={() => handleRemoveSalesSource(source.id)}
                        className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Remover Fonte
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Botão Adicionar Fonte Customizada */}
              <button
                onClick={handleAddSalesSource}
                className="w-full border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-blue-500 hover:bg-blue-50 transition-all group"
              >
                <Plus className="w-6 h-6 mx-auto mb-2 text-slate-400 group-hover:text-blue-600" />
                <span className="text-sm font-medium text-slate-600 group-hover:text-blue-600">
                  Adicionar Fonte de Receita Customizada
                </span>
                <p className="text-xs text-slate-500 mt-1">
                  Ex: Food trucks, merchandise, estacionamento, etc.
                </p>
              </button>

              {/* Info sobre integração */}
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex gap-3">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-semibold mb-1">Como funciona a integração?</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>Com <strong>BXD Event</strong>, os dados são sincronizados automaticamente</li>
                      <li>Com <strong>APIs externas</strong>, buscamos os dados de vendas periodicamente</li>
                      <li>Todas as receitas aparecem no Dashboard e no Controle Financeiro</li>
                      <li>Configure apenas as fontes que você realmente utiliza</li>
                    </ul>
                  </div>
                </div>
              </div>
            </>
          )}
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
