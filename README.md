# News Analyzer PoC

Prueba de concepto para análisis automatizado de comentarios de noticias usando TypeScript y Midscene con sus diferentes implementaciones.

## 🚀 Instalación

1. **Clona el proyecto**
   ```bash
   git clone https://github.com/Digio-Campus/news-analyzer.git
   ```

2. **Instala dependencias:**
   ```bash
   npm install
   ```
3. **Configura tu API key de Gemini:**
   ```bash
   copy .env.example .env
   ```
   Edita `.env` y añade tu API key de Gemini.

## 🎯 Uso

### Análisis de comentarios usando Puppeteer:

Esta sección no esta finalizada del todo, pero se pueden probar los scripts que se indican más adelante. 

El principal problema encontrado es que los scripts Puppeteer puede fallar y terminar abruptamente, mostrando errores como "page closed" o "session terminated". Esto es un problema conocido y se planea mejorar la robustez de los scripts en el futuro.

Además, el script de análisis de comentarios de noticias por ahora solo extrae los primeros comentarios que encuentra, y no sigue buscando nuevos comentarios. 

#### **Demo básica (recomendado):**
Demo proporcionada por Midscene para comprobar la integración con Puppeteer. Esta demo busca auriculares en eBay y muestra cuales ha encontrado.

```bash
npm run demo
```

#### **Análisis de comentarios de noticias:**
Funcionalidad principal para analizar comentarios de una noticia específica usando Puppeteer. Requiere una URL de noticia válida.

```bash
npm start "https://url-de-la-noticia.com"
```

### Análisis de comentarios usando Bridge Mode:

