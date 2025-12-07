import {
  mockAiQueryFullDbContext,
  mockAiQueryGetDescriptionTopValuesReply,
  mockAiQueryGetPriceTopValuesReply,
  mockAiQueryGetTypeTopValuesReply,
  mockAiQueryHScanReply,
  mockAiQueryIndex,
  mockAiQueryIndexContext,
  mockAiQueryIndexInfoObject,
  mockAiQueryIndexInfoReply,
  mockAiQueryJsonReply,
  mockAiQuerySchema,
  mockAiQuerySchemaForHash,
  mockStandaloneRedisClient,
} from 'src/__mocks__';
import { when } from 'jest-when';
import {
  quotesIfNeeded,
  convertArrayReplyToObject,
  convertIndexInfoAttributeReply,
  convertIndexInfoReply,
  getAttributeTopValues,
  createIndexCreateStatement,
  createIndexContext,
  getDocumentsSchema,
  getIndexContext,
  getFullDbContext,
} from './context.util';

describe('ContextUtility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('quotesIfNeeded', () => {
    it.each([
      { input: 'string', result: 'string' },
      { input: 'string with spaces', result: '"string with spaces"' },
      {
        input: 'string with special characters"',
        result: '"string with special characters\\""',
      },
      { input: null, result: null },
      { input: undefined, result: undefined },
      { input: { some: 'obj' } as unknown as string, result: { some: 'obj' } },
    ])('should add quotes when needed', async ({ input, result }) => {
      expect(quotesIfNeeded(input)).toEqual(result);
    });
  });
  describe('quotesIfNeeded', () => {
    it.each([
      { input: ['key', 'value'], result: { key: 'value' } },
      { input: [], result: {} },
      {
        input: ['key', 'value', 'array', ['some', 'array']],
        result: { key: 'value', array: ['some', 'array'] },
      },
      { input: null, result: {} },
      { input: undefined, result: {} },
      { input: { some: 'obj' } as any, result: {} },
      {
        input: [{ some: 'obj' }, 'value'] as any,
        result: { '[object Object]': 'value' },
      },
    ])('should return object', async ({ input, result }) => {
      expect(convertArrayReplyToObject(input)).toEqual(result);
    });
  });
  describe('convertIndexInfoAttributeReply', () => {
    it.each([
      {
        input: ['key', 'value'],
        result: {
          key: 'value',
        },
      },
      {
        input: [
          'key',
          'value',
          'SORTABLE',
          'NOINDEX',
          'CASESENSITIVE',
          'UNF',
          'NOSTEM',
        ],
        result: {
          key: 'value',
          SORTABLE: true,
          NOINDEX: true,
          CASESENSITIVE: true,
          UNF: true,
          NOSTEM: true,
        },
      },
      { input: [], result: {} },
      { input: null, result: {} },
      { input: undefined, result: {} },
      { input: { some: 'obj' } as any, result: {} },
      {
        input: [{ some: 'obj' }, 'value'] as any,
        result: { '[object Object]': 'value' },
      },
    ])('should return attribute info', async ({ input, result }) => {
      expect(convertIndexInfoAttributeReply(input)).toEqual(result);
    });
  });
  describe('convertIndexInfoReply', () => {
    it.each([
      {
        input: ['key', 'value'],
        result: {
          key: 'value',
          index_definition: {},
        },
      },
      {
        input: [
          'key',
          'value',
          'index_definition',
          ['index_name', 'idx:index'],
          'attributes',
          [
            [
              'identifier',
              '$.brand',
              'attribute',
              'brand',
              'type',
              'TEXT',
              'WEIGHT',
              '1',
              'SORTABLE',
              'NOINDEX',
              'CASESENSITIVE',
              'UNF',
              'NOSTEM',
            ],
          ],
        ],
        result: {
          key: 'value',
          index_definition: { index_name: 'idx:index' },
          attributes: [
            {
              identifier: '$.brand',
              attribute: 'brand',
              type: 'TEXT',
              WEIGHT: '1',
              SORTABLE: true,
              NOINDEX: true,
              CASESENSITIVE: true,
              UNF: true,
              NOSTEM: true,
            },
          ],
        },
      },
      { input: [], result: { index_definition: {} } },
      { input: null, result: { index_definition: {} } },
      { input: undefined, result: { index_definition: {} } },
      { input: { some: 'obj' } as any, result: { index_definition: {} } },
      {
        input: [{ some: 'obj' }, 'value'] as any,
        result: { '[object Object]': 'value', index_definition: {} },
      },
    ])('should return attribute info', async ({ input, result }) => {
      expect(convertIndexInfoReply(input)).toEqual(result);
    });
  });
  describe('getAttributeTopValues', () => {
    beforeEach(() => {
      mockStandaloneRedisClient.sendCommand.mockResolvedValue([
        '3',
        ['1', 'v1'],
        ['1', 'v2'],
        ['1', 'v3'],
      ]);
    });

    const mockResult = {
      distinct_count: 3,
      top_values: [{ value: 'v1' }, { value: 'v2' }, { value: 'v3' }],
    };

    it.each([
      { input: ['idx', { type: 'text' }], result: mockResult },
      { input: ['idx', { type: 'tag' }], result: mockResult },
      { input: ['idx', { type: 'numeric' }], result: mockResult },
      { input: ['idx', { type: 'geo' }], result: mockResult },
      { input: ['idx', { type: 'hash' }], result: {} },
      { input: ['idx', { type: 'rejson' }], result: {} },
      { input: [], result: {} },
      { input: [null, null], result: {} },
      { input: [{ some: 'obj' }, 'value'] as any, result: {} },
    ])(
      'should return top values',
      async ({ input: [index, attribute], result }) => {
        expect(
          await getAttributeTopValues(
            mockStandaloneRedisClient,
            index,
            attribute,
          ),
        ).toEqual(result);
      },
    );

    it('should not fail when empty array received and set count to 0', async () => {
      mockStandaloneRedisClient.sendCommand.mockResolvedValueOnce([]);
      expect(
        await getAttributeTopValues(mockStandaloneRedisClient, 'idx', {
          type: 'geo',
        }),
      ).toEqual({ distinct_count: 0, top_values: [] });
    });

    it('should not fail when count 0 and no keys', async () => {
      mockStandaloneRedisClient.sendCommand.mockResolvedValueOnce(['0']);
      expect(
        await getAttributeTopValues(mockStandaloneRedisClient, 'idx', {
          type: 'geo',
        }),
      ).toEqual({ distinct_count: 0, top_values: [] });
    });

    it('should not fail', async () => {
      mockStandaloneRedisClient.sendCommand.mockRejectedValueOnce(
        new Error('ERR: syntax error'),
      );
      expect(
        await getAttributeTopValues(mockStandaloneRedisClient, 'idx', {
          type: 'geo',
        }),
      ).toEqual({});
    });
  });
  describe('createIndexCreateStatement', () => {
    it.each([
      {
        input: {
          index_name: 'idx',
          index_definition: {
            prefixes: [],
            key_type: 'HASH',
          },
          attributes: [
            {
              identifier: '$.brand',
              attribute: 'brand',
              type: 'TAG',
              WEIGHT: '1',
              SORTABLE: true,
              NOINDEX: true,
              CASESENSITIVE: true,
              UNF: true,
              NOSTEM: true,
            },
          ],
        },
        result: 'FT.CREATE idx ON HASH SCHEMA $.brand AS brand TAG',
      },
      {
        input: {
          index_name: 'idx',
          index_definition: {
            prefixes: ['*'],
            key_type: 'HASH',
            filter: 'type',
          },
          attributes: [
            {
              identifier: '$.brand',
              attribute: 'brand',
              type: 'TAG',
              WEIGHT: '1',
              SORTABLE: true,
              NOINDEX: true,
              CASESENSITIVE: true,
              UNF: true,
              NOSTEM: true,
            },
          ],
        },
        result:
          'FT.CREATE idx ON HASH PREFIX 1 * FILTER type SCHEMA $.brand AS brand TAG',
      },
      { input: {}, result: undefined },
      { input: undefined, result: undefined },
      { input: null, result: undefined },
      { input: [{ some: 'obj' }, 'value'] as any, result: undefined },
    ])('should return object', async ({ input, result }) => {
      expect(createIndexCreateStatement(input)).toEqual(result);
    });
  });
  describe('createIndexContext', () => {
    it.each([
      {
        input: {
          index_name: 'idx',
          index_definition: {
            prefixes: ['*'],
            key_type: 'HASH',
            filter: 'type',
          },
          attributes: [
            {
              identifier: '$.brand',
              attribute: 'brand',
              type: 'TAG',
              WEIGHT: '1',
              SORTABLE: true,
              NOINDEX: true,
              CASESENSITIVE: true,
              UNF: true,
              NOSTEM: true,
            },
          ],
        },
        result: {
          index_name: 'idx',
          create_statement:
            'FT.CREATE idx ON HASH PREFIX 1 * FILTER type SCHEMA $.brand AS brand TAG',
          attributes: {
            brand: {
              CASESENSITIVE: true,
              NOINDEX: true,
              NOSTEM: true,
              SORTABLE: true,
              UNF: true,
              WEIGHT: '1',
              attribute: 'brand',
              identifier: '$.brand',
              type: 'TAG',
            },
          },
        },
      },
      { input: {}, result: { attributes: {} } },
      { input: undefined, result: { attributes: {} } },
      { input: null, result: { attributes: {} } },
      { input: [{ some: 'obj' }, 'value'] as any, result: { attributes: {} } },
    ])('should return object', async ({ input, result }) => {
      expect(createIndexContext(input)).toEqual(result);
    });
  });
  describe('getDocumentsSchema', () => {
    beforeEach(() => {
      jest.clearAllMocks();

      when(mockStandaloneRedisClient.sendCommand)
        .calledWith(expect.arrayContaining(['FT.SEARCH']), expect.anything())
        .mockResolvedValueOnce(['0', 'key']);

      when(mockStandaloneRedisClient.sendCommand)
        .calledWith(expect.arrayContaining(['json.get']), expect.anything())
        .mockResolvedValueOnce(mockAiQueryJsonReply);
      when(mockStandaloneRedisClient.sendCommand)
        .calledWith(expect.arrayContaining(['HSCAN']), expect.anything())
        .mockResolvedValueOnce(mockAiQueryHScanReply);
    });

    it('Should get document schema for json type', async () => {
      expect(
        await getDocumentsSchema(
          mockStandaloneRedisClient,
          mockAiQueryIndex,
          mockAiQueryIndexInfoObject,
        ),
      ).toEqual(mockAiQuerySchema);
    });
    it('Should get document schema for hash type', async () => {
      expect(
        await getDocumentsSchema(mockStandaloneRedisClient, mockAiQueryIndex, {
          index_definition: { key_type: 'HASH' },
        }),
      ).toEqual(mockAiQuerySchemaForHash);
    });
    it('Should return empty schema object for non-supported type', async () => {
      expect(
        await getDocumentsSchema(mockStandaloneRedisClient, mockAiQueryIndex, {
          index_definition: { key_type: 'STRING' },
        }),
      ).toEqual({
        $ref: '#/definitions/IdxBicycle',
        $schema: 'http://json-schema.org/draft-06/schema#',
        definitions: {
          IdxBicycle: {
            additionalProperties: false,
            title: 'IdxBicycle',
            type: 'object',
          },
        },
      });
    });
  });
  describe('getIndexContext', () => {
    beforeEach(() => {
      jest.clearAllMocks();

      when(mockStandaloneRedisClient.sendCommand)
        .calledWith(expect.arrayContaining(['FT.SEARCH']), expect.anything())
        .mockResolvedValue(['0', 'key']);
      when(mockStandaloneRedisClient.sendCommand)
        .calledWith(
          expect.arrayContaining(['FT.AGGREGATE', '@price']),
          expect.anything(),
        )
        .mockResolvedValue(mockAiQueryGetPriceTopValuesReply)
        .calledWith(
          expect.arrayContaining(['FT.AGGREGATE', '@description']),
          expect.anything(),
        )
        .mockResolvedValue(mockAiQueryGetDescriptionTopValuesReply)
        .calledWith(
          expect.arrayContaining(['FT.AGGREGATE', '@type']),
          expect.anything(),
        )
        .mockResolvedValue(mockAiQueryGetTypeTopValuesReply);
      when(mockStandaloneRedisClient.sendCommand)
        .calledWith(expect.arrayContaining(['FT.INFO']), expect.anything())
        .mockResolvedValue(mockAiQueryIndexInfoReply);
      when(mockStandaloneRedisClient.sendCommand)
        .calledWith(expect.arrayContaining(['json.get']), expect.anything())
        .mockResolvedValue(mockAiQueryJsonReply);
      when(mockStandaloneRedisClient.sendCommand)
        .calledWith(expect.arrayContaining(['HSCAN']), expect.anything())
        .mockResolvedValue(mockAiQueryHScanReply);
    });

    it('Should get index context', async () => {
      expect(
        await getIndexContext(mockStandaloneRedisClient, mockAiQueryIndex),
      ).toEqual(mockAiQueryIndexContext);
    });
  });
  describe('getFullDbContext', () => {
    beforeEach(() => {
      jest.clearAllMocks();

      when(mockStandaloneRedisClient.sendCommand)
        .calledWith(expect.arrayContaining(['FT._LIST']), expect.anything())
        .mockResolvedValue([mockAiQueryIndex]);
      when(mockStandaloneRedisClient.sendCommand)
        .calledWith(expect.arrayContaining(['FT.INFO']), expect.anything())
        .mockResolvedValue(mockAiQueryIndexInfoReply);
    });

    it('Should get index context', async () => {
      expect(await getFullDbContext(mockStandaloneRedisClient)).toEqual(
        mockAiQueryFullDbContext,
      );
    });
  });
});
