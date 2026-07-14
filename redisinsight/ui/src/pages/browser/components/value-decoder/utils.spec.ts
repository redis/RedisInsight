import {
  findMatchingDecoderRule,
  formatHexBytes,
  formatParsedFields,
  formatParsedFieldsInline,
  getDefaultKeyPattern,
  getFixedSize,
  getKeyPatternSpecificity,
  getSizeUnit,
  matchKeyPattern,
  parseBinaryBuffer,
  resolveRepeatCount,
} from './utils'
import {
  createEmptyField,
  createEmptyRepeatBlock,
  MAX_REPEAT_DECODE_ITERATIONS,
} from './constants'
import { DecoderType, ParsedBinaryNode, ValueDecoderRule } from './types'

const countGroupNodes = (nodes: ParsedBinaryNode[]): number =>
  nodes.reduce((count, node) => {
    if (node.kind === 'group') {
      return count + 1 + countGroupNodes(node.children)
    }

    return count
  }, 0)

const toUint16leBytes = (value: number) => [
  value % 256,
  Math.floor(value / 256),
]

describe('value-decoder utils', () => {
  describe('getFixedSize', () => {
    it('returns fixed sizes for known types', () => {
      expect(getFixedSize('uint8')).toBe(1)
      expect(getFixedSize('uint16le')).toBe(2)
      expect(getFixedSize('uint32be')).toBe(4)
      expect(getFixedSize('doublele')).toBe(8)
      expect(getFixedSize('string')).toBe('custom')
    })
  })

  describe('getDefaultKeyPattern', () => {
    it('returns the actual key name', () => {
      expect(
        getDefaultKeyPattern('room:chunk-state:678729695330336:1:36'),
      ).toBe('room:chunk-state:678729695330336:1:36')
    })

    it('escapes glob metacharacters for exact-key matching', () => {
      expect(getDefaultKeyPattern('user:*')).toBe('user:\\*')
      expect(getDefaultKeyPattern('user:?')).toBe('user:\\?')
      expect(getDefaultKeyPattern('user\\*')).toBe('user\\\\\\*')
      expect(getDefaultKeyPattern('user:[0-9]')).toBe('user:\\[0-9\\]')
    })
  })

  describe('getSizeUnit', () => {
    it('returns singular or plural byte labels', () => {
      expect(getSizeUnit(1)).toBe('byte')
      expect(getSizeUnit(2)).toBe('bytes')
      expect(getSizeUnit('')).toBe('bytes')
    })
  })

  describe('matchKeyPattern', () => {
    it('matches glob patterns', () => {
      expect(matchKeyPattern('user:items:*', 'user:items:42')).toBe(true)
      expect(matchKeyPattern('user:items:*', 'user:other:42')).toBe(false)
      expect(matchKeyPattern('user:?', 'user:a')).toBe(true)
      expect(matchKeyPattern('user:?', 'user:ab')).toBe(false)
    })

    it('treats regex-like strings as literal glob patterns', () => {
      expect(matchKeyPattern('^user:items:.*$', 'user:items:42')).toBe(false)
      expect(matchKeyPattern('^user:items:.*$', '^user:items:.*$')).toBe(true)
    })

    it('matches exact key names', () => {
      expect(
        matchKeyPattern(
          'room:chunk-state:678729695330336:1:36',
          'room:chunk-state:678729695330336:1:36',
        ),
      ).toBe(true)
    })

    it('matches escaped glob metacharacters literally', () => {
      expect(matchKeyPattern('user:\\*', 'user:*')).toBe(true)
      expect(matchKeyPattern('user:\\*', 'user:123')).toBe(false)
      expect(matchKeyPattern('user:\\?', 'user:?')).toBe(true)
      expect(matchKeyPattern('user:\\?', 'user:a')).toBe(false)
    })

    it('matches glob character classes', () => {
      expect(matchKeyPattern('user:[0-9]*', 'user:3')).toBe(true)
      expect(matchKeyPattern('user:[0-9]*', 'user:42')).toBe(true)
      expect(matchKeyPattern('user:[0-9]*', 'user:a')).toBe(false)
      expect(matchKeyPattern('h[ae]llo', 'hello')).toBe(true)
      expect(matchKeyPattern('h[ae]llo', 'hallo')).toBe(true)
      expect(matchKeyPattern('h[ae]llo', 'hillo')).toBe(false)
      expect(matchKeyPattern('h[^e]llo', 'hallo')).toBe(true)
      expect(matchKeyPattern('h[^e]llo', 'hello')).toBe(false)
      expect(matchKeyPattern('h[a-b]llo', 'hallo')).toBe(true)
      expect(matchKeyPattern('h[a-b]llo', 'hbllo')).toBe(true)
      expect(matchKeyPattern('h[a-b]llo', 'hcllo')).toBe(false)
      expect(matchKeyPattern('user:\\[0-9\\]', 'user:[0-9]')).toBe(true)
      expect(matchKeyPattern('user:\\[0-9\\]', 'user:3')).toBe(false)
      expect(matchKeyPattern('key:[A-Z\\-_]*', 'key:ABC')).toBe(true)
      expect(matchKeyPattern('key:[A-Z\\-_]*', 'key:A-B_')).toBe(true)
      expect(matchKeyPattern('key:[A-Z\\-_]*', 'key:0AB')).toBe(false)
    })
  })

  describe('findMatchingDecoderRule', () => {
    const rules: ValueDecoderRule[] = [
      {
        id: '1',
        name: '',
        keyPatterns: ['user:*'],
        decoderType: DecoderType.Binary,
        schema: [],
      },
    ]

    it('returns the matching rule when only one rule applies', () => {
      expect(findMatchingDecoderRule(rules, 'user:123')?.id).toBe('1')
      expect(findMatchingDecoderRule(rules, 'other:123')).toBeNull()
    })

    it('prefers the most specific matching rule over broader patterns', () => {
      const overlappingRules: ValueDecoderRule[] = [
        {
          id: 'broad',
          name: 'Broad',
          keyPatterns: ['*'],
          decoderType: DecoderType.Binary,
          schema: [],
        },
        {
          id: 'specific',
          name: 'Specific',
          keyPatterns: ['user:123'],
          decoderType: DecoderType.Binary,
          schema: [],
        },
      ]

      expect(findMatchingDecoderRule(overlappingRules, 'user:123')?.id).toBe(
        'specific',
      )
      expect(findMatchingDecoderRule(overlappingRules, 'other:key')?.id).toBe(
        'broad',
      )
    })

    it('prefers a longer literal prefix over a shorter wildcard pattern', () => {
      const overlappingRules: ValueDecoderRule[] = [
        {
          id: 'user-wide',
          name: 'User wide',
          keyPatterns: ['user:*'],
          decoderType: DecoderType.Binary,
          schema: [],
        },
        {
          id: 'user-items',
          name: 'User items',
          keyPatterns: ['user:items:*'],
          decoderType: DecoderType.Binary,
          schema: [],
        },
      ]

      expect(
        findMatchingDecoderRule(overlappingRules, 'user:items:42')?.id,
      ).toBe('user-items')
      expect(
        findMatchingDecoderRule(overlappingRules, 'user:profile:42')?.id,
      ).toBe('user-wide')
    })

    it('scores exact key patterns higher than wildcard patterns', () => {
      expect(getKeyPatternSpecificity('*')).toBeLessThan(
        getKeyPatternSpecificity('user:123'),
      )
      expect(getKeyPatternSpecificity('user:*')).toBeLessThan(
        getKeyPatternSpecificity('user:123'),
      )
    })
  })

  describe('resolveRepeatCount', () => {
    it('caps repeat count to prevent unbounded decode loops', () => {
      expect(resolveRepeatCount(2)).toBe(2)
      expect(resolveRepeatCount(Number.MAX_SAFE_INTEGER)).toBe(
        MAX_REPEAT_DECODE_ITERATIONS,
      )
      expect(resolveRepeatCount(Infinity)).toBe(0)
      expect(resolveRepeatCount(undefined)).toBe(0)
      expect(resolveRepeatCount(-1)).toBe(0)
    })
  })

  describe('formatHexBytes', () => {
    it('formats bytes as uppercase hex pairs separated by spaces', () => {
      expect(
        formatHexBytes([0xde, 0xad, 0xbe, 0xef, 0xca, 0xfe, 0xba, 0xbe]),
      ).toBe('DE AD BE EF CA FE BA BE')
    })
  })

  describe('parseBinaryBuffer', () => {
    it('parses hex fields as spaced uppercase byte pairs', () => {
      const buffer = new Uint8Array([
        0xde, 0xad, 0xbe, 0xef, 0xca, 0xfe, 0xba, 0xbe,
      ])

      const parsed = parseBinaryBuffer(buffer, [
        {
          id: '1',
          kind: 'field',
          name: 'payload',
          dataType: 'hex',
          size: 8,
        },
      ])

      expect(parsed).toEqual([
        {
          kind: 'field',
          name: 'payload',
          size: 8,
          value: 'DE AD BE EF CA FE BA BE',
        },
      ])
    })

    it('parses sequential binary fields', () => {
      const buffer = new Uint8Array([1, 2, 0, 3, 4])
      const parsed = parseBinaryBuffer(buffer, [
        { id: '1', kind: 'field', name: 'flag', dataType: 'uint8', size: 1 },
        {
          id: '2',
          kind: 'field',
          name: 'count',
          dataType: 'uint16le',
          size: 2,
        },
        {
          id: '3',
          kind: 'field',
          name: 'value',
          dataType: 'uint16be',
          size: 2,
        },
      ])

      expect(parsed).toEqual([
        { kind: 'field', name: 'flag', size: 1, value: '1' },
        { kind: 'field', name: 'count', size: 2, value: '2' },
        { kind: 'field', name: 'value', size: 2, value: '772' },
      ])
    })

    it('uses a prior numeric field as string size', () => {
      const buffer = new Uint8Array([3, 0, 97, 98, 99])
      const parsed = parseBinaryBuffer(buffer, [
        {
          id: '1',
          kind: 'field',
          name: 'len',
          dataType: 'uint16le',
          size: 2,
        },
        {
          id: '2',
          kind: 'field',
          name: 'text',
          dataType: 'string',
          size: '',
          sizeSource: 'field',
          sizeFieldRef: '1',
        },
      ])

      expect(parsed).toEqual([
        { kind: 'field', name: 'len', size: 2, value: '3' },
        { kind: 'field', name: 'text', size: 3, value: 'abc' },
      ])
    })

    it('resolves dynamic size by field id when numeric names duplicate', () => {
      const buffer = new Uint8Array([
        3, 0, 5, 97, 98, 99, 104, 101, 108, 108, 111,
      ])
      const parsed = parseBinaryBuffer(buffer, [
        {
          id: 'len-a',
          kind: 'field',
          name: 'len',
          dataType: 'uint16le',
          size: 2,
        },
        {
          id: 'len-b',
          kind: 'field',
          name: 'len',
          dataType: 'uint8',
          size: 1,
        },
        {
          id: 'text-a',
          kind: 'field',
          name: 'textA',
          dataType: 'string',
          size: '',
          sizeSource: 'field',
          sizeFieldRef: 'len-a',
        },
        {
          id: 'text-b',
          kind: 'field',
          name: 'textB',
          dataType: 'string',
          size: '',
          sizeSource: 'field',
          sizeFieldRef: 'len-b',
        },
      ])

      expect(parsed).toEqual([
        { kind: 'field', name: 'len', size: 2, value: '3' },
        { kind: 'field', name: 'len', size: 1, value: '5' },
        { kind: 'field', name: 'textA', size: 3, value: 'abc' },
        { kind: 'field', name: 'textB', size: 5, value: 'hello' },
      ])
    })

    it('preserves zero-length dynamic string fields', () => {
      const buffer = new Uint8Array([0, 0, 42])
      const parsed = parseBinaryBuffer(buffer, [
        {
          id: '1',
          kind: 'field',
          name: 'len',
          dataType: 'uint16le',
          size: 2,
        },
        {
          id: '2',
          kind: 'field',
          name: 'text',
          dataType: 'string',
          size: '',
          sizeSource: 'field',
          sizeFieldRef: '1',
        },
        {
          id: '3',
          kind: 'field',
          name: 'flag',
          dataType: 'uint8',
          size: 1,
        },
      ])

      expect(parsed).toEqual([
        { kind: 'field', name: 'len', size: 2, value: '0' },
        { kind: 'field', name: 'text', size: 0, value: '' },
        { kind: 'field', name: 'flag', size: 1, value: '42' },
      ])
    })

    it('parses repeat blocks using a count field', () => {
      const buffer = new Uint8Array([2, 0, 1, 0, 2, 0, 3, 0, 4, 0])
      const repeatBlock = createEmptyRepeatBlock()
      repeatBlock.countFieldRef = '1'
      repeatBlock.fields = [
        {
          ...createEmptyField(),
          name: 'anchor',
          dataType: 'uint16le',
          size: 2,
        },
        { ...createEmptyField(), name: 'focus', dataType: 'uint16le', size: 2 },
      ]

      const parsed = parseBinaryBuffer(buffer, [
        {
          id: '1',
          kind: 'field',
          name: 'range_count',
          dataType: 'uint16le',
          size: 2,
        },
        repeatBlock,
      ])

      expect(parsed).toEqual([
        { kind: 'field', name: 'range_count', size: 2, value: '2' },
        {
          kind: 'group',
          label: '0',
          children: [
            { kind: 'field', name: 'anchor', size: 2, value: '1' },
            { kind: 'field', name: 'focus', size: 2, value: '2' },
          ],
        },
        {
          kind: 'group',
          label: '1',
          children: [
            { kind: 'field', name: 'anchor', size: 2, value: '3' },
            { kind: 'field', name: 'focus', size: 2, value: '4' },
          ],
        },
      ])
    })

    it('uses safe integer limits for bigint dynamic field sizes', () => {
      const buffer = new Uint8Array(10)
      const view = new DataView(
        buffer.buffer,
        buffer.byteOffset,
        buffer.byteLength,
      )
      view.setBigUint64(0, 9223372036854775807n, true)

      const parsed = parseBinaryBuffer(buffer, [
        {
          id: '1',
          kind: 'field',
          name: 'len',
          dataType: 'biguint64le',
          size: 8,
        },
        {
          id: '2',
          kind: 'field',
          name: 'text',
          dataType: 'string',
          size: '',
          sizeSource: 'field',
          sizeFieldRef: '1',
        },
      ])

      expect(parsed).toEqual([
        { kind: 'field', name: 'len', size: 8, value: '9223372036854775807' },
        {
          kind: 'field',
          name: 'text',
          size: Number.MAX_SAFE_INTEGER,
          value: '<insufficient data>',
        },
      ])
    })

    it('stops parsing sibling fields when repeat decoding is capped', () => {
      const repeatCount = MAX_REPEAT_DECODE_ITERATIONS + 1
      const bufferParts = [
        ...toUint16leBytes(repeatCount),
        ...Array.from({ length: repeatCount }, () => 0xaa),
        0xbb,
      ]

      const repeatBlock = createEmptyRepeatBlock()
      repeatBlock.countFieldRef = 'count'
      repeatBlock.fields = [
        {
          ...createEmptyField(),
          id: 'item',
          name: 'item',
          dataType: 'uint8',
          size: 1,
        },
      ]

      const parsed = parseBinaryBuffer(new Uint8Array(bufferParts), [
        {
          id: 'count',
          kind: 'field',
          name: 'count',
          dataType: 'uint16le',
          size: 2,
        },
        repeatBlock,
        {
          id: 'tail',
          kind: 'field',
          name: 'tail',
          dataType: 'uint8',
          size: 1,
        },
      ])

      expect(countGroupNodes(parsed)).toBe(MAX_REPEAT_DECODE_ITERATIONS)
      expect(
        parsed.some((node) => node.kind === 'field' && node.name === 'tail'),
      ).toBe(false)
    })

    it('caps nested repeat decoding with a shared global budget', () => {
      const outerCount = 100
      const innerCount = 100
      const bufferParts = [...toUint16leBytes(outerCount)]

      for (let outer = 0; outer < outerCount; outer += 1) {
        bufferParts.push(innerCount)
        for (let inner = 0; inner < innerCount; inner += 1) {
          bufferParts.push(1)
        }
      }

      const innerRepeat = createEmptyRepeatBlock()
      innerRepeat.id = 'inner-repeat'
      innerRepeat.countFieldRef = 'inner-count'
      innerRepeat.fields = [
        {
          ...createEmptyField(),
          id: 'inner-value',
          name: 'value',
          dataType: 'uint8',
          size: 1,
        },
      ]

      const outerRepeat = createEmptyRepeatBlock()
      outerRepeat.id = 'outer-repeat'
      outerRepeat.countFieldRef = 'outer-count'
      outerRepeat.fields = [
        {
          id: 'inner-count',
          kind: 'field',
          name: 'inner_count',
          dataType: 'uint8',
          size: 1,
        },
        innerRepeat,
      ]

      const parsed = parseBinaryBuffer(new Uint8Array(bufferParts), [
        {
          id: 'outer-count',
          kind: 'field',
          name: 'outer_count',
          dataType: 'uint16le',
          size: 2,
        },
        outerRepeat,
      ])

      expect(countGroupNodes(parsed)).toBe(MAX_REPEAT_DECODE_ITERATIONS)
      expect(countGroupNodes(parsed)).toBeLessThan(outerCount * innerCount)
    })

    it('reports insufficient data when repeat count exceeds available bytes', () => {
      const buffer = new Uint8Array([2, 0, 1, 0, 2, 0])
      const repeatBlock = createEmptyRepeatBlock()
      repeatBlock.countFieldRef = '1'
      repeatBlock.fields = [
        {
          ...createEmptyField(),
          name: 'anchor',
          dataType: 'uint16le',
          size: 2,
        },
        { ...createEmptyField(), name: 'focus', dataType: 'uint16le', size: 2 },
      ]

      const parsed = parseBinaryBuffer(buffer, [
        {
          id: '1',
          kind: 'field',
          name: 'range_count',
          dataType: 'uint16le',
          size: 2,
        },
        repeatBlock,
      ])

      expect(parsed).toEqual([
        { kind: 'field', name: 'range_count', size: 2, value: '2' },
        {
          kind: 'group',
          label: '0',
          children: [
            { kind: 'field', name: 'anchor', size: 2, value: '1' },
            { kind: 'field', name: 'focus', size: 2, value: '2' },
          ],
        },
        {
          kind: 'group',
          label: '1',
          children: [
            {
              kind: 'field',
              name: 'anchor',
              size: 2,
              value: '<insufficient data>',
            },
          ],
        },
      ])
    })

    it('formats parsed rows with grouped repeat indentation', () => {
      expect(
        formatParsedFields([
          { kind: 'field', name: 'range_count', size: 2, value: '1' },
          {
            kind: 'group',
            label: '0',
            children: [
              {
                kind: 'field',
                name: 'anchor_chunk_id',
                size: 8,
                value: '769274194308128',
              },
            ],
          },
        ]),
      ).toBe(
        '[range_count] [2] [1]\n  [0]\n    [anchor_chunk_id] [8] [769274194308128]',
      )
    })

    it('formats flat parsed rows', () => {
      expect(
        formatParsedFields([
          { kind: 'field', name: 'id', size: 1, value: '7' },
        ]),
      ).toBe('[id] [1] [7]')
    })

    it('formats parsed rows as a single inline line', () => {
      expect(
        formatParsedFieldsInline([
          { kind: 'field', name: 'range_count', size: 2, value: '1' },
          {
            kind: 'group',
            label: '0',
            children: [
              {
                kind: 'field',
                name: 'anchor_chunk_id',
                size: 8,
                value: '769274194308128',
              },
            ],
          },
        ]),
      ).toBe(
        '[range_count] [2] [1] [0] [anchor_chunk_id] [8] [769274194308128]',
      )
    })
  })
})
