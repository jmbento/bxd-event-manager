import React, { useState, useEffect } from 'react';
import { acceptInvite, getInviteByToken } from '../services/userInviteService';

// Simula o token do convite recebido por e-mail
const mockInviteToken = 'abc123';

export const AcceptInvite: React.FC<{ inviteToken?: string }> = ({ inviteToken = mockInviteToken }) => {
  const [form, setForm] = useState({
    name: '',
    password: '',
    confirm: '',
  });
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState('');
  const [inviteData, setInviteData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getInviteByToken(inviteToken)
      .then(data => { setInviteData(data); setLoading(false); })
      .catch(() => { setError('Convite inválido ou expirado'); setLoading(false); });
  }, [inviteToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.password || !form.confirm) {
      setError('Preencha todos os campos');
      return;
    }
    if (form.password.length < 6) {
      setError('Senha deve ter pelo menos 6 caracteres');
      return;
    }
    if (form.password !== form.confirm) {
      setError('As senhas não coincidem');
      return;
    }
    try {
      await acceptInvite(inviteToken, form.name, form.password);
      setAccepted(true);
    } catch (e) {
      setError((e as any).message);
    }
  };

  if (loading) return <div className="text-center mt-20">Carregando convite...</div>;
  if (error) return <div className="text-center mt-20 text-red-600">{error}</div>;
  if (accepted) {
    return (
      <div className="max-w-md mx-auto mt-20 bg-white rounded-xl shadow p-8 text-center">
        <h2 className="text-2xl font-bold mb-2 text-green-700">Conta ativada!</h2>
        <p className="mb-4">Bem-vindo(a) ao sistema BXDevents.</p>
        <p className="text-slate-500 text-sm">Você já pode acessar o sistema com seu e-mail e senha.</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-20 bg-white rounded-xl shadow p-8">
      <h2 className="text-xl font-bold mb-2">Aceitar Convite</h2>
      <p className="mb-4 text-slate-600">
        Você está sendo convidado para a organização <b>{inviteData.org_id}</b>.<br />
        E-mail: <b>{inviteData.email}</b>
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nome completo</label>
          <input
            type="text"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            placeholder="Seu nome"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Senha</label>
          <input
            type="password"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            placeholder="Crie uma senha"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Confirmar senha</label>
          <input
            type="password"
            value={form.confirm}
            onChange={e => setForm({ ...form, confirm: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            placeholder="Repita a senha"
          />
        </div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button
          type="submit"
          className="w-full py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 mt-2"
        >
          Ativar Conta
        </button>
      </form>
      <div className="mt-6">
        <h4 className="text-sm font-semibold mb-1">Acesso liberado:</h4>
        <ul className="text-xs text-slate-500 list-disc ml-5">
          {inviteData.modules.map((m: string) => (
            <li key={m}>{m}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AcceptInvite;
