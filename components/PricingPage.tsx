import React, { useState } from 'react';
import {
  Check,
  X,
  Star,
  Zap,
  Shield,
  Clock,
  Users,
  Calendar,
  TrendingUp,
  ChevronRight,
  Play,
  ArrowRight,
  Sparkles,
  Building2,
  CreditCard,
  Gift
} from 'lucide-react';

// Definição dos planos
const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Ideal para pequenos eventos',
    priceMonthly: 97,
    priceYearly: 970,
    popular: false,
    features: {
      events: 3,
      teamMembers: 5,
      transactions: 500,
      storage: '1 GB',
      aiFeatures: false,
      planner3d: false,
      nfcIntegration: false,
      apiAccess: false,
      whiteLabel: false,
      prioritySupport: false
    },
    featuresList: [
      'Até 3 eventos simultâneos',
      '5 membros na equipe',
      '500 transações/mês',
      '1 GB de armazenamento',
      'Dashboard financeiro',
      'Gestão de tarefas',
      'Relatórios básicos',
      'Suporte por email'
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Para produtoras e agências',
    priceMonthly: 297,
    priceYearly: 2970,
    popular: true,
    features: {
      events: 10,
      teamMembers: 20,
      transactions: 5000,
      storage: '10 GB',
      aiFeatures: true,
      planner3d: true,
      nfcIntegration: true,
      apiAccess: false,
      whiteLabel: false,
      prioritySupport: true
    },
    featuresList: [
      'Até 10 eventos simultâneos',
      '20 membros na equipe',
      '5.000 transações/mês',
      '10 GB de armazenamento',
      'Assistente IA (Gemini)',
      'Planejador 3D',
      'Integração NFC/Pulseiras',
      'Importação de planilhas',
      'Relatórios avançados',
      'Suporte prioritário'
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Para grandes operações',
    priceMonthly: 997,
    priceYearly: 9970,
    popular: false,
    features: {
      events: -1, // ilimitado
      teamMembers: -1,
      transactions: -1,
      storage: '100 GB',
      aiFeatures: true,
      planner3d: true,
      nfcIntegration: true,
      apiAccess: true,
      whiteLabel: true,
      prioritySupport: true
    },
    featuresList: [
      'Eventos ilimitados',
      'Equipe ilimitada',
      'Transações ilimitadas',
      '100 GB de armazenamento',
      'Todos os recursos do Pro',
      'API completa',
      'White Label (sua marca)',
      'SLA garantido',
      'Gerente de sucesso dedicado',
      'Onboarding personalizado'
    ]
  }
];

const TESTIMONIALS = [
  {
    name: 'Marina Silva',
    role: 'Produtora Executiva',
    company: 'Eventus Produções',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    text: 'O BXD Event Manager revolucionou nossa gestão. Reduzi 70% do tempo em planilhas.'
  },
  {
    name: 'Carlos Mendes',
    role: 'Diretor de Operações',
    company: 'Festival SP',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    text: 'A integração com pulseiras NFC eliminou filas e aumentou 40% nas vendas de bebidas.'
  },
  {
    name: 'Ana Beatriz',
    role: 'CEO',
    company: 'BZ Eventos',
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
    text: 'O planejador 3D ajuda a vender projetos. Clientes visualizam antes de aprovar.'
  }
];

const FEATURES_GRID = [
  {
    icon: Calendar,
    title: 'Gestão Completa',
    description: 'Dashboard unificado para todos os aspectos do seu evento'
  },
  {
    icon: TrendingUp,
    title: 'Financeiro Integrado',
    description: 'Orçamento, transações e relatórios em tempo real'
  },
  {
    icon: Users,
    title: 'Equipe Colaborativa',
    description: 'Tarefas, responsáveis e comunicação centralizada'
  },
  {
    icon: Sparkles,
    title: 'IA Assistente',
    description: 'Gemini AI para sugestões, análises e automação'
  },
  {
    icon: Shield,
    title: 'Pulseiras NFC',
    description: 'Check-in, pagamentos cashless e controle de acesso'
  },
  {
    icon: Building2,
    title: 'Planejador 3D',
    description: 'Visualize e apresente layouts do seu evento'
  }
];

interface PricingPageProps {
  onStartTrial: (plan: string) => void;
  onLogin: () => void;
}

