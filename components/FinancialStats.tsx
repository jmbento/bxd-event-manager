import React from 'react';
import { TrendingDown, TrendingUp, Wallet, AlertTriangle } from 'lucide-react';
import { FinancialKPI } from '../types';

interface Props {
  data: FinancialKPI;
}

export const FinancialStats: React.FC<Props> = ({ data }) => {
  const percentUsed = data.spendingLimit > 0 ? (data.totalSpent / data.spendingLimit) * 100 : 0;
  const isCritical = percentUsed > 90;

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {/* Card A: Budget */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 h-full w-1 bg-blue-500"></div>
        <div className="flex justify-between items-start mb-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Orçamento Total</p>
          <Wallet className="w-4 h-4 text-blue-500" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900">{formatCurrency(data.budgetTotal)}</h3>
        <p className="text-xs text-slate-400 mt-1">Planejado TSE</p>
      </div>

      {/* Card B: Spent Today */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 h-full w-1 bg-amber-500"></div>
        <div className="flex justify-between items-start mb-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Executado Hoje</p>
          <TrendingDown className="w-4 h-4 text-amber-500" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900">{formatCurrency(data.spentToday)}</h3>
        <p className="text-xs text-slate-400 mt-1">Abastecimento, Almoço...</p>
      </div>

      {/* Card C: Available */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 h-full w-1 bg-emerald-500"></div>
        <div className="flex justify-between items-start mb-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Disponível</p>
          <TrendingUp className="w-4 h-4 text-emerald-500" />
        </div>
        <h3 className="text-2xl font-bold text-emerald-700">{formatCurrency(data.balance)}</h3>
        <p className="text-xs text-slate-400 mt-1">Saldo em Caixa</p>
      </div>

      {/* Sidebar Chart: Limits */}
      <div className="bg-slate-800 p-5 rounded-xl shadow-md text-white flex flex-col justify-between">
        <div className="flex justify-between items-center mb-2">
          <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Teto de Gastos</p>
          {isCritical && <AlertTriangle className="w-4 h-4 text-red-400 animate-pulse" />}
        </div>
        
        <div className="flex items-end space-x-2 mt-2">
          <span className="text-xl font-bold">{percentUsed.toFixed(1)}%</span>
          <span className="text-xs text-slate-400 mb-1">utilizado</span>
        </div>

        <div className="w-full bg-slate-700 h-2 rounded-full mt-3 overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${isCritical ? 'bg-red-500' : 'bg-blue-400'}`}
            style={{ width: `${percentUsed}%` }}
          ></div>
        </div>
        <p className="text-[10px] text-slate-400 mt-2 text-right">Limite TSE: {formatCurrency(data.spendingLimit)}</p>
      </div>
    </div>
  );
};