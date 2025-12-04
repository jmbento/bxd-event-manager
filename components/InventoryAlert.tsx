import React, { useState } from 'react';
import { AlertCircle, Package, X, Send } from 'lucide-react';
import { InventoryItem } from '../types';

interface Props {
  items: InventoryItem[];
}

export const InventoryAlert: React.FC<Props> = ({ items }) => {
  const lowStockItems = items.filter(i => i.status === 'low' || i.status === 'critical');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [requestData, setRequestData] = useState({
    quantity: '',
    urgency: 'normal' as 'normal' | 'urgente',
    notes: ''
  });

  if (lowStockItems.length === 0) return null;

  const handleRequestClick = (item: InventoryItem) => {
    setSelectedItem(item);
    setRequestData({ quantity: '', urgency: 'normal', notes: '' });
    setShowRequestModal(true);
  };

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    // Simular envio de solicitação
    alert(`✅ Solicitação enviada!\n\nItem: ${selectedItem?.name}\nQuantidade: ${requestData.quantity}\nUrgência: ${requestData.urgency}\nLocal: ${selectedItem?.location}\n\nA equipe de logística foi notificada.`);
    setShowRequestModal(false);
    setSelectedItem(null);
  };

  return (
    <>
      <div className="mb-6">
        {lowStockItems.map(item => (
          <div key={item.id} className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center mb-2 sm:mb-0">
              <div className="bg-amber-100 p-2 rounded-full mr-3">
                  <Package className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-amber-900">
                  Atenção: Estoque de '{item.name}' baixo em {item.location}.
                </p>
                <p className="text-xs text-amber-700">
                  Restam apenas {item.quantity} unidades.
                </p>
              </div>
            </div>
            <button 
              type="button"
              onClick={() => handleRequestClick(item)}
              className="text-sm bg-white border border-amber-200 text-amber-800 font-medium px-4 py-2 rounded hover:bg-amber-100 transition-colors shadow-sm focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
              aria-label={`Solicitar reposição para ${item.name} (${item.quantity} unidades restantes)`}
              title={`Solicitar reposição de ${item.name}`}
            >
              Solicitar Reposição
            </button>
          </div>
        ))}
      </div>

      {/* Modal de Solicitação */}
      {showRequestModal && selectedItem && (
        <div 
          className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reposition-modal-title"
          aria-describedby="reposition-modal-description"
        >
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h3 id="reposition-modal-title" className="text-lg font-bold text-slate-800">Solicitar Reposição</h3>
              <button 
                type="button"
                onClick={() => setShowRequestModal(false)} 
                className="text-slate-400 hover:text-slate-600 p-1 rounded focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label="Fechar modal de solicitação"
                title="Fechar"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleSubmitRequest} className="p-6 space-y-4">
              <div id="reposition-modal-description" className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-sm font-semibold text-amber-900">{selectedItem.name}</p>
                <p className="text-xs text-amber-700 mt-1">
                  Local: {selectedItem.location} • Estoque atual: {selectedItem.quantity} unidades
                </p>
              </div>

              <div>
                <label htmlFor="quantity-input" className="block text-sm font-medium text-slate-700 mb-2">
                  Quantidade Necessária
                </label>
                <input
                  id="quantity-input"
                  type="number"
                  value={requestData.quantity}
                  onChange={(e) => setRequestData({...requestData, quantity: e.target.value})}
                  placeholder="Ex: 500"
                  min="1"
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  aria-describedby="quantity-help"
                />
                <p id="quantity-help" className="text-xs text-slate-500 mt-1">Digite a quantidade que deseja solicitar</p>
              </div>

              <div>
                <label htmlFor="urgency-select" className="block text-sm font-medium text-slate-700 mb-2">
                  Nível de Urgência
                </label>
                <select
                  id="urgency-select"
                  value={requestData.urgency}
                  onChange={(e) => setRequestData({...requestData, urgency: e.target.value as 'normal' | 'urgente'})}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  aria-describedby="urgency-help"
                >
                  <option value="normal">Normal (3-5 dias)</option>
                  <option value="urgente">Urgente (24h)</option>
                </select>
                <p id="urgency-help" className="text-xs text-slate-500 mt-1">Defina a prioridade da solicitação</p>
              </div>

              <div>
                <label htmlFor="notes-textarea" className="block text-sm font-medium text-slate-700 mb-2">
                  Observações (opcional)
                </label>
                <textarea
                  id="notes-textarea"
                  value={requestData.notes}
                  onChange={(e) => setRequestData({...requestData, notes: e.target.value})}
                  placeholder="Ex: Necessário para evento no próximo fim de semana..."
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  aria-describedby="notes-help"
                />
                <p id="notes-help" className="text-xs text-slate-500 mt-1">Adicione informações relevantes sobre a solicitação</p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  aria-label="Cancelar solicitação de reposição"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                  aria-label={`Enviar solicitação de reposição para ${selectedItem.name}`}
                >
                  <Send className="w-4 h-4" aria-hidden="true" />
                  Enviar Solicitação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};