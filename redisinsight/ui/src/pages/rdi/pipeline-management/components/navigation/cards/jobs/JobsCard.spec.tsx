import React from 'react'
import { cloneDeep } from 'lodash'
import { instance, mock } from 'ts-mockito'
import {
  cleanup,
  mockedStore,
  render,
  screen,
  fireEvent,
} from 'uiSrc/utils/test-utils'

import { rdiPipelineSelector as rdiPipelineSelectorMock } from 'uiSrc/slices/rdi/pipeline'
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

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({
    rdiInstanceId: 'rdiInstanceId',
  }),
  useLocation: () => ({
    pathname: '/integrate/rdiInstanceId/pipeline-management/jobs/job1',
  }),
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

  it('should render job items', () => {
    render(<JobsCard {...instance(mockedProps)} />)

    expect(screen.getByTestId('job-file-job1')).toBeInTheDocument()
    expect(screen.getByTestId('job-file-job2')).toBeInTheDocument()
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
})
