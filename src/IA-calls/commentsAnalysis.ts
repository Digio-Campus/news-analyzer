import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { OpenAI } from 'openai';
import { Comment } from '../types';
import { generateStats } from '../analyzers';

dotenv.config();

export async function analizeComments(articleId: string) {
  const comments = await analizeCommentsWithGemini(articleId);
  console.log(
    `Comentarios analizados para el artículo con ID ${articleId}:`,
    comments
  );
  generateStats(comments);
}

async function analizeCommentsWithGemini(
  articleId: string
): Promise<Comment[]> {
  const { promptRole, promptUser } = await createPrompts(articleId);

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
          content: promptRole,
        },
        { role: 'user', content: promptUser },
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

    const comments = JSON.parse(jsonString) as Comment[];
    return comments;
  } catch (error) {
    console.error(
      'Error al llamar a la API de Gemini (vía SDK de OpenAI) o parsear la respuesta:',
      error
    );
    throw new Error('Fallo al generar la configuración con Gemini.');
  }
}

async function createPrompts(
  articleId: string
): Promise<{ promptRole: string; promptUser: string }> {
  //carga los comentarios del artículo
  const projectRoot = path.resolve(process.cwd());
  const filename = path.join(
    projectRoot,
    'output',
    'comments',
    `comments_${articleId}.json`
  );
  const commentsFile = fs.readFileSync(filename, 'utf-8');

  const promptUser = `Los comentarios del artículo con ID ${articleId} a analizar son los siguientes: ${commentsFile}`;

  //Crea el prompt para analizar los comentarios
  const promptRole = `
Eres un especialista en procesamiento de lenguaje natural y análisis de datos. Tu tarea es recibir una cadena de texto JSON que contiene una lista de comentarios (la estructura de esta lista es desconocida) y transformar cada comentario en un objeto que cumpla estrictamente con la siguiente interfaz TypeScript:

interface Comment {
  author: string;
  content: string;
  date : string; // Formato ISO 8601 (YYYY-MM-DDTHH:mm:ssZ)
  likes: number;
  sentiment: 'positivo' | 'negativo' | 'neutral';
  emotion: 'alegría' | 'enfado' | 'tristeza' | 'neutral';
}


**Pasos a seguir:**

1.  **Analizar el JSON de entrada:** Examina la cadena de texto JSON proporcionada (\`commentsFile\`). Identifica dónde se encuentran los comentarios y extrae la información relevante (autor, contenido, fecha, likes). Dada la estructura desconocida, deberás ser flexible en la búsqueda de estos campos.
2.  **Extraer y Normalizar Datos:**
    * **\`author\`**: Extrae el nombre del autor. Si no se encuentra, usa "Anónimo".
    * **\`content\`**: Extrae el texto del comentario.
    * **\`date\`**: Extrae la fecha del comentario. **Crucial:** Normaliza la fecha al formato **ISO 8601** (\`YYYY-MM-DDTHH:mm:ssZ\`). Si no se puede extraer, usa "Desconocida".
    * **\`likes\`**: Extrae el número de "me gusta". Si no se encuentra, usa 0.
3.  **Análisis de Sentimiento y Emoción (Inferencia):**
    * A partir del **\`content\`** (contenido del comentario), realiza un análisis de sentimiento para clasificarlo como **'positivo'**, **'negativo'** o **'neutral'**.
    * A partir del **\`content\`**, realiza un análisis de emoción para clasificarlo como **'alegría'**, **'enfado'**, **'tristeza'** o **'neutral'**.
4.  **Generación del Resultado:** Genera una lista de objetos JSON que representen los comentarios transformados.

**Formato de Salida:**
El resultado debe ser una cadena JSON que contenga un *array* de objetos, cada uno cumpliendo con la interfaz \`Comment\`.`;

  return { promptRole, promptUser };
}
