import React, { useState } from 'react';
import { Camera, Download, X, MapPin, Plus } from 'lucide-react';
import * as THREE from 'three';

interface Props {
    onGenerate: (positions: THREE.Vector3[]) => void;
    onClose: () => void;
}

export const PanoramaGenerator: React.FC<Props> = ({ onGenerate, onClose }) => {
    const [cameraPositions, setCameraPositions] = useState<THREE.Vector3[]>([
        new THREE.Vector3(0, 2, 0) // Posição padrão (centro, altura dos olhos)
    ]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [generating, setGenerating] = useState(false);

    const addPosition = () => {
        setCameraPositions([...cameraPositions, new THREE.Vector3(0, 2, 0)]);
        setSelectedIndex(cameraPositions.length);
    };

    const removePosition = (index: number) => {
        if (cameraPositions.length === 1) return; // Manter pelo menos uma
        const newPositions = cameraPositions.filter((_, i) => i !== index);
        setCameraPositions(newPositions);
        if (selectedIndex >= newPositions.length) {
            setSelectedIndex(newPositions.length - 1);
        }
    };

    const updatePosition = (index: number, axis: 'x' | 'y' | 'z', value: number) => {
        const newPositions = [...cameraPositions];
        newPositions[index][axis] = value;
        setCameraPositions(newPositions);
    };

    const handleGenerate = () => {
        setGenerating(true);
        onGenerate(cameraPositions);
        // O loading será desativado pelo componente pai
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white p-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Camera className="w-8 h-8" />
                        <div>
                            <h2 className="text-2xl font-bold">Panorama 360°</h2>
                            <p className="text-cyan-100 text-sm">Tour Virtual Imersivo</p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full hover:bg-white/20 flex items-center justify-center transition"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Info */}
                <div className="p-6 bg-cyan-50 border-b">
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center text-white flex-shrink-0">
                            <Camera className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-cyan-900">Como Funciona</h3>
                            <p className="text-sm text-cyan-700 mt-1">
                                Defina os pontos de vista onde deseja capturar panoramas 360°.
                                Cada posição gerará uma imagem equirectangular para visualização VR.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Camera Positions */}
                <div className="flex-1 overflow-auto p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-lg">Posições da Câmera</h3>
                        <button
                            onClick={addPosition}
                            className="flex items-center gap-2 px-3 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg text-sm transition"
                        >
                            <Plus className="w-4 h-4" />
                            Adicionar Ponto
                        </button>
                    </div>

                    <div className="space-y-3">
                        {cameraPositions.map((pos, index) => (
                            <div
                                key={index}
                                className={`p-4 rounded-lg border-2 transition ${selectedIndex === index
                                        ? 'border-cyan-500 bg-cyan-50'
                                        : 'border-slate-200 hover:border-cyan-300'
                                    }`}
                                onClick={() => setSelectedIndex(index)}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-5 h-5 text-cyan-600" />
                                        <span className="font-semibold">Ponto {index + 1}</span>
                                    </div>

                                    {cameraPositions.length > 1 && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removePosition(index);
                                            }}
                                            className="p-1 text-red-500 hover:bg-red-50 rounded transition"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>

                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <label className="text-xs text-slate-600 block mb-1">X (lateral)</label>
                                        <input
                                            type="number"
                                            value={pos.x}
                                            onChange={(e) => updatePosition(index, 'x', parseFloat(e.target.value))}
                                            step="0.5"
                                            className="w-full px-2 py-1 border rounded text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-xs text-slate-600 block mb-1">Y (altura)</label>
                                        <input
                                            type="number"
                                            value={pos.y}
                                            onChange={(e) => updatePosition(index, 'y', parseFloat(e.target.value))}
                                            step="0.5"
                                            min="0.5"
                                            className="w-full px-2 py-1 border rounded text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-xs text-slate-600 block mb-1">Z (frente)</label>
                                        <input
                                            type="number"
                                            value={pos.z}
                                            onChange={(e) => updatePosition(index, 'z', parseFloat(e.target.value))}
                                            step="0.5"
                                            className="w-full px-2 py-1 border rounded text-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 bg-slate-50 border-t">
                    <div className="text-xs text-slate-600 mb-4">
                        <strong>Dica:</strong> Posicione em pontos estratégicos (entrada, palco, meio do público)
                        para criar tour virtual completo
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-3 border-2 border-slate-300 hover:border-slate-400 rounded-lg font-semibold transition"
                        >
                            Cancelar
                        </button>

                        <button
                            onClick={handleGenerate}
                            disabled={generating}
                            className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 disabled:opacity-50 text-white rounded-lg font-semibold transition flex items-center justify-center gap-2"
                        >
                            {generating ? (
                                <>Gerando...</>
                            ) : (
                                <>
                                    <Download className="w-5 h-5" />
                                    Gerar {cameraPositions.length} Panorama{cameraPositions.length > 1 ? 's' : ''}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
