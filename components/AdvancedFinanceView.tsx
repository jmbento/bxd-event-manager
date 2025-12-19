
import React, { useState } from 'react';
import { DollarSign, TrendingUp, FileText, CheckCircle, AlertTriangle, Download, Upload, CreditCard, Plus, X } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { exportToXLSX } from '../services/exportService';
import { notifyError, notifySuccess } from '../services/notificationService';
import { PageBanner } from './PageBanner';


// Tipos de receitas e despesas reais de evento
interface Receita {
  id: string;
  origem: string; // Ex: Bar, Patrocínio, Ingressos, Food Truck
  valor: number;
  data: string;
  tipo: 'venda' | 'patrocinio' | 'bar' | 'outro';
}

// DADOS VAZIOS - Usuário adiciona suas próprias receitas
const receitasIniciais: Receita[] = [];

// Dados mensais calculados dinamicamente das receitas
const calcularReceitasMensais = (receitas: Receita[]) => {
  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const receitasPorMes: { [key: string]: number } = {};
  
  receitas.forEach(r => {
    const mesIndex = new Date(r.data).getMonth();
    const mesNome = meses[mesIndex];
    receitasPorMes[mesNome] = (receitasPorMes[mesNome] || 0) + r.valor;
  });
  
  return meses.map(mes => ({
    mes,
    valor: receitasPorMes[mes] || 0
  })).filter(item => item.valor > 0);
};

// Categorias de despesas vazias - calculadas das transações
const categoriasVazias = [
  { categoria: 'Pessoal', valor: 0, color: '#3b82f6' },
  { categoria: 'Marketing', valor: 0, color: '#8b5cf6' },
  { categoria: 'Logística', valor: 0, color: '#f59e0b' },
  { categoria: 'Bar', valor: 0, color: '#10b981' },
  { categoria: 'Estrutura', valor: 0, color: '#6366f1' },
];


export const AdvancedFinanceView: React.FC = () => {
  const [receitas, setReceitas] = useState<Receita[]>(receitasIniciais);
  const [expenseCategories] = useState(categoriasVazias);
  const [showModal, setShowModal] = useState(false);
  const [novaReceita, setNovaReceita] = useState({
    origem: '',
    valor: '',
    data: '',
    tipo: 'venda' as 'venda' | 'patrocinio' | 'bar' | 'outro',
    comprovante: ''
  });

  const receitasMensais = calcularReceitasMensais(receitas);
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
    if (!novaReceita.origem || valor <= 0 || !novaReceita.data) {
      notifyError('Preencha todos os campos obrigatórios e informe um valor válido.');
      return;
    }
    
    const novaReceitaObj: Receita = {
      id: `receita-${Date.now()}`,
      origem: novaReceita.origem,
      valor: valor,
      data: novaReceita.data,
      tipo: novaReceita.tipo
    };
    
    setReceitas([novaReceitaObj, ...receitas]);
    notifySuccess(`Receita registrada: ${novaReceita.origem} no valor de R$ ${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}.`);
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
      <PageBanner pageKey="advanced-finance" />
      
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
          <p className="text-3xl font-bold">
            {totalReceitas > 0 ? `R$ ${(totalReceitas / 1000).toFixed(0)}K` : 'R$ 0'}
          </p>
          <p className="text-sm opacity-90 mt-1">Receita Total</p>
          {totalReceitas === 0 && (
            <p className="text-xs mt-2 bg-white/20 px-2 py-1 rounded">Adicione receitas</p>
          )}
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <TrendingUp className="w-8 h-8 mb-2 opacity-80" />
          <p className="text-3xl font-bold">
            {totalDespesas > 0 ? `R$ ${(totalDespesas / 1000).toFixed(0)}K` : 'R$ 0'}
          </p>
          <p className="text-sm opacity-90 mt-1">Despesas Totais</p>
          {totalDespesas === 0 && (
            <p className="text-xs mt-2 bg-white/20 px-2 py-1 rounded">Use Controle Financeiro</p>
          )}
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <CreditCard className="w-8 h-8 mb-2 opacity-80" />
          <p className="text-3xl font-bold">0</p>
          <p className="text-sm opacity-90 mt-1">Fornecedores Pagos</p>
          <p className="text-xs mt-2 bg-white/20 px-2 py-1 rounded">Em breve</p>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-6 text-white">
          <FileText className="w-8 h-8 mb-2 opacity-80" />
          <p className="text-3xl font-bold">
            {totalReceitas + totalDespesas > 0 
              ? `${((totalDespesas / (totalReceitas + totalDespesas)) * 100).toFixed(0)}%`
              : '0%'
            }
          </p>
          <p className="text-sm opacity-90 mt-1">% Orçamento Utilizado</p>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evolução de Receitas */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Evolução de Receitas</h3>
          {receitasMensais.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={receitasMensais}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="mes" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
                <Bar dataKey="valor" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-slate-400">
              <div className="text-center">
                <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Nenhuma receita registrada</p>
                <p className="text-xs mt-1">Adicione receitas para ver o gráfico</p>
              </div>
            </div>
          )}
        </div>

        {/* Distribuição de Despesas */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Distribuição de Despesas</h3>
          {totalDespesas > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={expenseCategories.filter(c => c.valor > 0)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ categoria, percent }) => `${categoria} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="valor"
                >
                  {expenseCategories.filter(c => c.valor > 0).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-slate-400">
              <div className="text-center">
                <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Nenhuma despesa registrada</p>
                <p className="text-xs mt-1">Use o Controle Financeiro para adicionar</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reconciliação Bancária */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            Reconciliação Bancária
          </h3>
          <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded">Em breve</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-sm text-slate-600 font-medium mb-1">Reconciliadas</p>
            <p className="text-2xl font-bold text-slate-400">0</p>
            <p className="text-xs text-slate-400 mt-1">R$ 0,00</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-sm text-slate-600 font-medium mb-1">Pendentes</p>
            <p className="text-2xl font-bold text-slate-400">0</p>
            <p className="text-xs text-slate-400 mt-1">R$ 0,00</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-sm text-slate-600 font-medium mb-1">Divergências</p>
            <p className="text-2xl font-bold text-slate-400">0</p>
            <p className="text-xs text-slate-400 mt-1">R$ 0,00</p>
          </div>
        </div>
        <p className="text-xs text-slate-500 mt-4 text-center">
          Funcionalidade de reconciliação bancária será implementada em breve
        </p>
      </div>

      {/* Lista de Receitas Registradas */}
      {receitas.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Receitas Registradas ({receitas.length})</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Data</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Origem</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Tipo</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {receitas.map((receita) => (
                  <tr key={receita.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {new Date(receita.data).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">
                      {receita.origem}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        receita.tipo === 'venda' ? 'bg-blue-100 text-blue-700' :
                        receita.tipo === 'patrocinio' ? 'bg-purple-100 text-purple-700' :
                        receita.tipo === 'bar' ? 'bg-green-100 text-green-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {receita.tipo === 'venda' ? 'Venda' :
                         receita.tipo === 'patrocinio' ? 'Patrocínio' :
                         receita.tipo === 'bar' ? 'Bar' : 'Outro'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-green-700 text-right">
                      {receita.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}


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
