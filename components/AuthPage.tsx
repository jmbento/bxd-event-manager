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
  Chrome,
  Shield,
  Sparkles,
  Users,
  TrendingUp,
  CheckCircle2,
  BarChart3
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// Configurações fixas (não depende de env vars do Vercel)
const supabaseUrl = 'https://hzgzobcjdgddtrfzbywg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6Z3pvYmNqZGdkZHRyZnpieXdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4MzgxNDIsImV4cCI6MjA4MDQxNDE0Mn0.wopx2seFG3w4-noREXf6TYuLRkMOZmsNK75-cXwmWk8';
const apiUrl = 'https://bxd-event-manager-production.up.railway.app';
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
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [organizationName, setOrganizationName] = useState('');

  // Auto-preencher para testes
  const fillTestData = () => {
    const ts = Date.now();
    setName('Teste Usuario');
    setEmail(`teste${ts}@teste.com`);
    setPassword('teste123');
    setConfirmPassword('teste123');
    setOrganizationName('Empresa Teste');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'register') {
        // Validar confirmação de senha
        if (password !== confirmPassword) {
          setError('As senhas não coincidem');
          setLoading(false);
          return;
        }

        if (password.length < 6) {
          setError('A senha deve ter pelo menos 6 caracteres');
          setLoading(false);
          return;
        }

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

        // Verificar se precisa confirmar email
        if (authData.user && !authData.session) {
          setError('');
          setLoading(false);
          alert('✅ Conta criada com sucesso!\n\nVerifique seu email para confirmar o cadastro e fazer login.');
          setIsLogin(true); // Volta para tela de login
          return;
        }

        if (authData.user) {
          // 2. Criar organização diretamente no Supabase
          const slug = (organizationName || `org-${name}`)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');

          const { data: orgData, error: orgError } = await supabase
            .from('organizations')
            .insert({
              name: organizationName || `Organização de ${name}`,
              slug: `${slug}-${Date.now()}`,
              owner_id: authData.user.id,
              subscription_status: 'trial',
              subscription_plan: 'starter',
              trial_starts_at: new Date().toISOString(),
              trial_ends_at: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
              max_events: 1,
              max_team_members: 3
            })
            .select()
            .single();

          if (orgError) {
            console.error('Org error:', orgError);
            throw new Error('Erro ao criar organização: ' + orgError.message);
          }

          // Sucesso!
          onSuccess(authData.user, orgData);
        }
      } else {
        // Login
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (authError) throw authError;

        if (authData.user) {
          // Buscar organizações do usuário diretamente no Supabase
          const { data: organizations, error: orgError } = await supabase
            .from('organizations')
            .select('*')
            .eq('owner_id', authData.user.id)
            .order('created_at', { ascending: false });

          if (orgError) {
            console.error('Org fetch error:', orgError);
          }

          // Se tiver apenas uma organização, usar ela
          const org = organizations?.[0] || null;

          onSuccess(authData.user, org);
        }
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      // Melhorar mensagens de erro
      let errorMessage = err.message || 'Ocorreu um erro. Tente novamente.';
      
      if (errorMessage.includes('Invalid login credentials')) {
        errorMessage = 'Email ou senha incorretos. Verifique seus dados ou crie uma conta nova.';
      } else if (errorMessage.includes('Email not confirmed')) {
        errorMessage = 'Email não confirmado. Verifique sua caixa de entrada.';
      } else if (errorMessage.includes('User already registered')) {
        errorMessage = 'Este email já está cadastrado. Tente fazer login.';
      }
      
      setError(errorMessage);
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
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-purple-600 to-purple-700 p-12 flex-col justify-between relative overflow-hidden">
        {/* Background decorativo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
              <Zap className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">BXD Event Manager</span>
          </div>

          {/* Badge de confiança */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur rounded-full mb-8">
            <Shield className="w-4 h-4 text-white" />
            <span className="text-sm text-white font-medium">Plataforma Segura & Certificada</span>
          </div>

          <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
            Gerencie eventos<br />como um <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">profissional</span>
          </h1>

          <p className="text-white/90 text-lg max-w-md mb-8">
            Dashboard financeiro, equipe, pulseiras NFC, planejador 3D e IA. 
            Tudo em uma única plataforma moderna.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-12">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">10k+</div>
              <div className="text-white/70 text-sm">Eventos</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">50k+</div>
              <div className="text-white/70 text-sm">Usuários</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">99.9%</div>
              <div className="text-white/70 text-sm">Uptime</div>
            </div>
          </div>
        </div>

        <div className="space-y-4 relative z-10">
          <div className="flex items-center gap-3 text-white">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="font-medium">15 dias de trial grátis</span>
          </div>
          <div className="flex items-center gap-3 text-white">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="font-medium">Sem cartão de crédito</span>
          </div>
          <div className="flex items-center gap-3 text-white">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="font-medium">Cancele quando quiser</span>
          </div>
          <div className="flex items-center gap-3 text-white">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="font-medium">Suporte prioritário 24/7</span>
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
            {mode === 'register' && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-500/20 text-green-400 rounded-full text-xs font-medium mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                15 dias grátis • Sem cartão
              </div>
            )}
            <h2 className="text-3xl font-bold text-white mb-3">
              {mode === 'login' ? 'Bem-vindo de volta! 👋' : 'Comece grátis agora'}
            </h2>
            <p className="text-slate-400 text-base">
              {mode === 'login' 
                ? 'Acesse seu dashboard de gestão de eventos' 
                : 'Crie sua conta em 30 segundos e transforme seus eventos'}
            </p>
          </div>

          {/* OAuth Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
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

            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Confirmar Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="Digite a senha novamente"
                    className={`w-full pl-12 pr-4 py-3 bg-slate-800 border rounded-xl text-white placeholder:text-slate-500 focus:outline-none transition ${
                      confirmPassword && password !== confirmPassword 
                        ? 'border-red-500 focus:border-red-500' 
                        : 'border-slate-700 focus:border-blue-500'
                    }`}
                  />
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-red-400 text-sm mt-1">As senhas não coincidem</p>
                )}
              </div>
            )}

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
              className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-bold text-base hover:opacity-90 hover:shadow-lg hover:shadow-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {mode === 'login' ? 'Acessar Dashboard' : 'Começar Grátis Agora'}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            {/* Features badges */}
            {mode === 'register' && (
              <div className="flex items-center justify-center gap-4 mt-4 text-xs text-slate-400">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>3 membros</span>
                </div>
                <div className="flex items-center gap-1">
                  <BarChart3 className="w-4 h-4" />
                  <span>1 evento</span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  <span>Todos módulos</span>
                </div>
              </div>
            )}

            {/* Botão de teste - remover em produção */}
            {mode === 'register' && process.env.NODE_ENV === 'development' && (
              <button
                type="button"
                onClick={fillTestData}
                className="w-full py-2 mt-2 bg-slate-700 text-slate-300 rounded-lg text-sm hover:bg-slate-600 transition"
              >
                🧪 Preencher dados de teste
              </button>
            )}
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
