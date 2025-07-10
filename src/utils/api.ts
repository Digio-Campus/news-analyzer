// Funcion para ejecutar el comando de Playwright como fallback para obtener nuevas requests/responses
import { spawn } from 'child_process';

export async function runFallback(articleUrl: string) {
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

// Extrae el campo 'available' de un JSON y devuelve el valor booleano que contiene.
export function evalAvailable(json: any, fieldPath: string): boolean {
  return fieldPath.split('.').reduce((acc, key) => acc?.[key], json);
}

// Extrae el campo 'count' de un JSON y devuelve el valor numérico que contiene.
export function evalCount(json: any, fieldPath: string): number {
  return parseInt(fieldPath.split('.').reduce((acc, key) => acc?.[key], json));
}

//Funcion para obtener comentarios de la API y guardarlos en un archivo JSON
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';


function readConfig(projectRoot: string) {
  const configPath = path.join(projectRoot, 'config', 'api-config.json');
  return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
};

export async function fetchFromApi(articleId: string) {
  const projectRoot = path.resolve(process.cwd());
  const config = readConfig(projectRoot);
   
  let offset = 0;
  const allComments = [];
  const limit = config.pagination.limit;

  while (true) {
    const url = config.endpoint
      .replace('{id}', articleId)
      .replace('{offset}', offset.toString())
      .replace('{limit}', limit.toString());

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
