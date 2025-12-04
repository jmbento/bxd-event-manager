
import React, { useState } from 'react';
import { Users, Award, Trophy, Calendar, Plus, Star, TrendingUp, GraduationCap, X } from 'lucide-react';

interface Volunteer {
  id: string;
  name: string;
  phone: string;
  points: number;
  eventsParticipated: number;
  rank: number;
  availability: string[];
  skills: string[];
}

const mockVolunteers: Volunteer[] = [
  {
    id: '1',
    name: 'Carlos Mendes',
    phone: '(11) 99999-1111',
    points: 850,
    eventsParticipated: 12,
    rank: 1,
    availability: ['Manhã', 'Tarde'],
    skills: ['Montagem Palco', 'Logística'],
  },
  {
    id: '2',
    name: 'Juliana Silva',
    phone: '(11) 99999-2222',
    points: 720,
    eventsParticipated: 10,
    rank: 2,
    availability: ['Tarde', 'Noite'],
    skills: ['Atendimento VIP', 'Design'],
  },
  {
    id: '3',
    name: 'Roberto Costa',
    phone: '(11) 99999-3333',
    points: 680,
    eventsParticipated: 9,
    rank: 3,
    availability: ['Manhã'],
    skills: ['Motorista', 'Segurança'],
  },
  {
    id: '4',
    name: 'Fernanda Lima',
    phone: '(11) 99999-4444',
    points: 590,
    eventsParticipated: 8,
    rank: 4,
    availability: ['Noite'],
    skills: ['Fotografia', 'Vídeo'],
  },
  {
    id: '5',
    name: 'Paulo Santos',
    phone: '(11) 99999-5555',
    points: 520,
    eventsParticipated: 7,
    rank: 5,
    availability: ['Tarde'],
    skills: ['Catering', 'Organização'],
  },
];

const upcomingShifts = [
  { id: '1', event: 'Soundcheck Main Stage', date: '2025-11-28', time: '14:00', volunteers: 12, needed: 15 },
  { id: '2', event: 'Experiência Imersiva Lounge', date: '2025-11-29', time: '08:00', volunteers: 8, needed: 10 },
  { id: '3', event: 'Acolhimento Headliners', date: '2025-11-30', time: '18:00', volunteers: 20, needed: 25 },
];

const trainingModules = [
  { id: '1', title: 'Atendimento ao Público', duration: '30 min', completed: 145, total: 250 },
  { id: '2', title: 'Experiência VIP & Hospitalidade', duration: '45 min', completed: 98, total: 250 },
  { id: '3', title: 'Procedimentos de Segurança em Eventos', duration: '60 min', completed: 67, total: 250 },
];

