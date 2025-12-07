import { cloneDeep } from 'lodash'

import {
  mockStore,
  initialStateDefault,
  renderHook,
  act,
} from 'uiSrc/utils/test-utils'
import { LoadedCloud, OAuthSocialAction } from 'uiSrc/slices/interfaces'
import {
  resetDataRedisCloud,
  resetLoadedRedisCloud,
} from 'uiSrc/slices/instances/cloud'

import { useCloudDatabasesConfig } from './useCloudDatabasesConfig'

describe('useCloudDatabasesConfig', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return correct initial state with columns', () => {
    const state = cloneDeep(initialStateDefault)
    state.connections.cloud.data = [
      { databaseId: 1, name: 'db1', subscriptionId: 1, free: false } as any,
      { databaseId: 2, name: 'db2', subscriptionId: 2, free: false } as any,
    ]
    const store = mockStore(state)

    const { result } = renderHook(() => useCloudDatabasesConfig(), { store })

    expect(result.current.columns).toHaveLength(9)
    expect(result.current.columns[0].id).toBe('row-selection')
    expect(result.current.columns[1].id).toBe('name')
    expect(result.current.selection).toEqual([])
    expect(result.current.instances).toHaveLength(2)
    expect(result.current.loading).toBe(false)
    expect(typeof result.current.handleClose).toBe('function')
    expect(typeof result.current.handleBackAdding).toBe('function')
    expect(typeof result.current.handleAddInstances).toBe('function')
    expect(typeof result.current.handleSelectionChange).toBe('function')
  })

  it('should return columns without selection when instances array is empty', () => {
    const state = cloneDeep(initialStateDefault)
    state.connections.cloud.data = []
    const store = mockStore(state)

    const { result } = renderHook(() => useCloudDatabasesConfig(), { store })

    expect(result.current.columns).toHaveLength(8)
    expect(result.current.columns[0].id).toBe('name')
  })

  describe('handleSelectionChange', () => {
    it('should update selection based on current selected state', () => {
      const state = cloneDeep(initialStateDefault)
      state.connections.cloud.data = [
        { databaseId: 1, name: 'db1', subscriptionId: 1, free: false } as any,
        { databaseId: 2, name: 'db2', subscriptionId: 2, free: false } as any,
      ]
      const store = mockStore(state)

      const { result } = renderHook(() => useCloudDatabasesConfig(), { store })

      act(() => {
        result.current.handleSelectionChange({ 1: true, 2: false })
      })

      expect(result.current.selection).toEqual([
        { databaseId: 1, name: 'db1', subscriptionId: 1, free: false },
      ])
    })

    it('should filter out items without databaseId', () => {
      const state = cloneDeep(initialStateDefault)
      state.connections.cloud.data = [
        { databaseId: 1, name: 'db1' } as any,
        { databaseId: null, name: 'db2' } as any,
      ]
      const store = mockStore(state)

      const { result } = renderHook(() => useCloudDatabasesConfig(), { store })

      act(() => {
        result.current.handleSelectionChange({ 1: true })
      })

      expect(result.current.selection).toEqual([{ databaseId: 1, name: 'db1' }])
    })
  })

  describe('handleClose', () => {
    it('should dispatch reset data action', () => {
      const state = cloneDeep(initialStateDefault)
      state.connections.cloud.data = []
      const store = mockStore(state)

      const { result } = renderHook(() => useCloudDatabasesConfig(), { store })

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
      state.connections.cloud.data = []
      const store = mockStore(state)

      const { result } = renderHook(() => useCloudDatabasesConfig(), { store })

      act(() => {
        result.current.handleBackAdding()
      })

      const actions = store.getActions()
      expect(actions).toContainEqual(
        resetLoadedRedisCloud(LoadedCloud.Instances),
      )
    })
  })

  describe('handleAddInstances', () => {
    it('should dispatch create instances action', () => {
      const state = cloneDeep(initialStateDefault)
      state.connections.cloud.data = []
      state.connections.cloud.credentials = {
        accessKey: 'test-key',
        secretKey: 'test-secret',
      }
      const store = mockStore(state)

      const { result } = renderHook(() => useCloudDatabasesConfig(), { store })

      const databases = [
        { databaseId: 1, subscriptionId: 1, free: false },
        { databaseId: 2, subscriptionId: 2, free: false },
      ]

      act(() => {
        result.current.handleAddInstances(databases)
      })

      const actions = store.getActions()
      const createAction = actions.find(
        (action) => action.type === 'cloud/createInstancesRedisCloud',
      )
      expect(createAction).toBeDefined()
    })
  })

  describe('SSO Flow handling', () => {
    it('should dispatch reset data when userOAuthProfile is null in Import flow', () => {
      const state = cloneDeep(initialStateDefault)
      state.connections.cloud.data = []
      state.connections.cloud.ssoFlow = OAuthSocialAction.Import
      state.oauth.cloud.user.data = null
      const store = mockStore(state)

      renderHook(() => useCloudDatabasesConfig(), { store })

      const actions = store.getActions()
      expect(actions).toContainEqual(resetDataRedisCloud())
    })
  })
})
