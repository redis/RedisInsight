# Plugin Manifest (`package.json`)

The plugin manifest is `package.json` at the plugin root.

## Single Visualization

```json
{
  "name": "ri-plugin-xrange-table",
  "version": "0.0.1",
  "description": "Render XRANGE results as a sortable table.",
  "main": "./dist/index.js",
  "styles": "./dist/styles.css",
  "visualizations": [
    {
      "id": "xrange-table",
      "name": "Stream Entries",
      "activationMethod": "renderXRangeTable",
      "matchCommands": ["XRANGE", "XREVRANGE"],
      "description": "Tabular view of stream entries.",
      "default": false
    }
  ]
}
```

## Multiple Visualizations

```json
{
  "name": "ri-plugin-stream-views",
  "version": "0.0.1",
  "description": "Table and chart visualizations for Redis stream entries.",
  "main": "./dist/index.js",
  "styles": "./dist/styles.css",
  "visualizations": [
    {
      "id": "stream-table",
      "name": "Table",
      "activationMethod": "renderTableView",
      "matchCommands": ["XRANGE", "XREVRANGE"],
      "description": "Tabular view of stream entries.",
      "default": false
    },
    {
      "id": "stream-chart",
      "name": "Chart",
      "activationMethod": "renderChartView",
      "matchCommands": ["XRANGE", "XREVRANGE"],
      "description": "Chart numeric fields over the stream's time range.",
      "default": false
    }
  ]
}
```

The plugin's main bundle exports both functions:

```ts
export default {
  renderTableView,
  renderChartView,
};
```

## Matching and Defaults

When several visualizations share commands, make their defaults mutually exclusive by command shape, not just by command name. For example, one visualization can be the default when the result has a particular shape (numeric series, coordinates, nested rows, …), while another is available for the same commands but defaults only for a different shape (scalar, store-style, or empty results).

Rules for matcher definitions:

- Match whole command tokens. Do not let a command match a longer command with the same prefix (e.g. a `*STORE` or `*_RO` variant).
- Keep `matchCommands` broad only when `matchQuery` narrows the result shape safely.
- Use `noneRegex` for exclusion only after checking how the platform normalizes command text.
- Keep regexes bounded and linear. Avoid broad repeated token alternatives plus a trailing `[\s\S]{0,N}` window.
- Test overlapping visualizations so only one `default: true` candidate remains for each command shape.

## Icons

Optional but supported:

```json
{
  "iconDark": "./dist/icon-dark.svg",
  "iconLight": "./dist/icon-light.svg"
}
```

Place icons under `dist/` (or another path your manifest points at) and copy them as part of deployment.

## Stripping Dev-Only Fields

The deployed manifest must **not** include:

- `scripts`
- `devDependencies`
- `targets` (Parcel-only build hints)
- `husky`, `lint-staged`, `eslintConfig`, `prettier`, etc.

Either keep a separate `package.deploy.json` or strip with `jq`:

```bash
jq 'del(.scripts, .devDependencies, .targets, .husky, .["lint-staged"])' \
  package.json > /tmp/package.deploy.json
```

`templates/deploy-external.sh` does this automatically.

## Required Fields Recap

- `name` — globally unique within `~/.redis-insight/plugins/`.
- `version` — semver.
- `description` — one sentence shown in Insight.
- `main` — built JS bundle path.
- `styles` — built CSS path (omit only if no styles).
- `visualizations[]` — at least one, each with `id`, `name`, `activationMethod`, `matchCommands`, `description`, `default`.

If any required field is missing, Insight silently drops the plugin. Always run `curl /api/plugins` after deploying.
