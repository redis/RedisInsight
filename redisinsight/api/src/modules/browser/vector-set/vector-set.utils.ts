import { BadRequestException, Logger } from '@nestjs/common';
import { RedisString } from 'src/common/constants';
import { BrowserToolVectorSetCommands } from 'src/modules/browser/constants/browser-tool-commands';
import { RedisClientCommand } from 'src/modules/redis/client';
import {
  AddVectorSetElementDto,
  SearchVectorSetMatchDto,
  SimilaritySearchDto,
} from 'src/modules/browser/vector-set/dto';
import { VSIM_REPLY_STRIDE } from 'src/modules/browser/vector-set/constants';

/**
 * Resolved query clause shared between the executable command builder and the
 * preview formatter so the two paths cannot drift on which mode they pick or
 * how they normalize their inputs.
 */
type ResolvedVsimQuery =
  | { mode: 'ELE'; element: RedisString }
  | { mode: 'VALUES'; values: number[] }
  | { mode: 'FP32'; bytes: Buffer };

/**
 * Strategy passed to `writeVsimTokens` so the executable and preview paths
 * can share the same token layout (clause order, count/filter handling,
 * `WITHSCORES WITHATTRIBS` tail) and only diverge on how individual leaves
 * are rendered. The executable path emits raw values straight to the Redis
 * client; the preview path emits CLI-friendly strings.
 */
type VsimTokenWriter<T> = {
  literal: (token: string) => T;
  key: (key: RedisString) => T;
  element: (element: RedisString) => T;
  fp32: (bytes: Buffer) => T;
  /** Length / count integers — passed verbatim to the executable command. */
  number: (value: number) => T;
  /**
   * Individual entries of a numeric query vector. Stringified by the
   * executable path so the underlying Redis client can't lose float
   * precision on the wire; stringified by the preview path for display.
   */
  vectorValue: (value: number) => T;
  filter: (filter: string) => T;
};

// ---------------------------------------------------------------------------
// Module-private helpers
// ---------------------------------------------------------------------------

function bufferOrStringToString(value: RedisString): string {
  if (typeof value === 'string') return value;
  return value.toString('utf8');
}

function bytesToEscapeString(buf: Buffer): string {
  let out = '';
  for (let i = 0; i < buf.length; i += 1) {
    out += `\\x${buf[i].toString(16).padStart(2, '0')}`;
  }
  return out;
}

