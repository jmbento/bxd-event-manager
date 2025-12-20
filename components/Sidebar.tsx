import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  LogOut, 
  Crown,
  Zap,
  Lock,
  Menu,
  X
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getModuleByKey = (key: string) => modules.find(m => m.key === key);

  const planColors = {
    starter: 'from-blue-500 to-blue-600',
    pro: 'from-purple-500 to-purple-600',
    enterprise: 'from-amber-500 to-orange-500',
  };

  const planColor = planColors[organization?.subscription_plan as keyof typeof planColors] || planColors.starter;

  return (
    <>
      {/* Mobile Menu Button - Fixed top */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-slate-900 text-white rounded-xl shadow-lg hover:bg-slate-800 transition-colors"
        aria-label="Abrir menu"
      >
        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Desktop + Mobile Drawer */}
      <aside 
        className={`
          fixed left-0 top-0 h-screen bg-slate-900 text-white z-50 
          transition-all duration-300 flex flex-col
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${collapsed ? 'lg:w-16' : 'lg:w-64'}
          w-64
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
                      onClick={() => {
                        onNavigate(module.key);
                        setMobileMenuOpen(false); // Fechar menu mobile ao clicar
                      }}
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

        {/* Collapse Button - Desktop only */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex w-full items-center justify-center gap-2 py-2 text-slate-400 hover:text-white transition-colors"
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
          onClick={() => {
            onLogout();
            setMobileMenuOpen(false);
          }}
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

    {/* Bottom Navigation - Mobile Only */}
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900 border-t border-slate-800 safe-area-inset-bottom">
      <div className="flex items-center justify-around py-2 px-2">
        {modules.slice(0, 5).map((module) => {
          const Icon = module.icon;
          const isActive = currentView === module.key;
          const isEnabled = enabledModules[module.key];
          
          if (!isEnabled) return null;

          return (
            <button
              key={module.key}
              onClick={() => onNavigate(module.key)}
              className={`
                flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all min-w-[64px]
                ${isActive 
                  ? 'text-blue-500' 
                  : 'text-slate-400 hover:text-white'
                }
              `}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium truncate max-w-[60px]">
                {module.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
    </>
  );
};
