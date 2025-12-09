import React, { useState } from 'react';
import { Header } from './components/Header';
import { MODULE_DEFINITIONS, DEFAULT_ENABLED_MODULES } from './config/moduleConfig';
import { Toaster } from 'react-hot-toast';

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [isModulePanelOpen, setIsModulePanelOpen] = useState(false);
  
  const profile = {
    eventName: 'Teste App',
    edition: '2025',
    startDate: '2025-12-01',
    endDate: '2025-12-05',
    location: 'Local Teste',
    expectedAudience: 1000,
    description: 'Teste de renderização',
    logoUrl: '',
    primaryColor: '#3b82f6',
    secondaryColor: '#1e40af'
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
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
        <div className="p-8 bg-white rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-4">Teste Intermediário</h2>
          <p>Se você vê esta tela, o Header e as configurações básicas estão funcionando.</p>
          <p>O problema deve estar em um dos módulos específicos.</p>
        </div>
      </main>

      <Toaster position="top-right" />
    </div>
  );
}
