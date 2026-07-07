# Array Value — Monaco Popup Editor (Design)

**Status:** Approved (design)
**Author:** Pavel Angelov
**Date:** 2026-07-07
**Scope:** Frontend only (`redisinsight/ui/`)

## TL;DR

Array element values currently edit through a single-line-growing inline
`<textarea>`. This adds an **"expand to editor" affordance** that opens a
**modal Monaco editor** for the same element, giving users a comfortable
surface for large or multi-line values. The inline textarea stays; the modal
is an additional, opt-in path. **Arrays only.** Values are treated as
**plaintext** (no syntax mode), and Save is **never gated on validation**
(array values are arbitrary strings).

The write path is unchanged: the modal's Save reuses the exact `onApply`
callback the cell already wires to `handleApplyEditElement` →
`updateArrayElementAction` (ARSET). No Redux, thunk, or backend changes.

## Goals

- Let users edit an array element value in a roomy Monaco editor via a modal,
  without removing the quick inline edit.
- Reuse the existing edit/apply plumbing (ARSET) — no new state or endpoints.
- Keep the change scoped to the array type; leave list and every other
  `EditableTextArea` consumer behaviorally unchanged.

## Non-Goals

- List or any other key type (the shared editor gains only an *opt-in* slot;
  no other consumer passes it).
- JSON/YAML syntax highlighting or validation in the editor (plaintext only).
- Validation-gated Save (Save is always enabled).
- Any backend / API / DTO / Redux thunk changes.
- Replacing the inline textarea.

## Current behavior (baseline)

- Value column cell: [`ArrayValueCell`](../../../redisinsight/ui/src/pages/browser/modules/key-details/components/array-details/array-details-table/components/ArrayValueCell.tsx)
  renders the shared
  [`EditableTextArea`](../../../redisinsight/ui/src/pages/browser/modules/key-details/shared/editable-textarea/EditableTextArea.tsx).
- `EditableTextArea` shows a hover **pencil** in the non-editing state; clicking
  it flips to an inline `<textarea>` wrapped in `InlineItemEditor`
  (apply/decline, production-write confirmation).
- Edit state + apply live one level up in
  [`ArrayDetailsTable`](../../../redisinsight/ui/src/pages/browser/modules/key-details/components/array-details/array-details-table/ArrayDetailsTable.tsx):
  `editingIndex`, `handleEditElement(index, isEditing)`,
  `handleApplyEditElement(index, value)` → `updateArrayElementAction` (ARSET).
  These are passed through the table `meta` → `ArrayDetailsTable.config` →
  `ArrayValueCell` (`onEdit`, `onApply`).
- The editable string is the serialized value
  `bufferToSerializedFormat(viewFormat, decompressedBuffer, 4)`.
- Edit is **disabled** for: compressed payloads and non-round-trippable formats
  (`!isEditable`), while a write/read is in flight (`updating || loading`), and
  the editor is **disabled** for unprintable characters (`isUnprintable`).
  Empty (gap) slots render a muted "Empty" and are not editable.

## Approach

