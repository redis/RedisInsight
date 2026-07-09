# RI-8311 — Move Search Context control above the results table — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Relocate the array Search-flow Context control (toggle + `±` + count) out of `ArraySearchForm` into a dedicated `ContextControl` component rendered directly above the results table, appearing only once a search has run.

**Architecture:** Extract a presentational `ContextControl` component (state stays in `SearchTab`), promote the shared `InfoHint` up one level, wire the new control into `SearchTab`'s results block, and strip the Context markup/props/constants/type from `ArraySearchForm`. Layout/structure only — no behavior, command, or fetch changes.

**Tech Stack:** React 18 + TypeScript, styled-components, Redis UI base components (`Checkbox`, `NumericInput`, `Text`, layout `Row`/`Col`/`FlexItem`), Jest + Testing Library.

## Global Constraints

- All work is under `redisinsight/ui/src/pages/browser/modules/key-details/components/array-details/`.
- TypeScript everywhere; no `any`. Named exports for components; barrel `index.ts` per component folder.
- No `!important`; use theme spacing tokens (`theme.core?.space.*`), not hardcoded px, except the existing `110px` `NarrowInputBox` idiom copied verbatim.
- UI imports use `uiSrc/*` aliases; import order external → internal alias → relative → styles last.
- Run `yarn lint:ui` and `yarn type-check` before the final commit; keep `.tscheck.rec.json` baselines unchanged (this change should not add TS errors).
- Never commit to `main`; work stays on branch `fe/RI-8311/move-context-control-above-results-table`.

**Base path (abbreviated `AD/` below):**
`redisinsight/ui/src/pages/browser/modules/key-details/components/array-details/`

---

## File Structure

**Create:**
- `AD/components/InfoHint/InfoHint.tsx` — shared info (i) tooltip (moved).
- `AD/components/InfoHint/InfoHint.types.ts` — `InfoHintProps` (moved).
- `AD/components/InfoHint/index.ts` — barrel.
- `AD/search-tab/ContextControl/ContextControl.tsx` — the relocated control.
- `AD/search-tab/ContextControl/ContextControl.styles.ts` — subheader strip + `InlineCheckbox` + `NarrowInputBox`.
- `AD/search-tab/ContextControl/ContextControl.types.ts` — `ContextOption` (moved) + `ContextControlProps`.
- `AD/search-tab/ContextControl/ContextControl.constants.ts` — test id + `CONTEXT_LABEL`/`CONTEXT_PREFIX`/`CONTEXT_HINT` (moved).
- `AD/search-tab/ContextControl/ContextControl.spec.tsx` — unit tests.
- `AD/search-tab/ContextControl/index.ts` — barrel.

**Delete:**
- `AD/array-search-form/components/InfoHint.tsx`
- `AD/array-search-form/components/InfoHint.types.ts`

**Modify:**
- `AD/array-search-form/ArraySearchForm.tsx` — remove Context block + imports; update `InfoHint` import path.
- `AD/array-search-form/ArraySearchForm.types.ts` — remove `ContextOption` + context props.
- `AD/array-search-form/ArraySearchForm.constants.ts` — remove `CONTEXT_LABEL`/`CONTEXT_PREFIX`/`CONTEXT_HINT`.
- `AD/array-search-form/ArraySearchForm.spec.tsx` — remove context fixture entries + `describe('context')`.
- `AD/search-tab/SearchTab.tsx` — render `ContextControl` above the table; drop context props on the form; import `ContextOption` from new home.
- `AD/search-tab/SearchTab.spec.tsx` — retarget context test ids.

---

## Task 1: Promote `InfoHint` to a shared location

`InfoHint` is currently a search-form internal but will be used by both the form and the new control. Move it up to `AD/components/InfoHint/` and repoint the form's import. The form must still render and its spec must still pass.

**Files:**
- Create: `AD/components/InfoHint/InfoHint.tsx`, `AD/components/InfoHint/InfoHint.types.ts`, `AD/components/InfoHint/index.ts`
- Delete: `AD/array-search-form/components/InfoHint.tsx`, `AD/array-search-form/components/InfoHint.types.ts`
- Modify: `AD/array-search-form/ArraySearchForm.tsx:68`

