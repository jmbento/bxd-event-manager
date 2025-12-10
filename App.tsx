import React, { useState, lazy, Suspense } from 'react';
import { Toaster } from 'react-hot-toast';
import { Header } from './components/Header';
import { FinancialStats } from './components/FinancialStats';
import { LoginView } from './components/LoginView';
import { MODULE_DEFINITIONS, DEFAULT_ENABLED_MODULES } from './config/moduleConfig';
import type { EventProfile, FinancialKPI, Transaction } from './types';

// Lazy load dos módulos pesados - usando default export wrapper
const FinanceViewSimple = lazy(() => import('./components/FinanceViewSimple').then(m => ({ default: m.FinanceViewSimple })));
const CRMView = lazy(() => import('./components/CRMView').then(m => ({ default: m.CRMView })));
const MarketingBoard = lazy(() => import('./components/MarketingBoard').then(m => ({ default: m.MarketingBoard })));
const AgendaView = lazy(() => import('./components/AgendaView').then(m => ({ default: m.AgendaView })));
const AnalyticsView = lazy(() => import('./components/AnalyticsView').then(m => ({ default: m.AnalyticsView })));
const TeamView = lazy(() => import('./components/TeamView').then(m => ({ default: m.TeamView })));
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

export default function App() {
  // Estado de autenticação
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Verificar se já está logado (via localStorage)
    return localStorage.getItem('bxd_auth') === 'true';
  });
  const [currentUser, setCurrentUser] = useState<{email: string} | null>(() => {
    const saved = localStorage.getItem('bxd_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [currentView, setCurrentView] = useState('dashboard');
  const [isModulePanelOpen, setIsModulePanelOpen] = useState(false);

  // Handler de login
  const handleLogin = (email: string, password: string) => {
    // Salvar autenticação
    localStorage.setItem('bxd_auth', 'true');
    localStorage.setItem('bxd_user', JSON.stringify({ email }));
    setCurrentUser({ email });
    setIsAuthenticated(true);
  };

  // Handler de logout
  const handleLogout = () => {
    localStorage.removeItem('bxd_auth');
    localStorage.removeItem('bxd_user');
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  // Se não estiver autenticado, mostrar tela de login
  if (!isAuthenticated) {
    return <LoginView onLogin={handleLogin} />;
  }

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
        onNavigate={setCurrentView} 
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
