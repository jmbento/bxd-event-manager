import React, { useState, useEffect } from 'react';
import { 
  Video, Users, Link2, Send, Check, Calendar, Clock,
  MessageCircle, Copy, ExternalLink, Plus, Settings, X
} from 'lucide-react';
import { PageBanner } from './PageBanner';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  selected: boolean;
}

interface VideoMeeting {
  id: string;
  title: string;
  platform: 'google' | 'zoom' | 'teams' | 'other';
  link: string;
  date: string;
  time: string;
  participants: string[];
  status: 'scheduled' | 'completed' | 'cancelled';
  created_at: string;
}

const platforms = [
  {
    id: 'google',
    name: 'Google Meet',
    icon: '🎥',
    color: 'bg-green-50 border-green-300 hover:bg-green-100',
    activeColor: 'bg-green-500 text-white',
    url: 'https://meet.google.com/new',
    instructions: 'Clique em "Nova reunião" e cole o link abaixo'
  },
  {
    id: 'zoom',
    name: 'Zoom',
    icon: '📹',
    color: 'bg-blue-50 border-blue-300 hover:bg-blue-100',
    activeColor: 'bg-blue-500 text-white',
    url: 'https://zoom.us/start/videomeeting',
    instructions: 'Inicie uma reunião e copie o link de convite'
  },
  {
    id: 'teams',
    name: 'Microsoft Teams',
    icon: '💼',
    color: 'bg-purple-50 border-purple-300 hover:bg-purple-100',
    activeColor: 'bg-purple-500 text-white',
    url: 'https://teams.microsoft.com',
    instructions: 'Crie uma nova reunião e copie o link'
  },
  {
    id: 'other',
    name: 'Outra Plataforma',
    icon: '🔗',
    color: 'bg-slate-50 border-slate-300 hover:bg-slate-100',
    activeColor: 'bg-slate-500 text-white',
    url: '',
    instructions: 'Cole o link da sua plataforma de videoconferência'
  }
];

