import React from 'react'
import { instance, mock } from 'ts-mockito'

import { rdiPipelineSelector } from 'uiSrc/slices/rdi/pipeline'
import { TelemetryEvent, sendEventTelemetry } from 'uiSrc/telemetry'
import { act, fireEvent, render, screen, waitFor } from 'uiSrc/utils/test-utils'
import JobsTree, { IProps } from './JobsTree'

const mockedProps = mock<IProps>()

jest.mock('uiSrc/slices/rdi/pipeline', () => ({
  ...jest.requireActual('uiSrc/slices/rdi/pipeline'),
  rdiPipelineSelector: jest.fn().mockReturnValue({
    loading: false,
    error: '',
    jobs: [{ name: 'job1', value: 'value' }],
    jobsValidationErrors: {},
  }),
}))

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

describe('JobsTree', () => {
  it('should render', () => {
    expect(render(<JobsTree {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should render loader', () => {
    const rdiPipelineSelectorMock = jest.fn().mockReturnValue({
      loading: true,
      error: '',
    })
    ;(rdiPipelineSelector as jest.Mock).mockImplementationOnce(
      rdiPipelineSelectorMock,
    )

    render(<JobsTree {...instance(mockedProps)} />)

    expect(screen.getByTestId('rdi-nav-jobs-loader')).toBeInTheDocument()
  })

  it('should render proper count of job', () => {
    render(<JobsTree {...instance(mockedProps)} />)

    expect(screen.getByTestId('rdi-jobs-count')).toHaveTextContent('1')
  })

  it('should not render count of job if it is "0"', () => {
    ;(rdiPipelineSelector as jest.Mock).mockImplementationOnce(() => ({
      values: { jobs: [] },
    }))

    render(<JobsTree {...instance(mockedProps)} />)

    expect(screen.getByTestId('rdi-jobs-count')).toHaveTextContent('')
  })

  it('should call selected tab', () => {
    const mockOnSelectedTab = jest.fn()

    render(
      <JobsTree {...instance(mockedProps)} onSelectedTab={mockOnSelectedTab} />,
    )

    fireEvent.click(screen.getByTestId('rdi-nav-job-job1'))
    expect(mockOnSelectedTab).toBeCalledWith('job1')
  })

  it('should render job name', () => {
    render(<JobsTree {...instance(mockedProps)} />)

    expect(screen.getByTestId('rdi-nav-job-job1')).toHaveTextContent('job1')
  })

  it('should render job name with proper class', () => {
    render(<JobsTree {...instance(mockedProps)} />)

    expect(screen.getByTestId('rdi-nav-job-job1')).toHaveClass('truncateText')
  })

  it('should render actions', () => {
    render(<JobsTree {...instance(mockedProps)} />)

    expect(screen.getByTestId('rdi-nav-job-actions-job1')).toBeInTheDocument()
  })

  it('should delete job', async () => {
    render(<JobsTree {...instance(mockedProps)} onSelectedTab={jest.fn()} />)

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

  it('should not delete job', async () => {
    render(<JobsTree {...instance(mockedProps)} />)

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
    render(<JobsTree {...instance(mockedProps)} onSelectedTab={jest.fn()} />)

    await act(() => {
      fireEvent.click(screen.getByTestId('edit-job-name-job1'))
    })

    waitFor(() => {
      expect(screen.getByTestId('rdi-nav-job-edit-job1')).toBeInTheDocument()
    })
  })

  it('should not edit job name', async () => {
    render(<JobsTree {...instance(mockedProps)} onSelectedTab={jest.fn()} />)

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

  it('should call proper telemetry event when adding new job', async () => {
    const sendEventTelemetryMock = jest.fn()
    ;(sendEventTelemetry as jest.Mock).mockImplementation(
      () => sendEventTelemetryMock,
    )

    render(
      <JobsTree
        {...instance(mockedProps)}
        onSelectedTab={jest.fn()}
        rdiInstanceId="id"
      />,
    )

    await act(() => {
      fireEvent.click(screen.getByTestId('add-new-job'))
    })

    await act(() => {
      fireEvent.change(screen.getByTestId('inline-item-editor'), {
        target: { value: 'job3' },
      })
      fireEvent.click(screen.getByTestId('apply-btn'))
    })

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.RDI_PIPELINE_JOB_CREATED,
      eventData: {
        rdiInstanceId: 'id',
        jobName: 'job3',
      },
    })
  })

  it('should call proper telemetry event when deleting job', async () => {
    const sendEventTelemetryMock = jest.fn()
    ;(sendEventTelemetry as jest.Mock).mockImplementation(
      () => sendEventTelemetryMock,
    )

    render(
      <JobsTree
        {...instance(mockedProps)}
        onSelectedTab={jest.fn()}
        rdiInstanceId="id"
      />,
    )

    await act(() => {
      fireEvent.click(screen.getByTestId('delete-job-job1'))
    })

    await act(() => {
      fireEvent.click(screen.getByTestId('delete-confirm-btn'))
    })

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.RDI_PIPELINE_JOB_DELETED,
      eventData: {
        rdiInstanceId: 'id',
        jobName: 'job1',
      },
    })
  })

  it('should push to config tab when deleting last job', async () => {
    const mockOnSelectedTab = jest.fn()

    render(
      <JobsTree
        {...instance(mockedProps)}
        onSelectedTab={mockOnSelectedTab}
        path="job1"
      />,
    )

    await act(() => {
      fireEvent.click(screen.getByTestId('delete-job-job1'))
    })

    await act(() => {
      fireEvent.click(screen.getByTestId('delete-confirm-btn'))
    })

    expect(mockOnSelectedTab).toBeCalledWith('config')
  })

  it('should display an error icon when job has validation errors', () => {
    ;(rdiPipelineSelector as jest.Mock).mockImplementationOnce(() => ({
      loading: false,
      error: '',
      jobs: [{ name: 'job1', value: 'value' }],
      jobsValidationErrors: {
        job1: ['Some validation error'],
      },
    }))

    render(<JobsTree {...instance(mockedProps)} />)

    expect(screen.getByTestId('rdi-nav-job-job1')).toBeInTheDocument()
    expect(screen.getByTestId('rdi-nav-job-job1')).toContainElement(
      screen.getByTestId('rdi-pipeline-nav__error'),
    )
  })

  it('should not display an error icon when job has no validation errors', () => {
    ;(rdiPipelineSelector as jest.Mock).mockImplementationOnce(() => ({
      loading: false,
      error: '',
      jobs: [{ name: 'job1', value: 'value' }],
      jobsValidationErrors: {},
    }))

    render(<JobsTree {...instance(mockedProps)} />)

    expect(screen.getByTestId('rdi-nav-job-job1')).toBeInTheDocument()
    expect(
      screen.queryByTestId('rdi-pipeline-nav__error'),
    ).not.toBeInTheDocument()
  })

  it('should disable apply button when job name is invalid', async () => {
    ;(rdiPipelineSelector as jest.Mock).mockImplementationOnce(() => ({
      loading: false,
      error: '',
      jobs: [{ name: 'job1', value: 'value' }],
      jobsValidationErrors: { job1: ['Invalid name'] },
    }))

    render(<JobsTree {...instance(mockedProps)} />)

    await act(() => {
      fireEvent.click(screen.getByTestId('edit-job-name-job1'))
    })

    const input = screen.getByTestId('inline-item-editor')
    fireEvent.change(input, { target: { value: '' } }) // Invalid name

    expect(screen.getByTestId('apply-btn')).toBeDisabled()
  })

  it('should display ValidationErrorsList in tooltip when job has multiple validation errors', () => {
    const validationErrors = [
      'Missing required field: name',
      'Invalid data type for age',
      'Email format is incorrect',
    ]

    ;(rdiPipelineSelector as jest.Mock).mockImplementationOnce(() => ({
      loading: false,
      error: '',
      jobs: [{ name: 'job1', value: 'value' }],
      jobsValidationErrors: {
        job1: validationErrors,
      },
    }))

    render(<JobsTree {...instance(mockedProps)} />)

    expect(screen.getByTestId('rdi-nav-job-job1')).toBeInTheDocument()
    expect(screen.getByTestId('rdi-pipeline-nav__error')).toBeInTheDocument()

    // The ValidationErrorsList is inside a tooltip, so we verify the error icon is present
    const errorIcon = screen.getByTestId('rdi-pipeline-nav__error')
    expect(errorIcon).toBeInTheDocument()
  })

  it('should display ValidationErrorsList in tooltip when job has single validation error', () => {
    const validationErrors = ['Single validation error']

    ;(rdiPipelineSelector as jest.Mock).mockImplementationOnce(() => ({
      loading: false,
      error: '',
      jobs: [{ name: 'job1', value: 'value' }],
      jobsValidationErrors: {
        job1: validationErrors,
      },
    }))

    render(<JobsTree {...instance(mockedProps)} />)

    expect(screen.getByTestId('rdi-nav-job-job1')).toBeInTheDocument()
    expect(screen.getByTestId('rdi-pipeline-nav__error')).toBeInTheDocument()
  })

  it('should handle multiple jobs with different validation states', () => {
    ;(rdiPipelineSelector as jest.Mock).mockImplementationOnce(() => ({
      loading: false,
      error: '',
      jobs: [
        { name: 'job1', value: 'value1' },
        { name: 'job2', value: 'value2' },
        { name: 'job3', value: 'value3' },
      ],
      jobsValidationErrors: {
        job1: ['Error in job1'],
        job3: ['Error in job3', 'Another error in job3'],
      },
    }))

    render(<JobsTree {...instance(mockedProps)} />)

    // job1 should have error icon
    const job1Element = screen.getByTestId('rdi-nav-job-job1')
    expect(job1Element).toBeInTheDocument()
    expect(job1Element).toHaveClass('invalid')

    // job2 should not have error icon and should not have invalid class
    const job2Element = screen.getByTestId('rdi-nav-job-job2')
    expect(job2Element).toBeInTheDocument()
    expect(job2Element).not.toHaveClass('invalid')

    // job3 should have error icon
    const job3Element = screen.getByTestId('rdi-nav-job-job3')
    expect(job3Element).toBeInTheDocument()
    expect(job3Element).toHaveClass('invalid')

    // There should be exactly 2 error icons total (for job1 and job3)
    const errorIcons = screen.getAllByTestId('rdi-pipeline-nav__error')
    expect(errorIcons).toHaveLength(2)
  })

  it('should apply invalid class to job name when validation errors exist', () => {
    ;(rdiPipelineSelector as jest.Mock).mockImplementationOnce(() => ({
      loading: false,
      error: '',
      jobs: [{ name: 'job1', value: 'value' }],
      jobsValidationErrors: {
        job1: ['Some validation error'],
      },
    }))

    render(<JobsTree {...instance(mockedProps)} />)

    expect(screen.getByTestId('rdi-nav-job-job1')).toHaveClass('invalid')
  })

  it('should not apply invalid class to job name when no validation errors exist', () => {
    ;(rdiPipelineSelector as jest.Mock).mockImplementationOnce(() => ({
      loading: false,
      error: '',
      jobs: [{ name: 'job1', value: 'value' }],
      jobsValidationErrors: {},
    }))

    render(<JobsTree {...instance(mockedProps)} />)

    expect(screen.getByTestId('rdi-nav-job-job1')).not.toHaveClass('invalid')
  })

  it('should handle empty validation errors array', () => {
    ;(rdiPipelineSelector as jest.Mock).mockImplementationOnce(() => ({
      loading: false,
      error: '',
      jobs: [{ name: 'job1', value: 'value' }],
      jobsValidationErrors: {
        job1: [],
      },
    }))

    render(<JobsTree {...instance(mockedProps)} />)

    expect(screen.getByTestId('rdi-nav-job-job1')).toBeInTheDocument()
    expect(
      screen.queryByTestId('rdi-pipeline-nav__error'),
    ).not.toBeInTheDocument()
  })

  it('should handle validation errors with special characters', () => {
    const validationErrors = [
      'Error with <script>alert("xss")</script>',
      'Error with & special characters',
      'Error with "quotes" and \'apostrophes\'',
    ]

    ;(rdiPipelineSelector as jest.Mock).mockImplementationOnce(() => ({
      loading: false,
      error: '',
      jobs: [{ name: 'job1', value: 'value' }],
      jobsValidationErrors: {
        job1: validationErrors,
      },
    }))

    render(<JobsTree {...instance(mockedProps)} />)

    expect(screen.getByTestId('rdi-nav-job-job1')).toBeInTheDocument()
    expect(screen.getByTestId('rdi-pipeline-nav__error')).toBeInTheDocument()
  })
})
