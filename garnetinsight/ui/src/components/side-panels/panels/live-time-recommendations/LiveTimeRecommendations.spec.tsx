import React from 'react'
import { cloneDeep, set } from 'lodash'
import reactRouterDom from 'react-router-dom'
import { recommendationsSelector } from 'uiSrc/slices/recommendations/recommendations'
import {
  cleanup,
  fireEvent,
  initialStateDefault,
  mockedStore,
  mockStore,
  render,
  screen,
  waitForRiPopoverVisible,
} from 'uiSrc/utils/test-utils'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { FeatureFlags, Pages } from 'uiSrc/constants'
import { RECOMMENDATIONS_DATA_MOCK } from 'uiSrc/mocks/handlers/recommendations/recommendationsHandler'
import {
  appContextDbConfig,
  setRecommendationsShowHidden,
} from 'uiSrc/slices/app/context'
import { EXTERNAL_LINKS } from 'uiSrc/constants/links'
import { MOCK_RECOMMENDATIONS } from 'uiSrc/constants/mocks/mock-recommendations'

import LiveTimeRecommendations from './LiveTimeRecommendations'

let store: typeof mockedStore
const recommendationsContent = MOCK_RECOMMENDATIONS

const mockRecommendationsSelector = {
  ...jest.requireActual('uiSrc/slices/recommendations/recommendations'),
  content: recommendationsContent,
}
const mockAppContextDbConfigSelector = jest.requireActual(
  'uiSrc/slices/app/context',
)

jest.mock('uiSrc/slices/instances/instances', () => ({
  ...jest.requireActual('uiSrc/slices/instances/instances'),
  connectedInstanceSelector: jest.fn().mockReturnValue({
    id: 'instanceId',
    connectionType: 'CLUSTER',
    provider: 'REDIS_CLOUD',
  }),
}))

jest.mock('uiSrc/slices/recommendations/recommendations', () => ({
  ...jest.requireActual('uiSrc/slices/recommendations/recommendations'),
  recommendationsSelector: jest.fn().mockReturnValue({
    data: {
      recommendations: [],
      totalUnread: 0,
    },
  }),
}))

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

jest.mock('uiSrc/slices/app/context', () => ({
  ...jest.requireActual('uiSrc/slices/app/context'),
  appContextDbConfig: jest.fn().mockReturnValue({
    showHiddenRecommendations: false,
  }),
}))

/**
 * LiveTimeRecommendations tests
 *
 * @group component
 */

beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('LiveTimeRecommendations', () => {
  it('should render', () => {
    expect(render(<LiveTimeRecommendations />)).toBeTruthy()
  })

  it('should render github icon', () => {
    ;(recommendationsSelector as jest.Mock).mockImplementation(() => ({
      ...mockRecommendationsSelector,
      data: { recommendations: [{ name: 'RTS' }] },
    }))

    render(<LiveTimeRecommendations />)
    expect(screen.getByTestId('github-repo-btn')).toHaveAttribute(
      'href',
      EXTERNAL_LINKS.githubRepo,
    )
    expect(screen.getByTestId('github-repo-icon')).toBeInTheDocument()
  })

  it('should render show hidden checkbox when there are some hidden', () => {
    ;(recommendationsSelector as jest.Mock).mockImplementation(() => ({
      ...mockRecommendationsSelector,
      data: {
        recommendations: [{ name: 'RTS', hide: true }, { name: 'setPassword' }],
      },
    }))

    render(<LiveTimeRecommendations />)
    expect(screen.getByTestId('checkbox-show-hidden')).toBeInTheDocument()
  })

  it('should not render show hidden checkbox when there are no any hidden', () => {
    ;(recommendationsSelector as jest.Mock).mockImplementation(() => ({
      ...mockRecommendationsSelector,
      data: {
        recommendations: [
          { name: 'RTS', hide: false },
          { name: 'setPassword' },
        ],
      },
    }))

    render(<LiveTimeRecommendations />)
    expect(screen.queryByTestId('checkbox-show-hidden')).not.toBeInTheDocument()
  })

  it('should properly push history on databaseAnalysis page', () => {
    const sendEventTelemetryMock = jest.fn()
    ;(sendEventTelemetry as jest.Mock).mockImplementation(
      () => sendEventTelemetryMock,
    )
    ;(recommendationsSelector as jest.Mock).mockImplementation(() => ({
      ...mockRecommendationsSelector,
      data: {
        recommendations: [{ name: 'RTS' }],
      },
    }))
    const pushMock = jest.fn()
    reactRouterDom.useHistory = jest.fn().mockReturnValue({ push: pushMock })

    render(<LiveTimeRecommendations />)

    fireEvent.click(screen.getByTestId('footer-db-analysis-link'))
    ;(async () => {
      await waitForRiPopoverVisible()
    })()

    fireEvent.click(screen.getByTestId('approve-insights-db-analysis-btn'))

    expect(pushMock).toHaveBeenCalledWith(Pages.databaseAnalysis('instanceId'))
    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.INSIGHTS_TIPS_DATABASE_ANALYSIS_CLICKED,
      eventData: {
        databaseId: 'instanceId',
        total: 1,
        provider: 'REDIS_CLOUD',
      },
    })
    sendEventTelemetry.mockRestore()
  })

  it('should send INSIGHTS_RECOMMENDATION_SHOW_HIDDEN telemetry event', () => {
    const sendEventTelemetryMock = jest.fn()
    ;(sendEventTelemetry as jest.Mock).mockImplementation(
      () => sendEventTelemetryMock,
    )
    ;(recommendationsSelector as jest.Mock).mockImplementation(() => ({
      ...mockRecommendationsSelector,
      data: RECOMMENDATIONS_DATA_MOCK,
    }))

    const { queryByTestId } = render(<LiveTimeRecommendations />)

    fireEvent.click(queryByTestId('checkbox-show-hidden')!)

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.INSIGHTS_TIPS_SHOW_HIDDEN,
      eventData: {
        databaseId: 'instanceId',
        list: RECOMMENDATIONS_DATA_MOCK.recommendations?.map(
          ({ name }) => recommendationsContent[name].telemetryEvent || name,
        ),
        total: 2,
        action: 'show',
        provider: 'REDIS_CLOUD',
      },
    })
    sendEventTelemetry.mockRestore()
  })

  it('should render only not hide recommendations is showHiddenRecommendations=false', async () => {
    ;(recommendationsSelector as jest.Mock).mockImplementation(() => ({
      ...mockRecommendationsSelector,
      data: RECOMMENDATIONS_DATA_MOCK,
    }))
    const { queryByTestId } = render(<LiveTimeRecommendations />)

    expect(queryByTestId('redisSearch-recommendation')).toBeInTheDocument()
    expect(queryByTestId('bigHashes-recommendation')).not.toBeInTheDocument()
  })

  it('should render all recommendations is showHiddenRecommendations=true', async () => {
    ;(recommendationsSelector as jest.Mock).mockImplementation(() => ({
      ...mockRecommendationsSelector,
      data: RECOMMENDATIONS_DATA_MOCK,
    }))
    ;(appContextDbConfig as jest.Mock).mockImplementation(() => ({
      ...mockAppContextDbConfigSelector,
      showHiddenRecommendations: true,
    }))
    render(<LiveTimeRecommendations />)

    expect(screen.getByTestId('redisSearch-recommendation')).toBeInTheDocument()
    expect(screen.getByTestId('bigHashes-recommendation')).toBeInTheDocument()
  })

  it('should call "setRecommendationsShowHidden" after click hide/unhide btn', async () => {
    ;(recommendationsSelector as jest.Mock).mockImplementation(() => ({
      ...mockRecommendationsSelector,
      data: RECOMMENDATIONS_DATA_MOCK,
    }))
    ;(appContextDbConfig as jest.Mock).mockImplementation(() => ({
      ...mockAppContextDbConfigSelector,
      showHiddenRecommendations: true,
    }))
    const { queryByTestId } = render(<LiveTimeRecommendations />)

    const afterRenderActions = [...store.getActions()]

    fireEvent.click(queryByTestId('checkbox-show-hidden')!)

    const expectedActions = [setRecommendationsShowHidden(false)]
    expect(store.getActions()).toEqual([
      ...afterRenderActions,
      ...expectedActions,
    ])
  })

  it('should render WelcomeScreen if no visible recommendations', () => {
    ;(recommendationsSelector as jest.Mock).mockImplementation(() => ({
      ...mockRecommendationsSelector,
      data: {
        ...RECOMMENDATIONS_DATA_MOCK,
        recommendations: RECOMMENDATIONS_DATA_MOCK.recommendations.map(
          (rec) => ({ ...rec, hide: true }),
        ),
      },
    }))
    ;(appContextDbConfig as jest.Mock).mockImplementation(() => ({
      ...mockAppContextDbConfigSelector,
      showHiddenRecommendations: false,
    }))

    const { queryByTestId } = render(<LiveTimeRecommendations />)

    expect(queryByTestId('redisSearch-recommendation')).not.toBeInTheDocument()
    expect(queryByTestId('bigHashes-recommendation')).not.toBeInTheDocument()
    expect(queryByTestId('no-recommendations-screen')).toBeInTheDocument()
  })

  it('should show feature dependent items when feature flag is on', async () => {
    ;(recommendationsSelector as jest.Mock).mockImplementation(() => ({
      ...mockRecommendationsSelector,
      data: { recommendations: [{ name: 'RTS' }] },
    }))
    const initialStoreState = set(
      cloneDeep(initialStateDefault),
      `app.features.featureFlags.features.${FeatureFlags.envDependent}`,
      { flag: true },
    )

    render(<LiveTimeRecommendations />, {
      store: mockStore(initialStoreState),
    })
    expect(screen.queryByTestId('github-repo-btn')).toBeInTheDocument()
  })

  it('should hide feature dependent items when feature flag is off', async () => {
    ;(recommendationsSelector as jest.Mock).mockImplementation(() => ({
      ...mockRecommendationsSelector,
      data: { recommendations: [{ name: 'RTS' }] },
    }))
    const initialStoreState = set(
      cloneDeep(initialStateDefault),
      `app.features.featureFlags.features.${FeatureFlags.envDependent}`,
      { flag: false },
    )

    render(<LiveTimeRecommendations />, {
      store: mockStore(initialStoreState),
    })
    expect(screen.queryByTestId('github-repo-btn')).not.toBeInTheDocument()
  })
})
