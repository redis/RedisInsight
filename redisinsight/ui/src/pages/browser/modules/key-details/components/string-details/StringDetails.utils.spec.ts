import { formattingBuffer, stringToBuffer } from 'uiSrc/utils'
import { KeyValueFormat } from 'uiSrc/constants'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'
import { getStringCopyValue } from './StringDetails.utils'

describe('getStringCopyValue', () => {
  it('should return an empty string when there is no value', () => {
    expect(getStringCopyValue(undefined, KeyValueFormat.Unicode)).toEqual('')
  })

  it('should copy the unicode value', () => {
    expect(
      getStringCopyValue(stringToBuffer('1234'), KeyValueFormat.Unicode),
    ).toEqual('1234')
  })

  it('should copy the value in the selected text format (HEX)', () => {
    expect(
      getStringCopyValue(stringToBuffer('1234'), KeyValueFormat.HEX),
    ).toEqual('31323334')
  })

  it('should copy the displayed value (not the raw bytes) for decoded formats like DateTime', () => {
    const value = stringToBuffer('1609459200000')
    const displayed = formattingBuffer(value, KeyValueFormat.DateTime, {
      expanded: true,
    }).value

    // formattingBuffer renders DateTime as a formatted string
    expect(typeof displayed).toBe('string')
    // copy mirrors that displayed value rather than the raw timestamp
    expect(getStringCopyValue(value, KeyValueFormat.DateTime)).toEqual(
      displayed,
    )
  })

  it('should fall back to the serialized form for JSON-tree formats', () => {
    const result = getStringCopyValue(
      stringToBuffer('{"a":1}'),
      KeyValueFormat.JSON,
    )

    expect(result).toContain('"a"')
  })

  it('should copy decoded values (e.g. Pickle) as JSON instead of raw bytes', () => {
    // pickle (protocol 0) of the integer 1 — raw bytes decode to "I1\n."
    const value = {
      type: 'Buffer',
      data: [73, 49, 10, 46],
    } as RedisResponseBuffer

    expect(getStringCopyValue(value, KeyValueFormat.Pickle)).toEqual('1')
  })

  it('should copy Msgpack 64-bit integers without losing precision', () => {
    // msgpack uint64 = 9007199254740993 (2^53 + 1): 0xcf + big-endian 8 bytes
    const value = {
      type: 'Buffer',
      data: [207, 0, 32, 0, 0, 0, 0, 0, 1],
    } as RedisResponseBuffer

    expect(getStringCopyValue(value, KeyValueFormat.Msgpack)).toEqual(
      '9007199254740993',
    )
  })

  it('should copy vectors as the displayed JSON array (not comma-separated)', () => {
    // Float32 little-endian bytes for [1, 2]
    const value = {
      type: 'Buffer',
      data: [0, 0, 128, 63, 0, 0, 0, 64],
    } as RedisResponseBuffer

    expect(getStringCopyValue(value, KeyValueFormat.Vector32Bit)).toEqual(
      '[1,2]',
    )
  })
})
