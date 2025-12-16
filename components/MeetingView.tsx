import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Play,
  Pause,
  Square,
  Upload,
  FileText,
  Download,
  Eye,
  Edit3,
  Save,
  X,
  Clock,
  Users,
  Calendar,
  Search,
  Filter,
  Plus,
  Trash2,
  RotateCcw,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';

// Tipos
interface Meeting {
  id: string;
  title: string;
  date: string;
  duration: number; // em segundos
  participants: string[];
  audioUrl?: string;
  transcription?: string;
  meetingMinutes?: string;
  status: 'recording' | 'processing' | 'completed' | 'error';
  createdAt: string;
}

interface AudioRecorderState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  audioBlob: Blob | null;
}

const MEETING_TEMPLATE = `## 🎯 1. Auditoria do Propósito
* **Motivação Original:** [Descreva o motivo da reunião]
* **Veredito de Eficiência:** [Sim/Parcialmente/Não] - [Justificativa]

## 📝 2. Pauta Retroativa (O que foi discutido)
* Tópico A
* Tópico B
* Tópico C

## 🔑 3. Decisões e Insights Chave
* Decisão 1
* Insight 1
* Definição 1

## 🚀 4. Plano de Ação (Next Steps)
| Tarefa | Responsável | Prioridade |
| :--- | :--- | :--- |
| [Ação exemplo] | [Nome] | [Alta/Média/Baixa] |

## ⚠️ 5. Pontos de Atenção / Bloqueios
* Ponto de atenção 1
* Bloqueio identificado 1

---
**Transcrição da Reunião:**
[Transcrição será inserida aqui automaticamente]
`;

