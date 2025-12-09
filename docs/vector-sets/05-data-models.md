# Vector Sets - Data Models & Types

## Overview

This document defines all TypeScript interfaces, types, and data models used in the Vector Sets feature implementation.

---

## Backend Types

### Redis Data Type Extension

```typescript
// redisinsight/api/src/modules/browser/keys/dto/key.dto.ts
export enum RedisDataType {
  String = 'string',
  Hash = 'hash',
  List = 'list',
  Set = 'set',
  ZSet = 'zset',
  Stream = 'stream',
  JSON = 'ReJSON-RL',
  Graph = 'graphdata',
  TS = 'TSDB-TYPE',
  VectorSet = 'vectorset', // NEW
}
```

### Vector Format Enum

```typescript
// redisinsight/api/src/modules/browser/vector-set/dto/vector-set-element.dto.ts
export enum VectorFormat {
  /**
   * FP32 (32-bit floating point) raw binary format
   * Most compact, native Redis format
   */
  FP32 = 'FP32',

  /**
   * Array of numeric values
   * More readable, used for API communication
   */
  VALUES = 'VALUES',
}
```

### Vector Set Element

```typescript
// redisinsight/api/src/modules/browser/vector-set/dto/vector-set-element.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsNumber,
  IsObject,
} from 'class-validator';
import { IsRedisString, RedisStringType } from 'src/common/decorators';
import { RedisString } from 'src/common/constants';

export class VectorSetElementDto {
  @ApiProperty({
    description: 'Unique element identifier within the vector set',
    type: String,
    example: 'product-12345',
  })
  @IsNotEmpty()
  @IsRedisString()
  @RedisStringType()
  name: RedisString;

  @ApiProperty({
    description: 'Vector embedding as array of floating-point numbers',
    type: [Number],
    example: [0.123, -0.456, 0.789, 0.012],
  })
  @IsArray()
  @IsNumber({}, { each: true })
  vector: number[];

  @ApiPropertyOptional({
    description: 'JSON attributes/metadata for the element',
    type: Object,
    example: { category: 'electronics', price: 299.99, rating: 4.5 },
  })
  @IsOptional()
  @IsObject()
  attributes?: Record<string, any>;
}
```

### Vector Set Info

```typescript
// redisinsight/api/src/modules/browser/vector-set/dto/vector-set-info.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RedisString } from 'src/common/constants';

export class VectorSetInfoDto {
  @ApiProperty({
    description: 'Key name of the vector set',
    type: String,
  })
  keyName: RedisString;

  @ApiProperty({
    description: 'Number of elements in the vector set',
    type: Number,
    example: 1000,
  })
  size: number;

  @ApiProperty({
    description: 'Dimensionality of vectors in the set',
    type: Number,
    example: 384,
  })
  vectorDim: number;

  @ApiProperty({
    description: 'Quantization type used for storage',
    type: String,
    example: 'Q8',
    enum: ['NONE', 'Q8', 'BIN'],
  })
  quantType: string;

  @ApiPropertyOptional({
    description: 'Additional VINFO metadata',
    type: Object,
  })
  metadata?: Record<string, any>;
}
```

### Search Result

```typescript
// redisinsight/api/src/modules/browser/vector-set/dto/search-vector-set.response.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RedisString } from 'src/common/constants';

export class SearchResultDto {
  @ApiProperty({
    description: 'Element name',
    type: String,
  })
  name: RedisString;

  @ApiProperty({
    description:
      'Similarity score (lower is more similar for L2, higher for cosine)',
    type: Number,
    example: 0.8765,
  })
  score: number;

  @ApiProperty({
    description: 'Vector embedding of the result',
    type: [Number],
  })
  vector: number[];

  @ApiPropertyOptional({
    description: 'JSON attributes of the element',
    type: Object,
  })
  attributes?: Record<string, any>;
}

export class SearchVectorSetResponse {
  @ApiProperty({
    description: 'Key name searched',
    type: String,
  })
  keyName: RedisString;

  @ApiProperty({
    description: 'Array of search results ordered by similarity',
    type: () => [SearchResultDto],
  })
  results: SearchResultDto[];
}
```

---

## Frontend Types

### State Interfaces

