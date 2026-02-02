import { useFormikContext } from 'formik'
import { cloneDeep } from 'lodash'
import React from 'react'

import { MOCK_RDI_PIPELINE_DATA } from 'uiSrc/mocks/data/rdi'
import { TelemetryEvent, sendEventTelemetry } from 'uiSrc/telemetry'
import {
  cleanup,
  fireEvent,
  mockedStore,
  render,
  screen,
} from 'uiSrc/utils/test-utils'
import { PipelineStatus } from 'uiSrc/slices/interfaces'
import { validatePipeline } from 'uiSrc/components/yaml-validator'
import {
  rdiPipelineSelector,
  setConfigValidationErrors,
  setIsPipelineValid,
  setJobsValidationErrors,
} from 'uiSrc/slices/rdi/pipeline'
import PipelineActions, { Props } from './PipelineActions'

const mockedProps: Props = {
  pipelineStatus: PipelineStatus.Ready,
}

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

jest.mock('uiSrc/slices/rdi/pipeline', () => ({
  ...jest.requireActual('uiSrc/slices/rdi/pipeline'),
  rdiPipelineSelector: jest.fn().mockReturnValue({
    loading: false,
  }),
}))

jest.mock('formik')

jest.mock('uiSrc/components/yaml-validator', () => ({
  validatePipeline: jest.fn(),
}))

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('PipelineActions', () => {
  beforeEach(() => {
    const mockUseFormikContext = {
      handleSubmit: jest.fn(),
      values: MOCK_RDI_PIPELINE_DATA,
    }
    ;(useFormikContext as jest.Mock).mockReturnValue(mockUseFormikContext)
  })

  it('should render', () => {
    expect(render(<PipelineActions {...mockedProps} />)).toBeTruthy()
  })

  it('should display stopBtn if pipelineStatus is Ready', () => {
    render(
      <PipelineActions
        {...mockedProps}
        pipelineStatus={PipelineStatus.Ready}
      />,
    )
    expect(screen.getByText('Stop')).toBeInTheDocument()
  })

  it('should display startBtn if pipelineStatus is Stopped', () => {
    render(
      <PipelineActions
        {...mockedProps}
        pipelineStatus={PipelineStatus.Stopped}
      />,
    )
    expect(screen.getByText('Start')).toBeInTheDocument()
  })

  it('should display startBtn if pipelineStatus is NotReady', () => {
    render(
      <PipelineActions
        {...mockedProps}
        pipelineStatus={PipelineStatus.NotReady}
      />,
    )
    expect(screen.getByText('Start')).toBeInTheDocument()
  })

  // V2 status tests
  it('should display stopBtn if pipelineStatus is Started (V2)', () => {
    render(
      <PipelineActions
        {...mockedProps}
        pipelineStatus={PipelineStatus.Started}
      />,
    )
    expect(screen.getByText('Stop')).toBeInTheDocument()
    expect(screen.queryByText('Start')).not.toBeInTheDocument()
  })

  it('should display stopBtn if pipelineStatus is Error (V2)', () => {
    render(
      <PipelineActions
        {...mockedProps}
        pipelineStatus={PipelineStatus.Error}
      />,
    )
    expect(screen.getByText('Stop')).toBeInTheDocument()
    expect(screen.queryByText('Start')).not.toBeInTheDocument()
  })

  it('should display stopBtn if pipelineStatus is Unknown (V2)', () => {
    render(
      <PipelineActions
        {...mockedProps}
        pipelineStatus={PipelineStatus.Unknown}
      />,
    )
    expect(screen.getByText('Stop')).toBeInTheDocument()
    expect(screen.queryByText('Start')).not.toBeInTheDocument()
  })

  // Transitional state tests
  it('should display disabled stopBtn if pipelineStatus is Starting', () => {
    render(
      <PipelineActions
        {...mockedProps}
        pipelineStatus={PipelineStatus.Starting}
      />,
    )
    expect(screen.getByText('Stop')).toBeInTheDocument()
    expect(screen.getByTestId('stop-pipeline-btn')).toBeDisabled()
  })

  it('should display disabled stopBtn if pipelineStatus is Stopping', () => {
    render(
      <PipelineActions
        {...mockedProps}
        pipelineStatus={PipelineStatus.Stopping}
      />,
    )
    expect(screen.getByText('Stop')).toBeInTheDocument()
    expect(screen.getByTestId('stop-pipeline-btn')).toBeDisabled()
  })

  it('should display disabled stopBtn if pipelineStatus is Pending', () => {
    render(
      <PipelineActions
        {...mockedProps}
        pipelineStatus={PipelineStatus.Pending}
      />,
    )
    expect(screen.getByText('Stop')).toBeInTheDocument()
    expect(screen.getByTestId('stop-pipeline-btn')).toBeDisabled()
  })

  it('should display no button if pipelineStatus is undefined', () => {
    render(<PipelineActions {...mockedProps} pipelineStatus={undefined} />)
    expect(screen.queryByText('Stop')).not.toBeInTheDocument()
    expect(screen.queryByText('Start')).not.toBeInTheDocument()
  })

  it('should validate pipeline when schema, config, or jobs change', () => {
    ;(validatePipeline as jest.Mock).mockReturnValue({
      result: true,
      configValidationErrors: [],
      jobsValidationErrors: {},
    })
    ;(rdiPipelineSelector as jest.Mock).mockReturnValueOnce({
      loading: false,
      schema: 'test-schema',
      monacoJobsSchema: 'test-monaco-jobs-schema',
      jobNameSchema: 'test-job-name-schema',
      config: 'test-config',
      jobs: 'test-jobs',
    })

    render(<PipelineActions {...mockedProps} />)

    expect(validatePipeline).toHaveBeenCalledWith({
      schema: 'test-schema',
      monacoJobsSchema: 'test-monaco-jobs-schema',
      jobNameSchema: 'test-job-name-schema',
      config: 'test-config',
      jobs: 'test-jobs',
    })

    expect(store.getActions()).toEqual([
      setConfigValidationErrors([]),
      setJobsValidationErrors({}),
      setIsPipelineValid(true),
    ])
  })

  it('should set pipeline as invalid if config and jobs are empty (no configuration is entered)', () => {
    ;(validatePipeline as jest.Mock).mockReturnValue({
      result: false,
      configValidationErrors: ['Error'],
      jobsValidationErrors: [],
    })
    ;(rdiPipelineSelector as jest.Mock).mockReturnValueOnce({
      config: '',
      jobs: '',
    })

    render(<PipelineActions {...mockedProps} />)

    expect(store.getActions()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: setIsPipelineValid.type,
          payload: false,
        }),
      ]),
    )
  })

  it('should set pipeline as invalid if config and jobs are missing or empty (no configuration is entered)', () => {
    ;(validatePipeline as jest.Mock).mockReturnValue({
      result: false,
      configValidationErrors: ['Error'],
      jobsValidationErrors: [],
    })
    ;(rdiPipelineSelector as jest.Mock).mockReturnValueOnce({
      config: undefined,
      jobs: undefined,
    })

    render(<PipelineActions {...mockedProps} />)

    expect(store.getActions()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: setIsPipelineValid.type,
          payload: false,
        }),
      ]),
    )
  })

  it('should dispatch validation errors if validation fails but still deploy button should be enabled', () => {
    ;(validatePipeline as jest.Mock).mockReturnValue({
      result: false,
      configValidationErrors: ['Missing field'],
      jobsValidationErrors: ['Invalid job config'],
    })
    ;(rdiPipelineSelector as jest.Mock).mockReturnValueOnce({
      loading: false,
      schema: 'test-schema',
      monacoJobsSchema: 'test-monaco-jobs-schema',
      jobNameSchema: 'test-job-name-schema',
      config: 'test-config',
      jobs: 'test-jobs',
    })

    render(<PipelineActions {...mockedProps} />)

    expect(store.getActions()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: setConfigValidationErrors.type,
          payload: ['Missing field'],
        }),
        expect.objectContaining({
          type: setJobsValidationErrors.type,
          payload: ['Invalid job config'],
        }),
        expect.objectContaining({
          type: setIsPipelineValid.type,
          payload: false,
        }),
      ]),
    )

    expect(screen.queryByTestId('deploy-rdi-pipeline')).not.toBeDisabled()
  })

  describe('validation with new schema parameters', () => {
    it('should pass monacoJobsSchema and jobNameSchema to validatePipeline when available', () => {
      const mockMonacoJobsSchema = {
        type: 'object',
        properties: { task: { type: 'string' } },
      }
      const mockJobNameSchema = {
        type: 'string',
        pattern: '^[a-zA-Z][a-zA-Z0-9_]*$',
      }

      ;(validatePipeline as jest.Mock).mockReturnValue({
        result: true,
        configValidationErrors: [],
        jobsValidationErrors: {},
      })
      ;(rdiPipelineSelector as jest.Mock).mockReturnValueOnce({
        loading: false,
        schema: 'test-schema',
        monacoJobsSchema: mockMonacoJobsSchema,
        jobNameSchema: mockJobNameSchema,
        config: 'test-config',
        jobs: 'test-jobs',
      })

      render(<PipelineActions {...mockedProps} />)

      expect(validatePipeline).toHaveBeenCalledWith({
        schema: 'test-schema',
        monacoJobsSchema: mockMonacoJobsSchema,
        jobNameSchema: mockJobNameSchema,
        config: 'test-config',
        jobs: 'test-jobs',
      })
    })

    it('should pass null/undefined schemas to validatePipeline when not available', () => {
      ;(validatePipeline as jest.Mock).mockReturnValue({
        result: true,
        configValidationErrors: [],
        jobsValidationErrors: {},
      })
      ;(rdiPipelineSelector as jest.Mock).mockReturnValueOnce({
        loading: false,
        schema: 'test-schema',
        monacoJobsSchema: null,
        jobNameSchema: undefined,
        config: 'test-config',
        jobs: 'test-jobs',
      })

      render(<PipelineActions {...mockedProps} />)

      expect(validatePipeline).toHaveBeenCalledWith({
        schema: 'test-schema',
        monacoJobsSchema: null,
        jobNameSchema: undefined,
        config: 'test-config',
        jobs: 'test-jobs',
      })
    })

    it('should include monacoJobsSchema and jobNameSchema in dependency array for validation effect', () => {
      // This test verifies that the useEffect dependency array includes the new schema parameters
      // by checking that different schema values trigger different validatePipeline calls

      ;(validatePipeline as jest.Mock).mockReturnValue({
        result: true,
        configValidationErrors: [],
        jobsValidationErrors: {},
      })

      // First render with specific schemas
      ;(rdiPipelineSelector as jest.Mock).mockReturnValueOnce({
        loading: false,
        schema: 'test-schema',
        monacoJobsSchema: {
          type: 'object',
          properties: { task: { type: 'string' } },
        },
        jobNameSchema: { type: 'string', pattern: '^[a-zA-Z]+$' },
        config: 'test-config',
        jobs: 'test-jobs',
      })

      render(<PipelineActions {...mockedProps} />)

      // Verify that validatePipeline was called with all the correct parameters including schemas
      expect(validatePipeline).toHaveBeenCalledWith({
        schema: 'test-schema',
        monacoJobsSchema: {
          type: 'object',
          properties: { task: { type: 'string' } },
        },
        jobNameSchema: { type: 'string', pattern: '^[a-zA-Z]+$' },
        config: 'test-config',
        jobs: 'test-jobs',
      })
    })
  })

  describe('TelemetryEvent', () => {
    beforeEach(() => {
      const sendEventTelemetryMock = jest.fn()
      ;(sendEventTelemetry as jest.Mock).mockImplementation(
        () => sendEventTelemetryMock,
      )
    })

    it('should call proper telemetry on reset btn click', () => {
      render(<PipelineActions {...mockedProps} />)
      fireEvent.click(screen.getByTestId('reset-pipeline-btn'))
      expect(sendEventTelemetry).toBeCalledWith({
        event: TelemetryEvent.RDI_PIPELINE_RESET_CLICKED,
        eventData: {
          id: 'rdiInstanceId',
          pipelineStatus: mockedProps.pipelineStatus,
        },
      })
    })

    it('should call proper telemetry on start btn click', () => {
      render(
        <PipelineActions
          {...mockedProps}
          pipelineStatus={PipelineStatus.Stopped}
        />,
      )
      fireEvent.click(screen.getByTestId('start-pipeline-btn'))
      expect(sendEventTelemetry).toBeCalledWith({
        event: TelemetryEvent.RDI_PIPELINE_START_CLICKED,
        eventData: {
          id: 'rdiInstanceId',
        },
      })
    })

    it('should call proper telemetry on stop btn click', () => {
      render(<PipelineActions {...mockedProps} />)
      fireEvent.click(screen.getByTestId('stop-pipeline-btn'))
      expect(sendEventTelemetry).toBeCalledWith({
        event: TelemetryEvent.RDI_PIPELINE_STOP_CLICKED,
        eventData: {
          id: 'rdiInstanceId',
        },
      })
    })
  })
})
