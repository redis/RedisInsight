import { createEmptyDecoder } from './constants'
import { DecoderType } from './types'
import {
  cloneDecoderRule,
  parseDecodersFromClipboard,
  serializeDecoderForClipboard,
  serializeDecodersForClipboard,
  VALUE_DECODER_CLIPBOARD_TYPE,
} from './decoderClipboard'

describe('decoderClipboard', () => {
  const sampleDecoder = () => {
    const countField = {
      id: 'field-count',
      kind: 'field' as const,
      name: 'count',
      dataType: 'uint8',
      size: 1,
      sizeSource: 'fixed' as const,
    }

    return {
      id: 'decoder-1',
      name: 'Chunk decoder',
      keyPatterns: ['room:*'],
      decoderType: DecoderType.Binary,
      schema: [
        countField,
        {
          id: 'repeat-1',
          kind: 'repeat' as const,
          name: 'items',
          countFieldRef: 'field-count',
          fields: [
            {
              id: 'field-value',
              kind: 'field' as const,
              name: 'value',
              dataType: 'uint16le',
              size: 2,
              sizeSource: 'fixed' as const,
            },
          ],
        },
      ],
    }
  }

  it('serializes decoders with a clipboard envelope', () => {
    const decoder = sampleDecoder()
    const serialized = serializeDecoderForClipboard(decoder)
    const parsed = JSON.parse(serialized)

    expect(parsed.type).toBe(VALUE_DECODER_CLIPBOARD_TYPE)
    expect(parsed.decoders).toHaveLength(1)
    expect(parsed.decoders[0].name).toBe('Chunk decoder')
  })

  it('clones a decoder with fresh ids and remapped schema refs', () => {
    const cloned = cloneDecoderRule(sampleDecoder())

    expect(cloned.id).not.toBe('decoder-1')
    expect(cloned.schema[1].kind).toBe('repeat')
    if (cloned.schema[1].kind === 'repeat') {
      expect(cloned.schema[1].countFieldRef).toBe(cloned.schema[0].id)
    }
  })

  it('parses a clipboard payload and returns cloned decoders', () => {
    const decoder = sampleDecoder()
    const text = serializeDecodersForClipboard([decoder])
    const parsed = parseDecodersFromClipboard(text)

    expect(parsed).toHaveLength(1)
    expect(parsed?.[0].name).toBe('Chunk decoder')
    expect(parsed?.[0].id).not.toBe(decoder.id)
  })

  it('parses a single decoder object without an envelope', () => {
    const decoder = sampleDecoder()
    const parsed = parseDecodersFromClipboard(JSON.stringify(decoder))

    expect(parsed).toHaveLength(1)
    expect(parsed?.[0].keyPatterns).toEqual(['room:*'])
  })

  it('returns null for invalid clipboard content', () => {
    expect(parseDecodersFromClipboard('not json')).toBeNull()
    expect(parseDecodersFromClipboard('{"foo":"bar"}')).toBeNull()
    expect(parseDecodersFromClipboard('')).toBeNull()
  })

  it('normalizes legacy decoders on import', () => {
    const parsed = parseDecodersFromClipboard(
      JSON.stringify(createEmptyDecoder('user:*')),
    )

    expect(parsed).toHaveLength(1)
    expect(parsed?.[0].keyPatterns).toEqual(['user:*'])
  })
})
