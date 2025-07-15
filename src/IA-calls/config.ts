import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { OpenAI } from 'openai';
import { EndpointConfiguration } from '../types';
import { obtainPageNameFromUrl } from '../utils';

dotenv.config();

async function createPrompt() {
  //carga la lista de request/responses de output
  const projectRoot = path.resolve(process.cwd());
  const outputDir = path.join(projectRoot, 'output/traffic');

  //Obetner los archivos de request y response
  const files = fs.readdirSync(outputDir);

  const loadFilesByPrefix = (prefix: string) =>
    files
      .filter((file) => file.startsWith(prefix))
      .map((file) => {
        const filePath = path.join(outputDir, file);
        return fs.readFileSync(filePath, 'utf-8'); // No se parsea
      });

  //Obtener lista de request/responses
  const requests = loadFilesByPrefix('request-');
  const responses = loadFilesByPrefix('response-');

  if (requests.length === 0 || responses.length === 0) {
    throw new Error(
      'No se encontraron solicitudes o respuestas en el directorio de salida.'
    );
  }

  //Generar cadenas de texto con las solicitudes y respuestas
  const requestString = requests.join('\n\n--- REQUEST ---\n\n');
  const responseString = responses.join('\n\n--- RESPONSE ---\n\n');

  //Crea el prompt con las respuestas y solicitudes de red
  const prompt = `Analiza las siguientes solicitudes y respuestas HTTP de una API de comentarios. Tu objetivo es extraer la configuración necesaria para replicar esta llamada y paginar los comentarios de forma programática.

  La configuración JSON debe seguir esta estructura TypeScript:
  interface ParameterConfig {
    type: 'path' | 'query';
    description?: string;
    defaultValue?: any;
  }
  

  interface EndpointConfiguration {
    method: string;
    urlTemplate: string; // Ejemplo: "https://api.example.com/comments/{articleId}/{offset}/{limit}/"
    parameters: { [key: string]: ParameterConfig }; // Define los placeholders de urlTemplate (e.g., articleId, offset, limit)
    headers: Record<string, string>; // Headers importantes (User-Agent, Referer, etc.)
    paginationFields: {
      commentsArrayPath: string; // Ruta al array de comentarios en la respuesta (e.g., "data.items", "items")
      hasMorePagesField: string; // Ruta al campo que indica si hay más páginas (e.g., "options.available", "lastPage")
      hasMorePagesOperator?: 'truthy' | 'falsy' | '===' | '!==' | '>' | '<'; // Opcional, operador para evaluar si hay más páginas
      hasMorePagesValue?: any; // Valor para comparar con hasMorePagesField
      nextPageIncrement: number;  // Cuánto incrementar el parámetro de paginación (e.g., 30 para offset, 1 para page)
      pageParameterName: string;  // Nombre del parámetro de la URL para la paginación (e.g., "offset", "pagina")
    };
  }

  Aquí tienes las solicitudes (request) y la respuestas (response):

  --- REQUEST ---
  ${requestString}

  --- RESPONSE ---
  ${responseString}

  Por favor, genera SÓLO el objeto JSON de tipo 'EndpointConfiguration' basándote en esta información. Identifica cuidadosamente:
  1.  El 'urlTemplate' exacto, usando placeholders como '{articleId}', '{offset}', '{limit}', '{page}' si los detectas. 
  2.  Los 'parameters' para cada placeholder en la 'urlTemplate'.
  3.  Los 'headers' relevantes que el navegador envió, si se usa la URL de la página como referencia introducela como placeholder también como '{articleUrl}'.
  4.  La 'paginationFields':
      - 'commentsArrayPath': La ruta más probable al array de comentarios.
      - 'hasMorePagesField': La ruta al campo en la respuesta que indica si hay más comentarios o páginas. 
      - 'hasMorePagesOperator': El operador para evaluar si hay más páginas (opcional, si no se puede determinar, omite este campo), infiere esta propiedad del nombre del campo. En caso de ser booleano, usa 'truthy' si es true/false, 'falsy' si es false/true, o '===' si es igual a un valor específico.
      - 'hasMorePagesValue': El valor que se compara con 'hasMorePagesField' (opcional, si no se puede determinar, omite este campo) en caso de que el operador sea de comparación.
      - 'nextPageIncrement': ¿Es paginación por 'offset' (incremento de 30) o por 'página' (incremento de 1)?
      - 'pageParameterName': El nombre del parámetro en la URL ('offset' o 'pagina'), recuerda que debe coincidir con el nombre que le has dado en parameters.

  Asegúrate de que el JSON resultante sea directamente parseable. NO incluyas ningún texto explicativo adicional, solo el JSON.
`;

  return prompt;
}

async function generateConfigWithGemini(): Promise<EndpointConfiguration> {
  const promptContent = await createPrompt();

  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
    });

    const response = await openai.chat.completions.create({
      model: 'gemini-2.5-flash-lite-preview-06-17',
      messages: [
        {
          role: 'system',
          content:
            'Eres un experto en APIs y generación de configuraciones para llamadas HTTP.',
        },
        { role: 'user', content: promptContent },
      ],
    });

    const geminiResponseText = response.choices[0]?.message?.content;

    if (!geminiResponseText) {
      throw new Error('La respuesta de Gemini está vacía.');
    }

    // Intenta parsear el JSON de la respuesta de Gemini
    // Gemini a menudo envuelve el JSON en bloques de código markdown
    const jsonMatch = geminiResponseText.match(/```json\n([\s\S]*?)\n```/);
    let jsonString = jsonMatch ? jsonMatch[1] : geminiResponseText;

    // Limpia cualquier carácter extra
    jsonString = jsonString.trim();

    const config = JSON.parse(jsonString) as EndpointConfiguration;
    return config;
  } catch (error) {
    console.error(
      'Error al llamar a la API de Gemini (vía SDK de OpenAI) o parsear la respuesta:',
      error
    );
    throw new Error('Fallo al generar la configuración con Gemini.');
  }
}

export async function generateConfigFile(articleUrl: string): Promise<void> {
  console.log('🔍 Generando configuración de API con IA');
  const config = await generateConfigWithGemini();
  console.log('Configuración generada con éxito:');

  const projectRoot = path.resolve(process.cwd());
  const pageName = obtainPageNameFromUrl(articleUrl);
  const configFileName = `api-config_${pageName}.json`;
  const configPath = path.join(projectRoot, 'config', configFileName);
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log(`Configuración guardada en: ${configPath}`);
}
