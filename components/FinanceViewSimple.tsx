import React, { useState } from 'react';
import { FinancialKPI, Transaction } from '../types';
import { 
  DollarSign, TrendingUp, TrendingDown, Calendar, Upload, X, FileSpreadsheet, 
  CheckCircle, FileText, Download, AlertCircle, Plus, Edit2, Trash2, Save,
  Tag, Search, Building2, Megaphone, Receipt, Coins
} from 'lucide-react';
import { importGenericSpreadsheet } from '../services/spreadsheetImportService';
import { exportLeiIncentivoSpreadsheet } from '../services/leiIncentivoService';

// ============ TIPOS E CONSTANTES ============

type TransactionType = 'entrada' | 'saida';

interface ExtendedTransaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
  source: 'ocr' | 'marketing_task' | 'logistics_auto' | 'manual';
  // Campos adicionais
  transactionType: TransactionType;
  subcategory?: string;
  tags: string[];
  notes?: string;
  attachmentUrl?: string;
  supplier?: string;
  invoiceNumber?: string;
}

// ============ MODALIDADES DE RECURSO (FONTE) ============
const MODALIDADES_RECURSO = [
  { id: 'rouanet', label: 'Lei Rouanet', color: 'purple' },
  { id: 'icms', label: 'ICMS', color: 'blue' },
  { id: 'funarj', label: 'FUNARJ', color: 'green' },
  { id: 'pesagro', label: 'PESAGRO', color: 'orange' },
  { id: 'setur', label: 'SETUR', color: 'teal' },
  { id: 'patrocinio_direto', label: 'Patrocínio Direto', color: 'pink' },
  { id: 'recursos_proprios', label: 'Recursos Próprios', color: 'gray' },
];

// ============ CENTROS DE CUSTO ============
const CENTROS_CUSTO = [
  {
    id: 'pessoal',
    label: 'Pessoal',
    icon: Building2,
    color: 'blue',
    subcategories: [
      'Coordenação Geral',
      'Produção Executiva',
      'Produção Local',
      'Direção Artística',
      'Direção Técnica',
      'Equipe Administrativa',
      'Equipe de Campo',
      'Cachês Artísticos',
      'Assessoria de Imprensa',
      'Social Media',
      'Encargos e Impostos sobre Folha',
      'Outros'
    ]
  },
  {
    id: 'estrutura',
    label: 'Estrutura',
    icon: Receipt,
    color: 'orange',
    subcategories: [
      'Locação de Espaço',
      'Palco e Cobertura',
      'Sonorização',
      'Iluminação',
      'Gerador',
      'Banheiros Químicos',
      'Tendas e Stands',
      'Cenografia',
      'Mobiliário',
      'Comunicação Visual',
      'Camarim',
      'Outros'
    ]
  },
  {
    id: 'logistica',
    label: 'Logística',
    icon: Receipt,
    color: 'green',
    subcategories: [
      'Transporte de Equipamentos',
      'Transporte de Pessoas',
      'Hospedagem',
      'Alimentação',
      'Passagens Aéreas',
      'Combustível',
      'Pedágio',
      'Estacionamento',
      'Frete',
      'Outros'
    ]
  },
  {
    id: 'impostos_taxas',
    label: 'Impostos/Taxas/Seguros',
    icon: Building2,
    color: 'red',
    subcategories: [
      'ISS',
      'INSS',
      'IRRF',
      'ECAD',
      'Taxas de Licenciamento',
      'Alvarás',
      'Seguro do Evento',
      'Seguro de Equipamentos',
      'ART/RRT',
      'Bombeiros',
      'Outros'
    ]
  },
  {
    id: 'midia_divulgacao',
    label: 'Mídia/Divulgação/Comunicação',
    icon: Megaphone,
    color: 'purple',
    subcategories: [
      'Mídia Digital',
      'Mídia Impressa',
      'Mídia OOH (Outdoor)',
      'Rádio',
      'TV',
      'Material Gráfico',
      'Redes Sociais (Impulsionamento)',
      'Influenciadores',
      'Produção de Conteúdo',
      'Vídeos Promocionais',
      'Fotografia',
      'Assessoria de Imprensa',
      'Outros'
    ]
  }
];

