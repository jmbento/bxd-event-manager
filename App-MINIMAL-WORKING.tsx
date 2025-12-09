import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { Header } from './components/Header';
import { FinancialStats } from './components/FinancialStats';
import { DashboardWidgets } from './components/DashboardWidgets';
import { InventoryAlert } from './components/InventoryAlert';
import { MODULE_DEFINITIONS, DEFAULT_ENABLED_MODULES } from './config/moduleConfig';
import type { EventProfile, FinancialKPI, InventoryItem, Expense, Location, DigitalStats } from './types';

export default function App() {
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [isModulePanelOpen, setIsModulePanelOpen] = useState(false);

  const profile: EventProfile = {
    eventName: 'Meu Evento',
    edition: '',
    startDate: '',
    endDate: '',
    location: '',
    expectedAudience: 0,
    description: '',
    logoUrl: '',
    primaryColor: '#3b82f6',
    secondaryColor: '#1e40af'
  };

  const financials: FinancialKPI = {
    balance: 0,
    spentToday: 0,
    totalBudget: 0,
    totalSpent: 0,
    revenue: 0
  };

  const inventory: InventoryItem[] = [];
  const expenses: Expense[] = [];
  const locations: Location[] = [];
  const digitalStats: DigitalStats = {
    instagram: { followers: 0, engagement: 0, reach: 0 },
    youtube: { subscribers: 0, views: 0, watchTime: 0 },
    facebook: { likes: 0, engagement: 0, reach: 0 }
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
        <div className="space-y-6">
          <FinancialStats data={financials} />
          <InventoryAlert items={inventory} />
          <DashboardWidgets 
            expenses={expenses} 
            locations={locations}
            digitalStats={digitalStats}
          />
        </div>
      </main>

      <Toaster position="top-right" />
    </div>
  );
}
