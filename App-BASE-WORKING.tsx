import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { Header } from './components/Header';
import { MODULE_DEFINITIONS, DEFAULT_ENABLED_MODULES } from './config/moduleConfig';
import type { EventProfile } from './types';

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [isModulePanelOpen, setIsModulePanelOpen] = useState(false);

  const profile: EventProfile = {
    eventName: 'Meu Evento',
    edition: '2025',
    startDate: '2025-12-01',
    endDate: '2025-12-05',
    location: 'São Paulo',
    expectedAudience: 5000,
    description: 'Evento de teste',
    logoUrl: '',
    primaryColor: '#3b82f6',
    secondaryColor: '#1e40af'
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header 
        daysLeft={45} 
        currentView={currentView} 
        onNavigate={setCurrentView} 
        modules={MODULE_DEFINITIONS}
        enabledModules={DEFAULT_ENABLED_MODULES}
        onOpenModulePanel={() => setIsModulePanelOpen(true)}
        profile={profile}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">
            ✅ App Base Funcionando
          </h1>
          <p className="text-slate-600 mb-4">
            Se você vê esta mensagem, significa que:
          </p>
          <ul className="list-disc list-inside space-y-2 text-slate-700">
            <li>✅ React 19 está funcionando</li>
            <li>✅ Tailwind CSS está funcionando</li>
            <li>✅ Header com menu está funcionando</li>
            <li>✅ TypeScript está compilando</li>
            <li>✅ Módulos configurados corretamente</li>
          </ul>
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
            <p className="text-blue-900 font-semibold">
              Próximo passo: Adicionar os módulos Dashboard, Finance, Marketing, etc.
            </p>
          </div>
        </div>
      </main>

      <Toaster position="top-right" />
    </div>
  );
}