// Categorias principais com subcategorias (ENTRADA)
const CATEGORIES = {
  entrada: [
    {
      id: 'incentivo_fiscal',
      label: 'Incentivo Fiscal',
      icon: Building2,
      color: 'blue',
      subcategories: [
        'Lei Rouanet (Federal)',
        'ICMS (Estadual)',
        'FUNARJ',
        'PESAGRO',
        'SETUR',
        'ISS (Municipal)',
        'Outro Incentivo'
      ]
    },
    {
      id: 'patrocinio_direto',
      label: 'Patrocínio Direto',
      icon: Megaphone,
      color: 'purple',
      subcategories: [
        'Patrocínio Master',
        'Patrocínio Ouro',
        'Patrocínio Prata',
        'Patrocínio Bronze',
        'Patrocínio de Área',
        'Patrocínio Técnico',
        'Copatrocínio'
      ]
    },
    {
      id: 'recursos_proprios',
      label: 'Recursos Próprios',
      icon: Coins,
      color: 'green',
      subcategories: [
        'Capital Próprio',
        'Empréstimo',
        'Adiantamento',
        'Outro'
      ]
    },
    {
      id: 'bilheteria',
      label: 'Bilheteria',
      icon: Receipt,
      color: 'teal',
      subcategories: [
        'Ingressos Antecipados',
        'Ingressos Portaria',
        'Camarotes',
        'Área VIP',
        'Pacotes'
      ]
    },
    {
      id: 'comercializacao',
      label: 'Comercialização',
      icon: Coins,
      color: 'orange',
      subcategories: [
        'Estacionamento',
        'Barracas de Alimentação',
        'Bebidas',
        'Merchandising',
        'Permuta',
        'Outro'
      ]
    }
  ],
  saida: CENTROS_CUSTO.map(cc => ({
    id: cc.id,
    label: cc.label,
    icon: cc.icon,
    color: cc.color,
    subcategories: cc.subcategories
  }))
};

// Tags para prestação de contas (Modalidades de Recurso)
const PRESTACAO_CONTAS_TAGS = [
  { id: 'rouanet', label: 'Lei Rouanet', color: 'purple' },
  { id: 'icms', label: 'ICMS', color: 'blue' },
  { id: 'funarj', label: 'FUNARJ', color: 'green' },
  { id: 'pesagro', label: 'PESAGRO', color: 'orange' },
  { id: 'setur', label: 'SETUR', color: 'teal' },
  { id: 'patrocinio_direto', label: 'Patrocínio Direto', color: 'pink' },
  { id: 'recursos_proprios', label: 'Recursos Próprios', color: 'gray' },
];

interface Props {
  financials: FinancialKPI;
  recentTransactions: Transaction[];
}

// ============ MODAL DE IMPORTAÇÃO ============

interface ImportModalProps {
  onClose: () => void;
  onImport: (transactions: ExtendedTransaction[]) => void;
}

