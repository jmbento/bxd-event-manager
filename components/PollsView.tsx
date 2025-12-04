
import React, { useState } from 'react';
import { BarChart3, TrendingUp, TrendingDown, MapPin, Plus, Download, X } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { exportToXLSX } from '../services/exportService';

interface Poll {
  id: string;
  title: string;
  date: string;
  responses: number;
  status: 'ativa' | 'encerrada';
}

const mockPolls: Poll[] = [
  { id: '1', title: 'Intenção de Voto - Novembro', date: '2025-11-25', responses: 1250, status: 'ativa' },
  { id: '2', title: 'Prioridades da Cidade', date: '2025-11-20', responses: 890, status: 'encerrada' },
  { id: '3', title: 'Avaliação do Candidato', date: '2025-11-18', responses: 1580, status: 'encerrada' },
];

const intentionData = [
  { candidato: 'Candidato', percentual: 35, cor: '#3b82f6' },
  { candidato: 'Adversário A', percentual: 28, cor: '#ef4444' },
  { candidato: 'Adversário B', percentual: 15, cor: '#f59e0b' },
  { candidato: 'Indecisos', percentual: 22, cor: '#6b7280' },
];

const evolutionData = [
  { mes: 'Jul', candidato: 18, adversarioA: 32, adversarioB: 12 },
  { mes: 'Ago', candidato: 22, adversarioA: 30, adversarioB: 14 },
  { mes: 'Set', candidato: 27, adversarioA: 28, adversarioB: 15 },
  { mes: 'Out', candidato: 31, adversarioA: 28, adversarioB: 15 },
  { mes: 'Nov', candidato: 35, adversarioA: 28, adversarioB: 15 },
];

const regionalData = [
  { regiao: 'Centro', candidato: 42, adversarioA: 25, adversarioB: 12 },
  { regiao: 'Zona Norte', candidato: 38, adversarioA: 28, adversarioB: 15 },
  { regiao: 'Zona Sul', candidato: 31, adversarioA: 32, adversarioB: 18 },
  { regiao: 'Rural', candidato: 28, adversarioA: 30, adversarioB: 20 },
];

