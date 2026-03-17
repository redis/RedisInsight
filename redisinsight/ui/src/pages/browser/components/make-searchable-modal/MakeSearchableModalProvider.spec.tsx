import React from 'react'
import { faker } from '@faker-js/faker'
import { render, screen, userEvent, cleanup } from 'uiSrc/utils/test-utils'
import { TelemetryEvent } from 'uiSrc/telemetry'
import { RedisearchIndexKeyType } from 'uiSrc/pages/browser/components/create-redisearch-index/constants'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { SearchMakeSearchableSource } from 'uiSrc/pages/vector-search/telemetry.constants'

import {
  MakeSearchableModalProvider,
  useMakeSearchableModal,
} from './MakeSearchableModalProvider'

const mockSendEventTelemetry = jest.fn()
jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: (...args: unknown[]) => mockSendEventTelemetry(...args),
}))

const mockInstanceId = faker.string.uuid()
const mockPush = jest.fn()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({ push: mockPush }),
}))

const mockUseSelector = jest.fn()
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: (...args: unknown[]) => mockUseSelector(...args),
}))

const TestConsumer = () => {
  const { openMakeSearchableModal } = useMakeSearchableModal()

  return (
    <button
      data-testid="open-modal"
      onClick={() =>
        openMakeSearchableModal({
          prefix: 'product:',
          initialKey: { data: [116, 101, 115, 116], type: 'Buffer' },
          initialKeyType: RedisearchIndexKeyType.HASH,
          initialPrefix: 'product:',
          source: SearchMakeSearchableSource.KeyDetails,
        })
      }
    >
      Open
    </button>
  )
}

const renderComponent = () =>
  render(
    <MakeSearchableModalProvider>
      <TestConsumer />
    </MakeSearchableModalProvider>,
  )

describe('MakeSearchableModalProvider', () => {
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

  it('should open modal when openMakeSearchableModal is called', async () => {
    renderComponent()

    const openModalBtn = screen.getByTestId('open-modal')
    await userEvent.click(openModalBtn)

    const modalBody = screen.getByTestId('make-searchable-modal-body')
    expect(modalBody).toBeInTheDocument()
  })

  it('should send SEARCH_MAKE_SEARCHABLE_CONFIRMED on confirm', async () => {
    renderComponent()

    const openModalBtn = screen.getByTestId('open-modal')
    await userEvent.click(openModalBtn)

    const confirmBtn = screen.getByTestId('make-searchable-modal-confirm')
    await userEvent.click(confirmBtn)

    expect(mockSendEventTelemetry).toHaveBeenCalledWith({
      event: TelemetryEvent.SEARCH_MAKE_SEARCHABLE_CONFIRMED,
      eventData: {
        databaseId: mockInstanceId,
        keyType: RedisearchIndexKeyType.HASH,
        source: SearchMakeSearchableSource.KeyDetails,
      },
    })
  })

  it('should send SEARCH_MAKE_SEARCHABLE_CANCELLED on cancel', async () => {
    renderComponent()

    const openModalBtn = screen.getByTestId('open-modal')
    await userEvent.click(openModalBtn)

    const cancelBtn = screen.getByTestId('make-searchable-modal-cancel')
    await userEvent.click(cancelBtn)

    expect(mockSendEventTelemetry).toHaveBeenCalledWith({
      event: TelemetryEvent.SEARCH_MAKE_SEARCHABLE_CANCELLED,
      eventData: {
        databaseId: mockInstanceId,
        source: SearchMakeSearchableSource.KeyDetails,
      },
    })
  })

  it('should send SEARCH_MAKE_SEARCHABLE_CANCELLED on close button', async () => {
    renderComponent()

    const openModalBtn = screen.getByTestId('open-modal')
    await userEvent.click(openModalBtn)

    const closeBtn = screen.getByTestId('make-searchable-modal-close')
    await userEvent.click(closeBtn)

    expect(mockSendEventTelemetry).toHaveBeenCalledWith({
      event: TelemetryEvent.SEARCH_MAKE_SEARCHABLE_CANCELLED,
      eventData: {
        databaseId: mockInstanceId,
        source: SearchMakeSearchableSource.KeyDetails,
      },
    })
  })
})
