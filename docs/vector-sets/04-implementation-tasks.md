# Vector Sets - Implementation Tasks

## Overview

This document breaks down the implementation into discrete engineering tasks, organized by iteration and dependency order.

**Scope**: Redis Insight Desktop and Docker only. Redis 8+ required.

---

## Iteration 1 - MVP

### Phase 1: Foundation (Backend)

> **Note**: Vector set commands will be dispatched through the existing `commands` module (`/databases/:id/commands`). No dedicated REST endpoints needed.

#### Task 1.1: Add Vector Set Data Type Definition

**Priority**: High | **Dependencies**: None

**Backend Changes:**

- [ ] Add `VectorSet = 'vectorset'` to `RedisDataType` enum in `key.dto.ts`
- [ ] Add vector set commands enum `BrowserToolVectorSetCommands` in `browser-tool-commands.ts`

**Files to modify:**

- `redisinsight/api/src/modules/browser/keys/dto/key.dto.ts`
- `redisinsight/api/src/modules/browser/constants/browser-tool-commands.ts`

---

#### Task 1.2: Implement VectorSet Key Info Strategy

**Priority**: High | **Dependencies**: Task 1.1

**Create strategy:**

- [ ] Create `vector-set.key-info.strategy.ts`
- [ ] Implement `getInfo()` method using VINFO (provides size, dim, quant-type)
- [ ] Register in `KeyInfoProvider`
- [ ] Update `keys.module.ts` providers

**Files to create/modify:**

- `redisinsight/api/src/modules/browser/keys/key-info/strategies/vector-set.key-info.strategy.ts`
- `redisinsight/api/src/modules/browser/keys/key-info/key-info.provider.ts`

---

#### Task 1.3: Backend Unit Tests

**Priority**: High | **Dependencies**: Task 1.2

**Write tests:**

- [ ] `vector-set.key-info.strategy.spec.ts` - Key info strategy tests

---

### Phase 2: Foundation (Frontend)

#### Task 2.1: Add Frontend Constants

**Priority**: High | **Dependencies**: None (can parallel with backend)

**Update constants:**

- [ ] Add `VectorSet` to `KeyTypes` enum in `constants/keys.ts`
- [ ] Add `GROUP_TYPES_DISPLAY` entry
- [ ] Add `GROUP_TYPES_COLORS` entry (purple: `#9B59B6`)
- [ ] Add vector set constants in `constants/vector-set.ts`

**Files to modify:**

- `redisinsight/ui/src/constants/keys.ts`
- `redisinsight/ui/src/constants/vector-set.ts` (new)

---

#### Task 2.2: Create Redux Slice

**Priority**: High | **Dependencies**: Task 2.1

**Create slice:**

- [ ] Create `slices/interfaces/vectorset.ts` - State interfaces
- [ ] Create `slices/browser/vectorset.ts` - Redux slice
- [ ] Implement reducers for all states
- [ ] Implement thunks that build and send commands via `commands` module
- [ ] Add selectors
- [ ] Register in browser slice combiner
- [ ] Implement version-specific element fetching logic:
  - For Redis 8.0 to <8.4: use `VRANDMEMBER count` (count=10)
  - For Redis ≥8.4: use `VRANGE key - + 10` (lexicographical range, stateless iterator)
  - **Detection approach**: Probe with `VRANGE` command - if error is "wrong number of arguments" then VRANGE is supported; if "unknown command" then fall back to VRANDMEMBER
  - **Note**: Version-based detection is unreliable because `INFO` command may be disabled via ACL/config

> **Note**: Thunks will build Redis commands (VINFO, VSIM, VEMB, VRANDMEMBER/VRANGE, etc.) and dispatch them through the existing commands infrastructure.

---

#### Task 2.3: Add Filter Key Type Option

**Priority**: High | **Dependencies**: Task 2.1

**Update filter:**

- [ ] Add Vector Set to `FILTER_KEY_TYPE_OPTIONS` in filter constants
- [ ] Add version check for Redis 8+

---

#### Task 2.4: Create VectorSetDetails Component Structure

**Priority**: High | **Dependencies**: Task 2.2

**Create component folder:**

- [ ] Create `vectorset-details/` folder
- [ ] Create `VectorSetDetails.tsx` (shell component)
- [ ] Create `VectorSetDetails.styles.ts`
- [ ] Create `index.ts` barrel export
- [ ] Create `components/` subfolder

---

#### Task 2.5: Implement VectorSetHeader Component

**Priority**: Medium | **Dependencies**: Task 2.4

