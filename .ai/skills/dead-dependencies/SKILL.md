---
name: dead-dependencies
description: >-
  Find and safely remove unused ("dead") npm dependencies in RedisInsight
  using a grep + leaf-check + build-gate recipe. Use when cleaning up
  dependencies, investigating whether a package is still used, removing a
  suspected leftover, or when the user mentions dead deps, unused
  dependencies, dependency cleanup, leftover packages, or "is this safe to
  remove". Complements the weekly vulnerability audit
  (`scripts/dependency-audit-report.mjs`), which only reports vulnerabilities.
---

# Dead Dependencies

Identify and safely remove unused npm dependencies. This is a **local,
interactive** workflow — a scheduled report can only ever guess; confirming a
dependency is dead requires grepping real usage and running the build.

## Why manual (not knip/depcheck)

Static tools over-report badly in this repo and must not be trusted blindly:

- The root `package.json` is a **mega-manifest** (UI + desktop + build + test
  + storybook + electron), so a tool scanning one area flags everything used
  elsewhere as "unused".
- Lots of dependencies are referenced **without an `import`**: webpack loaders
  and eslint/jest/babel plugins by string in config, tools invoked from
  `package.json` `scripts`, runtime `-r` preloads, dynamic `require`, and
  ambient `@types/*`.
- The webpack→Vite migration left **genuinely dead** build tooling behind,
  mixed in with false positives.

The reliable signal is: **grep for usage → confirm it's a leaf → remove it and
run the build gate.** That is exactly how `jsonpath` was confirmed dead and
removed (worked example at the bottom).

## The recipe (per candidate)

### 1. Grep the whole repo for real usage

```bash
PKG=jsonpath   # the dependency to check
grep -rn "$PKG" \
  redisinsight configs scripts .storybook \
  --include=*.ts --include=*.tsx --include=*.js --include=*.jsx \
  --include=*.mjs --include=*.cjs --include=*.json \
  2>/dev/null | grep -v node_modules
```

Look for `import ... from '$PKG'`, `require('$PKG')`, `import('$PKG')`, and
bare references. Ignore unrelated substring hits (e.g. `nestjs-form-data` when
checking `form-data`, or a package name appearing only in tutorial/`manifest`
text). **Zero real references → candidate for the next steps.**

### 2. Rule out no-import usage

A clean grep is **necessary but not sufficient**. Check the ways a package is
used without an `import`:

- **Config string references** — search the build/test config for the bare
  name: `.eslintrc.js`, `configs/webpack.config.*.ts`,
  `redisinsight/ui/vite.config.mjs`, `jest.config.cjs`, `babel.config.cjs`,
  `electron-builder.json`, `.mocharc*`. eslint plugins, webpack loaders, and
  jest/mocha reporters live here.
- **`package.json` scripts** — a tool like `concurrently`, `lint-staged`, or a
  reporter is "used" if a `scripts` entry (any workspace) invokes it.
- **Runtime preloads / dynamic** — `node -r <pkg>`, `require(variable)`, or a
  wasm/worker loader with a computed path.

### 3. Leaf check

```bash
npm ls "$PKG"        # in the workspace that declares it
```

Confirm nothing else in the tree depends on it, and note any transitive deps it
uniquely pulls (removing `jsonpath` also dropped `underscore`).

### 4. Classify before acting

| Situation | Action |
| --- | --- |
| Plain runtime/dev dep, zero references anywhere | **Delete** (after the gate below) |
| `@types/x` where base `x` bundles its own types (`node_modules/x/package.json` has `types`/`typings`) | **Delete** — the DefinitelyTyped package is obsolete |
| `@types/x` that's ambient/global-only (e.g. `@types/webpack-env`) | **Keep** — never imported by design |
| Declared in more than one workspace (`package.json`), used in only one | **Relocate/dedupe** — remove the *unused* declaration, never the used copy |
| Shadows a Node builtin (`buffer`, `assert`, …) | **Keep** — usually a false positive |
| Referenced only in a config/`scripts` (step 2 hit) | **Keep** |

### 5. The gate — the only real proof

Remove it, reinstall (per the repo's dependency rules — never hand-edit
`package.json`/lockfile, never `--ignore-scripts`), and verify the affected
area builds:

```bash
npm uninstall "$PKG"          # in the declaring workspace; updates the lockfile
npm run type-check            # or the affected workspace's type-check
npm run test                  # / test:api, as relevant
npm run build                 # if it's a build-time dep
```

Green across the relevant checks = safe. Commit the `package.json` +
`package-lock.json` change (see the git-safety / dependency rules in
`CLAUDE.md`). If anything goes red, it wasn't dead — restore it.

## Optional: enumerate candidates to sweep

To triage the whole surface rather than one package, list declared deps and
grep each for an import, then apply steps 2–5 to the ones with zero hits:

```bash
node -e "const p=require('./package.json');console.log([...Object.keys(p.dependencies||{}),...Object.keys(p.devDependencies||{})].join('\n'))" \
| while read PKG; do
    hits=$(grep -rl --include=*.ts --include=*.tsx --include=*.js --include=*.jsx --include=*.mjs \
      -e "from ['\"]$PKG" -e "require(['\"]$PKG" redisinsight configs scripts 2>/dev/null | grep -vc node_modules)
    [ "$hits" = "0" ] && echo "candidate: $PKG"
  done
```

This is a **first filter only** — every candidate still goes through steps 2–5.
Expect false positives (config/string/dynamic/ambient use). Never delete straight
from this list.

## Worked example — `jsonpath`

1. Grep across the repo → the only hits were unrelated tutorial text in a
   `manifest.json`; **no `import`/`require`**.
2. Not referenced in any config or script.
3. `npm ls jsonpath` → a leaf; it was also the sole reason `underscore` was
   installed.
4. Plain runtime dep, zero references → likely deletable.
5. Removed `jsonpath` + `@types/jsonpath`, `npm install`, `npm run type-check`
   → green. Confirmed dead; committed. (`underscore` dropped with it.)
