import React from 'react'
import { cloneDeep } from 'lodash'
import { instance, mock } from 'ts-mockito'
import { MOCK_ANALYSIS_REPORT_DATA } from 'uiSrc/mocks/data/analysis'
import { INSTANCE_ID_MOCK } from 'uiSrc/mocks/handlers/analytics/clusterDetailsHandlers'
import {
  render,
  screen,
  mockedStore,
  cleanup,
  fireEvent,
} from 'uiSrc/utils/test-utils'
import { DatabaseAnalysisViewTab } from 'uiSrc/slices/interfaces/analytics'
import { setDatabaseAnalysisViewTab } from 'uiSrc/slices/analytics/dbAnalysis'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'

import { MOCK_RECOMMENDATIONS } from 'uiSrc/constants/mocks/mock-recommendations'
import { recommendationsSelector } from 'uiSrc/slices/recommendations/recommendations'
import { ShortDatabaseAnalysis } from 'apiSrc/modules/database-analysis/models'
import DatabaseAnalysisTabs, { Props } from './DatabaseAnalysisTabs'

const mockRecommendationsSelector = jest.requireActual(
  'uiSrc/slices/recommendations/recommendations',
)

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
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

const mockedProps = mock<Props>()

const mockReports: ShortDatabaseAnalysis[] = [
  {
    id: MOCK_ANALYSIS_REPORT_DATA.id,
    createdAt: '2022-09-23T05:30:23.000Z' as any,
  },
]

const recommendationsContent = MOCK_RECOMMENDATIONS

let store: typeof mockedStore

jest.mock('uiSrc/slices/instances/instances', () => ({
  ...jest.requireActual('uiSrc/slices/instances/instances'),
  connectedInstanceSelector: jest.fn().mockReturnValue({
    id: 'instanceId',
    provider: 'REDIS_CLOUD',
  }),
}))

beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
  ;(recommendationsSelector as jest.Mock).mockImplementation(() => ({
    ...mockRecommendationsSelector,
    content: recommendationsContent,
  }))
})

describe('DatabaseAnalysisTabs', () => {
  it('should render', () => {
    expect(
      render(<DatabaseAnalysisTabs {...instance(mockedProps)} />),
    ).toBeTruthy()
  })

  it('should call setDatabaseAnalysisViewTab', () => {
    render(
      <DatabaseAnalysisTabs {...instance(mockedProps)} reports={mockReports} />,
    )

    fireEvent.mouseDown(screen.getByText('Tips'))

    const expectedActions = [
      setDatabaseAnalysisViewTab(DatabaseAnalysisViewTab.Recommendations),
    ]
    expect(store.getActions()).toEqual(expectedActions)
  })

  it('should render encrypt message', () => {
    const mockData: any = {
      totalKeys: null,
    }
    render(
      <DatabaseAnalysisTabs
        {...instance(mockedProps)}
        reports={mockReports}
        data={mockData}
      />,
    )

    expect(screen.queryByTestId('empty-encrypt-wrapper')).toBeTruthy()
  })

  describe('recommendations count', () => {
    it('should render "Tips (3)" in the tab name', () => {
      const mockData: any = {
        recommendations: [
          { name: 'luaScript' },
          { name: 'luaScript' },
          { name: 'luaScript' },
        ],
      }

      render(
        <DatabaseAnalysisTabs
          {...instance(mockedProps)}
          reports={mockReports}
          data={mockData}
        />,
      )

      expect(screen.getByText('Tips (3)')).toBeVisible()
    })

    it('should render "Tips (1)" in the tab name', () => {
      const mockData: any = {
        recommendations: [{ name: 'luaScript' }],
      }
      render(
        <DatabaseAnalysisTabs
          {...instance(mockedProps)}
          reports={mockReports}
          data={mockData}
        />,
      )

      expect(screen.getByText('Tips (1)')).toBeVisible()
    })

    it('should render "Tips" in the tab name', () => {
      const mockData: any = {
        recommendations: [],
      }
      render(
        <DatabaseAnalysisTabs
          {...instance(mockedProps)}
          reports={mockReports}
          data={mockData}
        />,
      )

      expect(screen.getByText(/^Tips$/)).toBeVisible()
    })
  })

  describe('Telemetry', () => {
    it.skip('should call DATABASE_ANALYSIS_DATA_SUMMARY_CLICKED telemetry event with 0 count', () => {
      const sendEventTelemetryMock = jest.fn()
      ;(sendEventTelemetry as jest.Mock).mockImplementation(
        () => sendEventTelemetryMock,
      )

      const mockData: any = {
        recommendations: [],
      }
      render(
        <DatabaseAnalysisTabs
          {...instance(mockedProps)}
          reports={mockReports}
          data={mockData}
        />,
      )

      fireEvent.mouseDown(screen.getByText('Data Summary'))

      expect(sendEventTelemetry).toBeCalledWith({
        event: TelemetryEvent.DATABASE_ANALYSIS_DATA_SUMMARY_CLICKED,
        eventData: {
          databaseId: INSTANCE_ID_MOCK,
          provider: 'REDIS_CLOUD',
        },
      })
      ;(sendEventTelemetry as jest.Mock).mockRestore()
    })

    it('should call DATABASE_ANALYSIS_RECOMMENDATIONS_CLICKED telemetry event with 0 count', () => {
      const sendEventTelemetryMock = jest.fn()
      ;(sendEventTelemetry as jest.Mock).mockImplementation(
        () => sendEventTelemetryMock,
      )

      const mockData: any = {
        recommendations: [],
      }
      render(
        <DatabaseAnalysisTabs
          {...instance(mockedProps)}
          reports={mockReports}
          data={mockData}
        />,
      )

      fireEvent.mouseDown(screen.getByText('Tips'))

      expect(sendEventTelemetry).toBeCalledWith({
        event: TelemetryEvent.DATABASE_ANALYSIS_TIPS_CLICKED,
        eventData: {
          databaseId: INSTANCE_ID_MOCK,
          tipsCount: 0,
          list: [],
          provider: 'REDIS_CLOUD',
        },
      })
      ;(sendEventTelemetry as jest.Mock).mockRestore()
    })

    it('should call DATABASE_ANALYSIS_RECOMMENDATIONS_CLICKED telemetry event with 2 count', () => {
      const sendEventTelemetryMock = jest.fn()
      ;(sendEventTelemetry as jest.Mock).mockImplementation(
        () => sendEventTelemetryMock,
      )

      const mockData: any = {
        recommendations: [{ name: 'luaScript' }, { name: 'bigHashes' }],
      }
      render(
        <DatabaseAnalysisTabs
          {...instance(mockedProps)}
          reports={mockReports}
          data={mockData}
        />,
      )

      fireEvent.mouseDown(screen.getByText('Tips (2)'))

      expect(sendEventTelemetry).toBeCalledWith({
        event: TelemetryEvent.DATABASE_ANALYSIS_TIPS_CLICKED,
        eventData: {
          databaseId: INSTANCE_ID_MOCK,
          tipsCount: 2,
          list: ['luaScript', 'shardHashes'],
          provider: 'REDIS_CLOUD',
        },
      })
      ;(sendEventTelemetry as jest.Mock).mockRestore()
    })
  })
})
