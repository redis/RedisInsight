import React from 'react'

import { fireEvent, render, screen, waitFor } from 'uiSrc/utils/test-utils'
import StopPipelineButton from './StopPipelineButton'
import { PipelineButtonProps } from '../reset-pipeline-button/ResetPipelineButton'

const mockedProps: PipelineButtonProps = {
  loading: false,
  disabled: false,
  onClick: jest.fn(),
}

describe('StopPipelineButton', () => {
  it('should render', () => {
    expect(render(<StopPipelineButton {...mockedProps} />)).toBeTruthy()
  })

  it('should show reset info text when hovered', async () => {
    render(<StopPipelineButton {...mockedProps} />)

    fireEvent.focus(screen.getByTestId('stop-pipeline-btn'))
    await waitFor(() =>
      screen.getAllByText(
        /Stop the pipeline to prevent processing of new data arrivals/,
      ),
    )
    expect(
      screen.getAllByText(
        /Stop the pipeline to prevent processing of new data arrivals/,
      )[0],
    ).toBeInTheDocument()
  })

  it('should call onClick when clicked', () => {
    const onClick = jest.fn()
    render(<StopPipelineButton {...mockedProps} onClick={onClick} />)

    fireEvent.click(screen.getByTestId('stop-pipeline-btn'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('should not be clickable event, when disabled || loading', () => {
    const onClick = jest.fn()
    render(<StopPipelineButton {...mockedProps} disabled onClick={onClick} />)

    fireEvent.click(screen.getByTestId('stop-pipeline-btn'))
    expect(onClick).not.toHaveBeenCalled()
  })

  it('should not be clickable event, when loading', () => {
    const onClick = jest.fn()
    render(<StopPipelineButton {...mockedProps} loading onClick={onClick} />)

    fireEvent.click(screen.getByTestId('stop-pipeline-btn'))
    expect(onClick).not.toHaveBeenCalled()
  })
})
