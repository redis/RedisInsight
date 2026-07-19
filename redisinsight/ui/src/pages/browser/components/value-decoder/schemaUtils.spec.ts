import {
  createEmptyDecoder,
  createEmptyField,
  createEmptyRepeatBlock,
} from './constants'
import {
  isDecoderValid,
  isSchemaValid,
  areDecodersValid,
  normalizeRule,
  toNumericOptions,
} from './schemaUtils'
import { BinaryFieldDefinition } from './types'

describe('schemaUtils validation', () => {
  const validField = (): BinaryFieldDefinition => ({
    ...createEmptyField(),
    name: 'flag',
    dataType: 'uint8',
    size: 1,
  })

  describe('toNumericOptions', () => {
    it('labels unique names with type only', () => {
      expect(
        toNumericOptions([
          { id: 'a', name: 'len', dataType: 'uint8' },
          { id: 'b', name: 'count', dataType: 'uint16le' },
        ]),
      ).toEqual([
        { value: 'a', label: 'len (uint8)' },
        { value: 'b', label: 'count (uint16le)' },
      ])
    })

    it('disambiguates duplicate names with id', () => {
      expect(
        toNumericOptions([
          { id: 'a', name: 'len', dataType: 'uint8' },
          { id: 'b', name: 'len', dataType: 'uint16le' },
        ]),
      ).toEqual([
        { value: 'a', label: 'len (uint8) · a' },
        { value: 'b', label: 'len (uint16le) · b' },
      ])
    })
  })

  describe('normalizeRule', () => {
    it('preserves spaces in key patterns while removing blank rows', () => {
      const decoder = createEmptyDecoder(' user ')
      decoder.keyPatterns = [' user ', 'room:*', '']

      expect(normalizeRule(decoder).keyPatterns).toEqual([' user ', 'room:*'])
    })

    it('migrates legacy numeric field name references to ids', () => {
      const lenField = {
        ...createEmptyField(),
        name: 'len',
        dataType: 'uint16le',
        size: 2,
      }
      const textField = {
        ...createEmptyField(),
        name: 'text',
        dataType: 'string',
        size: '',
        sizeSource: 'field',
        sizeFieldRef: 'len',
      } satisfies BinaryFieldDefinition

      const normalized = normalizeRule({
        ...createEmptyDecoder(),
        schema: [lenField, textField],
      })

      expect(normalized.schema[1]).toMatchObject({
        sizeFieldRef: lenField.id,
      })
    })
  })

  describe('isSchemaValid', () => {
    it('requires every top-level node to be complete', () => {
      expect(isSchemaValid([validField()])).toBe(true)
      expect(isSchemaValid([validField(), createEmptyField()])).toBe(false)
      expect(isSchemaValid([])).toBe(false)
    })

    it('requires every repeat child to be complete', () => {
      const countField = {
        ...createEmptyField(),
        name: 'count',
        dataType: 'uint16le',
        size: 2,
      }
      const repeat = createEmptyRepeatBlock()
      repeat.countFieldRef = countField.id
      repeat.fields = [validField(), createEmptyField()]

      expect(isSchemaValid([countField, repeat])).toBe(false)
    })
  })

  describe('isDecoderValid', () => {
    it('rejects decoders with incomplete schema rows', () => {
      const decoder = createEmptyDecoder('room:state:*')
      decoder.keyPatterns = ['room:state:*']
      decoder.schema = [validField(), createEmptyField()]

      expect(isDecoderValid(decoder)).toBe(false)
    })

    it('rejects fractional fixed byte sizes', () => {
      const decoder = createEmptyDecoder('room:state:*')
      decoder.keyPatterns = ['room:state:*']
      decoder.schema = [
        {
          ...createEmptyField(),
          name: 'payload',
          dataType: 'string',
          size: 1.5,
          sizeSource: 'fixed',
        },
      ]

      expect(isDecoderValid(decoder)).toBe(false)
    })
  })

  describe('areDecodersValid', () => {
    it('allows saving an empty decoder list', () => {
      expect(areDecodersValid([])).toBe(true)
    })
  })
})
