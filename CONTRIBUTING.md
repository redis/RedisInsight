# Contributing

Welcome! This short guide explains how to contribute effectively and pass all required checks.

## Submitting an issue

- If you find a bug, please submit an issue to our GitHub [repository](https://github.com/redis/RedisInsight/issues).
- Before submitting, search the issue tracker to see if your problem already exists. Existing issues may already have workarounds or ongoing fixes.

## Branch Naming Convention

Use lowercase, kebab-case, and a type prefix:

- `feature/<short-title>`
- `bugfix/<short-title>`

**Example**: `bugfix/fix-header-alignment`

_Note: It will trigger some CI, like unit tests and lint checks_

For frontend/backend only, prefix with `fe/` or `be/` to trigger fewer checks:

- `fe/feature/<short-title>`
- `be/bugfix/<short-title>`

**Example**: `be/bugfix/update-databases-api`

_Note: It will trigger only checks related to the back-end_

## Commits

- Keep commits small and focused.
- This makes it easier for reviewers to understand and track changes.
- Use meaningful commit messages (see [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) for inspiration).

## TypeScript Configuration

TypeScript config is split across the repo rather than centralised in a single root `tsconfig.json`. Each area owns its own:

| Path | Purpose |
| - | - |
| `redisinsight/ui/tsconfig.json` | UI build, vite, ESLint for UI files |
| `redisinsight/api/tsconfig.json` | API build, ESLint for API files |
| `redisinsight/desktop/tsconfig.json` | Desktop main/preload paths consumed by webpack's `TsconfigPathsPlugin`; ESLint for desktop files |
| `configs/tsconfig.json` | Loaded by `ts-node` when webpack executes the `.ts` configs in `configs/` (`build:main`, `build:main:stage`) |
| `.storybook/tsconfig.json` | Storybook setup |
| `stories/tsconfig.json` | Storybook stories — extends UI config |
| `tests/playwright/tsconfig.json` | Playwright tests |
| `tests/e2e/tsconfig.json`, `tests/e2e-playwright/tsconfig.json` | Standalone E2E sub-projects |

ESLint's root config uses `parserOptions.project: true`, so each linted file picks up its nearest tsconfig automatically. When you add a new top-level TS area, drop a tsconfig in it.

There is intentionally no root `tsconfig.json`. Running bare `tsc` from the repo root will fail — use `yarn type-check:ui` or pass `--project <path>` explicitly.

## Pull Requests

Use the following procedure to submit a pull request:

1. Fork RedisInsight on GitHub (_[How to fork a repo?](https://docs.github.com/en/github/getting-started-with-github/fork-a-repo)_)

2. Create a branch from `main` (see [Branch Naming](#branch-naming-convention))

```bash
git checkout -b bugfix/<short-title>
```

3. Make the changes and push to your branch (see [Commits](#commits))

```bash
git push bugfix/<short-title>
```

4. Initiate a pull request on GitHub (_[How to create a PR?](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/creating-a-pull-request)_)

Try to provide as much descrtiption behind the context of your changes and how to verify them. Screenshorts and videos are always welcome ^\_^

5. Ensure tests are passing (_[see more](README.md#tests)_).

Done :)

By following these conventions, you help us keep RedisInsight stable, reliable, and easy to maintain. Thank you for contributing!
