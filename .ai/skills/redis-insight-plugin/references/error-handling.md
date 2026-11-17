# Error Handling and Stability

Plugins run inside the Insight iframe. A thrown exception during activation produces a blank panel with no visible cause. Defensive rendering is mandatory.

## Defensive Render Pattern

```ts
const PREFIX = '[MY_PLUGIN]';

export function renderView(props: any) {
  const host = document.getElementById('app');
  if (!host) {
    console.error(PREFIX, '#app missing');
    return;
  }
  try {
    const rows = parseData(props?.data ?? []);
    if (rows.length === 0) {
      host.innerHTML = '<div class="empty">No data to display.</div>';
      return;
    }
    renderTable(host, rows, props);
  } catch (err) {
    console.error(PREFIX, 'render failed', err);
    host.innerHTML = `
      <div class="error">
        <p>Plugin failed to render. See devtools console.</p>
        <pre>${escape(String((err as Error)?.message ?? err))}</pre>
      </div>
    `;
  }
}
```

Rules:

- Always check `#app` exists.
- Always check the data shape before rendering.
- Always wrap render logic in `try/catch`.
- Render an empty state and an error state — never a blank iframe.
- Make empty/error copy match the active visualization mode. Each mode in a multi-visualization plugin should show its own message, not a single generic one.
- Remove unreachable fallback branches after parser state is narrowed. Dead defensive checks hide the true state model.

## React ErrorBoundary

For React-rendered plugins, wrap the root component:

```tsx
class PluginErrorBoundary extends React.Component<{ children: React.ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[PLUGIN]', 'render error', error, info);
  }
  render() {
    if (this.state.error) {
      return <div className="error"><pre>{String(this.state.error.message)}</pre></div>;
    }
    return this.props.children;
  }
}
```

Wrap once at the plugin root, not around every leaf component.

## Logging Prefixes

Prefix every log line with a stable, unique tag:

- `[MY_PLUGIN]`
- `[STREAM_PLUGIN]`
- `[SEARCH_PLUGIN]`

Why:

- Devtools filtering becomes a one-step regex.
- Multiple plugins in the same Insight session can be told apart.
- Customer logs forwarded to support are immediately attributable.

Never use bare `console.log(data)` in shipped plugins.

## State Persistence

Prefer the SDK first, `localStorage` fallback:

```ts
import { getState, setState } from 'redisinsight-plugin-sdk';

async function loadSettings() {
  try {
    return (await getState()) ?? {};
  } catch {
    try {
      return JSON.parse(localStorage.getItem('ri:my-plugin:settings') ?? '{}');
    } catch {
      return {};
    }
  }
}

async function saveSettings(s: object) {
  try { await setState(s); }
  catch { localStorage.setItem('ri:my-plugin:settings', JSON.stringify(s)); }
}
```

Validate persisted state before applying — fields can disappear or change shape between plugin versions.

## Common Issues

| Issue | Likely cause | Fix |
|-------|--------------|-----|
| Blank iframe, no logs | Activation function not exported | Ensure `export default { fn }` and name matches manifest. |
| `process.env is not defined` | Bundler left env refs | Replace at build time; verify `grep -c process.env dist/index.js` is `0`. |
| `require is not defined` | Externalized React | `targets.module.includeNodeModules: true`; rebuild. |
| Visualization renders but is empty | Parser returned empty | Log raw `props.data`; check command modifier flags. |
| Values mapped to wrong field/axis | Response shape assumption wrong | Branch on the actual runtime shape, not the command name. |
| Theme looks wrong | No `theme_DARK` handling | Read `document.body.classList` or `getTheme()` from SDK. |
| Plugin disappears after Insight upgrade | Manifest field changed | Re-read official docs and update `package.json`. |
| Large bundle, slow load | Missing minify, full lodash | Run `npm run minify:js`; switch to scoped imports. |
