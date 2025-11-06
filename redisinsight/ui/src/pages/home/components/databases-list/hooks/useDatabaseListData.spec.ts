import { act } from '@testing-library/react'

import {
  mockStore,
  initialStateDefault,
  renderHook,
} from 'uiSrc/utils/test-utils'
import { DatabaseListColumn } from 'uiSrc/constants'
import { Instance } from 'uiSrc/slices/interfaces'
import { DBInstanceFactory } from 'uiSrc/mocks/factories/database/DBInstance.factory'

import { SELECT_COL_ID, ENABLE_PAGINATION_COUNT } from '../DatabasesList.config'

import useDatabaseListData from './useDatabaseListData'

const getStoreWith = ({
  instances,
  loading = false,
  shownColumns = [
    DatabaseListColumn.Name,
    DatabaseListColumn.Host,
    DatabaseListColumn.ConnectionType,
    DatabaseListColumn.LastConnection,
    DatabaseListColumn.Modules,
    DatabaseListColumn.Tags,
    DatabaseListColumn.Controls,
  ],
}: {
  instances: Instance[]
  loading?: boolean
  shownColumns?: DatabaseListColumn[]
}) => {
  const state = {
    ...initialStateDefault,
    connections: {
      ...initialStateDefault.connections,
      instances: {
        ...initialStateDefault.connections.instances,
        data: instances,
        loading,
        shownColumns,
      },
    },
  } as typeof initialStateDefault

  return mockStore(state)
}

const mockInstances: Instance[] = [
  DBInstanceFactory.build({ visible: true }),
  DBInstanceFactory.build({ visible: false }),
  DBInstanceFactory.build({ visible: true }),
]

describe('useDatabaseListData', () => {
  it('should expose loading state', () => {
    const store = getStoreWith({ instances: mockInstances })

    const { result } = renderHook(() => useDatabaseListData(), { store })

    expect(result.current.loading).toBe(false)
  })

  it('should return only visible instances', () => {
    const store = getStoreWith({ instances: mockInstances })

    const { result } = renderHook(() => useDatabaseListData(), { store })

    expect(result.current.visibleInstances).toEqual([
      mockInstances[0],
      mockInstances[2],
    ])
  })

  it('should filter columns based on shownColumns', () => {
    const store = getStoreWith({
      instances: mockInstances,
      shownColumns: [DatabaseListColumn.Name, DatabaseListColumn.Host],
    })

    const { result } = renderHook(() => useDatabaseListData(), { store })

    const ids = result.current.columns.map((c) => c.id)
    expect(ids).toEqual([
      SELECT_COL_ID,
      DatabaseListColumn.Name,
      DatabaseListColumn.Host,
    ])
  })

  it('should return empty selected instances when no selection', () => {
    const store = getStoreWith({ instances: mockInstances })

    const { result } = renderHook(() => useDatabaseListData(), { store })

    expect(result.current.selectedInstances).toEqual([])
  })

  it('should return selected instances based on rowSelection', () => {
    const store = getStoreWith({ instances: mockInstances })

    const { result } = renderHook(() => useDatabaseListData(), { store })

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

    const { result } = renderHook(() => useDatabaseListData(), { store })

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

    const { result } = renderHook(() => useDatabaseListData(), { store })

    expect(result.current.emptyMessage).toBe('Loading...')
  })

  it('should return "No added instances" message when no instances', () => {
    const store = getStoreWith({ instances: [] })

    const { result } = renderHook(() => useDatabaseListData(), { store })

    expect(result.current.emptyMessage).toBe('No added instances')
  })

  it('should return "No results found" message when instances exist but none visible', () => {
    const instances: Instance[] = [
      {
        id: '1',
        name: 'Hidden',
        host: 'h',
        port: 6379,
        modules: [],
        version: null,
        visible: false,
      },
    ]
    const store = getStoreWith({ instances })

    const { result } = renderHook(() => useDatabaseListData(), { store })

    expect(result.current.emptyMessage).toBe('No results found')
  })

  it('should include select column even when no columns are shown', () => {
    const store = getStoreWith({ instances: mockInstances, shownColumns: [] })

    const { result } = renderHook(() => useDatabaseListData(), { store })

    const ids = result.current.columns.map((c) => c.id)
    expect(ids).toEqual([SELECT_COL_ID])
  })

  it('should disable pagination when instances count <= threshold', () => {
    const instances: Instance[] = Array.from(
      { length: ENABLE_PAGINATION_COUNT },
      (_, i) => ({
        id: `${i + 1}`,
        name: `Instance ${i + 1}`,
        host: 'h',
        port: 6379,
        modules: [],
        version: null,
        visible: true,
      }),
    )
    const store = getStoreWith({ instances })

    const { result } = renderHook(() => useDatabaseListData(), { store })

    expect(result.current.paginationEnabled).toBe(false)
  })

  it('should enable pagination when instances count > threshold', () => {
    const instances: Instance[] = Array.from(
      { length: ENABLE_PAGINATION_COUNT + 1 },
      (_, i) => ({
        id: `${i + 1}`,
        name: `Instance ${i + 1}`,
        host: 'h',
        port: 6379,
        modules: [],
        version: null,
        visible: true,
      }),
    )
    const store = getStoreWith({ instances })

    const { result } = renderHook(() => useDatabaseListData(), { store })

    expect(result.current.paginationEnabled).toBe(true)
  })
})
