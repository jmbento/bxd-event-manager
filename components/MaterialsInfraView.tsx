import React, { useState, useEffect } from 'react';
import { 
  Plus, Printer, Warehouse, AlertTriangle, CheckCircle, Clock, Package, 
  TrendingUp, Calendar, User, Building2, Wrench, FileText, Download,
  Filter, Search, Edit2, Trash2, X, Save, AlertCircle as Alert
} from 'lucide-react';
import { PageBanner } from './PageBanner';

interface MaterialItem {
  id: string;
  name: string;
  category: 'impressos' | 'infraestrutura';
  type: string; // Crachá, Banner, Tenda, Palco, etc
  solicitante: string;
  fornecedor: string;
  instalador?: string; // Opcional para impressos
  responsavel: string;
  dataEntrega: string;
  status: 'solicitado' | 'em-producao' | 'pronto' | 'entregue' | 'instalado' | 'atrasado';
  observacoes?: string;
  created_at: string;
}

const tiposImpressos = [
  'Crachás/Credenciais',
  'Banners/Lonas',
  'Faixas',
  'Backdrop/Painel de Palco',
  'Adesivos/Sinalizações',
  'Folders/Flyers',
  'Certificados',
  'Cardápios',
  'Identificação Obrigatória',
  'Placas Direcionais',
  'Outro'
];

const tiposInfraestrutura = [
  'Tendas/Coberturas',
  'Palco/Estrutura',
  'Som/Luz',
  'Telões/LED',
  'Fechamentos/Gradil',
  'Estandes/Ilhas',
  'Mobiliário',
  'Geradores',
  'Banheiros Químicos',
  'Refrigeração',
  'Outro'
];

const statusColors = {
  'solicitado': 'bg-slate-100 text-slate-700',
  'em-producao': 'bg-blue-100 text-blue-700',
  'pronto': 'bg-purple-100 text-purple-700',
  'entregue': 'bg-orange-100 text-orange-700',
  'instalado': 'bg-green-100 text-green-700',
  'atrasado': 'bg-red-100 text-red-700'
};

const statusLabels = {
  'solicitado': 'Solicitado',
  'em-producao': 'Em Produção',
  'pronto': 'Pronto',
  'entregue': 'Entregue',
  'instalado': 'Instalado',
  'atrasado': 'Atrasado'
};

