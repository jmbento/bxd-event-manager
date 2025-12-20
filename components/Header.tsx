
import React from 'react';
import { Bell, CalendarClock, Lock, SquareStack, UserCircle, Settings, Trash2 } from 'lucide-react';
import type { EventProfile, ModuleDefinition, ModuleKey, ModuleStateMap, SystemUser } from '../types';

interface HeaderProps {
  daysLeft: number;
  currentView: ModuleKey;
  onNavigate: (view: ModuleKey) => void;
  modules: ModuleDefinition[];
  enabledModules: ModuleStateMap;
  onOpenModulePanel: () => void;
  profile: EventProfile;
  currentUser?: SystemUser | null;
  organizationPlan?: string;
}
export const Header: React.FC<HeaderProps> = React.memo(({
  daysLeft,
  currentView,
  onNavigate,
  modules,
  enabledModules,
  onOpenModulePanel,
  profile,
  currentUser,
  organizationPlan = 'starter',
}) => {
  const navigationModules = React.useMemo(() => 
    modules.filter((module) => module.showInNavigation), 
    [modules]
  );

  const planBadge = React.useMemo(() => {
    const plan = organizationPlan?.toLowerCase();
    if (plan === 'enterprise') return { label: 'ENTERPRISE', color: 'from-purple-500 to-purple-700' };
    if (plan === 'pro') return { label: 'PRO', color: 'from-blue-500 to-blue-700' };
    return { label: 'STARTER', color: 'from-slate-500 to-slate-700' };
  }, [organizationPlan]);

  const getUserInitials = (name?: string, email?: string) => {
    if (name && name !== 'Usuário') {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return 'U';
  };

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
              aria-label="Lixeira"
              title="Itens excluídos"
            >
              <Trash2 className="w-5 h-5" />
            </button>

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

            {/* Badge do Plano */}
            <div className={`hidden lg:flex px-3 py-1.5 rounded-full bg-gradient-to-r ${planBadge.color} text-white text-xs font-bold tracking-wider shadow-lg`}>
              {planBadge.label}
            </div>

            {/* Avatar do Usuário */}
            <button
              type="button"
              onClick={() => onNavigate('settings')}
              className="relative"
              aria-label={`Perfil de ${currentUser?.name || 'usuário'}`}
              title={currentUser?.email || 'Ver perfil'}
            >
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-green-400 relative shadow-md hover:border-green-500 transition-colors">
                {currentUser?.photoUrl ? (
                  <img 
                    src={currentUser.photoUrl} 
                    alt={currentUser.name || 'Avatar'} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold">
                    {getUserInitials(currentUser?.name, currentUser?.email)}
                  </div>
                )}
              </div>
              {/* Status online */}
              <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 ring-2 ring-white"></span>
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
