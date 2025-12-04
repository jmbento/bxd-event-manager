import React from 'react';
import { Lock, ArrowRight } from 'lucide-react';
import type { ModuleDefinition, ModuleKey } from '../types';

interface ModuleGateProps {
  module: ModuleDefinition;
  onEnable: (moduleKey: ModuleKey) => void;
  onOpenPanel: () => void;
}

export const ModuleGate: React.FC<ModuleGateProps> = ({ module, onEnable, onOpenPanel }) => {
  const Icon = module.icon;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center shadow-sm">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-500">
        <Icon className="h-8 w-8" />
      </div>
      <h2 className="text-2xl font-semibold text-slate-900">{module.label}</h2>
      <p className="mt-3 text-sm text-slate-500">
        {module.description}
      </p>
      <div className="mt-6 inline-flex items-center rounded-full bg-amber-50 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700">
        Plano {module.plan}
      </div>

      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => onEnable(module.key)}
          className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          Habilitar agora
          <ArrowRight className="ml-2 h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onOpenPanel}
          className="inline-flex items-center justify-center rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-800"
        >
          <Lock className="mr-2 h-4 w-4" />
          Ver roadmap de módulos
        </button>
      </div>
    </div>
  );
};
