/**
 * Stands in for @sentry/server-utils' orchestrion `register` module in the
 * Electron main bundle.
 *
 * That module calls `createRequire(import.meta.url)`. The main bundle is
 * CommonJS (`output.library.type: 'umd'`), where `import.meta` is a
 * SyntaxError, so evaluating it kills the main process before any window
 * opens. Diagnostics-channel injection hooks Node's own module loader and
 * cannot work on bundled code in any case, so a no-op is the honest shape.
 *
 * Keep the export name in sync with the real module: the
 * `orchestrion/index.js` barrel re-exports it by name.
 *
 * This file has to stay plain JavaScript. `NormalModuleReplacementPlugin`
 * swaps the resource only after webpack has picked loaders for the module it
 * replaces, and that module sits in `node_modules`, so it gets none. Any
 * TypeScript syntax here reaches the JS parser and fails to build.
 */
export function registerDiagnosticsChannelInjection() {}
