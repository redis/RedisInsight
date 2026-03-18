---
name: RI-8123 Workbench output settings
overview: Persist RedisTimeSeries Workbench output preferences (selected view and chart config) per database so the next compatible result reuses the user's last settings.
todos:
  - id: types-and-storage
    content: Add storage key (wbTsResultPreferences) in storage.ts, define WorkbenchTsResultPreferences and PersistedTsChartConfig types, implement get/set/merge helper functions
    status: completed
  - id: query-card-view-persistence
    content: Update QueryCard to initialize selectedView from persisted preferences for TS commands and persist on dropdown change; handle useEffect race with visualizations
    status: completed
  - id: plugin-host-bridge
    content: Update QueryCardCliPlugin to pass initialPreferences.chartConfig in executeCommand for redistimeseries-chart and dual-write filtered chart subset to localStorage in setPluginState handler
    status: completed
  - id: plugin-entrypoints
    content: Update redistimeseries-app main.tsx and App.tsx to accept and forward initialPreferences; add redisinsight-plugin-sdk as dependency
    status: completed
  - id: chart-result-view
    content: Update ChartResultView to merge persisted config with data-derived defaults and call plugin SDK setState with reusable subset on config change
    status: completed
  - id: unit-tests
    content: Add unit tests for storage helpers, QueryCard view persistence, QueryCardCliPlugin dual-write and payload, and ChartResultView merge logic
    status: completed
  - id: e2e-tests
    content: Add Playwright tests for text-view persistence, chart-toggle persistence, and per-database isolation
    status: cancelled
  - id: lint-typecheck
    content: Run yarn lint:ui, yarn type-check:ui, and targeted tests; fix any issues
    status: completed
isProject: false
---

# RI-8123: Remember Workbench output settings

## Context

When users run RedisTimeSeries commands in Workbench (`TS.RANGE`, `TS.REVRANGE`, `TS.MRANGE`, `TS.MREVRANGE`), each new result card resets to the visualization defaults:

- chart view selected instead of the user's last chosen result view
- line mode instead of points
- staircase off
- fill on
- time unit re-derived from the result

This is happening because the current persistence layers do not model a "next compatible Workbench result default":

- `QueryCard` owns the selected result view (`Text` vs plugin) in local component state.
- The RedisTimeSeries iframe owns chart config in `ChartResultView` local state.
- Existing plugin state (`getState` / `setState`) is keyed by `(visualizationId, commandExecutionId)`, so it restores an existing saved command result, not a future command.

The feature should make the next compatible RedisTimeSeries result start from the user's latest preferred output settings, without mutating older cards in history.

## Goal

Persist RedisTimeSeries Workbench output preferences so the next RedisTimeSeries command result reuses the user's last settings.

### Success criteria

- If a user switches a RedisTimeSeries result from chart view to text view, the next RedisTimeSeries result opens in text view.
- If a user stays in chart view and changes chart options, the next RedisTimeSeries result starts with the same persisted chart options.
- Preferences are scoped per database.
- Existing saved result cards keep their own historical state.
- Non-TimeSeries results are unaffected.

## Product decisions

### Scope

- Persistence is **per database**, not global across the app.
- Persistence applies only to RedisTimeSeries Workbench results.
- Persistence affects only **future compatible results**, not previously rendered cards.

### Persisted preference shape

Persist the minimum reusable subset:

- `selectedView`
  - `text`
  - `plugin:redistimeseries-chart`
- `chartConfig`
  - `mode` (`line` | `points`)
  - `timeUnit` (`seconds` | `milliseconds`)
  - `staircase` (boolean)
  - `fill` (boolean)

Do not persist:

- `title`
- `xlabel`
- `yAxis2`
- `keyToY2Axis`
- `yAxisConfig`
- `yAxis2Config`
- zoom / relayout state
- any plugin-specific metadata outside this subset

### Default behavior when no preference exists

Use current built-in defaults:

- `selectedView = plugin:redistimeseries-chart`
- `mode = line`
- `timeUnit = determineDefaultTimeUnits(result)`
- `staircase = false`
- `fill = true`

## Architecture

### Source of truth

The source of truth for this feature should be **host-owned browser storage**, not user settings API state and not plugin state API.

Reasoning:

