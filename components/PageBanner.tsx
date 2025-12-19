import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PageBannerProps {
  title: string;
  subtitle: string;
  storageKey: string;
  defaultImages?: string[];
}

export const PageBanner: React.FC<PageBannerProps> = ({ 
  title, 
  subtitle, 
  storageKey,
  defaultImages = [
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&h=300&fit=crop',
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&h=300&fit=crop',
    'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1200&h=300&fit=crop',
  ]
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  
  const [images, setImages] = useState<string[]>(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) return JSON.parse(saved);
    return defaultImages;
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(images));
  }, [images, storageKey]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  useEffect(() => {
    const handleClick = () => setShowMenu(false);
    if (showMenu) {
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [showMenu]);

  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setMenuPosition({ x: e.clientX, y: e.clientY });
    setShowMenu(true);
  };

  const handleChangeImage = () => {
    const url = prompt('Cole a URL da imagem (deixe vazio para Unsplash aleatório):');
    if (url === null) return;
    const newUrl = url.trim() || `https://source.unsplash.com/1200x300/?event,${Date.now()}`;
    const updated = [...images];
    updated[currentIndex] = newUrl;
    setImages(updated);
    setShowMenu(false);
  };

  const handleAddImage = () => {
    const url = prompt('Cole a URL da nova imagem:');
    if (url && url.trim()) {
      setImages([...images, url.trim()]);
    }
    setShowMenu(false);
  };

  const handleRemoveImage = () => {
    if (images.length > 1 && confirm('Remover esta imagem?')) {
      const updated = images.filter((_, i) => i !== currentIndex);
      setImages(updated);
      setCurrentIndex(0);
    }
    setShowMenu(false);
  };

  return (
    <>
      <div 
        className="relative w-full h-48 rounded-xl overflow-hidden group cursor-pointer"
        onContextMenu={handleRightClick}
      >
        <img 
          src={images[currentIndex]} 
          alt={title}
          className="w-full h-full object-cover transition-opacity duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        
        <button
          onClick={() => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={() => setCurrentIndex((prev) => (prev + 1) % images.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex ? 'bg-white w-8' : 'bg-white/50'
              }`}
            />
          ))}
        </div>

        <div className="absolute bottom-6 left-6 text-white">
          <h3 className="text-2xl font-bold mb-1">{title}</h3>
          <p className="text-sm text-white/90">{subtitle} • Clique direito para trocar imagem</p>
        </div>
      </div>

      {showMenu && (
        <div
          className="fixed bg-white rounded-lg shadow-xl border border-slate-200 py-1 z-50"
          style={{ top: menuPosition.y, left: menuPosition.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleChangeImage}
            className="w-full px-4 py-2 text-left text-sm hover:bg-slate-100 flex items-center gap-2"
          >
            🖼️ Trocar esta imagem
          </button>
          <button
            onClick={handleAddImage}
            className="w-full px-4 py-2 text-left text-sm hover:bg-slate-100 flex items-center gap-2"
          >
            ➕ Adicionar nova imagem
          </button>
          {images.length > 1 && (
            <button
              onClick={handleRemoveImage}
              className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
            >
              🗑️ Remover esta imagem
            </button>
          )}
        </div>
      )}
    </>
  );
};
