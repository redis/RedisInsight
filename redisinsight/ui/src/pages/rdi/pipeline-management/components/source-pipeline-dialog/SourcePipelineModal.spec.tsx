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
} from 'uiSrc/slices/rdi/pipeline'
import {
  appContextPipelineManagement,
  setPipelineDialogState,
} from 'uiSrc/slices/app/context'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { FileChangeType } from 'uiSrc/slices/interfaces'
import { mockModal } from 'uiSrc/mocks/components/modal'
import SourcePipelineDialog, {
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

jest.mock('uiSrc/slices/app/context', () => ({
  ...jest.requireActual('uiSrc/slices/app/context'),
  appContextPipelineManagement: jest.fn(),
}))

jest.mock('uiBase/display', () => {
  const actual = jest.requireActual('uiBase/display')

  return mockModal(actual)
})

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
  ;(rdiPipelineSelector as jest.Mock).mockReturnValue({
    ...initialStateDefault.rdi.pipeline,
  })
  ;(appContextPipelineManagement as jest.Mock).mockReturnValue({
    ...initialStateDefault.app.context.pipelineManagement,
  })
})

describe('SourcePipelineDialog', () => {
  it('should not show dialog by default and not set isOpenDialog to true', () => {
    render(<SourcePipelineDialog />)

    expect(
      screen.queryByTestId('file-source-pipeline-dialog'),
    ).not.toBeInTheDocument()

    expect(store.getActions()).toEqual([])
  })

  it('should show dialog when isOpenDialog flag is true', () => {
    ;(appContextPipelineManagement as jest.Mock).mockReturnValue({
      ...initialStateDefault.app.context.pipelineManagement,
      isOpenDialog: true,
    })

    render(<SourcePipelineDialog />)

    expect(
      screen.queryByTestId('file-source-pipeline-dialog'),
    ).toBeInTheDocument()
  })

  it('should not show dialog when there is deployed pipeline on a server', () => {
    ;(rdiPipelineSelector as jest.Mock).mockReturnValue({
      ...initialStateDefault.rdi.pipeline,
      loading: false,
      data: { config: 'some config' },
    })

    render(<SourcePipelineDialog />)

    expect(store.getActions()).toEqual([])
  })

  it('should not show dialog when config is fetching', () => {
    ;(rdiPipelineSelector as jest.Mock).mockReturnValue({
      ...initialStateDefault.rdi.pipeline,
      loading: true,
      data: null,
    })

    render(<SourcePipelineDialog />)

    expect(store.getActions()).toEqual([])
  })

  it('should show dialog when there is no pipeline on a server', () => {
    ;(rdiPipelineSelector as jest.Mock).mockReturnValue({
      ...initialStateDefault.rdi.pipeline,
      loading: false,
      data: { config: '' },
    })

    render(<SourcePipelineDialog />)

    expect(store.getActions()).toEqual([setPipelineDialogState(true)])
  })

  describe('Telemetry events', () => {
    const sendEventTelemetryMock = jest.fn()

    beforeEach(() => {
      ;(sendEventTelemetry as jest.Mock).mockImplementation(
        () => sendEventTelemetryMock,
      )
      ;(appContextPipelineManagement as jest.Mock).mockReturnValue({
        ...initialStateDefault.app.context.pipelineManagement,
        isOpenDialog: true,
      })
    })

    it('should call proper actions after select fetch from server option', () => {
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
      render(<SourcePipelineDialog />)

      fireEvent.click(screen.getByTestId('empty-source-pipeline-dialog'))

      const expectedActions = [
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
      ;(appContextPipelineManagement as jest.Mock).mockReturnValue({
        ...initialStateDefault.app.context.pipelineManagement,
        isOpenDialog: true,
      })

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
})
