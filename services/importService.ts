import * as XLSX from 'xlsx';
import { toast } from 'react-hot-toast';

export interface ImportedTransaction {
  date: string;
  description: string;
  amount: number;
  category: string;
  source: string;
  type: 'income' | 'expense';
  assetLinked?: string;
  notes?: string;
}

export interface ColumnMapping {
  date?: string;
  description?: string;
  amount?: string;
  category?: string;
  source?: string;
  type?: string;
  assetLinked?: string;
  notes?: string;
}

export interface ImportPreview {
  headers: string[];
  data: any[][];
  totalRows: number;
  validRows: number;
  errors: ImportError[];
}

export interface ImportError {
  row: number;
  column?: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ImportConfig {
  skipRows: number;
  dateFormat: string;
  currencyColumn: string;
  categoryMapping: Record<string, string>;
  defaultCategory: string;
  defaultSource: string;
}

const DEFAULT_CATEGORIES = [
  'Marketing Digital',
  'Material Gráfico',
  'Eventos',
  'Combustível',
  'Alimentação',
  'Pessoal',
  'Jurídico',
  'Consultoria',
  'Transporte',
  'Comunicação',
  'Outros'
];

const DEFAULT_SOURCES = [
  'Caixa',
  'Banco',
  'Cartão',
  'PIX',
  'Transferência',
  'Patrocínio',
  'Incentivo',
  'Outros'
];

// Detecta automaticamente o formato de data
const detectDateFormat = (sample: string): string => {
  const formats = [
    { pattern: /^\d{2}\/\d{2}\/\d{4}$/, format: 'DD/MM/YYYY' },
    { pattern: /^\d{4}-\d{2}-\d{2}$/, format: 'YYYY-MM-DD' },
    { pattern: /^\d{2}-\d{2}-\d{4}$/, format: 'DD-MM-YYYY' },
    { pattern: /^\d{2}\/\d{2}\/\d{2}$/, format: 'DD/MM/YY' },
  ];

  for (const { pattern, format } of formats) {
    if (pattern.test(sample)) {
      return format;
    }
  }
  return 'DD/MM/YYYY';
};

// Converte string de data para formato ISO
const parseDate = (dateStr: string, format: string): string => {
  if (!dateStr) return '';
  
  try {
    let day: string, month: string, year: string;
    
    switch (format) {
      case 'DD/MM/YYYY':
        [day, month, year] = dateStr.split('/');
        break;
      case 'DD-MM-YYYY':
        [day, month, year] = dateStr.split('-');
        break;
      case 'YYYY-MM-DD':
        [year, month, day] = dateStr.split('-');
        break;
      case 'DD/MM/YY':
        [day, month, year] = dateStr.split('/');
        year = `20${year}`;
        break;
      default:
        return dateStr;
    }

    const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    return new Date(isoDate).toISOString().split('T')[0];
  } catch (error) {
    return '';
  }
};

// Limpa e converte valor monetário
const parseAmount = (amountStr: string): number => {
  if (!amountStr) return 0;
  
  // Remove símbolos de moeda, espaços e caracteres especiais
  const cleaned = amountStr
    .toString()
    .replace(/[R$\s.]/g, '')
    .replace(',', '.');
  
  const amount = parseFloat(cleaned);
  return isNaN(amount) ? 0 : Math.abs(amount);
};

// Detecta se é entrada ou saída baseado no valor ou contexto
const detectTransactionType = (amount: number, description: string, category: string): 'income' | 'expense' => {
  const incomeKeywords = ['receita', 'patrocínio', 'ingresso', 'entrada', 'recebimento', 'incentivo'];
  const text = (description + ' ' + category).toLowerCase();
  
  if (incomeKeywords.some(keyword => text.includes(keyword))) {
    return 'income';
  }
  
  return 'expense';
};

// Lê arquivo Excel ou CSV
export const readFile = async (file: File): Promise<ImportPreview> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        let workbook: XLSX.WorkBook;
        
        if (file.name.endsWith('.csv')) {
          workbook = XLSX.read(data, { type: 'binary' });
        } else {
          workbook = XLSX.read(data, { type: 'array' });
        }
        
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as any[][];
        
        if (jsonData.length === 0) {
          reject(new Error('Planilha vazia'));
          return;
        }
        
        const headers = jsonData[0].map(h => h?.toString() || '');
        const dataRows = jsonData.slice(1);
        
        resolve({
          headers,
          data: dataRows,
          totalRows: dataRows.length,
          validRows: dataRows.filter(row => row.some(cell => cell)).length,
          errors: []
        });
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
    
    if (file.name.endsWith('.csv')) {
      reader.readAsBinaryString(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  });
};

