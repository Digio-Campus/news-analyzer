// e2e/comments.spec.ts

import { test } from './fixture'; // desde e2e/fixture.ts
import { expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
    const newsUrl = process.env.NEWS_URL;
    expect(newsUrl).toBeTruthy();

    await page.setViewportSize({ width: 400, height: 905 });
    await page.goto(newsUrl!);
    await page.waitForLoadState('networkidle');
});

test('Extraer comentarios de noticias', async ({
  ai,
  aiQuery,
  aiBoolean,
  aiTap,
  aiScroll,
  aiWaitFor,
}) => {
    // Use aiTap to click search button
    await aiTap('Aceptar botón de cookies o privacidad si aparece');

    // Use aiScroll to scroll to bottom
    await aiScroll(
        {
        direction: 'down',
        scrollType: 'untilBottom',
        },
    );
    
    // Use aiScroll to scroll to the comments section
    let hasComments = await aiBoolean('¿existe una sección de comentarios o reseñas?');
    let attempts = 0;

    while (!hasComments && attempts < 5) {
        await aiScroll(
            {
            direction: 'up',
            distance: 700,
            scrollType: 'once',
            },
        );  
        
        await aiWaitFor('the loading spinner to disappear');
        hasComments = await aiBoolean('¿existe una sección de comentarios o reseñas?');
        attempts++;
    }

    expect(hasComments).toBeTruthy();

    // Extraer los comentarios visibles
    const comments = await aiQuery(`
        {
        author: string,
        content: string,
        sentiment: "positivo"|"negativo"|"neutral",
        emotion: "alegría"|"enfado"|"tristeza"|"neutral"
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

    expect(comments.length).toBeGreaterThan(0);

    console.log('✅ Comentarios extraídos:', comments.length);
    // Aquí puedes insertar validación con expect o lógica adicional
});
