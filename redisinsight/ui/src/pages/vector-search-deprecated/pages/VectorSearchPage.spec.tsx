import React from 'react'
import * as reactRedux from 'react-redux'
import {
  cleanup,
  initialStateDefault,
  mockStore,
  render,
  screen,
} from 'uiSrc/utils/test-utils'
import { TelemetryPageView } from 'uiSrc/telemetry/pageViews'
import { sendPageViewTelemetry } from 'uiSrc/telemetry'
import { RootState } from 'uiSrc/slices/store'
import {
  INSTANCE_ID_MOCK,
  INSTANCES_MOCK,
} from 'uiSrc/mocks/handlers/instances/instancesHandlers'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { redisearchListSelector } from 'uiSrc/slices/browser/redisearch'
import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features'
import { VectorSearch } from './VectorSearchPage'
import useRedisInstanceCompatibility from '../create-index/hooks/useRedisInstanceCompatibility'
import {
  VectorSearchOnboardingContext,
  VectorSearchOnboardingContextType,
} from '../context/VectorSearchOnboardingContext'

// Mock the telemetry module, so we don't send actual telemetry data during tests
jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendPageViewTelemetry: jest.fn(),
}))

jest.mock('../create-index/hooks/useRedisInstanceCompatibility', () =>
  jest.fn(),
)

jest.mock('uiSrc/slices/app/features', () => ({
  ...jest.requireActual('uiSrc/slices/app/features'),
  appFeatureFlagsFeaturesSelector: jest.fn().mockReturnValue({
    vectorSearch: {
      flag: true,
    },
  }),
}))

const renderVectorSearchPageComponent = (
  contextValue?: Partial<VectorSearchOnboardingContextType>,
) => {
  const defaultContextValue: VectorSearchOnboardingContextType = {
    showOnboarding: false,
    setOnboardingSeen: jest.fn(),
    setOnboardingSeenSilent: jest.fn(),
    ...contextValue,
  }

  const testState: RootState = {
    ...initialStateDefault,
    connections: {
      ...initialStateDefault.connections,
      instances: {
        ...initialStateDefault.connections.instances,
        connectedInstance: {
          ...initialStateDefault.connections.instances.connectedInstance,
          ...INSTANCES_MOCK[0],
        },
      },
    },
  }
  const store = mockStore(testState)

  return render(
    <VectorSearchOnboardingContext.Provider value={defaultContextValue}>
      <VectorSearch />
    </VectorSearchOnboardingContext.Provider>,
    { store },
  )
}

describe('VectorSearchPage', () => {
  const mockUseRedisInstanceCompatibility =
    useRedisInstanceCompatibility as jest.Mock

  beforeEach(() => {
    cleanup()

    mockUseRedisInstanceCompatibility.mockReturnValue({
      loading: false,
      hasRedisearch: true,
      hasSupportedVersion: true,
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

    // Verify the title of the page
    expect(document.title).toBe(
      `${INSTANCES_MOCK[0].name} [db${INSTANCES_MOCK[0].db}] - Vector Search`,
    )
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
    renderVectorSearchPageComponent({ showOnboarding: true })

    const onboarding = screen.getByTestId('vector-search-onboarding')
    expect(onboarding).toBeInTheDocument()
  })

  it('should not render onboarding screen when ff is disabled', () => {
    ;(appFeatureFlagsFeaturesSelector as jest.Mock).mockImplementation(() => ({
      vectorSearch: {
        flag: false,
      },
    }))
    renderVectorSearchPageComponent({ showOnboarding: true })

    expect(
      screen.queryByTestId('vector-search-onboarding'),
    ).not.toBeInTheDocument()
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
