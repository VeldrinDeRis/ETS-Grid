#!/usr/bin/env node
// Архів для замовника (SPEC-001 §3.9, D-019, D-026 п. 9):
//   releases/ets-grid-site-ГГГГ-ММ-ДД.zip
//   ├── site/    dist/ + serve.mjs + start.cmd — подвійний клик по start.cmd
//   └── source/  проєкт без node_modules, dist, .astro
// Запуск: npm run release  [-- --skip-build]
import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const project = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const releases = resolve(project, '..', 'releases');
const skipBuild = process.argv.includes('--skip-build');
const outArg = process.argv.indexOf('--out');
const date = new Date().toISOString().slice(0, 10);
const zipPath = outArg >= 0 ? resolve(process.argv[outArg + 1]) : join(releases, `ets-grid-site-${date}.zip`);

const EXCLUDE = new Set(['node_modules', 'dist', '.astro', 'test-results', 'playwright-report', '.vscode']);

const run = (cmd, args, opts = {}) => execFileSync(cmd, args, { stdio: 'inherit', shell: process.platform === 'win32', ...opts });

if (!skipBuild) run('npm', ['run', 'build'], { cwd: project });
if (!existsSync(join(project, 'dist', 'index.html'))) {
  console.error('Немає dist/. Запустіть без --skip-build.');
  process.exit(1);
}

const staging = mkdtempSync(join(tmpdir(), 'ets-grid-release-'));
try {
  const site = join(staging, 'site');
  mkdirSync(site);
  cpSync(join(project, 'dist'), join(site, 'dist'), { recursive: true });
  cpSync(join(project, 'scripts', 'serve.mjs'), join(site, 'serve.mjs'));
  cpSync(join(project, 'scripts', 'start.cmd'), join(site, 'start.cmd'));

  cpSync(project, join(staging, 'source'), {
    recursive: true,
    filter: (src) => {
      const rel = relative(project, src);
      return rel === '' || !EXCLUDE.has(rel.split(sep)[0]);
    },
  });

  mkdirSync(dirname(zipPath), { recursive: true });
  rmSync(zipPath, { force: true });
  // bsdtar (Windows 10+, macOS) пише zip за розширенням через -a.
  execFileSync('tar', ['-a', '-c', '-f', zipPath, '-C', staging, 'site', 'source'], { stdio: 'inherit' });
  console.log(`Готово: ${zipPath}`);
} finally {
  rmSync(staging, { recursive: true, force: true });
}