```typescript
// redisinsight/ui/src/slices/interfaces/vectorset.ts
import { RedisResponseBuffer } from './redis';

/**
 * Single element in a vector set
 */
export interface VectorSetElement {
  /** Element identifier (can be Buffer for binary-safe names) */
  name: RedisResponseBuffer;

  /** Vector embedding as array of numbers */
  vector: number[];

  /** Optional JSON attributes/metadata */
  attributes?: Record<string, any>;
}

/**
 * Search result extends element with similarity score
 */
export interface VectorSetSearchResult extends VectorSetElement {
  /** Similarity score from VSIM command */
  score: number;
}

/**
 * Vector set metadata from VINFO command
 */
export interface VectorSetInfo {
  /** Size in bytes */
  size: number;

  /** Vector dimensionality */
  vectorDim: number;

  /** Quantization type (NONE, Q8, BIN) */
  quantType: string;

  /** Additional metadata */
  metadata?: Record<string, any>;
}

/**
 * Main vector set data state
 */
export interface VectorSetData {
  /** Total number of elements */
  total: number;

  /** Key reference (Buffer) */
  key: RedisResponseBuffer | undefined;

  /** Key name as string */
  keyName: string;

  /** Loaded elements */
  elements: VectorSetElement[];

  /** Pagination cursor */
  nextCursor: string;

  /** Vector set info from VINFO */
  info: VectorSetInfo | null;
}

/**
 * Search state
 */
export interface VectorSetSearchState {
  loading: boolean;
  error: string;
  results: VectorSetSearchResult[];
  query: number[] | null;
}

/**
 * Operation state (for add/update)
 */
export interface OperationState {
  loading: boolean;
  error: string;
}

/**
 * Complete vector set slice state
 */
export interface StateVectorSet {
  loading: boolean;
  searching: boolean;
  error: string;
  data: VectorSetData;
  search: VectorSetSearchState;
  addElement: OperationState;
  updateAttributes: OperationState;
}
```

### Component Props Interfaces

```typescript
// redisinsight/ui/src/pages/browser/modules/key-details/components/vectorset-details/VectorSetDetails.types.ts
import { KeyDetailsHeaderProps } from 'uiSrc/pages/browser/modules';
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces';

/**
 * Props for VectorSetDetails main component
 */
export interface VectorSetDetailsProps extends KeyDetailsHeaderProps {
  onRemoveKey: () => void;
  onOpenAddItemPanel: () => void;
  onCloseAddItemPanel: () => void;
}

/**
 * Props for VectorSetHeader component
 */
export interface VectorSetHeaderProps {
  // Uses info from Redux selector
}

/**
 * Props for VectorSetTable component
 */
export interface VectorSetTableProps {
  onRemoveKey: () => void;
  isSearchMode: boolean;
}

/**
 * Props for VectorSetSearch component
 */
export interface VectorSetSearchProps {
  keyName: RedisResponseBuffer;
  onSearchModeChange: (isSearching: boolean) => void;
}

/**
 * Props for AddVectorSetElement component
 */
export interface AddVectorSetElementProps {
  closePanel: (isCancelled?: boolean) => void;
}

/**
 * Props for EditElementAttributes component
 */
export interface EditElementAttributesProps {
  keyName: RedisResponseBuffer;
  elementName: RedisResponseBuffer;
  currentAttributes?: Record<string, any>;
  onClose: () => void;
  onSave: () => void;
}

/**
 * Props for VectorDisplay component
 */
export interface VectorDisplayProps {
  vector: number[];
  maxDisplay?: number;
}

/**
 * Props for AttributesCell component
 */
export interface AttributesCellProps {
  keyName: RedisResponseBuffer;
  elementName: RedisResponseBuffer;
  attributes?: Record<string, any>;
}
```

### Form Data Types

```typescript
// redisinsight/ui/src/pages/browser/modules/key-details/components/vectorset-details/VectorSetDetails.types.ts

/**
 * Form data for adding a new element
 */
export interface AddElementFormData {
  name: string;
  vector: string; // Comma-separated string, parsed to number[]
  attributes: string; // JSON string
}

/**
 * Form data for similarity search
 */
export interface SearchFormData {
  vector: string; // Comma-separated string
  count: number;
  ef: number;
  filter: string;
}

/**
 * Validated search params (after parsing)
 */
export interface SearchParams {
  vector: number[];
  count: number;
  ef: number;
  filter?: string;
}
```

---

## API Request/Response Types

### Get Elements

