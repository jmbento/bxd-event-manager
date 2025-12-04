import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { ObjectType, ObjectDefinition } from '../../types/event3D';

interface Props {
    onAddObject: (type: ObjectType, name: string) => void;
}

const OBJECT_LIBRARY: ObjectDefinition[] = [
    // Estruturas
    { type: 'tent', name: 'Tenda 3x3m', description: 'Tenda piramidal branca', icon: '⛺', defaultDimensions: { width: 3, height: 3, depth: 3 }, defaultCost: 150, category: 'structure' },
    { type: 'tent', name: 'Tenda 6x6m', description: 'Tenda grande', icon: '⛺', defaultDimensions: { width: 6, height: 4, depth: 6 }, defaultCost: 400, category: 'structure' },
    { type: 'stage', name: 'Palco Pequeno', description: '4x3m', icon: '🎭', defaultDimensions: { width: 4, height: 1, depth: 3 }, defaultCost: 800, category: 'structure' },
    { type: 'stage', name: 'Palco Grande', description: '10x6m', icon: '🎭', defaultDimensions: { width: 10, height: 1.5, depth: 6 }, defaultCost: 2000, category: 'structure' },
    { type: 'truss', name: 'Box Truss 3m', description: 'Estrutura metálica', icon: '🔲', defaultDimensions: { width: 3, height: 0.3, depth: 0.3 }, defaultCost: 100, category: 'structure' },
    { type: 'fence', name: 'Gradil 2m', description: 'Cerca metálica', icon: '🚧', defaultDimensions: { width: 2, height: 1.2, depth: 0.1 }, defaultCost: 25, category: 'structure' },
    { type: 'closure', name: 'Fechamento Lateral', description: 'Lona branca', icon: '📋', defaultDimensions: { width: 3, height: 2.5, depth: 0.05 }, defaultCost: 50, category: 'structure' },

    // Equipamentos
    { type: 'screen', name: 'Telão LED 3x2m', description: 'Tela de LED', icon: '📺', defaultDimensions: { width: 3, height: 2, depth: 0.2 }, defaultCost: 1500, category: 'equipment' },
    { type: 'speaker', name: 'Caixa de Som', description: 'Line array', icon: '🔊', defaultDimensions: { width: 0.5, height: 1, depth: 0.5 }, defaultCost: 300, category: 'equipment' },
    { type: 'light', name: 'Refletor LED', description: 'Iluminação', icon: '💡', defaultDimensions: { width: 0.3, height: 0.4, depth: 0.3 }, defaultCost: 80, category: 'equipment' },
    { type: 'generator', name: 'Gerador 15kVA', description: 'Gerador diesel', icon: '⚡', defaultDimensions: { width: 1, height: 1.2, depth: 0.7 }, defaultCost: 500, category: 'equipment' },

    // Decoração
    { type: 'totem', name: 'Totem Banner', description: '2m altura', icon: '🪧', defaultDimensions: { width: 0.8, height: 2, depth: 0.3 }, defaultCost: 120, category: 'decoration' },
    { type: 'tree', name: 'Árvore Decorativa', description: 'Palmeira artificial', icon: '🌴', defaultDimensions: { width: 2, height: 4, depth: 2 }, defaultCost: 200, category: 'decoration' },

    // Mobiliário
    { type: 'table', name: 'Mesa Plástica', description: 'Mesa branca', icon: '🪑', defaultDimensions: { width: 1.2, height: 0.75, depth: 0.7 }, defaultCost: 15, category: 'furniture' },
    { type: 'chair', name: 'Cadeira Plástica', description: 'Cadeira branca', icon: '💺', defaultDimensions: { width: 0.5, height: 0.9, depth: 0.5 }, defaultCost: 5, category: 'furniture' },
];

export const ObjectLibrary: React.FC<Props> = ({ onAddObject }) => {
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['structure', 'equipment']));

    const toggleCategory = (category: string) => {
        setExpandedCategories(prev => {
            const next = new Set(prev);
            if (next.has(category)) {
                next.delete(category);
            } else {
                next.add(category);
            }
            return next;
        });
    };

    const categoryNames = {
        structure: 'Estruturas',
        equipment: 'Equipamentos',
        decoration: 'Decoração',
        furniture: 'Mobiliário',
    };

    const categories = ['structure', 'equipment', 'decoration', 'furniture'] as const;

    return (
        <div className="p-4">
            <h2 className="text-white font-bold mb-4 text-lg">Biblioteca de Objetos</h2>

            {categories.map(category => {
                const categoryObjects = OBJECT_LIBRARY.filter(obj => obj.category === category);
                const isExpanded = expandedCategories.has(category);

                return (
                    <div key={category} className="mb-4">
                        <button
                            onClick={() => toggleCategory(category)}
                            className="w-full flex items-center justify-between p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white transition-colors mb-2"
                        >
                            <span className="font-semibold text-sm">{categoryNames[category]}</span>
                            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </button>

                        {isExpanded && (
                            <div className="space-y-1">
                                {categoryObjects.map(obj => (
                                    <button
                                        key={`${obj.type}-${obj.name}`}
                                        onClick={() => onAddObject(obj.type, obj.name)}
                                        className="w-full flex items-center gap-3 p-3 bg-slate-700/50 hover:bg-slate-600 rounded-lg transition-colors text-left group"
                                    >
                                        <span className="text-2xl">{obj.icon}</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white text-sm font-medium truncate">{obj.name}</p>
                                            <p className="text-slate-400 text-xs truncate">{obj.description}</p>
                                            <p className="text-green-400 text-xs mt-0.5">
                                                R$ {obj.defaultCost?.toLocaleString('pt-BR') || '0'}
                                            </p>
                                        </div>
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="text-blue-400 text-xs">+</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                );
            })}

            <div className="mt-6 p-3 bg-blue-900/30 rounded-lg border border-blue-700">
                <p className="text-blue-300 text-xs">
                    💡 <strong>Dica:</strong> Clique em um objeto para adicioná-lo ao centro do terreno.
                </p>
            </div>
        </div>
    );
};
