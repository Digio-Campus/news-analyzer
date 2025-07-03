import 'dotenv/config'; // Cargar variables de entorno
import puppeteer from 'puppeteer';
import { PuppeteerAgent } from '@midscene/web/puppeteer';

// Demo simple basado en la documentación de Midscene
async function basicDemo() {
  console.log('🚀 Demo básico de Midscene + Puppeteer');

  const browser = await puppeteer.launch({
    headless: false, // Para ver qué pasa
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    // Ir a eBay (ejemplo de la documentación)
    console.log('📄 Navegando a eBay...');
    await page.goto('https://www.ebay.com');
    await new Promise((r) => setTimeout(r, 5000));

    // Crear agente de Midscene
    const agent = new PuppeteerAgent(page);

    // Buscar auriculares (ejemplo de la documentación)
    console.log('🔍 Buscando auriculares...');
    await agent.aiAction('type "Headphones" in search box, hit Enter');
    await new Promise((r) => setTimeout(r, 5000));

    // Extraer información de productos
    console.log('📋 Extrayendo información de productos...');
    const items = await agent.aiQuery(
      '{itemTitle: string, price: number}[], find items in list and their prices'
    );

    console.log('🎧 Auriculares encontrados:', items);
  } finally {
    await browser.close();
  }
}

// Ejecutar demo
basicDemo().catch(console.error);
