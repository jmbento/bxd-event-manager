
import React, { useState } from 'react';
import { Vehicle, FuelLog } from '../types';
import { Map, Upload, Users, Zap, Wifi, Droplets, Shield, CheckCircle, AlertTriangle, Eye, Crown, Music, Coffee, Camera } from 'lucide-react';

interface Props {
  vehicles: Vehicle[];
  fuelLogs: FuelLog[];
  onAddFuelLog: (log: Omit<FuelLog, 'id'>) => void;
}

export const FleetView: React.FC<Props> = ({ vehicles, fuelLogs, onAddFuelLog }) => {
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [mapFile, setMapFile] = useState<File | null>(null);

  // Setorização do Site
  const siteAreas = [
    {
      id: 'stage-backstage',
      name: 'Palco & Backstage', 
      zones: [
        { id: 'main-stage', name: 'Palco Principal', capacity: 50, credentials: ['All Access', 'Artist', 'Crew'], infrastructure: { power: '380V Trifásico', water: true, internet: 'Fibra Dedicada' }, status: 'ready' },
        { id: 'backstage', name: 'Bastidores', capacity: 30, credentials: ['All Access', 'Artist'], infrastructure: { power: '220V', water: true, internet: 'WiFi 6' }, status: 'setup' },
        { id: 'loading-dock', name: 'Loading Dock', capacity: 15, credentials: ['All Access', 'Crew', 'Truck'], infrastructure: { power: '380V', water: false, internet: 'Cabo' }, status: 'ready' }
      ],
      color: 'bg-red-500',
      icon: Music
    },
    {
      id: 'foh',
      name: 'FOH (Front of House)',
      zones: [
        { id: 'house-mix', name: 'House Mix (Som)', capacity: 8, credentials: ['All Access', 'Audio'], infrastructure: { power: '220V Estabilizada', water: false, internet: 'Fibra' }, status: 'ready' },
        { id: 'light-console', name: 'Mesa de Luz', capacity: 4, credentials: ['All Access', 'Light'], infrastructure: { power: '220V', water: false, internet: 'Cabo' }, status: 'ready' }
      ],
      color: 'bg-blue-500',
      icon: Eye
    },
    {
      id: 'public-areas',
      name: 'Áreas de Público',
      zones: [
        { id: 'pit', name: 'Pista', capacity: 15000, credentials: ['Ticket', 'VIP'], infrastructure: { power: 'N/A', water: false, internet: 'WiFi Público' }, status: 'ready' },
        { id: 'vip', name: 'Camarote VIP', capacity: 500, credentials: ['VIP', 'All Access'], infrastructure: { power: '220V', water: true, internet: 'WiFi Premium' }, status: 'setup' },
        { id: 'front-stage', name: 'Front Stage', capacity: 2000, credentials: ['Front Stage', 'VIP'], infrastructure: { power: 'N/A', water: false, internet: 'WiFi' }, status: 'ready' }
      ],
      color: 'bg-green-500',
      icon: Users
    },
    {
      id: 'services',
      name: 'Serviços',
      zones: [
        { id: 'bars', name: 'Praça de Alimentação', capacity: 200, credentials: ['Público'], infrastructure: { power: '220V + Gás', water: true, internet: 'POS Dedicado' }, status: 'setup' },
        { id: 'medical', name: 'Posto Médico', capacity: 20, credentials: ['All Access', 'Médico'], infrastructure: { power: '220V + No-break', water: true, internet: 'Dedicado' }, status: 'ready' },
        { id: 'security', name: 'Base de Segurança', capacity: 30, credentials: ['All Access', 'Security'], infrastructure: { power: '220V', water: false, internet: 'CFTV + Rádio' }, status: 'ready' }
      ],
      color: 'bg-purple-500',
      icon: Coffee
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newLog.vehicleId && newLog.cost > 0) {
        onAddFuelLog(newLog);
        setShowModal(false);
        // Reset but keep date
        setNewLog(prev => ({ ...prev, liters: 0, cost: 0, kmAtRefuel: 0, stationName: '' }));
    }
  };

  const getVehicleName = (id: string) => vehicles.find(v => v.id === id)?.name || 'Desconhecido';
  const getVehiclePlate = (id: string) => vehicles.find(v => v.id === id)?.plate || '---';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div>
           <div className="flex items-center gap-3">
             <Map className="w-6 h-6 text-blue-500" />
             <div>
               <h2 className="text-2xl font-bold text-slate-800">Site Map & Setorização</h2>
               <p className="text-slate-500 text-sm mt-1">Mapa operacional com credenciamento e infraestrutura por zona</p>
             </div>
           </div>
        </div>
        <button 
           onClick={() => setShowUploadModal(true)}
           className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors"
        >
           <Upload className="w-5 h-5" />
           <span>Upload Planta Baixa</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
         {/* Site Map Visual */}
         <div className="lg:col-span-3">
           {/* Planta Baixa Interativa */}
           <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
             <h3 className="font-bold text-slate-800 mb-4">Planta Baixa Interativa</h3>
             <div className="relative bg-slate-50 rounded-lg overflow-hidden" style={{height: '400px'}}>
               {/* Mock Site Map */}
               <svg viewBox="0 0 800 400" className="w-full h-full">
                 {/* Palco Principal */}
                 <rect x="300" y="20" width="200" height="60" className="fill-red-500 stroke-red-700 stroke-2 cursor-pointer hover:fill-red-400" 
                       onClick={() => setSelectedArea('main-stage')} />
                 <text x="400" y="55" className="fill-white text-sm font-bold text-center" textAnchor="middle">PALCO PRINCIPAL</text>
                 
                 {/* Backstage */}
                 <rect x="300" y="90" width="200" height="40" className="fill-red-400 stroke-red-600 stroke-2 cursor-pointer hover:fill-red-300"
                       onClick={() => setSelectedArea('backstage')} />
                 <text x="400" y="115" className="fill-white text-xs font-bold" textAnchor="middle">BACKSTAGE</text>
                 
                 {/* Pista */}
                 <rect x="200" y="150" width="400" height="180" className="fill-green-500 stroke-green-700 stroke-2 cursor-pointer hover:fill-green-400"
                       onClick={() => setSelectedArea('pit')} />
                 <text x="400" y="245" className="fill-white text-lg font-bold" textAnchor="middle">PISTA (15.000 PAX)</text>
                 
                 {/* VIP */}
                 <rect x="620" y="150" width="120" height="80" className="fill-yellow-500 stroke-yellow-700 stroke-2 cursor-pointer hover:fill-yellow-400"
                       onClick={() => setSelectedArea('vip')} />
                 <text x="680" y="195" className="fill-white text-sm font-bold" textAnchor="middle">CAMAROTE VIP</text>
                 
                 {/* House Mix */}
                 <circle cx="400" cy="280" r="15" className="fill-blue-500 stroke-blue-700 stroke-2 cursor-pointer hover:fill-blue-400"
                         onClick={() => setSelectedArea('house-mix')} />
                 <text x="400" y="305" className="fill-blue-700 text-xs font-bold" textAnchor="middle">HOUSE MIX</text>
                 
                 {/* Serviços */}
                 <rect x="50" y="150" width="100" height="60" className="fill-purple-500 stroke-purple-700 stroke-2 cursor-pointer hover:fill-purple-400"
                       onClick={() => setSelectedArea('bars')} />
                 <text x="100" y="185" className="fill-white text-xs font-bold" textAnchor="middle">F&B</text>
                 
                 {/* Posto Médico */}
                 <rect x="650" y="250" width="80" height="40" className="fill-red-600 stroke-red-800 stroke-2 cursor-pointer hover:fill-red-500"
                       onClick={() => setSelectedArea('medical')} />
                 <text x="690" y="275" className="fill-white text-xs font-bold" textAnchor="middle">MÉDICO</text>
               </svg>
               
               {/* Legenda */}
               <div className="absolute bottom-4 left-4 bg-white/90 rounded-lg p-3 text-xs">
                 <div className="font-bold mb-2">LEGENDA</div>
                 <div className="space-y-1">
                   <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-500 rounded"></div>Palco & Backstage</div>
                   <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-500 rounded"></div>FOH</div>
                   <div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-500 rounded"></div>Público</div>
                   <div className="flex items-center gap-2"><div className="w-3 h-3 bg-purple-500 rounded"></div>Serviços</div>
                 </div>
               </div>
             </div>
           </div>

           {/* Setorização */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {siteAreas.map(area => {
               const Icon = area.icon;
               return (
                 <div key={area.id} className="bg-white rounded-xl border border-slate-200 p-4">
                   <h4 className="flex items-center gap-2 font-bold text-slate-800 mb-3">
                     <div className={`w-4 h-4 ${area.color} rounded`}></div>
                     <Icon className="w-4 h-4" />
                     {area.name}
                   </h4>
                   <div className="space-y-2">
                     {area.zones.map(zone => (
                       <button
                         key={zone.id}
                         onClick={() => setSelectedArea(zone.id)}
                         className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                           selectedArea === zone.id 
                             ? 'border-blue-500 bg-blue-50' 
                             : 'border-slate-200 hover:border-slate-300'
                         }`}
                       >
                         <div className="flex justify-between items-start mb-1">
                           <span className="font-medium text-slate-800">{zone.name}</span>
                           <div className={`w-2 h-2 rounded-full ${
                             zone.status === 'ready' ? 'bg-emerald-500' : 
                             zone.status === 'setup' ? 'bg-amber-500' : 'bg-red-500'
                           }`}></div>
                         </div>
                         <div className="text-xs text-slate-500">
                           Capacidade: {zone.capacity} PAX
                         </div>
                       </button>
                     ))}
                   </div>
                 </div>
               );
             })}
           </div>

         {/* Painel de Dados Críticos */}
         <div className="space-y-4">
           {selectedArea ? (
             <div className="bg-white rounded-xl border border-slate-200 p-6">
               {(() => {
                 // Encontrar a zona selecionada
                 let selectedZone = null;
                 for (const area of siteAreas) {
                   const zone = area.zones.find(z => z.id === selectedArea);
                   if (zone) {
                     selectedZone = zone;
                     break;
                   }
                 }
                 
                 if (!selectedZone) return <div>Área não encontrada</div>;
                 
                 return (
                   <div>
                     <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                       <Shield className="w-5 h-5 text-blue-500" />
                       {selectedZone.name}
                     </h3>
                     
                     {/* Capacidade */}
                     <div className="bg-blue-50 rounded-lg p-4 mb-4">
                       <div className="flex items-center gap-2 mb-2">
                         <Users className="w-4 h-4 text-blue-600" />
                         <span className="font-bold text-blue-800">Capacidade (PAX)</span>
                       </div>
                       <div className="text-2xl font-bold text-blue-600">
                         {selectedZone.capacity.toLocaleString()} pessoas
                       </div>
                       <div className="text-xs text-blue-600 mt-1">
                         📋 Crucial para Bombeiros
                       </div>
                     </div>
                     
                     {/* Credenciais */}
                     <div className="bg-amber-50 rounded-lg p-4 mb-4">
                       <div className="flex items-center gap-2 mb-2">
                         <Crown className="w-4 h-4 text-amber-600" />
                         <span className="font-bold text-amber-800">Nível de Credencial</span>
                       </div>
                       <div className="flex flex-wrap gap-1">
                         {selectedZone.credentials.map(cred => (
                           <span key={cred} className="bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded font-medium">
                             {cred}
                           </span>
                         ))}
                       </div>
                     </div>
                     
                     {/* Infraestrutura */}
                     <div className="bg-green-50 rounded-lg p-4 mb-4">
                       <div className="flex items-center gap-2 mb-3">
                         <Zap className="w-4 h-4 text-green-600" />
                         <span className="font-bold text-green-800">Infraestrutura</span>
                       </div>
                       <div className="space-y-2 text-sm">
                         <div className="flex items-center justify-between">
                           <span className="text-green-700">⚡ Energia:</span>
                           <span className="font-medium">{selectedZone.infrastructure.power}</span>
                         </div>
                         <div className="flex items-center justify-between">
                           <span className="text-green-700">💧 Água:</span>
                           <span className="font-medium">{selectedZone.infrastructure.water ? '✅ Disponível' : '❌ Não'}</span>
                         </div>
                         <div className="flex items-center justify-between">
                           <span className="text-green-700">🌐 Internet:</span>
                           <span className="font-medium">{selectedZone.infrastructure.internet}</span>
                         </div>
                       </div>
                     </div>
                     
                     {/* Status Operacional */}
                     <div className="bg-slate-50 rounded-lg p-4">
                       <div className="flex items-center gap-2 mb-3">
                         <CheckCircle className="w-4 h-4 text-slate-600" />
                         <span className="font-bold text-slate-800">Checklist de Entrega</span>
                       </div>
                       <div className="space-y-2 text-sm">
                         <label className="flex items-center gap-2">
                           <input type="checkbox" className="rounded" defaultChecked />
                           <span>🧹 Limpeza OK</span>
                         </label>
                         <label className="flex items-center gap-2">
                           <input type="checkbox" className="rounded" defaultChecked />
                           <span>🪑 Mobília OK</span>
                         </label>
                         <label className="flex items-center gap-2">
                           <input type="checkbox" className="rounded" />
                           <span>🚒 Vistoria Bombeiros OK</span>
                         </label>
                         <label className="flex items-center gap-2">
                           <input type="checkbox" className="rounded" />
                           <span>🔊 Teste de Sistema OK</span>
                         </label>
                       </div>
                     </div>
                   </div>
                 );
               })()}
             </div>
           ) : (
             <div className="bg-slate-50 rounded-xl p-8 text-center">
               <Map className="w-12 h-12 text-slate-400 mx-auto mb-3" />
               <h3 className="font-bold text-slate-600 mb-2">Selecione uma Área</h3>
               <p className="text-sm text-slate-500">
                 Clique em uma zona no mapa ou na lista para ver dados críticos
               </p>
             </div>
           )}
           
           {/* Status Geral */}
           <div className="bg-white rounded-xl border border-slate-200 p-6">
             <h3 className="font-bold text-slate-800 mb-4">Status Geral do Site</h3>
             <div className="space-y-3">
               <div className="flex justify-between items-center text-sm">
                 <span>🟢 Áreas Prontas:</span>
                 <span className="font-bold">8/12</span>
               </div>
               <div className="flex justify-between items-center text-sm">
                 <span>🟡 Em Setup:</span>
                 <span className="font-bold">3/12</span>
               </div>
               <div className="flex justify-between items-center text-sm">
                 <span>🔴 Pendente:</span>
                 <span className="font-bold">1/12</span>
               </div>
               <div className="border-t pt-3 mt-3">
                 <div className="flex justify-between items-center text-sm font-bold">
                   <span>Capacidade Total:</span>
                   <span>17.823 PAX</span>
                 </div>
               </div>
             </div>
                        ))}
                        {fuelLogs.length === 0 && (
                            <div className="p-8 text-center text-slate-400">Nenhum registro encontrado.</div>
                        )}
             </div>
         </div>

         {/* Stats / Info */}
         <div className="space-y-6">
            <div className="bg-amber-50 p-5 rounded-xl border border-amber-100">
                <div className="flex items-start gap-3">
                    <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0" />
                    <div>
                        <h4 className="font-bold text-amber-900 text-sm">Regra de Abastecimento</h4>
                        <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                            Apenas veículos declarados à Justiça Eleitoral podem ser abastecidos com verba de campanha. Guarde todas as notas fiscais (NFe com CNPJ da campanha).
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <h4 className="font-bold text-slate-800 mb-4">Média da Frota</h4>
                <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Gasto Total Combustível</span>
                        <span className="font-bold text-slate-900">R$ {fuelLogs.reduce((acc, l) => acc + l.cost, 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Litros Consumidos</span>
                        <span className="font-bold text-slate-900">{fuelLogs.reduce((acc, l) => acc + l.liters, 0)} L</span>
                    </div>
                </div>
            </div>
         </div>
      </div>

      {/* MODAL NEW FUEL LOG */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
             <div className="bg-white rounded-xl shadow-2xl max-w-md w-full animate-in zoom-in-95">
                <div className="p-6 border-b border-slate-100">
                    <h3 className="text-xl font-bold text-slate-900">Registrar Abastecimento</h3>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Veículo</label>
                        <select 
                            className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                            value={newLog.vehicleId}
                            onChange={e => setNewLog({...newLog, vehicleId: e.target.value})}
                        >
                            {vehicles.map(v => (
                                <option key={v.id} value={v.id}>{v.name} - {v.plate}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Data</label>
                            <input 
                                type="date" 
                                className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                                value={newLog.date}
                                onChange={e => setNewLog({...newLog, date: e.target.value})}
                                required
                            />
                        </div>
                         <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Valor (R$)</label>
                            <input 
                                type="number" 
                                step="0.01"
                                className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                                value={newLog.cost}
                                onChange={e => setNewLog({...newLog, cost: parseFloat(e.target.value)})}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Litros</label>
                            <input 
                                type="number" 
                                step="0.1"
                                className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                                value={newLog.liters}
                                onChange={e => setNewLog({...newLog, liters: parseFloat(e.target.value)})}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">KM Atual</label>
                            <input 
                                type="number" 
                                className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                                value={newLog.kmAtRefuel}
                                onChange={e => setNewLog({...newLog, kmAtRefuel: parseFloat(e.target.value)})}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome do Posto</label>
                        <input 
                            type="text" 
                            className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                            value={newLog.stationName}
                            onChange={e => setNewLog({...newLog, stationName: e.target.value})}
                            placeholder="Ex: Posto Ipiranga Centro"
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-3 mt-6 pt-2">
                        <button 
                            type="button"
                            onClick={() => setShowModal(false)}
                            className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg text-sm"
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit"
                            className="px-4 py-2 bg-amber-600 text-white font-medium hover:bg-amber-700 rounded-lg shadow-sm text-sm"
                        >
                            Salvar Registro
                        </button>
                    </div>
                </form>
             </div>
        </div>
      )}
    </div>
  );
};
