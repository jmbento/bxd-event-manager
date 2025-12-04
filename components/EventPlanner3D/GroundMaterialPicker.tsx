import React from 'react';
import { Layers } from 'lucide-react';
import { GROUND_MATERIALS, type GroundMaterialType, MATERIAL_CATEGORIES } from '../../services/groundMaterials';

interface Props {
    currentMaterial: GroundMaterialType;
    onSelect: (material: GroundMaterialType) => void;
}

export const GroundMaterialPicker: React.FC<Props> = ({ currentMaterial, onSelect }) => {
    return (
        <div className="bg-white rounded-lg shadow-lg p-4 max-w-sm">
            <div className="flex items-center gap-2 mb-4">
                <Layers className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-gray-900">Material do Piso</h3>
            </div>

            <div className="space-y-4">
                {Object.entries(MATERIAL_CATEGORIES).map(([category, materials]) => (
                    <div key={category}>
                        <div className="text-xs font-semibold text-gray-500 uppercase mb-2">
                            {category}
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            {materials.map(matType => {
                                const material = GROUND_MATERIALS[matType as GroundMaterialType];
                                return (
                                    <button
                                        key={matType}
                                        onClick={() => onSelect(matType as GroundMaterialType)}
                                        className={`p-3 rounded-lg border-2 transition text-left ${currentMaterial === matType
                                                ? 'border-indigo-500 bg-indigo-50'
                                                : 'border-gray-200 hover:border-indigo-300'
                                            }`}
                                    >
                                        <div
                                            className="w-full h-12 rounded mb-2"
                                            style={{ backgroundColor: material.color }}
                                        />
                                        <div className="text-xs font-semibold text-gray-900">
                                            {material.name}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
