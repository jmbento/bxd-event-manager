
import React from 'react';
import { Bell, CalendarClock, Lock, SquareStack, UserCircle, Settings } from 'lucide-react';
import type { EventProfile, ModuleDefinition, ModuleKey, ModuleStateMap } from '../types';

interface HeaderProps {
  daysLeft: number;
  currentView: ModuleKey;
  onNavigate: (view: ModuleKey) => void;
  modules: ModuleDefinition[];
  enabledModules: ModuleStateMap;
  onOpenModulePanel: () => void;
  profile: EventProfile;
}
export const Header: React.FC<HeaderProps> = React.memo(({
  daysLeft,
  currentView,
  onNavigate,
  modules,
  enabledModules,
  onOpenModulePanel,
  profile,
}) => {
  const navigationModules = React.useMemo(() => 
    modules.filter((module) => module.showInNavigation), 
    [modules]
  );

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Greeting / Profile Brand */}
          <button 
            type="button"
            className="flex items-center space-x-3 cursor-pointer hover:bg-slate-50 rounded-lg p-2 transition-colors" 
            onClick={() => onNavigate('profile')}
            aria-label={`Evento ${profile.eventName}, ${profile.edition}`}
            title="Ir para configurações do evento"
          >
             <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-slate-100 relative">
                {profile.logoUrl ? (
                    <img src={profile.logoUrl} alt={`Logo do ${profile.eventName}`} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white">
                        <UserCircle className="w-6 h-6" aria-hidden="true" />
                    </div>
                )}
             </div>
             <div className="flex flex-col">
                <h1 className="text-sm font-bold text-slate-900 leading-tight">
                    {profile.eventName} <span className="text-purple-600">{profile.edition}</span>
                </h1>
                <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">
                    {profile.eventType} • {profile.organizer}
                </span>
             </div>
          </button>

          {/* Center Widget - Countdown */}
          <div 
            className="hidden lg:flex items-center space-x-2 bg-gradient-to-r from-purple-50 to-blue-50 px-4 py-1.5 rounded-full border border-purple-200"
            role="status"
            aria-live="polite"
            aria-label={`Countdown: faltam ${daysLeft} dias para abertura dos portões`}
          >
            <CalendarClock className="w-4 h-4 text-purple-600" aria-hidden="true" />
            <span className="text-sm font-semibold text-purple-900">
              Countdown: Abertura dos Portões em <span className="text-purple-600 text-lg">{daysLeft}</span> dias
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            <button
              type="button"
              className="p-2 text-slate-400 hover:text-slate-600 transition-colors relative"
              aria-label="Abrir notificações"
            >
              <Bell className="w-6 h-6" />
              <span className="absolute top-1.5 right-1.5 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white"></span>
            </button>

            <button
              type="button"
              onClick={onOpenModulePanel}
              className="hidden md:flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500 transition hover:border-purple-200 hover:text-purple-600"
              aria-label="Gerenciar módulos do evento"
              title="Credencial Mestre"
            >
              <SquareStack className="h-4 w-4" aria-hidden="true" />
              Credencial Mestre
            </button>
            
            <button 
              type="button"
              onClick={() => onNavigate('profile')}
              className="hidden md:flex p-2 text-slate-400 hover:text-purple-600 transition-colors"
              aria-label="Configurações do evento"
              title="Configurações do Evento"
            >
              <Settings className="w-6 h-6" aria-hidden="true" />
            </button>
          </div>
        </div>
        
        {/* Navigation Tabs */}
        <nav 
          className="flex space-x-1 overflow-x-auto no-scrollbar -mb-px pt-2"
          role="tablist"
          aria-label="Navegação principal do painel"
        >
          {navigationModules.map((module) => {
            const Icon = module.icon;
            const isEnabled = enabledModules[module.key];
            const isActive = currentView === module.key;
            return (
              <button
                key={module.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`${module.key}-panel`}
                onClick={() => onNavigate(module.key)}
                title={isEnabled ? module.label : `Disponível no plano ${module.plan}`}
                aria-label={`${module.label}${!isEnabled ? ` (Disponível no plano ${module.plan})` : ''}${isActive ? ' - Ativo' : ''}`}
                disabled={!isEnabled}
                className={`
                  flex items-center space-x-2 px-3 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors
                  ${isActive && isEnabled
                    ? 'border-blue-600 text-blue-600'
                    : isEnabled
                      ? 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                      : isActive
                        ? 'border-amber-300 text-amber-600'
                        : 'border-transparent text-slate-400 hover:text-slate-500 hover:border-slate-300 cursor-not-allowed'}
                `}
              >
                <Icon className={`w-4 h-4 ${isActive && isEnabled ? 'text-blue-600' : isEnabled ? 'text-slate-400' : isActive ? 'text-amber-500' : 'text-slate-300'}`} aria-hidden="true" />
                <span>{module.label}</span>
                {!isEnabled && (
                  <Lock className="h-3.5 w-3.5 text-slate-300" aria-hidden="true" />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
});
