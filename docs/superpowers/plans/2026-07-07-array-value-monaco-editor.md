# Array Value Monaco Popup Editor — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an opt-in "expand to Monaco editor" affordance to array element values, opening a modal plaintext editor whose Save reuses the existing ARSET apply path.

**Architecture:** The shared `EditableTextArea` gains one optional `secondaryAction` render slot (undefined = unchanged for every other consumer). `ArrayValueCell` renders an expand `IconButton` into that slot, owns a modal-open state, and renders a new `ArrayValueEditorModal` (base `Modal` + thin `CodeEditor` in plaintext). The modal's Save routes through the existing production-write confirmation and the cell's existing `onApply` prop → `handleApplyEditElement` → `updateArrayElementAction` (ARSET). No Redux, thunk, or backend changes.

**Tech Stack:** React 18, TypeScript, `@redis-ui/components` `Modal`, `react-monaco-editor` via `uiSrc/components/base/code-editor`, Jest + Testing Library.

## Global Constraints

- Frontend only — touch only files under `redisinsight/ui/`.
- Arrays only — no behavior change for list or any other `EditableTextArea` consumer (achieved by making the new prop optional/undefined by default).
- Plaintext editor — `language="plaintext"`, no JSON/YAML syntax mode, no diagnostics.
- No validation gate — the modal Save button is always enabled.
- Reuse existing write path — Save calls the cell's existing `onApply(value: string)`; do NOT add new Redux actions/thunks/endpoints.
- Reuse existing production-write confirmation — `useProductionWriteConfirmation` with `BrowserConfirmationCommandId.EditValue`, mirroring the inline path in `EditableTextArea`.
- Naming: `PascalCase` components, `camelCase` functions/vars, `is/has/should` boolean prefixes. No `any` without reason. No `!important` in styles.
- Run `yarn lint:ui` and `yarn type-check` before the final commit; both must pass.
- Tests: use `render` from `uiSrc/utils/test-utils`, `faker` for data, `waitFor` (never fixed time waits).

## File Structure

- Modify: `redisinsight/ui/src/pages/browser/modules/key-details/shared/editable-textarea/EditableTextArea.tsx` — add optional `secondaryAction?: React.ReactNode`, render it beside the hover pencil in the non-editing branch.
- Modify: `redisinsight/ui/src/pages/browser/modules/key-details/shared/editable-textarea/EditableTextArea.spec.tsx` — cover the new slot (renders when passed, absent otherwise).
- Create: `.../array-details/array-details-table/components/ArrayValueEditorModal.tsx` — modal + plaintext `CodeEditor` + Save/Cancel.
- Create: `.../array-details/array-details-table/components/ArrayValueEditorModal.types.ts` — props interface.
- Create: `.../array-details/array-details-table/components/ArrayValueEditorModal.spec.tsx` — seed, Save, Cancel behavior.
- Modify: `.../array-details/array-details-table/components/ArrayValueCell.tsx` — modal state, seed, expand trigger, production-write confirmation on Save.
- Create: `.../array-details/array-details-table/components/ArrayValueCell.spec.tsx` — trigger opens modal seeded with value; disabled parity; empty slot has no trigger; Save funnels to `onApply`.

**Path prefix** (used verbatim below):
`redisinsight/ui/src/pages/browser/modules/key-details/components/array-details/array-details-table/components/`

---

## Task 1: Add optional `secondaryAction` slot to `EditableTextArea`

**Files:**
- Modify: `redisinsight/ui/src/pages/browser/modules/key-details/shared/editable-textarea/EditableTextArea.tsx`
- Test: `redisinsight/ui/src/pages/browser/modules/key-details/shared/editable-textarea/EditableTextArea.spec.tsx`

**Interfaces:**
- Consumes: nothing new.
- Produces: `EditableTextArea` `Props` gains `secondaryAction?: React.ReactNode`. When provided, it renders inside the non-editing hover container, immediately before the existing edit pencil. When omitted, markup is byte-for-byte unchanged.

- [ ] **Step 1: Write the failing tests**

Append to `EditableTextArea.spec.tsx`:

