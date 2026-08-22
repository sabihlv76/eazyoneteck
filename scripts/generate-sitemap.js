import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { products as seedProducts } from '../src/productsData.js';

const SITE_URL = 'https://eazy1teck.com';
const API_URL = 'https://www.eazy1teck.com/api/products';

// Prefer the live catalogue so newly added products are indexed and removed
// ones drop out; fall back to the static seed if the API is unreachable.
async function loadProducts() {
  try {
    const response = await fetch(API_URL, { signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = await response.json();
    const live = Array.isArray(payload?.products) ? payload.products.filter((product) => product?.id) : [];
    if (live.length) return { products: live, source: 'live API' };
  } catch (error) {
    console.warn(`Sitemap: live products unavailable (${error.message}); using static seed.`);
  }
  return { products: seedProducts, source: 'static seed' };
}

const { products, source } = await loadProducts();
const today = new Date().toISOString().split('T')[0];

const staticPages = [
  { path: '/', priority: '1.0', changefreq: 'daily' },
  { path: '/wishlist', priority: '0.5', changefreq: 'weekly' },
  { path: '/privacy', priority: '0.3', changefreq: 'yearly' },
  { path: '/refund-policy', priority: '0.3', changefreq: 'yearly' },
  { path: '/terms', priority: '0.3', changefreq: 'yearly' },
];

const urls = [
  ...staticPages.map(
    (page) => `  <url>
    <loc>${SITE_URL}${page.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  ),
  ...products.map(
    (product) => `  <url>
    <loc>${SITE_URL}/product/${product.id}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
  ),
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`;

const outPath = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'sitemap.xml');
writeFileSync(outPath, sitemap);
console.log(`Sitemap written with ${urls.length} URLs (${products.length} products from ${source}) to public/sitemap.xml`);
