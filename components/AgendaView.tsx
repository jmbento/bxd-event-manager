import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Users, AlertCircle, Plus, Radio, RotateCcw, Zap, AlertTriangle } from 'lucide-react';
import type { CalendarEvent, InventoryItem } from '../types';

interface AgendaViewProps {
  events: CalendarEvent[];
  inventory: InventoryItem[];
  onAddEvent: (event: Omit<CalendarEvent, 'id'>) => void;
}

export const AgendaView: React.FC<AgendaViewProps> = ({ events, inventory, onAddEvent }) => {
  const [selectedStage, setSelectedStage] = useState('Main Stage');
  const [curfewTime, setCurfewTime] = useState('01:00');
  const [showModal, setShowModal] = useState(false);

  const stages = ['Main Stage', 'Stage 2', 'DJ Booth', 'Acoustic'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
      {/* List Column */}
      <div className="lg:col-span-2 space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Radio className="w-6 h-6 text-red-500" />
            <div>
              <h2 className="text-xl font-bold text-slate-800">Running Order & Cronograma</h2>
              <p className="text-sm text-slate-500">A bíblia da operação - Timeline por Palco</p>
            </div>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nova Entrada
          </button>
        </div>

        {/* Stage Selector & Curfew */}
        <div className="flex flex-wrap gap-4 items-center justify-between bg-slate-50 p-4 rounded-lg">
          <div className="flex gap-2">
            {stages.map((stage) => (
              <button
                key={stage}
                onClick={() => setSelectedStage(stage)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedStage === stage
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-100'
                }`}
              >
                {stage}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span className="text-slate-600">Toque de Recolher:</span>
              <select
                value={curfewTime}
                onChange={(e) => setCurfewTime(e.target.value)}
                className="px-2 py-1 border border-slate-300 rounded text-sm"
              >
                <option value="00:00">00:00</option>
                <option value="01:00">01:00</option>
                <option value="02:00">02:00</option>
                <option value="03:00">03:00</option>
              </select>
            </div>
          </div>
        </div>

        {/* Timeline Container */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            {selectedStage} - Running Order
          </h3>

          {/* Timeline Entries */}
          <div className="space-y-3">
            {[...Array(12)].map((_, i) => {
              const hour = 14 + i; // Começa às 14h
              const timeStr = `${hour.toString().padStart(2, '0')}:00`;
              const isCurfewZone = hour >= parseInt(curfewTime.split(':')[0]);
              
              return (
                <div key={i} className={`flex items-center gap-4 py-3 border-l-4 pl-4 relative ${
                  isCurfewZone ? 'border-red-500 bg-red-50/30' : 'border-slate-200'
                }`}>
                  {/* Horário */}
                  <div className={`w-12 text-sm font-bold ${
                    isCurfewZone ? 'text-red-600' : 'text-slate-600'
                  }`}>
                    {timeStr}
                  </div>
                  
                  {/* Bloco Operacional */}
                  {i % 3 === 0 && ( // Mock: alguns horários têm eventos
                    <div className="flex-1 bg-white rounded-lg border-2 border-l-4 border-l-emerald-500 p-4 shadow-sm hover:shadow-md transition-all group">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-bold text-slate-800">DJ Alok</h4>
                          <p className="text-sm text-slate-500">Main Act • 90 min</p>
                        </div>
                        <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-600 rounded font-medium border border-emerald-200">
                          Confirmado
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded font-medium hover:bg-blue-100">
                          Rider Técnico
                        </button>
                        <button className="text-xs px-2 py-1 bg-green-50 text-green-600 rounded font-medium hover:bg-green-100">
                          Contato Manager
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Changeover Blocks */}
                  {i % 3 === 1 && i > 0 && (
                    <div className="flex-1">
                      <div className="bg-red-50 border-2 border-red-200 border-dashed rounded-lg p-3">
                        <div className="flex items-center gap-2 text-red-700">
                          <RotateCcw className="w-4 h-4" />
                          <span className="font-bold text-sm">CHANGEOVER - 30min</span>
                          <span className="text-xs bg-red-100 px-2 py-0.5 rounded font-medium">
                            MOMENTO MAIS TENSO
                          </span>
                        </div>
                        <p className="text-xs text-red-600 mt-1">
                          Desmonte técnico + Setup próximo artista
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* Empty Slots */}
                  {i % 3 === 2 && (
                    <div className="flex-1">
                      <div className="bg-slate-50 border border-dashed border-slate-200 rounded-lg p-3 text-center">
                        <span className="text-xs text-slate-400">Horário Livre</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Control Panel Column */}
      <div className="space-y-4">
        {/* Status dos Palcos */}
        <div className="bg-slate-800 rounded-xl p-6 text-white">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Radio className="w-5 h-5 text-red-400" />
            Status dos Palcos
          </h3>
          
          <div className="space-y-3">
            {stages.map((stage, index) => (
              <div key={stage} className="bg-slate-700/50 p-3 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{stage}</span>
                  <div className={`w-3 h-3 rounded-full ${
                    index === 0 ? 'bg-green-400' : 
                    index === 1 ? 'bg-yellow-400' : 'bg-red-400'
                  }`}></div>
                </div>
                <div className="text-xs text-slate-300">
                  {index === 0 ? '🎵 Show em andamento' :
                   index === 1 ? '⚙️ Changeover' : '🔧 Manutenção'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alertas Críticos */}
        <div className="bg-red-900 rounded-xl p-6 text-white">
          <h4 className="font-bold mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            Alertas Críticos
          </h4>
          <div className="space-y-3 text-sm">
            <div className="bg-red-800/50 p-3 rounded border-l-4 border-yellow-400">
              <div className="font-medium">⚠️ Toque de Recolher em 2h</div>
              <div className="text-red-200 text-xs mt-1">Ajustar cronograma ou reduzir tempos</div>
            </div>
            <div className="bg-red-800/50 p-3 rounded border-l-4 border-orange-400">
              <div className="font-medium">🔥 Clash Detection</div>
              <div className="text-red-200 text-xs mt-1">DJ Alok + Vintage Culture sobrepostos</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h4 className="font-bold text-slate-800 mb-4">Ações Rápidas</h4>
          <div className="space-y-2">
            <button className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded-lg text-sm transition-colors">
              📋 Export Running Order
            </button>
            <button className="w-full text-left p-3 bg-green-50 hover:bg-green-100 rounded-lg text-sm transition-colors">
              📊 Relatório de Tempos
            </button>
            <button className="w-full text-left p-3 bg-purple-50 hover:bg-purple-100 rounded-lg text-sm transition-colors">
              🚛 Coordenar Logística
            </button>
          </div>
        </div>
      </div>

      {/* Modal para novo evento */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Nova Entrada no Running Order</h3>
            <form onSubmit={(e) => { e.preventDefault(); setShowModal(false); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Artista/Evento
                </label>
                <input
                  type="text"
                  placeholder="Nome do artista ou evento"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Horário
                  </label>
                  <input
                    type="time"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Duração (min)
                  </label>
                  <input
                    type="number"
                    placeholder="60"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Criar Evento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};