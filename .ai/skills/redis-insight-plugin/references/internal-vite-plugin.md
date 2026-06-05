# Internal Vite Plugin

Build a Redis Insight plugin **inside** the RedisInsight monorepo. **This is the default for
any contribution to this repo.** If you are not working inside the RedisInsight repo, use
[external-parcel-plugin.md](external-parcel-plugin.md) instead.

> **Start by copying a sibling.** Do not scaffold from scratch — copy an existing package such
> as `geodata` or `redisearch` from `redisinsight/ui/src/packages/` and adapt it. Match the
> surrounding conventions exactly rather than diverging.

## Follow the repo styleguides

Internal plugin code lives in the `redisinsight/ui/` tree, so it must follow the same
styleguides as the rest of the UI (these are mandatory, not optional):

- **[frontend](../../frontend/SKILL.md)** — component folder structure
  (`ComponentName/ComponentName.tsx` + `.styles.ts` + `.types.ts` + `.spec.tsx`), functional
  components with hooks, **named exports**, barrel files (`src/components/index.ts`), layout
  components (`Row` / `Col` / `FlexGroup`) instead of raw `div`, and theme usage.
- **[redis-ui-components](../../redis-ui-components/)** — build all plugin UI from Redis UI
  components via the `uiSrc/components/ui` wrappers; never import raw `@redis-ui/*`.
- **[code-quality](../../code-quality/SKILL.md)** — no `any`, naming conventions, import order,
  no magic numbers, no `!important`, semantic theme colors.
- **[testing](../../testing/SKILL.md)** — Jest + Testing Library, `renderComponent`, `faker`,
  `waitFor` over fixed waits.

## Path

```
redisinsight/ui/src/packages/<plugin-name>/
  package.json              # manifest (source/main/styles/visualizations) + scripts
  index.html                # iframe entry with <div id="app">
  jest.config.cjs
  tsconfig.json
  public/                   # icon SVGs (copied to dist by the shared build)
  src/
    main.tsx                # exports activation functions (default export)
    App.tsx / App.spec.tsx
    components/             # ComponentName/ dirs + index.ts barrel
    constants/             # index.ts barrel
    types/                 # index.ts barrel
    utils/                 # parsers + *.spec.ts
    styles/styles.scss
    global.d.ts
    jest.setup.ts
```

See any sibling under `redisinsight/ui/src/packages/` for a complete, current example
(`redisearch` is a good table plugin; `geodata` is a good multi-visualization one).

## Build Tool: Vite (shared config)

There is **no per-package `vite.config.ts`**. All internal plugins share a single config at
`redisinsight/ui/src/packages/vite.config.mjs` and are listed in its `riPlugins` array. To add
a new plugin you register it there:

```js
// redisinsight/ui/src/packages/vite.config.mjs
const riPlugins = [
  { name: 'redisearch', entry: 'src/main.tsx' },
  // ...
  { name: '<plugin-name>', entry: 'src/main.tsx' },  // add your plugin
];
```

Each package's `package.json` wires the standard scripts:

```json
{
  "source": "./src/main.tsx",
  "main": "./dist/index.js",
  "styles": "./dist/styles.css",
  "scripts": {
    "dev": "vite -c ../vite.config.mjs",
    "test": "node ../../../../../node_modules/.bin/jest -c jest.config.cjs",
    "typecheck": "node ../../../../../node_modules/.bin/tsc --project tsconfig.json --noEmit"
  }
}
```

The shared build produces `dist/index.js` and `dist/styles.css` (and copies `public/` icons to
`dist/`), all referenced from the manifest.

## Manifest fields used in-repo

In addition to the base fields in [plugin-manifest.md](plugin-manifest.md), in-repo
visualizations commonly use:

- `matchQuery.anyRegex` / `matchQuery.noneRegex` — refine matching beyond `matchCommands` (e.g.
  only activate when a specific modifier flag is present in the command text).
- `iconDark` / `iconLight` — `./dist/<icon>.svg` paths (source SVGs live in `public/`).

## index.html

```html
<!doctype html>
<html>
  <head><meta charset="utf-8" /></head>
  <body class="theme_LIGHT">
    <div id="app"></div>
    <script type="module" src="./src/main.tsx"></script>
  </body>
</html>
```

## Theme and Shared UI Caveats

- Use Redis UI components and the theme tokens via the repo's `uiSrc/components/ui` wrappers per
  the [redis-ui-components](../../redis-ui-components/) and [frontend](../../frontend/SKILL.md)
  skills.
- Detect iframe theme through the `theme_LIGHT` / `theme_DARK` body classes (or the
  `redisinsight-plugin-sdk` theme helper).
- Do not import from deep relative paths (`../../../../../`); use the monorepo's package alias.

## Internal Plugin DO NOT

- DO NOT introduce a Parcel build or a per-package `vite.config.ts` inside the monorepo. Register
  in the shared `vite.config.mjs`.
- DO NOT diverge from the runtime-dependency handling of sibling packages — copy how `geodata`
  declares `react`/`react-dom` and externalization, don't invent your own.
- DO NOT import from a sibling internal plugin — use shared utilities (`packages/common`) only.
- DO NOT mutate global window state outside of the documented `window.state` surface.

## When to Convert Internal → External

If the plugin is meant to ship outside RedisInsight (customer demo, field use, GitHub release),
port it to an external Parcel layout. Keep the React component code; replace the build tool,
bundle every dependency, and follow [external-parcel-plugin.md](external-parcel-plugin.md).
