# Strict `AppDispatch` Typing — Spike Report

## Goal

Tighten `AppDispatch` so that `dispatch({ type, payload })` is type-checked against the action shapes of every slice in the app. Out-of-union types or wrong payloads should fail at compile time.

## Approach

Build an `AppAction` discriminated union from every `createSlice(...).actions` in the codebase, and re-type:

```ts
export type AppAction = ActionsOf<typeof slice1> | ActionsOf<typeof slice2>;
// …~80 more

export type AppDispatch = ThunkDispatch<RootState, unknown, AppAction>;
```

Notes:

- **Do not intersect with `typeof store.dispatch`.** That re-introduces the broad `Dispatch<UnknownAction>` overload via RTK's augmented type and silently defeats the narrowing. `ThunkDispatch<...>` already provides both the thunk overload and the narrowed plain-action overload.
- Slices must `export const xxxSlice = createSlice(...)` so their `.actions` are reachable. Today most are declared `const xxxSlice = ...` and only the destructured action creators are exported — a one-line edit per file.

## Spike

Branch: `feature/strict-app-action-dispatch` (off `feature/bump-redux-types`).

Unioned two representative slices (`appConnectivitySlice`, `notificationsSlice`) and tightened `AppDispatch` as above. Ran `yarn type-check`.

### Findings

| Metric                                                                   | Value                                        |
| ------------------------------------------------------------------------ | -------------------------------------------- |
| Unique error sites                                                       | **1,283**                                    |
| Unique files affected                                                    | **206+** (excl. `*.stories.tsx`)             |
| Error code                                                               | All `TS2769` "No overload matches this call" |
| Slices in union (spike)                                                  | 2                                            |
| Slices remaining                                                         | ~78                                          |
| **Bare-object dispatches (`dispatch({type, payload})`) in the codebase** | **0**                                        |

### Mechanism verification

- ✅ Actions in the union (`addErrorNotification`, `setConnectivityLoading`, etc.) compile cleanly at all call sites.
- ❌ Actions outside the union (e.g. `concatToOutput` from `cli/cli-output`) fail at every dispatch site with `TS2769`.
- ✅ Thunks (functions passed to `dispatch`) pass through unchanged via the `ThunkAction` overload of `ThunkDispatch`.

### Extrapolation

Errors are linear in "uncovered slices". 2 slices uncovered → 1,283 errors. Adding the remaining ~78 slices to the union should resolve nearly all of them. Residual errors are expected only for legitimately untyped dispatch paths (standalone `createAction`, middleware-fabricated actions). Estimated residual: **5–30 errors** requiring real fixes.

The zero bare-object dispatches across the entire codebase is the key positive signal — there is no legacy `dispatch({ type: 'foo', payload })` style to migrate.

## Rollout plan

| Phase | Work                                                                                                                      | Risk                                                    |
| ----- | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| A     | Add `export` to ~80 `xxxSlice = createSlice(...)` declarations                                                            | Very low. Mechanical, single-line edits.                |
| B     | Build the full `AppAction` union in `store.ts` and switch `AppDispatch` to `ThunkDispatch<RootState, unknown, AppAction>` | Low. Pure type-level change.                            |
| C     | Run type-check, fix residual errors (5–30 estimated)                                                                      | Medium. Touches the legitimate non-`createSlice` paths. |
| D     | Verify `yarn lint`, `yarn test`, refresh `.tscheck.rec.json` baselines if needed                                          | Very low.                                               |

**Single PR is realistic.** Total effort: roughly half a day to a full day for one engineer. The diff will be large by line count (~80 slice files touched) but trivially reviewable since ~95% is identical mechanical edits.

## Open questions for the implementation PR

- **`createAction` standalone usage.** Grep the codebase and decide whether to migrate them into a slice or extend the union to cover them explicitly.
- **Thunks declared with `dispatch: AppDispatch`.** Confirm the `ThunkAction` overload narrowing doesn't break callsites that pass narrowed thunk return types.
- **Test utilities.** `redux-mock-store`'s `dispatch` is independently typed and unaffected; `mockedStore.getActions()` still returns `UnknownAction[]`, so the existing `as PublishPayload` / `as unknown[]` casts in spec files remain correct and should not be removed.
- **Plugin packages** under `redisinsight/ui/src/packages/*`. They have their own nested `node_modules`; verify they don't import the root `AppDispatch` (a quick grep will tell us — they almost certainly don't, but worth confirming).
