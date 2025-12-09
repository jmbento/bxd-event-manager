import React, { useState } from 'react';
import { 
  Shield, Users, Camera, MapPin, Clock, AlertTriangle, Phone, QrCode, 
  CheckCircle2, XCircle, Eye, Zap, UserCheck, Mic, FileText, Plus,
  Navigation, Radio, Utensils, Badge, Lock, Unlock, RotateCcw
} from 'lucide-react';

interface StaffMember {
  id: string;
  name: string;
  photo: string;
  document: string;
  role: string;
  accessLevel: 1 | 2 | 3;
  shift: string;
  post: string;
  status: 'online' | 'offline' | 'break';
  checkInTime?: string;
  location?: { lat: number; lng: number; };
}

interface AccessLog {
  id: string;
  staffId: string;
  staffName: string;
  gate: string;
  action: 'entry' | 'exit';
  timestamp: string;
  photo: string;
}

interface Incident {
  id: string;
  type: 'medical' | 'security' | 'structure';
  severity: 'green' | 'yellow' | 'red';
  title: string;
  description: string;
  reportedBy: string;
  location: string;
  timestamp: string;
  status: 'open' | 'in-progress' | 'resolved';
  evidence: string[];
  witnesses: Array<{ name: string; phone: string; }>;
}

export const StaffManagerView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'credentialing' | 'deployment' | 'incidents' | 'catering'>('credentialing');
  
  // Dados iniciais vazios - usuário adiciona os seus próprios
  const [staff] = useState<StaffMember[]>([]);

  const [accessLogs] = useState<AccessLog[]>([]);

  const [incidents] = useState<Incident[]>([]);

  const getAccessLevelInfo = (level: number) => {
    switch (level) {
      case 1: return { name: 'Área Comum', color: 'bg-green-500', description: 'Acesso básico' };
      case 2: return { name: 'Backstage', color: 'bg-yellow-500', description: 'Áreas restritas' };
      case 3: return { name: 'All Access', color: 'bg-red-500', description: 'Acesso total' };
      default: return { name: 'Sem Acesso', color: 'bg-gray-500', description: 'Bloqueado' };
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'green': return 'bg-green-100 text-green-800 border-green-200';
      case 'yellow': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'red': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-600';
      case 'offline': return 'text-gray-500';
      case 'break': return 'text-yellow-600';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Staff Manager & Access Control</h2>
            <p className="text-sm text-slate-500">Credenciamento blindado e gestão operacional</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-slate-600">Sistema Online</span>
            </div>
            <span className="text-slate-500">{staff.filter(s => s.status === 'online').length} staff ativos</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab('credentialing')}
          className={`px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
            activeTab === 'credentialing'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          <Badge className="w-4 h-4 inline mr-2" />
          Credenciamento Blindado
        </button>
        <button
          onClick={() => setActiveTab('deployment')}
          className={`px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
            activeTab === 'deployment'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          <MapPin className="w-4 h-4 inline mr-2" />
          Deployment & Postos
        </button>
        <button
          onClick={() => setActiveTab('incidents')}
          className={`px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
            activeTab === 'incidents'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          <AlertTriangle className="w-4 h-4 inline mr-2" />
          Legal Shield
        </button>
        <button
          onClick={() => setActiveTab('catering')}
          className={`px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
            activeTab === 'catering'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          <Utensils className="w-4 h-4 inline mr-2" />
          Catering Control
        </button>
      </div>

      {/* Tab Content - Credenciamento */}
      {activeTab === 'credentialing' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Staff List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">Equipe Cadastrada</h3>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Novo Staff
              </button>
            </div>

            <div className="space-y-3">
              {staff.map((member) => {
                const accessInfo = getAccessLevelInfo(member.accessLevel);
                return (
                  <div key={member.id} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {/* Photo + Verification */}
                        <div className="relative">
                          <img 
                            src={member.photo} 
                            alt={member.name}
                            className="w-12 h-12 rounded-full border-2 border-slate-200"
                          />
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                            <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-slate-800">{member.name}</h4>
                          <p className="text-sm text-slate-500">{member.role} • {member.document}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs px-2 py-1 rounded-full text-white font-bold ${accessInfo.color}`}>
                              Nível {member.accessLevel} - {accessInfo.name}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className={`text-sm font-medium ${getStatusColor(member.status)}`}>
                          {member.status === 'online' ? '🟢 Online' : 
                           member.status === 'break' ? '🟡 Intervalo' : '⚫ Offline'}
                        </div>
                        <p className="text-xs text-slate-500">{member.post}</p>
                        {member.checkInTime && (
                          <p className="text-xs text-slate-400">Check-in: {member.checkInTime}</p>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between items-center">
                      <div className="text-xs text-slate-500">
                        Turno: {member.shift}
                      </div>
                      <div className="flex gap-2">
                        <button className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100">
                          Ver Histórico
                        </button>
                        <button className="text-xs px-2 py-1 bg-slate-50 text-slate-600 rounded hover:bg-slate-100">
                          Editar
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Access Control Panel */}
          <div className="space-y-4">
            <div className="bg-slate-800 text-white p-6 rounded-lg">
              <h4 className="font-bold mb-4 flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Anti-Passback Monitor
              </h4>
              <div className="space-y-3">
                <div className="bg-slate-700/50 p-3 rounded">
                  <div className="text-sm font-medium">Portão Principal</div>
                  <div className="text-xs text-slate-300 mt-1">
                    ✅ Sem violações detectadas
                  </div>
                </div>
                <div className="bg-red-900/50 p-3 rounded border border-red-500/50">
                  <div className="text-sm font-medium text-red-200">Backstage</div>
                  <div className="text-xs text-red-300 mt-1">
                    ⚠️ Tentativa de dupla entrada - ID#1234
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-slate-200">
              <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Últimos Acessos
              </h4>
              <div className="space-y-2">
                {accessLogs.slice(0, 5).map((log) => (
                  <div key={log.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <img src={log.photo} alt="" className="w-6 h-6 rounded-full" />
                      <span className="font-medium">{log.staffName}</span>
                    </div>
                    <div className="text-right">
                      <div className={`text-xs ${log.action === 'entry' ? 'text-green-600' : 'text-red-600'}`}>
                        {log.action === 'entry' ? '→ Entrada' : '← Saída'}
                      </div>
                      <div className="text-xs text-slate-500">{log.timestamp}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content - Deployment */}
      {activeTab === 'deployment' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              Mapa de Postos
            </h3>
            <div className="bg-slate-100 rounded-lg p-8 text-center">
              <div className="text-slate-500 mb-4">
                <Navigation className="w-12 h-12 mx-auto mb-2" />
                Mapa Interativo de Deployment
              </div>
              <p className="text-sm text-slate-600">
                Arraste os ícones dos seguranças para seus postos específicos
              </p>
              
              {/* Posições de deployment - vazias por padrão */}
              <div className="mt-6 grid grid-cols-3 gap-4 text-sm">
                <div className="bg-yellow-100 p-2 rounded border border-yellow-300">
                  <div className="font-medium text-yellow-800">Posto 1</div>
                  <div className="text-yellow-600">Grade Frontal</div>
                  <div className="text-xs">🚫 Vago</div>
                </div>
                <div className="bg-yellow-100 p-2 rounded border border-yellow-300">
                  <div className="font-medium text-yellow-800">Posto 2</div>
                  <div className="text-yellow-600">Entrada VIP</div>
                  <div className="text-xs">🚫 Vago</div>
                </div>
                <div className="bg-yellow-100 p-2 rounded border border-yellow-300">
                  <div className="font-medium text-yellow-800">Posto 3</div>
                  <div className="text-yellow-600">Backstage</div>
                  <div className="text-xs">🚫 Vago</div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white p-6 rounded-lg border border-slate-200">
              <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Radio className="w-5 h-5 text-red-500" />
                Central de Emergência
              </h4>
              <button className="w-full bg-red-600 text-white p-4 rounded-lg font-bold text-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2">
                <Zap className="w-6 h-6" />
                BOTÃO DE PÂNICO
              </button>
              <p className="text-sm text-slate-500 mt-2 text-center">
                Dispara alerta imediato para CCO com geolocalização
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-slate-200">
              <h4 className="font-bold text-slate-800 mb-4">Escala de Turnos</h4>
              <div className="space-y-3">
                {staff.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 bg-slate-50 rounded">
                    <div>
                      <div className="font-medium text-slate-800">{member.name}</div>
                      <div className="text-sm text-slate-500">{member.shift}</div>
                    </div>
                    <div className={`text-sm font-medium ${getStatusColor(member.status)}`}>
                      {member.status === 'online' ? 'Presente' : 
                       member.status === 'break' ? 'Intervalo' : 'Ausente'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content - Legal Shield (Incidents) */}
      {activeTab === 'incidents' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">Ocorrências Ativas</h3>
              <button className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Nova Ocorrência
              </button>
            </div>

            <div className="space-y-3">
              {incidents.map((incident) => (
                <div key={incident.id} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {incident.type === 'medical' ? (
                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                          🚑
                        </div>
                      ) : incident.type === 'security' ? (
                        <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                          👮
                        </div>
                      ) : (
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          🔧
                        </div>
                      )}
                      <div>
                        <h4 className="font-semibold text-slate-800">{incident.title}</h4>
                        <p className="text-sm text-slate-500">{incident.location}</p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded border font-medium ${getSeverityColor(incident.severity)}`}>
                      {incident.severity === 'green' ? 'BAIXO' :
                       incident.severity === 'yellow' ? 'MÉDIO' : 'CRÍTICO'}
                    </span>
                  </div>

                  <p className="text-sm text-slate-600 mb-3">{incident.description}</p>

                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Por: {incident.reportedBy} • {incident.timestamp}</span>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1">
                        <Camera className="w-3 h-3" />
                        {incident.evidence.length}
                      </span>
                      {incident.witnesses.length > 0 && (
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {incident.witnesses.length}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 flex gap-2">
                    <button className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100">
                      Ver Detalhes
                    </button>
                    <button className="text-xs px-2 py-1 bg-green-50 text-green-600 rounded hover:bg-green-100">
                      Resolver
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="space-y-4">
            <div className="bg-red-900 text-white p-6 rounded-lg">
              <h4 className="font-bold mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                UX de Guerra - Ações Rápidas
              </h4>
              <div className="grid grid-cols-1 gap-3">
                <button className="bg-red-600 hover:bg-red-700 p-3 rounded-lg text-left">
                  <div className="flex items-center gap-2 font-medium">
                    🚑 EMERGÊNCIA MÉDICA
                  </div>
                  <div className="text-sm text-red-100 mt-1">Desmaio, ferimento, coma alcoólico</div>
                </button>
                <button className="bg-yellow-600 hover:bg-yellow-700 p-3 rounded-lg text-left">
                  <div className="flex items-center gap-2 font-medium">
                    👮 OCORRÊNCIA SEGURANÇA
                  </div>
                  <div className="text-sm text-yellow-100 mt-1">Briga, furto, invasão, expulsão</div>
                </button>
                <button className="bg-blue-600 hover:bg-blue-700 p-3 rounded-lg text-left">
                  <div className="flex items-center gap-2 font-medium">
                    🔧 PROBLEMA ESTRUTURA
                  </div>
                  <div className="text-sm text-blue-100 mt-1">Grade quebrada, vazamento</div>
                </button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-slate-200">
              <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Mic className="w-5 h-5 text-purple-600" />
                Ditado de Voz
              </h4>
              <button className="w-full bg-purple-600 text-white p-4 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center gap-2">
                <Mic className="w-5 h-5" />
                Gravar Relato
              </button>
              <p className="text-sm text-slate-500 mt-2 text-center">
                IA transcreve automaticamente para o relatório
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content - Catering */}
      {activeTab === 'catering' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <QrCode className="w-5 h-5 text-green-600" />
              Wallet de Refeições
            </h3>
            <div className="space-y-4">
              {staff.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <img src={member.photo} alt={member.name} className="w-8 h-8 rounded-full" />
                    <div>
                      <div className="font-medium text-slate-800">{member.name}</div>
                      <div className="text-sm text-slate-500">{member.role}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-green-600">2/2 refeições</div>
                    <div className="text-xs text-slate-500">Vegetariano</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white p-6 rounded-lg border border-slate-200">
              <h4 className="font-bold text-slate-800 mb-4">Controle de Estoque</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded border border-green-200">
                  <span className="font-medium text-green-800">Refeições Padrão</span>
                  <span className="text-green-600 font-bold">45/50</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-yellow-50 rounded border border-yellow-200">
                  <span className="font-medium text-yellow-800">Opções Vegetarianas</span>
                  <span className="text-yellow-600 font-bold">8/15</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-50 rounded border border-red-200">
                  <span className="font-medium text-red-800">Opções Veganas</span>
                  <span className="text-red-600 font-bold">2/10</span>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <h4 className="font-bold text-amber-800 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Sistema Anti-Duplicação
              </h4>
              <p className="text-sm text-amber-700">
                Staff marcado como "Onívoro" não consegue retirar opções veganas reservadas. 
                QR Code individual impede retiradas múltiplas.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};