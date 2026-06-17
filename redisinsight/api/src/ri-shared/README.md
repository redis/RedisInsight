# ri-shared — code shared across the RedisInsight apps (API + UI)

Modules here are consumed by **both** the API (relative imports, e.g.
`src/ri-shared/utils/array-index`) and the UI (the `riShared/*` path alias). They live
inside `api/src` because the api's production build (`nest build` → `node dist/src/main`)
compiles with `api/src` as the tsc rootDir — sources outside it restructure `dist/` and
break the packaged app. The UI/Storybook/jest aliases simply point into this folder, so
shared code ships with zero extra packaging surface (desktop bundles it like any api file).

## What belongs here

- Cross-boundary **contracts**: value formats both sides must agree on (e.g. the
  BigInt-as-string array index format), stable message formats, shared constants.
- Small **dependency-free** utilities needed verbatim on both sides.

## Rules

- **No imports** from Nest, React, ioredis, lodash or anything else — dependency-free
  TypeScript only (the UI and API have separate node_modules; nothing here may assume
  either).
- **es2019-compatible**: the api compiles this folder with `target: es2019` — no BigInt
  literals (`1n` is TS2737; use `BigInt('...')`), no newer syntax.
- API code style (semicolons) — this folder is linted by `yarn lint:api`.
- Tests live next to the module (`*.spec.ts`, runs under the api jest config) and define
  the shared behavior once — UI consumers exercise it through their barrel imports.

## Alias wiring (when adding the alias to a new consumer)

`redisinsight/ui/tsconfig.json` + `redisinsight/ui/vite.config.mjs` +
`redisinsight/ui/src/packages/vite.config.mjs` (Workbench plugin builds reach
the `uiSrc/utils` barrel) + `jest.config.cjs` (root, UI tests) +
`.storybook/vite.config.ts` + `redisinsight/desktop/tsconfig.json` all map
`riShared/*` → `redisinsight/api/src/ri-shared/*`.
