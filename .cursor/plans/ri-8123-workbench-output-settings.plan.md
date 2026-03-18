# RI-8123: Remember workbench output settings — full plan

## 1. Implementation

- **Persistence**: Add `chartOutputSettings` (subset: mode, timeUnit, staircase, fill) under `state.user.settings.workbench`; optional `BrowserStorageItem` for fast load.
- **Host**: In QueryCardCliPlugin — (1) pass saved `chartConfig` in `executeCommand` data when visualization is Time Series chart, (2) in `setPluginState` handler for that plugin, also persist to workbench default.
- **User settings**: Extend user slice interfaces and user-settings slice with reducer + selector for `workbench.chartOutputSettings`.
- **Plugin**: redistimeseries-app — accept `initialChartConfig` in main → App → ChartResultView; initialize state from it; on config change call plugin SDK `setState(config)`.

## 2. Testing

- **Unit**: User settings slice (chartOutputSettings); ChartResultView (initial state, merge); QueryCardCliPlugin (executeCommand payload, setPluginState → workbench default).
- **E2E**: Workbench TS command → change chart settings → run again → assert settings persisted (Playwright, no fixed waits).
- **Pre-PR**: `yarn lint`, `yarn type-check:ui`.

## 3. Order of work

1. Types + storage + user settings slice + slice tests.
2. Host: executeCommand + setPluginState + QueryCardCliPlugin tests.
3. Plugin: initialChartConfig + setState + ChartResultView tests.
4. E2E: workbench TS chart persistence.
5. Lint/type-check.
