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

  // Timeline de atividades recentes
  const recentActivities = [
    { id: 1, type: 'payment', text: 'Pagamento confirmado - Som e Iluminação', time: '2h atrás', icon: DollarSign, color: 'text-green-500' },
    { id: 2, type: 'ticket', text: '127 novos ingressos vendidos', time: '4h atrás', icon: Ticket, color: 'text-blue-500' },
    { id: 3, type: 'task', text: 'Contrato de segurança assinado', time: '5h atrás', icon: CheckCircle2, color: 'text-purple-500' },
    { id: 4, type: 'team', text: 'Maria Silva adicionada à equipe', time: '1 dia', icon: UserPlus, color: 'text-amber-500' },
    { id: 5, type: 'alert', text: 'Prazo de licença expira em 5 dias', time: '1 dia', icon: AlertTriangle, color: 'text-red-500' },
  ];

  // Próximos marcos
  const milestones = [
    { id: 1, name: 'Fechamento de patrocínios', date: '20 Dez', status: 'pending' },
    { id: 2, name: 'Confirmação de line-up', date: '28 Dez', status: 'pending' },
    { id: 3, name: 'Início da montagem', date: '10 Jan', status: 'pending' },
    { id: 4, name: 'Credenciamento da equipe', date: '12 Jan', status: 'pending' },
  ];

  // Dados para o gráfico de barras (vendas por semana)
  const weeklyData = [
    { week: 'Sem 1', value: 320 },
    { week: 'Sem 2', value: 450 },
    { week: 'Sem 3', value: 380 },
    { week: 'Sem 4', value: 520 },
    { week: 'Sem 5', value: 610 },
    { week: 'Atual', value: 567 },
  ];
  const maxWeekly = Math.max(...weeklyData.map(d => d.value));

  // Distribuição do orçamento por categoria
  const budgetDistribution = [
    { category: 'Infraestrutura', percent: 35, color: 'bg-blue-500' },
    { category: 'Atrações', percent: 25, color: 'bg-purple-500' },
    { category: 'Marketing', percent: 20, color: 'bg-green-500' },
    { category: 'Operação', percent: 12, color: 'bg-amber-500' },
    { category: 'Outros', percent: 8, color: 'bg-slate-400' },
  ];

  return (
    <div className="space-y-6">
      {/* Header com countdown */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{profile.eventName}</h1>
            <p className="text-blue-100 mt-1">
              {profile.edition} • {new Date(profile.eventDate).toLocaleDateString('pt-BR', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              })}
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold">{daysLeft}</div>
              <div className="text-sm text-blue-100">dias restantes</div>
            </div>
            <div className="hidden md:block h-12 w-px bg-white/20" />
            <div className="text-center hidden md:block">
              <div className="text-2xl font-bold">{percentTarefas}%</div>
              <div className="text-sm text-blue-100">concluído</div>
            </div>
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
        </div>

        {/* Próximos Marcos */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900">Próximos Marcos</h3>
            <Target className="w-5 h-5 text-slate-400" />
          </div>
          
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
          <div className="text-xl font-bold text-slate-900">8/12</div>
        </div>
        
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-100">
          <div className="flex items-center gap-2 text-amber-600 mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-xs font-medium">Horas Planejadas</span>
          </div>
          <div className="text-xl font-bold text-slate-900">248h</div>
        </div>
      </div>
    </div>
  );
};