```typescript
// Request
interface GetVectorSetElementsRequest {
  keyName: RedisResponseBuffer;
  count?: number; // default: 10 (no pagination for MVP)
  start?: string; // for VRANGE: '-' for minimum, '(lastElement' for pagination
  end?: string; // for VRANGE: '+' for maximum
}

/**
 * Version-specific element fetching:
 * - Redis 8.0 to <8.4: Use VRANDMEMBER (count=10)
 * - Redis ≥8.4: Use VRANGE (start='-', end='+', count=10)
 *
 * VRANGE is a stateless lexicographical iterator (no cursor).
 * To paginate with VRANGE, use the last element with '(' prefix as new start.
 */

// Response
interface GetVectorSetElementsResponse {
  keyName: RedisResponseBuffer;
  total: number;
  elements: VectorSetElement[];
  nextCursor?: string;
}
```

### Get Info

```typescript
// Request
interface GetVectorSetInfoRequest {
  keyName: RedisResponseBuffer;
}

// Response
interface GetVectorSetInfoResponse {
  keyName: RedisResponseBuffer;
  size: number;
  vectorDim: number;
  quantType: string;
  metadata?: Record<string, any>;
}
```

### Add Elements

```typescript
// Request
interface AddElementsRequest {
  keyName: RedisResponseBuffer;
  elements: Array<{
    name: string;
    vector: number[];
    attributes?: Record<string, any>;
  }>;
}

// Response: void (200 OK)
```

### Delete Elements

```typescript
// Request
interface DeleteElementsRequest {
  keyName: RedisResponseBuffer;
  elements: RedisResponseBuffer[];
}

// Response
interface DeleteElementsResponse {
  affected: number;
}
```

### Search

```typescript
// Request
interface SearchVectorSetRequest {
  keyName: RedisResponseBuffer;
  vector: number[];
  count?: number; // default: 10, max: 1000
  ef?: number; // default: 200
  filter?: string; // JavaScript-like filter expression
}

// Response
interface SearchVectorSetResponse {
  keyName: RedisResponseBuffer;
  results: Array<{
    name: RedisResponseBuffer;
    score: number;
    vector: number[];
    attributes?: Record<string, any>;
  }>;
}
```

### Update Attributes

```typescript
// Request
interface UpdateAttributesRequest {
  keyName: RedisResponseBuffer;
  element: RedisResponseBuffer;
  attributes: Record<string, any>; // Empty object to clear
}

// Response: void (200 OK)
```

---

## Redis Command Types

### VINFO Response Parsing

```typescript
/**
 * Raw VINFO response from Redis (array of key-value pairs)
 * Example: ['size', '1234', 'vector-dim', '384', 'quant-type', 'Q8', ...]
 */
type VInfoRawResponse = string[];

/**
 * Parsed VINFO response
 */
interface VInfoParsed {
  size: number;
  'vector-dim': number;
  'quant-type': string;
  [key: string]: string | number;
}
```

### Version-Specific Element Fetching