**Interfaces:**
- Produces: `InfoHint` component (`({ content }: InfoHintProps) => JSX.Element`) and `InfoHintProps` (`{ content: string }`) at `AD/components/InfoHint`.

- [ ] **Step 1: Create the shared `InfoHint.types.ts`**

`AD/components/InfoHint/InfoHint.types.ts`:
```ts
export interface InfoHintProps {
  content: string
}
```

- [ ] **Step 2: Create the shared `InfoHint.tsx`**

`AD/components/InfoHint/InfoHint.tsx`:
```tsx
import React from 'react'

import { RiTooltip } from 'uiSrc/components'
import { RiIcon } from 'uiSrc/components/base/icons'

import { InfoHintProps } from './InfoHint.types'

export const InfoHint = ({ content }: InfoHintProps) => (
  <RiTooltip content={content} position="top" anchorClassName="inline-flex">
    <RiIcon type="InfoIcon" size="m" />
  </RiTooltip>
)
```

- [ ] **Step 3: Create the barrel `index.ts`**

`AD/components/InfoHint/index.ts`:
```ts
export { InfoHint } from './InfoHint'
export type { InfoHintProps } from './InfoHint.types'
```

- [ ] **Step 4: Delete the old files**

Run:
```bash
git rm redisinsight/ui/src/pages/browser/modules/key-details/components/array-details/array-search-form/components/InfoHint.tsx \
       redisinsight/ui/src/pages/browser/modules/key-details/components/array-details/array-search-form/components/InfoHint.types.ts
```

- [ ] **Step 5: Repoint the form's import**

In `AD/array-search-form/ArraySearchForm.tsx`, change line 68 from:
```tsx
import { InfoHint } from './components/InfoHint'
```
to:
```tsx
import { InfoHint } from '../components/InfoHint'
```

- [ ] **Step 6: Verify the form spec still passes**

Run:
```bash
node 'node_modules/.bin/jest' 'redisinsight/ui/src/pages/browser/modules/key-details/components/array-details/array-search-form/ArraySearchForm.spec.tsx' -c 'jest.config.cjs'
```
Expected: PASS (all existing tests, unchanged).

- [ ] **Step 7: Commit**

```bash
git add redisinsight/ui/src/pages/browser/modules/key-details/components/array-details/components/InfoHint \
        redisinsight/ui/src/pages/browser/modules/key-details/components/array-details/array-search-form/ArraySearchForm.tsx
git commit -m "refactor(RI-8311): promote InfoHint to shared array-details/components"
```

---

## Task 2: Create the `ContextControl` component (TDD)

A self-contained presentational control: a Context toggle + info hint, the `±` prefix, and a clamped count input, wrapped in a subheader strip. Owns the moved `ContextOption` type and `CONTEXT_*` copy. Not yet wired into `SearchTab` (Task 3), so it compiles independently.

**Files:**
- Create: `AD/search-tab/ContextControl/ContextControl.types.ts`, `.constants.ts`, `.styles.ts`, `.tsx`, `.spec.tsx`, `index.ts`

**Interfaces:**
- Consumes: `InfoHint` from `AD/components/InfoHint` (Task 1); `CONTEXT_COUNT_MIN`, `CONTEXT_COUNT_MAX` from `AD/constants.ts` (existing).
- Produces:
  - `type ContextOption = { enabled: boolean; count: number }`
  - `interface ContextControlProps { context: ContextOption; onChange: (patch: Partial<ContextOption>) => void; disabled?: boolean }`
  - `ContextControl` component, exported from `AD/search-tab/ContextControl`.
  - Test ids: container `array-context-control`, toggle `array-context-control-toggle`, count input `array-context-control-count`.

- [ ] **Step 1: Write the failing spec**

