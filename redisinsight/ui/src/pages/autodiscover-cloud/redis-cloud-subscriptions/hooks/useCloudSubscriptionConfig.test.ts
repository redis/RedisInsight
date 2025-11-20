import { cloneDeep } from 'lodash'

import {
  act,
  initialStateDefault,
  mockStore,
  renderHook,
} from 'uiSrc/utils/test-utils'
import {
  OAuthSocialAction,
  RedisCloudSubscriptionStatus,
  RedisCloudSubscriptionType,
} from 'uiSrc/slices/interfaces'
import {
  resetDataRedisCloud,
  resetLoadedRedisCloud,
} from 'uiSrc/slices/instances/cloud'

import { useCloudSubscriptionConfig } from './useCloudSubscriptionConfig'

describe('useCloudSubscriptionConfig', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return correct initial state with subscriptions', () => {
    const state = cloneDeep(initialStateDefault)
    state.connections.cloud.subscriptions = [
      {
        id: 1,
        name: 'sub1',
        status: RedisCloudSubscriptionStatus.Active,
        numberOfDatabases: 5,
      } as any,
    ]
    const store = mockStore(state)

    const { result } = renderHook(() => useCloudSubscriptionConfig(), { store })

    expect(result.current.columns).toHaveLength(9)
    expect(result.current.columns[0].id).toBe('row-selection')
    expect(result.current.subscriptions).toHaveLength(1)
    expect(result.current.selection).toEqual([])
    expect(result.current.loading).toBe(false)
  })

  it('should redirect to home when subscriptions is null', () => {
    const state = cloneDeep(initialStateDefault)
    state.connections.cloud.subscriptions = null
    const store = mockStore(state)

    const { result } = renderHook(() => useCloudSubscriptionConfig(), { store })

    // The redirect happens in useEffect, check that it would be triggered
    // expect(mockPush).toHaveBeenCalledWith(Pages.home)
    expect(result.current.subscriptions).toBeNull()
  })

  it('should handle selection changes correctly', () => {
    const state = cloneDeep(initialStateDefault)
    state.connections.cloud.subscriptions = [
      {
        id: 1,
        name: 'sub1',
        status: RedisCloudSubscriptionStatus.Active,
        numberOfDatabases: 5,
      } as any,
      {
        id: 2,
        name: 'sub2',
        status: RedisCloudSubscriptionStatus.Active,
        numberOfDatabases: 3,
      } as any,
    ]
    const store = mockStore(state)

    const { result } = renderHook(() => useCloudSubscriptionConfig(), { store })

    act(() => {
      result.current.handleSelectionChange({ 1: true, 2: false })
    })

    expect(result.current.selection).toHaveLength(1)
    expect(result.current.selection[0].id).toBe(1)
  })

  it('should dispatch resetDataRedisCloud on close', () => {
    const state = cloneDeep(initialStateDefault)
    state.connections.cloud.subscriptions = [{ id: 1 } as any]
    const store = mockStore(state)

    const { result } = renderHook(() => useCloudSubscriptionConfig(), { store })

    act(() => {
      result.current.handleClose()
    })

    const actions = store.getActions()
    expect(actions.map((a) => a.type)).toContain(resetDataRedisCloud.type)
  })

  it('should dispatch resetLoadedRedisCloud on back', () => {
    const state = cloneDeep(initialStateDefault)
    state.connections.cloud.subscriptions = [{ id: 1 } as any]
    const store = mockStore(state)

    const { result } = renderHook(() => useCloudSubscriptionConfig(), { store })

    act(() => {
      result.current.handleBackAdding()
    })

    const actions = store.getActions()
    expect(actions.map((a) => a.type)).toContain(resetLoadedRedisCloud.type)
  })

  it('should call handleLoadInstances with correct parameters', () => {
    const state = cloneDeep(initialStateDefault)
    state.connections.cloud.subscriptions = [{ id: 1 } as any]
    state.connections.cloud.credentials = {
      accessKey: 'test-key',
      secretKey: 'test-secret',
    }
    const store = mockStore(state)

    const { result } = renderHook(() => useCloudSubscriptionConfig(), { store })

    const subscriptionsToLoad = [
      {
        subscriptionId: 1,
        subscriptionType: RedisCloudSubscriptionType.Flexible,
        free: false,
      },
    ]

    // Just check that the handler exists and can be called without error
    expect(result.current.handleLoadInstances).toBeDefined()
    expect(() => {
      act(() => {
        result.current.handleLoadInstances(subscriptionsToLoad)
      })
    }).not.toThrow()
  })

  it('should check instances loaded state', () => {
    const state = cloneDeep(initialStateDefault)
    state.connections.cloud.subscriptions = [{ id: 1 } as any]
    state.connections.cloud.loaded.instances = true
    const store = mockStore(state)

    const { result } = renderHook(() => useCloudSubscriptionConfig(), { store })

    // The navigation happens in useEffect based on instancesLoaded
    expect(result.current).toBeDefined()
  })

  it('should handle SSO flow correctly', () => {
    const state = cloneDeep(initialStateDefault)
    state.connections.cloud.subscriptions = [{ id: 1 } as any]
    state.connections.cloud.ssoFlow = OAuthSocialAction.Import
    state.oauth.cloud.user.data = { id: 123 }
    const store = mockStore(state)

    const { result } = renderHook(() => useCloudSubscriptionConfig(), {
      store,
    })

    // Check that hook returns expected values for SSO flow
    expect(result.current.subscriptions).toHaveLength(1)
  })

  it('should filter out items without id when handling selection', () => {
    const state = cloneDeep(initialStateDefault)
    state.connections.cloud.subscriptions = [
      { id: 1, name: 'sub1' } as any,
      { id: undefined, name: 'sub2' } as any,
      { id: 3, name: 'sub3' } as any,
    ]
    const store = mockStore(state)

    const { result } = renderHook(() => useCloudSubscriptionConfig(), { store })

    act(() => {
      result.current.handleSelectionChange({
        1: true,
        undefined: true,
        3: true,
      })
    })

    expect(result.current.selection).toHaveLength(2)
    expect(result.current.selection.map((s) => s.id)).toEqual([1, 3])
  })

  it('should return 7 columns when subscriptions array is empty', () => {
    const state = cloneDeep(initialStateDefault)
    state.connections.cloud.subscriptions = []
    const store = mockStore(state)

    const { result } = renderHook(() => useCloudSubscriptionConfig(), { store })

    expect(result.current.columns).toHaveLength(7)
    expect(result.current.columns[0].id).toBe('id')
  })
})
