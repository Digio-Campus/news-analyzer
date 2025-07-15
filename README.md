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

Se hace uso de un nuevo test E2E con Playwright que, al igual que antes, usa MidScene para buscar la sección de comentarios de una noticia pero no los extrae directamente, sino que captura el trafico de red con las llamadas a la API que usa la pagina para extraerlos y lo guarda en una carpeta `output/traffic`.

Para detalles de su implementación, ver la sección ["Implementación de la extracción de API"](#implementación-de-la-extracción-de-api) al final del README.

Aunque no es necesario ejecutarlo manualmente, se puede ejecutar con el siguiente comando:

```bash
npx playwright test catchComments.spec.ts
```

#### **2. Fichero de configuración**

Usando los request/responses capturados, se crea un fichero de configuración que indica como se deben hacer las llamdas a la API para extraer los comentarios. Este fichero se guarda en la carpeta `config/api-config.json`.

Este fichero se crea mediante una llamada a una IA, que dado el trafico capturado crea la configuración siguiendo la interfaz EndpointConfiguration definida en `src/types/index.ts`


#### **3. Script de extracción de comentarios**

Script pricipal de extracción llamado `fetchComments.ts`, este intenta usar la API de la pagina, segun indica el fichero de configuración, para extraer los comentarios y guardarlos en un fichero llamado `output/comments_{id}.json`.

Además, de la extracción de comentarios en raw (tal como los devuelve la API), se llama a una IA para formatear estos comentarios y realizar un análisis de sentimientos. Esta analiza cada comentario individualmente, identificando sentimientos y emociones (alegría, enfado, tristeza o neutral).

En caso de error, se realizan de manera automatica los pasos anteriores, se llama a MidScene + Playwright como fallback para obtener los request/response nuevos, y luego se procesa de nuevo el trafico para generar un nuevo fichero de configuración, dejando el sistema en un estado consistente para la próxima ejecución.


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
├── IA-calls/              # Llamadas a IA
│   |── index.ts           # Punto de entrada para llamadas a IA
│   ├── config.ts          # Generación de fichero de configuración para API
│   └── analizeComments.ts # Análisis de comentarios usando IA
│
├── types/                 # Tipos TypeScript
│   └── index.ts           # Definición de Comment, EndpointConfiguration y tipos auxiliares
│
└── utils/                 # Utilidades
    |── extraction.ts      # Funciones de extracción de comentarios usando MidScene
    ├── api.ts             # Funciones para realizar llamadas a la API
    ├── fallback.ts        # Función fallback para ejecutar MidScene + Playwright
    └── index.ts           # Funciones auxiliares basicas y punto de entrada


examples/
└── basic-demo.ts          # Demo básico de Midscene con Puppeteer

e2e/                       # Tests con Playwright
├── fixture.ts             # Configuración de tests
|── ebay-search.spec.ts    # Test de búsqueda en eBay
├── comments.spec.ts       # Test de extracción de comentarios
└── catchComments.spec.ts  # Test de extracción de llamadas API

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


## 📚 Recursos

- [Documentación Midscene](https://midscenejs.com/integrate-with-puppeteer.html)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Puppeteer Docs](https://pptr.dev/)
- [Playwright Testing](https://playwright.dev/docs/intro)

### Requisitos
- Node.js >= 18.0.0
- API key de Gemini
- Navegador compatible con Puppeteer/Playwright

## Anexo

### Implementación de la extracción de API

La implementación de la extracción de API se basa en capturar el tráfico de red de la página web para identificar las llamadas a la API que se utilizan para cargar los comentarios. Esto se realiza mediante un test E2E con Playwright que utiliza MidScene para navegar hasta la sección de comentarios y capturar las solicitudes HTTP.

El test al iniciarse empieza a capturar el tráfico de red y, buscando todas las responses que llegan y filtrando aquellas que en su url tienen las palabras 'comentarios' o 'comments', para cada respuesta obtiene su request asociada y guarda ambas en respectivos ficheros dentro de la carpeta `output/traffic/`.

El analisis de MidScene es el más conciencudo de los implementados, y se basa en varias estrategias:
1. **Cookies**: Comprueba si hay un boton de cookies y en ese caso se aceptan.
2. **Boton de comentarios**: Al acceder a la noticia, comprueba si o bien hay ya un botón de comentarios visible o bien si tras hacer un scroll aparece.
   1. **Búsquedad de comentarios**: Si no se ha encontrado el botón de comentarios, entonces scrollea hasta abajo de la página para intentar que cargen y empieza a subir poco a poco hasta que encuentra los comentarios, con un maximo de 5 intentos.
3. **Navegación por la sección de comentarios**: Una vez que se ha encontrado la sección de comentarios, ya sea por pulsar el botón o por scroll, se navega por esta intentado generar el mayor número posible de solicitudes de la API para capturar más trafico y poder dar más información a la IA.
   1. **Cargar más comentarios**: Durante la navegación, si hay un botón de "Cargar más comentarios", se pulsa para poder seguir explorando. 
   2. **Máximo de iteraciones**: Para evitar que el test se quede atascado, se establece un máximo de 8 iteraciones para cargar más comentarios.