// Sugere mapeamento automático de colunas
export const suggestColumnMapping = (headers: string[]): ColumnMapping => {
  const mapping: ColumnMapping = {};
  
  headers.forEach((header, index) => {
    const lowerHeader = header.toLowerCase();
    
    // Data
    if (lowerHeader.includes('data') || lowerHeader.includes('date')) {
      mapping.date = header;
    }
    
    // Descrição
    if (lowerHeader.includes('descrição') || lowerHeader.includes('description') || 
        lowerHeader.includes('histórico') || lowerHeader.includes('memo')) {
      mapping.description = header;
    }
    
    // Valor
    if (lowerHeader.includes('valor') || lowerHeader.includes('amount') || 
        lowerHeader.includes('quantia') || lowerHeader.includes('preço')) {
      mapping.amount = header;
    }
    
    // Categoria
    if (lowerHeader.includes('categoria') || lowerHeader.includes('category') || 
        lowerHeader.includes('tipo') || lowerHeader.includes('classificação')) {
      mapping.category = header;
    }
    
    // Origem/Fonte
    if (lowerHeader.includes('origem') || lowerHeader.includes('source') || 
        lowerHeader.includes('conta') || lowerHeader.includes('banco')) {
      mapping.source = header;
    }
    
    // Observações
    if (lowerHeader.includes('observações') || lowerHeader.includes('notes') || 
        lowerHeader.includes('comentários') || lowerHeader.includes('obs')) {
      mapping.notes = header;
    }
  });
  
  return mapping;
};

// Valida e processa os dados importados
export const processImportedData = (
  preview: ImportPreview,
  mapping: ColumnMapping,
  config: ImportConfig
): { transactions: ImportedTransaction[]; errors: ImportError[] } => {
  const transactions: ImportedTransaction[] = [];
  const errors: ImportError[] = [];
  
  const dataToProcess = preview.data.slice(config.skipRows);
  
  dataToProcess.forEach((row, index) => {
    const rowIndex = index + config.skipRows + 2; // +2 para header e índice base 1
    
    try {
      // Extrai dados baseado no mapeamento
      const dateStr = mapping.date ? row[preview.headers.indexOf(mapping.date)]?.toString() || '' : '';
      const description = mapping.description ? row[preview.headers.indexOf(mapping.description)]?.toString() || '' : `Transação ${rowIndex}`;
      const amountStr = mapping.amount ? row[preview.headers.indexOf(mapping.amount)]?.toString() || '0' : '0';
      const category = mapping.category ? row[preview.headers.indexOf(mapping.category)]?.toString() || config.defaultCategory : config.defaultCategory;
      const source = mapping.source ? row[preview.headers.indexOf(mapping.source)]?.toString() || config.defaultSource : config.defaultSource;
      const notes = mapping.notes ? row[preview.headers.indexOf(mapping.notes)]?.toString() || '' : '';
      
      // Validações
      if (!dateStr) {
        errors.push({
          row: rowIndex,
          column: 'data',
          message: 'Data é obrigatória',
          severity: 'error'
        });
        return;
      }
      
      const date = parseDate(dateStr, config.dateFormat);
      if (!date) {
        errors.push({
          row: rowIndex,
          column: 'data',
          message: 'Formato de data inválido',
          severity: 'error'
        });
        return;
      }
      
      const amount = parseAmount(amountStr);
      if (amount === 0 && amountStr !== '0') {
        errors.push({
          row: rowIndex,
          column: 'valor',
          message: 'Valor inválido ou zero',
          severity: 'warning'
        });
      }
      
      const type = detectTransactionType(amount, description, category);
      
      // Mapeia categoria se configurado
      const finalCategory = config.categoryMapping[category] || category;
      
      transactions.push({
        date,
        description: description.trim(),
        amount,
        category: finalCategory,
        source: source.trim(),
        type,
        notes: notes.trim()
      });
      
    } catch (error) {
      errors.push({
        row: rowIndex,
        message: `Erro ao processar linha: ${error}`,
        severity: 'error'
      });
    }
  });
  
  return { transactions, errors };
};

// Salva transações processadas
export const saveImportedTransactions = async (transactions: ImportedTransaction[]): Promise<boolean> => {
  try {
    // Aqui você integraria com seu sistema de armazenamento (Supabase, etc)
    // Por enquanto, simularemos salvando no localStorage
    const existingTransactions = JSON.parse(localStorage.getItem('importedTransactions') || '[]');
    const updatedTransactions = [...existingTransactions, ...transactions];
    localStorage.setItem('importedTransactions', JSON.stringify(updatedTransactions));
    
    toast.success(`${transactions.length} transações importadas com sucesso!`);
    return true;
  } catch (error) {
    toast.error('Erro ao salvar transações');
    return false;
  }
};

export { DEFAULT_CATEGORIES, DEFAULT_SOURCES };