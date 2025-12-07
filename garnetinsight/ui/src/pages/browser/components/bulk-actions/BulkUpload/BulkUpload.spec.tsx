import React from 'react'
import { cloneDeep } from 'lodash'
import {
  render,
  screen,
  fireEvent,
  act,
  mockedStore,
  cleanup,
} from 'uiSrc/utils/test-utils'

import {
  bulkActionsUploadOverviewSelector,
  bulkUpload,
  setBulkUploadStartAgain,
  uploadController,
} from 'uiSrc/slices/browser/bulkActions'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { BulkActionsType } from 'uiSrc/constants'
import BulkUpload from './BulkUpload'

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

jest.mock('uiSrc/slices/browser/bulkActions', () => ({
  ...jest.requireActual('uiSrc/slices/browser/bulkActions'),
  bulkActionsUploadSelector: jest.fn().mockReturnValue({
    loading: false,
    fileName: '',
  }),
  bulkActionsUploadOverviewSelector: jest.fn().mockReturnValue(null),
  bulkActionsUploadSummarySelector: jest.fn().mockReturnValue(null),
  uploadController: {
    abort: jest.fn(),
  },
}))

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('BulkUpload', () => {
  it('should render', () => {
    expect(render(<BulkUpload onCancel={jest.fn()} />)).toBeTruthy()
  })

  it('should call onCancel', () => {
    const onCancel = jest.fn()
    render(<BulkUpload onCancel={onCancel} />)

    fireEvent.click(screen.getByTestId('bulk-action-cancel-btn'))

    expect(onCancel).toBeCalled()
  })

  it('should call abort controller', () => {
    const onCancel = jest.fn()
    const abortMock = jest.fn()
    ;(uploadController as any).abort = abortMock

    render(<BulkUpload onCancel={onCancel} />)

    fireEvent.click(screen.getByTestId('bulk-action-cancel-btn'))

    expect(abortMock).toBeCalled()
  })

  it('submit btn should be disabled without file', () => {
    render(<BulkUpload onCancel={jest.fn()} />)

    expect(screen.getByTestId('bulk-action-warning-btn')).toBeDisabled()
  })

  it('should open warning popover and call proper actions after submit', async () => {
    render(<BulkUpload onCancel={jest.fn()} />)

    const data = 'set a b'
    const blob = new Blob([data])

    const file = new File([blob], 'text.txt')
    await act(() => {
      fireEvent.change(screen.getByTestId('bulk-upload-file-input'), {
        target: { files: [file] },
      })
    })

    expect(screen.getByTestId('bulk-action-warning-btn')).not.toBeDisabled()
    fireEvent.click(screen.getByTestId('bulk-action-warning-btn'))

    expect(screen.getByTestId('bulk-action-tooltip')).toBeInTheDocument()

    fireEvent.click(screen.getByTestId('bulk-action-apply-btn'))

    const expectedActions = [bulkUpload()]
    expect(store.getActions()).toEqual(expectedActions)
  })

  it('should render summary', () => {
    ;(bulkActionsUploadOverviewSelector as jest.Mock).mockImplementation(
      () => ({
        status: 'completed',
        progress: 100,
        duration: 10,
      }),
    )

    render(<BulkUpload onCancel={jest.fn()} />)

    expect(
      screen.getByTestId('bulk-upload-completed-summary'),
    ).toBeInTheDocument()
  })

  it('should call start new button', () => {
    ;(bulkActionsUploadOverviewSelector as jest.Mock).mockImplementation(
      () => ({
        status: 'completed',
        progress: 100,
        duration: 10,
      }),
    )

    render(<BulkUpload onCancel={jest.fn()} />)

    fireEvent.click(screen.getByTestId('bulk-action-start-new-btn'))
    const expectedActions = [setBulkUploadStartAgain()]
    expect(store.getActions()).toEqual(expectedActions)
  })

  it('should call proper telemetry events', async () => {
    ;(bulkActionsUploadOverviewSelector as jest.Mock).mockRestore()

    const sendEventTelemetryMock = jest.fn()
    ;(sendEventTelemetry as jest.Mock).mockImplementation(
      () => sendEventTelemetryMock,
    )

    render(<BulkUpload onCancel={jest.fn()} />)

    const data = 'set a b'
    const blob = new Blob([data])

    const file = new File([blob], 'text.txt')
    await act(() => {
      fireEvent.change(screen.getByTestId('bulk-upload-file-input'), {
        target: { files: [file] },
      })
    })

    fireEvent.click(screen.getByTestId('bulk-action-warning-btn'))
    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.BULK_ACTIONS_WARNING,
      eventData: {
        action: BulkActionsType.Upload,
        databaseId: '',
      },
    })
  })

  it('should contain the upload warning text', () => {
    render(<BulkUpload onCancel={jest.fn()} />)

    expect(
      screen.getByText(
        'Use files only from trusted authors to avoid automatic execution of malicious code.',
      ),
    ).toBeInTheDocument()
  })
})