**Create component:**

- [ ] Display vector dimension
- [ ] Display quantization type
- [ ] Display size
- [ ] Styled-components styles

---

#### Task 2.6: Implement VectorSetTable Component

**Priority**: High | **Dependencies**: Task 2.4

**Create component:**

- [ ] Table with columns: Element, Vector, Attributes, Actions
- [ ] `VectorDisplay` subcomponent (truncation, expand, copy)
  - Note: Vector truncation must be done on RI side - Redis has no native truncation feature
- [ ] `AttributesCell` subcomponent (JSON display, edit link)
- [ ] Delete button with confirmation popover
- [ ] Support for search results mode (with score column)
- [ ] Display up to 10 elements (no pagination for MVP)

---

#### Task 2.7: Implement VectorSetSearch Component

**Priority**: High | **Dependencies**: Task 2.4

**Create component:**

- [ ] Vector input (comma-separated numbers)
- [ ] Count input (1-1000)
- [ ] EF input (exploration factor)
- [ ] Filter input (JavaScript-like syntax)
- [ ] Search button with loading state
- [ ] Clear button
- [ ] Validation and error display
- [ ] Filter syntax help tooltip

---

#### Task 2.8: Implement AddVectorSetElement Component

**Priority**: High | **Dependencies**: Task 2.4

**Create component:**

- [ ] Element name input
- [ ] Vector input (textarea for comma-separated)
- [ ] Attributes input (Monaco editor for JSON)
- [ ] Validation (dimensions match, vector format)
- [ ] Submit/Cancel buttons

---

#### Task 2.9: Implement EditElementAttributes Component

**Priority**: Medium | **Dependencies**: Task 2.4

**Create component:**

- [ ] Monaco editor for JSON attributes
- [ ] Load existing attributes
- [ ] Save/Cancel buttons
- [ ] Validation (valid JSON)

---

#### Task 2.10: Integrate with DynamicTypeDetails

**Priority**: High | **Dependencies**: Tasks 2.4-2.9

**Update integration:**

- [ ] Import `VectorSetDetails` in `DynamicTypeDetails.tsx`
- [ ] Add to `TypeDetails` mapping

---

#### Task 2.11: Frontend Unit Tests

**Priority**: High | **Dependencies**: Tasks 2.4-2.10

**Write tests:**

- [ ] `VectorSetDetails.spec.tsx`
- [ ] `VectorSetHeader.spec.tsx`
- [ ] `VectorSetTable.spec.tsx`
- [ ] `VectorSetSearch.spec.tsx`
- [ ] `AddVectorSetElement.spec.tsx`
- [ ] Redux slice tests (reducers + thunks)
- [ ] Create test factories using Fishery

---

#### Task 2.12: Backend - Create Vector Set Endpoint

**Priority**: High | **Dependencies**: Task 1.3

- [ ] Implement `createVectorSet()` in service
- [ ] Add `POST /` endpoint for creating new keys
- [ ] Handle TTL/expiration
- [ ] Validation for initial elements
- [ ] `create-vector-set.dto.ts` with validation decorators

---

#### Task 2.13: Frontend - Add Key Type Option

**Priority**: High | **Dependencies**: Task 2.1

- [ ] Add Vector Set to `ADD_KEY_TYPE_OPTIONS`
- [ ] Version check for Redis 8+

---

#### Task 2.14: Frontend - AddVectorSet Form Component

**Priority**: High | **Dependencies**: Task 2.2

- [ ] Key name input
- [ ] First element inputs (name, vector, attributes)
- [ ] TTL input
- [ ] Quantization options (optional)
- [ ] Validation (unique elements, correct format, matching dimensions)
- [ ] Integration with Add Key flow

---

#### Task 2.15: Create Vector Set Tests

**Priority**: High | **Dependencies**: Tasks 2.12-2.14

- [ ] Backend tests for create endpoint
- [ ] Frontend component tests for AddVectorSet
- [ ] E2E tests for create flow

---

### Phase 3: Integration & Polish

#### Task 3.1: Add Telemetry Events

**Priority**: Medium | **Dependencies**: Tasks 2.4-2.10

**Add events:**

- [ ] `BROWSER_KEY_TYPE_FILTER_VECTORSET` - User filters by vector set type
- [ ] `BROWSER_VECTORSET_SEARCH` - Similarity search performed
- [ ] `BROWSER_VECTORSET_ELEMENT_ADDED` - Element added to vector set
- [ ] `BROWSER_VECTORSET_ELEMENT_REMOVED` - Element removed from vector set
- [ ] `BROWSER_VECTORSET_ATTRIBUTES_UPDATED` - Attributes updated
- [ ] `BROWSER_VECTORSET_CREATED` - New vector set created (Iteration 2)

