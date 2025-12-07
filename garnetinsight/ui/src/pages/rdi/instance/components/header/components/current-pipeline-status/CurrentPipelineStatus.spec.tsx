import React from 'react'

import { fireEvent, render, screen, waitFor } from 'uiSrc/utils/test-utils'
import { PipelineState } from 'uiSrc/slices/interfaces'
import CurrentPipelineStatus, { Props } from './CurrentPipelineStatus'

const mockedProps: Props = {
  pipelineState: PipelineState.CDC,
  statusError: '',
}

describe('CurrentPipelineStatus', () => {
  it('should render', () => {
    expect(render(<CurrentPipelineStatus {...mockedProps} />)).toBeTruthy()
  })

  it('should show status based on pipelineState prop', () => {
    render(<CurrentPipelineStatus {...mockedProps} />)
    expect(screen.getByText('Streaming')).toBeInTheDocument()
  })

  it('should show error label and tooltip when statusError is not empty', async () => {
    const errorMessage = 'Some Error Message'
    render(
      <CurrentPipelineStatus
        pipelineState={undefined}
        statusError={errorMessage}
      />,
    )
    expect(screen.getByText('Error')).toBeInTheDocument()

    fireEvent.focus(screen.getByTestId('pipeline-state-badge'))
    await waitFor(() => screen.getAllByText(errorMessage)[0])
    expect(screen.getAllByText(errorMessage)[0]).toBeInTheDocument()
  })
})
