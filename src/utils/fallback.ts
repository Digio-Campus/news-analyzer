// Funcion para ejecutar el comando de Playwright como fallback para obtener nuevas requests/responses
import { exec } from 'child_process';

export async function runFallback(articleUrl: string) {
  return new Promise<void>((resolve, reject) => {
    const midScene = exec('npx playwright test e2e/catchComments.spec.ts', {
      env: { ...process.env, NEWS_URL: articleUrl },
    });

    midScene.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`MidScene failed with code ${code}`));
    });
  });
}