import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Zap,
  FileText,
  UserPlus,
  Ticket
} from 'lucide-react';
import { PageBanner } from './PageBanner';

interface DashboardViewProps {
  profile: {
    eventName: string;
    eventDate: string;
    edition: string;
  };
  organization?: {
    subscription_plan: string;
    subscription_status: string;
    trial_ends_at?: string;
  } | null;
  daysLeft: number;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  profile,
  organization,
  daysLeft,
}) => {
  // Dados reais devem ser buscados do banco ou API
  const metrics = {
    orcamentoTotal: 0,
    orcamentoGasto: 0,
    orcamentoRestante: 0,
    ticketsVendidos: 0,
    metaTickets: 0,
    fornecedoresConfirmados: 0,
    fornecedoresTotal: 0,
    tarefasConcluidas: 0,
    tarefasTotal: 0,
    equipeAtiva: 0,
    leads: 0,
  };

  const percentOrcamento = metrics.orcamentoTotal > 0 ? Math.round((metrics.orcamentoGasto / metrics.orcamentoTotal) * 100) : 0;
  const percentTickets = metrics.metaTickets > 0 ? Math.round((metrics.ticketsVendidos / metrics.metaTickets) * 100) : 0;
  const percentTarefas = metrics.tarefasTotal > 0 ? Math.round((metrics.tarefasConcluidas / metrics.tarefasTotal) * 100) : 0;
  const percentFornecedores = metrics.fornecedoresTotal > 0 ? Math.round((metrics.fornecedoresConfirmados / metrics.fornecedoresTotal) * 100) : 0;

  // Timeline de atividades recentes - VAZIO - Será populado com dados reais do sistema
  const recentActivities: { id: number; type: string; text: string; time: string; icon: any; color: string }[] = [];

  // Próximos marcos - VAZIO - Usuário adiciona seus próprios marcos
  const milestones: { id: number; name: string; date: string; status: string }[] = [];

  // Dados para o gráfico de barras (vendas por semana) - VAZIO
  const weeklyData: { week: string; value: number }[] = [];
  const maxWeekly = weeklyData.length > 0 ? Math.max(...weeklyData.map(d => d.value)) : 0;

  // Distribuição do orçamento por categoria - VAZIO - Vinculado ao Controle Financeiro
  const budgetDistribution: { category: string; percent: number; color: string }[] = [];

  return (
    <div className="space-y-6">
      <PageBanner 
        title="Dashboard" 
        subtitle="Visão geral do evento"
        storageKey="dashboard_banner_images"
        defaultImages={[
          'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&h=300&fit=crop',
          'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&h=300&fit=crop',
          'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=1200&h=300&fit=crop',
          'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=1200&h=300&fit=crop'
        ]}
      />
      {/* Card de Boas-Vindas com Info de Trial/Plano */}
      {organization && (
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-2xl p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                {organization.subscription_status === 'trial' ? '🎉 Bem-vindo ao Trial!' : `✨ Plano ${organization.subscription_plan.toUpperCase()}`}
              </h2>
              <p className="text-slate-600 mb-4">
                {organization.subscription_status === 'trial' 
                  ? 'Explore todos os módulos disponíveis no seu período de teste.' 
                  : 'Aproveite todos os recursos do seu plano.'}
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm border border-blue-200">
                  <Zap className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-semibold text-slate-900">
                    Plano: <span className="text-blue-600 uppercase">{organization.subscription_plan}</span>
                  </span>
                </div>
                {organization.subscription_status === 'trial' && organization.trial_ends_at && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-amber-100 rounded-lg border border-amber-300">
                    <Clock className="w-5 h-5 text-amber-700" />
                    <span className="text-sm font-semibold text-amber-900">
                      {Math.ceil((new Date(organization.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} dias restantes
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
            {/* Header com countdown */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{profile.eventName}</h1>
            <p className="text-blue-100 text-lg">
              {profile.edition}
            </p>
            {/* Contador Regressivo no lugar da data */}
            <div className="mt-4 inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/20">
              <div className="text-center">
                <div className="text-4xl font-black bg-gradient-to-br from-white to-blue-100 bg-clip-text text-transparent">
                  {daysLeft}
                </div>
              </div>
              <div className="text-left">
                <div className="text-sm font-semibold text-blue-100 uppercase tracking-wider">Dias</div>
                <div className="text-xs text-blue-200">para o evento</div>
              </div>
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{percentTarefas}%</div>
            <div className="text-sm text-blue-100 mt-1">concluído</div>
          </div>
        </div>
      </div>

      {/* KPIs principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Orçamento */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <span className="flex items-center text-sm text-green-600 font-medium">
              <ArrowDownRight className="w-4 h-4 mr-1" />
              45%
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            R$ {(metrics.orcamentoGasto / 1000).toFixed(0)}k
          </div>
          <div className="text-sm text-slate-500 mt-1">
            de R$ {(metrics.orcamentoTotal / 1000).toFixed(0)}k orçamento
          </div>
          <div className="mt-3 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
              style={{ width: `${percentOrcamento}%` }}
            />
          </div>
        </div>

        {/* Vendas */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Ticket className="w-5 h-5 text-blue-600" />
            </div>
            <span className="flex items-center text-sm text-blue-600 font-medium">
              <ArrowUpRight className="w-4 h-4 mr-1" />
              +12%
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {metrics.ticketsVendidos.toLocaleString()}
          </div>
          <div className="text-sm text-slate-500 mt-1">
            de {metrics.metaTickets.toLocaleString()} meta
          </div>
          <div className="mt-3 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
              style={{ width: `${percentTickets}%` }}
            />
          </div>
        </div>

        {/* Tarefas */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-purple-600" />
            </div>
            <span className="flex items-center text-sm text-purple-600 font-medium">
              <Activity className="w-4 h-4 mr-1" />
              {percentTarefas}%
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {metrics.tarefasConcluidas}/{metrics.tarefasTotal}
          </div>
          <div className="text-sm text-slate-500 mt-1">
            tarefas concluídas
          </div>
          <div className="mt-3 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
              style={{ width: `${percentTarefas}%` }}
            />
          </div>
        </div>

        {/* Equipe */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Users className="w-5 h-5 text-amber-600" />
            </div>
            <span className="flex items-center text-sm text-amber-600 font-medium">
              <Zap className="w-4 h-4 mr-1" />
              Ativo
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {metrics.equipeAtiva}
          </div>
          <div className="text-sm text-slate-500 mt-1">
            membros da equipe
          </div>
          <div className="mt-3 flex -space-x-2">
            {[...Array(5)].map((_, i) => (
              <div 
                key={i}
                className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 border-2 border-white flex items-center justify-center text-white text-xs font-bold"
              >
                {String.fromCharCode(65 + i)}
              </div>
            ))}
            <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-slate-600 text-xs font-bold">
              +{metrics.equipeAtiva - 5}
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos e Listas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico de Vendas por Semana */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Vendas de Ingressos</h3>
              <p className="text-sm text-slate-500">Últimas 6 semanas</p>
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-slate-400" />
            </div>
          </div>
          
          {weeklyData.length > 0 ? (
            <div className="flex items-end justify-between gap-2 h-48">
              {weeklyData.map((data, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex justify-center">
                    <span className="text-xs font-medium text-slate-600">{data.value}</span>
                  </div>
                  <div 
                    className={`w-full rounded-t-lg transition-all ${
                      index === weeklyData.length - 1 
                        ? 'bg-gradient-to-t from-blue-600 to-blue-400' 
                        : 'bg-slate-200 hover:bg-slate-300'
                    }`}
                    style={{ height: `${(data.value / maxWeekly) * 140}px` }}
                  />
                  <span className="text-xs text-slate-500">{data.week}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-400">
              <div className="text-center">
                <Ticket className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Nenhuma venda registrada</p>
                <p className="text-xs mt-1">Configure sistema de ingressos para ver dados</p>
              </div>
            </div>
          )}
        </div>

        {/* Distribuição do Orçamento */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Orçamento</h3>
              <p className="text-sm text-slate-500">Por categoria</p>
            </div>
            <PieChart className="w-5 h-5 text-slate-400" />
          </div>

          {budgetDistribution.length > 0 ? (
            <div className="space-y-4">
              {budgetDistribution.map((item, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-slate-600">{item.category}</span>
                    <span className="font-medium text-slate-900">{item.percent}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${item.color} rounded-full`}
                      style={{ width: `${item.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-400">
              <div className="text-center">
                <PieChart className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Sem dados de orçamento</p>
                <p className="text-xs mt-1">Use Controle Financeiro</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Atividades e Marcos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Atividades Recentes */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900">Atividades Recentes</h3>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              Ver todas
            </button>
          </div>
          
          {recentActivities.length > 0 ? (
            <div className="space-y-4">
              {recentActivities.map((activity) => {
                const Icon = activity.icon;
                return (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg bg-slate-50 ${activity.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-700">{activity.text}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{activity.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-400">
              <div className="text-center">
                <Activity className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Nenhuma atividade recente</p>
                <p className="text-xs mt-1">Ações do sistema aparecerão aqui</p>
              </div>
            </div>
          )}
        </div>

        {/* Próximos Marcos */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900">Próximos Marcos</h3>
            <Target className="w-5 h-5 text-slate-400" />
          </div>
          
          {milestones.length > 0 ? (
            <div className="space-y-3">
              {milestones.map((milestone, index) => (
                <div 
                  key={milestone.id} 
                  className="flex items-center gap-4 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white border-2 border-slate-200 text-slate-400 font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{milestone.name}</p>
                    <p className="text-sm text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {milestone.date}
                    </p>
                  </div>
                  <div className="px-2 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
                    Pendente
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-400">
              <div className="text-center">
                <Target className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Nenhum marco definido</p>
                <p className="text-xs mt-1">Use Planejamento para criar</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats Footer */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
          <div className="flex items-center gap-2 text-blue-600 mb-1">
            <Users className="w-4 h-4" />
            <span className="text-xs font-medium">Leads Captados</span>
          </div>
          <div className="text-xl font-bold text-slate-900">{metrics.leads.toLocaleString()}</div>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
          <div className="flex items-center gap-2 text-green-600 mb-1">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-xs font-medium">Fornecedores</span>
          </div>
          <div className="text-xl font-bold text-slate-900">{metrics.fornecedoresConfirmados}/{metrics.fornecedoresTotal}</div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
          <div className="flex items-center gap-2 text-purple-600 mb-1">
            <FileText className="w-4 h-4" />
            <span className="text-xs font-medium">Contratos</span>
          </div>
          <div className="text-xl font-bold text-slate-400">0/0</div>
          <p className="text-xs text-slate-400 mt-1">Em breve</p>
        </div>
        
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-100">
          <div className="flex items-center gap-2 text-amber-600 mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-xs font-medium">Horas Planejadas</span>
          </div>
          <div className="text-xl font-bold text-slate-400">0h</div>
          <p className="text-xs text-slate-400 mt-1">Em breve</p>
        </div>
      </div>
    </div>
  );
};
