# Vector Sets - Technical Design Document

## Overview

This document outlines the technical design for implementing Vector Sets support in Redis Insight. Vector Sets are a new data type introduced in Redis 8, designed for vector similarity search and high-dimensional vector embeddings storage.

**Epic**: [RED-157732](https://redislabs.atlassian.net/browse/RED-157732)  
**Figma Designs**: [Vector Sets Design](https://www.figma.com/design/MO62zaV0GYQbpLuBeaKDBy/RI-Vector-Sets?node-id=365-46361)

---

## Scope

**Platforms**: Redis Insight Desktop and Docker  
**Redis Version**: 8+ only. Vector sets functionality should not appear for Redis versions < 8.

---

## Architecture Overview

### System Components

Following the existing Redis Insight architecture, Vector Sets will have their own **dedicated module** under `browser/`, similar to Hash, List, Set, ZSet, and other data types.

**Existing Architecture Pattern (Browser key display):**

- `POST /api/databases/<dbID>/keys/get-info` → Returns key metadata (type, TTL, size)
- `POST /api/databases/<dbID>/<type>/get-value` or `/get-elements` → Returns type-specific data

**For Vector Sets, we follow the same pattern:**

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (React)                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐  ┌──────────────────┐  ┌───────────────┐  │
│  │ VectorSetDetails │  │ AddVectorSet     │  │ VectorSearch  │  │
│  │ Component        │  │ Component        │  │ Component     │  │
│  └────────┬─────────┘  └────────┬─────────┘  └───────┬───────┘  │
│           │                     │                    │          │
│           └─────────────────────┼────────────────────┘          │
│                                 │                               │
│  ┌──────────────────────────────▼────────────────────────────┐  │
│  │  Redux Slice (vectorset.ts)                                │  │
│  │  - Calls vector-set API endpoints                          │  │
│  │  - Manages UI state for vector set display                 │  │
│  └──────────────────────────────┬────────────────────────────┘  │
└─────────────────────────────────┼───────────────────────────────┘
                                  │ REST API
┌─────────────────────────────────▼───────────────────────────────┐
│                      Backend (NestJS)                            │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  KeysModule (extended)                                    │   │
│  │  POST /api/databases/:id/keys/get-info                    │   │
│  │  - VectorSetKeyInfoStrategy (uses VINFO for metadata)     │   │
│  │  - Returns: type='vectorset', ttl, length (element count) │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  VectorSetModule (new, follows ZSetModule pattern)        │   │
│  │  ├── VectorSetController                                  │   │
│  │  │   POST /api/databases/:id/vector-set           (create)│   │
│  │  │   POST /api/databases/:id/vector-set/get-elements      │   │
│  │  │   POST /api/databases/:id/vector-set/search    (VSIM)  │   │
│  │  │   PUT  /api/databases/:id/vector-set           (add)   │   │
│  │  │   DELETE /api/databases/:id/vector-set/elements (VREM) │   │
│  │  └── VectorSetService                                     │   │
│  │      - Executes Redis commands (VADD, VSIM, VINFO, etc.)  │   │
│  │      - Handles version-specific logic (VRANGE vs VRANDMEMBER)│ │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────┬───────────────────────────────┘
                                  │ Redis Commands
┌─────────────────────────────────▼───────────────────────────────┐
│                         Redis 8+                                 │
│  VADD | VREM | VINFO | VRANDMEMBER | VRANGE | VSIM | VGETATTR   │
│  VSETATTR | VEMB | VCARD | VDIM | VISMEMBER                      │
└─────────────────────────────────────────────────────────────────┘
```

### Backend Implementation Checklist

1. **Extend `RedisDataType` enum** (`keys/dto/key.dto.ts`):

   ```typescript
   export enum RedisDataType {
     // ... existing types ...
     VectorSet = 'vectorset',
   }
   ```

2. **Add `BrowserToolVectorSetCommands` enum** (`constants/browser-tool-commands.ts`):

   ```typescript
   export enum BrowserToolVectorSetCommands {
     VAdd = 'vadd',
     VRem = 'vrem',
     VInfo = 'vinfo',
     VCard = 'vcard',
     VDim = 'vdim',
     VEmb = 'vemb',
     VGetAttr = 'vgetattr',
     VSetAttr = 'vsetattr',
     VIsMember = 'vismember',
     VRandMember = 'vrandmember',
     VRange = 'vrange',
     VSim = 'vsim',
     VLinks = 'vlinks',
   }
   ```

3. **Create `VectorSetKeyInfoStrategy`** (`keys/key-info/strategies/vector-set.key-info.strategy.ts`):

   - Uses `VINFO` to get element count and dimensions
   - Returns `GetKeyInfoResponse` with type, TTL, length

4. **Register in `KeyInfoProvider`** (`keys/key-info/key-info.provider.ts`):

   ```typescript
   case RedisDataType.VectorSet:
     return this.vectorSetKeyInfoStrategy;
   ```

5. **Create `VectorSetModule`** (`browser/vector-set/`):

   - Follow `ZSetModule` pattern with Controller, Service, DTOs
   - Handle version-specific commands (VRANGE vs VRANDMEMBER)

6. **Add to `BrowserModule`** imports:

   ```typescript
   VectorSetModule.register({ route }),
   ```

7. **Optional: Add `RedisFeature.VRangeSupport`** for feature detection

### Redis Commands Used

| Command       | Purpose                                      | Iteration | Redis Version |
| ------------- | -------------------------------------------- | --------- | ------------- |
| `VADD`        | Add elements with vectors to a vector set    | 1         | 8.0+          |
| `VREM`        | Remove elements from a vector set            | 1         | 8.0+          |
| `VCARD`       | Get the number of elements in the vector set | 1         | 8.0+          |
| `VDIM`        | Get the dimension of vectors in the set      | 1         | 8.0+          |
| `VEMB`        | Get the approximate vector of an element     | 1         | 8.0+          |
| `VGETATTR`    | Get JSON attributes of an element            | 1         | 8.0+          |
| `VINFO`       | Get metadata (size, dim, quant-type, graph)  | 1         | 8.0+          |
| `VISMEMBER`   | Check if an element exists in the vector set | 1         | 8.0+          |
| `VRANDMEMBER` | Get random elements (for Redis 8.0 to <8.4)  | 1         | 8.0+          |
| `VRANGE`      | Lexicographical range iterator (stateless)   | 1         | 8.4+          |
| `VSETATTR`    | Set/update JSON attributes of an element     | 1         | 8.0+          |
| `VSIM`        | Similarity search with optional filtering    | 1         | 8.0+          |
| `VLINKS`      | Get HNSW graph neighbors (for visualization) | Future    | 8.0+          |

### Version-Specific Element Fetching

The command used to fetch elements depends on the Redis version:

| Redis Version | Command                  | Notes                                      |
| ------------- | ------------------------ | ------------------------------------------ |
| 8.0 to <8.4   | `VRANDMEMBER` (count=10) | Returns random elements                    |
| ≥8.4          | `VRANGE - + 10`          | Lexicographical range iterator (stateless) |

> **VRANGE Syntax**: `VRANGE key start end [count]`
>
> - Use `-` for minimum and `+` for maximum element
> - To paginate: use last element with `(` prefix as new start (e.g., `VRANGE key (lastElement + 10`)
> - See [Redis VRANGE docs](https://redis.io/docs/latest/commands/vrange/)

```typescript
// Option 1: Version-based detection
const getElementsCommandByVersion = (
  version: string,
): 'VRANDMEMBER' | 'VRANGE' => {
  const [major, minor] = version.split('.').map(Number);
  if (major > 8 || (major === 8 && minor >= 4)) {
    return 'VRANGE';
  }
  return 'VRANDMEMBER';
};

// Option 2: Feature detection by probing (preferred)
// Send VRANGE with no args and check the error response:
// - "ERR wrong number of arguments for 'VRANGE' command" → VRANGE is available
// - "ERR unknown command 'VRANGE'" → VRANGE not available, use VRANDMEMBER
const isVRangeSupported = async (client: RedisClient): Promise<boolean> => {
  try {
    await client.sendCommand(['VRANGE']);
    return true; // Unexpected success
  } catch (error) {
    const message = error.message || '';
    // If Redis knows the command but args are wrong, VRANGE is supported
    return message.includes('wrong number of arguments');
  }
};
```

> **Recommendation**: Feature detection (Option 2) is the preferred approach because:
>
> - Redis allows disabling commands (e.g., `INFO`) via ACL or config, making version detection impossible
> - Doesn't depend on version string parsing
> - Handles edge cases like custom Redis builds or forks

### Vector Input Formats

Per PRD, Redis Insight should support both vector input formats:

| Format     | Command Syntax            | Use Case                          |
| ---------- | ------------------------- | --------------------------------- |
| **VALUES** | `VALUES dim v1 v2 v3 ...` | Default - platform-independent    |
| **FP32**   | `FP32 <binary blob>`      | Advanced - compact, requires care |

**FP32 requires little-endian byte order**. See [Redis docs](https://redis.io/docs/latest/develop/data-types/vector-sets/#endianness-considerations-for-fp32-format) for details.

**Iteration 1**: Support VALUES format only (auto-count dimensions from input).
**Future**: Add FP32 as optional format with proper endianness handling.

---

## Data Type Definition

### Key Type Constant

Add `VectorSet` to existing key types:

```typescript
// redisinsight/ui/src/constants/keys.ts
export enum KeyTypes {
  Hash = 'hash',
  List = 'list',
  Set = 'set',
  ZSet = 'zset',
  String = 'string',
  ReJSON = 'ReJSON-RL',
  JSON = 'json',
  Stream = 'stream',
  VectorSet = 'vectorset', // NEW
}
```

### Backend Data Type

```typescript
// redisinsight/api/src/modules/browser/keys/dto/key.dto.ts
export enum RedisDataType {
  // ... existing types
  VectorSet = 'vectorset', // NEW
}
```

---

## Version Compatibility

Vector Sets are only available in Redis 8+. The implementation must:

1. **Check Redis version** before showing vector set options
2. **Gracefully handle** older versions by hiding vector set functionality
3. **Display appropriate messaging** when attempting to use with older Redis

### Version Check Logic

```typescript
// Check if Redis version supports vector sets
const isVectorSetSupported = (version: string): boolean => {
  const [major] = version.split('.').map(Number);
  return major >= 8;
};
```

---

## Feature Scope by Iteration

### Iteration 1 (MVP)

**Browser Integration:**

- Display vector sets in Browser key list with "VECTOR SET" label
- Filter by vector set type
- Show TTL and key size
- Delete key with vector set data type

**Vector Set Details View:**

- Show metadata header: Data type, Key name, Key size, Quantization Type, Vector Dimension
- Display up to **10 elements** (no pagination):
  - For Redis 8.0 to <8.4: use `VRANDMEMBER`
  - For Redis ≥8.4: use `VRANGE`
- Show attributes (partial JSON preview, full view in Monaco editor)
- Truncate vectors to reasonable UI size (RI-side implementation - Redis has no native truncation)
- Future enhancement: String prefix filtering (RI-side - VRANGE/VRANDMEMBER don't support it)

**Data Formatters:**

- FP32 vectors: "Vector 32-bit" formatter
- Floating numbers as strings: No formatter
- Attributes: JSON formatter

**Element Operations:**

- **Create new vector sets** (VADD with new key, TTL optional)
- Add elements to existing vector sets (VADD)
- Delete elements (VREM) with confirmation: "{elementName} will be removed from {keyName}"
- Update vector embeddings (VADD)
- Update attributes in Monaco editor (VGETATTR/VSETATTR) - empty to clear

**Search:**

- Search by vector (VSIM with COUNT, EF, FILTER, WITHSCORES)
- Search by element name
- Filter by attributes with JavaScript-like syntax
- Auto-suggest attributes on `.` input
- Show score column when filter active

**Copy/Download:**

- Copy element names
- Copy or download entire vector to file

**Sample Data:**

- Generate sample vectors (word2vec or static data - **TBD**)
- Use "sample\_" prefix for sample data keys
- Provide sample vectors for: new vector set creation, adding elements, searching

> **Note:** Team needs to assess word2vec for dynamic demo data. If effort is too large, use static demo data instead. Aim for a few days effort.

**Other:**

- Telemetry coverage
- Handle large keys (truncate vectors/JSON, valid JSON after truncation)

### Iteration 2

- Add sample data (word2vec dataset)
- Import from CSV with embedding generation (TBD format)

### Iteration 4 (Future)

- Add new elements to existing vector sets flow

### Iteration 5 (Future)

- Generate vector sets from file upload

### Future (Unscheduled)

- 2D visualization of vectors (dimensionality reduction)
- Distance calculation display
- VLINKS command support

---

## Integration Points

### Key Endpoints

| Endpoint                        | Purpose                           | Redis Commands Used                          |
| ------------------------------- | --------------------------------- | -------------------------------------------- |
| `POST /keys/get-info`           | Get key metadata for browser list | `VINFO` (via VectorSetKeyInfoStrategy)       |
| `POST /vector-set`              | Create vector set with element    | `VADD`, `EXPIRE`                             |
| `POST /vector-set/get-elements` | Get elements for browser display  | `VRANDMEMBER` / `VRANGE`, `VEMB`, `VGETATTR` |
| `POST /vector-set/search`       | Similarity search                 | `VSIM`                                       |
| `PUT /vector-set`               | Add/update element                | `VADD`, `VSETATTR`                           |
| `PATCH /vector-set/attributes`  | Update element attributes         | `VSETATTR`                                   |
| `DELETE /vector-set/elements`   | Remove elements                   | `VREM`                                       |

### Browser Module

- Add `VectorSet` to `DynamicTypeDetails` component
- Add filter option in `FilterKeyType`
- Display "VECTOR SET" label in key list
- Import `VectorSetModule` in `BrowserModule`

### Keys Module

- Create `VectorSetKeyInfoStrategy` for handling VINFO
- Register strategy in `KeyInfoProvider`
- Add `VectorSet = 'vectorset'` to `RedisDataType` enum

### Add Key Flow

- Add vector set option in `AddKeyTypeOptions`
- Create `AddVectorSet` component

---

## Performance Considerations

1. **Large Vectors**: Truncate vector display in UI (configurable limit). This must be implemented on RI side - Redis has no native feature to return truncated vectors.
2. **Element Fetching**: Use `VRANDMEMBER` (Redis 8.0-8.4) or `VRANGE` (Redis 8.4+) with count=10. No pagination for MVP.
3. **Search**: Implement debouncing for similarity search
4. **Attributes**: Truncate large JSON in list view, full view in Monaco editor

---

## Data Fetching Strategy

Displaying a vector set key requires **multiple Redis commands** behind the API endpoints. There is no single Redis command that returns all data at once.

### API Calls to Display Vector Set in Browser

| Step | API Endpoint                    | Redis Commands Used      | When                            |
| ---- | ------------------------------- | ------------------------ | ------------------------------- |
| 1    | `POST /keys/get-info`           | `VINFO`                  | When user clicks key in list    |
| 2    | `POST /vector-set/get-elements` | `VRANDMEMBER` / `VRANGE` | Immediately after step 1        |
| 3    | (lazy) Expand element           | `VEMB`, `VGETATTR`       | On demand when user expands row |

> **Note**: `VINFO` returns all metadata including element count (`size`), vector dimension (`vector-dim`), and quantization type (`quant-type`). No need for separate `VCARD` or `VDIM` calls. See [VINFO docs](https://redis.io/docs/latest/commands/vinfo/).

### Backend Implementation: `get-elements` Endpoint

The `POST /vector-set/get-elements` endpoint should:

1. **Determine Redis version** and use appropriate command:

   - Redis 8.0 to <8.4: `VRANDMEMBER key 10`
   - Redis ≥8.4: `VRANGE key - + 10`

2. **Return element names** initially (no vectors/attributes for performance)

3. **Optionally accept `withVectors` and `withAttributes` flags** for eager loading

### Recommended Flow in VectorSetService

```typescript
// VectorSetService.getElements()
async getElements(clientMetadata, dto) {
  const client = await this.databaseClientFactory.getOrCreateClient(clientMetadata);

  // 1. Get element names (version-specific)
  let elements: string[];
  if (await this.isVRangeSupported(client)) {
    elements = await client.sendCommand(['VRANGE', keyName, '-', '+', '10']);
  } else {
    elements = await client.sendCommand(['VRANDMEMBER', keyName, '10']);
  }

  // 2. Optionally fetch vectors and attributes if requested
  if (dto.withVectors || dto.withAttributes) {
    // Batch VEMB and VGETATTR calls via pipeline
  }

  return { elements, ... };
}
```

### Lazy Loading for Performance

- **Initial load**: Fetch only element names (lightweight)
- **Lazy load vectors**: Fetch `VEMB` only when user expands/clicks element
- **Lazy load attributes**: Fetch `VGETATTR` only when user expands/clicks element
- **Cache fetched data**: Store vectors/attributes in Redux to avoid re-fetching

> **Why lazy loading?** Vectors can be large (up to 128 KB each for 32K dimensions). Fetching all vectors eagerly would cause slow API responses and high memory usage.

---

## Vector Size Limitations & Potential Issues

### Redis Limits

| Constraint              | Limit                   | Notes                        |
| ----------------------- | ----------------------- | ---------------------------- |
| **Max dimensions**      | 32,768                  | Per vector                   |
| **Max elements**        | ~4.29 billion (2³² - 1) | Per vector set (theoretical) |
| **Element name size**   | 512 MB                  | General Redis string limit   |
| **Attribute JSON size** | 512 MB                  | General Redis string limit   |

### Data Transfer Size (UI Concern)

Vector size affects network transfer and browser performance:

| Dimensions | Bytes per vector | 10 elements (1 request) |
| ---------- | ---------------- | ----------------------- |
| 384        | 1.5 KB           | ~15 KB                  |
| 768        | 3 KB             | ~30 KB                  |
| 1,536      | 6 KB             | ~60 KB                  |
| 3,072      | 12 KB            | ~120 KB                 |

### Potential Issues for Redis Insight

#### 1. Network Transfer Size

Large vectors can cause slow API responses:

```
10 elements × 3,072 dimensions × 4 bytes = 120 KB per request
```

**Mitigation:**

- Limit elements fetched to 10 (no pagination for MVP)
- Consider lazy-loading vectors (fetch on demand, not with element list)
- Truncate vector display in UI

#### 2. UI Rendering Performance

Displaying thousands of floating-point numbers can freeze the browser:

```
1 vector with 3,072 dimensions = 3,072 numbers to render
```

**Mitigation:**

- Truncate display to first N values (e.g., 50) with "... and X more"
- Use virtualization if displaying many elements
- Provide "Copy full vector" / "Download" options instead of showing all

#### 3. Input Validation

Users may paste very large vectors:

**Mitigation:**

- Validate dimension count matches vector set
- Show clear error if dimensions exceed 32,768
- Consider file upload for large vectors instead of textarea

#### 4. Copy/Download Considerations

Copying 3,072 numbers to clipboard may cause browser issues:

**Mitigation:**

- For vectors > 1,000 dimensions, prefer "Download as file" over clipboard
- Show warning for very large vectors
- Use efficient serialization (JSON array or CSV)

#### 5. Memory in Browser

Loading many elements with full vectors can exhaust browser memory:

```
100 elements × 3,072 dimensions × 8 bytes (JS number) = 2.4 MB
```

**Mitigation:**

- Don't store full vectors in Redux state unless needed
- Fetch vectors on-demand when user expands element details
- Clear vector data when switching keys

### Recommendations for Implementation

1. **Lazy load vectors**: Fetch element names first, load vectors only when user requests
2. **Truncate display**: Show max 50-100 vector values in UI, full view via modal/download
3. **Validate early**: Check dimensions before sending to Redis
4. **Warn users**: Show memory/size warnings for high-dimensional vectors
5. **Efficient formats**: Use typed arrays (Float32Array) for vector operations in browser

---

## Telemetry Events

| Event                               | Description                     |
| ----------------------------------- | ------------------------------- |
| `BROWSER_KEY_TYPE_FILTER_VECTORSET` | User filters by vector set type |
| `BROWSER_VECTORSET_ELEMENT_ADDED`   | Element added to vector set     |
| `BROWSER_VECTORSET_ELEMENT_REMOVED` | Element removed from vector set |
| `BROWSER_VECTORSET_SEARCH`          | Similarity search performed     |
| `BROWSER_VECTORSET_CREATED`         | New vector set created          |

> **Implementation**: Add these events to the `TelemetryEvent` enum in `redisinsight/ui/src/telemetry/events.ts`

---

## Error Handling

### Expected Errors

- `WRONGTYPE` - Operation on wrong data type
- `ERR wrong number of arguments` - Invalid VADD parameters
- `ERR vector dimensions mismatch` - Inconsistent vector dimensions
- `ERR invalid vector format` - Malformed vector data

### User-Facing Messages

- Clear validation messages for vector format/dimensions
- Contextual help for attribute filter syntax
