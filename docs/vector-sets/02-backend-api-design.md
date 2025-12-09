# Vector Sets - Backend API Design

## Overview

Vector set commands will be dispatched through the existing **commands module** (`/databases/:id/commands`) rather than dedicated REST endpoints. The frontend builds and sends vector commands (VADD, VSIM, etc.) directly.

This approach:

- Leverages existing infrastructure
- Reduces backend code complexity
- Maintains consistency with how other Redis commands are handled

---

## Backend Changes Required

### 1. Add Vector Set Data Type

```typescript
// redisinsight/api/src/modules/browser/keys/dto/key.dto.ts
export enum RedisDataType {
  // ... existing types
  VectorSet = 'vectorset',
}
```

### 2. Add Vector Set Commands Enum

```typescript
// redisinsight/api/src/modules/browser/constants/browser-tool-commands.ts
export enum BrowserToolVectorSetCommands {
  VAdd = 'VADD',
  VCard = 'VCARD',
  VDim = 'VDIM',
  VEmb = 'VEMB',
  VGetAttr = 'VGETATTR',
  VInfo = 'VINFO',
  VIsMember = 'VISMEMBER',
  VLinks = 'VLINKS',
  VRandMember = 'VRANDMEMBER',
  VRem = 'VREM',
  VSetAttr = 'VSETATTR',
  VSim = 'VSIM',
}
```

### 3. Add Key Info Strategy for Vector Sets

```typescript
// redisinsight/api/src/modules/browser/keys/key-info/strategies/vector-set.key-info.strategy.ts
import { Injectable, Logger } from '@nestjs/common';
import { RedisClient } from 'src/modules/redis/client';
import { KeyInfoStrategy, GetKeyInfoResponse } from './key-info.strategy';

@Injectable()
export class VectorSetKeyInfoStrategy extends KeyInfoStrategy {
  private logger = new Logger('VectorSetKeyInfoStrategy');

  async getInfo(
    client: RedisClient,
    key: string,
    type: string,
  ): Promise<GetKeyInfoResponse> {
    const [infoRaw, ttl] = await Promise.all([
      client.sendCommand(['VINFO', key]),
      this.getTtl(client, key),
    ]);

    // Parse VINFO response (key-value pairs)
    const info = this.parseVInfoResponse(infoRaw as string[]);

    return {
      name: key,
      type,
      ttl,
      size: null,
      length: info.size as number,
    };
  }

  private parseVInfoResponse(raw: string[]): Record<string, any> {
    const result: Record<string, any> = {};
    for (let i = 0; i < raw.length; i += 2) {
      result[raw[i]] = raw[i + 1];
    }
    return result;
  }
}
```

### 4. Register Key Info Strategy

Update the key info provider to include the vector set strategy:

```typescript
// In key-info.provider.ts or similar
import { VectorSetKeyInfoStrategy } from './strategies/vector-set.key-info.strategy';

// Add to strategy map
{
  [RedisDataType.VectorSet]: VectorSetKeyInfoStrategy,
}
```

---

## Frontend Command Building

The frontend will build Redis commands directly. Example command structures:

### Vector Format Support

Per PRD, we should support both formats. Redis Insight should auto-count dimensions when user enters values.

**VALUES format** (recommended default):

```typescript
// Platform-independent, human-readable
const command = ['VADD', keyName, elementName, 'VALUES', dim, ...values];
```

**FP32 format** (future/advanced):

```typescript
// Compact binary - requires little-endian encoding
const fp32Buffer = new Float32Array(values).buffer;
// Must ensure little-endian byte order!
const command = ['VADD', keyName, elementName, 'FP32', fp32Buffer];
```

**FP32 Considerations** (see [Redis docs](https://redis.io/docs/latest/develop/data-types/vector-sets/#endianness-considerations-for-fp32-format)):

- Binary data **must be little-endian** encoded
- JavaScript `Float32Array` uses platform's native endianness
- For cross-platform safety, use `DataView` with explicit little-endian:

```typescript
function vectorToLittleEndianFP32(values: number[]): ArrayBuffer {
  const buffer = new ArrayBuffer(values.length * 4);
  const view = new DataView(buffer);
  values.forEach((v, i) => view.setFloat32(i * 4, v, true)); // true = little-endian
  return buffer;
}
```

**Recommendation**: Start with VALUES format for Iteration 1; add FP32 as optional optimization later.

### VADD (Add Element)

```typescript
// Create vector set or add element
const command = [
  'VADD',
  keyName,
  elementName,
  'VALUES',
  vector.length.toString(),
  ...vector.map(String),
];
```

### VSIM (Similarity Search)

```typescript
// Similarity search
const command = [
  'VSIM',
  keyName,
  'VALUES',
  vector.length.toString(),
  ...vector.map(String),
  'COUNT',
  count.toString(),
  'WITHSCORES',
];

// With filter
if (filter) {
  command.push('FILTER', filter);
}
```

### VINFO (Get Metadata)

```typescript
const command = ['VINFO', keyName];
// Returns: size, vector-dim, quant-type, etc.
```

### VRANDMEMBER (Get Random Elements)

```typescript
const command = ['VRANDMEMBER', keyName, count.toString()];
```

### VEMB (Get Element Vector)

```typescript
const command = ['VEMB', keyName, elementName];
```

### VGETATTR / VSETATTR (Attributes)

```typescript
// Get attributes
const getCommand = ['VGETATTR', keyName, elementName];

// Set attributes
const setCommand = [
  'VSETATTR',
  keyName,
  elementName,
  JSON.stringify(attributes),
];
```

### VREM (Remove Element)

```typescript
const command = ['VREM', keyName, elementName];
```

---

## Constants

```typescript
// redisinsight/ui/src/constants/vector-set.ts
export const VECTOR_SET_CONSTANTS = {
  DEFAULT_COUNT: 20,
  MAX_COUNT: 500,
  DEFAULT_EF: 200,
  MAX_VECTOR_DISPLAY_LENGTH: 100,
} as const;
```

---

## Response Parsing

The frontend will need to parse command responses:

### VINFO Response

Returns alternating key-value pairs:

```typescript
// Raw: ['size', '1234', 'vector-dim', '384', 'quant-type', 'Q8', ...]
function parseVInfoResponse(raw: string[]): Record<string, string> {
  const result: Record<string, string> = {};
  for (let i = 0; i < raw.length; i += 2) {
    result[raw[i]] = raw[i + 1];
  }
  return result;
}
```

### VSIM Response (with WITHSCORES)

Returns alternating element-score pairs:

```typescript
// Raw: ['elem1', '0.95', 'elem2', '0.87', ...]
function parseSearchResults(
  raw: string[],
): Array<{ name: string; score: number }> {
  const results = [];
  for (let i = 0; i < raw.length; i += 2) {
    results.push({
      name: raw[i],
      score: parseFloat(raw[i + 1]),
    });
  }
  return results;
}
```