export const MaterialsInfraView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'impressos' | 'infraestrutura'>('impressos');
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [materials, setMaterials] = useState<MaterialItem[]>(() => {
    const saved = localStorage.getItem('materials_infra');
    return saved ? JSON.parse(saved) : [];
  });

  const [formData, setFormData] = useState({
    name: '',
    category: 'impressos' as 'impressos' | 'infraestrutura',
    type: '',
    solicitante: '',
    fornecedor: '',
    instalador: '',
    responsavel: '',
    dataEntrega: '',
    status: 'solicitado' as MaterialItem['status'],
    observacoes: ''
  });

  useEffect(() => {
    localStorage.setItem('materials_infra', JSON.stringify(materials));
  }, [materials]);

  // Atualizar status para "atrasado" automaticamente
  useEffect(() => {
    const checkDeadlines = () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      setMaterials(prev => prev.map(item => {
        const deliveryDate = new Date(item.dataEntrega);
        deliveryDate.setHours(0, 0, 0, 0);
        
        if (deliveryDate < today && !['entregue', 'instalado', 'atrasado'].includes(item.status)) {
          return { ...item, status: 'atrasado' };
        }
        return item;
      }));
    };

    checkDeadlines();
    const interval = setInterval(checkDeadlines, 60000); // Verifica a cada minuto
    return () => clearInterval(interval);
  }, []);

  const handleAddMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    const newMaterial: MaterialItem = {
      id: 'm' + Date.now(),
      ...formData,
      created_at: new Date().toISOString()
    };
    setMaterials([newMaterial, ...materials]);
    setShowModal(false);
    setFormData({
      name: '',
      category: 'impressos',
      type: '',
      solicitante: '',
      fornecedor: '',
      instalador: '',
      responsavel: '',
      dataEntrega: '',
      status: 'solicitado',
      observacoes: ''
    });
  };

  const handleDeleteMaterial = (id: string) => {
    if (confirm('Deseja excluir este item?')) {
      setMaterials(materials.filter(m => m.id !== id));
    }
  };

  const handleUpdateStatus = (id: string, newStatus: MaterialItem['status']) => {
    setMaterials(materials.map(m => 
      m.id === id ? { ...m, status: newStatus } : m
    ));
  };

  const filteredMaterials = materials
    .filter(m => m.category === activeTab)
    .filter(m => filterStatus === 'todos' || m.status === filterStatus)
    .filter(m => 
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.fornecedor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.solicitante.toLowerCase().includes(searchTerm.toLowerCase())
    );

  // Estatísticas
  const stats = {
    total: materials.filter(m => m.category === activeTab).length,
    atrasados: materials.filter(m => m.category === activeTab && m.status === 'atrasado').length,
    entregues: materials.filter(m => m.category === activeTab && ['entregue', 'instalado'].includes(m.status)).length,
    pendentes: materials.filter(m => m.category === activeTab && ['solicitado', 'em-producao', 'pronto'].includes(m.status)).length
  };

  // Próximas entregas (próximos 7 dias)
  const proximasEntregas = materials
    .filter(m => {
      const deliveryDate = new Date(m.dataEntrega);
      const today = new Date();
      const diffDays = Math.ceil((deliveryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 7 && !['entregue', 'instalado'].includes(m.status);
    })
    .sort((a, b) => new Date(a.dataEntrega).getTime() - new Date(b.dataEntrega).getTime());

  // Agrupar por fornecedor
  const fornecedoresUnicos = [...new Set(materials.filter(m => m.category === activeTab).map(m => m.fornecedor))];

  return (
    <div className="space-y-6">
      <PageBanner pageKey="materials-infra" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Package className="w-7 h-7 text-blue-600" />
            Materiais & Infraestrutura
          </h1>
          <p className="text-slate-500 mt-1">
            Gestão de impressos, gráfica e instalações do evento
          </p>
        </div>
        <button
          onClick={() => {
            setFormData({ ...formData, category: activeTab });
            setShowModal(true);
          }}
          className="px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Adicionar Item
        </button>
      </div>

      {/* Alertas de Entregas Próximas */}
      {proximasEntregas.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-orange-900 mb-2">
                Entregas nos Próximos 7 Dias ({proximasEntregas.length})
              </h3>
              <div className="space-y-1">
                {proximasEntregas.slice(0, 3).map(item => (
                  <div key={item.id} className="flex items-center gap-2 text-sm text-orange-800">
                    <Calendar className="w-4 h-4" />
                    <span className="font-medium">{new Date(item.dataEntrega).toLocaleDateString('pt-BR')}</span>
                    <span>•</span>
                    <span>{item.name}</span>
                    <span>•</span>
                    <span className="text-orange-600">{item.fornecedor}</span>
                  </div>
                ))}
                {proximasEntregas.length > 3 && (
                  <p className="text-xs text-orange-600 mt-1">
                    + {proximasEntregas.length - 3} outras entregas
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-600">Total</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
        </div>
        
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-orange-500" />
            <span className="text-sm text-slate-600">Pendentes</span>
          </div>
          <p className="text-2xl font-bold text-orange-600">{stats.pendentes}</p>
        </div>
        
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-sm text-slate-600">Entregues</span>
          </div>
          <p className="text-2xl font-bold text-green-600">{stats.entregues}</p>
        </div>
        
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <span className="text-sm text-slate-600">Atrasados</span>
          </div>
          <p className="text-2xl font-bold text-red-600">{stats.atrasados}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-slate-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('impressos')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition flex items-center gap-2 ${
            activeTab === 'impressos'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Printer className="w-4 h-4" />
          Impressos & Gráfica
        </button>
        <button
          onClick={() => setActiveTab('infraestrutura')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition flex items-center gap-2 ${
            activeTab === 'infraestrutura'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Warehouse className="w-4 h-4" />
          Infraestrutura & Montagem
        </button>
      </div>

      {/* Filtros e Busca */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nome, tipo, fornecedor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="todos">Todos os Status</option>
            <option value="solicitado">Solicitado</option>
            <option value="em-producao">Em Produção</option>
            <option value="pronto">Pronto</option>
            <option value="entregue">Entregue</option>
            <option value="instalado">Instalado</option>
            <option value="atrasado">Atrasado</option>
          </select>
        </div>
      </div>

      {/* Lista de Materiais */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        {filteredMaterials.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="text-slate-500 mb-1">
              {searchTerm || filterStatus !== 'todos' 
                ? 'Nenhum item encontrado com os filtros aplicados' 
                : `Nenhum item de ${activeTab === 'impressos' ? 'impressos' : 'infraestrutura'} cadastrado`
              }
            </p>
            <p className="text-sm text-slate-400">
              Clique em "Adicionar Item" para começar
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Item</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Solicitante</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Fornecedor</th>
                  {activeTab === 'infraestrutura' && (
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Instalador</th>
                  )}
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Responsável</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Entrega</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Status</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMaterials.map((item) => {
                  const deliveryDate = new Date(item.dataEntrega);
                  const today = new Date();
                  const diffDays = Math.ceil((deliveryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                  const isUrgent = diffDays >= 0 && diffDays <= 3;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-slate-900">{item.name}</p>
                          <p className="text-sm text-slate-500">{item.type}</p>
                          {item.observacoes && (
                            <p className="text-xs text-slate-400 mt-1">{item.observacoes}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-slate-400" />
                          <span className="text-sm text-slate-700">{item.solicitante}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-slate-400" />
                          <span className="text-sm font-medium text-slate-900">{item.fornecedor}</span>
                        </div>
                      </td>
                      {activeTab === 'infraestrutura' && (
                        <td className="py-3 px-4">
                          {item.instalador ? (
                            <div className="flex items-center gap-2">
                              <Wrench className="w-4 h-4 text-slate-400" />
                              <span className="text-sm text-slate-700">{item.instalador}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-slate-400">-</span>
                          )}
                        </td>
                      )}
                      <td className="py-3 px-4">
                        <span className="text-sm text-slate-700">{item.responsavel}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className={`text-sm ${isUrgent && !['entregue', 'instalado'].includes(item.status) ? 'text-orange-600 font-semibold' : 'text-slate-700'}`}>
                          {deliveryDate.toLocaleDateString('pt-BR')}
                          {isUrgent && !['entregue', 'instalado'].includes(item.status) && (
                            <span className="block text-xs text-orange-500">
                              {diffDays === 0 ? 'Hoje!' : diffDays === 1 ? 'Amanhã' : `${diffDays} dias`}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={item.status}
                          onChange={(e) => handleUpdateStatus(item.id, e.target.value as MaterialItem['status'])}
                          className={`px-2 py-1 rounded-full text-xs font-medium border-0 ${statusColors[item.status]}`}
                        >
                          {Object.entries(statusLabels).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDeleteMaterial(item.id)}
                          className="text-red-600 hover:text-red-700 text-sm font-medium"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Relatório por Fornecedor */}
      {fornecedoresUnicos.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Resumo por Fornecedor
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {fornecedoresUnicos.map(fornecedor => {
              const itensFornecedor = materials.filter(m => m.fornecedor === fornecedor && m.category === activeTab);
              const concluidos = itensFornecedor.filter(m => ['entregue', 'instalado'].includes(m.status)).length;
              
              return (
                <div key={fornecedor} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-slate-900">{fornecedor}</h4>
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                      {itensFornecedor.length} {itensFornecedor.length === 1 ? 'item' : 'itens'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>{concluidos} entregue{concluidos !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal de Adicionar Item */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  Adicionar {activeTab === 'impressos' ? 'Impresso' : 'Infraestrutura'}
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  Preencha as informações do item
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAddMaterial} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Nome do Item *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Crachás VIP, Tenda 10x10m"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Tipo *
                  </label>
                  <select
                    required
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Selecione...</option>
                    {(activeTab === 'impressos' ? tiposImpressos : tiposInfraestrutura).map(tipo => (
                      <option key={tipo} value={tipo}>{tipo}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Data de Entrega *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.dataEntrega}
                    onChange={(e) => setFormData({ ...formData, dataEntrega: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Quem Solicitou *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.solicitante}
                    onChange={(e) => setFormData({ ...formData, solicitante: e.target.value })}
                    placeholder="Nome/Departamento"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Fornecedor *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fornecedor}
                    onChange={(e) => setFormData({ ...formData, fornecedor: e.target.value })}
                    placeholder="Nome da empresa"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {activeTab === 'infraestrutura' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Instalador
                    </label>
                    <input
                      type="text"
                      value={formData.instalador}
                      onChange={(e) => setFormData({ ...formData, instalador: e.target.value })}
                      placeholder="Quem faz a montagem"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Responsável Checagem *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.responsavel}
                    onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
                    placeholder="Quem valida"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Observações
                  </label>
                  <textarea
                    value={formData.observacoes}
                    onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                    placeholder="Informações adicionais..."
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Adicionar Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