`AD/search-tab/ContextControl/ContextControl.spec.tsx`:
```tsx
import React from 'react'
import {
  fireEvent,
  render,
  screen,
  userEvent,
  waitFor,
} from 'uiSrc/utils/test-utils'

import { ContextControl } from './ContextControl'
import { ContextControlProps } from './ContextControl.types'

const defaultProps: ContextControlProps = {
  context: { enabled: false, count: 5 },
  onChange: jest.fn(),
}

const renderComponent = (props: Partial<ContextControlProps> = {}) =>
  render(<ContextControl {...defaultProps} {...props} />)

describe('ContextControl', () => {
  it('keeps the count input disabled until the toggle is ticked', () => {
    const { rerender } = renderComponent()
    // Off by default → input present (so layout is stable) but disabled.
    expect(screen.getByTestId('array-context-control-count')).toBeDisabled()

    rerender(
      <ContextControl
        {...defaultProps}
        context={{ enabled: true, count: 5 }}
      />,
    )
    expect(screen.getByTestId('array-context-control-count')).toBeEnabled()
  })

  it('reports enabled when the toggle is ticked', () => {
    const onChange = jest.fn()
    renderComponent({ onChange })

    fireEvent.click(screen.getByTestId('array-context-control-toggle'))

    expect(onChange).toHaveBeenCalledWith({ enabled: true })
  })

  it('shows the passed count and clamps a typed value above the max to 50', async () => {
    const user = userEvent.setup()
    renderComponent({ context: { enabled: true, count: 5 } })

    const input = screen.getByTestId('array-context-control-count')
    // redis-ui NumericInput renders a text input, so the DOM value is a string.
    expect(input).toHaveValue('5')

    // autoValidate clamps onChange, but the field text only settles to the
    // clamped value on blur — so '99' stays verbatim while typing and resolves
    // to '50' once the input blurs.
    await user.clear(input)
    await user.type(input, '99')
    await user.tab()

    await waitFor(() => {
      expect(input).toHaveValue('50')
    })
  })

  it('reports a new count via onChange', () => {
    const onChange = jest.fn()
    renderComponent({ context: { enabled: true, count: 5 }, onChange })

    fireEvent.change(screen.getByTestId('array-context-control-count'), {
      target: { value: '8' },
    })

    expect(onChange).toHaveBeenCalledWith({ count: 8 })
  })

  it('disables both the toggle and the input when disabled', () => {
    renderComponent({ context: { enabled: true, count: 5 }, disabled: true })

    expect(screen.getByTestId('array-context-control-toggle')).toBeDisabled()
    expect(screen.getByTestId('array-context-control-count')).toBeDisabled()
  })
})
```

- [ ] **Step 2: Run the spec to verify it fails**

Run:
```bash
node 'node_modules/.bin/jest' 'redisinsight/ui/src/pages/browser/modules/key-details/components/array-details/search-tab/ContextControl/ContextControl.spec.tsx' -c 'jest.config.cjs'
```
Expected: FAIL — cannot find module `./ContextControl`.

- [ ] **Step 3: Create the types file**

`AD/search-tab/ContextControl/ContextControl.types.ts`:
```ts
/**
 * Per-match context window shown when a result row is expanded: a toggle plus
 * the ±N neighbour count. A display concern, kept out of the ARGREP command.
 */
export type ContextOption = {
  enabled: boolean
  count: number
}

export interface ContextControlProps {
  /** Current toggle + count state (owned by SearchTab). */
  context: ContextOption
  /** Patch the context state (partial merge). */
  onChange: (patch: Partial<ContextOption>) => void
  /**
   * Disables the toggle and the count input. Mirrors the Search form's prior
   * coupling to `isRefreshDisabled` so behavior is unchanged by the move.
   */
  disabled?: boolean
}
```

- [ ] **Step 4: Create the constants file**

`AD/search-tab/ContextControl/ContextControl.constants.ts`:
```ts
export const ARRAY_CONTEXT_CONTROL_TEST_ID = 'array-context-control'

export const CONTEXT_LABEL = 'Context'
export const CONTEXT_PREFIX = '±'
export const CONTEXT_HINT =
  'When expanding a match, also show ±N neighbouring elements.'
```

