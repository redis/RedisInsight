import React from 'react'
import { MOCK_ANALYSIS_REPORT_DATA } from 'uiSrc/mocks/data/analysis'
import { INSTANCE_ID_MOCK } from 'uiSrc/mocks/handlers/analytics/clusterDetailsHandlers'
import {
  dbAnalysisSelector,
  dbAnalysisReportsSelector,
} from 'uiSrc/slices/analytics/dbAnalysis'
import { SectionName } from 'uiSrc/pages/database-analysis'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { formatBytes, getGroupTypeDisplay } from 'uiSrc/utils'
import { numberWithSpaces } from 'uiSrc/utils/numbers'
import { fireEvent, userEvent, render, screen, within } from 'uiSrc/utils/test-utils'

import AnalysisDataView from './AnalysisDataView'

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

const mockdbAnalysisSelector = jest.requireActual(
  'uiSrc/slices/analytics/dbAnalysis',
)
const mockdbAnalysisReportsSelector = jest.requireActual(
  'uiSrc/slices/analytics/dbAnalysis',
)

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
  dbAnalysisReportsSelector: jest.fn().mockReturnValue({
    loading: false,
    error: '',
    data: [],
    selectedAnalysis: null,
  }),
}))

jest.mock('uiSrc/slices/instances/instances', () => ({
  ...jest.requireActual('uiSrc/slices/instances/instances'),
  connectedInstanceSelector: jest.fn().mockReturnValue({
    id: 'instanceId',
    provider: 'REDIS_CLOUD',
  }),
}))

const mockReports = [
  {
    id: MOCK_ANALYSIS_REPORT_DATA.id,
    createdAt: '2022-09-23T05:30:23.000Z',
  },
  {
    id: 'id_2',
    createdAt: '2022-09-23T05:15:19.000Z',
  },
]

const summaryContainerId = 'summary-per-data'
const analyticsTTLContainerId = 'analysis-ttl'
const topNameSpacesContainerId = 'top-namespaces'
const extrapolateResultsId = 'extrapolate-results'

describe('AnalysisDataView', () => {
  it('should render', () => {
    ;(dbAnalysisSelector as jest.Mock).mockImplementation(() => ({
      ...mockdbAnalysisSelector,
    }))

    expect(render(<AnalysisDataView />)).toBeTruthy()
  })

  it('should render only table when loading="true"', () => {
    ;(dbAnalysisSelector as jest.Mock).mockImplementation(() => ({
      ...mockdbAnalysisSelector,
      loading: true,
    }))

    render(<AnalysisDataView />)

    expect(
      screen.queryByTestId('empty-analysis-no-reports'),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByTestId('empty-analysis-no-keys'),
    ).not.toBeInTheDocument()
  })

  it('should render empty-data-message-no-keys when total=0 ', () => {
    ;(dbAnalysisSelector as jest.Mock).mockImplementation(() => ({
      ...mockdbAnalysisSelector,
      data: { totalKeys: { total: 0 } },
    }))
    ;(dbAnalysisReportsSelector as jest.Mock).mockImplementation(() => ({
      ...mockdbAnalysisReportsSelector,
      data: mockReports,
    }))

    render(<AnalysisDataView />)

    expect(
      screen.queryByTestId('empty-analysis-no-reports'),
    ).not.toBeInTheDocument()
    expect(screen.queryByTestId('empty-analysis-no-keys')).toBeInTheDocument()
  })
})

/**
 * AnalysisDataView tests
 *
 * @group component
 */
