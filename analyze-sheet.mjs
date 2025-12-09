import XLSX from 'xlsx';

const workbook = XLSX.readFile('planilhas/1 - Planilha  Orçamentária.xlsx');
const worksheet = workbook.Sheets['PLANILHA'];
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

console.log('📊 ESTRUTURA DA ABA "PLANILHA"\n');
console.log('Total de linhas:', data.length);
console.log('\n' + '='.repeat(100) + '\n');

// Mostrar todas as linhas com conteúdo
data.forEach((row, i) => {
  const hasContent = row.some(cell => cell !== '');
  if (hasContent) {
    console.log(`LINHA ${i + 1}:`);
    row.forEach((cell, j) => {
      if (cell !== '') {
        const colLetter = String.fromCharCode(65 + j);
        console.log(`  [${colLetter}] ${cell}`);
      }
    });
    console.log('');
  }
});
