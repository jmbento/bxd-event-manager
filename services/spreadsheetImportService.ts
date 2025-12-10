import * as XLSX from 'xlsx';
import { Transaction } from '../types';

/**
 * Serviço de importação genérica de planilhas
 * Detecta automaticamente o formato e estrutura das colunas
 */

interface ColumnMapping {
  date?: number;
  description?: number;
  amount?: number;
  category?: number;
  type?: number; // entrada/saída
  quantity?: number;
  unitValue?: number;
}

/**
 * Detecta automaticamente as colunas da planilha baseado nos cabeçalhos
 */
const detectColumns = (headers: string[]): ColumnMapping => {
  const mapping: ColumnMapping = {};
  
  headers.forEach((header, index) => {
    const h = String(header || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    
    // Data
    if (h.includes('data') || h.includes('date') || h.includes('vencimento') || h.includes('emissao')) {
      mapping.date = index;
    }
    // Descrição
    else if (h.includes('descricao') || h.includes('description') || h.includes('historico') || 
             h.includes('item') || h.includes('nome') || h.includes('produto') || h.includes('servico')) {
      mapping.description = index;
    }
    // Valor
    else if (h.includes('valor') || h.includes('value') || h.includes('total') || 
             h.includes('amount') || h.includes('preco') || h.includes('custo')) {
      mapping.amount = index;
    }
    // Categoria
    else if (h.includes('categoria') || h.includes('category') || h.includes('tipo') || 
             h.includes('rubrica') || h.includes('grupo') || h.includes('classe')) {
      mapping.category = index;
    }
    // Tipo (entrada/saída)
    else if (h.includes('entrada') || h.includes('saida') || h.includes('credito') || 
             h.includes('debito') || h.includes('tipo') || h.includes('natureza')) {
      mapping.type = index;
    }
    // Quantidade
    else if (h.includes('qtd') || h.includes('quantidade') || h.includes('qty') || h.includes('unidades')) {
      mapping.quantity = index;
    }
    // Valor unitário
    else if (h.includes('unitario') || h.includes('unit') || h.includes('un.')) {
      mapping.unitValue = index;
    }
  });
  
  return mapping;
};

/**
 * Converte valor string para número
 */
const parseAmount = (value: any): number => {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  
  let str = String(value)
    .replace(/[R$\s]/g, '')
    .replace(/\./g, '')  // Remove pontos de milhar
    .replace(',', '.');  // Converte vírgula decimal para ponto
  
  // Remove parênteses (valor negativo no formato contábil)
  if (str.includes('(') && str.includes(')')) {
    str = '-' + str.replace(/[()]/g, '');
  }
  
  return parseFloat(str) || 0;
};

/**
 * Converte data para formato ISO
 */
const parseDate = (value: any): string => {
  if (!value) return new Date().toISOString().split('T')[0];
  
  // Se for número (Excel serial date)
  if (typeof value === 'number') {
    const date = XLSX.SSF.parse_date_code(value);
    if (date) {
      return `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`;
    }
  }
  
  // Se for string
  const str = String(value);
  
  // Formato DD/MM/YYYY
  const brMatch = str.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (brMatch) {
    return `${brMatch[3]}-${brMatch[2].padStart(2, '0')}-${brMatch[1].padStart(2, '0')}`;
  }
  
  // Formato YYYY-MM-DD
  const isoMatch = str.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    return str.substring(0, 10);
  }
  
  return new Date().toISOString().split('T')[0];
};

/**
 * Determina se o valor é uma despesa (negativo)
 */
const isExpense = (row: any[], mapping: ColumnMapping, amount: number): boolean => {
  // Se tem coluna de tipo, verificar
  if (mapping.type !== undefined) {
    const typeValue = String(row[mapping.type] || '').toLowerCase();
    if (typeValue.includes('saida') || typeValue.includes('despesa') || 
        typeValue.includes('debito') || typeValue.includes('pagamento')) {
      return true;
    }
    if (typeValue.includes('entrada') || typeValue.includes('receita') || 
        typeValue.includes('credito') || typeValue.includes('recebimento')) {
      return false;
    }
  }
  
  // Se valor já é negativo, é despesa
  if (amount < 0) return true;
  
  // Por padrão, assumir despesa
  return true;
};

/**
 * Importa qualquer planilha Excel ou CSV
 */
