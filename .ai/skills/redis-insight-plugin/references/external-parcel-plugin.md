# External Parcel Plugin

Build a standalone Redis Insight plugin with Parcel.

## Folder Layout

```
<plugin-name>/
  package.json
  src/
    index.html
    main.tsx
    components/
    styles/
      styles.scss
  dist/                     # build output, gitignored except when deploying
    index.js
    styles.css
  scripts/
    verify-plugin.sh
    deploy-external.sh
```

## Build Tool: Parcel

Why Parcel:

- Zero-config TS/SCSS/asset handling.
- Simple `targets` model maps cleanly to "single bundled JS + CSS".
- `targets.module.includeNodeModules: true` bundles every dep, which is what an external plugin needs.

Why **not** Vite for external plugins:

- Vite assumes ESM consumers and multi-file output. Insight expects a single `dist/index.js`.
- Vite's externalization defaults can leave React unbundled — fatal for an iframe with no shared deps.

## Package Scripts

Recommended scripts (see [../templates/external-parcel-package.json](../templates/external-parcel-package.json)):

```json
"scripts": {
  "start":   "parcel src/index.html",
  "build":   "concurrently \"yarn build:js\" \"yarn build:css\"",
  "build:js":"parcel build src/main.tsx --no-source-maps --dist-dir dist --target module",
  "build:css":"parcel build src/styles/styles.scss --no-source-maps --dist-dir dist",
  "minify:js":"terser dist/index.js -o dist/index.js -c -m",
  "clean":   "rimraf dist",
  "verify":  "bash scripts/verify-plugin.sh",
  "deploy:external":"bash scripts/deploy-external.sh",
  "deploy:internal":"bash scripts/deploy-internal-docker.sh"
}
```

## Targets

```json
"targets": {
  "main": false,
  "module": {
    "includeNodeModules": true,
    "outputFormat": "esmodule",
    "isLibrary": false
  }
}
```

- `main: false` disables Parcel's CommonJS output.
- `includeNodeModules: true` inlines every dependency.
- Do **not** add `"engines": { "browsers": "..." }` so narrow that React or your visualization library break — Insight bundles a modern Chromium.

## Bundling Rules

- Bundle React, ReactDOM, and every other runtime dependency (including the visualization library).
- No `peerDependencies`. Insight does not provide shared deps to plugins.
- No imports from `uiSrc/`, `@redis-ui/*`, or any RedisInsight monorepo package.
- No `process.env.*` references in the bundle. Replace with constants at build time. Verify with:

  ```bash
  grep -c "process.env" dist/index.js   # must be 0
  ```

- Minify before deploying customer-facing plugins; skip in dev for readable stack traces.

## Source vs Deployed Manifest

The source `package.json` includes `scripts`, `devDependencies`, `targets`, etc. The deployed manifest must include only:

- `name`, `version`, `description`
- `main`, `styles`
- `visualizations`
- runtime `dependencies` (optional, informational)

Strip the rest before copying into `~/.redis-insight/plugins/<name>/`. The deploy script in `templates/deploy-external.sh` does this for you (or use `jq` to filter).

## Outputs

After `yarn build`:

- `dist/index.js` — single bundled module.
- `dist/styles.css` — single stylesheet.

If your plugin has no styles, you can omit the `styles` manifest field and the SCSS source — but most plugins need styles.

For RedisInsight product UI fidelity, copy `templates/external-styles.scss` to `src/styles/styles.scss`. Keep plugin styles scoped under `.ri-plugin-*` classes and use `theme_LIGHT` / `theme_DARK` body classes for light/dark mode.

## Verification

```bash
yarn build
yarn verify     # runs templates/verify-plugin.sh
```

`verify` should report:

- `package.json` present and parseable.
- `dist/index.js` present and non-empty.
- `dist/styles.css` present (if `styles` is declared).
- Zero `process.env` references in the bundle.
- Each declared `activationMethod` name appears in the bundle.
- Bundle size under your project's threshold.
