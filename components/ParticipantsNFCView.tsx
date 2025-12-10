import React, { useState, useEffect } from 'react';
import {
  Users,
  CreditCard,
  QrCode,
  Search,
  Plus,
  RefreshCw,
  Download,
  Filter,
  ChevronRight,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Wallet,
  DoorOpen,
  UserPlus,
  Smartphone,
  MapPin,
  Mail,
  Phone,
  Calendar,
  TrendingUp,
  TrendingDown,
  Activity,
  Shield,
  X,
  Save,
  Loader2,
  Copy,
  ExternalLink
} from 'lucide-react';

// =============================================================================
// TIPOS
// =============================================================================

interface Attendee {
  id: string;
  full_name: string;
  email?: string;
  phone?: string;
  cpf?: string;
  age?: number;
  city?: string;
  state?: string;
  ticket_type: string;
  marketing_opt_in: boolean;
  created_at: string;
}

interface Wristband {
  id: string;
  uid: string;
  status: 'new' | 'assigned' | 'blocked' | 'lost';
  attendee_id?: string;
  attendee?: Attendee;
  account?: {
    id: string;
    balance_cents: number;
  };
}

interface AccessLog {
  id: string;
  wristband_id: string;
  gate: string;
  direction: 'in' | 'out';
  status: 'allowed' | 'denied';
  reason?: string;
  created_at: string;
}

interface DashboardStats {
  total_participants: number;
  wristbands_assigned: number;
  current_inside: number;
  total_entries: number;
}

// =============================================================================
// MOCK DATA (será substituído por chamadas à API)
// =============================================================================

const mockStats: DashboardStats = {
  total_participants: 1247,
  wristbands_assigned: 1180,
  current_inside: 856,
  total_entries: 2341
};

const mockAttendees: Attendee[] = [
  { id: '1', full_name: 'João Silva', email: 'joao@email.com', phone: '11999998888', cpf: '123.456.789-00', age: 28, city: 'São Paulo', state: 'SP', ticket_type: 'vip', marketing_opt_in: true, created_at: '2025-12-10T10:00:00Z' },
  { id: '2', full_name: 'Maria Santos', email: 'maria@email.com', phone: '11988887777', age: 32, city: 'Rio de Janeiro', state: 'RJ', ticket_type: 'standard', marketing_opt_in: true, created_at: '2025-12-10T10:15:00Z' },
  { id: '3', full_name: 'Pedro Costa', email: 'pedro@email.com', phone: '21977776666', age: 25, city: 'Belo Horizonte', state: 'MG', ticket_type: 'standard', marketing_opt_in: false, created_at: '2025-12-10T10:30:00Z' },
];

const mockWristbands: Wristband[] = [
  { id: 'w1', uid: 'NFC001ABC', status: 'assigned', attendee_id: '1', attendee: mockAttendees[0], account: { id: 'acc1', balance_cents: 15000 } },
  { id: 'w2', uid: 'NFC002DEF', status: 'assigned', attendee_id: '2', attendee: mockAttendees[1], account: { id: 'acc2', balance_cents: 5000 } },
  { id: 'w3', uid: 'NFC003GHI', status: 'new', account: { id: 'acc3', balance_cents: 0 } },
  { id: 'w4', uid: 'NFC004JKL', status: 'blocked', attendee_id: '3', attendee: mockAttendees[2], account: { id: 'acc4', balance_cents: 2500 } },
];

// =============================================================================
// COMPONENTES AUXILIARES
// =============================================================================

const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  trend?: { value: number; isPositive: boolean };
}> = ({ title, value, icon, color, trend }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-slate-500 mb-1">{title}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        {trend && (
          <div className={`flex items-center mt-1 text-xs ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {trend.isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
            {trend.value}% vs ontem
          </div>
        )}
      </div>
      <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}>
        {icon}
      </div>
    </div>
  </div>
);

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const styles: Record<string, string> = {
    new: 'bg-blue-100 text-blue-800',
    assigned: 'bg-green-100 text-green-800',
    blocked: 'bg-red-100 text-red-800',
    lost: 'bg-orange-100 text-orange-800',
    allowed: 'bg-green-100 text-green-800',
    denied: 'bg-red-100 text-red-800',
    standard: 'bg-slate-100 text-slate-800',
    vip: 'bg-purple-100 text-purple-800',
    backstage: 'bg-yellow-100 text-yellow-800',
  };
  
  const labels: Record<string, string> = {
    new: 'Nova',
    assigned: 'Vinculada',
    blocked: 'Bloqueada',
    lost: 'Perdida',
    allowed: 'Permitido',
    denied: 'Negado',
    standard: 'Standard',
    vip: 'VIP',
    backstage: 'Backstage',
  };
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-slate-100 text-slate-800'}`}>
      {labels[status] || status}
    </span>
  );
};

