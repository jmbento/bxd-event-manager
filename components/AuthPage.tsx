import React, { useState } from 'react';
import { 
  Mail, 
  Lock, 
  User, 
  Building2, 
  Eye, 
  EyeOff,
  Zap,
  ArrowRight,
  Github,
  Chrome
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// Inicializar Supabase no cliente
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://hzgzobcjdgddtrfzbywg.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6Z3pvYmNqZGdkZHRyZnpieXdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4MzgxNDIsImV4cCI6MjA4MDQxNDE0Mn0.wopx2seFG3w4-noREXf6TYuLRkMOZmsNK75-cXwmWk8';
const apiUrl = apiUrl || 'https://bxd-event-manager-production.up.railway.app';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface AuthPageProps {
  onSuccess: (user: any, organization: any) => void;
  initialMode?: 'login' | 'register';
  selectedPlan?: string;
}

export const AuthPage: React.FC<AuthPageProps> = ({ 
  onSuccess, 
  initialMode = 'login',
  selectedPlan = 'starter'
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [organizationName, setOrganizationName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'register') {
        // 1. Criar usuário no Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
              organization_name: organizationName
            }
          }
        });

        if (authError) throw authError;

        if (authData.user) {
          // 2. Criar organização via API
          const response = await fetch(`${apiUrl}/api/organizations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: organizationName || `Organização de ${name}`,
              userId: authData.user.id,
              userEmail: email
            })
          });

          const orgData = await response.json();

          if (!response.ok) {
            throw new Error(orgData.error || 'Erro ao criar organização');
          }

          // Sucesso!
          onSuccess(authData.user, orgData.organization);
        }
      } else {
        // Login
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (authError) throw authError;

        if (authData.user) {
          // Buscar organizações do usuário
          const response = await fetch(
            `${apiUrl}/api/organizations/user/${authData.user.id}`
          );
          const { organizations } = await response.json();

          // Se tiver apenas uma organização, usar ela
          // Se tiver várias, poderia mostrar um seletor
          const org = organizations?.[0] || null;

          onSuccess(authData.user, org);
        }
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.message || 'Ocorreu um erro. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) throw error;
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-purple-700 p-12 flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
              <Zap className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">BXD Event Manager</span>
          </div>

          <h1 className="text-4xl font-bold text-white mb-6 leading-tight">
            Gerencie eventos<br />como um profissional
          </h1>

          <p className="text-white/80 text-lg max-w-md">
            Dashboard financeiro, equipe, pulseiras NFC, planejador 3D e IA. 
            Tudo em uma única plataforma.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 text-white/80">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              ✓
            </div>
            <span>15 dias de trial grátis</span>
          </div>
          <div className="flex items-center gap-3 text-white/80">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              ✓
            </div>
            <span>Sem cartão de crédito</span>
          </div>
          <div className="flex items-center gap-3 text-white/80">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              ✓
            </div>
            <span>Cancele quando quiser</span>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">BXD Event Manager</span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">
              {mode === 'login' ? 'Bem-vindo de volta!' : 'Crie sua conta'}
            </h2>
            <p className="text-slate-400">
              {mode === 'login' 
                ? 'Entre para acessar seu dashboard' 
                : `Comece com 15 dias grátis no plano ${selectedPlan}`}
            </p>
          </div>

          {/* OAuth Buttons */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              onClick={() => handleOAuthLogin('google')}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-white text-slate-900 rounded-xl font-medium hover:bg-slate-100 transition"
            >
              <Chrome className="w-5 h-5" />
              Google
            </button>
            <button
              type="button"
              onClick={() => handleOAuthLogin('github')}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 text-white border border-slate-700 rounded-xl font-medium hover:bg-slate-700 transition"
            >
              <Github className="w-5 h-5" />
              GitHub
            </button>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-slate-700" />
            <span className="text-slate-500 text-sm">ou com email</span>
            <div className="flex-1 h-px bg-slate-700" />
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Seu nome
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="João Silva"
                      className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Nome da organização
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="text"
                      value={organizationName}
                      onChange={(e) => setOrganizationName(e.target.value)}
                      required
                      placeholder="Minha Produtora"
                      className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="seu@email.com"
                  className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full pl-12 pr-12 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {mode === 'login' && (
              <div className="flex justify-end">
                <button type="button" className="text-sm text-blue-400 hover:text-blue-300">
                  Esqueceu a senha?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {mode === 'login' ? 'Entrar' : 'Criar conta grátis'}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Toggle Mode */}
          <p className="mt-6 text-center text-slate-400">
            {mode === 'login' ? (
              <>
                Não tem conta?{' '}
                <button
                  onClick={() => setMode('register')}
                  className="text-blue-400 hover:text-blue-300 font-medium"
                >
                  Criar conta grátis
                </button>
              </>
            ) : (
              <>
                Já tem conta?{' '}
                <button
                  onClick={() => setMode('login')}
                  className="text-blue-400 hover:text-blue-300 font-medium"
                >
                  Fazer login
                </button>
              </>
            )}
          </p>

          {/* Terms */}
          {mode === 'register' && (
            <p className="mt-6 text-center text-xs text-slate-500">
              Ao criar uma conta, você concorda com nossos{' '}
              <a href="#" className="text-slate-400 hover:text-white">Termos de Uso</a>
              {' '}e{' '}
              <a href="#" className="text-slate-400 hover:text-white">Política de Privacidade</a>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
