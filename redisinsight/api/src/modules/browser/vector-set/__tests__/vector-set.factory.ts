import { Factory } from 'fishery';
import { faker } from '@faker-js/faker';
import { BrowserToolVectorSetCommands } from 'src/modules/browser/constants/browser-tool-commands';
import {
  AddElementsToVectorSetDto,
  AddVectorSetElementDto,
  CreateVectorSetDto,
  DeleteVectorSetElementsDto,
  VectorSetElementDetailsDto,
  VectorSetElementKeyDto,
  GetVectorSetElementsDto,
  GetVectorSetElementsResponse,
  SearchVectorSetDto,
  SearchVectorSetMatchDto,
  SearchVectorSetResponse,
  SetVectorSetElementAttributeDto,
} from 'src/modules/browser/vector-set/dto';

export const vectorSetElementFactory =
  Factory.define<VectorSetElementDetailsDto>(() => ({
    name: Buffer.from(faker.string.alphanumeric(8)),
    vector: Array.from({ length: 3 }, () =>
      parseFloat(
        faker.number.float({ min: 0, max: 1, fractionDigits: 2 }).toFixed(2),
      ),
    ),
    attributes: faker.datatype.boolean()
      ? JSON.stringify({ [faker.string.alpha(5)]: faker.string.alpha(5) })
      : undefined,
  }));

export const getVectorSetElementsDtoFactory =
  Factory.define<GetVectorSetElementsDto>(() => ({
    keyName: Buffer.from(`vset:${faker.string.alphanumeric(6)}`),
    start: '-',
    end: '+',
    count: faker.number.int({ min: 1, max: 100 }),
  }));

export const deleteVectorSetElementsDtoFactory =
  Factory.define<DeleteVectorSetElementsDto>(() => ({
    keyName: Buffer.from(`vset:${faker.string.alphanumeric(6)}`),
    elements: [
      Buffer.from(faker.string.alphanumeric(8)),
      Buffer.from(faker.string.alphanumeric(8)),
    ],
  }));

export const getVectorSetElementDetailsDtoFactory =
  Factory.define<VectorSetElementKeyDto>(() => ({
    keyName: Buffer.from(`vset:${faker.string.alphanumeric(6)}`),
    element: Buffer.from(faker.string.alphanumeric(8)),
  }));

export const setVectorSetElementAttributeDtoFactory =
  Factory.define<SetVectorSetElementAttributeDto>(() => ({
    keyName: Buffer.from(`vset:${faker.string.alphanumeric(6)}`),
    element: Buffer.from(faker.string.alphanumeric(8)),
    attributes: JSON.stringify({
      [faker.string.alpha(5)]: faker.string.alpha(5),
    }),
  }));

export const downloadVectorSetEmbeddingDtoFactory =
  Factory.define<VectorSetElementKeyDto>(() => ({
    keyName: Buffer.from(`vset:${faker.string.alphanumeric(6)}`),
    element: Buffer.from(faker.string.alphanumeric(8)),
  }));

export const addVectorSetElementDtoFactory =
  Factory.define<AddVectorSetElementDto>(() => ({
    name: Buffer.from(faker.string.alphanumeric(8)),
    vectorValues: Array.from({ length: 3 }, () =>
      parseFloat(
        faker.number.float({ min: 0, max: 1, fractionDigits: 2 }).toFixed(2),
      ),
    ),
  }));

/**
 * Shared FP32 fixture used across vector-set service/DTO specs. Represents the
 * vector `[1.0, 2.0, 3.0]` as a 12-byte little-endian IEEE-754 blob along with
 * its base64 wire form, so tests can assert the `VADD ... FP32 <buf> ...`
 * pipeline without re-computing the byte layout inline.
 *
 * 1.0 -> 00 00 80 3f, 2.0 -> 00 00 00 40, 3.0 -> 00 00 40 40
 */
export const FP32_VECTOR_FIXTURE_1_2_3 = (() => {
  const buffer = Buffer.from([
    0x00, 0x00, 0x80, 0x3f, 0x00, 0x00, 0x00, 0x40, 0x00, 0x00, 0x40, 0x40,
  ]);
  return {
    buffer,
    base64: buffer.toString('base64'),
    dim: buffer.length / 4,
  };
})();

/**
 * Convenience factory that builds an `AddVectorSetElementDto` carrying a
 * base64 FP32 payload instead of `vectorValues`. `vectorValues` is explicitly
 * set to `undefined` so the service's dispatch branch picks FP32 and no
 * `VALUES` fragment leaks into the pipeline.
 */
export const fp32AddVectorSetElementDtoFactory =
  Factory.define<AddVectorSetElementDto>(() => ({
    name: Buffer.from(faker.string.alphanumeric(8)),
    vectorValues: undefined,
    vectorFp32: FP32_VECTOR_FIXTURE_1_2_3.base64,
  }));

export const addElementsToVectorSetDtoFactory =
  Factory.define<AddElementsToVectorSetDto>(() => ({
    keyName: Buffer.from(`vset:${faker.string.alphanumeric(6)}`),
    elements: addVectorSetElementDtoFactory.buildList(2),
  }));

export const createVectorSetDtoFactory = Factory.define<CreateVectorSetDto>(
  () => ({
    keyName: Buffer.from(`vset:${faker.string.alphanumeric(6)}`),
    elements: addVectorSetElementDtoFactory.buildList(2),
  }),
);

