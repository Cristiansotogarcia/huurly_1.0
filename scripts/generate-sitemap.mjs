import { writeFileSync } from 'fs';
import { resolve } from 'path';

const siteUrl = process.env.SITE_URL || 'https://huurly.example.com';

const routes = [
  '/',
  '/property-search',
  '/help-support',
  '/algemene-voorwaarden',
  '/privacybeleid'
];

const urls = routes
  .map((route) => `  <url><loc>${siteUrl}${route}</loc></url>`)
  .join('\n');

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;

writeFileSync(resolve('public', 'sitemap.xml'), sitemap);
console.log('Sitemap generated at public/sitemap.xml');
