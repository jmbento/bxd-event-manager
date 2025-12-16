
import React, { useMemo, useCallback } from 'react';
import { TrendingUp, TrendingDown, Target, Users, Heart, Share2, Eye, MessageCircle, BarChart3, Zap } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { exportToXLSX } from '../services/exportService';


// Dados reais devem ser buscados de API ou integrados via configuração
const performanceData: any[] = [];
const socialMetrics: any[] = [];
const metasData: any[] = [];
const sentimentData: any[] = [];

export const AnalyticsView: React.FC = () => {
  // Memoize expensive calculations
  const memoizedChartData = useMemo(() => ({
    performanceData,
    socialMetrics,
    metasData,
    sentimentData
  }), []);

  const handleExport = useCallback(() => {
    try {
      const timestamp = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
      exportToXLSX(`analytics-relatorio-${timestamp}`, [
        {
          name: 'Performance Mensal',
          data: performanceData.map((row) => ({
            'Mês': row.mes,
            'Alcance Total': row.alcance.toLocaleString('pt-BR'),
            'Engajamento': row.engajamento.toLocaleString('pt-BR'),
            'Conversões': row.conversao.toLocaleString('pt-BR'),
            'Taxa de Engajamento (%)': ((row.engajamento / row.alcance) * 100).toFixed(2),
            'Taxa de Conversão (%)': ((row.conversao / row.alcance) * 100).toFixed(2)
          })),
        },
        {
          name: 'Redes Sociais',
          data: socialMetrics.map((metric) => ({
            'Rede Social': metric.rede,
            'Seguidores': metric.seguidores.toLocaleString('pt-BR'),
            'Crescimento (%)': metric.crescimento,
            'Engajamento Médio Estimado': Math.floor(metric.seguidores * 0.03).toLocaleString('pt-BR'),
            'Alcance Potencial': Math.floor(metric.seguidores * 2.5).toLocaleString('pt-BR')
          })),
        },
        {
          name: 'Metas vs Realizado',
          data: metasData.map((meta) => ({
            'Categoria': meta.categoria,
            'Meta Planejada': meta.meta.toLocaleString('pt-BR'),
            'Realizado': meta.realizado.toLocaleString('pt-BR'),
            'Percentual Atingido (%)': ((meta.realizado / meta.meta) * 100).toFixed(1),
            'Diferença': (meta.realizado - meta.meta).toLocaleString('pt-BR'),
            'Status': meta.realizado >= meta.meta ? 'Meta Atingida ✅' : 'Em Andamento ⏳'
          })),
        },
        {
          name: 'Análise de Sentimento',
          data: sentimentData.map((item) => ({
            'Tipo de Sentimento': item.name,
            'Quantidade': item.value.toLocaleString('pt-BR'),
            'Percentual do Total (%)': ((item.value / sentimentData.reduce((sum, s) => sum + s.value, 0)) * 100).toFixed(1)
          })),
        },
      ]);
      console.log('✅ Relatório exportado com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao exportar relatório:', error);
    }
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Analytics & Métricas</h2>
        <button 
          onClick={handleExport}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Exportar Relatório
        </button>
      </div>

      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <Eye className="w-8 h-8 opacity-80" />
            <span className="flex items-center gap-1 text-sm font-medium bg-white/20 px-2 py-1 rounded">
              <TrendingUp className="w-4 h-4" /> +28.5%
            </span>
          </div>
          <p className="text-sm opacity-90">Alcance Total</p>
          <p className="text-3xl font-bold mt-1">58.2K</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <Heart className="w-8 h-8 opacity-80" />
            <span className="flex items-center gap-1 text-sm font-medium bg-white/20 px-2 py-1 rounded">
              <TrendingUp className="w-4 h-4" /> +18.2%
            </span>
          </div>
          <p className="text-sm opacity-90">Engajamento</p>
          <p className="text-3xl font-bold mt-1">4.1K</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8 opacity-80" />
            <span className="flex items-center gap-1 text-sm font-medium bg-white/20 px-2 py-1 rounded">
              <TrendingUp className="w-4 h-4" /> +31.2%
            </span>
          </div>
          <p className="text-sm opacity-90">Novos Seguidores</p>
          <p className="text-3xl font-bold mt-1">2.3K</p>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <Share2 className="w-8 h-8 opacity-80" />
            <span className="flex items-center gap-1 text-sm font-medium bg-white/20 px-2 py-1 rounded">
              <TrendingDown className="w-4 h-4" /> -5.1%
            </span>
          </div>
          <p className="text-sm opacity-90">Compartilhamentos</p>
          <p className="text-3xl font-bold mt-1">892</p>
        </div>
      </div>

      {/* Gráfico de Performance */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          Performance da Campanha
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={performanceData}>
            <defs>
              <linearGradient id="colorAlcance" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorEngajamento" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="mes" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="alcance" stroke="#3b82f6" fillOpacity={1} fill="url(#colorAlcance)" name="Alcance" />
            <Area type="monotone" dataKey="engajamento" stroke="#10b981" fillOpacity={1} fill="url(#colorEngajamento)" name="Engajamento" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Métricas de Redes Sociais */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Crescimento por Rede Social</h3>
          <div className="space-y-4">
            {socialMetrics.map((metric) => (
              <div key={metric.rede} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">{metric.rede}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-500">{metric.seguidores.toLocaleString()}</span>
                    <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                      <TrendingUp className="w-3 h-3" /> {metric.crescimento}%
                    </span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(metric.crescimento * 3, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Análise de Sentimento */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Análise de Sentimento</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={sentimentData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {sentimentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 flex justify-center gap-4">
            {sentimentData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-xs text-slate-600">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Metas vs Realizado */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-600" />
          Metas vs Realizado
        </h3>
        <div className="space-y-4">
          {metasData.map((meta) => {
            const percentual = (meta.realizado / meta.meta) * 100;
            return (
              <div key={meta.categoria} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">{meta.categoria}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-slate-500">
                      {meta.realizado.toLocaleString()} / {meta.meta.toLocaleString()}
                    </span>
                    <span className={`text-sm font-bold ${percentual >= 80 ? 'text-emerald-600' : percentual >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                      {percentual.toFixed(0)}%
                    </span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div 
                    className="h-3 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${Math.min(percentual, 100)}%`,
                      backgroundColor: meta.color
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Previsão com IA */}
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-purple-500 rounded-lg">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Insights com IA</h3>
            <ul className="space-y-2 text-sm text-slate-700">
              <li className="flex items-start gap-2">
                <span className="text-purple-600 font-bold">•</span>
                <span>Com base no crescimento atual, você deve atingir <strong>75K seguidores</strong> até o final da campanha.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 font-bold">•</span>
                <span>O melhor horário para posts é entre <strong>18h-21h</strong>, com 45% mais engajamento.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 font-bold">•</span>
                <span>Conteúdos em vídeo têm <strong>3x mais compartilhamentos</strong> que imagens estáticas.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
