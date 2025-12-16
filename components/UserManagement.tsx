import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Mail, Lock, Eye } from 'lucide-react';
import { createInvite } from '../services/userInviteService';
import { v4 as uuidv4 } from 'uuid';

// Tipos de módulos/setores disponíveis
const MODULES = [
  { id: 'dashboard', name: 'Dashboard' },
  { id: 'credenciamento', name: 'Credenciamento' },
  { id: 'financeiro', name: 'Financeiro' },
  { id: 'marketing', name: 'Marketing' },
  { id: 'compliance', name: 'Compliance' },
  { id: 'eventos', name: 'Eventos' },
  { id: 'relatorios', name: 'Relatórios' },
  { id: 'nfc', name: 'NFC/Check-in' },
];

export interface OrgUser {
  id: string;
  name: string;
  email: string;
  status: 'pending' | 'active' | 'disabled';
  modules: string[];
  invitedAt: string;
  lastLogin?: string;
}

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<OrgUser[]>([]);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteData, setInviteData] = useState({ name: '', email: '', modules: [MODULES[0].id] });

  const handleInvite = async () => {
    if (!inviteData.name || !inviteData.email) {
      alert('Preencha nome e e-mail');
      return;
    }
    const invite_token = uuidv4();
    try {
      await createInvite({
        email: inviteData.email,
        name: inviteData.name,
        org_id: 'org-id-mock', // TODO: pegar org_id real do contexto
        modules: inviteData.modules,
        invite_token,
      });
      // Aqui você pode enviar o e-mail real com o link de convite
      // Exemplo: https://seusite.com/accept-invite?token=invite_token
    } catch (e) {
      alert('Erro ao criar convite: ' + (e as any).message);
      return;
    }
    setUsers([
      ...users,
      {
        id: `${Date.now()}`,
        name: inviteData.name,
        email: inviteData.email,
        status: 'pending',
        modules: inviteData.modules,
        invitedAt: new Date().toISOString().slice(0, 10),
      },
    ]);
    setShowInvite(false);
    setInviteData({ name: '', email: '', modules: [MODULES[0].id] });
  };

  const handleToggleModule = (moduleId: string) => {
    setInviteData((prev) => ({
      ...prev,
      modules: prev.modules.includes(moduleId)
        ? prev.modules.filter((m) => m !== moduleId)
        : [...prev.modules, moduleId],
    }));
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Gestão de Usuários</h2>
        <button
          onClick={() => setShowInvite(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Convidar Usuário
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <table className="w-full text-left">
          <thead>
            <tr className="text-slate-500 text-xs uppercase">
              <th>Nome</th>
              <th>E-mail</th>
              <th>Status</th>
              <th>Módulos</th>
              <th>Último acesso</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b last:border-0">
                <td className="py-2 font-medium">{user.name}</td>
                <td className="py-2">{user.email}</td>
                <td className="py-2">
                  {user.status === 'active' && <span className="text-green-600 font-semibold">Ativo</span>}
                  {user.status === 'pending' && <span className="text-yellow-600 font-semibold">Pendente</span>}
                  {user.status === 'disabled' && <span className="text-slate-400 font-semibold">Desativado</span>}
                </td>
                <td className="py-2">
                  <div className="flex flex-wrap gap-1">
                    {user.modules.map((m) => {
                      const mod = MODULES.find((mod) => mod.id === m);
                      return (
                        <span key={m} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs">
                          {mod?.name || m}
                        </span>
                      );
                    })}
                  </div>
                </td>
                <td className="py-2 text-xs text-slate-500">{user.lastLogin || '-'}</td>
                <td className="py-2">
                  <button className="text-blue-600 hover:underline text-xs flex items-center gap-1">
                    <Edit2 className="w-3 h-3" /> Editar
                  </button>
                  <button className="text-red-600 hover:underline text-xs flex items-center gap-1 ml-2">
                    <Trash2 className="w-3 h-3" /> Remover
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de convite */}
      {showInvite && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Convidar Novo Usuário</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome</label>
                <input
                  type="text"
                  value={inviteData.name}
                  onChange={(e) => setInviteData({ ...inviteData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  placeholder="Nome do usuário"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">E-mail</label>
                <input
                  type="email"
                  value={inviteData.email}
                  onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  placeholder="email@empresa.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Módulos Permitidos</label>
                <div className="flex flex-wrap gap-2">
                  {MODULES.map((mod) => (
                    <label key={mod.id} className="flex items-center gap-1 text-xs bg-slate-100 px-2 py-1 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={inviteData.modules.includes(mod.id)}
                        onChange={() => handleToggleModule(mod.id)}
                      />
                      {mod.name}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowInvite(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={handleInvite}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Enviar Convite
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
