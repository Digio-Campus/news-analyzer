import puppeteer from 'puppeteer';
import { PuppeteerAgent } from '@midscene/web/puppeteer';
import { Comment } from '../types';
import { sleep, extractComments } from '../utils';

// Función para extraer comentarios usando Puppeteer y Midscene
export async function extractCommentsPuppeteer(
  url: string
): Promise<Comment[]> {
  //Inicializar Puppeteer
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

  // Extraer comentarios
  let comments: Comment[] = [];

  try {
    comments = await extractComments(agent);
  } finally {
    // Cerrar el navegador
    await browser.close();
  }

  return comments;
}
