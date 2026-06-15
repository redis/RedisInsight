// Phase 2 — React rendering inside the Insight iframe.
// Goal: prove React mounts and displays props.
//
// Replace [PLUGIN_NAME] with your plugin's stable log prefix.
// React 17 uses ReactDOM.render; React 18+ uses createRoot. This template uses React 17 to match templates/external-parcel-package.json.

import * as React from 'react';
import * as ReactDOM from 'react-dom';

const PREFIX = '[PLUGIN_NAME]';

export type RedisInsightProps = {
  command?: string;
  data?: unknown;
  [key: string]: unknown;
};

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error(PREFIX, 'render error', error, info);
  }
  render() {
    if (this.state.error) {
      return (
        <div className="ri-plugin-error">
          <p>Plugin failed to render. See console.</p>
          <pre>{String(this.state.error.message)}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

function ExampleApp({ command, data }: { command: string; data: unknown }) {
  return (
    <section className="ri-plugin-shell">
      <div className="ri-plugin-panel">
        <header className="ri-plugin-header">
          <div>
            <h2 className="ri-plugin-title">Example Plugin</h2>
            <p className="ri-plugin-subtitle">React render proof inside RedisInsight.</p>
          </div>
          <span className="ri-plugin-badge ri-plugin-badge--success">Active</span>
        </header>
        <div className="ri-plugin-content">
          <div className="ri-plugin-row">
            <span className="ri-plugin-meta">Command</span>
            <code className="ri-plugin-command" title={command}>{command || '(unknown)'}</code>
          </div>
          <pre className="ri-plugin-code">{JSON.stringify(data ?? null, null, 2)}</pre>
        </div>
      </div>
    </section>
  );
}

export function renderExampleView(props: RedisInsightProps): void {
  console.log(PREFIX, 'activated', props);

  const host = document.getElementById('app');
  if (!host) {
    console.error(PREFIX, '#app element missing');
    return;
  }

  try {
    ReactDOM.render(
      <ErrorBoundary>
        <ExampleApp command={String(props?.command ?? '')} data={props?.data} />
      </ErrorBoundary>,
      host
    );
  } catch (err) {
    console.error(PREFIX, 'render failed', err);
    host.innerHTML =
      '<div class="ri-plugin-error">Plugin failed. See console.</div>';
  }
}

export default { renderExampleView };
