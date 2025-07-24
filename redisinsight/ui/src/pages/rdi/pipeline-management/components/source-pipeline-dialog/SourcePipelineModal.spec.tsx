import React from 'react'
import { cloneDeep } from 'lodash'
import {
  cleanup,
  mockedStore,
  render,
  fireEvent,
  screen,
  initialStateDefault,
} from 'uiSrc/utils/test-utils'
import {
  getPipeline,
  rdiPipelineSelector,
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

jest.mock('uiSrc/slices/rdi/pipeline', () => ({
  ...jest.requireActual('uiSrc/slices/rdi/pipeline'),
  rdiPipelineSelector: jest.fn(),
}))

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
  ;(rdiPipelineSelector as jest.Mock).mockReturnValue({
    ...initialStateDefault.rdi.pipeline,
    loading: false,
    config: '',
  })
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

  it('should call proper telemetry event after select empty pipeline option', () => {
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

  it('should not show dialog when there is deployed pipeline on a server', () => {
    const sendEventTelemetryMock = jest.fn()
    ;(sendEventTelemetry as jest.Mock).mockImplementation(
      () => sendEventTelemetryMock,
    )
    ;(rdiPipelineSelector as jest.Mock).mockReturnValue({
      ...initialStateDefault.rdi.pipeline,
      loading: false,
      config: 'deployed config',
    })

    render(<SourcePipelineDialog />)

    expect(screen.queryByTestId('file-source-pipeline-dialog')).not.toBeInTheDocument()
  })

  it('should not show dialog when config is fetching', () => {
    const sendEventTelemetryMock = jest.fn()
    ;(sendEventTelemetry as jest.Mock).mockImplementation(
      () => sendEventTelemetryMock,
    )
    ;(rdiPipelineSelector as jest.Mock).mockReturnValue({
      ...initialStateDefault.rdi.pipeline,
      loading: true,
      config: '',
    })

    render(<SourcePipelineDialog />)

    expect(screen.queryByTestId('file-source-pipeline-dialog')).not.toBeInTheDocument()
  })
})
