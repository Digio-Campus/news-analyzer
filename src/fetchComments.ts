import { fetchFromApi, runFallback } from './utils';
import { generateConfigFile } from './IA-calls';

(async () => {
  // Obtener Argumentos
  const articleId = process.argv[2];
  const articleUrl = process.argv[3];

  // Validar Argumentos
  if (!articleId || !articleUrl) {
    console.error(
      '❌ Por favor, proporciona una URL de noticias y un ID de artículo como argumentos.'
    );
    console.log('Uso: npm run fetch-comments <id> <url>');
    console.log(
      'Ejemplo: npm run fetch-comments 4157122 "https://noticia.com"'
    );
    process.exit(1);
  }

  // Validar URL
  try {
    new URL(articleUrl);
  } catch {
    console.error('❌ URL inválida:', articleUrl);
    process.exit(1);
  }

  try {
    await fetchFromApi(articleId, articleUrl);
  } catch (err) {
    console.warn(`⚠️ Falló extracción directa: ${(err as Error).message}`);
    console.log('🔁 Ejecutando MidScene + Playwright como fallback...');

    await runFallback(articleUrl);
    await generateConfigFile();

    console.log(
      '🔄 Vuelve a ejecutar el script para probar con nueva API capturada.'
    );
  }
})();
