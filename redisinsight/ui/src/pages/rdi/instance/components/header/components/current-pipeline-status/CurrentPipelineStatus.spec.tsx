import React from 'react'

import { fireEvent, render, screen, waitFor } from 'uiSrc/utils/test-utils'
import { PipelineState, PipelineStatus } from 'uiSrc/slices/interfaces'
import CurrentPipelineStatus, { Props } from './CurrentPipelineStatus'

const mockedProps: Props = {
  pipelineState: PipelineState.CDC,
  statusError: '',
  headerLoading: false,
}

describe('CurrentPipelineStatus', () => {
  it('should render', () => {
    expect(render(<CurrentPipelineStatus {...mockedProps} />)).toBeTruthy()
  })

  it('should show status based on pipelineState prop (V1)', () => {
    render(<CurrentPipelineStatus {...mockedProps} />)
    expect(screen.getByText('Streaming')).toBeInTheDocument()
  })

  it('should show status based on pipelineStatus prop (V2)', () => {
    render(
      <CurrentPipelineStatus
        pipelineStatus={PipelineStatus.Started}
        headerLoading={false}
      />,
    )
    expect(screen.getByText('Started')).toBeInTheDocument()
  })

  it('should show Stopped for V2 stopped status', () => {
    render(
      <CurrentPipelineStatus
        pipelineStatus={PipelineStatus.Stopped}
        headerLoading={false}
      />,
    )
    expect(screen.getByText('Stopped')).toBeInTheDocument()
  })

  it('should show error label and tooltip when statusError is not empty', async () => {
    const errorMessage = 'Some Error Message'
    render(
      <CurrentPipelineStatus
        pipelineState={undefined}
        statusError={errorMessage}
        headerLoading={false}
      />,
    )
    expect(screen.getByText('Error')).toBeInTheDocument()

    fireEvent.focus(screen.getByTestId('pipeline-status-badge'))
    await waitFor(() => screen.getAllByText(errorMessage)[0])
    expect(screen.getAllByText(errorMessage)[0]).toBeInTheDocument()
  })

  it('should show loader when headerLoading is true', () => {
    render(<CurrentPipelineStatus headerLoading />)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })
})