function quoteForCli(value: string): string {
  if (value.length === 0) return '""';
  if (/[\s"'\\]/.test(value)) {
    return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
  }
  return value;
}

/**
 * Resolve which of the three mutually-exclusive query payloads the DTO
 * supplied. Returns `null` when none were supplied — callers decide whether
 * that is an error (search) or a no-op (preview). Throws for the genuinely
 * invalid case where more than one was supplied.
 */
function resolveVsimQuery(dto: SimilaritySearchDto): ResolvedVsimQuery | null {
  const hasElementName =
    dto.elementName !== undefined &&
    dto.elementName !== null &&
    ((typeof dto.elementName === 'string' && dto.elementName.length > 0) ||
      Buffer.isBuffer(dto.elementName));
  const hasVectorFp32 =
    typeof dto.vectorFp32 === 'string' && dto.vectorFp32.length > 0;
  const hasVectorValues =
    Array.isArray(dto.vectorValues) && dto.vectorValues.length > 0;

  const suppliedCount =
    Number(hasElementName) + Number(hasVectorFp32) + Number(hasVectorValues);

  if (suppliedCount > 1) {
    throw new BadRequestException(
      'Vector similarity search must supply exactly one of `elementName`, `vectorValues`, or `vectorFp32`.',
    );
  }

  if (hasElementName) {
    return { mode: 'ELE', element: dto.elementName };
  }
  if (hasVectorFp32) {
    return { mode: 'FP32', bytes: Buffer.from(dto.vectorFp32, 'base64') };
  }
  if (hasVectorValues) {
    return { mode: 'VALUES', values: dto.vectorValues };
  }
  return null;
}

/**
 * Lay out the canonical VSIM token sequence (header, query clause, COUNT,
 * `WITHSCORES WITHATTRIBS` tail, FILTER) and delegate the rendering of
 * each individual token to the supplied writer. Both the executable
 * command builder and the preview formatter go through this helper so
 * the two paths cannot drift on which clauses are emitted in what order.
 */
function writeVsimTokens<T>(
  dto: SimilaritySearchDto,
  query: ResolvedVsimQuery,
  tokenWriter: VsimTokenWriter<T>,
): T[] {
  const tokens: T[] = [
    tokenWriter.literal(BrowserToolVectorSetCommands.VSim),
    tokenWriter.key(dto.keyName),
  ];

  if (query.mode === 'ELE') {
    tokens.push(tokenWriter.literal('ELE'), tokenWriter.element(query.element));
  } else if (query.mode === 'VALUES') {
    tokens.push(
      tokenWriter.literal('VALUES'),
      tokenWriter.number(query.values.length),
      ...query.values.map((n) => tokenWriter.vectorValue(n)),
    );
  } else {
    tokens.push(tokenWriter.literal('FP32'), tokenWriter.fp32(query.bytes));
  }

  if (dto.count !== undefined && Number.isFinite(dto.count)) {
    tokens.push(tokenWriter.literal('COUNT'), tokenWriter.number(dto.count));
  }

  // WITHSCORES and WITHATTRIBS are always appended so the response shape
  // is stable; they are intentionally not part of the DTO.
  tokens.push(
    tokenWriter.literal('WITHSCORES'),
    tokenWriter.literal('WITHATTRIBS'),
  );

  if (dto.filter !== undefined && dto.filter !== '') {
    tokens.push(tokenWriter.literal('FILTER'), tokenWriter.filter(dto.filter));
  }

  return tokens;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Build the VADD pipeline command for a single element. Stays defensive
 * about which of `vectorValues` / `vectorFp32` is present even though DTO
 * validation should already enforce exactly one — any future internal
 * caller that bypasses class-validator will fail loudly here instead of
 * crashing on an `undefined.length` read.
 */
export function buildVaddCommand(
  keyName: Buffer | string,
  element: AddVectorSetElementDto,
): RedisClientCommand {
  const args: Array<string | number | Buffer> = [
    BrowserToolVectorSetCommands.VAdd,
    keyName,
  ];

  const hasVectorFp32 =
    typeof element.vectorFp32 === 'string' && element.vectorFp32.length > 0;
  const hasVectorValues =
    Array.isArray(element.vectorValues) && element.vectorValues.length > 0;

  if (hasVectorFp32 && hasVectorValues) {
    throw new BadRequestException(
      'Vector element must supply either `vectorValues` (number[]) or `vectorFp32` (base64 string), not both.',
    );
  }

  if (hasVectorFp32) {
    args.push('FP32', Buffer.from(element.vectorFp32, 'base64'), element.name);
  } else if (hasVectorValues) {
    args.push(
      'VALUES',
      element.vectorValues.length,
      ...element.vectorValues.map(String),
      element.name,
    );
  } else {
    throw new BadRequestException(
      'Vector element requires either `vectorValues` (number[]) or `vectorFp32` (base64 string).',
    );
  }

  if (element.attributes !== undefined) {
    args.push('SETATTR', element.attributes);
  }

  return args as RedisClientCommand;
}

export function buildVsimCommand(dto: SimilaritySearchDto): RedisClientCommand {
  const query = resolveVsimQuery(dto);

  if (!query) {
    throw new BadRequestException(
      'Vector similarity search requires one of `elementName`, `vectorValues`, or `vectorFp32`.',
    );
  }

  return writeVsimTokens<string | number | Buffer>(dto, query, {
    literal: (token) => token,
    key: (key) => key as string | Buffer,
    element: (element) => element as string | Buffer,
    fp32: (bytes) => bytes,
    number: (value) => value,
    vectorValue: (value) => String(value),
    filter: (filter) => filter,
  }) as RedisClientCommand;
}

/**
 * Build the human-readable VSIM command preview for the supplied DTO.
 * Shares `resolveVsimQuery` and `writeVsimTokens` with `buildVsimCommand`
 * so the preview cannot drift from what the search endpoint would actually
 * execute.
 *
 * Returns an empty string when no query payload is supplied — the FE only
 * asks for a preview once the form is valid, so a missing query is treated
 * as "nothing to preview yet" rather than rendering a placeholder command.
 * `keyName` is guaranteed by `KeyDto` (`@IsDefined`) — requests without it
 * are rejected at the validation pipe before reaching this function.
 */
export function formatVsimCommandPreview(dto: SimilaritySearchDto): string {
  const query = resolveVsimQuery(dto);

  if (!query) {
    return '';
  }

  return writeVsimTokens<string>(dto, query, {
    literal: (token) => token,
    key: (key) => quoteForCli(bufferOrStringToString(key)),
    element: (element) => quoteForCli(bufferOrStringToString(element)),
    // Render the FP32 bytes back as the canonical `\xHH\xHH...` escape
    // string so the preview is copy-paste-safe into `redis-cli`. Wrapped in
    // double quotes for the same reason.
    fp32: (bytes) => `"${bytesToEscapeString(bytes)}"`,
    number: (value) => String(value),
    vectorValue: (value) => String(value),
    filter: (filter) => quoteForCli(filter),
  }).join(' ');
}

export function parseVsimReply(
  reply: Array<string | Buffer | null> | null | undefined,
  logger?: Logger,
): SearchVectorSetMatchDto[] {
  if (!reply || reply.length === 0) {
    return [];
  }

  // Defensive: drop any trailing partial tuple. Redis is expected to always
  // return a multiple of `VSIM_REPLY_STRIDE`, so this only protects against
  // unexpected server-side bugs.
  const remainder = reply.length % VSIM_REPLY_STRIDE;
  const usableLength =
    remainder === 0 ? reply.length : reply.length - remainder;
  if (remainder !== 0) {
    logger?.warn(
      `VSIM reply length ${reply.length} is not a multiple of ${VSIM_REPLY_STRIDE}; dropping trailing partial tuple.`,
    );
  }

  const matches: SearchVectorSetMatchDto[] = [];
  for (let i = 0; i < usableLength; i += VSIM_REPLY_STRIDE) {
    const name = reply[i] as string | Buffer;
    const rawScore = reply[i + 1];
    const rawAttributes = reply[i + 2];

    const score =
      typeof rawScore === 'number' ? rawScore : parseFloat(String(rawScore));

    const match: SearchVectorSetMatchDto = { name, score };
    if (rawAttributes !== null && rawAttributes !== undefined) {
      match.attributes =
        typeof rawAttributes === 'string'
          ? rawAttributes
          : String(rawAttributes);
    }
    matches.push(match);
  }
  return matches;
}
