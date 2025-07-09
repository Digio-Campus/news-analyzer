import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import { spawn } from 'child_process';
import { evalAvailable, evalCount } from './utils';

// Obtener el directorio del proyecto de manera simple
const projectRoot = path.resolve(process.cwd());
const configPath = path.join(projectRoot, 'config', 'api-config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
const LIMIT = config.pagination.limit;

async function fetchFromApi(articleId: string) {
  let offset = 0;
  const allComments = [];

  while (true) {
    const url = config.endpoint
      .replace('{id}', articleId)
      .replace('{offset}', offset.toString())
      .replace('{limit}', LIMIT.toString());

    const res = await fetch(url, { headers: config.headers });
    if (!res.ok) throw new Error(`Error HTTP ${res.status}`);

    const json = (await res.json()) as any;
    const comments = json.data?.items || [];
    allComments.push(...comments);

    if (
      !evalAvailable(json, config.pagination.availableField) ||
      comments.length === 0
    )
      break;
    offset += evalCount(json, config.pagination.countField);
  }

  const filename = path.join(
    projectRoot,
    'output',
    `comments_${articleId}.json`
  );
  fs.writeFileSync(filename, JSON.stringify(allComments, null, 2));
  console.log(`✅ Comentarios guardados: ${allComments.length}`);
}

async function runFallback(articleUrl: string) {
  return new Promise<void>((resolve, reject) => {
    const midScene = spawn(
      'npx',
      ['playwright', 'test', 'e2e/catchComments.spec.ts'],
      {
        env: { ...process.env, NEWS_URL: articleUrl },
        stdio: 'inherit',
      }
    );

    midScene.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`MidScene failed with code ${code}`));
    });
  });
}

(async () => {
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
    await fetchFromApi(articleId);
  } catch (err) {
    console.warn(`⚠️ Falló extracción directa: ${(err as Error).message}`);
    console.log('🔁 Ejecutando MidScene + Playwright como fallback...');

    await runFallback(articleUrl);

    console.log(
      '🔄 Vuelve a ejecutar el script para probar con nueva API capturada.'
    );
  }
})();
