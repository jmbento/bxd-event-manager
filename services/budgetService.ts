import { BudgetItem, BudgetSummary, Transaction } from '../types';

// Categorias padrão para orçamento de campanha
export const BUDGET_CATEGORIES = {
  marketing: 'Marketing e Publicidade',
  logistics: 'Logística e Eventos',
  personnel: 'Pessoal e Colaboradores',
  materials: 'Materiais de Campanha',
  transport: 'Transporte e Combustível',
  communication: 'Comunicação e Telefone',
  legal: 'Jurídico e Contabilidade',
  technology: 'Tecnologia e Software',
  administrative: 'Administrativo',
  contingency: 'Reserva de Contingência'
};

export const BUDGET_SUBCATEGORIES = {
  marketing: ['Redes Sociais', 'Material Gráfico', 'Rádio/TV', 'Outdoor', 'Impulsionamento'],
  logistics: ['Eventos', 'Aluguel de Espaço', 'Sonorização', 'Decoração', 'Catering'],
  personnel: ['Coordenadores', 'Cabos Eleitorais', 'Assessoria', 'Segurança'],
  materials: ['Santinhos', 'Adesivos', 'Camisetas', 'Bandeiras', 'Broches'],
  transport: ['Combustível', 'Manutenção', 'Aluguel de Veículos', 'Pedágio'],
  communication: ['Telefone', 'Internet', 'Aplicativos', 'WhatsApp Business'],
  legal: ['Advogado', 'Contador', 'Documentação', 'Taxas'],
  technology: ['Site', 'App', 'Sistemas', 'Hospedagem'],
  administrative: ['Material de Escritório', 'Aluguel', 'Água/Luz', 'Limpeza'],
  contingency: ['Emergências', 'Imprevistos', 'Oportunidades']
};

class BudgetService {
  private STORAGE_KEY = 'campaign_budget';
  private TRANSACTIONS_KEY = 'campaign_transactions';

  // Salvar orçamento
  saveBudget(items: BudgetItem[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Erro ao salvar orçamento:', error);
    }
  }

  // Carregar orçamento
  loadBudget(): BudgetItem[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : this.getDefaultBudget();
    } catch (error) {
      console.error('Erro ao carregar orçamento:', error);
      return this.getDefaultBudget();
    }
  }

  // Orçamento padrão inicial
  private getDefaultBudget(): BudgetItem[] {
    return [
      {
        id: 'budget-1',
        category: 'marketing',
        subcategory: 'Redes Sociais',
        description: 'Impulsionamento Facebook/Instagram',
        plannedAmount: 15000,
        actualAmount: 0,
        remainingAmount: 15000,
        status: 'pending',
        priority: 'high',
        dueDate: '2025-12-15'
      },
      {
        id: 'budget-2',
        category: 'materials',
        subcategory: 'Santinhos',
        description: 'Impressão de 50.000 santinhos',
        plannedAmount: 8000,
        actualAmount: 0,
        remainingAmount: 8000,
        status: 'pending',
        priority: 'high',
        dueDate: '2025-12-10'
      },
      {
        id: 'budget-3',
        category: 'logistics',
        subcategory: 'Eventos',
        description: 'Comício central - som e estrutura',
        plannedAmount: 12000,
        actualAmount: 0,
        remainingAmount: 12000,
        status: 'pending',
        priority: 'medium',
        dueDate: '2025-12-20'
      }
    ];
  }

  // Adicionar item ao orçamento
  addBudgetItem(item: Omit<BudgetItem, 'id' | 'actualAmount' | 'remainingAmount' | 'status'>): BudgetItem {
    const newItem: BudgetItem = {
      ...item,
      id: `budget-${Date.now()}`,
      actualAmount: 0,
      remainingAmount: item.plannedAmount,
      status: 'pending'
    };

    const budget = this.loadBudget();
    budget.push(newItem);
    this.saveBudget(budget);
    return newItem;
  }

  // Atualizar item do orçamento
  updateBudgetItem(id: string, updates: Partial<BudgetItem>): void {
    const budget = this.loadBudget();
    const index = budget.findIndex(item => item.id === id);
    
    if (index !== -1) {
      const updatedItem = { ...budget[index], ...updates };
      
      // Recalcular valores automáticos
      updatedItem.remainingAmount = updatedItem.plannedAmount - updatedItem.actualAmount;
      
      // Atualizar status
      if (updatedItem.actualAmount === 0) {
        updatedItem.status = 'pending';
      } else if (updatedItem.actualAmount < updatedItem.plannedAmount) {
        updatedItem.status = 'partial';
      } else if (updatedItem.actualAmount === updatedItem.plannedAmount) {
        updatedItem.status = 'completed';
      } else {
        updatedItem.status = 'exceeded';
      }
      
      budget[index] = updatedItem;
      this.saveBudget(budget);
    }
  }

  // Lançar gasto real contra orçamento
  addActualExpense(budgetId: string, amount: number, description: string, date: string): void {
    const budget = this.loadBudget();
    const budgetItem = budget.find(item => item.id === budgetId);
    
    if (budgetItem) {
      // Atualizar valor real no orçamento
      budgetItem.actualAmount += amount;
      this.updateBudgetItem(budgetId, budgetItem);
      
      // Criar transação vinculada
      const transaction: Transaction = {
        id: `trans-${Date.now()}`,
        date,
        description,
        amount,
        category: budgetItem.category,
        source: 'manual',
        type: 'actual',
        budgetId
      };
      
      this.saveTransaction(transaction);
    }
  }

  // Salvar transação
  private saveTransaction(transaction: Transaction): void {
    try {
      const stored = localStorage.getItem(this.TRANSACTIONS_KEY);
      const transactions: Transaction[] = stored ? JSON.parse(stored) : [];
      transactions.push(transaction);
      localStorage.setItem(this.TRANSACTIONS_KEY, JSON.stringify(transactions));
    } catch (error) {
      console.error('Erro ao salvar transação:', error);
    }
  }

  // Calcular resumo do orçamento
  getBudgetSummary(): BudgetSummary {
    const budget = this.loadBudget();
    
    const totalPlanned = budget.reduce((sum, item) => sum + item.plannedAmount, 0);
    const totalActual = budget.reduce((sum, item) => sum + item.actualAmount, 0);
    const totalRemaining = totalPlanned - totalActual;
    const percentageUsed = totalPlanned > 0 ? (totalActual / totalPlanned) * 100 : 0;
    const exceededCount = budget.filter(item => item.status === 'exceeded').length;
    
    return {
      totalPlanned,
      totalActual,
      totalRemaining,
      percentageUsed,
      categoriesCount: budget.length,
      exceededCount
    };
  }

  // Remover item do orçamento
  removeBudgetItem(id: string): void {
    const budget = this.loadBudget();
    const filtered = budget.filter(item => item.id !== id);
    this.saveBudget(filtered);
  }

  // Obter transações por item de orçamento
  getTransactionsByBudget(budgetId: string): Transaction[] {
    try {
      const stored = localStorage.getItem(this.TRANSACTIONS_KEY);
      const transactions: Transaction[] = stored ? JSON.parse(stored) : [];
      return transactions.filter(t => t.budgetId === budgetId);
    } catch (error) {
      console.error('Erro ao carregar transações:', error);
      return [];
    }
  }
}

export const budgetService = new BudgetService();