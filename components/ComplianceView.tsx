
import React, { useState } from 'react';
import { FileText, CheckSquare, AlertCircle, Shield, Download, Plus, Calendar, X, Upload } from 'lucide-react';

interface ComplianceItem {
  id: string;
  title: string;
  category: 'obrigatorio' | 'recomendado';
  status: 'completo' | 'pendente' | 'atencao';
  deadline?: string;
  description: string;
}

const complianceChecklist: ComplianceItem[] = [
  { id: '1', title: 'Registro de Candidatura no TSE', category: 'obrigatorio', status: 'completo', deadline: '2025-08-15', description: 'Protocolo de registro deferido' },
  { id: '2', title: 'Abertura de Conta Bancária Específica', category: 'obrigatorio', status: 'completo', deadline: '2025-08-20', description: 'Conta corrente exclusiva para campanha' },
  { id: '3', title: 'Prestação de Contas Parcial', category: 'obrigatorio', status: 'atencao', deadline: '2025-11-30', description: 'Vence em 3 dias' },
  { id: '4', title: 'Comprovação de Doações', category: 'obrigatorio', status: 'pendente', deadline: '2025-12-10', description: 'Pendente documentação' },
  { id: '5', title: 'Registro de Pessoal', category: 'obrigatorio', status: 'completo', description: 'Todos colaboradores registrados' },
  { id: '6', title: 'Seguro de Equipe', category: 'recomendado', status: 'pendente', description: 'Cobertura para voluntários em eventos' },
];

const documents = [
  { id: '1', name: 'Contrato - Gráfica Regional', type: 'Contrato', date: '2025-10-15', size: '245 KB' },
  { id: '2', name: 'Recibo - Doação João Silva', type: 'Recibo', date: '2025-11-25', size: '128 KB' },
  { id: '3', name: 'Ofício - Polícia Militar', type: 'Ofício', date: '2025-11-22', size: '98 KB' },
  { id: '4', name: 'NF 001234 - Impressão Santinhos', type: 'Nota Fiscal', date: '2025-11-20', size: '312 KB' },
];

const templates = [
  { id: '1', title: 'Contrato de Prestação de Serviços', category: 'Jurídico' },
  { id: '2', title: 'Recibo de Doação', category: 'Financeiro' },
  { id: '3', title: 'Ofício para Órgãos Públicos', category: 'Administrativo' },
  { id: '4', title: 'Termo de Voluntariado', category: 'RH' },
  { id: '5', title: 'Autorização de Uso de Imagem', category: 'Marketing' },
];