```typescript
/**
 * Determine which command to use for fetching elements based on Redis version
 * - Redis 8.0 to <8.4: Use VRANDMEMBER
 * - Redis ≥8.4: Use VRANGE
 */
type ElementFetchCommand = 'VRANDMEMBER' | 'VRANGE';

// Option 1: Version-based detection
// NOTE: This approach is unreliable because INFO command may be disabled via ACL/config
function getElementFetchCommandByVersion(version: string): ElementFetchCommand {
  const [major, minor] = version.split('.').map(Number);
  if (major > 8 || (major === 8 && minor >= 4)) {
    return 'VRANGE';
  }
  return 'VRANDMEMBER';
}

// Option 2: Feature detection by probing (PREFERRED)
// Send VRANGE with no args and check the error response:
// - "ERR wrong number of arguments for 'VRANGE' command" → VRANGE is available
// - "ERR unknown command 'VRANGE'" → VRANGE not available, use VRANDMEMBER
async function isVRangeSupported(client: RedisClient): Promise<boolean> {
  try {
    await client.sendCommand(['VRANGE']);
    return true;
  } catch (error) {
    const message = error.message || '';
    return message.includes('wrong number of arguments');
  }
}

/**
 * VRANGE command arguments (Redis 8.4+)
 *
 * VRANGE is a stateless lexicographical range iterator.
 * Syntax: VRANGE key start end [count]
 * - start/end: Use '-' for min, '+' for max, '[prefix' for inclusive, '(prefix' for exclusive
 * - To paginate: use last element with '(' prefix as new start
 *
 * See: https://redis.io/docs/latest/commands/vrange/
 */
interface VRangeCommandArgs {
  key: string;
  start: string; // '-' for minimum, '[element' inclusive, '(element' exclusive
  end: string; // '+' for maximum, '[element' inclusive, '(element' exclusive
  count?: number; // default: 10
}

/**
 * Build VRANGE command array
 * Example: VRANGE mykey - + 10 (get first 10 elements)
 * Example: VRANGE mykey (lastElement + 10 (continue from lastElement)
 */
function buildVRANGECommand(args: VRangeCommandArgs): (string | number)[] {
  const cmd: (string | number)[] = ['VRANGE', args.key, args.start, args.end];

  if (args.count) {
    cmd.push(args.count);
  }

  return cmd;
}

/**
 * VRANDMEMBER command arguments (Redis 8.0+)
 */
interface VRandMemberCommandArgs {
  key: string;
  count?: number; // default: 10
}

/**
 * Build VRANDMEMBER command array
 * Example: VRANDMEMBER mykey 10
 */
function buildVRANDMEMBERCommand(
  args: VRandMemberCommandArgs,
): (string | number)[] {
  return ['VRANDMEMBER', args.key, args.count ?? 10];
}
```

### VSIM Command Args

```typescript
/**
 * VSIM command arguments builder
 */
interface VSIMCommandArgs {
  key: string;
  format: 'VALUES' | 'FP32';
  vectorLength: number;
  vector: number[] | Buffer;
  count?: number;
  ef?: number;
  filter?: string;
  withScores?: boolean;
}

/**
 * Build VSIM command array
 */
function buildVSIMCommand(args: VSIMCommandArgs): (string | number)[] {
  const cmd: (string | number)[] = [
    'VSIM',
    args.key,
    args.format,
    args.vectorLength,
    ...args.vector.map(String),
  ];

  if (args.count) {
    cmd.push('COUNT', args.count);
  }
  if (args.ef) {
    cmd.push('EF', args.ef);
  }
  if (args.withScores) {
    cmd.push('WITHSCORES');
  }
  if (args.filter) {
    cmd.push('FILTER', args.filter);
  }

  return cmd;
}
```

---

## Validation Schemas

### Vector Validation (VALUES format)

```typescript
/**
 * Validate vector in VALUES format (comma-separated numbers)
 */
interface VectorValidation {
  isValid: boolean;
  error?: string;
  parsedVector?: number[];
}

function validateVector(
  input: string,
  expectedDimensions?: number,
): VectorValidation {
  try {
    const parsed = input
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .map(Number);

    if (parsed.some(isNaN)) {
      return { isValid: false, error: 'Vector must contain only numbers' };
    }

    if (expectedDimensions && parsed.length !== expectedDimensions) {
      return {
        isValid: false,
        error: `Vector must have ${expectedDimensions} dimensions, got ${parsed.length}`,
      };
    }

    return { isValid: true, parsedVector: parsed };
  } catch {
    return { isValid: false, error: 'Invalid vector format' };
  }
}
```

### FP32 Validation (Binary format)

FP32 is the binary format for vectors where each value is a 32-bit float (4 bytes, little-endian).

**Validation rules:**

| Check                 | Rule                               | Why                              |
| --------------------- | ---------------------------------- | -------------------------------- |
| Length divisible by 4 | `bytes.length % 4 === 0`           | Each FP32 value is 4 bytes       |
| Non-empty             | `bytes.length > 0`                 | At least one vector value        |
| Dimension match       | `bytes.length / 4 === expectedDim` | Must match vector set            |
| No NaN/Infinity       | Check parsed values                | Optional - reject special floats |

