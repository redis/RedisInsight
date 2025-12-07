import React from 'react'
import { cloneDeep } from 'lodash'
import {
  act,
  cleanup,
  fireEvent,
  mockedStore,
  render,
  screen,
} from 'uiSrc/utils/test-utils'

import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import {
  importInstancesFromFile,
  importInstancesSelector,
  resetImportInstances,
} from 'uiSrc/slices/instances/instances'
import ImportDatabase from './ImportDatabase'

jest.mock('uiSrc/slices/instances/instances', () => ({
  ...jest.requireActual('uiSrc/slices/instances/instances'),
  importInstancesSelector: jest.fn().mockReturnValue({
    loading: false,
    error: '',
    data: null,
  }),
}))

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('ImportDatabase', () => {
  it('should render', () => {
    expect(render(<ImportDatabase onClose={jest.fn} />)).toBeTruthy()
  })

  it('should call proper actions and send telemetry', async () => {
    const sendEventTelemetryMock = jest.fn()
    ;(sendEventTelemetry as jest.Mock).mockImplementation(
      () => sendEventTelemetryMock,
    )

    render(
      <div>
        <ImportDatabase onClose={jest.fn()} />
        <div id="footerDatabaseForm" />
      </div>,
    )

    const jsonString = JSON.stringify({})
    const blob = new Blob([jsonString])
    const file = new File([blob], 'empty.json', {
      type: 'application/JSON',
    })

    await act(async () => {
      fireEvent.change(screen.getByTestId('import-file-modal-filepicker'), {
        target: { files: [file] },
      })
    })

    expect(screen.getByTestId('btn-submit')).not.toBeDisabled()
    fireEvent.click(screen.getByTestId('btn-submit'))

    const expectedActions = [importInstancesFromFile()]
    expect(store.getActions()).toEqual(expectedActions)

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.CONFIG_DATABASES_REDIS_IMPORT_SUBMITTED,
    })
    ;(sendEventTelemetry as jest.Mock).mockRestore()
  })

  it('should call proper actions on retry', async () => {
    ;(importInstancesSelector as jest.Mock).mockImplementation(() => ({
      loading: false,
      data: null,
      error: 'Error message',
    }))

    render(
      <div>
        <ImportDatabase onClose={jest.fn()} />
        <div id="footerDatabaseForm" />
      </div>,
    )

    fireEvent.click(screen.getByTestId('btn-retry'))

    const expectedActions = [resetImportInstances()]
    expect(store.getActions()).toEqual(expectedActions)
  })

  it('should render error message when 0 success databases added', () => {
    ;(importInstancesSelector as jest.Mock).mockImplementation(() => ({
      loading: false,
      data: null,
      error: 'Error message',
    }))

    render(<ImportDatabase onClose={jest.fn()} />)
    expect(screen.getByTestId('result-failed')).toBeInTheDocument()
    expect(screen.getByTestId('result-failed')).toHaveTextContent(
      'Error message',
    )
  })
})
