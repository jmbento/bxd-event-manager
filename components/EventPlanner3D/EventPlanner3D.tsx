import React from 'react';
import { Box, Download, AlertTriangle } from 'lucide-react';

export const EventPlanner3D: React.FC = () => {
    return (
        <div className="h-full flex flex-col bg-gray-50">
            {/* Header com aviso */}
            <div className="bg-amber-50 border-b border-amber-200 p-4">
                <div className="flex items-center gap-3">
                    <AlertTriangle className="w-6 h-6 text-amber-600" />
                    <div>
                        <h3 className="font-semibold text-amber-800">Módulo 3D Temporariamente Inativo</h3>
                        <p className="text-sm text-amber-700">
                            O EventPlanner3D está sendo preparado. Dependências Three.js em instalação.
                        </p>
                    </div>
                </div>
            </div>

            {/* Conteúdo principal */}
            <div className="flex-1 flex items-center justify-center">
                <div className="text-center max-w-md p-8">
                    <Box className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">
                        Planejamento 3D em Desenvolvimento
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Esta funcionalidade permite criar layouts 3D completos com objetos, iluminação e materiais para eventos. 
                        Estamos finalizando as integrações com Three.js e Gemini Vision AI.
                    </p>
                    
                    <div className="bg-white rounded-lg border p-4 mb-4">
                        <h3 className="font-medium text-gray-800 mb-2">Recursos Planejados:</h3>
                        <ul className="text-sm text-gray-600 space-y-1 text-left">
                            <li>• Visualização 3D de layouts de evento</li>
                            <li>• Biblioteca de objetos (tendas, palcos, equipamentos)</li>
                            <li>• Análise de imagens com IA para layouts automáticos</li>
                            <li>• Cálculo de materiais e orçamento</li>
                            <li>• Exportação de renders e plantas</li>
                        </ul>
                    </div>

                    <div className="flex gap-2 justify-center">
                        <button
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                            onClick={() => alert('Funcionalidade em desenvolvimento. Previsão: próxima versão.')}
                        >
                            <Download className="w-4 h-4 inline mr-2" />
                            Instalar Dependências
                        </button>
                        <button
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                            onClick={() => window.history.back()}
                        >
                            Voltar ao Dashboard
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
