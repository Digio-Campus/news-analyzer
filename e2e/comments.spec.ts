// e2e/comments.spec.ts

import { test } from './fixture'; // desde e2e/fixture.ts
import { expect } from '@playwright/test';
import { sleep } from '../src/utils';
import { generateStats } from '../src/analyzers';

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

    await sleep(3000);


    // Use aiScroll to scroll to bottom
    await aiScroll(
        {
        direction: 'down',
        scrollType: 'untilBottom',
        },
    );

    await sleep(3000); // Espera para que se cargue el contenido

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
        
        await sleep(1000);
        
        hasComments = await aiBoolean('¿existe una sección de comentarios o reseñas?');
        attempts++;

        await sleep(1000);
    }

    expect(hasComments).toBeTruthy();

    // Extraer los comentarios visibles
    const extract_comments = () => aiQuery(`
        {
        author: string,
        date: string,
        content: string,
        sentiment: "positivo"|"negativo"|"neutral",
        emotion: "alegría"|"enfado"|"tristeza"|"neutral"
        }[],
        
        Extrae los comentarios visibles en esta página de noticias. 
        Para cada comentario encuentra:
            - author: nombre del usuario que comentó
            - date : fecha y hora del comentario
            - content: texto completo del comentario
            - sentiment: analiza si el comentario es positivo, negativo o neutral
            - emotion: detecta la emoción principal (alegría, enfado, tristeza, o neutral)
      
        Analiza el sentimiento basándote en el contenido del comentario.
        Busca palabras como: bien/mal, me gusta/no me gusta, estupendo/terrible, etc.
        Para la emoción, detecta: alegría (contento, genial), enfado (rabia, indignante), tristeza (triste, lamentable).
    `);
    
    // Use aiScroll to scroll to the comments section
    let anyComments = true;
    const allComments : any[] = [];
    attempts = 0;

    while (anyComments && attempts < 5) {
       const comments = await extract_comments();

       await sleep(1000);

       allComments.push(...comments); // Añade todos los elementos

        await aiScroll(
            {
            direction: 'down',
            distance: 800,
            scrollType: 'once',
            },
        );  

        await sleep(1000);

        anyComments = await aiBoolean('quedan comentarios visibles?');

        await sleep(1000);

        attempts++;
    }

     // Filtrar duplicados por autor y fecha al final
    const uniqueComments = allComments.filter((comment, index, self) => 
        self.findIndex(c => c.author === comment.author && c.date === comment.date) === index
    );

    expect(uniqueComments.length).toBeGreaterThan(0);

    console.log('✅ Comentarios extraídos:', uniqueComments.length);
    generateStats(uniqueComments);

});
