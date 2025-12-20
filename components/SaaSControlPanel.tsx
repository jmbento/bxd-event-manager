import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  Users,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Activity,
  Zap,
  CreditCard,
  Server,
  Globe,
  Mail,
  Database,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Bell,
  Settings,
  ExternalLink
} from 'lucide-react';
import { PageBanner } from './PageBanner';

interface APIService {
  id: string;
  name: string;
  provider: string;
  status: 'active' | 'warning' | 'error' | 'paused';
  monthlyLimit: number;
  used: number;
  cost: number;
  lastCheck: string;
  icon: any;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  plan: string;
  mrr: number;
  status: 'active' | 'trial' | 'past_due' | 'cancelled';
  signupDate: string;
  lastActivity: string;
}

interface Alert {
  id: string;
  type: 'payment' | 'api' | 'integration' | 'performance';
  severity: 'high' | 'medium' | 'low';
  title: string;
  message: string;
  timestamp: string;
  resolved: boolean;
}

export const SaaSControlPanel: React.FC = () => {
  const [apiServices, setApiServices] = useState<APIService[]>(() => {
    const saved = localStorage.getItem('saas_api_services');
    return saved ? JSON.parse(saved) : [
      {
        id: '1',
        name: 'Supabase',
        provider: 'Database & Auth',
        status: 'active',
        monthlyLimit: 500000,
        used: 125000,
        cost: 25,
        lastCheck: new Date().toISOString(),
        icon: Database
      },
      {
        id: '2',
        name: 'Vercel',
        provider: 'Hosting',
        status: 'active',
        monthlyLimit: 1000,
        used: 450,
        cost: 20,
        lastCheck: new Date().toISOString(),
        icon: Server
      },
      {
        id: '3',
        name: 'SendGrid',
        provider: 'Email',
        status: 'warning',
        monthlyLimit: 40000,
        used: 38500,
        cost: 15,
        lastCheck: new Date().toISOString(),
        icon: Mail
      }
    ];
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('saas_customers');
    return saved ? JSON.parse(saved) : [];
  });

  const [alerts, setAlerts] = useState<Alert[]>(() => {
    const saved = localStorage.getItem('saas_alerts');
    return saved ? JSON.parse(saved) : [
      {
        id: '1',
        type: 'api',
        severity: 'high',
        title: 'SendGrid próximo do limite',
        message: 'Você usou 96% da cota mensal de emails',
        timestamp: new Date().toISOString(),
        resolved: false
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('saas_api_services', JSON.stringify(apiServices));
  }, [apiServices]);

  useEffect(() => {
    localStorage.setItem('saas_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('saas_alerts', JSON.stringify(alerts));
  }, [alerts]);

  // Calcular métricas
  const totalMRR = customers.reduce((sum, c) => c.status === 'active' ? sum + c.mrr : sum, 0);
  const activeCustomers = customers.filter(c => c.status === 'active').length;
  const trialCustomers = customers.filter(c => c.status === 'trial').length;
  const churnRate = customers.length > 0 ? (customers.filter(c => c.status === 'cancelled').length / customers.length * 100).toFixed(1) : '0';
  const totalAPICosts = apiServices.reduce((sum, s) => sum + s.cost, 0);

  const resolveAlert = (id: string) => {
    setAlerts(alerts.map(a => a.id === id ? { ...a, resolved: true } : a));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-500 bg-green-500/10';
      case 'warning': return 'text-yellow-500 bg-yellow-500/10';
      case 'error': return 'text-red-500 bg-red-500/10';
      case 'paused': return 'text-gray-500 bg-gray-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'border-red-500 bg-red-500/10';
      case 'medium': return 'border-yellow-500 bg-yellow-500/10';
      case 'low': return 'border-blue-500 bg-blue-500/10';
      default: return 'border-gray-500 bg-gray-500/10';
    }
  };

  const refreshServices = async () => {
    // Simular refresh - aqui você faria chamadas reais às APIs
    setApiServices(services => services.map(s => ({
      ...s,
      lastCheck: new Date().toISOString()
    })));
  };

  return (
    <div className="space-y-6">
      <PageBanner 
        title="Painel de Controle SaaS" 
        subtitle="Monitore vendas, APIs e integrações"
        storageKey="saas_control_banner"
        defaultImages={[
          'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=300&fit=crop',
          'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=300&fit=crop',
          'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=1200&h=300&fit=crop'
        ]}
      />

      {/* Alertas Críticos */}
      {alerts.filter(a => !a.resolved).length > 0 && (
        <div className="space-y-2">
          {alerts.filter(a => !a.resolved).map(alert => (
            <div key={alert.id} className={`flex items-start gap-4 p-4 border-l-4 rounded-lg ${getSeverityColor(alert.severity)}`}>
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-white">{alert.title}</h3>
                    <p className="text-sm text-gray-300 mt-1">{alert.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(alert.timestamp).toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <button
                    onClick={() => resolveAlert(alert.id)}
                    className="px-3 py-1 bg-green-500/20 text-green-400 rounded text-sm hover:bg-green-500/30 transition"
                  >
                    Resolver
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8 text-white" />
            <div className="flex items-center gap-1 text-green-200 text-sm">
              <ArrowUpRight className="w-4 h-4" />
              <span>+12%</span>
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            R$ {totalMRR.toLocaleString('pt-BR')}
          </div>
          <div className="text-green-100 text-sm">MRR Total</div>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8 text-white" />
            <div className="flex items-center gap-1 text-blue-200 text-sm">
              <ArrowUpRight className="w-4 h-4" />
              <span>+{trialCustomers}</span>
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{activeCustomers}</div>
          <div className="text-blue-100 text-sm">Clientes Ativos</div>
        </div>

        <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <Server className="w-8 h-8 text-white" />
            <div className="flex items-center gap-1 text-purple-200 text-sm">
              <CheckCircle2 className="w-4 h-4" />
              <span>OK</span>
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{apiServices.length}</div>
          <div className="text-purple-100 text-sm">APIs Integradas</div>
        </div>

        <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-white" />
            <div className="flex items-center gap-1 text-red-200 text-sm">
              <ArrowDownRight className="w-4 h-4" />
              <span>{churnRate}%</span>
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            R$ {totalAPICosts}
          </div>
          <div className="text-red-100 text-sm">Custos APIs/mês</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Serviços de API */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white">Serviços de API</h2>
              <p className="text-gray-400 text-sm">Monitoramento de uso e custos</p>
            </div>
            <button
              onClick={refreshServices}
              className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
            >
              <RefreshCw className="w-5 h-5 text-white" />
            </button>
          </div>

          <div className="space-y-4">
            {apiServices.map(service => {
              const ServiceIcon = service.icon;
              const usagePercent = (service.used / service.monthlyLimit) * 100;
              
              return (
                <div key={service.id} className="bg-slate-900 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                        <ServiceIcon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{service.name}</h3>
                        <p className="text-sm text-gray-400">{service.provider}</p>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(service.status)}`}>
                      {service.status}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Uso mensal</span>
                      <span className="text-white font-medium">
                        {service.used.toLocaleString()} / {service.monthlyLimit.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          usagePercent > 90 ? 'bg-red-500' :
                          usagePercent > 75 ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(usagePercent, 100)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Custo mensal</span>
                      <span className="text-white font-medium">R$ {service.cost}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Última verificação: {new Date(service.lastCheck).toLocaleTimeString('pt-BR')}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <button className="w-full mt-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition flex items-center justify-center gap-2">
            <Settings className="w-4 h-4" />
            Gerenciar Integrações
          </button>
        </div>

        {/* Clientes Recentes */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white">Clientes</h2>
              <p className="text-gray-400 text-sm">Últimas assinaturas e status</p>
            </div>
            <button className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition text-white text-sm font-medium">
              + Novo Cliente
            </button>
          </div>

          {customers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">Nenhum cliente cadastrado ainda</p>
              <p className="text-sm text-gray-500 mt-1">
                Os clientes aparecerão aqui automaticamente ao se cadastrarem
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {customers.slice(0, 5).map(customer => (
                <div key={customer.id} className="bg-slate-900 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-white">{customer.name}</h3>
                      <p className="text-sm text-gray-400">{customer.email}</p>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                      customer.status === 'active' ? 'text-green-500 bg-green-500/10' :
                      customer.status === 'trial' ? 'text-blue-500 bg-blue-500/10' :
                      customer.status === 'past_due' ? 'text-yellow-500 bg-yellow-500/10' :
                      'text-red-500 bg-red-500/10'
                    }`}>
                      {customer.status}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">{customer.plan}</span>
                    <span className="text-white font-medium">R$ {customer.mrr}/mês</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Gráfico de Receita */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">Crescimento de Receita</h2>
            <p className="text-gray-400 text-sm">MRR dos últimos 6 meses</p>
          </div>
          <BarChart3 className="w-6 h-6 text-gray-400" />
        </div>
        
        <div className="h-64 flex items-end justify-between gap-4">
          {[
            { month: 'Jul', value: 1200 },
            { month: 'Ago', value: 2400 },
            { month: 'Set', value: 3600 },
            { month: 'Out', value: 4200 },
            { month: 'Nov', value: 5800 },
            { month: 'Dez', value: totalMRR || 7200 }
          ].map(data => {
            const maxValue = 8000;
            const heightPercent = (data.value / maxValue) * 100;
            
            return (
              <div key={data.month} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex items-end justify-center" style={{ height: '200px' }}>
                  <div 
                    className="w-full bg-gradient-to-t from-blue-600 to-purple-600 rounded-t-lg transition-all hover:opacity-80 cursor-pointer"
                    style={{ height: `${heightPercent}%` }}
                    title={`R$ ${data.value.toLocaleString('pt-BR')}`}
                  />
                </div>
                <span className="text-sm text-gray-400">{data.month}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SaaSControlPanel;
