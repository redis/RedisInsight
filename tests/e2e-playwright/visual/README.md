# Visual regression tool (local)

A fast, local visual-regression check for the whole app. It captures full-app
screenshots so a **feature branch** can be compared against a **`main`
reference** — catching hidden regressions (a shared component that changes on
one screen but not another) and helping verify refactors.

**Not** part of the e2e test projects and **never runs in CI**. Baselines are
**gitignored** — you regenerate the reference from `main` yourself. Nothing here
is committed except the scenes, config, and this doc.

## How it works

Standard Playwright `toHaveScreenshot`, with the twist that baselines are
throwaway and come from `main`:

1. **Reference** — serve the app built from `main`, run `visual:ref`. Screenshots
   are written to `visual/__screenshots__/` (gitignored).
2. **Compare** — serve the app built from your branch, run `visual:check`.
   Playwright diffs against the reference and writes an HTML report with
   side-by-side + diff overlays. A changed screen fails the run.

You are responsible for making sure the app is on the right branch (and that the
scene catalog matches the screens you care about) for each step.

## Prerequisites

- App running: `yarn dev:api` + `yarn dev:ui` (repo root) → `:5540` / `:8080`.
- A Redis for DB-dependent scenes. Defaults: browser scene → `:6399`, key-details
  scene → `:8100`. Start via
  `docker compose -f tests/e2e/rte.docker-compose.yml up -d oss-standalone`.
  Override with `SPIKE_REDIS_HOST[2]` / `SPIKE_REDIS_PORT[2]`.

## Usage

```bash
cd tests/e2e-playwright

# 1. On main (git checkout main; restart the app)
yarn visual:ref

# 2. On your branch (git checkout <branch>; restart the app)
yarn visual:check      # green = no visual change; red = regressions

yarn visual:report     # open the HTML report (diffs)
```

## The page checklist

`node visual/scripts/list-pages.mjs` prints every route in the app (parsed
statically from `constants/pages.ts`), grouped by what it takes to reach it —
no setup / connected database / RDI instance / discovery flow. Use it as the
checklist of screens to cover with scenes.

## Adding scenes

The scene catalog is the growing asset. Add a `*.visual.spec.ts` file. Each
scene: seed state (via `ApiHelper`), navigate (via the e2e page objects), reach
the state you want, then `toHaveScreenshot`. Reuse the shared helpers in
[`fixtures.ts`](./fixtures.ts):

- `acceptEula()` — accept consent via API so the modal never blocks nav.
- `newApi()` — an `ApiHelper` against the running app.
- `maskDynamic(page)` — masks the auto-refreshing header/summary regions.

### Determinism notes (learned the hard way)

- Config sets `animations: 'disabled'`, `caret: 'hide'`, fixed viewport.
- The DB overview auto-refreshes (keys/memory, "Calculating…" spinner) and
  flakes any instance screen — mask it (`maskDynamic`) or scope the screenshot
  to a component (`expect(locator).toHaveScreenshot(...)`).
- Seed a **known** data set for anything data-dependent; don't rely on whatever
  keys happen to be in a shared Redis.
- Baselines are OS-specific (font rendering). This is a local tool, so that's
  fine — you regenerate the reference on the same machine you compare on.

## Promoting to CI (later, optional)

If this proves useful as a permanent gate: add a `{platform}` segment to
`snapshotPathTemplate`, generate baselines in CI, commit them, and wire a job
that runs `visual:check`.