export const MeetingView: React.FC = () => {
  // Estados
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [showNewMeetingModal, setShowNewMeetingModal] = useState(false);
  const [showMeetingDetails, setShowMeetingDetails] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedMinutes, setEditedMinutes] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Estado do gravador
  const [recorderState, setRecorderState] = useState<AudioRecorderState>({
    isRecording: false,
    isPaused: false,
    duration: 0,
    audioBlob: null,
  });

  // Nova reunião
  const [newMeeting, setNewMeeting] = useState({
    title: '',
    participants: [] as string[],
    participantInput: '',
  });

  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Carregar reuniões do localStorage
  useEffect(() => {
    const savedMeetings = localStorage.getItem('bxd_meetings');
    if (savedMeetings) {
      setMeetings(JSON.parse(savedMeetings));
    }
  }, []);

  // Salvar reuniões no localStorage
  const saveMeetings = (updatedMeetings: Meeting[]) => {
    setMeetings(updatedMeetings);
    localStorage.setItem('bxd_meetings', JSON.stringify(updatedMeetings));
  };

  // Timer para duração da gravação
  useEffect(() => {
    if (recorderState.isRecording && !recorderState.isPaused) {
      timerRef.current = setInterval(() => {
        setRecorderState(prev => ({
          ...prev,
          duration: prev.duration + 1,
        }));
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [recorderState.isRecording, recorderState.isPaused]);

  // Iniciar gravação
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setRecorderState(prev => ({ ...prev, audioBlob }));
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(1000); // Capturar dados a cada segundo

      setRecorderState({
        isRecording: true,
        isPaused: false,
        duration: 0,
        audioBlob: null,
      });
    } catch (error) {
      console.error('Erro ao iniciar gravação:', error);
      alert('Erro ao acessar o microfone. Verifique as permissões.');
    }
  };

  // Pausar/Continuar gravação
  const togglePause = () => {
    if (!mediaRecorderRef.current) return;

    if (recorderState.isPaused) {
      mediaRecorderRef.current.resume();
    } else {
      mediaRecorderRef.current.pause();
    }

    setRecorderState(prev => ({
      ...prev,
      isPaused: !prev.isPaused,
    }));
  };

  // Parar gravação
  const stopRecording = () => {
    if (mediaRecorderRef.current && recorderState.isRecording) {
      mediaRecorderRef.current.stop();
      setRecorderState(prev => ({
        ...prev,
        isRecording: false,
        isPaused: false,
      }));
    }
  };

  // Salvar reunião
  const saveMeeting = async () => {
    if (!newMeeting.title || !recorderState.audioBlob) {
      alert('Preencha o título e grave a reunião');
      return;
    }

    const meeting: Meeting = {
      id: `meeting-${Date.now()}`,
      title: newMeeting.title,
      date: new Date().toISOString().split('T')[0],
      duration: recorderState.duration,
      participants: newMeeting.participants,
      audioUrl: URL.createObjectURL(recorderState.audioBlob),
      status: 'processing',
      createdAt: new Date().toISOString(),
      meetingMinutes: MEETING_TEMPLATE,
    };

    const updatedMeetings = [meeting, ...meetings];
    saveMeetings(updatedMeetings);

    // Simular processamento de IA
    setTimeout(() => {
      const processedMeeting = {
        ...meeting,
        status: 'completed' as const,
        transcription: 'Transcrição será gerada aqui pela IA...',
        meetingMinutes: meeting.meetingMinutes?.replace(
          '[Transcrição será inserida aqui automaticamente]',
          'Transcrição será gerada aqui pela IA...'
        ),
      };
      
      saveMeetings(updatedMeetings.map(m => m.id === meeting.id ? processedMeeting : m));
    }, 3000);

    // Reset
    setRecorderState({
      isRecording: false,
      isPaused: false,
      duration: 0,
      audioBlob: null,
    });
    setNewMeeting({ title: '', participants: [], participantInput: '' });
    setShowNewMeetingModal(false);
  };

  // Upload de áudio
  const handleAudioUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      const audioUrl = URL.createObjectURL(file);
      
      const meeting: Meeting = {
        id: `meeting-${Date.now()}`,
        title: `Reunião Importada - ${new Date().toLocaleDateString()}`,
        date: new Date().toISOString().split('T')[0],
        duration: 0,
        participants: [],
        audioUrl,
        status: 'processing',
        createdAt: new Date().toISOString(),
        meetingMinutes: MEETING_TEMPLATE,
      };

      const updatedMeetings = [meeting, ...meetings];
      saveMeetings(updatedMeetings);

      // Simular processamento
      setTimeout(() => {
        const processedMeeting = {
          ...meeting,
          status: 'completed' as const,
          transcription: 'Transcrição do áudio importado...',
          meetingMinutes: meeting.meetingMinutes?.replace(
            '[Transcrição será inserida aqui automaticamente]',
            'Transcrição do áudio importado...'
          ),
        };
        
        saveMeetings(updatedMeetings.map(m => m.id === meeting.id ? processedMeeting : m));
      }, 2000);
    }
  };

  // Adicionar participante
  const addParticipant = () => {
    const participant = newMeeting.participantInput.trim();
    if (participant && !newMeeting.participants.includes(participant)) {
      setNewMeeting(prev => ({
        ...prev,
        participants: [...prev.participants, participant],
        participantInput: '',
      }));
    }
  };

  // Filtrar reuniões
  const filteredMeetings = meetings.filter(meeting =>
    meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    meeting.participants.some(p => p.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Formatar duração
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Excluir reunião
  const deleteMeeting = (meetingId: string) => {
    if (confirm('Tem certeza que deseja excluir esta reunião?')) {
      const updatedMeetings = meetings.filter(m => m.id !== meetingId);
      saveMeetings(updatedMeetings);
      if (selectedMeeting?.id === meetingId) {
        setSelectedMeeting(null);
        setShowMeetingDetails(false);
      }
    }
  };

  // Exportar ata
  const exportMinutes = (meeting: Meeting) => {
    if (!meeting.meetingMinutes) return;

    const blob = new Blob([meeting.meetingMinutes], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ata-${meeting.title.replace(/\s+/g, '-')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-8 h-8 text-blue-600" />
            Gestão de Reuniões
          </h2>
          <p className="text-slate-600 mt-1">
            Grave, transcreva e gere atas automáticas de reuniões
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition"
          >
            <Upload className="w-4 h-4" />
            Importar Áudio
          </button>
          <button
            onClick={() => setShowNewMeetingModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="w-4 h-4" />
            Nova Reunião
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          onChange={handleAudioUpload}
          className="hidden"
        />
      </div>

      {/* Busca */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar reuniões..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Lista de Reuniões */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            Histórico de Reuniões ({filteredMeetings.length})
          </h3>

          {filteredMeetings.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">Nenhuma reunião encontrada</p>
              <p className="text-sm text-slate-400 mt-1">
                {searchTerm ? 'Tente ajustar sua busca' : 'Grave sua primeira reunião'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredMeetings.map(meeting => (
                <div
                  key={meeting.id}
                  className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-blue-100">
                      {meeting.status === 'processing' ? (
                        <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                      ) : meeting.status === 'completed' ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-amber-600" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-800">{meeting.title}</h4>
                      <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(meeting.date).toLocaleDateString('pt-BR')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDuration(meeting.duration)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {meeting.participants.length} participantes
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedMeeting(meeting);
                        setEditedMinutes(meeting.meetingMinutes || '');
                        setShowMeetingDetails(true);
                      }}
                      className="p-2 text-slate-400 hover:text-blue-600 transition"
                      title="Ver detalhes"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => exportMinutes(meeting)}
                      className="p-2 text-slate-400 hover:text-green-600 transition"
                      title="Exportar ata"
                      disabled={!meeting.meetingMinutes}
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteMeeting(meeting.id)}
                      className="p-2 text-slate-400 hover:text-red-600 transition"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal Nova Reunião */}
      {showNewMeetingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">Nova Reunião</h3>
              <button
                onClick={() => {
                  setShowNewMeetingModal(false);
                  if (recorderState.isRecording) stopRecording();
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Título e Participantes */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Título da Reunião *
                  </label>
                  <input
                    type="text"
                    value={newMeeting.title}
                    onChange={(e) => setNewMeeting(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Ex: Reunião de Planejamento"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Participantes
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newMeeting.participantInput}
                      onChange={(e) => setNewMeeting(prev => ({ ...prev, participantInput: e.target.value }))}
                      onKeyPress={(e) => e.key === 'Enter' && addParticipant()}
                      placeholder="Nome do participante"
                      className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={addParticipant}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {newMeeting.participants.map((participant, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {participant}
                        <button
                          onClick={() => setNewMeeting(prev => ({
                            ...prev,
                            participants: prev.participants.filter((_, i) => i !== index)
                          }))}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Controles de Gravação */}
              <div className="bg-slate-50 rounded-lg p-6">
                <h4 className="text-md font-medium text-slate-800 mb-4">Gravação de Áudio</h4>
                
                <div className="flex items-center justify-center space-x-4">
                  {!recorderState.isRecording ? (
                    <button
                      onClick={startRecording}
                      className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                    >
                      <Mic className="w-5 h-5" />
                      Iniciar Gravação
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={togglePause}
                        className={`flex items-center gap-2 px-4 py-3 rounded-lg transition ${
                          recorderState.isPaused 
                            ? 'bg-green-600 hover:bg-green-700 text-white' 
                            : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                        }`}
                      >
                        {recorderState.isPaused ? (
                          <>
                            <Play className="w-5 h-5" />
                            Continuar
                          </>
                        ) : (
                          <>
                            <Pause className="w-5 h-5" />
                            Pausar
                          </>
                        )}
                      </button>
                      <button
                        onClick={stopRecording}
                        className="flex items-center gap-2 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                      >
                        <Square className="w-5 h-5" />
                        Parar
                      </button>
                    </>
                  )}
                </div>

                {recorderState.isRecording && (
                  <div className="mt-4 text-center">
                    <div className="flex items-center justify-center gap-2 text-lg font-mono">
                      <div className={`w-3 h-3 rounded-full ${recorderState.isPaused ? 'bg-yellow-500' : 'bg-red-500 animate-pulse'}`}></div>
                      {formatDuration(recorderState.duration)}
                    </div>
                    <p className="text-sm text-slate-600 mt-2">
                      {recorderState.isPaused ? 'Gravação pausada' : 'Gravando...'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowNewMeetingModal(false);
                  if (recorderState.isRecording) stopRecording();
                }}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                Cancelar
              </button>
              <button
                onClick={saveMeeting}
                disabled={!newMeeting.title || !recorderState.audioBlob}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                Salvar Reunião
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detalhes da Reunião */}
      {showMeetingDetails && selectedMeeting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-slate-800">{selectedMeeting.title}</h3>
                <p className="text-sm text-slate-600">
                  {new Date(selectedMeeting.date).toLocaleDateString('pt-BR')} • {formatDuration(selectedMeeting.duration)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                  >
                    <Edit3 className="w-4 h-4" />
                    Editar Ata
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      const updatedMeetings = meetings.map(m => 
                        m.id === selectedMeeting.id 
                          ? { ...m, meetingMinutes: editedMinutes }
                          : m
                      );
                      saveMeetings(updatedMeetings);
                      setSelectedMeeting({ ...selectedMeeting, meetingMinutes: editedMinutes });
                      setIsEditing(false);
                    }}
                    className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
                  >
                    <Save className="w-4 h-4" />
                    Salvar
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowMeetingDetails(false);
                    setIsEditing(false);
                  }}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {isEditing ? (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Ata da Reunião (Markdown)
                  </label>
                  <textarea
                    value={editedMinutes}
                    onChange={(e) => setEditedMinutes(e.target.value)}
                    rows={20}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                    placeholder="Digite a ata da reunião em Markdown..."
                  />
                </div>
              ) : (
                <div className="prose max-w-none">
                  <div className="bg-slate-50 rounded-lg p-4 whitespace-pre-wrap font-mono text-sm">
                    {selectedMeeting.meetingMinutes || 'Ata ainda não gerada'}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => exportMinutes(selectedMeeting)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                <Download className="w-4 h-4" />
                Exportar Ata
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingView;