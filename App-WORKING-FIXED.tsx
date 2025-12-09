import React, { useState, lazy, Suspense } from 'react';
import { Toaster } from 'react-hot-toast';
import { Header } from './components/Header';
import { FinancialStats } from './components/FinancialStats';
import { MODULE_DEFINITIONS, DEFAULT_ENABLED_MODULES } from './config/moduleConfig';
import type { EventProfile, FinancialKPI, Transaction } from './types';

// Lazy load dos módulos pesados
const FinanceViewSimple = lazy(() => import('./components/FinanceViewSimple').then(m => m));
const CRMView = lazy(() => import('./components/CRMView').then(m => m));
const MarketingBoard = lazy(() => import('./components/MarketingBoard').then(m => m));
const AgendaView = lazy(() => import('./components/AgendaView').then(m => m));
const AnalyticsView = lazy(() => import('./components/AnalyticsView').then(m => m));
const TeamView = lazy(() => import('./components/TeamView').then(m => m));
const EventPlanner3D = lazy(() => import('./components/EventPlanner3D').then(m => m));
const MarketingAdvancedView = lazy(() => import('./components/MarketingAdvancedView').then(m => m));
const AdvancedFinanceView = lazy(() => import('./components/AdvancedFinanceView').then(m => m));
const AccountingAdvisor = lazy(() => import('./components/AccountingAdvisor').then(m => m));
const PollsView = lazy(() => import('./components/PollsView').then(m => m));
const VolunteersView = lazy(() => import('./components/VolunteersView').then(m => m));
const LegalAdvisor = lazy(() => import('./components/LegalAdvisor').then(m => m));
const ComplianceView = lazy(() => import('./components/ComplianceView').then(m => m));
const StaffManagerView = lazy(() => import('./components/StaffManagerView').then(m => m));
const EcoGestaoView = lazy(() => import('./components/EcoGestaoView').then(m => m));
const SettingsView = lazy(() => import('./components/SettingsView').then(m => m));
const EventProfileView = lazy(() => import('./components/EventProfileView').then(m => m));

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [isModulePanelOpen, setIsModulePanelOpen] = useState(false);

  const profile: EventProfile = {
    eventName: 'Meu Evento',
    edition: '2025',
    startDate: '2025-12-01',
    endDate: '2025-12-05',
    location: 'São Paulo',
    expectedAudience: 5000,
    description: 'Evento de teste',
    logoUrl: '',
    primaryColor: '#3b82f6',
    secondaryColor: '#1e40af'
  };

  const financials: FinancialKPI = {
    budgetTotal: 150000,
    spentToday: 2500,
    balance: 75000,
    spendingLimit: 150000,
    totalSpent: 75000
  };

  const transactions: Transaction[] = [
    {
      id: '1',
      description: 'Pagamento fornecedor de som',
      amount: 15000,
      date: '2025-12-01',
      category: 'Infraestrutura',
      source: 'manual'
    },
    {
      id: '2',
      description: 'Cachê artista principal',
      amount: 50000,
      date: '2025-11-28',
      category: 'Artistas',
      source: 'manual'
    }
  ];

  // Dados mock para Agenda e Team
  const events: any[] = [
    { id: '1', title: 'Reunião com fornecedores', date: '2025-12-10', location: 'Escritório' }
  ];
  const inventory: any[] = [
    { id: '1', name: 'Cadeiras', quantity: 500, status: 'disponível' }
  ];
  const teamMembers: any[] = [
    { id: '1', name: 'João Silva', role: 'Coordenador', email: 'joao@evento.com' },
    { id: '2', name: 'Maria Santos', role: 'Produtora', email: 'maria@evento.com' }
  ];

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
            <SettingsView profile={profile} onUpdateProfile={() => {}} />
          </Suspense>
        );
      
      case 'profile':
        return (
          <Suspense fallback={<div className="p-8 text-center">Carregando Perfil...</div>}>
            <EventProfileView profile={profile} onUpdate={() => {}} />
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
