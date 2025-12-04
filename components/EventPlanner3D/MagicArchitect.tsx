import React, { useState, useRef } from 'react';
import { Sparkles, Send, Loader2, Eye, X } from 'lucide-react';

interface Props {
    onGenerate: (command: LayoutCommand) => void;
    onVisionGenerate?: (command: LayoutCommand, imageData: string) => void;
    loading?: boolean;
}

export interface LayoutCommand {
    type: string;
    count: number;
    layout: 'row' | 'grid' | 'circle' | 'scattered';
    spacing?: number;
    radius?: number;
}

export const MagicArchitect: React.FC<Props> = ({ onGenerate, onVisionGenerate, loading = false }) => {
    const [prompt, setPrompt] = useState('');
    const [referenceImage, setReferenceImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validar tipo
        if (!file.type.startsWith('image/')) {
            alert('Por favor, selecione uma imagem válida');
            return;
        }

        // Converter para base64
        const reader = new FileReader();
        reader.onload = (event) => {
            const base64 = event.target?.result as string;
            setReferenceImage(base64);
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = () => {
        if (!prompt.trim() && !referenceImage) return;

        if (referenceImage && onVisionGenerate) {
            // Modo Vision AI - com imagem de referência
            onVisionGenerate(parsePromptSimple(prompt || 'Analisa esta imagem'), referenceImage);
        } else {
            // Modo texto simples
            const parsed = parsePromptSimple(prompt);
            if (parsed) {
                onGenerate(parsed);
                setPrompt('');
            }
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSubmit();
        }
    };

    const clearImage = () => {
        setReferenceImage(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 bg-slate-100 rounded-full px-4 py-2 border border-slate-300 max-w-md">
                <Sparkles className="w-5 h-5 text-indigo-500" />

                <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={referenceImage ? "Descreve o que queres... (opcional)" : "Ex: Cria uma fila de 10 cadeiras..."}
                    className="flex-1 bg-transparent outline-none text-sm placeholder-slate-400"
                    disabled={loading}
                />

                {/* Botão Olho Digital */}
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading}
                    className={`w-8 h-8 rounded-full ${referenceImage ? 'bg-green-500 hover:bg-green-600' : 'bg-slate-300 hover:bg-slate-400'} text-white flex items-center justify-center transition-all`}
                    title="Olho Digital - Upload de Referência"
                >
                    <Eye className="w-4 h-4" />
                </button>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                />

                <button
                    onClick={handleSubmit}
                    disabled={loading || (!prompt.trim() && !referenceImage)}
                    className="w-8 h-8 rounded-full bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-400 text-white flex items-center justify-center transition-all"
                >
                    {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Send className="w-4 h-4" />
                    )}
                </button>
            </div>

            {/* Preview da Imagem */}
            {referenceImage && (
                <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-green-500 shadow-lg">
                    <img
                        src={referenceImage}
                        alt="Referência"
                        className="w-full h-full object-cover"
                    />
                    <button
                        onClick={clearImage}
                        className="absolute top-1 right-1 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white"
                    >
                        <X className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 text-center">
                        👁️ Olho Digital
                    </div>
                </div>
            )}
        </div>
    );
};

/**
 * Parser simples de prompt (será substituído pela IA Gemini)
 */
function parsePromptSimple(prompt: string): LayoutCommand | null {
    const lower = prompt.toLowerCase();

    // Extrair número
    const numberMatch = prompt.match(/\d+/);
    const count = numberMatch ? parseInt(numberMatch[0]) : 5;

    // Detectar tipo de objeto
    let type = 'chair'; // default
    if (lower.includes('cadeira')) type = 'chair';
    if (lower.includes('mesa')) type = 'table';
    if (lower.includes('tenda')) type = 'tent';
    if (lower.includes('palco')) type = 'stage';
    if (lower.includes('torre') || lower.includes('truss')) type = 'truss';
    if (lower.includes('gradil') || lower.includes('cerca')) type = 'fence';
    if (lower.includes('totem')) type = 'totem';

    // Detectar layout
    let layout: 'row' | 'grid' | 'circle' | 'scattered' = 'row';
    if (lower.includes('fila') || lower.includes('linha')) layout = 'row';
    if (lower.includes('grade') || lower.includes('grid') || lower.includes('matriz')) layout = 'grid';
    if (lower.includes('círculo') || lower.includes('circulo') || lower.includes('arco')) layout = 'circle';
    if (lower.includes('espalhado') || lower.includes('aleatório') || lower.includes('aleatorio')) layout = 'scattered';

    return {
        type,
        count,
        layout,
        spacing: type === 'chair' ? 0.8 : 1.5,
    };
}
