// Stubs temporários para tipos 3D (módulo inativo)
// TODO: Implementar completamente quando ativar o módulo 3D

export interface EventLayout3D {
  id: string;
  name: string;
  description: string;
  terrainSize: { width: number; depth: number };
  objects: Object3DItem[];
  drawings: DrawnElement[];
  createdAt: string;
  updatedAt: string;
}

export interface Object3DItem {
  id: string;
  type: ObjectType;
  name: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  metadata: {
    dimensions: { width: number; height: number; depth: number };
    cost: number;
  };
}

export interface DrawnElement {
  id: string;
  type: 'line' | 'rectangle' | 'circle' | 'arrow';
  points: number[][];
  color: string;
  strokeWidth: number;
}

export type DrawingTool = 'select' | 'line' | 'rectangle' | 'circle' | 'arrow';

export type ObjectType = 
  | 'tent' | 'stage' | 'truss' | 'fence' | 'closure'
  | 'screen' | 'speaker' | 'light' | 'generator'
  | 'totem' | 'tree' | 'table' | 'chair';

export interface ObjectDefinition {
  type: ObjectType;
  name: string;
  description: string;
  icon: string;
  defaultDimensions: { width: number; height: number; depth: number };
  defaultCost: number;
  category: 'structure' | 'equipment' | 'decoration' | 'furniture';
}