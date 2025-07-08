import puppeteer from 'puppeteer';
import { PuppeteerAgent } from '@midscene/web/puppeteer';
import { Comment } from '../types';
import { sleep } from '../utils';

export async function extract_comments_demo(): Promise<Comment[]> {
  const browser = await puppeteer.launch({
    headless: true, // here we use headed mode to help debug
  });

  const page = await browser.newPage();
  await page.setViewport({
    width: 1280,
    height: 800,
    deviceScaleFactor: 1,
  });

  await page.goto('https://www.ebay.com/');
  await sleep(5000);

  // 👀 init Midscene agent
  const agent = new PuppeteerAgent(page, {
    waitForNavigationTimeout: 5000,
    waitForNetworkIdleTimeout: 5000,
    forceSameTabNavigation: true,
  });

  await agent.ai(`Accept the cookies and privacy policy if required.`);
  await sleep(5000);

  await agent.aiAction('type "Headphones" in search box, hit Enter');
  await sleep(5000);

  await agent.aiAction(
    'click on the name of the first item in the search results'
  );
  await sleep(5000);

  await agent.aiWaitFor('the page to load the product details'); // Espera a que se cargue la página del producto -> da error si no  se carga la página
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

  // 👀 understand the page content, find the items
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
      
      Analiza el sentimiento basándote en el contenido del comentario.
      Busca palabras como: bien/mal, me gusta/no me gusta, estupendo/terrible, etc.
      Para la emoción, detecta: alegría (contento, genial), enfado (rabia, indignante), tristeza (triste, lamentable).
    `);

  console.log(`✅ Encontrados y analizados ${commentsData.length} comentarios`);

  await browser.close();

  return commentsData as Comment[];
}
