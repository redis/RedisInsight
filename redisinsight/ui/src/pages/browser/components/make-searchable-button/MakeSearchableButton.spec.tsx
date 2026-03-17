import React from 'react'
import { faker } from '@faker-js/faker'
import { render, screen, userEvent, cleanup } from 'uiSrc/utils/test-utils'
import { KeyTypes } from 'uiSrc/constants'
import { TelemetryEvent } from 'uiSrc/telemetry'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { RedisearchIndexKeyType } from 'uiSrc/pages/browser/components/create-redisearch-index/constants'
import { SearchBrowserSource } from 'uiSrc/pages/vector-search/telemetry.constants'

import { MakeSearchableButton } from './MakeSearchableButton'
import { MakeSearchableButtonProps } from './MakeSearchableButton.types'

const mockSendEventTelemetry = jest.fn()
jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: (...args: unknown[]) => mockSendEventTelemetry(...args),
}))

const mockUseSelector = jest.fn()
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: (...args: unknown[]) => mockUseSelector(...args),
}))

const mockInstanceId = faker.string.uuid()

const defaultProps: MakeSearchableButtonProps = {
  keyName: { data: [116, 101, 115, 116], type: 'Buffer' },
  keyNameString: 'product:123',
  keyType: KeyTypes.Hash,
}

const renderComponent = (
  propsOverride?: Partial<MakeSearchableButtonProps>,
) => {
  const props = { ...defaultProps, ...propsOverride }
  return render(<MakeSearchableButton {...props} />)
}

describe('MakeSearchableButton', () => {
  beforeEach(() => {
    cleanup()
    mockUseSelector.mockImplementation((selector: any) => {
      if (selector === connectedInstanceSelector) {
        return { id: mockInstanceId }
      }
      return {}
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should render the button', () => {
    renderComponent()

    const makeSearchableBtn = screen.getByTestId('make-searchable-btn')

    expect(makeSearchableBtn).toBeInTheDocument()
    expect(makeSearchableBtn).toHaveTextContent('Make searchable')
  })

  it('should send SEARCH_MAKE_SEARCHABLE_CLICKED telemetry on click', async () => {
    renderComponent()

    const makeSearchableBtn = screen.getByTestId('make-searchable-btn')
    await userEvent.click(makeSearchableBtn)

    expect(mockSendEventTelemetry).toHaveBeenCalledWith({
      event: TelemetryEvent.SEARCH_MAKE_SEARCHABLE_CLICKED,
      eventData: {
        databaseId: mockInstanceId,
        keyType: RedisearchIndexKeyType.HASH,
        source: SearchBrowserSource.KeyDetails,
      },
    })
  })

  it('should send mapped keyType for JSON keys', async () => {
    renderComponent({ keyType: KeyTypes.ReJSON })

    const makeSearchableBtn = screen.getByTestId('make-searchable-btn')
    await userEvent.click(makeSearchableBtn)

    expect(mockSendEventTelemetry).toHaveBeenCalledWith({
      event: TelemetryEvent.SEARCH_MAKE_SEARCHABLE_CLICKED,
      eventData: {
        databaseId: mockInstanceId,
        keyType: RedisearchIndexKeyType.JSON,
        source: SearchBrowserSource.KeyDetails,
      },
    })
  })
})
