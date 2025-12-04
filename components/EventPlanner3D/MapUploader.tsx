import React, { useState, useRef } from 'react';
import { Image, Upload, X, Check, Sliders } from 'lucide-react';

interface Props {
    onUpload: (imageUrl: string, opacity: number) => void;
    currentMapUrl?: string;
    currentOpacity?: number;
}

export const MapUploader: React.FC<Props> = ({ onUpload, currentMapUrl, currentOpacity = 0.7 }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(currentMapUrl || null);
    const [opacity, setOpacity] = useState(currentOpacity);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validar tipo de arquivo
        if (!file.type.startsWith('image/')) {
            alert('Por favor, selecione uma imagem (PNG, JPG, etc.)');
            return;
        }

        // Converter para base64
        const reader = new FileReader();
        reader.onload = (event) => {
            const dataUrl = event.target?.result as string;
            setPreviewUrl(dataUrl);
        };
        reader.readAsDataURL(file);
    };

    const handleApply = () => {
        if (previewUrl) {
            onUpload(previewUrl, opacity);
            setIsOpen(false);
        }
    };

    const handleRemove = () => {
        setPreviewUrl(null);
        onUpload('', 0);
        setIsOpen(false);
    };

    return (
        <>
            {/* Botão para abrir */}
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white transition-colors shadow-lg"
                title="Upload Mapa do Local"
            >
                <Image className="w-4 h-4" />
                <span>{currentMapUrl ? 'Editar Mapa' : 'Adicionar Mapa'}</span>
            </button>

            {/* Modal */}
            {isOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-800 rounded-xl shadow-2xl max-w-2xl w-full">
                        {/* Header */}
                        <div className="p-6 border-b border-slate-700 flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Image className="w-5 h-5 text-indigo-400" />
                                    Mapa do Local do Evento
                                </h2>
                                <p className="text-sm text-slate-400 mt-1">
                                    Faça upload da planta ou foto aérea para desenhar sobre
                                </p>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-700 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6">
                            {/* Upload Area */}
                            {!previewUrl ? (
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed border-slate-600 rounded-xl p-12 text-center hover:border-indigo-500 hover:bg-slate-700/30 transition-all cursor-pointer"
                                >
                                    <Upload className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                                    <p className="text-white font-medium mb-2">
                                        Clique para fazer upload da imagem
                                    </p>
                                    <p className="text-sm text-slate-400">
                                        PNG, JPG, ou qualquer formato de imagem
                                    </p>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleFileSelect}
                                    />
                                </div>
                            ) : (
                                <>
                                    {/* Preview */}
                                    <div className="relative rounded-lg overflow-hidden border border-slate-700">
                                        <img
                                            src={previewUrl}
                                            alt="Preview do mapa"
                                            className="w-full h-64 object-contain bg-slate-900"
                                            style={{ opacity }}
                                        />
                                        <div className="absolute top-2 right-2">
                                            <button
                                                onClick={() => {
                                                    setPreviewUrl(null);
                                                    if (fileInputRef.current) {
                                                        fileInputRef.current.value = '';
                                                    }
                                                }}
                                                className="p-2 bg-red-600 hover:bg-red-700 rounded-lg text-white transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Opacity Control */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <label className="text-white font-medium flex items-center gap-2">
                                                <Sliders className="w-4 h-4 text-indigo-400" />
                                                Opacidade do Mapa
                                            </label>
                                            <span className="text-indigo-400 font-bold">
                                                {Math.round(opacity * 100)}%
                                            </span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="1"
                                            step="0.05"
                                            value={opacity}
                                            onChange={(e) => setOpacity(parseFloat(e.target.value))}
                                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                        />
                                        <p className="text-xs text-slate-400">
                                            Ajuste para ver melhor o grid e objetos sobre o mapa
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-slate-700 flex justify-between">
                            {previewUrl && currentMapUrl && (
                                <button
                                    onClick={handleRemove}
                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white transition-colors"
                                >
                                    Remover Mapa
                                </button>
                            )}
                            <div className="flex gap-3 ml-auto">
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white transition-colors"
                                >
                                    Cancelar
                                </button>
                                {previewUrl && (
                                    <button
                                        onClick={handleApply}
                                        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white transition-colors flex items-center gap-2"
                                    >
                                        <Check className="w-4 h-4" />
                                        Aplicar
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
