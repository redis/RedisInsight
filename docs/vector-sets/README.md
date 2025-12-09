# Vector Sets Feature - Engineering Documentation

## Overview

This directory contains engineering documentation for implementing Vector Sets support in Redis Insight. Vector Sets are a new data type introduced in Redis 8, designed for vector similarity search and high-dimensional vector embeddings.

**PRD**: [Support for vector sets](https://redislabs.atlassian.net/wiki/spaces/DX/pages/5148477998/Support+for+vector+sets)  
**Epic**: [RED-157732](https://redislabs.atlassian.net/browse/RED-157732)  
**Figma Designs**: [RI-Vector-Sets](https://www.figma.com/design/MO62zaV0GYQbpLuBeaKDBy/RI-Vector-Sets?node-id=365-46361)

## Scope

**Platforms**: Redis Insight Desktop and Docker  
**Redis Version**: 8+ only (no changes for versions < 8)

---

## Documents

| Document                                                         | Description                                                                            |
| ---------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| [01-technical-design.md](./01-technical-design.md)               | High-level architecture, system components, Redis commands, and integration points     |
| [02-backend-api-design.md](./02-backend-api-design.md)           | NestJS module structure, DTOs, controller/service implementation, API endpoints        |
| [03-frontend-implementation.md](./03-frontend-implementation.md) | React components, Redux state management, styled-components, and UI integration        |
| [04-implementation-tasks.md](./04-implementation-tasks.md)       | Detailed task breakdown by iteration, estimates, dependencies, and acceptance criteria |
| [05-data-models.md](./05-data-models.md)                         | TypeScript interfaces, types, validation schemas, and test factories                   |

---

## Quick Reference

### Redis Commands

| Command                                                                     | Purpose                                         | Redis Version |
| --------------------------------------------------------------------------- | ----------------------------------------------- | ------------- |
| `VADD key element VALUES dim v1 v2 ...`                                     | Add element with vector                         | 8.0+          |
| `VREM key element`                                                          | Remove element                                  | 8.0+          |
| `VCARD key`                                                                 | Get element count                               | 8.0+          |
| `VDIM key`                                                                  | Get vector dimension                            | 8.0+          |
| `VEMB key element`                                                          | Get element's approximate vector                | 8.0+          |
| `VGETATTR key element`                                                      | Get element attributes                          | 8.0+          |
| `VINFO key`                                                                 | Get metadata (size, dim, quant-type, graph)     | 8.0+          |
| `VISMEMBER key element`                                                     | Check if element exists                         | 8.0+          |
| `VLINKS key element`                                                        | Get HNSW graph neighbors (for visualization)    | 8.0+          |
| `VRANDMEMBER key count`                                                     | Get random elements (use for Redis 8.0 to <8.4) | 8.0+          |
| `VRANGE key start end [count]`                                              | Lexicographical range iterator (stateless)      | 8.4+          |
| `VSETATTR key element json`                                                 | Set/replace element attributes                  | 8.0+          |
| `VSIM key VALUES dim v1 v2 ... [COUNT n] [EF n] [FILTER expr] [WITHSCORES]` | Similarity search with optional filtering       | 8.0+          |

### Version-Specific Element Fetching

| Redis Version | Command to Use           | Notes                                                 |
| ------------- | ------------------------ | ----------------------------------------------------- |
| 8.0 to <8.4   | `VRANDMEMBER` (count=10) | Returns random elements                               |
| ≥8.4          | `VRANGE - + 10`          | Lexicographical range iterator (stateless, no cursor) |

> **Note**: `VRANGE` uses lexicographical ordering with `start` and `end` range parameters. Use `-` for minimum and `+` for maximum. To paginate, use the last element with `(` prefix as the new `start` (e.g., `VRANGE key (lastElement + 10`).

### Vector Format Considerations

Per PRD, we should support **both** vector input formats:

| Format     | Syntax                    | Pros                                 | Cons                              |
| ---------- | ------------------------- | ------------------------------------ | --------------------------------- |
| **VALUES** | `VALUES dim v1 v2 v3 ...` | Platform-independent, human-readable | Larger payload, slower parsing    |
| **FP32**   | `FP32 <binary blob>`      | Compact, efficient for large vectors | Requires little-endian byte order |

**FP32 Considerations** (see [Redis docs](https://redis.io/docs/latest/develop/data-types/vector-sets/#endianness-considerations-for-fp32-format)):

- Binary data **must be little-endian** encoded
- Cross-platform compatibility concerns (ARM variants may use different endianness)
- If supporting FP32, we need to:
  - Detect platform endianness
  - Convert to little-endian if needed, OR
  - Default to VALUES and offer FP32 as advanced option

**Recommendation**: Default to VALUES for simplicity; consider FP32 for performance optimization in future iterations.

### Size Limitations

| Constraint         | Limit                   | Notes                                 |
| ------------------ | ----------------------- | ------------------------------------- |
| **Max dimensions** | 32,768                  | Per vector                            |
| **Max elements**   | ~4.29 billion (2³² - 1) | Per vector set (theoretical)          |
| **Transfer size**  | dimensions × 4 bytes    | Per vector (e.g., 3072 dims = ~12 KB) |

> ⚠️ **UI Considerations**: High-dimensional vectors (1000+) require special handling - truncate display, lazy-load, offer download instead of copy. See [01-technical-design.md](./01-technical-design.md#vector-size-limitations--potential-issues) for details.

### Command Execution

Vector set commands will be dispatched through the existing `commands` module (`/databases/:id/commands`) rather than dedicated REST endpoints. The frontend will build and send vector commands (VADD, VSIM, etc.) directly.

### Key Files to Create/Modify

**Backend:**

- `api/src/modules/browser/vector-set/` (new module)
- `api/src/modules/browser/keys/dto/key.dto.ts` (add VectorSet type)
- `api/src/modules/browser/constants/browser-tool-commands.ts` (add commands)
- `api/src/modules/browser/browser.module.ts` (register module)

**Frontend:**

- `ui/src/constants/keys.ts` (add VectorSet to KeyTypes)
- `ui/src/constants/api.ts` (add endpoints)
- `ui/src/slices/browser/vectorset.ts` (new slice)
- `ui/src/pages/browser/modules/key-details/components/vectorset-details/` (new component)
- `ui/src/pages/browser/modules/key-details/components/dynamic-type-details/` (integrate)
- `ui/src/pages/browser/components/filter-key-type/constants.ts` (add filter option)

---

## Implementation Timeline

### Iteration 1 - MVP

- Display vector sets in Browser key list
- Filter by vector set type
- View vector set details:
  - Display up to **10 elements** (no pagination)
  - For Redis 8.0 to <8.4: use `VRANDMEMBER`
  - For Redis ≥8.4: use `VRANGE`
- View metadata (size, dim, quant-type via VINFO)
- **Create new vector sets** (VADD with new key)
- **Vector update feature:**
  - Add elements to existing vector sets (VADD)
  - Delete elements (VREM) with confirmation
  - Update vector embeddings (VADD)
  - Update attributes (VGETATTR/VSETATTR)
- Search by vector (VSIM with COUNT, EF, FILTER, WITHSCORES)
- Search by element name
- Generate sample vectors (word2vec or static data - TBD, "sample\_" prefix for sample keys)
- Telemetry coverage

> **Implementation Notes:**
>
> - **Vector truncation**: Must be done on RI side - Redis has no native truncation feature
> - **String prefix filtering**: Future enhancement - must be implemented on RI side (VRANGE/VRANDMEMBER don't support filtering)
> - **Sample data**: Team to decide between word2vec (dynamic) vs static data - aim for few days effort

### Iteration 2 - Import, Sample Data & Vectorization

- Add sample data (word2vec dataset)
- Import/generate vector sets from file (CSV with embedding generation)
- Vectorize data (text/images) with configurable models and API keys (TBD)

### Iteration 3 - Visualization (Future)

- 2D visualization in Browser (dimensionality reduction)
- 2D visualization in Workbench
- Distance calculation display
- Element details on hover
- VLINKS command support (for HNSW graph visualization - TBD)

---

## Getting Started

### Prerequisites

- Redis 8+ instance for testing
- Node.js 22+
- Yarn package manager

### Development Setup

1. **Start Redis 8 with vector support:**

   ```bash
   docker run -p 6384:6379 --name redis84 redis:8.4
   ```

2. **Create test data:**

   ```bash
   redis-cli VADD myvec elem1 VALUES 4 0.1 0.2 0.3 0.4
   redis-cli VADD myvec elem2 VALUES 4 0.5 0.6 0.7 0.8
   redis-cli VSETATTR myvec elem1 '{"category": "test"}'
   ```

3. **Run backend tests:**

   ```bash
   cd redisinsight/api
   yarn test --grep "VectorSet"
   ```

4. **Run frontend tests:**
   ```bash
   cd redisinsight/ui
   yarn test --grep "vectorset"
   ```

---

## Related Resources

- [Redis Vector Sets Documentation](https://redis.io/docs/latest/develop/data-types/vector-sets/)
- [RedisInsight Development Guide](../plugins/development.md)

---

## Questions?

For questions about this feature implementation:

- Check the PRD for product requirements
- Check Figma for design specifications
- Reach out to the DX team on Slack