const ImportModal: React.FC<ImportModalProps> = ({ onClose, onImport }) => {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importedCount, setImportedCount] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setSuccess(false);
      setError(null);
    }
  };

  const handleImport = async () => {
    if (!file) return;
    
    setImporting(true);
    setError(null);
    
    try {
      const transactions = await importGenericSpreadsheet(file);
      const extended: ExtendedTransaction[] = transactions.map(t => ({
        ...t,
        transactionType: t.amount >= 0 ? 'entrada' : 'saida',
        tags: [],
      }));
      
      setImportedCount(extended.length);
      onImport(extended);
      setImporting(false);
      setSuccess(true);
      
      setTimeout(onClose, 2500);
    } catch (err: any) {
      setError(err.message || 'Erro ao importar planilha.');
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
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600" title="Fechar">
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <p className="text-lg font-semibold text-green-900">Importação concluída!</p>
            <p className="text-sm text-slate-600 mt-2">
              <strong>{importedCount}</strong> transações importadas.
            </p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <p className="text-lg font-semibold text-red-900">Erro na importação</p>
            <p className="text-sm text-slate-600 mt-2">{error}</p>
            <button 
              onClick={() => setError(null)}
              className="mt-4 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
            >
              Tentar novamente
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-blue-500 transition">
                <Upload className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <label className="cursor-pointer">
                  <span className="text-blue-600 font-semibold hover:text-blue-700">
                    Clique para selecionar
                  </span>
                  <span className="text-slate-600"> ou arraste o arquivo</span>
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

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleImport}
                disabled={!file || importing}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

// ============ MODAL DE EDIÇÃO/CRIAÇÃO ============

interface TransactionModalProps {
  transaction?: ExtendedTransaction | null;
  onClose: () => void;
  onSave: (transaction: ExtendedTransaction) => void;
}

const TransactionModal: React.FC<TransactionModalProps> = ({ transaction, onClose, onSave }) => {
  const isEditing = !!transaction;
  
  const [type, setType] = useState<TransactionType>(transaction?.transactionType || 'saida');
  const [description, setDescription] = useState(transaction?.description || '');
  const [amount, setAmount] = useState(Math.abs(transaction?.amount || 0).toString());
  const [date, setDate] = useState(transaction?.date || new Date().toISOString().split('T')[0]);
  const [categoryId, setCategoryId] = useState(transaction?.category || '');
  const [subcategory, setSubcategory] = useState(transaction?.subcategory || '');
  const [tags, setTags] = useState<string[]>(transaction?.tags || []);
  const [supplier, setSupplier] = useState(transaction?.supplier || '');
  const [invoiceNumber, setInvoiceNumber] = useState(transaction?.invoiceNumber || '');
  const [notes, setNotes] = useState(transaction?.notes || '');

  const categories = CATEGORIES[type];
  const selectedCategory = categories.find(c => c.id === categoryId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const amountValue = parseFloat(amount) || 0;
    const finalAmount = type === 'entrada' ? Math.abs(amountValue) : -Math.abs(amountValue);
    
    const newTransaction: ExtendedTransaction = {
      id: transaction?.id || `tx-${Date.now()}`,
      description,
      amount: finalAmount,
      date,
      category: categoryId,
      subcategory,
      source: 'manual',
      transactionType: type,
      tags,
      supplier,
      invoiceNumber,
      notes,
    };
    
    onSave(newTransaction);
    onClose();
  };

  const toggleTag = (tagId: string) => {
    setTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(t => t !== tagId)
        : [...prev, tagId]
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex justify-between items-center">
          <h3 className="text-xl font-bold text-slate-900">
            {isEditing ? '✏️ Editar Transação' : '➕ Nova Transação'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600" title="Fechar">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Tipo: Entrada/Saída */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Tipo</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => { setType('entrada'); setCategoryId(''); setSubcategory(''); }}
                className={`p-4 rounded-lg border-2 flex items-center justify-center gap-2 transition ${
                  type === 'entrada' 
                    ? 'border-green-500 bg-green-50 text-green-700' 
                    : 'border-slate-200 text-slate-600 hover:border-green-300'
                }`}
              >
                <TrendingUp className="w-5 h-5" />
                <span className="font-semibold">Entrada</span>
              </button>
              <button
                type="button"
                onClick={() => { setType('saida'); setCategoryId(''); setSubcategory(''); }}
                className={`p-4 rounded-lg border-2 flex items-center justify-center gap-2 transition ${
                  type === 'saida' 
                    ? 'border-red-500 bg-red-50 text-red-700' 
                    : 'border-slate-200 text-slate-600 hover:border-red-300'
                }`}
              >
                <TrendingDown className="w-5 h-5" />
                <span className="font-semibold">Saída</span>
              </button>
            </div>
          </div>

          {/* Valor e Data */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Valor (R$)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-semibold"
                placeholder="0,00"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Data</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Descrição</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ex: Cachê DJ Alok, Patrocínio Brahma..."
              required
            />
          </div>

          {/* Categoria */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Categoria</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = categoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => { setCategoryId(cat.id); setSubcategory(''); }}
                    className={`p-3 rounded-lg border-2 flex items-center gap-2 transition text-sm ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-medium">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Subcategoria */}
          {selectedCategory && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Subcategoria</label>
              <select
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Selecione...</option>
                {selectedCategory.subcategories.map((sub) => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>
          )}

          {/* Tags de Prestação de Contas */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              <Tag className="w-4 h-4 inline mr-1" />
              Tags de Prestação de Contas
            </label>
            <p className="text-xs text-slate-500 mb-3">
              Marque para incluir nos relatórios de contrapartida
            </p>
            <div className="flex flex-wrap gap-2">
              {PRESTACAO_CONTAS_TAGS.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                    tags.includes(tag.id)
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tag.label}
                </button>
              ))}
            </div>
          </div>

          {/* Informações Adicionais */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Fornecedor/Pagador</label>
              <input
                type="text"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nome da empresa/pessoa"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Nº Nota Fiscal</label>
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ex: NF-001234"
              />
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Observações</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Detalhes adicionais, referências, etc."
            />
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`flex-1 px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 ${
                type === 'entrada'
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              <Save className="w-5 h-5" />
              {isEditing ? 'Salvar Alterações' : 'Registrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ============ COMPONENTE PRINCIPAL ============

export const FinanceViewSimple: React.FC<Props> = ({ financials, recentTransactions }) => {
  const [showImportModal, setShowImportModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<ExtendedTransaction | null>(null);
  const [transactions, setTransactions] = useState<ExtendedTransaction[]>(
    recentTransactions.map(t => ({
      ...t,
      transactionType: t.amount >= 0 ? 'entrada' : 'saida',
      tags: [],
    }))
  );
  
  // Filtros
  const [filterType, setFilterType] = useState<'all' | 'entrada' | 'saida'>('all');
  const [filterTag, setFilterTag] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  // Cálculos dinâmicos
  const totalEntradas = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
  const totalSaidas = Math.abs(transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0));
  const saldoAtual = totalEntradas - totalSaidas;

  // Filtrar transações
  const filteredTransactions = transactions.filter(t => {
    if (filterType !== 'all' && t.transactionType !== filterType) return false;
    if (filterTag && !t.tags.includes(filterTag)) return false;
    if (searchTerm && !t.description.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const handleImportTransactions = (newTransactions: ExtendedTransaction[]) => {
    setTransactions([...newTransactions, ...transactions]);
  };

  const handleSaveTransaction = (transaction: ExtendedTransaction) => {
    setTransactions(prev => {
      const exists = prev.find(t => t.id === transaction.id);
      if (exists) {
        return prev.map(t => t.id === transaction.id ? transaction : t);
      }
      return [transaction, ...prev];
    });
    setEditingTransaction(null);
  };

  const handleEditTransaction = (transaction: ExtendedTransaction) => {
    setEditingTransaction(transaction);
    setShowTransactionModal(true);
  };

  const handleDeleteTransaction = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta transação?')) {
      setTransactions(prev => prev.filter(t => t.id !== id));
    }
  };

  const handleExportByTag = (tagId: string) => {
    const taggedTransactions = transactions.filter(t => t.tags.includes(tagId));
    const tag = PRESTACAO_CONTAS_TAGS.find(t => t.id === tagId);
    
    if (taggedTransactions.length === 0) {
      alert(`Nenhuma transação com a tag "${tag?.label}" encontrada.`);
      return;
    }

    const projectInfo = {
      projectName: 'Meu Evento Cultural',
      culturalArea: 'Música e Dança',
      actionLine: 'Exposições, Mostras, Manifestações Culturais',
      production: 'Produção Cultural Nacional',
      proponent: 'Sua Empresa Ltda',
      email: 'contato@evento.com',
      phone: '(11) 99999-9999',
    };
    
    const blob = exportLeiIncentivoSpreadsheet(taggedTransactions, projectInfo);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Prestacao_${tag?.label.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getCategoryLabel = (categoryId: string, type: TransactionType) => {
    const categories = CATEGORIES[type];
    const cat = categories.find(c => c.id === categoryId);
    return cat?.label || categoryId;
  };

  return (
    <div className="space-y-6">
      {/* KPIs Resumo */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
          <DollarSign className="w-6 h-6 text-blue-600" />
          Controle Financeiro
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-slate-600 mb-1">Orçamento Total</p>
            <p className="text-2xl font-bold text-blue-900">{formatCurrency(financials.budgetTotal)}</p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
            <p className="text-sm text-green-700 mb-1 font-medium">Total Entradas</p>
            <p className="text-2xl font-bold text-green-900">{formatCurrency(totalEntradas)}</p>
          </div>
          
          <div className="bg-red-50 p-4 rounded-lg border-2 border-red-200">
            <p className="text-sm text-red-700 mb-1 font-medium">Total Saídas</p>
            <p className="text-2xl font-bold text-red-900">{formatCurrency(totalSaidas)}</p>
          </div>
          
          <div className={`p-4 rounded-lg border-2 ${saldoAtual >= 0 ? 'bg-emerald-50 border-emerald-300' : 'bg-orange-50 border-orange-300'}`}>
            <p className="text-sm text-slate-600 mb-1">Saldo Atual</p>
            <p className={`text-2xl font-bold ${saldoAtual >= 0 ? 'text-emerald-900' : 'text-orange-900'}`}>
              {formatCurrency(saldoAtual)}
            </p>
          </div>
        </div>

        {/* Barra de Progresso */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-600">Utilização do Orçamento</span>
            <span className="font-semibold text-slate-900">
              {((totalSaidas / financials.budgetTotal) * 100).toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all ${
                totalSaidas / financials.budgetTotal > 0.9 ? 'bg-red-500' : 
                totalSaidas / financials.budgetTotal > 0.7 ? 'bg-yellow-500' : 'bg-blue-600'
              }`}
              style={{ width: `${Math.min((totalSaidas / financials.budgetTotal) * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Ações Rápidas */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Ações Rápidas</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button 
            onClick={() => { setEditingTransaction(null); setShowTransactionModal(true); }}
            className="p-4 border-2 border-blue-500 bg-blue-50 rounded-lg hover:bg-blue-100 transition text-left"
          >
            <div className="flex items-center gap-2 mb-1">
              <Plus className="w-5 h-5 text-blue-700" />
              <p className="font-semibold text-blue-900">Nova Transação</p>
            </div>
            <p className="text-sm text-blue-700">Entrada ou saída</p>
          </button>
          
          <button 
            onClick={() => setShowImportModal(true)}
            className="p-4 border-2 border-green-500 bg-green-50 rounded-lg hover:bg-green-100 transition text-left"
          >
            <div className="flex items-center gap-2 mb-1">
              <Upload className="w-5 h-5 text-green-700" />
              <p className="font-semibold text-green-900">Importar Planilha</p>
            </div>
            <p className="text-sm text-green-700">Excel ou CSV</p>
          </button>
          
          <div className="relative group">
            <button className="w-full p-4 border-2 border-orange-500 bg-orange-50 rounded-lg hover:bg-orange-100 transition text-left">
              <div className="flex items-center gap-2 mb-1">
                <FileText className="w-5 h-5 text-orange-700" />
                <p className="font-semibold text-orange-900">Prestação de Contas</p>
              </div>
              <p className="text-sm text-orange-700">Por tag/incentivo</p>
            </button>
            
            {/* Dropdown de tags */}
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              {PRESTACAO_CONTAS_TAGS.map((tag) => {
                const count = transactions.filter(t => t.tags.includes(tag.id)).length;
                return (
                  <button
                    key={tag.id}
                    onClick={() => handleExportByTag(tag.id)}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex justify-between items-center"
                  >
                    <span>{tag.label}</span>
                    <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>
          
          <button className="p-4 border-2 border-slate-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition text-left">
            <div className="flex items-center gap-2 mb-1">
              <Download className="w-5 h-5 text-purple-700" />
              <p className="font-semibold text-slate-900">Exportar Tudo</p>
            </div>
            <p className="text-sm text-slate-500">PDF ou Excel</p>
          </button>
        </div>
      </div>

      {/* Filtros e Lista de Transações */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-slate-600" />
            Transações ({filteredTransactions.length})
          </h3>
          
          {/* Filtros */}
          <div className="flex flex-wrap gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm w-48"
              />
            </div>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'all' | 'entrada' | 'saida')}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
            >
              <option value="all">Todos</option>
              <option value="entrada">Entradas</option>
              <option value="saida">Saídas</option>
            </select>
            
            <select
              value={filterTag}
              onChange={(e) => setFilterTag(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
            >
              <option value="">Todas as tags</option>
              {PRESTACAO_CONTAS_TAGS.map(tag => (
                <option key={tag.id} value={tag.id}>{tag.label}</option>
              ))}
            </select>
          </div>
        </div>
        
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12">
            <DollarSign className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">Nenhuma transação encontrada.</p>
            <button
              onClick={() => { setEditingTransaction(null); setShowTransactionModal(true); }}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Adicionar Primeira Transação
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTransactions.map((transaction) => (
              <div 
                key={transaction.id}
                className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition group"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    transaction.amount > 0 ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {transaction.amount > 0 ? (
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate">{transaction.description}</p>
                    <p className="text-sm text-slate-500">
                      {transaction.date} • {getCategoryLabel(transaction.category, transaction.transactionType)}
                      {transaction.subcategory && ` • ${transaction.subcategory}`}
                    </p>
                    {transaction.tags.length > 0 && (
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {transaction.tags.map(tagId => {
                          const tag = PRESTACAO_CONTAS_TAGS.find(t => t.id === tagId);
                          return tag ? (
                            <span 
                              key={tagId}
                              className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full"
                            >
                              {tag.label}
                            </span>
                          ) : null;
                        })}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className={`text-lg font-bold ${
                      transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                    </p>
                    {transaction.supplier && (
                      <p className="text-xs text-slate-500">{transaction.supplier}</p>
                    )}
                  </div>
                  
                  {/* Botões de Ação */}
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={() => handleEditTransaction(transaction)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteTransaction(transaction.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modais */}
      {showImportModal && (
        <ImportModal 
          onClose={() => setShowImportModal(false)}
          onImport={handleImportTransactions}
        />
      )}
      
      {showTransactionModal && (
        <TransactionModal
          transaction={editingTransaction}
          onClose={() => { setShowTransactionModal(false); setEditingTransaction(null); }}
          onSave={handleSaveTransaction}
        />
      )}
    </div>
  );
};
