import React, { useState, useRef } from 'react';
import {
  Printer,
  Upload,
  Download,
  Eye,
  Settings,
  Image,
  QrCode,
  Plus,
  Trash2,
  Save,
  X,
  FileImage,
  Tag,
  Palette
} from 'lucide-react';

// Tipos de credencial/categoria
interface BadgeTemplate {
  id: string;
  name: string;
  category: string; // staff, vip, imprensa, fornecedor, artista, etc
  backgroundUrl: string;
  width: number; // mm
  height: number; // mm
  orientation: 'portrait' | 'landscape';
  fields: BadgeField[];
  backgroundColor: string;
  textColor: string;
}

interface BadgeField {
  id: string;
  type: 'text' | 'image' | 'qrcode';
  label: string;
  source: 'name' | 'role' | 'company' | 'document' | 'photo' | 'qr' | 'custom';
  x: number; // posição em %
  y: number;
  width: number;
  height: number;
  fontSize?: number;
  fontWeight?: 'normal' | 'bold';
  textAlign?: 'left' | 'center' | 'right';
  customValue?: string;
}

// Tamanhos de etiqueta predefinidos
const LABEL_SIZES = [
  { name: 'Etiqueta 70x32mm', width: 70, height: 32 },
  { name: 'Etiqueta 100x50mm', width: 100, height: 50 },
  { name: 'Etiqueta 100x70mm', width: 100, height: 70 },
  { name: 'Crachá Padrão (86x54mm)', width: 86, height: 54 },
  { name: 'Crachá Grande (100x70mm)', width: 100, height: 70 },
  { name: 'A6 (105x148mm)', width: 105, height: 148 },
  { name: 'Personalizado', width: 0, height: 0 },
];

// Categorias padrão
const DEFAULT_CATEGORIES = [
  { id: 'staff', name: 'Staff / Produção', color: '#3b82f6' },
  { id: 'vip', name: 'VIP / Convidado', color: '#8b5cf6' },
  { id: 'imprensa', name: 'Imprensa', color: '#10b981' },
  { id: 'fornecedor', name: 'Fornecedor', color: '#f59e0b' },
  { id: 'artista', name: 'Artista / Atração', color: '#ef4444' },
  { id: 'seguranca', name: 'Segurança', color: '#1f2937' },
  { id: 'catering', name: 'Catering', color: '#ec4899' },
  { id: 'patrocinador', name: 'Patrocinador', color: '#6366f1' },
];

interface BadgePrinterProps {
  person?: {
    id: string;
    name: string;
    role: string;
    company?: string;
    document?: string;
    photo?: string;
    category?: string;
  };
  onClose?: () => void;
}

