import React from 'react'
import { cloneDeep } from 'lodash'
import {
  cleanup,
  mockedStore,
  render,
  fireEvent,
  screen,
} from 'uiSrc/utils/test-utils'
import {
  getPipeline,
  setChangedFile,
  setPipeline,
} from 'uiSrc/slices/rdi/pipeline'
import { setPipelineDialogState } from 'uiSrc/slices/app/context'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { FileChangeType } from 'uiSrc/slices/interfaces'
import SourcePipelineDialog, {
  EMPTY_PIPELINE,
  PipelineSourceOptions,
} from './SourcePipelineModal'

jest.mock('formik', () => ({
  ...jest.requireActual('formik'),
  useFormikContext: jest.fn().mockReturnValue({
    values: {
      config: '',
      jobs: [],
    },
  }),
}))

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

jest.mock('uiSrc/components/base/display', () => {
  const actual = jest.requireActual('uiSrc/components/base/display')

  return {
    ...actual,
    Modal: {
      ...actual.Modal,
      Content: {
        ...actual.Modal.Content,
        Header: {
          ...actual.Modal.Content.Header,
          Title: jest.fn().mockReturnValue(null),
        },
      },
    },
  }
})

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('SourcePipelineDialog', () => {
  it('should render', () => {
    expect(render(<SourcePipelineDialog />)).toBeTruthy()
  })

  it('should call proper actions after select fetch from server option', () => {
    const sendEventTelemetryMock = jest.fn()
    ;(sendEventTelemetry as jest.Mock).mockImplementation(
      () => sendEventTelemetryMock,
    )

    render(<SourcePipelineDialog />)

    fireEvent.click(screen.getByTestId('server-source-pipeline-dialog'))

    const expectedActions = [getPipeline(), setPipelineDialogState(false)]

    expect(store.getActions()).toEqual(expectedActions)
    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.RDI_START_OPTION_SELECTED,
      eventData: {
        id: 'rdiInstanceId',
        option: PipelineSourceOptions.SERVER,
      },
    })
  })

  it('should call proper actions after select empty pipeline  option', () => {
    const sendEventTelemetryMock = jest.fn()
    ;(sendEventTelemetry as jest.Mock).mockImplementation(
      () => sendEventTelemetryMock,
    )
    render(<SourcePipelineDialog />)

    fireEvent.click(screen.getByTestId('empty-source-pipeline-dialog'))

    const expectedActions = [
      setPipeline(EMPTY_PIPELINE),
      setChangedFile({ name: 'config', status: FileChangeType.Added }),
      setPipelineDialogState(false),
    ]

    expect(store.getActions()).toEqual(expectedActions)
    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.RDI_START_OPTION_SELECTED,
      eventData: {
        id: 'rdiInstanceId',
        option: PipelineSourceOptions.NEW,
      },
    })
  })

  it('should call proper telemetry event after select empty pipeline  option', () => {
    const sendEventTelemetryMock = jest.fn()
    ;(sendEventTelemetry as jest.Mock).mockImplementation(
      () => sendEventTelemetryMock,
    )
    render(<SourcePipelineDialog />)

    fireEvent.click(screen.getByTestId('file-source-pipeline-dialog'))

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.RDI_START_OPTION_SELECTED,
      eventData: {
        id: 'rdiInstanceId',
        option: PipelineSourceOptions.FILE,
      },
    })
  })
})
