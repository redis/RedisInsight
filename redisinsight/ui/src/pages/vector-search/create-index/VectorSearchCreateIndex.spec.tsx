import React from 'react'
import {
  render,
  screen,
  fireEvent,
  initialStateDefault,
  mockStore,
} from 'uiSrc/utils/test-utils'
import { RootState } from 'uiSrc/slices/store'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { INSTANCE_ID_MOCK } from 'uiSrc/mocks/handlers/analytics/dbAnalysisHistoryHandlers'
import { VectorSearchCreateIndex } from './VectorSearchCreateIndex'
import { SampleDataContent, SampleDataType, SearchIndexType } from './types'

// Mock the telemetry module, so we don't send actual telemetry data during tests
jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

const renderVectorSearchCreateIndexComponent = () => {
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

  return render(<VectorSearchCreateIndex />, { store })
}

describe('VectorSearchCreateIndex', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render correctly', () => {
    const { container } = renderVectorSearchCreateIndexComponent()

    expect(container).toBeInTheDocument()
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
