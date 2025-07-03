# News Analyzer PoC

Prueba de concepto para análisis automatizado de comentarios de noticias usando TypeScript, Puppeteer y Midscene.

## 🚀 Instalación

1. **Clona o descarga el proyecto**
2. **Instala dependencias:**
   ```bash
   npm install
   ```
3. **Configura tu API key de OpenAI:**
   ```bash
   copy .env.example .env
   ```
   Edita `.env` y añade tu API key de OpenAI.

## 🎯 Uso rápido

### Demo básico (recomendado para empezar):
```bash
npm run demo
```

### Análisis de comentarios:
```bash
npm start
```

## 📁 Estructura simple

- `src/main.ts` - Archivo principal
- `src/extractors/` - Extracción de comentarios con AI
- `src/analyzers/` - Generación de estadísticas
- `src/types/` - Tipos TypeScript básicos
- `examples/` - Demos y ejemplos

## ⚙️ Scripts disponibles

- `npm start` - Ejecutar análisis principal
- `npm run demo` - Demo básico de Midscene
- `npm run build` - Compilar TypeScript
- `npm run dev` - Modo desarrollo con watch

## 🔧 Configuración

Edita `src/main.ts` para cambiar la URL de la noticia a analizar.

## 📚 Recursos

- [Documentación Midscene](https://midscenejs.com/integrate-with-puppeteer.html)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Puppeteer Docs](https://pptr.dev/)
