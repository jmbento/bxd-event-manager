import React, { useState } from 'react';
import { FinancialKPI, Transaction } from '../types';
import { DollarSign, TrendingUp, TrendingDown, Calendar, Upload, X, FileSpreadsheet, CheckCircle, FileText, Download } from 'lucide-react';
import { importLeiIncentivoSpreadsheet, exportLeiIncentivoSpreadsheet } from '../services/leiIncentivoService';

interface Props {
  financials: FinancialKPI;
  recentTransactions: Transaction[];
}

interface ImportModalProps {
  onClose: () => void;
  onImport: (transactions: Transaction[]) => void;
}

const ImportModal: React.FC<ImportModalProps> = ({ onClose, onImport }) => {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setSuccess(false);
    }
  };

  const handleImport = async () => {
    if (!file) return;
    
    setImporting(true);
    
    try {
      // Detectar se é planilha Lei de Incentivo
      const isLeiIncentivo = file.name.toLowerCase().includes('orçament') || 
                             file.name.toLowerCase().includes('orcament');
      
      if (isLeiIncentivo) {
        // Importar planilha Lei de Incentivo
        const transactions = await importLeiIncentivoSpreadsheet(file);
        onImport(transactions);
      } else {
        // Importação simples (mock para outros formatos)
        setTimeout(() => {
          const mockTransactions: Transaction[] = [
            {
              id: `imp-${Date.now()}-1`,
              description: 'Cachê DJ Importado',
              amount: -25000,
              date: '2025-11-15',
              category: 'PESSOAL',
              source: 'manual',
              rubric: 'PESSOAL'
            },
            {
              id: `imp-${Date.now()}-2`,
              description: 'Venda de Ingressos Importada',
              amount: 45000,
              date: '2025-11-20',
              category: 'Receita',
              source: 'manual'
            }
          ];
          
          onImport(mockTransactions);
        }, 1000);
      }
      
      setImporting(false);
      setSuccess(true);
      
      setTimeout(() => {
        onClose();
      }, 2000);
      
    } catch (error) {
      console.error('Erro na importação:', error);
      alert('Erro ao importar planilha. Verifique o formato do arquivo.');
      setImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-blue-600" />
            Importar Planilha
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <p className="text-lg font-semibold text-green-900">Importação concluída!</p>
            <p className="text-sm text-slate-600 mt-2">Transações adicionadas com sucesso.</p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-sm text-slate-600 mb-4">
                Formatos aceitos: <strong>Excel (.xlsx, .xls)</strong> ou <strong>CSV</strong>
              </p>
              
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-blue-500 transition">
                <Upload className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <label className="cursor-pointer">
                  <span className="text-blue-600 font-semibold hover:text-blue-700">
                    Clique para selecionar
                  </span>
                  <span className="text-slate-600"> ou arraste o arquivo aqui</span>
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>

              {file && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3">
                  <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">{file.name}</p>
                    <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(2)} KB</p>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-slate-50 p-4 rounded-lg mb-4">
              <p className="text-xs font-semibold text-slate-700 mb-2">📋 Formato esperado:</p>
              <div className="text-xs text-slate-600 space-y-1">
                <p>• <strong>Coluna A:</strong> Data (DD/MM/AAAA)</p>
                <p>• <strong>Coluna B:</strong> Descrição</p>
                <p>• <strong>Coluna C:</strong> Valor (usar negativo para despesas)</p>
                <p>• <strong>Coluna D:</strong> Categoria</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleImport}
                disabled={!file || importing}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {importing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Importando...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Importar
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export const FinanceViewSimple: React.FC<Props> = ({ financials, recentTransactions }) => {
  const [showImportModal, setShowImportModal] = useState(false);
  const [transactions, setTransactions] = useState(recentTransactions);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const handleImportTransactions = (newTransactions: Transaction[]) => {
    setTransactions([...newTransactions, ...transactions]);
  };

  const handleExportPrestacaoContas = () => {
    const projectInfo = {
      projectName: 'Meu Evento Cultural',
      culturalArea: 'Música e Dança',
      actionLine: 'Exposições, Mostras, Manifestações Culturais',
      production: 'Produção Cultural Nacional',
      proponent: 'Sua Empresa Ltda',
      email: 'contato@evento.com',
      phone: '(11) 99999-9999',
    };
    
    const blob = exportLeiIncentivoSpreadsheet(transactions, projectInfo);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Prestacao_Contas_${new Date().toISOString().split('T')[0]}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
          <DollarSign className="w-6 h-6 text-blue-600" />
          Visão Financeira Completa
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-slate-600 mb-1">Orçamento Total</p>
            <p className="text-2xl font-bold text-blue-900">{formatCurrency(financials.budgetTotal)}</p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-slate-600 mb-1">Saldo Disponível</p>
            <p className="text-2xl font-bold text-green-900">{formatCurrency(financials.balance)}</p>
          </div>
          
          <div className="bg-orange-50 p-4 rounded-lg">
            <p className="text-sm text-slate-600 mb-1">Total Gasto</p>
            <p className="text-2xl font-bold text-orange-900">{formatCurrency(financials.totalSpent)}</p>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-600">Utilização do Orçamento</span>
            <span className="font-semibold text-slate-900">
              {((financials.totalSpent / financials.budgetTotal) * 100).toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-3">
            <div 
              className="bg-blue-600 h-3 rounded-full transition-all"
              style={{ width: `${(financials.totalSpent / financials.budgetTotal) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-slate-600" />
          Transações Recentes
        </h3>
        
        {transactions.length === 0 ? (
          <p className="text-slate-500 text-center py-8">
            Nenhuma transação registrada ainda.
          </p>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div 
                key={transaction.id}
                className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                    {transaction.amount > 0 ? (
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{transaction.description}</p>
                    <p className="text-sm text-slate-500">{transaction.date} • {transaction.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-bold ${
                    transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(Math.abs(transaction.amount))}
                  </p>
                  <p className="text-xs text-slate-500 uppercase">{transaction.source}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-bold text-slate-900 mb-4">Ações Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <button className="p-4 border-2 border-slate-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-left">
            <p className="font-semibold text-slate-900">Nova Transação</p>
            <p className="text-sm text-slate-500">Registrar entrada ou saída</p>
          </button>
          <button 
            onClick={() => setShowImportModal(true)}
            className="p-4 border-2 border-green-500 bg-green-50 rounded-lg hover:bg-green-100 transition text-left"
          >
            <div className="flex items-center gap-2 mb-1">
              <Upload className="w-5 h-5 text-green-700" />
              <p className="font-semibold text-green-900">Importar Planilha</p>
            </div>
            <p className="text-sm text-green-700">Excel (.xlsx, .xls) ou CSV</p>
          </button>
          <button 
            onClick={handleExportPrestacaoContas}
            className="p-4 border-2 border-orange-500 bg-orange-50 rounded-lg hover:bg-orange-100 transition text-left"
          >
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-5 h-5 text-orange-700" />
              <p className="font-semibold text-orange-900">Prestação ICMS</p>
            </div>
            <p className="text-sm text-orange-700">Exportar Lei de Incentivo</p>
          </button>
          <button className="p-4 border-2 border-slate-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition text-left">
            <div className="flex items-center gap-2 mb-1">
              <Download className="w-5 h-5 text-purple-700" />
              <p className="font-semibold text-slate-900">Relatório Geral</p>
            </div>
            <p className="text-sm text-slate-500">PDF ou Excel</p>
          </button>
        </div>
      </div>

      {showImportModal && (
        <ImportModal 
          onClose={() => setShowImportModal(false)}
          onImport={handleImportTransactions}
        />
      )}
    </div>
  );
};
