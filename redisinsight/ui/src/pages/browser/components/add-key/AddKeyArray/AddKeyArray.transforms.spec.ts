import { stringToBuffer } from 'uiSrc/utils'
import {
  transformToContiguousMode,
  transformToSparseMode,
} from './AddKeyArray.transforms'
import { CONTIGUOUS_MODE, SPARSE_MODE } from './constants'

describe('AddKeyArray.transforms', () => {
  describe('transformToContiguousMode', () => {
    it('should build an ARSET payload with a canonical start index and buffered values', () => {
      const result = transformToContiguousMode({
        keyName: 'name',
        startIndex: '007',
        values: ['first', 'second'],
      })

      expect(result).toEqual({
        keyName: stringToBuffer('name'),
        mode: CONTIGUOUS_MODE,
        startIndex: '7',
        values: [stringToBuffer('first'), stringToBuffer('second')],
      })
    })
  })

  describe('transformToSparseMode', () => {
    it('should build an ARMSET payload with canonical element indexes and buffered values', () => {
      const result = transformToSparseMode({
        keyName: 'name',
        elements: [
          { id: 0, index: '0042', value: 'answer' },
          { id: 1, index: '5', value: 'five' },
        ],
      })

      expect(result).toEqual({
        keyName: stringToBuffer('name'),
        mode: SPARSE_MODE,
        elements: [
          { index: '42', value: stringToBuffer('answer') },
          { index: '5', value: stringToBuffer('five') },
        ],
      })
    })
  })
})