// =============================================================================
// MODAL DE ATIVAÇÃO DE PULSEIRA
// =============================================================================

interface ActivationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

const ActivationModal: React.FC<ActivationModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [wristbandUid, setWristbandUid] = useState('');
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    cpf: '',
    age: '',
    city: '',
    state: '',
    ticket_type: 'standard',
    marketing_opt_in: false,
    privacy_accepted: false,
  });
  const [step, setStep] = useState<'scan' | 'form'>('scan');
  const [loading, setLoading] = useState(false);
  
  if (!isOpen) return null;
  
  const handleScan = () => {
    // Simular leitura NFC/QR
    setLoading(true);
    setTimeout(() => {
      setWristbandUid('NFC' + Math.random().toString(36).substring(2, 8).toUpperCase());
      setStep('form');
      setLoading(false);
    }, 1500);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      wristband_uid: wristbandUid,
      ...formData,
      age: formData.age ? parseInt(formData.age) : undefined,
    });
    onClose();
    setStep('scan');
    setWristbandUid('');
    setFormData({
      full_name: '',
      email: '',
      phone: '',
      cpf: '',
      age: '',
      city: '',
      state: '',
      ticket_type: 'standard',
      marketing_opt_in: false,
      privacy_accepted: false,
    });
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <QrCode className="w-5 h-5 text-blue-600" />
            Ativar Pulseira
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {step === 'scan' ? (
          <div className="p-8 text-center">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Smartphone className="w-12 h-12 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Aproxime a pulseira do celular
            </h3>
            <p className="text-slate-500 mb-6">
              Ou escaneie o QR Code da pulseira
            </p>
            <button
              onClick={handleScan}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:bg-blue-300 flex items-center gap-2 mx-auto"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Lendo...
                </>
              ) : (
                <>
                  <QrCode className="w-5 h-5" />
                  Simular Leitura
                </>
              )}
            </button>
            
            <div className="mt-6 pt-6 border-t border-slate-200">
              <p className="text-sm text-slate-500 mb-3">Ou digite o código manualmente:</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ex: NFC001ABC"
                  value={wristbandUid}
                  onChange={(e) => setWristbandUid(e.target.value.toUpperCase())}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center font-mono"
                />
                <button
                  onClick={() => wristbandUid && setStep('form')}
                  disabled={!wristbandUid}
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:bg-slate-300"
                  title="Continuar"
                  aria-label="Continuar para o formulário"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6">
            <div className="mb-4 p-3 bg-blue-50 rounded-lg flex items-center gap-3">
              <QrCode className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-xs text-blue-600">Pulseira</p>
                <p className="font-mono font-bold text-blue-900">{wristbandUid}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    E-mail
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    CPF
                  </label>
                  <input
                    type="text"
                    value={formData.cpf}
                    onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                    placeholder="000.000.000-00"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Idade
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="150"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Cidade
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Estado
                  </label>
                  <select
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecione</option>
                    {['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'].map(uf => (
                      <option key={uf} value={uf}>{uf}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Tipo de Ingresso
                </label>
                <select
                  value={formData.ticket_type}
                  onChange={(e) => setFormData({ ...formData, ticket_type: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="standard">Standard</option>
                  <option value="vip">VIP</option>
                  <option value="backstage">Backstage</option>
                  <option value="staff">Staff</option>
                  <option value="press">Imprensa</option>
                </select>
              </div>
              
              <div className="space-y-3 pt-4 border-t border-slate-200">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.marketing_opt_in}
                    onChange={(e) => setFormData({ ...formData, marketing_opt_in: e.target.checked })}
                    className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-600">
                    Aceito receber comunicações de marketing sobre futuros eventos
                  </span>
                </label>
                
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={formData.privacy_accepted}
                    onChange={(e) => setFormData({ ...formData, privacy_accepted: e.target.checked })}
                    className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-600">
                    Li e aceito a <a href="#" className="text-blue-600 underline">Política de Privacidade</a> e os <a href="#" className="text-blue-600 underline">Termos de Uso</a> *
                  </span>
                </label>
              </div>
            </div>
            
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setStep('scan')}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition"
              >
                Voltar
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                Ativar Pulseira
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

// =============================================================================
// COMPONENTE PRINCIPAL
// =============================================================================

export const ParticipantsNFCView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'participants' | 'wristbands' | 'access'>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [showActivationModal, setShowActivationModal] = useState(false);
  const [stats, setStats] = useState<DashboardStats>(mockStats);
  const [attendees, setAttendees] = useState<Attendee[]>(mockAttendees);
  const [wristbands, setWristbands] = useState<Wristband[]>(mockWristbands);
  
  const formatCurrency = (cents: number) => 
    (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  
  const handleActivation = (data: any) => {
    console.log('Ativação:', data);
    // Aqui faria a chamada à API
    const newAttendee: Attendee = {
      id: Date.now().toString(),
      ...data,
      created_at: new Date().toISOString(),
    };
    setAttendees([newAttendee, ...attendees]);
    
    const newWristband: Wristband = {
      id: 'w' + Date.now(),
      uid: data.wristband_uid,
      status: 'assigned',
      attendee_id: newAttendee.id,
      attendee: newAttendee,
      account: { id: 'acc' + Date.now(), balance_cents: 0 }
    };
    setWristbands([newWristband, ...wristbands]);
    
    setStats({
      ...stats,
      total_participants: stats.total_participants + 1,
      wristbands_assigned: stats.wristbands_assigned + 1,
    });
  };
  
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'participants', label: 'Participantes', icon: Users },
    { id: 'wristbands', label: 'Pulseiras', icon: CreditCard },
    { id: 'access', label: 'Controle de Acesso', icon: DoorOpen },
  ];
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <QrCode className="w-7 h-7 text-blue-600" />
            Gestão de Pulseiras NFC
          </h1>
          <p className="text-slate-500 mt-1">
            Controle de acesso, cashless e coleta de leads
          </p>
        </div>
        
        <button
          onClick={() => setShowActivationModal(true)}
          className="px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2"
        >
          <UserPlus className="w-5 h-5" />
          Ativar Pulseira
        </button>
      </div>
      
      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-lg w-fit">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition flex items-center gap-2 ${
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
      
      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total de Participantes"
              value={stats.total_participants.toLocaleString()}
              icon={<Users className="w-6 h-6 text-blue-600" />}
              color="bg-blue-100"
              trend={{ value: 12, isPositive: true }}
            />
            <StatCard
              title="Pulseiras Ativadas"
              value={stats.wristbands_assigned.toLocaleString()}
              icon={<CreditCard className="w-6 h-6 text-green-600" />}
              color="bg-green-100"
              trend={{ value: 8, isPositive: true }}
            />
            <StatCard
              title="Dentro do Evento"
              value={stats.current_inside.toLocaleString()}
              icon={<DoorOpen className="w-6 h-6 text-purple-600" />}
              color="bg-purple-100"
            />
            <StatCard
              title="Total de Entradas"
              value={stats.total_entries.toLocaleString()}
              icon={<Activity className="w-6 h-6 text-orange-600" />}
              color="bg-orange-100"
              trend={{ value: 15, isPositive: true }}
            />
          </div>
          
          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Ações Rápidas</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                onClick={() => setShowActivationModal(true)}
                className="p-4 border-2 border-blue-500 bg-blue-50 rounded-xl hover:bg-blue-100 transition text-left"
              >
                <UserPlus className="w-8 h-8 text-blue-600 mb-2" />
                <p className="font-semibold text-blue-900">Ativar Pulseira</p>
                <p className="text-sm text-blue-600">Cadastrar participante</p>
              </button>
              
              <button className="p-4 border-2 border-green-500 bg-green-50 rounded-xl hover:bg-green-100 transition text-left">
                <Wallet className="w-8 h-8 text-green-600 mb-2" />
                <p className="font-semibold text-green-900">Registrar Recarga</p>
                <p className="text-sm text-green-600">Adicionar créditos</p>
              </button>
              
              <button className="p-4 border-2 border-purple-500 bg-purple-50 rounded-xl hover:bg-purple-100 transition text-left">
                <DoorOpen className="w-8 h-8 text-purple-600 mb-2" />
                <p className="font-semibold text-purple-900">Check-in</p>
                <p className="text-sm text-purple-600">Registrar entrada</p>
              </button>
              
              <button className="p-4 border-2 border-slate-300 rounded-xl hover:bg-slate-50 transition text-left">
                <Download className="w-8 h-8 text-slate-600 mb-2" />
                <p className="font-semibold text-slate-900">Exportar Leads</p>
                <p className="text-sm text-slate-500">Download CSV</p>
              </button>
            </div>
          </div>
          
          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">Atividade Recente</h3>
              <button className="text-blue-600 text-sm font-medium hover:text-blue-700">
                Ver tudo
              </button>
            </div>
            <div className="divide-y divide-slate-100">
              {[
                { type: 'check_in', name: 'João Silva', time: '2 min atrás', gate: 'Entrada Principal' },
                { type: 'activation', name: 'Maria Santos', time: '5 min atrás' },
                { type: 'topup', name: 'Pedro Costa', time: '8 min atrás', amount: 5000 },
                { type: 'purchase', name: 'Ana Lima', time: '10 min atrás', amount: 2500 },
              ].map((activity, i) => (
                <div key={i} className="p-4 flex items-center gap-4 hover:bg-slate-50">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    activity.type === 'check_in' ? 'bg-purple-100' :
                    activity.type === 'activation' ? 'bg-blue-100' :
                    activity.type === 'topup' ? 'bg-green-100' : 'bg-orange-100'
                  }`}>
                    {activity.type === 'check_in' && <DoorOpen className="w-5 h-5 text-purple-600" />}
                    {activity.type === 'activation' && <UserPlus className="w-5 h-5 text-blue-600" />}
                    {activity.type === 'topup' && <TrendingUp className="w-5 h-5 text-green-600" />}
                    {activity.type === 'purchase' && <CreditCard className="w-5 h-5 text-orange-600" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{activity.name}</p>
                    <p className="text-sm text-slate-500">
                      {activity.type === 'check_in' && `Check-in em ${activity.gate}`}
                      {activity.type === 'activation' && 'Pulseira ativada'}
                      {activity.type === 'topup' && `Recarga de ${formatCurrency(activity.amount!)}`}
                      {activity.type === 'purchase' && `Compra de ${formatCurrency(activity.amount!)}`}
                    </p>
                  </div>
                  <span className="text-sm text-slate-400">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Participants Tab */}
      {activeTab === 'participants' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por nome, email, CPF..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filtros
              </button>
              <button className="px-3 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 flex items-center gap-2">
                <Download className="w-4 h-4" />
                Exportar
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Participante</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Contato</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Cidade</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Ingresso</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Marketing</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Cadastro</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attendees.map((attendee) => (
                  <tr key={attendee.id} className="hover:bg-slate-50">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-medium">
                          {attendee.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{attendee.full_name}</p>
                          {attendee.cpf && <p className="text-xs text-slate-500">{attendee.cpf}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {attendee.email && (
                        <div className="flex items-center gap-1 text-sm text-slate-600">
                          <Mail className="w-3 h-3" />
                          {attendee.email}
                        </div>
                      )}
                      {attendee.phone && (
                        <div className="flex items-center gap-1 text-sm text-slate-500">
                          <Phone className="w-3 h-3" />
                          {attendee.phone}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      {attendee.city && (
                        <div className="flex items-center gap-1 text-sm text-slate-600">
                          <MapPin className="w-3 h-3" />
                          {attendee.city}{attendee.state && `, ${attendee.state}`}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={attendee.ticket_type} />
                    </td>
                    <td className="px-4 py-4">
                      {attendee.marketing_opt_in ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-slate-300" />
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-500">
                      {new Date(attendee.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-4">
                      <button className="text-slate-400 hover:text-slate-600">
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Wristbands Tab */}
      {activeTab === 'wristbands' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por UID da pulseira..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Todos os status</option>
              <option value="new">Novas</option>
              <option value="assigned">Vinculadas</option>
              <option value="blocked">Bloqueadas</option>
              <option value="lost">Perdidas</option>
            </select>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">UID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Participante</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Saldo</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {wristbands.map((wristband) => (
                  <tr key={wristband.id} className="hover:bg-slate-50">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <QrCode className="w-5 h-5 text-slate-400" />
                        <span className="font-mono font-medium text-slate-900">{wristband.uid}</span>
                        <button className="text-slate-400 hover:text-slate-600">
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={wristband.status} />
                    </td>
                    <td className="px-4 py-4">
                      {wristband.attendee ? (
                        <div>
                          <p className="font-medium text-slate-900">{wristband.attendee.full_name}</p>
                          <p className="text-xs text-slate-500">{wristband.attendee.email}</p>
                        </div>
                      ) : (
                        <span className="text-slate-400">Não vinculada</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`font-semibold ${
                        (wristband.account?.balance_cents || 0) > 0 ? 'text-green-600' : 'text-slate-400'
                      }`}>
                        {formatCurrency(wristband.account?.balance_cents || 0)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        {wristband.status === 'blocked' ? (
                          <button className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200">
                            Desbloquear
                          </button>
                        ) : wristband.status === 'assigned' && (
                          <button className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200">
                            Bloquear
                          </button>
                        )}
                        <button className="text-slate-400 hover:text-slate-600">
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Access Control Tab */}
      {activeTab === 'access' && (
        <div className="space-y-6">
          {/* Gates Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: 'Entrada Principal', code: 'GATE_MAIN', entries: 1520, exits: 680, inside: 840 },
              { name: 'Entrada VIP', code: 'GATE_VIP', entries: 245, exits: 89, inside: 156 },
              { name: 'Backstage', code: 'GATE_BACKSTAGE', entries: 45, exits: 12, inside: 33 },
              { name: 'Saída Principal', code: 'GATE_EXIT', entries: 0, exits: 720, inside: 0 },
            ].map((gate) => (
              <div key={gate.code} className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-slate-900">{gate.name}</h4>
                  <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Entradas:</span>
                    <span className="font-medium text-green-600">{gate.entries}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Saídas:</span>
                    <span className="font-medium text-orange-600">{gate.exits}</span>
                  </div>
                  {gate.inside > 0 && (
                    <div className="flex justify-between pt-2 border-t border-slate-100">
                      <span className="text-slate-500">Dentro:</span>
                      <span className="font-bold text-slate-900">{gate.inside}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* Access Logs */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="p-4 border-b border-slate-200">
              <h3 className="font-semibold text-slate-900">Últimas Verificações</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {[
                { uid: 'NFC001ABC', name: 'João Silva', gate: 'Entrada Principal', direction: 'in', status: 'allowed', time: '10:45:23' },
                { uid: 'NFC002DEF', name: 'Maria Santos', gate: 'Entrada VIP', direction: 'in', status: 'allowed', time: '10:44:15' },
                { uid: 'NFC005MNO', name: 'Desconhecido', gate: 'Backstage', direction: 'in', status: 'denied', time: '10:43:58', reason: 'Ingresso não permitido' },
                { uid: 'NFC003GHI', name: 'Pedro Costa', gate: 'Saída Principal', direction: 'out', status: 'allowed', time: '10:42:30' },
              ].map((log, i) => (
                <div key={i} className="p-4 flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    log.status === 'allowed' 
                      ? log.direction === 'in' ? 'bg-green-100' : 'bg-orange-100'
                      : 'bg-red-100'
                  }`}>
                    {log.status === 'allowed' ? (
                      log.direction === 'in' 
                        ? <CheckCircle className="w-5 h-5 text-green-600" />
                        : <DoorOpen className="w-5 h-5 text-orange-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-900">{log.name}</span>
                      <span className="text-xs text-slate-400 font-mono">{log.uid}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <span>{log.gate}</span>
                      <span>•</span>
                      <span>{log.direction === 'in' ? 'Entrada' : 'Saída'}</span>
                      {log.reason && (
                        <>
                          <span>•</span>
                          <span className="text-red-600">{log.reason}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-slate-400">{log.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Activation Modal */}
      <ActivationModal
        isOpen={showActivationModal}
        onClose={() => setShowActivationModal(false)}
        onSubmit={handleActivation}
      />
    </div>
  );
};

export default ParticipantsNFCView;
