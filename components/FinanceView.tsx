
import React, { useState, useMemo, useCallback } from 'react';
import { FinancialKPI, Transaction } from '../types';
import { FileText, FileSpreadsheet, Printer, CheckCircle2, Loader2, Info, CheckSquare, Download, Upload, Calculator, Target, Ticket, Coffee, Award, TrendingUp, DollarSign, Users, Clock } from 'lucide-react';
import { SpreadsheetImporter } from './SpreadsheetImporter';
import { BudgetManager } from './BudgetManager';
import type { ImportedTransaction } from '../services/importService';

interface Props {
  financials: FinancialKPI;
  recentTransactions: Transaction[];
}

// Revenue Streams para Eventos
const REVENUE_STREAMS = [
  {
    id: 'ticketing',
    name: 'Ticketing (Bilheteria)',
    icon: Ticket,
    color: 'bg-blue-500',
    current: 487500,
    target: 650000,
    details: {
      sold: 9750,
      capacity: 13000,
      complimentary: 250,
      avgPrice: 50
    }
  },
  {
    id: 'cashless',
    name: 'Operação A&B (Cashless)',
    icon: Coffee,
    color: 'bg-green-500',
    current: 125000,
    target: 180000,
    details: {
      avgSpend: 45,
      transactions: 2777,
      topItems: ['Cerveja', 'Combo Burger', 'Água']
    }
  },
  {
    id: 'sponsorship',
    name: 'Patrocínios & Cotas',
    icon: Award,
    color: 'bg-purple-500', 
    current: 300000,
    target: 350000,
    details: {
      master: 1,
      premium: 3,
      apoio: 8,
      pending: 2
    }
  }
];

// Cost Centers para Eventos
const COST_CENTERS = [
  {
    id: 'artistic',
    name: 'Cachês Artísticos',
    icon: Users,
    spent: 280000,
    budget: 300000,
    items: [
      { name: 'Alok - Headliner', amount: 150000, status: '50% pago' },
      { name: 'Vintage Culture', amount: 80000, status: 'Pago' },
      { name: 'Artistas Locais', amount: 50000, status: 'Pendente' }
    ]
  },
  {
    id: 'technical',
    name: 'Rider Técnico & Hospitalidade',
    icon: Clock,
    spent: 85000,
    budget: 120000,
    items: [
      { name: 'Som + Luz + LED Wall', amount: 60000, status: 'Pago' },
      { name: 'Camarim Premium (Alok)', amount: 15000, status: 'Agendado' },
      { name: 'Transfer Artistas', amount: 10000, status: 'Pendente' }
    ]
  },
  {
    id: 'taxes',
    name: 'Taxas e Impostos',
    icon: FileText,
    spent: 35000,
    budget: 45000,
    items: [
      { name: 'ECAD (Direitos Autorais)', amount: 18000, status: 'CRÍTICO - Pago' },
      { name: 'ISS Municipal', amount: 12000, status: 'Pago' },
      { name: 'Taxa Bombeiros', amount: 5000, status: 'Pendente' }
    ]
  }
];

