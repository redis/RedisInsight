# Iterative Plugin Development

Build every Redis Insight plugin in three phases. The phases exist because each one isolates a different class of failure. Skipping is how you end up with a blank iframe and no idea why.

## Phase 1 — Vanilla JS Wiring

Goal: prove activation, props, and iframe rendering work. No React, no third-party libraries.

Use the RedisInsight product UI baseline from `templates/external-styles.scss`; Phase 1 can be vanilla DOM without falling back to inline brand colors.

```ts
// src/main.tsx (or main.js)
const PREFIX = '[EXAMPLE_PLUGIN]';

export function renderExampleView(props: any) {
  console.log(PREFIX, 'activated', props);
  const root = document.getElementById('app');
  if (!root) {
    console.error(PREFIX, '#app missing');
    return;
  }
  root.innerHTML = `
    <section class="ri-plugin-shell">
      <div class="ri-plugin-panel">
        <header class="ri-plugin-header">
          <h2 class="ri-plugin-title">Plugin works</h2>
          <span class="ri-plugin-badge ri-plugin-badge--success">Active</span>
        </header>
        <div class="ri-plugin-content">
          <code class="ri-plugin-command">${escape(String(props?.command ?? ''))}</code>
          <pre class="ri-plugin-code">${escape(JSON.stringify(props?.data, null, 2))}</pre>
        </div>
      </div>
    </section>
  `;
}

function escape(s: string) {
  return s.replace(/[&<>]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;' }[c] as string));
}

export default { renderExampleView };
```

Failure modes Phase 1 surfaces:

- `activationMethod` name typo in the manifest.
- Wrong `main` path or missing `dist/index.js`.
- `process.env` references in the bundle.
- Plugin folder not at `~/.redis-insight/plugins/<name>/`.
- Insight not seeing the plugin (`/api/plugins`).

If Phase 1 doesn't render "PLUGIN WORKS" with the command and raw JSON, do not move on.

## Phase 2 — React Rendering

Goal: prove React mounts inside the iframe and displays props.

```tsx
import * as React from 'react';
import { createRoot } from 'react-dom/client';

const PREFIX = '[EXAMPLE_PLUGIN]';

function ExampleApp({ command, data }: { command: string; data: unknown }) {
  return (
    <section className="ri-plugin-shell">
      <div className="ri-plugin-panel">
        <header className="ri-plugin-header">
          <h2 className="ri-plugin-title">Example Plugin</h2>
          <span className="ri-plugin-badge ri-plugin-badge--success">Active</span>
        </header>
        <div className="ri-plugin-content">
          <code className="ri-plugin-command">{command}</code>
          <pre className="ri-plugin-code">{JSON.stringify(data, null, 2)}</pre>
        </div>
      </div>
    </section>
  );
}

export function renderExampleView(props: any) {
  console.log(PREFIX, 'activated', props);
  const host = document.getElementById('app');
  if (!host) return;
  try {
    const root = createRoot(host);
    root.render(<ExampleApp command={String(props?.command ?? '')} data={props?.data} />);
  } catch (err) {
    console.error(PREFIX, 'render failed', err);
    host.innerHTML = '<div class="ri-plugin-error">Plugin failed. See console.</div>';
  }
}

export default { renderExampleView };
```

If you are on React 17, use `ReactDOM.render` instead of `createRoot`. Failure modes Phase 2 surfaces:

- Wrong React/ReactDOM version pairing (React 17 + `createRoot` is the classic).
- Externalized React in the bundle (`require is not defined`).
- Missing `index.html` `#app` host.
- Type errors not caught by the build.

## Phase 3 — Full Feature

Goal: real visualization library, real UX, real error/empty states.

In Phase 3:

- Add the actual visualization library (charting, mapping, grid, etc.). See [third-party-libraries.md](third-party-libraries.md).
- Parse the Redis response defensively. See [redis-command-parsing.md](redis-command-parsing.md).
- Render empty and error states explicitly.
- Persist user settings via SDK or `localStorage`.
- Handle `theme_DARK` / `theme_LIGHT` switches.

Phase 3 failures usually point to:

- Unexpected response shape (use the parser patterns).
- Library asset paths broken by bundling (icons, fonts, or images that resolve via bundler-relative URLs).
- Missing CSS (`styles` field, CSS not bundled).
- Cluster/multi-shard responses you didn't account for.

## CI Pipeline Sketch

```yaml
# .github/workflows/plugin.yml (sketch)
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: yarn install --frozen-lockfile
      - run: yarn build
      - run: bash scripts/verify-plugin.sh
      - uses: actions/upload-artifact@v4
        with:
          name: plugin-bundle
          path: |
            package.json
            dist/
```

Optionally extend with a Playwright job that boots a Redis Insight container, copies the artifact in, and runs a Workbench smoke test written per the repo's [e2e-testing](../../e2e-testing/SKILL.md) skill.
