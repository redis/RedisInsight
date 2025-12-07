import { cloneDeep } from 'lodash'
import { ConnectionType, Instance } from 'uiSrc/slices/interfaces'
import { cleanup, mockedStore, renderHook } from 'uiSrc/utils/test-utils'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { useConnectionType } from 'uiSrc/components/hooks/useConnectionType'

jest.mock('uiSrc/slices/instances/instances', () => ({
  ...jest.requireActual('uiSrc/slices/instances/instances'),
  connectedInstanceSelector: jest.fn().mockReturnValue({
    connectedInstance: {},
  }),
}))

let store: typeof mockedStore
type ConnType = 'cluster' | 'standalone' | 'sentinel'
let instances: Record<ConnType, Instance>
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()

  instances = {
    standalone: {
      id: 'e37cc441-a4f2-402c-8bdb-fc2413cbbaff',
      host: 'localhost',
      port: 6379,
      name: 'localhost',
      connectionType: ConnectionType.Standalone,
      modules: [],
      version: '6.2.6',
    },
    cluster: {
      id: 'a0db1bc8-a353-4c43-a856-b72f4811d2d4',
      host: 'localhost',
      port: 12000,
      name: 'oea123123',
      connectionType: ConnectionType.Cluster,
      modules: [],
      version: '6.2.6',
    },
    sentinel: {
      id: 'b83a3932-e95f-4f09-9d8a-55079f400186',
      version: '6.2.6',
      host: 'localhost',
      port: 5005,
      connectionType: ConnectionType.Sentinel,
      modules: [],
    },
  }
})

describe('useConnectionType', () => {
  it.each([
    [ConnectionType.Cluster, 'cluster' as ConnType],
    [ConnectionType.Standalone, 'standalone' as ConnType],
    [ConnectionType.Sentinel, 'sentinel' as ConnType],
  ])(
    'should return %i when forceStandalone is undefined',
    async (expected, type) => {
      const instance = { ...instances[type] }
      ;(connectedInstanceSelector as jest.Mock).mockReturnValue(instance)

      const { result } = renderHook(useConnectionType)
      const connectionType = result.current
      expect(connectionType).toEqual(expected)
    },
  )

  it.each([
    [ConnectionType.Cluster, 'cluster' as ConnType],
    [ConnectionType.Standalone, 'standalone' as ConnType],
    [ConnectionType.Sentinel, 'sentinel' as ConnType],
  ])(
    'should return %i when forceStandalone is false',
    async (expected, type) => {
      const instance = {
        ...instances[type],
        forceStandalone: false,
      }
      ;(connectedInstanceSelector as jest.Mock).mockReturnValue(instance)

      const { result } = renderHook(useConnectionType)
      const connectionType = result.current
      expect(connectionType).toEqual(expected)
    },
  )
  it.each([
    [ConnectionType.Standalone, 'cluster' as ConnType],
    [ConnectionType.Standalone, 'standalone' as ConnType],
    [ConnectionType.Sentinel, 'sentinel' as ConnType],
  ])('should return STANDALONE ', async (expected, type) => {
    const instance = {
      ...instances[type],
      forceStandalone: true,
    }
    ;(connectedInstanceSelector as jest.Mock).mockReturnValue(instance)

    const { result } = renderHook(useConnectionType)
    const connectionType = result.current
    expect(connectionType).toEqual(expected)
  })
})
