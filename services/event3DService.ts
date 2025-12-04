// Stub temporário para serviço 3D (módulo inativo)
// TODO: Implementar completamente quando ativar o módulo 3D

import type { EventLayout3D } from '../types/event3D';

export const saveLayout = (layout: EventLayout3D): void => {
  console.warn('Módulo 3D inativo: saveLayout não implementado');
  localStorage.setItem(`layout_${layout.id}`, JSON.stringify(layout));
};

export const getAllLayouts = (): EventLayout3D[] => {
  console.warn('Módulo 3D inativo: getAllLayouts não implementado');
  return [];
};

export const generateMaterialsList = (layout: EventLayout3D): any[] => {
  console.warn('Módulo 3D inativo: generateMaterialsList não implementado');
  return [];
};

export const calculateLayoutStats = (layout: EventLayout3D): any => {
  console.warn('Módulo 3D inativo: calculateLayoutStats não implementado');
  return {
    totalObjects: layout.objects.length,
    totalCost: 0,
    totalArea: 0
  };
};