export const PricingPage: React.FC<PricingPageProps> = ({ onStartTrial, onLogin }) => {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getYearlySavings = (monthly: number, yearly: number) => {
    const monthlyTotal = monthly * 12;
    return Math.round((1 - yearly / monthlyTotal) * 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700/50 backdrop-blur-sm sticky top-0 z-50 bg-slate-900/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">BXD Event Manager</span>
            </div>
            
            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-slate-300 hover:text-white transition">Features</a>
              <a href="#pricing" className="text-slate-300 hover:text-white transition">Preços</a>
              <a href="#testimonials" className="text-slate-300 hover:text-white transition">Cases</a>
            </nav>

            <div className="flex items-center gap-4">
              <button
                onClick={onLogin}
                className="text-slate-300 hover:text-white transition"
              >
                Entrar
              </button>
              <button
                onClick={() => onStartTrial('starter')}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:opacity-90 transition"
              >
                Começar Grátis
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-full text-blue-400 text-sm font-medium mb-8">
            <Gift className="w-4 h-4" />
            15 dias grátis • Sem cartão de crédito
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Gerencie eventos como um{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              profissional
            </span>
          </h1>

          <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
            Plataforma completa para produtoras, agências e organizadores. 
            Dashboard financeiro, equipe, pulseiras NFC e IA em um só lugar.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onStartTrial('pro')}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold text-lg hover:opacity-90 transition flex items-center justify-center gap-2"
            >
              Começar Trial Grátis
              <ArrowRight className="w-5 h-5" />
            </button>
            <button className="w-full sm:w-auto px-8 py-4 border border-slate-600 text-white rounded-xl font-semibold text-lg hover:bg-slate-800 transition flex items-center justify-center gap-2">
              <Play className="w-5 h-5" />
              Ver Demo
            </button>
          </div>

          {/* Trust badges */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-slate-500 text-sm">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              <span>Dados seguros</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span>Setup em 5 minutos</span>
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              <span>Cancele quando quiser</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 px-4 bg-slate-800/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-4">
            Tudo que você precisa
          </h2>
          <p className="text-slate-400 text-center mb-12 max-w-2xl mx-auto">
            Uma plataforma completa para gerenciar eventos de qualquer tamanho
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {FEATURES_GRID.map((feature, idx) => (
              <div
                key={idx}
                className="p-6 bg-slate-800/50 border border-slate-700/50 rounded-2xl hover:border-blue-500/50 transition group"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:from-blue-500/30 group-hover:to-purple-500/30 transition">
                  <feature.icon className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-4">
            Planos simples e transparentes
          </h2>
          <p className="text-slate-400 text-center mb-8 max-w-2xl mx-auto">
            Comece com 15 dias grátis. Sem pegadinhas.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <span className={`text-sm ${billingPeriod === 'monthly' ? 'text-white' : 'text-slate-500'}`}>
              Mensal
            </span>
            <button
              onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'yearly' : 'monthly')}
              className={`relative w-14 h-7 rounded-full transition-colors ${
                billingPeriod === 'yearly' ? 'bg-blue-500' : 'bg-slate-600'
              }`}
            >
              <div
                className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                  billingPeriod === 'yearly' ? 'translate-x-8' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm ${billingPeriod === 'yearly' ? 'text-white' : 'text-slate-500'}`}>
              Anual
            </span>
            {billingPeriod === 'yearly' && (
              <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded">
                2 meses grátis
              </span>
            )}
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`relative p-8 rounded-2xl border transition-all ${
                  plan.popular
                    ? 'bg-gradient-to-b from-blue-500/10 to-purple-500/10 border-blue-500/50 scale-105'
                    : 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-medium rounded-full flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    Mais Popular
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
                  <p className="text-sm text-slate-400">{plan.description}</p>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-white">
                      {formatPrice(billingPeriod === 'monthly' ? plan.priceMonthly : plan.priceYearly / 12)}
                    </span>
                    <span className="text-slate-400">/mês</span>
                  </div>
                  {billingPeriod === 'yearly' && (
                    <p className="text-sm text-green-400 mt-1">
                      Economia de {getYearlySavings(plan.priceMonthly, plan.priceYearly)}% no plano anual
                    </p>
                  )}
                </div>

                <button
                  onClick={() => onStartTrial(plan.id)}
                  className={`w-full py-3 rounded-xl font-semibold mb-6 transition ${
                    plan.popular
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:opacity-90'
                      : 'bg-slate-700 text-white hover:bg-slate-600'
                  }`}
                >
                  Começar 15 dias grátis
                </button>

                <ul className="space-y-3">
                  {plan.featuresList.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm">
                      <Check className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                      <span className="text-slate-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* FAQ / Guarantee */}
          <div className="mt-12 text-center">
            <p className="text-slate-400 mb-4">
              ✓ Cancele a qualquer momento &nbsp;•&nbsp; ✓ Sem taxa de cancelamento &nbsp;•&nbsp; ✓ Suporte humanizado
            </p>
            <button className="text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 mx-auto">
              Tem dúvidas? Fale conosco
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-4 bg-slate-800/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Quem usa, recomenda
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((testimonial, idx) => (
              <div
                key={idx}
                className="p-6 bg-slate-800/50 border border-slate-700/50 rounded-2xl"
              >
                <p className="text-slate-300 mb-6 italic">"{testimonial.text}"</p>
                <div className="flex items-center gap-4">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <p className="font-semibold text-white">{testimonial.name}</p>
                    <p className="text-sm text-slate-400">
                      {testimonial.role} • {testimonial.company}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Pronto para profissionalizar sua produção?
          </h2>
          <p className="text-xl text-slate-400 mb-8">
            Comece agora com 15 dias grátis. Configure em minutos.
          </p>
          <button
            onClick={() => onStartTrial('pro')}
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold text-lg hover:opacity-90 transition"
          >
            Criar Conta Grátis
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-white">BXD Event Manager</span>
            </div>

            <nav className="flex flex-wrap justify-center gap-6 text-sm text-slate-400">
              <a href="#" className="hover:text-white transition">Termos de Uso</a>
              <a href="#" className="hover:text-white transition">Privacidade</a>
              <a href="#" className="hover:text-white transition">Suporte</a>
              <a href="#" className="hover:text-white transition">Status</a>
            </nav>

            <p className="text-sm text-slate-500">
              © 2025 BXD Design. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PricingPage;
