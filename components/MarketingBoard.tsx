import React, { useState } from 'react';
import { 
  Plus, Eye, CheckCircle2, Clock, AlertCircle, Zap, 
  Instagram, Youtube, Facebook, Image, Play, Video,
  Calendar, Users, DollarSign, Target, Sparkles
} from 'lucide-react';

interface MarketingCard {
  id: string;
  title: string;
  description: string;
  status: 'briefing' | 'creation' | 'approval' | 'published';
  urgency: 'low' | 'medium' | 'high' | 'critical';
  thumbnail?: string;
  channels: string[];
  deadline: string;
  budget: number;
  approvals: {
    marketing: boolean;
    producao: boolean;
    manager: boolean;
  };
}

interface MarketingColumn {
  id: string;
  title: string;
  cards: MarketingCard[];
}

export const MarketingBoard: React.FC = () => {
  const [columns, setColumns] = useState<MarketingColumn[]>([
    {
      id: 'briefing',
      title: 'Pipeline (Briefing)',
      cards: [
        {
          id: '1',
          title: 'Line-up Reveal - Fase 1',
          description: 'Stories + Reels com os 3 primeiros nomes',
          status: 'briefing',
          urgency: 'critical',
          channels: ['instagram', 'tiktok'],
          deadline: '2025-12-06',
          budget: 5000,
          approvals: { marketing: false, producao: false, manager: false }
        }
      ]
    },
    {
      id: 'creation',
      title: 'Criativo (Execução)',
      cards: [
        {
          id: '2',
          title: 'Countdown 7 dias',
          description: 'Série de posts com contagem regressiva',
          status: 'creation',
          urgency: 'high',
          channels: ['instagram', 'facebook'],
          deadline: '2025-12-08',
          budget: 2000,
          approvals: { marketing: true, producao: false, manager: false }
        }
      ]
    },
    {
      id: 'approval',
      title: 'Aprovação & Review',
      cards: []
    },
    {
      id: 'published',
      title: 'Published & Live',
      cards: []
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [newCard, setNewCard] = useState({
    title: '',
    description: '',
    channels: [] as string[],
    deadline: '',
    budget: 0,
    urgency: 'medium' as MarketingCard['urgency']
  });

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'instagram': return <Instagram className="w-4 h-4 text-pink-500" />;
      case 'youtube': return <Youtube className="w-4 h-4 text-red-500" />;
      case 'tiktok': return <Video className="w-4 h-4 text-slate-900" />;
      case 'facebook': return <Facebook className="w-4 h-4 text-blue-500" />;
      default: return <Image className="w-4 h-4 text-slate-500" />;
    }
  };

  const moveCard = (cardId: string, fromColumn: string, toColumn: string) => {
    setColumns(prev => {
      const sourceCol = prev.find(col => col.id === fromColumn);
      const destCol = prev.find(col => col.id === toColumn);
      
      if (!sourceCol || !destCol) return prev;
      
      const card = sourceCol.cards.find(c => c.id === cardId);
      if (!card) return prev;
      
      return prev.map(col => {
        if (col.id === fromColumn) {
          return { ...col, cards: col.cards.filter(c => c.id !== cardId) };
        }
        if (col.id === toColumn) {
          return { ...col, cards: [...col.cards, { ...card, status: toColumn as MarketingCard['status'] }] };
        }
        return col;
      });
    });
  };

  const handleCreateCard = (e: React.FormEvent) => {
    e.preventDefault();
    const card: MarketingCard = {
      id: Date.now().toString(),
      title: newCard.title,
      description: newCard.description,
      status: 'briefing',
      urgency: newCard.urgency,
      channels: newCard.channels,
      deadline: newCard.deadline,
      budget: newCard.budget,
      approvals: { marketing: false, producao: false, manager: false }
    };

    setColumns(prev => prev.map(col => 
      col.id === 'briefing' 
        ? { ...col, cards: [...col.cards, card] }
        : col
    ));

    setNewCard({
      title: '',
      description: '',
      channels: [],
      deadline: '',
      budget: 0,
      urgency: 'medium'
    });
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Zap className="w-8 h-8 text-purple-600" />
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Pipeline Visual de Campanhas</h2>
              <p className="text-sm text-slate-500">Marketing de evento é ritmo, visual e urgência</p>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nova Campanha
          </button>
        </div>

        {/* Metrics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-100">
            <div className="flex items-center gap-3">
              <Target className="w-8 h-8 text-purple-600" />
              <div>
                <div className="text-sm text-slate-600">Campanhas Ativas</div>
                <div className="text-2xl font-bold text-slate-800">12</div>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-100">
            <div className="flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-green-600" />
              <div>
                <div className="text-sm text-slate-600">Budget Remaining</div>
                <div className="text-2xl font-bold text-slate-800">R$ 45K</div>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-100">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-600" />
              <div>
                <div className="text-sm text-slate-600">Alcance Semanal</div>
                <div className="text-2xl font-bold text-slate-800">2.1M</div>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-red-50 p-4 rounded-lg border border-orange-100">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-orange-600" />
              <div>
                <div className="text-sm text-slate-600">Urgentes</div>
                <div className="text-2xl font-bold text-slate-800">3</div>
              </div>
            </div>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 overflow-x-auto">
          {columns.map((column) => (
            <div key={column.id} className="bg-slate-50 rounded-xl p-4 min-h-96">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                {column.id === 'briefing' && <Sparkles className="w-5 h-5 text-purple-600" />}
                {column.id === 'creation' && <Image className="w-5 h-5 text-blue-600" />}
                {column.id === 'approval' && <Eye className="w-5 h-5 text-orange-600" />}
                {column.id === 'published' && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                {column.title}
                <span className="text-sm bg-slate-200 text-slate-600 px-2 py-1 rounded-full">
                  {column.cards.length}
                </span>
              </h3>

              <div className="space-y-3">
                {column.cards.map((card, index) => (
                  <div
                    key={card.id}
                    className={`bg-white rounded-lg p-4 shadow-sm border-l-4 ${
                      card.urgency === 'critical' ? 'border-l-red-500' :
                      card.urgency === 'high' ? 'border-l-orange-500' :
                      card.urgency === 'medium' ? 'border-l-yellow-500' :
                      'border-l-green-500'
                    } hover:shadow-md transition-all cursor-pointer`}
                  >
                            {/* Card Header */}
                            <div className="flex justify-between items-start mb-3">
                              <h4 className="font-semibold text-slate-800 text-sm leading-tight">
                                {card.title}
                              </h4>
                              <span className={`text-xs px-2 py-1 rounded border font-medium ${getUrgencyColor(card.urgency)}`}>
                                {card.urgency === 'critical' ? '🔥' : 
                                 card.urgency === 'high' ? '⚡' :
                                 card.urgency === 'medium' ? '⏰' : '✅'}
                              </span>
                            </div>

                            {/* Description */}
                            <p className="text-xs text-slate-600 mb-3">{card.description}</p>

                            {/* Thumbnail Placeholder */}
                            <div className="bg-slate-100 rounded-lg h-20 mb-3 flex items-center justify-center">
                              <div className="text-slate-400 text-xs">
                                {card.status === 'briefing' ? '📝 Briefing' : 
                                 card.status === 'creation' ? '🎨 Em criação' :
                                 card.status === 'approval' ? '👁️ Revisão' : '📱 Publicado'}
                              </div>
                            </div>

                            {/* Channels */}
                            <div className="flex items-center gap-2 mb-3">
                              {card.channels.map((channel) => (
                                <div key={channel} className="p-1 bg-slate-100 rounded">
                                  {getChannelIcon(channel)}
                                </div>
                              ))}
                            </div>

                            {/* Approvals Checklist */}
                            <div className="flex items-center gap-2 mb-3">
                              <div className={`w-2 h-2 rounded-full ${card.approvals.marketing ? 'bg-green-500' : 'bg-slate-300'}`} title="Marketing"></div>
                              <div className={`w-2 h-2 rounded-full ${card.approvals.producao ? 'bg-green-500' : 'bg-slate-300'}`} title="Produção"></div>
                              <div className={`w-2 h-2 rounded-full ${card.approvals.manager ? 'bg-green-500' : 'bg-slate-300'}`} title="Manager"></div>
                              <span className="text-xs text-slate-500 ml-1">
                                {Object.values(card.approvals).filter(Boolean).length}/3 aprovações
                              </span>
                            </div>

                            {/* Footer */}
                            <div className="flex justify-between items-center text-xs text-slate-500">
                              <span>R$ {card.budget.toLocaleString()}</span>
                              <span className={`${new Date(card.deadline) < new Date(Date.now() + 86400000) ? 'text-red-600 font-medium' : ''}`}>
                                {new Date(card.deadline).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
            </div>
          ))}
        </div>

        {/* Modal para nova campanha */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-bold text-slate-800 mb-6">Nova Campanha de Marketing</h3>
              
              <form onSubmit={handleCreateCard} className="space-y-6">
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
                    Descrição & Briefing
                  </label>
                  <textarea
                    value={newCard.description}
                    onChange={(e) => setNewCard({...newCard, description: e.target.value})}
                    placeholder="Descreva o objetivo, tom de voz e elementos visuais..."
                    rows={3}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Deadline
                    </label>
                    <input
                      type="date"
                      value={newCard.deadline}
                      onChange={(e) => setNewCard({...newCard, deadline: e.target.value})}
                      required
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Budget (R$)
                    </label>
                    <input
                      type="number"
                      value={newCard.budget}
                      onChange={(e) => setNewCard({...newCard, budget: parseInt(e.target.value) || 0})}
                      placeholder="5000"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Urgência
                  </label>
                  <select
                    value={newCard.urgency}
                    onChange={(e) => setNewCard({...newCard, urgency: e.target.value as MarketingCard['urgency']})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  >
                    <option value="low">🟢 Baixa</option>
                    <option value="medium">🟡 Média</option>
                    <option value="high">🟠 Alta</option>
                    <option value="critical">🔴 Crítica</option>
                  </select>
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
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-colors"
                  >
                    Criar Card
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
  );
};