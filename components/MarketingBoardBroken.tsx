import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Task, TaskStatus } from '../types';
import { CheckCircle2, Clock, AlertCircle, FileText, GripVertical, DollarSign, Plus, X, Zap, Camera, ThumbsUp, Radio, TrendingUp, Instagram, Play, Mail, Target, Tag, Users, Calendar, Flame } from 'lucide-react';

interface Props {
  tasks: Task[];
  onMoveTask: (taskId: string, newStatus: TaskStatus, cost?: number) => void;
}

export const MarketingBoard: React.FC<Props> = ({ tasks, onMoveTask }) => {
  const [costModal, setCostModal] = useState<{ taskId: string, show: boolean } | null>(null);
  const [costInput, setCostInput] = useState('');
  const [showNewCardModal, setShowNewCardModal] = useState(false);
  const [newCard, setNewCard] = useState({
    title: '',
    description: '',
    assignee: '',
    channel: 'Instagram',
    format: 'Stories 9:16',
    urgency: 'Normal',
    ctaLink: ''
  });

  const urgencyOptions = [
    { value: 'Normal', label: 'Normal', color: 'bg-slate-500', icon: '⏱️' },
    { value: 'Urgente', label: 'Urgente', color: 'bg-amber-500', icon: '⚡' },
    { value: 'Virada de Lote', label: 'Virada de Lote (Crítico)', color: 'bg-red-500', icon: '🔥' }
  ];

  const channelOptions = [
    { value: 'Instagram', icon: Instagram, color: 'text-pink-500' },
    { value: 'TikTok', icon: Play, color: 'text-slate-800' },
    { value: 'Email Mkt', icon: Mail, color: 'text-blue-500' },
    { value: 'YouTube', icon: Play, color: 'text-red-500' },
    { value: 'Outdoor/LED', icon: Target, color: 'text-purple-500' }
  ];

  const columns: { id: TaskStatus; label: string; color: string; bgColor: string; icon: any; description: string }[] = [
    { id: 'briefing', label: 'Planejamento & Insights', color: 'border-purple-400', bgColor: 'bg-purple-50', icon: Zap, description: 'Ideias de viralização' },
    { id: 'creation', label: 'Estúdio Criativo', color: 'border-pink-400', bgColor: 'bg-pink-50', icon: Camera, description: 'Produção visual' },
    { id: 'legal', label: 'Aprovação', color: 'border-amber-400', bgColor: 'bg-amber-50', icon: ThumbsUp, description: 'Artist & Sponsor' },
    { id: 'done', label: 'No Ar (Live)', color: 'border-red-500', bgColor: 'bg-red-50', icon: Radio, description: 'Rodando agora' },
  ];

  const performanceColumn = {
    id: 'performance',
    label: 'Performance/ROI',
    color: 'border-emerald-500',
    bgColor: 'bg-emerald-50',
    icon: TrendingUp,
    description: 'Conversão de vendas'
  };

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // Dropped outside
    if (!destination) return;

    // Same position
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    const newStatus = destination.droppableId as TaskStatus;

    // If moving to "done", ask for cost
    if (newStatus === 'done' && source.droppableId !== 'done') {
      setCostModal({ taskId: draggableId, show: true });
    } else {
      onMoveTask(draggableId, newStatus);
    }
  };

  const confirmCost = () => {
    if (costModal) {
      const amount = parseFloat(costInput) || 0;
      onMoveTask(costModal.taskId, 'done', amount);
      setCostModal(null);
      setCostInput('');
    }
  };

  const handleCreateCard = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`🎯 Campanha criada com sucesso!\n\n📝 Nome: ${newCard.title}\n📱 Canal: ${newCard.channel} (${newCard.format})\n⚡ Urgência: ${newCard.urgency}\n🎯 CTA: ${newCard.ctaLink || 'Não informado'}\n👤 Criativo: ${newCard.assignee}\n\n✨ Card adicionado em "Planejamento & Insights" - arraste pelos estágios!`);
    setNewCard({ title: '', description: '', assignee: '', channel: 'Instagram', format: 'Stories 9:16', urgency: 'Normal', ctaLink: '' });
    setShowNewCardModal(false);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="h-full flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              Máquina de Hype & Vendas
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              <GripVertical className="w-4 h-4 inline mr-1" />
              Jornada do ticket: da ideia à conversão
            </p>
          </div>
          <button 
            onClick={() => setShowNewCardModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nova Campanha
          </button>
        </div>

        <div className="flex-1 overflow-x-auto">
          <div className="flex space-x-4 min-w-[1000px] h-full pb-4">
            {[...columns, performanceColumn].map(col => {
              const Icon = col.icon;
              return (
              <div key={col.id} className="flex-1 bg-slate-100 rounded-xl p-4 flex flex-col">
                <div className={`border-t-4 ${col.color} bg-white p-3 rounded-lg shadow-sm mb-4`}>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-slate-600" />
                      <h3 className="font-bold text-slate-800">{col.label}</h3>
                    </div>
                    <span className="bg-slate-100 text-slate-500 text-xs px-2 py-1 rounded-full font-medium">
                      {tasks.filter(t => t.status === col.id).length}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{col.description}</p>
                </div>

                <Droppable droppableId={col.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`space-y-3 overflow-y-auto no-scrollbar flex-1 transition-colors rounded-lg p-2 ${
                        snapshot.isDraggingOver ? col.bgColor : ''
                      }`}
                    >
                      {tasks
                        .filter(t => t.status === col.id)
                        .map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`bg-white rounded-lg shadow-sm border-2 border-slate-200 group hover:border-pink-400 transition-all overflow-hidden ${
                                  snapshot.isDragging ? 'shadow-2xl rotate-1 scale-105 border-pink-500' : ''
                                }`}
                              >
                                {/* 1. CABEÇALHO VISUAL */}
                                <div className="relative">
                                  {/* Thumbnail de Capa - INDISPENSÁVEL */}
                                  <div className="aspect-video bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                      <div className="text-center">
                                        <Play className="w-8 h-8 text-white/90 mx-auto mb-1" />
                                        <span className="text-white/80 text-[10px] font-medium">Preview da Arte</span>
                                      </div>
                                    </div>
                                    
                                    {/* Status de Urgência */}
                                    <div className="absolute top-2 left-2">
                                      <span className="bg-red-500 text-white text-[9px] px-2 py-1 rounded-full font-bold animate-pulse shadow-lg">
                                        🔥 VIRADA DE LOTE
                                      </span>
                                    </div>
                                    
                                    {/* Drag Handle */}
                                    <div className="absolute top-2 right-2">
                                      <GripVertical className="w-4 h-4 text-white/70 group-hover:text-white" />
                                    </div>
                                  </div>
                                  
                                  {/* Nome da Peça */}
                                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                                    <h4 className="text-sm font-bold text-white leading-tight">{task.title}</h4>
                                  </div>
                                </div>

                                {/* 2. DADOS TÁTICOS */}
                                <div className="p-3 space-y-2">
                                  {/* Canal + Formato */}
                                  <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-1">
                                      <Instagram className="w-3 h-3 text-pink-500" />
                                      <span className="text-[10px] font-medium text-slate-600">Stories</span>
                                      <span className="text-[10px] text-slate-400">9:16</span>
                                    </div>
                                    <div className="text-[10px] font-bold text-purple-600">
                                      📅 Hoje 18h
                                    </div>
                                  </div>
                                  
                                  {/* Copy & CTA */}
                                  <div className="bg-slate-50 rounded p-2">
                                    <p className="text-[10px] text-slate-600 line-clamp-2 mb-1">{task.description}</p>
                                    <a href="#" className="text-[9px] text-blue-600 font-medium flex items-center gap-1">
                                      <Target className="w-3 h-3" />
                                      ticketeria.com/alok?utm=insta_story
                                    </a>
                                  </div>
                                  
                                  {/* 4. FLUXO DE APROVAÇÃO - O GRANDE GARGALO */}
                                  <div className="border-t border-slate-100 pt-2 mt-2">
                                    <div className="text-[9px] font-bold text-slate-500 uppercase mb-1">De Acordo:</div>
                                    <div className="flex justify-between items-center mb-2">
                                      <div className="flex gap-1">
                                        <div className="flex items-center gap-1">
                                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                          <span className="text-[9px] text-slate-600">Marketing</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <Clock className="w-3 h-3 text-amber-500" />
                                          <span className="text-[9px] text-slate-600">Produção</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <AlertCircle className="w-3 h-3 text-red-500" />
                                          <span className="text-[9px] text-slate-600">Manager</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Rodapé com Responsável e Métricas */}
                                  <div className="flex justify-between items-center border-t border-slate-50 pt-2">
                                    <div className="flex items-center gap-1">
                                      <div className="w-4 h-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 border border-white flex items-center justify-center text-[8px] text-white font-bold">
                                        {task.assignee ? task.assignee.charAt(0) : 'B'}
                                      </div>
                                      <span className="text-[9px] text-slate-500">{task.assignee || 'Bento'}</span>
                                    </div>
                                    
                                    <div className="flex items-center gap-1">
                                      {task.status === 'done' && (
                                        <div className="bg-emerald-50 text-emerald-700 text-[8px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                          <TrendingUp className="w-2.5 h-2.5" />
                                          CPA R${task.cost ? (task.cost / 10).toFixed(0) : '0'}
                                        </div>
                                      )}
                                      {task.cost && (
                                        <div className="text-[9px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                          R$ {task.cost.toFixed(0)}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );})}
          </div>
        </div>
      </div>

      {/* Cost Modal */}
      {costModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-xl shadow-2xl max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
              <Radio className="w-5 h-5 text-red-500" />
              Campanha No Ar!
            </h3>
            <p className="text-sm text-slate-500 mb-4">
              Investimento total nesta campanha (Ads, Influencers, Produção).
              <strong>Fundamental para calcular o CPA!</strong>
            </p>
            
            <div className="relative mb-6">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-slate-500 sm:text-sm">R$</span>
              </div>
              <input
                type="number"
                className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="0,00"
                value={costInput}
                onChange={(e) => setCostInput(e.target.value)}
                autoFocus
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setCostModal(null)}
                className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmCost}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Card Modal */}
      {showNewCardModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Camera className="w-5 h-5 text-pink-500" />
                Nova Campanha de Hype
              </h3>
              <button onClick={() => setShowNewCardModal(false)} className="text-slate-400 hover:text-slate-600" title="Fechar">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCard} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nome da Campanha
                </label>
                <input
                  type="text"
                  value={newCard.title}
                  onChange={(e) => setNewCard({...newCard, title: e.target.value})}
                  placeholder="Ex: Line-up Reveal - Fase 1 | Stories + Reels"
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Briefing & Objetivo
                </label>
                <textarea
                  value={newCard.description}
                  onChange={(e) => setNewCard({...newCard, description: e.target.value})}
                  placeholder="Copy, formato, canais, call-to-action, meta de conversão..."
                  rows={3}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                />
              </div>

              <div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Canal de Veiculação
                    </label>
                    <select
                      value={newCard.channel}
                      onChange={(e) => setNewCard({...newCard, channel: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    >
                      {channelOptions.map(channel => (
                        <option key={channel.value} value={channel.value}>{channel.value}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Formato
                    </label>
                    <select
                      value={newCard.format}
                      onChange={(e) => setNewCard({...newCard, format: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    >
                      <option value="Stories 9:16">Stories (9:16)</option>
                      <option value="Feed 4:5">Feed (4:5)</option>
                      <option value="YouTube 16:9">YouTube (16:9)</option>
                      <option value="Reels 9:16">Reels (9:16)</option>
                      <option value="Carrossel">Carrossel</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Status de Urgência
                  </label>
                  <select
                    value={newCard.urgency}
                    onChange={(e) => setNewCard({...newCard, urgency: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  >
                    {urgencyOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.icon} {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Link de Destino (CTA)
                  </label>
                  <input
                    type="url"
                    value={newCard.ctaLink}
                    onChange={(e) => setNewCard({...newCard, ctaLink: e.target.value})}
                    placeholder="https://ticketeria.com/evento?utm=insta_story"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Designer/Criativo
                  </label>
                  <input
                    type="text"
                    value={newCard.assignee}
                    onChange={(e) => setNewCard({...newCard, assignee: e.target.value})}
                    placeholder="Ex: Ana (Motion), Carlos (Copy), Maria (Ads)"
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  />
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <p className="text-xs text-purple-800">
                  <Zap className="w-4 h-4 inline mr-1" />
                  Campanha criada em <strong>"Planejamento & Insights"</strong>. Arraste pelos estágios até ficar <strong>No Ar!</strong>
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowNewCardModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-colors"
                >
                  Criar Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DragDropContext>
  );
};