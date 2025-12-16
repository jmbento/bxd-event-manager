import { supabase } from './supabaseClient';

export interface UserInvite {
  id?: string;
  email: string;
  name?: string;
  org_id: string;
  modules: string[];
  status: 'pending' | 'accepted' | 'expired';
  invited_at?: string;
  accepted_at?: string;
  invite_token: string;
}

export async function createInvite(invite: Omit<UserInvite, 'id' | 'status' | 'invited_at' | 'accepted_at'>) {
  const { data, error } = await supabase
    .from('user_invites')
    .insert([{ ...invite, status: 'pending', invited_at: new Date().toISOString() }])
    .select()
    .single();
  if (error) throw error;
  return data as UserInvite;
}

export async function getInviteByToken(token: string) {
  const { data, error } = await supabase
    .from('user_invites')
    .select('*')
    .eq('invite_token', token)
    .single();
  if (error) throw error;
  return data as UserInvite;
}

export async function acceptInvite(token: string, name: string, password: string) {
  // Busca convite
  const invite = await getInviteByToken(token);
  if (!invite || invite.status !== 'pending') throw new Error('Convite inválido ou expirado');

  // Cria usuário no Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: invite.email,
    password,
    options: { data: { name, org_id: invite.org_id, modules: invite.modules } }
  });
  if (authError) throw authError;

  // Atualiza status do convite
  await supabase
    .from('user_invites')
    .update({ status: 'accepted', accepted_at: new Date().toISOString() })
    .eq('invite_token', token);

  return authData.user;
}
