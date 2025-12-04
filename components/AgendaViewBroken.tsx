
import React, { useState } from 'react';
import { CalendarEvent, InventoryItem, EventType, EventLogistics, WeatherCondition } from '../types';
import { 
  MapPin, Clock, Truck, Users, Plus, AlertTriangle, Share2, ExternalLink, 
  Map as MapIcon, CloudRain, Sun, Cloud, CloudLightning, FileText, CheckSquare, ShieldAlert,
  Music, Mic, Volume2, Zap, RotateCcw, Radio, Download, AlertCircle, Gauge
} from 'lucide-react';

interface Props {
  events: CalendarEvent[];
  inventory: InventoryItem[];
  onAddEvent: (event: Omit<CalendarEvent, 'id' | 'status'>, autoResources: boolean) => void;
}

export const AgendaView: React.FC<Props> = ({ events, inventory, onAddEvent }) => {
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'logistics'>('info');
  
  // Form State
  const [selectedStage, setSelectedStage] = useState('Palco Principal');
  const [viewMode, setViewMode] = useState<'timeline' | 'gantt'>('timeline');
  const [curfewTime, setCurfewTime] = useState('02:00');

  const stages = [
    { id: 'main', name: 'Palco Principal', color: 'bg-red-500' },
    { id: 'secondary', name: 'Palco Secundário', color: 'bg-blue-500' },
    { id: 'electronic', name: 'Tenda Eletrônica', color: 'bg-purple-500' },
    { id: 'acoustic', name: 'Palco Acústico', color: 'bg-green-500' }
  ];

  const operationalTypes = [
    { id: 'loadin', label: 'Load-in', color: 'bg-orange-500', icon: Truck, description: 'Entrada de equipamentos' },
    { id: 'soundcheck', label: 'Soundcheck', color: 'bg-yellow-500', icon: Volume2, description: 'Passagem de som (CRÍTICO)' },
    { id: 'linecheck', label: 'Line Check', color: 'bg-cyan-500', icon: Mic, description: 'Teste rápido pré-show' },
    { id: 'changeover', label: 'Changeover', color: 'bg-red-500', icon: RotateCcw, description: 'Troca de palco (TENSO)' },
    { id: 'showtime', label: 'Showtime', color: 'bg-emerald-500', icon: Music, description: 'SHOW (Valendo!)' }
  ];

  const [newEvent, setNewEvent] = useState({
    title: '',
    artist: '',
    startTime: '',
    endTime: '',
    stage: 'Palco Principal',
    type: 'showtime' as string,
    duration: 60
  });

  const [newLogistics, setNewLogistics] = useState<EventLogistics>({
    vehicles: [],
    staffCount: 5,
    dietaryRestrictions: true, // Defaulting to true as per user preference (Vegetarian)
    fuelEstimatedLiters: 10,
    materials: [],
    permitsChecked: false,
  });

  const [complianceCheck, setComplianceCheck] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!complianceCheck) {
      alert('Confirme o checklist de segurança e catering antes de salvar.');
        return;
    }
    
    onAddEvent({
        ...newEvent,
        logistics: newLogistics,
        weather: getRandomWeather() // Mock weather for the demo
    }, true);
    
    setShowModal(false);
    resetForm();
  };

  const resetForm = () => {
    setNewEvent({ title: '', date: new Date().toISOString().split('T')[0], location: '', type: 'show' });
    setNewLogistics({ vehicles: [], staffCount: 5, dietaryRestrictions: true, fuelEstimatedLiters: 10, materials: [], permitsChecked: false });
    setComplianceCheck(false);
    setActiveTab('info');
  };

  const getRandomWeather = (): WeatherCondition => {
      const weathers: WeatherCondition[] = ['sunny', 'cloudy', 'rain', 'sunny', 'sunny'];
      return weathers[Math.floor(Math.random() * weathers.length)];
  };

  const getWeatherIcon = (w?: WeatherCondition) => {
      switch(w) {
          case 'rain': return <CloudRain className="w-5 h-5 text-blue-400" />;
          case 'storm': return <CloudLightning className="w-5 h-5 text-purple-500" />;
          case 'cloudy': return <Cloud className="w-5 h-5 text-slate-400" />;
          default: return <Sun className="w-5 h-5 text-amber-500" />;
      }
  };

  const pendingEvents = events.filter(e => e.status === 'pending');
  const apiKey = process.env.API_KEY || '';

  const getGoogleMapsLink = (location: string) => 
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;

  const getStaticMapUrl = (location: string) => 
    `https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent(location)}&zoom=15&size=600x300&maptype=roadmap&markers=color:red%7C${encodeURIComponent(location)}&key=${apiKey}`;

  const handleShareWhatsApp = (evt: CalendarEvent) => {
    const dateStr = new Date(evt.date).toLocaleDateString('pt-BR');
    const mapsLink = getGoogleMapsLink(evt.location);
    
    // Constructing a professional campaign message
    const message = `🎤 *Produção Aurora Live — ${evt.title.toUpperCase()}*\n\n` +
            `🗓 *Data:* ${dateStr}\n` +
            `⏰ *Janela:* 09:00h\n` +
            `📍 *Local:* ${evt.location}\n\n` +
            `🚨 _Confirme presença na operação._\n\n` +
            `🗺 *Referência no mapa:* \n${mapsLink}`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
  };

  const generatePMNotification = (evt: CalendarEvent) => {
    const text = `
COMUNICAÇÃO DE EVENTO
Para: Secretaria Municipal de Eventos / Órgãos de Segurança

Prezados(as),

Informamos a realização da seguinte atividade cultural para fins de autorização e suporte operacional:

PRODUÇÃO: ${evt.type.toUpperCase()}
DATA: ${new Date(evt.date).toLocaleDateString('pt-BR')}
LOCAL: ${evt.location}
JANELA OPERACIONAL: 09:00 - 13:00

Responsável: Núcleo de Operações Aurora Live
CNPJ: 45.987.321/0001-12

Solicitamos confirmação da autorização e orientações adicionais.
    `;

    alert('Comunicação gerada para envio aos órgãos competentes.\n\n' + text);
  };

  const toggleVehicle = (vehicle: string) => {
      setNewLogistics(prev => ({
          ...prev,
          vehicles: prev.vehicles.includes(vehicle) 
            ? prev.vehicles.filter(v => v !== vehicle)
            : [...prev.vehicles, vehicle]
      }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
      {/* List Column */}
      <div className="lg:col-span-2 space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Radio className="w-6 h-6 text-red-500" />
            <div>
              <h2 className="text-xl font-bold text-slate-800">Running Order & Cronograma</h2>
              <p className="text-sm text-slate-500">A bíblia da operação - Timeline por Palco</p>
            </div>
          </div>
            <button 
                onClick={() => setShowModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
            >
                <Plus className="w-4 h-4" />
                Nova Entrada
            </button>
        </div>

        {/* Controles do Running Order */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-2">
              {stages.map(stage => (
                <button
                  key={stage.id}
                  onClick={() => setSelectedStage(stage.name)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedStage === stage.name
                      ? `${stage.color} text-white`
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {stage.name}
                </button>
              ))}
            </div>
            
            {/* Curfew Warning */}
            <div className="flex items-center gap-2 bg-red-50 text-red-700 px-3 py-2 rounded-lg border border-red-200">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-bold">CURFEW: {curfewTime}h</span>
            </div>
          </div>
          
          {/* Botões de Ação */}
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-3 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-900">
              <Download className="w-4 h-4" />
              Exportar PDF de Bolso
            </button>
            <button className="flex items-center gap-2 px-3 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600">
              <AlertTriangle className="w-4 h-4" />
              Verificar Clash
            </button>
          </div>
        </div>

        {/* Timeline do Palco Selecionado */}
        <div className="space-y-2">
            {pendingEvents.length === 0 && (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-400">
                    Nenhum evento agendado.
                </div>
            )}
            {pendingEvents.map((evt) => (
                <div key={evt.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-6 group hover:border-blue-300 transition-all relative overflow-hidden">
                    
                    {/* Weather Strip */}
                    <div className="absolute top-0 right-0 p-2 bg-slate-50 rounded-bl-xl border-l border-b border-slate-100 flex items-center gap-2" title="Previsão do Tempo">
                         <span className="text-[10px] text-slate-500 font-medium">Previsão:</span>
                         {getWeatherIcon(evt.weather)}
                    </div>

                    {/* Left: Info */}
                    <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                             <div className="flex items-center gap-3">
                                <div className="flex flex-col items-center justify-center bg-blue-50 text-blue-700 p-2 rounded-lg min-w-[60px]">
                                    <span className="text-[10px] font-bold uppercase">{new Date(evt.date).toLocaleDateString('pt-BR', { month: 'short' })}</span>
                                    <span className="text-xl font-bold">{new Date(evt.date).getDate() + 1}</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 text-lg">{evt.title}</h3>
                                    <span
                                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                                        evt.type === 'show' || evt.type === 'ensaio'
                                          ? 'bg-rose-50 text-rose-600 border-rose-100'
                                          : evt.type === 'painel' || evt.type === 'palestra' || evt.type === 'workshop'
                                          ? 'bg-blue-50 text-blue-600 border-blue-100'
                                          : evt.type === 'digital'
                                          ? 'bg-purple-50 text-purple-600 border-purple-100'
                                          : evt.type === 'logistica' || evt.type === 'backstage'
                                          ? 'bg-slate-200 text-slate-700 border-slate-300'
                                          : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                      }`}
                                    >
                                        {evt.type}
                                    </span>
                                </div>
                             </div>
                        </div>

            {/* Timeline Entries */}
            {[...Array(12)].map((_, i) => {
              const hour = 14 + i; // Começa às 14h
              const timeStr = `${hour.toString().padStart(2, '0')}:00`;
              const isCurfewZone = hour >= parseInt(curfewTime.split(':')[0]);
              
              return (
                <div key={i} className={`flex items-center gap-4 py-3 border-l-4 pl-4 relative ${
                  isCurfewZone ? 'border-red-500 bg-red-50/30' : 'border-slate-200'
                }`}>
                  {/* Horário */}
                  <div className={`w-12 text-sm font-bold ${
                    isCurfewZone ? 'text-red-600' : 'text-slate-600'
                  }`}>
                    {timeStr}
                  </div>
                  
                  {/* Bloco Operacional */}
                  {i % 3 === 0 && ( // Mock: alguns horários têm eventos
                    <div className="flex-1 bg-white rounded-lg border-2 border-l-4 border-l-emerald-500 p-4 shadow-sm hover:shadow-md transition-all group">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                            <Music className="w-4 h-4 text-emerald-600" />
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-800">Alok - Main Set</h3>
                            <span className="text-xs text-emerald-600 font-bold uppercase px-2 py-0.5 bg-emerald-50 rounded border border-emerald-200">
                              SHOWTIME - 90min
                            </span>
                          </div>
                        </div>
                        
                        {/* Status Indicators */}
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full" title="Load-in OK"></div>
                          <div className="w-2 h-2 bg-emerald-500 rounded-full" title="Soundcheck OK"></div>
                          <div className="w-2 h-2 bg-amber-500 rounded-full" title="Line Check Pendente"></div>
                        </div>
                      </div>
                      
                      {/* Detalhes Operacionais */}
                      <div className="grid grid-cols-3 gap-4 text-xs">
                        <div className="flex items-center gap-1 text-slate-600">
                          <Clock className="w-3 h-3" />
                          {timeStr} - {(hour + 1.5).toString().split('.')[0]}:{(hour + 1.5).toString().split('.')[1] ? '30' : '00'}
                        </div>
                        <div className="flex items-center gap-1 text-slate-600">
                          <Users className="w-3 h-3" />
                          Crew: 8 pessoas
                        </div>
                        <div className="flex items-center gap-1 text-slate-600">
                          <Gauge className="w-3 h-3" />
                          BPM: 128-132
                        </div>
                      </div>
                      
                      {/* Ações Rápidas */}
                      <div className="flex gap-2 mt-3">
                        <button className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded font-medium hover:bg-blue-100">
                          Rider Técnico
                        </button>
                        <button className="text-xs px-2 py-1 bg-green-50 text-green-600 rounded font-medium hover:bg-green-100">
                          Contato Manager
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Changeover Blocks */}
                  {i % 3 === 1 && i > 0 && (
                    <div className="flex-1">
                      <div className="bg-red-50 border-2 border-red-200 border-dashed rounded-lg p-3">
                        <div className="flex items-center gap-2 text-red-700">
                          <RotateCcw className="w-4 h-4" />
                          <span className="font-bold text-sm">CHANGEOVER - 30min</span>
                          <span className="text-xs bg-red-100 px-2 py-0.5 rounded font-medium">
                            MOMENTO MAIS TENSO
                          </span>
                        </div>
                        <p className="text-xs text-red-600 mt-1">
                          Desmontagem + Montagem | Crew: 12 pessoas
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* Empty Slot */}
                  {i % 3 === 2 && (
                    <div className="flex-1 opacity-30">
                      <div className="bg-slate-50 border border-dashed border-slate-200 rounded-lg p-3 text-center">
                        <span className="text-xs text-slate-400">Horário Livre</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </div>
      </div>

      {/* Painel de Controle Operacional */}
      <div className="space-y-4">
        {/* Status dos Palcos */}
        <div className="bg-slate-800 rounded-xl p-6 text-white">
          <h3 className="font-bold mb-4 flex items-center gap-2">
              <Radio className="w-5 h-5 text-red-400" />
              Status dos Palcos
          </h3>
          
          <div className="space-y-3">
            {stages.map(stage => (
              <div key={stage.id} className="bg-slate-700/50 rounded-lg p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">{stage.name}</span>
                  <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                </div>
                <div className="text-xs text-slate-300 space-y-1">
                  <div className="flex justify-between">
                    <span>Próximo:</span>
                    <span>Alok 21:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Crew:</span>
                    <span>8/12 no local</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alertas Críticos */}
        <div className="bg-red-900 rounded-xl p-6 text-white border-2 border-red-500">
          <h3 className="font-bold mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              Alertas Críticos
          </h3>
          
          <div className="space-y-2 text-sm">
            <div className="bg-red-800/50 rounded p-2">
              <span className="font-bold">⚠️ CLASH DETECTADO!</span>
              <p className="text-xs text-red-200 mt-1">
                Vintage Culture e Alok no mesmo horário (21:00)
              </p>
            </div>
            <div className="bg-amber-800/50 rounded p-2">
              <span className="font-bold">🕐 CURFEW RISK</span>
              <p className="text-xs text-amber-200 mt-1">
                Show do Alok pode ultrapassar 02:00h
              </p>
            </div>
          </div>
        </div>

        {/* Ferramentas Rápidas */}
        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <h3 className="font-bold mb-4 flex items-center gap-2 text-slate-800">
              <FileText className="w-5 h-5 text-blue-500" />
              Ferramentas
          </h3>
          
          <div className="space-y-2">
            <button className="w-full text-left px-3 py-2 bg-slate-800 text-white rounded text-sm font-medium hover:bg-slate-900 flex items-center gap-2">
              <Download className="w-4 h-4" />
              PDF de Bolso
            </button>
            <button className="w-full text-left px-3 py-2 bg-red-500 text-white rounded text-sm font-medium hover:bg-red-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Verificar Clash
            </button>
            <button className="w-full text-left px-3 py-2 bg-blue-500 text-white rounded text-sm font-medium hover:bg-blue-600 flex items-center gap-2">
              <Share2 className="w-4 h-4" />
              Sync com Equipe
            </button>
          </div>
        </div>
      </div>

      {/* Modal Novo Evento */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-xl font-bold text-slate-800">Novo Evento</h3>
              <p className="text-sm text-slate-500 mt-1">Adicione um compromisso à agenda de produção</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Tabs */}
              <div className="flex gap-2 border-b border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveTab('info')}
                  className={`px-4 py-2 font-medium transition-colors ${activeTab === 'info' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500'}`}
                >
                  Informações
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('logistics')}
                  className={`px-4 py-2 font-medium transition-colors ${activeTab === 'logistics' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500'}`}
                >
                  Logística
                </button>
              </div>

              {/* Tab: Informações */}
              {activeTab === 'info' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Título do Evento</label>
                    <input
                      type="text"
                      required
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: Painel com headliners"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Data</label>
                      <input
                        type="date"
                        required
                        value={newEvent.date}
                        onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Evento</label>
                      <select
                        value={newEvent.type}
                        onChange={(e) => setNewEvent({...newEvent, type: e.target.value as EventType})}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="show">Show</option>
                        <option value="palestra">Palestra</option>
                        <option value="workshop">Workshop</option>
                        <option value="painel">Painel</option>
                        <option value="meetup">Meet & Greet</option>
                        <option value="digital">Digital</option>
                        <option value="ensaio">Ensaio</option>
                        <option value="logistica">Operação Logística</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Localização</label>
                    <input
                      type="text"
                      required
                      value={newEvent.location}
                      onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: Praça da Matriz, Centro"
                    />
                  </div>
                </div>
              )}

              {/* Tab: Logística */}
              {activeTab === 'logistics' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Veículos Necessários</label>
                    <div className="space-y-2">
                      {['Sprinter Técnica', 'SUV Produção', 'Caminhão Palco', 'Van Convidados'].map((vehicle) => (
                        <label key={vehicle} className="flex items-center gap-2 p-2 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newLogistics.vehicles.includes(vehicle)}
                            onChange={() => toggleVehicle(vehicle)}
                            className="rounded text-blue-600"
                          />
                          <span className="text-sm">{vehicle}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Número de Pessoas</label>
                      <input
                        type="number"
                        min="1"
                        value={newLogistics.staffCount}
                        onChange={(e) => setNewLogistics({...newLogistics, staffCount: parseInt(e.target.value)})}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Combustível (L)</label>
                      <input
                        type="number"
                        min="0"
                        value={newLogistics.fuelEstimatedLiters}
                        onChange={(e) => setNewLogistics({...newLogistics, fuelEstimatedLiters: parseInt(e.target.value)})}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newLogistics.dietaryRestrictions}
                        onChange={(e) => setNewLogistics({...newLogistics, dietaryRestrictions: e.target.checked})}
                        className="rounded text-blue-600"
                      />
                      <span className="text-sm font-medium">Incluir opções vegetarianas</span>
                    </label>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={complianceCheck}
                        onChange={(e) => setComplianceCheck(e.target.checked)}
                        className="mt-1 rounded text-blue-600"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-blue-900">Checklist de segurança validado</p>
                        <p className="text-xs text-blue-700 mt-1">
                          Confirmo que todos os requisitos legais sobre alimentação e logística estão sendo cumpridos.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* Botões */}
              <div className="flex gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                >
                  Criar Evento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};