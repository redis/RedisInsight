# Yarn → npm Migration: Execution Plan

This is the replication plan for migrating RedisInsight from Yarn to npm on the latest
`main`. It is derived from the prototype on `feature/migrate-to-npm` (5 commits off
merge-base `0e49d734`), which proved out the dependency/config plumbing but left CI,
Docker, and some test packages on yarn.

**Recommended approach:** do **not** rebase the old branch. `main` has moved (new deps,
`.tscheck.rec.json` baselines, etc.). Replay this recipe fresh on a new branch so the
lockfiles and version pins reflect current `main`.

---

## Lockfile inventory (directories to convert)

This repo does **not** use npm workspaces — each package is installed independently
(`--prefix`/`--cwd`), so every directory below needs its own `package-lock.json` and `.npmrc`.
Verified against current `main`; the prototype's "5 dirs incl. `tests/e2e` + `tests/playwright`"
assumption is **stale**.

**10 `yarn.lock` files to convert:**
- `.` (root)
- `redisinsight/`
- `redisinsight/api/`
- `redisinsight/ui/src/packages/` — Workbench plugin aggregate
- `redisinsight/ui/src/packages/clients-list/`
- `redisinsight/ui/src/packages/geodata/`
- `redisinsight/ui/src/packages/redisearch/`
- `redisinsight/ui/src/packages/redisgraph/`
- `redisinsight/ui/src/packages/redistimeseries-app/`
- `redisinsight/ui/src/packages/ri-explain/`

**Already on npm (leave / just verify):**
- `tests/e2e-playwright/` — has `package-lock.json`
- `redisinsight/ui/src/packages/redisinsight-plugin-sdk/` — has `package-lock.json`

**No longer applicable:** the prototype targeted `tests/e2e/` and `tests/playwright/`.
`tests/playwright/` is gone on current `main`, and `tests/e2e/` has no `package.json`
(RTE/fixtures only) — neither is an npm package now.

✅ **Resolved — plugins ARE in scope.** `scripts/build-statics.sh` installs each of the 7 plugin
dirs (`yarn --cwd <plugin>`) and then builds them (`yarn --cwd "${PACKAGES_DIR}" build`), and
that runs during `build:statics` (packaging). So their `yarn.lock`s need the same
seed+reconcile+finalize treatment, `build-statics.sh` needs the `yarn --cwd` → `npm …`
rewrite, and their `file:` deps (`vite: file:../node_modules/vite`,
`redisinsight-plugin-sdk: file:../…`) must be handled. They lack `node_modules`, so `synp`
can't seed them — install first (or fresh-reconcile + verify, as done for `redisinsight/`).
Batch this with Phase 3 (build scripts), since only packaging exercises it.

---

## Migration rules (non-negotiable)

> These rules are the complete ruleset for the migration. They previously lived in
> `.ai/rules/npm-migration.md` and have been folded into this document so the whole plan
> travels as a single file across branches. When on the new branch, load this file into
> memory to make the rules active.

### Goal

Migrate the project from Yarn to npm **without changing any behaviour**. The npm install
must produce a dependency tree functionally equivalent to what the Yarn lockfile had — same
package versions, same resolution order, same build output.

### Core principle

> **Do not introduce new package versions.** Upgrading or downgrading a dependency to work
> around an npm resolution issue is acceptable only as a last resort, and must be documented
> in [docs/npm-migration-decisions.md](npm-migration-decisions.md).

### Building the lockfile — seed from `yarn.lock`, do not resolve fresh

**The `yarn.lock` is the source of truth for the entire dependency tree, not just the deps
that break the build.** Yarn already resolved every direct and transitive package to an exact
version — and some of those versions are pinned deliberately (security patches,
`patch-package` targets, `overrides`/`resolutions`, native-module compatibility). A clean
`npm install` re-resolves every `^`/`~` range independently and will silently pick newer
versions yarn never used. That is behaviour drift: it usually does **not** surface as a
compile error, but it can change runtime behaviour, break `patch-package` patches (which
target exact versions/paths), or shift a native binary.

