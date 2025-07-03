import 'dotenv/config'; // Cargar variables de entorno
import puppeteer from 'puppeteer';
import { PuppeteerAgent } from '@midscene/web/puppeteer';
import { Comment } from '../types';
import { sleep } from '../utils';


// Función para extraer comentarios con análisis de sentimiento
export async function extractComments(url: string): Promise<Comment[]> {
  console.log('🚀 Iniciando extracción de comentarios...');

  const browser = await puppeteer.launch({
    headless: false, // Para que puedas ver qué está pasando
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 });

  console.log(`📄 Navegando a: ${url}`);
  await page.goto(url);
  await sleep(5000);

  // Crear agente de Midscene
  const agent = new PuppeteerAgent(page);

  await agent.setAIActionContext(
    'Acepta las cookies si estas aparecen en la página.'
  );

  // Paso 1: Navegar a la sección de comentarios si no está visible
  console.log('🔍 Buscando sección de comentarios...');
  try {
    await agent.aiAction(
      'busca y haz scroll hacia abajo hasta encontrar la sección de comentarios'
    );
    await sleep(30000);
  } catch (error) {
    console.log('⚠️  Error al buscar la sección de comentarios:');
    return []; // Si no hay comentarios visibles, retornar un array vacío
  }

  await agent.aiAssert("El encabezado de la seccion comentarios es visible")
  console.log('✅ Sección de comentarios encontrada');
  
  /*
  console.log('🤖 Extrayendo comentarios con análisis de sentimiento...');

  // Paso 2: Extraer comentarios con análisis integrado (optimizado según Midscene)
  // Seguramente este mal, y se necesite que vaya comentario a comentario, combinando AI y Query
  const commentsData = await agent.aiQuery(`
      {
        author: string,
        content: string,
        sentiment: "positivo" | "negativo" | "neutral",
        emotion: "alegría" | "enfado" | "tristeza" | "neutral"
      }[], 
      
      Extrae TODOS los comentarios visibles en esta página de noticias. 
      Para cada comentario encuentra:
      - author: nombre del usuario que comentó
      - content: texto completo del comentario
      - sentiment: analiza si el comentario es positivo, negativo o neutral
      - emotion: detecta la emoción principal (alegría, enfado, tristeza, o neutral)
      
      Analiza el sentimiento basándote en el contenido en español del comentario.
      Busca palabras como: bien/mal, me gusta/no me gusta, estupendo/terrible, etc.
      Para la emoción, detecta: alegría (contento, genial), enfado (rabia, indignante), tristeza (triste, lamentable).
    `);

  console.log(`✅ Encontrados y analizados ${commentsData.length} comentarios`);
  
  await browser.close();

  // Paso 3: Validar y limpiar datos
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

  console.log(`📊 Comentarios válidos procesados: ${validComments.length}`);
  return validComments;
  */
 await browser.close();
 return [];
  
}
