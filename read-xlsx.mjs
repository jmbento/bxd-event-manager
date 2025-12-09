import XLSX from 'xlsx';

const workbook = XLSX.readFile('planilhas/1 - Planilha  Orçamentária.xlsx');
console.log('📊 PLANILHA ANALISADA:\n');
console.log('Abas disponíveis:', workbook.SheetNames);
console.log('\n' + '='.repeat(80) + '\n');

workbook.SheetNames.forEach((sheetName) => {
  console.log(`\n📄 ABA: ${sheetName}`);
  console.log('-'.repeat(80));
  
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
  
  console.log(`Total de linhas: ${data.length}`);
  
  if (data.length > 0) {
    console.log('\n🔍 PRIMEIRAS 5 LINHAS:');
    data.slice(0, 5).forEach((row, i) => {
      console.log(`\nLinha ${i + 1}:`);
      row.forEach((cell, j) => {
        if (cell !== '') console.log(`  Coluna ${String.fromCharCode(65 + j)}: ${cell}`);
      });
    });
  }
  
  console.log('\n' + '='.repeat(80));
});

console.log('\n✅ Análise concluída!');
