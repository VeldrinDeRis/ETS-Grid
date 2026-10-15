#!/usr/bin/env node
// Вага JS сторінок зібраного сайту — тим самим методом, що tests/build/budget.test.ts (pageJsGz, SPEC-001 AC-24):
// <script src> + інлайн-скрипти + острови (component-url, renderer-url) з усіма імпортами, кожен файл раз, gz.
// Колонки: total — як у тесті (зі статичними й динамічними імпортами), static — лише статичні (перше завантаження).
// Запуск із кореня проєкту після збірки:  node qa/pagejs.mjs ets-grid-site/dist --files /,/batarei/,/batarei/dlya-domu/
// --files перелічує сторінки, для яких показати розклад за файлами (* — файл лише в динамічних імпортах).
// Без залежностей. Результати 15.10.2026 — DECISIONS.md D-066.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { gzipSync } from 'node:zlib';

const [dist, ...rest] = process.argv.slice(2);
if (!dist || !existsSync(join(dist, 'index.html'))) {
  console.error('Вкажіть теку збірки: node qa/pagejs.mjs ets-grid-site/dist [--files /,/batarei/]');
  process.exit(1);
}
const filesFor = (rest.indexOf('--files') >= 0 ? rest[rest.indexOf('--files') + 1] : '').split(',').filter(Boolean);

const walk = (d) => readdirSync(d).flatMap((n) => { const f = join(d, n); return statSync(f).isDirectory() ? walk(f) : [f]; });
const urlOf = (f) => { const r = relative(dist, f).split(sep).join('/'); return r === 'index.html' ? '/' : r.endsWith('/index.html') ? `/${r.slice(0, -10)}` : `/${r}`; };
const importSpec = (spec, from) => (spec.startsWith('/') ? join(dist, spec) : join(dirname(from), spec));
const gz = new Map();
const gzOf = (f) => { if (!gz.has(f)) gz.set(f, gzipSync(readFileSync(f)).length); return gz.get(f); };

function graph(entry, dynamic, seen = new Set()) {
  if (seen.has(entry) || !existsSync(entry)) return seen;
  seen.add(entry);
  const code = readFileSync(entry, 'utf8');
  for (const m of code.matchAll(/(?:import|export)\s*(?:[^'"]*?from\s*)?["']([^"']+\.m?js)["']/g)) graph(importSpec(m[1], entry), dynamic, seen);
  if (dynamic) for (const m of code.matchAll(/import\(\s*["']([^"']+\.m?js)["']\s*\)/g)) graph(importSpec(m[1], entry), dynamic, seen);
  return seen;
}

function page(file) {
  const html = readFileSync(file, 'utf8');
  const entries = new Set();
  let inline = 0;
  for (const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
    const src = /\bsrc="([^"]+)"/.exec(m[1]);
    if (src) entries.add(join(dist, src[1]));
    else if (!/application\/ld\+json/.test(m[1])) inline += gzipSync(m[2]).length;
  }
  for (const m of html.matchAll(/<astro-island\b[^>]*>/g)) {
    for (const a of ['component-url', 'renderer-url']) {
      const v = new RegExp(`\\b${a}="([^"]+)"`).exec(m[0]);
      if (v) entries.add(join(dist, v[1]));
    }
  }
  const sum = (dynamic) => {
    const files = new Set();
    for (const e of entries) for (const f of graph(e, dynamic)) files.add(f);
    return { files, kb: ([...files].reduce((t, f) => t + gzOf(f), 0) + inline) / 1024 };
  };
  const total = sum(true);
  const stat = sum(false);
  const names = [...total.files].map((f) => relative(dist, f)).join();
  return { url: urlOf(file), catalog: html.includes('CatalogFilters'), react: /react\./.test(names), total: total.kb, static: stat.kb, files: total.files, staticFiles: stat.files };
}

const pages = walk(dist).filter((f) => f.endsWith('index.html')).map(page).sort((a, b) => b.total - a.total);
const fmt = (n) => n.toFixed(1).padStart(6);
console.log('total  static  flags  url   (gz KB; C — каталог, R — React-острів)');
for (const p of pages.slice(0, 12)) console.log(`${fmt(p.total)} ${fmt(p.static)}  ${p.catalog ? 'C' : ' '}${p.react ? 'R' : ' '}     ${p.url}`);
const cat = pages.filter((p) => p.catalog);
if (cat.length) console.log(`\nсторінок каталогу: ${cat.length}; max ${fmt(Math.max(...cat.map((p) => p.total)))} min ${fmt(Math.min(...cat.map((p) => p.total)))}`);
for (const u of filesFor) {
  const p = pages.find((p) => p.url === u);
  if (!p) { console.log(`\n${u}: сторінки немає`); continue; }
  console.log(`\n${u} — файли (gz KB, * = лише динамічний імпорт):`);
  for (const f of [...p.files].sort((a, b) => gzOf(b) - gzOf(a))) console.log(`  ${fmt(gzOf(f) / 1024)} ${p.staticFiles.has(f) ? ' ' : '*'} ${relative(dist, f).split(sep).join('/')}`);
}
