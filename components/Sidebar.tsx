import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  LogOut, 
  Crown,
  Zap,
  Lock
} from 'lucide-react';
import type { ModuleDefinition, ModuleKey, ModuleStateMap, EventProfile } from '../types';

interface SidebarProps {
  currentView: ModuleKey;
  onNavigate: (view: ModuleKey) => void;
  modules: ModuleDefinition[];
  enabledModules: ModuleStateMap;
  profile: EventProfile;
  organization?: {
    name: string;
    subscription_plan: string;
    subscription_status: string;
  } | null;
  onLogout: () => void;
  onUpgrade: () => void;
}

// Agrupar módulos por categoria
const moduleCategories = [
  {
    name: 'Principal',
    keys: ['dashboard', 'settings'],
  },
  {
    name: 'Gestão',
    keys: ['finance', 'advancedFinance', 'accounting', 'crm'],
  },
  {
    name: 'Operações',
    keys: ['agenda', 'staffManager', 'nfc', 'team', 'volunteers'],
  },
  {
    name: 'Materiais & Infra',
    keys: ['marketing'],
  },
  {
    name: 'Planejamento',
    keys: ['meetings', 'planning', 'planner3d', 'analytics', 'ecogestao'],
  },
  {
    name: 'Conformidade',
    keys: ['legal', 'compliance'],
  },
  {
    name: 'Ajuda',
    keys: ['help'],
  },
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  modules,
  enabledModules,
  profile,
  organization,
  onLogout,
  onUpgrade,
}) => {
  const [collapsed, setCollapsed] = useState(false);

  const getModuleByKey = (key: string) => modules.find(m => m.key === key);

  const planColors = {
    starter: 'from-blue-500 to-blue-600',
    pro: 'from-purple-500 to-purple-600',
    enterprise: 'from-amber-500 to-orange-500',
  };

  const planColor = planColors[organization?.subscription_plan as keyof typeof planColors] || planColors.starter;

  return (
    <aside 
      className={`
        fixed left-0 top-0 h-screen bg-slate-900 text-white z-50 
        transition-all duration-300 flex flex-col
        ${collapsed ? 'w-16' : 'w-64'}
      `}
    >
      {/* Header */}
      <div className={`p-4 border-b border-slate-800 ${collapsed ? 'px-2' : ''}`}>
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${planColor} flex items-center justify-center`}>
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-sm truncate max-w-[140px]">
                  {profile.eventName}
                </h1>
                <span className="text-xs text-slate-400">{profile.edition}</span>
              </div>
            </div>
          )}
          {collapsed && (
            <div className={`w-10 h-10 mx-auto rounded-xl bg-gradient-to-br ${planColor} flex items-center justify-center`}>
              <Zap className="w-5 h-5 text-white" />
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        {moduleCategories.map((category) => {
          const categoryModules = category.keys
            .map(key => getModuleByKey(key))
            .filter(Boolean) as ModuleDefinition[];
          
          if (categoryModules.length === 0) return null;

          return (
            <div key={category.name} className="mb-4">
              {!collapsed && (
                <h3 className="px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {category.name}
                </h3>
              )}
              <div className="space-y-1">
                {categoryModules.map((module) => {
                  const Icon = module.icon;
                  const isActive = currentView === module.key;
                  const isEnabled = enabledModules[module.key];

                  return (
                    <button
                      key={module.key}
                      onClick={() => onNavigate(module.key)}
                      disabled={!isEnabled}
                      title={collapsed ? module.label : undefined}
                      className={`
                        w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all
                        ${isActive 
                          ? 'bg-blue-600 text-white' 
                          : isEnabled 
                            ? 'text-slate-300 hover:bg-slate-800 hover:text-white' 
                            : 'text-slate-600 cursor-not-allowed'
                        }
                        ${collapsed ? 'justify-center' : ''}
                      `}
                    >
                      <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : isEnabled ? 'text-slate-400' : 'text-slate-600'}`} />
                      {!collapsed && (
                        <>
                          <span className="flex-1 text-left text-sm font-medium truncate">
                            {module.label}
                          </span>
                          {!isEnabled && (
                            <Lock className="w-3.5 h-3.5 text-slate-600" />
                          )}
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className={`p-4 border-t border-slate-800 space-y-3 ${collapsed ? 'px-2' : ''}`}>
        {/* Plan Badge */}
        {!collapsed && organization && (
          <div className="flex items-center justify-between bg-slate-800 rounded-lg px-3 py-2">
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-medium capitalize">
                {organization.subscription_plan}
              </span>
            </div>
            {organization.subscription_status === 'trial' && (
              <button
                onClick={onUpgrade}
                className="text-xs text-blue-400 hover:text-blue-300 font-medium"
              >
                Upgrade
              </button>
            )}
          </div>
        )}

        {/* Collapse Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 py-2 text-slate-400 hover:text-white transition-colors"
          title={collapsed ? 'Expandir menu' : 'Recolher menu'}
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm">Recolher</span>
            </>
          )}
        </button>

        {/* Logout */}
        <button
          onClick={onLogout}
          className={`
            w-full flex items-center gap-3 px-3 py-2.5 rounded-lg 
            text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all
            ${collapsed ? 'justify-center' : ''}
          `}
          title={collapsed ? 'Sair' : undefined}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span className="text-sm font-medium">Sair</span>}
        </button>
      </div>
    </aside>
  );
};
