
import React, { useState } from 'react';
import { DollarSign, TrendingUp, FileText, CheckCircle, AlertTriangle, Download, Upload, CreditCard, Plus, X } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { exportToXLSX } from '../services/exportService';
import { notifyError, notifySuccess } from '../services/notificationService';


// Tipos de receitas e despesas reais de evento
interface Receita {
  id: string;
  origem: string; // Ex: Bar, Patrocínio, Ingressos, Food Truck
  valor: number;
  data: string;
  tipo: 'venda' | 'patrocinio' | 'bar' | 'outro';
}

const receitas: Receita[] = [
  { id: '1', origem: 'Bar', valor: 12000, data: '2025-11-25', tipo: 'bar' },
  { id: '2', origem: 'Patrocínio', valor: 50000, data: '2025-11-24', tipo: 'patrocinio' },
  { id: '3', origem: 'Ingressos', valor: 80000, data: '2025-11-26', tipo: 'venda' },
  { id: '4', origem: 'Food Truck', valor: 7000, data: '2025-11-23', tipo: 'outro' },
];

const receitasMensais = [
  { mes: 'Jul', valor: 18000 },
  { mes: 'Ago', valor: 25000 },
  { mes: 'Set', valor: 32000 },
  { mes: 'Out', valor: 45000 },
  { mes: 'Nov', valor: 58000 },
];

const expenseCategories = [
  { categoria: 'Pessoal', valor: 150000, color: '#3b82f6' },
  { categoria: 'Marketing', valor: 125000, color: '#8b5cf6' },
  { categoria: 'Logística', valor: 80000, color: '#f59e0b' },
  { categoria: 'Bar', valor: 40000, color: '#10b981' },
  { categoria: 'Estrutura', valor: 60000, color: '#6366f1' },
];


