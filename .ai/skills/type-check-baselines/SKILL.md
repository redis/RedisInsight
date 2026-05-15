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

| Project | tsconfig used | Baseline file | Compare | Refresh |
| - | - | - | - | - |
| UI | `redisinsight/ui/tsconfig.json` | `redisinsight/ui/.tscheck.rec.json` | `yarn type-check:ui` | `yarn tscheck:ui` |
| API | `redisinsight/api/tsconfig.check.json` (strict, extends base) | `redisinsight/api/.tscheck.rec.json` | `yarn type-check:api` | `yarn tscheck:api` |
| Desktop | `redisinsight/desktop/tsconfig.json` | `redisinsight/desktop/.tscheck.rec.json` | `yarn type-check:desktop` | `yarn tscheck:desktop` |
| Configs | `configs/tsconfig.json` | — (must stay at 0 errors) | `yarn type-check:configs` | — |

`yarn type-check` runs all four. E2E Playwright is type-checked by a separate workflow (`tests-e2e-playwright-lint.yml`) — not part of `yarn type-check`.

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

You introduced new errors. Fix them. Read the script output — it lists the file, error code (TSxxxx), and message for each new error. Do **not** run `yarn tscheck:*:force` to paper over them.

### CI says "baseline is outdated"

You fixed errors (good). Refresh the baseline:

```sh
yarn tscheck:ui       # or :api / :desktop
```

Commit the updated `.tscheck.rec.json`.

### Adding a brand-new file with TS errors

Same rule: the file × error-code counts went from 0 to N — that's "new errors". Fix them before merging. Strict-mode escape hatches (`as any`, `// @ts-expect-error` with justification) are acceptable when fixing legitimately is out of scope, but prefer real fixes.

### Bootstrapping a fresh baseline

Only needed once per project (already done for ui/api/desktop). The non-force `yarn tscheck:*` calls `compare` first, which fails against an empty baseline. Use `yarn tscheck:*:force` for the very first baseline only.

### After `yarn install` in `redisinsight/api/`

The api postinstall regenerates `redisinsight/api-client/`. That can shift UI and Desktop error counts (they both import from `apiClient`). If `yarn type-check:ui` or `yarn type-check:desktop` reports drift after an api install, refresh those baselines.

## Reviewing PRs

Reject PRs that:

- Bump a `.tscheck.rec.json` file × code count **up** without a corresponding code fix.
- Use `tscheck:*:force` (look for the diff: a force overwrite typically touches many lines in the rec file with no related TS changes).
- Enable `strict` in `redisinsight/api/tsconfig.json` (the base). Strict for api belongs only in `tsconfig.check.json`.

Approve PRs that:

- Leave counts unchanged.
- Decrease counts (with the rec file updated and committed).