- [ ] **Step 5: Create the styles file**

`AD/search-tab/ContextControl/ContextControl.styles.ts`:
```ts
import styled from 'styled-components'
import { Checkbox } from 'uiSrc/components/base/forms/checkbox/Checkbox'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'

/** Subheader strip hosting the Context control directly above the results
 *  table, mirroring ViewTab's SubheaderContainer so the tabs feel like
 *  siblings. */
export const SubheaderContainer = styled(FlexItem)`
  padding: ${({ theme }) =>
    `${theme.core?.space.space150} ${theme.core?.space.space200} 0`};
`

/** Checkbox with its label's trailing padding removed so a following InfoHint
 *  hugs the text. That padding is on the inner <label>, not the
 *  className-bearing root, so it must be targeted as a descendant. */
export const InlineCheckbox = styled(Checkbox)`
  & label {
    padding-inline-end: 0;
    padding-right: 0;
  }
`

/** Compact fixed-width box so the count reads as a small inline field. */
export const NarrowInputBox = styled(Row)`
  width: 110px;
`
```

- [ ] **Step 6: Create the component**

`AD/search-tab/ContextControl/ContextControl.tsx`:
```tsx
import React from 'react'

import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { NumericInput } from 'uiSrc/components/base/inputs'
import { Text } from 'uiSrc/components/base/text'

import { InfoHint } from '../../components/InfoHint'
import { CONTEXT_COUNT_MAX, CONTEXT_COUNT_MIN } from '../../constants'
import {
  ARRAY_CONTEXT_CONTROL_TEST_ID as TEST_ID,
  CONTEXT_HINT,
  CONTEXT_LABEL,
  CONTEXT_PREFIX,
} from './ContextControl.constants'
import { ContextControlProps } from './ContextControl.types'
import * as S from './ContextControl.styles'

/**
 * Search-tab Context control: a display-only toggle + ±N neighbour count that
 * governs how a matched row expands. Rendered as a subheader strip directly
 * above the results table (not inside the search form) since it never enters
 * the ARGREP command.
 */
export const ContextControl = ({
  context,
  onChange,
  disabled = false,
}: ContextControlProps) => (
  <S.SubheaderContainer grow={false} data-testid={TEST_ID}>
    <Row align="center" gap="s" grow={false}>
      <FlexItem grow={false}>
        <Row align="center" gap="xs" grow={false}>
          <FlexItem grow={false}>
            <S.InlineCheckbox
              id={`${TEST_ID}-toggle`}
              name="array-search-context-toggle"
              label={CONTEXT_LABEL}
              checked={context.enabled}
              onChange={(e) => onChange({ enabled: e.target.checked })}
              disabled={disabled}
              data-testid={`${TEST_ID}-toggle`}
            />
          </FlexItem>
          <FlexItem grow={false}>
            <InfoHint content={CONTEXT_HINT} />
          </FlexItem>
        </Row>
      </FlexItem>
      <FlexItem grow={false}>
        <Text size="s">{CONTEXT_PREFIX}</Text>
      </FlexItem>
      {/* Always rendered so ticking Context doesn't shift the row; it just
          becomes editable once the toggle is on. */}
      <FlexItem grow={false}>
        <S.NarrowInputBox>
          <NumericInput
            autoValidate
            min={CONTEXT_COUNT_MIN}
            max={CONTEXT_COUNT_MAX}
            value={context.count}
            onChange={(next) =>
              onChange({
                count: Math.round(Number(next ?? CONTEXT_COUNT_MIN)),
              })
            }
            disabled={disabled || !context.enabled}
            data-testid={`${TEST_ID}-count`}
          />
        </S.NarrowInputBox>
      </FlexItem>
    </Row>
  </S.SubheaderContainer>
)
```

- [ ] **Step 7: Create the barrel**

`AD/search-tab/ContextControl/index.ts`:
```ts
export { ContextControl } from './ContextControl'
export type {
  ContextOption,
  ContextControlProps,
} from './ContextControl.types'
```

