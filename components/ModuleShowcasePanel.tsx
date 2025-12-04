import React from 'react';
import { X, Lock, Unlock } from 'lucide-react';
import type { ModuleDefinition, ModuleKey, ModuleStateMap } from '../types';
import { PLAN_ORDER } from '../config/moduleConfig';

interface ModuleShowcasePanelProps {
  modules: ModuleDefinition[];
  enabledModules: ModuleStateMap;
  onToggle: (key: ModuleKey, enabled: boolean) => void;
  onClose: () => void;
}

const planColor: Record<string, string> = {
  Starter: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Growth: 'bg-blue-50 text-blue-700 border-blue-200',
  Scale: 'bg-purple-50 text-purple-700 border-purple-200',
};

export const ModuleShowcasePanel: React.FC<ModuleShowcasePanelProps> = ({ modules, enabledModules, onToggle, onClose }) => {
  return (
    <aside className="fixed bottom-6 right-6 z-50 w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Roadmap de Pacotes</p>
          <h2 className="text-lg font-semibold text-slate-900">Ative módulos ao vivo</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          aria-label="Fechar painel de módulos"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="max-h-96 space-y-6 overflow-y-auto px-5 py-4">
        {PLAN_ORDER.map((plan) => {
          const planModules = modules.filter((module) => module.plan === plan && module.showInNavigation);
          if (!planModules.length) {
            return null;
          }

          return (
            <section key={plan}>
              <div className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${planColor[plan] ?? 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                Plano {plan}
              </div>

              <ul className="mt-3 space-y-3">
                {planModules.map((module) => {
                  const iconClass = enabledModules[module.key] ? 'text-emerald-500' : 'text-slate-400';
                  const Icon = module.icon;
                  const isEnabled = enabledModules[module.key];

                  return (
                    <li key={module.key} className="rounded-xl border border-slate-200 px-4 py-3 shadow-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex flex-1 items-start gap-3">
                          <div className={`mt-1 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 ${iconClass}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{module.label}</p>
                            <p className="text-xs text-slate-500">{module.description}</p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => onToggle(module.key, !isEnabled)}
                          disabled={!module.gateable}
                          className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold transition ${
                            isEnabled
                              ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300'
                              : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                          } ${module.gateable ? '' : 'cursor-not-allowed opacity-60'}`}
                        >
                          {isEnabled ? <Unlock className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                          {isEnabled ? 'Ativo' : module.gateable ? 'Habilitar' : 'Sempre ativo'}
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </aside>
  );
};
