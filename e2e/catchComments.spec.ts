// e2e/catchComments.spec.ts

import { test } from './fixture'; // desde e2e/fixture.ts
import { expect } from '@playwright/test';
import { sleep } from '../src/utils';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const outputDir = '../output/traffic';

// Obtener el directorio actual de manera compatible con ESM y CommonJS
const getCurrentDir = () => {
  if (typeof __dirname !== 'undefined') {
    return __dirname; // CommonJS
  }
  return path.dirname(fileURLToPath(import.meta.url)); // ESM
};

// Crea la carpeta si no existe
const ensureOutputDir = (currentDir) => {
  const dir = path.join(currentDir, outputDir);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  } else {
    fs.rmSync(dir, { recursive: true });
    fs.mkdirSync(dir);
  }
};

test.beforeEach(async ({ page }) => {
  const newsUrl = process.env.NEWS_URL;
  expect(newsUrl).toBeTruthy();

  await page.setViewportSize({ width: 700, height: 905 });
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
      const responseFilename = path.join(currentDir, outputDir, `response-${timeStamp}.json`);
      const requestFilename = path.join(currentDir, outputDir, `request-${timeStamp}.json`);

      // Capturar request
      const request = response.request();
      const requestData = {
        method: request.method(),
        url: request.url(),
        headers: request.headers(),
        postData: request.postData(),
      };

      const responseData = {
        status: response.status(),  
        headers: response.headers(),
        body: await response.json().catch(() => null), // Maneja errores al parsear JSON
      };

      if(requestData && responseData) {
        fs.writeFileSync(requestFilename, JSON.stringify(requestData, null, 2));  
        fs.writeFileSync(responseFilename, JSON.stringify(responseData, null, 2));
        console.log('📥 Response&Request guardadas');
      } 
    }
  });

  // Busca la sección de comentarios con MidScene para que se cargue y generen las solicitudes

  //Acepta las cookies si es necesario
  const hasCookieBanner = await aiBoolean('is there a cookie consent banner?');
  if (hasCookieBanner) {
    await aiTap(`Accept the cookies and privacy policy.`);
  }
  await sleep(3000);

  // Buscar botones de comentarios en la sección superior
  const lookForCommentsButton = async () => aiBoolean('¿existe un botón de comentarios?');
  let hasCommentsButton = false;
  let UpperAttempts = 0;

  while (!hasCommentsButton && UpperAttempts < 2) {
    hasCommentsButton = await lookForCommentsButton();
    if (hasCommentsButton) {
      await aiTap(`Clique en el botón de comentarios`);
      break; // Si se encuentra el botón, salir del bucle
   } 

    await aiScroll({
      direction: 'down',
      distance: 700,
      scrollType: 'once',
    });
    await sleep(1000);

    // Revisa nuevamente si hay un botón de comentarios
    UpperAttempts++;
  }
  await sleep(3000); // Espera para que se cargue el contenido

  // Si no se encontró un botón de comentarios en la parte superior, buscar en la parte inferior
  let hasComments = false;
  if (!hasCommentsButton) {
    // Use aiScroll to scroll to bottom
    await aiScroll({
      direction: 'down',
      scrollType: 'untilBottom',
    });
    await sleep(3000); // Espera para que se cargue el contenido

    // Use aiScroll to scroll to the comments section
    const checkCommentsSection = async () =>
      aiBoolean('¿existe una sección de comentarios o reseñas?');

    hasComments = await checkCommentsSection();
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
  }

  expect(hasComments || hasCommentsButton).toBeTruthy();

  // Verifica que la sección de comentarios se haya cargado, con un retry
  let loadedComments =  await aiBoolean('Es visible el encabezado de la sección de comentarios?');
  if (!loadedComments) {
    aiScroll({
      direction: 'down',  
      distance: 800,
      scrollType: 'once',
    });
    await sleep(3000); // Espera para que se cargue el contenido
    loadedComments = await aiBoolean('Es visible el encabezado de la sección de comentarios?');
  }
  expect(loadedComments).toBeTruthy();

  // Navega por los comentarios buscando el maximizar el trafico de red
  let commentsAttempts = 0;
  while (commentsAttempts < 8) {
   
    const moreCommentsButton = await aiBoolean('¿existe un botón de "Cargar más comentarios"?');
    const commentsAvailable = await aiBoolean('¿Se puede seguir scrolleando en la sección de comentarios?');

    if (!commentsAvailable && !moreCommentsButton) {
      break; // Si no se puede seguir scrolleando y no hay botón, salir del bucle
    } 

    if(moreCommentsButton) {
      await aiTap(`Cargar más comentarios`);
    }

    await aiScroll({
      direction: 'down',
      distance: 1500,
      scrollType: 'once',
    });
    await sleep(1000);

    commentsAttempts++;
  }

});