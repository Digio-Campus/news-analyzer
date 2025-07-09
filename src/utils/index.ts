import { Comment } from '../types';

export * from './extraction';
export * from './json';

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
