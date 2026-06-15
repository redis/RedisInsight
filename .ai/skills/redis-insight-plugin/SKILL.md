---
name: redis-insight-plugin
description: Use when creating, modifying, debugging, deploying, or testing Redis Insight Workbench visualization plugins, plugin manifests, package.json visualizations, activationMethod functions, redisinsight-plugin-sdk usage, Parcel/Vite plugin builds, iframe rendering, Redis command parsing, Docker RedisInsight deployment, /api/plugins verification, or Playwright plugin validation.
license: MIT
metadata:
  author: redis
  version: "1.0.0"
---
# Redis Insight Workbench Plugin

Build, deploy, and validate Redis Insight Workbench visualization plugins. Plugins render inside an iframe in Workbench and visualize the result of a Redis command. Trigger this skill for plugin manifests, `package.json` `visualizations`, `activationMethod` functions, `redisinsight-plugin-sdk` usage, Parcel/Vite plugin builds, iframe rendering, Redis command parsing, Docker RedisInsight deployment, `/api/plugins` verification, and Playwright plugin tests.

Use the `redis-ui-components` skill for every visual plugin UI. RedisInsight plugins use the RedisInsight product theme pair: `light` / `dark`, not `light2` / `dark2`.

Official source-of-truth references:

- In-repo canonical docs: [docs/plugins/development.md](../../../docs/plugins/development.md), [docs/plugins/installation.md](../../../docs/plugins/installation.md), [docs/plugins/introduction.md](../../../docs/plugins/introduction.md)
- Upstream: https://github.com/redis/RedisInsight/tree/main/docs/plugins

See [references/official-docs-summary.md](references/official-docs-summary.md) for a condensed summary.

## Repo Code Conventions (internal plugins)

> **You are inside the RedisInsight repo.** An internal plugin lives in the `redisinsight/ui/`
> tree, so its code must follow the same styleguides as the rest of the UI — not ad hoc plugin
> code. These rules are **mandatory** for any plugin code written here and override generic
> external-plugin guidance below where they conflict:
>
> - **[frontend](../frontend/SKILL.md)** — component folder structure
>   (`ComponentName/ComponentName.tsx` + `.styles.ts` + `.types.ts` + `.spec.tsx`), functional
>   components with hooks, **named exports**, barrel files, layout components
>   (`Row` / `Col` / `FlexGroup`) instead of raw `div`, and theme usage.
> - **[redis-ui-components](../redis-ui-components/)** — build all plugin UI from Redis UI
>   components. Import the internal `uiSrc/components/ui` wrappers; **never** import raw
>   `@redis-ui/*`. (This skill is a symlink into the installed `@redis-ui/components` package,
>   so it resolves after `yarn install`; if it is missing, run install — the canonical source is
>   `node_modules/@redis-ui/components/skills/redis-ui-components/`.)
> - **[code-quality](../code-quality/SKILL.md)** — TypeScript everywhere (no `any`), naming
>   (`PascalCase` / `camelCase` / `UPPER_SNAKE_CASE`), import order, no magic numbers, no
>   `!important` in styles, semantic theme colors over CSS variables.
> - **[testing](../testing/SKILL.md)** — Jest + Testing Library, the `renderComponent` helper,
>   `faker` for test data, `waitFor` instead of fixed time waits.
> - **[e2e-testing](../e2e-testing/SKILL.md)** — any Playwright/E2E test follows this skill
>   (tests in `tests/e2e-playwright/`, page objects, fixtures, UI navigation; never `page.goto()`
>   directly, no CSS selectors or fixed waits).
>
> External standalone plugins (below) are bundled in isolation and **cannot** import these
> internals; they emulate the conventions with local code instead.

## First Decision: Plugin Type

Decide before scaffolding anything else.

- **Internal monorepo plugin** — lives inside `redisinsight/ui/src/packages/<plugin-name>/` and ships with Redis Insight itself. Build with **Vite** (shared config). Follow the repo styleguides above. **This is the default for any contribution to this repo** — copy a sibling package such as `geodata` or `redisearch` rather than diverging.
- **External standalone plugin** — installed by a user into `~/.redis-insight/plugins/<name>/`. Build with **Parcel**. Bundle all dependencies. Do not import from `uiSrc/` or any RedisInsight monorepo internal. Use this only for customer/field/demo plugins that ship *outside* this repo.

See [references/internal-vite-plugin.md](references/internal-vite-plugin.md) and [references/external-parcel-plugin.md](references/external-parcel-plugin.md).

## External Plugin Structure

