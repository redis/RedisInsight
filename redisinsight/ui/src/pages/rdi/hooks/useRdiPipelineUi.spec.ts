import {
  mockStore,
  initialStateDefault,
  renderHook,
} from 'uiSrc/utils/test-utils'
import { FeatureFlags } from 'uiSrc/constants'
import { useRdiPipelineUi } from './useRdiPipelineUi'

const RDI_INSTANCE_ID_MOCK = 'rdiInstanceId'
const SUPPORTED_VERSION = '1.19.0'

const getStoreWith = ({
  contextRdiInstanceId = RDI_INSTANCE_ID_MOCK,
  connectedInstance = {},
  isDevRdiUiEnabled = true,
}: {
  contextRdiInstanceId?: string
  connectedInstance?: Partial<
    typeof initialStateDefault.rdi.instances.connectedInstance
  >
  isDevRdiUiEnabled?: boolean
}) => {
  const state = {
    ...initialStateDefault,
    app: {
      ...initialStateDefault.app,
      context: {
        ...initialStateDefault.app.context,
        contextRdiInstanceId,
      },
      features: {
        ...initialStateDefault.app.features,
        featureFlags: {
          ...initialStateDefault.app.features.featureFlags,
          features: {
            ...initialStateDefault.app.features.featureFlags.features,
            [FeatureFlags.devRdiUi]: { flag: isDevRdiUiEnabled },
          },
        },
      },
    },
    rdi: {
      ...initialStateDefault.rdi,
      instances: {
        ...initialStateDefault.rdi.instances,
        connectedInstance: {
          ...initialStateDefault.rdi.instances.connectedInstance,
          ...connectedInstance,
        },
      },
    },
  } as typeof initialStateDefault

  return mockStore(state)
}

describe('useRdiPipelineUi', () => {
  it('should report loading while the context has not caught up to this instance yet', () => {
    const store = getStoreWith({ contextRdiInstanceId: 'anotherInstanceId' })

    const { result } = renderHook(
      () => useRdiPipelineUi(RDI_INSTANCE_ID_MOCK),
      { store },
    )

    expect(result.current).toEqual({ status: 'loading' })
  })

  it('should report loading while the connected instance is still being fetched', () => {
    const store = getStoreWith({
      connectedInstance: { id: '', loading: true, error: '' },
    })

    const { result } = renderHook(
      () => useRdiPipelineUi(RDI_INSTANCE_ID_MOCK),
      { store },
    )

    expect(result.current).toEqual({ status: 'loading' })
  })

  it('should target v2 once resolved for a supported version with the dev flag on', () => {
    const store = getStoreWith({
      connectedInstance: {
        id: RDI_INSTANCE_ID_MOCK,
        version: SUPPORTED_VERSION,
      },
      isDevRdiUiEnabled: true,
    })

    const { result } = renderHook(
      () => useRdiPipelineUi(RDI_INSTANCE_ID_MOCK),
      { store },
    )

    expect(result.current).toEqual({ status: 'ready', target: 'v2' })
  })

  it('should target v1 once resolved when the dev flag is off, even for a supported version', () => {
    const store = getStoreWith({
      connectedInstance: {
        id: RDI_INSTANCE_ID_MOCK,
        version: SUPPORTED_VERSION,
      },
      isDevRdiUiEnabled: false,
    })

    const { result } = renderHook(
      () => useRdiPipelineUi(RDI_INSTANCE_ID_MOCK),
      { store },
    )

    expect(result.current).toEqual({ status: 'ready', target: 'v1' })
  })

  it('should target v1 for an unsupported version, even with the dev flag on', () => {
    const store = getStoreWith({
      connectedInstance: { id: RDI_INSTANCE_ID_MOCK, version: '1.0.0' },
      isDevRdiUiEnabled: true,
    })

    const { result } = renderHook(
      () => useRdiPipelineUi(RDI_INSTANCE_ID_MOCK),
      { store },
    )

    expect(result.current).toEqual({ status: 'ready', target: 'v1' })
  })

  it('should fall back to v1 once the connected instance fails to load', () => {
    const store = getStoreWith({
      connectedInstance: { id: '', loading: false, error: 'Not found' },
    })

    const { result } = renderHook(
      () => useRdiPipelineUi(RDI_INSTANCE_ID_MOCK),
      { store },
    )

    expect(result.current).toEqual({ status: 'ready', target: 'v1' })
  })

  it('should return the same object reference across renders when nothing relevant changed', () => {
    const store = getStoreWith({
      connectedInstance: {
        id: RDI_INSTANCE_ID_MOCK,
        version: SUPPORTED_VERSION,
      },
    })

    const { result, rerender } = renderHook(
      () => useRdiPipelineUi(RDI_INSTANCE_ID_MOCK),
      { store },
    )
    const firstResult = result.current

    rerender()

    expect(result.current).toBe(firstResult)
  })
})
