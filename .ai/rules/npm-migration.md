# Yarn → npm Migration Rules

## Goal

Migrate the project from Yarn to npm **without changing any behaviour**. The npm install must produce a dependency tree that is functionally equivalent to what the Yarn lockfile had — same package versions, same resolution order, same build output.

## Core Principle

> **Do not introduce new package versions.** Upgrading or downgrading a dependency to work around an npm resolution issue is acceptable only as a last resort, and must be documented in `docs/npm-migration-decisions.md`.

---

## What You Must NOT Do

- ❌ Modify production source code (TypeScript, React, NestJS, SCSS, etc.) to satisfy type errors or warnings caused by a floated dependency version
- ❌ Introduce a newer version of a package without confirming it was not present in the Yarn lockfile
- ❌ Silence deprecation warnings in build config (e.g. `silenceDeprecations` in `vite.config.mjs`) — pin the package version instead
- ❌ Change any logic, API signatures, or runtime behaviour

## What You Should Do

- ✅ Use `npm overrides` in `package.json` to force a specific transitive dependency version
- ✅ Pin direct dependencies to an **exact version** (no `^` or `~`) when npm floats to a newer version that breaks the build
- ✅ Use `--package-lock-only` to regenerate the lock file when the version in `package.json` is not picked up by a normal `npm install`
- ✅ Add entries to `docs/npm-migration-decisions.md` for every version pin or override that deviates from the original semver range
- ✅ Solve hoisting differences (packages unexpectedly appearing at root `node_modules`) through `optimizeDeps.exclude` or similar config — these are build tool settings, not code

---

## Diagnosing a Version Float

When npm resolves a package to a version that differs from what Yarn had:

1. Check `docs/npm-migration-decisions.md` — the issue may already be documented
2. Find the exact version Yarn used by checking git history of `yarn.lock` (`git log -p yarn.lock | grep <package>`)
3. Pin to that exact version using an override or direct dependency pin
4. Verify with `node -e "console.log(require('./node_modules/<pkg>/package.json').version)"`

---

## Known Resolved Issues

All resolved issues are documented with rationale and future fix guidance in:

**`docs/npm-migration-decisions.md`**

Current entries:
1. `sass-embedded` pinned to `1.77.5` — avoids `@import`, `mixed-decls`, and `legacy-js-api` deprecation warnings introduced in newer versions; also installs `sass-embedded` directly so Vite 5.4+ uses the modern compile API
2. `@types/express-serve-static-core` overridden to `5.0.6` — `5.1.1` broke `ParamsDictionary` type in API middleware
3. `ioredis` pinned to `5.2.2` — `5.3.0+` changed `NatMap` to a union type, breaking cluster client code
4. `@types/lodash` upgraded to `4.14.202` — fixes TS2556 spread error in `slow-log.service.ts`
5. `ssh2` and `tunnel-ssh` excluded from Vite pre-bundling — yarn kept them in `redisinsight/api/node_modules`; npm hoists them to root, exposing native binaries to esbuild

---

## `.npmrc` Configuration

The project uses `.npmrc` at the repo root with:

```
legacy-peer-deps=true
```

This is required because `@elastic/eui@34.6.0` declares legacy peer dependencies (e.g. `@types/react@^16`) that conflict with React 18. Do not remove this setting.
