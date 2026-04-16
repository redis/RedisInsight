# Yarn → npm Migration: Pinned Dependency Decisions

These decisions were made to achieve a clean npm migration **without modifying production source code**. Each pinned version replaces the floating resolution that npm chose, matching the behaviour yarn had via `yarn.lock`. They are candidates for follow-up work (version upgrades or code migrations).

---

## 1. `sass-embedded` pinned to `1.77.5`

**Files:** `package.json`
**Declarations:**
- `"sass": "npm:sass-embedded@1.77.5"` — keeps the `node_modules/sass` alias (backward compatibility for tools that resolve `sass`)
- `"sass-embedded": "1.77.5"` — installs `node_modules/sass-embedded` directly so Vite 5.4+ detects it and uses the modern `compile()` API instead of the deprecated `renderSync()` API

**Why pinned to `1.77.5`:** Without a version, npm resolves to the latest (`1.99.0` at time of migration). Three deprecation warning types were introduced in newer versions:

| Warning | Introduced in | Root cause |
|---|---|---|
| `@import` | `1.80.0` (2024-10-17) | SCSS codebase uses the legacy `@import` rule |
| `mixed-decls` | `1.77.8` (2024-07-11) | CSS declarations appear after nested rules in `markdown/index.scss` and others |
| `legacy-js-api` | Became default-visible in `~1.77+` | Vite 5.4 uses `renderSync()` for `node_modules/sass`; only switches to `compile()` when `node_modules/sass-embedded` is detected |

`1.77.5` (2024-06-12) is the last release before all three warnings were introduced or made visible by default.

**Future fixes:**
1. Migrate all `@import` → `@use` / `@forward` in `redisinsight/ui/src/styles/`
2. Fix `mixed-decls` in `redisinsight/ui/src/styles/components/markdown/` (move declarations above nested rules or wrap in `& {}`)
3. Remove both `sass` alias and `sass-embedded` pins, install just `sass-embedded` at latest version — Vite will automatically use the modern API

---

## 2. `@types/express-serve-static-core` overridden to `5.0.6`

**File:** `redisinsight/api/package.json` → `overrides`

**Why:** `@types/express@5.0.0` allows `^5.0.0` of `@types/express-serve-static-core`. npm resolved to `5.1.1`, which changed `ParamsDictionary` from `{ [key: string]: string }` to `{ [key: string]: string | string[] }`. This caused TS2345 errors in middleware files that pass `req.params.dbInstance` (type `string | string[]`) to functions expecting `string`.

**Future fix:** Update middleware files (`redis-connection.middleware.ts`, `connection.middleware.ts`) to handle the `string | string[]` union (e.g. `String(req.params.dbInstance)` or `Array.isArray(...) ? ...[0] : ...`), then remove the override.

---

## 3. `ioredis` pinned to `5.2.2` (exact)

**File:** `redisinsight/api/package.json` → `dependencies`  
**Declaration changed from:** `"ioredis": "^5.2.2"` → `"ioredis": "5.2.2"`

**Why:** `ioredis@5.3.0+` changed the `NatMap` type from a plain object interface to `{ [key: string]: { host: string; port: number } } | NatMapFunction`. The cluster client code (`cluster.ioredis.client.ts`) uses `_.findKey(natMap, { host, port })` — an object shorthand that the lodash types only accept for plain object iteratees, not the union type.

**Future fix:** Upgrade `ioredis` to latest and update cluster client code to handle both `NatMap` forms, or replace `_.findKey` with an explicit predicate function.

---

## 4. `@types/lodash` upgraded to `4.14.202`

**File:** `redisinsight/api/package.json` → `devDependencies`  
**Changed from:** `4.14.167` → `4.14.202`

**Why:** `@types/lodash@4.14.167` typed `_.concat` as `concat<T>(array: Many<T>, ...values: Array<Many<T>>)` — a fixed first positional arg. TypeScript 4.2+ refuses to spread a runtime array into such a signature (TS2556). `4.14.202` changed the signature to accept pure rest parameters, which allows `concat(...await Promise.all(...))` in `slow-log.service.ts`.

**Future fix:** None needed — this is a forward-compatible type improvement. Consider upgrading to `@types/lodash-es` if the codebase migrates to ES modules.

---

## 5. `ssh2` and `tunnel-ssh` excluded from Vite pre-bundling

**File:** `redisinsight/ui/vite.config.mjs` → `optimizeDeps.exclude`

**Why:** These are API-only packages (used by `redisinsight/api`) that include a native `.node` binary (`sshcrypto.node`). esbuild (used by Vite for pre-bundling) cannot process native Node.js addons, so including them causes the `postinstall` `vite optimize` step to fail with an error.

**Why yarn didn't have this problem:** Yarn's hoisting algorithm kept `ssh2` and `tunnel-ssh` inside `redisinsight/api/node_modules/` (i.e., it did not hoist them to the root `node_modules/`). Because of this, the root-level `vite optimize` step never encountered them. npm's hoisting is more aggressive by default — it promoted both packages to the root `node_modules/`, making them visible to the Vite pre-bundler and triggering the native-module error.

**Future fix:** None needed — these packages should always be excluded from browser bundling. This is a correct and permanent configuration fix, not a workaround.