Therefore, do **not** generate `package-lock.json` from a fresh `npm install`. Generate it
from `yarn.lock` and then reconcile:

1. **Seed** — before deleting `yarn.lock`, convert it to a `package-lock.json` that preserves
   yarn's exact resolved versions. Do this per package directory (see *Lockfile inventory*
   above), since this repo does not use npm workspaces. `npx synp --source-file yarn.lock` is
   the standard converter.
2. **Reconcile** — run `npm install --package-lock-only --ignore-scripts --legacy-peer-deps`
   to upgrade the seed to `lockfileVersion: 3` and fill integrity/metadata without reinstalling.
   `--ignore-scripts` is mandatory: without it npm runs the (still yarn-era) `postinstall` —
   `patch-package && vite optimize && … yarn-deduplicate` — which errors out. `synp` does **not**
   translate `npm:` aliases at all (trial-confirmed: `sass: npm:sass-embedded` vanished from the
   seed), and also mishandles `file:` deps (the `cpu-features` stub), git deps, and `overrides` —
   fix all of these by hand against `yarn.lock` (see step 1 in Phase 1b below).
3. **Diff every version** — compare the resolved tree against `yarn.lock`, not just the
   packages that fail to build. For any package where npm drifted from yarn's version, force
   yarn's version with an exact pin or `override`. Only accept npm's choice when it stays
   within yarn's semver range **and** you have confirmed nothing depends on the exact version
   (no patch, no override, no known reason).
4. **Verify** — spot-check critical and known-pinned deps:
   `node -e "console.log(require('./node_modules/<pkg>/package.json').version)"`. Confirm all
   `patch-package` patches still apply.
5. **Document** — any version that ends up differing from what `yarn.lock` had (in either
   direction) gets an entry in `docs/npm-migration-decisions.md`.

Prioritize full fidelity for: all direct dependencies, anything already pinned exact, every
`override`/`resolution`, every `patch-package` target, and native modules. The long tail of
pure-transitive deps may keep npm's resolution **only** where it stays inside yarn's range and
passes the verification gate.

### What you must NOT do

- ❌ Modify production source code (TypeScript, React, NestJS, SCSS, etc.) to satisfy type
  errors or warnings caused by a floated dependency version.
- ❌ Introduce a newer version of a package without confirming it was not present in the Yarn
  lockfile.
- ❌ Silence deprecation warnings in build config (e.g. `silenceDeprecations` in
  `vite.config.mjs`) — pin the package version instead.
- ❌ Change any logic, API signatures, or runtime behaviour.

### What you should do

- ✅ Seed `package-lock.json` from `yarn.lock` (see *Building the lockfile* above) instead of
  a fresh `npm install`.
- ✅ Use npm `overrides` in `package.json` to force a specific transitive dependency version.
- ✅ Pin direct dependencies to an **exact version** (no `^` or `~`) when npm floats to a
  newer version that breaks the build.
- ✅ Use `--package-lock-only` to regenerate the lockfile when the version in `package.json`
  is not picked up by a normal `npm install`.
- ✅ Add entries to `docs/npm-migration-decisions.md` for every version pin or override that
  deviates from the original semver range.
- ✅ Solve hoisting differences (packages unexpectedly appearing at root `node_modules`)
  through `optimizeDeps.exclude` or similar config — these are build tool settings, not code.

### Diagnosing a version float

When npm resolves a package to a version that differs from what Yarn had:

1. Check `docs/npm-migration-decisions.md` — the issue may already be documented.
2. Find the exact version Yarn used by checking git history of `yarn.lock`
   (`git log -p yarn.lock | grep <package>`).
3. Pin to that exact version using an override or direct dependency pin.
4. Verify with `node -e "console.log(require('./node_modules/<pkg>/package.json').version)"`.

