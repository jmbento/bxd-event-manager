import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Trash2, GripVertical, Music, Mic, Theater, Radio, Clock, Settings, Play, Check, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import type { CalendarEvent, InventoryItem } from '../types';

interface AgendaViewProps {
  events: CalendarEvent[];
  inventory: InventoryItem[];
  onAddEvent: (event: Omit<CalendarEvent, 'id'>) => void;
}

interface TimelineEntry {
  id: string;
  time: string;
  title: string;
  duration: number;
  category: string; // Campo livre - usuário define
  stage: string;
  location: string; // Pavilhão, externo, 2º andar, etc
  status: 'pending' | 'happening' | 'completed';
  startedAt?: string;
}

export const AgendaView: React.FC<AgendaViewProps> = ({ events, inventory, onAddEvent }) => {
  const [stages, setStages] = useState<string[]>([]);
  const [selectedStage, setSelectedStage] = useState('');
  const [activeTab, setActiveTab] = useState<'timeline' | 'soundcheck'>('timeline');
  const [showModal, setShowModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [entries, setEntries] = useState<TimelineEntry[]>([]);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [newStageName, setNewStageName] = useState('');
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [showBannerMenu, setShowBannerMenu] = useState(false);
  const [bannerMenuPosition, setBannerMenuPosition] = useState({ x: 0, y: 0 });

  // Imagens de eventos para o banner (salvas no localStorage)
  const [bannerImages, setBannerImages] = useState<string[]>(() => {
    const saved = localStorage.getItem('agenda_banner_images');
    if (saved) return JSON.parse(saved);
    return [
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&h=300&fit=crop',
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&h=300&fit=crop',
      'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1200&h=300&fit=crop',
      'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1200&h=300&fit=crop',
    ];
  });

  // Salvar imagens quando mudar
  useEffect(() => {
    localStorage.setItem('agenda_banner_images', JSON.stringify(bannerImages));
  }, [bannerImages]);

  // Relógio digital em tempo real
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-rotate banner
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % bannerImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [bannerImages.length]);

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClick = () => setShowBannerMenu(false);
    if (showBannerMenu) {
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [showBannerMenu]);

  const handleBannerRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setBannerMenuPosition({ x: e.clientX, y: e.clientY });
    setShowBannerMenu(true);
  };

  const handleChangeBannerImage = () => {
    const url = prompt('Cole a URL da imagem (deixe vazio para Unsplash aleatório):');
    if (url === null) return; // Cancelou
    
    const newUrl = url.trim() || `https://source.unsplash.com/1200x300/?event,${Date.now()}`;
    const updated = [...bannerImages];
    updated[currentBannerIndex] = newUrl;
    setBannerImages(updated);
    setShowBannerMenu(false);
  };

  const handleAddBannerImage = () => {
    const url = prompt('Cole a URL da nova imagem:');
    if (url && url.trim()) {
      setBannerImages([...bannerImages, url.trim()]);
    }
    setShowBannerMenu(false);
  };

  const handleRemoveBannerImage = () => {
    if (bannerImages.length > 1 && confirm('Remover esta imagem?')) {
      const updated = bannerImages.filter((_, i) => i !== currentBannerIndex);
      setBannerImages(updated);
      setCurrentBannerIndex(0);
    }
    setShowBannerMenu(false);
  };

  // Estados do formulário
  const [formData, setFormData] = useState({
    title: '',
    time: '',
    duration: 60,
    category: '',
    stage: '',
    location: '',
  });

  // Sugestões de palcos
  const stageSuggestions = ['Palco Principal', 'Palco 2', 'Sala VIP', 'Arena Externa', 'Auditório', 'Teatro'];
  
  // Sugestões de categorias (opcionais)
  const categorySuggestions = ['Show', 'Palestra', 'Teatro', 'Workshop', 'Networking', 'Coffee Break', 'Almoço', 'Passagem de Som', 'Troca de Palco'];
  
  // Sugestões de locais
  const locationSuggestions = ['Pavilhão Principal', 'Área Externa', '2º Andar', 'Térreo', 'Sala A', 'Sala B', 'Jardim', 'Estacionamento'];

  const handleAddEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry: TimelineEntry = {
      id: Date.now().toString(),
      ...formData,
      status: 'pending',
    };
    setEntries([...entries, newEntry]);
    setShowModal(false);
    setFormData({
      title: '',
      time: '',
      duration: 60,
      category: '',
      stage: selectedStage || stages[0] || '',
      location: '',
    });
  };

  const handleAddStage = () => {
    if (newStageName.trim() && !stages.includes(newStageName.trim())) {
      const updated = [...stages, newStageName.trim()];
      setStages(updated);
      if (!selectedStage) setSelectedStage(newStageName.trim());
      setNewStageName('');
    }
  };

  const handleRemoveStage = (stage: string) => {
    setStages(stages.filter(s => s !== stage));
    if (selectedStage === stage) setSelectedStage(stages[0] || '');
  };

  const handleStartEntry = (id: string) => {
    setEntries(entries.map(entry => 
      entry.id === id 
        ? { ...entry, status: 'happening', startedAt: new Date().toISOString() }
        : entry
    ));
  };

  const handleCompleteEntry = (id: string) => {
    setEntries(entries.map(entry => 
      entry.id === id 
        ? { ...entry, status: 'completed' }
        : entry
    ));
  };

  const handleDelete = (id: string) => {
    setEntries(entries.filter(entry => entry.id !== id));
  };

  const handleDragStart = (id: string) => {
    setDraggedItem(id);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedItem || draggedItem === targetId) return;

    const draggedIndex = entries.findIndex(e => e.id === draggedItem);
    const targetIndex = entries.findIndex(e => e.id === targetId);

    const newEntries = [...entries];
    const [removed] = newEntries.splice(draggedIndex, 1);
    newEntries.splice(targetIndex, 0, removed);

    setEntries(newEntries);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const getCategoryColor = (category: string): string => {
    // Cores baseadas no hash da string para consistência
    const colors = [
      'border-l-purple-500 bg-purple-50',
      'border-l-blue-500 bg-blue-50',
      'border-l-pink-500 bg-pink-50',
      'border-l-orange-500 bg-orange-50',
      'border-l-green-500 bg-green-50',
      'border-l-red-500 bg-red-50',
      'border-l-indigo-500 bg-indigo-50',
      'border-l-yellow-500 bg-yellow-50',
    ];
    const hash = category.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const calculateDelay = (entry: TimelineEntry): number => {
    if (entry.status !== 'happening' || !entry.startedAt) return 0;
    const [hours, minutes] = entry.time.split(':').map(Number);
    const scheduled = new Date();
    scheduled.setHours(hours, minutes, 0, 0);
    const started = new Date(entry.startedAt);
    return Math.floor((started.getTime() - scheduled.getTime()) / 60000); // minutos
  };

  const getElapsedTime = (entry: TimelineEntry): number => {
    if (entry.status !== 'happening' || !entry.startedAt) return 0;
    const started = new Date(entry.startedAt);
    return Math.floor((currentTime.getTime() - started.getTime()) / 60000); // minutos
  };

  const filteredEntries = entries.filter(entry => 
    activeTab === 'soundcheck' 
      ? entry.category.toLowerCase().includes('som')
      : entry.stage === selectedStage
  );

  const sortedEntries = [...filteredEntries].sort((a, b) => 
    a.time.localeCompare(b.time)
  );

  const happeningEntry = entries.find(e => e.status === 'happening');

  // Auto-configurar palco padrão se não houver nenhum
  useEffect(() => {
    if (stages.length === 0) {
      setStages(['Palco Principal']);
      setSelectedStage('Palco Principal');
    }
  }, []);

  return (
    <div className="h-full space-y-6">
      {/* Banner Carousel */}
      <div 
        className="relative w-full h-48 rounded-xl overflow-hidden group cursor-pointer"
        onContextMenu={handleBannerRightClick}
      >
        <img 
          src={bannerImages[currentBannerIndex]} 
          alt="Evento"
          className="w-full h-full object-cover transition-opacity duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        
        {/* Controles do Carousel */}
        <button
          onClick={() => setCurrentBannerIndex((prev) => (prev - 1 + bannerImages.length) % bannerImages.length)}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={() => setCurrentBannerIndex((prev) => (prev + 1) % bannerImages.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Indicadores */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {bannerImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentBannerIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentBannerIndex ? 'bg-white w-8' : 'bg-white/50'
              }`}
            />
          ))}
        </div>

        {/* Texto Sobreposto */}
        <div className="absolute bottom-6 left-6 text-white">
          <h3 className="text-2xl font-bold mb-1">Gerencie seu Evento</h3>
          <p className="text-sm text-white/90">Running Order em tempo real • Clique direito para trocar imagem</p>
        </div>
      </div>

      {/* Context Menu do Banner */}
      {showBannerMenu && (
        <div
          className="fixed bg-white rounded-lg shadow-xl border border-slate-200 py-1 z-50"
          style={{ top: bannerMenuPosition.y, left: bannerMenuPosition.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleChangeBannerImage}
            className="w-full px-4 py-2 text-left text-sm hover:bg-slate-100 flex items-center gap-2"
          >
            🖼️ Trocar esta imagem
          </button>
          <button
            onClick={handleAddBannerImage}
            className="w-full px-4 py-2 text-left text-sm hover:bg-slate-100 flex items-center gap-2"
          >
            ➕ Adicionar nova imagem
          </button>
          {bannerImages.length > 1 && (
            <button
              onClick={handleRemoveBannerImage}
              className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
            >
              🗑️ Remover esta imagem
            </button>
          )}
        </div>
      )}

      {/* Header com Relógio Digital */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-bold text-slate-800">Running Order</h2>
              <p className="text-sm text-slate-500">Gerencie a programação em tempo real</p>
            </div>
          </div>
          
          {/* Relógio Digital */}
          <div className="bg-slate-900 text-white px-6 py-3 rounded-lg">
            <div className="text-3xl font-mono font-bold">
              {currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
            <div className="text-xs text-slate-400 text-center mt-1">
              {currentTime.toLocaleDateString('pt-BR')}
            </div>
          </div>

          {/* Timer da Apresentação Atual */}
          {happeningEntry && (
            <div className="bg-red-600 text-white px-6 py-3 rounded-lg animate-pulse">
              <div className="text-xs font-medium mb-1">▶ AO VIVO</div>
              <div className="text-2xl font-mono font-bold">
                {getElapsedTime(happeningEntry)}/{happeningEntry.duration} min
              </div>
              <div className="text-xs mt-1">{happeningEntry.title}</div>
              {calculateDelay(happeningEntry) > 0 && (
                <div className="text-xs bg-yellow-500 px-2 py-0.5 rounded mt-1">
                  +{calculateDelay(happeningEntry)} min atraso
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => setShowConfigModal(true)}
            className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
          >
            <Settings className="w-4 h-4" />
            Configurar Palcos
          </button>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Adicionar Entrada
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('timeline')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'timeline'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-800'
          }`}
        >
          Timeline Geral
        </button>
        <button
          onClick={() => setActiveTab('soundcheck')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'soundcheck'
              ? 'border-orange-600 text-orange-600'
              : 'border-transparent text-slate-600 hover:text-slate-800'
          }`}
        >
          🔊 Passagem de Som
        </button>
      </div>

      {/* Stage Selector (apenas para timeline) */}
      {activeTab === 'timeline' && stages.length > 1 && (
        <div className="flex gap-2 bg-slate-50 p-3 rounded-lg overflow-x-auto">
          {stages.map((stage) => (
            <button
              key={stage}
              onClick={() => setSelectedStage(stage)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                selectedStage === stage
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              {stage}
            </button>
          ))}
        </div>
      )}

      {/* Timeline */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="font-bold text-slate-800 mb-4">
          {activeTab === 'soundcheck' ? '🔊 Passagem de Som' : selectedStage}
        </h3>

        {sortedEntries.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Nenhuma entrada cadastrada</p>
            <p className="text-xs mt-1">Clique em "Adicionar Entrada" para começar</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sortedEntries.map((entry) => {
              const delay = calculateDelay(entry);
              const elapsed = getElapsedTime(entry);
              
              return (
                <div
                  key={entry.id}
                  draggable
                  onDragStart={() => handleDragStart(entry.id)}
                  onDragOver={(e) => handleDragOver(e, entry.id)}
                  onDragEnd={handleDragEnd}
                  className={`flex items-center gap-3 p-4 rounded-lg border-l-4 ${getCategoryColor(entry.category)} ${
                    entry.status === 'happening' ? 'ring-2 ring-red-500' :
                    entry.status === 'completed' ? 'opacity-60' : ''
                  } cursor-move hover:shadow-md transition-all group`}
                >
                  <GripVertical className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-slate-800">{entry.time}</span>
                      <span className="text-xs px-2 py-0.5 bg-white rounded border">
                        {entry.duration} min
                      </span>
                      <span className="text-xs px-2 py-0.5 bg-white rounded border">
                        {entry.category}
                      </span>
                      {entry.location && (
                        <span className="text-xs px-2 py-0.5 bg-slate-100 rounded">
                          📍 {entry.location}
                        </span>
                      )}
                      {entry.status === 'happening' && (
                        <span className="text-xs px-2 py-0.5 bg-red-600 text-white rounded font-bold animate-pulse">
                          ▶ {elapsed}/{entry.duration} min
                        </span>
                      )}
                      {delay > 0 && entry.status === 'happening' && (
                        <span className="text-xs px-2 py-0.5 bg-yellow-500 text-white rounded">
                          +{delay} min atraso
                        </span>
                      )}
                    </div>
                    <h4 className={`font-medium ${entry.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                      {entry.title}
                    </h4>
                    {activeTab === 'soundcheck' && (
                      <p className="text-xs text-slate-500 mt-1">Palco: {entry.stage}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {entry.status === 'pending' && (
                      <button
                        onClick={() => handleStartEntry(entry.id)}
                        className="p-2 text-green-600 hover:bg-green-100 rounded transition-all"
                        title="Iniciar"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                    )}
                    {entry.status === 'happening' && (
                      <button
                        onClick={() => handleCompleteEntry(entry.id)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded transition-all"
                        title="Concluir"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="opacity-0 group-hover:opacity-100 p-2 text-red-600 hover:bg-red-100 rounded transition-all"
                      title="Deletar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Configuração de Palcos */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Configurar Palcos/Áreas</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Sugestões:
              </label>
              <div className="flex flex-wrap gap-2">
                {stageSuggestions.map(suggestion => (
                  <button
                    key={suggestion}
                    onClick={() => {
                      if (!stages.includes(suggestion)) {
                        const updated = [...stages, suggestion];
                        setStages(updated);
                        if (!selectedStage) setSelectedStage(suggestion);
                      }
                    }}
                    disabled={stages.includes(suggestion)}
                    className={`text-xs px-3 py-1 rounded-lg ${
                      stages.includes(suggestion)
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    }`}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Ou crie um personalizado:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newStageName}
                  onChange={(e) => setNewStageName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddStage()}
                  placeholder="Ex: Sala Workshop"
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleAddStage}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Palcos Configurados:
              </label>
              {stages.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">Nenhum palco configurado</p>
              ) : (
                <div className="space-y-2">
                  {stages.map(stage => (
                    <div key={stage} className="flex justify-between items-center bg-slate-50 p-2 rounded">
                      <span className="text-sm">{stage}</span>
                      <button
                        onClick={() => handleRemoveStage(stage)}
                        className="text-red-600 hover:bg-red-100 p-1 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setShowConfigModal(false)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Concluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Nova Entrada</h3>
            <form onSubmit={handleAddEntry} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Categoria
                </label>
                <input
                  type="text"
                  required
                  list="category-suggestions"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="Ex: Show, Palestra, Workshop..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <datalist id="category-suggestions">
                  {categorySuggestions.map(cat => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Título/Nome
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Nome do artista/palestrante/atividade"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Palco/Área
                </label>
                <select
                  required
                  value={formData.stage}
                  onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione...</option>
                  {stages.map(stage => (
                    <option key={stage} value={stage}>{stage}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Local Físico
                </label>
                <input
                  type="text"
                  list="location-suggestions"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Ex: 2º Andar, Pavilhão, Externo..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <datalist id="location-suggestions">
                  {locationSuggestions.map(loc => (
                    <option key={loc} value={loc} />
                  ))}
                </datalist>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Horário
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Duração (min)
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Adicionar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
