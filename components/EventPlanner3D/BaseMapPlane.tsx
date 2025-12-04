import React, { useRef, useState, useEffect } from 'react';
// import { useTexture } from '@react-three/drei';
// import * * THREE from 'three';

interface Props {
    imageUrl: string;
    opacity: number;
    size: { width: number; depth: number };
    scale?: { x: number; y: number };
}

export const BaseMapPlane: React.FC<Props> = ({ imageUrl, opacity, size, scale = { x: 1, y: 1 } }) => {
    // Módulo 3D temporariamente inativo
    return null;

    // Calcular dimensões mantendo aspect ratio
    useEffect(() => {
        if (texture.image) {
            const imgWidth = texture.image.width;
            const imgHeight = texture.image.height;
            const aspectRatio = imgWidth / imgHeight;

            // Ajustar para caber no terreno mantendo proporção
            let finalWidth = size.width * scale.x;
            let finalDepth = size.depth * scale.y;

            // Se a imagem é mais larga, ajustar baseado na largura
            if (aspectRatio > 1) {
                finalDepth = finalWidth / aspectRatio;
            } else {
                // Se é mais alta, ajustar baseado na altura
                finalWidth = finalDepth * aspectRatio;
            }

            setDimensions({ width: finalWidth, depth: finalDepth });
        }
    }, [texture, size, scale]);

    // Configurar textura
    useEffect(() => {
        if (texture) {
            texture.wrapS = THREE.ClampToEdgeWrapping;
            texture.wrapT = THREE.ClampToEdgeWrapping;
            texture.minFilter = THREE.LinearFilter;
        }
    }, [texture]);

    return (
        <mesh
            ref={meshRef}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 0.01, 0]}
            receiveShadow
        >
            <planeGeometry args={[dimensions.width, dimensions.depth]} />
            <meshBasicMaterial
                map={texture}
                transparent
                opacity={opacity}
                side={THREE.DoubleSide}
            />
        </mesh>
    );
};