export const getVectorSetElementsResponseFactory =
  Factory.define<GetVectorSetElementsResponse>(({ transientParams }) => {
    const elementNames =
      transientParams.elementNames ??
      vectorSetElementFactory.buildList(3).map((el) => el.name);

    return {
      keyName: Buffer.from(`vset:${faker.string.alphanumeric(6)}`),
      total: elementNames.length,
      nextCursor: undefined,
      isPaginationSupported: true,
      elementNames,
    };
  });

export const searchVectorSetByElementDtoFactory =
  Factory.define<SearchVectorSetDto>(() => ({
    keyName: Buffer.from(`vset:${faker.string.alphanumeric(6)}`),
    elementName: Buffer.from(faker.string.alphanumeric(8)),
    vectorValues: undefined,
    vectorFp32: undefined,
    count: faker.number.int({ min: 1, max: 100 }),
  }));

export const searchVectorSetByValuesDtoFactory =
  Factory.define<SearchVectorSetDto>(() => ({
    keyName: Buffer.from(`vset:${faker.string.alphanumeric(6)}`),
    elementName: undefined,
    vectorValues: [1, 2, 3],
    vectorFp32: undefined,
    count: faker.number.int({ min: 1, max: 100 }),
  }));

export const searchVectorSetByFp32DtoFactory =
  Factory.define<SearchVectorSetDto>(() => ({
    keyName: Buffer.from(`vset:${faker.string.alphanumeric(6)}`),
    elementName: undefined,
    vectorValues: undefined,
    vectorFp32: FP32_VECTOR_FIXTURE_1_2_3.base64,
    count: faker.number.int({ min: 1, max: 100 }),
  }));

export const searchVectorSetMatchFactory =
  Factory.define<SearchVectorSetMatchDto>(({ transientParams }) => {
    const match: SearchVectorSetMatchDto = {
      name: Buffer.from(faker.string.alphanumeric(8)),
      score: parseFloat(
        faker.number.float({ min: 0, max: 1, fractionDigits: 4 }).toFixed(4),
      ),
    };
    if (transientParams.withAttributes) {
      match.attributes = JSON.stringify({
        [faker.string.alpha(5)]: faker.string.alpha(5),
      });
    }
    return match;
  });

export const searchVectorSetResponseFactory =
  Factory.define<SearchVectorSetResponse>(() => ({
    keyName: Buffer.from(`vset:${faker.string.alphanumeric(6)}`),
    elements: searchVectorSetMatchFactory.buildList(2),
  }));

/**
 * Stable VSIM match fixtures used by `similaritySearch` service specs. These are
 * exported as constants (instead of factory builds) so tests that compare the
 * exact reply payload to the parsed response can rely on referential equality
 * for the buffer/string fields.
 */
export const SEARCH_VSIM_MATCH_NAME_1 = Buffer.from('match_1');
export const SEARCH_VSIM_MATCH_NAME_2 = Buffer.from('match_2');
export const SEARCH_VSIM_MATCH_ATTRIBUTES_1 = JSON.stringify({ k: 'v' });

/**
 * Canonical flat VSIM reply for two matches, mirroring the Redis wire layout
 * `name, score, attributes` per match (stride 3). The first match carries
 * attributes; the second has `null` so specs cover both branches in one reply.
 */
export const SEARCH_VSIM_REPLY_TWO_MATCHES: Array<string | Buffer | null> = [
  SEARCH_VSIM_MATCH_NAME_1,
  '0.95',
  SEARCH_VSIM_MATCH_ATTRIBUTES_1,
  SEARCH_VSIM_MATCH_NAME_2,
  '0.81',
  null,
];

type VsimCommandOptions = {
  /** Append `COUNT <n>`. Defaults to true; set to false to omit the segment. */
  includeCount?: boolean;
  /** Append `FILTER <expr>` after `COUNT`. */
  filter?: string;
};

const appendCommonVsimSuffix = (
  args: unknown[],
  count: number | undefined,
  options: VsimCommandOptions,
): unknown[] => {
  args.push('WITHSCORES', 'WITHATTRIBS');
  if (options.includeCount !== false && count !== undefined) {
    args.push('COUNT', count);
  }
  if (options.filter !== undefined) {
    args.push('FILTER', options.filter);
  }
  return args;
};

/**
 * Build the expected VSIM command array for an element-mode similarity
 * search, in the exact order the production `buildVsimCommand` emits it.
 * Specs use this both as a `when().calledWith(...)` matcher and as the
 * argument passed to `expect(...).toHaveBeenCalledWith(...)`.
 */
export const buildVsimByElementCommand = (
  dto: Pick<SearchVectorSetDto, 'keyName' | 'elementName' | 'count'>,
  options: VsimCommandOptions = {},
): unknown[] =>
  appendCommonVsimSuffix(
    [BrowserToolVectorSetCommands.VSim, dto.keyName, 'ELE', dto.elementName],
    dto.count,
    options,
  );

export const buildVsimByValuesCommand = (
  dto: Pick<SearchVectorSetDto, 'keyName' | 'vectorValues' | 'count'>,
  options: VsimCommandOptions = {},
): unknown[] => {
  const values = dto.vectorValues ?? [];
  return appendCommonVsimSuffix(
    [
      BrowserToolVectorSetCommands.VSim,
      dto.keyName,
      'VALUES',
      values.length,
      ...values.map(String),
    ],
    dto.count,
    options,
  );
};

export const buildVsimByFp32Command = (
  dto: Pick<SearchVectorSetDto, 'keyName' | 'count'>,
  fp32Buffer: Buffer,
  options: VsimCommandOptions = {},
): unknown[] =>
  appendCommonVsimSuffix(
    [BrowserToolVectorSetCommands.VSim, dto.keyName, 'FP32', fp32Buffer],
    dto.count,
    options,
  );
