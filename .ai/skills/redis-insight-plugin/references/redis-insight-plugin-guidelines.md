# Redis Insight Plugin — Operational Guidelines

Long-form operational reference. SKILL.md is the entry point; this file is for anything that doesn't fit there.

## Plugin Types Overview

Two plugin shapes, two build tools, two deployment models.

- **External standalone plugin** — bundles everything with **Parcel**. Ships as a folder you drop into `~/.redis-insight/plugins/<name>/`. No knowledge of the RedisInsight monorepo. Default for customer demos and field plugins.
- **Internal monorepo plugin** — lives at `RedisInsight/redisinsight/ui/src/packages/<plugin-name>/`. Built with **Vite** as part of the RedisInsight repo. Ships embedded in Insight builds.

If you are unsure, build external. External works in every Redis Insight install; internal only ships with the Insight binary you build.

## Official References

- https://github.com/redis/RedisInsight/tree/main/docs/plugins
- https://github.com/redis/RedisInsight/blob/main/docs/plugins/development.md
- https://github.com/redis/RedisInsight/blob/main/docs/plugins/installation.md

## Internal Plugin Development with Vite

- Path: `RedisInsight/redisinsight/ui/src/packages/<plugin-name>/`.
- Use Vite, not Parcel. Inherit RedisInsight's shared TS, theme, and component conventions.
- Internal plugins **may** import from `uiSrc/` and shared components, but only when the import has a stable contract — internal layout helpers move often.
- Avoid hard dependencies on `ThemeProvider` or other Insight-only providers in plugin code that might be reused externally later.

## External Plugin Development with Parcel

- Path: anywhere; deployed to `~/.redis-insight/plugins/<plugin-name>/`.
- Bundle every dependency. Do not externalize React or any runtime library.
- `targets.module.includeNodeModules: true` so Parcel inlines deps.
- No imports from `uiSrc/`, `@redis-ui/*`, or any RedisInsight internal package.
- Output to `dist/index.js` and `dist/styles.css`.

## Package.json Requirements

See [plugin-manifest.md](plugin-manifest.md) for full examples. Minimum:

```json
{
  "name": "ri-plugin-example",
  "version": "0.0.1",
  "description": "...",
  "main": "./dist/index.js",
  "styles": "./dist/styles.css",
  "visualizations": [
    {
      "id": "example-view",
      "name": "Example View",
      "activationMethod": "renderExampleView",
      "matchCommands": ["XRANGE"],
      "description": "Shows XRANGE results.",
      "default": false
    }
  ]
}
```

## Plugin Entry Point

```ts
function renderExampleView(props) {
  const root = document.getElementById('app');
  if (!root) {
    console.error('[EXAMPLE_PLUGIN] #app element missing');
    return;
  }
  try {
    // Render here. Show empty state when data is empty.
  } catch (err) {
    console.error('[EXAMPLE_PLUGIN] render failed', err);
    root.innerHTML = '<div class="ri-plugin-error">Plugin failed. See console.</div>';
  }
}

export default { renderExampleView };
```

## Testing & Verification

- `npm run build` produces `dist/index.js` and `dist/styles.css`.
- `templates/verify-plugin.sh` confirms file presence, no `process.env`, and that activation method names appear in the bundle.
- Deploy with `templates/deploy-external.sh` (folder install) or `templates/deploy-internal-docker.sh` (Docker container).
- After deploy, `curl http://localhost:5540/api/plugins` and grep for the plugin name.
- Optional: add a Workbench smoke test following the repo's [e2e-testing](../../e2e-testing/SKILL.md) skill (page objects, fixtures, UI navigation) to validate iframe rendering.

## Iterative Plugin Development

See [iterative-development.md](iterative-development.md). Always run Phase 1, then Phase 2, then Phase 3.

## DO NOT Rules

Reproduced from SKILL.md for convenience:

