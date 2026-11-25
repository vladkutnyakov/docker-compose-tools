# AGENTS.md

Docker Compose Tools: a VS Code extension (`src/`) plus a terminal companion
app `dct` (`cli/`). Both share the same core logic.

## Layout and boundaries

- `src/` — VS Code extension. Compiled with `tsc` to `out/` (plain compile, no
  bundler; `package.json` `main` → `out/extension.js`).
- `src/core/` — shared logic (compose status polling, file list, reorder), used
  by both the extension and `dct`. Must not import `vscode`: `cli/build.mjs`
  bundles `../src/core` into the CLI, so a `vscode` import breaks `dct`.
- `cli/` — separate npm package (`dct`, ESM, Ink/React TUI, Node >= 22.13) with
  its own package.json, lockfile, tsconfig, and tests.
- `vsc-extension-quickstart.md` is stock extension-template boilerplate
  ("Hello World"); trust `package.json` and the source, not this file.

## Commands

Root (extension):

- `npm run compile` — build to `out/`
- `npm run watch` — tsc watch; wired as the default VS Code build task, and F5
  ("Run Extension" in `.vscode/launch.json`) launches the Extension Dev Host
- `npm run lint` — eslint, root `src/` only (never lints `cli/`)
- `npm test` — runs `pretest` (compile + lint) then `@vscode/test-cli`, which
  looks for `out/test/**/*.test.js`. No `src/test/` exists yet; add extension
  tests as `src/test/*.test.ts` so they compile into `out/test/`.

`cli/` (run inside `cli/`):

- `npm run build` — esbuild bundle to `dist/dct.js` (npm deps external,
  `../src/core` bundled in). `prepare` runs it, so `npm install -g ./cli`
  builds and installs the `dct` command.
- `npm run typecheck` — `tsc --noEmit`; the tsconfig includes `../src/core`,
  so it typechecks shared code too.
- `npm test` — vitest. Single file: `npx vitest run test/config.test.ts`.
  Tests isolate via the `DCT_CONFIG_DIR` env var pointing at a temp dir; no
  Docker needed.
- `npm publish` — publishes as `docker-compose-tools` (`dct` and `dct-cli`
  are taken on npm; the bin command stays `dct`). `prepublishOnly` runs
  typecheck + tests, `prepare` rebuilds `dist/` during packing.

Changes touching `src/core/`: root `npm run compile && npm run lint`, plus
`cd cli && npm run typecheck && npm test` — the only tests exercising shared
code are in `cli/test/`.

## Conventions and gotchas

- Style (root eslint, enforced): no semicolons (the only error-level rule),
  multi-line curly braces. Root code uses tabs, `cli/` uses 2-space indent.
  No formatter is configured.
- README.md and CHANGELOG.md are bilingual: Russian first, then an English
  mirror below. Update both halves when changing either file.
- `dct import-vscode` reads VS Code's `state.vscdb` with `node:sqlite` — that
  is why `cli` requires Node >= 22.13 (its `engines` field).
- Statuses come from `docker compose ls -a --format json`; `fetchProjects()`
  returning `undefined` means Docker is unavailable — both UIs show a warning
  and block compose commands.
- Packaging is `npx vsce package` (vsce not pinned in devDependencies); the
  root `.vsix` is a gitignored build artifact.
- No CI exists; verification is local.
