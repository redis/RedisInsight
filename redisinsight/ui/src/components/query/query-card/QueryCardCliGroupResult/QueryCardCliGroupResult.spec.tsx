import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render, screen } from 'uiSrc/utils/test-utils'
import { CommandExecutionStatus } from 'uiSrc/slices/interfaces/cli'
import QueryCardCliGroupResult, { Props } from './QueryCardCliGroupResult'

const mockedProps = mock<Props>()

describe('QueryCardCliGroupResult', () => {
  it('should render', () => {
    const mockResult = [
      {
        response: [
          {
            response: 'response',
            status: 'success',
          },
        ],
        status: 'success',
      },
    ]
    expect(
      render(
        <QueryCardCliGroupResult
          {...instance(mockedProps)}
          result={mockResult}
        />,
      ),
    ).toBeTruthy()
  })

  it('Should render result when result is undefined', () => {
    expect(
      render(<QueryCardCliGroupResult {...instance(mockedProps)} />),
    ).toBeTruthy()
  })

  it('should render error when command is psubscribe', () => {
    const mockResult = [
      {
        response: [
          {
            id: 'id',
            command: 'psubscribe',
            response: 'response',
            status: CommandExecutionStatus.Success,
          },
        ],
      },
    ]
    const { container } = render(
      <QueryCardCliGroupResult
        {...instance(mockedProps)}
        result={mockResult}
      />,
    )
    const errorBtn = container.querySelector(
      '[data-test-subj="pubsub-page-btn"]',
    )

    expect(errorBtn).toBeInTheDocument()
  })

  it('should render (nil) when response is null', () => {
    const mockResult = [
      {
        response: [
          {
            id: 'id',
            command: 'psubscribe',
            response: null,
            status: CommandExecutionStatus.Success,
          },
        ],
      },
    ]
    const { container } = render(
      <QueryCardCliGroupResult
        {...instance(mockedProps)}
        result={mockResult}
      />,
    )
    const errorBtn = container.querySelector(
      '[data-test-subj="pubsub-page-btn"]',
    )

    expect(errorBtn).not.toBeInTheDocument()
    expect(screen.getByText('(nil)')).toBeInTheDocument()
  })

  it('should not show ModuleNotLoaded for successful TS.RANGE in group mode', () => {
    // Double cast: group-mode nests execution-like objects under response, but
    // CommandExecutionResult.response is typed as string. Same shape as the
    // other fixtures in this file; unknown avoids a new TS2352 baseline bump.
    const mockResult = [
      {
        response: [
          {
            id: 'id',
            command: 'TS.RANGE ts:prices - +',
            response: [[1784245557285, '100']],
            status: CommandExecutionStatus.Success,
          },
        ],
        status: CommandExecutionStatus.Success,
      },
    ] as unknown as Props['result']
    render(
      <QueryCardCliGroupResult
        {...instance(mockedProps)}
        result={mockResult}
      />,
    )

    expect(
      screen.queryByTestId('module-not-loaded-content'),
    ).not.toBeInTheDocument()
    expect(screen.getByText(/TS\.RANGE ts:prices/)).toBeInTheDocument()
  })

  it('should show ModuleNotLoaded for failed TS.RANGE in group mode', () => {
    const mockResult = [
      {
        response: [
          {
            id: 'id',
            command: 'TS.RANGE ts:prices - +',
            response: 'ERR unknown command',
            status: CommandExecutionStatus.Fail,
          },
        ],
        status: CommandExecutionStatus.Fail,
      },
    ] as unknown as Props['result']
    render(
      <QueryCardCliGroupResult
        {...instance(mockedProps)}
        result={mockResult}
      />,
    )

    expect(screen.getByTestId('module-not-loaded-content')).toBeInTheDocument()
  })
})
