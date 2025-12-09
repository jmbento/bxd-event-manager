const XLSX = require('xlsx');

const workbook = XLSX.readFile('planilhas/1 - Planilha  Orçamentária.xlsx');
console.log('📊 PLANILHA ANALISADA:\n');
console.log('Abas disponíveis:', workbook.SheetNames);
console.log('\n' + '='.repeat(80) + '\n');

workbook.SheetNames.forEach((sheetName) => {
  console.log(`\n📄 ABA: ${sheetName}`);
  console.log('-'.repeat(80));
  
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
  
  console.log(`Linhas: ${data.length}`);
  
  if (data.length > 0) {
    console.log('\nCABEÇALHO (primeiras 3 linhas):');
    data.slice(0, 3).forEach((row, i) => {
      console.log(`Linha ${i + 1}:`, row);
    });
    
    if (data.length > 5) {
      console.log('\nEXEMPLO DE DADOS (linhas 4-6):');
      data.slice(3, 6).forEach((row, i) => {
        console.log(`Linha ${i + 4}:`, row);
      });
    }
  }
  
  console.log('\n' + '='.repeat(80));
});

console.log('\n✅ Análise concluída!');
