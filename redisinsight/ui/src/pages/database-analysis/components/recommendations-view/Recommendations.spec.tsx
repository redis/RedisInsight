import React from 'react'
import reactRouterDom from 'react-router-dom'
import { fireEvent, render, screen, userEvent } from 'uiSrc/utils/test-utils'
import { dbAnalysisSelector } from 'uiSrc/slices/analytics/dbAnalysis'
import { INSTANCE_ID_MOCK } from 'uiSrc/mocks/handlers/analytics/clusterDetailsHandlers'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { recommendationsSelector } from 'uiSrc/slices/recommendations/recommendations'

import { MOCK_RECOMMENDATIONS } from 'uiSrc/constants/mocks/mock-recommendations'
import { findTutorialPath } from 'uiSrc/utils'
import Recommendations from './Recommendations'

const recommendationsContent = MOCK_RECOMMENDATIONS
const mockdbAnalysisSelector = jest.requireActual(
  'uiSrc/slices/analytics/dbAnalysis',
)
const mockRecommendationsSelector = jest.requireActual(
  'uiSrc/slices/recommendations/recommendations',
)

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({
    push: jest.fn,
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

jest.mock('uiSrc/slices/analytics/dbAnalysis', () => ({
  ...jest.requireActual('uiSrc/slices/analytics/dbAnalysis'),
  dbAnalysisSelector: jest.fn().mockReturnValue({
    loading: false,
    error: '',
    data: null,
    history: {
      loading: false,
      error: '',
      data: [],
      selectedAnalysis: null,
    },
  }),
}))

jest.mock('uiSrc/slices/instances/instances', () => ({
  ...jest.requireActual('uiSrc/slices/instances/instances'),
  connectedInstanceSelector: jest.fn().mockReturnValue({
    provider: 'REDIS_CLOUD',
  }),
}))

jest.mock('uiSrc/utils', () => ({
  ...jest.requireActual('uiSrc/utils'),
  findTutorialPath: jest.fn(),
}))

beforeEach(() => {
  ;(recommendationsSelector as jest.Mock).mockImplementation(() => ({
    ...mockRecommendationsSelector,
    data: { recommendations: [{ name: 'RTS' }] },
    content: recommendationsContent,
  }))
})

describe('Recommendations', () => {
  it('should render', () => {
    expect(render(<Recommendations />)).toBeTruthy()
  })

  it('should render loader', () => {
    ;(dbAnalysisSelector as jest.Mock).mockImplementation(() => ({
      ...mockdbAnalysisSelector,
      loading: true,
    }))

    render(<Recommendations />)

    expect(screen.queryByTestId('recommendations-loader')).toBeInTheDocument()
  })

  it('should not render loader', () => {
    ;(dbAnalysisSelector as jest.Mock).mockImplementation(() => ({
      ...mockdbAnalysisSelector,
    }))

    render(<Recommendations />)

    expect(
      screen.queryByTestId('recommendations-loader'),
    ).not.toBeInTheDocument()
  })

  it('should render RecommendationVoting', () => {
    ;(dbAnalysisSelector as jest.Mock).mockImplementation(() => ({
      ...mockdbAnalysisSelector,
      data: {
        recommendations: [{ name: 'luaScript' }],
      },
    }))

    render(<Recommendations />)

    expect(screen.getByTestId('recommendation-voting')).toBeInTheDocument()
  })

  it('should render code changes badge in luaScript recommendation', () => {
    ;(dbAnalysisSelector as jest.Mock).mockImplementation(() => ({
      ...mockdbAnalysisSelector,
      data: {
        recommendations: [{ name: 'luaScript' }],
      },
    }))

    render(<Recommendations />)

    expect(screen.queryByTestId('code_changes')).toBeInTheDocument()
    expect(screen.queryByTestId('upgrade')).not.toBeInTheDocument()
    expect(
      screen.queryByTestId('configuration_changes'),
    ).not.toBeInTheDocument()
  })

  it('should render code changes badge in useSmallerKeys recommendation', () => {
    ;(dbAnalysisSelector as jest.Mock).mockImplementation(() => ({
      ...mockdbAnalysisSelector,
      data: {
        recommendations: [{ name: 'useSmallerKeys' }],
      },
    }))

    render(<Recommendations />)

    expect(screen.queryByTestId('code_changes')).toBeInTheDocument()
    expect(screen.queryByTestId('upgrade')).not.toBeInTheDocument()
    expect(
      screen.queryByTestId('configuration_changes'),
    ).not.toBeInTheDocument()
  })

  it('should render code changes badge and configuration_changes in bigHashes recommendation', () => {
    ;(dbAnalysisSelector as jest.Mock).mockImplementation(() => ({
      ...mockdbAnalysisSelector,
      data: {
        recommendations: [{ name: 'bigHashes' }],
      },
    }))

    render(<Recommendations />)

    expect(screen.queryByTestId('code_changes')).toBeInTheDocument()
    expect(screen.queryByTestId('upgrade')).not.toBeInTheDocument()
    expect(screen.queryByTestId('configuration_changes')).toBeInTheDocument()
  })

  it('should render code changes badge in avoidLogicalDatabases recommendation', () => {
    ;(dbAnalysisSelector as jest.Mock).mockImplementation(() => ({
      ...mockdbAnalysisSelector,
      data: {
        recommendations: [{ name: 'avoidLogicalDatabases' }],
      },
    }))

    render(<Recommendations />)

    expect(screen.queryByTestId('code_changes')).toBeInTheDocument()
    expect(screen.queryByTestId('upgrade')).not.toBeInTheDocument()
    expect(
      screen.queryByTestId('configuration_changes'),
    ).not.toBeInTheDocument()
  })

  it('should render code changes badge in combineSmallStringsToHashes recommendation', () => {
    ;(dbAnalysisSelector as jest.Mock).mockImplementation(() => ({
      ...mockdbAnalysisSelector,
      data: {
        recommendations: [{ name: 'combineSmallStringsToHashes' }],
      },
    }))

    render(<Recommendations />)

    expect(screen.queryByTestId('code_changes')).toBeInTheDocument()
    expect(screen.queryByTestId('upgrade')).not.toBeInTheDocument()
    expect(
      screen.queryByTestId('configuration_changes'),
    ).not.toBeInTheDocument()
  })

  it('should render configuration_changes badge in increaseSetMaxIntsetEntries recommendation', () => {
    ;(dbAnalysisSelector as jest.Mock).mockImplementation(() => ({
      ...mockdbAnalysisSelector,
      data: {
        recommendations: [{ name: 'increaseSetMaxIntsetEntries' }],
      },
    }))

    render(<Recommendations />)

    expect(screen.queryByTestId('code_changes')).not.toBeInTheDocument()
    expect(screen.queryByTestId('upgrade')).not.toBeInTheDocument()
    expect(screen.queryByTestId('configuration_changes')).toBeInTheDocument()
  })

  it('should render code changes badge in hashHashtableToZiplist recommendation', () => {
    ;(dbAnalysisSelector as jest.Mock).mockImplementation(() => ({
      ...mockdbAnalysisSelector,
      data: {
        recommendations: [{ name: 'hashHashtableToZiplist' }],
      },
    }))

    render(<Recommendations />)

    expect(screen.queryByTestId('code_changes')).not.toBeInTheDocument()
    expect(screen.queryByTestId('upgrade')).not.toBeInTheDocument()
    expect(screen.queryByTestId('configuration_changes')).toBeInTheDocument()
  })

  it('should render configuration_changes badge in compressionForList recommendation', () => {
    ;(dbAnalysisSelector as jest.Mock).mockImplementation(() => ({
      ...mockdbAnalysisSelector,
      data: {
        recommendations: [{ name: 'compressionForList' }],
      },
    }))

    render(<Recommendations />)

    expect(screen.queryByTestId('code_changes')).not.toBeInTheDocument()
    expect(screen.queryByTestId('upgrade')).not.toBeInTheDocument()
    expect(screen.queryByTestId('configuration_changes')).toBeInTheDocument()
  })

  it('should render configuration_changes badge in bigStrings recommendation', () => {
    ;(dbAnalysisSelector as jest.Mock).mockImplementation(() => ({
      ...mockdbAnalysisSelector,
      data: {
        recommendations: [{ name: 'bigStrings' }],
      },
    }))

    render(<Recommendations />)

    expect(screen.queryByTestId('code_changes')).not.toBeInTheDocument()
    expect(screen.queryByTestId('upgrade')).not.toBeInTheDocument()
    expect(screen.queryByTestId('configuration_changes')).toBeInTheDocument()
  })

  it('should render configuration_changes badge in zSetHashtableToZiplist recommendation', () => {
    ;(dbAnalysisSelector as jest.Mock).mockImplementation(() => ({
      ...mockdbAnalysisSelector,
      data: {
        recommendations: [{ name: 'zSetHashtableToZiplist' }],
      },
    }))

    render(<Recommendations />)

    expect(screen.queryByTestId('code_changes')).not.toBeInTheDocument()
    expect(screen.queryByTestId('upgrade')).not.toBeInTheDocument()
    expect(screen.queryByTestId('configuration_changes')).toBeInTheDocument()
  })

  it('should render configuration_changes badge in bigSets recommendation', () => {
    ;(dbAnalysisSelector as jest.Mock).mockImplementation(() => ({
      ...mockdbAnalysisSelector,
      data: {
        recommendations: [{ name: 'bigSets' }],
      },
    }))

    render(<Recommendations />)

    expect(screen.queryByTestId('code_changes')).not.toBeInTheDocument()
    expect(screen.queryByTestId('upgrade')).not.toBeInTheDocument()
    expect(screen.queryByTestId('configuration_changes')).toBeInTheDocument()
  })

  it('should render code_changes badge in bigAmountOfConnectedClients recommendation', () => {
    ;(dbAnalysisSelector as jest.Mock).mockImplementation(() => ({
      ...mockdbAnalysisSelector,
      data: {
        recommendations: [{ name: 'bigAmountOfConnectedClients' }],
      },
    }))

    render(<Recommendations />)

    expect(screen.queryByTestId('code_changes')).toBeInTheDocument()
    expect(screen.queryByTestId('upgrade')).not.toBeInTheDocument()
    expect(
      screen.queryByTestId('configuration_changes'),
    ).not.toBeInTheDocument()
  })

  it('should render configuration_changes badge in setPassword recommendation', () => {
    ;(dbAnalysisSelector as jest.Mock).mockImplementation(() => ({
      ...mockdbAnalysisSelector,
      data: {
        recommendations: [{ name: 'setPassword' }],
      },
    }))

    render(<Recommendations />)

    expect(screen.queryByTestId('code_changes')).not.toBeInTheDocument()
    expect(screen.queryByTestId('upgrade')).not.toBeInTheDocument()
    expect(screen.queryByTestId('configuration_changes')).toBeInTheDocument()
  })

  it('should render upgrade badge in redisSearch recommendation', () => {
    ;(dbAnalysisSelector as jest.Mock).mockImplementation(() => ({
      ...mockdbAnalysisSelector,
      data: {
        recommendations: [{ name: 'redisSearch' }],
      },
    }))

    render(<Recommendations />)

    expect(screen.queryByTestId('code_changes')).not.toBeInTheDocument()
    expect(screen.queryByTestId('upgrade')).toBeInTheDocument()
    expect(
      screen.queryByTestId('configuration_changes'),
    ).not.toBeInTheDocument()
  })

  it('should render upgrade badge in redisVersion recommendation', () => {
    ;(dbAnalysisSelector as jest.Mock).mockImplementation(() => ({
      ...mockdbAnalysisSelector,
      data: {
        recommendations: [{ name: 'redisVersion' }],
      },
    }))

    render(<Recommendations />)

    expect(screen.queryByTestId('code_changes')).not.toBeInTheDocument()
    expect(screen.queryByTestId('upgrade')).toBeInTheDocument()
    expect(
      screen.queryByTestId('configuration_changes'),
    ).not.toBeInTheDocument()
  })

  it('should render upgrade badge in searchIndexes recommendation', () => {
    ;(dbAnalysisSelector as jest.Mock).mockImplementation(() => ({
      ...mockdbAnalysisSelector,
      data: {
        recommendations: [{ name: 'searchIndexes' }],
      },
    }))

    render(<Recommendations />)

    expect(screen.queryByTestId('code_changes')).not.toBeInTheDocument()
    expect(screen.queryByTestId('upgrade')).toBeInTheDocument()
    expect(
      screen.queryByTestId('configuration_changes'),
    ).not.toBeInTheDocument()
  })

  it('should collapse/expand and sent proper telemetry event', async () => {
    ;(dbAnalysisSelector as jest.Mock).mockImplementation(() => ({
      ...mockdbAnalysisSelector,
      data: {
        recommendations: [{ name: 'luaScript' }],
      },
    }))

    const sendEventTelemetryMock = jest.fn()

    ;(sendEventTelemetry as jest.Mock).mockImplementation(
      () => sendEventTelemetryMock,
    )

    render(<Recommendations />)
    let element = screen.queryByTestId('luaScript-accordion')
    expect(element).toBeInTheDocument()
    const toggle = screen.getByLabelText('Collapse Section')
    const body = screen.getByTestId('ri-accordion-body-luaScript')
    expect(body).toBeVisible()
    await userEvent.click(toggle)

    expect(body).not.toBeVisible()
    // expect(element?.querySelector('[data-state="open"]')).not.toBeTruthy()
    expect(sendEventTelemetry).toHaveBeenCalledWith({
      event: TelemetryEvent.DATABASE_ANALYSIS_TIPS_COLLAPSED,
      eventData: {
        databaseId: INSTANCE_ID_MOCK,
        recommendation: 'luaScript',
        provider: 'REDIS_CLOUD',
      },
    })
    ;(sendEventTelemetry as jest.Mock).mockRestore()

    await userEvent.click(toggle)
    expect(body).toBeVisible()
    expect(sendEventTelemetry).toHaveBeenCalledWith({
      event: TelemetryEvent.DATABASE_ANALYSIS_TIPS_EXPANDED,
      eventData: {
        databaseId: INSTANCE_ID_MOCK,
        recommendation: 'luaScript',
        provider: 'REDIS_CLOUD',
      },
    })
    ;(sendEventTelemetry as jest.Mock).mockRestore()
  })

  it('should not render badges legend', () => {
    ;(dbAnalysisSelector as jest.Mock).mockImplementation(() => ({
      ...mockdbAnalysisSelector,
      data: {
        recommendations: [],
      },
    }))

    render(<Recommendations />)

    expect(screen.queryByTestId('badges-legend')).not.toBeInTheDocument()
  })

  it('should render badges legend', () => {
    ;(dbAnalysisSelector as jest.Mock).mockImplementation(() => ({
      ...mockdbAnalysisSelector,
      data: {
        recommendations: [{ name: 'luaScript' }],
      },
    }))

    render(<Recommendations />)

    expect(screen.queryByTestId('badges-legend')).toBeInTheDocument()
  })

  it('should render redis-stack link', () => {
    ;(dbAnalysisSelector as jest.Mock).mockImplementation(() => ({
      ...mockdbAnalysisSelector,
      data: {
        recommendations: [{ name: 'bigSets' }],
      },
    }))

    render(<Recommendations />)

    expect(screen.queryByTestId('bigSets-redis-stack-link')).toBeInTheDocument()
    expect(screen.queryByTestId('bigSets-redis-stack-link')).toHaveAttribute(
      'href',
      'https://redis.io/docs/latest/operate/oss_and_stack/install/install-stack/',
    )
  })

  it('should render go tutorial button', () => {
    ;(dbAnalysisSelector as jest.Mock).mockImplementation(() => ({
      ...mockdbAnalysisSelector,
      data: {
        recommendations: [{ name: 'bigHashes' }],
      },
    }))

    render(<Recommendations />)

    expect(screen.getByTestId('bigHashes-to-tutorial-btn')).toBeInTheDocument()
  })

  it('should call proper telemetry after click go tutorial button', () => {
    const sendEventTelemetryMock = jest.fn()
    ;(sendEventTelemetry as jest.Mock).mockImplementation(
      () => sendEventTelemetryMock,
    )
    ;(dbAnalysisSelector as jest.Mock).mockImplementation(() => ({
      ...mockdbAnalysisSelector,
      data: {
        recommendations: [{ name: 'bigHashes' }],
      },
    }))

    render(<Recommendations />)

    expect(screen.getByTestId('bigHashes-to-tutorial-btn')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('bigHashes-to-tutorial-btn'))

    expect(sendEventTelemetry).toHaveBeenCalledWith({
      event: TelemetryEvent.DATABASE_TIPS_TUTORIAL_CLICKED,
      eventData: {
        databaseId: INSTANCE_ID_MOCK,
        recommendation: 'shardHashes',
        provider: 'REDIS_CLOUD',
      },
    })
    ;(sendEventTelemetry as jest.Mock).mockRestore()
  })

  it('should call proper history push after click go tutorial button', () => {
    const pushMock = jest.fn()
    const path = 'path'
    reactRouterDom.useHistory = jest.fn().mockReturnValue({ push: pushMock })
    ;(findTutorialPath as jest.Mock).mockImplementation(() => path)
    ;(dbAnalysisSelector as jest.Mock).mockImplementation(() => ({
      ...mockdbAnalysisSelector,
      data: {
        recommendations: [{ name: 'bigHashes' }],
      },
    }))

    render(<Recommendations />)

    expect(screen.getByTestId('bigHashes-to-tutorial-btn')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('bigHashes-to-tutorial-btn'))

    expect(pushMock).toHaveBeenCalledWith({
      search: 'path=tutorials/path',
    })
    pushMock.mockRestore()
  })
})