- User settings state in this repo is primarily tied to `/settings` API config and only mirrors a small local-only cleanup flag.
- Plugin state API is intentionally per-command and should stay that way.
- This feature is instance-scoped UI preference, closest to other Workbench/browser local UI state.

### Storage location

Add a new browser storage key in `redisinsight/ui/src/constants/storage.ts`, for example:

- `wbTsResultPreferences = 'wbTsResultPreferences_'`

Persist values under:

- `BrowserStorageItem.wbTsResultPreferences + instanceId`

Stored object shape:

```ts
interface WorkbenchTsResultPreferences {
  selectedView: 'text' | 'plugin:redistimeseries-chart';
  chartConfig?: {
    mode?: GraphMode;
    timeUnit?: TimeUnit;
    staircase?: boolean;
    fill?: boolean;
  };
}
```

### Ownership split

- Host owns:
  - reading and writing persisted per-database preferences
  - result-view persistence (`Text` vs plugin)
  - providing initial chart defaults to the iframe
  - filtering and validating the subset written by the iframe
- Iframe owns:
  - local chart UI state for the current card
  - notifying the host when the persisted chart subset changes

## Implementation

### 1. Add preference types and storage helpers

Add a dedicated type and helper functions in UI code, not under user settings:

- define `WorkbenchTsResultPreferences`
- define `PersistedTsChartConfig`
- add helpers:
  - `getWorkbenchTsResultPreferences(instanceId)`
  - `setWorkbenchTsResultPreferences(instanceId, preferences)`
  - `mergeWorkbenchTsChartPreferences(existing, incoming)`

Implementation rules:

- tolerate malformed localStorage payloads by falling back to defaults
- ignore unknown keys
- only write the supported subset

Recommended location:

- `redisinsight/ui/src/pages/workbench/utils/` or `redisinsight/ui/src/services/`

### 2. Persist result-view selection in host `QueryCard`

File:

- `redisinsight/ui/src/components/query/query-card/QueryCard.tsx`

Changes:

- detect when the current card is a RedisTimeSeries-compatible card
- initialize `selectedViewValue` and `viewTypeSelected` from persisted preferences instead of always using the plugin default
- when the user changes the dropdown view:
  - preserve current behavior and telemetry
  - additionally persist `selectedView`
- update the existing `useEffect` that reacts to `visualizations` loading so it does not overwrite a persisted RedisTimeSeries view selection after mount

Rules:

- only apply persisted view selection when:
  - query type is compatible with RedisTimeSeries visualization
  - results mode is `Default`
- grouped results mode should ignore this feature
- if persisted `selectedView` points to plugin view but the plugin is not available, fall back to text
- if visualizations arrive after the initial render, recompute available options but preserve the persisted view when it is still valid; only fall back to the plugin default when there is no persisted view or the persisted plugin view is unavailable

Implementation detail:

- the persisted value should be normalized to a stable host value:
  - `text`
  - `plugin:redistimeseries-chart`
- do not persist ephemeral dropdown ids that may change for other plugins

### 3. Pass initial chart defaults from host to iframe

File:

- `redisinsight/ui/src/components/query/query-card/QueryCardCliPlugin/QueryCardCliPlugin.tsx`

Changes:

- when rendering `redistimeseries-chart`, read persisted preferences for the current `instanceId`
- extend the payload sent through `executeCommand('renderChart', ...)`

Required payload shape:

```ts
{
  command,
  data: result,
  mode,
  initialPreferences: {
    chartConfig: {
      mode,
      timeUnit,
      staircase,
      fill,
    }
  }
}
```

Do not rely on per-command plugin `getState()` for this feature's initial value.

### 4. Use one concrete iframe-to-host mechanism

Do not leave the mechanism open-ended.

Use the existing plugin event bridge already implemented in `QueryCardCliPlugin`:

- the iframe calls the existing plugin SDK `setState(...)`
- `QueryCardCliPlugin` already listens to `PluginEvents.setState`
- extend the host handler so that for `redistimeseries-chart` it:
  - continues existing per-command `setPluginStateAction(...)`
  - also extracts the reusable subset
  - persists that subset into per-database local storage

This keeps the bridge consistent with the current plugin contract and avoids inventing a second event path.

Concrete decision:

- use the existing local package `redisinsight-plugin-sdk` from inside `redistimeseries-app`
- do not extend `globalThis.PluginSDK` in `pluginImport.ts`
- do not introduce any new external npm dependency

