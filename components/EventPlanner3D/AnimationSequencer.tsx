import React, { useState } from 'react';
import { Film, Play, Download, Plus, Trash2, X } from 'lucide-react';
import type { AnimationSequence, Keyframe } from '../../services/animationSequencer';
import { ANIMATION_PRESETS } from '../../services/animationSequencer';
import * as THREE from 'three';

interface Props {
    onGenerate: (sequence: AnimationSequence) => void;
    onClose: () => void;
}

export const AnimationSequencer: React.FC<Props> = ({ onGenerate, onClose }) => {
    const [sequence, setSequence] = useState<AnimationSequence>({
        name: 'My Animation',
        duration: 10, // 10 segundos
        fps: 30,
        resolution: { width: 1920, height: 1080 },
        keyframes: [
            {
                time: 0,
                cameraPosition: new THREE.Vector3(10, 5, 10),
                cameraTarget: new THREE.Vector3(0, 0, 0),
                fov: 50
            },
            {
                time: 10,
                cameraPosition: new THREE.Vector3(-10, 5, -10),
                cameraTarget: new THREE.Vector3(0, 0, 0),
                fov: 50
            }
        ]
    });

    const [selectedKeyframe, setSelectedKeyframe] = useState(0);

    const addKeyframe = () => {
        const lastKeyframe = sequence.keyframes[sequence.keyframes.length - 1];
        const newTime = lastKeyframe.time + 2;

        setSequence(prev => ({
            ...prev,
            keyframes: [...prev.keyframes, {
                time: newTime,
                cameraPosition: lastKeyframe.cameraPosition.clone(),
                cameraTarget: lastKeyframe.cameraTarget.clone(),
                fov: lastKeyframe.fov || 50
            }]
        }));
    };

    const removeKeyframe = (index: number) => {
        if (sequence.keyframes.length <= 2) return; // Mínimo 2 keyframes

        setSequence(prev => ({
            ...prev,
            keyframes: prev.keyframes.filter((_, i) => i !== index)
        }));

        if (selectedKeyframe >= sequence.keyframes.length - 1) {
            setSelectedKeyframe(sequence.keyframes.length - 2);
        }
    };

    const updateKeyframe = (index: number, updates: Partial<Keyframe>) => {
        setSequence(prev => ({
            ...prev,
            keyframes: prev.keyframes.map((kf, i) =>
                i === index ? { ...kf, ...updates } : kf
            )
        }));
    };

    const applyPreset = (presetName: 'orbitAround' | 'flythrough' | 'zoomIn') => {
        const center = new THREE.Vector3(0, 0, 0);
        let preset: AnimationSequence;

        switch (presetName) {
            case 'orbitAround':
                preset = ANIMATION_PRESETS.orbitAround(center, 15, sequence.duration);
                break;
            case 'flythrough':
                preset = ANIMATION_PRESETS.flythrough(
                    new THREE.Vector3(20, 10, 20),
                    new THREE.Vector3(-20, 5, -20),
                    sequence.duration
                );
                break;
            case 'zoomIn':
                preset = ANIMATION_PRESETS.zoomIn(center, sequence.duration);
                break;
        }

        setSequence(prev => ({ ...prev, keyframes: preset.keyframes }));
    };

    const totalFrames = Math.ceil(sequence.duration * sequence.fps);
    const estimatedSize = (totalFrames * 2) / 1024; // ~2MB por frame em PNG

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-pink-600 to-purple-600 text-white p-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Film className="w-8 h-8" />
                        <div>
                            <h2 className="text-2xl font-bold">Animation Sequencer</h2>
                            <p className="text-pink-100 text-sm">Gera frames para montagem com IA (Runway, Pika, etc.)</p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full hover:bg-white/20 flex items-center justify-center transition"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Config Rápida */}
                <div className="p-6 bg-pink-50 border-b grid grid-cols-4 gap-4">
                    <div>
                        <label className="text-xs font-semibold text-pink-900 block mb-1">Nome</label>
                        <input
                            type="text"
                            value={sequence.name}
                            onChange={(e) => setSequence(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full px-3 py-2 border rounded-lg text-sm"
                        />
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-pink-900 block mb-1">Duração (s)</label>
                        <input
                            type="number"
                            value={sequence.duration}
                            onChange={(e) => setSequence(prev => ({ ...prev, duration: parseFloat(e.target.value) }))}
                            min="1"
                            step="1"
                            className="w-full px-3 py-2 border rounded-lg text-sm"
                        />
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-pink-900 block mb-1">FPS</label>
                        <select
                            value={sequence.fps}
                            onChange={(e) => setSequence(prev => ({ ...prev, fps: parseInt(e.target.value) }))}
                            className="w-full px-3 py-2 border rounded-lg text-sm"
                        >
                            <option value={24}>24 (Cinema)</option>
                            <option value={30}>30 (Web)</option>
                            <option value={60}>60 (Smooth)</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-pink-900 block mb-1">Resolução</label>
                        <select
                            onChange={(e) => {
                                const [w, h] = e.target.value.split('x').map(Number);
                                setSequence(prev => ({ ...prev, resolution: { width: w, height: h } }));
                            }}
                            className="w-full px-3 py-2 border rounded-lg text-sm"
                        >
                            <option value="1920x1080">1080p (Full HD)</option>
                            <option value="2560x1440">1440p (2K)</option>
                            <option value="3840x2160">2160p (4K)</option>
                        </select>
                    </div>
                </div>

                {/* Presets */}
                <div className="p-4 bg-slate-50 border-b">
                    <div className="text-xs font-semibold text-slate-700 mb-2">Presets Rápidos:</div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => applyPreset('orbitAround')}
                            className="px-3 py-2 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-lg text-sm transition"
                        >
                            🔄 Orbit Around
                        </button>
                        <button
                            onClick={() => applyPreset('flythrough')}
                            className="px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg text-sm transition"
                        >
                            ✈️ Flythrough
                        </button>
                        <button
                            onClick={() => applyPreset('zoomIn')}
                            className="px-3 py-2 bg-green-100 hover:bg-green-200 text-green-800 rounded-lg text-sm transition"
                        >
                            🔍 Zoom In
                        </button>
                    </div>
                </div>

                {/* Timeline */}
                <div className="flex-1 overflow-auto p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-lg">Keyframes ({sequence.keyframes.length})</h3>
                        <button
                            onClick={addKeyframe}
                            className="flex items-center gap-2 px-3 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg text-sm transition"
                        >
                            <Plus className="w-4 h-4" />
                            Adicionar Keyframe
                        </button>
                    </div>

                    <div className="space-y-3">
                        {sequence.keyframes.map((kf, index) => (
                            <div
                                key={index}
                                className={`p-4 rounded-lg border-2 transition cursor-pointer ${selectedKeyframe === index
                                        ? 'border-pink-500 bg-pink-50'
                                        : 'border-slate-200 hover:border-pink-300'
                                    }`}
                                onClick={() => setSelectedKeyframe(index)}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-pink-500 text-white flex items-center justify-center font-bold text-sm">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <div className="font-semibold">Keyframe {index + 1}</div>
                                            <div className="text-xs text-slate-500">{kf.time.toFixed(1)}s</div>
                                        </div>
                                    </div>

                                    {sequence.keyframes.length > 2 && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeKeyframe(index);
                                            }}
                                            className="p-1 text-red-500 hover:bg-red-50 rounded transition"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-xs font-semibold text-slate-600 mb-2">Posição da Câmera</div>
                                        <div className="grid grid-cols-3 gap-2">
                                            <input
                                                type="number"
                                                placeholder="X"
                                                value={kf.cameraPosition.x}
                                                onChange={(e) => {
                                                    const newPos = kf.cameraPosition.clone();
                                                    newPos.x = parseFloat(e.target.value);
                                                    updateKeyframe(index, { cameraPosition: newPos });
                                                }}
                                                className="px-2 py-1 border rounded text-xs"
                                                step="0.5"
                                            />
                                            <input
                                                type="number"
                                                placeholder="Y"
                                                value={kf.cameraPosition.y}
                                                onChange={(e) => {
                                                    const newPos = kf.cameraPosition.clone();
                                                    newPos.y = parseFloat(e.target.value);
                                                    updateKeyframe(index, { cameraPosition: newPos });
                                                }}
                                                className="px-2 py-1 border rounded text-xs"
                                                step="0.5"
                                            />
                                            <input
                                                type="number"
                                                placeholder="Z"
                                                value={kf.cameraPosition.z}
                                                onChange={(e) => {
                                                    const newPos = kf.cameraPosition.clone();
                                                    newPos.z = parseFloat(e.target.value);
                                                    updateKeyframe(index, { cameraPosition: newPos });
                                                }}
                                                className="px-2 py-1 border rounded text-xs"
                                                step="0.5"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-xs font-semibold text-slate-600 mb-2">Olhando Para</div>
                                        <div className="grid grid-cols-3 gap-2">
                                            <input
                                                type="number"
                                                placeholder="X"
                                                value={kf.cameraTarget.x}
                                                onChange={(e) => {
                                                    const newTarget = kf.cameraTarget.clone();
                                                    newTarget.x = parseFloat(e.target.value);
                                                    updateKeyframe(index, { cameraTarget: newTarget });
                                                }}
                                                className="px-2 py-1 border rounded text-xs"
                                                step="0.5"
                                            />
                                            <input
                                                type="number"
                                                placeholder="Y"
                                                value={kf.cameraTarget.y}
                                                onChange={(e) => {
                                                    const newTarget = kf.cameraTarget.clone();
                                                    newTarget.y = parseFloat(e.target.value);
                                                    updateKeyframe(index, { cameraTarget: newTarget });
                                                }}
                                                className="px-2 py-1 border rounded text-xs"
                                                step="0.5"
                                            />
                                            <input
                                                type="number"
                                                placeholder="Z"
                                                value={kf.cameraTarget.z}
                                                onChange={(e) => {
                                                    const newTarget = kf.cameraTarget.clone();
                                                    newTarget.z = parseFloat(e.target.value);
                                                    updateKeyframe(index, { cameraTarget: newTarget });
                                                }}
                                                className="px-2 py-1 border rounded text-xs"
                                                step="0.5"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 bg-slate-50 border-t">
                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                        <div className="bg-white p-3 rounded-lg">
                            <div className="text-slate-500">Total de Frames</div>
                            <div className="text-2xl font-bold text-pink-600">{totalFrames}</div>
                        </div>
                        <div className="bg-white p-3 rounded-lg">
                            <div className="text-slate-500">Tamanho Estimado</div>
                            <div className="text-2xl font-bold text-purple-600">{estimatedSize.toFixed(0)} MB</div>
                        </div>
                    </div>

                    <button
                        onClick={() => onGenerate(sequence)}
                        className="w-full px-6 py-4 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white rounded-xl font-bold text-lg transition flex items-center justify-center gap-3"
                    >
                        <Download className="w-6 h-6" />
                        Gerar {totalFrames} Frames para IA
                    </button>

                    <div className="text-center text-xs text-slate-500 mt-3">
                        Compatível com Runway ML, Pika Labs, Stable Video Diffusion
                    </div>
                </div>
            </div>
        </div>
    );
};
