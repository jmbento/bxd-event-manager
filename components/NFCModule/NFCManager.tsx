import React, { useState, useEffect } from 'react';
import {
  QrCode,
  Activity,
  Users,
  Utensils,
  DoorOpen,
  Download,
  UserPlus,
  CreditCard,
  RefreshCw,
  Settings,
  Wifi,
  WifiOff,
  Smartphone,
  Shield,
  Save,
} from 'lucide-react';
import { PageBanner } from '../PageBanner';

// Subcomponentes
import { NFCDashboard } from './NFCDashboard';
import { StaffManager } from './StaffManager';
import { MealControl } from './MealControl';
import { AccessControl } from './AccessControl';
import { LeadsExporter } from './LeadsExporter';
import { WristbandActivator } from './WristbandActivator';

// Tipos
import type {
  DashboardStats,
  Gate,
  MealStation,
  StaffMember,
  MealLog,
  AccessLog,
  Attendee,
  Wristband,
} from './types';

// =============================================================================
// DADOS INICIAIS (vazios - serão preenchidos pela integração)
// =============================================================================

const initialStats: DashboardStats = {
  total_participants: 0,
  wristbands_assigned: 0,
  current_inside: 0,
  total_entries: 0,
  staff_count: 0,
  staff_present: 0,
  meals_served_today: 0,
  meals_remaining: 0,
};

const initialGates: Gate[] = [];
const initialMealStations: MealStation[] = [];
const initialStaff: StaffMember[] = [];
const initialMealLogs: MealLog[] = [];
const initialAccessLogs: AccessLog[] = [];
const initialAttendees: Attendee[] = [];

// =============================================================================
// COMPONENTE PRINCIPAL
// =============================================================================

type TabType = 'dashboard' | 'staff' | 'meals' | 'access' | 'leads' | 'config';

