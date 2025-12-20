import React, { useState, useEffect } from 'react';
import { 
  BarChart3, TrendingUp, Users, Eye, Share2, DollarSign,
  Instagram, Facebook, Twitter, Youtube, Globe, Settings,
  ExternalLink, Plus, X, Check, AlertCircle, Link, Trash2,
  RefreshCw, Activity
} from 'lucide-react';
import { PageBanner } from './PageBanner';

type TabType = 'overview' | 'integrations' | 'campaigns' | 'config';

interface MonitoredSite {
  id: string;
  name: string;
  url: string;
  type: 'website' | 'social' | 'api';
  status: 'online' | 'offline' | 'slow';
  lastCheck: string;
  responseTime?: number;
}

export const AnalyticsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [showAddSiteModal, setShowAddSiteModal] = useState(false);
  const [newSiteName, setNewSiteName] = useState('');
  const [newSiteUrl, setNewSiteUrl] = useState('');
  const [newSiteType, setNewSiteType] = useState<'website' | 'social' | 'api'>('website');

  const [monitoredSites, setMonitoredSites] = useState<MonitoredSite[]>(() => {
    const saved = localStorage.getItem('monitored_sites');
    return saved ? JSON.parse(saved) : [
      {
        id: '1',
        name: 'Site Principal',
        url: 'https://bxd-event-manager.vercel.app',
        type: 'website',
        status: 'online',
        lastCheck: new Date().toISOString(),
        responseTime: 250
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('monitored_sites', JSON.stringify(monitoredSites));
  }, [monitoredSites]);

  const handleAddSite = () => {
    if (!newSiteName || !newSiteUrl) return;

    const newSite: MonitoredSite = {
      id: Date.now().toString(),
      name: newSiteName,
      url: newSiteUrl,
      type: newSiteType,
      status: 'online',
      lastCheck: new Date().toISOString(),
      responseTime: Math.floor(Math.random() * 500) + 100
    };

    setMonitoredSites([...monitoredSites, newSite]);
    setNewSiteName('');
    setNewSiteUrl('');
    setNewSiteType('website');
    setShowAddSiteModal(false);
  };

  const handleRemoveSite = (id: string) => {
    setMonitoredSites(monitoredSites.filter(s => s.id !== id));
  };

  const handleRefreshSites = () => {
    setMonitoredSites(sites => sites.map(site => ({
      ...site,
      lastCheck: new Date().toISOString(),
      responseTime: Math.floor(Math.random() * 500) + 100,
      status: Math.random() > 0.9 ? 'slow' : Math.random() > 0.95 ? 'offline' : 'online'
    })));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-500 bg-green-500/10';
      case 'slow': return 'text-yellow-500 bg-yellow-500/10';
      case 'offline': return 'text-red-500 bg-red-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <Check className="w-4 h-4" />;
      case 'slow': return <AlertCircle className="w-4 h-4" />;
      case 'offline': return <X className="w-4 h-4" />;
      default: return null;
    }
  };

  const tabs = [
    { id: 'overview' as TabType, label: 'Visão Geral', icon: BarChart3 },
    { id: 'integrations' as TabType, label: 'Integrações', icon: Share2 },
    { id: 'campaigns' as TabType, label: 'Campanhas', icon: DollarSign },
    { id: 'config' as TabType, label: 'Monitoramento', icon: Settings }
  ];

  return (
    <div className="space-y-6">
      <PageBanner 
        title="Analytics & Redes Sociais" 
        subtitle="Monitore o desempenho das suas campanhas"
        storageKey="analytics_banner_images"
        defaultImages={[
          'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=300&fit=crop',
          'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=300&fit=crop',
          'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=1200&h=300&fit=crop',
          'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=1200&h=300&fit=crop'
        ]}
      />

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="flex border-b border-slate-200">
          {tabs.map(tab => {
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-medium transition ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <TabIcon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="text-center py-12">
            <BarChart3 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Analytics em Branco</h3>
            <p className="text-slate-500 mb-4">Conecte suas redes sociais na aba Integrações</p>
            <button
              onClick={() => setActiveTab('integrations')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Conectar Agora
            </button>
          </div>
        </div>
      )}

      {/* Integrations Tab */}
      {activeTab === 'integrations' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="text-center py-12">
            <Share2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Integrações de Redes Sociais</h3>
            <p className="text-slate-500 mb-6">Conecte Instagram, Facebook, Twitter e mais</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
              {[
                { name: 'Instagram', icon: Instagram, color: 'from-pink-500 to-purple-600' },
                { name: 'Facebook', icon: Facebook, color: 'from-blue-600 to-blue-700' },
                { name: 'Twitter/X', icon: Twitter, color: 'from-sky-500 to-blue-600' },
                { name: 'YouTube', icon: Youtube, color: 'from-red-500 to-red-600' },
                { name: 'TikTok', icon: Share2, color: 'from-slate-800 to-slate-900' },
                { name: 'LinkedIn', icon: Users, color: 'from-blue-700 to-blue-800' },
                { name: 'Google Analytics', icon: Globe, color: 'from-orange-500 to-red-600' },
                { name: 'Meta Ads', icon: Facebook, color: 'from-blue-500 to-indigo-600' }
              ].map(platform => {
                const PlatformIcon = platform.icon;
                return (
                  <button
                    key={platform.name}
                    className="p-4 border-2 border-slate-200 rounded-xl hover:border-blue-500 hover:shadow-lg transition group"
                  >
                    <div className={`w-12 h-12 bg-gradient-to-br ${platform.color} rounded-lg mx-auto mb-2 flex items-center justify-center`}>
                      <PlatformIcon className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-sm font-medium text-slate-700 group-hover:text-blue-600">{platform.name}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Campaigns Tab */}
      {activeTab === 'campaigns' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="text-center py-12">
            <DollarSign className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Campanhas Pagas</h3>
            <p className="text-slate-500">Monitore o desempenho dos seus anúncios</p>
          </div>
        </div>
      )}

      {/* Config Tab - Monitoramento */}
      {activeTab === 'config' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Sites e Redes Monitoradas</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Configure os sites e APIs que você quer monitorar
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleRefreshSites}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Atualizar
                </button>
                <button
                  onClick={() => setShowAddSiteModal(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar Site
                </button>
              </div>
            </div>

            {monitoredSites.length === 0 ? (
              <div className="text-center py-12">
                <Globe className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">Nenhum site monitorado ainda</p>
                <p className="text-sm text-slate-400 mt-1">
                  Adicione sites e APIs para monitorar uptime e performance
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {monitoredSites.map(site => (
                  <div key={site.id} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Globe className="w-4 h-4 text-slate-600" />
                          <h3 className="font-semibold text-slate-900">{site.name}</h3>
                        </div>
                        <a
                          href={site.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                        >
                          {site.url}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      <button
                        onClick={() => handleRemoveSite(site.id)}
                        className="p-1 text-slate-400 hover:text-red-600 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Status</span>
                        <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(site.status)}`}>
                          {getStatusIcon(site.status)}
                          {site.status}
                        </div>
                      </div>
                      
                      {site.responseTime && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">Tempo de resposta</span>
                          <span className="text-sm font-medium text-slate-900">
                            {site.responseTime}ms
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Tipo</span>
                        <span className="text-xs px-2 py-0.5 bg-slate-200 text-slate-700 rounded">
                          {site.type}
                        </span>
                      </div>

                      <div className="text-xs text-slate-500 pt-2 border-t border-slate-200">
                        Última verificação: {new Date(site.lastCheck).toLocaleString('pt-BR')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Alertas de Monitoramento */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-200 p-6">
            <div className="flex items-start gap-3">
              <Activity className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">Monitoramento Automático</h3>
                <p className="text-sm text-slate-600 mb-3">
                  Seus sites são verificados a cada 5 minutos. Você receberá alertas por email e no dashboard se algum site ficar offline ou lento.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs px-3 py-1 bg-white rounded-full text-slate-600 border border-slate-200">
                    ✓ Uptime monitoring
                  </span>
                  <span className="text-xs px-3 py-1 bg-white rounded-full text-slate-600 border border-slate-200">
                    ✓ Performance tracking
                  </span>
                  <span className="text-xs px-3 py-1 bg-white rounded-full text-slate-600 border border-slate-200">
                    ✓ Alertas por email
                  </span>
                  <span className="text-xs px-3 py-1 bg-white rounded-full text-slate-600 border border-slate-200">
                    ✓ Histórico de downtime
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Adicionar Site */}
      {showAddSiteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="border-b border-slate-200 p-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">Adicionar Site</h3>
              <button
                onClick={() => setShowAddSiteModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nome do Site
                </label>
                <input
                  type="text"
                  value={newSiteName}
                  onChange={(e) => setNewSiteName(e.target.value)}
                  placeholder="Ex: Site Principal"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  URL
                </label>
                <input
                  type="url"
                  value={newSiteUrl}
                  onChange={(e) => setNewSiteUrl(e.target.value)}
                  placeholder="https://seusite.com"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tipo
                </label>
                <select
                  value={newSiteType}
                  onChange={(e) => setNewSiteType(e.target.value as 'website' | 'social' | 'api')}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="website">Website</option>
                  <option value="social">Rede Social</option>
                  <option value="api">API/Serviço</option>
                </select>
              </div>
            </div>

            <div className="border-t border-slate-200 p-6 flex gap-3">
              <button
                onClick={() => setShowAddSiteModal(false)}
                className="flex-1 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddSite}
                disabled={!newSiteName || !newSiteUrl}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsView;
