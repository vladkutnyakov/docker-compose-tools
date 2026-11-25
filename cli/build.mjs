import { build } from 'esbuild'

// bundles cli sources together with ../src/core; npm dependencies stay external
await build({
  entryPoints: ['src/main.tsx'],
  outfile: 'dist/dct.js',
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node22',
  packages: 'external',
  jsx: 'automatic',
  banner: { js: '#!/usr/bin/env node' },
})
