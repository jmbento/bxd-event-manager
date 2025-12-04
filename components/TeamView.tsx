
import React from 'react';
import { TeamMember } from '../types';
import { Video, Phone, Mail, User, Shield } from 'lucide-react';

interface Props {
  team: TeamMember[];
}

export const TeamView: React.FC<Props> = ({ team }) => {
  const handleMeet = () => {
    window.open('https://meet.google.com/new', '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div>
           <h2 className="text-2xl font-bold text-slate-800">Gestão de Equipe</h2>
           <p className="text-slate-500 text-sm mt-1">Diretório de staff e sala de guerra virtual.</p>
        </div>
        <button 
           onClick={handleMeet}
           className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium shadow-md transition-colors animate-pulse"
        >
           <Video className="w-5 h-5" />
           <span>Sala de Guerra (Google Meet)</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {team.map(member => (
          <div key={member.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:border-blue-300 transition-all group">
             <div className="p-6 flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-slate-100 overflow-hidden flex-shrink-0 border-2 border-white shadow-sm">
                   {member.photoUrl ? (
                      <img src={member.photoUrl} alt={member.name} className="w-full h-full object-cover" />
                   ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                         <User className="w-8 h-8" />
                      </div>
                   )}
                </div>
                <div>
                   <h3 className="font-bold text-slate-900">{member.name}</h3>
                   <span className="inline-block bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase mb-2 mt-1">
                      {member.role}
                   </span>
                   <div className="flex items-center gap-1.5 text-xs">
                      <span className={`w-2 h-2 rounded-full ${
                        member.status === 'active' ? 'bg-emerald-500' : 
                        member.status === 'busy' ? 'bg-amber-500' : 'bg-slate-300'
                      }`} />
                      <span className="text-slate-500 capitalize">{member.status === 'active' ? 'Disponível' : member.status}</span>
                   </div>
                </div>
             </div>
             
             <div className="bg-slate-50 p-3 border-t border-slate-100 flex justify-around">
                <a href={`tel:${member.phone}`} className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors" title="Ligar">
                   <Phone className="w-4 h-4" />
                </a>
                <a href={`mailto:${member.email}`} className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors" title="Email">
                   <Mail className="w-4 h-4" />
                </a>
                <button className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors" title="Ver Perfil">
                   <Shield className="w-4 h-4" />
                </button>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};
