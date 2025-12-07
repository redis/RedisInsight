import React from 'react'
import { loadAsync } from 'jszip'
import { cloneDeep } from 'lodash'

import {
  rdiPipelineSelector,
  setChangedFiles,
  setConfigValidationErrors,
  setIsPipelineValid,
  setJobsValidationErrors,
  setPipelineConfig,
  setPipelineJobs,
} from 'uiSrc/slices/rdi/pipeline'
import { TelemetryEvent, sendEventTelemetry } from 'uiSrc/telemetry'
import {
  act,
  cleanup,
  fireEvent,
  mockedStore,
  render,
  screen,
  userEvent,
  waitFor,
} from 'uiSrc/utils/test-utils'
import { FileChangeType } from 'uiSrc/slices/interfaces'
import { validatePipeline } from 'uiSrc/components/yaml-validator'
import UploadModal, { Props } from './UploadModal'

jest.mock('uiSrc/slices/rdi/pipeline', () => ({
  ...jest.requireActual('uiSrc/slices/rdi/pipeline'),
  rdiPipelineSelector: jest.fn().mockReturnValue({
    loading: false,
    config: 'value',
    jobs: [
      { name: 'job1', value: 'value' },
      { name: 'job2', value: 'value' },
    ],
  }),
}))

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

jest.mock('jszip', () => ({
  ...jest.requireActual('jszip'),
  loadAsync: jest.fn().mockReturnValue({
    file: jest.fn().mockReturnValue({
      async: jest.fn().mockReturnValue('config'),
    }),
    files: {
      'jobs/': {
        async: jest.fn(),
      },
      'jobs/job1.yaml': {
        async: jest.fn().mockReturnValue('value1'),
      },
      'jobs/job2.yaml': {
        async: jest.fn().mockReturnValue('value2'),
      },
    },
  }),
}))

jest.mock('uiSrc/components/yaml-validator', () => ({
  validatePipeline: jest.fn(),
}))

const button = (
  <button type="button" data-testid="btn">
    test
  </button>
)

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
  jest.clearAllMocks()
})

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

const renderUploadModal = (props: Partial<Props> = {}) => {
  const { trigger = button, ...rest } = props
  return render(<UploadModal trigger={trigger} {...rest} />, { store })
}