- DO NOT skip Phase 1 or Phase 2.
- DO NOT deploy `index.js`/`styles.css` at the plugin root — they live in `dist/`.
- DO NOT set `default: true` by default.
- DO NOT include `scripts` or `devDependencies` in the deployed manifest.
- DO NOT use Vite for standalone plugins.
- DO NOT import `uiSrc` in standalone plugins.
- DO NOT externalize React in standalone bundles.
- DO NOT skip `/api/plugins` verification.
- DO NOT ship `process.env.*` references.
- DO NOT assume one Redis response shape.

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| Plugin missing from `/api/plugins` | Manifest not deployed, or wrong folder | Check folder is at `~/.redis-insight/plugins/<name>/` and contains `package.json` + `dist/`. |
| Iframe blank | `activationMethod` name mismatch | Confirm exported function name == manifest field. |
| `process.env is not defined` | `process.env.*` left in bundle | Replace at build time; rebuild; verify with `grep -c process.env dist/index.js`. |
| `require is not defined` | Externalized React or wrong target | Use Parcel `targets.module` with `includeNodeModules: true`. |
| Styles not applied | `styles` field missing or wrong path | Add `"styles": "./dist/styles.css"`; confirm file exists. |
| Console error: `#app is null` | Activation ran before DOM | Ensure script is loaded as a module and renders into `document.getElementById('app')`. |
| Visualization tab missing | `matchCommands` mismatch | Confirm command name (uppercase) appears in `matchCommands`. |

## Lessons Learned

- Phase 1 catches `activationMethod` name/manifest mismatches before any React is wired.
- Phase 2 surfaces React/ReactDOM version and `createRoot` mismatches early.
- Phase 3 exposes library asset-path bugs (icons/fonts/images broken by bundler-relative URLs) — fix once at init.
- A command with extra-data flags often returns nested arrays, not objects — guard against shape changes.
- Always `curl /api/plugins` after deploy. Cached menus lie.

## Plugin API Reference

Activation function props (subject to upstream changes — re-check official docs):

- `command: string` — the executed Redis command.
- `data: any[]` — the raw Redis result array.
- `redisInsightPlugin` (via SDK) — `getState`, `setState`, `getModules`, `getTheme`, `getBaseUrl`, `getAppVersion`.

Use `redisinsight-plugin-sdk` for state and theme rather than reading `window.state` directly when possible.

## Command Parsing Patterns

See [redis-command-parsing.md](redis-command-parsing.md).

## Third-Party Library Integration

See [third-party-libraries.md](third-party-libraries.md).

## Interactive UI Patterns

- Keep heavy UI inside the iframe; do not assume access to the host page.
- Apply the [redis-ui-components](../../redis-ui-components/) skill with RedisInsight `light` / `dark` themes for visual plugin work (internal plugins use the `uiSrc/components/ui` wrappers per the [frontend](../../frontend/SKILL.md) styleguide).
- Standalone plugins emulate product tokens locally with `src/styles/styles.scss`; copy `templates/external-styles.scss` as the baseline.
- Use `document.body.classList.contains('theme_DARK')` to switch palettes.
- Persist user settings via SDK state, falling back to `localStorage` keyed under your plugin id.
- Avoid global CSS resets that fight Insight's iframe styles.

## State Persistence

- Prefer `redisinsight-plugin-sdk` `getState` / `setState` for cross-session persistence.
- Fall back to `localStorage` with a plugin-prefixed key (`ri:<plugin-name>:settings`) when SDK state is unavailable.
- Treat persisted state as untrusted; validate before use.

## Error Handling & Stability

See [error-handling.md](error-handling.md).

## Debugging & Development Tips

- Open the Workbench iframe in browser devtools to inspect logs and network calls.
- Look for `[<PLUGIN_PREFIX>]` log lines to filter your output.
- Use the Phase 1 vanilla bundle to A/B test whether failures are plugin-host or library-related.
- For Docker installs, `docker exec` into the container and inspect `/usr/src/app/redisinsight/api/dist/static/plugins/<name>/`.