### `.npmrc` configuration

Each package directory gets an `.npmrc` with:

```
legacy-peer-deps=true
```

This is required because `@elastic/eui@34.6.0` declares legacy peer dependencies (e.g.
`@types/react@^16`) that conflict with React 18. Do not remove this setting. It is a known
issue being resolved as the project migrates away from `@elastic/eui` to `@redis-ui/components`.

### Verification gate (must pass before merge)

`yarn type-check` (against baselines), `yarn lint`, `yarn test`, `yarn test:api`, plus a clean
`build:prod` / `package` and a green CI run. (Command names stay the same — only the
underlying package manager changes.)

---

## Scope reference: what the prototype changed

| # | Change | Files |
|---|---|---|
| 1 | `resolutions` → `overrides` (glob `**/pkg` → nested-object syntax) | every `package.json` (see *Lockfile inventory*) |
| 2 | `yarn --cwd X cmd` → `npm run cmd --prefix X` (+ `--` arg passing) | root/api/desktop/tests scripts |
| 3 | Delete `yarn.lock`, generate `package-lock.json` | prototype: root + `redisinsight/api` only — current scope is all inventory dirs |
| 4 | Add `.npmrc` (`legacy-peer-deps=true`); un-ignore `.npmrc`; delete `.yarnrc` | each inventory dir, `.gitignore` |
| 5 | Simplify `postinstall` (drop `skip-postinstall`/`yarn-deduplicate`); remove `yarn-deduplicate`, `skip-postinstall`, `postinstall-postinstall` devDeps | root `package.json` |
| 6 | Pin versions to match yarn's resolution | see decisions doc |
| 7 | `optimizeDeps.exclude` += `ssh2`, `tunnel-ssh` | `redisinsight/ui/vite.config.mjs` |
| 8 | `engines`: drop `yarn`, set `npm >=8.3.0` | root `package.json` |

### Known version pins (re-derive from current `main`'s `yarn.lock`)

Values below are from the prototype — **confirm each against current `main` before using**.

| Package | Location | Pin | Reason |
|---|---|---|---|
| `sass` (alias) | root devDeps | `npm:sass-embedded@1.75.0` | match yarn's resolved version; alias only, **no** standalone `sass-embedded` (see Phase 1a protocol-deps note). Prototype used `1.77.5` + a direct `sass-embedded`; on current `main` yarn resolves **1.75.0**, so re-derive and pin just the alias |
| `@types/express-serve-static-core` | api `overrides` | `5.0.6` | `5.1.1` broke `ParamsDictionary` type in middleware |
| `ioredis` | api deps | `5.2.2` (exact) | `5.3.0+` changed `NatMap` to a union type, breaking cluster client |
| `@types/lodash` | api devDeps | `4.14.202` | fixes TS2556 spread error in `slow-log.service.ts` |
| `@redis-ui/table`, `monaco-yaml`, `react-vtree`, `quicktype-core`, `tunnel-ssh`, `@types/express` | various | exact | float-to-latest broke build |

---

## Gaps in the prototype (must be completed here)

The prototype is a **partial** migration. These were not done and are the largest untested surface:

- `.github/workflows/*` + `.github/actions/install-deps` — still `yarn install --frozen-lockfile`.
- `Dockerfile` — still yarn; uses `.yarnclean.prod` + `yarn autoclean`.
- `.github/build/*.sh`, `scripts/build-statics.{sh,cmd}` — still call `yarn`.
- **The 7 `redisinsight/ui/src/packages/*` plugin `yarn.lock` files were never touched** — the
  prototype migrated neither them nor their aggregate (`ui/src/packages/yarn.lock`). See the
  *Lockfile inventory* and its open question on install scope.
- `redisinsight/` (desktop workspace) — prototype deleted its `yarn.lock` but generated **no
  `package-lock.json`**.
