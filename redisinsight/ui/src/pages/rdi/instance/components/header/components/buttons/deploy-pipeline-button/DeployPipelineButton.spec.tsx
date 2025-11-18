import { cloneDeep } from 'lodash'
import React from 'react'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import {
  cleanup,
  fireEvent,
  mockedStore,
  render,
  screen,
  within,
} from 'uiSrc/utils/test-utils'
import { rdiPipelineSelector } from 'uiSrc/slices/rdi/pipeline'
import DeployPipelineButton, { Props } from './DeployPipelineButton'

const mockedProps: Props = {
  loading: false,
  disabled: false,
}

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

jest.mock('uiSrc/slices/rdi/pipeline', () => ({
  ...jest.requireActual('uiSrc/slices/rdi/pipeline'),
  rdiPipelineSelector: jest.fn().mockReturnValue({
    loading: false,
    config: 'value',
    isPipelineValid: true,
    jobs: [
      { name: 'job1', value: '1' },
      { name: 'job2', value: '2' },
    ],
  }),
}))

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('DeployPipelineButton', () => {
  it('should render', () => {
    expect(render(<DeployPipelineButton {...mockedProps} />)).toBeTruthy()
  })

  describe('TelemetryEvent', () => {
    beforeEach(() => {
      const sendEventTelemetryMock = jest.fn()
      ;(sendEventTelemetry as jest.Mock).mockImplementation(
        () => sendEventTelemetryMock,
      )

      render(<DeployPipelineButton {...mockedProps} />)
    })

    it('should call proper telemetry on Deploy', () => {
      fireEvent.click(screen.getByTestId('deploy-rdi-pipeline'))

      const confirmDeployButton = within(
        screen.getByRole('dialog'),
      ).getByLabelText('Deploy')
      expect(confirmDeployButton).toBeInTheDocument()

      fireEvent.click(confirmDeployButton)

      expect(sendEventTelemetry).toHaveBeenCalledWith({
        event: TelemetryEvent.RDI_DEPLOY_CLICKED,
        eventData: {
          id: 'rdiInstanceId',
          reset: false,
          jobsNumber: 2,
        },
      })
    })

    it('should reset true if reset checkbox is in the checked state telemetry on Deploy', () => {
      fireEvent.click(screen.getByTestId('deploy-rdi-pipeline'))

      const el = screen.getByTestId(
        'reset-pipeline-checkbox',
      ) as HTMLInputElement
      expect(el).toHaveAttribute('aria-checked', 'false')
      fireEvent.click(el)
      expect(el).toHaveAttribute('aria-checked', 'true')

      const confirmDeployButton = within(
        screen.getByRole('dialog'),
      ).getByLabelText('Deploy')
      expect(confirmDeployButton).toBeInTheDocument()

      fireEvent.click(confirmDeployButton)
      expect(sendEventTelemetry).toHaveBeenCalledWith({
        event: TelemetryEvent.RDI_DEPLOY_CLICKED,
        eventData: {
          id: 'rdiInstanceId',
          reset: true,
          jobsNumber: 2,
        },
      })
    })
  })

  it('should open confirmation popover with default message', () => {
    render(<DeployPipelineButton {...mockedProps} />)

    expect(screen.queryByTestId('deploy-confirm-btn')).not.toBeInTheDocument()

    fireEvent.click(screen.getByTestId('deploy-rdi-pipeline'))

    const confirmDeployButton = within(
      screen.getByRole('dialog'),
    ).getByLabelText('Deploy')
    expect(confirmDeployButton).toBeInTheDocument()
    expect(
      screen.queryByText('Are you sure you want to deploy the pipeline?'),
    ).toBeInTheDocument()
    expect(
      screen.queryByText(
        'Your RDI pipeline contains errors. Are you sure you want to continue?',
      ),
    ).not.toBeInTheDocument()
  })

  it('should open confirmation popover with warning message due to validation errors', () => {
    ;(rdiPipelineSelector as jest.Mock).mockImplementation(() => ({
      isPipelineValid: false,
    }))

    render(<DeployPipelineButton {...mockedProps} />)

    expect(screen.queryByTestId('deploy-confirm-btn')).not.toBeInTheDocument()

    fireEvent.click(screen.getByTestId('deploy-rdi-pipeline'))

    const confirmDeployButton = within(
      screen.getByRole('dialog'),
    ).getByLabelText('Deploy')
    expect(confirmDeployButton).toBeInTheDocument()
    expect(
      screen.queryByText('Are you sure you want to deploy the pipeline?'),
    ).toBeInTheDocument()
    expect(
      screen.queryByText(
        'Your RDI pipeline contains errors. Are you sure you want to continue?',
      ),
    ).toBeInTheDocument()
  })
})