export const VolunteersView: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [newVolunteer, setNewVolunteer] = useState({
    name: '',
    phone: '',
    email: '',
    availability: [] as string[],
    skills: '',
    address: ''
  });

  const getRankBadge = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Gestão de Voluntários</h2>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Cadastrar Voluntário
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <Users className="w-8 h-8 mb-2 opacity-80" />
          <p className="text-3xl font-bold">{mockVolunteers.length}</p>
          <p className="text-sm opacity-90 mt-1">Voluntários Ativos</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 text-white">
          <Calendar className="w-8 h-8 mb-2 opacity-80" />
          <p className="text-3xl font-bold">{mockVolunteers.reduce((sum, v) => sum + v.eventsParticipated, 0)}</p>
          <p className="text-sm opacity-90 mt-1">Total de Participações</p>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-6 text-white">
          <Trophy className="w-8 h-8 mb-2 opacity-80" />
          <p className="text-3xl font-bold">{mockVolunteers.reduce((sum, v) => sum + v.points, 0)}</p>
          <p className="text-sm opacity-90 mt-1">Pontos Totais</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <GraduationCap className="w-8 h-8 mb-2 opacity-80" />
          <p className="text-3xl font-bold">{trainingModules.reduce((sum, t) => sum + t.completed, 0)}</p>
          <p className="text-sm opacity-90 mt-1">Treinamentos Concluídos</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ranking de Voluntários */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              Ranking de Voluntários
            </h3>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">Ver Todos</button>
          </div>
          <div className="space-y-3">
            {mockVolunteers.map((volunteer) => (
              <div 
                key={volunteer.id}
                className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-blue-300 transition-all"
              >
                <div className="text-2xl font-bold w-12 text-center">
                  {getRankBadge(volunteer.rank)}
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
                  {volunteer.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-800">{volunteer.name}</h4>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-xs text-slate-500">{volunteer.phone}</span>
                    <span className="flex items-center gap-1 text-xs text-blue-600">
                      <Calendar className="w-3 h-3" />
                      {volunteer.eventsParticipated} eventos
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-amber-600">
                    <Star className="w-5 h-5 fill-amber-500" />
                    <span className="text-xl font-bold">{volunteer.points}</span>
                  </div>
                  <p className="text-xs text-slate-500">pontos</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Próximas Escalas */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Próximas Escalas
            </h3>
            <div className="space-y-3">
              {upcomingShifts.map((shift) => (
                <div key={shift.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <h4 className="font-semibold text-slate-800 text-sm">{shift.event}</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    {new Date(shift.date).toLocaleDateString('pt-BR')} às {shift.time}
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-slate-600">
                      {shift.volunteers}/{shift.needed} voluntários
                    </span>
                    {shift.volunteers < shift.needed ? (
                      <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                        Vagas abertas
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                        Completo
                      </span>
                    )}
                  </div>
                  <div className="mt-2 w-full bg-slate-200 rounded-full h-1.5">
                    <div 
                      className={`h-1.5 rounded-full ${shift.volunteers >= shift.needed ? 'bg-emerald-500' : 'bg-blue-500'}`}
                      style={{ width: `${(shift.volunteers / shift.needed) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium">
              Gerenciar Escalas
            </button>
          </div>
        </div>
      </div>

      {/* Módulos de Treinamento */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-purple-600" />
            Treinamentos Online
          </h3>
          <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">+ Novo Módulo</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {trainingModules.map((module) => {
            const completionRate = (module.completed / module.total) * 100;
            return (
              <div key={module.id} className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-slate-800 text-sm">{module.title}</h4>
                  <span className="text-xs text-purple-600 bg-white px-2 py-0.5 rounded border border-purple-200">
                    {module.duration}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mb-3">
                  {module.completed} de {module.total} voluntários completaram
                </p>
                <div className="w-full bg-white rounded-full h-2 mb-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full transition-all"
                    style={{ width: `${completionRate}%` }}
                  />
                </div>
                <p className="text-xs font-semibold text-purple-600">{completionRate.toFixed(0)}% completo</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Gamificação */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-amber-500 rounded-lg">
            <Award className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Sistema de Gamificação Ativo</h3>
            <p className="text-sm text-slate-600 mb-3">
              Voluntários ganham pontos por participação em eventos, treinamentos e ações da campanha. 
              Recompensas especiais para os top performers!
            </p>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium transition-colors">
                Ver Recompensas
              </button>
              <button className="px-4 py-2 bg-white hover:bg-amber-50 text-amber-700 border border-amber-300 rounded-lg text-sm font-medium transition-colors">
                Configurar Sistema
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Novo Voluntário */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">Cadastrar Voluntário</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600" title="Fechar">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); console.log('Novo voluntário:', newVolunteer); setShowModal(false); }} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    value={newVolunteer.name}
                    onChange={(e) => setNewVolunteer({...newVolunteer, name: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Telefone *
                  </label>
                  <input
                    type="tel"
                    value={newVolunteer.phone}
                    onChange={(e) => setNewVolunteer({...newVolunteer, phone: e.target.value})}
                    placeholder="(00) 00000-0000"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    E-mail *
                  </label>
                  <input
                    type="email"
                    value={newVolunteer.email}
                    onChange={(e) => setNewVolunteer({...newVolunteer, email: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Endereço
                  </label>
                  <input
                    type="text"
                    value={newVolunteer.address}
                    onChange={(e) => setNewVolunteer({...newVolunteer, address: e.target.value})}
                    placeholder="Rua, Bairro, Cidade"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Disponibilidade
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['Manhã', 'Tarde', 'Noite'].map(period => (
                    <label key={period} className="flex items-center gap-2 p-3 border border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newVolunteer.availability.includes(period)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewVolunteer({...newVolunteer, availability: [...newVolunteer.availability, period]});
                          } else {
                            setNewVolunteer({...newVolunteer, availability: newVolunteer.availability.filter(p => p !== period)});
                          }
                        }}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm text-slate-700">{period}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Habilidades/Interesses
                </label>
                <textarea
                  value={newVolunteer.skills}
                  onChange={(e) => setNewVolunteer({...newVolunteer, skills: e.target.value})}
                  rows={3}
                  placeholder="Ex: Marketing digital, panfletagem, organização de eventos..."
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
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
                  Cadastrar Voluntário
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
