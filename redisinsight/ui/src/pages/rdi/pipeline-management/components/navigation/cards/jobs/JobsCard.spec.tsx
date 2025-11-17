import React from 'react'
import { cloneDeep } from 'lodash'
import { instance, mock } from 'ts-mockito'
import {
  cleanup,
  mockedStore,
  render,
  screen,
  fireEvent,
  act,
  waitFor,
} from 'uiSrc/utils/test-utils'

import { rdiPipelineSelector as rdiPipelineSelectorMock } from 'uiSrc/slices/rdi/pipeline'
import { TelemetryEvent, sendEventTelemetry } from 'uiSrc/telemetry'
import JobsCard, { JobsCardProps } from './JobsCard'

const mockedProps = mock<JobsCardProps>()

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

jest.mock('uiSrc/slices/rdi/pipeline', () => ({
  ...jest.requireActual('uiSrc/slices/rdi/pipeline'),
  rdiPipelineSelector: jest.fn().mockReturnValue({
    loading: false,
    data: {},
    jobs: [
      { name: 'job1', value: 'value1' },
      { name: 'job2', value: 'value2' },
    ],
    jobsValidationErrors: {},
    changes: {},
  }),
}))

const mockedRdiPipelineSelector = rdiPipelineSelectorMock as jest.Mock
const mockedSendEventTelemetry = sendEventTelemetry as jest.Mock

