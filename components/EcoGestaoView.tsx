import React, { useState } from 'react';
import { 
  Recycle, Zap, Leaf, TreePine, AlertTriangle, TrendingUp, 
  Trash2, Battery, Droplets, Wind, Sun, Calculator, 
  BarChart3, Award, CheckCircle2, Clock, Plus, Upload
} from 'lucide-react';

interface WasteContainer {
  id: string;
  type: 'compactor' | 'recycling' | 'organic';
  location: string;
  capacity: number;
  currentLevel: number;
  status: 'empty' | 'half' | 'full' | 'needs-pickup';
  lastPickup: string;
}

interface EnergySource {
  id: string;
  type: 'diesel' | 'solar' | 'wind' | 'grid';
  name: string;
  capacity: number;
  currentOutput: number;
  fuelLevel?: number;
  co2Emissions: number;
}

interface FoodWaste {
  id: string;
  date: string;
  location: string;
  organic: number;
  donated: number;
  wasted: number;
  co2Impact: number;
}

interface CarbonFootprint {
  artists: number;
  generators: number;
  audience: number;
  total: number;
  treesNeeded: number;
}

export const EcoGestaoView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'waste' | 'energy' | 'food' | 'carbon'>('waste');
  
  // Mock Data
  const [wasteContainers] = useState<WasteContainer[]>([
    { 
      id: '1', type: 'compactor', location: 'Área Principal', capacity: 100, 
      currentLevel: 85, status: 'needs-pickup', lastPickup: '2025-12-03 14:30' 
    },
    { 
      id: '2', type: 'recycling', location: 'Backstage', capacity: 50, 
      currentLevel: 30, status: 'half', lastPickup: '2025-12-04 08:00' 
    },
    { 
      id: '3', type: 'organic', location: 'Food Court', capacity: 30, 
      currentLevel: 75, status: 'full', lastPickup: '2025-12-03 20:00' 
    }
  ]);

  const [energySources] = useState<EnergySource[]>([
    { 
      id: '1', type: 'diesel', name: 'Gerador Principal', capacity: 500, 
      currentOutput: 380, fuelLevel: 65, co2Emissions: 156 
    },
    { 
      id: '2', type: 'solar', name: 'Painel Solar Backstage', capacity: 100, 
      currentOutput: 45, co2Emissions: 0 
    },
    { 
      id: '3', type: 'wind', name: 'Turbina Eólica', capacity: 50, 
      currentOutput: 28, co2Emissions: 0 
    }
  ]);

  const [foodWaste] = useState<FoodWaste[]>([
    { 
      id: '1', date: '2025-12-04', location: 'Food Court', 
      organic: 45, donated: 15, wasted: 8, co2Impact: 12 
    },
    { 
      id: '2', date: '2025-12-03', location: 'Staff Catering', 
      organic: 28, donated: 22, wasted: 3, co2Impact: 4 
    }
  ]);

  const carbonFootprint: CarbonFootprint = {
    artists: 1200,
    generators: 3400,
    audience: 8500,
    total: 13100,
    treesNeeded: 596
  };

  const getContainerColor = (container: WasteContainer) => {
    switch (container.status) {
      case 'empty': return 'bg-green-100 border-green-300 text-green-800';
      case 'half': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'full': return 'bg-orange-100 border-orange-300 text-orange-800';
      case 'needs-pickup': return 'bg-red-100 border-red-300 text-red-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const getEnergyTypeIcon = (type: string) => {
    switch (type) {
      case 'diesel': return <Zap className="w-5 h-5 text-orange-600" />;
      case 'solar': return <Sun className="w-5 h-5 text-yellow-500" />;
      case 'wind': return <Wind className="w-5 h-5 text-blue-500" />;
      case 'grid': return <Battery className="w-5 h-5 text-gray-600" />;
      default: return <Zap className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Leaf className="w-8 h-8 text-green-600" />
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Eco-Gestão & Sustentabilidade</h2>
            <p className="text-sm text-slate-500">Monitor ambiental e gestão de impacto do evento</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right text-sm">
            <div className="flex items-center gap-2">
              <TreePine className="w-4 h-4 text-green-600" />
              <span className="text-slate-600">Carbon Offset</span>
            </div>
            <span className="text-slate-500">{carbonFootprint.treesNeeded} árvores necessárias</span>
          </div>
        </div>
      </div>

      {/* Sustainability Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-100">
          <div className="flex items-center gap-3">
            <Recycle className="w-8 h-8 text-green-600" />
            <div>
              <div className="text-sm text-slate-600">Taxa de Reciclagem</div>
              <div className="text-2xl font-bold text-slate-800">78%</div>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-4 rounded-lg border border-yellow-100">
          <div className="flex items-center gap-3">
            <Sun className="w-8 h-8 text-yellow-600" />
            <div>
              <div className="text-sm text-slate-600">Energia Limpa</div>
              <div className="text-2xl font-bold text-slate-800">23%</div>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-100">
          <div className="flex items-center gap-3">
            <Droplets className="w-8 h-8 text-blue-600" />
            <div>
              <div className="text-sm text-slate-600">Água Economizada</div>
              <div className="text-2xl font-bold text-slate-800">1.2K L</div>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-pink-50 p-4 rounded-lg border border-red-100">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-red-600" />
            <div>
              <div className="text-sm text-slate-600">CO₂ Total</div>
              <div className="text-2xl font-bold text-slate-800">{(carbonFootprint.total / 1000).toFixed(1)}t</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab('waste')}
          className={`px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
            activeTab === 'waste'
              ? 'text-green-600 border-b-2 border-green-600'
              : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          <Trash2 className="w-4 h-4 inline mr-2" />
          Gestão de Resíduos
        </button>
        <button
          onClick={() => setActiveTab('energy')}
          className={`px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
            activeTab === 'energy'
              ? 'text-green-600 border-b-2 border-green-600'
              : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          <Zap className="w-4 h-4 inline mr-2" />
          Eficiência Energética
        </button>
        <button
          onClick={() => setActiveTab('food')}
          className={`px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
            activeTab === 'food'
              ? 'text-green-600 border-b-2 border-green-600'
              : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          <Leaf className="w-4 h-4 inline mr-2" />
          Food Waste Control
        </button>
        <button
          onClick={() => setActiveTab('carbon')}
          className={`px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
            activeTab === 'carbon'
              ? 'text-green-600 border-b-2 border-green-600'
              : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          <TreePine className="w-4 h-4 inline mr-2" />
          Carbon Footprint
        </button>
      </div>

      {/* Tab Content - Gestão de Resíduos */}
      {activeTab === 'waste' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">Monitor de Caçambas</h3>
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Nova Caçamba
              </button>
            </div>

            <div className="space-y-3">
              {wasteContainers.map((container) => (
                <div key={container.id} className={`p-4 rounded-lg border-2 ${getContainerColor(container)}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-full">
                        {container.type === 'compactor' ? <Trash2 className="w-5 h-5 text-slate-600" /> :
                         container.type === 'recycling' ? <Recycle className="w-5 h-5 text-blue-600" /> :
                         <Leaf className="w-5 h-5 text-green-600" />}
                      </div>
                      <div>
                        <h4 className="font-semibold">
                          {container.type === 'compactor' ? 'Lixo Geral' :
                           container.type === 'recycling' ? 'Reciclável' : 'Orgânico'}
                        </h4>
                        <p className="text-sm opacity-80">{container.location}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">{container.currentLevel}%</div>
                      <div className="text-xs opacity-80">
                        {container.status === 'needs-pickup' ? '🚨 Solicitar Troca' :
                         container.status === 'full' ? '⚠️ Cheio' :
                         container.status === 'half' ? '📊 50%' : '✅ Vazio'}
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-white/50 rounded-full h-2 mb-3">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        container.currentLevel >= 90 ? 'bg-red-500' :
                        container.currentLevel >= 70 ? 'bg-orange-500' :
                        container.currentLevel >= 40 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${container.currentLevel}%` }}
                    ></div>
                  </div>

                  <div className="flex justify-between items-center text-xs opacity-80">
                    <span>Capacidade: {container.capacity}L</span>
                    <span>Última coleta: {container.lastPickup}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Waste Analytics Panel */}
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-lg border border-slate-200">
              <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-green-600" />
                Estatísticas de Reciclagem
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Aterro Sanitário</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-slate-200 rounded-full h-2">
                      <div className="bg-red-500 h-2 rounded-full" style={{width: '45%'}}></div>
                    </div>
                    <span className="text-sm font-medium">45%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Reciclável</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-slate-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{width: '35%'}}></div>
                    </div>
                    <span className="text-sm font-medium">35%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Compostagem</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-slate-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{width: '20%'}}></div>
                    </div>
                    <span className="text-sm font-medium">20%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <h4 className="font-bold text-amber-800 mb-2 flex items-center gap-2">
                <Award className="w-4 h-4" />
                Certificação MTR
              </h4>
              <p className="text-sm text-amber-700 mb-3">
                Manifesto de Transporte de Resíduos obrigatório para evitar multas ambientais.
              </p>
              <button className="w-full bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-700 flex items-center justify-center gap-2">
                <Upload className="w-4 h-4" />
                Upload MTR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content - Eficiência Energética */}
      {activeTab === 'energy' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800">Monitor de Geradores</h3>
            {energySources.map((source) => (
              <div key={source.id} className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {getEnergyTypeIcon(source.type)}
                    <div>
                      <h4 className="font-semibold text-slate-800">{source.name}</h4>
                      <p className="text-sm text-slate-500">{source.type.toUpperCase()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-slate-800">{source.currentOutput}kW</div>
                    <div className="text-sm text-slate-500">{source.capacity}kW máx</div>
                  </div>
                </div>

                {/* Power Output Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-slate-600 mb-1">
                    <span>Saída Atual</span>
                    <span>{Math.round((source.currentOutput / source.capacity) * 100)}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        source.type === 'diesel' ? 'bg-orange-500' :
                        source.type === 'solar' ? 'bg-yellow-500' :
                        source.type === 'wind' ? 'bg-blue-500' : 'bg-gray-500'
                      }`}
                      style={{ width: `${(source.currentOutput / source.capacity) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Fuel Level for Diesel */}
                {source.type === 'diesel' && source.fuelLevel && (
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-slate-600 mb-1">
                      <span>Nível de Combustível</span>
                      <span>{source.fuelLevel}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          source.fuelLevel < 25 ? 'bg-red-500' :
                          source.fuelLevel < 50 ? 'bg-orange-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${source.fuelLevel}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* CO2 Emissions */}
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600">Emissão CO₂/h:</span>
                  <span className={`font-medium ${
                    source.co2Emissions === 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {source.co2Emissions} kg
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
              <h4 className="font-bold text-green-800 mb-4 flex items-center gap-2">
                <TreePine className="w-5 h-5" />
                Grid Híbrido & Economia
              </h4>
              <div className="space-y-3">
                <div className="bg-white p-3 rounded-lg">
                  <div className="text-sm text-slate-600">CO₂ Evitado (Energia Limpa)</div>
                  <div className="text-2xl font-bold text-green-600">73 kg</div>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <div className="text-sm text-slate-600">Economia Financeira</div>
                  <div className="text-2xl font-bold text-green-600">R$ 890</div>
                </div>
                <div className="text-sm text-green-700">
                  ✅ 23% da energia vem de fontes renováveis
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-slate-200">
              <h4 className="font-bold text-slate-800 mb-4">Telemetria em Tempo Real</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded">
                  <span className="text-sm text-slate-600">Consumo Total</span>
                  <span className="font-bold text-slate-800">453 kW</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded">
                  <span className="text-sm text-slate-600">Eficiência</span>
                  <span className="font-bold text-green-600">87%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded">
                  <span className="text-sm text-slate-600">Custo/Hora</span>
                  <span className="font-bold text-slate-800">R$ 156</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content - Food Waste Control */}
      {activeTab === 'food' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800">Controle de Sobras</h3>
            {foodWaste.map((waste) => (
              <div key={waste.id} className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h4 className="font-semibold text-slate-800">{waste.location}</h4>
                    <p className="text-sm text-slate-500">{waste.date}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-slate-600">Impact CO₂</div>
                    <div className="text-lg font-bold text-red-600">{waste.co2Impact} kg</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-lg font-bold text-green-600">{waste.organic}kg</div>
                    <div className="text-xs text-green-700">Orgânico</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-lg font-bold text-blue-600">{waste.donated}kg</div>
                    <div className="text-xs text-blue-700">Doado</div>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="text-lg font-bold text-red-600">{waste.wasted}kg</div>
                    <div className="text-xs text-red-700">Desperdiçado</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <div className="bg-emerald-50 p-6 rounded-lg border border-emerald-200">
              <h4 className="font-bold text-emerald-800 mb-4 flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Pegada de Carbono do Cardápio
              </h4>
              <div className="space-y-3">
                <div className="bg-white p-3 rounded-lg">
                  <div className="text-sm text-slate-600">Economia de Água (Opções Veggie)</div>
                  <div className="text-2xl font-bold text-blue-600">2.4K L</div>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <div className="text-sm text-slate-600">CO₂ Evitado (Sem Carne)</div>
                  <div className="text-2xl font-bold text-green-600">890 kg</div>
                </div>
                <div className="text-sm text-emerald-700">
                  🌱 65% das opções são conscientes (vegetarianas/veganas)
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-slate-200">
              <h4 className="font-bold text-slate-800 mb-4">Estatísticas Semanais</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Taxa de Aproveitamento</span>
                  <span className="font-bold text-green-600">89%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Alimentos Doados</span>
                  <span className="font-bold text-blue-600">127 kg</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Desperdício Total</span>
                  <span className="font-bold text-red-600">23 kg</span>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <h4 className="font-bold text-amber-800 mb-2">Parcerias ONG</h4>
              <p className="text-sm text-amber-700 mb-3">
                Alimentos em bom estado são automaticamente direcionados para ONGs parceiras.
              </p>
              <div className="text-sm text-amber-600">
                📍 Mesa Brasil SESC • 📍 Banco de Alimentos
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content - Carbon Footprint */}
      {activeTab === 'carbon' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg border border-slate-200">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-slate-600" />
                Calculadora de Emissões
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
                  <div>
                    <div className="font-medium text-slate-800">Viagens dos Artistas</div>
                    <div className="text-sm text-slate-500">Voos + transporte terrestre</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-800">{carbonFootprint.artists} kg</div>
                    <div className="text-sm text-slate-500">CO₂</div>
                  </div>
                </div>

                <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
                  <div>
                    <div className="font-medium text-slate-800">Geradores & Energia</div>
                    <div className="text-sm text-slate-500">Consumo total do evento</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-800">{carbonFootprint.generators} kg</div>
                    <div className="text-sm text-slate-500">CO₂</div>
                  </div>
                </div>

                <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
                  <div>
                    <div className="font-medium text-slate-800">Deslocamento do Público</div>
                    <div className="text-sm text-slate-500">Estimativa baseada em localização</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-800">{carbonFootprint.audience} kg</div>
                    <div className="text-sm text-slate-500">CO₂</div>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-4 mt-4">
                <div className="flex justify-between items-center">
                  <div className="font-bold text-lg text-slate-800">Emissão Total</div>
                  <div className="text-2xl font-bold text-red-600">
                    {(carbonFootprint.total / 1000).toFixed(1)} toneladas CO₂
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
              <h4 className="font-bold text-green-800 mb-4 flex items-center gap-2">
                <TreePine className="w-6 h-6" />
                Neutralização Necessária
              </h4>
              
              <div className="text-center mb-4">
                <div className="text-4xl font-bold text-green-600">{carbonFootprint.treesNeeded}</div>
                <div className="text-lg text-green-700">árvores para plantar</div>
                <div className="text-sm text-green-600 mt-2">
                  Para neutralizar completamente o evento
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-white p-3 rounded-lg">
                  <div className="text-sm text-slate-600">Investimento Necessário</div>
                  <div className="text-xl font-bold text-green-600">
                    R$ {(carbonFootprint.treesNeeded * 15).toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-500">R$ 15 por árvore</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-slate-200">
              <h4 className="font-bold text-slate-800 mb-4">Ações de Compensação</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <div className="flex-1">
                    <div className="font-medium text-slate-800">Parceria Reflorestamento</div>
                    <div className="text-sm text-slate-500">SOS Mata Atlântica</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <div className="flex-1">
                    <div className="font-medium text-slate-800">Créditos de Carbono</div>
                    <div className="text-sm text-slate-500">Mercado voluntário</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  <div className="flex-1">
                    <div className="font-medium text-slate-800">Energia Renovável</div>
                    <div className="text-sm text-slate-500">Para próximos eventos</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                <Award className="w-4 h-4" />
                Certificação Carbon Neutral
              </h4>
              <p className="text-sm text-blue-700 mb-3">
                Evento pode receber selo de carbono neutro com a compensação completa.
              </p>
              <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
                Solicitar Certificação
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};