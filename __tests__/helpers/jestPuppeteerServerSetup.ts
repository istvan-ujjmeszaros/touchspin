import express from 'express';
import path from 'path';
import puppeteer, {Browser, Page} from "puppeteer";

const puppeteerDebug = process.env.PUPPETEER_DEBUG === '1';

const app = express();
let port: number;

app.use(express.static(path.join(__dirname, '../..')));

let server: any;
let browser: Browser;
let page: Page;

beforeAll(async () => {
  server = app.listen(0, () => {
    port = server.address().port;
    console.log(`Express server listening on port ${port}...`);
  });

  if (puppeteerDebug)  {
    browser = await puppeteer.launch({
      headless: false,
      slowMo: 300,
      devtools: true,
    });
  } else {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'], // Better stability
    });
  }
}, 30000); // Increase timeout for browser launch

afterAll(async () => {
  // Close page first if it exists
  if (page && !page.isClosed()) {
    await page.close().catch(() => {}); // Ignore errors if already closed
  }
  
  // Close browser
  if (browser) {
    await browser.close().catch(() => {}); // Ignore errors if already closed
  }
  
  // Close server
  if (server) {
    await new Promise((resolve) => {
      server.close(() => resolve(undefined));
    });
  }
}, 30000);

beforeEach(async () => {
  // Close existing page if it exists and create a new one
  if (page && !page.isClosed()) {
    await page.close().catch(() => {}); // Ignore errors if already closed
  }
  
  // Create a fresh page for each test
  page = await browser.newPage();
  
  // Set reasonable timeouts and viewport
  await page.setDefaultTimeout(10000);
  await page.setViewport({ width: 1280, height: 720 });
  
  // Navigate to default test page
  await page.goto(`http://localhost:${port}/__tests__/html/index-bs4.html`, {
    waitUntil: 'networkidle0',
    timeout: 10000
  });
}, 15000);

afterEach(async () => {
  // Clean up page resources after each test
  if (page && !page.isClosed()) {
    // Clear any remaining event listeners and timeouts
    await page.evaluate(() => {
      // Clear all timeouts
      let id = window.setTimeout(() => {}, 0);
      while (id--) {
        window.clearTimeout(id);
      }
      
      // Clear all intervals  
      id = window.setInterval(() => {}, 0);
      while (id--) {
        window.clearInterval(id);
      }
    }).catch(() => {}); // Ignore errors
    
    // Don't close page here - let beforeEach handle it
  }
}, 10000);

export { page, port };
