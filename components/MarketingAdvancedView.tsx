
import React, { useState } from 'react';
import { Calendar, Image, Video, FileText, Sparkles, Clock, CheckCircle, AlertCircle, Plus, Upload } from 'lucide-react';

interface ContentItem {
  id: string;
  title: string;
  type: 'image' | 'video' | 'text' | 'carousel';
  status: 'agendado' | 'publicado' | 'rascunho';
  scheduledDate?: string;
  platform: string[];
  engagement?: number;
}

const mockContent: ContentItem[] = [
  { id: '1', title: 'Post sobre Saúde', type: 'image', status: 'agendado', scheduledDate: '2025-11-28 18:00', platform: ['Instagram', 'Facebook'], engagement: 0 },
  { id: '2', title: 'Vídeo Depoimento', type: 'video', status: 'publicado', scheduledDate: '2025-11-25 19:00', platform: ['Instagram', 'TikTok', 'YouTube'], engagement: 3245 },
  { id: '3', title: 'Carrossel Propostas', type: 'carousel', status: 'agendado', scheduledDate: '2025-11-29 20:00', platform: ['Instagram'], engagement: 0 },
  { id: '4', title: 'Thread sobre Educação', type: 'text', status: 'rascunho', platform: ['Twitter/X'], engagement: 0 },
];

const assetLibrary = [
  { id: '1', name: 'Logo Campanha.png', type: 'image', size: '245 KB', date: '2025-11-20' },
  { id: '2', name: 'Vídeo Abertura.mp4', type: 'video', size: '12 MB', date: '2025-11-22' },
  { id: '3', name: 'Manual Marca.pdf', type: 'document', size: '1.2 MB', date: '2025-11-15' },
  { id: '4', name: 'Jingle Campanha.mp3', type: 'audio', size: '4.5 MB', date: '2025-11-18' },
];

