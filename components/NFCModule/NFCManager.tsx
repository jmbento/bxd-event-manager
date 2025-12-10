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
} from 'lucide-react';

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
// MOCK DATA - Será substituído por chamadas à API
// =============================================================================

const mockStats: DashboardStats = {
  total_participants: 2847,
  wristbands_assigned: 2650,
  current_inside: 1856,
  total_entries: 4521,
  staff_count: 145,
  staff_present: 122,
  meals_served_today: 486,
  meals_remaining: 314,
};

const mockGates: Gate[] = [
  { id: 'g1', name: 'Entrada Principal', code: 'GATE_MAIN', zone: 'main', type: 'entry', entries_today: 1520, exits_today: 680, current_inside: 840, is_active: true },
  { id: 'g2', name: 'Entrada VIP', code: 'GATE_VIP', zone: 'vip', type: 'entry', entries_today: 245, exits_today: 89, current_inside: 156, is_active: true },
  { id: 'g3', name: 'Backstage', code: 'GATE_BACKSTAGE', zone: 'backstage', type: 'bidirectional', entries_today: 145, exits_today: 112, current_inside: 33, is_active: true },
  { id: 'g4', name: 'Saída Principal', code: 'GATE_EXIT', zone: 'main', type: 'exit', entries_today: 0, exits_today: 720, current_inside: 0, is_active: true },
];

const mockMealStations: MealStation[] = [
  { id: 'm1', name: 'Refeitório Principal', code: 'MEAL_MAIN', meal_types: ['breakfast', 'lunch', 'dinner'], is_active: true, served_today: 320, capacity_per_hour: 200 },
  { id: 'm2', name: 'Área VIP', code: 'MEAL_VIP', meal_types: ['lunch', 'snack'], is_active: true, served_today: 86, capacity_per_hour: 50 },
  { id: 'm3', name: 'Backstage', code: 'MEAL_BACKSTAGE', meal_types: ['lunch', 'dinner', 'snack'], is_active: true, served_today: 80, capacity_per_hour: 80 },
];

const mockStaff: StaffMember[] = [
  { id: 's1', full_name: 'Carlos Silva', email: 'carlos@evento.com', phone: '11999001122', ticket_type: 'staff', department: 'Produção', role: 'Coordenador', marketing_opt_in: false, created_at: '2025-12-01', shift_start: '08:00', shift_end: '18:00', is_checked_in: true, check_in_time: '07:45', meals_allowed: 3, meals_consumed: 2 },
  { id: 's2', full_name: 'Ana Santos', email: 'ana@evento.com', phone: '11999002233', ticket_type: 'staff', department: 'Segurança', role: 'Supervisora', marketing_opt_in: false, created_at: '2025-12-01', shift_start: '06:00', shift_end: '14:00', is_checked_in: true, check_in_time: '05:55', meals_allowed: 3, meals_consumed: 1 },
  { id: 's3', full_name: 'Pedro Costa', email: 'pedro@evento.com', phone: '11999003344', ticket_type: 'crew', department: 'Técnico', role: 'Roadie', marketing_opt_in: false, created_at: '2025-12-01', shift_start: '14:00', shift_end: '22:00', is_checked_in: false, meals_allowed: 3, meals_consumed: 0 },
  { id: 's4', full_name: 'Julia Mendes', email: 'julia@evento.com', phone: '11999004455', ticket_type: 'staff', department: 'Alimentação', role: 'Chefe', marketing_opt_in: false, created_at: '2025-12-01', shift_start: '05:00', shift_end: '15:00', is_checked_in: true, check_in_time: '04:50', meals_allowed: 3, meals_consumed: 3 },
  { id: 's5', full_name: 'Roberto Alves', email: 'roberto@evento.com', phone: '11999005566', ticket_type: 'staff', department: 'Limpeza', role: 'Supervisor', marketing_opt_in: false, created_at: '2025-12-01', shift_start: '06:00', shift_end: '18:00', is_checked_in: true, check_in_time: '06:02', meals_allowed: 3, meals_consumed: 2 },
];

