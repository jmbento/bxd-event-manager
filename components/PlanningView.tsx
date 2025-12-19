import React, { useState, useEffect, useRef } from 'react';
import { 
  Calendar, Play, Pause, Square, Save, FileText, Users, Clock, 
  AlertTriangle, CheckCircle, Edit2, Trash2, Download, Send,
  Plus, X, Mic, Brain, Eye, Lock, Unlock
} from 'lucide-react';
import { PageBanner } from './PageBanner';

interface MeetingMinute {
  id: string;
  meetingNumber: number;
  eventName: string;
  date: string;
  duration: number; // em minutos
  audioBlob?: Blob;
  audioUrl?: string;
  transcript?: string;
  status: 'recording' | 'processing' | 'completed';
  
  // Análise da IA
  summary: {
    whatWeDid: string[]; // O que já fizemos
    whatToDo: string[]; // O que precisamos fazer
    howToDo: string[]; // Como vamos fazer
    whenToDo: {task: string; deadline: string; responsible: string}[]; // Quando vamos fazer
  };
  
  // Metadados
  participants: string[];
  responsible: string;
  sentTo: string[];
  accessAuthorizations: string[]; // Quem pode ouvir a gravação
  created_at: string;
  updated_at: string;
}

interface Task {
  id: string;
  title: string;
  category: 'emergencia' | 'urgente' | 'terceiros' | 'documental' | 'normal';
  deadline: string;
  responsible: string;
  status: 'pendente' | 'em-andamento' | 'concluida' | 'atrasada';
  description?: string;
  checklist: {id: string; text: string; completed: boolean}[];
  meetingId?: string; // Referência à reunião que gerou
  created_at: string;
}

const categoryLabels = {
  emergencia: 'Emergência',
  urgente: 'Urgente',
  terceiros: 'Depende de Terceiros',
  documental: 'Documental',
  normal: 'Normal'
};

const categoryColors = {
  emergencia: 'bg-red-100 text-red-700 border-red-300',
  urgente: 'bg-orange-100 text-orange-700 border-orange-300',
  terceiros: 'bg-purple-100 text-purple-700 border-purple-300',
  documental: 'bg-blue-100 text-blue-700 border-blue-300',
  normal: 'bg-slate-100 text-slate-700 border-slate-300'
};

const statusColors = {
  pendente: 'bg-slate-100 text-slate-700',
  'em-andamento': 'bg-blue-100 text-blue-700',
  concluida: 'bg-green-100 text-green-700',
  atrasada: 'bg-red-100 text-red-700'
};