```typescript
interface FP32ValidationResult {
  isValid: boolean;
  error?: string;
  dimension?: number;
  values?: number[];
}

/**
 * Validate if a Buffer/Uint8Array is valid FP32 format
 */
function validateFP32Buffer(
  data: Buffer | Uint8Array,
  expectedDimension?: number,
): FP32ValidationResult {
  if (!data || data.length === 0) {
    return { isValid: false, error: 'FP32 data is empty' };
  }

  if (data.length % 4 !== 0) {
    return {
      isValid: false,
      error: `Invalid FP32 length: ${data.length} bytes (must be divisible by 4)`,
    };
  }

  const dimension = data.length / 4;

  if (expectedDimension !== undefined && dimension !== expectedDimension) {
    return {
      isValid: false,
      error: `Dimension mismatch: got ${dimension}, expected ${expectedDimension}`,
    };
  }

  // Parse and validate values (little-endian)
  const values: number[] = [];
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);

  for (let i = 0; i < dimension; i++) {
    const value = view.getFloat32(i * 4, true); // true = little-endian

    if (!Number.isFinite(value)) {
      return {
        isValid: false,
        error: `Invalid float at index ${i}: ${value} (NaN or Infinity not allowed)`,
      };
    }

    values.push(value);
  }

  return { isValid: true, dimension, values };
}

/**
 * Parse escaped hex string like "\x9a\x99\x59\x3f" to Uint8Array
 * Used when user inputs FP32 data as escaped string
 */
function parseEscapedHexString(input: string): Uint8Array | null {
  const pattern = /\\x([0-9a-fA-F]{2})/g;
  const bytes: number[] = [];
  let match;
  let lastIndex = 0;

  while ((match = pattern.exec(input)) !== null) {
    if (match.index !== lastIndex) {
      return null; // Unexpected characters between \x sequences
    }
    bytes.push(parseInt(match[1], 16));
    lastIndex = pattern.lastIndex;
  }

  if (lastIndex !== input.length) {
    return null; // Trailing characters
  }

  return new Uint8Array(bytes);
}

/**
 * Validate escaped hex string as FP32
 * Example: "\x9a\x99\x59\x3f\x00\x00\x40\x3f" → [0.85, 0.75]
 */
function validateEscapedFP32(
  input: string,
  expectedDimension?: number,
): FP32ValidationResult {
  const bytes = parseEscapedHexString(input);

  if (!bytes) {
    return {
      isValid: false,
      error: 'Invalid escaped hex format (expected \\xNN sequences)',
    };
  }

  return validateFP32Buffer(bytes, expectedDimension);
}

/**
 * Validate plain hex string as FP32
 * Example: "9a99593f0000403f" → [0.85, 0.75]
 */
function validateHexFP32(
  hex: string,
  expectedDimension?: number,
): FP32ValidationResult {
  const cleanHex = hex.replace(/\s/g, '').toLowerCase();

  if (!/^[0-9a-f]*$/.test(cleanHex)) {
    return { isValid: false, error: 'Invalid hex characters' };
  }

  if (cleanHex.length % 2 !== 0) {
    return { isValid: false, error: 'Hex string must have even length' };
  }

  const bytes = new Uint8Array(cleanHex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(cleanHex.slice(i * 2, i * 2 + 2), 16);
  }

  return validateFP32Buffer(bytes, expectedDimension);
}
```

### FP32 Conversion Utilities

```typescript
/**
 * Convert number array to FP32 Buffer (little-endian)
 */
function numbersToFP32(values: number[]): Uint8Array {
  const buffer = new ArrayBuffer(values.length * 4);
  const view = new DataView(buffer);

  values.forEach((value, i) => {
    view.setFloat32(i * 4, value, true); // true = little-endian
  });

  return new Uint8Array(buffer);
}

/**
 * Convert FP32 Buffer to number array
 */
function fp32ToNumbers(data: Buffer | Uint8Array): number[] {
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  const values: number[] = [];

  for (let i = 0; i < data.length / 4; i++) {
    values.push(view.getFloat32(i * 4, true)); // little-endian
  }

  return values;
}

/**
 * Convert FP32 Buffer to hex string
 */
function fp32ToHex(data: Uint8Array): string {
  return Array.from(data)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Convert FP32 Buffer to escaped hex string (for Redis CLI)
 */
function fp32ToEscapedHex(data: Uint8Array): string {
  return Array.from(data)
    .map((b) => '\\x' + b.toString(16).padStart(2, '0'))
    .join('');
}
```

**Usage examples:**

