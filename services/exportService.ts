import * as XLSX from 'xlsx';
import { notifyError, notifySuccess } from './notificationService';

interface ExportSheet {
  name: string;
  data: Record<string, unknown>[];
}

const sanitizeFileName = (baseName: string) => {
  return baseName
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '')
    || 'export';
};

export const exportToXLSX = (fileName: string, sheets: ExportSheet[]) => {
  const validSheets = sheets.filter((sheet) => Array.isArray(sheet.data) && sheet.data.length > 0);

  if (validSheets.length === 0) {
    notifyError('Nenhum dado disponível para exportar. Ajuste os filtros ou tente novamente.');
    return;
  }

  try {
    const workbook = XLSX.utils.book_new();

    validSheets.forEach((sheet) => {
      const worksheet = XLSX.utils.json_to_sheet(sheet.data);
      XLSX.utils.book_append_sheet(workbook, worksheet, sheet.name.slice(0, 31));
    });

    const formattedName = sanitizeFileName(fileName);
    const timestamp = new Date().toISOString().slice(0, 10);
    const fullFileName = `${formattedName}-${timestamp}.xlsx`;

    XLSX.writeFile(workbook, fullFileName);
    notifySuccess(`Arquivo ${fullFileName} gerado com sucesso.`);
  } catch (error) {
    console.error('Export error', error);
    notifyError('Não foi possível gerar o arquivo. Tente novamente em instantes.');
  }
};