export const ComplianceView: React.FC = () => {
  const completedItems = complianceChecklist.filter(i => i.status === 'completo').length;
  const [showModal, setShowModal] = useState(false);
  const [newDocument, setNewDocument] = useState({
    title: '',
    category: 'tse' as 'tse' | 'financeiro' | 'juridico' | 'outros',
    deadline: '',
    file: '',
    description: ''
  });

  const totalItems = complianceChecklist.length;
  const compliancePercentage = (completedItems / totalItems) * 100;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completo': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'pendente': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'atencao': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completo': return <CheckSquare className="w-4 h-4" />;
      case 'atencao': return <AlertCircle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Documentação & Compliance</h2>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Novo Documento
        </button>
      </div>

      {/* Status Geral de Conformidade */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-white/20 rounded-lg">
            <Shield className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-2xl font-bold">Status de Conformidade TSE</h3>
            <p className="text-blue-100">Monitore o cumprimento das obrigações eleitorais</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <p className="text-3xl font-bold">{compliancePercentage.toFixed(0)}%</p>
            <p className="text-sm text-blue-100 mt-1">Conformidade Geral</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <p className="text-3xl font-bold">{completedItems}/{totalItems}</p>
            <p className="text-sm text-blue-100 mt-1">Itens Completos</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <p className="text-3xl font-bold">{complianceChecklist.filter(i => i.status === 'atencao').length}</p>
            <p className="text-sm text-blue-100 mt-1">Alertas Ativos</p>
          </div>
        </div>
        <div className="mt-4 w-full bg-white/20 rounded-full h-3">
          <div 
            className="bg-white h-3 rounded-full transition-all duration-500"
            style={{ width: `${compliancePercentage}%` }}
          />
        </div>
      </div>

      {/* Checklist de Conformidade */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <CheckSquare className="w-5 h-5 text-blue-600" />
          Checklist de Compliance
        </h3>
        <div className="space-y-3">
          {complianceChecklist.map((item) => (
            <div 
              key={item.id}
              className={`p-4 rounded-lg border-2 transition-all ${
                item.status === 'completo' ? 'bg-emerald-50 border-emerald-200' :
                item.status === 'atencao' ? 'bg-red-50 border-red-200' :
                'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-lg ${
                  item.status === 'completo' ? 'bg-emerald-100 text-emerald-600' :
                  item.status === 'atencao' ? 'bg-red-100 text-red-600' :
                  'bg-slate-100 text-slate-600'
                }`}>
                  {getStatusIcon(item.status)}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-slate-800">{item.title}</h4>
                      <p className="text-sm text-slate-600 mt-1">{item.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}>
                        {item.status === 'completo' ? 'Completo' : 
                         item.status === 'atencao' ? 'Atenção' : 'Pendente'}
                      </span>
                      {item.category === 'obrigatorio' && (
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 border border-purple-200">
                          Obrigatório
                        </span>
                      )}
                    </div>
                  </div>
                  {item.deadline && (
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
                      <Calendar className="w-3 h-3" />
                      <span>Prazo: {new Date(item.deadline).toLocaleDateString('pt-BR')}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Repositório de Documentos */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Documentos Armazenados
            </h3>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">Ver Todos</button>
          </div>
          <div className="space-y-2">
            {documents.map((doc) => (
              <div 
                key={doc.id}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-blue-300 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <FileText className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">{doc.name}</p>
                    <p className="text-xs text-slate-500">{doc.type} • {doc.size}</p>
                  </div>
                </div>
                <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Templates de Documentos */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-600" />
            Gerador de Documentos
          </h3>
          <p className="text-sm text-slate-600 mb-4">
            Templates prontos para gerar documentos legais automaticamente
          </p>
          <div className="space-y-2">
            {templates.map((template) => (
              <button
                key={template.id}
                className="w-full text-left p-3 bg-purple-50 rounded-lg border border-purple-200 hover:border-purple-400 hover:bg-purple-100 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{template.title}</p>
                    <p className="text-xs text-purple-600 mt-1">{template.category}</p>
                  </div>
                  <Plus className="w-4 h-4 text-purple-600" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Alertas de Prazos */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-amber-500 rounded-lg">
            <AlertCircle className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Alertas de Prazo TSE</h3>
            <p className="text-sm text-slate-600 mb-3">
              Você tem <strong>1 obrigação</strong> com prazo próximo: <strong>Prestação de Contas Parcial</strong> vence em 3 dias.
            </p>
            <button className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium transition-colors">
              Ver Detalhes
            </button>
          </div>
        </div>
      </div>

      {/* Modal Novo Documento */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">Novo Documento</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600" title="Fechar">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); console.log('Novo documento:', newDocument); setShowModal(false); }} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Título do Documento *
                </label>
                <input
                  type="text"
                  value={newDocument.title}
                  onChange={(e) => setNewDocument({...newDocument, title: e.target.value})}
                  placeholder="Ex: Registro de Candidatura"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Categoria *
                  </label>
                  <select
                    value={newDocument.category}
                    onChange={(e) => setNewDocument({...newDocument, category: e.target.value as typeof newDocument.category})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="tse">TSE / Eleitoral</option>
                    <option value="financeiro">Financeiro</option>
                    <option value="juridico">Jurídico</option>
                    <option value="outros">Outros</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Prazo de Entrega
                  </label>
                  <input
                    type="date"
                    value={newDocument.deadline}
                    onChange={(e) => setNewDocument({...newDocument, deadline: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Arquivo do Documento *
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer">
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-600 mb-1">Clique para fazer upload ou arraste o arquivo</p>
                  <p className="text-xs text-slate-400">PDF, DOC, DOCX até 10MB</p>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setNewDocument({...newDocument, file: e.target.files?.[0]?.name || ''})}
                    className="hidden"
                    id="file-upload"
                  />
                </div>
                {newDocument.file && (
                  <p className="text-sm text-emerald-600 mt-2">✓ Arquivo selecionado: {newDocument.file}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Observações
                </label>
                <textarea
                  value={newDocument.description}
                  onChange={(e) => setNewDocument({...newDocument, description: e.target.value})}
                  rows={3}
                  placeholder="Adicione observações ou detalhes sobre este documento..."
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Salvar Documento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
