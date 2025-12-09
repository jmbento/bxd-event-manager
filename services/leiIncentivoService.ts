import * as XLSX from 'xlsx';
import { Transaction } from '../types';

/**
 * Serviço para importação e exportação de planilhas Lei de Incentivo
 * Formato: Planilha Orçamentária com 6 rubricas (PESSOAL, ESTRUTURA, LOGÍSTICA, DIVULGAÇÃO, DESP. ADM, IMPOSTOS)
 */

export type Rubric = 'PESSOAL' | 'ESTRUTURA' | 'LOGÍSTICA' | 'DIVULGAÇÃO' | 'DESPESAS ADMINISTRATIVAS' | 'IMPOSTOS, TAXAS, SEGUROS';

interface BudgetLine {
  item: string;
  description: string;
  rubric: Rubric;
  
  // Orçamento Previsto
  prevQty: number;
  prevUnit: string;
  prevUnitQty: number;
  prevUnitValue: number;
  prevTotal: number;
  prevIncentive: number;
  prevOwnResources: number;
  
  // Orçamento Solicitado/Executado
  execQty?: number;
  execUnit?: string;
  execUnitQty?: number;
  execUnitValue?: number;
  execTotal?: number;
  execIncentive?: number;
  execOwnResources?: number;
}

interface ProjectInfo {
  projectName: string;
  culturalArea: string;
  actionLine: string;
  production: string;
  proponent: string;
  email: string;
  phone: string;
}

/**
 * Importa planilha Lei de Incentivo (formato .xlsx)
 * Retorna transações estruturadas com todos os campos necessários
 */
