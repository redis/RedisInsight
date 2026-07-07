# "What's New?" Feature — Plan & Design Document

**Status:** Implemented on integration branch (Phase 1 + Phase 2, post-review refinements, i18n) — pending PR split
**Owner:** _TBD_
**Last updated:** 2026-07-07

---

## 0. Implementation status

Phases 1 and 2 are built on this integration branch and are green (type-check: no new baseline errors; UI unit tests passing; lint clean). Ready for design/product review, after which it splits into the PR stack in §10.

**Built:**
- Dedicated `whatsNew` feature flag (UI enum + `config/default.ts` + features slice default-on).
- Bundled content (`constants/content/whatsNew.json`) + generic card types, seeded with 3.6.0.
- `whatsNew` Redux slice + `WhatsNewModal` (version selector + generic `FeatureCard`), mounted in `GlobalDialogs` behind the flag.
- Help Center "What's new?" entry (manual open).
- Desktop auto-open on first launch after an eligible update, with the "Application updated" toast kept as the fallback.
- Telemetry events + unit tests (slice, modal, HelpMenu, `ipcCheckUpdates`).

**Post-review refinements (manual testing round, 2026-07-07):**
- Title cased "What's New"; version dropdown shows `v<version>`, newest marked `(Latest)`; standalone "Version" label dropped; release date shown next to the selector.
- Blanket "New" badges removed from seed cards (`tag` reserved for non-default states like "Beta"/"Improved").
- Footer link is version-specific ("See full release notes for {version}" → the GitHub tag; `releaseNotesUrl` can override per version).
- Cards gained an optional `location` ("Where to find it:") hint; unused version-level `title` field removed from the schema.
- UI strings localized with i18next under `whatsNew.*` (en + bg); card content stays English-first (see §8 Localization).

**Two deviations from the plan below, both simplifications:**
1. **Feature flag is UI-only** (mirrors `envDependent`/`cloudAds`: defaulted in UI config + merged in the features slice), so **no API `known-features.ts` change** was needed for a default-on flag. Disable per-build via `RI_FEATURES_WHATS_NEW_DEFAULT_FLAG=false`.
2. **Eligibility is a pure `isWhatsNewEligible(version, lastSeen)` helper** rather than an `openWhatsNewIfEligible` thunk — `ipcCheckUpdates` needs the boolean to both auto-open and branch the fallback toast.

---

## 1. Summary

Introduce a **"What's New?"** experience that surfaces the notable changes shipped in each RedisInsight release.

- A **modal** lists new features grouped **per version**.
- **Latest version is shown by default**; users can **switch to previous versions** and browse their content.
- It **auto-triggers once** after an update completes (desktop), and can be **opened manually** any time from the **Help Center**.

The goal is to close the discovery gap: users update but never learn what changed. Today the only signal is a small "Application updated" toast that links out to GitHub release notes — most users ignore it.

---

## 2. Goals & non-goals

### Goals
- Increase awareness and adoption of new features.
- Show version-scoped, human-friendly highlights (not raw changelogs).
- Trigger automatically, exactly once per version, without nagging.
- Let users revisit at will and browse history.
- Keep content **editable without shipping an app release** (PM/marketing can update copy/images).
- Capture telemetry to measure impact.

### Non-goals (v1)
- Not a replacement for the full GitHub release notes / changelog (link out for the long tail).
- Not per-user personalization or targeting by cohort (possible later).
- Not in-product interactive tours (that is the existing Onboarding Tour system; "What's New?" can *link into* a tour, but does not replace it).

---

## 3. Industry standards & benchmarks

"What's New" / release-highlight modals are a well-established pattern. Common conventions across best-in-class desktop apps:

