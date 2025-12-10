import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  Download,
  UserPlus,
  CheckCircle,
  XCircle,
  Clock,
  Phone,
  Mail,
  ChevronRight,
  MoreVertical,
  Utensils,
  DoorOpen,
  AlertTriangle,
} from 'lucide-react';
import type { StaffMember } from './types';
import { DEPARTMENTS } from './types';

interface Props {
  staff: StaffMember[];
  onCheckIn: (staffId: string) => void;
  onCheckOut: (staffId: string) => void;
  onAddStaff: () => void;
  onViewDetails: (staff: StaffMember) => void;
}

const StatusBadge: React.FC<{ isCheckedIn: boolean; checkInTime?: string }> = ({ isCheckedIn, checkInTime }) => {
  if (isCheckedIn) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <CheckCircle className="w-3 h-3" />
        Presente {checkInTime && `(${checkInTime})`}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
      <Clock className="w-3 h-3" />
      Ausente
    </span>
  );
};

export const StaffManager: React.FC<Props> = ({ staff, onCheckIn, onCheckOut, onAddStaff, onViewDetails }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'present' | 'absent'>('all');

  const filteredStaff = staff.filter(member => {
    const matchesSearch = member.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.role?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = !filterDepartment || member.department === filterDepartment;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'present' && member.is_checked_in) ||
                         (filterStatus === 'absent' && !member.is_checked_in);
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const presentCount = staff.filter(s => s.is_checked_in).length;
  const absentCount = staff.length - presentCount;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{staff.length}</p>
              <p className="text-xs text-slate-500">Total Staff</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-900">{presentCount}</p>
              <p className="text-xs text-slate-500">Presentes</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-900">{absentCount}</p>
              <p className="text-xs text-slate-500">Ausentes</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Utensils className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-900">
                {staff.reduce((acc, s) => acc + s.meals_consumed, 0)}
              </p>
              <p className="text-xs text-slate-500">Refeições Servidas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nome, email, cargo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos os Departamentos</option>
            {DEPARTMENTS.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
          
          <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded text-sm font-medium transition ${
                filterStatus === 'all' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-600'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterStatus('present')}
              className={`px-3 py-1.5 rounded text-sm font-medium transition ${
                filterStatus === 'present' ? 'bg-green-500 text-white' : 'text-slate-600'
              }`}
            >
              Presentes
            </button>
            <button
              onClick={() => setFilterStatus('absent')}
              className={`px-3 py-1.5 rounded text-sm font-medium transition ${
                filterStatus === 'absent' ? 'bg-orange-500 text-white' : 'text-slate-600'
              }`}
            >
              Ausentes
            </button>
          </div>
          
          <button
            onClick={onAddStaff}
            className="px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2"
          >
            <UserPlus className="w-5 h-5" />
            Adicionar
          </button>
        </div>
      </div>

      {/* Staff List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Staff</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Departamento</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Turno</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Refeições</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStaff.map((member) => (
                <tr key={member.id} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white font-medium">
                        {member.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{member.full_name}</p>
                        <p className="text-sm text-slate-500">{member.role}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="px-2 py-1 bg-slate-100 rounded text-sm text-slate-700">
                      {member.department}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    {member.shift_start && member.shift_end ? (
                      <span className="text-sm text-slate-600">
                        {member.shift_start} - {member.shift_end}
                      </span>
                    ) : (
                      <span className="text-sm text-slate-400">Não definido</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge 
                      isCheckedIn={member.is_checked_in} 
                      checkInTime={member.check_in_time}
                    />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <Utensils className="w-4 h-4 text-slate-400" />
                      <span className={`text-sm font-medium ${
                        member.meals_consumed >= member.meals_allowed 
                          ? 'text-red-600' 
                          : 'text-slate-900'
                      }`}>
                        {member.meals_consumed}/{member.meals_allowed}
                      </span>
                      {member.meals_consumed >= member.meals_allowed && (
                        <AlertTriangle className="w-4 h-4 text-orange-500" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-center gap-2">
                      {member.is_checked_in ? (
                        <button
                          onClick={() => onCheckOut(member.id)}
                          className="px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg text-sm font-medium hover:bg-orange-200 transition flex items-center gap-1"
                        >
                          <DoorOpen className="w-4 h-4" />
                          Check-out
                        </button>
                      ) : (
                        <button
                          onClick={() => onCheckIn(member.id)}
                          className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition flex items-center gap-1"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Check-in
                        </button>
                      )}
                      <button
                        onClick={() => onViewDetails(member)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredStaff.length === 0 && (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">Nenhum membro do staff encontrado</p>
            <p className="text-sm text-slate-400">Ajuste os filtros ou adicione novos membros</p>
          </div>
        )}
      </div>

      {/* Export Button */}
      <div className="flex justify-end">
        <button className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 flex items-center gap-2 transition">
          <Download className="w-4 h-4" />
          Exportar Lista de Presença
        </button>
      </div>
    </div>
  );
};

export default StaffManager;