export const FinanceView: React.FC<Props> = ({ financials, recentTransactions }) => {
  const [closingStep, setClosingStep] = useState(0); // 0 = idle, 1=generating, 2=docs, 3=assembling, 4=done
  const [showTseModal, setShowTseModal] = useState(false);
  const [showImporter, setShowImporter] = useState(false);
  const [importedTransactions, setImportedTransactions] = useState<ImportedTransaction[]>([]);
  const [activeFinanceTab, setActiveFinanceTab] = useState<'revenue' | 'costs' | 'breakeven'>('revenue');

  // Cálculos de Break-even
  const totalRevenue = useMemo(() => 
    REVENUE_STREAMS.reduce((sum, stream) => sum + stream.current, 0)
  , []);
  
  const totalCosts = useMemo(() => 
    COST_CENTERS.reduce((sum, center) => sum + center.spent, 0)
  , []);
  
  const totalBudget = useMemo(() => 
    COST_CENTERS.reduce((sum, center) => sum + center.budget, 0)
  , []);
  
  const breakEvenPoint = useMemo(() => {
    const avgTicketPrice = 50; // Preço médio do ingresso
    return Math.ceil(totalBudget / avgTicketPrice);
  }, [totalBudget]);
  
  const ticketsToBreakEven = useMemo(() => {
    const currentTickets = REVENUE_STREAMS[0].details.sold;
    return Math.max(0, breakEvenPoint - currentTickets);
  }, [breakEvenPoint]);
  
  // State for checklist
  const [checkedDocs, setCheckedDocs] = useState<boolean[]>(new Array(REQUIRED_DOCUMENTS.length).fill(false));

  // --- ACTIONS (Optimized with useCallback) ---
  const handleExportPDF = useCallback(() => {
    window.print();
  }, []);

  const handleExportXLS = useCallback(() => {
    // Mock export
    const csvContent = "data:text/csv;charset=utf-8,Descricao,Categoria,Valor,Data\n" + 
        recentTransactions.map(t => `${t.description},${t.category},${t.amount},${t.date}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "financeiro_campanha.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [recentTransactions]);

  const handleExportChecklistPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const dateStr = new Date().toLocaleDateString('pt-BR');
    const completedCount = checkedDocs.filter(Boolean).length;
    
    const listHtml = REQUIRED_DOCUMENTS.map((doc, index) => {
        const isChecked = checkedDocs[index];
        const icon = isChecked ? '&#9745;' : '&#9744;'; // Unicode Checkbox
        const style = isChecked ? 'text-decoration: line-through; color: #64748b;' : 'color: #1e293b; font-weight: 500;';
        
        return `
            <div style="display: flex; align-items: flex-start; margin-bottom: 12px; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px;">
                <span style="font-size: 20px; margin-right: 12px; line-height: 1;">${icon}</span>
                <span style="font-family: sans-serif; font-size: 14px; ${style}">${doc}</span>
            </div>
        `;
    }).join('');

    const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Checklist TSE - Candidato</title>
            <style>
                body { font-family: 'Helvetica', sans-serif; padding: 40px; color: #334155; }
                .header { border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
                h1 { color: #1e293b; margin: 0; font-size: 24px; }
                .meta { margin-top: 10px; font-size: 12px; color: #64748b; }
                .stats { background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 30px; border: 1px solid #e2e8f0; }
                .footer { margin-top: 50px; border-top: 1px solid #cbd5e1; padding-top: 20px; font-size: 12px; text-align: center; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Checklist de Documentos Obrigatórios - TSE</h1>
                <div class="meta">Campanha Candidato | Gerado em: ${dateStr}</div>
            </div>

            <div class="stats">
                <strong>Status:</strong> ${completedCount} de ${REQUIRED_DOCUMENTS.length} documentos reunidos.
            </div>

            <div class="list">
                ${listHtml}
            </div>

            <div class="footer">
                <p>Este documento serve como controle interno da campanha. A responsabilidade final é do Administrador Financeiro.</p>
                <br/><br/>
                ___________________________________________________<br/>
                Assinatura do Responsável
            </div>
            <script>
                window.onload = function() { window.print(); }
            </script>
        </body>
        </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const startClosingProcess = () => {
    setClosingStep(1);
    // Simulate process
    setTimeout(() => setClosingStep(2), 2000); // 1->2
    setTimeout(() => setClosingStep(3), 4500); // 2->3
    setTimeout(() => setClosingStep(4), 7000); // 3->4
  };

  const toggleDoc = (index: number) => {
    const newChecked = [...checkedDocs];
    newChecked[index] = !newChecked[index];
    setCheckedDocs(newChecked);
  };

  const handleImportComplete = (newTransactions: ImportedTransaction[]) => {
    setImportedTransactions(prev => [...prev, ...newTransactions]);
    setShowImporter(false);
  };

  const steps = [
    { id: 1, label: 'Gerando Planilhas', sub: 'Consolidando lançamentos' },
    { id: 2, label: 'Reunindo Documentos', sub: 'Notas fiscais e Recibos' },
    { id: 3, label: 'Montando Prestação', sub: 'Formatação SPCE' },
    { id: 4, label: 'Pronto para Envio', sub: 'PDF Final Gerado' },
  ];

  const docsCompletedCount = checkedDocs.filter(Boolean).length;
  const docsProgress = (docsCompletedCount / REQUIRED_DOCUMENTS.length) * 100;

  return (
    <div className="space-y-6">
      
      {/* 1. HEADER & BREAK-EVEN STATUS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-6 h-6 text-green-500" />
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Painel de Receita & Borderô</h2>
            <p className="text-slate-500 text-sm mt-1">Revenue streams em tempo real | Break-even tracking</p>
          </div>
        </div>
        
        {/* Break-even Status */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-200 mt-4 md:mt-0">
          <div className="text-center">
            <div className="text-xs font-bold text-slate-600 uppercase mb-1">Break-even Point</div>
            <div className={`text-2xl font-bold ${ticketsToBreakEven <= 0 ? 'text-green-600' : 'text-amber-600'}`}>
              {ticketsToBreakEven <= 0 ? '✅ LUCRO!' : `${ticketsToBreakEven.toLocaleString()} tickets`}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {ticketsToBreakEven <= 0 ? 'Evento já se pagou' : 'Para quebrar o zero'}
            </div>
          </div>
        </div>
        <div className="flex space-x-3 mt-4 md:mt-0">
           <button 
             type="button"
             onClick={() => setShowImporter(true)} 
             className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
             aria-label="Importar planilha de custos Excel ou CSV"
             title="Importar planilha de custos"
           >
              <Upload className="w-4 h-4" aria-hidden="true" />
              <span>Importar Planilha</span>
           </button>
           <button 
             type="button"
             onClick={handleExportXLS} 
             className="flex items-center space-x-2 bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
             aria-label="Exportar dados financeiros para planilha Excel"
             title="Exportar para Excel"
           >
              <FileSpreadsheet className="w-4 h-4 text-green-600" aria-hidden="true" />
              <span>Exportar XLS</span>
           </button>
           <button 
             type="button"
             onClick={handleExportPDF} 
             className="flex items-center space-x-2 bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors shadow-md focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
             aria-label="Imprimir ou exportar para PDF"
             title="Imprimir / PDF"
           >
              <Printer className="w-4 h-4" aria-hidden="true" />
              <span>Imprimir / PDF</span>
           </button>
        </div>
      </div>

      {/* 1.5. REVENUE TABS */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 w-fit">
        <button
          type="button"
          onClick={() => setActiveFinanceTab('revenue')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
            activeFinanceTab === 'revenue'
              ? 'bg-white text-green-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
          aria-label="Dashboard de receitas em tempo real"
        >
          <DollarSign className="w-4 h-4" aria-hidden="true" />
          Revenue Streams
        </button>
        <button
          type="button"
          onClick={() => setActiveFinanceTab('costs')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
            activeFinanceTab === 'costs'
              ? 'bg-white text-red-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
          aria-label="Gestão de custos de produção"
        >
          <FileText className="w-4 h-4" aria-hidden="true" />
          Cost Centers
        </button>
        <button
          type="button"
          onClick={() => setActiveFinanceTab('breakeven')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
            activeFinanceTab === 'breakeven'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
          aria-label="Análise de ponto de equilíbrio"
        >
          <Target className="w-4 h-4" aria-hidden="true" />
          Break-even Analysis
        </button>
      </div>

      {/* CONDITIONAL CONTENT */}
      {activeFinanceTab === 'revenue' ? (
        <div className="space-y-6">
          {/* Revenue Streams Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {REVENUE_STREAMS.map(stream => {
              const Icon = stream.icon;
              const progress = (stream.current / stream.target) * 100;
              
              return (
                <div key={stream.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <div className={`${stream.color} p-4 text-white`}>
                    <div className="flex items-center justify-between mb-2">
                      <Icon className="w-6 h-6" />
                      <span className="text-xs font-bold opacity-80">
                        {progress.toFixed(0)}% da meta
                      </span>
                    </div>
                    <h3 className="font-bold text-lg">{stream.name}</h3>
                  </div>
                  
                  <div className="p-4">
                    <div className="mb-3">
                      <div className="text-2xl font-bold text-slate-800">
                        R$ {stream.current.toLocaleString()}
                      </div>
                      <div className="text-sm text-slate-500">
                        Meta: R$ {stream.target.toLocaleString()}
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-slate-200 rounded-full h-2 mb-3">
                      <div className={`h-2 rounded-full ${stream.color}`} style={{width: `${Math.min(progress, 100)}%`}}></div>
                    </div>
                    
                    {/* Stream Details */}
                    <div className="text-xs text-slate-600 space-y-1">
                      {stream.id === 'ticketing' && (
                        <>
                          <div>🎫 Vendidos: {stream.details.sold.toLocaleString()}/{stream.details.capacity.toLocaleString()}</div>
                          <div>💰 Ticket Médio: R$ {stream.details.avgPrice}</div>
                          <div>🎁 Cortesias: {stream.details.complimentary}</div>
                        </>
                      )}
                      {stream.id === 'cashless' && (
                        <>
                          <div>💳 Transações: {stream.details.transactions.toLocaleString()}</div>
                          <div>💰 Gasto Médio: R$ {stream.details.avgSpend}</div>
                          <div>🔥 Top: {stream.details.topItems.join(', ')}</div>
                        </>
                      )}
                      {stream.id === 'sponsorship' && (
                        <>
                          <div>👑 Master: {stream.details.master} | Premium: {stream.details.premium}</div>
                          <div>🤝 Apoio: {stream.details.apoio}</div>
                          <div>⏳ Pendente: {stream.details.pending} cotas</div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : activeFinanceTab === 'costs' ? (
        <div className="space-y-6">
          {/* Cost Centers */}
          {COST_CENTERS.map(center => {
            const Icon = center.icon;
            const spentPercentage = (center.spent / center.budget) * 100;
            
            return (
              <div key={center.id} className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-slate-600" />
                    <h3 className="font-bold text-slate-800">{center.name}</h3>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-slate-800">
                      R$ {center.spent.toLocaleString()}
                    </div>
                    <div className="text-sm text-slate-500">
                      de R$ {center.budget.toLocaleString()}
                    </div>
                  </div>
                </div>
                
                {/* Budget Progress */}
                <div className="w-full bg-slate-200 rounded-full h-2 mb-4">
                  <div className={`h-2 rounded-full ${spentPercentage > 90 ? 'bg-red-500' : spentPercentage > 75 ? 'bg-amber-500' : 'bg-green-500'}`} 
                       style={{width: `${Math.min(spentPercentage, 100)}%`}}></div>
                </div>
                
                {/* Line Items */}
                <div className="space-y-2">
                  {center.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm">
                      <span className="text-slate-600">{item.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">R$ {item.amount.toLocaleString()}</span>
                        <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                          item.status === 'Pago' ? 'bg-green-100 text-green-700' :
                          item.status.includes('CRÍTICO') ? 'bg-red-100 text-red-700' :
                          item.status === 'Pendente' ? 'bg-amber-100 text-amber-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <>
          {/* 2. CAMPAIGN CLOSING WIZARD */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100 shadow-sm relative overflow-hidden">
         <div className="absolute right-0 top-0 opacity-10">
            <FileText className="w-64 h-64 text-blue-600" />
         </div>

         <div className="relative z-10">
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-lg font-bold text-blue-900">Fechamento de Campanha (Prestação de Contas Final)</h3>
               <button 
                  type="button"
                  onClick={() => setShowTseModal(true)}
                  className="text-xs font-semibold bg-white text-blue-600 px-3 py-1.5 rounded-full border border-blue-200 hover:bg-blue-50 flex items-center gap-1 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  aria-label="Ver lista completa de documentos obrigatórios do TSE"
                  title="Lista de Documentos TSE"
                >
                  <Info className="w-3 h-3" aria-hidden="true" />
                  Lista de Documentos TSE
               </button>
            </div>

            {closingStep === 0 ? (
               <div className="text-center py-8">
                  <p className="text-slate-600 mb-6 max-w-lg mx-auto">
                    Atenção: Este processo irá bloquear novos lançamentos e gerar o pacote de documentos para envio ao contador e importação no SPCE.
                  </p>
                  <button 
                    type="button"
                    onClick={startClosingProcess}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg transform transition hover:scale-105 focus:ring-4 focus:ring-blue-300 focus:ring-offset-2"
                    aria-label="Iniciar processo de fechamento da campanha eleitoral"
                    title="Iniciar Processo de Fechamento"
                  >
                    Iniciar Processo de Fechamento
                  </button>
               </div>
            ) : (
               <div className="w-full max-w-4xl mx-auto">
                  {/* Stepper Visualization */}
                  <div className="flex justify-between items-center relative mb-8">
                     {/* Connecting Line */}
                     <div className="absolute left-0 top-1/2 w-full h-1 bg-slate-200 -z-0"></div>
                     <div 
                        className="absolute left-0 top-1/2 h-1 bg-blue-500 transition-all duration-1000 -z-0"
                        style={{ width: `${((Math.min(closingStep, 4) - 1) / 3) * 100}%` }}
                     ></div>

                     {steps.map((step) => {
                        const isCompleted = closingStep > step.id;
                        const isCurrent = closingStep === step.id;
                        return (
                          <div key={step.id} className="relative z-10 flex flex-col items-center">
                             <div className={`
                                w-10 h-10 rounded-full flex items-center justify-center border-4 transition-colors duration-500
                                ${isCompleted || isCurrent ? 'bg-blue-600 border-blue-100 text-white' : 'bg-white border-slate-200 text-slate-300'}
                             `}>
                                {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : isCurrent ? <Loader2 className="w-6 h-6 animate-spin" /> : <span className="font-bold">{step.id}</span>}
                             </div>
                             <div className="mt-2 text-center hidden sm:block">
                                <p className={`text-sm font-bold ${isCurrent ? 'text-blue-800' : 'text-slate-500'}`}>{step.label}</p>
                                <p className="text-xs text-slate-400">{step.sub}</p>
                             </div>
                          </div>
                        );
                     })}
                  </div>
                  
                  {closingStep === 4 && (
                      <div className="text-center animate-in fade-in zoom-in duration-500">
                          <p className="text-emerald-700 font-medium mb-4">Processo finalizado com sucesso!</p>
                          <button 
                            type="button"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg shadow-md flex items-center gap-2 mx-auto focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                            aria-label="Baixar pacote completo de documentos em PDF para envio ao TSE"
                            title="Baixar Pacote PDF (TSE)"
                          >
                              <FileText className="w-5 h-5" aria-hidden="true" />
                              Baixar Pacote PDF (TSE)
                          </button>
                      </div>
                  )}
               </div>
            )}
         </div>
      </div>

      {/* 3. DETAILED TRANSACTIONS TABLE */}
      <div className="bg-white rounded-xl shadow border border-slate-200 overflow-hidden">
         <div className="p-6 border-b border-slate-100 bg-slate-50/50">
             <h3 className="font-bold text-slate-800">Extrato de Lançamentos</h3>
         </div>
         <div className="overflow-x-auto">
             <table className="w-full text-sm text-left" role="table" aria-label="Extrato de lançamentos financeiros">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th scope="col" className="px-6 py-3 font-semibold">Data</th>
                    <th scope="col" className="px-6 py-3 font-semibold">Descrição</th>
                    <th scope="col" className="px-6 py-3 font-semibold">Categoria</th>
                    <th scope="col" className="px-6 py-3 font-semibold">Origem</th>
                    <th scope="col" className="px-6 py-3 font-semibold text-right">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentTransactions.map((t, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-slate-500">{t.date}</td>
                      <td className="px-6 py-4 font-medium text-slate-900">{t.description}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wide
                           ${t.category === 'Marketing' ? 'bg-purple-100 text-purple-700' : 
                             t.category === 'Logística' ? 'bg-amber-100 text-amber-700' : 
                             'bg-blue-100 text-blue-700'}
                        `}>
                            {t.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-xs">{t.source === 'ocr' ? 'Nota Fiscal (IA)' : t.source === 'manual' ? 'Manual' : 'Automação'}</td>
                      <td className="px-6 py-4 text-right font-medium text-red-600">
                         - R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
             </table>
             {recentTransactions.length === 0 && (
                <div className="p-8 text-center text-slate-400">Nenhum lançamento registrado.</div>
             )}
         </div>
      </div>

      {/* TSE REQUIREMENTS MODAL */}
      {showTseModal && (
         <div 
           className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" 
           onClick={() => setShowTseModal(false)}
           role="dialog"
           aria-modal="true"
           aria-labelledby="tse-modal-title"
           aria-describedby="tse-modal-description"
         >
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto flex flex-col" onClick={e => e.stopPropagation()}>
               <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
                  <div>
                    <h3 id="tse-modal-title" className="text-xl font-bold text-slate-900">Checklist Obrigatório - TSE</h3>
                    <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                        <span aria-live="polite">Progresso: {docsCompletedCount} de {REQUIRED_DOCUMENTS.length}</span>
                        <div 
                          className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden" 
                          role="progressbar" 
                          aria-valuenow={docsProgress} 
                          aria-valuemin={0} 
                          aria-valuemax={100}
                          aria-label={`Progresso do checklist: ${docsProgress}%`}
                        >
                            <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${docsProgress}%` }}></div>
                        </div>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setShowTseModal(false)} 
                    className="text-slate-400 hover:text-slate-600 p-2 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                    aria-label="Fechar modal"
                    title="Fechar"
                  >
                     ✕
                  </button>
               </div>
               
               <div className="p-6 space-y-4 overflow-y-auto">
                  <p id="tse-modal-description" className="text-sm text-slate-600 bg-amber-50 p-4 rounded-lg border border-amber-100 flex items-start gap-2">
                     <Info className="w-5 h-5 text-amber-500 flex-shrink-0" aria-hidden="true" />
                     <span>A ausência de qualquer um destes documentos pode gerar diligências ou desaprovação das contas. Marque os itens conforme forem reunidos.</span>
                  </p>
                  
                  <fieldset>
                    <legend className="sr-only">Lista de documentos obrigatórios do TSE</legend>
                    <div className="space-y-2">
                      {REQUIRED_DOCUMENTS.map((item, i) => (
                          <label 
                              key={i} 
                              className={`
                                  flex items-start gap-3 p-3 rounded-lg cursor-pointer border transition-all select-none
                                  ${checkedDocs[i] 
                                      ? 'bg-emerald-50 border-emerald-100' 
                                      : 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-200'}
                              `}
                          >
                              <input 
                                  type="checkbox" 
                                  className="mt-1 w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                  checked={checkedDocs[i]}
                                  onChange={() => toggleDoc(i)}
                                  aria-describedby={`doc-desc-${i}`}
                              />
                              <span 
                                id={`doc-desc-${i}`}
                                className={`text-sm transition-colors ${checkedDocs[i] ? 'text-emerald-800 font-medium line-through opacity-70' : 'text-slate-800'}`}
                              >
                                {item}
                            </span>
                        </label>
                    ))}
                    </div>
                  </fieldset>
               </div>
               
               <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-between items-center sticky bottom-0 z-10">
                  <button 
                    type="button"
                    onClick={handleExportChecklistPDF} 
                    className="flex items-center space-x-2 text-blue-600 bg-blue-50 border border-blue-200 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    aria-label="Exportar checklist de documentos em PDF"
                    title="Exportar Checklist (PDF)"
                  >
                     <Download className="w-4 h-4" aria-hidden="true" />
                     <span className="font-medium text-sm">Exportar Checklist (PDF)</span>
                  </button>

                  <button 
                    type="button"
                    onClick={() => setShowTseModal(false)} 
                    className="bg-slate-800 text-white px-6 py-2 rounded-lg font-medium hover:bg-slate-900 shadow-sm focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
                    aria-label="Fechar checklist e concluir revisão"
                    title="Concluir Revisão"
                  >
                     Concluir Revisão
                  </button>
               </div>
            </div>
         </div>
      )}

      {showImporter && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <SpreadsheetImporter
            onImportComplete={handleImportComplete}
            onClose={() => setShowImporter(false)}
          />
        </div>
      )}
        </>
      )}
    </div>
  );
};
