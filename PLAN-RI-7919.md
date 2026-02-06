# RI-7919: Pick Sample Data Modal — Implementation Plan

## Overview

Build a modal dialog for the Vector Search "Create Index" flow that lets users pick a sample dataset before creating an index. The modal is a pure presentational component — all data and handlers are received via props. The parent (wired in RI-7920) owns the state and decides what to do with the selection.

**Figma**: https://www.figma.com/design/XzRB64PQsD4U16Yjp3IQZs/RI-Vector-Search---RI-UI?node-id=8261-80267&m=dev
**Jira**: https://redislabs.atlassian.net/browse/RI-7919

---

## What We're Building (from Figma)

- Centered modal (660px wide, rounded, drop shadow)
- Illustration header (folder icons image)
- Heading: "Getting your sample data ready for Search"
- Subtitle: "Select a sample dataset.\nWe'll load the data and generate the index needed for search."
- 2 radio-style selection cards (bordered cards with radio indicator):
  - **E-commerce Discovery** — "Discover products that match intent, not just text"
  - **Content recommendations** — "Discover content by theme or plot."
- Footer with 3 actions:
  - Left: **Cancel** (text button)
  - Right: **See index definition** (outlined button) + **Start querying** (filled primary button)
- Validation: "Start querying" disabled until a selection is made

---

## New Files

### `redisinsight/ui/src/pages/vector-search/components/pick-sample-data-modal/`

| File                              | Purpose                                          |
| --------------------------------- | ------------------------------------------------ |
| `PickSampleDataModal.tsx`         | Main modal component                             |
| `PickSampleDataModal.styles.ts`   | Styled-components for modal layout and cards      |
| `PickSampleDataModal.constants.ts`| Sample data options configuration                 |
| `PickSampleDataModal.types.ts`    | Types/enums for sample data selection             |
| `PickSampleDataModal.spec.tsx`    | Unit tests                                       |
| `PickSampleDataModal.stories.tsx` | Storybook story with example parent wiring        |
| `index.ts`                        | Re-export                                        |

---

## Files to Modify

| File                                                              | Change                           |
| ----------------------------------------------------------------- | -------------------------------- |
| `redisinsight/ui/src/pages/vector-search/components/index.ts`     | Add PickSampleDataModal export   |

---

## Component Architecture

```
PickSampleDataModal (props: isOpen, selectedDataset, onSelectDataset, onCancel, onSeeIndexDefinition, onStartQuerying)
├── Modal.Compose (from uiSrc/components/base/display)
│   └── StyledModalContent (styled Modal.Content.Compose, width: 660px)
│       ├── Modal.Content.Close (X button, top-right)
│       ├── Illustration (folder icons SVG/PNG asset)
│       ├── Heading (28px, semibold, centered)
│       ├── Subtitle (14px, regular)
│       ├── RadioCardGroup (using RiRadioGroupRoot for accessibility)
│       │   ├── RadioCard: E-commerce Discovery
│       │   │   ├── Radio indicator (RiRadioGroupItemIndicator)
│       │   │   ├── Title: "E-commerce Discovery" (14px, medium)
│       │   │   └── Description: "Discover products that match intent..." (12px, regular, secondary)
│       │   └── RadioCard: Content recommendations
│       │       ├── Radio indicator
│       │       ├── Title: "Content recommendations"
│       │       └── Description: "Discover content by theme or plot."
│       └── Footer (flex, space-between)
│           ├── Cancel (TextButton, left-aligned)
│           └── Right group
│               ├── See index definition (outlined Button)
│               └── Start querying (primary filled Button, disabled if no selection)
```

---

## Props Interface

```typescript
export interface PickSampleDataModalProps {
  isOpen: boolean
  selectedDataset: SampleDataContent | null
  onSelectDataset: (value: SampleDataContent) => void
  onCancel: () => void
  onSeeIndexDefinition: (selectedDataset: SampleDataContent) => void
  onStartQuerying: (selectedDataset: SampleDataContent) => void
}
```

- The modal is **fully controlled** — no internal state for the selection
- `isOpen` — parent controls visibility
- `selectedDataset` + `onSelectDataset` — controlled radio selection (like a controlled input)
- `onCancel` — called by Cancel button and Close (X) button
- `onSeeIndexDefinition` — called by "See index definition" button
- `onStartQuerying` — called by "Start querying" button
- Both action buttons are disabled when `selectedDataset` is `null`