```
<plugin-name>/
  package.json              # manifest + build scripts
  src/
    index.html              # iframe entry, has #app
    main.tsx                # activation functions, default export
    components/
    styles/
      styles.scss
  dist/
    index.js                # built bundle (referenced by manifest "main")
    styles.css              # built styles (referenced by manifest "styles")
```

## Required Manifest

Top-level `package.json` fields:

- `name`
- `version`
- `description`
- `main` — path to built JS (e.g. `./dist/index.js`).
- `styles` — path to built CSS (e.g. `./dist/styles.css`).
- `visualizations` — array of visualization descriptors.

Each visualization descriptor must include:

- `id`
- `name`
- `activationMethod`
- `matchCommands`
- `description`
- `default`

Set `default: false` unless the user explicitly asks for it to be the default visualization.

The `activationMethod` value must **exactly** match an exported function name in the bundle. The plugin entry must export that function via the default export:

```ts
export default { renderMyView };
```

Multiple visualizations:

```ts
export default {
  renderTableView,
  renderChartView,
};
```

See [references/plugin-manifest.md](references/plugin-manifest.md) for full examples and how to strip dev-only fields from the deployed manifest.

## Activation Function Contract

Every activation function must:

1. Get the host element: `const root = document.getElementById('app');`
2. Defensively validate props (`command`, `data`, modules, theme).
3. Wrap render logic in `try/catch` and render an error state on failure.
4. Render an empty state when `data` is missing or empty.
5. Log with a plugin-specific prefix, e.g. `[MY_PLUGIN]`, never bare `console.log`.

See [references/error-handling.md](references/error-handling.md).

## RedisInsight Product UI Contract

Every plugin UI must follow RedisInsight product styling:

- For **internal** plugins, build the UI from the [redis-ui-components](../redis-ui-components/) skill and the `uiSrc/components/ui` wrappers, following the [frontend](../frontend/SKILL.md) styleguide.
- For **external** plugins, mirror the same Redis UI look with local code (you cannot import the internals).
- Use RedisInsight `light` / `dark` product themes.
- For standalone external plugins, emulate the RedisInsight product tokens with local CSS variables; do not import RedisInsight monorepo internals or `@redis-ui/*`.
- Detect iframe theme through `theme_LIGHT` / `theme_DARK` body classes or SDK theme helpers.
- Use compact product components: table, toolbar, segmented states, empty/error/loading panels, badges, and inspector-style details.
- Keep Redis brand red for brand moments only; do not use it as the default plugin CTA, heading, error, or status color.

See [references/redisinsight-product-ui.md](references/redisinsight-product-ui.md) and use [templates/external-styles.scss](templates/external-styles.scss) as the baseline `src/styles/styles.scss`.

## Mandatory Phased Workflow

Build every new plugin in three phases. Do not skip phases — the failure mode in each phase tells you exactly what is wrong.

- **Phase 1 — Vanilla wiring.** No React, no third-party libraries. Render plain DOM that proves activation, props, and iframe rendering work end-to-end.
- **Phase 2 — React rendering.** Add React + ReactDOM. Render a typed component that displays `command`, `status`, and the raw response.
- **Phase 3 — Full feature.** Add the actual visualization library (charting, mapping, grid, etc.) and the real UX.

See [references/iterative-development.md](references/iterative-development.md) and the templates in `templates/`.

## Review Hardening Loop

Before asking for review, run a small adversarial pass against the exact surfaces the plugin touches:

- Manifest matching/defaults: exact command boundaries, no default visualization conflicts, no regex backtracking traps.
- Redis command parsing: token-aware option handling, raw-unit preservation, malformed rows, empty rows, keyword-like key/member names.
- Visualization state: stale closures, safe library bounds/inputs, large result sets, mode-specific empty/error copy.
- Tests: red regression first, then the smallest package/component/parser test set that proves the fix.

See [references/review-hardening.md](references/review-hardening.md).

## Build and Verify

```bash
yarn build
test -f dist/index.js
test -f dist/styles.css                       # if "styles" is declared
grep -c "process.env" dist/index.js           # must be 0 in a Parcel build
```

Confirm each `activationMethod` name appears in the bundle:

```bash
grep -o "renderMyView" dist/index.js | head
```

## Deploy

External plugin → user plugins folder:

```bash
mkdir -p ~/.redis-insight/plugins/<plugin-name>
cp package.json ~/.redis-insight/plugins/<plugin-name>/
cp -R dist ~/.redis-insight/plugins/<plugin-name>/dist
```

Restart Redis Insight, then verify:

