// Stub temporário para Gemini Vision (módulo inativo)
// TODO: Implementar completamente quando ativar o módulo 3D

import type { LayoutCommand } from '../components/EventPlanner3D/MagicArchitect';

export const analyzeImageWithGemini = async (imageData: string, prompt: string): Promise<string> => {
  console.warn('Módulo 3D inativo: analyzeImageWithGemini não implementado');
  return 'Análise de imagem não disponível (módulo 3D inativo)';
};

export const visionResultToLayoutCommands = (result: string): LayoutCommand[] => {
  console.warn('Módulo 3D inativo: visionResultToLayoutCommands não implementado');
  return [];
};