Chosen after weighing alternatives (see [Alternatives](#alternatives)):

- **Trigger integration — opt-in prop on the shared editor.** Add an optional
  render slot to `EditableTextArea` for a secondary action rendered next to the
  hover pencil. Arrays pass an expand icon; every other consumer passes nothing
  and is unchanged.
- **Monaco wrapper — the thin `CodeEditor`.** Use
  [`CodeEditor`](../../../redisinsight/ui/src/components/base/code-editor/CodeEditor.tsx)
  (`react-monaco-editor` wrapper, auto-injects theme) rather than the richer
  `components/monaco-editor/MonacoEditor` shell. The shell carries its own
  inline apply/decline + pencil, which duplicate what the modal already
  provides. The modal owns Save/Cancel; the editor is just an input.

## Components & changes

### 1. `EditableTextArea` (shared) — opt-in secondary action

- Add an optional prop, e.g. `secondaryAction?: React.ReactNode`.
- In the **non-editing** hover branch, render `secondaryAction` immediately
  next to the existing pencil `IconButton` (same hover container).
- Default `undefined` → identical markup/behavior for list and all other
  current consumers. This is the only shared-code change.

### 2. `ArrayValueEditorModal` (new)

Location: `array-details/array-details-table/components/ArrayValueEditorModal.tsx`.

- Props: `isOpen`, `index`, `initialValue: string`, `title?`, `onSave(value: string)`,
  `onClose()`.
- Renders the base `modal`
  ([`uiSrc/components/base/display/modal`](../../../redisinsight/ui/src/components/base/display/modal))
  containing `CodeEditor` with `language="plaintext"`, a controlled `value`
  seeded from `initialValue`, and `onChange`.
- Footer: **Save** and **Cancel**. Save is always enabled (no validation gate).
  Cancel / Esc / overlay-close discards local edits.
- Local `value` state is (re)seeded from `initialValue` each time the modal
  opens, so reopening after a cancel starts clean.

### 3. `ArrayValueCell` — own the modal, pass the trigger

- Add local `isModalOpen` state.
- Compute the seed string with the same
  `bufferToSerializedFormat(viewFormat, decompressedBuffer, 4)` used for inline
  editing (available regardless of `isEditing`).
- Build an **expand `IconButton`** and pass it as `EditableTextArea`'s
  `secondaryAction`. Its `disabled` mirrors inline edit exactly:
  `!isEditable || updating || loading`; not rendered for empty slots; and
  respects `isUnprintable`/compressed the same way the pencil does (shared
  tooltip messaging where applicable).
- Wire `onSave` to the **existing** `onApply(value)` prop (→
  `handleApplyEditElement(index, value)`), so the modal and the inline editor
  funnel through one code path.

## Data flow

```
hover cell → expand icon (ArrayValueCell)
   → open ArrayValueEditorModal (seed = bufferToSerializedFormat(...))
      → edit in CodeEditor (plaintext)
      → Save
         → useProductionWriteConfirmation (prod DB prompt, same as inline)
         → onApply(value)                         [existing cell prop]
         → handleApplyEditElement(index, value)   [ArrayDetailsTable]
         → updateArrayElementAction(...) → ARSET   [existing thunk]
      → Cancel/Esc → close, discard
```

- **Production-write confirmation:** Save routes through the existing
  `useProductionWriteConfirmation` (as the inline path does) so editing a value
  on a production database still prompts.
- **Serialization on Save:** `handleApplyEditElement` already runs
  `stringToSerializedBufferFormat(viewFormat, value)` before dispatch, so the
  modal passes the raw edited string exactly like the inline editor.

## Error / edge handling

- **Disabled parity:** the expand trigger is disabled/hidden under precisely the
  same conditions as the inline pencil (compressed, non-editable format,
  in-flight write/read, empty slot, unprintable).
- **Key change / tab switch mid-edit:** the modal is owned by the cell, which
  unmounts when the row leaves the view; `ArrayDetailsTable` already abandons
  edit sessions on real key change / tab switch, and the ARSET session-guard
  (`editSessionRef`) still applies to the apply callback.
- **No validation gate:** invalid/odd content saves as-is (plaintext contract).

## Testing

- `ArrayValueEditorModal.spec.tsx`:
  - opens seeded with `initialValue`;
  - editing then **Save** calls `onSave`/`onApply` with the edited value;
  - **Cancel**/Esc closes and does **not** call `onSave`;
  - Save routes through production-write confirmation.
- `ArrayValueCell` (or `EditableTextArea`) test:
  - expand trigger renders and opens the modal;
  - trigger disabled for compressed / non-editable / in-flight;
  - no trigger for empty slots.
- Follow the testing skill: `renderComponent`, `faker`, `waitFor` (no fixed
  waits).

## Alternatives

- **Trigger via an array-only hover overlay in `ArrayValueCell`** (no shared
  change). Rejected: duplicates hover logic and is harder to align with the
  pencil; the opt-in prop is a smaller, cleaner change that still leaves other
  consumers untouched.
- **Reuse `components/monaco-editor/MonacoEditor` shell.** Rejected: its
  built-in inline apply/decline + pencil duplicate the modal's controls; the
  thin `CodeEditor` is the intended abstraction point for a plain editor.

## Rollout

No feature flag required — this is an incremental affordance on an existing
(flagged) array surface, gated by the same `dev-array` flag that gates the
array type itself. Ships behind that flag with the rest of the array work.
