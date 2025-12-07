import { act } from '@testing-library/react'
import {
  mockStore,
  initialStateDefault,
  renderHook,
} from 'uiSrc/utils/test-utils'
import { rdiInstanceFactory } from 'uiSrc/mocks/rdi/RdiInstance.factory'
import { RdiInstance } from 'uiSrc/slices/interfaces'
import { RdiListColumn } from 'uiSrc/constants'
import useRdiInstancesListData from './useRdiInstancesListData'
import {
  ENABLE_PAGINATION_COUNT,
  SELECT_COL_ID,
} from '../RdiInstancesList.config'

const getStoreWith = ({
  instances,
  loading = false,
  shownColumns,
}: {
  instances: RdiInstance[]
  loading?: boolean
  shownColumns?: RdiListColumn[]
}) => {
  const state = {
    ...initialStateDefault,
    rdi: {
      ...initialStateDefault.rdi,
      instances: {
        ...initialStateDefault.rdi.instances,
        data: instances,
        loading,
        ...(shownColumns ? { shownColumns } : {}),
      },
    },
  } as typeof initialStateDefault

  return mockStore(state)
}

const mockInstances: RdiInstance[] = [
  rdiInstanceFactory.build({ visible: true }),
  rdiInstanceFactory.build({ visible: false }),
  rdiInstanceFactory.build({ visible: true }),
]

describe('useRdiInstancesListData', () => {
  it('should expose loading state', () => {
    const store = getStoreWith({ instances: mockInstances })

    const { result } = renderHook(() => useRdiInstancesListData(), { store })

    expect(result.current.loading).toBe(false)
  })

  it('should include select column as the first column', () => {
    const store = getStoreWith({ instances: mockInstances })

    const { result } = renderHook(() => useRdiInstancesListData(), { store })

    expect(result.current.columns[0]?.id).toBe(SELECT_COL_ID)
  })

  it('should return only visible instances', () => {
    const store = getStoreWith({ instances: mockInstances })

    const { result } = renderHook(() => useRdiInstancesListData(), { store })

    expect(result.current.visibleInstances).toEqual([
      mockInstances[0],
      mockInstances[2],
    ])
  })

  it('should return empty selected instances when no selection', () => {
    const store = getStoreWith({ instances: mockInstances })

    const { result } = renderHook(() => useRdiInstancesListData(), { store })

    expect(result.current.selectedInstances).toEqual([])
  })

  it('should return selected instances based on rowSelection', () => {
    const store = getStoreWith({ instances: mockInstances })

    const { result } = renderHook(() => useRdiInstancesListData(), { store })

    act(() => {
      result.current.setRowSelection({ 0: true })
    })

    expect(result.current.selectedInstances).toEqual([mockInstances[0]])

    act(() => {
      result.current.setRowSelection({ 0: true, 1: true })
    })

    // index 1 corresponds to second visible instance (mockInstances[2])
    expect(result.current.selectedInstances).toEqual([
      mockInstances[0],
      mockInstances[2],
    ])
  })

  it('should reset row selection', () => {
    const store = getStoreWith({ instances: mockInstances })

    const { result } = renderHook(() => useRdiInstancesListData(), { store })

    act(() => {
      result.current.setRowSelection({ 0: true, 1: true })
    })
    expect(Object.keys(result.current.rowSelection)).toHaveLength(2)

    act(() => {
      result.current.resetRowSelection()
    })
    expect(result.current.rowSelection).toEqual({})
  })

  it('should return "Loading..." message when loading', () => {
    const store = getStoreWith({ instances: mockInstances, loading: true })

    const { result } = renderHook(() => useRdiInstancesListData(), { store })

    expect(result.current.emptyMessage).toBe('Loading...')
  })

  it('should return "No added endpoints" message when no instances', () => {
    const store = getStoreWith({ instances: [] })

    const { result } = renderHook(() => useRdiInstancesListData(), { store })

    expect(result.current.emptyMessage).toBe('No added endpoints')
  })

  it('should return "No results found" message when instances exist but none visible', () => {
    const instances: RdiInstance[] = [
      rdiInstanceFactory.build({ visible: false }),
    ]
    const store = getStoreWith({ instances })

    const { result } = renderHook(() => useRdiInstancesListData(), { store })

    expect(result.current.emptyMessage).toBe('No results found')
  })

  it('should disable pagination when instances count <= threshold', () => {
    const instances: RdiInstance[] = Array.from(
      { length: ENABLE_PAGINATION_COUNT },
      () => rdiInstanceFactory.build({ visible: true }),
    )
    const store = getStoreWith({ instances })

    const { result } = renderHook(() => useRdiInstancesListData(), { store })

    expect(result.current.paginationEnabled).toBe(false)
  })

  it('should enable pagination when instances count > threshold', () => {
    const instances: RdiInstance[] = Array.from(
      { length: ENABLE_PAGINATION_COUNT + 1 },
      () => rdiInstanceFactory.build({ visible: true }),
    )
    const store = getStoreWith({ instances })

    const { result } = renderHook(() => useRdiInstancesListData(), { store })

    expect(result.current.paginationEnabled).toBe(true)
  })

  it('should filter columns based on shownColumns from state', () => {
    const store = getStoreWith({
      instances: mockInstances,
      shownColumns: [
        RdiListColumn.Name,
        RdiListColumn.Url,
        RdiListColumn.Controls,
      ],
    })

    const { result } = renderHook(() => useRdiInstancesListData(), { store })
    const columnIds = result.current.columns.map((c) => c.id)

    expect(columnIds).toEqual(
      expect.arrayContaining([
        SELECT_COL_ID,
        RdiListColumn.Name,
        RdiListColumn.Url,
        RdiListColumn.Controls,
      ]),
    )
    expect(columnIds).not.toEqual(
      expect.arrayContaining([
        RdiListColumn.Version,
        RdiListColumn.LastConnection,
      ]),
    )
  })
})
