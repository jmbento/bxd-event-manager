import React from 'react';
import { Box, Cuboid, Wrench } from 'lucide-react';
import { PageBanner } from '../PageBanner';

export const EventPlanner3D: React.FC = () => {
    return (
        <div className="space-y-6">
            <PageBanner pageKey="planner3d" />
            
            {/* Imagem de Em Desenvolvimento */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border-2 border-dashed border-blue-300 p-12">
                <div className="max-w-3xl mx-auto text-center">
                    {/* Ícone Grande */}
                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-32 h-32 bg-blue-200 rounded-full blur-3xl opacity-50"></div>
                        </div>
                        <div className="relative flex items-center justify-center gap-4">
                            <Cuboid className="w-20 h-20 text-blue-500" />
                            <Box className="w-16 h-16 text-purple-500" />
                        </div>
                    </div>

                    {/* Título */}
                    <h2 className="text-4xl font-bold text-slate-900 mb-3">
                        Planejador 3D
                    </h2>
                    
                    {/* Badge "Em Desenvolvimento" */}
                    <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-6 py-3 rounded-full mb-6 border border-amber-300">
                        <Wrench className="w-5 h-5" />
                        <span className="font-semibold text-lg">Em Desenvolvimento</span>
                    </div>

                    {/* Descrição */}
                    <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                        Estamos construindo uma experiência revolucionária de planejamento 3D para eventos.<br/>
                        Em breve você poderá visualizar e organizar todo o seu evento em três dimensões.
                    </p>

                    {/* Features Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        <div className="bg-white rounded-xl p-6 border border-slate-200 text-left">
                            <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                                <Box className="w-5 h-5 text-blue-600" />
                                Biblioteca de Objetos 3D
                            </h3>
                            <p className="text-sm text-slate-600">
                                Palcos, tendas, mobiliário, equipamentos de áudio e iluminação
                            </p>
                        </div>

                        <div className="bg-white rounded-xl p-6 border border-slate-200 text-left">
                            <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                                <Cuboid className="w-5 h-5 text-purple-600" />
                                Visualização Realista
                            </h3>
                            <p className="text-sm text-slate-600">
                                Renders fotorrealistas com materiais, texturas e iluminação
                            </p>
                        </div>

                        <div className="bg-white rounded-xl p-6 border border-slate-200 text-left">
                            <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                                <Box className="w-5 h-5 text-green-600" />
                                IA para Layouts
                            </h3>
                            <p className="text-sm text-slate-600">
                                Gemini Vision AI analisa fotos e cria layouts automáticos
                            </p>
                        </div>

                        <div className="bg-white rounded-xl p-6 border border-slate-200 text-left">
                            <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                                <Cuboid className="w-5 h-5 text-orange-600" />
                                Exportação Profissional
                            </h3>
                            <p className="text-sm text-slate-600">
                                Plantas baixas, renders 360° e lista de materiais (BOM)
                            </p>
                        </div>
                    </div>

                    {/* Tech Stack Info */}
                    <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                        <p className="text-sm text-slate-500 mb-2">
                            <strong className="text-slate-700">Tecnologias:</strong>
                        </p>
                        <div className="flex flex-wrap gap-2 justify-center">
                            <span className="px-3 py-1 bg-white rounded-lg text-xs font-medium text-slate-700 border border-slate-200">
                                Three.js
                            </span>
                            <span className="px-3 py-1 bg-white rounded-lg text-xs font-medium text-slate-700 border border-slate-200">
                                React Three Fiber
                            </span>
                            <span className="px-3 py-1 bg-white rounded-lg text-xs font-medium text-slate-700 border border-slate-200">
                                Gemini Vision AI
                            </span>
                            <span className="px-3 py-1 bg-white rounded-lg text-xs font-medium text-slate-700 border border-slate-200">
                                WebGL
                            </span>
                        </div>
                    </div>

                    {/* Nota */}
                    <p className="text-xs text-slate-400 mt-6">
                        💡 Este módulo será liberado em breve com todos os recursos listados acima
                    </p>
                </div>
                    </p>
                </div>
            </div>
        </div>
    );
};
