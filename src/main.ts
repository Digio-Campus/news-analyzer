import 'dotenv/config'; // Cargar variables de entorno
import {
  extractCommentsPuppeteer,
  extractCommentsBridgeMode,
} from './extractors';
import { generateStats } from './analyzers';
import { filterComments } from './utils';

async function main(newsUrl: string, useBridgeMode: boolean = false) {
  console.log('🎯 News Analyzer - PoC');
  console.log('========================\n');

  try {
    // Extraer comentarios usando el modo seleccionado
    let comments;
    if (useBridgeMode) {
      console.log('🌉 Usando Bridge Mode...');
      comments = await extractCommentsBridgeMode(newsUrl);
    } else {
      console.log('🐶 Usando Puppeteer...');
      comments = await extractCommentsPuppeteer(newsUrl);
    }

    // Validar y limpiar datos
    comments = filterComments(comments);

    // Generar estadísticas
    generateStats(comments);

    console.log('\n✅ ¡Análisis completado!');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Ejecutar el script con la URL de noticias
const args = process.argv.slice(2);

const newsUrl = args[0];
const useBridgeMode = args[1] === 'bridge' ? true : false;

// Validar Argumentos
if (!newsUrl) {
  console.error(
    '❌ Por favor, proporciona una URL de noticias como argumento.'
  );
  console.log('Uso: npm start <url> [bridge]');
  console.log('Ejemplo: npm start "https://noticia.com" bridge');
  process.exit(1);
}

// Validar URL
try {
  new URL(newsUrl);
} catch {
  console.error('❌ URL inválida:', newsUrl);
  process.exit(1);
}

main(newsUrl, useBridgeMode);