export const importLeiIncentivoSpreadsheet = async (file: File): Promise<Transaction[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Ler aba "PLANILHA"
        const worksheet = workbook.Sheets['PLANILHA'];
        if (!worksheet) {
          reject(new Error('Aba "PLANILHA" não encontrada'));
          return;
        }
        
        const sheetData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' }) as any[][];
        
        // Extrair informações do projeto (linhas 1-5)
        const projectInfo: ProjectInfo = {
          projectName: sheetData[0]?.[2] || '',
          culturalArea: sheetData[1]?.[2] || '',
          actionLine: sheetData[2]?.[2] || '',
          production: sheetData[2]?.[8] || '',
          proponent: sheetData[3]?.[2] || '',
          email: sheetData[4]?.[2] || '',
          phone: sheetData[4]?.[8] || '',
        };
        
        // Processar linhas de orçamento (a partir da linha 8)
        const transactions: Transaction[] = [];
        let currentRubric: Rubric = 'PESSOAL';
        
        for (let i = 9; i < sheetData.length; i++) {
          const row = sheetData[i];
          
          // Detectar mudança de rubrica
          if (row[0] && row[1]) {
            const rubricText = String(row[1]).toUpperCase();
            if (rubricText.includes('PESSOAL')) currentRubric = 'PESSOAL';
            else if (rubricText.includes('ESTRUTURA')) currentRubric = 'ESTRUTURA';
            else if (rubricText.includes('LOGÍSTICA')) currentRubric = 'LOGÍSTICA';
            else if (rubricText.includes('DIVULGAÇÃO') || rubricText.includes('MÍDIA')) currentRubric = 'DIVULGAÇÃO';
            else if (rubricText.includes('ADMINISTRATIVAS')) currentRubric = 'DESPESAS ADMINISTRATIVAS';
            else if (rubricText.includes('IMPOSTOS') || rubricText.includes('TAXAS')) currentRubric = 'IMPOSTOS, TAXAS, SEGUROS';
            continue;
          }
          
          // Pular subtotais e linhas vazias
          if (!row[2] || String(row[0]).includes('SUBTOTAL') || String(row[0]).includes('TOTAL')) {
            continue;
          }
          
          // Extrair dados da linha
          const description = String(row[2] || '').trim();
          if (!description) continue;
          
          const prevQty = Number(row[3]) || 0;
          const prevUnit = String(row[4] || '');
          const prevUnitQty = Number(row[5]) || 0;
          const prevUnitValue = Number(row[6]) || 0;
          const prevTotal = Number(row[7]) || 0;
          const prevIncentive = Number(row[8]) || 0;
          const prevOwnResources = Number(row[9]) || 0;
          
          const execQty = Number(row[10]) || undefined;
          const execUnit = String(row[11] || '') || undefined;
          const execUnitQty = Number(row[12]) || undefined;
          const execUnitValue = Number(row[13]) || undefined;
          const execTotal = Number(row[14]) || undefined;
          const execIncentive = Number(row[15]) || undefined;
          const execOwnResources = Number(row[16]) || undefined;
          
          // Criar transação
          const transaction: Transaction = {
            id: `import-${Date.now()}-${i}`,
            description,
            amount: -(execTotal || prevTotal), // Negativo = despesa
            date: new Date().toISOString().split('T')[0],
            category: currentRubric,
            source: 'manual',
            rubric: currentRubric,
            budgetItem: description,
            
            // Orçamento previsto
            quantity: prevQty,
            unit: prevUnit,
            unitQuantity: prevUnitQty,
            unitValue: prevUnitValue,
            incentiveValue: prevIncentive,
            ownResourcesValue: prevOwnResources,
            
            // Valores executados (se existirem)
            ...(execTotal && {
              netAmount: execTotal,
              taxRetention: {
                inss: execTotal * 0.11,
                irrf: execTotal * 0.015,
                iss: execTotal * 0.05,
              },
            }),
          };
          
          transactions.push(transaction);
        }
        
        console.log(`✅ Importados ${transactions.length} itens da planilha Lei de Incentivo`);
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
 * Exporta transações para planilha Lei de Incentivo
 * Gera arquivo .xlsx no formato exigido para prestação de contas
 */
export const exportLeiIncentivoSpreadsheet = (
  transactions: Transaction[],
  projectInfo: ProjectInfo
): Blob => {
  const workbook = XLSX.utils.book_new();
  
  // Criar dados da planilha
  const sheetData: any[][] = [];
  
  // Cabeçalho (linhas 1-5)
  sheetData.push(['NOME DO PROJETO:', '', projectInfo.projectName]);
  sheetData.push(['ÁREA CULTURAL:', '', projectInfo.culturalArea]);
  sheetData.push(['LINHA DE AÇÃO:', '', projectInfo.actionLine, '', '', '', 'PRODUÇÃO:', '', projectInfo.production]);
  sheetData.push(['PROPONENTE:', '', projectInfo.proponent]);
  sheetData.push(['E-MAIL:', '', projectInfo.email, '', '', '', 'TELEFONE:', '', projectInfo.phone]);
  sheetData.push([]); // Linha vazia
  
  // Cabeçalhos das colunas
  sheetData.push(['', '', '', 'APRESENTADO', '', '', '', '', '', '', 'SOLICITADO']);
  sheetData.push([
    'ITEM', 'DESCRIÇÃO', 'PREVISTO NO ORÇAMENTO',
    'QTD', 'UNIDADE', 'QTD DE UNIDADE', 'VALOR UNITÁRIO (R$)', 'TOTAL DA LINHA', 'VALOR PATROCINADO', 'RECURSOS PRÓPRIOS',
    'QTD', 'UNIDADE', 'QTD DE UNIDADE', 'VALOR UNIT (R$)', 'TOTAL DA LINHA', 'VALOR PATROCINADO', 'RECURSOS PRÓPRIOS'
  ]);
  sheetData.push([]); // Linha vazia
  
  // Agrupar por rubrica
  const rubricas: Rubric[] = ['PESSOAL', 'ESTRUTURA', 'LOGÍSTICA', 'DIVULGAÇÃO', 'DESPESAS ADMINISTRATIVAS', 'IMPOSTOS, TAXAS, SEGUROS'];
  
  let itemNumber = 1;
  rubricas.forEach((rubric) => {
    const rubricTransactions = transactions.filter(t => t.rubric === rubric);
    
    if (rubricTransactions.length > 0) {
      // Cabeçalho da rubrica
      sheetData.push([itemNumber, rubric]);
      itemNumber++;
      
      // Linhas de transações
      rubricTransactions.forEach((t) => {
        sheetData.push([
          '', // Item (vazio)
          t.budgetItem || t.description,
          t.description,
          t.quantity || 0,
          t.unit || '',
          t.unitQuantity || 0,
          t.unitValue || 0,
          Math.abs(t.amount),
          t.incentiveValue || 0,
          t.ownResourcesValue || 0,
          t.quantity || 0,
          t.unit || '',
          t.unitQuantity || 0,
          t.unitValue || 0,
          t.netAmount || Math.abs(t.amount),
          t.incentiveValue || 0,
          t.ownResourcesValue || 0,
        ]);
      });
      
      // Subtotal
      const subtotal = rubricTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
      sheetData.push([`SUBTOTAL ${rubric}`, '', '', '', '', '', '', subtotal, '', '', '', '', '', '', subtotal]);
      sheetData.push([]); // Linha vazia
    }
  });
  
  // Total geral
  const totalGeral = transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
  sheetData.push(['TOTAL DO PROJETO', '', '', '', '', '', '', totalGeral, '', '', '', '', '', '', totalGeral]);
  sheetData.push([]);
  sheetData.push(['PROPONENTE', '', '', '', 'DATA', '', '', 'ASSINATURA DO PROPONENTE']);
  
  // Criar worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
  
  // Adicionar ao workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'PLANILHA');
  
  // Gerar arquivo
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
};

/**
 * Calcula totais por rubrica para relatórios
 */
export const calculateRubricTotals = (transactions: Transaction[]) => {
  const rubricas: Rubric[] = ['PESSOAL', 'ESTRUTURA', 'LOGÍSTICA', 'DIVULGAÇÃO', 'DESPESAS ADMINISTRATIVAS', 'IMPOSTOS, TAXAS, SEGUROS'];
  
  return rubricas.map(rubric => {
    const rubricTransactions = transactions.filter(t => t.rubric === rubric);
    const total = rubricTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const incentive = rubricTransactions.reduce((sum, t) => sum + (t.incentiveValue || 0), 0);
    const ownResources = rubricTransactions.reduce((sum, t) => sum + (t.ownResourcesValue || 0), 0);
    
    return {
      rubric,
      total,
      incentive,
      ownResources,
      count: rubricTransactions.length,
    };
  });
};
