// @vitest-environment node

// Checks the built files, so it needs `npm run build` first. CI and the release script both build
// before testing; a local `npm test` without a build skips this file rather than failing.
//
// In React Server Components a module with `'use client'` turns every export into a client
// reference. The directive therefore belongs on the `client` entry (the provider, hook and
// components) and must stay off `index` and the chunk holding the check functions, or calling
// `hasPermission` from a server component throws.

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import * as path from 'node:path';
import { pathToFileURL } from 'node:url';

import { describe, expect, it } from 'vitest';

const dist = path.resolve(__dirname, '../dist');
const built = existsSync(path.join(dist, 'index.mjs'));

if (!built && process.env.CI !== undefined) {
  throw new Error('dist/ is missing. Run `npm run build` before `npm test`.');
}

/** The first statement after the license comment. */
function firstStatement(file: string): string {
  const source = readFileSync(path.join(dist, file), 'utf-8');
  const licenseEnd = source.startsWith('/*') ? source.indexOf('*/') + 2 : 0;

  return source.slice(licenseEnd).trimStart();
}

const startsWithUseClient = (file: string) => /^(['"])use client\1/.test(firstStatement(file));

describe.skipIf(!built)('dist', () => {
  it.each(['client.mjs', 'client.js'])('%s starts with the use client directive', (file) => {
    expect(startsWithUseClient(file)).toBe(true);
  });

  it('emits the expected entry and chunk files', () => {
    const scripts = readdirSync(dist)
      .filter((file) => /\.m?js$/.test(file))
      .sort();

    expect(scripts).toEqual([
      'checks.js',
      'checks.mjs',
      'client.js',
      'client.mjs',
      'index.js',
      'index.mjs',
    ]);
  });

  it.each(['index.mjs', 'index.js', 'checks.mjs', 'checks.js'])(
    '%s has no use client directive',
    (file) => {
      expect(startsWithUseClient(file)).toBe(false);
      expect(readFileSync(path.join(dist, file), 'utf-8')).not.toMatch(/(['"])use client\1/);
    },
  );

  it('index re-exports the components from the client entry instead of bundling them', () => {
    const esm = readFileSync(path.join(dist, 'index.mjs'), 'utf-8');
    const cjs = readFileSync(path.join(dist, 'index.js'), 'utf-8');

    expect(esm).toMatch(/from\s*["']\.\/client\.mjs["']/);
    expect(cjs).toMatch(/require\(["']\.\/client\.js["']\)/);
    expect(esm).not.toMatch(/createContext/);
    expect(cjs).not.toMatch(/createContext/);
  });

  it('the check functions work from the built index in plain Node', async () => {
    const { hasPermission, hasRole } = await import(
      pathToFileURL(path.join(dist, 'index.mjs')).href
    );

    expect(hasPermission({ permissions: ['report:*'] }, 'report:read')).toBe(true);
    expect(hasRole({ roles: ['admin'] }, 'admin')).toBe(true);
  });
});
