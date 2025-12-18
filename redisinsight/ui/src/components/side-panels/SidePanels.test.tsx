import React from 'react'
import { cloneDeep } from 'lodash'
import reactRouterDom from 'react-router-dom'
import {
  getRecommendations,
  recommendationsSelector,
} from 'uiSrc/slices/recommendations/recommendations'
import {
  cleanup,
  fireEvent,
  mockedStore,
  render,
  screen,
} from 'uiSrc/utils/test-utils'
import { MOCK_RECOMMENDATIONS } from 'uiSrc/constants/mocks/mock-recommendations'
import {
  changeSelectedTab,
  changeSidePanel,
  insightsPanelSelector,
  resetExplorePanelSearch,
  setExplorePanelIsPageOpen,
  sidePanelsSelector,
} from 'uiSrc/slices/panels/sidePanels'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { Pages } from 'uiSrc/constants'
import { connectedInstanceCDSelector } from 'uiSrc/slices/instances/instances'
import {
  InsightsPanelTabs,
  SidePanels as ISidePanels,
} from 'uiSrc/slices/interfaces/insights'
import { getTutorialCapability } from 'uiSrc/utils'
import { isShowCapabilityTutorialPopover } from 'uiSrc/services'
import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features'

import SidePanels from './SidePanels'

let store: typeof mockedStore

const mockRecommendationsSelector = {
  ...jest.requireActual('uiSrc/slices/recommendations/recommendations'),
  content: MOCK_RECOMMENDATIONS,
}

jest.mock('uiSrc/slices/app/features', () => ({
  ...jest.requireActual('uiSrc/slices/app/features'),
  appFeatureFlagsFeaturesSelector: jest.fn().mockReturnValue({
    insightsRecommendations: {
      flag: true,
    },
    documentationChat: {
      flag: true,
    },
    databaseChat: {
      flag: true,
    },
  }),
}))

jest.mock('uiSrc/slices/instances/instances', () => ({
  ...jest.requireActual('uiSrc/slices/instances/instances'),
  connectedInstanceSelector: jest.fn().mockReturnValue({
    id: 'instanceId',
    connectionType: 'CLUSTER',
    provider: 'REDIS_CLOUD',
  }),
  connectedInstanceCDSelector: jest.fn().mockReturnValue({
    free: false,
  }),
}))

