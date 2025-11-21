import { cloneDeep } from 'lodash'

import {
  mockStore,
  initialStateDefault,
  renderHook,
  act,
} from 'uiSrc/utils/test-utils'
import { LoadedCloud, RedisDefaultModules, AddRedisClusterDatabaseOptions } from 'uiSrc/slices/interfaces'
import {
  resetDataRedisCloud,
  resetLoadedRedisCloud,
} from 'uiSrc/slices/instances/cloud'
import { AutoDiscoverCloudIds } from 'uiSrc/pages/autodiscover-cloud/constants/constants'
import { RedisCloudInstanceFactory } from 'uiSrc/mocks/factories/cloud/RedisCloudInstance.factory'

import { useCloudDatabasesResultConfig } from './useCloudDatabasesResultConfig'

describe('useCloudDatabasesResultConfig', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return correct initial state with columns', () => {
    const state = cloneDeep(initialStateDefault)
    state.connections.cloud.dataAdded = [
      { databaseId: 1, name: 'db1', subscriptionId: 1, free: false } as any,
      { databaseId: 2, name: 'db2', subscriptionId: 2, free: false } as any,
    ]
    state.connections.cloud.data = []
    const store = mockStore(state)

    const { result } = renderHook(() => useCloudDatabasesResultConfig(), { store })

    expect(result.current.columns).toHaveLength(7)
    expect(result.current.columns[0].id).toBe(AutoDiscoverCloudIds.Name)
    expect(result.current.instances).toHaveLength(2)
    expect(typeof result.current.handleClose).toBe('function')
    expect(typeof result.current.handleBackAdding).toBe('function')
  })

  it('should filter out modules column when no instances have modules', () => {
    const state = cloneDeep(initialStateDefault)
    state.connections.cloud.dataAdded = RedisCloudInstanceFactory.buildList(2, {
      modules: [],
      options: undefined,
    })
    state.connections.cloud.data = []
    const store = mockStore(state)

    const { result } = renderHook(() => useCloudDatabasesResultConfig(), { store })

    expect(result.current.columns).toHaveLength(7)
    expect(result.current.columns.map((col) => col.id)).not.toContain(
      AutoDiscoverCloudIds.Modules,
    )
    expect(result.current.columns.map((col) => col.id)).not.toContain(
      AutoDiscoverCloudIds.Options,
    )
  })

  it('should include modules column when at least one instance has modules', () => {
    const state = cloneDeep(initialStateDefault)
    state.connections.cloud.dataAdded = [
      RedisCloudInstanceFactory.build({ modules: [], options: undefined }),
      RedisCloudInstanceFactory.build({
        modules: [RedisDefaultModules.ReJSON],
        options: undefined,
      }),
    ]
    state.connections.cloud.data = []
    const store = mockStore(state)

    const { result } = renderHook(() => useCloudDatabasesResultConfig(), { store })

    expect(result.current.columns).toHaveLength(8)
    expect(result.current.columns.map((col) => col.id)).toContain(
      AutoDiscoverCloudIds.Modules,
    )
    expect(result.current.columns.map((col) => col.id)).not.toContain(
      AutoDiscoverCloudIds.Options,
    )
  })

  it('should include options column when at least one instance has options', () => {
    const state = cloneDeep(initialStateDefault)
    state.connections.cloud.dataAdded = [
      RedisCloudInstanceFactory.build({ modules: [], options: {} }),
      RedisCloudInstanceFactory.build({
        modules: [],
        options: {
          [AddRedisClusterDatabaseOptions.Backup]: true,
          [AddRedisClusterDatabaseOptions.Clustering]: false,
        },
      }),
    ]
    state.connections.cloud.data = []
    const store = mockStore(state)

    const { result } = renderHook(() => useCloudDatabasesResultConfig(), { store })

    expect(result.current.columns).toHaveLength(8)
    expect(result.current.columns.map((col) => col.id)).toContain(
      AutoDiscoverCloudIds.Options,
    )
    expect(result.current.columns.map((col) => col.id)).not.toContain(
      AutoDiscoverCloudIds.Modules,
    )
  })

  it('should include both modules and options columns when instances have both', () => {
    const state = cloneDeep(initialStateDefault)
    state.connections.cloud.dataAdded = RedisCloudInstanceFactory.buildList(1, {
      modules: [RedisDefaultModules.ReJSON],
      options: {
        [AddRedisClusterDatabaseOptions.Backup]: true,
      },
    })
    state.connections.cloud.data = []
    const store = mockStore(state)

    const { result } = renderHook(() => useCloudDatabasesResultConfig(), { store })

    expect(result.current.columns).toHaveLength(9)
    expect(result.current.columns.map((col) => col.id)).toContain(
      AutoDiscoverCloudIds.Modules,
    )
    expect(result.current.columns.map((col) => col.id)).toContain(
      AutoDiscoverCloudIds.Options,
    )
  })

  it('should always include message column', () => {
    const state = cloneDeep(initialStateDefault)
    state.connections.cloud.dataAdded = RedisCloudInstanceFactory.buildList(1, {
      modules: [],
      options: undefined,
    })
    state.connections.cloud.data = []
    const store = mockStore(state)

    const { result } = renderHook(() => useCloudDatabasesResultConfig(), { store })

    expect(result.current.columns.map((col) => col.id)).toContain(
      AutoDiscoverCloudIds.MessageAdded,
    )
    expect(result.current.columns[result.current.columns.length - 1].id).toBe(
      AutoDiscoverCloudIds.MessageAdded,
    )
  })

  describe('handleClose', () => {
    it('should dispatch reset data action', () => {
      const state = cloneDeep(initialStateDefault)
      state.connections.cloud.dataAdded = []
      state.connections.cloud.data = []
      const store = mockStore(state)

      const { result } = renderHook(() => useCloudDatabasesResultConfig(), { store })

      act(() => {
        result.current.handleClose()
      })

      const actions = store.getActions()
      expect(actions).toContainEqual(resetDataRedisCloud())
    })
  })

  describe('handleBackAdding', () => {
    it('should dispatch reset loaded state action', () => {
      const state = cloneDeep(initialStateDefault)
      state.connections.cloud.dataAdded = []
      state.connections.cloud.data = []
      const store = mockStore(state)

      const { result } = renderHook(() => useCloudDatabasesResultConfig(), { store })

      act(() => {
        result.current.handleBackAdding()
      })

      const actions = store.getActions()
      expect(actions).toContainEqual(
        resetLoadedRedisCloud(LoadedCloud.InstancesAdded),
      )
    })
  })
})

