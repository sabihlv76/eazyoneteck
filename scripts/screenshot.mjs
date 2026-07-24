/**
 * Capture screenshots of the running dev server for design review.
 *
 * Usage:
 *   node scripts/screenshot.mjs [outDir] [baseUrl]
 *
 * Requires the dev server running (npm run dev) and Playwright available.
 * Captures each route at desktop (1440px) and mobile (390px) widths.
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const outDir = process.argv[2] || 'screenshots';
const baseUrl = process.argv[3] || 'http://localhost:3000';

const routes = [
  { name: 'home', path: '/' },
  { name: 'product', path: '/product/galaxy-a55-256' },
  { name: 'wishlist', path: '/wishlist' },
  { name: 'privacy', path: '/privacy' },
];

const viewports = [
  { label: 'desktop', width: 1440, height: 900 },
  { label: 'mobile', width: 390, height: 844 },
];

mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
try {
  for (const route of routes) {
    for (const vp of viewports) {
      const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
      try {
        await page.goto(`${baseUrl}${route.path}`, { waitUntil: 'networkidle', timeout: 20000 });
        await page.waitForTimeout(1200);
        const file = `${outDir}/${route.name}-${vp.label}.png`;
        await page.screenshot({ path: file, fullPage: true });
        console.log(`✓ ${file}`);
      } catch (err) {
        console.error(`✗ ${route.name}-${vp.label}: ${err.message}`);
      } finally {
        await page.close();
      }
    }
  }
} finally {
  await browser.close();
}
console.log('Done.');
