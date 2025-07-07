import puppeteer from 'puppeteer';
import { PuppeteerAgent } from '@midscene/web/puppeteer';
import { Comment } from '../types';
import { filterComments, sleep } from '../utils';

// Función para extraer comentarios con análisis de sentimiento
export async function extractComments(url: string): Promise<Comment[]> {
  console.log('🚀 Iniciando extracción de comentarios...');

  const browser = await puppeteer.launch({
    headless: true,
  });

  const page = await browser.newPage();
  await page.setViewport({
    width: 1280,
    height: 800,
    deviceScaleFactor: 1,
  });

  console.log(`📄 Navegando a: ${url}`);
  await page.goto(url);
  await sleep(5000);

  // Crear agente de Midscene
  const agent = new PuppeteerAgent(page, {
    waitForNavigationTimeout: 5000,
    waitForNetworkIdleTimeout: 5000,
    forceSameTabNavigation: true,
  });

  const hasCookieBanner = await agent.aiBoolean(
    'is there a cookie consent banner?'
  );
  if (hasCookieBanner) {
    await agent.ai(`Accept the cookies and privacy policy.`);
  }
  await sleep(5000);

  // Especulación: Los comentarios suelen estar al final de la página
  await agent.aiScroll({ direction: 'down', scrollType: 'untilBottom' });
  await sleep(5000);

  const isComments = () =>
    agent.aiBoolean('does the page contain a comments or reviews section?');

  let found = await isComments();
  await sleep(5000);
  while (!found) {
    // Desplazarnos hacia abajo
    await agent.aiScroll({
      direction: 'up',
      distance: 500,
      scrollType: 'once',
    });

    // Intentar localizar el contenedor de comentarios
    found = await isComments();
    await sleep(5000);
  }

  await agent.aiAssert('El encabezado de la seccion comentarios es visible');
  console.log('✅ Sección de comentarios encontrada');

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
  const validComments = filterComments(commentsData);
  return validComments;
}
