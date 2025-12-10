import React, { useState } from 'react';
import {
  Download,
  FileSpreadsheet,
  Users,
  Mail,
  Phone,
  MapPin,
  CheckCircle,
  Filter,
  Calendar,
  TrendingUp,
  Target,
  Loader2,
} from 'lucide-react';
import type { Attendee } from './types';

interface Props {
  attendees: Attendee[];
  onExport: (format: 'csv' | 'xlsx', filters: ExportFilters) => Promise<void>;
}

interface ExportFilters {
  ticketTypes: string[];
  marketingOptIn: boolean | null;
  dateRange: { start: string; end: string } | null;
  cities: string[];
  states: string[];
}

export const LeadsExporter: React.FC<Props> = ({ attendees, onExport }) => {
  const [exporting, setExporting] = useState(false);
  const [filters, setFilters] = useState<ExportFilters>({
    ticketTypes: [],
    marketingOptIn: null,
    dateRange: null,
    cities: [],
    states: [],
  });
  
  // Stats
  const totalLeads = attendees.length;
  const withEmail = attendees.filter(a => a.email).length;
  const withPhone = attendees.filter(a => a.phone).length;
  const marketingOptIn = attendees.filter(a => a.marketing_opt_in).length;
  
  // Unique values for filters
  const ticketTypes: string[] = Array.from(new Set(attendees.map(a => a.ticket_type)));
  const cities: string[] = Array.from(new Set<string>(attendees.filter(a => a.city).map(a => a.city!))).sort();
  const states: string[] = Array.from(new Set<string>(attendees.filter(a => a.state).map(a => a.state!))).sort();

  // Filter attendees based on selected filters
  const filteredAttendees = attendees.filter(a => {
    if (filters.ticketTypes.length > 0 && !filters.ticketTypes.includes(a.ticket_type)) return false;
    if (filters.marketingOptIn !== null && a.marketing_opt_in !== filters.marketingOptIn) return false;
    if (filters.states.length > 0 && (!a.state || !filters.states.includes(a.state))) return false;
    if (filters.cities.length > 0 && (!a.city || !filters.cities.includes(a.city))) return false;
    return true;
  });

  const handleExport = async (format: 'csv' | 'xlsx') => {
    setExporting(true);
    try {
      await onExport(format, filters);
    } finally {
      setExporting(false);
    }
  };

  const toggleFilter = (type: 'ticketTypes' | 'cities' | 'states', value: string) => {
    setFilters(prev => ({
      ...prev,
      [type]: prev[type].includes(value)
        ? prev[type].filter(v => v !== value)
        : [...prev[type], value]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{totalLeads}</p>
              <p className="text-xs text-slate-500">Total de Leads</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Mail className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-900">{withEmail}</p>
              <p className="text-xs text-slate-500">Com E-mail</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Phone className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-900">{withPhone}</p>
              <p className="text-xs text-slate-500">Com Telefone</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <Target className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-900">{marketingOptIn}</p>
              <p className="text-xs text-slate-500">Opt-in Marketing</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Filter className="w-5 h-5 text-slate-600" />
          Filtros de Exportação
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Ticket Type Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Tipo de Ingresso
            </label>
            <div className="space-y-2">
              {ticketTypes.map(type => (
                <label key={type} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.ticketTypes.includes(type)}
                    onChange={() => toggleFilter('ticketTypes', type)}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-700 capitalize">{type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Marketing Opt-in Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Aceita Marketing
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="marketing"
                  checked={filters.marketingOptIn === null}
                  onChange={() => setFilters(prev => ({ ...prev, marketingOptIn: null }))}
                  className="w-4 h-4 border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700">Todos</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="marketing"
                  checked={filters.marketingOptIn === true}
                  onChange={() => setFilters(prev => ({ ...prev, marketingOptIn: true }))}
                  className="w-4 h-4 border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700">Sim, aceita</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="marketing"
                  checked={filters.marketingOptIn === false}
                  onChange={() => setFilters(prev => ({ ...prev, marketingOptIn: false }))}
                  className="w-4 h-4 border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700">Não aceita</span>
              </label>
            </div>
          </div>

          {/* State Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Estado (UF)
            </label>
            <div className="max-h-40 overflow-y-auto space-y-1">
              {states.map(state => (
                <label key={state} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.states.includes(state)}
                    onChange={() => toggleFilter('states', state)}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-700">{state}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Cities Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Cidade
            </label>
            <div className="max-h-40 overflow-y-auto space-y-1">
              {cities.slice(0, 15).map(city => (
                <label key={city} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.cities.includes(city)}
                    onChange={() => toggleFilter('cities', city)}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-700 truncate">{city}</span>
                </label>
              ))}
              {cities.length > 15 && (
                <p className="text-xs text-slate-400">+{cities.length - 15} cidades</p>
              )}
            </div>
          </div>
        </div>
        
        {/* Clear Filters */}
        <button
          onClick={() => setFilters({
            ticketTypes: [],
            marketingOptIn: null,
            dateRange: null,
            cities: [],
            states: [],
          })}
          className="mt-4 text-sm text-blue-600 hover:text-blue-700"
        >
          Limpar todos os filtros
        </button>
      </div>

      {/* Preview */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900">
            Preview ({filteredAttendees.length} leads selecionados)
          </h3>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <TrendingUp className="w-4 h-4" />
            {((filteredAttendees.length / totalLeads) * 100).toFixed(1)}% do total
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase">Nome</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase">E-mail</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase">Telefone</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase">Cidade</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase">Ingresso</th>
                <th className="px-3 py-2 text-center text-xs font-medium text-slate-500 uppercase">Mkt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAttendees.slice(0, 10).map(attendee => (
                <tr key={attendee.id} className="hover:bg-slate-50">
                  <td className="px-3 py-2 font-medium text-slate-900">{attendee.full_name}</td>
                  <td className="px-3 py-2 text-slate-600">{attendee.email || '-'}</td>
                  <td className="px-3 py-2 text-slate-600">{attendee.phone || '-'}</td>
                  <td className="px-3 py-2 text-slate-600">
                    {attendee.city}{attendee.state ? `, ${attendee.state}` : ''}
                  </td>
                  <td className="px-3 py-2">
                    <span className="px-2 py-0.5 bg-slate-100 rounded text-xs capitalize">
                      {attendee.ticket_type}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-center">
                    {attendee.marketing_opt_in ? (
                      <CheckCircle className="w-4 h-4 text-green-500 mx-auto" />
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredAttendees.length > 10 && (
            <p className="text-center text-sm text-slate-400 py-3">
              +{filteredAttendees.length - 10} leads não exibidos
            </p>
          )}
        </div>
      </div>

      {/* Export Actions */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold">Exportar Leads</h3>
            <p className="text-sm opacity-90">
              {filteredAttendees.length} leads selecionados para exportação
            </p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => handleExport('csv')}
              disabled={exporting || filteredAttendees.length === 0}
              className="px-6 py-3 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 disabled:bg-blue-200 disabled:text-blue-400 transition flex items-center gap-2"
            >
              {exporting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Download className="w-5 h-5" />
              )}
              Exportar CSV
            </button>
            
            <button
              onClick={() => handleExport('xlsx')}
              disabled={exporting || filteredAttendees.length === 0}
              className="px-6 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 disabled:bg-slate-400 transition flex items-center gap-2"
            >
              {exporting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <FileSpreadsheet className="w-5 h-5" />
              )}
              Exportar Excel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadsExporter;
