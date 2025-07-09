import { AgentOverChromeBridge } from '@midscene/web/bridge-mode';
import { Comment } from '../types';
import { sleep, extractComments } from '../utils';

// Función para extraer comentarios usando Bridge Mode de Midscene
export async function extractCommentsBridgeMode(
  url: string
): Promise<Comment[]> {
  // Crear agente de Midscene
  const agent = new AgentOverChromeBridge();

  // Iniciar conexión con el navegador
  console.log(`📄 Navegando a: ${url}`);
  await agent.connectNewTabWithUrl(url);
  await sleep(5000);

  // Extraer comentarios
  let comments: Comment[] = [];

  try {
    comments = await extractComments(agent);
  } finally {
    // Cerrar el agente
    await agent.destroy();
  }

  return comments;
}