export const MarketingAdvancedView: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showModal, setShowModal] = useState(false);
  const [newContent, setNewContent] = useState({
    title: '',
    type: 'image' as ContentItem['type'],
    scheduledDate: '',
    scheduledTime: '',
    platforms: [] as string[],
    description: ''
  });

  const handleSubmitContent = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newContent.title || !newContent.scheduledDate || !newContent.scheduledTime) {
      alert('⚠️ Preencha todos os campos obrigatórios!');
      return;
    }

    if (newContent.platforms.length === 0) {
      alert('⚠️ Selecione pelo menos uma plataforma!');
      return;
    }

    alert(`✅ Conteúdo agendado com sucesso!\n\nTítulo: ${newContent.title}\nTipo: ${newContent.type}\nData: ${newContent.scheduledDate} às ${newContent.scheduledTime}\nPlataformas: ${newContent.platforms.join(', ')}\n\nO conteúdo aparecerá no calendário de publicações.`);
    
    setNewContent({
      title: '',
      type: 'image',
      scheduledDate: '',
      scheduledTime: '',
      platforms: [],
      description: ''
    });
    setShowModal(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'agendado': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'publicado': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'rascunho': return 'bg-slate-100 text-slate-700 border-slate-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      case 'text': return <FileText className="w-4 h-4" />;
      case 'carousel': return <Image className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Marketing Digital Avançado</h2>
        <div className="flex gap-2">
          <button 
            onClick={() => alert('🤖 Gerador de conteúdo com IA em desenvolvimento!\n\nEm breve você poderá criar posts, legendas e roteiros automaticamente com base nas suas propostas.')}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Gerar com IA
          </button>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Novo Conteúdo
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="w-8 h-8 text-blue-500" />
            <span className="text-2xl font-bold text-blue-600">{mockContent.filter(c => c.status === 'agendado').length}</span>
          </div>
          <p className="text-sm text-slate-600">Conteúdos Agendados</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-8 h-8 text-emerald-500" />
            <span className="text-2xl font-bold text-emerald-600">{mockContent.filter(c => c.status === 'publicado').length}</span>
          </div>
          <p className="text-sm text-slate-600">Publicados</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <AlertCircle className="w-8 h-8 text-amber-500" />
            <span className="text-2xl font-bold text-amber-600">{mockContent.filter(c => c.status === 'rascunho').length}</span>
          </div>
          <p className="text-sm text-slate-600">Rascunhos</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <Image className="w-8 h-8 text-purple-500" />
            <span className="text-2xl font-bold text-purple-600">{assetLibrary.length}</span>
          </div>
          <p className="text-sm text-slate-600">Assets na Biblioteca</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendário Editorial */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Calendário Editorial
              </h3>
              <input 
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-3">
              {mockContent
                .filter(c => c.scheduledDate && c.scheduledDate.startsWith(selectedDate))
                .map((content) => (
                  <div key={content.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-blue-300 transition-all">
                    <div className="p-2 bg-white rounded-lg border border-slate-200">
                      {getTypeIcon(content.type)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-800">{content.title}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <Clock className="w-3 h-3" />
                          {content.scheduledDate?.split(' ')[1]}
                        </span>
                        <div className="flex gap-1">
                          {content.platform.map((p) => (
                            <span key={p} className="text-[10px] bg-white px-2 py-0.5 rounded border border-slate-200">
                              {p}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(content.status)}`}>
                      {content.status}
                    </span>
                  </div>
                ))}
              
              {mockContent.filter(c => c.scheduledDate && c.scheduledDate.startsWith(selectedDate)).length === 0 && (
                <div className="text-center py-8 text-slate-400">
                  <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Nenhum conteúdo agendado para esta data</p>
                </div>
              )}
            </div>
          </div>

          {/* Lista de Todo o Conteúdo */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Todos os Conteúdos</h3>
            <div className="space-y-3">
              {mockContent.map((content) => (
                <div key={content.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    {getTypeIcon(content.type)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-800">{content.title}</h4>
                    <div className="flex items-center gap-3 mt-1">
                      {content.scheduledDate && (
                        <span className="text-xs text-slate-500">
                          {new Date(content.scheduledDate).toLocaleDateString('pt-BR')} às {content.scheduledDate.split(' ')[1]}
                        </span>
                      )}
                      {content.engagement > 0 && (
                        <span className="text-xs text-emerald-600 font-medium">
                          {content.engagement.toLocaleString()} interações
                        </span>
                      )}
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(content.status)}`}>
                    {content.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Biblioteca de Assets */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Image className="w-5 h-5 text-purple-600" />
                Biblioteca de Assets
              </h3>
              <button className="p-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors">
                <Upload className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2">
              {assetLibrary.map((asset) => (
                <div key={asset.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-purple-300 transition-all cursor-pointer">
                  <div className="p-2 bg-white rounded border border-slate-200">
                    {asset.type === 'image' && <Image className="w-4 h-4 text-purple-600" />}
                    {asset.type === 'video' && <Video className="w-4 h-4 text-blue-600" />}
                    {asset.type === 'document' && <FileText className="w-4 h-4 text-slate-600" />}
                    {asset.type === 'audio' && <FileText className="w-4 h-4 text-emerald-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{asset.name}</p>
                    <p className="text-xs text-slate-500">{asset.size}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Gerador de Conteúdo com IA */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-purple-500 rounded-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Gerador com IA</h3>
                <p className="text-sm text-slate-600 mt-1">Crie conteúdo automaticamente</p>
              </div>
            </div>
            <div className="space-y-2">
              <button className="w-full p-3 bg-white text-left rounded-lg border border-purple-200 hover:border-purple-400 transition-all text-sm">
                <span className="font-medium text-slate-800">✨ Gerar legenda para Instagram</span>
              </button>
              <button className="w-full p-3 bg-white text-left rounded-lg border border-purple-200 hover:border-purple-400 transition-all text-sm">
                <span className="font-medium text-slate-800">🎬 Script para vídeo curto</span>
              </button>
              <button className="w-full p-3 bg-white text-left rounded-lg border border-purple-200 hover:border-purple-400 transition-all text-sm">
                <span className="font-medium text-slate-800">📝 Thread para Twitter/X</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Novo Conteúdo */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">Novo Conteúdo</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600" title="Fechar">
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>

            <form onSubmit={handleSubmitContent} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Título do Conteúdo *
                </label>
                <input
                  type="text"
                  value={newContent.title}
                  onChange={(e) => setNewContent({...newContent, title: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Tipo de Conteúdo *
                  </label>
                  <select
                    value={newContent.type}
                    onChange={(e) => setNewContent({...newContent, type: e.target.value as ContentItem['type']})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="image">Imagem</option>
                    <option value="video">Vídeo</option>
                    <option value="text">Texto</option>
                    <option value="carousel">Carrossel</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Data de Publicação *
                  </label>
                  <input
                    type="date"
                    value={newContent.scheduledDate}
                    onChange={(e) => setNewContent({...newContent, scheduledDate: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Horário *
                  </label>
                  <input
                    type="time"
                    value={newContent.scheduledTime}
                    onChange={(e) => setNewContent({...newContent, scheduledTime: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Plataformas *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {['Instagram', 'Facebook', 'TikTok', 'YouTube', 'Twitter/X', 'LinkedIn'].map(platform => (
                    <label key={platform} className="flex items-center gap-2 p-3 border border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newContent.platforms.includes(platform)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewContent({...newContent, platforms: [...newContent.platforms, platform]});
                          } else {
                            setNewContent({...newContent, platforms: newContent.platforms.filter(p => p !== platform)});
                          }
                        }}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm text-slate-700">{platform}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Descrição/Legenda
                </label>
                <textarea
                  value={newContent.description}
                  onChange={(e) => setNewContent({...newContent, description: e.target.value})}
                  rows={4}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Digite a legenda ou descrição do conteúdo..."
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
                  Criar Conteúdo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
