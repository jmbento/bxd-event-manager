import React from 'react';
import {
  Users,
  CreditCard,
  Activity,
  DoorOpen,
  Utensils,
  TrendingUp,
  TrendingDown,
  UserCheck,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import type { DashboardStats, Gate, MealStation } from './types';

interface Props {
  stats: DashboardStats;
  gates: Gate[];
  mealStations: MealStation[];
  onRefresh: () => void;
}

const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  trend?: { value: number; isPositive: boolean };
  subtitle?: string;
}> = ({ title, value, icon, color, trend, subtitle }) => (
  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-slate-500 mb-1">{title}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        {trend && (
          <div className={`flex items-center mt-1 text-xs ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {trend.isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
            {trend.value}% vs ontem
          </div>
        )}
        {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
      </div>
      <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}>
        {icon}
      </div>
    </div>
  </div>
);

export const NFCDashboard: React.FC<Props> = ({ stats, gates, mealStations }) => {
  const activeGates = gates.filter(g => g.is_active);
  const totalInside = gates.reduce((acc, g) => acc + g.current_inside, 0);
  
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total de Participantes"
          value={stats.total_participants.toLocaleString('pt-BR')}
          icon={<Users className="w-6 h-6 text-blue-600" />}
          color="bg-blue-100"
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Pulseiras Ativadas"
          value={stats.wristbands_assigned.toLocaleString('pt-BR')}
          icon={<CreditCard className="w-6 h-6 text-green-600" />}
          color="bg-green-100"
          subtitle={`${((stats.wristbands_assigned / stats.total_participants) * 100).toFixed(0)}% ativadas`}
        />
        <StatCard
          title="Dentro do Evento"
          value={totalInside.toLocaleString('pt-BR')}
          icon={<DoorOpen className="w-6 h-6 text-purple-600" />}
          color="bg-purple-100"
          subtitle="Em tempo real"
        />
        <StatCard
          title="Total de Entradas"
          value={stats.total_entries.toLocaleString('pt-BR')}
          icon={<Activity className="w-6 h-6 text-orange-600" />}
          color="bg-orange-100"
          trend={{ value: 15, isPositive: true }}
        />
      </div>

      {/* Staff & Meals Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Staff Status */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-green-600" />
              Status do Staff
            </h3>
            <span className="text-sm text-slate-500">
              {stats.staff_present}/{stats.staff_count} presentes
            </span>
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-600">Presença do Staff</span>
              <span className="font-semibold">
                {((stats.staff_present / stats.staff_count) * 100).toFixed(0)}%
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3">
              <div 
                className="bg-green-600 h-3 rounded-full transition-all"
                style={{ width: `${(stats.staff_present / stats.staff_count) * 100}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-900">{stats.staff_present}</p>
              <p className="text-xs text-green-600">Presentes</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <p className="text-2xl font-bold text-orange-900">{stats.staff_count - stats.staff_present}</p>
              <p className="text-xs text-orange-600">Ausentes</p>
            </div>
          </div>
        </div>

        {/* Meals Status */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <Utensils className="w-5 h-5 text-orange-600" />
              Controle de Alimentação
            </h3>
            <span className="text-sm text-slate-500">
              {stats.meals_served_today} servidas hoje
            </span>
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-600">Refeições Distribuídas</span>
              <span className="font-semibold">
                {stats.meals_served_today}/{stats.meals_served_today + stats.meals_remaining}
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3">
              <div 
                className="bg-orange-500 h-3 rounded-full transition-all"
                style={{ width: `${(stats.meals_served_today / (stats.meals_served_today + stats.meals_remaining)) * 100}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-900">{stats.meals_served_today}</p>
              <p className="text-xs text-green-600">Servidas</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-900">{stats.meals_remaining}</p>
              <p className="text-xs text-blue-600">Disponíveis</p>
            </div>
          </div>
        </div>
      </div>

      {/* Gates Status */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900 flex items-center gap-2">
            <DoorOpen className="w-5 h-5 text-purple-600" />
            Status das Portarias
          </h3>
          <div className="flex items-center gap-2 text-sm">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              {activeGates.length} ativas
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {gates.map((gate) => (
            <div 
              key={gate.id} 
              className={`p-4 rounded-xl border-2 ${
                gate.is_active 
                  ? 'border-green-200 bg-green-50' 
                  : 'border-slate-200 bg-slate-50 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-slate-900 text-sm">{gate.name}</h4>
                <span className={`w-3 h-3 rounded-full ${
                  gate.is_active ? 'bg-green-500 animate-pulse' : 'bg-slate-400'
                }`}></span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Entradas:</span>
                  <span className="font-medium text-green-600">+{gate.entries_today}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Saídas:</span>
                  <span className="font-medium text-orange-600">-{gate.exits_today}</span>
                </div>
                {gate.current_inside > 0 && (
                  <div className="flex justify-between pt-2 border-t border-slate-200">
                    <span className="text-slate-500">Dentro:</span>
                    <span className="font-bold text-slate-900">{gate.current_inside}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Meal Stations */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900 flex items-center gap-2">
            <Utensils className="w-5 h-5 text-orange-600" />
            Pontos de Alimentação
          </h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {mealStations.map((station) => (
            <div 
              key={station.id} 
              className={`p-4 rounded-xl border-2 ${
                station.is_active 
                  ? 'border-orange-200 bg-orange-50' 
                  : 'border-slate-200 bg-slate-50 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-slate-900">{station.name}</h4>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  station.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'
                }`}>
                  {station.is_active ? 'Aberto' : 'Fechado'}
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1">
                  {station.meal_types.map(type => (
                    <span key={type} className="px-2 py-0.5 bg-white rounded text-xs text-slate-600">
                      {type === 'breakfast' && '☕ Café'}
                      {type === 'lunch' && '🍽️ Almoço'}
                      {type === 'dinner' && '🌙 Jantar'}
                      {type === 'snack' && '🥪 Lanche'}
                    </span>
                  ))}
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-orange-200">
                  <span className="text-slate-600">Servidas hoje:</span>
                  <span className="font-bold text-orange-900">{station.served_today}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Alerts */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-yellow-900">Alertas do Sistema</h4>
            <ul className="mt-2 space-y-1 text-sm text-yellow-800">
              <li className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Horário do almoço em 15 minutos (11:00)
              </li>
              <li className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                23 membros do staff ainda não fizeram check-in
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NFCDashboard;
