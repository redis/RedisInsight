import React from 'react'
import * as reactRedux from 'react-redux'
import { cleanup, render, screen } from 'uiSrc/utils/test-utils'
import { TelemetryPageView } from 'uiSrc/telemetry/pageViews'
import { sendPageViewTelemetry } from 'uiSrc/telemetry'
import {
  INSTANCE_ID_MOCK,
  INSTANCES_MOCK,
} from 'uiSrc/mocks/handlers/instances/instancesHandlers'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { redisearchListSelector } from 'uiSrc/slices/browser/redisearch'
import VectorSearchPage from './VectorSearchPage'
import useRedisInstanceCompatibility from '../create-index/hooks/useRedisInstanceCompatibility'
import useVectorSearchOnboarding from '../create-index/hooks/useVectorSearchOnboarding'

// Mock the telemetry module, so we don't send actual telemetry data during tests
jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendPageViewTelemetry: jest.fn(),
}))

jest.mock('../create-index/hooks/useRedisInstanceCompatibility', () =>
  jest.fn(),
)

jest.mock('../create-index/hooks/useVectorSearchOnboarding', () => jest.fn())

const renderVectorSearchPageComponent = () => render(<VectorSearchPage />)

describe('VectorSearchPage', () => {
  const mockUseRedisInstanceCompatibility =
    useRedisInstanceCompatibility as jest.Mock
  const mockUseVectorSearchOnboarding = useVectorSearchOnboarding as jest.Mock

  beforeEach(() => {
    cleanup()

    mockUseRedisInstanceCompatibility.mockReturnValue({
      loading: false,
      hasRedisearch: true,
      hasSupportedVersion: true,
    })

    mockUseVectorSearchOnboarding.mockReturnValue({
      showOnboarding: false,
      markOnboardingAsSeen: jest.fn(),
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should render vector search page', () => {
    const { container } = renderVectorSearchPageComponent()

    expect(container).toBeTruthy()

    const vectorSearchQuery = screen.getByTestId('vector-search-query')
    expect(vectorSearchQuery).toBeInTheDocument()
  })

  it('should render loader while checking the database compatibility', () => {
    mockUseRedisInstanceCompatibility.mockReturnValue({
      loading: true,
      hasRedisearch: null,
      hasSupportedVersion: null,
    })

    renderVectorSearchPageComponent()

    const loader = screen.getByTestId('vector-search-loader')
    expect(loader).toBeInTheDocument()
  })

  it('should render fallback message when RediSearch is not available', () => {
    mockUseRedisInstanceCompatibility.mockReturnValue({
      loading: false,
      hasRedisearch: false,
      hasSupportedVersion: true,
    })

    renderVectorSearchPageComponent()

    const rqeNotAvailableCard = screen.getByTestId('rqe-not-available-card')
    expect(rqeNotAvailableCard).toBeInTheDocument()
  })

  it('should render onboarding screen when opening the page for the first time', () => {
    mockUseVectorSearchOnboarding.mockReturnValue({
      showOnboarding: true,
      markOnboardingAsSeen: jest.fn(),
    })

    renderVectorSearchPageComponent()

    const onboarding = screen.getByTestId('vector-search-onboarding')
    expect(onboarding).toBeInTheDocument()
  })

  describe('Telemetry', () => {
    let mockUseSelector: jest.SpyInstance

    beforeEach(() => {
      jest.clearAllMocks()

      mockUseSelector = jest.spyOn(reactRedux, 'useSelector')
      mockUseSelector.mockImplementation((selector) => {
        if (selector === connectedInstanceSelector) {
          return INSTANCES_MOCK[0]
        }
        if (selector === redisearchListSelector) {
          return {
            loading: false,
            data: [],
          }
        }
        // Default fallback for other selectors
        return {
          loading: false,
          spec: {},
          commandsArray: [],
          commandGroups: [],
        }
      })
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
