// e2e/catchComments.spec.ts

import { test } from './fixture'; // desde e2e/fixture.ts
import { expect } from '@playwright/test';
import { sleep } from '../src/utils';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtener el directorio actual de manera compatible con ESM y CommonJS
const getCurrentDir = () => {
  if (typeof __dirname !== 'undefined') {
    return __dirname; // CommonJS
  }
  return path.dirname(fileURLToPath(import.meta.url)); // ESM
};

// Crea la carpeta si no existe
const ensureOutputDir = (currentDir) => {
  const dir = path.join(currentDir, '../output');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
};

test.beforeEach(async ({ page }) => {
  const newsUrl = process.env.NEWS_URL;
  expect(newsUrl).toBeTruthy();

  await page.setViewportSize({ width: 400, height: 905 });
  await page.goto(newsUrl!);
  await page.waitForLoadState('load');
});

test('Extraer comentarios de noticias', async ({
  page,
  aiBoolean,
  aiTap,
  aiScroll,
}) => {
  
  //Crea la carpeta de salida si no existe
  const currentDir = getCurrentDir();
  ensureOutputDir(currentDir);

  // Inicia la escucha de las respuestas y solicitudes de red
  page.on('response', async (response) => {
    const url = response.url();

    // Filtra las URLs que contienen '/comentarios' o '/comments'
    if (url.includes('/comentarios') || url.includes('/comments')) {
      const timeStamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = path.join(currentDir, '../output', `response-${timeStamp}.json`);

      try {
        const json = await response.json();
        fs.writeFileSync(filename, JSON.stringify(json, null, 2));
        console.log('📥 Response guardada en', filename);
      } catch (err) {
        console.warn('❌ Error al parsear JSON de', url);
      }
    }
  });

  page.on('request', async (request) => {
    const url = request.url();

    // Filtra las URLs que contienen '/comentarios' o '/comments'
    if (url.includes('/comentarios') || url.includes('/comments')) {
      const timeStamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = path.join(currentDir, '../output', `request-${timeStamp}.json`);
      
      const requestData = {
        method: request.method(),
        url,
        headers: request.headers(),
        postData: request.postData(),
      };

      fs.writeFileSync(filename, JSON.stringify(requestData, null, 2));
      console.log('📥 Request guardada en', filename);
    }
  });

  // Busca la sección de comentarios con MidScene para que se cargue y generen las solicitudes
  const hasCookieBanner = await aiBoolean(
    'is there a cookie consent banner?'
  );

  if (hasCookieBanner) {
    await aiTap(`Accept the cookies and privacy policy.`);
  } 
  await sleep(3000);

  // Use aiScroll to scroll to bottom
  await aiScroll({
    direction: 'down',
    scrollType: 'untilBottom',
  });
  await sleep(3000); // Espera para que se cargue el contenido

  // Use aiScroll to scroll to the comments section
  const checkCommentsSection = async () =>
    aiBoolean('¿existe una sección de comentarios o reseñas?');

  let hasComments = await checkCommentsSection();
  let attempts = 0;

  while (!hasComments && attempts < 5) {
    await aiScroll({
      direction: 'up',
      distance: 700,
      scrollType: 'once',
    });
    await sleep(1000);

    hasComments = await checkCommentsSection();
    attempts++;
  }

  expect(hasComments).toBeTruthy();
  await sleep(2000); // Espera para que se cargue el contenido
});
