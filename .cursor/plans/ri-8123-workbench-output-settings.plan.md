# RI-8123: Remember workbench output settings — full plan

## Git workflow (approval)

- **Branch create and push**: The agent will **perform** `git checkout -b ...` and `git push -u origin ...` (and any PR-creation steps that use git).
- **Before running any of these git commands**, the agent will **ask for your approval** (e.g. “Approve creating branch `fe/feature/RI-8123/remember-workbench-output-settings`?” / “Approve pushing this branch to origin?”).
- No git branch or push is executed without explicit approval.

---

## 1. Branch and PR (bookends)

- **Create branch** (after your approval): `fe/feature/RI-8123/remember-workbench-output-settings`.
- **When implementation and tests are done — create PR** (after your approval for push if needed): Title `RI-8123 Remember output settings for workbench`, label **AI-Made**, description with #What, #Testing, `Closes RI-8123`.

---

## 2. Implementation

- **Persistence**: Add `chartOutputSettings` (subset: mode, timeUnit, staircase, fill) under `state.user.settings.workbench`; optional `BrowserStorageItem` for fast load.
- **Host**: In QueryCardCliPlugin — (1) pass saved `chartConfig` in `executeCommand` data when visualization is Time Series chart, (2) in `setPluginState` handler for that plugin, also persist to workbench default.
- **User settings**: Extend user slice interfaces and user-settings slice with reducer + selector for `workbench.chartOutputSettings`.
- **Plugin**: redistimeseries-app — accept `initialChartConfig` in main → App → ChartResultView; initialize state from it; on config change call plugin SDK `setState(config)`.

---

## 3. Testing

- **Unit**: User settings slice (chartOutputSettings); ChartResultView (initial state, merge); QueryCardCliPlugin (executeCommand payload, setPluginState → workbench default).
- **E2E**: Workbench TS command → change chart settings → run again → assert settings persisted (Playwright, no fixed waits).
- **Pre-PR**: `yarn lint`, `yarn type-check:ui`.

---

## 4. Order of work

1. Ask approval → create branch `fe/feature/RI-8123/remember-workbench-output-settings` and (if desired) push.
2. Types + storage + user settings slice + slice tests.
3. Host: executeCommand + setPluginState + QueryCardCliPlugin tests.
4. Plugin: initialChartConfig + setState + ChartResultView tests.
5. E2E: workbench TS chart persistence.
6. Lint/type-check.
7. Ask approval → create PR (and push if needed).
