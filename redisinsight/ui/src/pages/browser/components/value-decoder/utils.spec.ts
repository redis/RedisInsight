import {
  findMatchingDecoderRule,
  formatParsedFields,
  formatParsedFieldsInline,
  getDefaultKeyPattern,
  getFixedSize,
  getSizeUnit,
  matchKeyPattern,
  parseBinaryBuffer,
} from './utils'
import { createEmptyField, createEmptyRepeatBlock } from './constants'
import { DecoderType, ValueDecoderRule } from './types'

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
      expect(getDefaultKeyPattern('room:chunk-state:678729695330336:1:36')).toBe(
        'room:chunk-state:678729695330336:1:36',
      )
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

    it('returns the first matching rule', () => {
      expect(findMatchingDecoderRule(rules, 'user:123')?.id).toBe('1')
      expect(findMatchingDecoderRule(rules, 'other:123')).toBeNull()
    })
  })

  describe('parseBinaryBuffer', () => {
    it('parses sequential binary fields', () => {
      const buffer = new Uint8Array([1, 0, 2, 0, 3, 4])
      const parsed = parseBinaryBuffer(buffer, [
        { id: '1', kind: 'field', name: 'flag', dataType: 'uint8', size: 1 },
        { id: '2', kind: 'field', name: 'count', dataType: 'uint16le', size: 2 },
        { id: '3', kind: 'field', name: 'value', dataType: 'uint16be', size: 2 },
      ])

      expect(parsed).toEqual([
        { kind: 'field', name: 'flag', size: 1, value: '1' },
        { kind: 'field', name: 'count', size: 2, value: '2' },
        { kind: 'field', name: 'value', size: 2, value: '772' },
      ])
    })

    it('uses a prior numeric field as string size', () => {
      const buffer = new Uint8Array([
        3, 0, 97, 98, 99,
      ])
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
          sizeFieldRef: 'len',
        },
      ])

      expect(parsed).toEqual([
        { kind: 'field', name: 'len', size: 2, value: '3' },
        { kind: 'field', name: 'text', size: 3, value: 'abc' },
      ])
    })

    it('parses repeat blocks using a count field', () => {
      const buffer = new Uint8Array([
        2, 0, 1, 0, 2, 0, 3, 0, 4, 0,
      ])
      const repeatBlock = createEmptyRepeatBlock()
      repeatBlock.countFieldRef = 'range_count'
      repeatBlock.fields = [
        { ...createEmptyField(), name: 'anchor', dataType: 'uint16le', size: 2 },
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
        formatParsedFields([{ kind: 'field', name: 'id', size: 1, value: '7' }]),
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
