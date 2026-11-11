import { readFileSync } from 'node:fs';
import * as path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import packageJSON from './package.json' with { type: 'json' };

const license = readFileSync(path.resolve('./LICENSE'), {
  encoding: 'utf-8',
});
const licenseBanner = ['/*', '@license', license, '*/'].join('\n');

// `'use client'` goes on the `client` entry chunk and nowhere else. In React Server Components a file
// with the directive turns every one of its exports into a client reference, so putting it on the
// whole bundle made the plain check functions throw when called from server components, server
// actions and route handlers. `test/dist.spec.ts` checks the built files.
const banner = (chunk: { isEntry: boolean; name: string }) =>
  chunk.isEntry && chunk.name === 'client' ? `${licenseBanner}\n'use client';` : licenseBanner;

// Everything a consumer brings themselves stays out of the bundle.
const external = [...new Set([...Object.keys(packageJSON.peerDependencies), 'react/jsx-runtime'])];

// One output per format, because the shared chunk's extension depends on the format and
// `chunkFileNames` is not told which format it is naming for. `.mjs` for ES and `.js` for CJS, as
// the package has no `"type"` field.
const outputs = (
  [
    ['es', 'mjs'],
    ['cjs', 'js'],
  ] as const
).map(([format, extension]) => ({
  format,
  banner,
  entryFileNames: `[name].${extension}`,
  chunkFileNames: `[name].${extension}`,
  // The check functions get a chunk of their own, without the directive. Left to itself the bundler
  // would put them in one shared chunk with the components, which `index` would then re-export
  // directly instead of through the `client` entry.
  codeSplitting: {
    groups: [{ name: 'checks', test: /[\\/]src[\\/](lib[\\/]|types\.ts)/ }],
  },
  sourcemapExcludeSources: true,
}));

export default defineConfig({
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    emptyOutDir: true,
    lib: {
      entry: {
        index: 'src/index.ts',
        client: 'src/client.ts',
      },
      name: 'piplupReactAcl',
    },
    minify: true,
    outDir: './dist',
    reportCompressedSize: true,
    sourcemap: false,
    rollupOptions: {
      external,
      // Lets `index` import the components from the `client` entry chunk itself rather than from a
      // shared chunk that both entries re-export, which would carry no directive.
      preserveEntrySignatures: 'allow-extension',
      output: outputs,
    },
  },
  plugins: [
    react(),
    dts({
      entryRoot: 'src',
      tsconfigPath: 'tsconfig.lib.json',
    }),
  ],
});
