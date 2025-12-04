import React from 'react';
import { ResponsiveContainer, XAxis, Tooltip, YAxis, Area, AreaChart } from 'recharts';
import { ExpenseCategory, CampaignLocation, LocationStatus } from '../types';
import { MapPin, ArrowRight, TrendingUp, Zap, CloudRain, Sun, DollarSign, Users, AlertTriangle, CheckCircle, Clock, Radio, Target } from 'lucide-react';

const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#8b5cf6'];

interface Props {
  expenses: ExpenseCategory[];
  locations: CampaignLocation[];
  digitalStats: {
    invested: number;
    reach: number;
    leads: number;
    videosProduced: number;
    videoGoal: number;
  };
}

export const DashboardWidgets: React.FC<Props> = ({ expenses, locations, digitalStats }) => {
  
  // Mock data para o Command Center
  const salesCurveData = [
    { day: 'Lançamento', real: 120, meta: 100, marco: 'Line-up Reveal' },
    { day: '1 Sem', real: 450, meta: 400, marco: null },
    { day: '2 Sem', real: 780, meta: 800, marco: null },
    { day: '3 Sem', real: 1200, meta: 1100, marco: 'Virada 1º Lote' },
    { day: '1 Mês', real: 2100, meta: 2000, marco: null },
    { day: 'Hoje', real: 3850, meta: 3500, marco: 'Virada 2º Lote' }
  ];

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumSignificantDigits: 3 }).format(val);

  const ticketsSold = 3850;
  const ticketsTotal = 5000;
  const soldPercentage = Math.round((ticketsSold / ticketsTotal) * 100);
  const ticketsLastHour = 47;
  const cashFlow = 285600;
  
  const vitals = [
    { id: 'licenses', label: 'Alvarás & Licenças', status: 'warning', days: 12 },
    { id: 'lineup', label: 'Line-up', status: 'success', progress: '8/10 artistas' },
    { id: 'suppliers', label: 'Fornecedores', status: 'success', progress: '94% contratos' },
    { id: 'technical', label: 'Técnica', status: 'danger', issue: 'Rider Alok pendente' }
  ];

  const redFlags = [
    { id: 1, issue: 'Rider do Headliner reprovado pela técnica', priority: 'high', time: '2h atrás' },
    { id: 2, issue: 'Estoque de Copos Eco abaixo do mínimo', priority: 'medium', time: '4h atrás' },
    { id: 3, issue: 'Pagamento de patrocínio da Marca X atrasado', priority: 'high', time: '1 dia atrás' }
  ];

  return (
    <div className="space-y-6">
      
      {/* 1. THE HUD (HEADS-UP DISPLAY) - Leitura Instantânea */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Ticket Pulse */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 rounded-xl text-white">
          <div className="flex items-center justify-between mb-2">
            <Zap className="w-5 h-5 text-blue-200" />
            <span className="text-xs font-bold text-blue-200 uppercase">Ticket Pulse</span>
          </div>
          <div className="text-2xl font-bold mb-1">{ticketsLastHour}</div>
          <div className="text-xs text-blue-200">ingressos na última hora</div>
          <div className={`text-xs font-bold mt-1 flex items-center gap-1 ${
            ticketsLastHour > 30 ? 'text-green-300' : ticketsLastHour > 15 ? 'text-yellow-300' : 'text-red-300'
          }`}>
            <TrendingUp className="w-3 h-3" />
            {ticketsLastHour > 30 ? 'Acelerado' : ticketsLastHour > 15 ? 'Normal' : 'Lento'}
          </div>
        </div>
        
        {/* % Sold Out */}
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <Target className="w-5 h-5 text-emerald-500" />
            <span className="text-xs font-bold text-slate-500 uppercase">Sold Out</span>
          </div>
          <div className="text-2xl font-bold text-slate-800 mb-1">{soldPercentage}%</div>
          <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
            <div 
              className="bg-emerald-500 h-2 rounded-full transition-all duration-500" 
              style={{ width: `${soldPercentage}%` }}
            ></div>
          </div>
          <div className="text-xs text-slate-500">{ticketsSold.toLocaleString()} / {ticketsTotal.toLocaleString()}</div>
        </div>
        
        {/* Cash Flow */}
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-4 rounded-xl text-white">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-5 h-5 text-emerald-200" />
            <span className="text-xs font-bold text-emerald-200 uppercase">Cash Flow</span>
          </div>
          <div className="text-xl font-bold mb-1">{formatCurrency(cashFlow)}</div>
          <div className="text-xs text-emerald-200">saldo disponível hoje</div>
          <div className="text-xs font-bold mt-1 text-green-300 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Positivo
          </div>
        </div>
        
        {/* Clima */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-4 rounded-xl text-white">
          <div className="flex items-center justify-between mb-2">
            <Sun className="w-5 h-5 text-amber-200" />
            <span className="text-xs font-bold text-amber-200 uppercase">Clima</span>
          </div>
          <div className="text-lg font-bold mb-1">Sol/Nublado</div>
          <div className="text-xs text-amber-200">Sáb: 28°C | Dom: 32°C</div>
          <div className="text-xs font-bold mt-1 text-green-300 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Perfeito
          </div>
        </div>
      </div>

      
      {/* 2. GRÁFICO CENTRAL: A CURVA DE VENDA */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-bold text-slate-800">Curva de Venda vs. Meta</h3>
            <p className="text-sm text-slate-500">Performance de vendas com marcos de marketing</p>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span className="text-slate-600">Real</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 border-2 border-slate-400 rounded"></div>
              <span className="text-slate-600">Meta</span>
            </div>
          </div>
        </div>
        
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={salesCurveData}>
              <defs>
                <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="day" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#64748b' }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#64748b' }}
              />
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-200">
                        <h4 className="font-bold text-slate-800">{label}</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between gap-4">
                            <span className="text-blue-600">Vendas Reais:</span>
                            <span className="font-bold">{payload[0].value}</span>
                          </div>
                          <div className="flex justify-between gap-4">
                            <span className="text-slate-600">Meta:</span>
                            <span className="font-bold">{payload[1]?.value || 'N/A'}</span>
                          </div>
                          {data.marco && (
                            <div className="pt-2 border-t border-slate-100">
                              <span className="text-purple-600 font-medium">🎆 {data.marco}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="real"
                stroke="#3b82f6"
                strokeWidth={3}
                fill="url(#salesGradient)"
              />
              <Line
                type="monotone"
                dataKey="meta"
                stroke="#94a3b8"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        {/* Marcos de Marketing */}
        <div className="flex flex-wrap gap-2 mt-4">
          {salesCurveData.filter(d => d.marco).map((marco, idx) => (
            <span key={idx} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">
              🎆 {marco.marco}
            </span>
          ))}
        </div>
      </div>
      
      {/* 3. PAINEL DE SINAIS VITAIS + RED FLAGS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Sinais Vitais (Semáforos) */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Radio className="w-5 h-5 text-emerald-500" />
            Sinais Vitais
          </h3>
          
          <div className="space-y-4">
            {vitals.map((vital) => (
              <div key={vital.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full ${
                    vital.status === 'success' ? 'bg-emerald-500' :
                    vital.status === 'warning' ? 'bg-amber-500' : 'bg-red-500'
                  }`}></div>
                  <span className="font-medium text-slate-800">{vital.label}</span>
                </div>
                
                <div className="text-right">
                  {vital.status === 'warning' && vital.days && (
                    <div className="text-amber-600 font-bold text-sm">
                      {vital.days} dias restantes
                    </div>
                  )}
                  {vital.progress && (
                    <div className="text-emerald-600 font-medium text-sm">
                      {vital.progress}
                    </div>
                  )}
                  {vital.issue && (
                    <div className="text-red-600 font-bold text-sm">
                      ⚠️ {vital.issue}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* Status Geral */}
          <div className="mt-6 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
            <div className="flex items-center gap-2 text-emerald-800">
              <CheckCircle className="w-5 h-5" />
              <span className="font-bold">Status Geral: Operacional</span>
            </div>
            <p className="text-sm text-emerald-600 mt-1">
              Sistema funcionando dentro dos parâmetros. 1 atenção pendente.
            </p>
          </div>
        </div>
        
        {/* Feed de Red Flags */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Red Flags - Ação Imediata
          </h3>
          
          <div className="space-y-3">
            {redFlags.map((flag) => (
              <div key={flag.id} className={`p-4 rounded-lg border-l-4 ${
                flag.priority === 'high' ? 'border-red-500 bg-red-50' : 'border-amber-500 bg-amber-50'
              }`}>
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-xs font-bold uppercase px-2 py-1 rounded ${
                    flag.priority === 'high' 
                      ? 'bg-red-500 text-white' 
                      : 'bg-amber-500 text-white'
                  }`}>
                    {flag.priority === 'high' ? '🚨 CRÍTICO' : '⚠️ ATENÇÃO'}
                  </span>
                  <span className="text-xs text-slate-500">{flag.time}</span>
                </div>
                
                <p className="text-sm font-medium text-slate-800 mb-2">{flag.issue}</p>
                
                <div className="flex gap-2">
                  <button className="text-xs px-3 py-1 bg-slate-800 text-white rounded hover:bg-slate-900">
                    Resolver Agora
                  </button>
                  <button className="text-xs px-3 py-1 bg-slate-200 text-slate-600 rounded hover:bg-slate-300">
                    Delegar
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {redFlags.length === 0 && (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
              <p className="text-slate-500 font-medium">Nenhum problema crítico!</p>
              <p className="text-xs text-slate-400">Tudo funcionando perfeitamente.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};