- [ ] **Step 8: Run the spec to verify it passes**

Run:
```bash
node 'node_modules/.bin/jest' 'redisinsight/ui/src/pages/browser/modules/key-details/components/array-details/search-tab/ContextControl/ContextControl.spec.tsx' -c 'jest.config.cjs'
```
Expected: PASS (5 tests).

- [ ] **Step 9: Commit**

```bash
git add redisinsight/ui/src/pages/browser/modules/key-details/components/array-details/search-tab/ContextControl
git commit -m "feat(RI-8311): add ContextControl component for the array Search tab"
```

---

## Task 3: Wire `ContextControl` into `SearchTab` and strip it from the form

Flip the wiring in one atomic change: render `ContextControl` above the table in `SearchTab`, remove the Context markup/props/type/constants from `ArraySearchForm`, and update both existing spec files. This is one deliverable — the form and container must change together or the build breaks.

**Files:**
- Modify: `AD/search-tab/SearchTab.tsx`
- Modify: `AD/search-tab/SearchTab.spec.tsx`
- Modify: `AD/array-search-form/ArraySearchForm.tsx`
- Modify: `AD/array-search-form/ArraySearchForm.types.ts`
- Modify: `AD/array-search-form/ArraySearchForm.constants.ts`
- Modify: `AD/array-search-form/ArraySearchForm.spec.tsx`

**Interfaces:**
- Consumes: `ContextControl` + `ContextOption` from `AD/search-tab/ContextControl` (Task 2).
- Produces: `ArraySearchFormProps` no longer has `context` / `onChangeContext`.

- [ ] **Step 1: Update `SearchTab.spec.tsx` test ids (write the new expectations first)**

In `AD/search-tab/SearchTab.spec.tsx`, replace every occurrence:
- `array-search-form-context-toggle` → `array-context-control-toggle`
- `array-search-form-context` (the count input) → `array-context-control-count`

Run (the `-toggle` substitution runs first, so the second one only matches the
bare count-input id — no word-boundary anchor needed):
```bash
sed -i '' \
  -e 's/array-search-form-context-toggle/array-context-control-toggle/g' \
  -e 's/array-search-form-context/array-context-control-count/g' \
  redisinsight/ui/src/pages/browser/modules/key-details/components/array-details/search-tab/SearchTab.spec.tsx
```
Then confirm no stale `array-search-form-context` ids remain (the reset button id `array-search-form-reset` must stay):
```bash
grep -n 'array-search-form-context\|array-context-control' redisinsight/ui/src/pages/browser/modules/key-details/components/array-details/search-tab/SearchTab.spec.tsx
```
Expected: only `array-context-control-toggle` / `array-context-control-count`; no bare `array-search-form-context`.

- [ ] **Step 2: Run `SearchTab.spec.tsx` to verify it fails**

Run:
```bash
node 'node_modules/.bin/jest' 'redisinsight/ui/src/pages/browser/modules/key-details/components/array-details/search-tab/SearchTab.spec.tsx' -c 'jest.config.cjs'
```
Expected: FAIL — the new test ids don't exist yet (Context still renders inside the form with old ids).

- [ ] **Step 3: Update `SearchTab.tsx` imports**

In `AD/search-tab/SearchTab.tsx`, replace this import (line 10):
```tsx
import { ContextOption } from '../array-search-form/ArraySearchForm.types'
```
with:
```tsx
import { ContextControl, ContextOption } from './ContextControl'
```

- [ ] **Step 4: Remove context props from the `<ArraySearchForm>` call**

In `AD/search-tab/SearchTab.tsx`, delete these two lines from the `<ArraySearchForm ... />` props (currently lines 87–88):
```tsx
        context={context}
        onChangeContext={onChangeContext}
```

- [ ] **Step 5: Render `ContextControl` above the table**

