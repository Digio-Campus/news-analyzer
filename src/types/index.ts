// Tipos básicos para la PoC
export interface Comment {
  author: string;
  content: string;
  sentiment: 'positivo' | 'negativo' | 'neutral';
  emotion?: 'alegría' | 'enfado' | 'tristeza' | 'neutral';
}
