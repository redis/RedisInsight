---
name: ''
overview: ''
todos: []
isProject: false
---

# RI-8123: Remember workbench output settings — full plan

## Context

When running `TS.RANGE` (and TS.MRANGE, TS.REVRANGE, TS.MREVRANGE) in workbench, chart output settings (line vs points, staircase, fill, time unit) reset to defaults on every new result. Users want these preferences to persist so they don’t have to reconfigure after each command.

**Current flow:** QueryCardCliPlugin sends `executeCommand('renderChart', { command, data: result, mode })` to the Time Series plugin iframe. The plugin’s `ChartResultView` initializes `chartConfig` with local `useState` defaults every mount. Plugin state (getState/setState) is stored per (visualizationId, commandId) via API, so each new command gets a new commandId and no saved default.

---

## 1. Implementation

### 1.1 Persistence shape and storage

- **Persist only “output format” subset** of `ChartConfig` so it applies to any TS result:
  - `mode` (`GraphMode.line` | `GraphMode.points`)
  - `timeUnit` (`TimeUnit.seconds` | `TimeUnit.milliseconds`)
  - `staircase` (boolean)
  - `fill` (boolean)
- **Do not persist** data-specific fields: `title`, `xlabel`, `keyToY2Axis`, `yAxisConfig`, `yAxis2Config` (they depend on the current series).
- **Where to store:** Extend `state.user.settings.workbench` (see `redisinsight/ui/src/slices/interfaces/user.ts`). Add `chartOutputSettings?: WorkbenchChartOutputSettings`. Follow the same pattern as `workbench.cleanup` in `redisinsight/ui/src/slices/user/user-settings.ts`: reducer + optional mirror to a `BrowserStorageItem` (e.g. add `wbTsChartOutput` in `redisinsight/ui/src/constants/storage.ts`) for fast read before user settings load.
- **Types:** Define `WorkbenchChartOutputSettings` (subset of ChartConfig) in user/workbench types and use it in the plugin contract.

### 1.2 Host (QueryCardCliPlugin)

- **File:** `redisinsight/ui/src/components/query/query-card/QueryCardCliPlugin/QueryCardCliPlugin.tsx`
- **Pass initial config:** When building the payload for `executeCommand`, if the current visualization is the Time Series chart, include saved settings in `data`. Detect by `currentView?.id === 'redistimeseries-chart'` (from `package.json` visualizations[].id). Payload becomes: `data: { command, data: result, mode, chartConfig: savedWorkbenchChartOutputSettings }`. Read saved settings from a selector (e.g. `userSettingsWBSelector` or a new selector that returns `workbench.chartOutputSettings`).
- **Persist on setState:** In the `setPluginState` handler, when the visualization is the Time Series chart (same id check), after the existing `setPluginStateAction` call, also dispatch an action to update the workbench default (e.g. `setWorkbenchChartOutputSettings(state)` or equivalent). That action should update Redux and optionally write to localStorage so the next chart load gets the new default.

### 1.3 User settings slice

- **Files:**
  - `redisinsight/ui/src/slices/interfaces/user.ts` — extend `workbench` with `chartOutputSettings?: WorkbenchChartOutputSettings`.
  - `redisinsight/ui/src/slices/user/user-settings.ts` — add reducer (e.g. `setWorkbenchChartOutputSettings`), persist to localStorage if using `BrowserStorageItem.wbTsChartOutput`, add/export selector for `workbench.chartOutputSettings`.
- **Initial state:** `workbench.chartOutputSettings` can be `undefined`; the plugin will treat that as “use built-in defaults”.

### 1.4 Plugin (redistimeseries-app)

- **main.tsx** (`redisinsight/ui/src/packages/redistimeseries-app/src/main.tsx`): Extend the `Props` / payload type to include `chartConfig?: WorkbenchChartOutputSettings`. In `renderChart`, pass `chartConfig` through to `App`.
- **App.tsx** (`redisinsight/ui/src/packages/redistimeseries-app/src/App.tsx`): Accept optional `initialChartConfig` and pass it to `ChartResultView`.
- **ChartResultView** (`redisinsight/ui/src/packages/redistimeseries-app/src/components/Chart/ChartResultView.tsx`):
  - Add optional prop `initialChartConfig?: Partial<ChartConfig>` (or the persisted subset type).
  - Initialize `useState<ChartConfig>` by merging `initialChartConfig` with data-derived defaults: keep `timeUnit` from `determineDefaultTimeUnits(props.data)` if not in initial, keep `keyToY2Axis` from current `props.data`, and use defaults for any missing or invalid keys.
  - On config change: call the plugin SDK `setState(chartConfig)` so the host receives it (existing getState/setState flow). Either add `redisinsight-plugin-sdk` as a dependency and call `setState(config)` from ChartResultView when the user changes settings, or have the host inject `PluginSDK.setState` and call that. The host will then persist per-command (existing) and workbench default (new).

