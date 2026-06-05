# Third-Party Libraries

Notes on integrating a visualization library (charting, mapping, grid, diagram, etc.) inside a
Redis Insight plugin iframe. The principles are library-agnostic; apply them to whatever library
the plugin needs.

## General Integration Rules

- **Bundle the library fully** in an external (Parcel) plugin — do not externalize it. Internal
  (Vite) plugins follow the shared build's dependency handling instead.
- **Add the library's CSS to the bundle** (`dist/styles.css`); do not rely on a global `@import`
  or a CDN. RedisInsight injects the bundled stylesheet into the plugin iframe.
- **Initialize once, clean up on re-render.** Libraries that own a canvas, map, or grid instance
  must be destroyed/disposed before re-creating, or they leak:

  ```ts
  instanceRef.current?.destroy();
  instanceRef.current = createInstance(container, config);
  ```

- **Size the container explicitly.** Many libraries measure their parent on init; put the
  render target in a sized flex/grid container so it lays out correctly inside the iframe.
- **Validate inputs before handing them to the library.** Never assume parsed Redis data is
  well-formed — guard for empty/NaN/out-of-range values, and check any library precondition
  (valid bounds, non-empty series, etc.) before calling its render APIs.
- **Avoid stale closures in library callbacks.** If a callback (cell renderer, tooltip builder,
  icon factory) depends on React state, keep the live value in a ref or recreate the instance
  when the dependency changes — captured state goes stale otherwise.
- **Never interpolate Redis data into raw HTML.** Build tooltip/popup/cell DOM with
  `textContent` or escaped React output so keys, members, and field values cannot inject markup.

## Untyped Libraries: Custom `.d.ts`

Some libraries (or their sub-plugins) ship without types. Add a local declaration instead of
using `any`:

```ts
// src/types/<lib-name>.d.ts
declare module '<lib-name>' {
  export interface Options {
    /* the options the plugin actually uses */
  }
  export function createThing(target: HTMLElement, options?: Options): unknown;
}
```

Keep the declaration minimal — only the surface the plugin uses.

## Bundle Size Guidance

- Aim for `dist/index.js` under ~1.5 MB minified for a snappy first render.
- Use the bundler's analyzer (or `terser`'s reports) to find heavy dependencies.
- Avoid `moment`; use `date-fns` or native `Intl.DateTimeFormat`.
- Avoid full `lodash`; use targeted imports (`lodash/get`) or stdlib.
- Tree-shaking only helps when imports are scoped (`import { sum } from 'lodash-es'`).
- Cap row/point counts (paginate or virtualize) for large command results rather than handing
  the whole set to the library at once.

## Forbidden Imports

- No `uiSrc/`, `@redis-ui/*`, or any RedisInsight monorepo internal in standalone plugins.
- No Node-only modules (`fs`, `path`, `child_process`).
- No CommonJS-only deps that fail in Parcel's `module` target without shims.
