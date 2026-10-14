#!/usr/bin/env node
// Статичний сервер без залежностей для показу мокапу (SPEC-001 §3.9, D-019).
// Запуск: node serve.mjs [--root dist] [--port 4321] [--open]
// Віддає index.html для адрес зі «/», 404.html для невідомих адрес.
import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { extname, join, normalize, resolve, sep, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const here = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const arg = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};

const defaultRoot = existsSync(join(here, 'dist')) ? join(here, 'dist') : resolve(here, '..', 'dist');
const root = resolve(arg('root', defaultRoot));
const preferredPort = Number(arg('port', process.env.PORT ?? 4321));
const shouldOpen = args.includes('--open');

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.pdf': 'application/pdf',
};

function resolveFile(urlPath) {
  let path;
  try {
    path = decodeURIComponent(urlPath);
  } catch {
    return null;
  }
  const target = normalize(join(root, path));
  if (target !== root && !target.startsWith(root + sep)) return null;
  if (existsSync(target) && statSync(target).isFile()) return target;
  const index = join(target, 'index.html');
  if (existsSync(index)) return index;
  return null;
}

function send(res, status, file) {
  res.writeHead(status, { 'Content-Type': TYPES[extname(file).toLowerCase()] ?? 'application/octet-stream' });
  createReadStream(file).pipe(res);
}

const server = createServer((req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost');
  const file = resolveFile(url.pathname);

  // /koshyk → /koshyk/ (trailingSlash: 'always')
  if (file && !url.pathname.endsWith('/') && file.endsWith(`${sep}index.html`) && extname(url.pathname) === '') {
    res.writeHead(301, { Location: `${url.pathname}/${url.search}` });
    res.end();
    return;
  }
  if (file) return send(res, 200, file);

  const notFound = join(root, '404.html');
  if (existsSync(notFound)) return send(res, 404, notFound);
  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('404');
});

function openBrowser(url) {
  const cmd = process.platform === 'win32' ? 'cmd' : process.platform === 'darwin' ? 'open' : 'xdg-open';
  const cmdArgs = process.platform === 'win32' ? ['/c', 'start', '', url] : [url];
  spawn(cmd, cmdArgs, { stdio: 'ignore', detached: true }).unref();
}

function listen(port, attemptsLeft) {
  server.once('error', (err) => {
    if (err.code === 'EADDRINUSE' && attemptsLeft > 0) return listen(port + 1, attemptsLeft - 1);
    console.error(err.message);
    process.exit(1);
  });
  server.listen(port, '127.0.0.1', () => {
    const url = `http://localhost:${port}/`;
    console.log(`ETS GRID мокап: ${url}  (Ctrl+C — зупинити)`);
    if (shouldOpen) openBrowser(url);
  });
}

if (!existsSync(join(root, 'index.html'))) {
  console.error(`Немає зібраного сайту в ${root}. Спершу: npm run build`);
  process.exit(1);
}
listen(preferredPort, 10);