Reasoning:

- `redisinsight-plugin-sdk` already implements `setState(...)`
- it already handles request id generation, callback wiring, and host message transport
- the injected `globalThis.PluginSDK` surface currently only exposes plugin load helpers and should remain unchanged for this feature

### 5. Teach the RedisTimeSeries iframe to emit only the reusable subset

Files:

- `redisinsight/ui/src/packages/redistimeseries-app/src/main.tsx`
- `redisinsight/ui/src/packages/redistimeseries-app/src/App.tsx`
- `redisinsight/ui/src/packages/redistimeseries-app/src/components/Chart/ChartResultView.tsx`
- `redisinsight/ui/src/packages/redistimeseries-app/package.json`

Changes in `main.tsx`:

- extend render payload typing to accept:
  - `initialPreferences?: { chartConfig?: PersistedTsChartConfig }`

Changes in `App.tsx`:

- accept `initialPreferences`
- pass `initialChartConfig` into `ChartResultView`

Changes in `ChartResultView.tsx`:

- accept `initialChartConfig?: Partial<ChartConfig>`
- initialize local `chartConfig` by merging:
  - built-in defaults
  - data-derived defaults (`timeUnit`, `keyToY2Axis`)
  - persisted subset
- on each change to persisted fields (`mode`, `timeUnit`, `staircase`, `fill`):
  - import `setState` from `redisinsight-plugin-sdk`
  - call `setState(...)`
  - emit only the reusable subset, not the full `ChartConfig`

Changes in `package.json`:

- add the local workspace dependency needed by the iframe package to call `setState(...)`
- use the existing in-repo package, not an external registry dependency

Merge rule:

- persisted values always win over derived defaults for persisted fields
- `determineDefaultTimeUnits(props.data)` is used only when there is no persisted `timeUnit`
- data-derived values remain the source of truth only for non-persisted, result-shaped fields such as `keyToY2Axis`

Required emitted state shape:

```ts
{
  mode,
  timeUnit,
  staircase,
  fill,
}
```

Do not emit:

- `keyToY2Axis`
- `yAxisConfig`
- `yAxis2Config`
- `title`
- `xlabel`
- transient layout state

### 6. Host filtering and write path

In `QueryCardCliPlugin.tsx`, inside the existing `setPluginState` handler:

- if `visualizationId !== 'redistimeseries-chart'`, keep current behavior only
- if `visualizationId === 'redistimeseries-chart'`:
  - validate incoming state
  - extract only `mode`, `timeUnit`, `staircase`, `fill`
  - merge into current persisted preferences for `instanceId`
  - preserve current `selectedView`
  - write back to localStorage

This write path must not overwrite `selectedView` unless the host UI explicitly changed it.

### 7. Compatibility and fallback behavior

If stored preferences are invalid:

- invalid `selectedView` -> fall back to `plugin:redistimeseries-chart`
- invalid chart fields -> ignore invalid values and use defaults

If plugin is unavailable:

- force `selectedView = text`
- keep stored chartConfig unchanged for future compatible sessions

If the current result is not RedisTimeSeries:

- do not read or write this preference

If the user opens an old historical command:

- its own per-command plugin state remains authoritative for that card
- this feature only seeds new cards

## Testing

### Unit tests

#### Storage helpers

Add tests for:

- empty storage returns defaults / undefined preference
- invalid JSON does not throw
- merge preserves `selectedView`
- merge ignores unsupported chart keys
- storage is keyed by `instanceId`

#### `QueryCard`

Add tests for:

- RedisTimeSeries card initializes to persisted `text` view
- RedisTimeSeries card initializes to persisted plugin view
- non-TimeSeries card ignores persisted view
- late `visualizations` loading does not reset a persisted RedisTimeSeries `text` view back to the plugin default
- late `visualizations` loading preserves a persisted plugin view when that plugin becomes available
- changing dropdown to text persists `selectedView = text`
- changing dropdown back to plugin persists `selectedView = plugin:redistimeseries-chart`

#### `QueryCardCliPlugin`

Add tests for:

- `renderChart` receives `initialPreferences.chartConfig` for TimeSeries plugin
- non-TimeSeries plugin does not receive this payload
- `setPluginState` dual-writes for TimeSeries plugin
- host filters plugin state to the reusable subset before persisting
- host does not overwrite `selectedView` during chart-config writes

