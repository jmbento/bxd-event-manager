import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { Check, Star, Zap, Shield } from 'lucide-react';

export default function Onboarding() {
  const [orgName, setOrgName] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('starter');
  const [loading, setLoading] = useState(false);

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      price: 'R$ 0',
      icon: <Star className="w-6 h-6 text-gray-400" />,
      features: ['1 Evento Ativo', 'Gestão de Convidados', 'App Básico']
    },
    {
      id: 'pro',
      name: 'Producer Pro',
      price: 'R$ 197/mês',
      icon: <Zap className="w-6 h-6 text-yellow-500" />,
      features: ['5 Eventos Ativos', 'Financeiro Completo', 'Módulo Marketing', '3 Usuários'],
      highlight: true
    },
    {
      id: 'master',
      name: 'Master Enterprise',
      price: 'R$ 497/mês',
      icon: <Shield className="w-6 h-6 text-purple-600" />,
      features: ['Eventos Ilimitados', 'Whitelabel (Sua Marca)', 'Gestão de Staff/RH', 'API Acesso Total']
    }
  ];

  async function handleSave() {
    setLoading(true);
    try {
      // 1. Pega o usuário logado
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) throw new Error('Usuário não logado');

      // 2. Atualiza o perfil no Supabase com o Plano e Nome da Produtora
      const { error } = await supabase
        .from('profiles')
        .update({ 
          org_name: orgName, 
          plan_tier: selectedPlan,
          onboarding_completed: true 
        })
        .eq('id', user.id);

      if (error) throw error;
      
      // 3. Redireciona para o Dashboard
      window.location.href = '/dashboard';
      
    } catch (error) {
      alert('Erro ao salvar: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-4xl w-full space-y-8">
        
        {/* Cabeçalho */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Configure sua Produtora</h1>
          <p className="mt-2 text-gray-600">Vamos preparar seu ambiente de gestão de eventos.</p>
        </div>

        {/* Passo 1: Nome */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">Nome da sua Produtora / Agência</label>
          <input 
            type="text" 
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            placeholder="Ex: Lumina Produções"
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Passo 2: Escolha do Plano */}
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div 
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={`cursor-pointer rounded-xl p-6 border-2 transition-all duration-200 relative ${
                selectedPlan === plan.id 
                  ? 'border-blue-600 bg-blue-50 shadow-lg scale-105' 
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              {plan.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs px-3 py-1 rounded-full uppercase font-bold tracking-wide">
                  Mais Popular
                </span>
              )}
              <div className="flex justify-between items-center mb-4">
                {plan.icon}
                {selectedPlan === plan.id && <div className="w-4 h-4 bg-blue-600 rounded-full" />}
              </div>
              <h3 className="font-bold text-lg text-gray-900">{plan.name}</h3>
              <p className="text-2xl font-bold text-gray-900 mt-2 mb-4">{plan.price}</p>
              <ul className="space-y-3">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center text-sm text-gray-600">
                    <Check className="w-4 h-4 mr-2 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Botão Final */}
        <button
          onClick={handleSave}
          disabled={!orgName || loading}
          className="w-full py-4 bg-blue-600 text-white rounded-lg font-bold text-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Configurando ambiente...' : 'Acessar meu Dashboard'}
        </button>

      </div>
    </div>
  );
}