export const AdvancedFinanceView: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [novaReceita, setNovaReceita] = useState({
    origem: '',
    valor: '',
    data: '',
    tipo: 'venda' as 'venda' | 'patrocinio' | 'bar' | 'outro',
    comprovante: ''
  });

  const totalReceitas = receitas.reduce((sum, r) => sum + r.valor, 0);
  const totalDespesas = expenseCategories.reduce((sum, c) => sum + c.valor, 0);

  // Validação CPF (básica)
  const validateCPF = (cpf: string): boolean => {
    const cleanCPF = cpf.replace(/\D/g, '');
    if (cleanCPF.length !== 11) return false;
    // Validação básica - em produção usar algoritmo completo
    if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
    return true;
  };

  // Validação CNPJ (básica)
  const validateCNPJ = (cnpj: string): boolean => {
    const cleanCNPJ = cnpj.replace(/\D/g, '');
    if (cleanCNPJ.length !== 14) return false;
    if (/^(\d)\1{13}$/.test(cleanCNPJ)) return false;
    return true;
  };


  const handleSubmitReceita = (e: React.FormEvent) => {
    e.preventDefault();
    const valor = parseFloat(novaReceita.valor);
    if (!novaReceita.origem || valor <= 0) {
      notifyError('Preencha todos os campos e informe um valor válido.');
      return;
    }
    notifySuccess(`Receita registrada: ${novaReceita.origem} no valor de R$ ${valor.toFixed(2)}.`);
    setNovaReceita({ origem: '', valor: '', data: '', tipo: 'venda', comprovante: '' });
    setShowModal(false);
  };

  // Exportar relatório financeiro
  const handleExportFinanceiro = () => {
    exportToXLSX('relatorio-financeiro', [
      {
        name: 'Receitas',
        data: receitas.map((r) => ({
          Origem: r.origem,
          Valor: r.valor,
          Data: new Date(r.data).toLocaleDateString('pt-BR'),
          Tipo: r.tipo,
        })),
      },
      {
        name: 'Despesas',
        data: expenseCategories.map((category) => ({
          Categoria: category.categoria,
          Valor: category.valor,
        })),
      },
      {
        name: 'ReceitasMensais',
        data: receitasMensais.map((item) => ({
          Mes: item.mes,
          Valor: item.valor,
        })),
      },
    ]);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Financeiro Avançado</h2>
        <div className="flex gap-2">
          <button 
            onClick={handleExportFinanceiro}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Exportar Relatório Financeiro
          </button>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nova Receita
          </button>
        </div>
      </div>

      {/* KPIs Financeiros */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 text-white">
          <DollarSign className="w-8 h-8 mb-2 opacity-80" />
          <p className="text-3xl font-bold">R$ {(totalReceitas / 1000).toFixed(0)}K</p>
          <p className="text-sm opacity-90 mt-1">Receita Total</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <TrendingUp className="w-8 h-8 mb-2 opacity-80" />
          <p className="text-3xl font-bold">R$ {(totalDespesas / 1000).toFixed(0)}K</p>
          <p className="text-sm opacity-90 mt-1">Despesas Totais</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <CreditCard className="w-8 h-8 mb-2 opacity-80" />
          <p className="text-3xl font-bold">5</p>
          <p className="text-sm opacity-90 mt-1">Fornecedores Pagos</p>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-6 text-white">
          <FileText className="w-8 h-8 mb-2 opacity-80" />
          <p className="text-3xl font-bold">{((totalDespesas / (totalReceitas + totalDespesas)) * 100).toFixed(0)}%</p>
          <p className="text-sm opacity-90 mt-1">% Orçamento Utilizado</p>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evolução de Receitas */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Evolução de Receitas</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={receitasMensais}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="mes" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip formatter={(value) => `R$ ${value.toLocaleString()}`} />
              <Bar dataKey="valor" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Distribuição de Despesas */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Distribuição de Despesas</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={expenseCategories}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ categoria, percent }) => `${categoria} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="valor"
              >
                {expenseCategories.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `R$ ${value.toLocaleString()}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Reconciliação Bancária */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            Reconciliação Bancária
          </h3>
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">Reconciliar Tudo</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
            <p className="text-sm text-emerald-700 font-medium mb-1">Reconciliadas</p>
            <p className="text-2xl font-bold text-emerald-700">158</p>
            <p className="text-xs text-emerald-600 mt-1">R$ 342.500,00</p>
          </div>
          <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
            <p className="text-sm text-amber-700 font-medium mb-1">Pendentes</p>
            <p className="text-2xl font-bold text-amber-700">12</p>
            <p className="text-xs text-amber-600 mt-1">R$ 12.500,00</p>
          </div>
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <p className="text-sm text-red-700 font-medium mb-1">Divergências</p>
            <p className="text-2xl font-bold text-red-700">3</p>
            <p className="text-xs text-red-600 mt-1">R$ 2.100,00</p>
          </div>
        </div>
      </div>



      {/* Modal Nova Receita */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">Registrar Nova Receita</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600" title="Fechar">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmitReceita} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="receita-origem" className="block text-sm font-medium text-slate-700 mb-2">
                    Origem da Receita *
                  </label>
                  <input
                    id="receita-origem"
                    type="text"
                    value={novaReceita.origem}
                    onChange={(e) => setNovaReceita({...novaReceita, origem: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="receita-valor" className="block text-sm font-medium text-slate-700 mb-2">
                    Valor da Receita *
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-2 text-slate-600">R$</span>
                    <input
                      id="receita-valor"
                      type="number"
                      step="0.01"
                      value={novaReceita.valor}
                      onChange={(e) => setNovaReceita({...novaReceita, valor: e.target.value})}
                      className="w-full pl-12 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="receita-data" className="block text-sm font-medium text-slate-700 mb-2">
                    Data da Receita *
                  </label>
                  <input
                    id="receita-data"
                    type="date"
                    value={novaReceita.data}
                    onChange={(e) => setNovaReceita({...novaReceita, data: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="receita-tipo" className="block text-sm font-medium text-slate-700 mb-2">
                    Tipo de Receita *
                  </label>
                  <select
                    id="receita-tipo"
                    value={novaReceita.tipo}
                    onChange={(e) => setNovaReceita({...novaReceita, tipo: e.target.value as typeof novaReceita.tipo})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="venda">Venda</option>
                    <option value="patrocinio">Patrocínio</option>
                    <option value="bar">Bar</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="receita-comprovante" className="block text-sm font-medium text-slate-700 mb-2">
                    Comprovante (opcional)
                  </label>
                  <input
                    id="receita-comprovante"
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => setNovaReceita({...novaReceita, comprovante: e.target.files?.[0]?.name || ''})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
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
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                >
                  Registrar Receita
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