export const importGenericSpreadsheet = async (file: File): Promise<Transaction[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array', cellDates: true });
        
        // Pegar primeira aba (ou aba com dados)
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Converter para array de arrays
        const rows = XLSX.utils.sheet_to_json(worksheet, { 
          header: 1, 
          defval: '',
          raw: false 
        }) as any[][];
        
        if (rows.length < 2) {
          reject(new Error('Planilha vazia ou sem dados suficientes'));
          return;
        }
        
        // Encontrar linha de cabeçalho (primeira linha com texto)
        let headerRow = 0;
        for (let i = 0; i < Math.min(10, rows.length); i++) {
          const row = rows[i];
          const textCells = row.filter(cell => cell && String(cell).trim().length > 0);
          if (textCells.length >= 2) {
            headerRow = i;
            break;
          }
        }
        
        const headers = rows[headerRow].map(h => String(h || ''));
        const mapping = detectColumns(headers);
        
        console.log('📊 Colunas detectadas:', mapping);
        console.log('📊 Cabeçalhos:', headers);
        
        // Se não encontrou colunas essenciais, tentar usar posições padrão
        if (mapping.description === undefined) {
          // Procurar primeira coluna com texto
          for (let i = 0; i < headers.length; i++) {
            if (headers[i] && !mapping.date && !mapping.amount) {
              mapping.description = i;
              break;
            }
          }
        }
        
        if (mapping.amount === undefined) {
          // Procurar primeira coluna com números
          for (let i = 0; i < rows[headerRow + 1]?.length; i++) {
            const val = rows[headerRow + 1][i];
            if (typeof val === 'number' || (val && /[\d,.]/.test(String(val)))) {
              mapping.amount = i;
              break;
            }
          }
        }
        
        // Processar linhas de dados
        const transactions: Transaction[] = [];
        
        for (let i = headerRow + 1; i < rows.length; i++) {
          const row = rows[i];
          
          // Pular linhas vazias
          if (!row || row.every(cell => !cell || String(cell).trim() === '')) {
            continue;
          }
          
          // Pular linhas de total/subtotal
          const firstCell = String(row[0] || '').toLowerCase();
          if (firstCell.includes('total') || firstCell.includes('subtotal') || firstCell.includes('soma')) {
            continue;
          }
          
          // Extrair dados
          const description = mapping.description !== undefined 
            ? String(row[mapping.description] || '').trim()
            : String(row[0] || '').trim();
          
          if (!description || description.length < 2) continue;
          
          let amount = mapping.amount !== undefined 
            ? parseAmount(row[mapping.amount])
            : 0;
          
          // Se quantidade e valor unitário existem, calcular total
          if (amount === 0 && mapping.quantity !== undefined && mapping.unitValue !== undefined) {
            const qty = parseAmount(row[mapping.quantity]);
            const unitVal = parseAmount(row[mapping.unitValue]);
            amount = qty * unitVal;
          }
          
          // Determinar se é despesa
          if (isExpense(row, mapping, amount) && amount > 0) {
            amount = -amount;
          }
          
          const date = mapping.date !== undefined 
            ? parseDate(row[mapping.date])
            : new Date().toISOString().split('T')[0];
          
          const category = mapping.category !== undefined 
            ? String(row[mapping.category] || 'Geral').trim()
            : 'Geral';
          
          const transaction: Transaction = {
            id: `import-${Date.now()}-${i}`,
            description,
            amount,
            date,
            category,
            source: 'manual',
          };
          
          transactions.push(transaction);
        }
        
        console.log(`✅ Importados ${transactions.length} itens da planilha`);
        
        if (transactions.length === 0) {
          reject(new Error('Nenhum dado válido encontrado na planilha. Verifique se há uma coluna de descrição e uma de valor.'));
          return;
        }
        
        resolve(transactions);
        
      } catch (error) {
        console.error('❌ Erro ao processar planilha:', error);
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Exporta transações para Excel
 */
export const exportToExcel = (transactions: Transaction[], filename: string = 'transacoes'): void => {
  const data = transactions.map(t => ({
    'Data': t.date,
    'Descrição': t.description,
    'Valor': t.amount,
    'Categoria': t.category,
    'Origem': t.source,
  }));
  
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Transações');
  
  XLSX.writeFile(workbook, `${filename}.xlsx`);
};