In `AD/search-tab/SearchTab.tsx`, replace the results block:
```tsx
        {!keyLoading && (loaded || loading) && (
          <S.TabTableWrapper>
            <ArrayDetailsTable
```
with:
```tsx
        {!keyLoading && (loaded || loading) && (
          <>
            <ContextControl
              context={context}
              onChange={onChangeContext}
              disabled={isRefreshDisabled}
            />
            <S.TabTableWrapper>
              <ArrayDetailsTable
```
and close the new fragment + wrapper: change the existing closing
```tsx
            />
          </S.TabTableWrapper>
        )}
```
to:
```tsx
              />
            </S.TabTableWrapper>
          </>
        )}
```
(The `<ArrayDetailsTable ... />` props between them are unchanged — only the indentation and the wrapping `<>`/`</>` fragment are added.)

- [ ] **Step 6: Remove the Context block from `ArraySearchForm.tsx`**

In `AD/array-search-form/ArraySearchForm.tsx`, delete the entire Context `<Row>` (currently lines 230–271):
```tsx
      <Row align="center" gap="s" grow={false}>
        <FlexItem grow={false}>
          <Row align="center" gap="xs" grow={false}>
            <FlexItem grow={false}>
              <S.InlineCheckbox
                id={`${TEST_ID}-context-toggle`}
                name="array-search-context-toggle"
                label={CONTEXT_LABEL}
                checked={context.enabled}
                onChange={(e) => onChangeContext({ enabled: e.target.checked })}
                disabled={disabled}
                data-testid={`${TEST_ID}-context-toggle`}
              />
            </FlexItem>
            <FlexItem grow={false}>
              <InfoHint content={CONTEXT_HINT} />
            </FlexItem>
          </Row>
        </FlexItem>
        <FlexItem grow={false}>
          <Text size="s">{CONTEXT_PREFIX}</Text>
        </FlexItem>
        {/* Always rendered so ticking Context doesn't shift the row; it just
            becomes editable once the toggle is on. */}
        <FlexItem grow={false}>
          <S.NarrowInputBox>
            <NumericInput
              autoValidate
              min={CONTEXT_COUNT_MIN}
              max={CONTEXT_COUNT_MAX}
              value={context.count}
              onChange={(next) =>
                onChangeContext({
                  count: Math.round(Number(next ?? CONTEXT_COUNT_MIN)),
                })
              }
              disabled={disabled || !context.enabled}
              data-testid={`${TEST_ID}-context`}
            />
          </S.NarrowInputBox>
        </FlexItem>
      </Row>
```

- [ ] **Step 7: Remove now-unused imports from `ArraySearchForm.tsx`**

In `AD/array-search-form/ArraySearchForm.tsx`:
- Remove the `NumericInput` import, changing (line 18):
  ```tsx
  import { NumericInput, TextInput } from 'uiSrc/components/base/inputs'
  ```
  to:
  ```tsx
  import { TextInput } from 'uiSrc/components/base/inputs'
  ```
- In the `'../constants'` import (lines 28–32), remove `CONTEXT_COUNT_MAX` and `CONTEXT_COUNT_MIN`, leaving:
  ```tsx
  import { DEFAULT_LIMIT } from '../constants'
  ```
- In the `'./ArraySearchForm.constants'` import (lines 34–65), remove the three lines `CONTEXT_HINT,`, `CONTEXT_LABEL,`, and `CONTEXT_PREFIX,`.

- [ ] **Step 8: Remove context props from `ArraySearchForm.tsx` signature**

In `AD/array-search-form/ArraySearchForm.tsx`, delete these two lines from the destructured props (currently lines 91–92):
```tsx
  context,
  onChangeContext,
```

- [ ] **Step 9: Remove `ContextOption` and context props from `ArraySearchForm.types.ts`**

In `AD/array-search-form/ArraySearchForm.types.ts`:
- Delete the `ContextOption` type (lines 7–15, the JSDoc block + `export type ContextOption = {...}`).
- Delete these two props from `ArraySearchFormProps` (lines 35–36):
  ```tsx
  context: ContextOption
  onChangeContext: (patch: Partial<ContextOption>) => void
  ```

