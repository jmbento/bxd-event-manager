import React, { useState } from 'react';
import {
  DoorOpen,
  Search,
  QrCode,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  User,
  Loader2,
  Smartphone,
  X,
  MapPin,
  Clock,
  Shield,
  ChevronRight,
} from 'lucide-react';
import type { AccessLog, Gate, Wristband } from './types';
import { ACCESS_ZONES } from './types';

interface Props {
  accessLogs: AccessLog[];
  gates: Gate[];
  onCheckAccess: (wristbandUid: string, gateId: string, direction: 'in' | 'out') => Promise<{ 
    success: boolean; 
    message: string; 
    attendeeName?: string;
    denialReason?: string;
  }>;
  onToggleGate: (gateId: string) => void;
}

// Modal de verificação de acesso
const AccessCheckModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  gates: Gate[];
  onCheck: (wristbandUid: string, gateId: string, direction: 'in' | 'out') => Promise<any>;
}> = ({ isOpen, onClose, gates, onCheck }) => {
  const [wristbandUid, setWristbandUid] = useState('');
  const [selectedGate, setSelectedGate] = useState(gates[0]?.id || '');
  const [direction, setDirection] = useState<'in' | 'out'>('in');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; attendeeName?: string } | null>(null);
  const [scanning, setScanning] = useState(false);

  if (!isOpen) return null;

  const handleScan = () => {
    setScanning(true);
    setTimeout(() => {
      setWristbandUid('NFC' + Math.random().toString(36).substring(2, 8).toUpperCase());
      setScanning(false);
      // Auto-submit após scan
      handleSubmit();
    }, 1000);
  };

  const handleSubmit = async () => {
    if (!wristbandUid || !selectedGate) return;
    
    setLoading(true);
    setResult(null);
    
    try {
      const response = await onCheck(wristbandUid, selectedGate, direction);
      setResult(response);
      
      if (response.success) {
        setTimeout(() => {
          setWristbandUid('');
          setResult(null);
        }, 2000);
      }
    } catch (error) {
      setResult({ success: false, message: 'Erro ao verificar acesso' });
    } finally {
      setLoading(false);
    }
  };

  const selectedGateData = gates.find(g => g.id === selectedGate);
  const zoneData = ACCESS_ZONES.find(z => z.id === selectedGateData?.zone);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <DoorOpen className="w-5 h-5 text-purple-600" />
            Verificar Acesso
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Gate Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Portaria
            </label>
            <select
              value={selectedGate}
              onChange={(e) => setSelectedGate(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {gates.filter(g => g.is_active).map(gate => (
                <option key={gate.id} value={gate.id}>
                  {gate.name} ({ACCESS_ZONES.find(z => z.id === gate.zone)?.label})
                </option>
              ))}
            </select>
            
            {zoneData && (
              <div className={`mt-2 px-3 py-2 rounded-lg bg-${zoneData.color}-50 border border-${zoneData.color}-200`}>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-500" />
                  <span className="text-sm font-medium">{zoneData.label}</span>
                </div>
              </div>
            )}
          </div>

          {/* Direction */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Direção
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setDirection('in')}
                className={`p-3 rounded-lg border-2 transition flex items-center justify-center gap-2 ${
                  direction === 'in'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <DoorOpen className="w-5 h-5" />
                <span className="font-medium">Entrada</span>
              </button>
              <button
                onClick={() => setDirection('out')}
                className={`p-3 rounded-lg border-2 transition flex items-center justify-center gap-2 ${
                  direction === 'out'
                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <DoorOpen className="w-5 h-5 rotate-180" />
                <span className="font-medium">Saída</span>
              </button>
            </div>
          </div>

          {/* Result Display */}
          {result ? (
            <div className={`p-6 rounded-xl text-center ${
              result.success ? 'bg-green-50' : 'bg-red-50'
            }`}>
              {result.success ? (
                <>
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-3" />
                  <p className="text-xl font-bold text-green-900">ACESSO PERMITIDO</p>
                  {result.attendeeName && (
                    <p className="text-green-700 mt-1">{result.attendeeName}</p>
                  )}
                </>
              ) : (
                <>
                  <XCircle className="w-16 h-16 text-red-500 mx-auto mb-3" />
                  <p className="text-xl font-bold text-red-900">ACESSO NEGADO</p>
                  <p className="text-red-700 mt-1">{result.message}</p>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <button
                onClick={handleScan}
                disabled={scanning || loading}
                className={`w-full p-6 border-2 border-dashed rounded-xl transition flex flex-col items-center ${
                  direction === 'in' 
                    ? 'border-green-300 hover:border-green-500 hover:bg-green-50'
                    : 'border-orange-300 hover:border-orange-500 hover:bg-orange-50'
                }`}
              >
                {scanning ? (
                  <>
                    <Loader2 className={`w-12 h-12 animate-spin mb-2 ${
                      direction === 'in' ? 'text-green-500' : 'text-orange-500'
                    }`} />
                    <span className={`font-medium ${
                      direction === 'in' ? 'text-green-600' : 'text-orange-600'
                    }`}>
                      Lendo pulseira...
                    </span>
                  </>
                ) : (
                  <>
                    <Smartphone className={`w-12 h-12 mb-2 ${
                      direction === 'in' ? 'text-green-500' : 'text-orange-500'
                    }`} />
                    <span className={`font-medium ${
                      direction === 'in' ? 'text-green-600' : 'text-orange-600'
                    }`}>
                      Aproximar Pulseira
                    </span>
                    <span className="text-xs text-slate-500 mt-1">Clique para simular</span>
                  </>
                )}
              </button>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Código manual..."
                  value={wristbandUid}
                  onChange={(e) => setWristbandUid(e.target.value.toUpperCase())}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-center"
                />
                <button
                  onClick={handleSubmit}
                  disabled={!wristbandUid || loading}
                  className={`px-4 py-2 text-white rounded-lg font-medium disabled:bg-slate-300 transition ${
                    direction === 'in' ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-600 hover:bg-orange-700'
                  }`}
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ChevronRight className="w-5 h-5" />}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const AccessControl: React.FC<Props> = ({ accessLogs, gates, onCheckAccess, onToggleGate }) => {
  const [showCheckModal, setShowCheckModal] = useState(false);
  const [filterGate, setFilterGate] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');

  const filteredLogs = accessLogs.filter(log => {
    const matchesGate = !filterGate || log.gate === filterGate;
    const matchesStatus = !filterStatus || log.status === filterStatus;
    return matchesGate && matchesStatus;
  });

  const totalInside = gates.reduce((acc, g) => acc + g.current_inside, 0);
  const totalEntries = gates.reduce((acc, g) => acc + g.entries_today, 0);
  const totalExits = gates.reduce((acc, g) => acc + g.exits_today, 0);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 text-center">
          <DoorOpen className="w-8 h-8 text-purple-600 mx-auto" />
          <p className="text-3xl font-bold text-slate-900 mt-2">{totalInside}</p>
          <p className="text-xs text-slate-500">Dentro do Evento</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 text-center">
          <TrendingUp className="w-8 h-8 text-green-600 mx-auto" />
          <p className="text-3xl font-bold text-green-900 mt-2">{totalEntries}</p>
          <p className="text-xs text-slate-500">Entradas Hoje</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 text-center">
          <TrendingUp className="w-8 h-8 text-orange-600 mx-auto rotate-180" />
          <p className="text-3xl font-bold text-orange-900 mt-2">{totalExits}</p>
          <p className="text-xs text-slate-500">Saídas Hoje</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 text-center">
          <Shield className="w-8 h-8 text-blue-600 mx-auto" />
          <p className="text-3xl font-bold text-blue-900 mt-2">
            {gates.filter(g => g.is_active).length}
          </p>
          <p className="text-xs text-slate-500">Portarias Ativas</p>
        </div>
      </div>

      {/* Quick Action */}
      <button
        onClick={() => setShowCheckModal(true)}
        className="w-full p-6 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl shadow-lg hover:from-purple-600 hover:to-purple-700 transition flex items-center justify-center gap-3"
      >
        <QrCode className="w-8 h-8" />
        <div className="text-left">
          <p className="text-lg font-bold">Verificar Acesso</p>
          <p className="text-sm opacity-90">Entrada ou saída de participantes</p>
        </div>
      </button>

      {/* Gates Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <DoorOpen className="w-5 h-5 text-purple-600" />
          Portarias em Tempo Real
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {gates.map(gate => {
            const zoneData = ACCESS_ZONES.find(z => z.id === gate.zone);
            return (
              <div 
                key={gate.id}
                className={`p-4 rounded-xl border-2 transition ${
                  gate.is_active 
                    ? 'border-green-200 bg-white' 
                    : 'border-slate-200 bg-slate-50 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-slate-900">{gate.name}</h4>
                    <span className={`text-xs px-2 py-0.5 rounded bg-${zoneData?.color || 'slate'}-100 text-${zoneData?.color || 'slate'}-700`}>
                      {zoneData?.label || gate.zone}
                    </span>
                  </div>
                  <button
                    onClick={() => onToggleGate(gate.id)}
                    className={`w-10 h-6 rounded-full transition ${
                      gate.is_active ? 'bg-green-500' : 'bg-slate-300'
                    }`}
                  >
                    <span className={`block w-4 h-4 rounded-full bg-white shadow transition transform ${
                      gate.is_active ? 'translate-x-5' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 bg-green-50 rounded">
                    <p className="text-lg font-bold text-green-700">+{gate.entries_today}</p>
                    <p className="text-xs text-green-600">Entradas</p>
                  </div>
                  <div className="p-2 bg-orange-50 rounded">
                    <p className="text-lg font-bold text-orange-700">-{gate.exits_today}</p>
                    <p className="text-xs text-orange-600">Saídas</p>
                  </div>
                  <div className="p-2 bg-purple-50 rounded">
                    <p className="text-lg font-bold text-purple-700">{gate.current_inside}</p>
                    <p className="text-xs text-purple-600">Dentro</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Access Logs */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4">
          <h3 className="font-semibold text-slate-900 flex-1">Últimas Verificações</h3>
          
          <select
            value={filterGate}
            onChange={(e) => setFilterGate(e.target.value)}
            className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">Todas portarias</option>
            {gates.map(gate => (
              <option key={gate.id} value={gate.name}>{gate.name}</option>
            ))}
          </select>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">Todos</option>
            <option value="allowed">✅ Permitidos</option>
            <option value="denied">❌ Negados</option>
          </select>
        </div>
        
        <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
          {filteredLogs.slice(0, 50).map(log => (
            <div 
              key={log.id} 
              className={`p-4 flex items-center gap-4 ${
                log.status === 'denied' ? 'bg-red-50' : 'hover:bg-slate-50'
              }`}
            >
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
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-900 truncate">
                    {log.attendee_name || 'Desconhecido'}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">{log.wristband_uid}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <span>{log.gate}</span>
                  <span>•</span>
                  <span className={log.direction === 'in' ? 'text-green-600' : 'text-orange-600'}>
                    {log.direction === 'in' ? 'Entrada' : 'Saída'}
                  </span>
                  {log.reason && (
                    <>
                      <span>•</span>
                      <span className="text-red-600 truncate">{log.reason}</span>
                    </>
                  )}
                </div>
              </div>
              
              <span className="text-sm text-slate-400 whitespace-nowrap">
                {new Date(log.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
          
          {filteredLogs.length === 0 && (
            <div className="p-12 text-center">
              <DoorOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">Nenhum registro encontrado</p>
            </div>
          )}
        </div>
      </div>

      {/* Check Modal */}
      <AccessCheckModal
        isOpen={showCheckModal}
        onClose={() => setShowCheckModal(false)}
        gates={gates}
        onCheck={onCheckAccess}
      />
    </div>
  );
};

export default AccessControl;
