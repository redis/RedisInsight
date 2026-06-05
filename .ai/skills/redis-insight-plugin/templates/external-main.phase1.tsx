// Phase 1 — Vanilla wiring. No React, no third-party libraries.
// Goal: prove activation, props, and iframe rendering work end-to-end.
//
// Replace [PLUGIN_NAME] with your plugin's stable log prefix (e.g. [MY_PLUGIN]).

const PREFIX = '[PLUGIN_NAME]';

type ActivationProps = {
  command?: string;
  data?: unknown;
  [key: string]: unknown;
};

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string)
  );
}

export function renderExampleView(props: ActivationProps): void {
  console.log(PREFIX, 'activated', props);

  const root = document.getElementById('app');
  if (!root) {
    console.error(PREFIX, '#app element missing');
    return;
  }

  const command = String(props?.command ?? '');
  const dataJson = JSON.stringify(props?.data ?? null, null, 2);

  root.innerHTML = `
    <section class="ri-plugin-shell">
      <div class="ri-plugin-panel">
        <header class="ri-plugin-header">
          <div>
            <h2 class="ri-plugin-title">Example Plugin</h2>
            <p class="ri-plugin-subtitle">Vanilla wiring proof inside RedisInsight.</p>
          </div>
          <span class="ri-plugin-badge ri-plugin-badge--success">Active</span>
        </header>
        <div class="ri-plugin-content">
          <div class="ri-plugin-row">
            <span class="ri-plugin-meta">Command</span>
            <code class="ri-plugin-command" title="${escapeHtml(command)}">${escapeHtml(command || '(unknown)')}</code>
          </div>
          <pre class="ri-plugin-code">${escapeHtml(dataJson)}</pre>
        </div>
      </div>
    </section>
  `;
}

export default { renderExampleView };