#### `ChartResultView`

Add tests for:

- initial config merges persisted values with built-in defaults
- missing persisted config uses current defaults
- persisted `timeUnit` overrides `determineDefaultTimeUnits(props.data)` when both are present
- data-derived `timeUnit` is used only when persisted `timeUnit` is absent
- invalid persisted values are ignored
- changing `mode`, `timeUnit`, `staircase`, or `fill` triggers `setState` with subset only
- changing advanced options does not emit persisted-only payload changes unless one of the persisted fields changed

Scope note:

- `redistimeseries-app` does not currently have established component-test coverage for this flow
- adding first-time package-level component test infrastructure for Plotly rendering is not required for this ticket
- if package-level unit coverage is expensive, prefer validating merge/filter behavior in host-side tests plus end-to-end coverage for the user-visible outcome

### E2E / Playwright

Add one Workbench RedisTimeSeries persistence scenario:

1. open Workbench for a database
2. run a `TS.RANGE` command
3. switch to text view
4. run another `TS.RANGE`
5. verify the new card opens in text view
6. switch back to chart view
7. change to points, staircase on, fill off, choose a non-default time unit
8. run another `TS.RANGE`
9. verify the new card opens in chart view with the same persisted toggles and time unit

Add one isolation scenario:

1. set preferences in database A
2. open database B and run a `TS.RANGE`
3. verify database B still uses defaults

### Validation before PR

- `yarn lint:ui`
- `yarn type-check:ui`
- relevant UI unit tests
- relevant Playwright test if feasible

## Order of work

1. Add storage key, types, and helper functions for per-database RedisTimeSeries preferences.
2. Update `QueryCard` to read and persist `selectedView`.
3. Update `QueryCardCliPlugin` to pass initial chart defaults and dual-write filtered chart preferences on `setState`.
4. Update the RedisTimeSeries package entrypoints to accept initial preferences.
5. Update `ChartResultView` to merge persisted config and emit subset state through existing plugin `setState`.
6. Add unit tests for storage, host card behavior, and host plugin bridge; add package-level chart tests only if they fit existing infrastructure cheaply.
7. Add Playwright coverage for text-view persistence, chart-toggle persistence, and per-database isolation.
8. Run lint, type-check, and targeted tests.
9. Delete `.cursor/plans/ri-8123-workbench-output-settings.plan.md` before the final PR is merged.

## Files expected to change

### Host UI

- `redisinsight/ui/src/constants/storage.ts`
- `redisinsight/ui/src/components/query/query-card/QueryCard.tsx`
- `redisinsight/ui/src/components/query/query-card/QueryCard.spec.tsx`
- `redisinsight/ui/src/components/query/query-card/QueryCardCliPlugin/QueryCardCliPlugin.tsx`
- `redisinsight/ui/src/components/query/query-card/QueryCardCliPlugin/QueryCardCliPlugin.spec.tsx`
- one new helper/types file for persisted Workbench RedisTimeSeries preferences

### RedisTimeSeries package

- `redisinsight/ui/src/packages/redistimeseries-app/package.json`
- `redisinsight/ui/src/packages/redistimeseries-app/src/main.tsx`
- `redisinsight/ui/src/packages/redistimeseries-app/src/App.tsx`
- `redisinsight/ui/src/packages/redistimeseries-app/src/components/Chart/ChartResultView.tsx`
- optional test additions under `redisinsight/ui/src/packages/redistimeseries-app/src/components/Chart/` only if no new test infrastructure is needed

### E2E

- new or extended Playwright test under `tests/e2e-playwright/`

## Notes for implementation

- Do not route this through server-backed user settings.
- Do not add a new plugin transport if the existing `setState` bridge is sufficient.
- Do use the local `redisinsight-plugin-sdk` package for iframe `setState(...)` calls.
- Do not extend `pluginImport.ts` / `globalThis.PluginSDK` for this feature.
- Do not persist advanced chart fields that depend on the current dataset.
- Do not forget text-view persistence; it is part of the user-facing problem, not an optional extension.
- Do not expand package-level test infrastructure for `redistimeseries-app` as part of this ticket unless it turns out to be trivial.
