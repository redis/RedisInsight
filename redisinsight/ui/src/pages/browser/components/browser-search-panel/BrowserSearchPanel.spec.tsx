import React from 'react'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'
import { isRedisearchAvailable, getRedisearchVersion } from 'uiSrc/utils'
import { isRedisVersionSupported } from 'uiSrc/utils/comparisons/compareVersions'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import BrowserSearchPanel, { Props } from './BrowserSearchPanel'

jest.mock('uiSrc/utils', () => ({
  ...jest.requireActual('uiSrc/utils'),
  isRedisearchAvailable: jest.fn(),
  getRedisearchVersion: jest.fn(),
}))

jest.mock('uiSrc/utils/comparisons/compareVersions', () => ({
  ...jest.requireActual('uiSrc/utils/comparisons/compareVersions'),
  isRedisVersionSupported: jest.fn(),
}))

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

const mockIsRedisearchAvailable = isRedisearchAvailable as jest.Mock
const mockGetRedisearchVersion = getRedisearchVersion as jest.Mock
const mockIsRedisVersionSupported = isRedisVersionSupported as jest.Mock

const mockedProps: Props = {
  handleCreateIndexPanel: jest.fn,
}

describe('BrowserSearchPanel', () => {
  beforeEach(() => {
    mockIsRedisearchAvailable.mockReturnValue(true)
    mockGetRedisearchVersion.mockReturnValue('2.6.0')
    mockIsRedisVersionSupported.mockReturnValue(true)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should render', () => {
    expect(render(<BrowserSearchPanel {...mockedProps} />)).toBeTruthy()
  })

  it('should render search properly', () => {
    render(<BrowserSearchPanel {...mockedProps} />)
    const searchInput = screen.queryByTestId('search-key')
    expect(searchInput).toBeInTheDocument()
  })

  it('should show version required modal when RediSearch is present but < 2.0', () => {
    mockIsRedisearchAvailable.mockReturnValue(true)
    mockGetRedisearchVersion.mockReturnValue('1.6.14')
    mockIsRedisVersionSupported.mockReturnValue(false)

    render(<BrowserSearchPanel {...mockedProps} />)

    fireEvent.click(screen.getByTestId('search-mode-redisearch-btn'))

    expect(
      screen.getByTestId('redisearch-version-required'),
    ).toBeInTheDocument()
  })

  it('should send telemetry with reason module_not_loaded when RediSearch is missing', () => {
    mockIsRedisearchAvailable.mockReturnValue(false)

    render(<BrowserSearchPanel {...mockedProps} />)
    fireEvent.click(screen.getByTestId('search-mode-redisearch-btn'))

    expect(sendEventTelemetry).toHaveBeenCalledWith({
      event: TelemetryEvent.SEARCH_MODE_CHANGE_FAILED,
      eventData: expect.objectContaining({ reason: 'module_not_loaded' }),
    })
  })

  it('should send telemetry with reason version_not_supported when RediSearch < 2.0', () => {
    mockIsRedisearchAvailable.mockReturnValue(true)
    mockGetRedisearchVersion.mockReturnValue('1.6.14')
    mockIsRedisVersionSupported.mockReturnValue(false)

    render(<BrowserSearchPanel {...mockedProps} />)
    fireEvent.click(screen.getByTestId('search-mode-redisearch-btn'))

    expect(sendEventTelemetry).toHaveBeenCalledWith({
      event: TelemetryEvent.SEARCH_MODE_CHANGE_FAILED,
      eventData: expect.objectContaining({ reason: 'version_not_supported' }),
    })
  })
})
