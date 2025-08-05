import React from 'react'
import * as reactRedux from 'react-redux'
import { cleanup, render } from 'uiSrc/utils/test-utils'
import { TelemetryPageView } from 'uiSrc/telemetry/pageViews'
import { sendPageViewTelemetry } from 'uiSrc/telemetry'
import {
  INSTANCE_ID_MOCK,
  INSTANCES_MOCK,
} from 'uiSrc/mocks/handlers/instances/instancesHandlers'
import { VectorSearchPage } from './VectorSearchPage'

// Mock the telemetry module, so we don't send actual telemetry data during tests
jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendPageViewTelemetry: jest.fn(),
}))

const renderVectorSearchPageComponent = () => render(<VectorSearchPage />)

describe('VectorSearchPage', () => {
  beforeEach(() => {
    cleanup()
  })

  it('should render ', () => {
    const { container } = renderVectorSearchPageComponent()

    expect(container).toBeTruthy()
  })

  describe('Telemetry', () => {
    let mockUseSelector: jest.SpyInstance

    beforeEach(() => {
      jest.clearAllMocks()

      mockUseSelector = jest.spyOn(reactRedux, 'useSelector')
      mockUseSelector.mockReturnValue(INSTANCES_MOCK[0])
    })

    afterEach(() => {
      jest.restoreAllMocks()
    })

    it('should send page view telemetry on mount', () => {
      renderVectorSearchPageComponent()

      expect(sendPageViewTelemetry).toHaveBeenCalledTimes(1)
      expect(sendPageViewTelemetry).toHaveBeenCalledWith({
        name: TelemetryPageView.VECTOR_SEARCH_PAGE,
        eventData: { databaseId: INSTANCE_ID_MOCK },
      })
    })
  })
})
