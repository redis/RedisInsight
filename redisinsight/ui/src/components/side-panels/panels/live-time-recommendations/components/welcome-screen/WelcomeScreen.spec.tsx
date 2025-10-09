import React from 'react'
import reactRouterDom from 'react-router-dom'
import { cloneDeep, set } from 'lodash'
import { recommendationsSelector } from 'uiSrc/slices/recommendations/recommendations'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import {
  fireEvent,
  mockedStore,
  screen,
  cleanup,
  render,
  waitForRiPopoverVisible,
  initialStateDefault,
  mockStore,
} from 'uiSrc/utils/test-utils'
import { FeatureFlags, Pages } from 'uiSrc/constants'
import { getDBAnalysis } from 'uiSrc/slices/analytics/dbAnalysis'

import WelcomeScreen from './WelcomeScreen'

let store: typeof mockedStore

const mockRecommendationsSelector = jest.requireActual(
  'uiSrc/slices/recommendations/recommendations',
)

jest.mock('uiSrc/slices/instances/instances', () => ({
  ...jest.requireActual('uiSrc/slices/instances/instances'),
  connectedInstanceSelector: jest.fn().mockReturnValue({
    id: 'instanceId',
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

beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('WelcomeScreen', () => {
  it('should render', () => {
    expect(render(<WelcomeScreen />)).toBeTruthy()
  })

  it('should properly push history on workbench page', async () => {
    const pushMock = jest.fn()
    reactRouterDom.useHistory = jest.fn().mockReturnValue({ push: pushMock })

    render(<WelcomeScreen />)

    fireEvent.click(screen.getByTestId('insights-db-analysis-link'))

    await waitForRiPopoverVisible()
    fireEvent.click(screen.getByTestId('approve-insights-db-analysis-btn'))

    expect(pushMock).toHaveBeenCalledWith(Pages.databaseAnalysis('instanceId'))
  })

  it('should call db analysis after click link btn', () => {
    render(<WelcomeScreen />)
    const afterRenderActions = [...store.getActions()]

    fireEvent.click(screen.getByTestId('insights-db-analysis-link'))
    ;(async () => {
      await waitForRiPopoverVisible()
    })()

    fireEvent.click(screen.getByTestId('approve-insights-db-analysis-btn'))

    const expectedActions = [getDBAnalysis()]
    expect(store.getActions()).toEqual([
      ...afterRenderActions,
      ...expectedActions,
    ])
  })

  it('should call telemetry INSIGHTS_RECOMMENDATION_DATABASE_ANALYSIS_CLICKED after click link btn', async () => {
    ;(recommendationsSelector as jest.Mock).mockImplementation(() => ({
      ...mockRecommendationsSelector,
      data: {
        recommendations: [{ name: 'RTS' }],
      },
    }))

    render(<WelcomeScreen />)

    fireEvent.click(screen.getByTestId('insights-db-analysis-link'))
    await waitForRiPopoverVisible()
    fireEvent.click(screen.getByTestId('approve-insights-db-analysis-btn'))

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.INSIGHTS_TIPS_DATABASE_ANALYSIS_CLICKED,
      eventData: {
        databaseId: 'instanceId',
        total: 1,
        provider: 'REDIS_CLOUD',
      },
    })
    ;(sendEventTelemetry as jest.Mock).mockRestore()
  })

  it('should not render part of content if no instanceId', () => {
    reactRouterDom.useParams = jest
      .fn()
      .mockReturnValue({ instanceId: undefined })
    render(<WelcomeScreen />)

    expect(
      screen.queryByTestId('insights-db-analysis-link'),
    ).not.toBeInTheDocument()
    expect(
      screen.getByTestId('no-recommendations-analyse-text'),
    ).toHaveTextContent('Eager for tips? Connect to a database to get started.')
  })

  it('should show feature dependent items when feature flag is on', async () => {
    const initialStoreState = set(
      cloneDeep(initialStateDefault),
      `app.features.featureFlags.features.${FeatureFlags.envDependent}`,
      { flag: true },
    )
    reactRouterDom.useParams = jest.fn().mockReturnValue({ instanceId: 1 })

    render(<WelcomeScreen />, {
      store: mockStore(initialStoreState),
    })
    expect(
      screen.queryByTestId('insights-db-analysis-link'),
    ).toBeInTheDocument()
  })

  it('should hide feature dependent items when feature flag is off', async () => {
    const initialStoreState = set(
      cloneDeep(initialStateDefault),
      `app.features.featureFlags.features.${FeatureFlags.envDependent}`,
      { flag: false },
    )
    reactRouterDom.useParams = jest.fn().mockReturnValue({ instanceId: 1 })

    render(<WelcomeScreen />, {
      store: mockStore(initialStoreState),
    })
    expect(
      screen.queryByTestId('insights-db-analysis-link'),
    ).not.toBeInTheDocument()
  })
})