```tsx
  it('should render secondaryAction next to the edit pencil on hover', () => {
    render(
      <EditableTextArea
        {...mockedProps}
        isEditing={false}
        field="field"
        testIdPrefix="item"
        onEdit={jest.fn()}
        secondaryAction={
          <button type="button" data-testid="secondary-action">
            expand
          </button>
        }
      >
        <Text />
      </EditableTextArea>,
    )

    fireEvent.mouseEnter(screen.getByTestId('item_content-value-field'))

    expect(screen.getByTestId('secondary-action')).toBeInTheDocument()
    expect(screen.getByTestId('item_edit-btn-field')).toBeInTheDocument()
  })

  it('should not render any secondary action when the prop is omitted', () => {
    render(
      <EditableTextArea
        {...mockedProps}
        isEditing={false}
        field="field"
        testIdPrefix="item"
        onEdit={jest.fn()}
      >
        <Text />
      </EditableTextArea>,
    )

    fireEvent.mouseEnter(screen.getByTestId('item_content-value-field'))

    expect(screen.queryByTestId('secondary-action')).not.toBeInTheDocument()
    expect(screen.getByTestId('item_edit-btn-field')).toBeInTheDocument()
  })
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node 'node_modules/.bin/jest' 'redisinsight/ui/src/pages/browser/modules/key-details/shared/editable-textarea/EditableTextArea.spec.tsx' -c 'jest.config.cjs' -t 'secondary'`
Expected: FAIL — the first test can't find `secondary-action` (prop not rendered yet).

- [ ] **Step 3: Add the prop to the `Props` interface**

In `EditableTextArea.tsx`, add to `interface Props` (after `editToolTipContent?: React.ReactNode`):

```tsx
  /** Optional control rendered beside the hover edit pencil in the
   *  non-editing state. Undefined for every consumer except the array value
   *  cell, so all other consumers are unchanged. */
  secondaryAction?: React.ReactNode
```

- [ ] **Step 4: Destructure the prop**

In the component body destructure (add near `editToolTipContent`):

```tsx
    editToolTipContent,
    secondaryAction,
```

- [ ] **Step 5: Render the slot beside the pencil**

In the non-editing branch, wrap the pencil and the new slot so both show on hover. Replace the existing hover block:

```tsx
        {isHovering && (
          <RiTooltip
            content={editToolTipContent}
            anchorClassName={styles.editBtnAnchor}
            data-testid={`${testIdPrefix}_edit-tooltip-${field}`}
          >
            <IconButton
              icon={EditIcon}
              aria-label="Edit field"
              className={cx('editFieldBtn', styles.editBtn)}
              disabled={isEditDisabled}
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation()
                onEdit?.(true)
                setIsHovering(false)
              }}
              data-testid={`${testIdPrefix}_edit-btn-${field}`}
            />
          </RiTooltip>
        )}
```

with:

```tsx
        {isHovering && (
          <>
            {secondaryAction}
            <RiTooltip
              content={editToolTipContent}
              anchorClassName={styles.editBtnAnchor}
              data-testid={`${testIdPrefix}_edit-tooltip-${field}`}
            >
              <IconButton
                icon={EditIcon}
                aria-label="Edit field"
                className={cx('editFieldBtn', styles.editBtn)}
                disabled={isEditDisabled}
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation()
                  onEdit?.(true)
                  setIsHovering(false)
                }}
                data-testid={`${testIdPrefix}_edit-btn-${field}`}
              />
            </RiTooltip>
          </>
        )}
```

- [ ] **Step 6: Run the tests to verify they pass**

Run: `node 'node_modules/.bin/jest' 'redisinsight/ui/src/pages/browser/modules/key-details/shared/editable-textarea/EditableTextArea.spec.tsx' -c 'jest.config.cjs'`
Expected: PASS (all tests, including the two new ones).

- [ ] **Step 7: Commit**

```bash
git add redisinsight/ui/src/pages/browser/modules/key-details/shared/editable-textarea/EditableTextArea.tsx redisinsight/ui/src/pages/browser/modules/key-details/shared/editable-textarea/EditableTextArea.spec.tsx
git commit -m "feat(ui): add optional secondaryAction slot to EditableTextArea"
```

---

## Task 2: Create `ArrayValueEditorModal`

**Files:**
- Create: `<prefix>/ArrayValueEditorModal.types.ts`
- Create: `<prefix>/ArrayValueEditorModal.tsx`
- Test: `<prefix>/ArrayValueEditorModal.spec.tsx`

