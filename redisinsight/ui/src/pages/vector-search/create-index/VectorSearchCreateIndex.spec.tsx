import React from 'react'
import reactRouterDom from 'react-router-dom'
import {
  render,
  screen,
  fireEvent,
  initialStateDefault,
  mockStore,
} from 'uiSrc/utils/test-utils'
import { RootState } from 'uiSrc/slices/store'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { Pages } from 'uiSrc/constants'
import { addErrorNotification } from 'uiSrc/slices/app/notifications'
import { INSTANCE_ID_MOCK } from 'uiSrc/mocks/handlers/analytics/dbAnalysisHistoryHandlers'
import {
  VectorSearchCreateIndex,
  VectorSearchCreateIndexProps,
} from './VectorSearchCreateIndex'
import {
  PresetDataType,
  SampleDataContent,
  SampleDataType,
  SearchIndexType,
} from './types'
import { useCreateIndex } from './hooks/useCreateIndex'

// Mock the telemetry module, so we don't send actual telemetry data during tests
jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

jest.mock('./hooks/useCreateIndex', () => ({
  useCreateIndex: jest.fn(),
}))

const mockedUseCreateIndex = useCreateIndex as jest.MockedFunction<
  typeof useCreateIndex
>

const renderVectorSearchCreateIndexComponent = (
  props?: VectorSearchCreateIndexProps,
) => {
  const testState: RootState = {
    ...initialStateDefault,
    connections: {
      ...initialStateDefault.connections,
      instances: {
        ...initialStateDefault.connections.instances,
        connectedInstance: {
          ...initialStateDefault.connections.instances.connectedInstance,
          id: INSTANCE_ID_MOCK,
          name: 'test-instance',
          host: 'localhost',
          port: 6379,
          modules: [],
        },
      },
    },
  }
  const store = mockStore(testState)
  const utils = render(<VectorSearchCreateIndex {...props} />, { store })

  return { ...utils, store }
}

describe('VectorSearchCreateIndex', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockedUseCreateIndex.mockReturnValue({
      run: jest.fn(),
      loading: false,
      error: null,
      success: false,
    } as any)
  })

  it('should render correctly', () => {
    const { container } = renderVectorSearchCreateIndexComponent()

    expect(container).toBeInTheDocument()
  })

  it('should redirect to vector search page after index creation', async () => {
    const pushMock = jest.fn()
    reactRouterDom.useHistory = jest.fn().mockReturnValue({ push: pushMock })

    mockedUseCreateIndex.mockReturnValue({
      run: jest.fn(),
      loading: false,
      error: null,
      success: true,
    } as any)

    renderVectorSearchCreateIndexComponent({ initialStep: 2 })

    // Effect should dispatch success notification and navigate
    expect(pushMock).toHaveBeenCalledWith({
      pathname: Pages.vectorSearch(INSTANCE_ID_MOCK),
      search: `?defaultSavedQueriesIndex=${encodeURIComponent(
        PresetDataType.BIKES,
      )}`,
    })
  })

  it('should dispatch error notification on error', () => {
    mockedUseCreateIndex.mockReturnValue({
      run: jest.fn(),
      loading: false,
      error: { message: 'Some error' },
      success: false,
    } as any)

    const { store } = renderVectorSearchCreateIndexComponent({
      initialStep: 2,
    })

    // Should dispatch addErrorNotification
    const actions = store?.getActions?.() || []
    const hasErrorAction = actions.some(
      (a: any) => a.type === addErrorNotification.type,
    )
    expect(hasErrorAction).toBe(true)
  })

  describe('Telemetry', () => {
    it('should send telemetry events on start step', () => {
      renderVectorSearchCreateIndexComponent()

      expect(sendEventTelemetry).toHaveBeenCalledTimes(1)
      expect(sendEventTelemetry).toHaveBeenCalledWith({
        event: TelemetryEvent.VECTOR_SEARCH_ONBOARDING_TRIGGERED,
        eventData: { databaseId: INSTANCE_ID_MOCK },
      })
    })

    it('should send telemetry events on index info step', () => {
      renderVectorSearchCreateIndexComponent()

      // Select the index type
      const indexTypeRadio = screen.getByText('Redis Query Engine')
      fireEvent.click(indexTypeRadio)

      // Select the sample dataset
      const sampleDataRadio = screen.getByText('Pre-set data')
      fireEvent.click(sampleDataRadio)

      // Select data content
      const dataContentRadio = screen.getByText('E-commerce Discovery')
      fireEvent.click(dataContentRadio)

      // Simulate going to the index info step
      const buttonNext = screen.getByText('Proceed to index')
      fireEvent.click(buttonNext)

      expect(sendEventTelemetry).toHaveBeenCalledTimes(2)
      expect(sendEventTelemetry).toHaveBeenNthCalledWith(2, {
        event: TelemetryEvent.VECTOR_SEARCH_ONBOARDING_PROCEED_TO_INDEX_INFO,
        eventData: {
          databaseId: INSTANCE_ID_MOCK,
          indexType: SearchIndexType.REDIS_QUERY_ENGINE,
          sampleDataType: SampleDataType.PRESET_DATA,
          dataContent: SampleDataContent.E_COMMERCE_DISCOVERY,
        },
      })
    })

    it('should send telemetry events on create index step', () => {
      renderVectorSearchCreateIndexComponent()

      // Simulate going to the index info step
      const buttonNext = screen.getByText('Proceed to index')
      fireEvent.click(buttonNext)

      // Simulate creating the index
      const buttonCreateIndex = screen.getByText('Create index')
      fireEvent.click(buttonCreateIndex)

      expect(sendEventTelemetry).toHaveBeenCalledTimes(3)
      expect(sendEventTelemetry).toHaveBeenNthCalledWith(3, {
        event: TelemetryEvent.VECTOR_SEARCH_ONBOARDING_PROCEED_TO_QUERIES,
        eventData: {
          databaseId: INSTANCE_ID_MOCK,
        },
      })
    })
  })
})
