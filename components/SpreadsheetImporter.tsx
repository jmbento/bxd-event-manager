import React, { useState, useCallback, useMemo } from 'react';
import { Upload, FileSpreadsheet, AlertCircle, Check, X, Download, Eye } from 'lucide-react';
import { 
  readFile, 
  suggestColumnMapping, 
  processImportedData, 
  saveImportedTransactions,
  DEFAULT_CATEGORIES,
  DEFAULT_SOURCES,
  type ImportPreview,
  type ColumnMapping,
  type ImportConfig,
  type ImportedTransaction,
  type ImportError
} from '../services/importService';

interface SpreadsheetImporterProps {
  onImportComplete?: (transactions: ImportedTransaction[]) => void;
  onClose?: () => void;
}

export const SpreadsheetImporter: React.FC<SpreadsheetImporterProps> = ({ 
  onImportComplete, 
  onClose 
}) => {
  const [step, setStep] = useState<'upload' | 'mapping' | 'preview' | 'processing'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [mapping, setMapping] = useState<ColumnMapping>({});
  const [config, setConfig] = useState<ImportConfig>({
    skipRows: 0,
    dateFormat: 'DD/MM/YYYY',
    currencyColumn: 'BRL',
    categoryMapping: {},
    defaultCategory: 'Outros',
    defaultSource: 'Outros'
  });
  const [processedData, setProcessedData] = useState<{transactions: ImportedTransaction[], errors: ImportError[]} | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileSelect = useCallback(async (selectedFile: File) => {
    setIsLoading(true);
    try {
      const filePreview = await readFile(selectedFile);
      setFile(selectedFile);
      setPreview(filePreview);
      
      // Sugere mapeamento automático
      const suggestedMapping = suggestColumnMapping(filePreview.headers);
      setMapping(suggestedMapping);
      
      // Detecta formato de data se possível
      if (filePreview.data.length > 0 && suggestedMapping.date) {
        const dateColumnIndex = filePreview.headers.indexOf(suggestedMapping.date);
        const sampleDate = filePreview.data[0][dateColumnIndex]?.toString();
        if (sampleDate) {
          // Detecta formato baseado na amostra
          if (sampleDate.includes('/')) {
            setConfig(prev => ({ ...prev, dateFormat: 'DD/MM/YYYY' }));
          } else if (sampleDate.includes('-') && sampleDate.length === 10) {
            setConfig(prev => ({ ...prev, dateFormat: 'YYYY-MM-DD' }));
          }
        }
      }
      
      setStep('mapping');
    } catch (error) {
      console.error('Erro ao ler arquivo:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.name.endsWith('.xlsx') || droppedFile.name.endsWith('.csv'))) {
      handleFileSelect(droppedFile);
    }
  }, [handleFileSelect]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const processData = () => {
    if (!preview) return;
    
    setIsLoading(true);
    try {
      const result = processImportedData(preview, mapping, config);
      setProcessedData(result);
      setStep('preview');
    } catch (error) {
      console.error('Erro ao processar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const confirmImport = async () => {
    if (!processedData) return;
    
    setIsLoading(true);
    setStep('processing');
    
    try {
      const success = await saveImportedTransactions(processedData.transactions);
      if (success) {
        onImportComplete?.(processedData.transactions);
        onClose?.();
      }
    } catch (error) {
      console.error('Erro ao importar:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderUploadStep = () => (
    <div className="p-8">
      <div className="text-center mb-6">
        <FileSpreadsheet className="h-16 w-16 text-blue-500 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-slate-900 mb-2">Importar Planilha de Custos</h2>
        <p className="text-slate-600">
          Faça upload de uma planilha Excel (.xlsx) ou CSV com seus dados financeiros
        </p>
      </div>

      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onDragEnter={(e) => e.preventDefault()}
        className="border-2 border-dashed border-slate-300 rounded-xl p-12 text-center hover:border-blue-400 transition-colors cursor-pointer"
      >
        <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
        <div className="space-y-2">
          <p className="text-lg font-medium text-slate-700">
            Arraste sua planilha aqui ou clique para selecionar
          </p>
          <p className="text-sm text-slate-500">
            Suporta arquivos .xlsx e .csv (máx. 10MB)
          </p>
        </div>
        <input
          type="file"
          accept=".xlsx,.csv"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2">Formato Recomendado:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Coluna de Data (DD/MM/YYYY ou YYYY-MM-DD)</li>
          <li>• Coluna de Descrição</li>
          <li>• Coluna de Valor/Quantia</li>
          <li>• Coluna de Categoria (opcional)</li>
          <li>• Coluna de Origem/Conta (opcional)</li>
        </ul>
      </div>
    </div>
  );

  const renderMappingStep = () => (
    <div className="p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-slate-900 mb-2">Mapeamento de Colunas</h2>
        <p className="text-slate-600">
          Configure como os dados da sua planilha devem ser interpretados
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h3 className="font-semibold text-slate-900 mb-4">Configurações</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Pular linhas no início
              </label>
              <input
                type="number"
                min="0"
                max="10"
                value={config.skipRows}
                onChange={(e) => setConfig(prev => ({ ...prev, skipRows: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Formato de Data
              </label>
              <select
                value={config.dateFormat}
                onChange={(e) => setConfig(prev => ({ ...prev, dateFormat: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="DD-MM-YYYY">DD-MM-YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                <option value="DD/MM/YY">DD/MM/YY</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Categoria Padrão
              </label>
              <select
                value={config.defaultCategory}
                onChange={(e) => setConfig(prev => ({ ...prev, defaultCategory: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {DEFAULT_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Origem Padrão
              </label>
              <select
                value={config.defaultSource}
                onChange={(e) => setConfig(prev => ({ ...prev, defaultSource: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {DEFAULT_SOURCES.map(source => (
                  <option key={source} value={source}>{source}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-slate-900 mb-4">Mapeamento de Colunas</h3>
          
          <div className="space-y-4">
            {[
              { key: 'date', label: 'Data *', required: true },
              { key: 'description', label: 'Descrição', required: false },
              { key: 'amount', label: 'Valor *', required: true },
              { key: 'category', label: 'Categoria', required: false },
              { key: 'source', label: 'Origem/Conta', required: false },
              { key: 'notes', label: 'Observações', required: false }
            ].map(({ key, label, required }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {label}
                </label>
                <select
                  value={mapping[key as keyof ColumnMapping] || ''}
                  onChange={(e) => setMapping(prev => ({ 
                    ...prev, 
                    [key]: e.target.value || undefined 
                  }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    required && !mapping[key as keyof ColumnMapping] 
                      ? 'border-red-300' 
                      : 'border-slate-300'
                  }`}
                >
                  <option value="">-- Selecionar coluna --</option>
                  {preview?.headers.map((header, index) => (
                    <option key={index} value={header}>{header}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        <button
          onClick={() => setStep('upload')}
          className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
        >
          Voltar
        </button>
        <button
          onClick={processData}
          disabled={!mapping.date || !mapping.amount || isLoading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Processando...' : 'Próximo'}
        </button>
      </div>
    </div>
  );

  const renderPreviewStep = () => (
    <div className="p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-slate-900 mb-2">Preview da Importação</h2>
        <p className="text-slate-600">
          Revise os dados antes de finalizar a importação
        </p>
      </div>

      {processedData && (
        <div className="space-y-6">
          {/* Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <Check className="h-8 w-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">Transações Válidas</p>
                  <p className="text-2xl font-semibold text-green-900">{processedData.transactions.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="h-8 w-8 text-yellow-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-yellow-800">Avisos</p>
                  <p className="text-2xl font-semibold text-yellow-900">
                    {processedData.errors.filter(e => e.severity === 'warning').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <X className="h-8 w-8 text-red-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">Erros</p>
                  <p className="text-2xl font-semibold text-red-900">
                    {processedData.errors.filter(e => e.severity === 'error').length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Erros/Avisos */}
          {processedData.errors.length > 0 && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <h4 className="font-medium text-slate-900 mb-3">Erros e Avisos</h4>
              <div className="max-h-32 overflow-y-auto space-y-2">
                {processedData.errors.map((error, index) => (
                  <div key={index} className={`text-sm p-2 rounded ${
                    error.severity === 'error' 
                      ? 'bg-red-100 text-red-700' 
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    Linha {error.row}: {error.message}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Preview dos dados */}
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
              <h4 className="font-medium text-slate-900">
                Preview das Primeiras 10 Transações
              </h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left p-3 font-medium text-slate-900">Data</th>
                    <th className="text-left p-3 font-medium text-slate-900">Descrição</th>
                    <th className="text-left p-3 font-medium text-slate-900">Valor</th>
                    <th className="text-left p-3 font-medium text-slate-900">Categoria</th>
                    <th className="text-left p-3 font-medium text-slate-900">Tipo</th>
                  </tr>
                </thead>
                <tbody>
                  {processedData.transactions.slice(0, 10).map((transaction, index) => (
                    <tr key={index} className="border-t border-slate-200">
                      <td className="p-3">{new Date(transaction.date).toLocaleDateString('pt-BR')}</td>
                      <td className="p-3 max-w-xs truncate">{transaction.description}</td>
                      <td className="p-3 font-medium">
                        R$ {transaction.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3">{transaction.category}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          transaction.type === 'income' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {transaction.type === 'income' ? 'Entrada' : 'Saída'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setStep('mapping')}
              className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Voltar
            </button>
            <button
              onClick={confirmImport}
              disabled={processedData.errors.filter(e => e.severity === 'error').length > 0}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Confirmar Importação
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderProcessingStep = () => (
    <div className="p-8 text-center">
      <div className="animate-spin h-16 w-16 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-4"></div>
      <h2 className="text-2xl font-semibold text-slate-900 mb-2">Importando Dados...</h2>
      <p className="text-slate-600">
        Aguarde enquanto processamos suas transações
      </p>
    </div>
  );

  return (
    <div className="bg-white rounded-3xl shadow-2xl max-w-6xl mx-auto overflow-hidden">
      {/* Header com steps */}
      <div className="bg-slate-50 px-8 py-4 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            {[
              { key: 'upload', label: 'Upload' },
              { key: 'mapping', label: 'Mapeamento' },
              { key: 'preview', label: 'Preview' },
              { key: 'processing', label: 'Processando' }
            ].map(({ key, label }, index) => (
              <div key={key} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === key 
                    ? 'bg-blue-600 text-white' 
                    : index < ['upload', 'mapping', 'preview', 'processing'].indexOf(step)
                    ? 'bg-green-600 text-white'
                    : 'bg-slate-300 text-slate-600'
                }`}>
                  {index < ['upload', 'mapping', 'preview', 'processing'].indexOf(step) ? '✓' : index + 1}
                </div>
                <span className="ml-2 text-sm font-medium text-slate-700">{label}</span>
              </div>
            ))}
          </div>
          
          {onClose && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="min-h-[500px]">
        {step === 'upload' && renderUploadStep()}
        {step === 'mapping' && renderMappingStep()}
        {step === 'preview' && renderPreviewStep()}
        {step === 'processing' && renderProcessingStep()}
      </div>
    </div>
  );
};