export const BadgePrinter: React.FC<BadgePrinterProps> = ({ person, onClose }) => {
  const [templates, setTemplates] = useState<BadgeTemplate[]>(() => {
    const saved = localStorage.getItem('bxd_badge_templates');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [selectedTemplate, setSelectedTemplate] = useState<BadgeTemplate | null>(null);
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<BadgeTemplate | null>(null);
  
  // Estado do editor de template
  const [newTemplate, setNewTemplate] = useState<Partial<BadgeTemplate>>({
    name: '',
    category: 'staff',
    width: 86,
    height: 54,
    orientation: 'landscape',
    backgroundColor: '#ffffff',
    textColor: '#000000',
    backgroundUrl: '',
    fields: [
      { id: '1', type: 'text', label: 'Nome', source: 'name', x: 50, y: 40, width: 80, height: 20, fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
      { id: '2', type: 'text', label: 'Cargo', source: 'role', x: 50, y: 60, width: 80, height: 15, fontSize: 14, fontWeight: 'normal', textAlign: 'center' },
    ]
  });

  const printRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Salvar templates no localStorage
  const saveTemplates = (newTemplates: BadgeTemplate[]) => {
    setTemplates(newTemplates);
    localStorage.setItem('bxd_badge_templates', JSON.stringify(newTemplates));
  };

  // Upload de imagem de fundo
  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setNewTemplate({
          ...newTemplate,
          backgroundUrl: event.target?.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Criar/Atualizar template
  const handleSaveTemplate = () => {
    if (!newTemplate.name || !newTemplate.category) {
      alert('Preencha o nome e categoria do template');
      return;
    }

    const template: BadgeTemplate = {
      id: editingTemplate?.id || `template-${Date.now()}`,
      name: newTemplate.name || '',
      category: newTemplate.category || 'staff',
      backgroundUrl: newTemplate.backgroundUrl || '',
      width: newTemplate.width || 86,
      height: newTemplate.height || 54,
      orientation: newTemplate.orientation || 'landscape',
      backgroundColor: newTemplate.backgroundColor || '#ffffff',
      textColor: newTemplate.textColor || '#000000',
      fields: newTemplate.fields || []
    };

    if (editingTemplate) {
      saveTemplates(templates.map(t => t.id === editingTemplate.id ? template : t));
    } else {
      saveTemplates([...templates, template]);
    }

    setShowTemplateEditor(false);
    setEditingTemplate(null);
    setNewTemplate({
      name: '',
      category: 'staff',
      width: 86,
      height: 54,
      orientation: 'landscape',
      backgroundColor: '#ffffff',
      textColor: '#000000',
      backgroundUrl: '',
      fields: []
    });
  };

  // Deletar template
  const handleDeleteTemplate = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este template?')) {
      saveTemplates(templates.filter(t => t.id !== id));
    }
  };

  // Imprimir credencial
  const handlePrint = () => {
    if (!selectedTemplate || !person) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const badgeHtml = generateBadgeHtml(selectedTemplate, person);
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Credencial - ${person.name}</title>
          <style>
            @page {
              size: ${selectedTemplate.width}mm ${selectedTemplate.height}mm;
              margin: 0;
            }
            body {
              margin: 0;
              padding: 0;
              font-family: Arial, sans-serif;
            }
            .badge {
              width: ${selectedTemplate.width}mm;
              height: ${selectedTemplate.height}mm;
              position: relative;
              overflow: hidden;
              background-color: ${selectedTemplate.backgroundColor};
              color: ${selectedTemplate.textColor};
              ${selectedTemplate.backgroundUrl ? `background-image: url(${selectedTemplate.backgroundUrl}); background-size: cover; background-position: center;` : ''}
            }
            .field {
              position: absolute;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .field-text {
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
            .field-image {
              object-fit: cover;
              border-radius: 50%;
            }
            @media print {
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          ${badgeHtml}
          <script>
            window.onload = function() {
              window.print();
              window.close();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Gerar HTML do crachá
  const generateBadgeHtml = (template: BadgeTemplate, data: any) => {
    let fieldsHtml = '';
    
    template.fields.forEach(field => {
      let value = '';
      switch (field.source) {
        case 'name': value = data.name || ''; break;
        case 'role': value = data.role || ''; break;
        case 'company': value = data.company || ''; break;
        case 'document': value = data.document || ''; break;
        case 'custom': value = field.customValue || ''; break;
      }

      if (field.type === 'text') {
        fieldsHtml += `
          <div class="field" style="
            left: ${field.x - field.width/2}%;
            top: ${field.y - field.height/2}%;
            width: ${field.width}%;
            height: ${field.height}%;
            font-size: ${field.fontSize || 14}px;
            font-weight: ${field.fontWeight || 'normal'};
            text-align: ${field.textAlign || 'center'};
          ">
            <span class="field-text">${value}</span>
          </div>
        `;
      } else if (field.type === 'image' && field.source === 'photo') {
        fieldsHtml += `
          <div class="field" style="
            left: ${field.x - field.width/2}%;
            top: ${field.y - field.height/2}%;
            width: ${field.width}%;
            height: ${field.height}%;
          ">
            <img src="${data.photo || `https://api.dicebear.com/7.x/initials/svg?seed=${data.name}`}" class="field-image" style="width: 100%; height: 100%;" />
          </div>
        `;
      } else if (field.type === 'qrcode') {
        // QR Code com dados do participante
        const qrData = encodeURIComponent(JSON.stringify({ id: data.id, name: data.name }));
        fieldsHtml += `
          <div class="field" style="
            left: ${field.x - field.width/2}%;
            top: ${field.y - field.height/2}%;
            width: ${field.width}%;
            height: ${field.height}%;
          ">
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${qrData}" style="width: 100%; height: 100%;" />
          </div>
        `;
      }
    });

    return `<div class="badge">${fieldsHtml}</div>`;
  };

  // Renderizar preview do crachá
  const renderBadgePreview = () => {
    if (!selectedTemplate) return null;
    
    const previewData = person || {
      id: 'preview',
      name: 'José Maria Bento',
      role: 'Produção',
      company: 'Diário Eventos',
      document: '000.000.000-00',
      photo: ''
    };

    const scale = Math.min(300 / selectedTemplate.width, 400 / selectedTemplate.height);

    return (
      <div 
        ref={printRef}
        className="relative border-2 border-slate-300 rounded-lg overflow-hidden shadow-lg mx-auto"
        style={{
          width: `${selectedTemplate.width * scale}px`,
          height: `${selectedTemplate.height * scale}px`,
          backgroundColor: selectedTemplate.backgroundColor,
          color: selectedTemplate.textColor,
          backgroundImage: selectedTemplate.backgroundUrl ? `url(${selectedTemplate.backgroundUrl})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {selectedTemplate.fields.map(field => {
          let content = null;
          let value = '';
          
          switch (field.source) {
            case 'name': value = previewData.name; break;
            case 'role': value = previewData.role; break;
            case 'company': value = previewData.company || ''; break;
            case 'document': value = previewData.document || ''; break;
            case 'custom': value = field.customValue || ''; break;
          }

          if (field.type === 'text') {
            content = (
              <span 
                className="truncate"
                style={{
                  fontSize: `${(field.fontSize || 14) * scale * 0.3}px`,
                  fontWeight: field.fontWeight || 'normal',
                }}
              >
                {value}
              </span>
            );
          } else if (field.type === 'image') {
            content = (
              <img 
                src={previewData.photo || `https://api.dicebear.com/7.x/initials/svg?seed=${previewData.name}`}
                alt=""
                className="w-full h-full object-cover rounded-full"
              />
            );
          } else if (field.type === 'qrcode') {
            content = (
              <div className="w-full h-full bg-white flex items-center justify-center">
                <QrCode className="w-3/4 h-3/4 text-slate-800" />
              </div>
            );
          }

          return (
            <div
              key={field.id}
              className="absolute flex items-center justify-center"
              style={{
                left: `${field.x - field.width/2}%`,
                top: `${field.y - field.height/2}%`,
                width: `${field.width}%`,
                height: `${field.height}%`,
                textAlign: field.textAlign || 'center'
              }}
            >
              {content}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Printer className="w-6 h-6" />
              Impressão de Credenciais
            </h2>
            <p className="text-blue-100 text-sm mt-1">
              {person ? `Gerando credencial para ${person.name}` : 'Configure e imprima credenciais'}
            </p>
          </div>
          {onClose && (
            <button onClick={onClose} className="text-white/80 hover:text-white" aria-label="Fechar modal de impressão">
              <X className="w-6 h-6" aria-hidden="true" />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Coluna da esquerda - Templates */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-800">Templates Disponíveis</h3>
                <button
                  onClick={() => {
                    setEditingTemplate(null);
                    setShowTemplateEditor(true);
                  }}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                  aria-label="Criar novo template"
                >
                  <Plus className="w-4 h-4" aria-hidden="true" />
                  Novo Template
                </button>
              </div>

              {/* Lista de templates */}
              <div className="space-y-3">
                {templates.length === 0 ? (
                  <div className="text-center py-8 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
                    <FileImage className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">Nenhum template criado</p>
                    <p className="text-sm text-slate-400 mt-1">Crie um template para começar</p>
                  </div>
                ) : (
                  templates.map(template => {
                    const category = DEFAULT_CATEGORIES.find(c => c.id === template.category);
                    return (
                      <div
                        key={template.id}
                        onClick={() => setSelectedTemplate(template)}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition ${
                          selectedTemplate?.id === template.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-slate-800">{template.name}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span
                                className="px-2 py-0.5 rounded text-xs font-medium text-white"
                                style={{ backgroundColor: category?.color || '#666' }}
                              >
                                {category?.name || template.category}
                              </span>
                              <span className="text-xs text-slate-500">
                                {template.width}x{template.height}mm
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingTemplate(template);
                                setNewTemplate(template);
                                setShowTemplateEditor(true);
                              }}
                              className="p-2 text-slate-400 hover:text-blue-600 transition"
                              aria-label="Editar template"
                            >
                              <Settings className="w-4 h-4" aria-hidden="true" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTemplate(template.id);
                              }}
                              className="p-2 text-slate-400 hover:text-red-600 transition"
                              aria-label="Excluir template"
                            >
                              <Trash2 className="w-4 h-4" aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Tamanhos de etiqueta rápidos */}
              <div className="mt-6">
                <h4 className="text-sm font-medium text-slate-700 mb-2">Tamanhos Rápidos</h4>
                <div className="flex flex-wrap gap-2">
                  {LABEL_SIZES.slice(0, -1).map(size => (
                    <button
                      key={size.name}
                      onClick={() => {
                        setNewTemplate({
                          ...newTemplate,
                          width: size.width,
                          height: size.height,
                          orientation: size.width > size.height ? 'landscape' : 'portrait'
                        });
                        setShowTemplateEditor(true);
                      }}
                      className="px-3 py-1.5 text-xs bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200 transition"
                      aria-label={`Selecionar tamanho ${size.name}`}
                    >
                      {size.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Coluna da direita - Preview */}
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Preview</h3>
              
              {selectedTemplate ? (
                <div className="space-y-4">
                  <div className="bg-slate-100 rounded-lg p-8 flex items-center justify-center min-h-[300px]">
                    {renderBadgePreview()}
                  </div>

                  {/* Botões de ação */}
                  <div className="flex gap-3">
                    <button
                      onClick={handlePrint}
                      disabled={!person}
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Imprimir credencial"
                    >
                      <Printer className="w-5 h-5" aria-hidden="true" />
                      Imprimir
                    </button>
                    <button
                      className="px-4 py-3 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition"
                      title="Baixar como imagem"
                      aria-label="Baixar como imagem"
                    >
                      <Download className="w-5 h-5" aria-hidden="true" />
                    </button>
                  </div>

                  {!person && (
                    <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
                      ⚠️ Selecione uma pessoa no módulo de Credenciamento para imprimir
                    </p>
                  )}
                </div>
              ) : (
                <div className="bg-slate-50 rounded-lg p-8 text-center min-h-[300px] flex flex-col items-center justify-center">
                  <Eye className="w-12 h-12 text-slate-300 mb-3" />
                  <p className="text-slate-500">Selecione um template para visualizar</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal de Editor de Template */}
        {showTemplateEditor && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-800">
                  {editingTemplate ? 'Editar Template' : 'Novo Template'}
                </h3>
                <button onClick={() => setShowTemplateEditor(false)} className="text-slate-400 hover:text-slate-600" aria-label="Fechar editor de template">
                  <X className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Nome e Categoria */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Nome do Template *
                    </label>
                    <input
                      type="text"
                      value={newTemplate.name || ''}
                      onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                      placeholder="Ex: Crachá Staff Padrão"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Categoria
                    </label>
                    <select
                      value={newTemplate.category || 'staff'}
                      onChange={(e) => setNewTemplate({ ...newTemplate, category: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      {DEFAULT_CATEGORIES.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Tamanho */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Tamanho
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs text-slate-500">Largura (mm)</label>
                      <input
                        type="number"
                        value={newTemplate.width || 86}
                        onChange={(e) => setNewTemplate({ ...newTemplate, width: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500">Altura (mm)</label>
                      <input
                        type="number"
                        value={newTemplate.height || 54}
                        onChange={(e) => setNewTemplate({ ...newTemplate, height: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500">Orientação</label>
                      <select
                        value={newTemplate.orientation || 'landscape'}
                        onChange={(e) => setNewTemplate({ ...newTemplate, orientation: e.target.value as 'portrait' | 'landscape' })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                      >
                        <option value="landscape">Paisagem</option>
                        <option value="portrait">Retrato</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Cores */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Cor de Fundo
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={newTemplate.backgroundColor || '#ffffff'}
                        onChange={(e) => setNewTemplate({ ...newTemplate, backgroundColor: e.target.value })}
                        className="w-12 h-10 rounded border border-slate-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={newTemplate.backgroundColor || '#ffffff'}
                        onChange={(e) => setNewTemplate({ ...newTemplate, backgroundColor: e.target.value })}
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Cor do Texto
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={newTemplate.textColor || '#000000'}
                        onChange={(e) => setNewTemplate({ ...newTemplate, textColor: e.target.value })}
                        className="w-12 h-10 rounded border border-slate-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={newTemplate.textColor || '#000000'}
                        onChange={(e) => setNewTemplate({ ...newTemplate, textColor: e.target.value })}
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>
                </div>

                {/* Imagem de Fundo */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Imagem de Fundo (PNG recomendado)
                  </label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition"
                    >
                      <Upload className="w-4 h-4" />
                      Upload Imagem
                    </button>
                    {newTemplate.backgroundUrl && (
                      <button
                        onClick={() => setNewTemplate({ ...newTemplate, backgroundUrl: '' })}
                        className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        Remover
                      </button>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg"
                    onChange={handleBackgroundUpload}
                    className="hidden"
                  />
                  {newTemplate.backgroundUrl && (
                    <div className="mt-3">
                      <img
                        src={newTemplate.backgroundUrl}
                        alt="Preview"
                        className="max-h-32 rounded border border-slate-200"
                      />
                    </div>
                  )}
                </div>

                {/* Campos */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Campos do Template
                  </label>
                  <div className="space-y-2 bg-slate-50 p-4 rounded-lg">
                    {(newTemplate.fields || []).map((field, idx) => (
                      <div key={field.id} className="flex items-center gap-2 bg-white p-2 rounded border border-slate-200">
                        <span className="text-sm text-slate-600 flex-1">{field.label}</span>
                        <span className="text-xs text-slate-400">{field.source}</span>
                        <button
                          onClick={() => {
                            setNewTemplate({
                              ...newTemplate,
                              fields: newTemplate.fields?.filter((_, i) => i !== idx)
                            });
                          }}
                          className="text-red-400 hover:text-red-600"
                          aria-label={`Remover campo ${field.label}`}
                        >
                          <X className="w-4 h-4" aria-hidden="true" />
                        </button>
                      </div>
                    ))}
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => {
                          const newField: BadgeField = {
                            id: `field-${Date.now()}`,
                            type: 'text',
                            label: 'Novo Campo',
                            source: 'custom',
                            x: 50,
                            y: 80,
                            width: 80,
                            height: 10,
                            fontSize: 12,
                            fontWeight: 'normal',
                            textAlign: 'center'
                          };
                          setNewTemplate({
                            ...newTemplate,
                            fields: [...(newTemplate.fields || []), newField]
                          });
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
                      >
                        <Plus className="w-3 h-3" /> Texto
                      </button>
                      <button
                        onClick={() => {
                          const newField: BadgeField = {
                            id: `field-${Date.now()}`,
                            type: 'image',
                            label: 'Foto',
                            source: 'photo',
                            x: 20,
                            y: 50,
                            width: 25,
                            height: 40
                          };
                          setNewTemplate({
                            ...newTemplate,
                            fields: [...(newTemplate.fields || []), newField]
                          });
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 bg-purple-100 text-purple-700 rounded text-sm hover:bg-purple-200"
                      >
                        <Image className="w-3 h-3" /> Foto
                      </button>
                      <button
                        onClick={() => {
                          const newField: BadgeField = {
                            id: `field-${Date.now()}`,
                            type: 'qrcode',
                            label: 'QR Code',
                            source: 'qr',
                            x: 85,
                            y: 75,
                            width: 20,
                            height: 35
                          };
                          setNewTemplate({
                            ...newTemplate,
                            fields: [...(newTemplate.fields || []), newField]
                          });
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200"
                      >
                        <QrCode className="w-3 h-3" /> QR Code
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
                <button
                  onClick={() => setShowTemplateEditor(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveTemplate}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  <Save className="w-4 h-4" />
                  Salvar Template
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BadgePrinter;