| App | Pattern | Notable choices |
|-----|---------|-----------------|
| **VS Code** | Opens a "Release Notes" tab after major-version update, once per version | Auto-shown only on **minor/major**, not patches; rich markdown; "Show release notes after update" setting |
| **JetBrains IDEs** | "What's New" page after update + always available in menu | Version-scoped; heavy use of short GIFs/screenshots |
| **Slack / Notion / Figma** | Lightweight modal or side panel with 3–5 highlights, images, "Learn more" links | Dismissible; remembers last-seen version; small "new" dot on a menu entry |
| **GitHub Desktop / Postman** | Modal on first launch after update | Concise, links to full changelog |

**Distilled best practices (adopted below):**

1. **Trigger on meaningful releases only.** Auto-show for **minor/major** versions; **skip patch/hotfix** releases (e.g. `x.y.Z`) so users aren't interrupted for bug-fix bumps. Manual open always works.
2. **Show once per version.** Persist the last-seen version; never re-show the same version automatically.
3. **Curated highlights, not changelogs.** 3–7 items per version, each with a title, short description, optional image/GIF, and an optional "Learn more" / deep link.
4. **Ship content with the build.** Highlights describe features that shipped *in* a given version, so bundling the content in that build keeps copy and code in sync and works fully offline. (Remote-editable content is a possible future enhancement — see §5.3.)
5. **Always escapable & non-blocking.** Clear close affordance, no forced acknowledgement, keyboard `Esc` to dismiss.
6. **Discoverable afterward.** A permanent entry in the Help Center; optionally a subtle "new" badge until first viewed.
7. **Respect the environment.** Gate behind a feature flag so embedded/enterprise/OEM builds can disable it.

---

## 4. UX specification

### 4.1 Entry points
1. **Automatic (desktop only):** On first launch after an update to a new **minor/major** version, open the modal automatically, defaulted to the new version. Docker/web builds have no auto-updater, so they never auto-trigger.
2. **Manual (all builds):** A **"What's new?"** item in the Help Center popover (next to "Release Notes"). No unread badge — the modal auto-opens on desktop, so a badge would be redundant.

### 4.2 Modal layout
```
┌───────────────────────────────────────────────────────────┐
│  What's new                                            [X]  │
│  ┌───────────────────────┐                                 │
│  │ Version ▾  v2.60.0     │  ← version selector (latest default)
│  └───────────────────────┘                                 │
│                                                             │
│  🎉  Highlight title                                        │
│      Short description of the feature and why it matters.   │
│      [ image / gif ]                                        │
│      Learn more →                                           │
│                                                             │
│  ⚡  Another highlight …                                     │
│                                                             │
│  … (3–7 items)                                              │
│                                                             │
│  ───────────────────────────────────────────────────────  │
│  See full release notes ↗            [ Got it ]             │
└───────────────────────────────────────────────────────────┘
```

- **Version selector:** dropdown listing all versions present in the bundled content, newest first. Selecting a version re-renders its cards. This is how users browse **what was new in previous versions**.
- **Feature card:** icon/emoji, title, body (markdown-lite), optional media, optional link(s), optional tag. See the generic schema in §5.1.
- **Footer:** persistent link to full GitHub release notes; primary dismiss button.
- **Empty state:** if the selected version has no cards, show a short message + release-notes link. (Auto-open never fires for a version without cards — see §4.3.)

### 4.3 Behavior rules
- Auto-open **only** when: build supports it (feature flag on) **AND** it's a first launch after update **AND** target version is minor/major **AND** the version has cards **AND** `lastWhatsNewVersionSeen` < current version.
- Opening (auto or manual) sets `lastWhatsNewVersionSeen = currentVersion` once dismissed/viewed.
- Manual open never depends on "seen" state.
- `Esc`, backdrop click (optional), and the close button all dismiss.

---

## 5. Content model & source

**Decision: a single JSON file bundled with the app build.** No remote fetch in v1.

- Content lives in the UI source, e.g. `redisinsight/ui/src/constants/content/whatsNew.json`, imported directly by the slice — no network call, works fully offline, and content is always in sync with the code it describes.
- Media (images/GIFs) are bundled as static assets referenced by relative path.
- Because it's a static import, "unavailable" isn't a real failure mode; the only empty case is a version that intentionally has no cards.