```bash
curl -s http://localhost:5540/api/plugins
```

The response must include the plugin `name` and its visualizations. See [references/testing-and-deployment.md](references/testing-and-deployment.md) for Docker workarounds, Playwright smoke tests, and the static-plugin path inside the Docker image.

## Security Rules

- Plugins execute code in the Insight UI process. Only ship code you control or trust.
- Never embed secrets, tokens, or credentials in the bundle.
- No hidden network calls. Document any outbound HTTP and prefer none.
- Default to read-only Redis commands (`HGETALL`, `LRANGE`, `XRANGE`, `INFO`, `FT.SEARCH`). Never run destructive commands (`FLUSHDB`, `DEL`, `UNLINK`, `XTRIM`, `CLUSTER RESET`, `CONFIG SET`) without explicit user request and confirmation.

## DO NOT

- DO NOT skip Phase 1 or Phase 2; each catches a different class of failure.
- DO NOT deploy `index.js` / `styles.css` at the plugin root. They live in `dist/` and the manifest points at `./dist/...`.
- DO NOT set `default: true` on a visualization unless the user asked for it.
- DO NOT include `scripts` or `devDependencies` in the deployed manifest. Strip them before copying.
- DO NOT use Vite for standalone external plugins. Use Parcel.
- DO NOT import from `uiSrc/`, `@redis-ui/*`, or any RedisInsight monorepo internal in a standalone plugin.
- DO NOT externalize React in a standalone plugin bundle. Bundle React and ReactDOM.
- DO NOT style plugin UI with ad hoc inline brand colors. Use RedisInsight product UI variables/classes.
- DO NOT use `light2` / `dark2` for RedisInsight plugins; those are for other Redis product UIs.
- DO NOT skip `/api/plugins` verification after deploying.
- DO NOT ship `process.env.*` references in the bundle. Replace at build time.
- DO NOT assume one Redis response shape — different commands, and even the same command with different flags (e.g. a `WITH...` modifier), return very different structures. See [references/redis-command-parsing.md](references/redis-command-parsing.md).

## Final Checklist

- Plugin type chosen and matches build tool (Parcel = external, Vite = internal).
- `package.json` declares `main`, `styles`, and `visualizations` with required fields.
- Every `activationMethod` matches a default-exported function.
- Phases 1, 2, 3 each rendered successfully before moving on.
- RedisInsight product UI applied via the `redis-ui-components` skill (internal plugins) or emulated locally (external plugins), with `light` / `dark` theme handling.
- Review hardening pass completed for manifest matching, command parsing, visualization state, and scoped tests.
- Bundle verified: `dist/index.js`, `dist/styles.css`, no `process.env`.
- Plugin deployed to `~/.redis-insight/plugins/<name>/` (or via the Docker workaround).
- `curl http://localhost:5540/api/plugins` lists the plugin.
- Workbench runs a matching command and renders the visualization.
- Defensive empty/error states verified.
- Optional Playwright smoke test passes (written per the [e2e-testing](../e2e-testing/SKILL.md) skill).

## Reference Index

| File | Load When |
|------|-----------|
| [official-docs-summary.md](references/official-docs-summary.md) | Need the canonical contract from Redis Insight docs. |
| [redis-insight-plugin-guidelines.md](references/redis-insight-plugin-guidelines.md) | Need the long-form operational reference. |
| [external-parcel-plugin.md](references/external-parcel-plugin.md) | Building a standalone plugin with Parcel. |
| [internal-vite-plugin.md](references/internal-vite-plugin.md) | Building inside the RedisInsight monorepo with Vite. |
| [plugin-manifest.md](references/plugin-manifest.md) | Writing or stripping `package.json` manifests. |
| [iterative-development.md](references/iterative-development.md) | Phase 1/2/3 templates and pipeline. |
| [redisinsight-product-ui.md](references/redisinsight-product-ui.md) | Applying RedisInsight product UI inside plugin iframes. |
| [review-hardening.md](references/review-hardening.md) | Pre-review checklist for matcher, parser, visualization state, and scoped regression tests. |
| [testing-and-deployment.md](references/testing-and-deployment.md) | Deploy paths, Docker workaround, `/api/plugins`, Playwright. |
| [redis-command-parsing.md](references/redis-command-parsing.md) | Parsing raw Redis command responses defensively. |
| [third-party-libraries.md](references/third-party-libraries.md) | Integrating a visualization library, custom `.d.ts`, bundle size. |
| [error-handling.md](references/error-handling.md) | Defensive render, ErrorBoundary, log prefixes. |
