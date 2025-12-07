import React from 'react'

import { fireEvent, render, screen, waitFor } from 'uiSrc/utils/test-utils'
import StartPipelineButton from './StartPipelineButton'
import { PipelineButtonProps } from '../reset-pipeline-button/ResetPipelineButton'

const mockedProps: PipelineButtonProps = {
  loading: false,
  disabled: false,
  onClick: jest.fn(),
}

describe('StartPipelineButton', () => {
  it('should render', () => {
    expect(render(<StartPipelineButton {...mockedProps} />)).toBeTruthy()
  })

  it('should show reset info text when hovered', async () => {
    render(<StartPipelineButton {...mockedProps} />)

    fireEvent.focus(screen.getByTestId('start-pipeline-btn'))
    await waitFor(() =>
      screen.getAllByText(
        /Start the pipeline to resume processing new data arrivals/,
      ),
    )
    expect(
      screen.getAllByText(
        /Start the pipeline to resume processing new data arrivals/,
      )[0],
    ).toBeInTheDocument()
  })

  it('should call onClick when clicked', () => {
    const onClick = jest.fn()
    render(<StartPipelineButton {...mockedProps} onClick={onClick} />)

    fireEvent.click(screen.getByTestId('start-pipeline-btn'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('should not be clickable event, when disabled || loading', () => {
    const onClick = jest.fn()
    render(<StartPipelineButton {...mockedProps} disabled onClick={onClick} />)

    fireEvent.click(screen.getByTestId('start-pipeline-btn'))
    expect(onClick).not.toHaveBeenCalled()
  })

  it('should not be clickable event, when loading', () => {
    const onClick = jest.fn()
    render(<StartPipelineButton {...mockedProps} loading onClick={onClick} />)

    fireEvent.click(screen.getByTestId('start-pipeline-btn'))
    expect(onClick).not.toHaveBeenCalled()
  })
})