jest.mock('uiSrc/slices/app/context', () => ({
  ...jest.requireActual('uiSrc/slices/app/context'),
  appContextCapability: jest.fn().mockReturnValue({
    source: 'workbench RediSearch',
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

jest.mock('uiSrc/slices/panels/sidePanels', () => ({
  ...jest.requireActual('uiSrc/slices/panels/sidePanels'),
  insightsPanelSelector: jest.fn().mockReturnValue({
    tabSelected: 'explore',
  }),
  sidePanelsSelector: jest.fn().mockReturnValue({
    openedPanel: null,
  }),
}))

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

jest.mock('uiSrc/utils', () => ({
  ...jest.requireActual('uiSrc/utils'),
  getTutorialCapability: jest
    .fn()
    .mockReturnValue({ path: 'path', telemetryName: 'searchAndQuery' }),
}))

jest.mock('uiSrc/services', () => ({
  ...jest.requireActual('uiSrc/services'),
  isShowCapabilityTutorialPopover: jest.fn(),
}))

/**
 * SidePanels tests
 *
 * @group component
 */

beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('SidePanels', () => {
  beforeEach(() => {
    reactRouterDom.useParams = jest
      .fn()
      .mockReturnValue({ instanceId: 'instanceId' })
  })
  it('should render', () => {
    expect(render(<SidePanels />)).toBeTruthy()
  })

  it('should call proper actions when recommendations tab is Open after render', () => {
    ;(recommendationsSelector as jest.Mock).mockImplementation(() => ({
      ...mockRecommendationsSelector,
      data: {
        recommendations: [{ name: 'name' }],
        totalUnread: 1,
      },
    }))
    ;(sidePanelsSelector as jest.Mock).mockReturnValue({
      openedPanel: ISidePanels.Insights,
    })
    ;(insightsPanelSelector as jest.Mock).mockReturnValue({
      tabSelected: 'tips',
    })

    render(<SidePanels />)

    const expectedActions = [getRecommendations()]
    expect(store.getActions()).toEqual(expectedActions)
  })

  it('should not render recommendations count with totalUnread = 0', () => {
    ;(recommendationsSelector as jest.Mock).mockImplementationOnce(() => ({
      ...mockRecommendationsSelector,
      data: {
        recommendations: [],
        totalUnread: 0,
      },
    }))

    render(<SidePanels />)

    expect(
      screen.queryByTestId('recommendations-unread-count'),
    ).not.toBeInTheDocument()
  })

  it('should not render recommendations count without instanceId', () => {
    reactRouterDom.useParams = jest
      .fn()
      .mockReturnValue({ instanceId: undefined })
    ;(sidePanelsSelector as jest.Mock).mockReturnValue({
      openedPanel: ISidePanels.Insights,
    })
    ;(insightsPanelSelector as jest.Mock).mockReturnValue({
      tabSelected: 'tips',
    })
    ;(recommendationsSelector as jest.Mock).mockImplementationOnce(() => ({
      ...mockRecommendationsSelector,
      data: {
        recommendations: [],
        totalUnread: 7,
      },
    }))

    render(<SidePanels />)
    expect(
      screen.queryByTestId('recommendations-unread-count'),
    ).not.toBeInTheDocument()
  })

  it('should render recommendations count with totalUnread > 0', () => {
    ;(sidePanelsSelector as jest.Mock).mockReturnValue({
      openedPanel: ISidePanels.Insights,
    })
    ;(insightsPanelSelector as jest.Mock).mockReturnValue({
      tabSelected: 'tips',
    })
    ;(recommendationsSelector as jest.Mock).mockImplementationOnce(() => ({
      ...mockRecommendationsSelector,
      data: {
        recommendations: [],
        totalUnread: 7,
      },
    }))

    render(<SidePanels />)
    expect(screen.getByText(/^Tips \(7\)$/)).toBeVisible()
  })

  it('should call proper telemetry events on close panel', () => {
    const sendEventTelemetryMock = jest.fn()
    ;(sendEventTelemetry as jest.Mock).mockImplementation(
      () => sendEventTelemetryMock,
    )

    reactRouterDom.useLocation = jest
      .fn()
      .mockReturnValue({ pathname: Pages.pubSub('instanceId') })
    ;(sidePanelsSelector as jest.Mock).mockReturnValue({
      openedPanel: ISidePanels.Insights,
    })
    ;(insightsPanelSelector as jest.Mock).mockReturnValue({
      tabSelected: 'tips',
    })

    render(<SidePanels />)

    fireEvent.click(screen.getByTestId('close-insights-btn'))

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.INSIGHTS_PANEL_CLOSED,
      eventData: {
        databaseId: 'instanceId',
        provider: 'REDIS_CLOUD',
        page: '/pub-sub',
        tab: 'tips',
      },
    })
    ;(sendEventTelemetry as jest.Mock).mockRestore()
  })

  it('should call proper telemetry events on change tab', () => {
    const sendEventTelemetryMock = jest.fn()
    ;(sendEventTelemetry as jest.Mock).mockImplementation(
      () => sendEventTelemetryMock,
    )

    reactRouterDom.useLocation = jest
      .fn()
      .mockReturnValue({ pathname: Pages.pubSub('instanceId') })
    ;(sidePanelsSelector as jest.Mock).mockReturnValue({
      openedPanel: ISidePanels.Insights,
    })
    ;(insightsPanelSelector as jest.Mock).mockReturnValue({
      tabSelected: 'tips',
    })

    render(<SidePanels />)

    fireEvent.mouseDown(screen.getByText(/^Tutorials$/))

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.INSIGHTS_PANEL_TAB_CHANGED,
      eventData: {
        databaseId: 'instanceId',
        prevTab: 'tips',
        currentTab: 'explore',
      },
    })
    ;(sendEventTelemetry as jest.Mock).mockRestore()
  })

  it('should call proper telemetry events on fullscreen', () => {
    const sendEventTelemetryMock = jest.fn()
    ;(sendEventTelemetry as jest.Mock).mockImplementation(
      () => sendEventTelemetryMock,
    )
    ;(sidePanelsSelector as jest.Mock).mockReturnValue({
      openedPanel: ISidePanels.Insights,
    })
    ;(insightsPanelSelector as jest.Mock).mockReturnValue({
      tabSelected: 'recommendations',
    })

    render(<SidePanels />)

    fireEvent.click(screen.getByTestId('fullScreen-insights-btn'))

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.INSIGHTS_PANEL_FULL_SCREEN_CLICKED,
      eventData: {
        databaseId: 'instanceId',
        state: 'open',
      },
    })
    ;(sendEventTelemetry as jest.Mock).mockRestore()
  })

  it('should render copilot if any chat is available', () => {
    ;(sidePanelsSelector as jest.Mock).mockReturnValue({
      openedPanel: ISidePanels.AiAssistant,
    })
    ;(appFeatureFlagsFeaturesSelector as jest.Mock).mockReturnValue({
      documentationChat: {
        flag: true,
      },
      databaseChat: {
        flag: false,
      },
    })

    render(<SidePanels />)
    expect(screen.getByTestId('redis-copilot')).toBeInTheDocument()
  })

  it('should not render copilot tab if not any chats available', () => {
    ;(sidePanelsSelector as jest.Mock).mockReturnValue({
      openedPanel: ISidePanels.Insights,
    })
    ;(insightsPanelSelector as jest.Mock).mockReturnValue({
      tabSelected: 'recommendations',
    })
    ;(appFeatureFlagsFeaturesSelector as jest.Mock).mockReturnValue({
      documentationChat: {
        flag: false,
      },
      databaseChat: {
        flag: false,
      },
    })

    render(<SidePanels />)
    expect(screen.queryByTestId('ai-assistant-tab')).not.toBeInTheDocument()
  })

  it('should close insights if no any chats available', () => {
    ;(sidePanelsSelector as jest.Mock).mockReturnValue({
      openedPanel: ISidePanels.AiAssistant,
    })
    ;(appFeatureFlagsFeaturesSelector as jest.Mock).mockReturnValue({
      documentationChat: {
        flag: false,
      },
      databaseChat: {
        flag: false,
      },
    })

    render(<SidePanels />)
    expect(store.getActions()).toEqual([changeSidePanel(null)])
  })

  describe('capability', () => {
    beforeEach(() => {
      ;(connectedInstanceCDSelector as jest.Mock).mockReturnValueOnce({
        free: true,
      })
      ;(isShowCapabilityTutorialPopover as jest.Mock).mockImplementation(
        () => true,
      )
    })
    it('should call store actions', () => {
      ;(sidePanelsSelector as jest.Mock).mockReturnValue({
        openedPanel: ISidePanels.Insights,
      })
      ;(insightsPanelSelector as jest.Mock).mockReturnValue({ tabSelected: '' })
      ;(getTutorialCapability as jest.Mock).mockImplementation(() => ({
        tutorialPage: { args: { path: 'path' } },
      }))
      render(<SidePanels />)

      const expectedActions = [
        resetExplorePanelSearch(),
        setExplorePanelIsPageOpen(false),
        changeSelectedTab(InsightsPanelTabs.Explore),
        changeSidePanel(ISidePanels.Insights),
      ]
      expect(store.getActions()).toEqual(expectedActions)
      ;(getTutorialCapability as jest.Mock).mockRestore()
    })
    it('should call resetExplorePanelSearch if capability was not found', () => {
      render(<SidePanels />)

      const expectedActions = [
        resetExplorePanelSearch(),
        setExplorePanelIsPageOpen(false),
        changeSelectedTab(InsightsPanelTabs.Explore),
        changeSidePanel(ISidePanels.Insights),
      ]
      expect(store.getActions()).toEqual(expectedActions)
    })
  })
})
