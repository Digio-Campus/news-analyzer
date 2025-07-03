import 'dotenv/config'; // Cargar variables de entorno
import { extractComments } from './extractors';
import { generateStats } from './analyzers';

async function main(newsUrl: string) {
  console.log('🎯 News Analyzer - PoC');
  console.log('========================\n');

  // Validar URL
  try {
    new URL(newsUrl);
  } catch (error) {
    console.error('❌ URL inválida:', newsUrl);
    return;
  }

  try {
    // Extraer comentarios
    const comments = await extractComments(newsUrl);

    // Generar estadísticas
    generateStats(comments);

    console.log('\n✅ ¡Análisis completado!');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Ejecutar el script con la URL de noticias
const newsUrl = process.argv[2];
if (!newsUrl) {
  console.error(
    '❌ Por favor, proporciona una URL de noticias como argumento.'
  );
  process.exit(1);
}
main(newsUrl);