- postinstall skip: `skip-postinstall` removed; CI must use `--ignore-scripts` /
  `npm_config_ignore_scripts` to skip the `vite optimize` step it previously skipped via `SKIP_POSTINSTALL`.
- Docs: root `CLAUDE.md` and skills still reference `yarn` / `yarn-deduplicate`.

---

## Phased execution

### Phase 0 — Prep
- [x] Create the migration branch off latest `main`.
- [ ] Treat the current `yarn.lock` files as the source-of-truth reference for the version diff
      in Phase 1 — no separate manual version capture is needed. `synp` preserves yarn's full
      resolved tree, and the original `yarn.lock` stays in git history for comparison.

### Phase 1 — Generate lockfiles from `yarn.lock` (the core step)

Produce `package-lock.json` files that reproduce yarn's exact tree. This is the heart of the
migration; it has a prerequisite that **must** be completed first.

**1a — Prerequisite: make `package.json` npm-native.** npm ignores yarn's `resolutions` field,
so if the reconcile step (1b) runs against an unconverted `package.json`, every version yarn was
force-pinning via `resolutions` drifts silently. Convert *before* seeding:
- [ ] Convert `resolutions` → `overrides` in every `package.json` with a `resolutions` block
      (glob → nested syntax).
- [ ] **Resolve `EOVERRIDE` direct-dependency conflicts.** npm rejects a top-level override on a
      package you *directly* depend on unless the override and the dependency share the **exact
      same spec** (yarn had no such rule). This is common, not an edge case — root hit 4
      (`semver`, `styled-components`, `@types/react`, `@types/react-dom`). Scan up front by
      intersecting override keys with `dependencies` + `devDependencies`, then fix each by
      checking what `yarn.lock` actually resolved:
    - **Redundant with the direct range** → drop the override (e.g. `styled-components` override
      `^5` vs direct `^5.0.0` — both resolve `5.3.11`).
    - **Override force-pinned a single version** → pin the direct dep to that exact version *and*
      keep the matching override (e.g. direct `@types/react` `^18.0.20` → `18.2.1` so the
      `18.2.1` override is accepted and still forces transitives).
    - ⚠️ **Never assume a `**/pkg` override was just a floor.** yarn's `**/` collapses *every*
      instance — including major-mismatched transitives — onto one version. Dropping the `semver`
      override (looked like a `^7.5.2` floor) drifted yarn's single `7.7.2` into **five** versions
      (`5.7.2/6.3.1/7.6.3/7.7.2/7.7.4`). Reproduce it as an exact pin (`semver: 7.7.2`) with the
      direct dep pinned to match. Document each in `docs/npm-migration-decisions.md`.
- [ ] Apply the known exact pins / overrides — **re-confirmed against the current `yarn.lock`**,
      not copied from the prototype (see *Known version pins* above).
- [ ] Handle the **protocol-based deps** below — these are the *only* declarations `synp` cannot
      auto-convert, so they need manual attention. Once the `npm:` aliases are pinned, the
      removed-dependency check (Phase 1b) should show **zero genuine removals**.

  | Dependency | Where | Type | Action |
  |---|---|---|---|
  | `sass` → `npm:sass-embedded` | root `devDependencies` | `npm:` alias | Pin exact to yarn's version only: `"sass": "npm:sass-embedded@1.75.0"`. Without a version, reconcile floats it to latest (trial: `1.75.0`→`1.100.0`, which also drops its transitive `buffer-builder`). `synp` drops the alias, so it must be declared before reconcile re-materializes it. **Do NOT also add a standalone `"sass-embedded"` dependency** (the prototype did): yarn only had the `sass` alias, so Vite uses the legacy Sass API; adding `sass-embedded` directly flips Vite to the modern compile API — a behaviour change. At `1.75.0` there are no deprecation warnings anyway. |
  | `cpu-features` → `file:./…/stubs/cpu-features` | `redisinsight/` + `redisinsight/api/` `resolutions` | `file:` stub | Carry over as an `overrides` entry (local stub avoids compiling the native module); verify npm resolves the relative path. |
  | `vite` → `file:../node_modules/vite` (6 pkgs) · `redisinsight-plugin-sdk` → `file:../…` | `ui/src/packages/*` plugins | `file:` | Only if the plugins are in install scope — see the *Lockfile inventory* open question. |

