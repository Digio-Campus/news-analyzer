import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import { spawn } from 'child_process';

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

    const json = await res.json() as any;
    const comments = json.data?.items || [];
    allComments.push(...comments);

    if (!evalAvailable(json, config.pagination.availableField) || comments.length === 0) break;
    offset += evalCount(json, config.pagination.countField);
  }

  fs.writeFileSync(`comments_${articleId}.json`, JSON.stringify(allComments, null, 2));
  console.log(`✅ Comentarios guardados: ${allComments.length}`);
}

function evalAvailable(json: any, fieldPath: string): boolean {
  return fieldPath.split('.').reduce((acc, key) => acc?.[key], json);
}

function evalCount(json: any, fieldPath: string): number {
  return parseInt(fieldPath.split('.').reduce((acc, key) => acc?.[key], json));
}

async function runFallback(articleUrl: string) {
  return new Promise<void>((resolve, reject) => {
    const midScene = spawn('npx', ['playwright', 'test', 'e2e/catchComments.spec.ts'], {
      env: { ...process.env, NEWS_URL: articleUrl },
      stdio: 'inherit',
    });

    midScene.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`MidScene failed with code ${code}`));
    });
  });
}

(async () => {
  const articleId = process.argv[2]; // '4157122'
  const articleUrl = process.argv[3]; // full URL

  try {
    await fetchFromApi(articleId);
  } catch (err) {
    console.warn(`⚠️ Falló extracción directa: ${(err as Error).message}`);
    console.log('🔁 Ejecutando MidScene + Playwright como fallback...');

    await runFallback(articleUrl);

    console.log('🔄 Vuelve a ejecutar el script para probar con nueva API capturada.');
  }
})();