export const MeetingView: React.FC = () => {
  const [showNewMeetingModal, setShowNewMeetingModal] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('google');
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingTime, setMeetingTime] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);
  
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() => {
    const saved = localStorage.getItem('event_team_members');
    if (saved) {
      return JSON.parse(saved).map((m: any) => ({ ...m, selected: false }));
    }
    return [
      { id: '1', name: 'Maria Silva', role: 'Produtora', email: 'maria@evento.com', phone: '11999990001', selected: false },
      { id: '2', name: 'João Santos', role: 'Coordenador', email: 'joao@evento.com', phone: '11999990002', selected: false },
      { id: '3', name: 'Ana Costa', role: 'Marketing', email: 'ana@evento.com', phone: '11999990003', selected: false },
      { id: '4', name: 'Pedro Lima', role: 'Financeiro', email: 'pedro@evento.com', phone: '11999990004', selected: false },
      { id: '5', name: 'Carla Souza', role: 'Logística', email: 'carla@evento.com', phone: '11999990005', selected: false }
    ];
  });

  const [meetings, setMeetings] = useState<VideoMeeting[]>(() => {
    const saved = localStorage.getItem('video_meetings');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('video_meetings', JSON.stringify(meetings));
  }, [meetings]);

  const toggleMemberSelection = (id: string) => {
    setTeamMembers(prev => prev.map(member => 
      member.id === id ? { ...member, selected: !member.selected } : member
    ));
  };

  const selectAll = () => {
    const allSelected = teamMembers.every(m => m.selected);
    setTeamMembers(prev => prev.map(m => ({ ...m, selected: !allSelected })));
  };

  const handleCreateMeeting = () => {
    if (!meetingTitle || !meetingDate || !meetingTime) {
      alert('Preencha título, data e horário da reunião');
      return;
    }

    const selectedMembers = teamMembers.filter(m => m.selected);
    
    if (selectedMembers.length === 0) {
      alert('Selecione pelo menos um participante');
      return;
    }

    const newMeeting: VideoMeeting = {
      id: 'm-' + Date.now(),
      title: meetingTitle,
      platform: selectedPlatform as any,
      link: meetingLink,
      date: meetingDate,
      time: meetingTime,
      participants: selectedMembers.map(m => m.name),
      status: 'scheduled',
      created_at: new Date().toISOString()
    };

    setMeetings(prev => [newMeeting, ...prev]);
    
    // Enviar via WhatsApp
    sendWhatsAppInvites(selectedMembers, newMeeting);
    
    // Limpar formulário
    setMeetingTitle('');
    setMeetingDate('');
    setMeetingTime('');
    setMeetingLink('');
    setTeamMembers(prev => prev.map(m => ({ ...m, selected: false })));
    setShowNewMeetingModal(false);
  };

  const sendWhatsAppInvites = (members: TeamMember[], meeting: VideoMeeting) => {
    const platformName = platforms.find(p => p.id === meeting.platform)?.name || 'Reunião Online';
    const dateFormatted = new Date(meeting.date).toLocaleDateString('pt-BR');
    
    members.forEach(member => {
      const message = `🎥 *Convite: ${meeting.title}*\n\n` +
        `📅 Data: ${dateFormatted}\n` +
        `🕐 Horário: ${meeting.time}\n` +
        `💻 Plataforma: ${platformName}\n\n` +
        `🔗 Link: ${meeting.link || 'Link será enviado em breve'}\n\n` +
        `Nos vemos lá! 👋`;
      
      const whatsappUrl = `https://wa.me/${member.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    });

    alert(`Convites enviados via WhatsApp para ${members.length} participante(s)!`);
  };

  const copyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const filteredMembers = teamMembers.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedCount = teamMembers.filter(m => m.selected).length;
  const platform = platforms.find(p => p.id === selectedPlatform);

  return (
    <div className="space-y-6">
      <PageBanner pageKey="meetings" />

      {/* Header com Banner de Videoconferência */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <Video className="w-8 h-8" />
              Reuniões por Videoconferência
            </h1>
            <p className="text-purple-100 text-lg">
              Integração com Google Meet, Zoom, Teams e outras plataformas
            </p>
          </div>
          
          <button
            onClick={() => setShowNewMeetingModal(true)}
            className="px-6 py-3 bg-white text-purple-600 rounded-xl font-bold hover:bg-purple-50 transition flex items-center gap-2 shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Nova Reunião
          </button>
        </div>

        {/* Ícones das Plataformas */}
        <div className="mt-6 flex items-center gap-4 pt-6 border-t border-white/20">
          <span className="text-sm text-purple-100 font-medium">Plataformas:</span>
          {platforms.map(p => (
            <div 
              key={p.id}
              className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2"
              title={p.name}
            >
              <span className="text-2xl">{p.icon}</span>
              <span className="text-sm font-medium">{p.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-purple-500" />
            <span className="text-sm text-slate-600">Agendadas</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {meetings.filter(m => m.status === 'scheduled').length}
          </p>
        </div>
        
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Check className="w-4 h-4 text-green-500" />
            <span className="text-sm text-slate-600">Realizadas</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {meetings.filter(m => m.status === 'completed').length}
          </p>
        </div>
        
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-blue-500" />
            <span className="text-sm text-slate-600">Equipe Total</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{teamMembers.length}</p>
        </div>
      </div>

      {/* Lista de Reuniões */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-purple-600" />
          Reuniões Agendadas
        </h2>

        {meetings.length === 0 ? (
          <div className="text-center py-12">
            <Video className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="text-slate-500 mb-1">Nenhuma reunião agendada</p>
            <p className="text-sm text-slate-400">Crie uma nova reunião para começar</p>
          </div>
        ) : (
          <div className="space-y-3">
            {meetings.map(meeting => {
              const platform = platforms.find(p => p.id === meeting.platform);
              return (
                <div key={meeting.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{platform?.icon}</span>
                        <div>
                          <h3 className="font-bold text-slate-900">{meeting.title}</h3>
                          <p className="text-sm text-slate-500">{platform?.name}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-slate-600 mb-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(meeting.date).toLocaleDateString('pt-BR')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {meeting.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {meeting.participants.length} participantes
                        </span>
                      </div>

                      {meeting.link && (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={meeting.link}
                            readOnly
                            className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                          />
                          <button
                            onClick={() => copyLink(meeting.link)}
                            className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Copiar link"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <a
                            href={meeting.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-slate-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition"
                            title="Abrir reunião"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      )}
                    </div>

                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                      meeting.status === 'scheduled' 
                        ? 'bg-blue-100 text-blue-700'
                        : meeting.status === 'completed'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {meeting.status === 'scheduled' ? 'Agendada' : meeting.status === 'completed' ? 'Realizada' : 'Cancelada'}
                    </span>
                  </div>

                  {meeting.participants.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-200">
                      <p className="text-xs text-slate-500 mb-1">Participantes:</p>
                      <p className="text-sm text-slate-700">{meeting.participants.join(', ')}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Nova Reunião */}
      {showNewMeetingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Video className="w-6 h-6 text-purple-600" />
                Nova Reunião por Videoconferência
              </h3>
              <button
                onClick={() => setShowNewMeetingModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Seleção de Plataforma */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Escolha a Plataforma
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {platforms.map(p => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPlatform(p.id)}
                      className={`border-2 rounded-xl p-4 transition ${
                        selectedPlatform === p.id
                          ? p.activeColor + ' border-transparent shadow-lg'
                          : p.color + ' border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{p.icon}</span>
                        <div className="text-left">
                          <h4 className={`font-semibold ${selectedPlatform === p.id ? 'text-white' : 'text-slate-900'}`}>
                            {p.name}
                          </h4>
                          {selectedPlatform === p.id && (
                            <Check className="w-5 h-5 mt-1" />
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                {platform && platform.url && (
                  <a
                    href={platform.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-3 text-sm text-blue-600 hover:text-blue-700"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Abrir {platform.name}
                  </a>
                )}
              </div>

              {/* Dados da Reunião */}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Título da Reunião
                  </label>
                  <input
                    type="text"
                    value={meetingTitle}
                    onChange={(e) => setMeetingTitle(e.target.value)}
                    placeholder="Ex: Alinhamento Semanal de Produção"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Data
                  </label>
                  <input
                    type="date"
                    value={meetingDate}
                    onChange={(e) => setMeetingDate(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Horário
                  </label>
                  <input
                    type="time"
                    value={meetingTime}
                    onChange={(e) => setMeetingTime(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Link da Reunião
                  </label>
                  <input
                    type="url"
                    value={meetingLink}
                    onChange={(e) => setMeetingLink(e.target.value)}
                    placeholder="Cole o link da videoconferência aqui"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                  {platform && (
                    <p className="text-xs text-slate-500 mt-1">
                      💡 {platform.instructions}
                    </p>
                  )}
                </div>
              </div>

              {/* Seleção de Participantes */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-slate-700">
                    Selecionar Participantes ({selectedCount} selecionados)
                  </label>
                  <button
                    onClick={selectAll}
                    className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                  >
                    {teamMembers.every(m => m.selected) ? 'Desmarcar todos' : 'Selecionar todos'}
                  </button>
                </div>

                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por nome ou função..."
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg mb-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />

                <div className="border border-slate-200 rounded-lg max-h-64 overflow-y-auto">
                  {filteredMembers.map(member => (
                    <label
                      key={member.id}
                      className="flex items-center gap-3 p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0"
                    >
                      <input
                        type="checkbox"
                        checked={member.selected}
                        onChange={() => toggleMemberSelection(member.id)}
                        className="w-5 h-5 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">{member.name}</p>
                        <p className="text-sm text-slate-500">{member.role}</p>
                      </div>
                      <div className="text-right text-xs text-slate-400">
                        <p>{member.phone}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-200 p-6 flex gap-3">
              <button
                onClick={() => setShowNewMeetingModal(false)}
                className="flex-1 px-4 py-3 bg-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-300 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateMeeting}
                className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition flex items-center justify-center gap-2"
              >
                <Send className="w-5 h-5" />
                Criar e Enviar Convites
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast de Link Copiado */}
      {linkCopied && (
        <div className="fixed bottom-6 right-6 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-slide-up">
          <Check className="w-5 h-5" />
          Link copiado!
        </div>
      )}
    </div>
  );
};