### 5.1 Generic card schema

The schema is intentionally **content-agnostic** — a card is just presentational primitives (title, body, optional location/media/links/tag), with **no feature-specific fields**. Any future release describes its highlights by filling in the same shape; the modal never needs code changes to render a new feature.

```jsonc
{
  "schemaVersion": 1,
  "versions": [
    {
      "version": "3.6.0",
      "releaseDate": "2026-06-15",
      "type": "minor",              // "major" | "minor" | "patch" — drives auto-trigger only
      "releaseNotesUrl": "https://…",   // optional override; defaults to the GitHub tag URL
      "cards": [
        {
          "id": "vector-sets",            // stable id, used for telemetry & de-dup
          "tag": "Beta",                   // optional pill for non-default states ("Improved", "Beta"…) — NOT a blanket "New"
          "icon": "VectorIcon",            // optional: a registered RiIcon type name
          "title": "Vector Sets",
          "body": "Short markdown-lite description of the feature and why it matters.",
          "location": "Browser — add a key of type Vector Set",  // optional "where to find it" hint
          "media": {                        // optional
            "type": "image",               // "image" | "gif"
            "src": "whats-new/3.6.0/vector-sets.png",
            "alt": "Vector Sets in the browser"
          },
          "links": [                        // optional, zero or more
            { "label": "Learn more", "href": "https://redis.io/..." }
          ],
          "featureFlag": "vectorSet"        // optional: hide this card if the flag is off
        }
      ]
    }
  ]
}
```

