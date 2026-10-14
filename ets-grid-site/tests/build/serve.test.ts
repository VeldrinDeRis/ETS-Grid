import { spawn, type ChildProcess } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { DIST, PROJECT, assertBuilt } from '../helpers/dist';

assertBuilt();

let server: ChildProcess;
let base = '';

beforeAll(async () => {
  server = spawn(process.execPath, [join(PROJECT, 'scripts', 'serve.mjs'), '--root', DIST, '--port', '4791'], {
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  base = await new Promise<string>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('serve.mjs не стартував')), 10000);
    server.stdout!.on('data', (chunk: Buffer) => {
      const m = chunk.toString().match(/http:\/\/localhost:(\d+)\//);
      if (m) {
        clearTimeout(timer);
        resolve(`http://127.0.0.1:${m[1]}`);
      }
    });
    server.on('error', reject);
  });
});

afterAll(() => {
  server?.kill();
});

describe('SPEC-001/AC-21 serve.mjs', () => {
  test('/koshyk/ → 200, HTML кошика', async () => {
    const res = await fetch(`${base}/koshyk/`);
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('text/html');
    expect(await res.text()).toContain('<h1>Кошик</h1>');
  });

  test('/net-takoi/ → 404 зі вмістом 404.html', async () => {
    const res = await fetch(`${base}/net-takoi/`);
    expect(res.status).toBe(404);
    expect(await res.text()).toBe(readFileSync(join(DIST, '404.html'), 'utf8'));
  });

  test('/koshyk без «/» → 301 на /koshyk/', async () => {
    const res = await fetch(`${base}/koshyk`, { redirect: 'manual' });
    expect(res.status).toBe(301);
    expect(res.headers.get('location')).toBe('/koshyk/');
  });

  test('вихід за межі dist/ не відпрацьовує', async () => {
    const res = await fetch(`${base}/..%2F..%2Fpackage.json`);
    expect(res.status).toBe(404);
  });
});
