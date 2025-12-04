
import React, { useState } from 'react';
import { DollarSign, TrendingUp, FileText, CheckCircle, AlertTriangle, Download, Upload, CreditCard, Plus, X } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { exportToXLSX } from '../services/exportService';
import { notifyError, notifySuccess } from '../services/notificationService';

interface Donation {
  id: string;
  donor: string;
  amount: number;
  date: string;
  type: 'pix' | 'boleto' | 'transferencia' | 'especie';
  status: 'confirmado' | 'pendente';
}

const mockDonations: Donation[] = [
  { id: '1', donor: 'João Silva', amount: 5000, date: '2025-11-25', type: 'pix', status: 'confirmado' },
  { id: '2', donor: 'Maria Santos', amount: 2000, date: '2025-11-24', type: 'transferencia', status: 'confirmado' },
  { id: '3', donor: 'Pedro Costa', amount: 1000, date: '2025-11-26', type: 'boleto', status: 'pendente' },
  { id: '4', donor: 'Ana Lima', amount: 3000, date: '2025-11-23', type: 'pix', status: 'confirmado' },
];

const monthlyDonations = [
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
];

export const AdvancedFinanceView: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [newDonation, setNewDonation] = useState({
    donor: '',
    amount: '',
    date: '',
    paymentType: 'pix' as 'pix' | 'boleto' | 'transferencia' | 'especie',
    cpfCnpj: '',
    receipt: ''
  });

  const totalDonations = mockDonations.reduce((sum, d) => sum + d.amount, 0);
  const totalExpenses = expenseCategories.reduce((sum, c) => sum + c.valor, 0);

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

  const handleSubmitDonation = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar CPF/CNPJ
    const cleanDoc = newDonation.cpfCnpj.replace(/\D/g, '');
    const isValid = cleanDoc.length === 11 ? validateCPF(cleanDoc) : validateCNPJ(cleanDoc);
    
    if (!isValid) {
      notifyError('CPF/CNPJ inválido. Verifique o documento informado.');
      return;
    }

    // Validar valor mínimo
    const amount = parseFloat(newDonation.amount);
    if (amount <= 0) {
      notifyError('O valor da doação deve ser maior que zero.');
      return;
    }

    notifySuccess(`Doação registrada para ${newDonation.donor} no valor de R$ ${amount.toFixed(2)}.`);
    
    // Resetar e fechar
    setNewDonation({
      donor: '',
      amount: '',
      date: '',
      paymentType: 'pix',
      cpfCnpj: '',
      receipt: ''
    });
    setShowModal(false);
  };

  const handleExportTSE = () => {
    exportToXLSX('prestacao-tse', [
      {
        name: 'Doacoes',
        data: mockDonations.map((donation) => ({
          Doador: donation.donor,
          Valor: donation.amount,
          Data: new Date(donation.date).toLocaleDateString('pt-BR'),
          Tipo: donation.type,
          Status: donation.status,
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
        name: 'DoacoesMensais',
        data: monthlyDonations.map((item) => ({
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
            onClick={handleExportTSE}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Exportar Prestação TSE
          </button>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nova Doação
          </button>
        </div>
      </div>

      {/* KPIs Financeiros */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 text-white">
          <DollarSign className="w-8 h-8 mb-2 opacity-80" />
          <p className="text-3xl font-bold">R$ {(totalDonations / 1000).toFixed(0)}K</p>
          <p className="text-sm opacity-90 mt-1">Total de Doações</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <TrendingUp className="w-8 h-8 mb-2 opacity-80" />
          <p className="text-3xl font-bold">R$ {(totalExpenses / 1000).toFixed(0)}K</p>
          <p className="text-sm opacity-90 mt-1">Total de Despesas</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <CreditCard className="w-8 h-8 mb-2 opacity-80" />
          <p className="text-3xl font-bold">{mockDonations.length}</p>
          <p className="text-sm opacity-90 mt-1">Doadores</p>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-6 text-white">
          <FileText className="w-8 h-8 mb-2 opacity-80" />
          <p className="text-3xl font-bold">96%</p>
          <p className="text-sm opacity-90 mt-1">Conformidade TSE</p>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evolução de Doações */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Evolução de Doações</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlyDonations}>
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

      {/* Últimas Doações */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Últimas Doações</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Doador</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Valor</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Data</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Tipo</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {mockDonations.map((donation) => (
                <tr key={donation.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm text-slate-800">{donation.donor}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-emerald-600">
                    R$ {donation.amount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {new Date(donation.date).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
                      {donation.type.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {donation.status === 'confirmado' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-emerald-100 text-emerald-700 border border-emerald-200">
                        <CheckCircle className="w-3 h-3" />
                        Confirmado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200">
                        <AlertTriangle className="w-3 h-3" />
                        Pendente
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Prestação de Contas TSE */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-500 rounded-lg">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Prestação de Contas Automática para o TSE</h3>
            <p className="text-sm text-slate-600 mb-3">
              Sistema automatizado gera relatórios no formato exigido pelo TSE, incluindo todas as doações, 
              despesas e notas fiscais necessárias para compliance total.
            </p>
            <div className="flex items-center gap-3">
              <button onClick={handleExportTSE} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                <Download className="w-4 h-4" />
                Gerar Relatório TSE
              </button>
              <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200">
                <CheckCircle className="w-4 h-4" />
                <span className="font-medium">96% Completo</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Nova Doação */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">Registrar Nova Doação</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600" title="Fechar">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmitDonation} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="donation-donor" className="block text-sm font-medium text-slate-700 mb-2">
                    Nome do Doador *
                  </label>
                  <input
                    id="donation-donor"
                    type="text"
                    value={newDonation.donor}
                    onChange={(e) => setNewDonation({...newDonation, donor: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="donation-document" className="block text-sm font-medium text-slate-700 mb-2">
                    CPF/CNPJ *
                  </label>
                  <input
                    id="donation-document"
                    type="text"
                    value={newDonation.cpfCnpj}
                    onChange={(e) => setNewDonation({...newDonation, cpfCnpj: e.target.value})}
                    placeholder="000.000.000-00"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="donation-amount" className="block text-sm font-medium text-slate-700 mb-2">
                    Valor da Doação *
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-2 text-slate-600">R$</span>
                    <input
                      id="donation-amount"
                      type="number"
                      step="0.01"
                      value={newDonation.amount}
                      onChange={(e) => setNewDonation({...newDonation, amount: e.target.value})}
                      className="w-full pl-12 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="donation-date" className="block text-sm font-medium text-slate-700 mb-2">
                    Data da Doação *
                  </label>
                  <input
                    id="donation-date"
                    type="date"
                    value={newDonation.date}
                    onChange={(e) => setNewDonation({...newDonation, date: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="donation-payment-type" className="block text-sm font-medium text-slate-700 mb-2">
                    Forma de Pagamento *
                  </label>
                  <select
                    id="donation-payment-type"
                    value={newDonation.paymentType}
                    onChange={(e) => setNewDonation({...newDonation, paymentType: e.target.value as typeof newDonation.paymentType})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="pix">PIX</option>
                    <option value="boleto">Boleto</option>
                    <option value="transferencia">Transferência</option>
                    <option value="especie">Espécie</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="donation-receipt" className="block text-sm font-medium text-slate-700 mb-2">
                    Comprovante (opcional)
                  </label>
                  <input
                    id="donation-receipt"
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => setNewDonation({...newDonation, receipt: e.target.files?.[0]?.name || ''})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-900">Atenção: Compliance TSE</p>
                    <p className="text-xs text-amber-700 mt-1">
                      Todas as doações serão automaticamente incluídas na prestação de contas ao TSE. 
                      Certifique-se de que os dados estão corretos e completos.
                    </p>
                  </div>
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
                  Registrar Doação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
