// e2e/catchComments.spec.ts

import { test } from './fixture'; // desde e2e/fixture.ts
import { expect } from '@playwright/test';
import { sleep } from '../src/utils';

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
    
  page.on('response', async (response) => {
    const url = response.url();

    // Ajusta esto a la ruta real de comentarios en tu web
    if (url.includes('/comentarios') || url.includes('/comments')) {
      try {
        const json = await response.json();
        console.log('📥 Capturando comentarios de:', url, ' ', json);
      } catch (err) {
        console.warn('❌ Error al parsear JSON de', url);
      }
    }
  });

  page.on('request', async (request) => {
    const url = request.url();

    if (url.includes('/comentarios') || url.includes('/comments')) {
      console.log('📤 Request detectada:', {
        method: request.method(),
        url,
        headers: request.headers(),
        postData: request.postData(),
      });
    }
  });

  // Use aiTap to click search button
  await aiTap('Aceptar botón de cookies o privacidad si aparece');
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
