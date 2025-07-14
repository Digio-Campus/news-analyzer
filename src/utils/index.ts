import { Comment } from '../types';

export * from './extraction';
export * from './api';
export * from './fallback';

// Función simple para hacer sleep
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const filterComments = (commentsData: Comment[]): Comment[] => {
  const validComments = commentsData
    .filter(
      (comment: Comment) => comment.content && comment.content.trim().length > 0
    )
    .map((comment: Comment) => ({
      author: comment.author || 'Usuario Anónimo',
      content: comment.content.trim(),
      sentiment: comment.sentiment || 'neutral',
      emotion: comment.emotion || 'neutral',
    })) as Comment[];

  return validComments;
};

export function obtainPageNameFromUrl(url: string): string {
  const parsedUrl = new URL(url);
  return parsedUrl.hostname.replace(/^www\./, '').replace(/\..*$/, ''); // elimina "www." y lo que sigue al primer punto
}

export function evaluateHasMore(
  value: any,
  operator: 'truthy' | 'falsy' | '===' | '!==' | '>' | '<' = 'truthy',
  comparisonValue?: any
): boolean {
  switch (operator) {
    case 'truthy':
      return !!value;
    case 'falsy':
      return !value;
    case '===':
      return value === comparisonValue;
    case '!==':
      return value !== comparisonValue;
    case '>':
      return value > comparisonValue;
    case '<':
      return value < comparisonValue;
    default:
      return !!value;
  }
}
