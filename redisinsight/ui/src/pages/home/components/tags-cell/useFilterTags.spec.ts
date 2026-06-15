import { renderHook, act } from '@testing-library/react-hooks'
import { useAppDispatch, useAppSelector } from 'uiSrc/slices/hooks'
import { setSelectedTags } from 'uiSrc/slices/instances/tags'
import { Tag } from 'uiSrc/slices/interfaces/tag'
import { useFilterTags } from './useFilterTags'

jest.mock('uiSrc/slices/hooks', () => ({
  ...jest.requireActual('uiSrc/slices/hooks'),
  useAppDispatch: jest.fn(),
  useAppSelector: jest.fn(),
}))

const mockTags: Tag[] = [
  {
    id: '1',
    key: 'env',
    value: 'prod',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    key: 'version',
    value: '1.0',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

const mockDispatch = useAppDispatch as jest.MockedFunction<
  typeof useAppDispatch
>
const mockSelector = useAppSelector as jest.MockedFunction<
  typeof useAppSelector
>

describe('useFilterTags', () => {
  beforeEach(() => {
    mockDispatch.mockReturnValue(jest.fn())
    mockSelector.mockReturnValue({
      data: mockTags,
      selectedTags: new Set(),
    })
  })

  it('should toggle the popover state', () => {
    const { result } = renderHook(() => useFilterTags())
    act(() => {
      result.current.onPopoverToggle()
    })
    expect(result.current.isPopoverOpen).toBe(true)
  })

  it('should update selected tags on tag change', () => {
    const { result } = renderHook(() => useFilterTags())
    act(() => {
      result.current.onTagChange('env:prod', true)
    })
    expect(mockDispatch()).toHaveBeenCalledWith(
      setSelectedTags(new Set(['env:prod'])),
    )
  })

  it('should filter tags based on search input', () => {
    const { result } = renderHook(() => useFilterTags())
    expect(result.current.groupedTags).toEqual({
      env: ['prod'],
      version: ['1.0'],
    })
    act(() => {
      result.current.setTagSearch('env')
    })
    expect(result.current.groupedTags).toEqual({ env: ['prod'] })
  })
})
