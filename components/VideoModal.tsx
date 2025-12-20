import React from 'react';
import { X, Play } from 'lucide-react';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl?: string; // URL do YouTube
  title?: string;
}

export const VideoModal: React.FC<VideoModalProps> = ({ 
  isOpen, 
  onClose,
  videoUrl = '', // Placeholder - você vai adicionar a URL do YouTube depois
  title = 'BXD Event Manager - Demo'
}) => {
  if (!isOpen) return null;

  // Converte URL do YouTube para formato embed
  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    
    // Se já for URL embed, retorna
    if (url.includes('embed')) return url;
    
    // Extrai ID do vídeo de diferentes formatos
    const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    if (videoIdMatch) {
      return `https://www.youtube.com/embed/${videoIdMatch[1]}?autoplay=1&rel=0`;
    }
    
    return url;
  };

  const embedUrl = getEmbedUrl(videoUrl);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-5xl bg-slate-900 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-slate-800/50 border-b border-slate-700">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Vídeo ou placeholder */}
        <div className="relative bg-slate-950" style={{ paddingBottom: '56.25%' }}>
          {embedUrl ? (
            <iframe
              className="absolute inset-0 w-full h-full"
              src={embedUrl}
              title={title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            // Placeholder quando não há vídeo configurado
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mb-6">
                <Play className="w-10 h-10 text-blue-400" />
              </div>
              
              <h4 className="text-2xl font-bold text-white mb-3">
                Vídeo demo em breve!
              </h4>
              
              <p className="text-slate-400 mb-6 max-w-md">
                Estamos finalizando o vídeo de demonstração da plataforma.
                Em breve você poderá ver todas as funcionalidades do BXD Event Manager em ação! 🚀
              </p>

              <div className="flex flex-col gap-2 text-sm text-slate-500">
                <p>🎥 Gravação: Em andamento</p>
                <p>✂️ Edição: Aguardando</p>
                <p>📺 Publicação: Em breve no YouTube</p>
              </div>

              <div className="mt-8">
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:opacity-90 transition"
                >
                  Começar Trial Grátis
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer com instruções */}
        {!embedUrl && (
          <div className="p-4 bg-slate-800/30 border-t border-slate-700">
            <p className="text-xs text-slate-500 text-center">
              💡 Dica: Enquanto isso, teste gratuitamente por 15 dias com acesso completo a todos os recursos PRO!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
