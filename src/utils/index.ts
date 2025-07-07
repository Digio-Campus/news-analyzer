import { Comment } from '../types';

// Función simple para hacer sleep
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const filterComments = (commentsData: Comment[]): Comment[] => {
  const validComments = commentsData
    .filter(
      (comment: any) => comment.content && comment.content.trim().length > 0
    )
    .map((comment: any) => ({
      author: comment.author || 'Usuario Anónimo',
      content: comment.content.trim(),
      sentiment: comment.sentiment || 'neutral',
      emotion: comment.emotion || 'neutral',
    })) as Comment[];

  return validComments;
};