- [ ] **Step 10: Remove context copy from `ArraySearchForm.constants.ts`**

In `AD/array-search-form/ArraySearchForm.constants.ts`, delete:
- `export const CONTEXT_LABEL = 'Context'`
- `export const CONTEXT_PREFIX = '±'`
- the `CONTEXT_HINT` block:
  ```ts
  export const CONTEXT_HINT =
    'When expanding a match, also show ±N neighbouring elements.'
  ```

- [ ] **Step 11: Remove the context fixture + describe block from `ArraySearchForm.spec.tsx`**

In `AD/array-search-form/ArraySearchForm.spec.tsx`:
- Delete these two lines from `defaultProps` (lines 33–34):
  ```tsx
  context: { enabled: false, count: 5 },
  onChangeContext: jest.fn(),
  ```
- Delete the entire `describe('context', () => { ... })` block (lines 195–254).

- [ ] **Step 12: Run all three affected specs**

Run:
```bash
node 'node_modules/.bin/jest' \
  'redisinsight/ui/src/pages/browser/modules/key-details/components/array-details/search-tab/SearchTab.spec.tsx' \
  'redisinsight/ui/src/pages/browser/modules/key-details/components/array-details/array-search-form/ArraySearchForm.spec.tsx' \
  'redisinsight/ui/src/pages/browser/modules/key-details/components/array-details/search-tab/ContextControl/ContextControl.spec.tsx' \
  -c 'jest.config.cjs'
```
Expected: PASS (all three files green).

- [ ] **Step 13: Commit**

```bash
git add redisinsight/ui/src/pages/browser/modules/key-details/components/array-details/search-tab \
        redisinsight/ui/src/pages/browser/modules/key-details/components/array-details/array-search-form
git commit -m "feat(RI-8311): render Context control above the Search results table"
```

---

## Task 4: Full verification

Lint and type-check the whole change; confirm no new TS-baseline errors.

**Files:** none (verification only).

- [ ] **Step 1: Lint the UI**

Run:
```bash
yarn lint:ui
```
Expected: no errors in the touched files.

- [ ] **Step 2: Type-check**

Run:
```bash
yarn type-check
```
Expected: PASS — no increase in `(file × error-code)` counts. If it reports a decrease/change caused by removing files, follow `.ai/skills/type-check-baselines/SKILL.md` (`yarn tscheck`) and commit the refreshed baseline.

- [ ] **Step 3: Re-run the array-details test folder**

Run:
```bash
node 'node_modules/.bin/jest' 'redisinsight/ui/src/pages/browser/modules/key-details/components/array-details' -c 'jest.config.cjs'
```
Expected: PASS.

- [ ] **Step 4: Commit any baseline refresh (only if Step 2 required it)**

```bash
git add -A && git commit -m "chore(RI-8311): refresh TS baselines after Context control move"
```

---

## Self-Review

**Spec coverage:**
- Extract `ContextControl` → Task 2. ✓
- Placement "only with results", above table → Task 3 Step 5 (inside `(loaded || loading)` gate). ✓
- Preserve behavior (`disabled={isRefreshDisabled}`, state/reset/key-switch unchanged) → Task 3 Steps 4–5; SearchTab state untouched. ✓
- Promote `InfoHint` → Task 1. ✓
- Remove Context from form + move type/constants → Task 3 Steps 6–10. ✓
- Tests: remove form context block, retarget SearchTab ids, add ContextControl spec → Task 3 Steps 1/11, Task 2. ✓
- Out of scope (ARGREP, results, NeighbourBand) untouched — no task changes them. ✓

**Placeholder scan:** none — all steps contain concrete code/commands.

**Type consistency:** `ContextOption` shape (`{ enabled: boolean; count: number }`) identical across Task 2 (new home) and its removal in Task 3; `ContextControlProps` uses `onChange` (control) while `SearchTab` passes `onChangeContext` as that prop — consistent with Task 3 Step 5. Test ids consistent: `array-context-control` / `-toggle` / `-count` across Tasks 2 and 3.