(`<prefix>` = the path prefix in File Structure.)

**Interfaces:**
- Consumes: `CodeEditor` from `uiSrc/components/base/code-editor`; `Modal` from `uiSrc/components/base/display`; `PrimaryButton`, `SecondaryButton` from `uiSrc/components/base/forms/buttons`.
- Produces:
  ```ts
  export interface ArrayValueEditorModalProps {
    isOpen: boolean
    index: string
    initialValue: string
    title?: React.ReactNode
    onSave: (value: string) => void
    onClose: () => void
  }
  export const ArrayValueEditorModal: React.FC<ArrayValueEditorModalProps>
  ```
  Save calls `onSave(currentValue)`; Cancel/close calls `onClose()`. The editor is plaintext and Save is always enabled.

- [ ] **Step 1: Write the types file**

Create `<prefix>/ArrayValueEditorModal.types.ts`:

```ts
import React from 'react'

export interface ArrayValueEditorModalProps {
  /** Controls modal visibility. */
  isOpen: boolean
  /** Index of the element being edited (used for stable test ids). */
  index: string
  /** Serialized value the editor is seeded with each time it opens. */
  initialValue: string
  /** Optional modal title. */
  title?: React.ReactNode
  /** Called with the current editor value when the user clicks Save. */
  onSave: (value: string) => void
  /** Called when the user cancels or closes the modal. */
  onClose: () => void
}
```

- [ ] **Step 2: Write the failing test**

Create `<prefix>/ArrayValueEditorModal.spec.tsx`:

```tsx
import React from 'react'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'

import { ArrayValueEditorModal } from './ArrayValueEditorModal'

jest.mock('uiSrc/components/base/code-editor', () => {
  const ReactMock = require('react')
  return {
    __esModule: true,
    CodeEditor: (props: any) =>
      ReactMock.createElement('textarea', {
        'data-testid': 'array-value-code-editor',
        value: props.value,
        onChange: (e: any) => props.onChange?.(e.target.value),
      }),
  }
})

const defaultProps = {
  isOpen: true,
  index: '0',
  initialValue: 'hello',
  onSave: jest.fn(),
  onClose: jest.fn(),
}

const renderComponent = (props = {}) =>
  render(<ArrayValueEditorModal {...defaultProps} {...props} />)

describe('ArrayValueEditorModal', () => {
  beforeEach(() => jest.clearAllMocks())

  it('seeds the editor with initialValue when open', () => {
    renderComponent()
    expect(screen.getByTestId('array-value-code-editor')).toHaveValue('hello')
  })

  it('calls onSave with the edited value', () => {
    const onSave = jest.fn()
    renderComponent({ onSave })

    fireEvent.change(screen.getByTestId('array-value-code-editor'), {
      target: { value: 'edited value' },
    })
    fireEvent.click(screen.getByTestId('array-value-editor-save-btn'))

    expect(onSave).toHaveBeenCalledWith('edited value')
  })

  it('calls onClose and not onSave when cancelled', () => {
    const onSave = jest.fn()
    const onClose = jest.fn()
    renderComponent({ onSave, onClose })

    fireEvent.click(screen.getByTestId('array-value-editor-cancel-btn'))

    expect(onClose).toHaveBeenCalled()
    expect(onSave).not.toHaveBeenCalled()
  })

  it('re-seeds the editor from initialValue when reopened', () => {
    const { rerender } = renderComponent({ initialValue: 'first' })
    fireEvent.change(screen.getByTestId('array-value-code-editor'), {
      target: { value: 'dirty' },
    })

    rerender(
      <ArrayValueEditorModal {...defaultProps} isOpen={false} initialValue="first" />,
    )
    rerender(
      <ArrayValueEditorModal {...defaultProps} isOpen initialValue="second" />,
    )

    expect(screen.getByTestId('array-value-code-editor')).toHaveValue('second')
  })
})
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `node 'node_modules/.bin/jest' '<prefix>/ArrayValueEditorModal.spec.tsx' -c 'jest.config.cjs'`
Expected: FAIL — module `./ArrayValueEditorModal` not found.

- [ ] **Step 4: Implement the component**

Create `<prefix>/ArrayValueEditorModal.tsx`:

```tsx
import React, { useEffect, useState } from 'react'