```typescript
// Validate escaped hex input (from user)
const result = validateEscapedFP32(
  '\\x9a\\x99\\x59\\x3f\\x00\\x00\\x40\\x3f',
  2,
);
// { isValid: true, dimension: 2, values: [0.85, 0.75] }

// Convert numbers to FP32 for Redis
const fp32 = numbersToFP32([0.85, 0.75, 0.65]);
console.log(fp32ToHex(fp32));
// '9a99593f0000403f6666263f'

console.log(fp32ToEscapedHex(fp32));
// '\x9a\x99\x59\x3f\x00\x00\x40\x3f\x66\x66\x26\x3f'
```

### Attribute Filter Validation

```typescript
/**
 * Validate attribute filter syntax
 * Supports: arithmetic (+, -, *, /, %, **), comparison (==, !=, >, <, >=, <=),
 * logical (and, or, not), containment (in), grouping (())
 */
function validateAttributeFilter(filter: string): {
  isValid: boolean;
  error?: string;
} {
  // Basic syntax validation
  const invalidChars = /[;`]/;
  if (invalidChars.test(filter)) {
    return { isValid: false, error: 'Invalid characters in filter' };
  }

  // Check for balanced parentheses
  let depth = 0;
  for (const char of filter) {
    if (char === '(') depth++;
    if (char === ')') depth--;
    if (depth < 0) {
      return { isValid: false, error: 'Unbalanced parentheses' };
    }
  }
  if (depth !== 0) {
    return { isValid: false, error: 'Unbalanced parentheses' };
  }

  return { isValid: true };
}
```

---

## Constants

```typescript
// redisinsight/api/src/modules/browser/vector-set/vector-set.constants.ts
export const VECTOR_SET_CONSTANTS = {
  /** Default number of elements to fetch (no pagination for MVP) */
  DEFAULT_COUNT: 10,

  /** Maximum elements per request */
  MAX_COUNT: 500,

  /** Default search results limit */
  DEFAULT_SEARCH_COUNT: 10,

  /** Maximum search results */
  MAX_SEARCH_COUNT: 1000,

  /** Default exploration factor for VSIM */
  DEFAULT_EF: 200,

  /** Maximum vector values to display in UI without truncation */
  MAX_VECTOR_DISPLAY_LENGTH: 100,

  /** Maximum JSON attributes size to display inline */
  MAX_ATTRIBUTES_PREVIEW_LENGTH: 200,
} as const;

export const VECTOR_SET_ERROR_MESSAGES = {
  DIMENSION_MISMATCH: 'Vector dimensions do not match the vector set',
  INVALID_FORMAT: 'Invalid vector format. Expected comma-separated numbers.',
  ELEMENT_NOT_FOUND: 'Element not found in vector set',
  INVALID_FILTER: 'Invalid filter syntax',
  KEY_NOT_EXIST: 'Vector set does not exist',
} as const;

// redisinsight/ui/src/constants/keys.ts (additions)
export const VECTOR_SET_QUANT_TYPES = {
  NONE: 'No quantization',
  Q8: '8-bit quantization',
  BIN: 'Binary quantization',
} as const;
```

---

## Test Factories

```typescript
// redisinsight/ui/src/test/factories/vectorset.factory.ts
import { Factory } from 'fishery';
import { faker } from '@faker-js/faker';
import {
  VectorSetElement,
  VectorSetSearchResult,
  VectorSetInfo,
} from 'uiSrc/slices/interfaces/vectorset';

export const vectorSetElementFactory = Factory.define<VectorSetElement>(() => ({
  name: faker.string.alphanumeric(12),
  vector: Array.from({ length: faker.number.int({ min: 64, max: 512 }) }, () =>
    faker.number.float({ min: -1, max: 1 }),
  ),
  attributes: faker.datatype.boolean()
    ? {
        category: faker.commerce.department(),
        price: faker.commerce.price(),
        rating: faker.number.float({ min: 1, max: 5, fractionDigits: 1 }),
      }
    : undefined,
}));

export const vectorSetSearchResultFactory =
  Factory.define<VectorSetSearchResult>(() => ({
    ...vectorSetElementFactory.build(),
    score: faker.number.float({ min: 0, max: 1 }),
  }));

export const vectorSetInfoFactory = Factory.define<VectorSetInfo>(() => ({
  size: faker.number.int({ min: 1000, max: 100000 }),
  vectorDim: faker.helpers.arrayElement([64, 128, 256, 384, 512, 768, 1024]),
  quantType: faker.helpers.arrayElement(['NONE', 'Q8', 'BIN']),
  metadata: {},
}));
```
