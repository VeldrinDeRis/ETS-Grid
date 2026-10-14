import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, describe, expect, test } from 'vitest';
import { PROJECT, assertBuilt } from '../helpers/dist';

assertBuilt();

const outDir = mkdtempSync(join(tmpdir(), 'ets-grid-release-test-'));
const zip = join(outDir, 'release.zip');

afterAll(() => rmSync(outDir, { recursive: true, force: true }));

describe('SPEC-001/AC-22 архів для замовника', () => {
  test('zip містить site/ (dist, serve.mjs, start.cmd) і source/ без node_modules', () => {
    execFileSync(process.execPath, [join(PROJECT, 'scripts', 'release.mjs'), '--skip-build', '--out', zip], {
      stdio: 'pipe',
    });
    const entries = execFileSync('tar', ['-t', '-f', zip], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
      .split(/\r?\n/)
      .map((e) => e.replace(/\\/g, '/'))
      .filter(Boolean);

    expect(entries).toContain('site/serve.mjs');
    expect(entries).toContain('site/start.cmd');
    expect(entries).toContain('site/dist/index.html');
    expect(entries).toContain('site/dist/koshyk/index.html');
    expect(entries).toContain('source/package.json');
    expect(entries).toContain('source/src/data/catalog.json');
    expect(entries.filter((e) => /^source\/(node_modules|dist|\.astro)\//.test(e))).toEqual([]);
  }, 120000);
});
