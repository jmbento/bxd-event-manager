import React, { useState } from 'react';
import { Download, X, FileText, DollarSign } from 'lucide-react';
import type { MaterialItem } from '../../types/event3D';

interface Props {
    materials: MaterialItem[];
    projectName: string;
    onClose: () => void;
}

export const BOMTable: React.FC<Props> = ({ materials, projectName, onClose }) => {
    const [sortBy, setSortBy] = useState<'name' | 'quantity' | 'cost'>('name');

    const totalCost = materials.reduce((sum, item) => sum + item.totalCost, 0);
    const totalItems = materials.reduce((sum, item) => sum + item.quantity, 0);

    const sortedMaterials = [...materials].sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'quantity') return b.quantity - a.quantity;
        return b.totalCost - a.totalCost;
    });

    const handleExportCSV = () => {
        const csv = [
            ['Item', 'Quantidade', 'Custo Unitário', 'Custo Total', 'Dimensões'].join(','),
            ...materials.map(item => [
                item.name,
                item.quantity,
                `R$ ${item.unitCost.toFixed(2)}`,
                `R$ ${item.totalCost.toFixed(2)}`,
                `${item.dimensions.width}x${item.dimensions.height}x${item.dimensions.depth}m`
            ].join(','))
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `BOM_${projectName}_${Date.now()}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const handleExportPDF = () => {
        // Gerar HTML para impressão
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Lista de Materiais - ${projectName}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #0ea5e9; border-bottom: 2px solid #0ea5e9; padding-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background: #f1f5f9; padding: 12px; text-align: left; border: 1px solid #e2e8f0; }
          td { padding: 10px; border: 1px solid #e2e8f0; }
          .total { font-weight: bold; background: #f8fafc; }
          .footer { margin-top: 30px; color: #64748b; font-size: 0.9em; }
        </style>
      </head>
      <body>
        <h1>📋 Lista de Materiais (BOM)</h1>
        <p><strong>Projeto:</strong> ${projectName}</p>
        <p><strong>Data:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
        
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Quantidade</th>
              <th>Dimensões</th>
              <th>Custo Unit.</th>
              <th>Custo Total</th>
            </tr>
          </thead>
          <tbody>
            ${materials.map(item => `
              <tr>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>${item.dimensions.width}x${item.dimensions.height}x${item.dimensions.depth}m</td>
                <td>R$ ${item.unitCost.toFixed(2)}</td>
                <td>R$ ${item.totalCost.toFixed(2)}</td>
              </tr>
            `).join('')}
            <tr class="total">
              <td colspan="4"><strong>TOTAL</strong></td>
              <td><strong>R$ ${totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></td>
            </tr>
          </tbody>
        </table>
        
        <div class="footer">
          <p>Gerado automaticamente por BXD Event Planner 3D</p>
        </div>
      </body>
      </html>
    `;

        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.print();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <FileText className="w-8 h-8" />
                        <div>
                            <h2 className="text-2xl font-bold">Lista de Materiais (BOM)</h2>
                            <p className="text-blue-100 text-sm">{projectName}</p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full hover:bg-white/20 flex items-center justify-center transition"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 p-6 bg-slate-50 border-b">
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                        <div className="text-sm text-slate-500">Total de Itens</div>
                        <div className="text-3xl font-bold text-blue-600">{totalItems}</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                        <div className="text-sm text-slate-500">Custo Total</div>
                        <div className="text-3xl font-bold text-green-600">
                            R$ {totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                    </div>
                </div>

                {/* Sorting */}
                <div className="p-4 border-b flex items-center gap-2">
                    <span className="text-sm text-slate-600">Ordenar por:</span>
                    <button
                        onClick={() => setSortBy('name')}
                        className={`px-3 py-1 rounded text-sm ${sortBy === 'name' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100'}`}
                    >
                        Nome
                    </button>
                    <button
                        onClick={() => setSortBy('quantity')}
                        className={`px-3 py-1 rounded text-sm ${sortBy === 'quantity' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100'}`}
                    >
                        Quantidade
                    </button>
                    <button
                        onClick={() => setSortBy('cost')}
                        className={`px-3 py-1 rounded text-sm ${sortBy === 'cost' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100'}`}
                    >
                        Custo
                    </button>
                </div>

                {/* Table */}
                <div className="flex-1 overflow-auto p-6">
                    <table className="w-full">
                        <thead className="sticky top-0 bg-slate-100">
                            <tr>
                                <th className="text-left p-3 text-sm font-semibold text-slate-700">Item</th>
                                <th className="text-right p-3 text-sm font-semibold text-slate-700">Qtd</th>
                                <th className="text-right p-3 text-sm font-semibold text-slate-700">Dimensões</th>
                                <th className="text-right p-3 text-sm font-semibold text-slate-700">Unit.</th>
                                <th className="text-right p-3 text-sm font-semibold text-slate-700">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedMaterials.map((item, index) => (
                                <tr key={index} className="border-b hover:bg-slate-50">
                                    <td className="p-3">
                                        <div className="font-medium">{item.name}</div>
                                        <div className="text-xs text-slate-500">{item.type}</div>
                                    </td>
                                    <td className="text-right p-3 font-semibold">{item.quantity}</td>
                                    <td className="text-right p-3 text-sm text-slate-600">
                                        {item.dimensions.width}×{item.dimensions.height}×{item.dimensions.depth}m
                                    </td>
                                    <td className="text-right p-3 text-sm">
                                        R$ {item.unitCost.toFixed(2)}
                                    </td>
                                    <td className="text-right p-3 font-bold text-green-600">
                                        R$ {item.totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer Actions */}
                <div className="p-6 bg-slate-50 border-t flex items-center justify-between">
                    <div className="text-sm text-slate-600">
                        {materials.length} item(ns) na lista
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={handleExportCSV}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
                        >
                            <Download className="w-4 h-4" />
                            Exportar CSV
                        </button>

                        <button
                            onClick={handleExportPDF}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                        >
                            <FileText className="w-4 h-4" />
                            Imprimir PDF
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