### 1.5 Edge cases

- **First run / no saved settings:** If `chartConfig` is undefined, ChartResultView behaves as today (defaults only).
- **Schema changes:** Persisted object should allow optional fields; when applying, merge with defaults and ignore unknown keys so future new options don’t break old stored blobs.
- **Existing plugin state API:** No change to getState/setState URL or behavior; only the host’s handling of setState for the Time Series plugin is extended (dual-write to workbench default).

---

## 2. Testing

### 2.1 Unit tests

- **User settings slice** (`redisinsight/ui/src/slices/tests/user/user-settings.spec.ts`): Reducer and actions for `chartOutputSettings` (set, merge with defaults, optional localStorage write). Assert initial state and after setWorkbenchChartOutputSettings.
- **ChartResultView** (new spec under `redisinsight/ui/src/packages/redistimeseries-app/src/components/Chart/`): (1) Initial state when `initialChartConfig` is provided: mode, timeUnit, staircase, fill match. (2) When `initialChartConfig` is missing, defaults (e.g. GraphMode.line, fill: true, staircase: false) and data-derived `timeUnit` and `keyToY2Axis` are used. (3) Partial or invalid keys in `initialChartConfig` do not break render; unknown keys are ignored.
- **QueryCardCliPlugin** (`redisinsight/ui/src/components/query/query-card/QueryCardCliPlugin/QueryCardCliPlugin.spec.tsx`): When the current view is the Time Series chart and the selector returns saved `chartOutputSettings`, `executeCommand` is invoked with `data.chartConfig` set. When `setPluginState` is called for that visualization, the new “save workbench default” action is dispatched (mock and assert).

### 2.2 E2E

- **Workbench Time Series persistence:** In the Playwright E2E suite (e.g. under `tests/e2e-playwright/`), add or extend a test: run a TS command (e.g. `TS.RANGE`), change chart settings (e.g. switch to points, toggle staircase/fill), run another TS command (same or different key), then assert the second result shows the same chart options (e.g. points mode, staircase on). Use existing page objects and `waitFor`/assertions; no fixed time waits.

### 2.3 Pre-PR

- Run `yarn lint` and `yarn type-check:ui`; fix any issues.

---

## 3. Order of work

1. **Types and storage** — Define `WorkbenchChartOutputSettings`, extend `StateUserSettings.workbench`, add `BrowserStorageItem.wbTsChartOutput` if used.
2. **User settings slice** — Reducer, selector, optional localStorage; add unit tests for chart output settings.
3. **Host** — In QueryCardCliPlugin: pass `chartConfig` in `executeCommand` for Time Series chart; in `setPluginState`, dual-write to workbench default when view is Time Series. Add/update QueryCardCliPlugin unit tests.
4. **Plugin** — main.tsx and App accept and pass `initialChartConfig`; ChartResultView uses it for initial state and calls setState on change. Add ChartResultView unit tests.
5. **E2E** — Workbench TS chart persistence scenario.
6. **Lint and type-check** — Fix and re-run.

---

## 4. Files to touch (summary)

| Area             | Files                                                                                                                                                              |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Types            | `redisinsight/ui/src/slices/interfaces/user.ts`                                                                                                                    |
| Storage constant | `redisinsight/ui/src/constants/storage.ts` (optional)                                                                                                              |
| User settings    | `redisinsight/ui/src/slices/user/user-settings.ts`, `redisinsight/ui/src/slices/tests/user/user-settings.spec.ts`                                                  |
| Host plugin      | `redisinsight/ui/src/components/query/query-card/QueryCardCliPlugin/QueryCardCliPlugin.tsx`, `QueryCardCliPlugin.spec.tsx`                                         |
| Plugin app       | `redisinsight/ui/src/packages/redistimeseries-app/src/main.tsx`, `App.tsx`, `components/Chart/ChartResultView.tsx`; new `ChartResultView.spec.tsx` (or equivalent) |
| E2E              | New or extended Playwright test under `tests/e2e-playwright/` for workbench TS chart persistence                                                                   |
