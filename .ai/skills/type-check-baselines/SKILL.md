---
name: type-check-baselines
description: >-
  Run, refresh, or recover from RedisInsight's per-project TypeScript error
  baselines (.tscheck.rec.json). Use when CI reports "baseline is outdated" or
  "more TS errors than previously recorded", when the user mentions tscheck /
  type-check / .tscheck.rec.json, when introducing or fixing TS errors, or when
  reviewing PRs that touch baseline files.
---

# TS error baselines

RedisInsight gates TypeScript errors per project via a one-way ratchet: current error counts are recorded in `.tscheck.rec.json` files, and CI fails if any (file × error-code) count increases. Counts can only go down.

## Projects and commands

| Project | tsconfig used | Baseline file | Per-project compare |
| - | - | - | - |
| UI | `redisinsight/ui/tsconfig.json` | `redisinsight/ui/.tscheck.rec.json` | `npm run type-check --prefix redisinsight/ui` |
| API | `redisinsight/api/tsconfig.check.json` (strict, extends base) | `redisinsight/api/.tscheck.rec.json` | `npm run type-check --prefix redisinsight/api` |
| Desktop | `redisinsight/desktop/tsconfig.json` | `redisinsight/desktop/.tscheck.rec.json` | `npm run type-check --prefix redisinsight/desktop` |
| Configs | `configs/tsconfig.json` | — (must stay at 0 errors) | `npx tsc --project configs/tsconfig.json --noEmit` |

Run all checks together from the repo root:

- `npm run type-check` — compare against baselines (all four projects). E2E Playwright is type-checked by a separate workflow (`tests-e2e-playwright-lint.yml`) — not part of this.
- `npm run tscheck` — refresh baselines for ui/api/desktop after fixing errors. Projects whose error count didn't change produce no diff.
- `npm run tscheck:force` — force-overwrite baselines for ui/api/desktop. Emergencies only.

**Always run refresh commands through the root `npm run tscheck` / `npm run tscheck:force` wrappers.** The per-workspace refresh scripts (`npm run tscheck --prefix redisinsight/<ws>`) shell out to `tsc`, `tsx`, and `tsc-output-parser`, which are installed only in the **root** `node_modules/.bin/` — this repo is not an npm workspace, so `npm run --prefix` only exposes the sub-dir's bin, not the root's. The root wrappers exist precisely to avoid that trap by running in the root context first. If you must invoke the per-package script directly, prepend the root bin dir manually: `PATH="$PWD/node_modules/.bin:$PATH" npm run tscheck --prefix redisinsight/ui`.

## API has a dedicated check tsconfig

`redisinsight/api/tsconfig.check.json` extends the base `tsconfig.json` and adds:

```json
"strict": true,
"strictPropertyInitialization": false,
"useUnknownInCatchVariables": false,
"noEmit": true
```

The base `tsconfig.json` stays as-is so `nest build` is unaffected. **Never enable `strict` in the base** — it breaks the production build.

## Workflows

### CI says "more TS errors than previously recorded"

You introduced new errors. Fix them. Read the script output — it lists the file, error code (TSxxxx), and message for each new error. Do **not** run `tscheck:force` in any workspace to paper over them.

### CI says "baseline is outdated"

You fixed errors (good). Refresh baselines from the repo root:

```sh
npm run tscheck
```

This runs the refresh for ui, api, and desktop; only the project whose count changed will produce a diff. Commit the updated `.tscheck.rec.json`.

### Adding a brand-new file with TS errors

Same rule: the file × error-code counts went from 0 to N — that's "new errors". Fix them before merging. Strict-mode escape hatches (`as any`, `// @ts-expect-error` with justification) are acceptable when fixing legitimately is out of scope, but prefer real fixes.

### Bootstrapping a fresh baseline

Only needed once per project (already done for ui/api/desktop). The non-force `npm run tscheck --prefix redisinsight/<workspace>` calls `compare` first, which fails against an empty baseline. Use `npm run tscheck:force --prefix redisinsight/<workspace>` for the very first baseline only.

### After `npm install` in `redisinsight/api/`

The api postinstall regenerates `redisinsight/api-client/`. That can shift UI and Desktop error counts (they both import from `apiClient`). If `npm run type-check:ui` or `npm run type-check:desktop` reports drift after an api install, refresh those baselines.

### Local UI check disagrees with CI

UI plugins under `redisinsight/ui/src/packages/{redisearch, redisgraph, redistimeseries-app, ri-explain, clients-list}` are sub-projects whose source gets type-checked via the UI tsconfig. Their deps live in nested `node_modules` populated by `npm run build:statics` (or by running `npm install --prefix redisinsight/ui/src/packages/<plugin>`). CI runs `npm run build:statics` before `npm run type-check:ui`, so the baseline reflects "plugin deps installed."

If `npm run type-check:ui` shows TS7016 ("Could not find a declaration file for module ...") errors that CI doesn't, you're missing plugin deps. Run `npm run build:statics` once, then re-run the check. Don't refresh the baseline to your local state — CI runs with plugin deps installed.

### Local Desktop check disagrees with CI

Desktop type-check needs `redisinsight/api/dist/` populated with the **dev** nest build (`npm run build --prefix redisinsight/api`, not `build:prod` — prod skips `.d.ts` emission). CI does this automatically. Locally, build api once before generating or refreshing the desktop baseline.

## Reviewing PRs

Reject PRs that:

- Bump a `.tscheck.rec.json` file × code count **up** without a corresponding code fix.
- Use `tscheck:force` in any workspace (look for the diff: a force overwrite typically touches many lines in the rec file with no related TS changes).
- Enable `strict` in `redisinsight/api/tsconfig.json` (the base). Strict for api belongs only in `tsconfig.check.json`.

Approve PRs that:

- Leave counts unchanged.
- Decrease counts (with the rec file updated and committed).
