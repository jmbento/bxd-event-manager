import React, { useRef, useState } from 'react';
// import { useFrame, ThreeEvent } from '@react-three/fiber';
// import { PivotControls } from '@react-three/drei';
// import * as THREE from 'three';
import type { Object3DItem } from '../../types/event3D';

interface Props {
    objects: Object3DItem[];
    selectedId: string | null;
    onSelect: (id: string) => void;
    onUpdatePosition?: (id: string, position: [number, number, number]) => void;
}

export const SceneObjects: React.FC<Props> = ({ objects, selectedId, onSelect, onUpdatePosition }) => {
    // Módulo 3D temporariamente inativo
    return null;
};

interface SceneObjectProps {
    object: Object3DItem;
    isSelected: boolean;
    onSelect: () => void;
    onUpdatePosition?: (id: string, position: [number, number, number]) => void;
}

const SceneObject: React.FC<SceneObjectProps> = ({ object, isSelected, onSelect, onUpdatePosition }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const [localPosition, setLocalPosition] = useState<[number, number, number]>(object.position);

    // Animação de pulso quando selecionado
    useFrame((state) => {
        if (meshRef.current && isSelected) {
            const scale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.05;
            meshRef.current.scale.setScalar(scale);
        }
    });

    const getGeometry = () => {
        const dims = object.metadata?.dimensions || { width: 1, height: 1, depth: 1 };

        switch (object.type) {
            case 'tent':
                // Pirâmide para tenda
                return <coneGeometry args={[dims.width / 2, dims.height, 4]} />;

            case 'stage':
                // Plataforma baixa
                return <boxGeometry args={[dims.width, dims.height, dims.depth]} />;

            case 'fence':
            case 'closure':
                // Painel fino
                return <boxGeometry args={[dims.width, dims.height, dims.depth]} />;

            case 'screen':
                // Tela plana
                return <boxGeometry args={[dims.width, dims.height, dims.depth]} />;

            case 'speaker':
                // Cilindro para caixa de som
                return <cylinderGeometry args={[dims.width / 2, dims.width / 2, dims.height, 8]} />;

            case 'light':
                // Esfera para luminária
                return <sphereGeometry args={[dims.width / 2, 16, 16]} />;

            case 'tree':
                // Cilindro (tronco) + esfera (copa)
                return (
                    <>
                        <cylinderGeometry args={[0.2, 0.3, 1, 8]} />
                    </>
                );

            case 'totem':
                // Retângulo vertical
                return <boxGeometry args={[dims.width, dims.height, dims.depth]} />;

            case 'table':
            case 'chair':
                // Cubo genérico
                return <boxGeometry args={[dims.width, dims.height, dims.depth]} />;

            default:
                return <boxGeometry args={[dims.width, dims.height, dims.depth]} />;
        }
    };

    const getColor = () => {
        if (object.color) return object.color;

        // Cores padrão por tipo
        switch (object.type) {
            case 'tent': return '#f0f0f0';
            case 'stage': return '#8b4513';
            case 'fence': return '#4a5568';
            case 'screen': return '#1a1a1a';
            case 'speaker': return '#2d3748';
            case 'light': return '#fbbf24';
            case 'tree': return '#22c55e';
            case 'totem': return '#3b82f6';
            case 'closure': return '#e5e7eb';
            case 'table': return '#ffffff';
            case 'chair': return '#ffffff';
            default: return '#94a3b8';
        }
    };

    const dims = object.metadata?.dimensions || { width: 1, height: 1, depth: 1 };
    const yPosition = localPosition[1] + dims.height / 2;

    const content = (
        <mesh
            ref={meshRef}
            position={[localPosition[0], yPosition, localPosition[2]]}
            rotation={object.rotation}
            onClick={(e) => {
                e.stopPropagation();
                onSelect();
            }}
            castShadow
            receiveShadow
        >
            {getGeometry()}
            <meshStandardMaterial
                color={getColor()}
                metalness={0.3}
                roughness={0.7}
                emissive={isSelected ? '#3b82f6' : '#000000'}
                emissiveIntensity={isSelected ? 0.3 : 0}
            />

            {/* Borda quando selecionado */}
            {isSelected && (
                <lineSegments>
                    <edgesGeometry args={[new THREE.BoxGeometry(dims.width, dims.height, dims.depth)]} />
                    <lineBasicMaterial color="#3b82f6" linewidth={3} />
                </lineSegments>
            )}
        </mesh>
    );

    // Wrap com PivotControls se selecionado
    if (isSelected && onUpdatePosition) {
        return (
            <PivotControls
                anchor={[0, 0, 0]}
                depthTest={false}
                scale={0.75}
                lineWidth={2}
                onDrag={(matrix) => {
                    const position = new THREE.Vector3();
                    position.setFromMatrixPosition(matrix);

                    // Snap to grid (1 metro)
                    const snappedX = Math.round(position.x);
                    const snappedZ = Math.round(position.z);
                    const newPos: [number, number, number] = [snappedX, 0, snappedZ];

                    setLocalPosition(newPos);
                    onUpdatePosition(object.id, newPos);
                }}
            >
                {content}
            </PivotControls>
        );
    }

    return content;
};
