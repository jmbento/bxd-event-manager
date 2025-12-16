import React, { useState, useEffect } from 'react';
import { Calendar, Play, Square, Download, Users, FileText, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../config/supabase';

interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  completed: boolean;
}

interface MeetingRecording {
  id: string;
  title: string;
  date: string;
  duration: number;
  participants: string[];
  transcript?: string;
  summary?: string;
  actionItems?: ActionItem[];
  audioUrl?: string;
}

interface ActionItem {
  what: string;
  why: string;
  when: string;
  responsible: string;
}

export const PlanningView: React.FC = () => {
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [meetings, setMeetings] = useState<MeetingRecording[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [selectedMeeting, setSelectedMeeting] = useState<MeetingRecording | null>(null);
  const [loading, setLoading] = useState(true);

  // Estados para gravação
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [currentRecording, setCurrentRecording] = useState({
    title: '',
    participants: [] as string[],
    participantInput: ''
  });

  useEffect(() => {
    loadTimeline();
    loadMeetings();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording && !isPaused) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording, isPaused]);

  const loadTimeline = async () => {
    try {
      const { data, error } = await supabase
        .from('timeline_events')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;
      setTimeline(data || []);
    } catch (error) {
      console.error('Erro ao carregar timeline:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMeetings = async () => {
    try {
      const { data, error } = await supabase
        .from('meeting_recordings')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      setMeetings(data || []);
    } catch (error) {
      console.error('Erro ao carregar reuniões:', error);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        await saveRecording(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      setAudioChunks(chunks);
      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);
      setRecordingTime(0);
    } catch (error) {
      console.error('Erro ao iniciar gravação:', error);
      alert('Erro ao acessar o microfone. Verifique as permissões do navegador.');
    }
  };

  const pauseRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.pause();
      setIsPaused(true);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'paused') {
      mediaRecorder.resume();
      setIsPaused(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
      setIsPaused(false);
    }
  };

  const saveRecording = async (audioBlob: Blob) => {
    try {
      // Upload do áudio para Supabase Storage
      const fileName = `recording_${Date.now()}.webm`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('meeting-recordings')
        .upload(fileName, audioBlob);

      if (uploadError) throw uploadError;

      // Obter URL pública
      const { data: urlData } = supabase.storage
        .from('meeting-recordings')
        .getPublicUrl(fileName);

      // Simular processamento de IA (em produção, usar API real)
      const transcript = 'Transcrição simulada da reunião...';
      const summary = 'Resumo gerado automaticamente da reunião.';
      const actionItems: ActionItem[] = [
        {
          what: 'Implementar novo módulo',
          why: 'Para melhorar a experiência do usuário',
          when: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          responsible: currentRecording.participants[0] || 'A definir'
        }
      ];

      // Salvar no banco
      const { error: insertError } = await supabase
        .from('meeting_recordings')
        .insert({
          title: currentRecording.title || `Reunião ${new Date().toLocaleDateString()}`,
          date: new Date().toISOString(),
          duration: recordingTime,
          participants: currentRecording.participants,
          transcript,
          summary,
          action_items: actionItems,
          audio_url: urlData.publicUrl
        });

      if (insertError) throw insertError;

      // Limpar estado
      setCurrentRecording({ title: '', participants: [], participantInput: '' });
      setRecordingTime(0);
      await loadMeetings();
      alert('Gravação salva com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar gravação:', error);
      alert('Erro ao salvar gravação. Tente novamente.');
    }
  };

  const addParticipant = () => {
    if (currentRecording.participantInput.trim()) {
      setCurrentRecording(prev => ({
        ...prev,
        participants: [...prev.participants, prev.participantInput.trim()],
        participantInput: ''
      }));
    }
  };

  const removeParticipant = (index: number) => {
    setCurrentRecording(prev => ({
      ...prev,
      participants: prev.participants.filter((_, i) => i !== index)
    }));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const downloadATA = (meeting: MeetingRecording) => {
    const ata = `
# ATA DA REUNIÃO - ${meeting.title}
**Data:** ${new Date(meeting.date).toLocaleDateString('pt-BR')}
**Duração:** ${formatTime(meeting.duration)}

## Participantes
${meeting.participants.map(p => `- ${p}`).join('\n')}

## Resumo
${meeting.summary || 'Sem resumo disponível'}

## Ações Definidas

${meeting.actionItems?.map((item, i) => `
### Ação ${i + 1}
- **O que foi decidido:** ${item.what}
- **O que fazer:** ${item.what}
- **Por que fazer:** ${item.why}
- **Quando fazer:** ${item.when}
- **Responsável:** ${item.responsible}
`).join('\n')}

## Transcrição Completa
${meeting.transcript || 'Transcrição não disponível'}
    `.trim();

    const blob = new Blob([ata], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ata_${meeting.title.replace(/\s+/g, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getEventColor = (date: string) => {
    const eventDate = new Date(date);
    const today = new Date();
    const diff = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diff < 0) return 'bg-gray-400';
    if (diff === 0) return 'bg-blue-500';
    if (diff <= 7) return 'bg-orange-500';
    if (diff <= 30) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando planejamento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Calendar className="text-blue-600" size={32} />
          Planejamento do Evento
        </h1>
        <p className="text-gray-600 mt-2">
          Gerencie a timeline e grave reuniões com IA
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timeline do Evento */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Clock className="text-blue-600" />
            Timeline até o Evento
          </h2>
          
          {timeline.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar size={48} className="mx-auto mb-4 opacity-50" />
              <p>Nenhum marco cadastrado ainda</p>
              <p className="text-sm mt-2">Execute o SQL para criar eventos na timeline</p>
            </div>
          ) : (
            <div className="space-y-3">
              {timeline.map((event, index) => (
                <div key={event.id} className="flex items-start gap-3">
                  <div className={`w-3 h-3 rounded-full mt-1.5 ${getEventColor(event.date)}`} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">{event.title}</h3>
                      <span className="text-sm text-gray-500">
                        {new Date(event.date).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Gravador de Reuniões */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Users className="text-purple-600" />
            Gravar Reunião com IA
          </h2>

          {!isRecording ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título da Reunião
                </label>
                <input
                  type="text"
                  value={currentRecording.title}
                  onChange={(e) => setCurrentRecording(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Ex: Planning Sprint 1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Participantes
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={currentRecording.participantInput}
                    onChange={(e) => setCurrentRecording(prev => ({ ...prev, participantInput: e.target.value }))}
                    onKeyPress={(e) => e.key === 'Enter' && addParticipant()}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Nome do participante"
                  />
                  <button
                    onClick={addParticipant}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Adicionar
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {currentRecording.participants.map((p, i) => (
                    <span key={i} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm flex items-center gap-2">
                      {p}
                      <button onClick={() => removeParticipant(i)} className="hover:text-purple-900">
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={startRecording}
                disabled={!currentRecording.title || currentRecording.participants.length === 0}
                className="w-full py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold"
              >
                <Play size={20} />
                Iniciar Gravação
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center">
                <div className={`text-6xl font-bold ${isPaused ? 'text-yellow-600' : 'text-red-600'}`}>
                  {formatTime(recordingTime)}
                </div>
                <p className="text-gray-600 mt-2">
                  {isPaused ? '⏸ Pausado' : '🔴 Gravando...'}
                </p>
              </div>

              <div className="flex gap-2">
                {!isPaused ? (
                  <button
                    onClick={pauseRecording}
                    className="flex-1 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 flex items-center justify-center gap-2 font-semibold"
                  >
                    Pausar
                  </button>
                ) : (
                  <button
                    onClick={resumeRecording}
                    className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 font-semibold"
                  >
                    Retomar
                  </button>
                )}
                <button
                  onClick={stopRecording}
                  className="flex-1 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 flex items-center justify-center gap-2 font-semibold"
                >
                  <Square size={20} />
                  Parar e Salvar
                </button>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <p className="text-sm text-purple-800">
                  <strong>IA Processando:</strong> Quando parar a gravação, a IA gerará automaticamente:
                </p>
                <ul className="text-sm text-purple-700 mt-2 space-y-1">
                  <li>• Transcrição completa</li>
                  <li>• Resumo executivo</li>
                  <li>• Lista de ações (O quê, Por quê, Quando)</li>
                  <li>• ATA para download</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reuniões Gravadas */}
      <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <FileText className="text-green-600" />
          Reuniões Gravadas
        </h2>

        {meetings.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText size={48} className="mx-auto mb-4 opacity-50" />
            <p>Nenhuma reunião gravada ainda</p>
            <p className="text-sm mt-2">Grave sua primeira reunião usando o gravador acima</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {meetings.map((meeting) => (
              <div key={meeting.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">{meeting.title}</h3>
                  <button
                    onClick={() => downloadATA(meeting)}
                    className="text-blue-600 hover:text-blue-700"
                    title="Baixar ATA"
                  >
                    <Download size={20} />
                  </button>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    {new Date(meeting.date).toLocaleDateString('pt-BR')}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={16} />
                    {formatTime(meeting.duration)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={16} />
                    {meeting.participants.length} participante(s)
                  </div>
                  {meeting.actionItems && meeting.actionItems.length > 0 && (
                    <div className="flex items-center gap-2">
                      <CheckCircle size={16} />
                      {meeting.actionItems.length} ação(ões) definida(s)
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setSelectedMeeting(meeting)}
                  className="mt-4 w-full py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 font-medium"
                >
                  Ver Detalhes
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Detalhes */}
      {selectedMeeting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">{selectedMeeting.title}</h2>
                <button
                  onClick={() => setSelectedMeeting(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Informações</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Data:</span>{' '}
                      <span className="font-medium">{new Date(selectedMeeting.date).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Duração:</span>{' '}
                      <span className="font-medium">{formatTime(selectedMeeting.duration)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Participantes</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedMeeting.participants.map((p, i) => (
                      <span key={i} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>

                {selectedMeeting.summary && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Resumo</h3>
                    <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{selectedMeeting.summary}</p>
                  </div>
                )}

                {selectedMeeting.actionItems && selectedMeeting.actionItems.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Ações Definidas</h3>
                    <div className="space-y-3">
                      {selectedMeeting.actionItems.map((item, i) => (
                        <div key={i} className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-semibold text-green-900">O que:</span>
                              <p className="text-green-800 mt-1">{item.what}</p>
                            </div>
                            <div>
                              <span className="font-semibold text-green-900">Por que:</span>
                              <p className="text-green-800 mt-1">{item.why}</p>
                            </div>
                            <div>
                              <span className="font-semibold text-green-900">Quando:</span>
                              <p className="text-green-800 mt-1">{new Date(item.when).toLocaleDateString('pt-BR')}</p>
                            </div>
                            <div>
                              <span className="font-semibold text-green-900">Responsável:</span>
                              <p className="text-green-800 mt-1">{item.responsible}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedMeeting.transcript && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Transcrição Completa</h3>
                    <div className="bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto">
                      <p className="text-gray-700 text-sm whitespace-pre-wrap">{selectedMeeting.transcript}</p>
                    </div>
                  </div>
                )}

                {selectedMeeting.audioUrl && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Áudio da Reunião</h3>
                    <audio controls className="w-full">
                      <source src={selectedMeeting.audioUrl} type="audio/webm" />
                      Seu navegador não suporta o elemento de áudio.
                    </audio>
                  </div>
                )}

                <div className="flex gap-3 pt-4 border-t">
                  <button
                    onClick={() => downloadATA(selectedMeeting)}
                    className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                  >
                    <Download size={20} />
                    Baixar ATA
                  </button>
                  <button
                    onClick={() => setSelectedMeeting(null)}
                    className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
