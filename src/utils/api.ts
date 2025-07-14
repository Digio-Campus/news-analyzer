//Funcionalidad para obtener comentarios de la API y guardarlos en un archivo JSON
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import { EndpointConfiguration } from '../types';
import { obtainPageNameFromUrl } from '.';

// Función para obtener valores anidados de un objeto json
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}

// Función para remplazar los marcadores de posición en una URL con valores específicos
function replacePlaceholders(
  template: string,
  values: Record<string, string>
): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => values[key] ?? `{${key}}`);
}

// Función que obtiene la configuración de la API desde un archivo JSON
function readConfig(projectRoot: string, articleUrl: string): EndpointConfiguration {
  const pageName = obtainPageNameFromUrl(articleUrl);
  const configFileName = `api-config_${pageName}.json`;
  const configPath = path.join(projectRoot, 'config', configFileName);
  return JSON.parse(
    fs.readFileSync(configPath, 'utf-8')
  ) as EndpointConfiguration;
}

export async function fetchFromApi(articleId: string, articleUrl: string) {
  // Obtener la configuración de la API
  const projectRoot = path.resolve(process.cwd());
  const endpointConfig = readConfig(projectRoot, articleUrl);

  //Inicializar paginación
  let currentPage =
    endpointConfig.parameters[endpointConfig.paginationFields.pageParameterName]
      ?.defaultValue ?? 0;
  const allComments = [];

  const placeholderValues: Record<string, string> = {
    articleId: articleId,
    articleUrl: articleUrl,
  };

  for (const [key, param] of Object.entries(endpointConfig.parameters)) {
    if (key === 'articleId') continue;
    const value = param.defaultValue ?? '';
    placeholderValues[key] = value.toString();
  }

  // Bucle para obtener comentarios de la API
  while (true) {
    //Actuarlizar la paginación
    placeholderValues[endpointConfig.paginationFields.pageParameterName] =
      currentPage.toString();

    //Reemplazar los marcadores de posición en la URL
    const url = replacePlaceholders(
      endpointConfig.urlTemplate,
      placeholderValues
    );

    //Reemplazar los marcadores de posición en los headers
    const headers: Record<string, string> = {};
    for (const [key, value] of Object.entries(endpointConfig.headers)) {
      headers[key] = replacePlaceholders(value, placeholderValues);
    }

    //Hacer la petición a la API
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(`Error HTTP ${res.status}`);

    // Obtener los datos de la respuesta
    const json = (await res.json()) as any;
    const comments =
      getNestedValue(json, endpointConfig.paginationFields.commentsArrayPath) ||
      [];
    allComments.push(...comments);

    // Comrpobar si hay más comentarios y actualizar la página
    const hasMoreComments = getNestedValue(
      json,
      endpointConfig.paginationFields.hasMorePagesField
    );

    if (!hasMoreComments || comments.length === 0) {
      break;
    }

    currentPage += endpointConfig.paginationFields.nextPageIncrement;
  }

  const filename = path.join(
    projectRoot,
    'output',
    'comments',
    `comments_${articleId}.json`
  );
  fs.writeFileSync(filename, JSON.stringify(allComments, null, 2));
  console.log(`✅ Comentarios guardados: ${allComments.length}`);
}
