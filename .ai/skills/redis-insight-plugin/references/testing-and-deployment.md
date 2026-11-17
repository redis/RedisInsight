# Testing and Deployment

How to deploy and verify a Redis Insight plugin, and how to smoke test it with Playwright (following the repo's [e2e-testing](../../e2e-testing/SKILL.md) skill).

## Correct External Deployment Structure

```
~/.redis-insight/plugins/<plugin-name>/
  package.json               # deployed manifest (no scripts, no devDependencies)
  dist/
    index.js
    styles.css
```

That's it. Nothing else is required at deploy time.

## Wrong Structures (Common Mistakes)

```
# WRONG — bundle at plugin root
~/.redis-insight/plugins/<plugin-name>/
  package.json
  index.js                   # should be in dist/
  styles.css                 # should be in dist/
```

```
# WRONG — nested package folder
~/.redis-insight/plugins/<plugin-name>/
  <plugin-name>/             # extra directory
    package.json
    dist/
```

```
# WRONG — manifest still has dev/scripts
{
  "main": "./dist/index.js",
  "scripts": { "build": "..." },        # remove
  "devDependencies": { "parcel": "..." } # remove
}
```

## Deploy Commands

External (host install):

```bash
npm run build
bash templates/verify-plugin.sh
bash templates/deploy-external.sh
```

Inside Docker RedisInsight:

```bash
npm run build
bash templates/verify-plugin.sh
bash templates/deploy-internal-docker.sh
```

## Docker RedisInsight: Static Plugin Path

External plugin deployment to `~/.redis-insight/plugins/<name>/` works for the host install — that is the canonical path and the one to default to.

For Docker, the host plugins folder is not visible inside the container. To install a plugin into a running `redis/redisinsight` container, copy it into the container's static plugins folder:

```
/usr/src/app/redisinsight/api/dist/static/plugins/<plugin-name>/
```

Workflow:

```bash
docker cp dist redisinsight-test:/usr/src/app/redisinsight/api/dist/static/plugins/<plugin-name>/dist
docker cp package.json redisinsight-test:/usr/src/app/redisinsight/api/dist/static/plugins/<plugin-name>/package.json
docker restart redisinsight-test
```

Then verify via `/api/plugins`. The deploy script in `templates/deploy-internal-docker.sh` automates this.

## /api/plugins Verification

After every deploy:

```bash
curl -s http://localhost:5540/api/plugins | jq '.[] | {name, visualizations}'
```

The plugin must appear by `name`, with each declared `visualizations[*].id`. If absent:

- The plugin folder is wrong, or
- The manifest is invalid (missing required field), or
- Insight wasn't restarted (Docker case).

## Browser Console Verification

Open the Workbench iframe in browser devtools:

- Filter logs by your `[<PLUGIN_PREFIX>]` prefix.
- Confirm `activated` log fires when running a matching command.
- Confirm no `process.env` errors, no `require is not defined`, no React mismatch.
- Inspect network calls — there should be none unless your plugin explicitly makes them.

## Playwright Smoke Test Strategy

For any Playwright E2E test, **follow the repo's [e2e-testing](../../e2e-testing/SKILL.md)
skill** — it owns the conventions for this repo (tests live in `tests/e2e-playwright/`, use page
objects, fixtures, and `apiHelper`; never call `page.goto()` directly; no CSS selectors or fixed
waits). Do not hand-roll a standalone spec that bypasses those patterns.

A plugin smoke test should cover the same flow, expressed through those conventions:

1. Create/seed the database via `apiHelper` in `beforeAll`.
2. Navigate to Workbench through a page object's `goto()` method (UI navigation, not `page.goto()`).
3. Run a command that matches the plugin's `matchCommands`.
4. Select the plugin's visualization tab.
5. Assert the iframe is present and renders expected content.

Use Playwright MCP to discover the actual `data-testid`/roles first, as the e2e-testing skill
describes. The one plugin-specific check that does not need the UI is registration —
`curl /api/plugins` (or `page.request.get('/api/plugins')`) must list the plugin.

## Internal PR Verification Scope

For RedisInsight monorepo plugin changes, keep verification proportional to the changed surface:

- Parser or command-shape fix: run the parser spec or package test file first, then the plugin package test command.
- Manifest or matcher fix: run the matcher/plugin utility spec that exercises `matchCommands`, `matchQuery`, `anyRegex`, `noneRegex`, and `default` selection.
- React / visualization-library fix: run the component spec for that visualization plus the package typecheck.
- Code hygiene fix: run the closest affected spec plus typecheck, especially when moving types/constants or centralizing helpers.
- Shared utility change under `ui/src/`: add the focused utility spec and a changed-file lint/typecheck check.
- Before final commit on a PR batch, run the package tests, package typecheck, and `git diff --check`. Run a full RedisInsight build only when build configuration, package exports, bundling, or shared application wiring changed.