**Field notes**
- Only `id`, `title`, and `body` are required per card; everything else is optional, so cards can be as plain or as rich as needed.
- `type` on the version drives auto-trigger eligibility (minor/major only) — it does **not** affect manual browsing.
- Per-card `featureFlag` keeps content honest across OEM/feature-flagged builds (hide a highlight the current build doesn't ship).
- `versions` is the single source for the version dropdown; sort by semver descending at render time. The newest entry is labelled "(Latest)".
- The footer "See full release notes for {version}" links to `releases/tag/<version>` unless `releaseNotesUrl` overrides it.
- Keep `body` short — long-form lives in the GitHub release notes (footer link).
- **Extensibility:** if a future release needs richer layouts, `body` can graduate to an ordered `blocks` array (`{ type: "text" | "image" | "list" | "link" }`). Not needed for v1; the flat shape covers the current releases.

### 5.2 Seed content — 3.6.0

Seed the initial file with the three 3.6.0 highlights so the feature ships with real content and previous-version browsing works from day one. Copy is **text-only for v1** (no media — see §11) and lifted from the [3.6.0 release notes](https://github.com/redis/RedisInsight/releases/tag/3.6.0):

```jsonc
{
  "schemaVersion": 1,
  "versions": [
    {
      "version": "3.6.0",
      "releaseDate": "2026-06-15",
      "type": "minor",
      "cards": [
        {
          "id": "vector-sets",
          "title": "Vector Sets support",
          "body": "Full support for Vector Sets, the Redis 8 vector-native data type: create them manually or from a bundled sample dataset, add elements, and run similarity search end-to-end.",
          "location": "Browser — add a key of type Vector Set",
          "featureFlag": "vectorSet"
        },
        {
          "id": "dev-vs-prod-mode",
          "title": "Dev vs Production database mode",
          "body": "Classify databases by environment with clear visual indicators, and require type-to-confirm for destructive actions on production databases.",
          "location": "Database list — edit a database's connection settings",
          "featureFlag": "prodMode"
        },
        {
          "id": "geodata-workbench",
          "title": "Geodata Workbench plugin",
          "body": "Renders Redis GEO command results as an interactive map, density heatmap, or details card — auto-selected per command.",
          "location": "Workbench — run a GEO command (e.g. GEOSEARCH)"
        }
      ]
    }
  ]
}
```

**Content ownership going forward:** because the file is bundled, each release PR adds its own version block to `whatsNew.json` as part of that PR — the same person writing the GitHub release notes copies the highlights across. Copy can be tweaked on the go in the respective PR; no separate publishing step. _(Confirm the 3.6.0 release date above against the tag before merging.)_

### 5.3 Future enhancement (out of scope for v1)
If we later want to correct copy or add highlights without shipping a release, the same JSON can be served remotely through the existing `resourcesService` + `statics-management` pipeline (as tutorials/recommendations already are), with the bundled file as the offline fallback. The card schema above is unchanged either way — only the fetch source differs.

---

## 6. Trigger logic (auto-show once after update)

The desktop app already detects first-run-after-update. We extend that path rather than adding a parallel mechanism.

**Existing pieces to build on:**
- `redisinsight/desktop/src/lib/updater/updater.handlers.ts` — on `update-downloaded`, stores `updateDownloadedVersion` and `updatePreviousVersion` in electron-store.
- `redisinsight/ui/src/electron/utils/ipcCheckUpdates.ts` + `ConfigElectron.tsx` — on mount, detect that the running `appVersion` matches `updateDownloadedVersion` and that `updateDownloaded` flag is set → currently fires the "Application updated" toast, then clears the flag.

**Proposed flow:**
1. On first launch after update, `ConfigElectron` (via `ipcCheckUpdates`) detects the update completed, and now also reads `updatePreviousVersion`.
2. Dispatch a new thunk `openWhatsNewIfEligible({ from: updatePreviousVersion, to: currentVersion })`.
3. Eligibility check (client-side): `whatsNew` flag on → read bundled content → target version has cards & `type !== 'patch'` → `lastWhatsNewVersionSeen` older than current → **open modal**.
4. **Relationship with the "Application updated" toast (decided):** when the What's New modal is eligible and shown, the modal **replaces** the toast — the toast is suppressed. When the modal is *not* eligible (patch release, or a version with no cards), keep the existing toast + release-notes link so the update is never silent. This is the fallback path, not a duplicate.
5. **Web/Docker builds have no auto-updater → manual entry only.** No auto-trigger there in v1.

---

## 7. Technical design (mapped to the codebase)

### 7.1 Redux slice — `slices/app/whatsNew.ts` (new)
State:
```ts
interface StateWhatsNew {
  isOpen: boolean
  selectedVersion: string | null       // defaults to latest on open
  data: WhatsNewFeed                    // statically imported bundled JSON
  lastVersionSeen: string | null        // hydrated from localStorage
}
```
Actions/thunks: `openWhatsNew(version?)`, `setSelectedVersion`, `closeWhatsNew`, `markVersionSeen(version)`, `openWhatsNewIfEligible({from, to})`.
Selectors: `whatsNewSelector`, `whatsNewIsOpenSelector`. Register in the root reducer alongside `app/info`, `app/features`, `app/notifications`. (No `loading`/`error` — content is a static import, not a fetch.)

### 7.2 Persistence — "seen" tracking
- Add `whatsNewLastVersionSeen` to `BrowserStorageItem` (`redisinsight/ui/src/constants/storage.ts`).
- Read/write via `localStorageService` (`redisinsight/ui/src/services/storage.ts`), mirroring the onboarding-step pattern in `slices/app/features.ts`.
- Version comparison uses semver (a semver dependency is already present via electron-updater; otherwise add a tiny compare helper).

### 7.3 Content source (bundled)
- Content is a static JSON module, e.g. `redisinsight/ui/src/constants/content/whatsNew.json`, imported directly by the slice — no `resourcesService`, no `ApiEndpoints` entry, no API changes.
- Validate the shape with a lightweight type/guard at import time so a malformed entry fails loudly in dev.
- Media assets bundled under the UI static/assets dir, referenced by the `media.src` relative path.

### 7.4 UI component — `components/whats-new/` (new)
- `WhatsNewModal.tsx` using `Modal.Compose` / `Modal.Content.*` from `uiSrc/components/base/display/modal` (same composition as `FormDialog.tsx`).
- Subcomponents: `VersionSelector` (dropdown), `FeatureCardList`, `FeatureCard` (icon via `RiIcon`, media, links) — the card renders purely from the generic schema, so new features need no component changes.
- Layout with `Row`/`Col`/`FlexGroup` from `uiSrc/components/base/layout/flex`; theme spacing only, no hardcoded px.
- Render the modal once at the app shell level (near where `ConfigElectron` / global notifications mount) so both auto and manual triggers share one instance.
- Filter cards whose `featureFlag` is off using the features slice (`FeatureFlags` enum + `useAppSelector`).

### 7.5 Help Center entry
- Add a **"What's new?"** item to `HelpMenu.tsx` (`components/navigation-menu/components/help-menu/`), following the existing hardcoded-item pattern (icon + `Link`/handler + `data-testid="whats-new-btn"`).
- Handler dispatches `openWhatsNew()` (manual open, latest version) instead of an external link.
- No unread badge (decided) — the desktop modal auto-opens, so a badge adds nothing.

### 7.6 Feature flag — dedicated `whatsNew`
- Add `whatsNew = 'whatsNew'` to `FeatureFlags` (`redisinsight/ui/src/constants/featureFlags.ts`) with a `defaultFlag` entry (its own env var, default `true`) in `redisinsight/ui/src/config/default.ts`, and wire the API side (`known-features.ts` + a `CommonFlagStrategy`/config-backed factory) per the feature-flags skill.
- Rationale: `envDependent` is a shared "standard build" gate (default `true`, toggled by `RI_FEATURES_ENV_DEPENDENT_DEFAULT_FLAG`) that the Help Center already reuses to hide Feedback / Reset Onboarding in embedded builds. Reusing it would couple What's New to that unrelated switch. A dedicated flag gives independent on/off control.
- Gate both the auto-trigger and the Help Center item on `whatsNew`.

### 7.7 Telemetry
Follow `sendEventTelemetry` + `TelemetryEvent` (`redisinsight/ui/src/telemetry/`). Add events (UPPER_SNAKE_CASE):
- `WHATS_NEW_OPENED` — `eventData: { source: 'auto_update' | 'help_center', version }`
- `WHATS_NEW_CLOSED` — `{ version, timeSpent? }`
- `WHATS_NEW_VERSION_CHANGED` — `{ fromVersion, toVersion }`
- `WHATS_NEW_CARD_LINK_CLICKED` — `{ version, cardId, href }`

Add a `WhatsNewSource` enum in `redisinsight/ui/src/constants/telemetry.ts`, mirroring `ReleaseNotesSource`. Reuse the existing `APPLICATION_UPDATED` event for the update itself.

---

## 8. Edge cases & considerations

- **Patch releases:** never auto-open (only manual). Governed by `type` in the content file.
- **Skipping versions:** if a user jumps from 3.4 → 3.6, auto-open shows the latest (3.6) by default; prior versions remain browsable via the dropdown. (Optional later: aggregate multiple unseen versions.)
- **Version with no cards:** suppress auto-open and keep the existing "Application updated" toast (the fallback path from §6.4).
- **Content references a feature the build lacks** (OEM/flagged): hide via per-card `featureFlag`.
- **First-ever install (no previous version):** do **not** auto-open — only trigger on an actual update transition.
- **Web vs desktop:** auto-trigger is desktop-only; manual entry everywhere.
- **Localization:** UI chrome (title, menu item, version labels, buttons, "Where to find it:" label, release date formatting) is localized via i18next under `whatsNew.*` keys (en + bg). **Card content** (`whatsNew.json` titles/bodies/locations) stays English-first in v1 by design — it is per-release copy; localizing it would require translating every release block on every release. If that's ever wanted, move card strings to locale keys addressed by card id (e.g. `whatsNew.content.<id>.title`) — the schema doesn't change, only where strings live.
- **A11y:** focus trap in modal, `Esc` to close, focus returns to the Help Center trigger, images use `media.alt`.
- **Performance:** content is a static import (no runtime fetch); the modal mounts lazily on open.

---

## 9. Phased implementation plan

**Phase 1 — Core modal + manual entry (MVP)**
- Generic card schema + bundled `whatsNew.json` seeded with 3.6.0 content (Vector Sets, Dev vs Prod mode, Geodata Workbench).
- `whatsNew` Redux slice (static import, no fetch).
- `WhatsNewModal` with version selector and generic feature-card list.
- Help Center "What's new?" item (manual open).
- Dedicated `whatsNew` feature flag (UI + API wiring).
- Telemetry: opened/closed/version-changed/card-link-clicked.
- Unit tests (slice, component, HelpMenu item) with `renderComponent` + faker.

**Phase 2 — Auto-trigger after update (desktop)**
- Extend `ipcCheckUpdates` / `ConfigElectron` to read `updatePreviousVersion` and dispatch `openWhatsNewIfEligible`.
- `lastWhatsNewVersionSeen` persistence + semver eligibility (minor/major only, once per version).
- Suppress the "Application updated" toast when the modal shows; keep it as the fallback for patch/no-card versions.

**Phase 3 — Polish & optional enhancements**
- Aggregate multiple unseen versions on large jumps.
- Deep links from cards into in-app routes / onboarding tours.
- Remote-editable content via `resourcesService` (see §5.3), if the "edit copy without a release" need materializes.
- E2E (Playwright) coverage for manual open and (mocked) post-update trigger.

---

## 10. Delivery plan (branch → stack)

Build the whole feature on **one integration branch** first, validate end-to-end and get **design sign-off on the real thing**, then carve that branch into a stack of small, independently reviewable PRs. The `whatsNew` flag (default the way we want it) keeps every intermediate PR inert, so nothing half-built reaches users.

### 10.1 Approach
1. **Integration branch** (in this worktree): implement Phase 1 + Phase 2 together, wire it up, and test manually (desktop auto-open + manual open in web/Docker).
2. **Design + product review** on the working build.
3. **Split into a stacked PR chain** in dependency order (each branch off the previous, not cherry-picked out of the monolith). Rebase each onto `main` as the one below it merges.

### 10.2 PR stack

| # | PR | Scope | Tests |
|---|-----|-------|-------|
| 1 | **Feature flag** | `whatsNew` in `FeatureFlags` enum + `ui/src/config/default.ts` + API `known-features.ts` | flag unit tests |
| 2 | **Modal + manual entry** | `whatsNew.json` + types/guard, Redux slice, `WhatsNewModal` + `VersionSelector` + `FeatureCard`, Help Center item, telemetry | slice + component + HelpMenu unit tests |
| 3 | **Desktop auto-trigger** | `openWhatsNewIfEligible`, `ipcCheckUpdates`/`ConfigElectron` wiring, `lastVersionSeen` persistence, semver eligibility, toast suppression | trigger/eligibility + persistence unit tests |
| 4 | **E2E** | Playwright coverage: manual open, version switching, mocked post-update auto-open | `tests/e2e-playwright/` |

Flip the flag on in PR 3 (or a tiny follow-up) once the stack is fully merged.

### 10.3 Per-PR CI checklist (each PR must be green on its own)
- `yarn lint` — clean.
- `yarn type-check` — passes. Keep the feature **`any`-free** so `.tscheck.rec.json` baselines don't move; if counts do change, apportion the baseline update to the PR that introduces the change and run `yarn tscheck` there (see the type-check-baselines skill).
- `yarn test` (UI) / `yarn test:api` — relevant tests pass, and unit tests ship **with their feature PR** (2 and 3), not deferred to the E2E PR.
- Lockfile clean: no `package.json` change here, so `yarn.lock` should be untouched.
- Branch name follows conventions before opening each PR.

### 10.4 Watch-outs
- **Stack, don't retro-cherry-pick** — slices pulled out of the monolith tend not to build in isolation; branching each PR off the previous guarantees they do.
- **Keep the integration branch rebased on `main`** while it lives, or the split fights merge drift.
- Split-PR review can still surface ripple changes despite pre-approval — budget a little for that.

---

## 11. Resolved decisions & remaining questions

**Resolved:**
1. **Content source:** bundled local JSON, imported statically (no remote fetch in v1). Remote is a documented future option (§5.3).
2. **Auto-trigger scope:** minor + major only; patch releases excluded (via `type`).
3. **"Application updated" toast:** modal replaces it when eligible; toast remains only as the fallback for patch/no-card versions.
4. **Feature flag:** dedicated `whatsNew` flag (not `envDependent`).
5. **Web/Docker:** manual entry only; no auto-trigger (no auto-updater there).
6. **Unread badge:** none — the modal auto-opens, so a badge is redundant.
7. **Media in v1:** text-only cards; images/GIFs deferred (schema already supports optional `media` when we add it).
8. **Retention:** keep all historical versions in the dropdown (no cap).
9. **Content workflow:** each release PR appends its version block to `whatsNew.json`; copy sourced from that release's GitHub notes and adjustable in the same PR.
10. **Localization:** UI chrome via i18next (`whatsNew.*`, en + bg); card content English-first in v1 (see §8).
11. **Card badges:** no blanket "New" tag; `tag` reserved for non-default states ("Beta", "Improved").

**Still open:**
1. **3.6.0 release date** — seed says `2026-06-15` (matches the release notes); confirm against the published tag before merging.
2. **Empty state** — if all of a version's cards are flag-gated off in a build, the list renders empty; decide whether to add a fallback message (small, Phase 3-able).

---

## Appendix — Key files referenced

| Area | File |
|------|------|
| Help Center menu | `redisinsight/ui/src/components/navigation-menu/components/help-menu/HelpMenu.tsx` |
| External links | `redisinsight/ui/src/constants/links.ts` |
| Auto-updater handlers | `redisinsight/desktop/src/lib/updater/updater.handlers.ts` |
| First-run-after-update detection | `redisinsight/ui/src/electron/utils/ipcCheckUpdates.ts`, `redisinsight/ui/src/electron/components/ConfigElectron/ConfigElectron.tsx` |
| App info slice (electron/update state) | `redisinsight/ui/src/slices/app/info.ts` |
| Features / onboarding slice (persistence pattern) | `redisinsight/ui/src/slices/app/features.ts` |
| Notifications slice + update toast | `redisinsight/ui/src/slices/app/notifications.ts`, `redisinsight/ui/src/components/notifications/success-messages.tsx` |
| Modal base | `redisinsight/ui/src/components/base/display/modal`, example `redisinsight/ui/src/components/form-dialog/FormDialog.tsx` |
| Storage helper + keys | `redisinsight/ui/src/services/storage.ts`, `redisinsight/ui/src/constants/storage.ts` |
| Telemetry helper + events | `redisinsight/ui/src/telemetry/telemetryUtils.ts`, `redisinsight/ui/src/telemetry/events.ts`, `redisinsight/ui/src/constants/telemetry.ts` |
| Feature flags (UI enum + config + API) | `redisinsight/ui/src/constants/featureFlags.ts`, `redisinsight/ui/src/config/default.ts`, `redisinsight/api/src/modules/feature/constants/known-features.ts` |
| Unread badge component (optional) | `redisinsight/ui/src/components/hightlighted-feature/HighlightedFeature.tsx` |
| Onboarding tour (reference) | `redisinsight/ui/src/components/onboarding-tour/OnboardingTour.tsx` |
| Remote content service (future, §5.3) | `redisinsight/ui/src/services/resourcesService.ts`, `redisinsight/api/src/modules/statics-management/statics-management.module.ts` |