import { Modal } from 'uiSrc/components/base/display'
import { CancelIcon } from 'uiSrc/components/base/icons'
import { CodeEditor } from 'uiSrc/components/base/code-editor'
import { Row } from 'uiSrc/components/base/layout/flex'
import {
  PrimaryButton,
  SecondaryButton,
} from 'uiSrc/components/base/forms/buttons'

import { ArrayValueEditorModalProps } from './ArrayValueEditorModal.types'

const EDITOR_HEIGHT = '60vh'

/**
 * Modal plaintext Monaco editor for a single array element value. A roomier
 * alternative to the inline textarea; Save funnels through the same ARSET
 * apply path the inline editor uses. Values are arbitrary strings, so the
 * editor is plaintext and Save is never validation-gated.
 */
export const ArrayValueEditorModal = ({
  isOpen,
  index,
  initialValue,
  title = 'Edit value',
  onSave,
  onClose,
}: ArrayValueEditorModalProps) => {
  const [value, setValue] = useState(initialValue)

  // Re-seed from initialValue every time the modal opens, so reopening after
  // a cancel discards the previous in-progress edit.
  useEffect(() => {
    if (isOpen) setValue(initialValue)
  }, [isOpen, initialValue])

  if (!isOpen) return null

  return (
    <Modal.Compose open>
      <Modal.Content.Compose persistent onCancel={onClose}>
        <Modal.Content.Close
          icon={CancelIcon}
          onClick={onClose}
          data-testid="array-value-editor-close-btn"
        />

        <Modal.Content.Header.Compose>
          <Modal.Content.Header.Title data-testid="array-value-editor-title">
            {title}
          </Modal.Content.Header.Title>
        </Modal.Content.Header.Compose>

        <Modal.Content.Body
          content={
            <CodeEditor
              language="plaintext"
              value={value}
              onChange={setValue}
              height={EDITOR_HEIGHT}
              data-testid="array-value-code-editor"
              options={{
                wordWrap: 'on',
                automaticLayout: true,
                minimap: { enabled: false },
              }}
            />
          }
        />

        <Modal.Content.Footer.Compose>
          <Modal.Content.Footer.Group>
            <Row gap="m" justify="end">
              <SecondaryButton
                size="l"
                onClick={onClose}
                data-testid="array-value-editor-cancel-btn"
              >
                Cancel
              </SecondaryButton>
              <PrimaryButton
                size="l"
                onClick={() => onSave(value)}
                data-testid={`array-value-editor-save-btn`}
                aria-label={`Save value for index ${index}`}
              >
                Save
              </PrimaryButton>
            </Row>
          </Modal.Content.Footer.Group>
        </Modal.Content.Footer.Compose>
      </Modal.Content.Compose>
    </Modal.Compose>
  )
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `node 'node_modules/.bin/jest' '<prefix>/ArrayValueEditorModal.spec.tsx' -c 'jest.config.cjs'`
Expected: PASS (4 tests).

> If `Modal.Content.Body`'s `content` prop rejects a non-`ReactElement`, wrap the editor in a `<div>`; the test drives the mocked `CodeEditor` regardless.

- [ ] **Step 6: Commit**

```bash
git add '<prefix>/ArrayValueEditorModal.tsx' '<prefix>/ArrayValueEditorModal.types.ts' '<prefix>/ArrayValueEditorModal.spec.tsx'
git commit -m "feat(ui): add ArrayValueEditorModal plaintext Monaco editor"
```

---

## Task 3: Wire the expand trigger + modal into `ArrayValueCell`

**Files:**
- Modify: `<prefix>/ArrayValueCell.tsx`
- Test: `<prefix>/ArrayValueCell.spec.tsx`

**Interfaces:**
- Consumes: `EditableTextArea` `secondaryAction` (Task 1); `ArrayValueEditorModal` (Task 2); `useProductionWriteConfirmation`, `BrowserConfirmationCommandId` from `uiSrc/components/production-write-confirmation`; `ExtendIcon` from `uiSrc/components/base/icons`; `IconButton` from `uiSrc/components/base/forms/buttons`; `bufferToSerializedFormat` from `uiSrc/utils` (already imported in the file).
- Produces: no new exports; `ArrayValueCellProps` is unchanged (still `onApply?: (value: string) => void`).

- [ ] **Step 1: Write the failing tests**

Create `<prefix>/ArrayValueCell.spec.tsx`:

```tsx
import React from 'react'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'
import { stringToBuffer } from 'uiSrc/utils'
import { KeyValueFormat } from 'uiSrc/constants'

import { ArrayValueCell } from './ArrayValueCell'

jest.mock('uiSrc/components/base/code-editor', () => {
  const ReactMock = require('react')
  return {
    __esModule: true,
    CodeEditor: (props: any) =>
      ReactMock.createElement('textarea', {
        'data-testid': 'array-value-code-editor',
        value: props.value,
        onChange: (e: any) => props.onChange?.(e.target.value),
      }),
  }
})

// Auto-confirm the production-write prompt so Save reaches onApply in tests.
jest.mock('uiSrc/components/production-write-confirmation', () => ({
  __esModule: true,
  useProductionWriteConfirmation: () => ({
    requestConfirmation: ({ onConfirm }: any) => onConfirm(),
  }),
  BrowserConfirmationCommandId: { EditValue: 'EditValue' },
}))

const TEST_ID_PREFIX = 'array-details-table'

const baseProps = {
  index: '0',
  value: stringToBuffer('hello'),
  compressor: null,
  viewFormat: KeyValueFormat.Unicode,
}

describe('ArrayValueCell', () => {
  beforeEach(() => jest.clearAllMocks())

  it('renders an expand trigger that opens the modal seeded with the value', () => {
    render(<ArrayValueCell {...baseProps} onEdit={jest.fn()} onApply={jest.fn()} />)

    fireEvent.mouseEnter(
      screen.getByTestId(`${TEST_ID_PREFIX}_content-value-0`),
    )
    fireEvent.click(screen.getByTestId(`${TEST_ID_PREFIX}_expand-btn-0`))

    expect(screen.getByTestId('array-value-code-editor')).toHaveValue('hello')
  })

  it('Save calls onApply with the edited value', () => {
    const onApply = jest.fn()
    render(<ArrayValueCell {...baseProps} onEdit={jest.fn()} onApply={onApply} />)

    fireEvent.mouseEnter(
      screen.getByTestId(`${TEST_ID_PREFIX}_content-value-0`),
    )
    fireEvent.click(screen.getByTestId(`${TEST_ID_PREFIX}_expand-btn-0`))
    fireEvent.change(screen.getByTestId('array-value-code-editor'), {
      target: { value: 'world' },
    })
    fireEvent.click(screen.getByTestId('array-value-editor-save-btn'))

    expect(onApply).toHaveBeenCalledWith('world')
  })

  it('renders no expand trigger for an empty slot', () => {
    render(
      <ArrayValueCell
        {...baseProps}
        value={null as any}
        onEdit={jest.fn()}
        onApply={jest.fn()}
      />,
    )

    expect(screen.getByTestId(`${TEST_ID_PREFIX}-empty-0`)).toBeInTheDocument()
    expect(
      screen.queryByTestId(`${TEST_ID_PREFIX}_expand-btn-0`),
    ).not.toBeInTheDocument()
  })

  it('disables the expand trigger while a write is in flight', () => {
    render(
      <ArrayValueCell
        {...baseProps}
        updating
        onEdit={jest.fn()}
        onApply={jest.fn()}
      />,
    )

    fireEvent.mouseEnter(
      screen.getByTestId(`${TEST_ID_PREFIX}_content-value-0`),
    )

    expect(screen.getByTestId(`${TEST_ID_PREFIX}_expand-btn-0`)).toBeDisabled()
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node 'node_modules/.bin/jest' '<prefix>/ArrayValueCell.spec.tsx' -c 'jest.config.cjs'`
Expected: FAIL — no `_expand-btn-0` test id (trigger not implemented).

- [ ] **Step 3: Add imports to `ArrayValueCell.tsx`**

Add these imports alongside the existing ones:

```tsx
import React, { useState } from 'react'

import { ExtendIcon } from 'uiSrc/components/base/icons'
import { IconButton } from 'uiSrc/components/base/forms/buttons'
import {
  BrowserConfirmationCommandId,
  useProductionWriteConfirmation,
} from 'uiSrc/components/production-write-confirmation'

import { ArrayValueEditorModal } from './ArrayValueEditorModal'
```

(Replace the existing `import React from 'react'` line with the `useState` form.)

- [ ] **Step 4: Add modal state, seed, and Save handler**

Inside the component, after the `serializedValue` computation and before the `return`, add:

```tsx
  const { requestConfirmation } = useProductionWriteConfirmation()
  const [isModalOpen, setIsModalOpen] = useState(false)
  // Seeded lazily on open so we don't serialize every row's buffer on render.
  const [modalSeed, setModalSeed] = useState('')

  const openModal = () => {
    setModalSeed(bufferToSerializedFormat(viewFormat, decompressedBuffer, 4))
    setIsModalOpen(true)
  }

  const handleModalSave = (editedValue: string) => {
    requestConfirmation({
      title: 'Edit value on production database?',
      actionDescription:
        'You are about to modify a value on a production database.',
      confirmButtonText: 'Save',
      commandId: BrowserConfirmationCommandId.EditValue,
      disableConfirmationInput: true,
      onConfirm: () => {
        onApply?.(editedValue)
        setIsModalOpen(false)
      },
    })
  }
```

- [ ] **Step 5: Pass the expand trigger and render the modal**

Add the `secondaryAction` prop to the `<EditableTextArea>` (next to `editToolTipContent`):

```tsx
      secondaryAction={
        <IconButton
          icon={ExtendIcon}
          aria-label="Expand value editor"
          disabled={!isEditable || updating || loading}
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation()
            openModal()
          }}
          data-testid={`${TEST_ID_PREFIX}_expand-btn-${index}`}
        />
      }
```

Then wrap the returned `EditableTextArea` in a fragment and render the modal after it. Change the `return (` block so it is:

```tsx
  return (
    <>
      <EditableTextArea
        {/* ...all existing props, now including secondaryAction... */}
      >
        {/* ...existing children... */}
      </EditableTextArea>
      <ArrayValueEditorModal
        isOpen={isModalOpen}
        index={index}
        initialValue={modalSeed}
        onSave={handleModalSave}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  )
```

- [ ] **Step 6: Run the tests to verify they pass**

Run: `node 'node_modules/.bin/jest' '<prefix>/ArrayValueCell.spec.tsx' -c 'jest.config.cjs'`
Expected: PASS (4 tests).

- [ ] **Step 7: Run the neighboring suites for regressions**

Run: `node 'node_modules/.bin/jest' 'redisinsight/ui/src/pages/browser/modules/key-details/components/array-details/array-details-table' 'redisinsight/ui/src/pages/browser/modules/key-details/shared/editable-textarea' -c 'jest.config.cjs'`
Expected: PASS (all array-table + editable-textarea specs).

- [ ] **Step 8: Lint and type-check**

Run: `yarn lint:ui && yarn type-check`
Expected: no new errors. (If `yarn type-check` reports baseline drift, follow `.ai/skills/type-check-baselines/SKILL.md` — do not run `yarn tscheck` casually.)

- [ ] **Step 9: Commit**

```bash
git add '<prefix>/ArrayValueCell.tsx' '<prefix>/ArrayValueCell.spec.tsx'
git commit -m "feat(ui): open array element values in a Monaco popup editor"
```

---

## Manual verification (after Task 3)

- [ ] Run the app (`yarn dev:desktop` or `yarn dev:ui`), open an array key (behind the `dev-array` flag), hover a populated element value → confirm both the pencil and the expand icon appear.
- [ ] Click expand → Monaco modal opens seeded with the current value; edit multi-line text; Save → value updates (ARSET), modal closes.
- [ ] Cancel discards; empty slots show no expand icon; compressed / non-editable format disables the expand icon.

## Self-Review notes (author)

- **Spec coverage:** opt-in slot (Task 1) ✓; modal + plaintext CodeEditor + Save/Cancel (Task 2) ✓; cell wiring, seed, disabled parity, production-write confirmation, reuse of `onApply`→ARSET (Task 3) ✓; arrays-only via optional prop ✓; no validation gate ✓; tests ✓.
- **Placeholders:** none — all steps contain concrete code/commands. `<prefix>` is a spelled-out path abbreviation, expanded in File Structure.
- **Type consistency:** `secondaryAction?: React.ReactNode` (Task 1) matches the JSX passed in Task 3; `onSave(value: string)`/`onClose()` (Task 2 types) match the calls in Task 3; `onApply?: (value: string) => void` is the existing cell prop, unchanged.
