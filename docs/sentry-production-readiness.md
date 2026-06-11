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
| Electron main | `redisinsight/desktop/src/lib/sentry/sentry.ts` (`initSentry`) | `RI_SENTRY_ELECTRON_DSN` | ❌ none | partial — `event.extra` + `event.contexts` only |
| UI renderer | `redisinsight/ui/src/services/sentryElectron.ts` (`initSentry`) | `RI_SENTRY_UI_DSN` | ❌ none | ❌ **none** (no `beforeSend`) |

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
- [ ] **Refine ErrorBoundary screen with designer** → `SentryErrorBoundary.tsx` currently has a
      placeholder UI marked `// TODO: Design`.
- [ ] **CI/CD Sentry env via secrets** → `RI_SENTRY_UI_DSN`, `RI_SENTRY_ELECTRON_DSN`,
      `RI_SENTRY_ENABLED`, `RI_SENTRY_ENVIRONMENT` already wired in the build workflows; confirm
      secrets/vars exist in all four pipelines.
- [ ] **Remove PoC test triggers** → `triggerTestCrash`/`triggerNativeCrash` + global shortcuts
      (`desktop/app.ts`), Help-menu `Crash Handler`/`Crash React` (`HelpMenu.tsx`), and the
      `// Test Helpers` block in `sentry.ts`.

### Recommended
- [ ] Source maps upload to Sentry (CI step + `SENTRY_AUTH_TOKEN`).
- [ ] Release tracking (`release` = `redisinsight@<version>+<gitSha>`).
- [ ] User context (per-install anonymous id, **Tier 2 only**).
- [ ] Performance monitoring / dashboard.

### Follow-up
- [ ] API/Backend Sentry (removed from PoC; separate effort).
- [ ] Slack crash notification.

---

## 8. Open questions for Legal / Security

1. **Legal sign-off on the Tier-1 allowlist** (§4) as a non-identifying, no-consent payload — same
   theory as the existing `nonTracking` `APPLICATION_STARTED` event, carried in Sentry instead of
   Segment. Is the allowlist acceptable, and is the fixed sentinel id sufficient?
2. **IP address**: confirm "do not store IP" at the Sentry project level for both tiers. Any case
   where IP retention is permitted (Tier 2 only)?
3. **Data residency / processor**: is Sentry an approved sub-processor; which region/instance?
4. **Retention**: crash-data retention period in the Sentry project.
