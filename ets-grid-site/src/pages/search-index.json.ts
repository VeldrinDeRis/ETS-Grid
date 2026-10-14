// Індекс пошуку для підказок у шапці (SPEC-005 §3.7). Статичний файл на збірці.
import type { APIRoute } from 'astro';
import { searchIndex } from '../lib/shop-data';

export const GET: APIRoute = async () =>
  new Response(JSON.stringify(await searchIndex()), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