- [ ] Rewrite `yarn --cwd`/`yarn <script>` → `npm run … --prefix …` with `--` arg passing
      (root, `redisinsight/api`, `redisinsight/desktop`, `tests/*`).
- [ ] Update `engines`; remove `yarn-deduplicate`, `skip-postinstall`,
      `postinstall-postinstall`; simplify root `postinstall`.
- [ ] Add `.npmrc` (`legacy-peer-deps=true`) to each dir in the *Lockfile inventory*; edit
      `.gitignore` (un-ignore `.npmrc`); delete `.yarnrc`.

**1b — Seed and reconcile.** For each dir in the *Lockfile inventory*:
- [ ] Seed: `npx synp --source-file yarn.lock` (produces a `lockfileVersion: 1` file).
      ⚠️ **synp requires an existing `node_modules` in the dir** (it reads installed
      integrity/metadata). Dirs without one (`redisinsight/`, `redisinsight/desktop/`, the
      `ui/src/packages/*` plugins) can't be seeded directly — either `yarn install` there first
      to populate `node_modules` from `yarn.lock`, or skip the seed and rely on the reconcile +
      verify. For tiny trees the reconcile alone reproduced yarn exactly (verified: zero new
      versions), but for large trees seed first or you risk fresh-resolve drift.
- [ ] Hand-fix what `synp` cannot translate, checked against `yarn.lock`: `npm:` aliases
      (**dropped entirely** — e.g. `sass`), `file:` stub deps (`cpu-features`), git deps, and
      `overrides` blocks.
- [ ] Reconcile: `npm install --package-lock-only --ignore-scripts --legacy-peer-deps`
      (upgrades to `lockfileVersion: 3`). `--ignore-scripts` is **mandatory** — otherwise npm
      runs the yarn-era `postinstall` (`yarn-deduplicate`, etc.) and fails. Note: the conversion
      can rewrite `yarn.lock` in place, so treat it as read-only and restore it if touched until
      the deliberate delete in 1c.
- [ ] **The real fidelity gate is "no NEW versions", not "zero drift".** npm deduplicates far
      more aggressively than yarn, so a raw version diff over-reports massively — most "drift" is
      npm collapsing duplicate versions yarn kept (npm's version set is a **subset** of yarn's,
      all within range). That is compliant with "no new versions" and is behaviour-preserving.
      Example: api showed 22 "drifts", every one npm dropping a redundant duplicate (e.g.
      `@babel/compat-data` yarn `[7.23.3,7.25.8,7.29.0]` → npm `[7.29.0]`). The gate that actually
      matters: compute **`npm.nv − yarn.nv`** (every `name@version` npm resolved that `yarn.lock`
      never had), excluding platform binaries. **Zero added = faithful.** All three core dirs
      passed with zero added. Force yarn's version only where a genuinely new version appears.
- [ ] **Removed-dependency check** (`scripts/lock-diff.js`) — verify no package present in
      `yarn.lock` is entirely absent from `package-lock.json`. **Known false-positives to filter/
      confirm rather than chase:** (a) platform/arch native binaries for *other* OSes
      (`@esbuild/*`, `@rollup/rollup-*`, `@swc/core-*`, `@sentry/cli-*`, `@msgpackr-extract/*`,
      `-(darwin|linux|win32|…)`/`-(gnu|musl|msvc)`); (b) `npm:` aliases — they're keyed by the
      *alias* name in yarn (`sass`, `string-width-cjs`) but the *target* name in npm
      (`sass-embedded`, `string-width`), so confirm each is present under its target name;
      (c) the `cpu-features` `file:` stub, which shows as both "removed" (`cpu-features`) and
      "added" (`stubs/cpu-features`) for the same reason. Genuine removals should be **zero** once
      aliases are pinned (plus any yarn-only devDeps you intentionally deleted).
