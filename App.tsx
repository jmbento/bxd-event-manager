import React, { useState, lazy, Suspense, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { Header } from './components/Header';
import { FinancialStats } from './components/FinancialStats';
import { LoginView } from './components/LoginView';
import { MODULE_DEFINITIONS, DEFAULT_ENABLED_MODULES } from './config/moduleConfig';
import type { EventProfile, FinancialKPI, Transaction, ModuleKey, SystemUser } from './types';
import { 
  login as auditLogin, 
  logout as auditLogout, 
  getCurrentUser, 
  setCurrentUser as setAuditUser,
  canAccessModule,
  logModuleAccess,
  getUsers
} from './services/auditService';

// Lazy load dos módulos pesados - usando default export wrapper
const FinanceViewSimple = lazy(() => import('./components/FinanceViewSimple').then(m => ({ default: m.FinanceViewSimple })));
const CRMView = lazy(() => import('./components/CRMView').then(m => ({ default: m.CRMView })));
const MarketingBoard = lazy(() => import('./components/MarketingBoard').then(m => ({ default: m.MarketingBoard })));
const AgendaView = lazy(() => import('./components/AgendaView').then(m => ({ default: m.AgendaView })));
const AnalyticsView = lazy(() => import('./components/AnalyticsView').then(m => ({ default: m.AnalyticsView })));
const TeamView = lazy(() => import('./components/TeamViewComplete').then(m => ({ default: m.TeamViewComplete })));
const EventPlanner3D = lazy(() => import('./components/EventPlanner3D').then(m => ({ default: m.EventPlanner3D })));
const MarketingAdvancedView = lazy(() => import('./components/MarketingAdvancedView').then(m => ({ default: m.MarketingAdvancedView })));
const AdvancedFinanceView = lazy(() => import('./components/AdvancedFinanceView').then(m => ({ default: m.AdvancedFinanceView })));
const AccountingAdvisor = lazy(() => import('./components/AccountingAdvisor').then(m => ({ default: m.AccountingAdvisor })));
const PollsView = lazy(() => import('./components/PollsView').then(m => ({ default: m.PollsView })));
const VolunteersView = lazy(() => import('./components/VolunteersView').then(m => ({ default: m.VolunteersView })));
const LegalAdvisor = lazy(() => import('./components/LegalAdvisor').then(m => ({ default: m.LegalAdvisor })));
const ComplianceView = lazy(() => import('./components/ComplianceView').then(m => ({ default: m.ComplianceView })));
const StaffManagerView = lazy(() => import('./components/StaffManagerView').then(m => ({ default: m.StaffManagerView })));
const EcoGestaoView = lazy(() => import('./components/EcoGestaoView').then(m => ({ default: m.EcoGestaoView })));
const SettingsViewSimple = lazy(() => import('./components/SettingsViewSimple').then(m => ({ default: m.SettingsViewSimple })));
const EventProfileView = lazy(() => import('./components/EventProfileView').then(m => ({ default: m.EventProfileView })));
const HelpView = lazy(() => import('./components/HelpView').then(m => ({ default: m.HelpView })));
const NFCManager = lazy(() => import('./components/NFCModule').then(m => ({ default: m.NFCManager })));

export default function App() {
  // TODOS os useState DEVEM vir ANTES de qualquer return condicional!
  
  // Estado de autenticação - agora usando o serviço de auditoria
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const user = getCurrentUser();
    return user !== null && user.status === 'active';
  });
  
  const [systemUser, setSystemUser] = useState<SystemUser | null>(() => {
    return getCurrentUser();
  });

  const [currentView, setCurrentView] = useState('dashboard');
  const [isModulePanelOpen, setIsModulePanelOpen] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  
  // Estado do perfil do evento - MOVIDO PARA ANTES DO RETURN CONDICIONAL
  const [profile, setProfile] = useState<EventProfile>({
    eventName: '',
    edition: '',
    startDate: '',
    endDate: '',
    location: '',
    expectedAudience: 0,
    description: '',
    logoUrl: '',
    primaryColor: '#3b82f6',
    secondaryColor: '#1e40af'
  });

  // Registrar acesso ao módulo quando mudar de view
  useEffect(() => {
    if (isAuthenticated && currentView) {
      logModuleAccess(currentView as ModuleKey);
    }
  }, [currentView, isAuthenticated]);

  // Handler de login - agora com sistema robusto
  const handleLogin = async (email: string, password: string) => {
    setLoginError(null);
    
    // Inicializar sistema com admin padrão se necessário
    const users = getUsers();
    
    // Verificar se é o primeiro acesso (criar admin)
    if (users.length === 1 && users[0].email === 'admin@evento.com') {
      // Aceitar qualquer email como admin no primeiro acesso para configuração
      const result = await auditLogin(email, password);
      
      if (!result.success && email !== 'admin@evento.com') {
        // Se não é o admin padrão e não encontrou, criar como admin temporário
        // Em produção, isso seria via convite
        setLoginError('Solicite um convite ao administrador do sistema.');
        return;
      }
    }
    
    const result = await auditLogin(email, password);
    
    if (result.success && result.user) {
      setSystemUser(result.user);
      setIsAuthenticated(true);
      setLoginError(null);
    } else {
      setLoginError(result.error || 'Erro ao fazer login');
    }
  };

  // Handler de logout
  const handleLogout = async () => {
    await auditLogout();
    setSystemUser(null);
    setIsAuthenticated(false);
    setCurrentView('dashboard');
  };

  // Verificar permissão antes de navegar para um módulo
  const handleNavigate = (view: string) => {
    // Dashboard e settings sempre acessíveis
    if (view === 'dashboard') {
      setCurrentView(view);
      return;
    }
    
    // Verificar permissão
    if (canAccessModule(view as ModuleKey)) {
      setCurrentView(view);
    } else {
      alert('Você não tem permissão para acessar este módulo. Entre em contato com o administrador.');
    }
  };

  // Se não estiver autenticado, mostrar tela de login
  if (!isAuthenticated) {
    return (
      <LoginView 
        onLogin={handleLogin} 
        eventName={profile.eventName || 'BXD Power Event'}
      />
    );
  }

  // Dados financeiros - podem vir do banco futuramente
  const financials: FinancialKPI = {
    budgetTotal: 0,
    spentToday: 0,
    balance: 0,
    spendingLimit: 0,
    totalSpent: 0
  };

  const transactions: Transaction[] = [];

  // Dados iniciais - vazios para começar
  const events: any[] = [];
  const inventory: any[] = [];
  const teamMembers: any[] = [];

  const renderView = () => {
    switch(currentView) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <FinancialStats data={financials} />
            <div className="bg-white rounded-lg shadow p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">
                📊 Dashboard Principal
              </h2>
              <p className="text-slate-600">
                Clique nos módulos do menu superior para navegar.
              </p>
            </div>
          </div>
        );
      
      case 'finance':
        return (
          <Suspense fallback={<div className="p-8 text-center">Carregando Financeiro...</div>}>
            <FinanceViewSimple financials={financials} recentTransactions={transactions} />
          </Suspense>
        );
      
      case 'crm':
        return (
          <Suspense fallback={<div className="p-8 text-center">Carregando CRM...</div>}>
            <CRMView />
          </Suspense>
        );
      
      case 'marketing':
        return (
          <Suspense fallback={<div className="p-8 text-center">Carregando Marketing...</div>}>
            <MarketingBoard />
          </Suspense>
        );
      
      case 'agenda':
        return (
          <Suspense fallback={<div className="p-8 text-center">Carregando Agenda...</div>}>
            <AgendaView events={events} inventory={inventory} onAddEvent={() => {}} />
          </Suspense>
        );
      
      case 'analytics':
        return (
          <Suspense fallback={<div className="p-8 text-center">Carregando Analytics...</div>}>
            <AnalyticsView />
          </Suspense>
        );
      
      case 'team':
        return (
          <Suspense fallback={<div className="p-8 text-center">Carregando Equipe...</div>}>
            <TeamView team={teamMembers} />
          </Suspense>
        );
      
      case 'canvas':
        return (
          <Suspense fallback={<div className="p-8 text-center">Carregando Spaces 3D...</div>}>
            <EventPlanner3D />
          </Suspense>
        );
      
      case 'marketingAdvanced':
        return (
          <Suspense fallback={<div className="p-8 text-center">Carregando Marketing Digital...</div>}>
            <MarketingAdvancedView />
          </Suspense>
        );
      
      case 'advancedFinance':
        return (
          <Suspense fallback={<div className="p-8 text-center">Carregando Financeiro Avançado...</div>}>
            <AdvancedFinanceView />
          </Suspense>
        );
      
      case 'accounting':
        return (
          <Suspense fallback={<div className="p-8 text-center">Carregando Contábil IA...</div>}>
            <AccountingAdvisor financials={financials} transactions={transactions} />
          </Suspense>
        );
      
      case 'polls':
        return (
          <Suspense fallback={<div className="p-8 text-center">Carregando Pesquisas...</div>}>
            <PollsView />
          </Suspense>
        );
      
      case 'volunteers':
        return (
          <Suspense fallback={<div className="p-8 text-center">Carregando Voluntários...</div>}>
            <VolunteersView />
          </Suspense>
        );
      
      case 'legal':
        return (
          <Suspense fallback={<div className="p-8 text-center">Carregando Jurídico IA...</div>}>
            <LegalAdvisor />
          </Suspense>
        );
      
      case 'compliance':
        return (
          <Suspense fallback={<div className="p-8 text-center">Carregando Compliance...</div>}>
            <ComplianceView />
          </Suspense>
        );
      
      case 'staffManager':
        return (
          <Suspense fallback={<div className="p-8 text-center">Carregando Staff Manager...</div>}>
            <StaffManagerView />
          </Suspense>
        );
      
      case 'nfc':
      case 'participants':
        return (
          <Suspense fallback={<div className="p-8 text-center">Carregando Módulo NFC...</div>}>
            <NFCManager eventId={profile.eventName || 'evento-demo'} />
          </Suspense>
        );
      
      case 'ecoGestao':
        return (
          <Suspense fallback={<div className="p-8 text-center">Carregando Eco-Gestão...</div>}>
            <EcoGestaoView />
          </Suspense>
        );
      
      case 'settings':
        return (
          <Suspense fallback={<div className="p-8 text-center">Carregando Configurações...</div>}>
            <SettingsViewSimple profile={profile} onSave={(p) => setProfile(p)} />
          </Suspense>
        );
      
      case 'profile':
        return (
          <Suspense fallback={<div className="p-8 text-center">Carregando Perfil...</div>}>
            <EventProfileView profile={profile} onUpdate={() => {}} />
          </Suspense>
        );
      
      case 'help':
        return (
          <Suspense fallback={<div className="p-8 text-center">Carregando Ajuda...</div>}>
            <HelpView />
          </Suspense>
        );
      
      default:
        return (
          <div className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              Módulo: {currentView}
            </h2>
            <p className="text-slate-600">
              Este módulo será implementado em breve.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header 
        daysLeft={45} 
        currentView={currentView} 
        onNavigate={handleNavigate} 
        modules={MODULE_DEFINITIONS}
        enabledModules={DEFAULT_ENABLED_MODULES}
        onOpenModulePanel={() => setIsModulePanelOpen(true)}
        profile={profile}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderView()}
      </main>

      <Toaster position="top-right" />
    </div>
  );
}
