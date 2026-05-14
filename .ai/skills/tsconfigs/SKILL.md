---
name: tsconfigs
description: >-
  Locate and modify TypeScript configuration in RedisInsight. Use when adding
  path aliases, introducing a new TS area, debugging webpack/ts-node/ESLint
  path resolution, or the user asks about tsconfig, path mappings, or where
  TypeScript is configured.
---

# TypeScript Configuration

RedisInsight uses a focused root `tsconfig.json` as a catch-all (stories, configs/, ts-node fallback), plus standalone per-area tsconfigs for everything that has a dedicated build tool or distinct cross-area path needs. ESLint uses `parserOptions.project: true` to auto-discover the nearest tsconfig per file.

## Layout

| File | Owns | Consumers |
| - | - | - |
| `tsconfig.json` (root) | Catch-all for `stories/**` and `configs/**`. Provides `esModuleInterop` + `module: CommonJS` for ts-node, and `uiSrc/*` / `apiClient` paths for stories | ts-node (via `TS_NODE_PROJECT` in build scripts), ESLint for `stories/**`, IDE fallback |
| `redisinsight/ui/tsconfig.json` | UI source, `uiSrc/*`, `apiClient` paths | Vite (UI build), ESLint UI override, `yarn type-check:ui` |
| `redisinsight/api/tsconfig.json` | API source, `src/*`, `tests/*` paths | NestJS build, ESLint API override |
| `redisinsight/desktop/tsconfig.json` | Desktop source. Cross-area paths `desktopSrc/*`, `apiSrc/*`, `uiSrc/*`, `apiClient`, `apiClient/*` | ESLint for desktop files, TS language server / IDE intellisense |
| `.storybook/tsconfig.json` | Storybook framework files, extends UI tsconfig | Storybook build (Vite under the hood) |
| `tests/e2e-playwright/tsconfig.json` | E2E suite (standalone sub-project) | E2E runner |

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

The webpack configs in `configs/` are `.ts` files with type annotations. When `webpack --config ./configs/*.ts` runs, `ts-node` compiles them. Three package.json scripts set `TS_NODE_PROJECT=./tsconfig.json` so ts-node uses the right compiler options (`module: CommonJS`, `esModuleInterop`):

- `build:main`
- `build:main:stage`
- `build:stage`

The root tsconfig deliberately does not set `allowJs`. Any `.js` file inside `scripts/` or `configs/` must be CommonJS (`require` / `module.exports`) — Node 22's module syntax detection will treat ESM-syntax `.js` files as ESM and break references to `__dirname`. Two scripts already converted for this reason: `scripts/prebuild.js`, `scripts/DeleteSourceMaps.js`.

## ESLint

`.eslintrc.js`:

- Root `parserOptions.project: true` — auto-discovers the nearest tsconfig per file.
- API override: `parserOptions.project: redisinsight/api/tsconfig.json` (explicit).
- UI override: `parserOptions.project: redisinsight/ui/tsconfig.json` (explicit).
- Files in `.storybook/`, `.github/`, etc. are not linted by `eslint .` because ESLint skips dot-prefixed paths during directory expansion.

`stories/**` and `redisinsight/desktop/**` get covered by the root tsconfig and desktop tsconfig respectively (auto-discovery walks up to find them).

## Common tasks

### Adding a path alias used by desktop / electron

1. Add the alias to `redisinsight/desktop/tsconfig.json` `compilerOptions.paths`.
2. If the alias is also used by UI code, add it to `redisinsight/ui/tsconfig.json`.
3. If the alias is also used by API code, add it to `redisinsight/api/tsconfig.json`.
4. For aliases used by the **electron bundle** (anything imported from `redisinsight/desktop/**`), also mirror the alias into `configs/webpack.config.base.ts` `resolve.alias`. Vite resolves UI aliases from `redisinsight/ui/tsconfig.json` automatically.

### Adding a new top-level TS folder

If it's small and uses the same compiler options as stories/configs, add its path to the root `tsconfig.json` `include`. Otherwise create a dedicated tsconfig:

```json
{
  "extends": "../redisinsight/ui/tsconfig.json",
  "include": ["**/*"]
}
```

Without coverage in either, ESLint's `parserOptions.project: true` will error on those files.

### Adding a new `.ts` webpack config under `configs/`

No action needed — the root tsconfig already includes `configs/**`.

### Adding a Node script that needs to run without ts-node

Place under `scripts/` as CommonJS (`require`/`module.exports`). Do not use ESM syntax — the root tsconfig does not have `allowJs` and Node 22 will load ESM-syntax `.js` files as ESM (no `__dirname`).
