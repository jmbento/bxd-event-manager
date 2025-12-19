import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit3, Trash2, DollarSign, Target, AlertTriangle, CheckCircle, Clock, TrendingUp, Calculator } from 'lucide-react';
import { BudgetItem, BudgetSummary } from '../types';
import { budgetService, BUDGET_CATEGORIES, BUDGET_SUBCATEGORIES } from '../services/budgetService';
import { PageBanner } from './PageBanner';

export const BudgetManager: React.FC = () => {
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [summary, setSummary] = useState<BudgetSummary | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [selectedBudgetItem, setSelectedBudgetItem] = useState<BudgetItem | null>(null);
  const [activeTab, setActiveTab] = useState<'budget' | 'actual'>('budget');

  // Form states
  const [newBudgetForm, setNewBudgetForm] = useState({
    category: '',
    subcategory: '',
    description: '',
    plannedAmount: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    dueDate: ''
  });

  const [expenseForm, setExpenseForm] = useState({
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Load data
  const loadData = useCallback(() => {
    const items = budgetService.loadBudget();
    const budgetSummary = budgetService.getBudgetSummary();
    setBudgetItems(items);
    setSummary(budgetSummary);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handlers
  const handleAddBudgetItem = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(newBudgetForm.plannedAmount);
    if (amount <= 0) return;

    budgetService.addBudgetItem({
      category: newBudgetForm.category,
      subcategory: newBudgetForm.subcategory,
      description: newBudgetForm.description,
      plannedAmount: amount,
      priority: newBudgetForm.priority,
      dueDate: newBudgetForm.dueDate || undefined
    });

    setNewBudgetForm({
      category: '',
      subcategory: '',
      description: '',
      plannedAmount: '',
      priority: 'medium',
      dueDate: ''
    });
    setShowAddModal(false);
    loadData();
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBudgetItem) return;
    
    const amount = parseFloat(expenseForm.amount);
    if (amount <= 0) return;

    budgetService.addActualExpense(
      selectedBudgetItem.id,
      amount,
      expenseForm.description,
      expenseForm.date
    );

    setExpenseForm({
      amount: '',
      description: '',
      date: new Date().toISOString().split('T')[0]
    });
    setShowExpenseModal(false);
    setSelectedBudgetItem(null);
    loadData();
  };

  const handleRemoveBudgetItem = (id: string) => {
    if (confirm('Tem certeza que deseja remover este item do orçamento?')) {
      budgetService.removeBudgetItem(id);
      loadData();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-slate-500 bg-slate-100';
      case 'partial': return 'text-blue-700 bg-blue-100';
      case 'completed': return 'text-green-700 bg-green-100';
      case 'exceeded': return 'text-red-700 bg-red-100';
      default: return 'text-slate-500 bg-slate-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'partial': return <TrendingUp className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'exceeded': return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500 bg-red-50';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50';
      case 'low': return 'border-l-green-500 bg-green-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      <PageBanner pageKey="budget" />
      
      {/* Header com Resumo */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold">Gestão Orçamentária</h2>
            <p className="text-blue-100 mt-1">Controle total de orçamento vs gastos reais</p>
          </div>
          <Calculator className="w-8 h-8 text-blue-200" />
        </div>
        
        {summary && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white/10 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5" />
                <span className="text-sm font-medium">Orçado</span>
              </div>
              <p className="text-2xl font-bold">
                R$ {summary.totalPlanned.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            
            <div className="bg-white/10 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5" />
                <span className="text-sm font-medium">Realizado</span>
              </div>
              <p className="text-2xl font-bold">
                R$ {summary.totalActual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            
            <div className="bg-white/10 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5" />
                <span className="text-sm font-medium">% Executado</span>
              </div>
              <p className="text-2xl font-bold">{summary.percentageUsed.toFixed(1)}%</p>
            </div>
            
            <div className="bg-white/10 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5" />
                <span className="text-sm font-medium">Excedidos</span>
              </div>
              <p className="text-2xl font-bold">{summary.exceededCount}</p>
            </div>
          </div>
        )}
      </div>

      {/* Tabs e Ações */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('budget')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'budget'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Planejamento Orçamentário
          </button>
          <button
            onClick={() => setActiveTab('actual')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'actual'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Gastos Reais
          </button>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo Item Orçamentário
        </button>
      </div>

      {/* Lista de Itens */}
      <div className="space-y-4">
        {budgetItems.map((item) => (
          <div
            key={item.id}
            className={`border-l-4 rounded-lg p-6 bg-white shadow-sm ${getPriorityColor(item.priority)}`}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-lg text-gray-900">{item.description}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(item.status)}`}>
                    {getStatusIcon(item.status)}
                    {item.status === 'pending' && 'Pendente'}
                    {item.status === 'partial' && 'Parcial'}
                    {item.status === 'completed' && 'Concluído'}
                    {item.status === 'exceeded' && 'Excedido'}
                  </span>
                </div>
                
                <div className="text-sm text-gray-600 mb-3">
                  {BUDGET_CATEGORIES[item.category as keyof typeof BUDGET_CATEGORIES]} 
                  {item.subcategory && ` • ${item.subcategory}`}
                </div>
                
                {/* Barra de Progresso */}
                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Execução Orçamentária</span>
                    <span>{((item.actualAmount / item.plannedAmount) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        item.status === 'exceeded' ? 'bg-red-500' :
                        item.status === 'completed' ? 'bg-green-500' :
                        item.status === 'partial' ? 'bg-blue-500' : 'bg-gray-300'
                      }`}
                      style={{ width: `${Math.min((item.actualAmount / item.plannedAmount) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
                
                {/* Valores */}
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 block">Orçado</span>
                    <span className="font-semibold text-blue-600">
                      R$ {item.plannedAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Realizado</span>
                    <span className="font-semibold text-green-600">
                      R$ {item.actualAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Saldo</span>
                    <span className={`font-semibold ${
                      item.remainingAmount < 0 ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      R$ {item.remainingAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Ações */}
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => {
                    setSelectedBudgetItem(item);
                    setShowExpenseModal(true);
                  }}
                  className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                  title="Lançar Gasto Real"
                >
                  <DollarSign className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleRemoveBudgetItem(item.id)}
                  className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                  title="Remover Item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal - Novo Item Orçamentário */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Novo Item Orçamentário</h3>
            
            <form onSubmit={handleAddBudgetItem} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Categoria</label>
                <select
                  value={newBudgetForm.category}
                  onChange={(e) => setNewBudgetForm({...newBudgetForm, category: e.target.value, subcategory: ''})}
                  required
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="">Selecione uma categoria</option>
                  {Object.entries(BUDGET_CATEGORIES).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              
              {newBudgetForm.category && (
                <div>
                  <label className="block text-sm font-medium mb-2">Subcategoria</label>
                  <select
                    value={newBudgetForm.subcategory}
                    onChange={(e) => setNewBudgetForm({...newBudgetForm, subcategory: e.target.value})}
                    className="w-full p-2 border rounded-lg"
                  >
                    <option value="">Selecione uma subcategoria</option>
                    {BUDGET_SUBCATEGORIES[newBudgetForm.category as keyof typeof BUDGET_SUBCATEGORIES]?.map((sub) => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium mb-2">Descrição</label>
                <input
                  type="text"
                  value={newBudgetForm.description}
                  onChange={(e) => setNewBudgetForm({...newBudgetForm, description: e.target.value})}
                  required
                  className="w-full p-2 border rounded-lg"
                  placeholder="Descreva o item do orçamento"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Valor Orçado (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={newBudgetForm.plannedAmount}
                  onChange={(e) => setNewBudgetForm({...newBudgetForm, plannedAmount: e.target.value})}
                  required
                  className="w-full p-2 border rounded-lg"
                  placeholder="0,00"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Prioridade</label>
                  <select
                    value={newBudgetForm.priority}
                    onChange={(e) => setNewBudgetForm({...newBudgetForm, priority: e.target.value as 'low' | 'medium' | 'high'})}
                    className="w-full p-2 border rounded-lg"
                  >
                    <option value="low">Baixa</option>
                    <option value="medium">Média</option>
                    <option value="high">Alta</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Prazo</label>
                  <input
                    type="date"
                    value={newBudgetForm.dueDate}
                    onChange={(e) => setNewBudgetForm({...newBudgetForm, dueDate: e.target.value})}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Adicionar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal - Lançar Gasto Real */}
      {showExpenseModal && selectedBudgetItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Lançar Gasto Real</h3>
            
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <p className="font-semibold text-blue-900">{selectedBudgetItem.description}</p>
              <p className="text-sm text-blue-700 mt-1">
                Orçado: R$ {selectedBudgetItem.plannedAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} |
                Saldo: R$ {selectedBudgetItem.remainingAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            
            <form onSubmit={handleAddExpense} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Valor Gasto (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm({...expenseForm, amount: e.target.value})}
                  required
                  className="w-full p-2 border rounded-lg"
                  placeholder="0,00"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Descrição do Gasto</label>
                <input
                  type="text"
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({...expenseForm, description: e.target.value})}
                  required
                  className="w-full p-2 border rounded-lg"
                  placeholder="Ex: Pagamento de fornecedor X"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Data</label>
                <input
                  type="date"
                  value={expenseForm.date}
                  onChange={(e) => setExpenseForm({...expenseForm, date: e.target.value})}
                  required
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowExpenseModal(false);
                    setSelectedBudgetItem(null);
                  }}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Lançar Gasto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};