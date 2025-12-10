import React, { useState } from 'react';
import {
  Utensils,
  Search,
  QrCode,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  User,
  Loader2,
  Smartphone,
  X,
} from 'lucide-react';
import type { MealLog, MealStation, Wristband } from './types';
import { MEAL_TYPES } from './types';

interface Props {
  mealLogs: MealLog[];
  stations: MealStation[];
  onRegisterMeal: (wristbandUid: string, mealType: string, stationId: string) => Promise<{ success: boolean; message: string; attendeeName?: string }>;
}

// Modal de registro de refeição
const MealScanModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  stations: MealStation[];
  onRegister: (wristbandUid: string, mealType: string, stationId: string) => Promise<{ success: boolean; message: string; attendeeName?: string }>;
}> = ({ isOpen, onClose, stations, onRegister }) => {
  const [wristbandUid, setWristbandUid] = useState('');
  const [selectedMealType, setSelectedMealType] = useState('lunch');
  const [selectedStation, setSelectedStation] = useState(stations[0]?.id || '');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; attendeeName?: string } | null>(null);
  const [scanning, setScanning] = useState(false);

  if (!isOpen) return null;

  const handleScan = () => {
    setScanning(true);
    setTimeout(() => {
      setWristbandUid('NFC' + Math.random().toString(36).substring(2, 8).toUpperCase());
      setScanning(false);
    }, 1500);
  };

  const handleSubmit = async () => {
    if (!wristbandUid || !selectedMealType || !selectedStation) return;
    
    setLoading(true);
    setResult(null);
    
    try {
      const response = await onRegister(wristbandUid, selectedMealType, selectedStation);
      setResult(response);
      
      if (response.success) {
        setTimeout(() => {
          setWristbandUid('');
          setResult(null);
        }, 3000);
      }
    } catch (error) {
      setResult({ success: false, message: 'Erro ao registrar refeição' });
    } finally {
      setLoading(false);
    }
  };

  const activeStation = stations.find(s => s.id === selectedStation);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Utensils className="w-5 h-5 text-orange-600" />
            Registrar Refeição
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Station Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Ponto de Alimentação
            </label>
            <select
              value={selectedStation}
              onChange={(e) => setSelectedStation(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {stations.filter(s => s.is_active).map(station => (
                <option key={station.id} value={station.id}>{station.name}</option>
              ))}
            </select>
          </div>

          {/* Meal Type Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Tipo de Refeição
            </label>
            <div className="grid grid-cols-2 gap-2">
              {MEAL_TYPES.filter(type => 
                activeStation?.meal_types.includes(type.id)
              ).map(type => (
                <button
                  key={type.id}
                  onClick={() => setSelectedMealType(type.id)}
                  className={`p-3 rounded-lg border-2 text-left transition ${
                    selectedMealType === type.id
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className="text-2xl">{type.icon}</span>
                  <p className="font-medium text-slate-900 mt-1">{type.label}</p>
                  <p className="text-xs text-slate-500">{type.time}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Wristband Scan */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Pulseira NFC
            </label>
            
            {result ? (
              <div className={`p-4 rounded-xl text-center ${
                result.success ? 'bg-green-50' : 'bg-red-50'
              }`}>
                {result.success ? (
                  <>
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                    <p className="font-semibold text-green-900">{result.message}</p>
                    {result.attendeeName && (
                      <p className="text-sm text-green-700 mt-1">{result.attendeeName}</p>
                    )}
                  </>
                ) : (
                  <>
                    <XCircle className="w-12 h-12 text-red-500 mx-auto mb-2" />
                    <p className="font-semibold text-red-900">{result.message}</p>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  onClick={handleScan}
                  disabled={scanning}
                  className="w-full p-4 border-2 border-dashed border-orange-300 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition flex flex-col items-center"
                >
                  {scanning ? (
                    <>
                      <Loader2 className="w-10 h-10 text-orange-500 animate-spin mb-2" />
                      <span className="text-orange-600 font-medium">Lendo pulseira...</span>
                    </>
                  ) : (
                    <>
                      <Smartphone className="w-10 h-10 text-orange-500 mb-2" />
                      <span className="text-orange-600 font-medium">Aproximar Pulseira</span>
                      <span className="text-xs text-slate-500">Clique para simular</span>
                    </>
                  )}
                </button>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ou digite o código..."
                    value={wristbandUid}
                    onChange={(e) => setWristbandUid(e.target.value.toUpperCase())}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono text-center"
                  />
                  <button
                    onClick={handleSubmit}
                    disabled={!wristbandUid || loading}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition flex items-center gap-2"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Registrar
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const MealControl: React.FC<Props> = ({ mealLogs, stations, onRegisterMeal }) => {
  const [showScanModal, setShowScanModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMealType, setFilterMealType] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');

  const filteredLogs = mealLogs.filter(log => {
    const matchesSearch = log.attendee_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMealType = !filterMealType || log.meal_type === filterMealType;
    const matchesStatus = !filterStatus || log.status === filterStatus;
    return matchesSearch && matchesMealType && matchesStatus;
  });

  const getMealTypeLabel = (type: string) => {
    const mealType = MEAL_TYPES.find(m => m.id === type);
    return mealType ? `${mealType.icon} ${mealType.label}` : type;
  };

  // Stats
  const todayStats = {
    breakfast: mealLogs.filter(l => l.meal_type === 'breakfast' && l.status === 'allowed').length,
    lunch: mealLogs.filter(l => l.meal_type === 'lunch' && l.status === 'allowed').length,
    dinner: mealLogs.filter(l => l.meal_type === 'dinner' && l.status === 'allowed').length,
    snack: mealLogs.filter(l => l.meal_type === 'snack' && l.status === 'allowed').length,
    denied: mealLogs.filter(l => l.status === 'denied').length,
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {MEAL_TYPES.map(type => (
          <div key={type.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 text-center">
            <span className="text-3xl">{type.icon}</span>
            <p className="text-2xl font-bold text-slate-900 mt-2">
              {todayStats[type.id as keyof typeof todayStats] || 0}
            </p>
            <p className="text-xs text-slate-500">{type.label}</p>
          </div>
        ))}
        <div className="bg-red-50 rounded-xl border border-red-200 p-4 text-center">
          <XCircle className="w-8 h-8 text-red-500 mx-auto" />
          <p className="text-2xl font-bold text-red-900 mt-2">{todayStats.denied}</p>
          <p className="text-xs text-red-600">Negadas</p>
        </div>
      </div>

      {/* Quick Action */}
      <button
        onClick={() => setShowScanModal(true)}
        className="w-full p-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl shadow-lg hover:from-orange-600 hover:to-orange-700 transition flex items-center justify-center gap-3"
      >
        <QrCode className="w-8 h-8" />
        <div className="text-left">
          <p className="text-lg font-bold">Registrar Refeição</p>
          <p className="text-sm opacity-90">Aproxime a pulseira ou escaneie</p>
        </div>
      </button>

      {/* Stations Status */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Utensils className="w-5 h-5 text-orange-600" />
          Pontos de Alimentação
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stations.map(station => (
            <div 
              key={station.id}
              className={`p-4 rounded-xl border-2 ${
                station.is_active 
                  ? 'border-green-200 bg-green-50' 
                  : 'border-slate-200 bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-slate-900">{station.name}</h4>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  station.is_active ? 'bg-green-200 text-green-800' : 'bg-slate-200 text-slate-600'
                }`}>
                  {station.is_active ? 'Aberto' : 'Fechado'}
                </span>
              </div>
              
              <div className="flex flex-wrap gap-1 mb-3">
                {station.meal_types.map(type => {
                  const mealType = MEAL_TYPES.find(m => m.id === type);
                  return mealType && (
                    <span key={type} className="text-lg" title={mealType.label}>
                      {mealType.icon}
                    </span>
                  );
                })}
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Servidas hoje:</span>
                <span className="font-bold text-orange-600">{station.served_today}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          
          <select
            value={filterMealType}
            onChange={(e) => setFilterMealType(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">Todas refeições</option>
            {MEAL_TYPES.map(type => (
              <option key={type.id} value={type.id}>{type.icon} {type.label}</option>
            ))}
          </select>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">Todos status</option>
            <option value="allowed">✅ Permitido</option>
            <option value="denied">❌ Negado</option>
          </select>
        </div>
        
        <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
          {filteredLogs.map(log => (
            <div 
              key={log.id} 
              className={`p-4 flex items-center gap-4 ${
                log.status === 'denied' ? 'bg-red-50' : 'hover:bg-slate-50'
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                log.status === 'allowed' ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {log.status === 'allowed' ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-900">{log.attendee_name}</span>
                  <span className="text-lg">{MEAL_TYPES.find(m => m.id === log.meal_type)?.icon}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <span>{log.station}</span>
                  {log.reason && (
                    <>
                      <span>•</span>
                      <span className="text-red-600">{log.reason}</span>
                    </>
                  )}
                </div>
              </div>
              
              <span className="text-sm text-slate-400">
                {new Date(log.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
          
          {filteredLogs.length === 0 && (
            <div className="p-12 text-center">
              <Utensils className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">Nenhum registro encontrado</p>
            </div>
          )}
        </div>
      </div>

      {/* Scan Modal */}
      <MealScanModal
        isOpen={showScanModal}
        onClose={() => setShowScanModal(false)}
        stations={stations}
        onRegister={onRegisterMeal}
      />
    </div>
  );
};

export default MealControl;
