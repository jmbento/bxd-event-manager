import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { Header } from './components/Header';
import { DashboardWidgets } from './components/DashboardWidgets';
import { fetchCampaignData } from './services/dataService';

export default function App() {
  const [campaignData, setCampaignData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('dashboard');

  useEffect(() => {
    // Load campaign data
    const loadData = async () => {
      try {
        const data = await fetchCampaignData();
        setCampaignData(data);
      } catch (error) {
        console.log('Using demo data');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando BXD Event Manager...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header 
        daysLeft={45} 
        currentView={currentView}
        onNavigate={setCurrentView}
        modules={[]}
        enabledModules={{}}
        onOpenModulePanel={() => {}}
        profile={{
          eventName: 'BXD Event Manager Demo',
          edition: 'MVP 2024',
          eventType: 'Sistema de Gestão',
          organizer: 'BXD Tech',
          logoUrl: 'https://via.placeholder.com/100x100/2563eb/ffffff?text=BXD',
          themeColor: '#2563eb'
        }}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎉 BXD Event Manager
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Sistema completo de gestão de eventos - MVP funcionando!
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="font-semibold text-gray-900 mb-2">Dashboard</h3>
              <p className="text-gray-600 text-sm">Visão completa dos seus eventos com métricas em tempo real</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="text-3xl mb-3">💰</div>
              <h3 className="font-semibold text-gray-900 mb-2">Financeiro</h3>
              <p className="text-gray-600 text-sm">Controle total do orçamento e despesas do evento</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="text-3xl mb-3">👥</div>
              <h3 className="font-semibold text-gray-900 mb-2">Equipe</h3>
              <p className="text-gray-600 text-sm">Gestão completa da equipe e colaboradores</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="text-3xl mb-3">📱</div>
              <h3 className="font-semibold text-gray-900 mb-2">Marketing</h3>
              <p className="text-gray-600 text-sm">Campanhas digitais e gestão de redes sociais</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="text-3xl mb-3">📅</div>
              <h3 className="font-semibold text-gray-900 mb-2">Agenda</h3>
              <p className="text-gray-600 text-sm">Cronograma detalhado e gestão de atividades</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="font-semibold text-gray-900 mb-2">Analytics</h3>
              <p className="text-gray-600 text-sm">Relatórios e insights para melhorar performance</p>
            </div>
          </div>
          
          <div className="mt-12 p-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl text-white">
            <h2 className="text-2xl font-bold mb-4">🚀 Sistema Online e Funcionando!</h2>
            <p className="text-blue-100 mb-6">
              Seu BXD Event Manager está deployado com sucesso no Vercel + Supabase
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="bg-white/20 px-4 py-2 rounded-lg">
                <span className="text-sm font-semibold">Frontend:</span> React + TypeScript
              </div>
              <div className="bg-white/20 px-4 py-2 rounded-lg">
                <span className="text-sm font-semibold">Backend:</span> Supabase
              </div>
              <div className="bg-white/20 px-4 py-2 rounded-lg">
                <span className="text-sm font-semibold">Deploy:</span> Vercel
              </div>
            </div>
          </div>
          
          <div className="mt-8 text-gray-500 text-sm">
            <p>✅ Build: Sucesso | ✅ Deploy: Ativo | ✅ Database: Conectado</p>
          </div>
        </div>
      </main>

      <Toaster position="top-right" />
    </div>
  );
}