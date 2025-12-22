import React, { useState, lazy, Suspense, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { LoginView } from './components/LoginView';
import { PricingPage } from './components/PricingPage';
import { AuthPage } from './components/AuthPage';
import { TrialBanner, TrialExpiredOverlay } from './components/TrialBanner';
import { GoogleAnalytics } from './components/GoogleAnalytics';
import { MODULE_DEFINITIONS, DEFAULT_ENABLED_MODULES } from './config/moduleConfig';
import { supabase } from './config/supabase';
import type { EventProfile, FinancialKPI, Transaction, ModuleKey, SystemUser } from './types';
import { 
  login as auditLogin, 
  logout as auditLogout, 
  getCurrentUser, 
  setCurrentUser as setAuditUser,
  canAccessModule,
  logModuleAccess,
  getUsers,
  getDefaultPermissions
} from './services/auditService';

// Tipos para o sistema de assinatura
interface Organization {
  id: string;
  name: string;
  subscription_status: 'trial' | 'active' | 'canceled' | 'expired';
  subscription_plan: 'starter' | 'pro' | 'enterprise';
  trial_ends_at: string;
  max_events: number;
}

type AppView = 'pricing' | 'auth' | 'app';

// Lazy load dos módulos pesados - usando default export wrapper
const FinanceViewSimple = lazy(() => import('./components/FinanceViewSimple').then(m => ({ default: m.FinanceViewSimple })));
const CRMView = lazy(() => import('./components/CRMView').then(m => ({ default: m.CRMView })));
const MaterialsInfraView = lazy(() => import('./components/MaterialsInfraView').then(m => ({ default: m.MaterialsInfraView })));
const AgendaView = lazy(() => import('./components/AgendaView').then(m => ({ default: m.AgendaView })));
const AnalyticsView = lazy(() => import('./components/AnalyticsView').then(m => ({ default: m.AnalyticsView })));
const TeamView = lazy(() => import('./components/TeamViewComplete').then(m => ({ default: m.TeamViewComplete })));
const EventPlanner3D = lazy(() => import('./components/EventPlanner3D').then(m => ({ default: m.EventPlanner3D })));
const AdvancedFinanceView = lazy(() => import('./components/AdvancedFinanceView').then(m => ({ default: m.AdvancedFinanceView })));
const AccountingAdvisor = lazy(() => import('./components/AccountingAdvisor').then(m => ({ default: m.AccountingAdvisor })));
const VolunteersView = lazy(() => import('./components/VolunteersView').then(m => ({ default: m.VolunteersView })));
const LegalAdvisor = lazy(() => import('./components/LegalAdvisor').then(m => ({ default: m.LegalAdvisor })));
const ComplianceView = lazy(() => import('./components/ComplianceView').then(m => ({ default: m.ComplianceView })));
const StaffManagerView = lazy(() => import('./components/StaffManagerView').then(m => ({ default: m.StaffManagerView })));
const EcoGestaoView = lazy(() => import('./components/EcoGestaoView').then(m => ({ default: m.EcoGestaoView })));
const SettingsViewSimple = lazy(() => import('./components/SettingsViewSimple').then(m => ({ default: m.SettingsViewSimple })));
const MeetingView = lazy(() => import('./components/MeetingView').then(m => ({ default: m.MeetingView })));
const EventProfileView = lazy(() => import('./components/EventProfileView').then(m => ({ default: m.EventProfileView })));
const HelpView = lazy(() => import('./components/HelpView').then(m => ({ default: m.HelpView })));
const NFCManager = lazy(() => import('./components/NFCModule').then(m => ({ default: m.NFCManager })));
const PlanningView = lazy(() => import('./components/PlanningView').then(m => ({ default: m.PlanningView })));
const SaaSControlPanel = lazy(() => import('./components/SaaSControlPanel').then(m => ({ default: m.default })));
const SupportChatbot = lazy(() => import('./components/SupportChatbot').then(m => ({ default: m.SupportChatbot })));

export default function App() {
  // TODOS os useState DEVEM vir ANTES de qualquer return condicional!
  
  // Estado da aplicação (pricing -> auth -> app)
  const [appView, setAppView] = useState<AppView>(() => {
    try {
      // Verificar se já está logado de verdade
      const savedOrg = localStorage.getItem('bxd_organization');
      const savedUser = localStorage.getItem('bxd_user');
      const auditUser = localStorage.getItem('bxd_audit_current_user');
      
      if (savedOrg && savedUser && auditUser) {
        console.log('✅ Usuário autenticado encontrado, carregando app...');
        return 'app';
      }
      
      // Se não está logado, vai para pricing
      console.log('👤 Nenhum usuário autenticado, redirecionando para pricing...');
      return 'pricing';
    } catch {
      return 'pricing';
    }
  });

  const [selectedPlan, setSelectedPlan] = useState<string>('starter');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true); // Novo estado para loading inicial
  
  // Estado da organização
  const [organization, setOrganization] = useState<Organization | null>(() => {
    try {
      const saved = localStorage.getItem('bxd_organization');
      const org = saved ? JSON.parse(saved) : null;
      if (org) {
        console.log('🏢 Organização carregada:', { 
          name: org.name, 
          plan: org.subscription_plan,
          status: org.subscription_status 
        });
      } else {
        console.log('❌ Nenhuma organização encontrada no localStorage');
      }
      return org;
    } catch (error) {
      console.error('❌ Erro ao carregar organização:', error);
      return null;
    }
  });

  // Estado de autenticação - agora usando o serviço de auditoria
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      const user = getCurrentUser();
      const isAuth = user !== null && user.status === 'active';
      console.log('🔐 Verificando autenticação:', isAuth ? '✅ Autenticado' : '❌ Não autenticado');
      return isAuth;
    } catch (error) {
      console.error('❌ Erro ao verificar autenticação:', error);
      return false;
    }
  });
  
  const [systemUser, setSystemUser] = useState<SystemUser | null>(() => {
    try {
      const user = getCurrentUser();
      if (user) {
        console.log('👤 Usuário carregado:', { 
          email: user.email, 
          role: user.role,
          plan: user.permissions?.modules?.length ? `${user.permissions.modules.length} módulos` : '0 módulos'
        });
      } else {
        console.log('❌ Nenhum usuário encontrado no localStorage');
      }
      return user;
    } catch (error) {
      console.error('❌ Erro ao carregar usuário:', error);
      return null;
    }
  });

  // Monitorar estado de autenticação do Supabase
  useEffect(() => {
    console.log('🔄 Inicializando listener de autenticação Supabase...');
    
    let mounted = true;
    
    // Verificar sessão atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      
      console.log('📱 Sessão atual:', session ? '✅ Ativa' : '❌ Nenhuma');
      
      if (session?.user && appView !== 'app') {
        console.log('🔐 Sessão encontrada, processando login automático...');
        handleSupabaseSession(session.user);
      } else {
        setIsCheckingAuth(false);
      }
    });

    // Listener de mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      console.log('🔔 Evento de autenticação:', event, session ? '✅ Com sessão' : '❌ Sem sessão');
      
      if (event === 'SIGNED_IN' && session?.user) {
        console.log('✅ Usuário logou, processando dados...');
        await handleSupabaseSession(session.user);
      } else if (event === 'SIGNED_OUT') {
        console.log('👋 Usuário deslogou, limpando dados...');
        handleLogout();
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('🔄 Token atualizado');
      }
      
      setIsCheckingAuth(false);
    });

    return () => {
      mounted = false;
      console.log('🛑 Removendo listener de autenticação');
      subscription.unsubscribe();
    };
  }, []);

  // Processar sessão do Supabase e buscar/criar organização
  const handleSupabaseSession = async (user: any) => {
    try {
      console.log('👤 Processando usuário:', user.email);
      
      // Buscar organizações do usuário
      const { data: organizations, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (orgError) {
        console.error('❌ Erro ao buscar organizações:', orgError);
      }

      let org = organizations?.[0];

      // Se não tem organização, criar uma automaticamente
      if (!org) {
        console.log('🏢 Criando organização automática para', user.email);
        
        const userName = user.user_metadata?.name || user.email?.split('@')[0] || 'Usuário';
        const orgName = user.user_metadata?.organization_name || `Organização de ${userName}`;
        
        const slug = orgName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');

        const { data: newOrg, error: createError } = await supabase
          .from('organizations')
          .insert({
            name: orgName,
            slug: `${slug}-${Date.now()}`,
            owner_id: user.id,
            subscription_status: 'trial',
            subscription_plan: 'pro',
            trial_starts_at: new Date().toISOString(),
            trial_ends_at: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
            max_events: 1,
            max_team_members: 3
          })
          .select()
          .single();

        if (createError) {
          console.error('❌ Erro ao criar organização:', createError);
          throw createError;
        }

        org = newOrg;
        console.log('✅ Organização criada:', org.name);
      }

      // Chamar handleAuthSuccess para configurar tudo
      handleAuthSuccess(user, org);
      
    } catch (error) {
      console.error('❌ Erro ao processar sessão:', error);
      // Em caso de erro, redirecionar para auth
      setAppView('auth');
    }
  };

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

  // Calcular dias restantes do trial
  const getTrialDaysRemaining = (): number => {
    if (!organization) return 0;
    if (organization.subscription_status === 'active') return -1; // -1 = não está em trial
    
    const trialEnd = new Date(organization.trial_ends_at);
    const now = new Date();
    const diffTime = trialEnd.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const trialDaysRemaining = getTrialDaysRemaining();
  const isTrialExpired = organization?.subscription_status === 'trial' && trialDaysRemaining === 0;

  // Handler quando usuário clica em "Começar Trial" na PricingPage
  const handleStartTrial = (plan: string) => {
    setSelectedPlan(plan);
    setAppView('auth');
  };

  // Handler quando usuário faz login na PricingPage
  const handlePricingLogin = () => {
    setAppView('auth');
  };

  // Handler de sucesso no AuthPage
  const handleAuthSuccess = (user: any, org: any) => {
    // Salvar no localStorage
    localStorage.setItem('bxd_user', JSON.stringify(user));
    localStorage.setItem('bxd_organization', JSON.stringify(org));
    
    // IMPORTANTE: Owner sempre é admin e tem permissões baseadas no plano da organização
    const orgPlan = org?.subscription_plan || 'starter';
    const permissions = getDefaultPermissions('admin', orgPlan);
    
    // Debug: Mostrar permissões no console
    console.log('🔐 Sistema de Permissões:');
    console.log('   Plano da Organização:', orgPlan);
    console.log('   Módulos Disponíveis:', permissions.modules);
    console.log('   Total de Módulos:', permissions.modules.length);
    
    const systemUser: SystemUser = {
      id: user.id,
      email: user.email || user.user_metadata?.email,
      name: user.user_metadata?.name || user.email?.split('@')[0] || 'Usuário',
      role: 'admin',
      status: 'active',
      permissions: permissions,
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
    };
    
    // Salvar como SystemUser para o auditService reconhecer
    setAuditUser(systemUser);
    
    setOrganization(org);
    setSystemUser(systemUser);
    setIsAuthenticated(true);
    setAppView('app');
  };

  // Handler de upgrade (ir para preços)
  const handleUpgrade = () => {
    setAppView('pricing');
  };

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
    console.log('👋 Fazendo logout...');
    
    // Deslogar do Supabase
    await supabase.auth.signOut();
    
    // Limpar audit service
    await auditLogout();
    
    // Limpar estados
    setSystemUser(null);
    setIsAuthenticated(false);
    setOrganization(null);
    setCurrentView('dashboard');
    
    // Limpar localStorage
    localStorage.removeItem('bxd_user');
    localStorage.removeItem('bxd_organization');
    localStorage.removeItem('bxd_audit_current_user');
    
    // Voltar para pricing
    setAppView('pricing');
    
    console.log('✅ Logout completo');
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

  // ============================================
  // RENDERIZAÇÃO CONDICIONAL POR VIEW
  // ============================================

  // Loading inicial verificando autenticação
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg font-medium">Verificando autenticação...</p>
          <p className="text-slate-400 text-sm mt-2">Aguarde um momento</p>
        </div>
      </div>
    );
  }

  // 1. Página de Preços (landing)
  if (appView === 'pricing') {
    return (
      <PricingPage 
        onStartTrial={handleStartTrial}
        onLogin={handlePricingLogin}
      />
    );
  }

  // 2. Página de Auth (login/registro)
  if (appView === 'auth') {
    return (
      <AuthPage 
        onSuccess={handleAuthSuccess}
        initialMode="register"
        selectedPlan={selectedPlan}
      />
    );
  }

  // 3. Se não estiver autenticado no sistema interno, mostrar login legado
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
    // Calcular dias até o evento
    const eventDate = profile.startDate ? new Date(profile.startDate) : new Date();
    const now = new Date();
    const daysLeft = Math.max(0, Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    
    switch(currentView) {
      case 'dashboard':
        return (
          <>
            <Header 
              daysLeft={daysLeft}
              currentView={currentView}
              onNavigate={handleNavigate}
              modules={MODULE_DEFINITIONS}
              enabledModules={DEFAULT_ENABLED_MODULES}
              onOpenModulePanel={() => {}}
              profile={profile}
              currentUser={systemUser}
              organizationPlan={organization?.subscription_plan}
            />
            <DashboardView 
              profile={profile}
              organization={organization}
              daysLeft={daysLeft}
            />
          </>
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
          <Suspense fallback={<div className="p-8 text-center">Carregando Materiais & Infraestrutura...</div>}>
            <MaterialsInfraView />
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
      
      case 'meetings':
        return (
          <Suspense fallback={<div className="p-8 text-center">Carregando Reuniões...</div>}>
            <MeetingView />
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
      
      case 'planning':
        return (
          <Suspense fallback={<div className="p-8 text-center">Carregando Planejamento...</div>}>
            <PlanningView />
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
      
      case 'saas':
        return (
          <Suspense fallback={<div className="p-8 text-center">Carregando Painel SaaS...</div>}>
            <SaaSControlPanel />
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
    <div className="min-h-screen bg-slate-100">
      {/* Overlay de trial expirado */}
      {isTrialExpired && (
        <TrialExpiredOverlay 
          onUpgrade={handleUpgrade}
          onLogout={handleLogout}
        />
      )}

      {/* Sidebar */}
      <Sidebar 
        currentView={currentView}
        onNavigate={handleNavigate}
        modules={MODULE_DEFINITIONS}
        enabledModules={DEFAULT_ENABLED_MODULES}
        profile={profile}
        organization={organization}
        onLogout={handleLogout}
        onUpgrade={handleUpgrade}
      />
      
      {/* Main Content - com margin-left para desktop e padding-bottom para mobile */}
      <main className="lg:ml-64 min-h-screen transition-all duration-300 p-4 lg:p-6 pb-24 lg:pb-6">
        {/* Banner de Trial */}
        {organization?.subscription_status === 'trial' && trialDaysRemaining > 0 && (
          <div className="mb-4 lg:mb-6">
            <TrialBanner 
                daysRemaining={trialDaysRemaining}
                planName={organization?.subscription_plan || 'Starter'}
                onUpgrade={handleUpgrade}
              />
          </div>
        )}

        {renderView()}
      </main>
      
      <Toaster position="top-right" />
      
      {/* Google Analytics */}
      <GoogleAnalytics />
      
      {/* Chatbot de Suporte */}
      {isAuthenticated && (
        <Suspense fallback={null}>
          <SupportChatbot companyName="BXD Event Manager" />
        </Suspense>
      )}
    </div>
  );
}
