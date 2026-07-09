# RI-8311 — Move Search-flow Context control above the results table

**Status:** Approved
**Author:** Pavel Angelov
**Date:** 2026-07-09
**Ticket:** [RI-8311](https://redislabs.atlassian.net/browse/RI-8311)
**Parent epic:** RI-8174 (arrays demo feedback)

## TL;DR

In the array **Search** flow the Context control (toggle + `±` + neighbour
count) currently lives *inside* `ArraySearchForm`, between the predicate rows
and the collapsible "Options". It reads as a search option, but it is not one —
it never enters the `ARGREP` command; it only governs how a matched result row
expands (`±N` neighbours). Move it out of the form to sit **directly above the
results table**, appearing only once a search has run.

This is a **layout/structure-only** change. Search results, the `ARGREP`
command, and the neighbour-band fetch are untouched.

## Current state

- `array-details/search-tab/SearchTab.tsx` owns the `context` state
  (`useState<ContextOption>(DEFAULT_CONTEXT)`), the `onChangeContext` patcher,
  the key-switch reset effect, and `handleReset`. It passes `context` /
  `onChangeContext` down to `ArraySearchForm`.
- `array-details/array-search-form/ArraySearchForm.tsx` renders the Context
  `<Row>` (lines ~230–271): a `Checkbox` toggle + `InfoHint`, the `±` prefix
  `Text`, and a `NumericInput` in a `NarrowInputBox`.
- The `ContextOption` type lives in `ArraySearchForm.types.ts`; the
  `CONTEXT_LABEL` / `CONTEXT_PREFIX` / `CONTEXT_HINT` strings live in
  `ArraySearchForm.constants.ts`; `DEFAULT_CONTEXT`, `CONTEXT_COUNT_MIN`,
  `CONTEXT_COUNT_MAX` live in the shared `array-details/constants.ts`.
- The sibling `ViewTab` already renders a subheader strip between its form and
  its table via `ViewTab.styles.ts` `SubheaderContainer` — the pattern this
  change mirrors.

## Decisions

- **Extract a dedicated `ContextControl` component** rather than inline the JSX
  into `SearchTab`. Keeps the container lean, makes the control independently
  testable, and matches the repo's component-per-folder convention.
- **Placement: only with results.** Render `ContextControl` inside the existing
  results gate (`!keyLoading && (loaded || loading)`), directly above the table.
  It stays hidden on the blank initial tab and appears once a search runs —
  tying the control to the results it affects.
- **Preserve behavior exactly.** `disabled={isRefreshDisabled}` mirrors the
  form's prior disabled coupling; context state, reset, key-switch reset, and
  the neighbour band are unchanged.
- **Promote `InfoHint`** to a shared `array-details/components/InfoHint/` — it is
  now used by two siblings (the form and the new control).

## Plan

### 1. New `ContextControl` component

`array-details/search-tab/ContextControl/`

- `ContextControl.tsx` — the toggle + `InfoHint` + `±` `Text` + `NumericInput`
  (`NarrowInputBox`), wrapped in a subheader strip styled after
  `ViewTab.styles.ts` `SubheaderContainer`.
  - Props:
    ```ts
    interface ContextControlProps {
      context: ContextOption
      onChange: (patch: Partial<ContextOption>) => void
      disabled?: boolean
    }
    ```
- `ContextControl.styles.ts` — a `SubheaderContainer`-style strip; its own
  `InlineCheckbox` and `NarrowInputBox` (small copies; the form keeps its own,
  which it still needs for NOCASE/WITHVALUES/LIMIT and range/limit inputs).
- `ContextControl.types.ts` — owns the moved `ContextOption` type + props.
- `ContextControl.constants.ts` — owns the moved `CONTEXT_LABEL`,
  `CONTEXT_PREFIX`, `CONTEXT_HINT`, and a new
  `ARRAY_CONTEXT_CONTROL_TEST_ID = 'array-context-control'`.
  (`CONTEXT_COUNT_MIN/MAX`, `DEFAULT_CONTEXT` stay in the shared constants.)
- `ContextControl.spec.tsx` — unit tests: input disabled until toggle ticked,
  toggle reports `{ enabled }`, count change reports `{ count }`, respects
  `disabled`.
- `index.ts` — barrel.

Test ids: `array-context-control-toggle` (checkbox), `array-context-control`
(numeric input).

### 2. Promote `InfoHint`

Move `array-search-form/components/InfoHint.tsx` + `InfoHint.types.ts` into a
shared `array-details/components/InfoHint/` (with an `index.ts`). Update the one
import in `ArraySearchForm.tsx`; `ContextControl` imports from the shared path.

### 3. `SearchTab.tsx`

- Import `ContextControl` (and `ContextOption` from its new home).
- Inside the results gate, render the control above the table:
  ```tsx
  <S.TabBody>
    {!keyLoading && (loaded || loading) && (
      <>
        <ContextControl
          context={context}
          onChange={onChangeContext}
          disabled={isRefreshDisabled}
        />
        <S.TabTableWrapper>
          <ArrayDetailsTable ... />
        </S.TabTableWrapper>
      </>
    )}
  </S.TabBody>
  ```
- Keep all existing state/effects/handlers. Remove the `context` /
  `onChangeContext` props from the `<ArraySearchForm>` call.
- `isRefreshDisabled` is already read from `selectedKeySelector`.

### 4. `ArraySearchForm.tsx` / types / constants

- Delete the Context `<Row>` block.
- Remove `context` / `onChangeContext` from `ArraySearchFormProps` and the
  destructure.
- Remove the `ContextOption` type from `ArraySearchForm.types.ts` (moved).
- Remove `CONTEXT_LABEL` / `CONTEXT_PREFIX` / `CONTEXT_HINT` from
  `ArraySearchForm.constants.ts` (moved).
- Drop now-unused imports: `NumericInput`, `CONTEXT_COUNT_MAX`,
  `CONTEXT_COUNT_MIN`, and the three `CONTEXT_*` strings. Keep `Text`, `Row`,
  `FlexItem` (still used elsewhere).

### 5. Tests

- `ArraySearchForm.spec.tsx` — remove the `describe('context', ...)` block and
  the `context` / `onChangeContext` entries from the default props.
- `SearchTab.spec.tsx` — retarget the context test ids
  (`array-search-form-context-toggle` → `array-context-control-toggle`,
  `array-search-form-context` → `array-context-control`). The role-based
  `getByRole('checkbox', { name: 'Context' })` assertions stay valid. All
  context tests already render with `loaded: true` + data, so the control is
  present. (redux-mock-store does not run reducers, so `loaded` stays true
  across a dispatched reset — the reset test still observes the control.)
- New `ContextControl.spec.tsx` as above.

## Out of scope

- Any change to `ARGREP`, search results, predicates, options, or telemetry.
- Any change to the neighbour-band (`NeighbourBand`) fetch or rendering.
- Restyling the Context control itself beyond the wrapping subheader strip.

## Verification

- `yarn lint:ui`, `yarn type-check`.
- `SearchTab.spec.tsx`, `ArraySearchForm.spec.tsx`, `ContextControl.spec.tsx`
  green.
- Manual: Search tab — control hidden before a search, appears above the table
  after Run; toggling expands/collapses matches with the neighbour band; reset
  and key-switch clear it; results are byte-identical to before.
