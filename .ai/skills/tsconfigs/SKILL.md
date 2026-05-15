---
name: tsconfigs
description: >-
  Locate and modify TypeScript configuration in RedisInsight. Use when adding
  path aliases, introducing a new TS area, debugging webpack/ts-node/ESLint
  path resolution, or the user asks about tsconfig, path mappings, or where
  TypeScript is configured.
---

# TypeScript Configuration

RedisInsight has no root `tsconfig.json`. Config is split per area, each owning its own paths, includes, and consumers. ESLint uses `parserOptions.project: true` to auto-discover the nearest tsconfig for each linted file.

## Layout

| File | Owns | Consumers |
| - | - | - |
| `redisinsight/ui/tsconfig.json` | UI source, `uiSrc/*`, `apiClient` paths | Vite (UI build), ESLint UI override, `yarn type-check:ui` |
| `redisinsight/api/tsconfig.json` | API source, `src/*`, `tests/*` paths | NestJS build, ESLint API override |
| `redisinsight/api/tsconfig.check.json` | Same as base + `strict: true` (with `strictPropertyInitialization` and `useUnknownInCatchVariables` off) and `noEmit: true` | `yarn type-check:api` only — kept separate so strict mode doesn't break `nest build`. See the `type-check-baselines` skill. |
| `redisinsight/desktop/tsconfig.json` | Desktop source. Paths `desktopSrc/*`, `apiSrc/*`, `uiSrc/*`, `apiClient`, `apiClient/*` for TypeScript / IDE intellisense | ESLint for desktop files, TS language server |
| `configs/tsconfig.json` | Compiler options (`module: CommonJS`, `esModuleInterop`) used by `ts-node` to load the `.ts` webpack configs | `ts-node` via `TS_NODE_PROJECT` set in `build:main` / `build:main:stage` / `build:stage` |
| `.storybook/tsconfig.json` | Storybook framework files, extends UI tsconfig | Storybook + ESLint |
| `stories/tsconfig.json` | Story files. Extends UI tsconfig; rewires `uiSrc/*` to resolve from `redisinsight/ui` | Storybook + ESLint |
| `tests/e2e-playwright/tsconfig.json` | Playwright E2E suite | E2E runner (sub-project with own package.json, eslint-ignored at root) |

## Webpack path resolution (`configs/webpack.config.base.ts`)

Webpack uses explicit `resolve.alias` entries (not `tsconfig-paths-webpack-plugin`):

```ts
alias: {
  desktopSrc: webpackPaths.desktopSrcPath,
  apiSrc: resolve(webpackPaths.apiPath, 'src'),
  uiSrc: webpackPaths.uiSrcPath,
  apiClient: resolve(webpackPaths.riPath, 'api-client'),
  // ...
}
```

If you add a new path alias used by desktop code, add it in **both** places: `redisinsight/desktop/tsconfig.json` (for TypeScript / ESLint / IDE) and `configs/webpack.config.base.ts` `resolve.alias` (for the electron bundle).

## ts-node and webpack TS configs

The webpack configs in `configs/` are `.ts` files with type annotations. When `webpack --config ./configs/*.ts` runs, `ts-node` compiles them. Three package.json scripts set `TS_NODE_PROJECT=./configs/tsconfig.json` so ts-node uses the right compiler options:

- `build:main`
- `build:main:stage`
- `build:stage`

`configs/tsconfig.json` deliberately does not set `allowJs`. Any `.js` file inside `scripts/` or `configs/` must be CommonJS (`require` / `module.exports`) — Node 22's module syntax detection will treat ESM-syntax `.js` files as ESM and break references to `__dirname`. Two scripts converted for this reason: `scripts/prebuild.js`, `scripts/DeleteSourceMaps.js`.

## ESLint

`.eslintrc.js`:

- Root `parserOptions.project: true` — auto-discovers the nearest tsconfig per file.
- API override: `parserOptions.project: redisinsight/api/tsconfig.json` (explicit).
- UI override: `parserOptions.project: redisinsight/ui/tsconfig.json` (explicit).
- Files in `.storybook/`, `.github/`, etc. are not linted by `eslint .` because ESLint skips dot-prefixed paths during directory expansion.

If you add a top-level TS folder that ESLint will reach, drop a tsconfig in it or `parserOptions.project: true` will fail to find one.

## Common tasks

### Adding a path alias used by desktop / electron

1. Add the alias to `redisinsight/desktop/tsconfig.json` `compilerOptions.paths`.
2. If the alias is also used by UI code, add it to `redisinsight/ui/tsconfig.json`.
3. If the alias is also used by API code, add it to `redisinsight/api/tsconfig.json`.
4. For aliases used by the **electron bundle** (anything imported from `redisinsight/desktop/**`), also mirror the alias into `configs/webpack.config.base.ts` `resolve.alias`. Vite resolves UI aliases from `redisinsight/ui/tsconfig.json` automatically.

### Adding a new top-level TS folder

Create a `tsconfig.json` in it. Bare minimum:

```json
{
  "extends": "../redisinsight/ui/tsconfig.json",
  "include": ["**/*"]
}
```

Without it, ESLint's `parserOptions.project: true` will error on those files.

### Adding a new `.ts` webpack config under `configs/`

No action needed — `configs/tsconfig.json` includes `**/*`.

### Adding a Node script that needs to run without ts-node

Place under `scripts/` as CommonJS (`require`/`module.exports`). Do not use ESM syntax — `configs/tsconfig.json` no longer has `allowJs` and Node 22 will load ESM-syntax `.js` files as ESM (no `__dirname`).
