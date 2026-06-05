# Redis Insight Plugin Docs — Summary

Condensed from the official Redis Insight plugin docs:

- https://github.com/redis/RedisInsight/tree/main/docs/plugins
- https://github.com/redis/RedisInsight/blob/main/docs/plugins/development.md
- https://github.com/redis/RedisInsight/blob/main/docs/plugins/installation.md

Always re-read the upstream docs when in doubt — the contract may evolve.

## Where Plugins Run

- Workbench renders a plugin inside an **iframe**.
- The iframe loads the plugin's `index.html` (or equivalent), which loads the bundle declared in the manifest's `main`.
- The iframe DOM has a `<div id="app"></div>` host element. Activation functions render into `#app`.
- Stylesheets declared by `styles` are injected into the iframe.

## Manifest (`package.json`)

A plugin's root `package.json` is the manifest. Required fields:

- `name`, `version`, `description`
- `main` — relative path to the built JS bundle (e.g. `./dist/index.js`).
- `styles` — relative path to the built CSS (e.g. `./dist/styles.css`).
- `visualizations[]` — list of visualization descriptors:
  - `id` — stable identifier inside the plugin.
  - `name` — visible label in the Workbench result tabs.
  - `activationMethod` — exact name of the exported function called to render this view.
  - `matchCommands` — array of Redis command names this visualization supports (e.g. `["XRANGE", "XREVRANGE"]`).
  - `description` — short summary shown in the UI.
  - `default` — `true` if this should be the default tab; otherwise `false`.

## Activation Function

The plugin's main script exports an object whose keys are activation function names:

```ts
export default { renderMyView };
```

Each activation function is invoked by the Workbench host and receives a props object containing:

- The Redis `command` that was executed.
- The data **result array** (raw Redis reply).
- Helpers via `redisinsight-plugin-sdk` (config, modules, theme, base URL, app version).

The `<body>` of the iframe carries a `theme_DARK` or `theme_LIGHT` class, and `window.state` exposes plugin-relevant config such as connected modules, base URL, and app version.

## Installation Paths

User-installed plugins live under:

- macOS / Linux: `~/.redis-insight/plugins/`
- Windows: `C:\Users\{Username}\.redis-insight\plugins\`

Each plugin lives in its own subdirectory (folder name should match `name`).

## Trust Warning

Plugins execute arbitrary code inside Redis Insight. **Only install plugins from trusted sources.** Treat plugin code review with the same care you would use for any code that runs in your dev environment.

## What This Skill Adds

The official docs describe the contract. This skill adds operational practice:

- Phased Phase 1/2/3 development to surface failure modes early.
- Parcel for external plugins, Vite for internal monorepo plugins.
- Defensive command parsing across different commands and flag-dependent response shapes.
- `curl /api/plugins` and Playwright smoke validation after every deploy.
- Docker static-plugin workaround for `redis/redisinsight` images.