export const PlanningView: React.FC<{profile: {eventName: string}}> = ({ profile }) => {
  const [activeTab, setActiveTab] = useState<'meetings' | 'tasks'>('meetings');
  const [meetings, setMeetings] = useState<MeetingMinute[]>(() => {
    const saved = localStorage.getItem('planning_meetings');
    return saved ? JSON.parse(saved) : [];
  });
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('planning_tasks');
    return saved ? JSON.parse(saved) : [];
  });
  
  // Estados de gravação
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [currentMeeting, setCurrentMeeting] = useState<MeetingMinute | null>(null);
  
  // Modais
  const [selectedMeeting, setSelectedMeeting] = useState<MeetingMinute | null>(null);
  
  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    localStorage.setItem('planning_meetings', JSON.stringify(meetings));
  }, [meetings]);
  
  useEffect(() => {
    localStorage.setItem('planning_tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Atualizar status de tarefas atrasadas
  useEffect(() => {
    const checkDeadlines = () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      setTasks(prev => prev.map(task => {
        const deadline = new Date(task.deadline);
        deadline.setHours(0, 0, 0, 0);
        
        if (deadline < today && task.status !== 'concluida' && task.status !== 'atrasada') {
          return { ...task, status: 'atrasada' };
        }
        return task;
      }));
    };
    
    checkDeadlines();
    const interval = setInterval(checkDeadlines, 60000);
    return () => clearInterval(interval);
  }, []);

  // Timer de gravação
  useEffect(() => {
    if (isRecording && !isPaused) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording, isPaused]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

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

      mediaRecorder.start();
      setIsRecording(true);
      setIsPaused(false);
      setRecordingTime(0);
      
      // Criar reunião temporária
      const newMeeting: MeetingMinute = {
        id: 'temp-' + Date.now(),
        meetingNumber: meetings.length + 1,
        eventName: profile.eventName,
        date: new Date().toISOString(),
        duration: 0,
        status: 'recording',
        summary: {
          whatWeDid: [],
          whatToDo: [],
          howToDo: [],
          whenToDo: []
        },
        participants: [],
        responsible: '',
        sentTo: [],
        accessAuthorizations: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setCurrentMeeting(newMeeting);
    } catch (error) {
      console.error('Erro ao iniciar gravação:', error);
      alert('Erro ao acessar o microfone. Verifique as permissões.');
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        setIsPaused(false);
      } else {
        mediaRecorderRef.current.pause();
        setIsPaused(true);
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        if (currentMeeting) {
          const finalMeeting: MeetingMinute = {
            ...currentMeeting,
            id: 'm-' + Date.now(),
            duration: Math.floor(recordingTime / 60),
            audioBlob,
            audioUrl,
            status: 'processing'
          };
          
          // Simular processamento de IA
          setTimeout(() => {
            const processedMeeting = {
              ...finalMeeting,
              status: 'completed' as const,
              transcript: 'Transcrição simulada da reunião...',
              summary: {
                whatWeDid: [
                  'Definição do layout do evento',
                  'Contratação de fornecedor de som',
                  'Aprovação do budget de marketing'
                ],
                whatToDo: [
                  'Fechar contrato com catering',
                  'Confirmar lineup completo',
                  'Enviar material gráfico para gráfica',
                  'Solicitar alvarás na prefeitura'
                ],
                howToDo: [
                  'Catering: contato via João (fornecedor indicado)',
                  'Lineup: aguardar retorno dos 3 artistas faltantes',
                  'Gráfica: enviar via email com briefing atualizado',
                  'Alvarás: agendar reunião presencial no setor de eventos'
                ],
                whenToDo: [
                  { task: 'Fechar catering', deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], responsible: 'Maria Silva' },
                  { task: 'Confirmar lineup', deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], responsible: 'Pedro Santos' },
                  { task: 'Enviar material gráfico', deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], responsible: 'Ana Costa' },
                  { task: 'Alvarás', deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], responsible: 'Carlos Souza' }
                ]
              }
            };
            
            setMeetings(prev => [processedMeeting, ...prev]);
            
            // Auto-criar tarefas baseadas no "Quando vamos fazer"
            const newTasks: Task[] = processedMeeting.summary.whenToDo.map((item, index) => ({
              id: 't-' + Date.now() + '-' + index,
              title: item.task,
              category: 'normal' as const,
              deadline: item.deadline,
              responsible: item.responsible,
              status: 'pendente' as const,
              checklist: [],
              meetingId: processedMeeting.id,
              created_at: new Date().toISOString()
            }));
            
            setTasks(prev => [...newTasks, ...prev]);
          }, 3000);
        }
        
        // Limpar estado
        mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop());
        setIsRecording(false);
        setIsPaused(false);
        setRecordingTime(0);
        setCurrentMeeting(null);
      };
    }
  };

  const handleSendMinutes = (meetingId: string) => {
    const meeting = meetings.find(m => m.id === meetingId);
    if (!meeting) return;
    
    const recipients = prompt('Digite os emails dos destinatários (separados por vírgula):');
    if (recipients) {
      const emailList = recipients.split(',').map(e => e.trim());
      setMeetings(prev => prev.map(m => 
        m.id === meetingId 
          ? { ...m, sentTo: [...m.sentTo, ...emailList], updated_at: new Date().toISOString() }
          : m
      ));
      alert(`Ata enviada para ${emailList.length} destinatário(s)!`);
    }
  };

  const handleAuthorizeAccess = (meetingId: string) => {
    const meeting = meetings.find(m => m.id === meetingId);
    if (!meeting) return;
    
    const user = prompt('Digite o email do usuário para autorizar acesso à gravação:');
    if (user) {
      setMeetings(prev => prev.map(m => 
        m.id === meetingId 
          ? { ...m, accessAuthorizations: [...m.accessAuthorizations, user], updated_at: new Date().toISOString() }
          : m
      ));
      alert(`Acesso autorizado para ${user}`);
    }
  };

  const handleUpdateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, ...updates } : t
    ));
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    const categoryPriority = { emergencia: 1, urgente: 2, terceiros: 3, documental: 4, normal: 5 };
    const aPriority = categoryPriority[a.category];
    const bPriority = categoryPriority[b.category];
    
    if (aPriority !== bPriority) return aPriority - bPriority;
    return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
  });

  const stats = {
    totalMeetings: meetings.length,
    totalTasks: tasks.length,
    pendingTasks: tasks.filter(t => t.status === 'pendente' || t.status === 'em-andamento').length,
    overdueTasks: tasks.filter(t => t.status === 'atrasada').length
  };

  return (
    <div className="space-y-6">
      <PageBanner pageKey="planning" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-7 h-7 text-blue-600" />
            Planejamento & Reuniões
          </h1>
          <p className="text-slate-500 mt-1">
            Gestão de reuniões com IA e controle de tarefas
          </p>
        </div>
      </div>

      {/* Gravador de Reunião - DESTAQUE */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-2xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <Mic className={`w-6 h-6 ${isRecording ? 'animate-pulse' : ''}`} />
              Gravação de Reunião
            </h2>
            <p className="text-blue-100 mb-4">
              {isRecording 
                ? (isPaused ? 'Gravação pausada' : 'Gravando...') 
                : 'Inicie a gravação da reunião para gerar ata automática'
              }
            </p>
            {isRecording && (
              <div className="flex items-center gap-4">
                <div className="text-4xl font-mono font-bold">{formatTime(recordingTime)}</div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${isPaused ? 'bg-orange-400' : 'bg-red-500 animate-pulse'}`} />
                  <span className="text-sm">{isPaused ? 'Pausado' : 'Rec'}</span>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex gap-3">
            {!isRecording ? (
              <button
                onClick={startRecording}
                className="px-8 py-4 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition flex items-center gap-2 shadow-lg"
              >
                <Play className="w-6 h-6" />
                Iniciar Gravação
              </button>
            ) : (
              <>
                <button
                  onClick={pauseRecording}
                  className="px-6 py-4 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-xl font-semibold transition flex items-center gap-2"
                >
                  {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                  {isPaused ? 'Retomar' : 'Pausar'}
                </button>
                <button
                  onClick={stopRecording}
                  className="px-6 py-4 bg-red-500 hover:bg-red-600 rounded-xl font-semibold transition flex items-center gap-2"
                >
                  <Square className="w-5 h-5" />
                  Parar e Salvar
                </button>
              </>
            )}
          </div>
        </div>
        
        {isRecording && currentMeeting && (
          <div className="mt-4 pt-4 border-t border-white/20">
            <p className="text-sm text-blue-100">
              <Brain className="w-4 h-4 inline mr-1" />
              Ao parar, a IA analisará a reunião e gerará a ata automaticamente
            </p>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-600">Reuniões</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats.totalMeetings}</p>
        </div>
        
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-600">Tarefas Total</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats.totalTasks}</p>
        </div>
        
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-orange-500" />
            <span className="text-sm text-slate-600">Pendentes</span>
          </div>
          <p className="text-2xl font-bold text-orange-600">{stats.pendingTasks}</p>
        </div>
        
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <span className="text-sm text-slate-600">Atrasadas</span>
          </div>
          <p className="text-2xl font-bold text-red-600">{stats.overdueTasks}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-slate-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('meetings')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition flex items-center gap-2 ${
            activeTab === 'meetings'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          Atas de Reuniões
        </button>
        <button
          onClick={() => setActiveTab('tasks')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition flex items-center gap-2 ${
            activeTab === 'tasks'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <CheckCircle className="w-4 h-4" />
          Tarefas & Checklist
        </button>
      </div>

      {/* Tab: Reuniões */}
      {activeTab === 'meetings' && (
        <div className="space-y-4">
          {meetings.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p className="text-slate-500 mb-1">Nenhuma reunião gravada</p>
              <p className="text-sm text-slate-400">Inicie uma gravação para gerar atas automáticas</p>
            </div>
          ) : (
            meetings.map((meeting) => (
              <div key={meeting.id} className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-semibold">
                        Reunião #{meeting.meetingNumber}
                      </span>
                      <span className="text-sm text-slate-500">
                        {new Date(meeting.date).toLocaleDateString('pt-BR', { 
                          day: '2-digit', 
                          month: 'long', 
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      <span className="text-xs text-slate-400">• {meeting.duration} min</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">{meeting.eventName}</h3>
                    
                    {meeting.status === 'processing' && (
                      <div className="mt-3 flex items-center gap-2 text-blue-600">
                        <Brain className="w-4 h-4 animate-pulse" />
                        <span className="text-sm">IA processando reunião...</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedMeeting(meeting)}
                      className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Ver detalhes"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    {meeting.status === 'completed' && (
                      <>
                        <button
                          onClick={() => handleSendMinutes(meeting.id)}
                          className="p-2 text-slate-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition"
                          title="Enviar ata"
                        >
                          <Send className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleAuthorizeAccess(meeting.id)}
                          className="p-2 text-slate-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition"
                          title="Autorizar acesso à gravação"
                        >
                          <Lock className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
                
                {meeting.status === 'completed' && meeting.summary && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <h4 className="font-semibold text-green-900 mb-2 text-sm">✅ O que já fizemos</h4>
                      <ul className="text-sm text-green-800 space-y-1">
                        {meeting.summary.whatWeDid.slice(0, 2).map((item, i) => (
                          <li key={i}>• {item}</li>
                        ))}
                        {meeting.summary.whatWeDid.length > 2 && (
                          <li className="text-xs text-green-600">+ {meeting.summary.whatWeDid.length - 2} mais</li>
                        )}
                      </ul>
                    </div>
                    
                    <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                      <h4 className="font-semibold text-orange-900 mb-2 text-sm">📋 O que precisamos fazer</h4>
                      <ul className="text-sm text-orange-800 space-y-1">
                        {meeting.summary.whatToDo.slice(0, 2).map((item, i) => (
                          <li key={i}>• {item}</li>
                        ))}
                        {meeting.summary.whatToDo.length > 2 && (
                          <li className="text-xs text-orange-600">+ {meeting.summary.whatToDo.length - 2} mais</li>
                        )}
                      </ul>
                    </div>
                  </div>
                )}
                
                {meeting.sentTo.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-200 flex items-center gap-2 text-sm text-slate-600">
                    <Send className="w-4 h-4" />
                    <span>Enviado para {meeting.sentTo.length} destinatário(s)</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab: Tarefas */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          {sortedTasks.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <CheckCircle className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p className="text-slate-500 mb-1">Nenhuma tarefa cadastrada</p>
              <p className="text-sm text-slate-400">Tarefas são criadas automaticamente pelas reuniões</p>
            </div>
          ) : (
            sortedTasks.map((task) => {
              const deadline = new Date(task.deadline);
              const today = new Date();
              const diffDays = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
              const isUrgent = diffDays >= 0 && diffDays <= 3;
              
              return (
                <div key={task.id} className={`bg-white rounded-xl border-2 p-5 hover:shadow-md transition ${categoryColors[task.category]}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs px-2 py-1 rounded-full font-semibold ${categoryColors[task.category]}`}>
                          {categoryLabels[task.category]}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[task.status]}`}>
                          {task.status}
                        </span>
                        {task.meetingId && (
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                            Da reunião
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">{task.title}</h3>
                      {task.description && (
                        <p className="text-sm text-slate-600 mt-1">{task.description}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm mb-3">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-700">{task.responsible}</span>
                    </div>
                    <div className={`flex items-center gap-1 ${isUrgent && task.status !== 'concluida' ? 'text-orange-600 font-semibold' : 'text-slate-700'}`}>
                      <Clock className="w-4 h-4" />
                      <span>{deadline.toLocaleDateString('pt-BR')}</span>
                      {isUrgent && task.status !== 'concluida' && (
                        <span className="text-xs ml-1">
                          ({diffDays === 0 ? 'Hoje!' : diffDays === 1 ? 'Amanhã' : `${diffDays} dias`})
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {task.checklist.length > 0 && (
                    <div className="bg-slate-50 rounded-lg p-3 space-y-2">
                      {task.checklist.map((item) => (
                        <label key={item.id} className="flex items-center gap-2 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={item.completed}
                            onChange={() => {
                              handleUpdateTask(task.id, {
                                checklist: task.checklist.map(c => 
                                  c.id === item.id ? { ...c, completed: !c.completed } : c
                                )
                              });
                            }}
                            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className={`text-sm ${item.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                            {item.text}
                          </span>
                        </label>
                      ))}
                      <div className="pt-2 border-t border-slate-200">
                        <span className="text-xs text-slate-500">
                          {task.checklist.filter(c => c.completed).length} de {task.checklist.length} concluídos
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Modal de Detalhes da Reunião */}
      {selectedMeeting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  Reunião #{selectedMeeting.meetingNumber} - {selectedMeeting.eventName}
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  {new Date(selectedMeeting.date).toLocaleDateString('pt-BR', { 
                    day: '2-digit', 
                    month: 'long', 
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <button
                onClick={() => setSelectedMeeting(null)}
                className="text-slate-400 hover:text-slate-600"
                title="Fechar"
                aria-label="Fechar detalhes"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {selectedMeeting.audioUrl && (
                <div className="bg-slate-50 rounded-lg p-4">
                  <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <Mic className="w-5 h-5 text-blue-600" />
                    Gravação da Reunião
                  </h4>
                  <audio controls className="w-full" src={selectedMeeting.audioUrl} />
                  {selectedMeeting.accessAuthorizations.length > 0 && (
                    <p className="text-xs text-slate-500 mt-2">
                      Acesso autorizado para: {selectedMeeting.accessAuthorizations.join(', ')}
                    </p>
                  )}
                </div>
              )}
              
              {selectedMeeting.summary && (
                <>
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <h4 className="font-semibold text-green-900 mb-3">✅ O que já fizemos</h4>
                    <ul className="space-y-2">
                      {selectedMeeting.summary.whatWeDid.map((item, i) => (
                        <li key={i} className="text-sm text-green-800 flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                    <h4 className="font-semibold text-orange-900 mb-3">📋 O que precisamos fazer</h4>
                    <ul className="space-y-2">
                      {selectedMeeting.summary.whatToDo.map((item, i) => (
                        <li key={i} className="text-sm text-orange-800 flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <h4 className="font-semibold text-blue-900 mb-3">🔧 Como vamos fazer</h4>
                    <ul className="space-y-2">
                      {selectedMeeting.summary.howToDo.map((item, i) => (
                        <li key={i} className="text-sm text-blue-800 flex items-start gap-2">
                          <span className="font-bold flex-shrink-0">{i + 1}.</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <h4 className="font-semibold text-purple-900 mb-3">⏰ Quando vamos fazer</h4>
                    <div className="space-y-3">
                      {selectedMeeting.summary.whenToDo.map((item, i) => (
                        <div key={i} className="bg-white rounded-lg p-3 border border-purple-200">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-purple-900">{item.task}</p>
                            <span className="text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded-full">
                              {new Date(item.deadline).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                          <p className="text-xs text-purple-700 mt-1">Responsável: {item.responsible}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