---

#### Task 3.2: Error Handling & Validation

**Priority**: High | **Dependencies**: All implementation tasks

**Implement:**

- [ ] Vector dimension validation (frontend + backend)
- [ ] Vector format validation (FP32 or VALUES)
- [ ] Unique element name validation
- [ ] Graceful error display for Redis errors
- [ ] Loading states for all async operations

---

#### Task 3.3: Copy/Download Functionality

**Priority**: Medium | **Dependencies**: Task 2.6

**Implement:**

- [ ] Copy element name
- [ ] Copy vector to clipboard
- [ ] Download entire vector to file

---

#### Task 3.4: Large Key Handling

**Priority**: Medium | **Dependencies**: All implementation tasks

**Implement:**

- [ ] Truncate large vectors in display (configurable limit)
- [ ] Truncate large JSON attributes in list view
- [ ] Full view in Monaco editor for attributes
- [ ] Ensure truncated JSON remains valid format

---

#### Task 3.5: Search by Element Name

**Priority**: High | **Dependencies**: Task 2.7

**Implement:**

- [ ] Element name search input
- [ ] Filter elements list by name (RI-side filtering - VRANGE/VRANDMEMBER don't support prefix filtering)
- [ ] Integrate with search mode toggle

> **Future Enhancement**: String prefix filtering could be added later, but must be implemented on RI side as Redis commands don't support it.

---

#### Task 3.6: Filter Auto-Suggest

**Priority**: Medium | **Dependencies**: Task 2.7

**Implement:**

- [ ] Detect `.` input in filter field
- [ ] Fetch available attribute keys from first N elements
- [ ] Display autocomplete dropdown with attribute suggestions
- [ ] Insert selected attribute into filter input

---

#### Task 3.7: Sample Data Generation

**Priority**: Medium | **Dependencies**: Tasks 2.4-2.8

> **Note**: Team needs to assess word2vec for dynamic demo data. If effort is too large, use static demo data instead. Aim for a few days effort.

**Implement:**

- [ ] Sample vectors dataset (word2vec dynamic OR static - TBD)
- [ ] Sample element names with attributes
- [ ] "Generate Sample" button in add element form
- [ ] Use "sample\_" prefix for sample data keys
- [ ] Sample vectors for search input

---

#### Task 3.8: Data Formatters

**Priority**: Medium | **Dependencies**: Task 2.6

**Implement:**

- [ ] "Vector 32-bit" formatter for FP32 vectors
- [ ] No formatter for floating numbers as strings
- [ ] JSON formatter for attributes

---

#### Task 3.9: Delete Confirmation UX

**Priority**: Low | **Dependencies**: Task 2.6

**Implement:**

- [ ] Confirmation message format: "{elementName}\nwill be removed from {keyName}\n[Remove]"

---

#### Task 3.10: E2E Tests

**Priority**: High | **Dependencies**: All implementation tasks

**Write tests:**

- [ ] Display vector set in Browser
- [ ] Filter by vector set type
- [ ] View vector set details and metadata
- [ ] Add element to vector set
- [ ] Delete element from vector set (with confirmation)
- [ ] Similarity search by vector
- [ ] Search by element name
- [ ] Filter search results by attributes
- [ ] Update element attributes
- [ ] Copy/download vector

---

## Iteration 1 Summary

| Phase                | Task Count |
| -------------------- | ---------- |
| Backend Foundation   | 10         |
| Frontend Foundation  | 15         |
| Integration & Polish | 10         |
| **Total**            | **35**     |

**Target**: Sprint 195 (Nov 4-17, 2025)

---

## Iteration 2 - Import & Sample Data

**Target**: Sprint 196 (Nov 18 - Dec 1, 2025)

### Task 2.1: Sample Data Integration

**Priority**: Medium

- [ ] Pre-populate with word2vec sample vectors
- [ ] "Generate Sample" button in create form
- [ ] Use "sample\_" prefix for sample keys

---

### Task 2.2: Import from CSV (TBD)

**Priority**: Medium

- [ ] CSV file upload
- [ ] Column mapping for element name, vector, attributes
- [ ] Embedding generation (TBD - format and approach)

---

### Task 2.3: Tests

**Priority**: High

- [ ] E2E tests for sample data
- [ ] E2E tests for import flow

---

## Iteration 2 Summary

| Task             |
| ---------------- |
| Sample Data      |
| CSV Import (TBD) |
| Tests            |

---

## Iteration 4 - Add Elements to Existing Sets (Future)

### Task 4.1: Enhanced Add Element Flow

**Priority**: Medium

- [ ] Improved add element UI
- [ ] Batch add multiple elements
- [ ] Progress indicator for large batches

---

### Task 4.2: Tests

**Priority**: Medium

- [ ] Unit and E2E tests for enhanced add flow

---

## Iteration 5 - File Import (Future)

### Task 5.1: Upload Vectors from File

**Priority**: Low

- [ ] File upload interface
- [ ] Support for adding embedding to new or existing vector set
- [ ] Support for search by uploaded vector
- [ ] Multiple files (1 file per element)
- [ ] Do not load file content to UI

---

### Task 5.2: Tests

**Priority**: Low

- [ ] File upload tests

---

## Future - Visualization (Unscheduled)

### Task F.1: Backend - Links/Graph Data

**Priority**: Low

- [ ] Implement VLINKS command support
- [ ] Endpoint for graph data

---

### Task F.2: Frontend - 2D Visualization Component

**Priority**: Low

- [ ] Dimensionality reduction (t-SNE/UMAP in browser or backend)
- [ ] Canvas/SVG visualization
- [ ] Hover element details
- [ ] Selection and distance lines to other vectors

---

### Task F.3: Integration

**Priority**: Low

- [ ] Tab for visualization view
- [ ] Toggle between table and visual

---

## Dependencies Diagram

```
                    ┌─────────────────────────────────────┐
                    │     Task 1.1: Data Type Definition   │
                    └───────────────┬─────────────────────┘
                                    │
                    ┌───────────────▼─────────────────────┐
                    │     Task 1.2: Module Structure       │
                    └───────────────┬─────────────────────┘
                                    │
                    ┌───────────────▼─────────────────────┐
                    │     Task 1.3: DTOs                   │
                    └───────────────┬─────────────────────┘
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        │                           │                           │
┌───────▼───────┐           ┌───────▼───────┐           ┌───────▼───────┐
│ Task 1.4:     │           │ Task 1.5:     │           │ Task 1.6:     │
│ Get Elements  │           │ Modify        │           │ Search        │
└───────┬───────┘           └───────┬───────┘           └───────┬───────┘
        │                           │                           │
        └───────────────────────────┼───────────────────────────┘
                                    │
                    ┌───────────────▼─────────────────────┐
                    │     Task 1.7: Controller             │
                    └───────────────┬─────────────────────┘
                                    │
                    ┌───────────────▼─────────────────────┐
                    │     Task 1.8: Module Registration    │
                    └─────────────────────────────────────┘


FRONTEND (can parallel with backend after Task 2.1):

┌─────────────────────┐
│ Task 2.1: Constants │
└─────────┬───────────┘
          │
          ├───────────────────────────────┐
          │                               │
┌─────────▼───────────┐         ┌─────────▼───────────┐
│ Task 2.2: Redux     │         │ Task 2.3: Filter    │
└─────────┬───────────┘         └─────────────────────┘
          │
┌─────────▼───────────────────┐
│ Task 2.4: Component Shell   │
└─────────┬───────────────────┘
          │
          ├─────────────┬─────────────┬─────────────┐
          │             │             │             │
┌─────────▼─────┐ ┌─────▼─────┐ ┌─────▼─────┐ ┌─────▼─────┐
│ 2.5: Header   │ │ 2.6: Table│ │ 2.7: Search│ │ 2.8: Add  │
└───────────────┘ └───────────┘ └───────────┘ └───────────┘
```

---

## Risk Mitigation

| Risk                                     | Mitigation                                                 |
| ---------------------------------------- | ---------------------------------------------------------- |
| Redis 8 not widely available for testing | Use Redis 8 Docker image, mock commands for unit tests     |
| Vector command behavior changes          | Follow Redis documentation closely, add integration tests  |
| Large vectors performance                | Implement truncation, lazy loading, pagination             |
| Complex attribute filter syntax          | Provide examples, syntax highlighting, validation feedback |

---

## Definition of Done

### Per Task

- [ ] Code implemented following project patterns
- [ ] Unit tests written and passing
- [ ] Code reviewed
- [ ] No linter errors
- [ ] Documentation updated if needed

### Per Iteration

- [ ] All tasks completed
- [ ] E2E tests passing
- [ ] Telemetry events implemented
- [ ] Performance acceptable
- [ ] QA sign-off