Para usarlo se necesita tener configurada la [extension de Midscene en Chrome](https://chromewebstore.google.com/detail/midscenejs/gbldofcpkknbggpkmbdaefngejllnief).

Hay un único script, que es identico al de Puppeteer, pero en él se usa el `AgentOverChromeBridge` de Midscene para controlar el navegador. Esto permite una integración mucho más visual y permite mayor estabilidad al manejar uno mismo el navegador.

Para ejecutar el script de análisis de comentarios con Bridge Mode, hay que usar el mismo comando que para Puppeteer, pero añadiendo un segundo argumento `bridge` y activar la extensión de Midscene en Chrome:

```bash
npm start "https://url-de-la-noticia.com" bridge
```

### Análisis de comentarios usando tests de Playwright:

La implementación de tests E2E con Playwright es más robusta que el uso de Puppeteer por lo que se recomienda su uso. Los tests están ubicados en la carpeta `e2e/`.

Actualmente, hay dos tests principales:

- **Búsqueda en eBay**: Busca auriculares en eBay y extrae los resultados. Al igual que antes, se usa de demo para comprobar la integración con Midscene.
- **Extracción de comentarios**: Extrae comentarios de una noticia específica de la que necesita la URL.

Se pueden ejecutar o juntos o de manera individual con el siguiente comando:

```bash
npx playwright test {comments.spec.ts, ebay-search.spec.ts}
```

Para la extraccion de comentarios, se necesita indicar una URL de noticia mediante una variable de entorno llamada `NEWS_URL`. Como se muestra a continuación:

```bash
$env:NEWS_URL="https://www.ejemplo.com/noticia"; npx playwright test comments.spec.ts
```

### Analisis de comentarios usando API:

Esta ultima implementación es la más rápida de todas, ya que intenta evitar el uso de un navegador. En su lugar, se usa la API de la pagina para extraer los comentarios.

Se basa en 3 conceptos principales:

#### **1. Extracción de API** 

Se hace uso de un nuevo test E2E con Playwright que, al igual que antes, usa MidScene para buscar la sección de comentarios de una noticia pero no los extrae directamente, sino que captura el trafico de red con las llamadas a la API que usa la pagina para extraerlos y lo guarda en una carpeta `output`.

Aunque no es necesario ejecutarlo manualmente, se puede ejecutar con el siguiente comando:

```bash
npx playwright test catchComments.spec.ts
```

#### **2. Fichero de configuración**

Usando los request/responses capturados, se crea un fichero de configuración que indica como se deben hacer las llamdas a la API para extraer los comentarios. Este fichero se guarda en la carpeta `config/api-config.json`.

Por ahora, este fichero se crea de manera manual, pero se planea automatizarlo en el futuro.


#### **3. Script de extracción de comentarios**

Script pricipal de extracción llamado `fetchComments.ts`, este intenta usar la API de la pagina, segun indica el fichero de configuración, para extraer los comentarios y guardarlos en un fichero llamado `output/comments_{id}.json`.

En caso de error se llama a MidScene + Playwright como fallback para obtener los request/response nuevos, aunque como se ha dicho falta implementar que el fichero de configuración se actualice automaticamente usando estos nuevos valores.

Finalmente, falta tambien implementar la estructuracion y analisis de los comentarios extraidos, que se guardan en un fichero `output/comments_{id}.json`.

Para ejecutar el script de extracción de comentarios, se puede usar el siguiente comando:

```bash
npm run fetch-comments id_noticia "https://noticia.com"
```

## 📁 Estructura del proyecto

```
src/
├── main.ts                # Punto de entrada principal para Brifge Mode y Puppeteer
├── fetchComments.ts       # Script de extracción de comentarios usando API
│
├── extractors/            # Extracción de comentarios
│   ├── index.ts           # Punto de entrada para extractores
│   ├── puppeteer.ts       # Extractor de comentarios con Puppeteer
│   └── bridge.ts          # Extractor de comentarios con Bridge Mode
│
├── analyzers/             # Análisis de comentarios
│   └── index.ts           # Generación de estadísticas
│
├── types/                 # Tipos TypeScript
│   └── index.ts           # Definición de Comment
│
└── utils/                 # Utilidades
    |── extraction.ts      # Funciones de extracción de comentarios abstractas
    ├── json.ts            # Funciones para parsear la configuración de la API
    └── index.ts           # Funciones auxiliares basicas


examples/
└── basic-demo.ts          # Demo básico de Midscene con Puppeteer

e2e/                       # Tests con Playwright
├── fixture.ts             # Configuración de tests
|── ebay-search.spec.ts    # Test de búsqueda en eBay
├── comments.spec.ts       # Test de extracción de comentarios
└── catchComments.spec.ts  # Test de extracción de llamadas API

config/                    # Ficheros de configuración
└── api-config.json        # Configuración de la API para extracción de comentarios
```


## ⚙️ Scripts disponibles

- `npm run start <url>` - Análisis de comentarios de una noticia con Puppeteer
- `npm run start <url> bridge` - Análisis de comentarios de una noticia con Bridge Mode
- `npm run demo` - Demo básico de Midscene para comprobar la integración con Puppeteer
- `npm run fetch-comments <id> <url>` - Extraer comentarios de una noticia usando API
- `npm run build` - Compilar TypeScript
- `npm run dev` - Modo desarrollo con watch
- `npm run lint` - Verificar código con ESLint
- `npm run format` - Formatear código con Prettier
- `npm run check` - Lint + Format
- `npx playwright test` - Ejecutar tests E2E

## Características

### Extracción de comentarios
- **Puppeteer Y Playwright**: Control avanzado del navegador
- **Bridge Mode**: Integración visual con Midscene
- **API de comentarios**: Extracción directa de comentarios mediante llamadas a la API
- **Midscene AI**: Navegación asistida por IA para encontrar comentarios
- **Análisis de sentimiento**: La IA analiza cada comentario individualmente
- **Detección de emociones**: Identifica alegría, enfado, tristeza o neutral

### Análisis de estadísticas
- Estadísticas de sentimiento (positivo/negativo/neutral)
- Análisis de emociones dominantes
- Comentario más popular (por likes/reacciones)
- Resumen estadístico completo


## ⚠️ Problemas conocidos

### Scripts con Puppeteer
- Los scripts de Puppeteer pueden fallar y terminar abruptamente
- Error común: "page closed" o session terminada
- Solución temporal: reintentar la ejecución

### Planes de mejora
- **Robustez**: Mejorar manejo de errores y reintentos
- **Estabilidad**: Perfeccionar los scripts existentes
- **Automatización**: Implementar generación automática de configuración de API
- **Análisis de comentarios en API**: Estructurar y analizar comentarios extraídos por API


## 📚 Recursos

- [Documentación Midscene](https://midscenejs.com/integrate-with-puppeteer.html)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Puppeteer Docs](https://pptr.dev/)
- [Playwright Testing](https://playwright.dev/docs/intro)

### Requisitos
- Node.js >= 18.0.0
- API key de Gemini
- Navegador compatible con Puppeteer/Playwright
