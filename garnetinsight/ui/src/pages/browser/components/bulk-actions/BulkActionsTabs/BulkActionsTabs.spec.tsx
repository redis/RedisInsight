import React from 'react'
import { mock } from 'ts-mockito'

import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'
import { BulkActionsType } from 'uiSrc/constants'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import BulkActionsTabs, { Props } from './BulkActionsTabs'

const mockedProps = {
  ...mock<Props>(),
}

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

jest.mock('uiSrc/slices/browser/bulkActions', () => ({
  ...jest.requireActual('uiSrc/slices/browser/bulkActions'),
  selectedBulkActionsSelector: jest.fn().mockReturnValue({
    type: 'delete',
  }),
}))

jest.mock('uiSrc/slices/browser/keys', () => ({
  ...jest.requireActual('uiSrc/slices/browser/keys'),
  keysSelector: jest.fn().mockReturnValue({
    filter: 'set',
    search: 'dawkmdk*',
  }),
}))

describe('BulkActionsTabs', () => {
  it('should render', () => {
    expect(render(<BulkActionsTabs {...mockedProps} />)).toBeTruthy()
  })

  it('should call proper telemetry events', async () => {
    const sendEventTelemetryMock = jest.fn()
    ;(sendEventTelemetry as jest.Mock).mockImplementation(
      () => sendEventTelemetryMock,
    )

    render(<BulkActionsTabs {...mockedProps} onChangeType={jest.fn()} />)

    fireEvent.mouseDown(screen.getByText('Upload Data'))

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.BULK_ACTIONS_OPENED,
      eventData: {
        databaseId: '',
        action: BulkActionsType.Upload,
      },
    })
    ;(sendEventTelemetry as jest.Mock).mockRestore()

  })
})