export const NFCManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [showActivator, setShowActivator] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [lastSync, setLastSync] = useState(new Date());
  
  // States - iniciam vazios, serão preenchidos pela integração
  const [stats, setStats] = useState<DashboardStats>(initialStats);
  const [gates, setGates] = useState<Gate[]>(initialGates);
  const [mealStations, setMealStations] = useState<MealStation[]>(initialMealStations);
  const [staff, setStaff] = useState<StaffMember[]>(initialStaff);
  const [mealLogs, setMealLogs] = useState<MealLog[]>(initialMealLogs);
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>(initialAccessLogs);
  const [attendees, setAttendees] = useState<Attendee[]>(initialAttendees);
  
  // Configurações de integração
  const [nfcConfig, setNfcConfig] = useState(() => {
    const saved = localStorage.getItem('nfc_manager_config');
    return saved ? JSON.parse(saved) : {
      deviceType: 'celular' as 'celular' | 'leitor-usb' | 'leitor-bluetooth' | 'qrcode',
      apiUrl: '',
      apiKey: '',
      paymentGateway: 'none' as 'none' | 'mercadopago' | 'pagseguro' | 'stripe',
      paymentApiKey: ''
    };
  });
  
  // Simular sync em tempo real
  useEffect(() => {
    const interval = setInterval(() => {
      setLastSync(new Date());
      // Aqui faria polling ou WebSocket para atualizar dados
    }, 30000);
    return () => clearInterval(interval);
  }, []);
  
  // Handlers
  const handleRefresh = () => {
    setLastSync(new Date());
    // Recarregar dados da API
  };
  
  const handleStaffCheckIn = (staffId: string) => {
    setStaff(prev => prev.map(s => 
      s.id === staffId 
        ? { ...s, is_checked_in: true, check_in_time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) }
        : s
    ));
    setStats(prev => ({ ...prev, staff_present: prev.staff_present + 1 }));
  };
  
  const handleStaffCheckOut = (staffId: string) => {
    setStaff(prev => prev.map(s => 
      s.id === staffId ? { ...s, is_checked_in: false, check_in_time: undefined } : s
    ));
    setStats(prev => ({ ...prev, staff_present: prev.staff_present - 1 }));
  };
  
  const handleRegisterMeal = async (wristbandUid: string, mealType: string, stationId: string): Promise<{ success: boolean; message: string; attendeeName?: string }> => {
    // Simular delay da API
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Simular verificação
    const randomSuccess = Math.random() > 0.2;
    
    if (randomSuccess) {
      const newLog: MealLog = {
        id: 'ml' + Date.now(),
        wristband_id: wristbandUid,
        attendee_name: 'Participante Teste',
        meal_type: mealType as any,
        station: mealStations.find(s => s.id === stationId)?.name || '',
        created_at: new Date().toISOString(),
        status: 'allowed',
      };
      setMealLogs(prev => [newLog, ...prev]);
      setStats(prev => ({ ...prev, meals_served_today: prev.meals_served_today + 1, meals_remaining: prev.meals_remaining - 1 }));
      return { success: true, message: 'Refeição liberada!', attendeeName: 'Participante Teste' };
    } else {
      const newLog: MealLog = {
        id: 'ml' + Date.now(),
        wristband_id: wristbandUid,
        attendee_name: 'Participante Teste',
        meal_type: mealType as any,
        station: mealStations.find(s => s.id === stationId)?.name || '',
        created_at: new Date().toISOString(),
        status: 'denied',
        reason: 'Limite diário atingido',
      };
      setMealLogs(prev => [newLog, ...prev]);
      return { success: false, message: 'Limite diário atingido' };
    }
  };
  
  const handleCheckAccess = async (wristbandUid: string, gateId: string, direction: 'in' | 'out'): Promise<{ success: boolean; message: string; attendeeName?: string }> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const gate = gates.find(g => g.id === gateId);
    const randomSuccess = Math.random() > 0.15;
    
    if (randomSuccess) {
      const newLog: AccessLog = {
        id: 'al' + Date.now(),
        wristband_id: wristbandUid,
        wristband_uid: wristbandUid,
        attendee_name: 'Participante Teste',
        gate: gate?.name || '',
        zone: gate?.zone || 'main',
        direction,
        status: 'allowed',
        created_at: new Date().toISOString(),
      };
      setAccessLogs(prev => [newLog, ...prev]);
      
      // Atualizar contadores
      setGates(prev => prev.map(g => {
        if (g.id === gateId) {
          return {
            ...g,
            entries_today: direction === 'in' ? g.entries_today + 1 : g.entries_today,
            exits_today: direction === 'out' ? g.exits_today + 1 : g.exits_today,
            current_inside: direction === 'in' ? g.current_inside + 1 : Math.max(0, g.current_inside - 1),
          };
        }
        return g;
      }));
      
      setStats(prev => ({
        ...prev,
        current_inside: direction === 'in' ? prev.current_inside + 1 : Math.max(0, prev.current_inside - 1),
        total_entries: direction === 'in' ? prev.total_entries + 1 : prev.total_entries,
      }));
      
      return { success: true, message: direction === 'in' ? 'Entrada permitida' : 'Saída registrada', attendeeName: 'Participante Teste' };
    } else {
      const newLog: AccessLog = {
        id: 'al' + Date.now(),
        wristband_id: wristbandUid,
        wristband_uid: wristbandUid,
        attendee_name: 'Desconhecido',
        gate: gate?.name || '',
        zone: gate?.zone || 'main',
        direction,
        status: 'denied',
        reason: 'Pulseira não autorizada para esta área',
        created_at: new Date().toISOString(),
      };
      setAccessLogs(prev => [newLog, ...prev]);
      return { success: false, message: 'Pulseira não autorizada para esta área' };
    }
  };
  
  const handleToggleGate = (gateId: string) => {
    setGates(prev => prev.map(g => 
      g.id === gateId ? { ...g, is_active: !g.is_active } : g
    ));
  };
  
  const handleExportLeads = async (format: 'csv' | 'xlsx', filters: any) => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log('Exportando leads:', format, filters);
    // Aqui geraria e baixaria o arquivo
  };
  
  const handleActivateWristband = async (data: { wristband_uid: string; attendee: Partial<Attendee> }): Promise<{ success: boolean; message: string }> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newAttendee: Attendee = {
      id: Date.now().toString(),
      full_name: data.attendee.full_name || '',
      email: data.attendee.email,
      phone: data.attendee.phone,
      cpf: data.attendee.cpf,
      age: data.attendee.age,
      city: data.attendee.city,
      state: data.attendee.state,
      ticket_type: data.attendee.ticket_type || 'standard',
      department: data.attendee.department,
      role: data.attendee.role,
      marketing_opt_in: data.attendee.marketing_opt_in || false,
      created_at: new Date().toISOString(),
    };
    
    setAttendees(prev => [newAttendee, ...prev]);
    setStats(prev => ({
      ...prev,
      total_participants: prev.total_participants + 1,
      wristbands_assigned: prev.wristbands_assigned + 1,
    }));
    
    return { success: true, message: 'Pulseira ativada com sucesso!' };
  };
  
  const tabs = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: Activity },
    { id: 'staff' as const, label: 'Staff', icon: Users },
    { id: 'meals' as const, label: 'Alimentação', icon: Utensils },
    { id: 'access' as const, label: 'Acesso', icon: DoorOpen },
    { id: 'leads' as const, label: 'Leads', icon: Download },
    { id: 'config' as const, label: 'Configurações', icon: Settings },
  ];
  
  return (
    <div className="space-y-6">
      {/* Banner */}
      <PageBanner 
        title="Sistema NFC de Pulseiras"
        subtitle="Controle de acesso, cashless e coleta de leads"
        storageKey="nfc_manager_banner_images"
        defaultImages={[
          'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=1200&h=300&fit=crop',
          'https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?w=1200&h=300&fit=crop',
          'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=300&fit=crop',
          'https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?w=1200&h=300&fit=crop',
        ]}
      />
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <QrCode className="w-5 h-5 text-white" />
            </div>
            Sistema NFC de Pulseiras
          </h1>
          <p className="text-slate-500 mt-1">
            Controle de acesso, alimentação e coleta de leads
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Status */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg text-sm">
            {isOnline ? (
              <>
                <Wifi className="w-4 h-4 text-green-600" />
                <span className="text-green-700">Online</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-red-600" />
                <span className="text-red-700">Offline</span>
              </>
            )}
            <span className="text-slate-400">•</span>
            <span className="text-slate-500">
              Sync: {lastSync.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          
          <button
            onClick={handleRefresh}
            className="p-2.5 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 transition"
            title="Atualizar dados"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => setShowActivator(true)}
            className="px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2"
          >
            <UserPlus className="w-5 h-5" />
            Ativar Pulseira
          </button>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 rounded-lg text-sm font-medium transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* Content */}
      <div>
        {activeTab === 'dashboard' && (
          <NFCDashboard
            stats={stats}
            gates={gates}
            mealStations={mealStations}
            onRefresh={handleRefresh}
          />
        )}
        
        {activeTab === 'staff' && (
          <StaffManager
            staff={staff}
            onCheckIn={handleStaffCheckIn}
            onCheckOut={handleStaffCheckOut}
            onAddStaff={() => setShowActivator(true)}
            onViewDetails={(s) => console.log('View:', s)}
          />
        )}
        
        {activeTab === 'meals' && (
          <MealControl
            mealLogs={mealLogs}
            stations={mealStations}
            onRegisterMeal={handleRegisterMeal}
          />
        )}
        
        {activeTab === 'access' && (
          <AccessControl
            accessLogs={accessLogs}
            gates={gates}
            onCheckAccess={handleCheckAccess}
            onToggleGate={handleToggleGate}
          />
        )}
        
        {activeTab === 'leads' && (
          <LeadsExporter
            attendees={attendees}
            onExport={handleExportLeads}
          />
        )}
        
        {activeTab === 'config' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Configurações de Integração</h3>
            
            <div className="space-y-6">
              {/* Tipo de Dispositivo */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Dispositivo de Leitura NFC/QR Code
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { value: 'celular', label: 'Celular/Tablet', desc: 'Leitura via NFC do smartphone', icon: Smartphone },
                    { value: 'leitor-usb', label: 'Leitor USB', desc: 'Dispositivo conectado via USB', icon: CreditCard },
                    { value: 'leitor-bluetooth', label: 'Leitor Bluetooth', desc: 'Dispositivo pareado via Bluetooth', icon: Activity },
                    { value: 'qrcode', label: 'QR Code', desc: 'Leitura de QR Code pela câmera', icon: QrCode },
                  ].map((device) => (
                    <label
                      key={device.value}
                      className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition ${
                        nfcConfig.deviceType === device.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="deviceType"
                        value={device.value}
                        checked={nfcConfig.deviceType === device.value}
                        onChange={(e) => setNfcConfig({ ...nfcConfig, deviceType: e.target.value as any })}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <device.icon className="w-4 h-4 text-blue-600" />
                          <span className="font-semibold text-slate-900">{device.label}</span>
                        </div>
                        <p className="text-sm text-slate-500">{device.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* API Configuration */}
              <div className="pt-6 border-t border-slate-200">
                <h4 className="font-semibold text-slate-900 mb-4">API de Integração Externa (Opcional)</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      URL da API
                    </label>
                    <input
                      type="url"
                      value={nfcConfig.apiUrl}
                      onChange={(e) => setNfcConfig({ ...nfcConfig, apiUrl: e.target.value })}
                      placeholder="https://api.exemplo.com/nfc"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-slate-500 mt-1">Caso utilize um sistema externo de credenciamento</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      API Key / Token
                    </label>
                    <input
                      type="password"
                      value={nfcConfig.apiKey}
                      onChange={(e) => setNfcConfig({ ...nfcConfig, apiKey: e.target.value })}
                      placeholder="••••••••••••••••"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Gateway */}
              <div className="pt-6 border-t border-slate-200">
                <h4 className="font-semibold text-slate-900 mb-4">Gateway de Pagamento (Cashless)</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Selecione o Gateway
                    </label>
                    <select
                      value={nfcConfig.paymentGateway}
                      onChange={(e) => setNfcConfig({ ...nfcConfig, paymentGateway: e.target.value as any })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="none">Nenhum (Sem Cashless)</option>
                      <option value="mercadopago">MercadoPago</option>
                      <option value="pagseguro">PagSeguro</option>
                      <option value="stripe">Stripe</option>
                    </select>
                  </div>

                  {nfcConfig.paymentGateway !== 'none' && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        API Key do Gateway
                      </label>
                      <input
                        type="password"
                        value={nfcConfig.paymentApiKey}
                        onChange={(e) => setNfcConfig({ ...nfcConfig, paymentApiKey: e.target.value })}
                        placeholder="••••••••••••••••"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        {nfcConfig.paymentGateway === 'mercadopago' && 'Obtenha em: Mercado Pago > Credenciais'}
                        {nfcConfig.paymentGateway === 'pagseguro' && 'Obtenha em: PagSeguro > Integrações'}
                        {nfcConfig.paymentGateway === 'stripe' && 'Obtenha em: Stripe Dashboard > API Keys'}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Instruções */}
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex gap-3">
                  <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-900">
                    <p className="font-semibold mb-2">Instruções de Uso:</p>
                    <ul className="list-disc list-inside space-y-1 text-blue-800">
                      <li>Escolha o tipo de dispositivo que será usado no evento</li>
                      <li>Configure a API externa apenas se já possuir um sistema de credenciamento</li>
                      <li>O Gateway de Pagamento é necessário apenas para eventos com sistema Cashless</li>
                      <li>Todas as configurações são salvas automaticamente</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex gap-3 pt-6 border-t border-slate-200">
                <button
                  onClick={() => {
                    localStorage.setItem('nfc_manager_config', JSON.stringify(nfcConfig));
                    alert('Configurações salvas com sucesso!');
                  }}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Salvar Configurações
                </button>
                
                <button
                  onClick={() => {
                    if (confirm('Deseja testar a conexão com as configurações atuais?')) {
                      alert('Teste de conexão - Em desenvolvimento');
                    }
                  }}
                  className="px-6 py-2.5 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition"
                >
                  Testar Conexão
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Wristband Activator Modal */}
      <WristbandActivator
        isOpen={showActivator}
        onClose={() => setShowActivator(false)}
        onActivate={handleActivateWristband}
      />
    </div>
  );
};

export default NFCManager;