describe('AnalysisDataView', () => {
  it('should render properly extrapolated data for summary per data', () => {
    const mockedData = {
      ...MOCK_ANALYSIS_REPORT_DATA,
      progress: {
        total: 80,
        scanned: 40,
        processed: 40,
      },
    }
    ;(dbAnalysisSelector as jest.Mock).mockImplementation(() => ({
      ...mockdbAnalysisSelector,
      data: mockedData,
    }))
    ;(dbAnalysisReportsSelector as jest.Mock).mockImplementation(() => ({
      ...mockdbAnalysisReportsSelector,
      data: mockReports,
    }))

    render(<AnalysisDataView />)

    expect(screen.getByTestId('total-memory-value')).toHaveTextContent(
      `~${formatBytes(mockedData.totalMemory.total * 2, 3)}`,
    )
    expect(screen.getByTestId('total-keys-value')).toHaveTextContent(
      `~${numberWithSpaces(mockedData.totalKeys.total * 2)}`,
    )

    const arcItemMemory = mockedData.totalMemory.types[0]
    const donutMemory = screen.getByTestId('donut-memory')
    const arcMemory = (wrapperEl: HTMLElement) =>
      within(wrapperEl).getByTestId(
        `arc-${getGroupTypeDisplay(arcItemMemory.type)}-${arcItemMemory.total}`,
      )

    fireEvent.mouseEnter(arcMemory(donutMemory))
    expect(
      within(donutMemory).getByTestId('chart-value-tooltip'),
    ).toHaveTextContent(`~${formatBytes(arcItemMemory.total * 2, 3)}`)
    fireEvent.mouseLeave(donutMemory)

    const arcItemkeys = mockedData.totalKeys.types[0]
    const donutKeys = screen.getByTestId('donut-keys')
    const arcKeys = (wrapperEl: HTMLElement) =>
      within(wrapperEl).getByTestId(
        `arc-${getGroupTypeDisplay(arcItemkeys.type)}-${arcItemkeys.total}`,
      )
    fireEvent.mouseEnter(arcKeys(donutKeys))
    expect(
      within(donutKeys).getByTestId('chart-value-tooltip'),
    ).toHaveTextContent(`~${numberWithSpaces(arcItemkeys.total * 2)}`)
  })

  it('should render properly not extrapolated data for summary per data after switching off', async () => {
    const mockedData = {
      ...MOCK_ANALYSIS_REPORT_DATA,
      progress: {
        total: 80,
        scanned: 40,
        processed: 40,
      },
    }
    ;(dbAnalysisSelector as jest.Mock).mockImplementation(() => ({
      ...mockdbAnalysisSelector,
      data: mockedData,
    }))
    ;(dbAnalysisReportsSelector as jest.Mock).mockImplementation(() => ({
      ...mockdbAnalysisReportsSelector,
      data: mockReports,
    }))
    render(<AnalysisDataView />)

    await userEvent.click(
      within(screen.getByTestId(summaryContainerId)).getByTestId(
        extrapolateResultsId,
      ),
    )

    expect(screen.getByTestId('total-memory-value')).toHaveTextContent(
      `${formatBytes(mockedData.totalMemory.total, 3)}`,
    )
    expect(screen.getByTestId('total-keys-value')).toHaveTextContent(
      `${numberWithSpaces(mockedData.totalKeys.total)}`,
    )

    const arcItemMemory = mockedData.totalMemory.types[0]
    const donutMemory = screen.getByTestId('donut-memory')
    const arcMemory = (wrapperEl: HTMLElement) =>
      within(wrapperEl).getByTestId(
        `arc-${getGroupTypeDisplay(arcItemMemory.type)}-${arcItemMemory.total}`,
      )

    fireEvent.mouseEnter(arcMemory(donutMemory))
    expect(
      within(donutMemory).getByTestId('chart-value-tooltip'),
    ).toHaveTextContent(`${formatBytes(arcItemMemory.total, 3)}`)
    fireEvent.mouseLeave(donutMemory)

    const arcItemkeys = mockedData.totalKeys.types[0]
    const donutKeys = screen.getByTestId('donut-keys')
    const arcKeys = (wrapperEl: HTMLElement) =>
      within(wrapperEl).getByTestId(
        `arc-${getGroupTypeDisplay(arcItemkeys.type)}-${arcItemkeys.total}`,
      )
    fireEvent.mouseEnter(arcKeys(donutKeys))
    expect(
      within(donutKeys).getByTestId('chart-value-tooltip'),
    ).toHaveTextContent(`${numberWithSpaces(arcItemkeys.total)}`)
  })

  it('should render properly extrapolated data for ttl chart', () => {
    const mockedData = {
      ...MOCK_ANALYSIS_REPORT_DATA,
      progress: {
        total: 80,
        scanned: 40,
        processed: 40,
      },
    }
    ;(dbAnalysisSelector as jest.Mock).mockImplementation(() => ({
      ...mockdbAnalysisSelector,
      data: mockedData,
    }))
    ;(dbAnalysisReportsSelector as jest.Mock).mockImplementation(() => ({
      ...mockdbAnalysisReportsSelector,
      data: mockReports,
    }))
    render(<AnalysisDataView />)

    const expirationGroup = mockedData.expirationGroups[1]

    fireEvent.mouseEnter(
      screen.getByTestId(
        `bar-${expirationGroup.threshold}-${expirationGroup.total * 2}`,
      ),
    )
    expect(screen.getByTestId('bar-tooltip')).toHaveTextContent(
      `~${formatBytes(expirationGroup.total * 2, 3)}`,
    )
  })

  it('should render properly not extrapolated data for ttl chart after switching off', async () => {
    const mockedData = {
      ...MOCK_ANALYSIS_REPORT_DATA,
      progress: {
        total: 80,
        scanned: 40,
        processed: 40,
      },
    }
    ;(dbAnalysisSelector as jest.Mock).mockImplementation(() => ({
      ...mockdbAnalysisSelector,
      data: mockedData,
    }))
    ;(dbAnalysisReportsSelector as jest.Mock).mockImplementation(() => ({
      ...mockdbAnalysisReportsSelector,
      data: mockReports,
    }))
    render(<AnalysisDataView />)
    await userEvent.click(
      within(screen.getByTestId(analyticsTTLContainerId)).getByTestId(
        extrapolateResultsId,
      ),
    )

    const expirationGroup = mockedData.expirationGroups[1]

    fireEvent.mouseEnter(
      screen.getByTestId(
        `bar-${expirationGroup.threshold}-${expirationGroup.total}`,
      ),
    )
    expect(screen.getByTestId('bar-tooltip')).toHaveTextContent(
      `${formatBytes(expirationGroup.total, 3)}`,
    )
  })

  it('should render properly extrapolated data for top namespaces table', () => {
    const mockedData = {
      ...MOCK_ANALYSIS_REPORT_DATA,
      progress: {
        total: 80,
        scanned: 40,
        processed: 40,
      },
    }
    ;(dbAnalysisSelector as jest.Mock).mockImplementation(() => ({
      ...mockdbAnalysisSelector,
      data: mockedData,
    }))
    ;(dbAnalysisReportsSelector as jest.Mock).mockImplementation(() => ({
      ...mockdbAnalysisReportsSelector,
      data: mockReports,
    }))
    render(<AnalysisDataView />)

    const nspTopKeyItem = mockedData.topKeysNsp[0]
    expect(
      screen.getByTestId(`nsp-usedMemory-value=${nspTopKeyItem.memory}`),
    ).toHaveTextContent(`~${formatBytes(nspTopKeyItem.memory * 2, 3, true)[0]}`)

    expect(
      screen.getAllByTestId(`keys-value-${nspTopKeyItem.keys}`)[0],
    ).toHaveTextContent(`~${numberWithSpaces(nspTopKeyItem.keys * 2)}`)
  })

  it('should render properly not extrapolated data for top namespaces table after switching off', async () => {
    const mockedData = {
      ...MOCK_ANALYSIS_REPORT_DATA,
      progress: {
        total: 80,
        scanned: 40,
        processed: 40,
      },
    }
    ;(dbAnalysisSelector as jest.Mock).mockImplementation(() => ({
      ...mockdbAnalysisSelector,
      data: mockedData,
    }))
    ;(dbAnalysisReportsSelector as jest.Mock).mockImplementation(() => ({
      ...mockdbAnalysisReportsSelector,
      data: mockReports,
    }))
    render(<AnalysisDataView />)
    await userEvent.click(
      within(screen.getByTestId(topNameSpacesContainerId)).getByTestId(
        extrapolateResultsId,
      ),
    )

    const nspTopKeyItem = mockedData.topKeysNsp[0]
    expect(
      screen.getByTestId(`nsp-usedMemory-value=${nspTopKeyItem.memory}`),
    ).toHaveTextContent(`${formatBytes(nspTopKeyItem.memory, 3, true)[0]}`)

    expect(
      screen.getAllByTestId(`keys-value-${nspTopKeyItem.keys}`)[0],
    ).toHaveTextContent(`${numberWithSpaces(nspTopKeyItem.keys)}`)
  })

  it('should not render extrapolation switcher and extrapolated data for full scanned db', () => {
    const mockedData = {
      ...MOCK_ANALYSIS_REPORT_DATA,
      progress: {
        total: 80,
        scanned: 10000,
        processed: 80,
      },
    }
    ;(dbAnalysisSelector as jest.Mock).mockImplementation(() => ({
      ...mockdbAnalysisSelector,
      data: mockedData,
    }))
    ;(dbAnalysisReportsSelector as jest.Mock).mockImplementation(() => ({
      ...mockdbAnalysisReportsSelector,
      data: mockReports,
    }))
    render(<AnalysisDataView />)

    expect(screen.queryByTestId(extrapolateResultsId)).not.toBeInTheDocument()

    expect(screen.getByTestId('total-memory-value')).toHaveTextContent(
      `${formatBytes(mockedData.totalMemory.total, 3)}`,
    )
    expect(screen.getByTestId('total-keys-value')).toHaveTextContent(
      `${numberWithSpaces(mockedData.totalKeys.total)}`,
    )

    const expirationGroup = mockedData.expirationGroups[1]

    fireEvent.mouseEnter(
      screen.getByTestId(
        `bar-${expirationGroup.threshold}-${expirationGroup.total}`,
      ),
    )
    expect(screen.getByTestId('bar-tooltip')).toHaveTextContent(
      `${formatBytes(expirationGroup.total, 3)}`,
    )

    const nspTopKeyItem = mockedData.topKeysNsp[0]
    expect(
      screen.getByTestId(`nsp-usedMemory-value=${nspTopKeyItem.memory}`),
    ).toHaveTextContent(`${formatBytes(nspTopKeyItem.memory, 3, true)[0]}`)

    expect(
      screen.getAllByTestId(`keys-value-${nspTopKeyItem.keys}`)[0],
    ).toHaveTextContent(`${numberWithSpaces(nspTopKeyItem.keys)}`)
  })

  it('should call proper telemetry events after click extrapolation', () => {
    const mockedData = {
      ...MOCK_ANALYSIS_REPORT_DATA,
      progress: {
        total: 80,
        scanned: 10000,
        processed: 40,
      },
    }
    ;(dbAnalysisSelector as jest.Mock).mockImplementation(() => ({
      ...mockdbAnalysisSelector,
      data: mockedData,
    }))
    ;(dbAnalysisReportsSelector as jest.Mock).mockImplementation(() => ({
      ...mockdbAnalysisReportsSelector,
      data: mockReports,
    }))
    const sendEventTelemetryMock = jest.fn()
    sendEventTelemetry.mockImplementation(() => sendEventTelemetryMock)

    render(<AnalysisDataView />)

    const clickAndCheckTelemetry = async (
      el: HTMLInputElement,
      section: SectionName,
    ) => {
      await userEvent.click(el)
      expect(sendEventTelemetry).toBeCalledWith({
        event: TelemetryEvent.DATABASE_ANALYSIS_EXTRAPOLATION_CHANGED,
        eventData: {
          databaseId: INSTANCE_ID_MOCK,
          from: !el.checked,
          to: el.checked,
          section,
          provider: 'REDIS_CLOUD',
        },
      })
      sendEventTelemetry.mockRestore()
    }

    ;[
      { id: summaryContainerId, section: SectionName.SUMMARY_PER_DATA },
      {
        id: analyticsTTLContainerId,
        section: SectionName.MEMORY_LIKELY_TO_BE_FREED,
      },
      { id: topNameSpacesContainerId, section: SectionName.TOP_NAMESPACES },
    ].forEach(({ id, section }) => {
      const extrapolateSwitch = within(screen.getByTestId(id)).getByTestId(
        extrapolateResultsId,
      )
      clickAndCheckTelemetry(extrapolateSwitch as HTMLInputElement, section)
      clickAndCheckTelemetry(extrapolateSwitch as HTMLInputElement, section)
    })
  })
})
