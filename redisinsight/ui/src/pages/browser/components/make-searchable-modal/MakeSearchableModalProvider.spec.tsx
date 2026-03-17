import React from 'react'
import { useSelector } from 'react-redux'
import { faker } from '@faker-js/faker'
import { render, screen, userEvent, cleanup } from 'uiSrc/utils/test-utils'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { RedisearchIndexKeyType } from 'uiSrc/pages/browser/components/create-redisearch-index/constants'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'

import {
  MakeSearchableModalProvider,
  useMakeSearchableModal,
} from './MakeSearchableModalProvider'

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

const mockInstanceId = faker.string.uuid()
const mockPush = jest.fn()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({ push: mockPush }),
}))

jest.mock('uiSrc/slices/instances/instances', () => ({
  ...jest.requireActual('uiSrc/slices/instances/instances'),
  connectedInstanceSelector: jest.fn(),
}))

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(),
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
    ;(useSelector as jest.Mock).mockImplementation((selector: any) => {
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

    await userEvent.click(screen.getByTestId('open-modal'))

    expect(screen.getByTestId('make-searchable-modal-body')).toBeInTheDocument()
  })

  it('should send SEARCH_MAKE_SEARCHABLE_CONFIRMED on confirm', async () => {
    renderComponent()

    await userEvent.click(screen.getByTestId('open-modal'))
    await userEvent.click(screen.getByTestId('make-searchable-modal-confirm'))

    expect(sendEventTelemetry).toHaveBeenCalledWith({
      event: TelemetryEvent.SEARCH_MAKE_SEARCHABLE_CONFIRMED,
      eventData: {
        databaseId: mockInstanceId,
        keyType: RedisearchIndexKeyType.HASH,
      },
    })
  })

  it('should send SEARCH_MAKE_SEARCHABLE_CANCELLED on cancel', async () => {
    renderComponent()

    await userEvent.click(screen.getByTestId('open-modal'))
    await userEvent.click(screen.getByTestId('make-searchable-modal-cancel'))

    expect(sendEventTelemetry).toHaveBeenCalledWith({
      event: TelemetryEvent.SEARCH_MAKE_SEARCHABLE_CANCELLED,
      eventData: { databaseId: mockInstanceId },
    })
  })

  it('should send SEARCH_MAKE_SEARCHABLE_CANCELLED on close button', async () => {
    renderComponent()

    await userEvent.click(screen.getByTestId('open-modal'))
    await userEvent.click(screen.getByTestId('make-searchable-modal-close'))

    expect(sendEventTelemetry).toHaveBeenCalledWith({
      event: TelemetryEvent.SEARCH_MAKE_SEARCHABLE_CANCELLED,
      eventData: { databaseId: mockInstanceId },
    })
  })
})
