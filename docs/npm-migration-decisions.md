# Yarn → npm Migration: Pinned Dependency Decisions

These decisions reproduce yarn's exact dependency tree under npm **without changing behaviour**.
Each entry documents where npm's resolution (or override rules) diverged from what `yarn.lock`
had, and how it was reconciled. They are candidates for follow-up work (version upgrades or code
migrations).

---

## `resolved` URLs point at `registry.yarnpkg.com`

Because the lockfiles were **seeded from `yarn.lock`** (to reproduce yarn's exact tree), most
`resolved` URLs in `package-lock.json` / `redisinsight/api/package-lock.json` point at
`registry.yarnpkg.com` rather than `registry.npmjs.org`. This is a harmless seeding artifact,
not a functional issue:

- `registry.yarnpkg.com` is a proxy of `registry.npmjs.org` (same tarball paths, same content),
  so `npm ci` fetches and integrity-verifies them normally.
- A plain `npm install` does **not** rewrite existing `resolved` URLs, so this doesn't
  self-correct — and it shouldn't be forced: the only npm-native way to get uniform
  `registry.npmjs.org` URLs is a full lockfile regenerate, which fresh-resolves every range and
  would reintroduce the version drift the seed-from-`yarn.lock` approach exists to prevent.
- Do **not** hand-edit the lockfiles to swap the host. They migrate to `registry.npmjs.org`
  naturally over time as packages are added/updated (npm writes that host for fresh fetches).

---

## Root `package.json`

### 1. `semver` pinned to exact `7.7.2` (override + direct dependency)

**Was:** `resolutions: { "**/semver": "^7.5.2" }` + direct dependency `"semver": "^7.7.2"`.

**Why changed:** yarn's `**/semver` resolution force-collapsed **every** semver in the tree —
including transitive `5.x`/`6.x` consumers — to a single version, and `yarn.lock` resolved that
to `7.7.2` everywhere. npm's `overrides` differ in two ways:
- Dropping the override lets npm resolve semver naturally, which produced **5 different versions**
  (`5.7.2, 6.3.1, 7.6.3, 7.7.2, 7.7.4`) instead of yarn's single `7.7.2` — silent drift.
- An override on a package you *directly* depend on is rejected (`EOVERRIDE`) unless the override
  and the direct dependency share the exact same spec.

**Resolution:** set `overrides.semver = "7.7.2"` (exact, matching yarn's resolved version) **and**
pin the direct dependency to `"semver": "7.7.2"` so the specs match and npm forces all semver to
`7.7.2`, reproducing yarn's tree exactly.

**Future fix:** move semver consumers onto compatible ranges and relax back to a floor
(`^7.x`) once nothing needs the forced collapse.

### 2. `styled-components` override removed

**Was:** `resolutions: { "styled-components": "^5" }` + direct dependency `"styled-components": "^5.0.0"`.

**Why changed:** the resolution existed to keep styled-components on v5. The direct dependency
`^5.0.0` already caps at `<6`, and both specs resolve to the same `5.3.11` — so the override was
redundant and only triggered an `EOVERRIDE` conflict. Removing it produces no drift (`5.3.11`
either way).

**Future fix:** none — the direct dependency range is sufficient.

### 3. `@types/react` and `@types/react-dom` direct devDeps pinned to `18.2.1`

**Was:** `resolutions: { "@types/react": "18.2.1", "@types/react-dom": "18.2.1" }` + direct
devDependencies `"@types/react": "^18.0.20"`, `"@types/react-dom": "^18.0.5"`.

**Why changed:** yarn's resolution pinned both to `18.2.1` across the tree. Under npm the override
conflicts (`EOVERRIDE`) with the looser direct devDependency range. Pinning the direct devDeps to
exact `18.2.1` makes the specs match, so npm keeps the `18.2.1` override (which still forces
transitive `@types/react*` to `18.2.1`, as yarn did).

**Future fix:** align React and its types on a single up-to-date version, then relax the pins.