- [ ] **Finalise with a real `npm install`, then validate with `npm ci --dry-run`.**
      `--package-lock-only` produces a lockfile **missing the cross-platform optional native
      binaries** (`@esbuild/*`, `@rollup/*`, `@swc/*`, `@sentry/cli-*`, `@msgpackr-extract/*`)
      for non-host OSes — `npm ci` then rejects it (`EUSAGE`, "Missing … from lock file"), and
      **CI uses `npm ci`, so this fails the pipeline**. A real `npm install` records every
      platform variant (with `os`/`cpu`), matching yarn's set. It may also dedupe a few more
      transitives than `--package-lock-only` did (fine — still a subset). Confirm the result
      with `npm ci --dry-run` in each dir before committing the lockfile.
- [ ] Verify `patch-package` patches still apply and spot-check pinned deps.

**1c — Finalize.**
- [ ] Delete each converted `yarn.lock` (keep recoverable from git history until the first green
      CI run).
- [ ] **Close the prototype gaps:** ensure `redisinsight/package-lock.json` exists (prototype
      deleted its `yarn.lock` without generating one), and that the 7 `ui/src/packages/*` plugin
      lockfiles are converted if in scope. Leave the already-npm `tests/e2e-playwright/` and
      `ui/src/packages/redisinsight-plugin-sdk/` untouched.

### Phase 2 — Iterative pin-to-match (risk area)
- [ ] For each *remaining* build/type/lint failure (i.e. drift 1b didn't already catch):
      diagnose the float, pin to yarn's version, add a `docs/npm-migration-decisions.md` entry.
- [ ] Re-add `optimizeDeps.exclude` for `ssh2`/`tunnel-ssh` (verify npm still hoists them).
- [ ] Gate: `yarn type-check`, `yarn lint`, `yarn test`, `yarn test:api` all pass; app runs.

### Phase 3 — CI / Docker / scripts (prototype skipped this)
- [ ] `.github/actions/install-deps` + all workflows → `npm ci`; cache `~/.npm` keyed on
      `package-lock.json`.
- [ ] Replace the `SKIP_POSTINSTALL` skip with `--ignore-scripts` / `npm_config_ignore_scripts`.
- [ ] `Dockerfile` → `npm ci` (and `npm ci --omit=dev` for the prod stage); drop
      `.yarnclean`/`autoclean`.
- [ ] Convert `.github/build/build.sh`, `build_modules.sh`, `scripts/build-statics.{sh,cmd}`,
      `.github/e2e/*.sh`.
- [ ] Update `licenses-check.yml`, `lint.yml`.

### Phase 4 — Docs + rules
- [ ] Carry over `docs/npm-migration-decisions.md` (refresh versions). The migration rules now
      live in this document (see *Migration rules* above) — no separate rules file to maintain.
- [ ] Update root `CLAUDE.md` and any skill referencing `yarn` / `yarn-deduplicate` /
      the dedup postinstall.

### Phase 5 — Verify end-to-end
- [ ] Fresh clone → `npm install` in every package → `dev:desktop` runs.
- [ ] `build:prod`, `package`, `yarn test`, `yarn test:api`, e2e suites all pass.
- [ ] Green CI run on the branch before merge.

---

## Rollback

Each phase is an independent commit. Phases 1–2 (deps) and Phase 3 (CI/Docker) are separable;
if CI conversion regresses, the dependency migration can still land while yarn-based CI is
temporarily retained behind the new lockfiles. Keep the deleted `yarn.lock` files recoverable
from git history until the first green CI run.