export const PollsView: React.FC = () => {
  const [selectedPoll, setSelectedPoll] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [newPoll, setNewPoll] = useState({
    title: '',
    startDate: '',
    endDate: '',
    targetAudience: '',
    sampleSize: '',
    methodology: 'presencial' as 'presencial' | 'telefone' | 'online'
  });

  const handleExport = () => {
    exportToXLSX('pesquisas-campanha', [
      {
        name: 'Pesquisas',
        data: mockPolls.map((poll) => ({
          Titulo: poll.title,
          Data: new Date(poll.date).toLocaleDateString('pt-BR'),
          Respostas: poll.responses,
          Status: poll.status,
        })),
      },
      {
        name: 'IntencaoVoto',
        data: intentionData.map((item) => ({
          Candidato: item.candidato,
          Percentual: item.percentual,
        })),
      },
      {
        name: 'Evolucao',
        data: evolutionData.map((row) => ({
          Mes: row.mes,
          Candidato: row.candidato,
          AdversarioA: row.adversarioA,
          AdversarioB: row.adversarioB,
        })),
      },
      {
        name: 'Regioes',
        data: regionalData.map((region) => ({
          Regiao: region.regiao,
          Candidato: region.candidato,
          AdversarioA: region.adversarioA,
          AdversarioB: region.adversarioB,
        })),
      },
    ]);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Pesquisas & Enquetes</h2>
        <div className="flex gap-2">
          <button 
            onClick={handleExport}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Exportar Dados
          </button>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nova Pesquisa
          </button>
        </div>
      </div>

      {/* Termômetro Eleitoral */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
        <h3 className="text-2xl font-bold mb-2">Termômetro Eleitoral</h3>
        <div className="flex items-end gap-4">
          <div>
            <p className="text-6xl font-bold">{intentionData[0].percentual}%</p>
            <p className="text-blue-100 mt-1">Intenção de Voto</p>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-6 h-6 text-emerald-300" />
            <span className="text-2xl font-bold text-emerald-300">+7%</span>
            <span className="text-sm text-blue-100">vs mês anterior</span>
          </div>
        </div>
      </div>

      {/* Gráficos Principais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Intenção de Voto Atual */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Cenário Atual de Votos
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={intentionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="candidato" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip />
              <Bar dataKey="percentual" fill="#3b82f6" radius={[8, 8, 0, 0]}>
                {intentionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.cor} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 gap-4">
            {intentionData.map((item) => (
              <div key={item.candidato} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.cor }} />
                <div>
                  <p className="text-xs text-slate-600">{item.candidato}</p>
                  <p className="text-lg font-bold text-slate-800">{item.percentual}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Evolução Temporal */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Evolução da Intenção de Voto</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={evolutionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="mes" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="candidato" stroke="#3b82f6" strokeWidth={3} name="Candidato" />
              <Line type="monotone" dataKey="adversarioA" stroke="#ef4444" strokeWidth={2} name="Adversário A" />
              <Line type="monotone" dataKey="adversarioB" stroke="#f59e0b" strokeWidth={2} name="Adversário B" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Mapa de Calor Regional */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-600" />
          Performance por Região
        </h3>
        <div className="space-y-4">
          {regionalData.map((region, idx) => {
            const total = region.candidato + region.adversarioA + region.adversarioB;
            const candidatoPercent = (region.candidato / total) * 100;
            const isLeading = region.candidato > region.adversarioA && region.candidato > region.adversarioB;
            
            return (
              <div key={region.regiao} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">{region.regiao}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-slate-600">
                      Candidato: <strong className="text-blue-600">{region.candidato}%</strong>
                    </span>
                    {isLeading ? (
                      <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                        <TrendingUp className="w-3 h-3" /> Liderando
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded">
                        <TrendingDown className="w-3 h-3" /> Atrás
                      </span>
                    )}
                  </div>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-4 flex overflow-hidden">
                  <div 
                    className="bg-blue-500 h-4 flex items-center justify-center"
                    style={{ width: `${candidatoPercent}%` }}
                  >
                    {candidatoPercent > 15 && <span className="text-[10px] text-white font-bold">{region.candidato}%</span>}
                  </div>
                  <div 
                    className="bg-red-500 h-4 flex items-center justify-center"
                    style={{ width: `${(region.adversarioA / total) * 100}%` }}
                  >
                    {region.adversarioA > 15 && <span className="text-[10px] text-white font-bold">{region.adversarioA}%</span>}
                  </div>
                  <div 
                    className="bg-amber-500 h-4 flex items-center justify-center"
                    style={{ width: `${(region.adversarioB / total) * 100}%` }}
                  >
                    {region.adversarioB > 15 && <span className="text-[10px] text-white font-bold">{region.adversarioB}%</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex justify-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-500" />
            <span className="text-xs text-slate-600">Candidato</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-500" />
            <span className="text-xs text-slate-600">Adversário A</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-amber-500" />
            <span className="text-xs text-slate-600">Adversário B</span>
          </div>
        </div>
      </div>

      {/* Lista de Pesquisas */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Histórico de Pesquisas</h3>
        <div className="space-y-3">
          {mockPolls.map((poll) => (
            <div 
              key={poll.id}
              className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-blue-300 transition-all cursor-pointer"
              onClick={() => setSelectedPoll(poll.id)}
            >
              <div>
                <h4 className="font-semibold text-slate-800">{poll.title}</h4>
                <p className="text-sm text-slate-500 mt-1">
                  {new Date(poll.date).toLocaleDateString('pt-BR')} • {poll.responses} respostas
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                poll.status === 'ativa' 
                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                  : 'bg-slate-100 text-slate-700 border border-slate-200'
              }`}>
                {poll.status === 'ativa' ? 'Ativa' : 'Encerrada'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Nova Pesquisa */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">Nova Pesquisa</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600" title="Fechar">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); console.log('Nova pesquisa:', newPoll); setShowModal(false); }} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Título da Pesquisa *
                </label>
                <input
                  type="text"
                  value={newPoll.title}
                  onChange={(e) => setNewPoll({...newPoll, title: e.target.value})}
                  placeholder="Ex: Intenção de Voto - Dezembro"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Data de Início *
                  </label>
                  <input
                    type="date"
                    value={newPoll.startDate}
                    onChange={(e) => setNewPoll({...newPoll, startDate: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Data de Término *
                  </label>
                  <input
                    type="date"
                    value={newPoll.endDate}
                    onChange={(e) => setNewPoll({...newPoll, endDate: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Público Alvo *
                  </label>
                  <input
                    type="text"
                    value={newPoll.targetAudience}
                    onChange={(e) => setNewPoll({...newPoll, targetAudience: e.target.value})}
                    placeholder="Ex: Eleitores de 18 a 65 anos"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Tamanho da Amostra *
                  </label>
                  <input
                    type="number"
                    value={newPoll.sampleSize}
                    onChange={(e) => setNewPoll({...newPoll, sampleSize: e.target.value})}
                    placeholder="Ex: 1000"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Metodologia *
                </label>
                <select
                  value={newPoll.methodology}
                  onChange={(e) => setNewPoll({...newPoll, methodology: e.target.value as typeof newPoll.methodology})}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="presencial">Presencial</option>
                  <option value="telefone">Telefone</option>
                  <option value="online">Online</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Criar Pesquisa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
