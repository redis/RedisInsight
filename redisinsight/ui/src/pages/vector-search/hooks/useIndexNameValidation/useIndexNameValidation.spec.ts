import { renderHook } from '@testing-library/react-hooks'

import {
  useIndexNameValidation,
  INDEX_NAME_ERRORS,
} from './useIndexNameValidation'

const mockExistingIndexes: string[] = []

jest.mock('../useRedisearchListData', () => ({
  useRedisearchListData: () => ({
    stringData: mockExistingIndexes,
  }),
}))

describe('useIndexNameValidation', () => {
  beforeEach(() => {
    mockExistingIndexes.length = 0
  })

  it('should return null for empty string', () => {
    const { result } = renderHook(() => useIndexNameValidation(''))
    expect(result.current).toBeNull()
  })

  it('should return null for whitespace-only string', () => {
    const { result } = renderHook(() => useIndexNameValidation('   '))
    expect(result.current).toBeNull()
  })

  it('should return DUPLICATE error when index name already exists', () => {
    mockExistingIndexes.push('idx:existing')
    const { result } = renderHook(() => useIndexNameValidation('idx:existing'))
    expect(result.current).toBe(INDEX_NAME_ERRORS.DUPLICATE)
  })

  it('should return null for valid unique name', () => {
    mockExistingIndexes.push('idx:other')
    const { result } = renderHook(() => useIndexNameValidation('idx:newindex'))
    expect(result.current).toBeNull()
  })

  it('should trim name before duplicate check', () => {
    mockExistingIndexes.push('idx:test')
    const { result } = renderHook(() => useIndexNameValidation('  idx:test  '))
    expect(result.current).toBe(INDEX_NAME_ERRORS.DUPLICATE)
  })
})