---

## Types & Constants

### Types (`PickSampleDataModal.types.ts`)

```typescript
export enum SampleDataContent {
  E_COMMERCE_DISCOVERY = 'e-commerce-discovery',
  CONTENT_RECOMMENDATIONS = 'content-recommendations',
}

export interface SampleDataOption {
  value: SampleDataContent
  label: string
  description: string
}
```

### Constants (`PickSampleDataModal.constants.ts`)

```typescript
export const SAMPLE_DATA_OPTIONS: SampleDataOption[] = [
  {
    value: SampleDataContent.E_COMMERCE_DISCOVERY,
    label: 'E-commerce Discovery',
    description: 'Discover products that match intent, not just text',
  },
  {
    value: SampleDataContent.CONTENT_RECOMMENDATIONS,
    label: 'Content recommendations',
    description: 'Discover content by theme or plot.',
  },
]
```

---

## Key Design Decisions

1. **Modal pattern**: Use `Modal.Compose` directly (not `FormDialog`) because this modal has a custom layout with illustration header — not a standard header/body/footer.

2. **Radio selection cards**: Use `RiRadioGroupRoot` + `RiRadioGroupItemRoot` from `uiSrc/components/base/forms/radio-group/RadioGroup` wrapped in styled bordered card containers. This gives accessible radio semantics with the visual card style from Figma.

3. **Pure props-driven component**: No internal state management (no Context, no Redux). All data and handlers come via props. The parent owns the state and decides where/how to store it. This keeps the modal maximally reusable and testable.

4. **Reuse vs. decouple from deprecated types**: Define fresh `SampleDataContent` enum in the new types file. The deprecated wizard has the same values — we can consolidate later if needed but keeping them separate avoids coupling to deprecated code.

5. **Illustration asset**: Use `redisinsight/ui/src/assets/img/vector-search/sample-data-modal-img.svg` for the folder icons illustration.

---

## Styling Approach

- **styled-components** (project convention)
- Theme tokens:
  - Colors: `theme.semantic.color.text.dusk[800]`, `theme.semantic.color.border.dusk[200]`, etc.
  - Spacing: `theme.core.space.*`
- Modal content width: `660px`
- Card: `border: 1px solid` + `border-radius: 4px` + `padding: 12px 16px`
- Selected card radio: filled circle with `theme.semantic.color.background.ui[600]`
- No `!important`, no hardcoded pixel values for spacing (use theme)

---

## Testing Plan (`PickSampleDataModal.spec.tsx`)

| Test case                                                    | Type     |
| ------------------------------------------------------------ | -------- |
| Renders nothing when `isOpen` is false                        | Render   |
| Renders modal content when `isOpen` is true                   | Render   |
| Renders both sample data option cards                         | Render   |
| Selecting a card updates the radio indicator                  | Interact |
| "Start querying" button is disabled with no selection          | Validate |
| "Start querying" calls `onStartQuerying` with selected value   | Interact |
| "Cancel" button calls `onCancel`                              | Interact |
| "See index definition" calls `onSeeIndexDefinition`           | Interact |
| Close (X) button calls `onCancel`                             | Interact |

---

## Execution Order

1. Create `PickSampleDataModal.types.ts` — enums and interfaces
2. Create `PickSampleDataModal.constants.ts` — options config
3. Create `PickSampleDataModal.styles.ts` — styled modal + card components
4. Create `PickSampleDataModal.tsx` — main component
5. Create `index.ts` — re-export
6. Update `vector-search/components/index.ts` — barrel export
7. Create `PickSampleDataModal.spec.tsx` — tests
8. Create `PickSampleDataModal.stories.tsx` — Storybook with example parent wiring (useState for selection + modal open/close)
9. Run `yarn lint:ui`, `yarn type-check:ui`, `yarn test` to verify

---

## Out of Scope (handled by RI-7920)

- Wiring the modal into the actual Create Index flow / page routing
- State management for the selection (parent decides: useState, Redux, Context, etc.)
- Triggering the modal from the "Try with sample data" button
- Verifying whether a sample data index already exists in the database
