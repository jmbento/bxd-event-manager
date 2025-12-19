import React, { useState, useEffect } from 'react';
import { 
  BarChart3, TrendingUp, Users, Eye, Share2, DollarSign,
  Instagram, Facebook, Twitter, Youtube, Globe, Settings,
  ExternalLink, Plus, X, Check, AlertCircle
} from 'lucide-react';
import { PageBanner } from './PageBanner';

interface SocialMetric {
  platform: 'instagram' | 'facebook' | 'twitter' | 'youtube' | 'tiktok' | 'linkedin' | 'website';
  followers: number;
  engagement: number;
  reach: number;
  impressions: number;
  clicks: number;
  conversions: number;
}

interface PaidCampaign {
  id: string;
  platform: string;
  name: string;
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  conversions: number;
  cpm: number;
  cpc: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'paused' | 'completed';
}

interface Integration {
  platform: string;
  icon: any;
  connected: boolean;
  apiKey?: string;
  accessToken?: string;
  lastSync?: string;
}

const platformIcons = {
  instagram: Instagram,
  facebook: Facebook,
  twitter: Twitter,
  youtube: Youtube,
  tiktok: Share2,
  linkedin: Users,
  website: Globe
};

export const AnalyticsView: React.FC = () => {
  const [showIntegrationModal, setShowIntegrationModal] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null);
  
  const [integrations, setIntegrations] = useState<Integration[]>(() => {
    const saved = localStorage.getItem('marketing_integrations');
    return saved ? JSON.parse(saved) : [
      { platform: 'Instagram', icon: Instagram, connected: false },
      { platform: 'Facebook', icon: Facebook, connected: false },
      { platform: 'Twitter/X', icon: Twitter, connected: false },
      { platform: 'YouTube', icon: Youtube, connected: false },
      { platform: 'TikTok', icon: Share2, connected: false },
      { platform: 'LinkedIn', icon: Users, connected: false },
      { platform: 'Google Analytics', icon: Globe, connected: false },
      { platform: 'Meta Ads', icon: Facebook, connected: false },
      { platform: 'Google Ads', icon: Globe, connected: false }
    ];
  });

  const [metrics, setMetrics] = useState<SocialMetric[]>(() => {
    const saved = localStorage.getItem('marketing_metrics');
    return saved ? JSON.parse(saved) : [];
  });

  const [campaigns, setCampaigns] = useState<PaidCampaign[]>(() => {
    const saved = localStorage.getItem('marketing_campaigns');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('marketing_integrations', JSON.stringify(integrations));
  }, [integrations]);

  useEffect(() => {
    localStorage.setItem('marketing_metrics', JSON.stringify(metrics));
  }, [metrics]);

  useEffect(() => {
    localStorage.setItem('marketing_campaigns', JSON.stringify(campaigns));
  }, [campaigns]);

  const handleConnectIntegration = (platform: string) => {
    setSelectedIntegration(platform);
    setShowIntegrationModal(true);
  };

  const handleSaveIntegration = (apiKey: string, accessToken: string) => {
    setIntegrations(prev => prev.map(int => 
      int.platform === selectedIntegration
        ? { ...int, connected: true, apiKey, accessToken, lastSync: new Date().toISOString() }
        : int
    ));
    setShowIntegrationModal(false);
    setSelectedIntegration(null);
  };

  const totalReach = metrics.reduce((sum, m) => sum + m.reach, 0);
  const totalEngagement = metrics.reduce((sum, m) => sum + m.engagement, 0);
  const totalClicks = metrics.reduce((sum, m) => sum + m.clicks, 0);
  const totalSpent = campaigns.reduce((sum, c) => sum + c.spent, 0);
  const totalBudget = campaigns.reduce((sum, c) => sum + c.budget, 0);
  
  const connectedIntegrations = integrations.filter(i => i.connected).length;
  const activeCampaigns = campaigns.filter(c => c.status === 'active').length;

  return (
    <div className="space-y-6">
      <PageBanner pageKey="analytics" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-blue-600" />
            Analytics & Métricas
          </h1>
          <p className="text-slate-500 mt-1">
            Monitore resultados do time de marketing
          </p>
        </div>
      </div>

      {/* Alert se não tem integrações */}
      {connectedIntegrations === 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-orange-900">Configure suas integrações</h3>
            <p className="text-sm text-orange-700 mt-1">
              Conecte suas redes sociais e ferramentas de análise para visualizar métricas em tempo real.
            </p>
          </div>
        </div>
      )}

      {/* Stats Resumo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Share2 className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-600">Integrações</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{connectedIntegrations}/{integrations.length}</p>
        </div>
        
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="w-4 h-4 text-blue-500" />
            <span className="text-sm text-slate-600">Alcance Total</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">{totalReach.toLocaleString('pt-BR')}</p>
        </div>
        
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-sm text-slate-600">Engajamento</span>
          </div>
          <p className="text-2xl font-bold text-green-600">{totalEngagement.toLocaleString('pt-BR')}</p>
        </div>
        
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-purple-500" />
            <span className="text-sm text-slate-600">Investido</span>
          </div>
          <p className="text-2xl font-bold text-purple-600">
            R$ {totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Integrações */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-600" />
            Integrações Disponíveis
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {integrations.map((integration) => {
            const Icon = integration.icon;
            return (
              <div 
                key={integration.platform}
                className={`border-2 rounded-xl p-4 transition ${
                  integration.connected 
                    ? 'border-green-300 bg-green-50' 
                    : 'border-slate-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      integration.connected ? 'bg-green-100' : 'bg-slate-100'
                    }`}>
                      <Icon className={`w-5 h-5 ${
                        integration.connected ? 'text-green-600' : 'text-slate-600'
                      }`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{integration.platform}</h3>
                      {integration.connected && integration.lastSync && (
                        <p className="text-xs text-slate-500">
                          Última sinc: {new Date(integration.lastSync).toLocaleDateString('pt-BR')}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {integration.connected ? (
                    <Check className="w-5 h-5 text-green-600" />
                  ) : null}
                </div>

                <button
                  onClick={() => handleConnectIntegration(integration.platform)}
                  className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition ${
                    integration.connected
                      ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {integration.connected ? 'Reconfigurar' : 'Conectar'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Campanhas Pagas */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-purple-600" />
              Tráfego Pago & Impulsionamentos
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Investimentos registrados automaticamente em Despesas
            </p>
          </div>
          <span className="text-sm text-slate-600">
            {activeCampaigns} campanhas ativas
          </span>
        </div>

        {campaigns.length === 0 ? (
          <div className="text-center py-12">
            <DollarSign className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="text-slate-500 mb-1">Nenhuma campanha registrada</p>
            <p className="text-sm text-slate-400">
              Campanhas pagas serão sincronizadas automaticamente das integrações
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-slate-900">{campaign.name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        campaign.status === 'active' 
                          ? 'bg-green-100 text-green-700'
                          : campaign.status === 'paused'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {campaign.status === 'active' ? 'Ativa' : campaign.status === 'paused' ? 'Pausada' : 'Concluída'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">{campaign.platform}</p>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-lg font-bold text-purple-600">
                      R$ {campaign.spent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-slate-500">
                      de R$ {campaign.budget.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-3 text-center">
                  <div className="bg-blue-50 rounded-lg p-2">
                    <p className="text-xs text-slate-600 mb-1">Impressões</p>
                    <p className="text-sm font-bold text-blue-700">{campaign.impressions.toLocaleString('pt-BR')}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-2">
                    <p className="text-xs text-slate-600 mb-1">Cliques</p>
                    <p className="text-sm font-bold text-green-700">{campaign.clicks.toLocaleString('pt-BR')}</p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-2">
                    <p className="text-xs text-slate-600 mb-1">CPM</p>
                    <p className="text-sm font-bold text-orange-700">R$ {campaign.cpm.toFixed(2)}</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-2">
                    <p className="text-xs text-slate-600 mb-1">CPC</p>
                    <p className="text-sm font-bold text-purple-700">R$ {campaign.cpc.toFixed(2)}</p>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
                  <span>Início: {new Date(campaign.startDate).toLocaleDateString('pt-BR')}</span>
                  <span>•</span>
                  <span>Fim: {new Date(campaign.endDate).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Métricas por Rede */}
      {metrics.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Share2 className="w-5 h-5 text-blue-600" />
            Métricas por Rede Social
          </h2>

          <div className="space-y-4">
            {metrics.map((metric, index) => {
              const Icon = platformIcons[metric.platform] || Share2;
              return (
                <div key={index} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <Icon className="w-6 h-6 text-blue-600" />
                    <h3 className="font-semibold text-slate-900 capitalize">{metric.platform}</h3>
                  </div>
                  
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                    <div>
                      <p className="text-xs text-slate-600 mb-1">Seguidores</p>
                      <p className="text-lg font-bold text-slate-900">{metric.followers.toLocaleString('pt-BR')}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 mb-1">Engajamento</p>
                      <p className="text-lg font-bold text-green-600">{metric.engagement.toLocaleString('pt-BR')}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 mb-1">Alcance</p>
                      <p className="text-lg font-bold text-blue-600">{metric.reach.toLocaleString('pt-BR')}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 mb-1">Impressões</p>
                      <p className="text-lg font-bold text-purple-600">{metric.impressions.toLocaleString('pt-BR')}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 mb-1">Cliques</p>
                      <p className="text-lg font-bold text-orange-600">{metric.clicks.toLocaleString('pt-BR')}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 mb-1">Conversões</p>
                      <p className="text-lg font-bold text-red-600">{metric.conversions.toLocaleString('pt-BR')}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal de Integração */}
      {showIntegrationModal && selectedIntegration && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="border-b border-slate-200 p-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">
                Conectar {selectedIntegration}
              </h3>
              <button
                onClick={() => {
                  setShowIntegrationModal(false);
                  setSelectedIntegration(null);
                }}
                className="text-slate-400 hover:text-slate-600"
                title="Fechar"
                aria-label="Fechar modal"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  API Key / Token de Acesso
                </label>
                <input
                  type="text"
                  placeholder="Cole seu token de acesso aqui"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Secret Key (opcional)
                </label>
                <input
                  type="password"
                  placeholder="Secret key se necessário"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>Como obter o token:</strong>
                </p>
                <ol className="text-xs text-blue-700 mt-2 space-y-1 ml-4 list-decimal">
                  <li>Acesse as configurações da plataforma</li>
                  <li>Procure por "API", "Desenvolvedor" ou "Integrações"</li>
                  <li>Gere um novo token com permissões de leitura</li>
                  <li>Cole o token no campo acima</li>
                </ol>
              </div>
            </div>

            <div className="border-t border-slate-200 p-6 flex gap-3">
              <button
                onClick={() => {
                  setShowIntegrationModal(false);
                  setSelectedIntegration(null);
                }}
                className="flex-1 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-300"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleSaveIntegration('demo-api-key', 'demo-token')}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
              >
                Conectar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
