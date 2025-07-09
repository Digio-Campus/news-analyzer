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


## 📁 Estructura del proyecto

```
src/
├── main.ts              # Punto de entrada principal
│
├── extractors/          # Extracción de comentarios
│   ├── index.ts         # Punto de entrada para extractores
│   ├── puppeteer.ts     # Extractor de comentarios con Puppeteer
│   └── bridge.ts        # Extractor de comentarios con Bridge Mode
│
├── analyzers/           # Análisis de comentarios
│   └── index.ts         # Generación de estadísticas
│
├── types/               # Tipos TypeScript
│   └── index.ts         # Definición de Comment
│
└── utils/               # Utilidades
    |── extraction.ts    # Funciones de extracción de comentarios abstractas
    └── index.ts         # Funciones auxiliares basicas


examples/
└── basic-demo.ts        # Demo básico de Midscene con Puppeteer

e2e/                     # Tests con Playwright
├── fixture.ts           # Configuración de tests
├── comments.spec.ts     # Test de extracción de comentarios
└── ebay-search.spec.ts  # Test de búsqueda en eBay
```

## ⚙️ Scripts disponibles

- `npm run start <url>` - Análisis de comentarios de una noticia con Puppeteer
- `npm run start <url> bridge` - Análisis de comentarios de una noticia con Bridge Mode
- `npm run demo` - Demo básico de Midscene para comprobar la integración con Puppeteer
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
- **Midscene AI**: Extracción inteligente de comentarios
- **Análisis de sentimiento**: La IA analiza cada comentario individualmente
- **Detección de emociones**: Identifica alegría, enfado, tristeza o neutral
- **Scroll automático**: Busca comentarios en toda la página

### Análisis de estadísticas
- Estadísticas de sentimiento (positivo/negativo/neutral)
- Análisis de emociones dominantes
- Comentario más popular (por likes/reacciones)
- Resumen estadístico completo

### Testing
- **Playwright**: Framework de testing E2E
- **Midscene integration**: Tests con capacidades de IA
- Tests funcionando correctamente
- Ubicación: `e2e/` folder

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
