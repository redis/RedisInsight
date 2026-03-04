# Implementation Plan: Fix MessagePack DateTimeOffset deserialization

**JIRA Ticket:** [RI-8106](https://redislabs.atlassian.net/browse/RI-8106)
**GitHub Issue:** [#5540](https://github.com/redis/RedisInsight/issues/5540)
**Parent Epic:** [RED-179652](https://redislabs.atlassian.net/browse/RED-179652) - Support GitHub Issues
**Plan Date:** 2026-03-02
**Planner:** Cursor Agent

---

## Executive Summary

The `postProcessLz4` function in the MessagePack decoder destroys `Date` objects by treating them as plain objects and iterating their (empty) enumerable properties. The fix is a one-line guard clause, plus unit tests.

**Components Affected:**

- `redisinsight/ui/src/utils/formatters/msgpack/decoder.ts`
- `redisinsight/ui/src/utils/formatters/msgpack/decoder.spec.ts`

**Key Risks:**

1. Regression in other MessagePack-decoded values — mitigated by existing comprehensive test suite
2. Other non-plain object types may also be silently destroyed — mitigated by extending the guard to cover `Date` (and potentially `RegExp`, `Map`, `Set` in future)
3. Nanosecond precision loss — `Date` only supports millisecond precision; accepted tradeoff documented below

---

## 1. Requirements Summary

**Story (Why):**
When a .NET application serializes an object with a `DateTimeOffset` property using MessagePack-CSharp and stores it in Redis, RedisInsight displays the value incorrectly as `[{}, 0]` instead of a readable datetime string.

**Acceptance Criteria (What):**

1. MessagePack values containing timestamp extension type (-1) should decode as ISO 8601 date strings in the UI
2. The fix should not break any existing MessagePack decoding behavior
3. .NET `DateTimeOffset` values (serialized as `[timestamp, offset_minutes]`) should display correctly

**Functional Requirements:**

- `Date` objects produced by `msgpackr` must survive the `postProcessLz4` post-processing step
- `JSONBigInt.stringify()` must receive `Date` objects (which it converts to ISO strings) rather than empty objects

**Non-Functional Requirements:**

- No performance impact (removing a branch from the recursive walker is net-positive)
- Nanosecond precision beyond milliseconds is lost due to JavaScript `Date` limitations — this is acceptable

**Resources Provided:**

- [GitHub Issue #5540](https://github.com/redis/RedisInsight/issues/5540): Original bug report with repro steps

---

## 2. Current State Analysis

### Root Cause

Confirmed and reproduced via direct byte-level testing (no .NET app needed).

**Deserialization pipeline:**

```
Redis binary value
  → msgpackr Unpackr.unpack()        # Correctly decodes timestamp ext(-1) → Date object
  → postProcessLz4()                  # BUG: treats Date as plain object → {}
  → JSONBigInt.stringify()            # Receives {} instead of Date
  → UI displays {}
```

**The bug** is in `postProcessLz4()` at lines 42-52 of `decoder.ts`:

```typescript
if (
  typeof value === 'object' &&
  value !== null &&
  !(value instanceof Uint8Array)   // ← Date is not Uint8Array, so it falls through
) {
  const result: Record<string, unknown> = {}
  for (const [key, val] of Object.entries(value)) {  // ← Date has no enumerable own properties
    result[key] = postProcessLz4(val, decoder)
  }
  return result  // ← Returns {} — the Date is destroyed
}
```

`Object.entries(new Date())` returns `[]`, so the Date is replaced with `{}`.

### Frontend Changes

**Components to Modify:**

- `redisinsight/ui/src/utils/formatters/msgpack/decoder.ts`: Add `Date` instanceof guard in `postProcessLz4`
- `redisinsight/ui/src/utils/formatters/msgpack/decoder.spec.ts`: Add timestamp extension test cases

**Components to Create:**

- None

**Components to Reuse:**

- Existing `decodeMsgpackWithLz4` function and test infrastructure

### Backend Changes

- None required — all MessagePack decoding happens in the frontend

---

## 3. Implementation Plan

### Phase 1: Fix the decoder (single PR)

**Goal:** Preserve `Date` objects through the `postProcessLz4` post-processing step

**Tasks:**

1. [ ] Add `Date` instanceof guard to `postProcessLz4` in `decoder.ts`
   - Files: `redisinsight/ui/src/utils/formatters/msgpack/decoder.ts`
   - Change: Add `!(value instanceof Date)` to the object-processing condition at line 45
   - Acceptance: `Date` objects pass through `postProcessLz4` unchanged

2. [ ] Add unit tests for timestamp extension decoding in `decoder.spec.ts`
   - Files: `redisinsight/ui/src/utils/formatters/msgpack/decoder.spec.ts`
   - Add a new `describe('timestamp extension')` block with tests for:
     - fixext4 timestamp (4-byte seconds)
     - fixext8 timestamp (8-byte with nanoseconds)
     - .NET DateTimeOffset pattern: `[timestamp, offset_minutes]` as part of a larger array
   - Acceptance: All new tests pass, existing tests still pass

3. [ ] Verify no regressions
   - Run full `decoder.spec.ts` test suite
   - Run `valueFormatters` tests if they exist
   - Acceptance: All tests pass

**Deliverables:**

- Fixed `decoder.ts` with `Date` guard
- Comprehensive test cases for timestamp extension types

**Testing:**

- Unit tests with hand-crafted MessagePack binary bytes (no .NET dependency)

---

## 4. Detailed Code Changes

### `decoder.ts` — Line 42-45

**Before:**

```typescript
if (
  typeof value === 'object' &&
  value !== null &&
  !(value instanceof Uint8Array)
)
```

**After:**

```typescript
if (
  typeof value === 'object' &&
  value !== null &&
  !(value instanceof Uint8Array) &&
  !(value instanceof Date)
)
```

### `decoder.spec.ts` — New test block

Add a `describe('timestamp extension')` block using these MessagePack binary formats:

| Format | Bytes | Description |
|--------|-------|-------------|
| fixext4 | `0xd6, 0xff, <4 bytes>` | Seconds as uint32 |
| fixext8 | `0xd7, 0xff, <8 bytes>` | Nanoseconds (30 bits) + seconds (34 bits) |
| .NET DateTimeOffset | `0x92, [fixext4 timestamp], [offset_minutes]` | Array of [timestamp, offset] |
| Full Class1 | `0x93, [DateTimeOffset], int, bool` | Full .NET object from bug report |

---

## 5. Testing Strategy

### Test Scenarios (from Acceptance Criteria)

**AC1: Timestamp extension decodes as Date**

- Given: MessagePack binary containing fixext4 timestamp extension (type -1)
- When: Decoded with `decodeMsgpackWithLz4`
- Then: Result is a `Date` instance with correct timestamp
- Test Type: Unit
- Test Location: `decoder.spec.ts`

**AC2: No regression in existing decoding**

- Given: All existing test cases in `decoder.spec.ts`
- When: Tests run after the fix
- Then: All pass unchanged
- Test Type: Unit
- Test Location: `decoder.spec.ts`

**AC3: .NET DateTimeOffset pattern displays correctly**

- Given: MessagePack binary for `[[timestamp, 0], 534, false]` (the exact pattern from the bug report)
- When: Decoded with `decodeMsgpackWithLz4` and stringified with `JSONBigInt.stringify`
- Then: Result contains an ISO date string, not `{}`
- Test Type: Unit
- Test Location: `decoder.spec.ts`

### Edge Cases and Error Scenarios

1. **Standalone timestamp (not in DateTimeOffset array)**
   - Scenario: Timestamp extension used directly as a value
   - Expected: Decoded as `Date` object
   - Test: fixext4 timestamp as root value

2. **Timestamp inside a map**
   - Scenario: `{ "created": <timestamp_ext> }`
   - Expected: `{ "created": Date }` — Date preserved
   - Test: Object with timestamp extension value

3. **Timestamp with nanoseconds (fixext8)**
   - Scenario: 8-byte timestamp with nanosecond precision
   - Expected: Decoded as Date (nanoseconds truncated to milliseconds)
   - Test: fixext8 timestamp encoding

### Test Data

All test data is hand-crafted MessagePack binary — no .NET application or Redis instance required. The bytes follow the [MessagePack timestamp extension spec](https://github.com/msgpack/msgpack/blob/master/spec.md#timestamp-extension-type).

---

## 6. Risk Assessment and Mitigation

### Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Fix breaks other msgpack decoding | Low | High | Comprehensive existing test suite (25+ tests) |
| Other object types also destroyed by postProcessLz4 | Low | Medium | Date is the most common; others (Map, Set) are unlikely in msgpack output |
| Nanosecond precision loss | Medium | Low | JavaScript Date limitation; acceptable for display purposes |

### Integration Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| JSONBigInt handles Date differently than expected | Low | Medium | Verified experimentally: both JSON.stringify and JSONBigInt.stringify convert Date to ISO string |

### Timeline Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| None significant | — | — | Fix is a one-line change plus tests |

### Knowledge Gaps

- None remaining — root cause confirmed via byte-level reproduction