describe('JobsCard', () => {
  it('should render with correct title', () => {
    render(<JobsCard {...instance(mockedProps)} />)

    expect(screen.getByText('Transform and Validate')).toBeInTheDocument()
  })

  it('should render with correct test id', () => {
    render(<JobsCard {...instance(mockedProps)} />)

    expect(screen.getByTestId('rdi-pipeline-jobs-nav')).toBeInTheDocument()
  })

  it('should render as selected when isSelected is true', () => {
    render(<JobsCard {...instance(mockedProps)} isSelected={true} />)

    const card = screen.getByTestId('rdi-pipeline-jobs-nav')
    expect(card).toBeInTheDocument()
  })

  it('should render add job button', () => {
    render(<JobsCard {...instance(mockedProps)} />)

    expect(screen.getByTestId('add-new-job')).toBeInTheDocument()
    expect(screen.getByLabelText('add new job file')).toBeInTheDocument()
  })

  it('should render job actions', () => {
    render(<JobsCard {...instance(mockedProps)} />)

    expect(screen.getByTestId('rdi-nav-job-actions-job1')).toBeInTheDocument()
    expect(screen.getByTestId('edit-job-name-job1')).toBeInTheDocument()
    expect(screen.getByTestId('delete-job-job1')).toBeInTheDocument()
  })

  it('should delete job', async () => {
    render(<JobsCard {...instance(mockedProps)} />)

    await act(() => {
      fireEvent.click(screen.getByTestId('delete-job-job1'))
    })

    await act(() => {
      fireEvent.click(screen.getByTestId('delete-confirm-btn'))
    })

    waitFor(() => {
      expect(screen.queryByTestId('delete-job-job1')).not.toBeInTheDocument()
    })
  })

  it('should not delete job when dismissed', async () => {
    render(<JobsCard {...instance(mockedProps)} />)

    await act(() => {
      fireEvent.click(screen.getByTestId('delete-job-job1'))
    })

    await act(() => {
      fireEvent.click(document)
    })

    waitFor(() => {
      expect(screen.queryByTestId('delete-job-job1')).toBeInTheDocument()
    })
  })

  it('should edit job name', async () => {
    render(<JobsCard {...instance(mockedProps)} onSelect={jest.fn()} />)

    await act(() => {
      fireEvent.click(screen.getByTestId('edit-job-name-job1'))
    })

    waitFor(() => {
      expect(screen.getByTestId('rdi-nav-job-edit-job1')).toBeInTheDocument()
    })
  })

  it('should not edit job name when dismissed', async () => {
    render(<JobsCard {...instance(mockedProps)} onSelect={jest.fn()} />)

    await act(() => {
      fireEvent.click(screen.getByTestId('edit-job-name-job1'))
    })

    await act(() => {
      fireEvent.click(document)
    })

    waitFor(() => {
      expect(
        screen.queryByTestId('rdi-nav-job-edit-job1'),
      ).not.toBeInTheDocument()
    })
  })

  it('should show new job form when add button is clicked', () => {
    render(<JobsCard {...instance(mockedProps)} />)

    expect(screen.queryByTestId('new-job-file')).not.toBeInTheDocument()

    fireEvent.click(screen.getByTestId('add-new-job'))

    expect(screen.getByTestId('new-job-file')).toBeInTheDocument()
  })

  it('should disable add button when new job form is open', () => {
    render(<JobsCard {...instance(mockedProps)} />)

    fireEvent.click(screen.getByTestId('add-new-job'))

    expect(screen.getByTestId('add-new-job')).toBeDisabled()
  })

  it('should handle empty jobs list', () => {
    mockedRdiPipelineSelector.mockReturnValue({
      loading: false,
      data: {},
      jobs: [],
      jobsValidationErrors: {},
      changes: {},
    })

    render(<JobsCard {...instance(mockedProps)} />)

    expect(screen.queryByTestId('job-file-job1')).not.toBeInTheDocument()
    expect(screen.getByTestId('add-new-job')).toBeInTheDocument()
  })

  it('should show validation errors when present', () => {
    mockedRdiPipelineSelector.mockReturnValue({
      loading: false,
      data: {},
      jobs: [
        { name: 'job1', value: 'value1' },
        { name: 'job2', value: 'value2' },
      ],
      jobsValidationErrors: {
        job1: ['Error message'],
      },
      changes: {},
    })

    render(<JobsCard {...instance(mockedProps)} />)

    expect(
      screen.getByTestId('rdi-pipeline-nav__error-job1'),
    ).toBeInTheDocument()
    expect(
      screen.queryByTestId('rdi-pipeline-nav__error-job2'),
    ).not.toBeInTheDocument()
  })

  it('should disable apply button when job name is invalid', async () => {
    mockedRdiPipelineSelector.mockReturnValue({
      loading: false,
      error: '',
      jobs: [{ name: 'job1', value: 'value' }],
      jobsValidationErrors: { job1: ['Invalid name'] },
      changes: {},
    })

    render(<JobsCard {...instance(mockedProps)} />)

    await act(() => {
      fireEvent.click(screen.getByTestId('edit-job-name-job1'))
    })

    const input = screen.getByTestId('inline-item-editor')
    fireEvent.change(input, { target: { value: '' } }) // Invalid name

    expect(screen.getByTestId('apply-btn')).toBeDisabled()
  })

  it('should show changes indicator when job has changes', () => {
    mockedRdiPipelineSelector.mockReturnValue({
      loading: false,
      data: {},
      jobs: [
        { name: 'job1', value: 'value1' },
        { name: 'job2', value: 'value2' },
      ],
      jobsValidationErrors: {},
      changes: {
        job1: 'modified',
      },
    })

    render(<JobsCard {...instance(mockedProps)} />)

    expect(
      screen.getByTestId('updated-file-job1-highlight'),
    ).toBeInTheDocument()
    expect(
      screen.queryByTestId('updated-file-job2-highlight'),
    ).not.toBeInTheDocument()
  })

  it('should call proper telemetry event when adding new job', async () => {
    mockedSendEventTelemetry.mockImplementation(() => jest.fn())

    mockedRdiPipelineSelector.mockReturnValue({
      loading: false,
      data: {
        jobs: [
          { name: 'job1', value: 'value1' },
          { name: 'job2', value: 'value2' },
        ],
      },
      jobs: [
        { name: 'job1', value: 'value1' },
        { name: 'job2', value: 'value2' },
      ],
      jobsValidationErrors: {},
      changes: {},
    })

    render(<JobsCard {...instance(mockedProps)} />)

    await act(() => {
      fireEvent.click(screen.getByTestId('add-new-job'))
    })

    await act(() => {
      fireEvent.change(screen.getByTestId('inline-item-editor'), {
        target: { value: 'job3' },
      })
    })

    await act(() => {
      fireEvent.click(screen.getByTestId('apply-btn'))
    })

    expect(mockedSendEventTelemetry).toHaveBeenCalledWith({
      event: TelemetryEvent.RDI_PIPELINE_JOB_CREATED,
      eventData: {
        rdiInstanceId: 'rdiInstanceId',
        jobName: 'job3',
      },
    })
  })

  it('should call proper telemetry event when deleting job', async () => {
    mockedSendEventTelemetry.mockImplementation(() => jest.fn())

    render(<JobsCard {...instance(mockedProps)} />)

    await act(() => {
      fireEvent.click(screen.getByTestId('delete-job-job1'))
    })

    await act(() => {
      fireEvent.click(screen.getByTestId('delete-confirm-btn'))
    })

    expect(sendEventTelemetry).toHaveBeenCalledWith({
      event: TelemetryEvent.RDI_PIPELINE_JOB_DELETED,
      eventData: {
        rdiInstanceId: 'rdiInstanceId',
        jobName: 'job1',
      },
    })
  })
})
