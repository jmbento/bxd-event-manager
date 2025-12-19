import React, { useState } from 'react';
import { 
  MousePointer2, 
  StickyNote, 
  Sparkles, 
  Image as ImageIcon, 
  Link2, 
  Square,
  MapPin,
  Ruler,
  ChevronRight,
  PlusCircle,
  Layers,
  Palette
} from 'lucide-react';
import { PageBanner } from './PageBanner';

interface TemplateStructure {
  id: string;
  label: string;
  width: number;
  height: number;
  color: string;
  dimensions: string;
  description: string;
}

const TEMPLATE_STRUCTURES: TemplateStructure[] = [
  {
    id: 'lounge',
    label: 'Lounge VIP',
    width: 400,
    height: 400,
    color: '#8b5cf6',
    dimensions: '20m x 20m',
    description: 'Área coberta para parceiros e lounges.',
  },
  {
    id: 'container',
    label: 'Contêiner Backstage',
    width: 220,
    height: 160,
    color: '#38bdf8',
    dimensions: '2 módulos 12m',
    description: 'Camarim, camarim rápido e produção.',
  },
  {
    id: 'bar',
    label: 'Bar & Beverage',
    width: 220,
    height: 140,
    color: '#f97316',
    dimensions: '8m x 6m',
    description: 'Estação rápida para bebidas.',
  },
  {
    id: 'stand',
    label: 'Estande Ativação',
    width: 180,
    height: 120,
    color: '#facc15',
    dimensions: '6m x 4m',
    description: 'Brand experience para patrocinadores.',
  },
  {
    id: 'fence',
    label: 'Fechamento Técnico',
    width: 320,
    height: 60,
    color: '#64748b',
    dimensions: 'Segmento linear',
    description: 'Gradil ou isolamento temporário.',
  },
  {
    id: 'parking',
    label: 'Estacionamento',
    width: 480,
    height: 260,
    color: '#0ea5e9',
    dimensions: '120 vagas',
    description: 'Área de estacionamento e shuttle.',
  },
  {
    id: 'gate',
    label: 'Portais & Triagem',
    width: 260,
    height: 180,
    color: '#f87171',
    dimensions: '4 linhas',
    description: 'Check-in, revista e ticketing.',
  },
  {
    id: 'isolation',
    label: 'Isolamento',
    width: 320,
    height: 80,
    color: '#fda4af',
    dimensions: 'Linha crítica',
    description: 'Zona de acesso restrito.',
  },
];

export const EventCanvasView: React.FC = () => {
  const [structures, setStructures] = useState<any[]>([]);
  const [selectedTool, setSelectedTool] = useState<string>('cursor');

  const handleStructureDrop = (structure: TemplateStructure) => {
    const newStructure = {
      id: `structure-${Date.now()}`,
      ...structure,
      x: 200 + Math.random() * 300,
      y: 200 + Math.random() * 300,
    };
    setStructures(prev => [...prev, newStructure]);
  };

  return (
    <div className="space-y-6">
      <PageBanner pageKey="event-canvas" />
      
      <div className="grid grid-cols-[260px_1fr_280px] gap-6 h-[calc(100vh-12rem)]">
      {/* Toolbar */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 overflow-y-auto">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-2">Canvas de Eventos</h2>
          <p className="text-sm text-slate-600">Planeje e organize a estrutura de seus eventos</p>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-slate-900 mb-3">Ferramentas</h3>
            <div className="space-y-2">
              {[
                { id: 'cursor', icon: MousePointer2, label: 'Cursor' },
                { id: 'sticky', icon: StickyNote, label: 'Nota' },
                { id: 'frame', icon: Square, label: 'Área' },
                { id: 'connector', icon: Link2, label: 'Conectar' },
              ].map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => setSelectedTool(tool.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    selectedTool === tool.id
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <tool.icon className="h-5 w-5" />
                  <span>{tool.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Canvas */}
      <section className="relative rounded-3xl border border-slate-200 bg-gray-50 overflow-hidden">
        <div className="absolute top-4 left-4 bg-white rounded-lg px-3 py-2 shadow-sm">
          <p className="text-sm text-slate-600">Ferramenta: <strong>{selectedTool}</strong></p>
        </div>

        <div className="w-full h-full relative">
          {/* Grid Background */}
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }}
          />

          {/* Rendered Structures */}
          {structures.map((structure) => (
            <div
              key={structure.id}
              className="absolute border-2 border-dashed rounded-lg flex flex-col justify-center items-center text-white font-semibold text-sm p-4"
              style={{
                left: structure.x,
                top: structure.y,
                width: structure.width / 2, // Scale down for display
                height: structure.height / 2, // Scale down for display
                backgroundColor: structure.color,
                borderColor: structure.color,
              }}
            >
              <div className="text-center">
                <p className="font-bold">{structure.label}</p>
                <p className="text-xs opacity-90">{structure.dimensions}</p>
              </div>
            </div>
          ))}

          {structures.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Layers className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-slate-900 mb-2">Canvas Vazio</p>
                <p className="text-sm text-slate-600">Adicione estruturas do painel lateral</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Structure Library */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 overflow-y-auto">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-2">Estruturas</h2>
          <p className="text-sm text-slate-600">Clique para adicionar ao canvas</p>
        </div>

        <div className="space-y-3">
          {TEMPLATE_STRUCTURES.map((structure) => (
            <button
              key={structure.id}
              onClick={() => handleStructureDrop(structure)}
              className="w-full text-left p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all group"
            >
              <div className="flex items-center gap-3 mb-2">
                <div 
                  className="w-4 h-4 rounded" 
                  style={{ backgroundColor: structure.color }}
                />
                <h4 className="font-medium text-slate-900 group-hover:text-blue-600 transition-colors">
                  {structure.label}
                </h4>
              </div>
              <p className="text-xs text-slate-600 mb-1">{structure.dimensions}</p>
              <p className="text-xs text-slate-500">{structure.description}</p>
            </button>
          ))}
        </div>

        <div className="mt-6 p-4 bg-slate-50 rounded-lg">
          <p className="text-xs text-slate-600">
            <strong>Dica:</strong> Use o canvas para planejar a logística de eventos, 
            posicionando estruturas e criando conexões entre elas.
          </p>
        </div>
      </section>
    </div>
  );
};