# Sentry Production Readiness (RI-8113)

Production-readiness design for Sentry error tracking in the RedisInsight Electron app,
based on the PoC. This document is intended to be reviewable by **Legal/DPO** and
**Security** in one place, and to drive the implementation tracked in RI-8113.

## References

- Ticket: [RI-8113 — Implement Sentry Error Tracking for Electron App](https://redislabs.atlassian.net/browse/RI-8113)
- Spike: [RI-7977](https://redislabs.atlassian.net/browse/RI-7977)
- PoC summary: [Confluence — Sentry Integration PoC](https://redislabs.atlassian.net/wiki/spaces/DX/pages/5999788044/Sentry+Integration+PoC+-+Summary)
- PoC branch: [feature/RI-7977/integrate-sentry](https://github.com/redis/RedisInsight/compare/feature/RI-7977/integrate-sentry)

---

## 1. Current PoC state (as implemented)

Two Sentry layers, both gated **only** on the `RI_SENTRY_ENABLED` env flag + a DSN — neither
checks user consent:

| Layer | Init | DSN env var | Consent check? | Scrubbing? |
|---|---|---|---|---|
| Electron main | `redisinsight/desktop/src/lib/sentry/sentry.ts` (`initSentry`) | `RI_SENTRY_DSN` | ❌ none | partial — `event.extra` + `event.contexts` only |
| UI renderer | `redisinsight/ui/src/services/sentryElectron.ts` (`initSentry`) | `RI_SENTRY_DSN` | ❌ none | ❌ **none** (no `beforeSend`) |

Native crash reporting (`crashReporter`, minidumps) is started **unconditionally** with
`uploadToServer: true` in `initCrashReporter` (`sentry.ts`).

Test triggers present (must be removed before prod — see §7):
- `triggerTestCrash` / `triggerNativeCrash` + global shortcuts `Cmd/Ctrl+Shift+K` / `Cmd/Ctrl+Shift+C` (`desktop/app.ts`)
- Help menu `Crash Handler` / `Crash React` buttons (`ui/src/components/navigation-menu/components/help-menu/HelpMenu.tsx`)

### The existing consent precedent (`nonTracking`)

RedisInsight already sends a small set of events **regardless of consent**, anonymously —
`APPLICATION_STARTED` / `APPLICATION_FIRST_START` with `nonTracking: true`
(`api/src/modules/analytics/analytics.service.ts`). The mechanism:

- Consent flag: `user.settings.config.agreements.analytics` (default **false**), read in the UI via
  `checkIsAnalyticsGranted()` (`ui/src/telemetry/checkAnalytics.ts`) and in the API via the agreements repository.
- When consent is off but `nonTracking` is true, the event is sent under a **fixed shared
  anonymous id** `NON_TRACKING_ANONYMOUS_ID = '00000000-0000-0000-0000-000000000001'` — no
  per-user identifier — and carries only a **closed allowlist** of fields
  (`appVersion, osPlatform, buildType, port, packageType`).

This precedent is what makes an always-on **anonymous** crash signal defensible. The key is that
its payload is closed, tiny, and auditable — see §2 for why crash data is the hard case.

---

## 2. Why crash data is different from `nonTracking` analytics

`nonTracking` analytics events are safe because a developer can read the five allowlisted fields
and certify nothing identifying leaves. A **crash report is open-ended** — its debugging value is
exactly the detail that carries identity:

- **Stack frame file paths** leak the OS username (`/Users/<name>/…`) = PII.
- **Exception messages** are free text — connection strings, hosts, key names, even customer
  key/value data.
- **Breadcrumbs** (console, fetch/XHR, navigation — captured by default) carry URLs, DB IDs, payloads.
- **`server_name`** defaults to the **OS hostname**, often `firstname-lastname-macbook` = PII.
- **Client IP** is attached by Sentry **server-side**, after `beforeSend`.

You cannot enumerate in advance what a crash payload contains, so "anonymized Sentry" is a trap:
scrubbing ≠ anonymous. The design below reduces the no-consent payload to a closed shape that
approaches the `nonTracking` bar, and gates everything richer behind consent.

---

## 3. Two-tier model (inside Sentry)

A single, early `Sentry.init` with a `beforeSend` chokepoint that branches on a **mutable consent
flag**. Init happens before consent is known; the *decision* is made per-event at send time.

| | Tier 1 — no consent (anonymous) | Tier 2 — consent granted |
|---|---|---|
| When | Default; pre-consent; consent declined | `agreements.analytics === true` |
| JS exceptions | ✅ minimal allowlist (§4) | ✅ full, still secret/customer-data scrubbed |
| Native minidumps | ❌ **not uploaded** | ✅ uploaded |
| Breadcrumbs | ❌ dropped | ✅ kept |
| User id | fixed sentinel (mirror `NON_TRACKING_ANONYMOUS_ID`) | per-install anonymous id |
| Sessions / PII / IP | off | off by default; IP only if separately approved |

### Skeleton

```ts
// main process — init as the FIRST thing in the entry, before anything that can throw
let consentGranted = readCachedConsent() // see §5; default false

Sentry.init({
  dsn, release, environment,
  sendDefaultPii: false,        // no IP/cookies/headers
  autoSessionTracking: false,   // session = per-user signal
  serverName: 'redacted',       // never let it default to the hostname
  integrations: [rewriteFramesToAppRoot()], // normalize file paths
  beforeBreadcrumb: (b) => (consentGranted ? b : null),
  beforeSend(event) {
    event = scrubSecrets(event)             // ALWAYS: passwords/tokens/keys/certs
    return consentGranted ? event : minimize(event)
  },
})

// crashReporter (native minidumps) — consent-gated, cannot be scrubbed
if (consentGranted) initCrashReporter(dsn, environment) // uploadToServer: true

// later, when consent is resolved or toggled:
export function setSentryConsent(granted: boolean) {
  consentGranted = granted
  writeCachedConsent(granted)         // §5
  if (!granted) Sentry.getClient()?.close()  // stop uploader on revoke
  // (re)start/stop crashReporter accordingly
}
```

`minimize()` and `scrubSecrets()` live in **one shared module** used by both the main and renderer
layers, so they cannot drift (today the logic is duplicated and the renderer has none).

---

## 4. Tier 1 payload — allowlist / striplist

**Keep (non-identifying by construction):**

| Field | Notes |
|---|---|
| Exception **type** (`TypeError`, `DriverPackageNotInstalledError`) | class name, not data |
| Stack frames: function/module names, **paths normalized to app-root-relative** | strip `/Users/<name>/` etc. |
| `release` (app version), `environment` | build metadata |
| OS platform + version, arch; Electron/Chrome/Node versions | aggregate |
| Crash kind (uncaught / unhandledRejection) | signal only |
| Fixed anonymous id | shared sentinel; cannot single out a user |

**Strip / blank in `minimize()`:**

- `exception.values[].value` (the **message**) → empty or type-only
- **all breadcrumbs**
- `event.request`, `event.extra`, `event.contexts.device` (device/serial identifiers)
- `event.user` → force the fixed sentinel id (never a real id)
- `event.server_name` → redacted

**Always (both tiers), in `scrubSecrets()`** — extend beyond today's `extra`/`contexts` to also cover:
`exception` (message + frame vars), `message`, `breadcrumbs`, `request`. Denylist of sensitive field
names is the current approach; prefer moving toward an allowlist for what may leave.

---

## 5. The early-crash / no-consent-field problem

Crashes can occur before the API/UI (and thus the consent setting) are available. Three layers,
decreasing safety:

1. **Default-deny.** `consentGranted` starts `false`. Any crash before consent resolves → Tier 1.
   Behaves correctly even when the consent field does not yet exist.
2. **Cache consent for synchronous boot read.** Authoritative consent is in the SQLite agreements
   table, unavailable at the first line of `main`. **Mirror it to `electron-store` (or a small JSON
   file) on every toggle**, and read that synchronously *before* `Sentry.init`. Then 2nd+ runs get
   the correct tier even for early crashes. First-ever run → no value → `false` → Tier 1.
3. **Native minidumps = consent-only, no exceptions.** `crashReporter` uploads a **memory dump**
   that bypasses `beforeSend` and can contain heap secrets / customer data — it cannot be scrubbed.
   Upload only when consent is granted. Cost: non-consenting users' *native* crashes aren't
   captured. This is the correct trade — you cannot anonymize a core dump.

---

## 6. Security review — sensitive-data scrubbing

Scope for the security review (track as its own item):

- [ ] Add a `beforeSend` to the **renderer** (currently none).
- [ ] Extend `scrubSecrets` to cover `exception`/`message`/`breadcrumbs`/`request` (today: `extra`+`contexts` only).
- [ ] De-duplicate scrubbing into one shared module used by both layers.
- [ ] `sendDefaultPii: false` set explicitly in both layers.
- [ ] `server_name` never defaults to hostname.
- [ ] Stack-frame paths normalized (app-root-relative; home dir stripped).
- [ ] **Sentry project settings**: enable "Prevent Storing of IP Addresses" + server-side data
      scrubbing (defense-in-depth; client `beforeSend` can be bypassed by SDK internals).
- [ ] Unit tests for `scrubSecrets`/`minimize`: passwords, tokens, certs, SSH keys, sentinel password,
      nested objects, arrays, connection strings in messages, paths with usernames.
- [ ] Verify renderer events routed via Classic IPC still pass through main's `beforeSend`
      (belt-and-suspenders: renderer `beforeSend` too).

---

## 7. RI-8113 checklist mapping

### Required
- [ ] **Consent gating** → §3 + §5 (two-tier; default-deny; consent cached for early boot;
      minidumps consent-only).
- [ ] **Security review of scrubbing** → §6.
- [x] **Refine ErrorBoundary screen** → redesigned (title as focal point, calm primary action,
      theme-aware palette via the persisted `document.body` theme class); reporting split from the
      generic `ErrorBoundary` and guarded so a Sentry failure can't block the fallback. Remaining:
      optional designer sign-off on the literal palette (can't read the live theme — boundary
      renders above `ThemeProvider`).
- [ ] **CI/CD Sentry env via secrets** → all four pipelines reference a single `RI_SENTRY_DSN`
      (shared by main + renderer + web; one Sentry project), `RI_SENTRY_ENABLED`,
      `RI_SENTRY_ENVIRONMENT` + the source-map vars (§9). Maintainer must **create**:
      `RI_SENTRY_DSN` and `RI_SENTRY_AUTH_TOKEN` (secrets), `RI_SENTRY_ORG` / `RI_SENTRY_PROJECT_UI`
      / `RI_SENTRY_PROJECT_ELECTRON` (vars). Already set: `RI_SENTRY_ENABLED`, `RI_SENTRY_ENVIRONMENT`
      (the previously-set `RI_SENTRY_ELECTRON_DSN` is replaced by `RI_SENTRY_DSN`).
- [ ] **Remove PoC test triggers** → `triggerTestCrash`/`triggerNativeCrash` + global shortcuts
      (`desktop/app.ts`), Help-menu `Crash Handler`/`Crash React` (`HelpMenu.tsx`), and the
      `// Test Helpers` block in `sentry.ts`.

### Recommended
- [x] Source maps upload to Sentry → §9 (implemented via bundler plugins; pending CI secrets/vars).
- [x] Release tracking → §9 (`release` = `pkg.version` + debug IDs; SHA as metadata, not identifier).
- [ ] User context (per-install anonymous id, **Tier 2 only**).
- [ ] Performance monitoring / dashboard.

### Follow-up
- [ ] API/Backend Sentry (removed from PoC; separate effort).
- [ ] Slack crash notification.

---

## 8. Legal / Security — decisions

1. **Tier-1 allowlist as a no-consent payload** — ✅ **Accepted.** The §4 allowlist under the fixed
   sentinel id is approved as a non-identifying, no-consent payload (same theory as the existing
   `nonTracking` `APPLICATION_STARTED` event, carried in Sentry instead of Segment).
2. **IP address** — ✅ **Not tracked.** IP must not be stored, for either tier. Enforce via
   "Prevent Storing of IP Addresses" at the Sentry project level (§6) plus `sendDefaultPii: false`.
3. **Data residency / region** — ✅ **US, approved.** Sentry is a confirmed organization-approved
   vendor and all data is stored in the **US** region (the `redis-ltd` org is US, per the DSN ingest
   host `*.ingest.us.sentry.io`). No EU org required.

   *How to verify region:* project → **Client Keys (DSN)**
   (`https://redis-ltd.sentry.io/settings/projects/redis-insight-electron/keys/`) and read the DSN
   host (`.us.` = US, `.de.` = EU); or Organization Settings → **Data Storage Location**.
4. **Retention** — **90 days (Sentry SaaS default).** Adopted as the default for crash data; long
   enough to correlate against a release, short enough to be minimal. Shortening (e.g. 30 days)
   requires Enterprise custom retention or self-hosted; revisit only if Legal requires stricter
   minimization.

---

## 9. Source maps & release identifier

### Why it matters

Production bundles are minified, so without uploaded source maps every Sentry stack trace is
`at t (index-DvBBho49.js:1:48211)` — you get crash *counts* but not crash *causes*. Source maps let
**Sentry's server** symbolicate back to `KeyList.tsx:142`. This is most of Sentry's debugging value,
so treat it as **required for a real production rollout** (the ticket lists it as "Recommended").

Orthogonal to privacy: maps are uploaded to Sentry at build time and **must not ship inside the
app** (`hidden` mode). They never touch the user's machine or the payload, so they don't affect the
consent/scrubbing model.

### Current build state (as of this branch)

- **Renderer (Vite)** — `build.sourcemap` unset → **no maps generated** (`redisinsight/ui/vite.config.mjs`).
- **Main (webpack)** — `devtool: 'source-map'` only when `DEBUG_PROD=true`; otherwise none, and
  `scripts/DeleteSourceMaps.js` **deletes** renderer maps at main-build time.
- **Tooling** — only runtime SDKs installed; no `@sentry/cli` / `@sentry/vite-plugin` / `@sentry/webpack-plugin`.
- **CI** — no upload step; `RI_APP_BUILD_COMMIT_SHA = github.sha` is already available in all four pipelines.
- **Release** — both layers send `release: pkg.version` (currently `3.6.0`), static per version.

### Decision: version-only release + debug IDs

Releases ship ~monthly with a `package.json` version bump, so the release identifier does **not**
need to be unique per build. What symbolication actually requires is that the release tag
correspond 1:1 to the exact artifact whose maps were uploaded — a monthly version bump satisfies
that.

- **`release` = `pkg.version`** (no `+<sha>`). Human-readable, matches the user-facing version, and
  keeps the runtime string and the upload string trivially in sync (both derive from `package.json`).
- **Use debug IDs for matching** (`sentry-cli sourcemaps inject` + upload, or the bundler plugins):
  a unique ID is stamped into both the minified file and its map, so symbolication matches
  bundle↔map by that ID, **not** by release name. This removes the only real risk of version-only
  releases (a same-version rebuild overwriting maps and mis-symbolicating old events) without adding
  the SHA's downsides (noisy release list, and a *silent* failure if the runtime/upload release
  strings ever drift).
- **SHA as metadata, not identity** — attach `RI_APP_BUILD_COMMIT_SHA` as a Sentry release
  `commit`/property so "which commit shipped this version" is answerable, without putting it in the
  release identifier.

### Implementation — DONE (pending CI config)

Implemented via the Sentry **bundler plugins** (simpler than a separate `sentry-cli` CI step — the
upload runs inside the existing build, on every pipeline automatically, and the plugin handles
inject + upload + delete-after-upload):

- `@sentry/vite-plugin` (renderer) and `@sentry/webpack-plugin` (main), both **gated on
  `RI_SENTRY_AUTH_TOKEN`** → no-op for local/dev builds.
- Source maps are `hidden` and generated only when uploading; the plugin **deletes them after
  upload**, so they never ship in the app.
- `release` = `pkg.version`; **debug IDs** match bundle↔map (no per-build SHA).
- Renderer and main are separate bundler outputs → two uploads (projects `RI_SENTRY_PROJECT_UI` /
  `RI_SENTRY_PROJECT_ELECTRON`), same release name.

### Required CI configuration (must be added by a maintainer)

| Name | Kind | Notes |
|---|---|---|
| `RI_SENTRY_AUTH_TOKEN` | **secret** | enables upload; absent → plugins no-op. Build-time only — never reference via `import.meta.env` in client code (the `RI_` prefix makes it client-exposable). |
| `RI_SENTRY_ORG` | var | Sentry org slug |
| `RI_SENTRY_PROJECT_UI` | var | renderer/web project slug |
| `RI_SENTRY_PROJECT_ELECTRON` | var | main-process project slug |
| `RI_SENTRY_DSN` | **secret** | single DSN shared by main + renderer + web (one project); replaces the former split `RI_SENTRY_ELECTRON_DSN` / `RI_SENTRY_UI_DSN` |

All five are referenced in the four `pipeline-build-*.yml` env blocks.

### Open questions

- **Build determinism across the four platform pipelines** (mac/win/linux/docker): each builds the
  JS separately. Debug IDs make this safe (each build's maps carry their own IDs), so no action
  needed — but worth confirming we're not uploading redundant artifacts.
- ~~Docker/web reporting~~ — **resolved:** the web entry (`index.tsx`) now initializes Sentry via
  `services/sentryWeb.ts` (`@sentry/react`), so all three targets report — Electron main, Electron
  renderer, and web/docker. The web build's maps upload through the same Vite plugin.

---

## 10. RedisInsight-Cloud compatibility (follow-up, not in this PR's scope)

`RedisInsight-Cloud` consumes this repo as a submodule and serves the RedisInsight **web** UI. Its
**production** UI is a **prebuilt web artifact downloaded from S3** (`bin/build-api-statics.sh` →
`…/latest-v3/web/…tar.gz`), not built from the submodule — the submodule is used for the API and
local dev. It overrides config **at runtime, per host**, via `ui-config/domain.ts`, but only the
`api`/`app` sections today (not `sentry`).

### This PR is forward-compatible by design — no refactor needed for cloud

The init code reads `getConfig().sentry`, never `process.env` directly, and `getConfig()`
(`config/index.ts`) deep-merges the per-host `domainConfig` over the build-time defaults:

```
config = cloneDeep(riConfig); merge(config, domainConfig)   // domainConfig = config[window.location.host]
```

`PartialConfig = DeepPartial<Config>`, so a partial `sentry` override is already type-valid, and
`domainConfig` resolves **synchronously** at module load — so `initSentry()` at the top of the entry
already sees the merged config (no async re-init).

### The cloud work is therefore additive

1. Supply a `sentry: { dsn, environment, enabled }` block in the cloud's per-host config
   (`ui-config/domain.ts`) → `getConfig().sentry` picks it up; `sentryWeb.ts` is unchanged. This lets
   cloud use its **own** Sentry project + `environment` (e.g. `cloud-prod`), distinct from desktop.
2. Ensure the **S3 web artifact** is rebuilt from a RedisInsight version containing these commits —
   the runtime override swaps *config*, not *code*, so the artifact must already include the init.
3. Separate Legal/privacy sign-off for the hosted multi-tenant context (more users, server-captured
   IP, customer data in a shared service) — stricter than the desktop case.

Integration point for whoever picks this up: `redisinsight/ui/src/config/default.ts` (the `sentry`
block, documented inline) + `config/index.ts` (the `domainConfig` merge).