describe('UploadModal', () => {
  it('should render', () => {
    expect(renderUploadModal()).toBeTruthy()
  })

  it('should call proper telemetry event when button is clicked', async () => {
    const sendEventTelemetryMock = jest.fn()
    ;(sendEventTelemetry as jest.Mock).mockImplementation(
      () => sendEventTelemetryMock,
    )

    renderUploadModal()

    await userEvent.click(screen.getByTestId('btn'))

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.RDI_PIPELINE_UPLOAD_FROM_FILE_CLICKED,
      eventData: {
        id: 'rdiInstanceId',
      },
    })
  })

  it('should call proper telemetry event when file upload is successful', async () => {
    renderUploadModal()

    await userEvent.click(screen.getByTestId('btn'))

    await act(() => {
      fireEvent.change(screen.getByTestId('import-file-modal-filepicker'), {
        target: { files: ['file'] },
      })
    })

    await userEvent.click(screen.getByTestId('submit-btn'))

    const expectedActions = [
      setChangedFiles({
        config: FileChangeType.Added,
        job1: FileChangeType.Added,
        job2: FileChangeType.Added,
      }),
      setPipelineConfig('config'),
      setPipelineJobs([
        { name: 'job1', value: 'value1' },
        { name: 'job2', value: 'value2' },
      ]),
    ]

    expect(store.getActions()).toEqual(expectedActions)
  })

  it('should call proper telemetry event when file upload is successful', async () => {
    const onUploadedPipelineMock = jest.fn()
    const sendEventTelemetryMock = jest.fn()
    ;(sendEventTelemetry as jest.Mock).mockImplementation(
      () => sendEventTelemetryMock,
    )

    renderUploadModal({ onUploadedPipeline: onUploadedPipelineMock })

    await act(() => {
      fireEvent.click(screen.getByTestId('btn'))
    })

    await act(() => {
      fireEvent.change(screen.getByTestId('import-file-modal-filepicker'), {
        target: { files: ['file'] },
      })
      fireEvent.click(screen.getByTestId('submit-btn'))
    })

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.RDI_PIPELINE_UPLOAD_SUCCEEDED,
      eventData: {
        id: 'rdiInstanceId',
        jobsNumber: 2,
        source: 'file',
      },
    })
    expect(onUploadedPipelineMock).toBeCalled()
  })

  it('should call proper telemetry event when file upload has failed', async () => {
    ;(loadAsync as jest.Mock).mockImplementation(() => {
      throw new Error('error')
    })

    const onUploadedPipelineMock = jest.fn()
    const sendEventTelemetryMock = jest.fn()
    ;(sendEventTelemetry as jest.Mock).mockImplementation(
      () => sendEventTelemetryMock,
    )

    renderUploadModal({ onUploadedPipeline: onUploadedPipelineMock })

    await act(() => {
      fireEvent.click(screen.getByTestId('btn'))
    })

    await act(() => {
      fireEvent.change(screen.getByTestId('import-file-modal-filepicker'), {
        target: { files: ['file'] },
      })
      fireEvent.click(screen.getByTestId('submit-btn'))
    })

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.RDI_PIPELINE_UPLOAD_FAILED,
      eventData: {
        id: 'rdiInstanceId',
        errorMessage: 'error',
        source: 'file',
      },
    })
    expect(onUploadedPipelineMock).not.toBeCalled()
  })

  it('should call onClose when close button is clicked', async () => {
    const onCloseMock = jest.fn()

    renderUploadModal({ onClose: onCloseMock })

    await act(() => {
      fireEvent.click(screen.getByTestId('btn'))
    })

    await act(() => {
      fireEvent.click(screen.getByTestId('import-file-modal-close-btn'))
    })

    expect(onCloseMock).toBeCalled()
  })

  it('should render disabled upload button when loading', () => {
    ;(rdiPipelineSelector as jest.Mock).mockImplementation(() => ({
      loading: true,
    }))

    renderUploadModal()

    expect(screen.getByTestId('btn')).toBeDisabled()
  })

  it('should open modal when upload button is clicked', async () => {
    renderUploadModal()

    await act(() => {
      fireEvent.click(screen.getByTestId('btn'))
    })

    waitFor(() => {
      expect(screen.getByTestId('import-file-modal')).toBeInTheDocument()
    })
  })

  it('should call validatePipeline and dispatch validation actions on successful upload', async () => {
    ;(validatePipeline as jest.Mock).mockReturnValue({
      result: true,
      configValidationErrors: [],
      jobsValidationErrors: {},
    })
    ;(rdiPipelineSelector as jest.Mock).mockReturnValue({
      loading: false,
      schema: 'mockSchema',
    })
    ;(loadAsync as jest.Mock).mockReturnValue({
      file: jest.fn().mockReturnValue({
        async: jest.fn().mockReturnValue('mockConfig'),
      }),
      files: {
        'jobs/': {
          async: jest.fn(),
        },
        'jobs/job1.yaml': {
          async: jest.fn().mockReturnValue('value'),
        },
      },
    })

    renderUploadModal()

    await act(() => {
      fireEvent.click(screen.getByTestId('btn'))
    })

    await act(() => {
      fireEvent.change(screen.getByTestId('import-file-modal-filepicker'), {
        target: { files: ['file'] },
      })
      fireEvent.click(screen.getByTestId('submit-btn'))
    })

    expect(validatePipeline).toHaveBeenCalledWith({
      config: 'mockConfig',
      schema: 'mockSchema',
      jobs: [{ name: 'job1', value: 'value' }],
    })

    expect(store.getActions()).toEqual([
      setChangedFiles({
        config: FileChangeType.Added,
        job1: FileChangeType.Added,
      }),
      setPipelineConfig('mockConfig'),
      setPipelineJobs([{ name: 'job1', value: 'value' }]),
      setConfigValidationErrors([]),
      setJobsValidationErrors({}),
      setIsPipelineValid(true),
    ])
  })

  it('should NOT call validatePipeline if schema is missing', async () => {
    const rdiPipelineSelectorMock = rdiPipelineSelector as jest.Mock
    rdiPipelineSelectorMock.mockReturnValueOnce({
      loading: false,
      schema: null,
    })

    renderUploadModal()

    await act(() => {
      fireEvent.click(screen.getByTestId('btn'))
    })

    await act(() => {
      fireEvent.change(screen.getByTestId('import-file-modal-filepicker'), {
        target: { files: ['file'] },
      })
      fireEvent.click(screen.getByTestId('submit-btn'))
    })

    expect(validatePipeline).not.toHaveBeenCalled()
  })

  it('should NOT call validatePipeline if jobs are missing', async () => {
    ;(loadAsync as jest.Mock).mockReturnValue({
      file: jest.fn().mockReturnValue({
        async: jest.fn().mockReturnValue('config'),
      }),
      files: {
        'jobs/': {
          async: jest.fn(),
        },
        // No jobs
      },
    })

    renderUploadModal()

    await act(() => {
      fireEvent.click(screen.getByTestId('btn'))
    })

    await act(() => {
      fireEvent.change(screen.getByTestId('import-file-modal-filepicker'), {
        target: { files: ['file'] },
      })
      fireEvent.click(screen.getByTestId('submit-btn'))
    })

    expect(validatePipeline).not.toHaveBeenCalled()
  })

  it('should NOT call validatePipeline if config is missing', async () => {
    ;(loadAsync as jest.Mock).mockReturnValue({
      file: jest.fn().mockReturnValue({
        async: jest.fn().mockReturnValue(null),
      }),
      files: {
        'jobs/': {
          async: jest.fn(),
        },
        'jobs/job1.yaml': {
          async: jest.fn().mockReturnValue('value1'),
        },
        'jobs/job2.yaml': {
          async: jest.fn().mockReturnValue('value2'),
        },
      },
    })

    renderUploadModal()

    await act(() => {
      fireEvent.click(screen.getByTestId('btn'))
    })

    await act(() => {
      fireEvent.change(screen.getByTestId('import-file-modal-filepicker'), {
        target: { files: ['file'] },
      })
      fireEvent.click(screen.getByTestId('submit-btn'))
    })

    expect(validatePipeline).not.toHaveBeenCalled()
  })
})