const mockMealLogs: MealLog[] = [
  { id: 'ml1', wristband_id: 'w1', attendee_name: 'Carlos Silva', meal_type: 'lunch', station: 'Refeitório Principal', created_at: '2025-12-10T12:30:00Z', status: 'allowed' },
  { id: 'ml2', wristband_id: 'w2', attendee_name: 'Ana Santos', meal_type: 'breakfast', station: 'Refeitório Principal', created_at: '2025-12-10T07:15:00Z', status: 'allowed' },
  { id: 'ml3', wristband_id: 'w3', attendee_name: 'João Visitante', meal_type: 'lunch', station: 'Refeitório Principal', created_at: '2025-12-10T12:45:00Z', status: 'denied', reason: 'Sem permissão de refeição' },
  { id: 'ml4', wristband_id: 'w4', attendee_name: 'Julia Mendes', meal_type: 'dinner', station: 'Backstage', created_at: '2025-12-10T19:00:00Z', status: 'denied', reason: 'Limite diário atingido' },
];

const mockAccessLogs: AccessLog[] = [
  { id: 'al1', wristband_id: 'w1', wristband_uid: 'NFC001ABC', attendee_name: 'João Silva', gate: 'Entrada Principal', zone: 'main', direction: 'in', status: 'allowed', created_at: '2025-12-10T10:45:23Z' },
  { id: 'al2', wristband_id: 'w2', wristband_uid: 'NFC002DEF', attendee_name: 'Maria Santos', gate: 'Entrada VIP', zone: 'vip', direction: 'in', status: 'allowed', created_at: '2025-12-10T10:44:15Z' },
  { id: 'al3', wristband_id: 'w5', wristband_uid: 'NFC005MNO', attendee_name: 'Desconhecido', gate: 'Backstage', zone: 'backstage', direction: 'in', status: 'denied', reason: 'Sem permissão para esta área', created_at: '2025-12-10T10:43:58Z' },
  { id: 'al4', wristband_id: 'w3', wristband_uid: 'NFC003GHI', attendee_name: 'Pedro Costa', gate: 'Saída Principal', zone: 'main', direction: 'out', status: 'allowed', created_at: '2025-12-10T10:42:30Z' },
];

const mockAttendees: Attendee[] = [
  { id: '1', full_name: 'João Silva', email: 'joao@email.com', phone: '11999998888', cpf: '123.456.789-00', age: 28, city: 'São Paulo', state: 'SP', ticket_type: 'vip', marketing_opt_in: true, created_at: '2025-12-10T10:00:00Z' },
  { id: '2', full_name: 'Maria Santos', email: 'maria@email.com', phone: '11988887777', age: 32, city: 'Rio de Janeiro', state: 'RJ', ticket_type: 'standard', marketing_opt_in: true, created_at: '2025-12-10T10:15:00Z' },
  { id: '3', full_name: 'Pedro Costa', email: 'pedro@email.com', phone: '21977776666', age: 25, city: 'Belo Horizonte', state: 'MG', ticket_type: 'standard', marketing_opt_in: false, created_at: '2025-12-10T10:30:00Z' },
  { id: '4', full_name: 'Ana Lima', email: 'ana@email.com', phone: '11966665555', age: 29, city: 'Curitiba', state: 'PR', ticket_type: 'vip', marketing_opt_in: true, created_at: '2025-12-10T10:45:00Z' },
  { id: '5', full_name: 'Lucas Oliveira', email: 'lucas@email.com', phone: '21955554444', age: 35, city: 'Salvador', state: 'BA', ticket_type: 'backstage', marketing_opt_in: false, created_at: '2025-12-10T11:00:00Z' },
];

// =============================================================================
// COMPONENTE PRINCIPAL
// =============================================================================

type TabType = 'dashboard' | 'staff' | 'meals' | 'access' | 'leads';

export const NFCManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [showActivator, setShowActivator] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [lastSync, setLastSync] = useState(new Date());
  
  // States - serão substituídos por queries do backend
  const [stats, setStats] = useState<DashboardStats>(mockStats);
  const [gates, setGates] = useState<Gate[]>(mockGates);
  const [mealStations, setMealStations] = useState<MealStation[]>(mockMealStations);
  const [staff, setStaff] = useState<StaffMember[]>(mockStaff);
  const [mealLogs, setMealLogs] = useState<MealLog[]>(mockMealLogs);
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>(mockAccessLogs);
  const [attendees, setAttendees] = useState<Attendee[]>(mockAttendees);
  
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
  ];
  
  return (
    <div className="space-y-6">
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
