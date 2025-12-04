import React from 'react';
import { MousePointer2, Navigation, Footprints, Trees, Square, Minus, Eraser } from 'lucide-react';
import type { DrawingTool } from '../../types/event3D';

interface Props {
    selectedTool: DrawingTool;
    onSelectTool: (tool: DrawingTool) => void;
}

const TOOLS: { id: DrawingTool; icon: React.ReactNode; label: string; color: string }[] = [
    { id: 'select', icon: <MousePointer2 />, label: 'Selecionar', color: 'bg-slate-600' },
    { id: 'street', icon: <Navigation />, label: 'Rua/Asfalto', color: 'bg-gray-700' },
    { id: 'sidewalk', icon: <Footprints />, label: 'Calçada', color: 'bg-stone-500' },
    { id: 'grass', icon: <Trees />, label: 'Grama', color: 'bg-green-600' },
    { id: 'carpet', icon: <Square />, label: 'Carpete', color: 'bg-red-600' },
    { id: 'line', icon: <Minus />, label: 'Linha', color: 'bg-blue-600' },
    { id: 'eraser', icon: <Eraser />, label: 'Borracha', color: 'bg-pink-600' },
];

export const DrawingToolbar: React.FC<Props> = ({ selectedTool, onSelectTool }) => {
    return (
        <div className="bg-slate-800/90 backdrop-blur-sm rounded-xl p-2 shadow-2xl">
            <div className="flex flex-col gap-1">
                {TOOLS.map(tool => (
                    <button
                        key={tool.id}
                        onClick={() => onSelectTool(tool.id)}
                        className={`
              flex items-center gap-2 px-3 py-2 rounded-lg transition-all
              ${selectedTool === tool.id
                                ? `${tool.color} text-white shadow-lg scale-105`
                                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}
            `}
                        title={tool.label}
                    >
                        <div className="w-5 h-5">
                            {tool.icon}
                        </div>
                        <span className="text-xs font-medium whitespace-nowrap">
                            {tool.label}
                        </span>
                    </button>
                ))}
            </div>

            <div className="mt-3 pt-3 border-t border-slate-700">
                <p className="text-slate-400 text-[10px] px-2">
                    {selectedTool === 'select' && 'Clique para selecionar objetos'}
                    {selectedTool === 'street' && 'Desenhe ruas e vias'}
                    {selectedTool === 'sidewalk' && 'Desenhe calçadas'}
                    {selectedTool === 'grass' && 'Pinte áreas gramadas'}
                    {selectedTool === 'carpet' && 'Aplique carpete'}
                    {selectedTool === 'line' && 'Desenhe linhas'}
                    {selectedTool === 'eraser' && 'Apague elementos'}
                </p>
            </div>
        </div>
    );
};
