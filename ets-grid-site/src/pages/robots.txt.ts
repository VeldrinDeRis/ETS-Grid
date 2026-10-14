// robots.txt (SPEC-008 §3.3): як для бойового сайту — службові адреси закриті, посилання на sitemap.
import type { APIRoute } from 'astro';
import { NOINDEX_PATHS } from '../lib/seo';

export const GET: APIRoute = ({ site }) =>
  new Response(
    ['User-agent: *', ...NOINDEX_PATHS.map((p) => `Disallow: ${p}`), 'Disallow: /search-index.json', '', `Sitemap: ${new URL('/sitemap-index.xml', site).href}`, ''].join('\n'),
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
